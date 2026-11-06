import { ErroValidacao } from "./erros";
import { validarId } from "./validacoes";

export function criarSala({ id, nome, capacidade }) {
  validarId(id, "id da sala");

  if (typeof nome !== "string" || nome.trim() === "") {
    throw new ErroValidacao("O nome da sala é obrigatório.");
  }

  if (!Number.isInteger(capacidade) || capacidade < 1) {
    throw new ErroValidacao("A capacidade da sala tem de ser um número inteiro maior que zero.");
  }

  return Object.freeze({ id, nome: nome.trim(), capacidade });
}
