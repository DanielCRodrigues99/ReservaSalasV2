"use client";

import { useActionState, useId, useRef, useState } from "react";
import { reservar } from "../app/actions";
import { formatarData } from "./ListaReservas";

// text-base no telemóvel: abaixo de 16px o iOS faz zoom ao focar o campo.
const CLASSES_CAMPO =
  "mt-1 block min-h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 sm:text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-300 dark:focus:ring-zinc-300/20";
const CLASSES_ETIQUETA = "block text-sm font-medium text-zinc-700 dark:text-zinc-300";
const CLASSES_FOCO =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-50";
const CLASSES_BOTAO_PRINCIPAL = `min-h-11 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 ${CLASSES_FOCO}`;
const CLASSES_BOTAO_SECUNDARIO = `min-h-11 rounded-lg border border-zinc-300 px-4 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800 ${CLASSES_FOCO}`;

// A data e as horas são de Lisboa; a Server Action converte-as para UTC no servidor.
function FormularioReserva({ sala, id, aoFechar }) {
  const [estado, acao, pendente] = useActionState(reservar, null);

  if (estado?.sucesso) {
    const { data, inicio, fim } = estado.valores;
    return (
      <div className="flex flex-col gap-4">
        <h2 id={`${id}-titulo`} className="text-lg font-semibold">
          Reserva feita
        </h2>
        <p role="status" className="text-sm text-zinc-700 dark:text-zinc-300">
          {`${sala.nome} ficou reservada para ${formatarData(data)}, das ${inicio} às ${fim} (hora de Lisboa).`}
        </p>
        <div className="mt-2 flex flex-col sm:flex-row sm:justify-end">
          <button type="button" onClick={aoFechar} autoFocus className={CLASSES_BOTAO_PRINCIPAL}>
            Fechar
          </button>
        </div>
      </div>
    );
  }

  // Depois de um erro, o React limpa o formulário: os defaultValue repõem o que foi escrito.
  const valores = estado?.valores ?? {};

  return (
    <form action={acao} className="flex flex-col gap-4">
      <input type="hidden" name="salaId" value={sala.id} />
      <h2 id={`${id}-titulo`} className="text-lg font-semibold">
        {`Reservar ${sala.nome}`}
      </h2>

      <div>
        <label htmlFor={`${id}-data`} className={CLASSES_ETIQUETA}>
          Data da reserva
        </label>
        <input
          id={`${id}-data`}
          name="data"
          type="date"
          required
          className={CLASSES_CAMPO}
          defaultValue={valores.data}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${id}-inicio`} className={CLASSES_ETIQUETA}>
            Hora de início
          </label>
          <input
            id={`${id}-inicio`}
            name="inicio"
            type="time"
            required
            className={CLASSES_CAMPO}
            defaultValue={valores.inicio}
          />
        </div>
        <div>
          <label htmlFor={`${id}-fim`} className={CLASSES_ETIQUETA}>
            Hora de fim
          </label>
          <input
            id={`${id}-fim`}
            name="fim"
            type="time"
            required
            className={CLASSES_CAMPO}
            defaultValue={valores.fim}
          />
        </div>
      </div>

      {estado?.erro && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {estado.erro}
        </p>
      )}

      {/* No telemóvel os botões ocupam a largura toda, com Confirmar em cima. */}
      <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={aoFechar} className={CLASSES_BOTAO_SECUNDARIO}>
          Cancelar
        </button>
        <button type="submit" disabled={pendente} className={CLASSES_BOTAO_PRINCIPAL}>
          {pendente ? "A reservar…" : "Confirmar"}
        </button>
      </div>
    </form>
  );
}

export default function BotaoReservar({ sala }) {
  const id = useId();
  const dialogoRef = useRef(null);
  // Mudar a key ao fechar recria o formulário: a próxima abertura começa vazia.
  const [versao, setVersao] = useState(0);

  function abrir() {
    dialogoRef.current.showModal();
  }

  function fechar() {
    dialogoRef.current.close();
  }

  return (
    <>
      <button type="button" onClick={abrir} className={`shrink-0 ${CLASSES_BOTAO_PRINCIPAL}`}>
        Reservar
      </button>

      <dialog
        ref={dialogoRef}
        onClose={() => setVersao((v) => v + 1)}
        aria-labelledby={`${id}-titulo`}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl bg-white p-5 text-zinc-900 shadow-xl backdrop:bg-black/50 sm:p-6 dark:bg-zinc-900 dark:text-zinc-50"
      >
        <FormularioReserva key={versao} sala={sala} id={id} aoFechar={fechar} />
      </dialog>
    </>
  );
}
