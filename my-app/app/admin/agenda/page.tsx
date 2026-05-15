"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import ConfirmModal from "../../components/ConfirmModal";

// ═══════════════════════════════════════════════════════════════
// TOUR
// ═══════════════════════════════════════════════════════════════

const TOUR_STEPS = [
  { targetId: "tour-seletor-prof", titulo: "Seletor de Barbeiro", descricao: "Escolha o barbeiro cuja agenda deseja visualizar. Ao selecionar, a grade de horários e o calendário são carregados automaticamente.", posicao: "bottom" as const },
  { targetId: "tour-novo-encaixe", titulo: "Novo Encaixe", descricao: "Clique aqui para abrir o formulário de agendamento manual. Você pode escolher o horário, cliente e serviços diretamente pelo painel.", posicao: "left" as const },
  { targetId: "tour-calendario", titulo: "Navegação por Data", descricao: "Use o calendário para navegar entre os dias. O dia selecionado fica destacado em dourado. Use as setas para avançar ou retroceder dias rapidamente.", posicao: "bottom" as const },
  { targetId: "tour-grade", titulo: "Grade de Horários", descricao: "Exibe os horários disponíveis do barbeiro para o dia selecionado. Passe o mouse sobre um horário livre para ver o botão de agendar. Horários com status são coloridos: azul (agendado), verde (concluído), vermelho (cancelado) e amarelo (em atendimento).", posicao: "top" as const },
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

export default function AgendaAdmin() {
  const [tourAtivo, setTourAtivo] = useState(false);
  const [tourPasso, setTourPasso] = useState(0);
  const [tourEntrando, setTourEntrando] = useState(false);
  const iniciarTour = () => { setTourPasso(0); setTourEntrando(true); setTourAtivo(true); setTimeout(() => setTourEntrando(false), 350); };
  const irParaPasso = useCallback((novo: number) => { setTourEntrando(true); setTimeout(() => { setTourPasso(novo); setTimeout(() => setTourEntrando(false), 50); }, 150); }, []);

  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [dataVisualizacao, setDataVisualizacao] = useState(new Date());
  
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados para os dados vindos do Banco
  const [listaClientes, setListaClientes] = useState<any[]>([]);
  const [listaProfissionais, setListaProfissionais] = useState<any[]>([]);
  const [listaServicos, setListaServicos] = useState<any[]>([]);
  
  // === ESTADOS PARA A LÓGICA DINÂMICA ===
  const [profissionalFiltro, setProfissionalFiltro] = useState<string>("");
  const [disponibilidades, setDisponibilidades] = useState<any[]>([]);
  const [horariosDinamicos, setHorariosDinamicos] = useState<string[]>([]);
  const [horariosOcupadosArray, setHorariosOcupadosArray] = useState<string[]>([]); // Guarda os blocos bloqueados
  // ============================================

  const [abaAtiva, setAbaAtiva] = useState<"diaria" | "todos">("diaria");
  const [agendamentosTodos, setAgendamentosTodos] = useState<any[]>([]);
  const [loadingTodos, setLoadingTodos] = useState(false);
  const [filtroStatusTodos, setFiltroStatusTodos] = useState("");

  // Estados do Modal de Novo Agendamento
  const [modalAberto, setModalAberto] = useState(false);
  const [horaSelecionada, setHoraSelecionada] = useState("");
  const [profissionalSelecionado, setProfissionalSelecionado] = useState("");
  const [servicosSelecionados, setServicosSelecionados] = useState<number[]>([]);
  const [observacao, setObservacao] = useState("");
  const [erroModal, setErroModal] = useState("");

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    titulo: "",
    mensagem: "",
    tipo: "atencao" as "atencao" | "perigo",
    onConfirm: () => {}
  });

  const [clienteSelecionado, setClienteSelecionado] = useState<number | "">("");
  const [buscaCliente, setBuscaCliente] = useState("");
  const [dropdownClienteAberto, setDropdownClienteAberto] = useState(false);
  
  const clientesFiltrados = listaClientes.filter(c => 
    c.nome.toLowerCase().includes(buscaCliente.toLowerCase())
  );

  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickFora = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownClienteAberto(false);
      }
    };
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  const obterToken = () => localStorage.getItem("token") || "";

  useEffect(() => {
    carregarDadosBase();
  }, []);

  useEffect(() => {
    setDataVisualizacao(new Date(dataSelecionada.getFullYear(), dataSelecionada.getMonth(), 1));
    if (profissionalFiltro) {
      carregarAgendamentosEHorarios();
    } else {
      setAgendamentos([]);
      setHorariosDinamicos([]);
      setHorariosOcupadosArray([]);
    }
  }, [dataSelecionada, profissionalFiltro]);

  useEffect(() => {
    if (abaAtiva === "todos" && profissionalFiltro) {
      carregarTodosAgendamentos();
    }
  }, [abaAtiva, profissionalFiltro, filtroStatusTodos]);

  const carregarDadosBase = async () => {
    try {
      const headers = { "Authorization": `Bearer ${obterToken()}` };
      const resClientes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuario`, { headers });
      if(resClientes.ok) setListaClientes(await resClientes.json());

      const resPro = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pessoas/profissionais`, { headers });
      if(resPro.ok) {
        const profs = await resPro.json();
        setListaProfissionais(profs);
        if (profs.length > 0) setProfissionalFiltro(String(profs[0].id));
      }

      const resServicos = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/servicos`, { headers });
      if(resServicos.ok) setListaServicos(await resServicos.json());
    } catch (error) { console.error("Erro ao carregar listas base", error); }
  };

  const carregarAgendamentosEHorarios = async () => {
    setLoading(true);
    try {
      const ano = dataSelecionada.getFullYear();
      const mes = String(dataSelecionada.getMonth() + 1).padStart(2, '0');
      const dia = String(dataSelecionada.getDate()).padStart(2, '0');
      const dataFormatada = `${ano}-${mes}-${dia}`;

      const resAgendamentos = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agendamentos?data=${dataFormatada}`, {
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      let agendamentosDia = [];
      if (resAgendamentos.ok) {
        agendamentosDia = await resAgendamentos.json();
        agendamentosDia = agendamentosDia.filter((a: any) => a.profissionalId === Number(profissionalFiltro));
      }
      setAgendamentos(agendamentosDia);

      const resDisp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/disponibilidade?profissionalId=${profissionalFiltro}`, {
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      if (resDisp.ok) {
        const disponibilidadesProf = await resDisp.json();
        setDisponibilidades(disponibilidadesProf);
        gerarHorariosDinamicos(dataSelecionada, disponibilidadesProf);
      }

      const resOcupados = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agendamentos/ocupados?data=${dataFormatada}&profissionalId=${profissionalFiltro}`, {
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      if (resOcupados.ok) {
        setHorariosOcupadosArray(await resOcupados.json());
      }

    } catch (error) { console.error("Erro:", error); }
    finally { setLoading(false); }
  };

  const carregarTodosAgendamentos = async () => {
    if (!profissionalFiltro) { setAgendamentosTodos([]); return; }
    setLoadingTodos(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/agendamentos/relatorio/agenda?profissionalId=${profissionalFiltro}`;
      if (filtroStatusTodos) url += `&status=${filtroStatusTodos}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${obterToken()}` } });
      if (res.ok) setAgendamentosTodos(await res.json());
    } catch (e) { console.error("Erro ao carregar todos os agendamentos:", e); }
    finally { setLoadingTodos(false); }
  };

  const gerarHorariosDinamicos = (dataReferencia: Date, dispProfissional: any[]) => {
    const diaSemana = dataReferencia.getDay(); 
    const turnosDoDia = dispProfissional.filter(d => d.diaSemana === diaSemana);
    
    let slotsGerados: string[] = [];

    turnosDoDia.forEach(turno => {
      let [hInicio, mInicio] = turno.horaInicio.split(':').map(Number);
      let [hFim, mFim] = turno.horaFim.split(':').map(Number);

      let dataAtual = new Date();
      dataAtual.setHours(hInicio, mInicio, 0, 0);

      let dataFimTurno = new Date();
      dataFimTurno.setHours(hFim, mFim, 0, 0);

      while (dataAtual < dataFimTurno) {
        slotsGerados.push(dataAtual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
        dataAtual.setMinutes(dataAtual.getMinutes() + 30);
      }
    });
    setHorariosDinamicos([...new Set(slotsGerados)].sort());
  };

  const isHoraPassada = (horaString: string) => {
    const hoje = new Date();
    const dataSel = new Date(dataSelecionada.getFullYear(), dataSelecionada.getMonth(), dataSelecionada.getDate());
    const dataHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

    if (dataSel < dataHoje) return true;
    if (dataSel > dataHoje) return false;

    const [horaSelecionadaNum, minutoSelecionadoNum] = horaString.split(':').map(Number);
    const horaAtual = hoje.getHours();
    const minutoAtual = hoje.getMinutes();

    if (horaSelecionadaNum < horaAtual) return true;
    if (horaSelecionadaNum === horaAtual && minutoSelecionadoNum <= minutoAtual) return true;
    
    return false;
  };

  const calcularTempoTotal = () => {
    return servicosSelecionados.reduce((total, idServico) => {
      const servico = listaServicos.find(s => s.id === idServico);
      return total + (servico?.tempoEstimadoMinutos || 0);
    }, 0);
  };

  const calcularHoraFim = () => {
    const tempoTotal = calcularTempoTotal();
    if (tempoTotal === 0 || !horaSelecionada) return "";

    const [horas, minutos] = horaSelecionada.split(":").map(Number);
    const dataTemp = new Date();
    dataTemp.setHours(horas, minutos + tempoTotal, 0);
    return dataTemp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // ==========================================
  // NOVAS FUNÇÕES USANDO O MODAL CUSTOMIZADO
  // ==========================================
  
  const abrirModalConcluir = (id: number) => {
    setConfirmModal({
      isOpen: true,
      titulo: "Concluir Agendamento?",
      mensagem: "Deseja marcar este agendamento como CONCLUÍDO?",
      tipo: "atencao",
      onConfirm: () => efetivarConclusao(id)
    });
  };

  const efetivarConclusao = async (id: number) => {
    setConfirmModal({ ...confirmModal, isOpen: false }); // Fecha o modal
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agendamentos/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${obterToken()}` },
        body: JSON.stringify({ status: "CONCLUIDO" })
      });
      if (response.ok) {
        if (abaAtiva === "todos") carregarTodosAgendamentos();
        else carregarAgendamentosEHorarios();
      } else { alert("Erro ao concluir o agendamento."); }
    } catch (error) { console.error(error); }
  };

  const abrirModalCancelar = (id: number) => {
    setConfirmModal({
      isOpen: true,
      titulo: "Cancelar Agendamento?",
      mensagem: "Atenção: Deseja realmente CANCELAR este agendamento?",
      tipo: "perigo", // Deixa o botão vermelho!
      onConfirm: () => efetivarCancelamento(id)
    });
  };

  const efetivarCancelamento = async (id: number) => {
    setConfirmModal({ ...confirmModal, isOpen: false }); // Fecha o modal
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agendamentos/${id}/cancelar`, {
        method: "PUT", headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      if (response.ok) {
        if (abaAtiva === "todos") carregarTodosAgendamentos();
        else carregarAgendamentosEHorarios();
      } else { alert("Erro ao cancelar."); }
    } catch (error) { console.error(error); }
  };
  // ==========================================

  const abrirModal = (hora: string = "") => {
    if (!profissionalFiltro) {
      alert("Selecione um profissional primeiro!");
      return;
    }

    if (hora && !isHoraPassada(hora)) {
      setHoraSelecionada(hora);
    } else {
      const primeiroDisponivel = horariosDinamicos.find(h => !isHoraPassada(h));
      if (!primeiroDisponivel) {
        alert("Não há mais horários disponíveis ou livres para hoje.");
        return;
      }
      setHoraSelecionada(primeiroDisponivel);
    }
    
    setClienteSelecionado("");
    setBuscaCliente("");
    setProfissionalSelecionado(profissionalFiltro);
    setServicosSelecionados([]);
    setObservacao("");
    setErroModal("");
    setModalAberto(true);
  };

  const handleCheckboxServico = (idServico: number, checked: boolean) => {
    if (checked) setServicosSelecionados([...servicosSelecionados, idServico]);
    else setServicosSelecionados(servicosSelecionados.filter(id => id !== idServico));
  };

  const salvarAgendamento = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErroModal("");

    if (!clienteSelecionado) {
      setErroModal("Por favor, selecione um cliente na lista.");
      setLoading(false); return;
    }

    if (servicosSelecionados.length === 0) {
      setErroModal("Selecione pelo menos um serviço.");
      setLoading(false); return;
    }

    const ano = dataSelecionada.getFullYear();
    const mes = String(dataSelecionada.getMonth() + 1).padStart(2, '0');
    const dia = String(dataSelecionada.getDate()).padStart(2, '0');
    const dataHoraFormatada = `${ano}-${mes}-${dia}T${horaSelecionada}:00`;

    const payload = {
      dataHora: dataHoraFormatada,
      clienteId: Number(clienteSelecionado),
      profissionalId: Number(profissionalSelecionado),
      observacao: observacao,
      servicos: servicosSelecionados.map(id => ({ id }))
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agendamentos`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${obterToken()}` },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok) {
        setModalAberto(false);
        carregarAgendamentosEHorarios();
      } else { setErroModal(data.msg || "Erro ao salvar agendamento."); }
    } catch (error) { setErroModal("Erro de conexão com a API."); } 
    finally { setLoading(false); }
  };

  const extrairHoraDeISO = (isoString: string) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatarDataHeader = (data: Date) => data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const hoje = () => setDataSelecionada(new Date());
  const diaAnterior = () => { const d = new Date(dataSelecionada); d.setDate(d.getDate() - 1); setDataSelecionada(d); };
  const proximoDia = () => { const d = new Date(dataSelecionada); d.setDate(d.getDate() + 1); setDataSelecionada(d); };
  const mesAnteriorCalendario = () => setDataVisualizacao(new Date(dataVisualizacao.getFullYear(), dataVisualizacao.getMonth() - 1, 1));
  const proximoMesCalendario = () => setDataVisualizacao(new Date(dataVisualizacao.getFullYear(), dataVisualizacao.getMonth() + 1, 1));

  const renderizarDiasDoMes = () => {
    const ano = dataVisualizacao.getFullYear();
    const mes = dataVisualizacao.getMonth();
    const primeiroDiaSemana = new Date(ano, mes, 1).getDay(); 
    const totalDiasNoMes = new Date(ano, mes + 1, 0).getDate();

    const dias = [];
    for (let i = 0; i < primeiroDiaSemana; i++) dias.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    for (let i = 1; i <= totalDiasNoMes; i++) {
      const dataDesteDia = new Date(ano, mes, i);
      const isSelecionado = dataDesteDia.toDateString() === dataSelecionada.toDateString();
      const isHoje = dataDesteDia.toDateString() === new Date().toDateString();

      dias.push(
        <button
          key={i}
          onClick={() => setDataSelecionada(new Date(ano, mes, i))}
          className={`w-8 h-8 flex items-center justify-center rounded-full text-xs transition-colors mx-auto
            ${isSelecionado ? "bg-[#E4B77D] text-black font-bold shadow-md shadow-[#E4B77D]/20" 
            : isHoje ? "border border-[#E4B77D] text-[#E4B77D] font-bold" 
            : "text-zinc-400 hover:bg-zinc-800 hover:text-white font-medium"}
          `}
        >
          {i}
        </button>
      );
    }
    return dias;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 font-sans">
      {tourAtivo && (<Tour passo={tourPasso} entrando={tourEntrando} onProximo={() => irParaPasso(tourPasso + 1)} onAnterior={() => irParaPasso(tourPasso - 1)} onFechar={() => setTourAtivo(false)} />)}
      {/* CABEÇALHO */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8 border-b border-zinc-900 pb-4 max-w-7xl mx-auto">
        <div id="tour-seletor-prof" className="flex items-center gap-4">
          <Link href="/admin" className="w-12 h-12 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-[#E4B77D] transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#E4B77D]">Agenda do Barbeiro</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-zinc-400">Exibindo agenda de:</span>
              <select
                value={profissionalFiltro}
                onChange={(e) => setProfissionalFiltro(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded text-white text-sm font-bold p-1 focus:outline-none focus:border-[#E4B77D]"
              >
                <option value="" disabled>Selecione...</option>
                {listaProfissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={iniciarTour} className="px-4 py-2 bg-zinc-800 text-[#E4B77D] font-bold rounded-md hover:bg-zinc-700 transition-all border border-[#E4B77D]/30 hover:border-[#E4B77D]/70 flex items-center gap-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ? Ajuda
          </button>
          <button
            id="tour-novo-encaixe"
            onClick={() => abrirModal()}
            disabled={horariosDinamicos.length === 0}
            className="px-6 py-3 bg-[#E4B77D] text-black font-bold rounded-md hover:bg-[#cfa56d] transition-colors shadow-lg shadow-[#E4B77D]/10 flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Novo Encaixe
          </button>
        </div>
      </header>

      {/* ABAS */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
          <button
            onClick={() => setAbaAtiva("diaria")}
            className={`py-2 px-5 rounded-lg text-sm font-bold transition-all ${abaAtiva === "diaria" ? "bg-[#E4B77D] text-black shadow-md" : "text-zinc-400 hover:text-white"}`}
          >
            Agenda Diária
          </button>
          <button
            onClick={() => setAbaAtiva("todos")}
            className={`py-2 px-5 rounded-lg text-sm font-bold transition-all ${abaAtiva === "todos" ? "bg-[#E4B77D] text-black shadow-md" : "text-zinc-400 hover:text-white"}`}
          >
            Todos os Agendamentos
          </button>
        </div>
      </div>

      {abaAtiva === "diaria" && (
      <main className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* COLUNA ESQUERDA: Navegação */}
        <aside id="tour-calendario" className="w-full lg:w-80 flex flex-col gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[#E4B77D]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Navegação
            </h2>
            <div className="flex flex-col gap-3 mb-6">
              <button onClick={hoje} className="w-full py-2 bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700 hover:text-white transition-colors text-sm font-medium border border-zinc-700">Ir para Hoje</button>
              <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-lg p-1">
                <button onClick={diaAnterior} className="p-2 text-zinc-400 hover:text-[#E4B77D] transition-colors rounded-md hover:bg-zinc-900"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                <span className="font-bold text-xs text-zinc-300 text-center uppercase tracking-wider">Dia Selecionado</span>
                <button onClick={proximoDia} className="p-2 text-zinc-400 hover:text-[#E4B77D] transition-colors rounded-md hover:bg-zinc-900"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
              </div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <button onClick={mesAnteriorCalendario} className="p-1 text-zinc-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                <span className="text-sm font-bold text-white capitalize">{dataVisualizacao.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                <button onClick={proximoMesCalendario} className="p-1 text-zinc-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">{['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((dia, idx) => <span key={idx} className="text-[10px] font-bold text-zinc-600">{dia}</span>)}</div>
              <div className="grid grid-cols-7 gap-y-2 gap-x-1">{renderizarDiasDoMes()}</div>
            </div>
            <div className="mt-6 border-t border-zinc-800 pt-6">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Legenda</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-zinc-800 border border-zinc-700"></span> Horário Livre</li>
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500"></span> Em Atendimento</li>
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500"></span> Agendado</li>
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500"></span> Concluído</li>
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500"></span> Cancelado</li>
              </ul>
            </div>
          </div>
        </aside>

        {/* COLUNA DIREITA: Grade de Horários */}
        <section id="tour-grade" className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg overflow-hidden flex flex-col">
          <div className="bg-zinc-950/50 p-6 border-b border-zinc-800 flex justify-between items-center relative">
            <h2 className="text-xl font-bold capitalize text-white">{formatarDataHeader(dataSelecionada)}</h2>
            <span className="px-3 py-1 bg-[#E4B77D]/10 text-[#E4B77D] border border-[#E4B77D]/20 rounded-full text-xs font-bold">
              {agendamentos.filter(a => a.status === 'AGENDADO').length} Pendentes
            </span>
            {loading && (
              <div className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center z-10">
                 <div className="w-6 h-6 border-2 border-[#E4B77D] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <div className="p-2 flex-1 overflow-y-auto min-h-[400px]">
            {horariosDinamicos.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 py-20">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mb-4 opacity-50">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <p className="text-lg font-medium">Dia de Folga</p>
                <p className="text-sm">Nenhum horário de trabalho configurado para este dia.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 p-4">
                {horariosDinamicos.map((hora) => {
                  const agendamentosDaHora = agendamentos.filter(a => extrairHoraDeISO(a.dataHora) === hora);
                  let agendamento = agendamentosDaHora.find(a => a.status === "AGENDADO" || a.status === "CONCLUIDO");
                  if (!agendamento && agendamentosDaHora.length > 0) agendamento = agendamentosDaHora[0]; 

                  const passouDaHora = !agendamento && isHoraPassada(hora); 
                  
                  const isEmAtendimento = !agendamento && horariosOcupadosArray.includes(hora) && !passouDaHora;

                  let bgClass = "bg-zinc-950 border-zinc-800 hover:border-[#E4B77D]/50";
                  let textClass = "text-zinc-500";
                  
                  if (agendamento) {
                    if (agendamento.status === "AGENDADO") { bgClass = "bg-blue-950/30 border-blue-900/50"; textClass = "text-blue-400"; } 
                    else if (agendamento.status === "CONCLUIDO") { bgClass = "bg-green-950/30 border-green-900/50 opacity-60"; textClass = "text-green-400"; } 
                    else if (agendamento.status === "CANCELADO") { bgClass = "bg-red-950/20 border-red-900/30 opacity-50"; textClass = "text-red-400"; }
                  } else if (isEmAtendimento) {
                    bgClass = "bg-yellow-950/10 border-yellow-900/30 hover:border-[#E4B77D]/50"; 
                    textClass = "text-yellow-600";
                  } else if (passouDaHora) {
                    bgClass = "bg-zinc-900/30 border-zinc-900 opacity-50 pointer-events-none";
                  }

                  const isDisponivelParaAgendar = !agendamento || agendamento.status === "CANCELADO";

                  return (
                    <div key={hora} className={`flex items-stretch border rounded-lg transition-all group ${bgClass}`}>
                      <div className={`w-20 p-4 flex flex-col items-center justify-center border-r border-zinc-800/50 font-mono font-bold text-lg ${agendamento && agendamento.status !== "CANCELADO" ? textClass : (passouDaHora ? 'text-zinc-700 line-through' : isEmAtendimento ? textClass : 'text-zinc-500 group-hover:text-[#E4B77D]')}`}>
                        {hora}
                      </div>

                      <div className="flex-1 p-4 flex items-center justify-between">
                        {agendamento && agendamento.status !== "CANCELADO" ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-lg">{agendamento.clienteNome} <span className="text-xs text-zinc-500 font-normal">com {agendamento.profissionalNome}</span></span>
                              <span className="text-sm text-[#E4B77D] font-medium flex items-center gap-2 mt-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" /></svg>
                              {agendamento.nomesServicos || "Nenhum serviço atrelado"}
                            </span>
                            {agendamento.observacao && (
                              <span className="text-xs text-zinc-500 italic mt-1">
                                Obs: {agendamento.observacao}
                              </span>
                              )}
                          </div>
                        ) : (
                          <span className={`italic text-sm transition-colors ${passouDaHora ? 'text-zinc-700' : isEmAtendimento ? 'text-yellow-600/80 font-medium' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                            {passouDaHora ? "Horário indisponível (já passou)" : isEmAtendimento ? "Horário Ocupado (Em atendimento)" : "Horário disponível..."}
                          </span>
                        )}

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {agendamento && agendamento.status === 'AGENDADO' && (
                            <>
                              {/* CHAMANDO O MODAL AQUI */}
                              <button onClick={() => abrirModalCancelar(agendamento.id)} className="p-2 text-zinc-400 hover:text-red-400 bg-zinc-900 rounded-md border border-zinc-800" title="Cancelar Agendamento">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                              {/* CHAMANDO O MODAL AQUI */}
                              <button onClick={() => abrirModalConcluir(agendamento.id)} className="p-2 text-zinc-400 hover:text-green-400 bg-zinc-900 rounded-md border border-zinc-800" title="Marcar como Concluído">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              </button>
                            </>
                          )}
                          
                          {isDisponivelParaAgendar && !passouDaHora && (
                              <button onClick={() => abrirModal(hora)} className="px-4 py-2 text-sm font-bold bg-zinc-800 text-[#E4B77D] rounded-md hover:bg-zinc-700 transition-colors border border-zinc-700">
                                Agendar
                              </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      )}

      {abaAtiva === "todos" && (
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <span className="text-sm text-zinc-400 font-medium">Filtrar por status:</span>
            <select
              value={filtroStatusTodos}
              onChange={(e) => setFiltroStatusTodos(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E4B77D]"
            >
              <option value="">Todos</option>
              <option value="AGENDADO">Agendados</option>
              <option value="CONCLUIDO">Concluídos</option>
              <option value="CANCELADO">Cancelados</option>
            </select>
            <span className="text-sm text-zinc-600">
              {agendamentosTodos.length} agendamento{agendamentosTodos.length !== 1 ? "s" : ""} encontrado{agendamentosTodos.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loadingTodos ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#E4B77D] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : agendamentosTodos.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-zinc-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mb-4 opacity-30">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-medium">Nenhum agendamento encontrado</p>
              <p className="text-sm mt-1">Tente ajustar os filtros ou selecione outro barbeiro.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {Object.entries(
                agendamentosTodos.reduce((acc: Record<string, any[]>, ag: any) => {
                  const key = ag.dataHora ? String(ag.dataHora).split('T')[0] : "sem-data";
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(ag);
                  return acc;
                }, {})
              )
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([dataKey, ags]) => {
                const [ano, mes, dia] = dataKey.split('-').map(Number);
                const dataLabel = new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                const hojeKey = new Date().toISOString().split('T')[0];
                const isHoje = dataKey === hojeKey;
                const isPast = dataKey < hojeKey;
                return (
                  <div key={dataKey}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`w-1 h-5 rounded-full ${isHoje ? 'bg-[#E4B77D]' : isPast ? 'bg-zinc-700' : 'bg-blue-500'}`} />
                      <h3 className="text-sm font-bold uppercase tracking-wider capitalize text-zinc-400">{dataLabel}</h3>
                      {isHoje && <span className="text-[10px] bg-[#E4B77D]/20 text-[#E4B77D] border border-[#E4B77D]/30 rounded-full px-2 py-0.5 font-bold">HOJE</span>}
                      <span className="text-xs text-zinc-600 ml-auto">{ags.length} agendamento{ags.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex flex-col gap-2 pl-4">
                      {(ags as any[]).sort((a, b) => String(a.dataHora).localeCompare(String(b.dataHora))).map((ag: any) => {
                        const hora = extrairHoraDeISO(ag.dataHora);
                        const statusStyles: Record<string, string> = {
                          AGENDADO: "bg-blue-950/40 border-blue-900/60 text-blue-400",
                          CONCLUIDO: "bg-green-950/40 border-green-900/60 text-green-400",
                          CANCELADO: "bg-red-950/30 border-red-900/40 text-red-400",
                        };
                        const cardStyle = ag.status === "AGENDADO"
                          ? "bg-zinc-900 border-zinc-800 hover:border-[#E4B77D]/30"
                          : ag.status === "CONCLUIDO"
                          ? "bg-zinc-900/60 border-zinc-800/60 opacity-75"
                          : "bg-zinc-900/40 border-zinc-800/40 opacity-55";
                        return (
                          <div key={ag.id} className={`flex items-center gap-4 border rounded-lg p-4 transition-all group ${cardStyle}`}>
                            <div className="w-16 text-center font-mono font-bold text-xl text-[#E4B77D] shrink-0">{hora}</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-white truncate">{ag.clienteNome}</p>
                              <p className="text-sm text-zinc-400 flex items-center gap-1 mt-0.5 truncate">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="shrink-0"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" /></svg>
                                {ag.nomesServicos || "Nenhum serviço"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusStyles[ag.status] || "bg-zinc-800 border-zinc-700 text-zinc-400"}`}>
                                {ag.status}
                              </span>
                              {ag.status === "AGENDADO" && (
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => abrirModalCancelar(ag.id)} className="p-1.5 text-zinc-400 hover:text-red-400 bg-zinc-800 rounded-md border border-zinc-700 transition-colors" title="Cancelar">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                  <button onClick={() => abrirModalConcluir(ag.id)} className="p-1.5 text-zinc-400 hover:text-green-400 bg-zinc-800 rounded-md border border-zinc-700 transition-colors" title="Concluir">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL DE NOVO AGENDAMENTO */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModalAberto(false)} />
          
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-lg p-6 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[#E4B77D]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Novo Encaixe
            </h2>
            <p className="text-sm text-zinc-400 mb-6">
              Data: <strong className="text-white">{dataSelecionada.toLocaleDateString('pt-BR')}</strong>
            </p>

            <form onSubmit={salvarAgendamento} className="flex flex-col gap-4">
              {erroModal && <div className="bg-red-950/50 border border-red-900 text-red-400 text-sm p-3 rounded-md">{erroModal}</div>}
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Horário de Início</label>
                  <select 
                    value={horaSelecionada} onChange={(e) => setHoraSelecionada(e.target.value)} required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-[#E4B77D] font-bold focus:outline-none focus:border-[#E4B77D] appearance-none"
                  >
                    {horariosDinamicos.map(h => (
                      <option key={h} value={h} disabled={isHoraPassada(h)}>
                        {h} {isHoraPassada(h) ? '(Indisponível)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-[2]">
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Profissional</label>
                  <select 
                    value={profissionalSelecionado} disabled required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white opacity-70 appearance-none cursor-not-allowed"
                  >
                    {listaProfissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
              </div>

              {/* BUSCADOR DE CLIENTES */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Cliente</label>
                <input 
                  type="text" placeholder="Busque pelo nome..." value={buscaCliente}
                  onChange={(e) => { setBuscaCliente(e.target.value); setDropdownClienteAberto(true); setClienteSelecionado(""); }}
                  onFocus={() => setDropdownClienteAberto(true)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                />
                
                {dropdownClienteAberto && (
                  <ul className="absolute z-20 w-full mt-1 max-h-48 overflow-y-auto bg-zinc-800 border border-zinc-700 rounded-md shadow-2xl custom-scrollbar">
                    {clientesFiltrados.length > 0 ? (
                      clientesFiltrados.map(c => (
                        <li 
                          key={c.id} 
                          onClick={() => { setClienteSelecionado(c.id); setBuscaCliente(c.nome); setDropdownClienteAberto(false); }}
                          className="px-4 py-3 hover:bg-zinc-700 cursor-pointer text-zinc-300 hover:text-white transition-colors border-b border-zinc-700/50 last:border-0"
                        >
                          {c.nome} <span className="text-xs text-zinc-500 ml-2">{c.telefone}</span>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-3 text-zinc-500 italic text-sm">Nenhum cliente encontrado.</li>
                    )}
                  </ul>
                )}
                
                {clienteSelecionado && !dropdownClienteAberto && (
                  <span className="absolute right-3 top-10 text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </span>
                )}
              </div>

              {/* CHECKBOXES DE SERVIÇOS */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2 flex justify-between">
                  <span>Serviços (Selecione)</span>
                  {calcularTempoTotal() > 0 && (
                    <span className="text-[#E4B77D] font-bold">Total: {calcularTempoTotal()} min</span>
                  )}
                </label>
                
                <div className="bg-zinc-900 border border-zinc-800 rounded-md p-3 max-h-36 overflow-y-auto flex flex-col gap-3 custom-scrollbar">
                  {listaServicos.length === 0 ? (
                    <span className="text-zinc-500 text-sm">Nenhum serviço cadastrado no sistema.</span>
                  ) : (
                    listaServicos.map(serv => (
                      <label key={serv.id} className="flex items-center justify-between cursor-pointer group p-1 hover:bg-zinc-800/50 rounded-md transition-colors">
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            checked={servicosSelecionados.includes(serv.id)}
                            onChange={(e) => handleCheckboxServico(serv.id, e.target.checked)}
                            className="w-4 h-4 accent-[#E4B77D] cursor-pointer"
                          />
                          <span className="text-zinc-300 group-hover:text-white transition-colors">{serv.nome}</span>
                        </div>
                        <span className="text-xs font-mono text-zinc-500">{serv.tempoEstimadoMinutos} min</span>
                      </label>
                    ))
                  )}
                </div>
                
                {calcularTempoTotal() > 0 && horaSelecionada && (
                  <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Término previsto para as <strong className="text-zinc-300">{calcularHoraFim()}</strong>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Observações (Opcional)</label>
                <input 
                  type="text" value={observacao} onChange={(e) => setObservacao(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                  placeholder="Ex: Corte máquina zero do lado"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setModalAberto(false)} className="flex-1 py-3 border border-zinc-700 text-zinc-300 rounded-md hover:bg-zinc-800 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-[#E4B77D] text-black font-bold rounded-md hover:bg-[#cfa56d] transition-colors disabled:opacity-50">
                  {loading ? "Salvando..." : "Confirmar Encaixe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENDERIZANDO O MODAL DE CONFIRMAÇÃO AQUI NO FINAL! */}
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