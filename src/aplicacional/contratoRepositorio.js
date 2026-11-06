// Testes que qualquer implementação do Repositório tem de passar.
// Só é usado em ficheiros *.test.js.
import { describe, expect, it } from "vitest";
import { criarReserva } from "../dominio/reserva";
import { criarSala } from "../dominio/sala";
import { METODOS_REPOSITORIO } from "./repositorio";

const SALAS = [
  criarSala({ id: 1, nome: "Sala Douro", capacidade: 6 }),
  criarSala({ id: 2, nome: "Sala Tejo", capacidade: 20 }),
];

const RESERVAS = [
  criarReserva({
    id: "r1",
    salaId: 1,
    inicio: new Date(Date.UTC(2026, 10, 10, 10)),
    fim: new Date(Date.UTC(2026, 10, 10, 11)),
  }),
  criarReserva({
    id: "r2",
    salaId: 2,
    inicio: new Date(Date.UTC(2026, 10, 10, 10)),
    fim: new Date(Date.UTC(2026, 10, 10, 12)),
  }),
];

const NOVA = criarReserva({
  id: "r3",
  salaId: 1,
  inicio: new Date(Date.UTC(2026, 10, 11, 9)),
  fim: new Date(Date.UTC(2026, 10, 11, 10)),
});

/**
 * @param {string} nome
 * @param {(dados: { salas: object[], reservas: object[] }) => object} criarRepositorio
 */
export function testarContratoRepositorio(nome, criarRepositorio) {
  describe(`${nome} cumpre o contrato do Repositório`, () => {
    const criar = () => criarRepositorio({ salas: SALAS, reservas: RESERVAS });

    it("tem todos os métodos da interface", () => {
      const repositorio = criar();
      for (const metodo of METODOS_REPOSITORIO) {
        expect(typeof repositorio[metodo], metodo).toBe("function");
      }
    });

    it("todos os métodos devolvem uma Promise", () => {
      const repositorio = criar();
      expect(repositorio.listarSalas()).toBeInstanceOf(Promise);
      expect(repositorio.listarReservas()).toBeInstanceOf(Promise);
      expect(repositorio.listarReservasDaSala(1)).toBeInstanceOf(Promise);
      expect(repositorio.guardarReserva(NOVA)).toBeInstanceOf(Promise);
    });

    it("listarSalas devolve todas as salas", async () => {
      expect(await criar().listarSalas()).toEqual(SALAS);
    });

    it("listarReservas devolve as reservas de todas as salas", async () => {
      expect(await criar().listarReservas()).toEqual(RESERVAS);
    });

    it("listarReservasDaSala devolve só as reservas dessa sala", async () => {
      const repositorio = criar();
      expect(await repositorio.listarReservasDaSala(1)).toEqual([RESERVAS[0]]);
      expect(await repositorio.listarReservasDaSala(2)).toEqual([RESERVAS[1]]);
      expect(await repositorio.listarReservasDaSala(99)).toEqual([]);
    });

    it("uma reserva guardada aparece nas listagens", async () => {
      const repositorio = criar();
      await repositorio.guardarReserva(NOVA);
      expect(await repositorio.listarReservas()).toContainEqual(NOVA);
      expect(await repositorio.listarReservasDaSala(1)).toEqual([RESERVAS[0], NOVA]);
      expect(await repositorio.listarReservasDaSala(2)).not.toContainEqual(NOVA);
    });

    it("alterar a lista devolvida não altera o repositório", async () => {
      const repositorio = criar();
      (await repositorio.listarSalas()).pop();
      (await repositorio.listarReservas()).length = 0;
      expect(await repositorio.listarSalas()).toHaveLength(2);
      expect(await repositorio.listarReservas()).toHaveLength(2);
    });

    it("cada repositório criado começa com os seus próprios dados", async () => {
      const primeiro = criar();
      await primeiro.guardarReserva(NOVA);
      expect(await criar().listarReservas()).toHaveLength(2);
    });
  });
}
