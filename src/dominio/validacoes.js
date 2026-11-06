import { ErroValidacao } from "./erros";

// Um id é um inteiro positivo ou um texto não vazio (ex.: UUID).
export function validarId(valor, descricao) {
  const inteiroValido = Number.isInteger(valor) && valor > 0;
  const textoValido = typeof valor === "string" && valor.trim() !== "";
  if (!inteiroValido && !textoValido) {
    throw new ErroValidacao(`O ${descricao} tem de ser um número inteiro positivo ou um texto.`);
  }
}
