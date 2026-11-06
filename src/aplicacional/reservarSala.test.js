import { describe, expect, it } from "vitest";
import { criarReserva } from "../dominio/reserva";
import { criarSala } from "../dominio/sala";
import {
  MENSAGEM_ERRO_INESPERADO,
  MENSAGEM_SALA_INEXISTENTE,
  reservarSala,
} from "./reservarSala";
import { criarRepositorioSimulado } from "./repositorioSimulado";

const SALAS = [
  criarSala({ id: 1, nome: "Sala Douro", capacidade: 6 }),
  criarSala({ id: 2, nome: "Sala Tejo", capacidade: 20 }),
];

function hora(h, m = 0) {
  return new Date(Date.UTC(2026, 10, 10, h, m));
}

const EXISTENTE = criarReserva({ id: "existente", salaId: 1, inicio: hora(10), fim: hora(11) });

function preparar(opcoes = {}) {
  const repositorio = criarRepositorioSimulado({ salas: SALAS, reservas: [EXISTENTE], ...opcoes });
  let contador = 0;
  const gerarId = () => `nova-${++contador}`;
  return { repositorio, gerarId };
}

function metodosChamados(repositorio) {
  return repositorio.chamadas.map(({ metodo }) => metodo);
}

describe("reservarSala", () => {
  describe("com sucesso", () => {
    it("devolve { sucesso: true, reserva } e guarda a reserva", async () => {
      const { repositorio, gerarId } = preparar();

      const resultado = await reservarSala(
        { salaId: 1, inicio: hora(14), fim: hora(15) },
        { repositorio, gerarId },
      );

      expect(Object.keys(resultado).sort()).toEqual(["reserva", "sucesso"]);
      expect(resultado.sucesso).toBe(true);
      expect(resultado.reserva).toEqual({ id: "nova-1", salaId: 1, inicio: hora(14), fim: hora(15) });
      expect(await repositorio.listarReservasDaSala(1)).toContainEqual(resultado.reserva);
    });

    it("gera um UUID como id quando não é indicado gerarId", async () => {
      const { repositorio } = preparar();
      const resultado = await reservarSala(
        { salaId: 1, inicio: hora(14), fim: hora(15) },
        { repositorio },
      );
      expect(resultado.reserva.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    });

    it("aceita reservas seguidas (começa quando a outra acaba)", async () => {
      const { repositorio, gerarId } = preparar();
      const resultado = await reservarSala(
        { salaId: 1, inicio: hora(11), fim: hora(12) },
        { repositorio, gerarId },
      );
      expect(resultado.sucesso).toBe(true);
    });

    it("aceita outra sala no mesmo horário de uma reserva existente", async () => {
      const { repositorio, gerarId } = preparar();
      const resultado = await reservarSala(
        { salaId: 2, inicio: hora(10), fim: hora(11) },
        { repositorio, gerarId },
      );
      expect(resultado.sucesso).toBe(true);
    });

    it("só consulta as reservas da sala pedida", async () => {
      const { repositorio, gerarId } = preparar();
      await reservarSala({ salaId: 2, inicio: hora(14), fim: hora(15) }, { repositorio, gerarId });
      expect(repositorio.chamadas).toContainEqual({ metodo: "listarReservasDaSala", argumentos: [2] });
      expect(metodosChamados(repositorio)).not.toContain("listarReservas");
    });
  });

  describe("sem sucesso, devolve { sucesso: false, erro } e não guarda nada", () => {
    async function esperarFalha(dados, mensagem, opcoes) {
      const { repositorio, gerarId } = preparar(opcoes);
      const resultado = await reservarSala(dados, { repositorio, gerarId });
      expect(resultado).toEqual({ sucesso: false, erro: mensagem });
      expect(metodosChamados(repositorio)).not.toContain("guardarReserva");
      return repositorio;
    }

    it("quando se sobrepõe a uma reserva da mesma sala", async () => {
      await esperarFalha(
        { salaId: 1, inicio: hora(10, 30), fim: hora(11, 30) },
        "A sala já tem uma reserva nesse horário.",
      );
    });

    it("quando a sala não existe", async () => {
      await esperarFalha({ salaId: 99, inicio: hora(14), fim: hora(15) }, MENSAGEM_SALA_INEXISTENTE);
    });

    it('quando o salaId é de outro tipo ("1" em vez de 1)', async () => {
      await esperarFalha({ salaId: "1", inicio: hora(14), fim: hora(15) }, MENSAGEM_SALA_INEXISTENTE);
    });

    it("quando o fim é antes do início, sem chegar a consultar o repositório", async () => {
      const repositorio = await esperarFalha(
        { salaId: 1, inicio: hora(15), fim: hora(14) },
        "O fim da reserva tem de ser depois do início.",
      );
      expect(repositorio.chamadas).toEqual([]);
    });

    it("quando o início não é uma data", async () => {
      await esperarFalha(
        { salaId: 1, inicio: "2026-11-10T14:00:00Z", fim: hora(15) },
        "O início da reserva tem de ser uma data válida.",
      );
    });

    it("quando o salaId está em falta", async () => {
      await esperarFalha(
        { inicio: hora(14), fim: hora(15) },
        "O id da sala tem de ser um número inteiro positivo ou um texto.",
      );
    });
  });

  describe("nunca lança exceções", () => {
    it("quando não recebe dados", async () => {
      const { repositorio, gerarId } = preparar();
      const resultado = await reservarSala(undefined, { repositorio, gerarId });
      expect(resultado.sucesso).toBe(false);
      expect(typeof resultado.erro).toBe("string");
    });

    it.each(["listarSalas", "listarReservasDaSala", "guardarReserva"])(
      "quando o repositório falha em %s, com uma mensagem genérica",
      async (metodo) => {
        const { repositorio, gerarId } = preparar({
          falhas: { [metodo]: new Error("ligação recusada: postgres://utilizador:segredo@host") },
        });
        const resultado = await reservarSala(
          { salaId: 1, inicio: hora(14), fim: hora(15) },
          { repositorio, gerarId },
        );
        expect(resultado).toEqual({ sucesso: false, erro: MENSAGEM_ERRO_INESPERADO });
      },
    );

    it("quando não recebe repositório", async () => {
      const resultado = await reservarSala({ salaId: 1, inicio: hora(14), fim: hora(15) });
      expect(resultado).toEqual({ sucesso: false, erro: MENSAGEM_ERRO_INESPERADO });
    });

    it("quando gerar o id falha", async () => {
      const { repositorio } = preparar();
      const gerarId = () => {
        throw new Error("sem aleatoriedade");
      };
      const resultado = await reservarSala(
        { salaId: 1, inicio: hora(14), fim: hora(15) },
        { repositorio, gerarId },
      );
      expect(resultado).toEqual({ sucesso: false, erro: MENSAGEM_ERRO_INESPERADO });
    });
  });
});
