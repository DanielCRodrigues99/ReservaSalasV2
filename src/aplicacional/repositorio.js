/**
 * Interface do repositório de que os casos de uso precisam.
 * A camada de persistência fornece uma implementação (em memória, PostgreSQL…)
 * e a composição entrega-a aos casos de uso.
 *
 * Todos os métodos são assíncronos e devolvem entidades do domínio
 * (criadas com criarSala / criarReserva).
 *
 * @typedef {{ id: number | string, nome: string, capacidade: number }} Sala
 * @typedef {{ id: number | string, salaId: number | string, inicio: Date, fim: Date }} Reserva
 *
 * @typedef {Object} Repositorio
 * @property {() => Promise<Sala[]>} listarSalas
 *   Todas as salas.
 * @property {() => Promise<Reserva[]>} listarReservas
 *   Todas as reservas, de todas as salas.
 * @property {(salaId: number | string) => Promise<Reserva[]>} listarReservasDaSala
 *   Só as reservas da sala indicada.
 * @property {(reserva: Reserva) => Promise<void>} guardarReserva
 *   Guarda uma reserva nova.
 */

export const METODOS_REPOSITORIO = Object.freeze([
  "listarSalas",
  "listarReservas",
  "listarReservasDaSala",
  "guardarReserva",
]);
