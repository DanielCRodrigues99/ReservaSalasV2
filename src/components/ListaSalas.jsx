import BotaoReservar from "./BotaoReservar";

function IconePessoas() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500"
    >
      <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.5 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.6 15.3A5.5 5.5 0 0 1 12.4 15.3a.9.9 0 0 1-.6 1.2A18 18 0 0 1 7 17a18 18 0 0 1-4.8-.5.9.9 0 0 1-.6-1.2Zm12.9 1.6a7 7 0 0 0-.9-3.4A4 4 0 0 1 18.4 15a.8.8 0 0 1-.4 1 11 11 0 0 1-3.5.9Z" />
    </svg>
  );
}

export default function ListaSalas({ salas }) {
  if (salas.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        Não há salas disponíveis.
      </p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4">
      {salas.map((sala) => (
        <li
          key={sala.id}
          className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="min-w-0">
            <h2 className="break-words text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {sala.nome}
            </h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
              <IconePessoas />
              Capacidade: {sala.capacidade} {sala.capacidade === 1 ? "pessoa" : "pessoas"}
            </p>
          </div>
          <BotaoReservar sala={sala} />
        </li>
      ))}
    </ul>
  );
}
