import { describe, expect, it } from "vitest";
import { criarRepositorioMemoria } from "../persistencia/repositorioMemoria";
import { processarFormularioReserva } from "./formularioReserva";

const SALAS = [{ id: 3, nome: "Sala Tejo", capacidade: 20 }];

function formulario(campos) {
  const dados = new FormData();
  for (const [campo, valor] of Object.entries(campos)) dados.set(campo, valor);
  return dados;
}

describe("formulário de reserva com mais de 2 horas", () => {
  it("devolve a mensagem para o ecrã e mantém os valores introduzidos", async () => {
    const repositorio = criarRepositorioMemoria({ salas: SALAS });

    const resultado = await processarFormularioReserva(
      formulario({ salaId: "3", data: "2026-12-15", inicio: "10:00", fim: "12:01" }),
      { repositorio },
    );

    expect(resultado).toEqual({
      sucesso: false,
      erro: "Uma reserva pode ter no máximo 2 horas.",
      valores: { data: "2026-12-15", inicio: "10:00", fim: "12:01" },
    });
    expect(await repositorio.listarReservas()).toEqual([]);
  });

  it("aceita exatamente 2 horas", async () => {
    const resultado = await processarFormularioReserva(
      formulario({ salaId: "3", data: "2026-12-15", inicio: "10:00", fim: "12:00" }),
      { repositorio: criarRepositorioMemoria({ salas: SALAS }) },
    );
    expect(resultado.sucesso).toBe(true);
  });
});
