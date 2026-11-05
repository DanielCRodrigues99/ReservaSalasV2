"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

const TAMANHO = 96;
const MARGEM = 24;
const LIMIAR_ARRASTO = 5;
const INTERVALO_ESTADO = 15000;
const CHAVE_POSICAO = "deployWidget.posicao";

function limitar({ x, y }) {
  return {
    x: Math.min(Math.max(0, x), window.innerWidth - TAMANHO),
    y: Math.min(Math.max(0, y), window.innerHeight - TAMANHO),
  };
}

function posicaoInicial() {
  try {
    const guardada = JSON.parse(localStorage.getItem(CHAVE_POSICAO));
    if (Number.isFinite(guardada?.x) && Number.isFinite(guardada?.y)) {
      return limitar(guardada);
    }
  } catch {
    // localStorage indisponível ou valor inválido: usa a posição por omissão
  }
  return limitar({
    x: window.innerWidth - TAMANHO - MARGEM,
    y: window.innerHeight - TAMANHO - MARGEM,
  });
}

function guardarPosicao(posicao) {
  try {
    localStorage.setItem(CHAVE_POSICAO, JSON.stringify(posicao));
  } catch {
    // sem localStorage a posição só não persiste
  }
}

async function pedirEstado() {
  try {
    const resposta = await fetch("/api/deploy", { cache: "no-store" });
    const dados = await resposta.json().catch(() => ({}));
    if (resposta.ok) return { pendente: dados.pendente, erro: "" };
    return { pendente: null, erro: dados.erro || `Erro ${resposta.status}` };
  } catch {
    return { pendente: null, erro: "Sem ligação ao servidor" };
  }
}

// Abre o painel para o lado do ecrã onde há mais espaço.
function ladoDoPainel({ x, y }) {
  return {
    cima: y + TAMANHO / 2 > window.innerHeight / 2,
    esquerda: x + TAMANHO / 2 > window.innerWidth / 2,
  };
}

function Widget() {
  const idMensagem = useId();
  const contentorRef = useRef(null);
  const posicaoRef = useRef(null);
  const arrastoRef = useRef(null);
  const arrastouRef = useRef(false);

  const [painelAberto, setPainelAberto] = useState(false);
  const [lado, setLado] = useState({ cima: true, esquerda: true });
  const [pendente, setPendente] = useState(null);
  const [erroEstado, setErroEstado] = useState("");
  const [mensagem, setMensagem] = useState("WIP: sessão em curso");
  const [envio, setEnvio] = useState({ estado: "parado", erro: "" });

  // A posição é aplicada diretamente ao DOM para o arrasto ser fluido.
  const moverPara = useCallback((posicao) => {
    posicaoRef.current = posicao;
    const contentor = contentorRef.current;
    contentor.style.transform = `translate(${posicao.x}px, ${posicao.y}px)`;
    contentor.style.visibility = "visible";
  }, []);

  const consultarEstado = useCallback(
    () =>
      pedirEstado().then(({ pendente, erro }) => {
        setPendente(pendente);
        setErroEstado(erro);
      }),
    [],
  );

  useEffect(() => {
    moverPara(posicaoInicial());
    const aoRedimensionar = () => moverPara(limitar(posicaoRef.current));
    window.addEventListener("resize", aoRedimensionar);
    return () => window.removeEventListener("resize", aoRedimensionar);
  }, [moverPara]);

  useEffect(() => {
    consultarEstado();
    const intervalo = setInterval(consultarEstado, INTERVALO_ESTADO);
    return () => clearInterval(intervalo);
  }, [consultarEstado]);

  function aoPressionar(evento) {
    if (evento.button !== 0) return;
    evento.currentTarget.setPointerCapture(evento.pointerId);
    arrastoRef.current = {
      inicioX: evento.clientX,
      inicioY: evento.clientY,
      origem: posicaoRef.current,
      moveu: false,
    };
  }

  function aoMover(evento) {
    const arrasto = arrastoRef.current;
    if (!arrasto) return;
    const dx = evento.clientX - arrasto.inicioX;
    const dy = evento.clientY - arrasto.inicioY;
    if (!arrasto.moveu && Math.hypot(dx, dy) < LIMIAR_ARRASTO) return;
    arrasto.moveu = true;
    moverPara(limitar({ x: arrasto.origem.x + dx, y: arrasto.origem.y + dy }));
  }

  function aoLargar() {
    const arrasto = arrastoRef.current;
    arrastoRef.current = null;
    if (!arrasto?.moveu) return;
    arrastouRef.current = true;
    guardarPosicao(posicaoRef.current);
    setLado(ladoDoPainel(posicaoRef.current));
  }

  function aoClicar() {
    // O click que termina um arrasto não abre o painel.
    if (arrastouRef.current) {
      arrastouRef.current = false;
      return;
    }
    setLado(ladoDoPainel(posicaoRef.current));
    setPainelAberto((aberto) => !aberto);
  }

  async function commitEPush() {
    setEnvio({ estado: "a correr", erro: "" });
    try {
      const resposta = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem }),
      });
      const dados = await resposta.json().catch(() => ({}));
      if (resposta.ok) {
        setEnvio({ estado: "sucesso", erro: "" });
      } else {
        setEnvio({ estado: "erro", erro: dados.erro || `Erro ${resposta.status}` });
      }
    } catch {
      setEnvio({ estado: "erro", erro: "Sem ligação ao servidor" });
    }
    consultarEstado();
  }

  const aCorrer = envio.estado === "a correr";

  return (
    <div
      ref={contentorRef}
      className="fixed left-0 top-0 z-[9999]"
      style={{ visibility: "hidden" }}
    >
      <button
        type="button"
        onPointerDown={aoPressionar}
        onPointerMove={aoMover}
        onPointerUp={aoLargar}
        onPointerCancel={() => (arrastoRef.current = null)}
        onClick={aoClicar}
        aria-expanded={painelAberto}
        title={erroEstado || undefined}
        style={{ width: TAMANHO, height: TAMANHO }}
        className={`relative flex cursor-grab touch-none select-none items-center justify-center rounded-full px-2 text-center text-sm font-semibold leading-tight text-white shadow-lg active:cursor-grabbing ${
          pendente === false ? "bg-green-600" : "bg-gray-500"
        }`}
      >
        Deploy ONLINE
        {pendente === true && (
          <span className="absolute right-3 top-3 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
          </span>
        )}
      </button>

      {painelAberto && (
        <div
          className={`absolute w-72 rounded-lg bg-white p-4 text-gray-900 shadow-xl ${
            lado.cima ? "bottom-full mb-3" : "top-full mt-3"
          } ${lado.esquerda ? "right-0" : "left-0"}`}
        >
          <label htmlFor={idMensagem} className="block text-xs font-medium text-gray-600">
            Mensagem do commit
          </label>
          <input
            id={idMensagem}
            type="text"
            value={mensagem}
            onChange={(evento) => setMensagem(evento.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
          />
          <button
            type="button"
            onClick={commitEPush}
            disabled={aCorrer || !mensagem.trim()}
            className="mt-3 w-full rounded bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
          >
            Commit + Push
          </button>
          <p
            role="status"
            className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words text-xs"
          >
            {envio.estado === "a correr" && <span className="text-gray-600">A correr…</span>}
            {envio.estado === "sucesso" && <span className="text-green-700">Sucesso</span>}
            {envio.estado === "erro" && <span className="text-red-600">Erro: {envio.erro}</span>}
          </p>
          {erroEstado && (
            <p className="mt-1 whitespace-pre-wrap break-words text-xs text-red-600">
              Estado: {erroEstado}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function DeployWidget() {
  if (process.env.NODE_ENV !== "development") return null;
  return <Widget />;
}
