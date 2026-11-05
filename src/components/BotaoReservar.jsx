"use client";

import { useId, useRef } from "react";

// text-base no telemóvel: abaixo de 16px o iOS faz zoom ao focar o campo.
const CLASSES_CAMPO =
  "mt-1 block min-h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 sm:text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:border-zinc-300 dark:focus:ring-zinc-300/20";
const CLASSES_ETIQUETA = "block text-sm font-medium text-zinc-700 dark:text-zinc-300";
const CLASSES_FOCO =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-50";
const CLASSES_BOTAO_PRINCIPAL = `min-h-11 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 ${CLASSES_FOCO}`;

export default function BotaoReservar({ sala }) {
  const id = useId();
  const dialogoRef = useRef(null);
  const formularioRef = useRef(null);

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

      {/* Ao fechar (submeter, cancelar ou Esc) os campos voltam a ficar vazios. */}
      <dialog
        ref={dialogoRef}
        onClose={() => formularioRef.current.reset()}
        aria-labelledby={`${id}-titulo`}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl bg-white p-5 text-zinc-900 shadow-xl backdrop:bg-black/50 sm:p-6 dark:bg-zinc-900 dark:text-zinc-50"
      >
        {/* method="dialog": submeter só fecha o diálogo, ainda não guarda nada. */}
        <form ref={formularioRef} method="dialog" className="flex flex-col gap-4">
          <h2 id={`${id}-titulo`} className="text-lg font-semibold">
            {`Reservar ${sala.nome}`}
          </h2>

          <div>
            <label htmlFor={`${id}-data`} className={CLASSES_ETIQUETA}>
              Data da reserva
            </label>
            <input id={`${id}-data`} name="data" type="date" required className={CLASSES_CAMPO} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={`${id}-inicio`} className={CLASSES_ETIQUETA}>
                Hora de início
              </label>
              <input id={`${id}-inicio`} name="inicio" type="time" required className={CLASSES_CAMPO} />
            </div>
            <div>
              <label htmlFor={`${id}-fim`} className={CLASSES_ETIQUETA}>
                Hora de fim
              </label>
              <input id={`${id}-fim`} name="fim" type="time" required className={CLASSES_CAMPO} />
            </div>
          </div>

          {/* No telemóvel os botões ocupam a largura toda, com Confirmar em cima. */}
          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={fechar}
              className={`min-h-11 rounded-lg border border-zinc-300 px-4 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800 ${CLASSES_FOCO}`}
            >
              Cancelar
            </button>
            <button type="submit" className={CLASSES_BOTAO_PRINCIPAL}>
              Confirmar
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
