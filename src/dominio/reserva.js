import { ErroValidacao } from "./erros";
import { validarId } from "./validacoes";

function validarData(valor, descricao) {
  if (!(valor instanceof Date) || Number.isNaN(valor.getTime())) {
    throw new ErroValidacao(`O ${descricao} da reserva tem de ser uma data válida.`);
  }
}

// inicio e fim são instantes (Date), interpretados em UTC.
export function criarReserva({ id, salaId, inicio, fim }) {
  validarId(id, "id da reserva");
  validarId(salaId, "id da sala");
  validarData(inicio, "início");
  validarData(fim, "fim");

  if (fim.getTime() <= inicio.getTime()) {
    throw new ErroValidacao("O fim da reserva tem de ser depois do início.");
  }

  // Cópias das datas: alterar os Date originais não altera a reserva.
  return Object.freeze({
    id,
    salaId,
    inicio: new Date(inicio.getTime()),
    fim: new Date(fim.getTime()),
  });
}
