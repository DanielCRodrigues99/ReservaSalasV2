import { describe, expect, it } from "vitest";
import { criarRepositorioMemoria } from "../persistencia/repositorioMemoria";
import { MENSAGEM_DATA_HORA_INVALIDA, MENSAGEM_HORA_INEXISTENTE } from "./horaLisboa";
import { processarFormularioReserva } from "./formularioReserva";

const SALAS = [
  { id: 1, nome: "Sala Atlântico", capacidade: 12 },
  { id: 2, nome: "Sala Douro", capacidade: 6 },
];

function formulario(campos) {
  const dados = new FormData();
  for (const [campo, valor] of Object.entries(campos)) dados.set(campo, valor);
  return dados;
}

function preparar() {
  return criarRepositorioMemoria({ salas: SALAS });
}

const PEDIDO = { salaId: "2", data: "2026-11-10", inicio: "10:00", fim: "11:00" };
const VALORES = { data: "2026-11-10", inicio: "10:00", fim: "11:00" };

describe("processarFormularioReserva", () => {
  it("reserva a sala e devolve { sucesso: true, valores }", async () => {
    const repositorio = preparar();
    const resultado = await processarFormularioReserva(formulario(PEDIDO), { repositorio });

    expect(resultado).toEqual({ sucesso: true, valores: VALORES });
    const [guardada] = await repositorio.listarReservas();
    expect(guardada.salaId).toBe(2);
    expect(guardada.inicio.toISOString()).toBe("2026-11-10T10:00:00.000Z");
    expect(guardada.fim.toISOString()).toBe("2026-11-10T11:00:00.000Z");
  });

  it("converte as horas de Lisboa para UTC no verão (UTC+1)", async () => {
    const repositorio = preparar();
    await processarFormularioReserva(
      formulario({ ...PEDIDO, data: "2026-07-01", inicio: "10:00", fim: "11:30" }),
      { repositorio },
    );
    const [guardada] = await repositorio.listarReservas();
    expect(guardada.inicio.toISOString()).toBe("2026-07-01T09:00:00.000Z");
    expect(guardada.fim.toISOString()).toBe("2026-07-01T10:30:00.000Z");
  });

  it("devolve o erro e os valores introduzidos quando a sala está ocupada", async () => {
    const repositorio = preparar();
    await processarFormularioReserva(formulario(PEDIDO), { repositorio });

    const resultado = await processarFormularioReserva(
      formulario({ ...PEDIDO, inicio: "10:30", fim: "11:30" }),
      { repositorio },
    );

    expect(resultado).toEqual({
      sucesso: false,
      erro: "A sala já tem uma reserva nesse horário.",
      valores: { data: "2026-11-10", inicio: "10:30", fim: "11:30" },
    });
    expect(await repositorio.listarReservas()).toHaveLength(1);
  });

  it("aceita uma reserva seguida a outra na mesma sala", async () => {
    const repositorio = preparar();
    await processarFormularioReserva(formulario(PEDIDO), { repositorio });
    const resultado = await processarFormularioReserva(
      formulario({ ...PEDIDO, inicio: "11:00", fim: "12:00" }),
      { repositorio },
    );
    expect(resultado.sucesso).toBe(true);
  });

  it("devolve a mensagem do caso de uso quando a sala não existe", async () => {
    const resultado = await processarFormularioReserva(formulario({ ...PEDIDO, salaId: "99" }), {
      repositorio: preparar(),
    });
    expect(resultado).toMatchObject({ sucesso: false, erro: "A sala escolhida não existe." });
  });

  it("devolve a mensagem do domínio quando o fim é antes do início", async () => {
    const resultado = await processarFormularioReserva(
      formulario({ ...PEDIDO, inicio: "11:00", fim: "10:00" }),
      { repositorio: preparar() },
    );
    expect(resultado).toMatchObject({
      sucesso: false,
      erro: "O fim da reserva tem de ser depois do início.",
    });
  });

  it("rejeita uma hora que não existe em Lisboa sem guardar nada", async () => {
    const repositorio = preparar();
    const resultado = await processarFormularioReserva(
      formulario({ ...PEDIDO, data: "2026-03-29", inicio: "01:30", fim: "03:00" }),
      { repositorio },
    );
    expect(resultado).toMatchObject({ sucesso: false, erro: MENSAGEM_HORA_INEXISTENTE });
    expect(await repositorio.listarReservas()).toEqual([]);
  });

  it("rejeita campos em falta sem lançar exceções", async () => {
    const resultado = await processarFormularioReserva(formulario({ salaId: "2" }), {
      repositorio: preparar(),
    });
    expect(resultado).toEqual({
      sucesso: false,
      erro: MENSAGEM_DATA_HORA_INVALIDA,
      valores: { data: "", inicio: "", fim: "" },
    });
  });

  it("não lança exceções quando não recebe dados do formulário", async () => {
    const resultado = await processarFormularioReserva(null, { repositorio: preparar() });
    expect(resultado.sucesso).toBe(false);
  });

  it("ignora valores que não são texto (ex.: ficheiros enviados num POST direto)", async () => {
    const dados = formulario(PEDIDO);
    dados.set("data", new Blob(["2026-11-10"]));
    const resultado = await processarFormularioReserva(dados, { repositorio: preparar() });
    expect(resultado).toMatchObject({ sucesso: false, erro: MENSAGEM_DATA_HORA_INVALIDA });
  });
});
