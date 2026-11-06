// Persistência simulada, só para os testes da camada aplicacional.
// Regista as chamadas e permite simular falhas.
export function criarRepositorioSimulado({ salas = [], reservas = [], falhas = {} } = {}) {
  const guardadas = [...reservas];
  const chamadas = [];

  async function executar(metodo, argumentos, resultado) {
    chamadas.push({ metodo, argumentos });
    if (falhas[metodo]) throw falhas[metodo];
    return resultado();
  }

  return {
    chamadas,
    listarSalas: () => executar("listarSalas", [], () => [...salas]),
    listarReservas: () => executar("listarReservas", [], () => [...guardadas]),
    listarReservasDaSala: (salaId) =>
      executar("listarReservasDaSala", [salaId], () =>
        guardadas.filter((reserva) => reserva.salaId === salaId),
      ),
    guardarReserva: (reserva) =>
      executar("guardarReserva", [reserva], () => {
        guardadas.push(reserva);
      }),
  };
}
