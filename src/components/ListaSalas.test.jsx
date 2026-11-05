import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ListaSalas from "./ListaSalas";

describe("ListaSalas", () => {
  it("mostra nome, capacidade e um botão Reservar por sala", () => {
    const html = renderToStaticMarkup(
      <ListaSalas
        salas={[
          { id: 1, nome: "Sala Douro", capacidade: 6 },
          { id: 2, nome: "Sala Mini", capacidade: 1 },
        ]}
      />,
    );
    expect(html).toContain("Sala Douro");
    expect(html).toContain("Capacidade: 6 pessoas");
    expect(html).toContain("Capacidade: 1 pessoa<");
    expect(html.match(/>Reservar</g)).toHaveLength(2);
  });

  it("mostra uma mensagem quando não há salas", () => {
    expect(renderToStaticMarkup(<ListaSalas salas={[]} />)).toContain(
      "Não há salas disponíveis.",
    );
  });
});
