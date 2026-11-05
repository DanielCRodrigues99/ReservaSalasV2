import ListaReservas from "../../components/ListaReservas";

export const metadata = {
  title: "As minhas reservas",
};

// Dados de exemplo: vão ser substituídos pelo caso de uso de listagem de reservas.
const RESERVAS_EXEMPLO = [
  { id: 1, salaNome: "Sala Douro", data: "2026-11-10", inicio: "10:00", fim: "11:00" },
  { id: 2, salaNome: "Sala Atlântico", data: "2026-11-12", inicio: "14:30", fim: "16:00" },
  { id: 3, salaNome: "Sala Tejo", data: "2026-11-18", inicio: "09:00", fim: "12:30" },
  { id: 4, salaNome: "Sala Mondego", data: "2026-12-02", inicio: "15:00", fim: "15:45" },
];

export default function MinhasReservas() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">As minhas reservas</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Consulte as reservas que fez.
        </p>
      </header>
      <ListaReservas reservas={RESERVAS_EXEMPLO} />
    </main>
  );
}
