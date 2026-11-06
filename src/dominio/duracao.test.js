import { describe, expect, it } from "vitest";
import { ErroValidacao } from "./erros";
import { criarReserva } from "./reserva";
import { DURACAO_MAXIMA_MINUTOS, garantirDuracaoMaxima } from "./duracao";

const MENSAGEM = "Uma reserva pode ter no máximo 2 horas.";

// Instantes em UTC; "AAAA-MM-DDTHH:MM[:SS.mmm]".
function reserva(inicio, fim) {
  return criarReserva({
    id: "r1",
    salaId: 1,
    inicio: new Date(`${inicio}Z`),
    fim: new Date(`${fim}Z`),
  });
}

describe("garantirDuracaoMaxima", () => {
  it("o máximo é de 120 minutos", () => {
    expect(DURACAO_MAXIMA_MINUTOS).toBe(120);
  });

  describe("permite", () => {
    it.each([
      ["exatamente 2 horas", "2026-11-10T10:00", "2026-11-10T12:00"],
      ["30 minutos", "2026-11-10T10:00", "2026-11-10T10:30"],
      ["1 minuto", "2026-11-10T10:00", "2026-11-10T10:01"],
      ["1 hora e 59 minutos", "2026-11-10T10:00", "2026-11-10T11:59"],
      ["exatamente 2 horas a atravessar a meia-noite", "2026-11-10T23:00", "2026-11-11T01:00"],
    ])("%s", (_caso, inicio, fim) => {
      expect(() => garantirDuracaoMaxima(reserva(inicio, fim))).not.toThrow();
    });
  });

  describe("recusa", () => {
    it.each([
      ["2 horas e 1 minuto", "2026-11-10T10:00", "2026-11-10T12:01"],
      ["2 horas e 1 milissegundo", "2026-11-10T10:00", "2026-11-10T12:00:00.001"],
      ["3 horas", "2026-11-10T09:00", "2026-11-10T12:00"],
      ["2 horas e 1 minuto a atravessar a meia-noite", "2026-11-10T23:00", "2026-11-11T01:01"],
      ["um dia inteiro", "2026-11-10T00:00", "2026-11-11T00:00"],
    ])("%s", (_caso, inicio, fim) => {
      expect(() => garantirDuracaoMaxima(reserva(inicio, fim))).toThrow(MENSAGEM);
    });
  });

  it("conta o tempo real decorrido, não a diferença no relógio de Lisboa", () => {
    // 29/03/2026: em Lisboa o relógio salta das 01:00 para as 02:00.
    // 00:30Z–02:30Z aparece em Lisboa como 00:30–03:30 (3 h no relógio), mas são 2 h reais.
    expect(() => garantirDuracaoMaxima(reserva("2026-03-29T00:30", "2026-03-29T02:30"))).not.toThrow();
  });

  it("o erro é um ErroValidacao", () => {
    try {
      garantirDuracaoMaxima(reserva("2026-11-10T10:00", "2026-11-10T12:01"));
    } catch (erro) {
      expect(erro).toBeInstanceOf(ErroValidacao);
      expect(erro.message).toBe(MENSAGEM);
    }
    expect.assertions(2);
  });
});
