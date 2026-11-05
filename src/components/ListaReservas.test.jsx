import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ListaReservas, { formatarData } from "./ListaReservas";

describe("formatarData", () => {
  it("formata a data em português, sem depender do fuso horário", () => {
    expect(formatarData("2026-11-10")).toBe("terça, 10 de novembro de 2026");
    expect(formatarData("2026-01-01")).toBe("quinta, 1 de janeiro de 2026");
  });
});

describe("ListaReservas", () => {
  it("mostra sala, data, horas e um botão Cancelar por reserva", () => {
    const html = renderToStaticMarkup(
      <ListaReservas
        reservas={[
          { id: 1, salaNome: "Sala Douro", data: "2026-11-10", inicio: "10:00", fim: "11:00" },
          { id: 2, salaNome: "Sala Tejo", data: "2026-11-18", inicio: "09:00", fim: "12:30" },
        ]}
      />,
    );
    expect(html).toContain("Sala Douro");
    expect(html).toContain("Sala Tejo");
    expect(html).toContain('<time dateTime="2026-11-10">terça, 10 de novembro de 2026</time>');
    expect(html).toContain('<time dateTime="10:00">10:00</time> – <time dateTime="11:00">11:00</time>');
    expect(html.match(/<button type="button"[^>]*>Cancelar<\/button>/g)).toHaveLength(2);
  });

  it("mostra uma mensagem quando não há reservas", () => {
    expect(renderToStaticMarkup(<ListaReservas reservas={[]} />)).toContain(
      "Ainda não tem reservas.",
    );
  });
});
