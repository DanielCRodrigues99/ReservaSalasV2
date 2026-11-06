import { describe, expect, it } from "vitest";
import { ErroValidacao } from "./erros";
import { criarReserva } from "./reserva";

const inicio = new Date(Date.UTC(2026, 10, 10, 10, 0));
const fim = new Date(Date.UTC(2026, 10, 10, 11, 0));
const dadosValidos = { id: "r-1", salaId: 2, inicio, fim };

describe("criarReserva", () => {
  it("cria uma reserva com id, salaId, inicio e fim", () => {
    const reserva = criarReserva(dadosValidos);
    expect(reserva.id).toBe("r-1");
    expect(reserva.salaId).toBe(2);
    expect(reserva.inicio.toISOString()).toBe("2026-11-10T10:00:00.000Z");
    expect(reserva.fim.toISOString()).toBe("2026-11-10T11:00:00.000Z");
  });

  it("devolve uma reserva que não pode ser alterada", () => {
    const reserva = criarReserva(dadosValidos);
    expect(Object.isFrozen(reserva)).toBe(true);
    expect(() => {
      reserva.salaId = 99;
    }).toThrow(TypeError);
  });

  it("guarda cópias das datas, por isso alterar os Date originais não a afeta", () => {
    const inicioOriginal = new Date(inicio.getTime());
    const reserva = criarReserva({ ...dadosValidos, inicio: inicioOriginal });
    inicioOriginal.setUTCHours(23);
    expect(reserva.inicio.toISOString()).toBe("2026-11-10T10:00:00.000Z");
  });

  it("aceita uma reserva que atravessa a meia-noite", () => {
    const reserva = criarReserva({
      ...dadosValidos,
      inicio: new Date(Date.UTC(2026, 10, 10, 23, 0)),
      fim: new Date(Date.UTC(2026, 10, 11, 1, 0)),
    });
    expect(reserva.fim.toISOString()).toBe("2026-11-11T01:00:00.000Z");
  });

  it.each([undefined, null, 0, -1, "", "  "])("rejeita o id %j", (id) => {
    expect(() => criarReserva({ ...dadosValidos, id })).toThrow(
      "O id da reserva tem de ser um número inteiro positivo ou um texto.",
    );
  });

  it.each([undefined, null, 0, 2.5, ""])("rejeita o salaId %j", (salaId) => {
    expect(() => criarReserva({ ...dadosValidos, salaId })).toThrow(
      "O id da sala tem de ser um número inteiro positivo ou um texto.",
    );
  });

  it.each([
    ["undefined", undefined],
    ["texto ISO", "2026-11-10T10:00:00Z"],
    ["número", inicio.getTime()],
    ["data inválida", new Date("não é data")],
  ])("rejeita um início que é %s", (_descricao, valor) => {
    expect(() => criarReserva({ ...dadosValidos, inicio: valor })).toThrow(
      "O início da reserva tem de ser uma data válida.",
    );
  });

  it.each([
    ["undefined", undefined],
    ["data inválida", new Date("")],
  ])("rejeita um fim que é %s", (_descricao, valor) => {
    expect(() => criarReserva({ ...dadosValidos, fim: valor })).toThrow(
      "O fim da reserva tem de ser uma data válida.",
    );
  });

  it("rejeita um fim igual ao início", () => {
    expect(() => criarReserva({ ...dadosValidos, fim: new Date(inicio.getTime()) })).toThrow(
      "O fim da reserva tem de ser depois do início.",
    );
  });

  it("rejeita um fim antes do início", () => {
    expect(() => criarReserva({ ...dadosValidos, inicio: fim, fim: inicio })).toThrow(
      ErroValidacao,
    );
  });
});
