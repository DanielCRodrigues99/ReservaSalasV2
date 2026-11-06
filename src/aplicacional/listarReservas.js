/**
 * Caso de uso "Listar reservas": todas as reservas, ordenadas pelo início,
 * cada uma com o nome da sala (salaNome, ou null se a sala já não existir).
 *
 * @param {{ repositorio: import("./repositorio").Repositorio }} dependencias
 */
export async function listarReservas({ repositorio }) {
  const [reservas, salas] = await Promise.all([
    repositorio.listarReservas(),
    repositorio.listarSalas(),
  ]);
  const nomesDasSalas = new Map(salas.map((sala) => [sala.id, sala.nome]));

  return reservas
    .map((reserva) => ({ ...reserva, salaNome: nomesDasSalas.get(reserva.salaId) ?? null }))
    .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
}
