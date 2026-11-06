import { garantirDuracaoMaxima } from "../dominio/duracao";
import { ErroSobreposicao, ErroValidacao } from "../dominio/erros";
import { criarReserva } from "../dominio/reserva";
import { garantirSemSobreposicao } from "../dominio/sobreposicao";

export const MENSAGEM_SALA_INEXISTENTE = "A sala escolhida não existe.";
export const MENSAGEM_ERRO_INESPERADO = "Não foi possível fazer a reserva. Tente novamente.";

/**
 * Caso de uso "Reservar sala". Nunca lança exceções.
 *
 * @param {{ salaId: number | string, inicio: Date, fim: Date }} dados
 * @param {{ repositorio: import("./repositorio").Repositorio, gerarId?: () => string }} dependencias
 * @returns {Promise<{ sucesso: true, reserva: object } | { sucesso: false, erro: string }>}
 */
export async function reservarSala(dados, { repositorio, gerarId = () => crypto.randomUUID() } = {}) {
  try {
    const { salaId, inicio, fim } = dados ?? {};

    // As regras do domínio são verificadas antes de consultar o repositório.
    const reserva = criarReserva({ id: gerarId(), salaId, inicio, fim });
    garantirDuracaoMaxima(reserva);

    const salas = await repositorio.listarSalas();
    if (!salas.some((sala) => sala.id === salaId)) {
      return { sucesso: false, erro: MENSAGEM_SALA_INEXISTENTE };
    }

    garantirSemSobreposicao(reserva, await repositorio.listarReservasDaSala(salaId));
    await repositorio.guardarReserva(reserva);

    return { sucesso: true, reserva };
  } catch (erro) {
    if (erro instanceof ErroValidacao || erro instanceof ErroSobreposicao) {
      return { sucesso: false, erro: erro.message };
    }
    // Erros técnicos (ex.: falha na base de dados) não chegam ao utilizador.
    return { sucesso: false, erro: MENSAGEM_ERRO_INESPERADO };
  }
}
