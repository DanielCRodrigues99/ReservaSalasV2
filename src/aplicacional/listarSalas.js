/**
 * Caso de uso "Listar salas": todas as salas, ordenadas por nome.
 *
 * @param {{ repositorio: import("./repositorio").Repositorio }} dependencias
 */
export async function listarSalas({ repositorio }) {
  const salas = await repositorio.listarSalas();
  return [...salas].sort((a, b) => a.nome.localeCompare(b.nome, "pt"));
}
