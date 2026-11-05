export default function ListaSalas({ salas }) {
  if (salas.length === 0) {
    return <p className="text-zinc-600 dark:text-zinc-400">Não há salas disponíveis.</p>;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {salas.map((sala) => (
        <li
          key={sala.id}
          className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div>
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">{sala.nome}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Capacidade: {sala.capacidade} {sala.capacidade === 1 ? "pessoa" : "pessoas"}
            </p>
          </div>
          <button
            type="button"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Reservar
          </button>
        </li>
      ))}
    </ul>
  );
}
