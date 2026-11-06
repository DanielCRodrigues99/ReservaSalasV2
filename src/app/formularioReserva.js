import { reservarSala } from "../aplicacional/reservarSala";
import { lisboaParaUtc } from "./horaLisboa";

// Os campos vêm do browser (ou de um POST direto): só se aceita texto.
function lerTexto(dados, campo) {
  const valor = dados?.get?.(campo);
  return typeof valor === "string" ? valor.trim() : "";
}

/**
 * Lê o formulário de reserva, converte a data e as horas de Lisboa para UTC
 * e chama o caso de uso "Reservar sala". Corre só no servidor (via actions.js).
 *
 * @returns {Promise<{ sucesso: boolean, erro?: string, valores: { data: string, inicio: string, fim: string } }>}
 */
export async function processarFormularioReserva(dados, { repositorio }) {
  const valores = {
    data: lerTexto(dados, "data"),
    inicio: lerTexto(dados, "inicio"),
    fim: lerTexto(dados, "fim"),
  };

  // As salas fixas têm ids numéricos; o formulário envia-os como texto.
  const salaIdTexto = lerTexto(dados, "salaId");
  const salaId = /^\d+$/.test(salaIdTexto) ? Number(salaIdTexto) : salaIdTexto;

  const inicio = lisboaParaUtc(valores.data, valores.inicio);
  if (inicio.erro) return { sucesso: false, erro: inicio.erro, valores };

  const fim = lisboaParaUtc(valores.data, valores.fim);
  if (fim.erro) return { sucesso: false, erro: fim.erro, valores };

  const resultado = await reservarSala(
    { salaId, inicio: inicio.instante, fim: fim.instante },
    { repositorio },
  );

  return resultado.sucesso
    ? { sucesso: true, valores }
    : { sucesso: false, erro: resultado.erro, valores };
}
