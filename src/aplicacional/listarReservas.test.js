import { describe, expect, it } from "vitest";
import { criarReserva } from "../dominio/reserva";
import { criarSala } from "../dominio/sala";
import { listarReservas } from "./listarReservas";
import { criarRepositorioSimulado } from "./repositorioSimulado";

const SALAS = [
  criarSala({ id: 1, nome: "Sala Douro", capacidade: 6 }),
  criarSala({ id: 2, nome: "Sala Tejo", capacidade: 20 }),
];

function reserva(id, salaId, dia, hora) {
  return criarReserva({
    id,
    salaId,
    inicio: new Date(Date.UTC(2026, 10, dia, hora)),
    fim: new Date(Date.UTC(2026, 10, dia, hora + 1)),
  });
}

describe("listarReservas", () => {
  it("devolve as reservas de todas as salas, com o nome da sala", async () => {
    const r1 = reserva("r1", 1, 10, 10);
    const r2 = reserva("r2", 2, 11, 9);
    const repositorio = criarRepositorioSimulado({ salas: SALAS, reservas: [r1, r2] });

    expect(await listarReservas({ repositorio })).toEqual([
      { ...r1, salaNome: "Sala Douro" },
      { ...r2, salaNome: "Sala Tejo" },
    ]);
  });

  it("ordena por data e hora de início, independentemente da sala", async () => {
    const tarde = reserva("tarde", 1, 10, 15);
    const amanha = reserva("amanha", 1, 11, 8);
    const manha = reserva("manha", 2, 10, 9);
    const repositorio = criarRepositorioSimulado({ salas: SALAS, reservas: [amanha, tarde, manha] });

    const ids = (await listarReservas({ repositorio })).map((r) => r.id);
    expect(ids).toEqual(["manha", "tarde", "amanha"]);
  });

  it("usa salaNome null quando a sala da reserva já não existe", async () => {
    const orfa = reserva("orfa", 99, 10, 10);
    const repositorio = criarRepositorioSimulado({ salas: SALAS, reservas: [orfa] });
    const [resultado] = await listarReservas({ repositorio });
    expect(resultado.salaNome).toBeNull();
  });

  it("devolve uma lista vazia quando não há reservas", async () => {
    const repositorio = criarRepositorioSimulado({ salas: SALAS });
    expect(await listarReservas({ repositorio })).toEqual([]);
  });

  it("não altera as reservas do repositório", async () => {
    const r1 = reserva("r1", 1, 10, 10);
    const repositorio = criarRepositorioSimulado({ salas: SALAS, reservas: [r1] });
    await listarReservas({ repositorio });
    const [guardada] = await repositorio.listarReservas();
    expect(guardada).toBe(r1);
    expect(guardada).not.toHaveProperty("salaNome");
  });

  it("deixa passar o erro do repositório para a apresentação o tratar", async () => {
    const erro = new Error("falhou");
    const repositorio = criarRepositorioSimulado({ salas: SALAS, falhas: { listarReservas: erro } });
    await expect(listarReservas({ repositorio })).rejects.toBe(erro);
  });
});
