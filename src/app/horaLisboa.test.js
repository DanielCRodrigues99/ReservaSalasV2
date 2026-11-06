import { describe, expect, it } from "vitest";
import {
  MENSAGEM_DATA_HORA_INVALIDA,
  MENSAGEM_HORA_INEXISTENTE,
  lisboaParaUtc,
} from "./horaLisboa";

function utc(data, hora) {
  return lisboaParaUtc(data, hora).instante?.toISOString();
}

describe("lisboaParaUtc", () => {
  it("no inverno Lisboa está em UTC+0: a hora fica igual", () => {
    expect(utc("2026-11-10", "10:00")).toBe("2026-11-10T10:00:00.000Z");
    expect(utc("2026-01-15", "23:30")).toBe("2026-01-15T23:30:00.000Z");
  });

  it("no verão Lisboa está em UTC+1: tira uma hora", () => {
    expect(utc("2026-07-01", "10:00")).toBe("2026-07-01T09:00:00.000Z");
  });

  it("no verão, a meia-noite em Lisboa ainda é o dia anterior em UTC", () => {
    expect(utc("2026-07-01", "00:30")).toBe("2026-06-30T23:30:00.000Z");
  });

  it("antes e depois da mudança para a hora de verão (29/03/2026)", () => {
    expect(utc("2026-03-29", "00:59")).toBe("2026-03-29T00:59:00.000Z");
    expect(utc("2026-03-29", "02:00")).toBe("2026-03-29T01:00:00.000Z");
  });

  it("rejeita uma hora que não existe na mudança para a hora de verão", () => {
    expect(lisboaParaUtc("2026-03-29", "01:30")).toEqual({ erro: MENSAGEM_HORA_INEXISTENTE });
  });

  it("numa hora que existe duas vezes (fim da hora de verão) usa a primeira", () => {
    // 25/10/2026: às 02:00 de verão volta-se à 01:00; a 01:30 acontece às 00:30Z e às 01:30Z.
    expect(utc("2026-10-25", "01:30")).toBe("2026-10-25T00:30:00.000Z");
    expect(utc("2026-10-25", "02:30")).toBe("2026-10-25T02:30:00.000Z");
  });

  it.each([
    ["data vazia", "", "10:00"],
    ["hora vazia", "2026-11-10", ""],
    ["data noutro formato", "10/11/2026", "10:00"],
    ["hora com segundos", "2026-11-10", "10:00:00"],
    ["dia que não existe", "2026-02-30", "10:00"],
    ["mês 13", "2026-13-01", "10:00"],
    ["hora 24", "2026-11-10", "24:00"],
    ["minuto 60", "2026-11-10", "10:60"],
    ["valor que não é texto", null, "10:00"],
  ])("rejeita %s", (_caso, data, hora) => {
    expect(lisboaParaUtc(data, hora)).toEqual({ erro: MENSAGEM_DATA_HORA_INVALIDA });
  });

  it("não depende do fuso horário do servidor", () => {
    // O resultado é calculado a partir de Europe/Lisbon, não de process.env.TZ.
    const resultado = lisboaParaUtc("2026-07-01", "10:00").instante;
    expect(resultado.getTime()).toBe(Date.UTC(2026, 6, 1, 9, 0));
  });
});
