"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ConfirmModal from "../../components/ConfirmModal";

const TOUR_STEPS = [
  { targetId: "tour-bloquear", titulo: "Bloquear Horário", descricao: "Registre ausências, atestados, folgas ou férias de um barbeiro. Durante o período bloqueado, os clientes não conseguirão agendar com ele.", posicao: "left" as const },
  { targetId: "tour-historico", titulo: "Histórico de Bloqueios", descricao: "Marque para visualizar bloqueios antigos já cancelados. Útil para consultar o histórico de ausências dos profissionais.", posicao: "bottom" as const },
  { targetId: "tour-cards-bloqueios", titulo: "Cards de Bloqueio", descricao: "Cada card mostra o barbeiro, o período bloqueado e o motivo. Use 'Liberar Agenda' para cancelar o bloqueio antes do prazo, ou 'Reativar Bloqueio' para restabelecer um bloqueio cancelado.", posicao: "top" as const },
];

function useSpotlight(targetId: string | null) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  useEffect(() => {
    if (!targetId) { setRect(null); return; }
    const atualizar = () => { const el = document.getElementById(targetId); if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(() => setRect(el.getBoundingClientRect()), 350); } };
    atualizar(); window.addEventListener("resize", atualizar); return () => window.removeEventListener("resize", atualizar);
  }, [targetId]);
  return rect;
}

interface TourProps { passo: number; onProximo: () => void; onAnterior: () => void; onFechar: () => void; entrando: boolean; }
function Tour({ passo, onProximo, onAnterior, onFechar, entrando }: TourProps) {
  const step = TOUR_STEPS[passo]; const rect = useSpotlight(step.targetId); const isUltimo = passo === TOUR_STEPS.length - 1; const PAD = 10;
  if (!rect) return null;
  const spotX = rect.left - PAD, spotY = rect.top - PAD, spotW = rect.width + PAD * 2, spotH = rect.height + PAD * 2;
  const BALAO_W = 300, OFFSET = 16; let balaoStyle: React.CSSProperties = {};
  if (step.posicao === "bottom") balaoStyle = { top: Math.min(spotY + spotH + OFFSET, window.innerHeight - 190), left: Math.min(Math.max(spotX + spotW / 2 - BALAO_W / 2, 12), window.innerWidth - BALAO_W - 12), width: BALAO_W };
  else if (step.posicao === "top") balaoStyle = { bottom: Math.min(window.innerHeight - spotY + OFFSET, window.innerHeight - 190), left: Math.min(Math.max(spotX + spotW / 2 - BALAO_W / 2, 12), window.innerWidth - BALAO_W - 12), width: BALAO_W };
  else if (step.posicao === "left") balaoStyle = { top: Math.max(spotY + spotH / 2 - 90, 12), right: window.innerWidth - spotX + OFFSET, width: BALAO_W };
  return (
    <>
      <div className="fixed inset-0 z-40 pointer-events-none"><svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><mask id="spotlight-mask"><rect width="100%" height="100%" fill="white" /><rect x={spotX} y={spotY} width={spotW} height={spotH} rx="8" ry="8" fill="black" /></mask></defs><rect width="100%" height="100%" fill="rgba(0,0,0,0.78)" mask="url(#spotlight-mask)" /><rect x={spotX} y={spotY} width={spotW} height={spotH} rx="8" ry="8" fill="none" stroke="#E4B77D" strokeWidth="2" strokeDasharray="6 3"><animate attributeName="stroke-dashoffset" from="0" to="18" dur="1s" repeatCount="indefinite" /></rect></svg></div>
      <div className="fixed inset-0 z-40" onClick={onFechar} />
      <div className="fixed z-50 pointer-events-auto" style={{ ...balaoStyle, animation: entrando ? "tourBalloonIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards" : undefined }} onClick={(e) => e.stopPropagation()}>
        <div className="bg-zinc-900 border border-[#E4B77D]/40 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-2"><span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{passo + 1} de {TOUR_STEPS.length}</span><button onClick={onFechar} className="text-zinc-600 hover:text-zinc-300 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>
          <div className="mx-4 h-1 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-[#E4B77D] rounded-full transition-all duration-500" style={{ width: `${((passo + 1) / TOUR_STEPS.length) * 100}%` }} /></div>
          <div className="px-4 py-4"><h3 className="text-sm font-bold text-[#E4B77D] mb-1">{step.titulo}</h3><p className="text-xs text-zinc-400 leading-relaxed">{step.descricao}</p></div>
          <div className="flex items-center justify-between px-4 pb-4 gap-2">
            <button onClick={onAnterior} disabled={passo === 0} className="px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-400 text-xs font-bold hover:border-zinc-500 hover:text-white transition-colors disabled:opacity-25 disabled:cursor-not-allowed">← Anterior</button>
            <div className="flex gap-1">{TOUR_STEPS.map((_, i) => (<div key={i} className={`rounded-full transition-all duration-300 ${i === passo ? "w-4 h-1.5 bg-[#E4B77D]" : "w-1.5 h-1.5 bg-zinc-700"}`} />))}</div>
            {isUltimo ? <button onClick={onFechar} className="px-3 py-1.5 rounded-md bg-[#E4B77D] text-black text-xs font-bold hover:bg-[#cfa56d] transition-colors">Concluir ✓</button> : <button onClick={onProximo} className="px-3 py-1.5 rounded-md bg-[#E4B77D] text-black text-xs font-bold hover:bg-[#cfa56d] transition-colors">Próximo →</button>}
          </div>
        </div>
      </div>
      <style>{`@keyframes tourBalloonIn { 0% { opacity:0; transform:scale(0.85) translateY(6px); } 100% { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </>
  );
}

export default function GerenciarBloqueios() {
  const [tourAtivo, setTourAtivo] = useState(false);
  const [tourPasso, setTourPasso] = useState(0);
  const [tourEntrando, setTourEntrando] = useState(false);
  const iniciarTour = () => { setTourPasso(0); setTourEntrando(true); setTourAtivo(true); setTimeout(() => setTourEntrando(false), 350); };
  const irParaPasso = useCallback((novo: number) => { setTourEntrando(true); setTimeout(() => { setTourPasso(novo); setTimeout(() => setTourEntrando(false), 50); }, 150); }, []);

  const [bloqueios, setBloqueios] = useState<any[]>([]);
  const [profissionais, setProfissionais] = useState<any[]>([]);
  
  const [modalAberto, setModalAberto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mostrarInativos, setMostrarInativos] = useState(false);
  
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    titulo: "",
    mensagem: "",
    tipo: "atencao" as "atencao" | "perigo",
    onConfirm: () => {}
  });

  // Campos do Formulário
  const [id, setId] = useState("");
  const [profissionalId, setProfissionalId] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [motivo, setMotivo] = useState("");

  // PEGA A DATA DE HOJE FORMATADA PARA BLOQUEAR O PASSADO
  const dataHojeFormatada = new Date().toISOString().split("T")[0];

  useEffect(() => {
    carregarProfissionais();
  }, []);

  useEffect(() => {
    carregarBloqueios();
  }, [mostrarInativos]);

  const obterToken = () => localStorage.getItem("token") || "";

  const carregarProfissionais = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pessoas/profissionais`, {
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      if (response.ok) setProfissionais(await response.json());
    } catch (error) {
      console.error("Erro ao carregar profissionais", error);
    }
  };

  const carregarBloqueios = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/bloqueios${mostrarInativos ? '?inativos=true' : ''}`;
      const response = await fetch(url, {
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      if (response.ok) {
        setBloqueios(await response.json());
      } else {
        setBloqueios([]);
      }
    } catch (error) {
      console.error("Erro ao carregar bloqueios", error);
    }
  };

  const abrirModalNovo = () => {
    setId("");
    setProfissionalId("");
    setDataInicio("");
    setHoraInicio("09:00");
    setDataFim("");
    setHoraFim("12:00");
    setMotivo("");
    setErro("");
    setModalAberto(true);
  };

  // Truque de UX: Ao escolher a data de início, já preenche a data de fim automaticamente
  const handleDataInicioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novaData = e.target.value;
    setDataInicio(novaData);
    if (!dataFim || dataFim <= novaData) {
      setDataFim(novaData);
    }
  };

  const exibirSucesso = (mensagem: string) => {
    setSucesso(mensagem);
    setTimeout(() => setSucesso(""), 3000);
  };

  const salvarBloqueio = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    // Monta o formato DATETIME para o banco de dados (Ex: 2026-04-10T14:30:00)
    const dataHoraInicioFormatada = `${dataInicio}T${horaInicio}:00`;
    const dataHoraFimFormatada = `${dataFim}T${horaFim}:00`;

    const metodo = id ? "PUT" : "POST";
    const url = id ? `${process.env.NEXT_PUBLIC_API_URL}/bloqueios/${id}` : `${process.env.NEXT_PUBLIC_API_URL}/bloqueios`;

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${obterToken()}`
        },
        body: JSON.stringify({ 
          profissionalId: Number(profissionalId),
          dataInicio: dataHoraInicioFormatada,
          dataFim: dataHoraFimFormatada,
          motivo
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setModalAberto(false);
        carregarBloqueios();
        exibirSucesso(id ? "Bloqueio atualizado com sucesso!" : "Agenda bloqueada com sucesso!");
      } else {
        setErro(data.msg || "Erro ao salvar o bloqueio.");
      }
    } catch (error) {
      setErro("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // NOVAS FUNÇÕES USANDO O MODAL CUSTOMIZADO
  // ==========================================

  const abrirModalInativar = (idExclusao: string) => {
    setConfirmModal({
      isOpen: true,
      titulo: "Cancelar Bloqueio?",
      mensagem: "Deseja cancelar este bloqueio? Os horários voltarão a ficar livres na agenda.",
      tipo: "perigo", // Botão vermelho para ação destrutiva
      onConfirm: () => efetivarInativacao(idExclusao)
    });
  };

  const efetivarInativacao = async (idExclusao: string) => {
    setConfirmModal({ ...confirmModal, isOpen: false }); // Fecha o modal
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bloqueios/${idExclusao}`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      if (response.ok) {
        carregarBloqueios();
        exibirSucesso("Bloqueio cancelado. Agenda liberada!");
      }
    } catch (error) { console.error(error); }
  };

  const abrirModalReativar = (idReativacao: string) => {
    setConfirmModal({
      isOpen: true,
      titulo: "Reativar Bloqueio?",
      mensagem: "Deseja reativar este bloqueio de agenda?",
      tipo: "atencao", // Botão dourado padrão
      onConfirm: () => efetivarReativacao(idReativacao)
    });
  };

  const efetivarReativacao = async (idReativacao: string) => {
    setConfirmModal({ ...confirmModal, isOpen: false }); // Fecha o modal
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bloqueios/${idReativacao}/reativar`, {
        method: "PUT", headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      if (response.ok) {
        carregarBloqueios();
        exibirSucesso("Bloqueio reativado!");
      }
    } catch (error) { console.error(error); }
  };

  // ==========================================

  // Funções de formatação bonitas para a tela
  const formatarData = (dataStr: string) => new Date(dataStr).toLocaleDateString('pt-BR');
  const formatarHora = (dataStr: string) => new Date(dataStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 font-sans">
      {tourAtivo && (<Tour passo={tourPasso} entrando={tourEntrando} onProximo={() => irParaPasso(tourPasso + 1)} onAnterior={() => irParaPasso(tourPasso - 1)} onFechar={() => setTourAtivo(false)} />)}

      <header className="flex justify-between items-center mb-6 border-b border-zinc-900 pb-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="w-12 h-12 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-[#E4B77D] transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#E4B77D] flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Bloqueios de Agenda
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Gerencie atestados, imprevistos e férias dos barbeiros</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={iniciarTour} className="px-4 py-2 bg-zinc-800 text-[#E4B77D] font-bold rounded-md hover:bg-zinc-700 transition-all border border-[#E4B77D]/30 hover:border-[#E4B77D]/70 flex items-center gap-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ? Ajuda
          </button>
          <button id="tour-bloquear" onClick={abrirModalNovo} className="px-4 py-2 bg-red-950/80 text-red-400 border border-red-900 font-bold rounded-md hover:bg-red-900 hover:text-red-100 transition-colors shadow-lg flex items-center gap-2">
            + Bloquear Horário
          </button>
        </div>
      </header>

      {sucesso && (
        <div className="max-w-6xl mx-auto mb-6 bg-green-950/50 border border-green-900 text-green-400 p-4 rounded-lg flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">{sucesso}</span>
        </div>
      )}

      {/* Filtro de Inativos */}
      <div className="max-w-6xl mx-auto mb-6">
        <div id="tour-historico" className="flex items-center gap-3 w-max px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg">
          <input
            type="checkbox" id="filtroInativos" checked={mostrarInativos} onChange={(e) => setMostrarInativos(e.target.checked)}
            className="w-4 h-4 accent-[#E4B77D] cursor-pointer"
          />
          <label htmlFor="filtroInativos" className="text-sm text-zinc-300 cursor-pointer select-none">
            Exibir Histórico de Bloqueios Antigos
          </label>
        </div>
      </div>

      <main id="tour-cards-bloqueios" className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bloqueios.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-zinc-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mb-4 opacity-50">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg">Nenhum bloqueio registrado no momento.</p>
          </div>
        ) : (
          bloqueios.map((b) => {
            const mesmoDia = formatarData(b.dataInicio) === formatarData(b.dataFim);

            return (
              <div key={b.id} className={`border rounded-xl p-5 shadow-lg flex flex-col transition-all ${b.ativo === 0 ? 'bg-zinc-900/30 border-zinc-800/50 opacity-60' : 'bg-red-950/10 border-red-900/30'}`}>
                
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 text-[#E4B77D] font-bold uppercase text-xs">
                      {b.profissionalNome.charAt(0)}
                    </div>
                    <span className={`font-bold ${b.ativo === 0 ? 'text-zinc-500 line-through' : 'text-white'}`}>
                      {b.profissionalNome}
                    </span>
                  </div>
                  {b.ativo === 0 && <span className="text-[10px] uppercase font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md border border-zinc-700">Inativo</span>}
                  {b.ativo === 1 && <span className="text-[10px] uppercase font-bold bg-red-900/40 text-red-400 px-2 py-0.5 rounded-md border border-red-900">Bloqueado</span>}
                </div>

                <div className="flex flex-col gap-1 mb-4 flex-grow bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                  {mesmoDia ? (
                    <>
                      <span className="text-sm font-bold text-zinc-300">📅 Dia {formatarData(b.dataInicio)}</span>
                      <span className="text-sm text-zinc-400">⏰ Das {formatarHora(b.dataInicio)} às {formatarHora(b.dataFim)}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-zinc-400">De: <strong className="text-zinc-300">{formatarData(b.dataInicio)} às {formatarHora(b.dataInicio)}</strong></span>
                      <span className="text-sm text-zinc-400">Até: <strong className="text-zinc-300">{formatarData(b.dataFim)} às {formatarHora(b.dataFim)}</strong></span>
                    </>
                  )}
                </div>

                <p className="text-sm text-zinc-400 italic mb-4">
                  "{b.motivo || "Nenhum motivo informado."}"
                </p>

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800/50">
                  {b.ativo !== 0 ? (
                    // Alterado para abrir o Modal Customizado
                    <button onClick={() => abrirModalInativar(b.id)} className="text-sm text-green-500 hover:text-green-400 transition-colors font-medium flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                      Liberar Agenda
                    </button>
                  ) : (
                    // Alterado para abrir o Modal Customizado
                    <button onClick={() => abrirModalReativar(b.id)} className="text-sm text-red-500 hover:text-red-400 transition-colors font-medium flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      Reativar Bloqueio
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </main>

      {/* MODAL DE NOVO BLOQUEIO */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModalAberto(false)} />
          
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-lg p-6 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-red-500">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Bloquear Agenda
            </h2>

            <form onSubmit={salvarBloqueio} className="flex flex-col gap-4">
              {erro && <div className="bg-red-950/50 border border-red-900 text-red-400 text-sm p-3 rounded-md">{erro}</div>}
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Qual barbeiro ficará ausente?</label>
                <select 
                  required value={profissionalId} onChange={(e) => setProfissionalId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D] appearance-none"
                >
                  <option value="" disabled>Selecione o profissional...</option>
                  {profissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>

              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg flex flex-col gap-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Início do Bloqueio</h3>
                <div className="flex gap-4">
                  <div className="flex-[2]">
                    <label className="block text-xs text-zinc-400 mb-1">Data</label>
                    <input 
                      type="date" required value={dataInicio} onChange={handleDataInicioChange}
                      min={dataHojeFormatada} // <--- MÁGICA 1: Bloqueia o calendário do passado
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-zinc-400 mb-1">Hora</label>
                    <input 
                      type="time" required value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg flex flex-col gap-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Fim do Bloqueio</h3>
                <div className="flex gap-4">
                  <div className="flex-[2]">
                    <label className="block text-xs text-zinc-400 mb-1">Data</label>
                    <input 
                      type="date" required value={dataFim} onChange={(e) => setDataFim(e.target.value)}
                      min={dataInicio || dataHojeFormatada} // <--- MÁGICA 2: A data final não pode ser antes da inicial
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-zinc-400 mb-1">Hora</label>
                    <input 
                      type="time" required value={horaFim} onChange={(e) => setHoraFim(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Motivo (Visível só para você)</label>
                <input 
                  type="text" required value={motivo} onChange={(e) => setMotivo(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                  placeholder="Ex: Ida ao dentista, Férias..."
                />
              </div>

              <div className="flex gap-3 mt-2 border-t border-zinc-800 pt-4">
                <button type="button" onClick={() => setModalAberto(false)} className="flex-1 py-3 border border-zinc-700 text-zinc-300 rounded-md hover:bg-zinc-800 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-red-900 text-white font-bold rounded-md hover:bg-red-800 transition-colors disabled:opacity-50">
                  {loading ? "Bloqueando..." : "Bloquear Horário"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        titulo={confirmModal.titulo}
        mensagem={confirmModal.mensagem}
        tipo={confirmModal.tipo}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />

    </div>
  );
}