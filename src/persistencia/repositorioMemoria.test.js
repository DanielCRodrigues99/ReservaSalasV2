import { describe, expect, it } from "vitest";
import { testarContratoRepositorio } from "../aplicacional/contratoRepositorio";
import { reservarSala } from "../aplicacional/reservarSala";
import { criarSala } from "../dominio/sala";
import { criarRepositorioMemoria } from "./repositorioMemoria";

testarContratoRepositorio("Repositório em memória", criarRepositorioMemoria);

describe("criarRepositorioMemoria", () => {
  it("começa vazio quando não recebe dados", async () => {
    const repositorio = criarRepositorioMemoria();
    expect(await repositorio.listarSalas()).toEqual([]);
    expect(await repositorio.listarReservas()).toEqual([]);
  });

  it("não é afetado por alterações às listas iniciais depois de criado", async () => {
    const salas = [criarSala({ id: 1, nome: "Sala Douro", capacidade: 6 })];
    const repositorio = criarRepositorioMemoria({ salas });
    salas.push(criarSala({ id: 2, nome: "Sala Tejo", capacidade: 20 }));
    expect(await repositorio.listarSalas()).toHaveLength(1);
  });

  it("funciona com o caso de uso reservarSala", async () => {
    const repositorio = criarRepositorioMemoria({
      salas: [criarSala({ id: 1, nome: "Sala Douro", capacidade: 6 })],
    });
    const dados = {
      salaId: 1,
      inicio: new Date(Date.UTC(2026, 10, 10, 10)),
      fim: new Date(Date.UTC(2026, 10, 10, 11)),
    };

    const primeira = await reservarSala(dados, { repositorio });
    const repetida = await reservarSala(dados, { repositorio });

    expect(primeira.sucesso).toBe(true);
    expect(repetida).toEqual({ sucesso: false, erro: "A sala já tem uma reserva nesse horário." });
    expect(await repositorio.listarReservas()).toEqual([primeira.reserva]);
  });
});
