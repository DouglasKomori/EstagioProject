"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

// ═══════════════════════════════════════════════════════════════
// INTERVALOS DE TEMPO (atalhos)
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
// TOUR
// ═══════════════════════════════════════════════════════════════

const TOUR_STEPS = [
  {
    targetId: "tour-intervalos",
    titulo: "Intervalo de Tempo",
    descricao: "Clique em um atalho para definir o período rapidamente. As datas são preenchidas automaticamente.",
    posicao: "bottom" as const,
  },
  {
    targetId: "tour-datas",
    titulo: "Período de Busca",
    descricao: "Prefere um período personalizado? Edite as datas manualmente. O atalho ativo é desmarcado automaticamente.",
    posicao: "bottom" as const,
  },
  {
    targetId: "tour-profissional",
    titulo: "Filtro por Profissional",
    descricao: "Selecione um barbeiro para ver apenas os agendamentos dele. Deixe em \"Todos\" para visualizar a agenda completa da equipe no período.",
    posicao: "bottom" as const,
  },
  {
    targetId: "tour-status",
    titulo: "Filtro por Status",
    descricao: "Filtre por situação do agendamento: Agendados (confirmados e futuros), Concluídos (já atendidos) ou Cancelados. Deixe em branco para ver todos.",
    posicao: "bottom" as const,
  },
  {
    targetId: "tour-cliente",
    titulo: "Busca por Cliente",
    descricao: "Digite o nome ou parte do nome do cliente para localizar agendamentos específicos. Útil para responder rapidamente a dúvidas de um cliente.",
    posicao: "bottom" as const,
  },
  {
    targetId: "tour-buscar",
    titulo: "Botão Buscar",
    descricao: "Após configurar os filtros, clique aqui para carregar os agendamentos. A tabela será atualizada com os resultados do período selecionado.",
    posicao: "left" as const,
  },
  {
    targetId: "tour-tabela",
    titulo: "Tabela de Agendamentos",
    descricao: "Exibe todos os agendamentos encontrados com horário, cliente, serviços, profissional e status. As cores dos badges indicam a situação: azul (agendado), verde (concluído) e vermelho (cancelado).",
    posicao: "top" as const,
  },
  {
    targetId: "tour-imprimir",
    titulo: "Imprimir / PDF",
    descricao: "Gera uma versão limpa e formatada do relatório para impressão ou salvar como PDF. Todos os filtros e elementos visuais da tela são ocultados, exibindo apenas os dados.",
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
      top:  Math.min(spotY + spotH + OFFSET, window.innerHeight - 190),
      left: Math.min(Math.max(spotX + spotW / 2 - BALAO_W / 2, 12), window.innerWidth - BALAO_W - 12),
      width: BALAO_W,
    };
  } else if (step.posicao === "top") {
    balaoStyle = {
      bottom: Math.min(window.innerHeight - spotY + OFFSET, window.innerHeight - 190),
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
      <div className="fixed z-50 pointer-events-auto"
        style={{ ...balaoStyle, animation: entrando ? "tourBalloonIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards" : undefined }}
        onClick={(e) => e.stopPropagation()}>
        <div className="bg-zinc-900 border border-[#E4B77D]/40 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{passo + 1} de {TOUR_STEPS.length}</span>
            <button onClick={onFechar} className="text-zinc-600 hover:text-zinc-300 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="mx-4 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-[#E4B77D] rounded-full transition-all duration-500" style={{ width: `${((passo + 1) / TOUR_STEPS.length) * 100}%` }} />
          </div>
          <div className="px-4 py-4">
            <h3 className="text-sm font-bold text-[#E4B77D] mb-1">{step.titulo}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{step.descricao}</p>
          </div>
          <div className="flex items-center justify-between px-4 pb-4 gap-2">
            <button onClick={onAnterior} disabled={passo === 0} className="px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-400 text-xs font-bold hover:border-zinc-500 hover:text-white transition-colors disabled:opacity-25 disabled:cursor-not-allowed">← Anterior</button>
            <div className="flex gap-1">{TOUR_STEPS.map((_, i) => (<div key={i} className={`rounded-full transition-all duration-300 ${i === passo ? "w-4 h-1.5 bg-[#E4B77D]" : "w-1.5 h-1.5 bg-zinc-700"}`} />))}</div>
            {isUltimo ? (
              <button onClick={onFechar} className="px-3 py-1.5 rounded-md bg-[#E4B77D] text-black text-xs font-bold hover:bg-[#cfa56d] transition-colors">Concluir ✓</button>
            ) : (
              <button onClick={onProximo} className="px-3 py-1.5 rounded-md bg-[#E4B77D] text-black text-xs font-bold hover:bg-[#cfa56d] transition-colors">Próximo →</button>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes tourBalloonIn { 0% { opacity:0; transform:scale(0.85) translateY(6px); } 100% { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function RelatorioAgenda() {
  const [relatorio,     setRelatorio]     = useState<any[]>([]);
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [erro,          setErro]          = useState("");

  // Tour
  const [tourAtivo,    setTourAtivo]    = useState(false);
  const [tourPasso,    setTourPasso]    = useState(0);
  const [tourEntrando, setTourEntrando] = useState(false);

  // Intervalo ativo
  const [intervaloAtivo, setIntervaloAtivo] = useState("Hoje");

  // Filtros — padrão: hoje
  const dataHoje = new Date().toISOString().split("T")[0];
  const [filtroDataInicio,   setFiltroDataInicio]   = useState(dataHoje);
  const [filtroDataFim,      setFiltroDataFim]      = useState(dataHoje);
  const [filtroProfissional, setFiltroProfissional] = useState("");
  const [filtroStatus,       setFiltroStatus]       = useState("");
  const [filtroCliente,      setFiltroCliente]      = useState("");

  const obterToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  useEffect(() => {
    carregarProfissionais();
    buscarRelatorio(dataHoje, dataHoje, "", "", "");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarProfissionais = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pessoas/profissionais`,
        { headers: { Authorization: `Bearer ${obterToken()}` } }
      );
      if (res.ok) setProfissionais(await res.json());
    } catch (e) { console.error("Erro ao carregar profissionais", e); }
  };

  const buscarRelatorio = async (
    inicio  = filtroDataInicio,
    fim     = filtroDataFim,
    profId  = filtroProfissional,
    status  = filtroStatus,
    cliente = filtroCliente
  ) => {
    setLoading(true); setErro(""); setRelatorio([]);
    try {
      const params = new URLSearchParams();
      if (inicio)  params.append("dataInicio",    inicio);
      if (fim)     params.append("dataFim",        fim);
      if (profId)  params.append("profissionalId", profId);
      if (status)  params.append("status",         status);
      if (cliente) params.append("clienteNome",    cliente);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agendamentos/relatorio/agenda?${params}`,
        { headers: { Authorization: `Bearer ${obterToken()}` } }
      );
      if (res.ok) {
        setRelatorio(await res.json());
      } else {
        const err = await res.json();
        setErro(err.msg || err.erro || "Nenhum agendamento encontrado no período.");
      }
    } catch { setErro("Erro de conexão ao gerar o relatório."); }
    finally  { setLoading(false); }
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    if (filtroDataInicio && filtroDataFim && filtroDataInicio > filtroDataFim) {
      setErro("A Data Início não pode ser maior que a Data Fim."); return;
    }
    buscarRelatorio();
  };

  // Intervalos
  const aplicarIntervalo = (label: string, dias: number) => {
    const { inicio, fim } = calcularIntervalo(dias);
    setFiltroDataInicio(inicio); setFiltroDataFim(fim); setIntervaloAtivo(label);
  };

  const handleDataChange = (campo: "inicio" | "fim", valor: string) => {
    setIntervaloAtivo("");
    campo === "inicio" ? setFiltroDataInicio(valor) : setFiltroDataFim(valor);
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

  // Formatadores
  const formatarHora = (iso: string) => {
    if (!iso) return "--:--";
    return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };
  const formatarData = (iso: string) => {
    if (!iso) return "--/--/----";
    return new Date(iso).toLocaleDateString("pt-BR");
  };

  // Badge de status
  const statusStyle: Record<string, string> = {
    AGENDADO:  "bg-blue-500/10 text-blue-400 border-blue-500/20",
    CONCLUIDO: "bg-green-500/10 text-green-400 border-green-500/20",
    CANCELADO: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const profSelecionado = profissionais.find(p => p.id == Number(filtroProfissional));

  return (
    <>
      <style>{`
        @media print {
          *, *::before, *::after { background:white!important; color:black!important; box-shadow:none!important; text-shadow:none!important; -webkit-print-color-adjust:exact!important; print-color-adjust:exact!important; }
          header, section, nav, .print-hide { display:none!important; }
          main { border:none!important; border-radius:0!important; padding:0!important; margin:0!important; }
          table { width:100%!important; border-collapse:collapse!important; font-size:12px!important; }
          th { background:#f5f5f5!important; color:#000!important; border:1px solid #bbb!important; padding:7px 10px!important; font-weight:700!important; text-transform:uppercase!important; font-size:10px!important; letter-spacing:0.05em!important; }
          td { border:1px solid #ccc!important; padding:7px 10px!important; color:#000!important; }
          tbody tr:nth-child(even) td { background:#fafafa!important; }
          .status-badge { background:transparent!important; border:1px solid #999!important; color:#000!important; padding:2px 8px!important; border-radius:999px!important; font-weight:700!important; }
          .print-header { display:block!important; }
        }
      `}</style>

      <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 font-sans">

        {tourAtivo && (
          <Tour passo={tourPasso} entrando={tourEntrando}
            onProximo={() => irParaPasso(tourPasso + 1)}
            onAnterior={() => irParaPasso(tourPasso - 1)}
            onFechar={() => setTourAtivo(false)} />
        )}

        {/* ── CABEÇALHO DE IMPRESSÃO ─────────────────────────── */}
        <div className="hidden print:block text-center mb-8 pb-6 border-b-2 border-black">
          <h1 className="text-2xl font-black uppercase tracking-widest">Barbearia Victor Uematsu</h1>
          <h2 className="text-lg font-bold mt-1">Relatório de Agendamentos</h2>
          <p className="text-sm mt-2 text-gray-600">
            Período: {formatarData(`${filtroDataInicio}T00:00:00`)} até {formatarData(`${filtroDataFim}T00:00:00`)}
            {profSelecionado ? ` · Profissional: ${profSelecionado.nome}` : " · Todos os profissionais"}
            {filtroStatus ? ` · Status: ${filtroStatus}` : ""}
          </p>
          <p className="text-xs mt-1 text-gray-400">Impresso em {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR")}</p>
          <div className="flex justify-center gap-10 mt-4 pt-4 border-t border-gray-300">
            <div><span className="text-xs text-gray-500 uppercase">Total</span><br /><strong className="text-xl">{relatorio.length} agendamento{relatorio.length !== 1 ? "s" : ""}</strong></div>
            {relatorio.filter(a => a.status === "CONCLUIDO").length > 0 && (
              <div><span className="text-xs text-gray-500 uppercase">Concluídos</span><br /><strong className="text-xl">{relatorio.filter(a => a.status === "CONCLUIDO").length}</strong></div>
            )}
            {relatorio.filter(a => a.status === "CANCELADO").length > 0 && (
              <div><span className="text-xs text-gray-500 uppercase">Cancelados</span><br /><strong className="text-xl">{relatorio.filter(a => a.status === "CANCELADO").length}</strong></div>
            )}
          </div>
        </div>

        {/* ── HEADER TELA ────────────────────────────────────── */}
        <header className="flex flex-col md:flex-row md:justify-between items-center mb-6 border-b border-zinc-900 pb-4 max-w-6xl mx-auto print:hidden gap-4 md:gap-0">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="w-12 h-12 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-[#E4B77D] transition-colors shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#E4B77D] flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Emissão de Agenda
              </h1>
              <p className="text-sm text-zinc-400 mt-1">Gere relatórios de agendamentos com filtros por período.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={iniciarTour} className="px-4 py-2 bg-zinc-800 text-[#E4B77D] font-bold rounded-md hover:bg-zinc-700 transition-all border border-[#E4B77D]/30 hover:border-[#E4B77D]/70 flex items-center gap-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ? Ajuda
            </button>
            <button id="tour-imprimir" onClick={() => window.print()} className="px-6 py-2 bg-zinc-800 text-white font-bold rounded-md hover:bg-zinc-700 transition-colors border border-zinc-700 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Imprimir / PDF
            </button>
          </div>
        </header>

        {/* ── FILTROS ─────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg mb-8 print:hidden">

          {/* Intervalos */}
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

            {/* Datas — linha própria com min-width generoso */}
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

            {/* Profissional */}
            <div id="tour-profissional" className="min-w-[170px] w-full md:w-auto md:flex-1">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Profissional</label>
              <select value={filtroProfissional}
                onChange={(e) => setFiltroProfissional(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white focus:border-[#E4B77D] outline-none">
                <option value="">Todos</option>
                {profissionais.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div id="tour-status" className="min-w-[140px] w-full md:w-auto md:flex-1">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Status</label>
              <select value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white focus:border-[#E4B77D] outline-none">
                <option value="">Todos</option>
                <option value="AGENDADO">Agendados</option>
                <option value="CONCLUIDO">Concluídos</option>
                <option value="CANCELADO">Cancelados</option>
              </select>
            </div>

            {/* Cliente */}
            <div id="tour-cliente" className="min-w-[160px] w-full md:w-auto md:flex-1">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Cliente</label>
              <input type="text" value={filtroCliente}
                onChange={(e) => setFiltroCliente(e.target.value)}
                placeholder="Ex: João"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white focus:border-[#E4B77D] outline-none" />
            </div>

            {/* Buscar */}
            <button id="tour-buscar" type="submit" disabled={loading}
              className="px-8 py-3 bg-[#E4B77D] text-black font-bold rounded-md hover:bg-[#cfa56d] transition-colors h-[50px] min-w-[120px] flex items-center justify-center">
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : "Buscar"}
            </button>

          </form>
        </section>

        {/* ── ERRO ────────────────────────────────────────────── */}
        {erro && (
          <div className="max-w-6xl mx-auto mb-6 bg-red-950/30 border border-red-900 text-red-400 p-4 rounded-lg text-center print:hidden">{erro}</div>
        )}

        {/* ── TABELA ──────────────────────────────────────────── */}
        <main id="tour-tabela" className="max-w-6xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-widest">
                  <th className="p-4 font-bold border-r border-zinc-800/50 w-28">Horário</th>
                  <th className="p-4 font-bold border-r border-zinc-800/50">Cliente / Contato</th>
                  <th className="p-4 font-bold border-r border-zinc-800/50">Serviços</th>
                  <th className="p-4 font-bold border-r border-zinc-800/50">Profissional</th>
                  <th className="p-4 font-bold text-center w-32">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-zinc-800">
                {relatorio.length === 0 && !loading && !erro && (
                  <tr><td colSpan={5} className="p-8 text-center text-zinc-500 italic">Nenhum agendamento encontrado no período.</td></tr>
                )}
                {relatorio.map((ag) => (
                  <tr key={ag.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4 font-mono border-r border-zinc-800/50 align-top">
                      <div className="font-bold text-[#E4B77D] text-lg leading-tight">{formatarHora(ag.dataHora)}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{formatarData(ag.dataHora)}</div>
                    </td>
                    <td className="p-4 border-r border-zinc-800/50 align-top">
                      <div className="font-bold text-white">{ag.clienteNome}</div>
                      <div className="text-zinc-500 text-xs mt-1">{ag.clienteTelefone || "Sem telefone"}</div>
                    </td>
                    <td className="p-4 border-r border-zinc-800/50 align-top text-zinc-300 leading-relaxed">
                      {ag.servicos || <span className="italic text-zinc-600">Nenhum serviço atrelado</span>}
                    </td>
                    <td className="p-4 border-r border-zinc-800/50 align-top text-zinc-400">{ag.profissionalNome}</td>
                    <td className="p-4 text-center align-top">
                      <span className={`status-badge px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border
                        ${statusStyle[ag.status] || "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
                        {ag.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>

      </div>
    </>
  );
}