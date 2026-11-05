"use client";

import { useId, useRef } from "react";

const CLASSES_CAMPO =
  "mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50";
const CLASSES_ETIQUETA = "block text-sm font-medium text-zinc-700 dark:text-zinc-300";

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
      <button
        type="button"
        onClick={abrir}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Reservar
      </button>

      {/* Ao fechar (submeter, cancelar ou Esc) os campos voltam a ficar vazios. */}
      <dialog
        ref={dialogoRef}
        onClose={() => formularioRef.current.reset()}
        aria-labelledby={`${id}-titulo`}
        className="m-auto w-full max-w-sm rounded-lg bg-white p-6 text-zinc-900 shadow-xl backdrop:bg-black/50 dark:bg-zinc-900 dark:text-zinc-50"
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

          <div className="grid grid-cols-2 gap-4">
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

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={fechar}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Confirmar
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
