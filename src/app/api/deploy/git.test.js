import { describe, expect, it, vi } from "vitest";
import {
  ErroGit,
  calcularPendente,
  fazerCommitEPush,
  lerConfigGit,
  mensagemDeErro,
  obterPendente,
  ocultarSegredos,
  tokenBase64,
} from "./git";

const config = {
  token: "ghp_segredo123",
  repoUrl: "github.com/utilizador/reserva-salas.git",
  userName: "Ana",
  userEmail: "ana@example.com",
};
const b64 = Buffer.from("x-access-token:ghp_segredo123").toString("base64");

describe("lerConfigGit", () => {
  it("devolve a configuração quando as 4 variáveis existem", () => {
    expect(
      lerConfigGit({
        GIT_TOKEN: "t",
        GIT_REPO_URL: "github.com/a/b.git",
        GIT_USER_NAME: "n",
        GIT_USER_EMAIL: "e@x.pt",
      }),
    ).toEqual({ token: "t", repoUrl: "github.com/a/b.git", userName: "n", userEmail: "e@x.pt" });
  });

  it("devolve null quando falta alguma variável", () => {
    expect(lerConfigGit({ GIT_TOKEN: "t", GIT_REPO_URL: "r", GIT_USER_NAME: "n" })).toBeNull();
    expect(lerConfigGit({})).toBeNull();
  });
});

describe("tokenBase64", () => {
  it("codifica x-access-token:<token> em base64", () => {
    expect(tokenBase64("ghp_segredo123")).toBe(b64);
  });
});

describe("ocultarSegredos / mensagemDeErro", () => {
  it("substitui todas as ocorrências dos segredos", () => {
    expect(ocultarSegredos("a ghp_x b ghp_x", ["ghp_x", ""])).toBe("a *** b ***");
  });

  it("não expõe o token nem o base64 na mensagem de erro", () => {
    const erro = new ErroGit("", `fatal: header Basic ${b64} token ghp_segredo123 rejeitado`);
    const mensagem = mensagemDeErro(erro, config);
    expect(mensagem).not.toContain("ghp_segredo123");
    expect(mensagem).not.toContain(b64);
    expect(mensagem).toContain("rejeitado");
  });

  it("usa uma mensagem genérica para erros que não vêm do git", () => {
    expect(mensagemDeErro(new Error(`git -c Basic ${b64}`), config)).toBe("Erro ao executar git");
  });
});

describe("calcularPendente", () => {
  const head = "abc123\n";

  it("é pendente quando há alterações por fazer commit", () => {
    expect(calcularPendente(" M src/a.js\n", head, "abc123\trefs/heads/main\n")).toBe(true);
  });

  it("é pendente quando o HEAD local difere do main remoto", () => {
    expect(calcularPendente("", head, "def456\trefs/heads/main\n")).toBe(true);
  });

  it("é pendente quando o remoto ainda não tem main", () => {
    expect(calcularPendente("", head, "")).toBe(true);
  });

  it("ignora refs que só terminam em main", () => {
    expect(calcularPendente("", head, "zzz\trefs/heads/feature/main\nabc123\trefs/heads/main\n")).toBe(false);
  });

  it("não é pendente quando está tudo sincronizado", () => {
    expect(calcularPendente("", head, "abc123\trefs/heads/main\n")).toBe(false);
  });
});

describe("obterPendente", () => {
  it("não contacta o remoto quando já há alterações locais", async () => {
    const correr = vi.fn().mockResolvedValueOnce("?? novo.js\n");
    expect(await obterPendente(config, correr)).toBe(true);
    expect(correr).toHaveBeenCalledTimes(1);
  });

  it("compara o HEAD com o ls-remote usando o token num cabeçalho", async () => {
    const correr = vi
      .fn()
      .mockResolvedValueOnce("")
      .mockResolvedValueOnce("abc123\n")
      .mockResolvedValueOnce("abc123\trefs/heads/main\n");
    expect(await obterPendente(config, correr)).toBe(false);
    const argsLsRemote = correr.mock.calls[2][0];
    expect(argsLsRemote).toContain(`http.extraHeader=Authorization: Basic ${b64}`);
    expect(argsLsRemote).toContain("https://github.com/utilizador/reserva-salas.git");
    expect(argsLsRemote.join(" ")).not.toContain("ghp_segredo123");
  });
});

describe("fazerCommitEPush", () => {
  it("faz add, commit com a mensagem como argumento separado e push", async () => {
    const correr = vi.fn().mockResolvedValueOnce(" M a.js\n").mockResolvedValue("");
    const mensagem = 'WIP"; rm -rf / #';
    await fazerCommitEPush(config, mensagem, correr);
    const chamadas = correr.mock.calls.map(([args]) => args);
    expect(chamadas[1]).toEqual(["add", "-A"]);
    expect(chamadas[2]).toEqual([
      "-c",
      "user.name=Ana",
      "-c",
      "user.email=ana@example.com",
      "commit",
      "-m",
      mensagem,
    ]);
    expect(chamadas[3].slice(-3)).toEqual([
      "push",
      "https://github.com/utilizador/reserva-salas.git",
      "main",
    ]);
  });

  it("salta o commit e só faz push quando não há alterações", async () => {
    const correr = vi.fn().mockResolvedValue("");
    await fazerCommitEPush(config, "msg", correr);
    const chamadas = correr.mock.calls.map(([args]) => args);
    expect(chamadas).toHaveLength(2);
    expect(chamadas[1]).toContain("push");
  });

  it("propaga o erro do push", async () => {
    const correr = vi
      .fn()
      .mockResolvedValueOnce("")
      .mockRejectedValueOnce(new ErroGit("", "rejected"));
    await expect(fazerCommitEPush(config, "msg", correr)).rejects.toBeInstanceOf(ErroGit);
  });
});
