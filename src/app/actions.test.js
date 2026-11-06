import { describe, expect, it } from "vitest";
import { reservar } from "./actions";

function formulario(campos) {
  const dados = new FormData();
  for (const [campo, valor] of Object.entries(campos)) dados.set(campo, valor);
  return dados;
}

describe("Server Action reservar", () => {
  it("usa as salas fixas e guarda as reservas entre pedidos", async () => {
    // Data própria deste teste, para não chocar com outras reservas do repositório partilhado.
    const pedido = { salaId: "1", data: "2030-01-07", inicio: "09:00", fim: "10:00" };

    const primeiro = await reservar(null, formulario(pedido));
    const segundo = await reservar(primeiro, formulario(pedido));

    expect(primeiro).toEqual({ sucesso: true, valores: { data: "2030-01-07", inicio: "09:00", fim: "10:00" } });
    expect(segundo).toMatchObject({ sucesso: false, erro: "A sala já tem uma reserva nesse horário." });
  });

  it("a mesma hora noutra sala fixa é aceite", async () => {
    const resultado = await reservar(
      null,
      formulario({ salaId: "3", data: "2030-01-07", inicio: "09:00", fim: "10:00" }),
    );
    expect(resultado.sucesso).toBe(true);
  });
});
