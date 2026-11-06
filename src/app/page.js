import ListaSalas from "../components/ListaSalas";
import { SALAS_EXEMPLO } from "./salasExemplo";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Salas</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Escolha uma sala para fazer uma reserva.
        </p>
      </header>
      <ListaSalas salas={SALAS_EXEMPLO} />
    </main>
  );
}
