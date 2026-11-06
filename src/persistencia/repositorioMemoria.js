/**
 * Repositório em memória: cumpre a interface Repositorio da camada aplicacional
 * (src/aplicacional/repositorio.js). Os dados perdem-se quando o servidor reinicia.
 *
 * @param {{ salas?: object[], reservas?: object[] }} [dadosIniciais]
 * @returns {import("../aplicacional/repositorio").Repositorio}
 */
export function criarRepositorioMemoria({ salas = [], reservas = [] } = {}) {
  const salasGuardadas = [...salas];
  const reservasGuardadas = [...reservas];

  return {
    async listarSalas() {
      return [...salasGuardadas];
    },

    async listarReservas() {
      return [...reservasGuardadas];
    },

    async listarReservasDaSala(salaId) {
      return reservasGuardadas.filter((reserva) => reserva.salaId === salaId);
    },

    async guardarReserva(reserva) {
      reservasGuardadas.push(reserva);
    },
  };
}
