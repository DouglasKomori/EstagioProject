"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";

const INTERVALOS = [
  { label: "Hoje",     dias:   0 },
  { label: "7 dias",   dias:   7 },
  { label: "30 dias",  dias:  30 },
  { label: "Este mês", dias:  -1 },
  { label: "3 meses",  dias:  90 },
  { label: "6 meses",  dias: 180 },
  { label: "Este ano", dias:  -2 },
];

function calcularIntervalo(dias: number): { inicio: string; fim: string } {
  const hoje = new Date();
  const fim  = hoje.toISOString().split("T")[0];
  if (dias === 0)  return { inicio: fim, fim };
  if (dias === -1) return { inicio: new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split("T")[0], fim };
  if (dias === -2) return { inicio: new Date(hoje.getFullYear(), 0, 1).toISOString().split("T")[0], fim };
  return { inicio: new Date(hoje.getTime() - dias * 86400000).toISOString().split("T")[0], fim };
}

// ── Passos do tour ─
const TOUR_STEPS = [
  {
    targetId: "tour-intervalos",
    titulo: "Intervalo de Tempo",
    descricao: "Clique em um atalho para definir o período de análise rapidamente. As datas são preenchidas automaticamente.",
    posicao: "bottom" as const,
  },
  {
    targetId: "tour-datas",
    titulo: "Datas de Início e Fim",
    descricao: "Prefere um período personalizado? Edite as datas manualmente. O atalho ativo é desmarcado automaticamente.",
    posicao: "bottom" as const,
  },
  {
    targetId: "tour-profissional",
    titulo: "Filtro por Profissional",
    descricao: "Selecione um barbeiro específico para ver apenas os serviços realizados por ele, ou deixe em \"Todos\" para a visão geral.",
    posicao: "bottom" as const,
  },
  {
    targetId: "tour-ordenacao",
    titulo: "Ordenar por",
    descricao: "Escolha como os serviços serão exibidos: por quantidade realizada, maior receita gerada ou em ordem alfabética.",
    posicao: "bottom" as const,
  },
  {
    targetId: "tour-buscar",
    titulo: "Botão Buscar",
    descricao: "Após configurar os filtros, clique aqui para carregar o relatório. Os dados são atualizados em tempo real.",
    posicao: "left" as const,
  },
  {
    targetId: "tour-kpis",
    titulo: "Cards de Resumo",
    descricao: "Três indicadores do período: execuções totais, receita arrecadada e clientes únicos atendidos.",
    posicao: "bottom" as const,
  },
  {
    targetId: "tour-tabela",
    titulo: "Tabela de Serviços",
    descricao: "Lista os serviços com frequência e receita. A barra de Volume mostra a proporção de cada um. Clique em uma linha para ver o detalhamento por profissional.",
    posicao: "top" as const,
  },
  {
    targetId: "tour-imprimir",
    titulo: "Imprimir PDF",
    descricao: "Gera uma versão limpa do relatório para impressão. Filtros e controles são ocultados automaticamente.",
    posicao: "left" as const,
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

// ── Componente do Tour ─
interface TourProps {
  passo: number;
  onProximo: () => void;
  onAnterior: () => void;
  onFechar: () => void;
  entrando: boolean;
}

function Tour({ passo, onProximo, onAnterior, onFechar, entrando }: TourProps) {
  const step    = TOUR_STEPS[passo];
  const rect    = useSpotlight(step.targetId);
  const isUltimo = passo === TOUR_STEPS.length - 1;
  const PAD = 10;

  if (!rect) return null;

  const spotX = rect.left   - PAD;
  const spotY = rect.top    - PAD;
  const spotW = rect.width  + PAD * 2;
  const spotH = rect.height + PAD * 2;

  const BALAO_W = 300;
  const BALAO_OFFSET = 16;
  let balaoStyle: React.CSSProperties = {};

  if (step.posicao === "bottom") {
    balaoStyle = {
      top:  Math.min(spotY + spotH + BALAO_OFFSET, window.innerHeight - 190),
      left: Math.min(
        Math.max(spotX + spotW / 2 - BALAO_W / 2, 12),
        window.innerWidth - BALAO_W - 12
      ),
      width: BALAO_W,
    };
  } else if (step.posicao === "top") {
    balaoStyle = {
      bottom: Math.min(window.innerHeight - spotY + BALAO_OFFSET, window.innerHeight - 190),
      left: Math.min(
        Math.max(spotX + spotW / 2 - BALAO_W / 2, 12),
        window.innerWidth - BALAO_W - 12
      ),
      width: BALAO_W,
    };
  } else if (step.posicao === "left") {
    balaoStyle = {
      top:   Math.max(spotY + spotH / 2 - 80, 12),
      right: window.innerWidth - spotX + BALAO_OFFSET,
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
              <rect
                x={spotX} y={spotY} width={spotW} height={spotH}
                rx="8" ry="8" fill="black"
              />
            </mask>
          </defs>
          <rect
            width="100%" height="100%"
            fill="rgba(0,0,0,0.75)"
            mask="url(#spotlight-mask)"
          />
          <rect
            x={spotX} y={spotY} width={spotW} height={spotH}
            rx="8" ry="8"
            fill="none"
            stroke="#E4B77D"
            strokeWidth="2"
            strokeDasharray="6 3"
          >
            <animate attributeName="stroke-dashoffset" from="0" to="18"
              dur="1s" repeatCount="indefinite" />
          </rect>
        </svg>
      </div>

      <div className="fixed inset-0 z-40" onClick={onFechar} />

      <div
        className="fixed z-50 pointer-events-auto"
        style={{
          ...balaoStyle,
          animation: entrando
            ? "tourBalloonIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards"
            : undefined,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-zinc-900 border border-[#E4B77D]/40 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              {passo + 1} de {TOUR_STEPS.length}
            </span>
            <button onClick={onFechar}
              className="text-zinc-600 hover:text-zinc-300 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mx-4 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E4B77D] rounded-full transition-all duration-500"
              style={{ width: `${((passo + 1) / TOUR_STEPS.length) * 100}%` }}
            />
          </div>

          <div className="px-4 py-4">
            <h3 className="text-sm font-bold text-[#E4B77D] mb-1">{step.titulo}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{step.descricao}</p>
          </div>

          <div className="flex items-center justify-between px-4 pb-4 gap-2">
            <button
              onClick={onAnterior}
              disabled={passo === 0}
              className="px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-400 text-xs font-bold
                hover:border-zinc-500 hover:text-white transition-colors disabled:opacity-25 disabled:cursor-not-allowed">
              ← Anterior
            </button>

            <div className="flex gap-1">
              {TOUR_STEPS.map((_, i) => (
                <div key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === passo
                      ? "w-4 h-1.5 bg-[#E4B77D]"
                      : "w-1.5 h-1.5 bg-zinc-700"}`}
                />
              ))}
            </div>

            {isUltimo ? (
              <button onClick={onFechar}
                className="px-3 py-1.5 rounded-md bg-[#E4B77D] text-black text-xs font-bold
                  hover:bg-[#cfa56d] transition-colors">
                Concluir ✓
              </button>
            ) : (
              <button onClick={onProximo}
                className="px-3 py-1.5 rounded-md bg-[#E4B77D] text-black text-xs font-bold
                  hover:bg-[#cfa56d] transition-colors">
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

// ── Componente principal ──────────────────────────────────────
export default function RelatorioServicos() {
  const [relatorio,     setRelatorio]     = useState<any[]>([]);
  const [kpis,          setKpis]          = useState<any>(null);
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [loading,        setLoading]        = useState(false);
  const [loadingDetalhe, setLoadingDetalhe] = useState(false);
  const [erro,          setErro]          = useState("");
  const [expandido,     setExpandido]     = useState<number | null>(null);
  const [detalhes,      setDetalhes]      = useState<Record<number, any[]>>({});
  const [intervaloAtivo, setIntervaloAtivo] = useState("Este mês");

  // Tour
  const [tourAtivo,   setTourAtivo]   = useState(false);
  const [tourPasso,   setTourPasso]   = useState(0);
  const [tourEntrando, setTourEntrando] = useState(false);

  const dataHoje       = new Date();
  const primeiroDiaMes = new Date(dataHoje.getFullYear(), dataHoje.getMonth(), 1).toISOString().split("T")[0];
  const hojeString     = dataHoje.toISOString().split("T")[0];

  const [filtroDataInicio,   setFiltroDataInicio]   = useState(primeiroDiaMes);
  const [filtroDataFim,      setFiltroDataFim]      = useState(hojeString);
  const [filtroProfissional, setFiltroProfissional] = useState("");
  const [filtroOrdem,        setFiltroOrdem]        = useState("frequencia");

  const obterToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  useEffect(() => {
    carregarProfissionais();
    buscarRelatorio(primeiroDiaMes, hojeString, "", "frequencia");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarProfissionais = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/servicos/relatorio/profissionais`,
        { headers: { Authorization: `Bearer ${obterToken()}` } }
      );
      if (res.ok) setProfissionais(await res.json());
    } catch (e) { console.error(e); }
  };

  const buscarRelatorio = async (
    inicio = filtroDataInicio, fim = filtroDataFim,
    profId = filtroProfissional, ordem = filtroOrdem
  ) => {
    setLoading(true); setErro(""); setRelatorio([]); setKpis(null);
    setExpandido(null); setDetalhes({});
    try {
      const params = new URLSearchParams();
      if (inicio) params.append("dataInicio",     inicio);
      if (fim)    params.append("dataFim",        fim);
      if (profId) params.append("profissionalId", profId);
      if (ordem)  params.append("ordenacao",      ordem);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/servicos/relatorio?${params}`,
        { headers: { Authorization: `Bearer ${obterToken()}` } }
      );
      if (res.ok) {
        const d = await res.json();
        setRelatorio(d.servicos || []); setKpis(d.kpis || null);
      } else { const e = await res.json(); setErro(e.msg || "Erro ao buscar relatório."); }
    } catch { setErro("Erro de conexão."); }
    finally  { setLoading(false); }
  };

  const toggleDetalhe = async (servicoId: number) => {
    if (expandido === servicoId) { setExpandido(null); return; }
    setExpandido(servicoId);
    if (detalhes[servicoId]) return;
    setLoadingDetalhe(true);
    try {
      const params = new URLSearchParams();
      if (filtroDataInicio) params.append("dataInicio", filtroDataInicio);
      if (filtroDataFim)    params.append("dataFim",    filtroDataFim);
      const res  = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/servicos/relatorio/detalhe/${servicoId}?${params}`,
        { headers: { Authorization: `Bearer ${obterToken()}` } }
      );
      const dados = res.ok ? await res.json() : [];
      setDetalhes((d) => ({ ...d, [servicoId]: dados }));
    } catch { setDetalhes((d) => ({ ...d, [servicoId]: [] })); }
    finally  { setLoadingDetalhe(false); }
  };

  const aplicarIntervalo = (label: string, dias: number) => {
    const { inicio, fim } = calcularIntervalo(dias);
    setFiltroDataInicio(inicio); setFiltroDataFim(fim); setIntervaloAtivo(label);
  };

  const handleDataChange = (campo: "inicio" | "fim", valor: string) => {
    setIntervaloAtivo("");
    campo === "inicio" ? setFiltroDataInicio(valor) : setFiltroDataFim(valor);
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    if (filtroDataInicio && filtroDataFim && filtroDataInicio > filtroDataFim) {
      setErro("A Data Início não pode ser maior que a Data Fim."); return;
    }
    buscarRelatorio();
  };

  // Tour handlers
  const iniciarTour = () => {
    setTourPasso(0); setTourEntrando(true); setTourAtivo(true);
    setTimeout(() => setTourEntrando(false), 350);
  };

  const irParaPasso = useCallback((novoPasso: number) => {
    setTourEntrando(true);
    setTimeout(() => {
      setTourPasso(novoPasso);
      setTimeout(() => setTourEntrando(false), 50);
    }, 150);
  }, []);

  const fmt = (v: number) =>
    Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const fmtData = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString("pt-BR") : "--/--/----";

  const totalExecucoes = relatorio.reduce((a, c) => a + Number(c.frequencia   || 0), 0);
  const totalReceita   = relatorio.reduce((a, c) => a + Number(c.receitaTotal || 0), 0);
  const maxFreq        = relatorio.length ? Math.max(...relatorio.map((s) => Number(s.frequencia))) : 1;

  const posicaoBadge = (idx: number) => (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border
      ${idx === 0 ? "bg-[#E4B77D]/15 text-[#E4B77D] border-[#E4B77D]/30"
                  : "bg-transparent text-zinc-600 border-zinc-800"}`}>
      {idx + 1}
    </span>
  );

  return (
    <>
      {/* ════════════════════════════════════════════════════════
          ESTILOS DE IMPRESSÃO — fundo branco, econômico, limpo
          (padrão idêntico ao relatório de produtos)
          ════════════════════════════════════════════════════════ */}
      <style>{`
        @media print {
          /* Força fundo branco e texto preto em TUDO */
          *, *::before, *::after {
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            text-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Oculta elementos de tela */
          header, section, nav,
          .print-hide { display: none !important; }

          /* Remove container visual da tabela */
          main {
            border: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Tabela limpa com bordas finas */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 12px !important;
          }
          th {
            background: #f5f5f5 !important;
            color: #000 !important;
            border: 1px solid #bbb !important;
            padding: 7px 10px !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            font-size: 10px !important;
            letter-spacing: 0.05em !important;
          }
          td {
            border: 1px solid #ccc !important;
            padding: 7px 10px !important;
            color: #000 !important;
          }
          /* Linhas alternadas para legibilidade */
          tbody tr:nth-child(even) td {
            background: #fafafa !important;
          }

          /* Badges: apenas texto com borda neutra */
          .freq-badge,
          .posicao-badge {
            background: transparent !important;
            border: 1px solid #999 !important;
            color: #000 !important;
            padding: 2px 8px !important;
            border-radius: 999px !important;
            font-weight: 700 !important;
          }

          /* Oculta coluna volume e detalhe na impressão */
          .col-volume,
          .col-detalhe { display: none !important; }

          /* Oculta linha de detalhe expandida */
          .detalhe-row { display: none !important; }

          /* Cabeçalho de impressão */
          .print-header { display: block !important; }
        }
      `}</style>

      <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 font-sans">

        {/* Tour spotlight */}
        {tourAtivo && (
          <Tour
            passo={tourPasso}
            entrando={tourEntrando}
            onProximo={() => irParaPasso(tourPasso + 1)}
            onAnterior={() => irParaPasso(tourPasso - 1)}
            onFechar={() => setTourAtivo(false)}
          />
        )}

        {/* ── CABEÇALHO DE IMPRESSÃO ─────────────────────────── */}
        <div className="print-header hidden mb-8 pb-6 border-b-2 border-black text-center">
          <h1 className="text-2xl font-black uppercase tracking-widest">Barbearia Victor Uematsu</h1>
          <h2 className="text-lg font-bold mt-1">Relatório de Serviços</h2>
          <p className="text-sm mt-2 text-gray-600">
            Período: {fmtData(`${filtroDataInicio}T00:00:00`)} até {fmtData(`${filtroDataFim}T00:00:00`)}
            {filtroProfissional && profissionais.find(p => p.id == Number(filtroProfissional))
              ? ` · ${profissionais.find(p => p.id == Number(filtroProfissional))?.nome}`
              : " · Todos os profissionais"}
          </p>
          <p className="text-xs mt-1 text-gray-400">
            Impresso em {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR")}
          </p>
          <div className="flex justify-center gap-10 mt-4 pt-4 border-t border-gray-300">
            <div>
              <span className="text-xs text-gray-500 uppercase">Total de Execuções</span><br />
              <strong className="text-xl">{totalExecucoes}</strong>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase">Receita Total</span><br />
              <strong className="text-xl">{fmt(totalReceita)}</strong>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase">Serviços listados</span><br />
              <strong className="text-xl">{relatorio.length}</strong>
            </div>
          </div>
        </div>

        {/* ── HEADER TELA ────────────────────────────────────── */}
        <header className="print-hide flex flex-col md:flex-row md:justify-between items-center mb-6 border-b border-zinc-900 pb-4 max-w-6xl mx-auto gap-4 md:gap-0">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="w-12 h-12 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-[#E4B77D] transition-colors shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#E4B77D] flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Relatório de Serviços
              </h1>
              <p className="text-sm text-zinc-400 mt-1">Frequência e receita por serviço prestado.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button id="tour-ajuda" onClick={iniciarTour}
              className="px-4 py-2 bg-zinc-800 text-[#E4B77D] font-bold rounded-md hover:bg-zinc-700
                transition-all border border-[#E4B77D]/30 hover:border-[#E4B77D]/70 flex items-center gap-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ? Ajuda
            </button>

            <button id="tour-imprimir" onClick={() => window.print()}
              className="px-6 py-2 bg-zinc-800 text-white font-bold rounded-md hover:bg-zinc-700
                transition-colors border border-zinc-700 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir PDF
            </button>
          </div>
        </header>

        {/* ── FILTROS ──────────────────────────────────────────── */}
        <section className="print-hide max-w-6xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg mb-8">

          <div id="tour-intervalos" className="mb-5">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Intervalo de tempo</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {INTERVALOS.map(({ label, dias }) => (
                <button key={label} type="button" onClick={() => aplicarIntervalo(label, dias)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-colors
                    ${intervaloAtivo === label
                      ? "bg-[#E4B77D] text-black border-[#E4B77D]"
                      : "bg-zinc-950 text-zinc-400 border-zinc-700 hover:border-[#E4B77D] hover:text-[#E4B77D]"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleBuscar} className="flex flex-wrap gap-4 items-end">

            <div id="tour-datas" className="flex gap-4 flex-1 min-w-[280px]">
              <div className="flex-1 min-w-[130px]">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Início</label>
                <input type="date" value={filtroDataInicio}
                  onChange={(e) => handleDataChange("inicio", e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white focus:border-[#E4B77D] outline-none" />
              </div>
              <div className="flex-1 min-w-[130px]">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Fim</label>
                <input type="date" value={filtroDataFim}
                  onChange={(e) => handleDataChange("fim", e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white focus:border-[#E4B77D] outline-none" />
              </div>
            </div>

            <div id="tour-profissional" className="flex-1 min-w-[180px]">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Profissional</label>
              <select value={filtroProfissional} onChange={(e) => setFiltroProfissional(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white focus:border-[#E4B77D] outline-none">
                <option value="">Todos os Profissionais</option>
                {profissionais.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>

            <div id="tour-ordenacao" className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Ordenar por</label>
              <select value={filtroOrdem} onChange={(e) => setFiltroOrdem(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white focus:border-[#E4B77D] outline-none">
                <option value="frequencia">Mais Frequente (Qtd)</option>
                <option value="receita">Maior Receita (R$)</option>
                <option value="nome">Ordem Alfabética</option>
              </select>
            </div>

            <button id="tour-buscar" type="submit" disabled={loading}
              className="px-8 py-3 bg-[#E4B77D] text-black font-bold rounded-md hover:bg-[#cfa56d] transition-colors h-[50px] min-w-[120px] flex items-center justify-center">
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg"
                  fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : "Buscar"}
            </button>
          </form>
        </section>

        {/* ── KPIs ──────────────────────────────────────────────── */}
        <div
          id="tour-kpis"
          className={`print-hide max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-6
            transition-all duration-300
            ${!loading && kpis ? "opacity-100" : "opacity-0 pointer-events-none h-20"}`}
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-11 h-11 bg-[#E4B77D]/10 text-[#E4B77D] rounded-full flex items-center justify-center border border-[#E4B77D]/20 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <span className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">Total de Execuções</span>
              <strong className="text-2xl text-white">{Number(kpis?.totalExecucoes || 0).toLocaleString("pt-BR")}</strong>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-11 h-11 bg-green-950/30 text-green-500 rounded-full flex items-center justify-center border border-green-900/50 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">Receita Total</span>
              <strong className="text-xl text-green-400">{fmt(kpis?.receitaTotal)}</strong>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-11 h-11 bg-blue-950/30 text-blue-400 rounded-full flex items-center justify-center border border-blue-900/50 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <span className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">Clientes Atendidos</span>
              <strong className="text-2xl text-blue-400">{Number(kpis?.totalClientesAtendidos || 0).toLocaleString("pt-BR")}</strong>
            </div>
          </div>
        </div>

        {/* ── ERRO ─────────────────────────────────────────────── */}
        {erro && (
          <div className="print-hide max-w-6xl mx-auto mb-6 bg-red-950/30 border border-red-900 text-red-400 p-4 rounded-lg text-center">
            {erro}
          </div>
        )}

        {/* ── TABELA ───────────────────────────────────────────── */}
        <main id="tour-tabela" className="max-w-6xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-widest">
                  <th className="p-4 font-bold w-12">#</th>
                  <th className="p-4 font-bold border-r border-zinc-800/50">Serviço</th>
                  <th className="p-4 font-bold border-r border-zinc-800/50 text-center w-36">Frequência</th>
                  <th className="p-4 font-bold border-r border-zinc-800/50 col-volume w-48">Volume</th>
                  <th className="p-4 font-bold text-right w-40">Receita Total</th>
                  <th className="p-4 font-bold col-detalhe text-center w-24">Detalhe</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-zinc-800">

                {relatorio.length === 0 && !loading && !erro && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500 italic">
                      Nenhum serviço encontrado para os filtros informados.
                    </td>
                  </tr>
                )}

                {relatorio.map((item, idx) => (
                  <React.Fragment key={item.servicoId}>
                    <tr onClick={() => toggleDetalhe(item.servicoId)}
                      className="hover:bg-zinc-800/30 transition-colors cursor-pointer">
                      <td className="p-4 text-center">{posicaoBadge(idx)}</td>
                      <td className="p-4 border-r border-zinc-800/50">
                        <div className="font-bold text-white text-base">{item.servicoNome}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">Preço base: {fmt(item.precoBase)}</div>
                      </td>
                      <td className="p-4 border-r border-zinc-800/50 text-center">
                        <span className="freq-badge inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold bg-[#E4B77D]/10 text-[#E4B77D] border border-[#E4B77D]/20">
                          {item.frequencia}x
                        </span>
                      </td>
                      <td className="p-4 border-r border-zinc-800/50 col-volume">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-[#E4B77D] rounded-full transition-all duration-500"
                              style={{ width: `${(Number(item.frequencia) / maxFreq) * 100}%` }} />
                          </div>
                          <span className="text-xs text-zinc-500 w-8 text-right">
                            {Math.round((Number(item.frequencia) / maxFreq) * 100)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right font-mono">
                        <div className="text-green-400 font-bold text-base">{fmt(item.receitaTotal)}</div>
                      </td>
                      <td className="p-4 text-center col-detalhe">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
                          viewBox="0 0 24 24" stroke="currentColor"
                          className={`mx-auto text-[#E4B77D] transition-transform duration-200 ${
                            expandido === item.servicoId ? "rotate-180" : ""}`}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </td>
                    </tr>

                    {expandido === item.servicoId && (
                      <tr className="detalhe-row">
                        <td colSpan={6} className="p-0">
                          <div className="bg-zinc-950 border-l-4 border-[#E4B77D] px-6 py-4">
                            <p className="text-xs font-bold text-[#E4B77D] uppercase tracking-widest mb-3">
                              Detalhamento por Profissional — {item.servicoNome}
                            </p>
                            {loadingDetalhe && !detalhes[item.servicoId] ? (
                              <p className="text-zinc-500 text-sm">Carregando...</p>
                            ) : (detalhes[item.servicoId] || []).length === 0 ? (
                              <p className="text-zinc-500 text-sm italic">Sem dados para este serviço.</p>
                            ) : (
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-zinc-500 text-xs uppercase tracking-widest border-b border-zinc-800">
                                    <th className="py-2 text-left font-bold">Profissional</th>
                                    <th className="py-2 text-center font-bold w-32">Execuções</th>
                                    <th className="py-2 text-right font-bold w-40">Receita</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50">
                                  {(detalhes[item.servicoId] || []).map((d: any) => (
                                    <tr key={d.profissionalId} className="hover:bg-zinc-900/50">
                                      <td className="py-2.5 font-medium text-white">{d.profissionalNome}</td>
                                      <td className="py-2.5 text-center">
                                        <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-xs font-bold">
                                          {d.frequencia}x
                                        </span>
                                      </td>
                                      <td className="py-2.5 text-right text-green-400 font-mono font-bold">
                                        {fmt(d.receitaTotal)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}

              </tbody>
            </table>
          </div>
        </main>

      </div>
    </>
  );
}