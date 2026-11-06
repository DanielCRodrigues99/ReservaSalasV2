import { describe, expect, it } from "vitest";
import { ErroValidacao } from "./erros";
import { criarSala } from "./sala";

const dadosValidos = { id: 1, nome: "Sala Douro", capacidade: 6 };

describe("criarSala", () => {
  it("cria uma sala com id, nome e capacidade", () => {
    expect(criarSala(dadosValidos)).toEqual({ id: 1, nome: "Sala Douro", capacidade: 6 });
  });

  it("aceita um id em texto (ex.: UUID)", () => {
    const id = "7d1f0c2e-1b7a-4f0e-9a51-3c2b8e6d4a10";
    expect(criarSala({ ...dadosValidos, id }).id).toBe(id);
  });

  it("retira espaços à volta do nome", () => {
    expect(criarSala({ ...dadosValidos, nome: "  Sala Tejo  " }).nome).toBe("Sala Tejo");
  });

  it("devolve uma sala que não pode ser alterada", () => {
    const sala = criarSala(dadosValidos);
    expect(Object.isFrozen(sala)).toBe(true);
    // Os módulos ES correm em modo estrito: alterar um objeto congelado lança TypeError.
    expect(() => {
      sala.capacidade = 100;
    }).toThrow(TypeError);
  });

  it.each([undefined, null, 0, -1, 1.5, "", "   ", {}])("rejeita o id %j", (id) => {
    expect(() => criarSala({ ...dadosValidos, id })).toThrow(ErroValidacao);
  });

  it.each([undefined, null, "", "   ", 42])("rejeita o nome %j", (nome) => {
    expect(() => criarSala({ ...dadosValidos, nome })).toThrow("O nome da sala é obrigatório.");
  });

  it.each([undefined, null, 0, -3, 2.5, "10", Number.NaN, Infinity])(
    "rejeita a capacidade %j",
    (capacidade) => {
      expect(() => criarSala({ ...dadosValidos, capacidade })).toThrow(
        "A capacidade da sala tem de ser um número inteiro maior que zero.",
      );
    },
  );

  it("o erro é do tipo ErroValidacao", () => {
    try {
      criarSala({ ...dadosValidos, capacidade: 0 });
    } catch (erro) {
      expect(erro).toBeInstanceOf(ErroValidacao);
      expect(erro.name).toBe("ErroValidacao");
    }
    expect.assertions(2);
  });
});
