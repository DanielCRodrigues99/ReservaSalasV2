import { describe, expect, it } from "vitest";
import { criarSala } from "../dominio/sala";
import { reservarSala } from "./reservarSala";
import { criarRepositorioSimulado } from "./repositorioSimulado";

const SALAS = [criarSala({ id: 1, nome: "Sala Douro", capacidade: 6 })];

function hora(h, m = 0) {
  return new Date(Date.UTC(2026, 10, 10, h, m));
}

function preparar() {
  return {
    repositorio: criarRepositorioSimulado({ salas: SALAS }),
    gerarId: () => "nova-1",
  };
}

describe("reservarSala com a regra da duração máxima (2 horas)", () => {
  it("recusa 2 horas e 1 minuto com uma mensagem, sem lançar exceção e sem guardar", async () => {
    const { repositorio, gerarId } = preparar();

    const promessa = reservarSala(
      { salaId: 1, inicio: hora(10), fim: hora(12, 1) },
      { repositorio, gerarId },
    );

    await expect(promessa).resolves.toEqual({
      sucesso: false,
      erro: "Uma reserva pode ter no máximo 2 horas.",
    });
    expect(await repositorio.listarReservas()).toEqual([]);
  });

  it("recusa antes de consultar o repositório, como as outras regras do domínio", async () => {
    const { repositorio, gerarId } = preparar();
    await reservarSala({ salaId: 1, inicio: hora(9), fim: hora(12) }, { repositorio, gerarId });
    expect(repositorio.chamadas).toEqual([]);
  });

  it("continua a aceitar exatamente 2 horas", async () => {
    const { repositorio, gerarId } = preparar();
    const resultado = await reservarSala(
      { salaId: 1, inicio: hora(10), fim: hora(12) },
      { repositorio, gerarId },
    );
    expect(resultado.sucesso).toBe(true);
  });
});
