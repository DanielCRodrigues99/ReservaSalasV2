import { ErroValidacao } from "./erros";

export const DURACAO_MAXIMA_MINUTOS = 120;

const DURACAO_MAXIMA_MS = DURACAO_MAXIMA_MINUTOS * 60 * 1000;

// A duração é o tempo real entre os dois instantes (UTC), não a diferença
// no relógio local: nos dias de mudança de hora as duas podem ser diferentes.
export function garantirDuracaoMaxima(reserva) {
  if (reserva.fim.getTime() - reserva.inicio.getTime() > DURACAO_MAXIMA_MS) {
    throw new ErroValidacao("Uma reserva pode ter no máximo 2 horas.");
  }
}
