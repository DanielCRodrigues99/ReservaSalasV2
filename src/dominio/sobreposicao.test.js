import { describe, expect, it } from "vitest";
import { ErroSobreposicao } from "./erros";
import { criarReserva } from "./reserva";
import { garantirSemSobreposicao, reservasSobrepoem } from "./sobreposicao";

// Cria uma reserva no dia 10/11/2026 (UTC); "HH:MM" ou "HH:MM:SS.mmm".
// Um fim com "+1" é no dia seguinte (ex.: "01:00+1").
function reserva(id, salaId, inicio, fim) {
  return criarReserva({ id, salaId, inicio: instante(inicio), fim: instante(fim) });
}

function instante(texto) {
  const [hora, diaSeguinte] = texto.split("+");
  const dia = diaSeguinte ? "11" : "10";
  return new Date(`2026-11-${dia}T${hora.length === 5 ? `${hora}:00` : hora}Z`);
}

const SALA = 1;
const OUTRA_SALA = 2;
const existente = reserva("a", SALA, "10:00", "11:00");

describe("reservasSobrepoem", () => {
  describe("na mesma sala, sobrepõem-se quando os períodos se cruzam", () => {
    it.each([
      ["no mesmo horário", "10:00", "11:00"],
      ["a começar antes e a acabar a meio", "09:30", "10:30"],
      ["a começar a meio e a acabar depois", "10:30", "11:30"],
      ["totalmente dentro da outra", "10:15", "10:45"],
      ["a envolver totalmente a outra", "09:00", "12:00"],
      ["por apenas 1 milissegundo no fim", "10:59:59.999", "12:00"],
      ["por apenas 1 milissegundo no início", "09:00", "10:00:00.001"],
    ])("%s", (_caso, inicio, fim) => {
      const nova = reserva("b", SALA, inicio, fim);
      expect(reservasSobrepoem(nova, existente)).toBe(true);
      expect(reservasSobrepoem(existente, nova)).toBe(true);
    });
  });

  describe("na mesma sala, não se sobrepõem", () => {
    it.each([
      ["reservas seguidas: a nova começa quando a outra acaba", "11:00", "12:00"],
      ["reservas seguidas: a nova acaba quando a outra começa", "09:00", "10:00"],
      ["com intervalo depois", "11:30", "12:30"],
      ["com intervalo antes", "08:00", "09:30"],
    ])("%s", (_caso, inicio, fim) => {
      const nova = reserva("b", SALA, inicio, fim);
      expect(reservasSobrepoem(nova, existente)).toBe(false);
      expect(reservasSobrepoem(existente, nova)).toBe(false);
    });
  });

  it("reservas em salas diferentes no mesmo horário não se sobrepõem", () => {
    const nova = reserva("b", OUTRA_SALA, "10:00", "11:00");
    expect(reservasSobrepoem(nova, existente)).toBe(false);
    expect(reservasSobrepoem(existente, nova)).toBe(false);
  });

  it("reservas em salas diferentes com horários cruzados não se sobrepõem", () => {
    const nova = reserva("b", OUTRA_SALA, "09:30", "10:30");
    expect(reservasSobrepoem(nova, existente)).toBe(false);
  });

  it("uma reserva que atravessa a meia-noite sobrepõe-se à do dia seguinte", () => {
    const noite = reserva("n", SALA, "23:00", "01:00+1");
    const madrugada = reserva("m", SALA, "00:30+1", "02:00+1");
    expect(reservasSobrepoem(noite, madrugada)).toBe(true);
  });
});

describe("garantirSemSobreposicao", () => {
  it("aceita quando não há reservas existentes", () => {
    expect(() => garantirSemSobreposicao(reserva("b", SALA, "10:00", "11:00"), [])).not.toThrow();
  });

  it("aceita reservas seguidas antes e depois da nova", () => {
    const existentes = [
      reserva("antes", SALA, "09:00", "10:00"),
      reserva("depois", SALA, "11:00", "12:00"),
    ];
    const nova = reserva("b", SALA, "10:00", "11:00");
    expect(() => garantirSemSobreposicao(nova, existentes)).not.toThrow();
  });

  it("aceita quando as reservas no mesmo horário são de outras salas", () => {
    const existentes = [
      reserva("x", OUTRA_SALA, "10:00", "11:00"),
      reserva("y", 3, "09:30", "10:30"),
    ];
    const nova = reserva("b", SALA, "10:00", "11:00");
    expect(() => garantirSemSobreposicao(nova, existentes)).not.toThrow();
  });

  it("rejeita com ErroSobreposicao quando há uma reserva sobreposta na mesma sala", () => {
    const nova = reserva("b", SALA, "10:30", "11:30");
    expect(() => garantirSemSobreposicao(nova, [existente])).toThrow(ErroSobreposicao);
  });

  it("indica qual é a reserva em conflito, mesmo entre várias", () => {
    const conflito = reserva("conflito", SALA, "14:00", "15:00");
    const existentes = [
      reserva("x", OUTRA_SALA, "14:00", "15:00"),
      reserva("y", SALA, "09:00", "10:00"),
      conflito,
      reserva("z", SALA, "16:00", "17:00"),
    ];
    const nova = reserva("b", SALA, "14:30", "16:00");

    try {
      garantirSemSobreposicao(nova, existentes);
    } catch (erro) {
      expect(erro).toBeInstanceOf(ErroSobreposicao);
      expect(erro.name).toBe("ErroSobreposicao");
      expect(erro.reservaEmConflito).toBe(conflito);
    }
    expect.assertions(3);
  });
});
