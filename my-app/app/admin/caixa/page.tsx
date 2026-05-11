"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

// ═══════════════════════════════════════════════════════════════
// TOUR SPOTLIGHT
// ═══════════════════════════════════════════════════════════════

const TOUR_STEPS = [
  {
    targetId: "tour-status",
    titulo: "Status do Caixa",
    descricao: "Indica se o caixa está aberto ou fechado. Quando aberto, mostra o saldo esperado em tempo real, fundo inicial e o faturamento acumulado das comandas.",
    posicao: "bottom" as const,
  },
  {
    targetId: "tour-acoes",
    titulo: "Ações do Caixa",
    descricao: "Botões para abrir um novo caixa (definindo o fundo de troco) ou encerrar o expediente. Ao fechar, o saldo final é registrado automaticamente.",
    posicao: "bottom" as const,
  },
  {
    targetId: "tour-fluxo",
    titulo: "Fluxo do Dia",
    descricao: "Mostra todas as movimentações em tempo real: serviços realizados, produtos vendidos e pagamentos recebidos. Cada entrada exibe horário, descrição, profissional e valor.",
    posicao: "top" as const,
  },
  {
    targetId: "tour-historico-btn",
    titulo: "Histórico de Expedientes",
    descricao: "Acesse o histórico dos últimos dias. Ao clicar, um painel exibe os caixas fechados com o detalhamento completo: serviços, produtos e totais de cada dia.",
    posicao: "left" as const,
  },
  {
    targetId: "tour-atualizar",
    titulo: "Atualizar Dados",
    descricao: "Clique aqui para recarregar todas as informações do caixa e movimentações em tempo real.",
    posicao: "bottom" as const,
  },
];

function useSpotlight(targetId: string | null) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  useEffect(() => {
    if (!targetId) { setRect(null); return; }
    const atualizar = () => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => setRect(el.getBoundingClientRect()), 350);
      }
    };
    atualizar();
    window.addEventListener("resize", atualizar);
    return () => window.removeEventListener("resize", atualizar);
  }, [targetId]);
  return rect;
}

interface TourProps {
  passo: number;
  onProximo: () => void;
  onAnterior: () => void;
  onFechar: () => void;
  entrando: boolean;
}

function Tour({ passo, onProximo, onAnterior, onFechar, entrando }: TourProps) {
  const step     = TOUR_STEPS[passo];
  const rect     = useSpotlight(step.targetId);
  const isUltimo = passo === TOUR_STEPS.length - 1;
  const PAD = 10;

  if (!rect) return null;

  const spotX = rect.left   - PAD;
  const spotY = rect.top    - PAD;
  const spotW = rect.width  + PAD * 2;
  const spotH = rect.height + PAD * 2;

  const BALAO_W = 300;
  const OFFSET  = 16;
  let balaoStyle: React.CSSProperties = {};

  if (step.posicao === "bottom") {
    balaoStyle = {
      top:  spotY + spotH + OFFSET,
      left: Math.min(Math.max(spotX + spotW / 2 - BALAO_W / 2, 12), window.innerWidth - BALAO_W - 12),
      width: BALAO_W,
    };
  } else if (step.posicao === "top") {
    balaoStyle = {
      bottom: window.innerHeight - spotY + OFFSET,
      left: Math.min(Math.max(spotX + spotW / 2 - BALAO_W / 2, 12), window.innerWidth - BALAO_W - 12),
      width: BALAO_W,
    };
  } else if (step.posicao === "left") {
    balaoStyle = {
      top:   Math.max(spotY + spotH / 2 - 90, 12),
      right: window.innerWidth - spotX + OFFSET,
      width: BALAO_W,
    };
  }

  return (
    <>
      <div className="fixed inset-0 z-40 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect x={spotX} y={spotY} width={spotW} height={spotH} rx="8" ry="8" fill="black" />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.78)" mask="url(#spotlight-mask)" />
          <rect x={spotX} y={spotY} width={spotW} height={spotH} rx="8" ry="8"
            fill="none" stroke="#E4B77D" strokeWidth="2" strokeDasharray="6 3">
            <animate attributeName="stroke-dashoffset" from="0" to="18" dur="1s" repeatCount="indefinite" />
          </rect>
        </svg>
      </div>

      <div className="fixed inset-0 z-40" onClick={onFechar} />

      <div
        className="fixed z-50 pointer-events-auto"
        style={{
          ...balaoStyle,
          animation: entrando ? "tourBalloonIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards" : undefined,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-zinc-900 border border-[#E4B77D]/40 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              {passo + 1} de {TOUR_STEPS.length}
            </span>
            <button onClick={onFechar} className="text-zinc-600 hover:text-zinc-300 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mx-4 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-[#E4B77D] rounded-full transition-all duration-500"
              style={{ width: `${((passo + 1) / TOUR_STEPS.length) * 100}%` }} />
          </div>

          <div className="px-4 py-4">
            <h3 className="text-sm font-bold text-[#E4B77D] mb-1">{step.titulo}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{step.descricao}</p>
          </div>

          <div className="flex items-center justify-between px-4 pb-4 gap-2">
            <button onClick={onAnterior} disabled={passo === 0}
              className="px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-400 text-xs font-bold
                hover:border-zinc-500 hover:text-white transition-colors disabled:opacity-25 disabled:cursor-not-allowed">
              ← Anterior
            </button>

            <div className="flex gap-1">
              {TOUR_STEPS.map((_, i) => (
                <div key={i} className={`rounded-full transition-all duration-300 ${
                  i === passo ? "w-4 h-1.5 bg-[#E4B77D]" : "w-1.5 h-1.5 bg-zinc-700"}`} />
              ))}
            </div>

            {isUltimo ? (
              <button onClick={onFechar}
                className="px-3 py-1.5 rounded-md bg-[#E4B77D] text-black text-xs font-bold hover:bg-[#cfa56d] transition-colors">
                Concluir ✓
              </button>
            ) : (
              <button onClick={onProximo}
                className="px-3 py-1.5 rounded-md bg-[#E4B77D] text-black text-xs font-bold hover:bg-[#cfa56d] transition-colors">
                Próximo →
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tourBalloonIn {
          0%   { opacity: 0; transform: scale(0.85) translateY(6px); }
          100% { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// ÍCONES AUXILIARES
// ═══════════════════════════════════════════════════════════════

function IconeServico() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconeProduto() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}

function IconeComanda() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function GestaoCaixa() {
  const [caixaAberto, setCaixaAberto] = useState(false);
  const [dadosCaixa, setDadosCaixa] = useState<any>(null);
  const [resumo, setResumo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Movimentações do dia (fluxo em tempo real)
  const [movimentacoes, setMovimentacoes] = useState<any[]>([]);
  const [loadingMov, setLoadingMov] = useState(false);

  // Histórico de expedientes (últimos 3 dias)
  const [historico, setHistorico] = useState<any[]>([]);
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [historicoDetalhe, setHistoricoDetalhe] = useState<any>(null);
  const [loadingHistDetalhe, setLoadingHistDetalhe] = useState(false);
  const [historicoDetalheDados, setHistoricoDetalheDados] = useState<any>(null);

  // Feedbacks
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");

  // Modais
  const [modalAbrirAberto, setModalAbrirAberto] = useState(false);
  const [modalFecharAberto, setModalFecharAberto] = useState(false);
  const [saldoInicial, setSaldoInicial] = useState("");

  // Tour
  const [tourAtivo, setTourAtivo] = useState(false);
  const [tourPasso, setTourPasso] = useState(0);
  const [tourEntrando, setTourEntrando] = useState(false);

  const obterToken = () => localStorage.getItem("token") || "";

  useEffect(() => {
    carregarDadosCaixa();
  }, []);

  // Auto-refresh a cada 30s se caixa aberto
  useEffect(() => {
    if (!caixaAberto) return;
    const interval = setInterval(() => {
      carregarMovimentacoes();
      carregarResumo();
    }, 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caixaAberto]);

  const exibirSucesso = (msg: string) => { setSucesso(msg); setTimeout(() => setSucesso(""), 3000); };
  const exibirErro    = (msg: string) => { setErro(msg);    setTimeout(() => setErro(""), 4000); };

  const carregarResumo = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/caixas/resumo`,
        { headers: { Authorization: `Bearer ${obterToken()}` } });
      if (res.ok) setResumo(await res.json());
    } catch (e) { console.error("Erro ao carregar resumo", e); }
  };

  const carregarMovimentacoes = async () => {
    setLoadingMov(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/caixas/movimentacoes`,
        { headers: { Authorization: `Bearer ${obterToken()}` } });
      if (res.ok) setMovimentacoes(await res.json());
    } catch (e) { console.error("Erro ao carregar movimentações", e); }
    finally { setLoadingMov(false); }
  };

  const carregarDadosCaixa = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${obterToken()}` };

      // 1. Status do caixa
      const resStatus = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/caixas/status`, { headers });
      const statusData = await resStatus.json();
      setCaixaAberto(statusData.aberto);
      setDadosCaixa(statusData.caixa);

      // 2. Se aberto, busca resumo + movimentações
      if (statusData.aberto) {
        const resResumo = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/caixas/resumo`, { headers });
        if (resResumo.ok) setResumo(await resResumo.json());

        const resMov = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/caixas/movimentacoes`, { headers });
        if (resMov.ok) setMovimentacoes(await resMov.json());
      }

      // 3. Histórico dos últimos 3 dias
      const resHist = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/caixas/historico?limite=3`, { headers });
      if (resHist.ok) setHistorico(await resHist.json());

    } catch (e) { console.error("Erro ao carregar dados do caixa"); }
    finally { setLoading(false); }
  };

  const abrirCaixa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/caixas/abrir`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${obterToken()}` },
        body: JSON.stringify({ saldoInicial: Number(saldoInicial.replace(",", ".")) }),
      });
      if (res.ok) {
        setModalAbrirAberto(false); setSaldoInicial("");
        carregarDadosCaixa();
        exibirSucesso("Caixa aberto com sucesso! Bom expediente.");
      } else {
        const err = await res.json();
        exibirErro(err.msg || "Erro ao abrir o caixa.");
      }
    } catch { exibirErro("Erro de conexão ao tentar abrir o caixa."); }
  };

  const confirmarFechamento = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/caixas/fechar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${obterToken()}` },
      });
      if (res.ok) {
        setModalFecharAberto(false);
        carregarDadosCaixa();
        setMovimentacoes([]);
        exibirSucesso("Caixa fechado com sucesso!");
      } else { exibirErro("Não foi possível fechar o caixa."); }
    } catch { exibirErro("Erro de conexão ao tentar fechar o caixa."); }
  };

  const carregarHistoricoDetalhe = async (caixaId: number) => {
    if (historicoDetalhe === caixaId) { setHistoricoDetalhe(null); setHistoricoDetalheDados(null); return; }
    setHistoricoDetalhe(caixaId);
    setLoadingHistDetalhe(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/caixas/historico/${caixaId}/detalhes`,
        { headers: { Authorization: `Bearer ${obterToken()}` } });
      if (res.ok) setHistoricoDetalheDados(await res.json());
      else setHistoricoDetalheDados(null);
    } catch { setHistoricoDetalheDados(null); }
    finally { setLoadingHistDetalhe(false); }
  };

  // Tour handlers
  const iniciarTour = () => {
    setTourPasso(0); setTourEntrando(true); setTourAtivo(true);
    setTimeout(() => setTourEntrando(false), 350);
  };
  const irParaPasso = useCallback((novo: number) => {
    setTourEntrando(true);
    setTimeout(() => { setTourPasso(novo); setTimeout(() => setTourEntrando(false), 50); }, 150);
  }, []);

  // Helpers
  const fmt = (v: number) =>
    Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const fmtHora = (iso: string) => {
    if (!iso) return "--:--";
    return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const fmtDataCompleta = (iso: string) => {
    if (!iso) return "--/--/----";
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  };

  // Ícone por tipo de movimentação
  const iconeMovimentacao = (tipo: string) => {
    switch (tipo) {
      case "servico":  return <div className="w-8 h-8 rounded-full bg-[#E4B77D]/10 text-[#E4B77D] flex items-center justify-center shrink-0 border border-[#E4B77D]/20"><IconeServico /></div>;
      case "produto":  return <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20"><IconeProduto /></div>;
      default:         return <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center shrink-0 border border-green-500/20"><IconeComanda /></div>;
    }
  };

  const labelTipo = (tipo: string) => {
    switch (tipo) {
      case "servico": return "Serviço";
      case "produto": return "Produto";
      default:        return "Comanda";
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#E4B77D] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 font-sans">

      {/* Tour */}
      {tourAtivo && (
        <Tour passo={tourPasso} entrando={tourEntrando}
          onProximo={() => irParaPasso(tourPasso + 1)}
          onAnterior={() => irParaPasso(tourPasso - 1)}
          onFechar={() => setTourAtivo(false)} />
      )}

      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <span className="p-2 bg-[#E4B77D]/10 rounded-lg text-[#E4B77D]">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
            Fluxo de Caixa
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Movimentações em tempo real e controle de expediente.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Ajuda / Tour */}
          <button onClick={iniciarTour}
            className="px-4 py-2 bg-zinc-800 text-[#E4B77D] font-bold rounded-md hover:bg-zinc-700
              transition-all border border-[#E4B77D]/30 hover:border-[#E4B77D]/70 flex items-center gap-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ? Ajuda
          </button>

          {/* Histórico */}
          <button id="tour-historico-btn" onClick={() => setHistoricoAberto(true)}
            className="px-4 py-2 bg-zinc-800 text-zinc-300 font-bold rounded-md hover:bg-zinc-700
              transition-all border border-zinc-700 flex items-center gap-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Histórico
          </button>

          {/* Atualizar */}
          <button id="tour-atualizar" onClick={carregarDadosCaixa}
            className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800
              transition-colors text-zinc-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <Link href="/admin" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Voltar
          </Link>
        </div>
      </header>

      {/* ── FEEDBACKS ──────────────────────────────────────── */}
      {sucesso && (
        <div className="max-w-6xl mx-auto mb-6 bg-green-950/50 border border-green-900 text-green-400 p-4 rounded-lg flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">{sucesso}</span>
        </div>
      )}
      {erro && (
        <div className="max-w-6xl mx-auto mb-6 bg-red-950/50 border border-red-900 text-red-400 p-4 rounded-lg flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="font-medium">{erro}</span>
        </div>
      )}

      <main className="max-w-6xl mx-auto">

        {/* ════════════════════════════════════════════════════
            PARTE SUPERIOR: STATUS DO CAIXA
            ════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {caixaAberto ? (
            <>
              {/* CARD: SALDO ATUAL */}
              <div id="tour-status"
                className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Saldo Final Esperado</span>
                <h2 className="text-5xl md:text-6xl font-black text-[#E4B77D] mt-2 mb-8">
                  {fmt(resumo?.saldoFinalEsperado || 0)}
                </h2>

                <div className="grid grid-cols-2 gap-8 border-t border-zinc-800 pt-8">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Fundo Inicial</p>
                    <p className="text-xl font-mono text-zinc-300">{fmt(resumo?.saldoInicial || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-500/60 uppercase font-bold mb-1">Total em Comandas</p>
                    <p className="text-xl font-mono text-emerald-400 font-bold">+ {fmt(resumo?.faturamento || 0)}</p>
                  </div>
                </div>
              </div>

              {/* CARD: STATUS + AÇÕES */}
              <div id="tour-acoes"
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-bold text-emerald-500 uppercase">Caixa Operacional</span>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Aberto às{" "}
                    <span className="text-white font-medium">
                      {resumo?.dataAbertura ? fmtHora(resumo.dataAbertura) : "--:--"}
                    </span>
                  </p>
                  <p className="text-xs text-zinc-600 mt-2">
                    {movimentacoes.length} movimentação{movimentacoes.length !== 1 ? "ões" : ""} registrada{movimentacoes.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="space-y-3 mt-8">
                  <button onClick={() => setModalFecharAberto(true)}
                    className="w-full py-4 bg-zinc-950 border border-red-900/30 text-red-500 font-bold rounded-xl
                      hover:bg-red-500 hover:text-white transition-all">
                    Encerrar Expediente
                  </button>
                  <Link href="/admin/comandas"
                    className="block text-center w-full py-3 text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
                    Ir para as Comandas →
                  </Link>
                </div>
              </div>
            </>
          ) : (
            /* CAIXA FECHADO */
            <div id="tour-status" className="col-span-full py-20 bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-center px-6">
              <div id="tour-acoes" className="flex flex-col items-center">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-600">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">O Caixa está fechado</h3>
                <p className="text-zinc-500 mt-2 max-w-sm text-sm mb-6">Abra o caixa para começar a registrar os pagamentos de hoje.</p>
                <button onClick={() => setModalAbrirAberto(true)}
                  className="px-8 py-3 bg-[#E4B77D] text-black font-bold rounded-xl hover:bg-[#cfa56d]
                    transition-all shadow-lg shadow-[#E4B77D]/10">
                  Abrir Novo Caixa
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════════
            FLUXO DO DIA — movimentações em tempo real
            ════════════════════════════════════════════════════ */}
        <div id="tour-fluxo" className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[#E4B77D]">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Fluxo do Dia
            </h3>
            {caixaAberto && (
              <button onClick={carregarMovimentacoes}
                className="text-xs text-zinc-500 hover:text-[#E4B77D] transition-colors flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Atualizar
              </button>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            {!caixaAberto ? (
              <div className="p-8 text-center text-zinc-600 text-sm italic">
                Abra o caixa para visualizar as movimentações do dia.
              </div>
            ) : movimentacoes.length === 0 ? (
              <div className="p-8 text-center text-zinc-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mx-auto mb-3 text-zinc-700">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-sm text-zinc-500">Nenhuma movimentação ainda.</p>
                <p className="text-xs text-zinc-600 mt-1">Finalize comandas para ver o fluxo aqui.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/50 max-h-[480px] overflow-y-auto">
                {movimentacoes.map((mov: any, idx: number) => (
                  <div key={mov.id || idx}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-800/20 transition-colors">

                    {/* Ícone */}
                    {iconeMovimentacao(mov.tipo)}

                    {/* Descrição */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm truncate">{mov.descricao}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border
                          ${mov.tipo === "servico"
                            ? "bg-[#E4B77D]/10 text-[#E4B77D] border-[#E4B77D]/20"
                            : mov.tipo === "produto"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              : "bg-green-500/10 text-green-400 border-green-500/20"}`}>
                          {labelTipo(mov.tipo)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        {mov.profissional && (
                          <span className="text-xs text-zinc-500">
                            por <span className="text-zinc-400">{mov.profissional}</span>
                          </span>
                        )}
                        {mov.cliente && (
                          <span className="text-xs text-zinc-600">
                            · {mov.cliente}
                          </span>
                        )}
                        {mov.quantidade && mov.quantidade > 1 && (
                          <span className="text-xs text-zinc-600">
                            · {mov.quantidade}x
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Hora */}
                    <span className="text-xs text-zinc-600 font-mono shrink-0">
                      {fmtHora(mov.dataHora)}
                    </span>

                    {/* Valor */}
                    <span className="text-sm font-bold text-emerald-400 font-mono shrink-0 w-24 text-right">
                      + {fmt(mov.valor)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Totalizador do fluxo */}
            {caixaAberto && movimentacoes.length > 0 && (
              <div className="border-t border-zinc-800 px-5 py-3 flex items-center justify-between bg-zinc-950/50">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  {movimentacoes.length} movimentação{movimentacoes.length !== 1 ? "ões" : ""}
                </span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  Total: {fmt(movimentacoes.reduce((a: number, c: any) => a + Number(c.valor || 0), 0))}
                </span>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* ════════════════════════════════════════════════════════
          DRAWER: HISTÓRICO DE EXPEDIENTES (últimos 3 dias)
          ════════════════════════════════════════════════════════ */}
      {historicoAberto && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            onClick={() => { setHistoricoAberto(false); setHistoricoDetalhe(null); setHistoricoDetalheDados(null); }} />

          {/* Painel lateral */}
          <div className="fixed top-0 right-0 z-50 h-full w-full max-w-lg bg-zinc-950 border-l border-zinc-800
            shadow-2xl overflow-y-auto animate-slide-in">
            <style>{`
              @keyframes slideIn { 0% { transform: translateX(100%); } 100% { transform: translateX(0); } }
              .animate-slide-in { animation: slideIn 0.3s ease-out forwards; }
            `}</style>

            {/* Header do painel */}
            <div className="sticky top-0 z-10 bg-zinc-950 border-b border-zinc-800 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[#E4B77D]">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Histórico de Expedientes
                </h2>
                <p className="text-xs text-zinc-500 mt-1">Últimos 3 caixas fechados — clique para detalhar</p>
              </div>
              <button onClick={() => { setHistoricoAberto(false); setHistoricoDetalhe(null); setHistoricoDetalheDados(null); }}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Lista de expedientes */}
            <div className="p-6 space-y-4">
              {historico.length === 0 ? (
                <div className="text-center py-12 text-zinc-600">
                  <p className="text-sm">Nenhum expediente registrado ainda.</p>
                </div>
              ) : (
                historico.map((hist: any) => (
                  <div key={hist.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    {/* Resumo do dia */}
                    <button onClick={() => carregarHistoricoDetalhe(hist.id)}
                      className="w-full text-left p-5 hover:bg-zinc-800/30 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-white">
                          {hist.dataFechamento
                            ? fmtDataCompleta(hist.dataFechamento)
                            : "Data não disponível"}
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                          className={`text-[#E4B77D] transition-transform duration-200 ${historicoDetalhe === hist.id ? "rotate-180" : ""}`}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <span className="text-[10px] text-zinc-600 uppercase font-bold">Fundo</span>
                          <p className="text-sm font-mono text-zinc-400">{fmt(hist.saldoInicial)}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-600 uppercase font-bold">Faturamento</span>
                          <p className="text-sm font-mono text-emerald-400 font-medium">+ {fmt(hist.faturamento)}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-[#E4B77D]/60 uppercase font-bold">Saldo Final</span>
                          <p className="text-sm font-mono text-[#E4B77D] font-bold">{fmt(hist.saldoFinal)}</p>
                        </div>
                      </div>
                    </button>

                    {/* Detalhe expandido */}
                    {historicoDetalhe === hist.id && (
                      <div className="border-t border-zinc-800 px-5 py-4 bg-zinc-950">
                        {loadingHistDetalhe ? (
                          <div className="flex items-center justify-center py-6">
                            <div className="w-5 h-5 border-2 border-[#E4B77D] border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : !historicoDetalheDados ? (
                          <p className="text-xs text-zinc-600 italic text-center py-4">Detalhes não disponíveis.</p>
                        ) : (
                          <div className="space-y-4">
                            {/* Serviços do dia */}
                            {historicoDetalheDados.servicos && historicoDetalheDados.servicos.length > 0 && (
                              <div>
                                <p className="text-[10px] font-bold text-[#E4B77D] uppercase tracking-widest mb-2 flex items-center gap-1">
                                  <IconeServico /> Serviços Realizados
                                </p>
                                <div className="space-y-1.5">
                                  {historicoDetalheDados.servicos.map((s: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                      <div>
                                        <span className="text-zinc-300">{s.nome}</span>
                                        {s.profissional && (
                                          <span className="text-xs text-zinc-600 ml-2">por {s.profissional}</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="text-xs text-zinc-500">{s.quantidade}x</span>
                                        <span className="font-mono text-emerald-400 text-xs font-bold">{fmt(s.valor)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Produtos do dia */}
                            {historicoDetalheDados.produtos && historicoDetalheDados.produtos.length > 0 && (
                              <div>
                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                  <IconeProduto /> Produtos Vendidos
                                </p>
                                <div className="space-y-1.5">
                                  {historicoDetalheDados.produtos.map((p: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                      <span className="text-zinc-300">{p.nome}</span>
                                      <div className="flex items-center gap-3">
                                        <span className="text-xs text-zinc-500">{p.quantidade}x</span>
                                        <span className="font-mono text-emerald-400 text-xs font-bold">{fmt(p.valor)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Sem detalhes */}
                            {(!historicoDetalheDados.servicos || historicoDetalheDados.servicos.length === 0) &&
                             (!historicoDetalheDados.produtos || historicoDetalheDados.produtos.length === 0) && (
                              <p className="text-xs text-zinc-600 italic text-center py-2">
                                Sem detalhes disponíveis para este expediente.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════
          MODAL: ABRIR CAIXA
          ════════════════════════════════════════════════════════ */}
      {modalAbrirAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">Abertura de Caixa</h2>
            <p className="text-zinc-400 mb-8 text-sm">Confirme o valor em dinheiro disponível para troco na gaveta.</p>
            <form onSubmit={abrirCaixa} className="space-y-6">
              <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                  Saldo Inicial em Espécie
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-[#E4B77D]">R$</span>
                  <input type="number" step="0.01" required autoFocus value={saldoInicial}
                    onChange={(e) => setSaldoInicial(e.target.value)}
                    className="bg-transparent text-4xl font-black text-white outline-none w-full"
                    placeholder="0.00" />
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setModalAbrirAberto(false)}
                  className="flex-1 py-4 text-zinc-500 font-bold hover:text-white transition-colors">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-[2] py-4 bg-[#E4B77D] text-black font-black rounded-2xl hover:bg-[#cfa56d] transition-all">
                  Abrir Caixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          MODAL: FECHAR CAIXA
          ════════════════════════════════════════════════════════ */}
      {modalFecharAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl w-full max-w-md shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Fechar Expediente?</h2>
            <p className="text-zinc-400 text-sm mb-8">
              O saldo final de <strong className="text-white">{fmt(resumo?.saldoFinalEsperado || 0)}</strong> será
              registrado e o caixa será encerrado.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmarFechamento}
                className="w-full py-4 bg-red-500 text-white font-black rounded-2xl hover:bg-red-600 transition-all">
                Confirmar Fechamento
              </button>
              <button onClick={() => setModalFecharAberto(false)}
                className="w-full py-4 text-zinc-500 font-bold hover:text-white transition-colors">
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}