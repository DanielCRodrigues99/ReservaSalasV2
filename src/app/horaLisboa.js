// Converte uma data e hora de Lisboa (como vêm do formulário) para um instante UTC.
// Usa a base de dados de fusos do Intl, por isso respeita a hora de verão e de inverno.

export const MENSAGEM_DATA_HORA_INVALIDA = "A data ou a hora não são válidas.";
export const MENSAGEM_HORA_INEXISTENTE =
  "Essa hora não existe em Lisboa nesse dia (mudança para a hora de verão).";

const UMA_HORA_MS = 60 * 60 * 1000;

const PARTES_EM_LISBOA = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Lisbon",
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

// Diferença entre a hora de Lisboa e UTC num dado instante (0 no inverno, +1h no verão).
function desvioDeLisboaMs(instanteMs) {
  const partes = Object.fromEntries(
    PARTES_EM_LISBOA.formatToParts(instanteMs).map(({ type, value }) => [type, Number(value)]),
  );
  const relogioDeLisboa = Date.UTC(partes.year, partes.month - 1, partes.day, partes.hour, partes.minute);
  return relogioDeLisboa - Math.floor(instanteMs / 60000) * 60000;
}

/**
 * @param {string} data "AAAA-MM-DD"
 * @param {string} hora "HH:MM"
 * @returns {{ instante: Date } | { erro: string }}
 */
export function lisboaParaUtc(data, hora) {
  const dataPartes = typeof data === "string" && /^(\d{4})-(\d{2})-(\d{2})$/.exec(data);
  const horaPartes = typeof hora === "string" && /^(\d{2}):(\d{2})$/.exec(hora);
  if (!dataPartes || !horaPartes) return { erro: MENSAGEM_DATA_HORA_INVALIDA };

  const [ano, mes, dia] = dataPartes.slice(1).map(Number);
  const [horas, minutos] = horaPartes.slice(1).map(Number);
  // O "relógio de parede" de Lisboa, escrito como se fosse UTC.
  const relogio = Date.UTC(ano, mes - 1, dia, horas, minutos);

  const confirmado = new Date(relogio);
  if (
    horas > 23 ||
    minutos > 59 ||
    confirmado.getUTCFullYear() !== ano ||
    confirmado.getUTCMonth() !== mes - 1 ||
    confirmado.getUTCDate() !== dia
  ) {
    return { erro: MENSAGEM_DATA_HORA_INVALIDA };
  }

  // Os desvios possíveis nesse dia são os de 12 h antes e 12 h depois.
  // Um instante candidato só serve se, visto em Lisboa, mostrar o mesmo relógio.
  const desvios = new Set([
    desvioDeLisboaMs(relogio - 12 * UMA_HORA_MS),
    desvioDeLisboaMs(relogio + 12 * UMA_HORA_MS),
  ]);
  const candidatos = [...desvios]
    .map((desvio) => relogio - desvio)
    .filter((instante) => instante + desvioDeLisboaMs(instante) === relogio)
    .sort((a, b) => a - b);

  // Sem candidatos: hora saltada na mudança para a hora de verão.
  if (candidatos.length === 0) return { erro: MENSAGEM_HORA_INEXISTENTE };

  // Dois candidatos: hora repetida no fim da hora de verão; fica a primeira.
  return { instante: new Date(candidatos[0]) };
}
