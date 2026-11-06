"use server";

// Ficheiro de composição: o único sítio da apresentação que importa de
// src/persistencia/. Cria o repositório e entrega-o aos casos de uso.
import { criarRepositorioMemoria } from "../persistencia/repositorioMemoria";
import { processarFormularioReserva } from "./formularioReserva";
import { SALAS_EXEMPLO } from "./salasExemplo";

// Um só repositório por processo do servidor. Fica em globalThis para não se
// perder quando o next dev recarrega este módulo.
function obterRepositorio() {
  globalThis.__repositorioReservaSala ??= criarRepositorioMemoria({ salas: SALAS_EXEMPLO });
  return globalThis.__repositorioReservaSala;
}

export async function reservar(_estadoAnterior, dados) {
  return processarFormularioReserva(dados, { repositorio: obterRepositorio() });
}
