"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LIGACOES = [
  { href: "/", texto: "Salas" },
  { href: "/reservas", texto: "As minhas reservas" },
];

export default function Navegacao() {
  const caminho = usePathname();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <nav aria-label="Principal" className="mx-auto flex w-full max-w-3xl gap-1 px-2 sm:px-4">
        {LIGACOES.map(({ href, texto }) => {
          const ativa = caminho === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={ativa ? "page" : undefined}
              className={`flex min-h-12 items-center border-b-2 px-3 text-sm font-medium focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-50 ${
                ativa
                  ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                  : "border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              }`}
            >
              {texto}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
