"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ConfirmModal from "../../components/ConfirmModal";

type TourPosicao = "bottom" | "top" | "left";

interface TourStep {
  targetId: string;
  titulo: string;
  descricao: string;
  posicao: TourPosicao;
}

const TOUR_STEPS: TourStep[] = [
  { 
    targetId: "tour-seletor-barb", 
    titulo: "Selecione o Barbeiro", 
    descricao: "Escolha o profissional cuja escala deseja configurar. Cada barbeiro tem a própria grade semanal de trabalho.", 
    posicao: "bottom" 
  },
  { 
    targetId: "tour-grade-semana", 
    titulo: "Grade Semanal", 
    descricao: "Cada card representa um dia da semana. Clique em '+ Adicionar Horário' para definir os turnos de trabalho. Se o barbeiro faz horário de almoço, crie dois turnos separados.", 
    posicao: "top" 
  },
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

const DIAS_SEMANA = [
  "Domingo", 
  "Segunda-feira", 
  "Terça-feira", 
  "Quarta-feira", 
  "Quinta-feira", 
  "Sexta-feira", 
  "Sábado"
];

export default function GerenciarDisponibilidade() {
  const [tourAtivo, setTourAtivo] = useState(false);
  const [tourPasso, setTourPasso] = useState(0);
  const [tourEntrando, setTourEntrando] = useState(false);
  const iniciarTour = () => { setTourPasso(0); setTourEntrando(true); setTourAtivo(true); setTimeout(() => setTourEntrando(false), 350); };
  const irParaPasso = useCallback((novo: number) => { setTourEntrando(true); setTimeout(() => { setTourPasso(novo); setTimeout(() => setTourEntrando(false), 50); }, 150); }, []);

  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [profissionalSelecionado, setProfissionalSelecionado] = useState("");
  const [disponibilidades, setDisponibilidades] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState(""); // Erro do modal de adicionar
  const [erroPrincipal, setErroPrincipal] = useState(""); // Erro da tela principal

  // ESTADO DO NOSSO NOVO MODAL DE CONFIRMAÇÃO
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    titulo: "",
    mensagem: "",
    tipo: "atencao" as "atencao" | "perigo",
    onConfirm: () => {}
  });

  // Estados do Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState<number>(0);
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFim, setHoraFim] = useState("19:00");

  const obterToken = () => localStorage.getItem("token") || "";

  useEffect(() => {
    carregarProfissionais();
  }, []);

  // Sempre que mudar o barbeiro no select, recarrega a agenda dele
  useEffect(() => {
    if (profissionalSelecionado) {
      carregarDisponibilidades(profissionalSelecionado);
    } else {
      setDisponibilidades([]);
    }
  }, [profissionalSelecionado]);

  const carregarProfissionais = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pessoas/profissionais`, {
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      if (response.ok) setProfissionais(await response.json());
    } catch (error) { console.error("Erro ao carregar profissionais", error); }
  };

  const carregarDisponibilidades = async (idProfissional: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/disponibilidade?profissionalId=${idProfissional}`, {
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      if (response.ok) setDisponibilidades(await response.json());
      else setDisponibilidades([]);
    } catch (error) { console.error("Erro ao carregar disponibilidade", error); }
  };

  const exibirSucesso = (mensagem: string) => {
    setSucesso(mensagem);
    setTimeout(() => setSucesso(""), 3000);
  };

  const exibirErroPrincipal = (mensagem: string) => {
    setErroPrincipal(mensagem);
    setTimeout(() => setErroPrincipal(""), 4000);
  };

  const abrirModal = (diaSemana: number) => {
    setDiaSelecionado(diaSemana);
    setHoraInicio("09:00");
    setHoraFim("19:00");
    setErro("");
    setModalAberto(true);
  };

  const salvarTurno = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/disponibilidade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${obterToken()}`
        },
        body: JSON.stringify({ 
          diaSemana: diaSelecionado, 
          horaInicio, 
          horaFim, 
          profissionalId: Number(profissionalSelecionado) 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setModalAberto(false);
        carregarDisponibilidades(profissionalSelecionado);
        exibirSucesso("Horário adicionado com sucesso!");
      } else {
        setErro(data.msg || "Erro ao salvar o turno.");
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

  const abrirModalExcluirTurno = (idExclusao: string) => {
    setConfirmModal({
      isOpen: true,
      titulo: "Remover Horário?",
      mensagem: "Deseja remover este horário de trabalho da escala do barbeiro?",
      tipo: "perigo", // Vermelho
      onConfirm: () => efetivarExclusaoTurno(idExclusao)
    });
  };

  const efetivarExclusaoTurno = async (idExclusao: string) => {
    setConfirmModal({ ...confirmModal, isOpen: false }); // Fecha o modal
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/disponibilidade/${idExclusao}`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      if (response.ok) {
        carregarDisponibilidades(profissionalSelecionado);
        exibirSucesso("Horário removido com sucesso!");
      } else {
        exibirErroPrincipal("Não foi possível remover o horário.");
      }
    } catch (error) { 
      console.error(error); 
      exibirErroPrincipal("Erro de conexão ao remover.");
    }
  };


  const formatarHora = (hora: string) => hora ? hora.substring(0, 5) : "";

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Escala de Trabalho
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Defina os dias e horários fixos de cada barbeiro</p>
          </div>
        </div>
        <button onClick={iniciarTour} className="px-4 py-2 bg-zinc-800 text-[#E4B77D] font-bold rounded-md hover:bg-zinc-700 transition-all border border-[#E4B77D]/30 hover:border-[#E4B77D]/70 flex items-center gap-2 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ? Ajuda
        </button>
      </header>

      {/* FEEDBACKS VISUAIS */}
      {sucesso && (
        <div className="max-w-6xl mx-auto mb-6 bg-green-950/50 border border-green-900 text-green-400 p-4 rounded-lg flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">{sucesso}</span>
        </div>
      )}

      {erroPrincipal && (
        <div className="max-w-6xl mx-auto mb-6 bg-red-950/50 border border-red-900 text-red-400 p-4 rounded-lg flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="font-medium">{erroPrincipal}</span>
        </div>
      )}

      {/* SELETOR DE PROFISSIONAL */}
      <div id="tour-seletor-barb" className="max-w-6xl mx-auto mb-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg">
        <label className="block text-sm font-bold text-zinc-300 uppercase tracking-widest mb-3">Selecione a agenda do barbeiro:</label>
        <select 
          value={profissionalSelecionado} onChange={(e) => setProfissionalSelecionado(e.target.value)}
          className="w-full md:w-1/2 bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white text-lg focus:outline-none focus:border-[#E4B77D] appearance-none cursor-pointer"
        >
          <option value="" disabled>Escolha um profissional...</option>
          {profissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
      </div>

      {/* SÓ MOSTRA OS DIAS SE UM BARBEIRO ESTIVER SELECIONADO */}
      {profissionalSelecionado ? (
        <main id="tour-grade-semana" className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-500">
          {DIAS_SEMANA.map((nomeDia, indexDia) => {
            // Filtra apenas os turnos daquele dia da semana
            const turnosDesteDia = disponibilidades.filter(d => d.diaSemana === indexDia);

            return (
              <div key={indexDia} className="bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col overflow-hidden shadow-lg hover:border-zinc-700 transition-colors">
                
                {/* Cabeçalho do Card */}
                <div className="bg-zinc-950/50 border-b border-zinc-800 p-4 flex justify-between items-center">
                  <h3 className="font-bold text-white text-lg">{nomeDia}</h3>
                  {turnosDesteDia.length === 0 ? (
                    <span className="text-[10px] uppercase font-bold bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-md border border-zinc-700">Folga</span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold bg-[#E4B77D]/20 text-[#E4B77D] px-2 py-0.5 rounded-md border border-[#E4B77D]/30">Trabalha</span>
                  )}
                </div>

                {/* Lista de Horários */}
                <div className="p-4 flex-grow flex flex-col gap-2">
                  {turnosDesteDia.length === 0 ? (
                    <p className="text-sm text-zinc-500 italic text-center py-4">Nenhum horário definido.</p>
                  ) : (
                    turnosDesteDia.map(turno => (
                      <div key={turno.id} className="flex justify-between items-center bg-zinc-950 border border-zinc-800 rounded-lg p-3 group hover:border-[#E4B77D]/50 transition-colors">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[#E4B77D]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span className="font-mono font-bold tracking-wider">{formatarHora(turno.horaInicio)} às {formatarHora(turno.horaFim)}</span>
                        </div>
                        {/* BOTÃO ALTERADO PARA CHAMAR O MODAL */}
                        <button 
                          onClick={() => abrirModalExcluirTurno(turno.id)} 
                          className="text-zinc-600 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-md transition-colors"
                          title="Remover Horário"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Botão de Adicionar */}
                <div className="p-3 border-t border-zinc-800 bg-zinc-900/50">
                  <button 
                    onClick={() => abrirModal(indexDia)}
                    className="w-full py-2 text-sm font-bold text-[#E4B77D] hover:bg-[#E4B77D]/10 rounded-lg transition-colors border border-dashed border-[#E4B77D]/30 hover:border-[#E4B77D]"
                  >
                    + Adicionar Horário
                  </button>
                </div>
              </div>
            );
          })}
        </main>
      ) : (
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center py-20 text-zinc-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mb-4 opacity-30">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-xl">Selecione um barbeiro acima para montar a escala.</p>
        </div>
      )}

      {/* MODAL ADICIONAR TURNO */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModalAberto(false)} />
          
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-sm p-6 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white mb-2">Novo Horário</h2>
            <p className="text-sm text-[#E4B77D] mb-6 font-bold uppercase tracking-widest">
              {DIAS_SEMANA[diaSelecionado]}
            </p>

            <form onSubmit={salvarTurno} className="flex flex-col gap-4">
              {erro && <div className="bg-red-950/50 border border-red-900 text-red-400 text-sm p-3 rounded-md">{erro}</div>}
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Início</label>
                  <input 
                    type="time" required value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Fim</label>
                  <input 
                    type="time" required value={horaFim} onChange={(e) => setHoraFim(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                  />
                </div>
              </div>
              <p className="text-xs text-zinc-500 mb-2">Dica: Se faz horário de almoço, crie dois horários diferentes (Ex: 09h às 12h, depois 13h às 19h).</p>

              <div className="flex gap-3 mt-2 pt-4 border-t border-zinc-800">
                <button type="button" onClick={() => setModalAberto(false)} className="flex-1 py-3 border border-zinc-700 text-zinc-300 rounded-md hover:bg-zinc-800 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-[#E4B77D] text-black font-bold rounded-md hover:bg-[#cfa56d] transition-colors disabled:opacity-50">
                  {loading ? "Salvando..." : "Salvar"}
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