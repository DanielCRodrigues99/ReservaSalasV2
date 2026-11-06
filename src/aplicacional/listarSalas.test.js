import { describe, expect, it } from "vitest";
import { criarSala } from "../dominio/sala";
import { listarSalas } from "./listarSalas";
import { criarRepositorioSimulado } from "./repositorioSimulado";

const TEJO = criarSala({ id: 3, nome: "Sala Tejo", capacidade: 20 });
const ATLANTICO = criarSala({ id: 1, nome: "Sala Atlântico", capacidade: 12 });
const DOURO = criarSala({ id: 2, nome: "Sala Douro", capacidade: 6 });

describe("listarSalas", () => {
  it("devolve as salas ordenadas por nome", async () => {
    const repositorio = criarRepositorioSimulado({ salas: [TEJO, ATLANTICO, DOURO] });
    expect(await listarSalas({ repositorio })).toEqual([ATLANTICO, DOURO, TEJO]);
  });

  it("ordena nomes com acentos como em português", async () => {
    const arvore = criarSala({ id: 4, nome: "Sala Árvore", capacidade: 2 });
    const banco = criarSala({ id: 5, nome: "Sala Banco", capacidade: 2 });
    const repositorio = criarRepositorioSimulado({ salas: [banco, arvore, ATLANTICO] });
    const nomes = (await listarSalas({ repositorio })).map((sala) => sala.nome);
    expect(nomes).toEqual(["Sala Árvore", "Sala Atlântico", "Sala Banco"]);
  });

  it("devolve uma lista vazia quando não há salas", async () => {
    expect(await listarSalas({ repositorio: criarRepositorioSimulado() })).toEqual([]);
  });

  it("não altera a ordem guardada no repositório", async () => {
    const repositorio = criarRepositorioSimulado({ salas: [TEJO, ATLANTICO] });
    await listarSalas({ repositorio });
    expect(await repositorio.listarSalas()).toEqual([TEJO, ATLANTICO]);
  });

  it("deixa passar o erro do repositório para a apresentação o tratar", async () => {
    const erro = new Error("falhou");
    const repositorio = criarRepositorioSimulado({ falhas: { listarSalas: erro } });
    await expect(listarSalas({ repositorio })).rejects.toBe(erro);
  });
});
