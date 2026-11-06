import { ErroSobreposicao } from "./erros";

// Duas reservas sobrepõem-se se forem da mesma sala e os períodos se cruzarem.
// O fim não conta como ocupado: uma reserva pode começar quando outra acaba.
export function reservasSobrepoem(a, b) {
  return a.salaId === b.salaId && a.inicio < b.fim && b.inicio < a.fim;
}

export function garantirSemSobreposicao(nova, existentes) {
  const conflito = existentes.find((existente) => reservasSobrepoem(nova, existente));
  if (conflito) {
    throw new ErroSobreposicao(conflito);
  }
}
