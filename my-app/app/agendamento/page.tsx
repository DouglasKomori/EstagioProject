"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConfirmModal from "../components/ConfirmModal";

type TourPosicao = "bottom" | "top" | "left";
const TOUR_STEPS: { targetId: string; titulo: string; descricao: string; posicao: TourPosicao }[] = [
  { targetId: "tour-meus-horarios", titulo: "Meus Agendamentos", descricao: "Aqui ficam todos os seus próximos horários marcados. Você pode cancelar um agendamento com até 2 horas de antecedência.", posicao: "bottom" },
  { targetId: "tour-barbeiro", titulo: "Escolha o Barbeiro", descricao: "Selecione com qual profissional deseja se atender. Ao escolher o barbeiro, os horários disponíveis são carregados automaticamente.", posicao: "bottom" },
  { targetId: "tour-servicos", titulo: "Escolha o Serviço", descricao: "Selecione o serviço que deseja realizar. O valor e o tempo estimado são exibidos automaticamente.", posicao: "bottom" },
  { targetId: "tour-dia", titulo: "Escolha o Dia", descricao: "Navegue pelo calendário e clique no dia desejado. Dias passados ficam desabilitados. O barbeiro precisa estar selecionado para ver os horários.", posicao: "bottom" },
  { targetId: "tour-horario", titulo: "Escolha o Horário", descricao: "Selecione um horário disponível. Horários riscados já estão ocupados ou são do passado. Os slots são gerados a partir da escala de trabalho do barbeiro.", posicao: "top" },
  { targetId: "tour-resumo", titulo: "Confirmar Agendamento", descricao: "Veja o resumo com o valor total e o tempo estimado. Quando tudo estiver preenchido, clique em 'Confirmar Agendamento' para finalizar.", posicao: "top" },
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

function gerarSlotsParaDia(disps: any[], diaSemana: number): string[] {
  const turnos = disps.filter(d => d.diaSemana === diaSemana);
  const slots: string[] = [];
  turnos.forEach(turno => {
    let [hI, mI] = turno.horaInicio.split(':').map(Number);
    let [hF, mF] = turno.horaFim.split(':').map(Number);
    let atual = hI * 60 + mI;
    const fim = hF * 60 + mF;
    while (atual < fim) {
      slots.push(`${String(Math.floor(atual / 60)).padStart(2, '0')}:${String(atual % 60).padStart(2, '0')}`);
      atual += 30;
    }
  });
  return [...new Set(slots)].sort();
}

export default function AgendamentoCliente() {
  const router = useRouter();

  const [tourAtivo, setTourAtivo] = useState(false);
  const [tourPasso, setTourPasso] = useState(0);
  const [tourEntrando, setTourEntrando] = useState(false);
  const iniciarTour = () => { setTourPasso(0); setTourEntrando(true); setTourAtivo(true); setTimeout(() => setTourEntrando(false), 350); };
  const irParaPasso = useCallback((novo: number) => { setTourEntrando(true); setTimeout(() => { setTourPasso(novo); setTimeout(() => setTourEntrando(false), 50); }, 150); }, []);

  const [meusAgendamentos, setMeusAgendamentos] = useState<any[]>([]);
  const [historicoAgendamentos, setHistoricoAgendamentos] = useState<any[]>([]);
  const [abaAgendamentos, setAbaAgendamentos] = useState<"proximos" | "historico">("proximos");
  const [listaProfissionais, setListaProfissionais] = useState<any[]>([]);
  const [listaServicos, setListaServicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [usuarioNome, setUsuarioNome] = useState("");
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);

  const [sucesso, setSucesso] = useState("");
  const [erroPrincipal, setErroPrincipal] = useState("");

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    titulo: "",
    mensagem: "",
    tipo: "atencao" as "atencao" | "perigo",
    onConfirm: () => {}
  });

  const [disponibilidades, setDisponibilidades] = useState<any[]>([]);
  const [horariosDinamicos, setHorariosDinamicos] = useState<string[]>([]);

  // Reagendamento
  const [modalReagendar, setModalReagendar] = useState<{ aberto: boolean; agendamento: any }>({ aberto: false, agendamento: null });
  const [reagendaData, setReagendaData] = useState("");
  const [reagendaHora, setReagendaHora] = useState("");
  const [reagendaDisponibilidades, setReagendaDisponibilidades] = useState<any[]>([]);
  const [reagendaSlots, setReagendaSlots] = useState<string[]>([]);
  const [reagendaLoadingSlots, setReagendaLoadingSlots] = useState(false);
  const [reagendaErro, setReagendaErro] = useState("");

  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [dataVisualizacao, setDataVisualizacao] = useState(new Date());
  const [horaSelecionada, setHoraSelecionada] = useState("");
  const [profissionalSelecionado, setProfissionalSelecionado] = useState("");
  const [servicosSelecionados, setServicosSelecionados] = useState<number[]>([]);
  const [observacao, setObservacao] = useState("");
  const [erroForm, setErroForm] = useState("");

  const obterToken = () => localStorage.getItem("token") || "";

  useEffect(() => {
    const usuarioString = localStorage.getItem("usuario");
    if (!usuarioString || !obterToken()) {
      router.push("/login");
      return;
    }
    setUsuarioNome(JSON.parse(usuarioString).nome);
    carregarDadosIniciais();
  }, []);

  // Carrega a escala completa do barbeiro quando ele é selecionado (para pintar o calendário)
  useEffect(() => {
    if (profissionalSelecionado) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/disponibilidade?profissionalId=${profissionalSelecionado}`, {
        headers: { "Authorization": `Bearer ${obterToken()}` }
      })
        .then(r => r.ok ? r.json() : [])
        .then(disp => setDisponibilidades(disp))
        .catch(() => {});
    } else {
      setDisponibilidades([]);
      setHorariosOcupados([]);
      setHorariosDinamicos([]);
    }
  }, [profissionalSelecionado]);

  // Carrega horários do dia selecionado quando muda o dia ou o barbeiro
  useEffect(() => {
    if (profissionalSelecionado) {
      buscarEscalaEHorariosOcupados();
    } else {
      setHorariosOcupados([]);
      setHorariosDinamicos([]);
    }
  }, [dataSelecionada, profissionalSelecionado]);

  const exibirSucesso = (mensagem: string) => {
    setSucesso(mensagem);
    setTimeout(() => setSucesso(""), 5000);
  };

  const exibirErroPrincipal = (mensagem: string) => {
    setErroPrincipal(mensagem);
    setTimeout(() => setErroPrincipal(""), 5000);
  };

  const carregarDadosIniciais = async () => {
    setLoading(true);
    try {
      const headers = { "Authorization": `Bearer ${obterToken()}` };
      const resPro = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pessoas/profissionais`, { headers });
      if (resPro.ok) setListaProfissionais(await resPro.json());
      const resServicos = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/servicos`, { headers });
      if (resServicos.ok) setListaServicos(await resServicos.json());
      const resAgendamentos = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agendamentos/meus`, { headers });
      if (resAgendamentos.ok) setMeusAgendamentos(await resAgendamentos.json());
      else setMeusAgendamentos([]);
      const resHistorico = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agendamentos/meus/historico`, { headers });
      if (resHistorico.ok) setHistoricoAgendamentos(await resHistorico.json());
      else setHistoricoAgendamentos([]);
    } catch (error) { console.error("Erro ao carregar dados", error); }
    finally { setLoading(false); }
  };

  const buscarEscalaEHorariosOcupados = async () => {
    const ano = dataSelecionada.getFullYear();
    const mes = String(dataSelecionada.getMonth() + 1).padStart(2, '0');
    const dia = String(dataSelecionada.getDate()).padStart(2, '0');
    const dataFormatada = `${ano}-${mes}-${dia}`;
    try {
      const resOcupados = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agendamentos/ocupados?data=${dataFormatada}&profissionalId=${profissionalSelecionado}`, {
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      if (resOcupados.ok) setHorariosOcupados(await resOcupados.json());
      const resDisp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/disponibilidade?profissionalId=${profissionalSelecionado}`, {
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      if (resDisp.ok) {
        const disp = await resDisp.json();
        setDisponibilidades(disp);
        gerarHorariosDinamicos(dataSelecionada, disp);
      }
    } catch (e) { console.error("Erro ao buscar dados dinâmicos"); }
  };

  const gerarHorariosDinamicos = (dataReferencia: Date, dispProfissional: any[]) => {
    const diaSemana = dataReferencia.getDay();
    const turnosDoDia = dispProfissional.filter(d => d.diaSemana === diaSemana);
    let slotsGerados: string[] = [];
    turnosDoDia.forEach(turno => {
      let [hInicio, mInicio] = turno.horaInicio.split(':').map(Number);
      let [hFim, mFim] = turno.horaFim.split(':').map(Number);
      // Usa a data de referência real em vez de hoje
      let dataAtual = new Date(dataReferencia);
      dataAtual.setHours(hInicio, mInicio, 0, 0);
      let dataFimTurno = new Date(dataReferencia);
      dataFimTurno.setHours(hFim, mFim, 0, 0);
      while (dataAtual < dataFimTurno) {
        slotsGerados.push(dataAtual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
        dataAtual.setMinutes(dataAtual.getMinutes() + 30);
      }
    });
    setHorariosDinamicos([...new Set(slotsGerados)].sort());
    setHoraSelecionada("");
  };

  // Verifica se o slot selecionado + duração do serviço cabe sem conflito
  const slotConflitaComServico = (slot: string, duracaoMinutos: number): boolean => {
    if (!duracaoMinutos || duracaoMinutos <= 30) return false;
    const blocosNecessarios = Math.ceil(duracaoMinutos / 30);
    const [h, m] = slot.split(':').map(Number);
    for (let i = 1; i < blocosNecessarios; i++) {
      const proxMinutos = h * 60 + m + i * 30;
      const ph = String(Math.floor(proxMinutos / 60)).padStart(2, '0');
      const pm = String(proxMinutos % 60).padStart(2, '0');
      const proxSlot = `${ph}:${pm}`;
      if (horariosOcupados.includes(proxSlot) || !horariosDinamicos.includes(proxSlot)) return true;
    }
    return false;
  };

  const verificarPodeCancelar = (dataHoraISO: string) => {
    const agora = new Date();
    const dataAgendamento = new Date(dataHoraISO);
    const diferencaMinutos = (dataAgendamento.getTime() - agora.getTime()) / (1000 * 60);
    return diferencaMinutos >= 120;
  };

  const abrirModalCancelar = (id: number) => {
    setConfirmModal({
      isOpen: true,
      titulo: "Cancelar Agendamento?",
      mensagem: "Deseja realmente CANCELAR este agendamento?",
      tipo: "perigo",
      onConfirm: () => efetivarCancelamento(id)
    });
  };

  const fecharModalReagendar = () => {
    setModalReagendar({ aberto: false, agendamento: null });
    setReagendaData("");
    setReagendaHora("");
    setReagendaErro("");
    setReagendaSlots([]);
    setReagendaDisponibilidades([]);
  };

  const abrirModalReagendar = async (ag: any) => {
    setReagendaData("");
    setReagendaHora("");
    setReagendaErro("");
    setReagendaSlots([]);
    setModalReagendar({ aberto: true, agendamento: ag });
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/disponibilidade?profissionalId=${ag.profissionalId}`,
        { headers: { Authorization: `Bearer ${obterToken()}` } }
      );
      if (res.ok) setReagendaDisponibilidades(await res.json());
    } catch { /* disponibilidades ficam vazias */ }
  };

  const selecionarDataReagenda = async (data: string) => {
    setReagendaData(data);
    setReagendaHora("");
    setReagendaErro("");
    setReagendaSlots([]);
    if (!data || !modalReagendar.agendamento) return;

    const diaSemana = new Date(data + "T12:00:00").getDay();
    const slotsBase = gerarSlotsParaDia(reagendaDisponibilidades, diaSemana);
    if (slotsBase.length === 0) {
      setReagendaErro("O profissional não atende neste dia da semana.");
      return;
    }

    setReagendaLoadingSlots(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agendamentos/ocupados?data=${data}&profissionalId=${modalReagendar.agendamento.profissionalId}`,
        { headers: { Authorization: `Bearer ${obterToken()}` } }
      );
      const ocupados: string[] = res.ok ? await res.json() : [];
      const hoje = new Date().toISOString().split("T")[0];
      const agora = Date.now();
      const disponiveis = slotsBase.filter(s => {
        if (ocupados.includes(s)) return false;
        if (data === hoje) {
          const [h, m] = s.split(":").map(Number);
          const slotMs = new Date().setHours(h, m, 0, 0);
          if (slotMs <= agora + 2 * 60 * 60 * 1000) return false;
        }
        return true;
      });
      setReagendaSlots(disponiveis);
    } catch {
      setReagendaErro("Erro ao carregar horários disponíveis.");
    } finally {
      setReagendaLoadingSlots(false);
    }
  };

  const efetivarReagendamento = async () => {
    if (!reagendaData || !reagendaHora || !modalReagendar.agendamento) return;
    setLoading(true);
    const dataHoraFinal = `${reagendaData}T${reagendaHora}:00`;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agendamentos/${modalReagendar.agendamento.id}/reagendar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${obterToken()}` },
        body: JSON.stringify({ dataHora: dataHoraFinal })
      });
      const data = await res.json();
      if (res.ok) {
        exibirSucesso("Agendamento reagendado com sucesso!");
        fecharModalReagendar();
        carregarDadosIniciais();
      } else {
        setReagendaErro(data.msg || "Erro ao reagendar.");
      }
    } catch {
      setReagendaErro("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const efetivarCancelamento = async (id: number) => {
    setConfirmModal({ ...confirmModal, isOpen: false });
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agendamentos/${id}/cancelar`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      const data = await response.json();
      if (response.ok) {
        exibirSucesso("Agendamento cancelado com sucesso!");
        carregarDadosIniciais();
        if (profissionalSelecionado) buscarEscalaEHorariosOcupados();
      } else {
        exibirErroPrincipal(data.msg || "Erro ao cancelar.");
      }
    } catch (error) {
      exibirErroPrincipal("Erro de conexão ao tentar cancelar.");
    } finally {
      setLoading(false);
    }
  };

  const toggleServico = (id: number) => {
    setServicosSelecionados(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const calcularTempoEValor = () => {
    const selecionados = listaServicos.filter(s => servicosSelecionados.includes(s.id));
    return {
      tempo: selecionados.reduce((acc, s) => acc + (s.tempoEstimadoMinutos || 0), 0),
      valor: selecionados.reduce((acc, s) => acc + Number(s.valor), 0),
    };
  };

  const salvarAgendamento = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroForm("");
    if (!horaSelecionada || !profissionalSelecionado || servicosSelecionados.length === 0) {
      setErroForm("Preencha todos os campos obrigatórios (Profissional, pelo menos 1 Serviço e Horário).");
      return;
    }
    const usuarioData = JSON.parse(localStorage.getItem("usuario") || "{}");
    const ano = dataSelecionada.getFullYear();
    const mes = String(dataSelecionada.getMonth() + 1).padStart(2, '0');
    const dia = String(dataSelecionada.getDate()).padStart(2, '0');
    const dataHoraFormatada = `${ano}-${mes}-${dia}T${horaSelecionada}:00`;
    const payload = {
      dataHora: dataHoraFormatada,
      clienteId: usuarioData.id,
      profissionalId: Number(profissionalSelecionado),
      observacao: observacao,
      servicos: servicosSelecionados.map(id => ({ id }))
    };
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agendamentos`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${obterToken()}` },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok) {
        exibirSucesso("Agendamento realizado com sucesso! Te esperamos na barbearia.");
        setHoraSelecionada("");
        setServicosSelecionados([]);
        setObservacao("");
        carregarDadosIniciais();
        buscarEscalaEHorariosOcupados();
      } else {
        setErroForm(data.msg || "Erro ao agendar.");
      }
    } catch (error) {
      setErroForm("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const formatarDataTela = (isoString: string) => {
    const data = new Date(isoString);
    return data.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' });
  };

  const mesAnterior = () => setDataVisualizacao(new Date(dataVisualizacao.getFullYear(), dataVisualizacao.getMonth() - 1, 1));
  const proximoMes = () => setDataVisualizacao(new Date(dataVisualizacao.getFullYear(), dataVisualizacao.getMonth() + 1, 1));

  const renderizarDiasCalendario = () => {
    const ano = dataVisualizacao.getFullYear();
    const mes = dataVisualizacao.getMonth();
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const totalDias = new Date(ano, mes + 1, 0).getDate();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    // Dias da semana que o barbeiro atende (0=Dom, 6=Sáb)
    const diasComEscala = new Set(disponibilidades.map((d: any) => d.diaSemana));
    const dias = [];
    for (let i = 0; i < primeiroDia; i++) dias.push(<div key={`empty-${i}`} className="w-10 h-10" />);
    for (let i = 1; i <= totalDias; i++) {
      const dataDesteDia = new Date(ano, mes, i);
      const isSelecionado = dataDesteDia.toDateString() === dataSelecionada.toDateString();
      const isPassado = dataDesteDia < hoje;
      const semEscala = profissionalSelecionado && disponibilidades.length > 0 && !diasComEscala.has(dataDesteDia.getDay());
      const isDesabilitado = isPassado || semEscala;
      dias.push(
        <button
          key={i}
          type="button"
          disabled={isDesabilitado}
          onClick={() => setDataSelecionada(dataDesteDia)}
          title={semEscala ? "Barbeiro não atende neste dia" : undefined}
          className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all mx-auto
            ${isDesabilitado ? "text-zinc-800 cursor-not-allowed"
              : isSelecionado ? "bg-[#E4B77D] text-black shadow-lg shadow-[#E4B77D]/30 font-bold scale-110"
              : "text-zinc-300 hover:bg-zinc-800 hover:text-white"}
          `}
        >
          {i}
        </button>
      );
    }
    return dias;
  };

  const totalCalculado = calcularTempoEValor();

  const corStatus = (status: string) => {
    if (status === 'AGENDADO') return 'bg-blue-400';
    if (status === 'CONCLUIDO') return 'bg-green-400';
    return 'bg-red-400';
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-[#E4B77D] selection:text-black">
      {tourAtivo && (
        <Tour
          passo={tourPasso}
          entrando={tourEntrando}
          onProximo={() => irParaPasso(tourPasso + 1)}
          onAnterior={() => irParaPasso(tourPasso - 1)}
          onFechar={() => setTourAtivo(false)}
        />
      )}

      {/* ─── HEADER ─────────────────────────────────────────── */}
      <header className="relative border-b border-zinc-900 bg-zinc-950">
        {/* Linha dourada decorativa no topo */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#E4B77D]/50 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
          <div>
            <p className="text-[#E4B77D] text-xs font-bold tracking-[0.3em] uppercase mb-1.5">
              Barbearia Victor Uematsu
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Olá, <span className="text-[#E4B77D]">{usuarioNome.split(" ")[0]}</span>
            </h1>
            <p className="text-zinc-500 mt-1 text-sm">Gerencie seus horários com facilidade.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={iniciarTour}
              className="px-4 py-2.5 bg-zinc-900 text-[#E4B77D] font-bold rounded-xl hover:bg-zinc-800 transition-all border border-[#E4B77D]/20 hover:border-[#E4B77D]/50 flex items-center gap-2 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ajuda
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 text-sm font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-xl hover:text-white hover:border-zinc-600 transition-all"
            >
              ← Voltar
            </Link>
          </div>
        </div>
      </header>

      {/* ─── FEEDBACKS ─────────────────────────────────────── */}
      {sucesso && (
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <div className="bg-green-950/50 border border-green-900/60 text-green-400 px-5 py-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="w-8 h-8 rounded-full bg-green-900/60 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-medium text-sm">{sucesso}</span>
          </div>
        </div>
      )}

      {erroPrincipal && (
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <div className="bg-red-950/50 border border-red-900/60 text-red-400 px-5 py-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="w-8 h-8 rounded-full bg-red-900/60 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="font-medium text-sm">{erroPrincipal}</span>
          </div>
        </div>
      )}

      {/* ─── CONTEÚDO PRINCIPAL ─────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* ── MEUS AGENDAMENTOS ── */}
        <section id="tour-meus-horarios" className="lg:col-span-5 flex flex-col gap-6">
          <div>
            <p className="text-[#E4B77D] text-xs font-bold tracking-[0.3em] uppercase mb-2">Sua Agenda</p>
            <h2 className="text-2xl font-bold text-white">Meus Horários</h2>
          </div>

          {/* Abas Próximos / Histórico */}
          <div className="flex gap-1 bg-zinc-900 rounded-xl p-1">
            <button
              onClick={() => setAbaAgendamentos("proximos")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${abaAgendamentos === "proximos" ? "bg-zinc-800 text-[#E4B77D]" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Próximos
            </button>
            <button
              onClick={() => setAbaAgendamentos("historico")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${abaAgendamentos === "historico" ? "bg-zinc-800 text-[#E4B77D]" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Histórico
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {abaAgendamentos === "historico" ? (
              historicoAgendamentos.length === 0 ? (
                <div className="border border-dashed border-zinc-800 rounded-2xl p-10 text-center">
                  <p className="text-zinc-400 font-medium">Nenhum atendimento anterior</p>
                  <p className="text-sm text-zinc-600 mt-1">Seu histórico aparece aqui após o primeiro corte.</p>
                </div>
              ) : (
                historicoAgendamentos.map(ag => (
                  <div key={ag.id} className="relative bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 shadow-lg overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${corStatus(ag.status)}`} />
                    <div className="pl-4 flex flex-col gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">{ag.status}</span>
                      <h3 className="text-base font-bold text-zinc-300">{formatarDataTela(ag.dataHora)}</h3>
                      <p className="text-sm text-zinc-500">{ag.profissionalNome} · {ag.nomesServicos || "Serviço"}</p>
                    </div>
                  </div>
                ))
              )
            ) : meusAgendamentos.length === 0 ? (
              <div className="border border-dashed border-zinc-800 rounded-2xl p-10 text-center">
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-600">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-zinc-400 font-medium">Nenhum horário agendado</p>
                <p className="text-sm text-zinc-600 mt-1">Use o painel ao lado para marcar seu primeiro horário.</p>
              </div>
            ) : (
              meusAgendamentos.map(ag => {
                const podeCancelar = verificarPodeCancelar(ag.dataHora);
                return (
                  <div
                    key={ag.id}
                    className="relative bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 shadow-lg overflow-hidden group hover:border-zinc-700 transition-all duration-300"
                  >
                    {/* Barra colorida lateral */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${corStatus(ag.status)}`} />

                    {/* Glow sutil no hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ background: "radial-gradient(ellipse at top left, rgba(228,183,125,0.04) 0%, transparent 60%)" }} />

                    <div className="pl-4 flex flex-col gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#E4B77D]">{ag.status}</span>
                        <h3 className="text-base font-bold capitalize text-white mt-0.5">
                          {formatarDataTela(ag.dataHora)}
                        </h3>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <p className="text-sm text-zinc-400 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-600 flex-shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-zinc-300">{ag.profissionalNome}</span>
                        </p>
                        <p className="text-sm text-zinc-400 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-600 flex-shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                          </svg>
                          <span className="text-zinc-300">{ag.nomesServicos || "Serviço não especificado"}</span>
                        </p>
                      </div>

                      {ag.status === 'AGENDADO' && (
                        <div className="pt-3 border-t border-zinc-800/60">
                          {podeCancelar ? (
                            <div className="flex gap-3">
                              <button
                                onClick={() => abrirModalReagendar(ag)}
                                disabled={loading}
                                className="text-sm text-[#E4B77D]/70 hover:text-[#E4B77D] font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Reagendar
                              </button>
                              <span className="text-zinc-700">·</span>
                              <button
                                onClick={() => abrirModalCancelar(ag.id)}
                                disabled={loading}
                                className="text-sm text-red-400/80 hover:text-red-400 font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs text-zinc-600 italic flex items-center gap-1.5">
                              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Faltam menos de 2h. Ligue na barbearia.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) /* fim aba proximos */ }
          </div>
        </section>

        {/* ── FORMULÁRIO DE AGENDAMENTO ── */}
        <section className="lg:col-span-7">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">

            {/* Cabeçalho do painel */}
            <div className="relative border-b border-zinc-800 px-8 py-6 bg-zinc-900/50">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#E4B77D]/30 to-transparent" />
              <p className="text-[#E4B77D] text-xs font-bold tracking-[0.3em] uppercase mb-1">Novo Horário</p>
              <h2 className="text-2xl font-bold text-white">Agendar na Barbearia</h2>
            </div>

            <form onSubmit={salvarAgendamento} className="p-8 flex flex-col gap-8">
              {erroForm && (
                <div className="bg-red-950/40 border border-red-900/60 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {erroForm}
                </div>
              )}

              {/* Barbeiro + Serviços */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div id="tour-barbeiro">
                  <label className="block text-[10px] font-bold text-[#E4B77D] mb-3 uppercase tracking-[0.25em]">
                    1. Barbeiro
                  </label>
                  <select
                    value={profissionalSelecionado}
                    onChange={(e) => setProfissionalSelecionado(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#E4B77D]/60 transition-colors appearance-none cursor-pointer hover:border-zinc-700"
                  >
                    <option value="" disabled>Selecione um profissional...</option>
                    {listaProfissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>

                <div id="tour-servicos">
                  <label className="block text-[10px] font-bold text-[#E4B77D] mb-3 uppercase tracking-[0.25em]">
                    2. Serviços
                  </label>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 max-h-40 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                    {listaServicos.map(serv => {
                      const selecionado = servicosSelecionados.includes(serv.id);
                      return (
                        <button
                          key={serv.id}
                          type="button"
                          onClick={() => toggleServico(serv.id)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left border ${
                            selecionado
                              ? "bg-[#E4B77D]/10 border-[#E4B77D]/40 text-white"
                              : "border-transparent hover:bg-zinc-900 text-zinc-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                              selecionado ? "border-[#E4B77D] bg-[#E4B77D]" : "border-zinc-600"
                            }`}>
                              {selecionado && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm">{serv.nome}</span>
                          </div>
                          <span className="text-[#E4B77D] text-xs font-semibold shrink-0 ml-2">R$ {Number(serv.valor).toFixed(2)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Divisor dourado */}
              <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

              {/* Calendário + Horários */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div id="tour-dia">
                  <label className="block text-[10px] font-bold text-[#E4B77D] mb-3 uppercase tracking-[0.25em]">
                    3. Dia
                  </label>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-4">
                      <button type="button" onClick={mesAnterior} className="p-2 text-zinc-500 hover:text-[#E4B77D] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <span className="font-bold text-white text-sm capitalize">
                        {dataVisualizacao.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                      </span>
                      <button type="button" onClick={proximoMes} className="p-2 text-zinc-500 hover:text-[#E4B77D] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                        <span key={d} className="text-[10px] font-bold text-zinc-600">{d}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-y-1">{renderizarDiasCalendario()}</div>
                  </div>
                </div>

                <div id="tour-horario">
                  <label className="block text-[10px] font-bold text-[#E4B77D] mb-3 uppercase tracking-[0.25em]">
                    4. Horário
                  </label>

                  {!profissionalSelecionado ? (
                    <div className="bg-zinc-950 border border-zinc-800 border-dashed rounded-xl p-6 text-center h-[calc(100%-2rem)] flex flex-col items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-700">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <p className="text-zinc-600 text-sm">Selecione um barbeiro primeiro</p>
                    </div>
                  ) : horariosDinamicos.length === 0 ? (
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 text-center h-[calc(100%-2rem)] flex flex-col items-center justify-center gap-2">
                      <p className="text-zinc-400 text-sm font-semibold">Dia de Folga</p>
                      <p className="text-zinc-600 text-xs">O barbeiro não atende neste dia.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                      {horariosDinamicos.map(hora => {
                        const hoje = new Date();
                        const isHoje = dataSelecionada.toDateString() === hoje.toDateString();
                        const [h, m] = hora.split(':').map(Number);
                        let isPassado = false;
                        if (isHoje) {
                          if (h < hoje.getHours() || (h === hoje.getHours() && m <= hoje.getMinutes())) {
                            isPassado = true;
                          }
                        }
                        const isOcupado = horariosOcupados.includes(hora);
                        const isDesabilitado = isPassado || isOcupado;
                        return (
                          <button
                            key={hora}
                            type="button"
                            disabled={isDesabilitado}
                            onClick={() => setHoraSelecionada(hora)}
                            className={`py-3 rounded-xl text-sm font-bold font-mono transition-all border
                              ${horaSelecionada === hora
                                ? "bg-[#E4B77D] text-black border-[#E4B77D] shadow-lg shadow-[#E4B77D]/20"
                                : isDesabilitado
                                ? "bg-zinc-950 border-zinc-900 text-zinc-700 cursor-not-allowed line-through"
                                : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-[#E4B77D]/40 hover:text-white"}
                            `}
                          >
                            {hora}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Resumo + Confirmar */}
              <div
                id="tour-resumo"
                className="relative bg-zinc-950 border border-[#E4B77D]/20 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-5 overflow-hidden"
              >
                {/* Glow dourado de fundo */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at left center, rgba(228,183,125,0.06) 0%, transparent 65%)" }} />

                <div className="relative flex flex-col gap-1 w-full sm:w-auto">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em]">Resumo</span>
                  <div className="flex items-baseline gap-3 mt-0.5">
                    <span className="text-3xl font-extrabold text-[#E4B77D]">
                      R$ {totalCalculado.valor.toFixed(2)}
                    </span>
                    <span className="text-sm text-zinc-500">~ {totalCalculado.tempo} min</span>
                  </div>
                  {horaSelecionada && (
                    <p className="text-xs text-zinc-600 mt-1">
                      {dataSelecionada.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })} às {horaSelecionada}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !horaSelecionada}
                  className="relative w-full sm:w-auto px-10 py-4 bg-[#E4B77D] text-black font-extrabold rounded-xl hover:bg-[#cfa56d] transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 shadow-xl shadow-[#E4B77D]/20 text-sm tracking-wide"
                >
                  {loading ? "Processando..." : "Confirmar Agendamento"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      {/* Modal Reagendamento */}
      {modalReagendar.aberto && modalReagendar.agendamento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={fecharModalReagendar} />
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold text-white mb-1">Reagendar Horário</h2>
            <p className="text-zinc-500 text-sm mb-5">
              Atual: <span className="text-zinc-300">{formatarDataTela(modalReagendar.agendamento.dataHora)}</span>
            </p>

            {reagendaErro && (
              <div className="mb-4 bg-red-950/40 border border-red-900/60 text-red-400 px-3 py-2.5 rounded-xl text-sm">
                {reagendaErro}
              </div>
            )}

            <div className="flex flex-col gap-5 mb-6">
              <div>
                <label className="block text-[10px] font-bold text-[#E4B77D] uppercase tracking-[0.25em] mb-2">
                  1. Nova Data
                </label>
                <input
                  type="date"
                  value={reagendaData}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={e => selecionarDataReagenda(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#E4B77D] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#E4B77D] uppercase tracking-[0.25em] mb-2">
                  2. Horário Disponível
                </label>
                {!reagendaData ? (
                  <div className="border border-dashed border-zinc-800 rounded-xl p-4 text-center text-zinc-600 text-sm">
                    Selecione uma data primeiro
                  </div>
                ) : reagendaLoadingSlots ? (
                  <div className="border border-zinc-800 rounded-xl p-4 text-center text-zinc-500 text-sm animate-pulse">
                    Carregando horários...
                  </div>
                ) : reagendaSlots.length === 0 ? (
                  <div className="border border-red-900/40 bg-red-950/20 rounded-xl p-4 text-center text-red-400 text-sm">
                    Nenhum horário disponível neste dia
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {reagendaSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setReagendaHora(slot)}
                        className={`py-2.5 rounded-xl text-sm font-bold font-mono transition-all border
                          ${reagendaHora === slot
                            ? "bg-[#E4B77D] text-black border-[#E4B77D] shadow-lg shadow-[#E4B77D]/20"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-[#E4B77D]/40 hover:text-white"
                          }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={fecharModalReagendar} className="flex-1 py-3 border border-zinc-700 text-zinc-400 rounded-xl font-bold hover:bg-zinc-900 transition-colors">
                Cancelar
              </button>
              <button
                onClick={efetivarReagendamento}
                disabled={!reagendaData || !reagendaHora || loading}
                className="flex-[2] py-3 bg-[#E4B77D] text-black font-extrabold rounded-xl hover:bg-[#cfa56d] transition-colors disabled:opacity-40"
              >
                {loading ? "Salvando..." : "Confirmar Reagendamento"}
              </button>
            </div>
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
