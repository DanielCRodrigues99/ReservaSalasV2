import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const caminhoAtual = vi.hoisted(() => ({ valor: "/" }));

vi.mock("next/navigation", () => ({ usePathname: () => caminhoAtual.valor }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...resto }) => (
    <a href={href} {...resto}>
      {children}
    </a>
  ),
}));

const { default: Navegacao } = await import("./Navegacao");

function linkAtivo(html) {
  return html.match(/<a href="([^"]*)" aria-current="page"/)?.[1];
}

describe("Navegacao", () => {
  it("tem ligações para Salas e para As minhas reservas", () => {
    const html = renderToStaticMarkup(<Navegacao />);
    expect(html).toMatch(/<a href="\/"[^>]*>Salas<\/a>/);
    expect(html).toMatch(/<a href="\/reservas"[^>]*>As minhas reservas<\/a>/);
  });

  it("marca a ligação do ecrã atual", () => {
    caminhoAtual.valor = "/";
    expect(linkAtivo(renderToStaticMarkup(<Navegacao />))).toBe("/");
    caminhoAtual.valor = "/reservas";
    expect(linkAtivo(renderToStaticMarkup(<Navegacao />))).toBe("/reservas");
  });
});
