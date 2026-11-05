// A data vem como "AAAA-MM-DD" e é formatada em UTC para não mudar de dia
// consoante o fuso horário de quem vê.
const FORMATO_DATA = new Intl.DateTimeFormat("pt-PT", {
  weekday: "short",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatarData(data) {
  return FORMATO_DATA.format(new Date(`${data}T00:00:00Z`));
}

export default function ListaReservas({ reservas }) {
  if (reservas.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        Ainda não tem reservas.
      </p>
    );
  }

  return (
    <ul className="grid gap-3 sm:gap-4">
      {reservas.map((reserva) => (
        <li
          key={reserva.id}
          className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="min-w-0">
            <h2 className="break-words text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {reserva.salaNome}
            </h2>
            <dl className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex gap-1">
                <dt className="sr-only">Data</dt>
                <dd>
                  <time dateTime={reserva.data}>{formatarData(reserva.data)}</time>
                </dd>
              </div>
              <div className="flex gap-1">
                <dt className="sr-only">Horário</dt>
                <dd>
                  <time dateTime={reserva.inicio}>{reserva.inicio}</time>
                  {" – "}
                  <time dateTime={reserva.fim}>{reserva.fim}</time>
                </dd>
              </div>
            </dl>
          </div>
          {/* Ainda sem funcionalidade: o cancelamento vem com a camada aplicacional. */}
          <button
            type="button"
            className="min-h-11 shrink-0 rounded-lg border border-red-300 px-4 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
          >
            Cancelar
          </button>
        </li>
      ))}
    </ul>
  );
}
