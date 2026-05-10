"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

// ═══════════════════════════════════════════════════════════════
// TOUR SPOTLIGHT
// ═══════════════════════════════════════════════════════════════

const TOUR_STEPS = [
  {
    targetId: "tour-datas",
    titulo: "Período de Análise",
    descricao: "Defina o intervalo de datas para o relatório. Por padrão já vem o mês atual. Você pode selecionar qualquer período — um dia, uma semana ou meses inteiros.",
    posicao: "bottom" as const,
  },
  {
    targetId: "tour-marca",
    titulo: "Filtro por Marca",
    descricao: "Filtre os produtos de uma marca específica. Útil para avaliar o desempenho de fornecedores individualmente. Deixe em \"Todas\" para ver o quadro geral.",
    posicao: "bottom" as const,
  },
  {
    targetId: "tour-ordem",
    titulo: "Ordenação",
    descricao: "Escolha como os produtos serão listados: pelos mais vendidos em quantidade, pelo maior faturamento, pelos menos vendidos (para identificar produtos parados) ou em ordem alfabética.",
    posicao: "bottom" as const,
  },
  {
    targetId: "tour-estoque",
    titulo: "Estoque Crítico",
    descricao: "Marque esta opção para filtrar apenas produtos com menos de 5 unidades em estoque. Ideal para identificar rapidamente o que precisa ser reposto.",
    posicao: "bottom" as const,
  },
  {
    targetId: "tour-buscar",
    titulo: "Botão Buscar",
    descricao: "Após configurar os filtros, clique aqui para carregar o relatório. Os cards de resumo e a tabela serão atualizados com os dados do período.",
    posicao: "left" as const,
  },
  {
    targetId: "tour-kpis",
    titulo: "Resumo do Período",
    descricao: "Exibe dois indicadores rápidos: o total de unidades vendidas e o faturamento gerado no período filtrado. Ótimo para uma visão executiva antes de analisar o detalhe.",
    posicao: "bottom" as const,
  },
  {
    targetId: "tour-tabela",
    titulo: "Tabela de Produtos",
    descricao: "Lista cada produto com estoque atual, quantidade vendida no período e faturamento gerado. O badge de estoque muda de cor: cinza (ok), laranja (atenção < 5) e vermelho (esgotado).",
    posicao: "top" as const,
  },
  {
    targetId: "tour-imprimir",
    titulo: "Imprimir / PDF",
    descricao: "Gera uma versão limpa e econômica do relatório — fundo branco, sem elementos de tela — pronta para impressão em papel ou exportação como PDF.",
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
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function RelatorioGiroProdutos() {
  const [relatorio, setRelatorio] = useState<any[]>([]);
  const [marcas,    setMarcas]    = useState<any[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [erro,      setErro]      = useState("");

  // Tour
  const [tourAtivo,    setTourAtivo]    = useState(false);
  const [tourPasso,    setTourPasso]    = useState(0);
  const [tourEntrando, setTourEntrando] = useState(false);

  // Filtros — padrão: mês atual
  const dataHoje       = new Date();
  const primeiroDiaMes = new Date(dataHoje.getFullYear(), dataHoje.getMonth(), 1).toISOString().split("T")[0];
  const hojeString     = dataHoje.toISOString().split("T")[0];

  const [filtroDataInicio,    setFiltroDataInicio]    = useState(primeiroDiaMes);
  const [filtroDataFim,       setFiltroDataFim]        = useState(hojeString);
  const [filtroMarca,         setFiltroMarca]          = useState("");
  const [filtroOrdem,         setFiltroOrdem]          = useState("mais_vendidos");
  const [filtroEstoqueBaixo,  setFiltroEstoqueBaixo]   = useState(false);

  const obterToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  useEffect(() => {
    carregarMarcas();
    buscarRelatorio(primeiroDiaMes, hojeString, "", "mais_vendidos", false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarMarcas = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marcas`,
        { headers: { Authorization: `Bearer ${obterToken()}` } });
      if (res.ok) setMarcas(await res.json());
    } catch (e) { console.error("Erro ao carregar marcas", e); }
  };

  const buscarRelatorio = async (
    inicio      = filtroDataInicio,
    fim         = filtroDataFim,
    marcaId     = filtroMarca,
    ordem       = filtroOrdem,
    estoqueBaixo = filtroEstoqueBaixo
  ) => {
    setLoading(true); setErro(""); setRelatorio([]);
    try {
      const params = new URLSearchParams();
      if (inicio)       params.append("dataInicio",   inicio);
      if (fim)          params.append("dataFim",       fim);
      if (marcaId)      params.append("marcaId",       marcaId);
      if (ordem)        params.append("ordem",         ordem);
      if (estoqueBaixo) params.append("estoqueBaixo", "true");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/produtos/relatorio/giro?${params}`,
        { headers: { Authorization: `Bearer ${obterToken()}` } }
      );
      if (res.ok) { setRelatorio(await res.json()); }
      else { const err = await res.json(); setErro(err.msg || "Erro ao buscar relatório."); }
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
    Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const fmtData = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString("pt-BR") : "--/--/----";

  const totalVendidos  = relatorio.reduce((a, c) => a + Number(c.quantidadeVendida), 0);
  const totalFaturado  = relatorio.reduce((a, c) => a + Number(c.faturamentoTotal), 0);
  const marcaSelecionada = marcas.find(m => m.id == Number(filtroMarca));

  // Badge de estoque
  const estoqueBadgeClass = (qtd: number) => {
    if (qtd <= 0)  return "bg-red-500/10 text-red-500 border-red-500/20";
    if (qtd < 5)   return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    return "bg-zinc-800 text-zinc-300 border-zinc-700";
  };

  return (
    <>
      {/* ════════════════════════════════════════════════════════
          ESTILOS DE IMPRESSÃO — fundo branco, econômico, limpo
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
          .estoque-badge {
            background: transparent !important;
            border: 1px solid #999 !important;
            color: #000 !important;
            padding: 2px 8px !important;
            border-radius: 999px !important;
            font-weight: 700 !important;
          }

          /* Cabeçalho de impressão */
          .print-header { display: block !important; }
        }
      `}</style>

      <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 font-sans">

        {/* Tour */}
        {tourAtivo && (
          <Tour
            passo={tourPasso} entrando={tourEntrando}
            onProximo={() => irParaPasso(tourPasso + 1)}
            onAnterior={() => irParaPasso(tourPasso - 1)}
            onFechar={() => setTourAtivo(false)}
          />
        )}

        {/* ── CABEÇALHO DE IMPRESSÃO ─────────────────────────── */}
        <div className="print-header hidden print:block text-center mb-8 pb-6 border-b-2 border-black">
          <h1 className="text-2xl font-black uppercase tracking-widest">Barbearia Victor Uematsu</h1>
          <h2 className="text-lg font-bold mt-1">Relatório de Giro de Produtos</h2>
          <p className="text-sm mt-2 text-gray-600">
            Período: {fmtData(`${filtroDataInicio}T00:00:00`)} até {fmtData(`${filtroDataFim}T00:00:00`)}
            {marcaSelecionada ? ` · Marca: ${marcaSelecionada.nome}` : " · Todas as marcas"}
            {filtroEstoqueBaixo ? " · Estoque crítico" : ""}
          </p>
          <p className="text-xs mt-1 text-gray-400">
            Impresso em {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR")}
          </p>
          <div className="flex justify-center gap-10 mt-4 pt-4 border-t border-gray-300">
            <div>
              <span className="text-xs text-gray-500 uppercase">Qtd. Vendida</span><br />
              <strong className="text-xl">{totalVendidos} unidades</strong>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase">Faturamento Total</span><br />
              <strong className="text-xl">{fmt(totalFaturado)}</strong>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase">Produtos listados</span><br />
              <strong className="text-xl">{relatorio.length}</strong>
            </div>
          </div>
        </div>

        {/* ── HEADER TELA ────────────────────────────────────── */}
        <header className="print-hide flex flex-col md:flex-row md:justify-between items-center
          mb-6 border-b border-zinc-900 pb-4 max-w-6xl mx-auto gap-4 md:gap-0">
          <div>
            <h1 className="text-2xl font-bold text-[#E4B77D] flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Relatório de Giro de Produtos
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Vendas, saídas e controle de estoque crítico.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Botão Ajuda */}
            <button onClick={iniciarTour}
              className="px-4 py-2 bg-zinc-800 text-[#E4B77D] font-bold rounded-md hover:bg-zinc-700
                transition-all border border-[#E4B77D]/30 hover:border-[#E4B77D]/70
                flex items-center gap-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ? Ajuda
            </button>

            <Link href="/admin"
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Voltar
            </Link>

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

        {/* ── FILTROS ─────────────────────────────────────────── */}
        <section className="print-hide max-w-6xl mx-auto bg-zinc-900 border border-zinc-800
          rounded-xl p-6 shadow-lg mb-8">
          <form onSubmit={handleBuscar} className="flex flex-wrap gap-4 items-end">

            {/* Datas agrupadas */}
            <div id="tour-datas" className="flex gap-4 flex-1 min-w-[280px]">
              <div className="flex-1">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                  Início
                </label>
                <input type="date" value={filtroDataInicio}
                  onChange={(e) => setFiltroDataInicio(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white
                    focus:border-[#E4B77D] outline-none" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                  Fim
                </label>
                <input type="date" value={filtroDataFim}
                  onChange={(e) => setFiltroDataFim(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white
                    focus:border-[#E4B77D] outline-none" />
              </div>
            </div>

            {/* Marca */}
            <div id="tour-marca" className="flex-1 min-w-[160px]">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                Marca
              </label>
              <select value={filtroMarca} onChange={(e) => setFiltroMarca(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white
                  focus:border-[#E4B77D] outline-none">
                <option value="">Todas as Marcas</option>
                {marcas.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </select>
            </div>

            {/* Ordenação */}
            <div id="tour-ordem" className="flex-1 min-w-[180px]">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                Ordenar por
              </label>
              <select value={filtroOrdem} onChange={(e) => setFiltroOrdem(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white
                  focus:border-[#E4B77D] outline-none">
                <option value="mais_vendidos">Mais Vendidos (Qtd)</option>
                <option value="maior_faturamento">Maior Faturamento (R$)</option>
                <option value="menos_vendidos">Menos Vendidos</option>
                <option value="alfabetica">Ordem Alfabética</option>
              </select>
            </div>

            {/* Estoque crítico */}
            <div id="tour-estoque"
              className="flex items-center min-w-[165px] h-[50px] bg-zinc-950
                border border-zinc-800 rounded-md px-4 cursor-pointer"
              onClick={() => setFiltroEstoqueBaixo(v => !v)}>
              <label className="flex items-center gap-3 cursor-pointer w-full h-full select-none">
                <input type="checkbox" checked={filtroEstoqueBaixo}
                  onChange={(e) => setFiltroEstoqueBaixo(e.target.checked)}
                  className="w-4 h-4 accent-red-500" />
                <span className="text-sm font-medium text-red-400">
                  Estoque Crítico {"(< 5)"}
                </span>
              </label>
            </div>

            {/* Buscar */}
            <button id="tour-buscar" type="submit" disabled={loading}
              className="px-8 py-3 bg-[#E4B77D] text-black font-bold rounded-md hover:bg-[#cfa56d]
                transition-colors h-[50px] min-w-[120px] flex items-center justify-center">
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg"
                  fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : "Buscar"}
            </button>
          </form>
        </section>

        {/* ── KPIs ─────────────────────────────────────────────────
            O container SEMPRE é renderizado para que o tour
            consiga encontrar o elemento pelo id.
            O conteúdo só aparece quando há dados carregados.
        ─────────────────────────────────────────────────────── */}
        <div
          id="tour-kpis"
          className={`print-hide max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-6
            transition-all duration-300
            ${!loading && relatorio.length > 0 ? "opacity-100" : "opacity-0 pointer-events-none h-20"}`}
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-950/30 text-blue-400 rounded-full flex items-center
              justify-center border border-blue-900/50 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <span className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">
                Total Vendido
              </span>
              <strong className="text-2xl text-white leading-tight">
                {totalVendidos}{" "}
                <span className="text-sm font-normal text-zinc-400">unidades</span>
              </strong>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-950/30 text-green-500 rounded-full flex items-center
              justify-center border border-green-900/50 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">
                Faturamento
              </span>
              <strong className="text-2xl text-green-400 leading-tight">{fmt(totalFaturado)}</strong>
            </div>
          </div>
        </div>

        {/* ── ERRO ────────────────────────────────────────────── */}
        {erro && (
          <div className="print-hide max-w-6xl mx-auto mb-6 bg-red-950/30 border border-red-900
            text-red-400 p-4 rounded-lg text-center">
            {erro}
          </div>
        )}

        {/* ── TABELA ──────────────────────────────────────────── */}
        <main id="tour-tabela"
          className="max-w-6xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl
            overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400
                  text-xs uppercase tracking-widest">
                  <th className="p-4 font-bold border-r border-zinc-800/50">Produto</th>
                  <th className="p-4 font-bold border-r border-zinc-800/50 text-center w-36">
                    Estoque Atual
                  </th>
                  <th className="p-4 font-bold border-r border-zinc-800/50 text-center w-36">
                    Vendidos
                  </th>
                  <th className="p-4 font-bold text-right w-40">Faturamento</th>
                </tr>
              </thead>

              <tbody className="text-sm divide-y divide-zinc-800">
                {relatorio.length === 0 && !loading && !erro && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-zinc-500 italic">
                      Não houve vendas para os filtros informados.
                    </td>
                  </tr>
                )}

                {relatorio.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">

                    {/* Produto */}
                    <td className="p-4 border-r border-zinc-800/50">
                      <div className="font-bold text-white text-base">{item.produtoNome}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{item.marcaNome || "Sem marca"}</div>
                    </td>

                    {/* Estoque */}
                    <td className="p-4 border-r border-zinc-800/50 text-center">
                      <span className={`estoque-badge inline-flex items-center justify-center
                        px-3 py-1 rounded-full text-sm font-bold border
                        ${estoqueBadgeClass(item.estoqueAtual)}`}>
                        {item.estoqueAtual} un
                      </span>
                    </td>

                    {/* Vendidos */}
                    <td className="p-4 text-center border-r border-zinc-800/50">
                      <span className="text-lg font-bold text-blue-400">{item.quantidadeVendida}</span>
                    </td>

                    {/* Faturamento */}
                    <td className="p-4 text-right font-mono">
                      <div className="text-green-400 font-bold text-lg">{fmt(item.faturamentoTotal)}</div>
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
