import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import BotaoReservar from "./BotaoReservar";

describe("BotaoReservar", () => {
  const html = renderToStaticMarkup(
    <BotaoReservar sala={{ id: 2, nome: "Sala Douro", capacidade: 6 }} />,
  );

  it("mostra o botão Reservar e o formulário começa fechado", () => {
    expect(html).toContain(">Reservar</button>");
    expect(html).toMatch(/<dialog(?![^>]*\sopen)[^>]*>/);
  });

  it("tem os campos data, hora de início e hora de fim, obrigatórios", () => {
    expect(html).toContain("Reservar Sala Douro");
    expect(html).toMatch(/Data da reserva<\/label><input[^>]*type="date"[^>]*required/);
    expect(html).toMatch(/Hora de início<\/label><input[^>]*type="time"[^>]*required/);
    expect(html).toMatch(/Hora de fim<\/label><input[^>]*type="time"[^>]*required/);
  });

  it("submeter só fecha o diálogo e existe um botão para cancelar", () => {
    expect(html).toContain('method="dialog"');
    expect(html).toMatch(/<button type="button"[^>]*>Cancelar<\/button>/);
  });
});
