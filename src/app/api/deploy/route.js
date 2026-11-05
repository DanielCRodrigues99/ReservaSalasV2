import {
  MENSAGEM_ENV_EM_FALTA,
  fazerCommitEPush,
  lerConfigGit,
  mensagemDeErro,
  obterPendente,
} from "./git";

function emDesenvolvimento() {
  return process.env.NODE_ENV === "development";
}

function naoEncontrado() {
  return new Response("Not Found", { status: 404 });
}

// Só aceita pedidos JSON vindos de uma página da própria app, para que
// outros sites abertos no browser não consigam fazer commit + push.
function pedidoDaPropriaApp(request) {
  const tipo = request.headers.get("content-type") || "";
  const origem = request.headers.get("origin");
  if (!tipo.startsWith("application/json") || !origem) return false;
  try {
    return new URL(origem).host === request.headers.get("host");
  } catch {
    return false;
  }
}

export async function GET() {
  if (!emDesenvolvimento()) return naoEncontrado();

  const config = lerConfigGit();
  if (!config) {
    return Response.json({ erro: MENSAGEM_ENV_EM_FALTA }, { status: 500 });
  }

  try {
    return Response.json({ pendente: await obterPendente(config) });
  } catch (erro) {
    return Response.json({ erro: mensagemDeErro(erro, config) }, { status: 500 });
  }
}

export async function POST(request) {
  if (!emDesenvolvimento()) return naoEncontrado();

  if (!pedidoDaPropriaApp(request)) {
    return Response.json({ erro: "Pedido não permitido" }, { status: 403 });
  }

  const config = lerConfigGit();
  if (!config) {
    return Response.json({ erro: MENSAGEM_ENV_EM_FALTA }, { status: 500 });
  }

  let mensagem;
  try {
    mensagem = String((await request.json()).mensagem ?? "").trim();
  } catch {
    mensagem = "";
  }
  if (!mensagem) {
    return Response.json({ erro: "A mensagem do commit é obrigatória" }, { status: 400 });
  }

  try {
    await fazerCommitEPush(config, mensagem);
    return Response.json({ ok: true });
  } catch (erro) {
    return Response.json({ erro: mensagemDeErro(erro, config) }, { status: 500 });
  }
}
