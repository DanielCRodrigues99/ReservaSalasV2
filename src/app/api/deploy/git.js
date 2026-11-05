import { execFile } from "node:child_process";

export const MENSAGEM_ENV_EM_FALTA = "Variáveis GIT_ do .env.local não configuradas";

export class ErroGit extends Error {
  constructor(stdout, stderr) {
    super("Erro ao executar git");
    this.stdout = stdout;
    this.stderr = stderr;
  }
}

export function lerConfigGit(env = process.env) {
  const { GIT_TOKEN, GIT_REPO_URL, GIT_USER_NAME, GIT_USER_EMAIL } = env;
  if (!GIT_TOKEN || !GIT_REPO_URL || !GIT_USER_NAME || !GIT_USER_EMAIL) {
    return null;
  }
  return {
    token: GIT_TOKEN,
    repoUrl: GIT_REPO_URL,
    userName: GIT_USER_NAME,
    userEmail: GIT_USER_EMAIL,
  };
}

export function tokenBase64(token) {
  return Buffer.from(`x-access-token:${token}`).toString("base64");
}

export function ocultarSegredos(texto, segredos) {
  return segredos
    .filter(Boolean)
    .reduce((resultado, segredo) => resultado.replaceAll(segredo, "***"), texto);
}

// Usa só o stdout/stderr do git: a mensagem do execFile inclui a linha de
// comando, que contém o cabeçalho com o token.
export function mensagemDeErro(erro, config) {
  const texto =
    erro instanceof ErroGit
      ? `${erro.stderr || ""}\n${erro.stdout || ""}`.trim()
      : "";
  return ocultarSegredos(texto || "Erro ao executar git", [
    config.token,
    tokenBase64(config.token),
  ]);
}

export function calcularPendente(statusPorcelain, headLocal, lsRemote) {
  if (statusPorcelain.trim() !== "") return true;
  const linhaMain = lsRemote
    .split("\n")
    .map((linha) => linha.trim().split(/\s+/))
    .find(([, ref]) => ref === "refs/heads/main");
  const headRemoto = linhaMain ? linhaMain[0] : "";
  return headRemoto !== headLocal.trim();
}

export function correrGit(args) {
  return new Promise((resolve, reject) => {
    execFile(
      "git",
      args,
      {
        cwd: process.cwd(),
        env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
        windowsHide: true,
        maxBuffer: 10 * 1024 * 1024,
      },
      (erro, stdout, stderr) => {
        if (erro) reject(new ErroGit(stdout, stderr));
        else resolve(stdout);
      },
    );
  });
}

// credential.helper vazio impede o git de usar credenciais guardadas
// ou de abrir uma janela de login.
function argsAutenticacao(config) {
  return [
    "-c",
    "credential.helper=",
    "-c",
    `http.extraHeader=Authorization: Basic ${tokenBase64(config.token)}`,
  ];
}

export async function obterPendente(config, correr = correrGit) {
  const status = await correr(["status", "--porcelain"]);
  if (status.trim() !== "") return true;
  const head = await correr(["rev-parse", "HEAD"]);
  const lsRemote = await correr([
    ...argsAutenticacao(config),
    "ls-remote",
    `https://${config.repoUrl}`,
    "main",
  ]);
  return calcularPendente(status, head, lsRemote);
}

export async function fazerCommitEPush(config, mensagem, correr = correrGit) {
  const status = await correr(["status", "--porcelain"]);
  if (status.trim() !== "") {
    await correr(["add", "-A"]);
    await correr([
      "-c",
      `user.name=${config.userName}`,
      "-c",
      `user.email=${config.userEmail}`,
      "commit",
      "-m",
      mensagem,
    ]);
  }
  await correr([
    ...argsAutenticacao(config),
    "push",
    `https://${config.repoUrl}`,
    "main",
  ]);
}
