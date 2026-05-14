"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConfirmModal from "../components/ConfirmModal";

type TourPosicao = "bottom" | "top" | "left";
const TOUR_STEPS: { targetId: string; titulo: string; descricao: string; posicao: TourPosicao }[] = [
  { targetId: "tour-meus-horarios", titulo: "Meus Agendamentos", descricao: "Aqui ficam todos os seus próximos horários marcados. Você pode cancelar um agendamento com até 2 horas de antecedência.", posicao: "bottom" },
  { targetId: "tour-barbeiro", titulo: "Escolha o Barbeiro", descricao: "Selecione com qual profissional deseja se atender. Ao escolher o barbeiro, os horários disponíveis são carregados automaticamente.", posicao: "bottom" },
  { targetId: "tour-servicos", titulo: "Escolha os Serviços", descricao: "Selecione um ou mais serviços que deseja realizar. O valor total e o tempo estimado são calculados automaticamente.", posicao: "bottom" },
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

export default function AgendamentoCliente() {
  const router = useRouter();

  const [tourAtivo, setTourAtivo] = useState(false);
  const [tourPasso, setTourPasso] = useState(0);
  const [tourEntrando, setTourEntrando] = useState(false);
  const iniciarTour = () => { setTourPasso(0); setTourEntrando(true); setTourAtivo(true); setTimeout(() => setTourEntrando(false), 350); };
  const irParaPasso = useCallback((novo: number) => { setTourEntrando(true); setTimeout(() => { setTourPasso(novo); setTimeout(() => setTourEntrando(false), 50); }, 150); }, []);

  // Estados de Dados
  const [meusAgendamentos, setMeusAgendamentos] = useState<any[]>([]);
  const [listaProfissionais, setListaProfissionais] = useState<any[]>([]);
  const [listaServicos, setListaServicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [usuarioNome, setUsuarioNome] = useState("");
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);

  // === FEEDBACKS VISUAIS DA TELA PRINCIPAL ===
  const [sucesso, setSucesso] = useState("");
  const [erroPrincipal, setErroPrincipal] = useState("");

  // === ESTADO DO NOSSO NOVO MODAL DE CONFIRMAÇÃO ===
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    titulo: "",
    mensagem: "",
    tipo: "atencao" as "atencao" | "perigo",
    onConfirm: () => {}
  });

  // === LÓGICA DINÂMICA ===
  const [disponibilidades, setDisponibilidades] = useState<any[]>([]);
  const [horariosDinamicos, setHorariosDinamicos] = useState<string[]>([]);
  // ==============================

  // Estados do Formulário de Novo Agendamento
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [dataVisualizacao, setDataVisualizacao] = useState(new Date());
  const [horaSelecionada, setHoraSelecionada] = useState("");
  const [profissionalSelecionado, setProfissionalSelecionado] = useState("");
  const [servicosSelecionados, setServicosSelecionados] = useState<number[]>([]);
  const [observacao, setObservacao] = useState("");
  const [erroForm, setErroForm] = useState("");

  const obterToken = () => localStorage.getItem("token") || "";

  // 1. Roda APENAS UMA VEZ na montagem da tela
  useEffect(() => {
    const usuarioString = localStorage.getItem("usuario");
    if (!usuarioString || !obterToken()) {
      router.push("/login");
      return;
    }
    setUsuarioNome(JSON.parse(usuarioString).nome);
    carregarDadosIniciais();
  }, []);

  // 2. Roda SEMPRE que o dia ou o barbeiro mudar
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
      if(resPro.ok) setListaProfissionais(await resPro.json());

      const resServicos = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/servicos`, { headers });
      if(resServicos.ok) setListaServicos(await resServicos.json());

      const resAgendamentos = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agendamentos/meus`, { headers });
      if(resAgendamentos.ok) setMeusAgendamentos(await resAgendamentos.json());
      
    } catch (error) { console.error("Erro ao carregar dados", error); } 
    finally { setLoading(false); }
  };

  const buscarEscalaEHorariosOcupados = async () => {
    const ano = dataSelecionada.getFullYear();
    const mes = String(dataSelecionada.getMonth() + 1).padStart(2, '0');
    const dia = String(dataSelecionada.getDate()).padStart(2, '0');
    const dataFormatada = `${ano}-${mes}-${dia}`;

    try {
      // Busca horários que já estão agendados ou bloqueados
      const resOcupados = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agendamentos/ocupados?data=${dataFormatada}&profissionalId=${profissionalSelecionado}`, {
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      if (resOcupados.ok) setHorariosOcupados(await resOcupados.json());

      // Busca a disponibilidade geral do barbeiro
      const resDisp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/disponibilidade?profissionalId=${profissionalSelecionado}`, {
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      if (resDisp.ok) {
        const disp = await resDisp.json();
        setDisponibilidades(disp);
        gerarHorariosDinamicos(dataSelecionada, disp);
      }
    } catch (e) { 
      console.error("Erro ao buscar dados dinâmicos"); 
    }
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
    setHoraSelecionada(""); // Reseta a seleção quando troca de dia
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
      tipo: "perigo", // Vermelho
      onConfirm: () => efetivarCancelamento(id)
    });
  };

  const efetivarCancelamento = async (id: number) => {
    setConfirmModal({ ...confirmModal, isOpen: false }); // Fecha o modal
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
        if (profissionalSelecionado) buscarEscalaEHorariosOcupados(); // Atualiza a grade se estiver aberta
      } else {
        exibirErroPrincipal(data.msg || "Erro ao cancelar.");
      }
    } catch (error) { 
      exibirErroPrincipal("Erro de conexão ao tentar cancelar.");
    } finally {
      setLoading(false);
    }
  };
  // ==========================================

  const handleCheckboxServico = (idServico: number, checked: boolean) => {
    if (checked) setServicosSelecionados([...servicosSelecionados, idServico]);
    else setServicosSelecionados(servicosSelecionados.filter(id => id !== idServico));
  };

  const calcularTempoEValor = () => {
    return servicosSelecionados.reduce((acc, idServico) => {
      const servico = listaServicos.find(s => s.id === idServico);
      if (servico) {
        acc.tempo += servico.tempoEstimadoMinutos || 0;
        acc.valor += Number(servico.valor) || 0;
      }
      return acc;
    }, { tempo: 0, valor: 0 });
  };

  const salvarAgendamento = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroForm("");

    if (!horaSelecionada || !profissionalSelecionado || servicosSelecionados.length === 0) {
      setErroForm("Preencha todos os campos obrigatórios (Profissional, Serviços e Horário).");
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
        // SUBSTITUÍDO O ALERT PELO NOSSO AVISO ELEGANTE
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
    hoje.setHours(0,0,0,0);

    const dias = [];
    for (let i = 0; i < primeiroDia; i++) dias.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
    
    for (let i = 1; i <= totalDias; i++) {
      const dataDesteDia = new Date(ano, mes, i);
      const isSelecionado = dataDesteDia.toDateString() === dataSelecionada.toDateString();
      const isPassado = dataDesteDia < hoje;

      dias.push(
        <button
          key={i}
          type="button"
          disabled={isPassado}
          onClick={() => setDataSelecionada(dataDesteDia)}
          className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all mx-auto
            ${isPassado ? "text-zinc-700 cursor-not-allowed" 
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

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
      {tourAtivo && (<Tour passo={tourPasso} entrando={tourEntrando} onProximo={() => irParaPasso(tourPasso + 1)} onAnterior={() => irParaPasso(tourPasso - 1)} onFechar={() => setTourAtivo(false)} />)}

      <header className="flex justify-between items-center max-w-7xl mx-auto mb-10 border-b border-zinc-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Olá, <span className="text-[#E4B77D]">{usuarioNome.split(" ")[0]}</span>
          </h1>
          <p className="text-zinc-400 mt-1">Gerencie seus horários na barbearia.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={iniciarTour} className="px-4 py-2 bg-zinc-900 text-[#E4B77D] font-bold rounded-md hover:bg-zinc-800 transition-all border border-[#E4B77D]/30 hover:border-[#E4B77D]/70 flex items-center gap-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ? Ajuda
          </button>
          <Link href="/" className="px-5 py-2 text-sm font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-md hover:text-white hover:bg-zinc-800 transition-colors">
            Voltar para Home
          </Link>
        </div>
      </header>

      {/* FEEDBACKS VISUAIS */}
      {sucesso && (
        <div className="max-w-7xl mx-auto mb-6 bg-green-950/50 border border-green-900 text-green-400 p-4 rounded-lg flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">{sucesso}</span>
        </div>
      )}

      {erroPrincipal && (
        <div className="max-w-7xl mx-auto mb-6 bg-red-950/50 border border-red-900 text-red-400 p-4 rounded-lg flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="font-medium">{erroPrincipal}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        <section id="tour-meus-horarios" className="lg:col-span-5 flex flex-col gap-6">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-zinc-900 pb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[#E4B77D]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Meus Próximos Horários
          </h2>

          <div className="flex flex-col gap-4">
            {meusAgendamentos.length === 0 ? (
              <div className="bg-zinc-900/50 border border-zinc-800 border-dashed rounded-xl p-8 text-center">
                <p className="text-zinc-500">Você ainda não tem nenhum agendamento futuro.</p>
                <p className="text-sm text-zinc-600 mt-2">Use o painel ao lado para marcar seu primeiro horário!</p>
              </div>
            ) : (
              meusAgendamentos.map(ag => {
                const podeCancelar = verificarPodeCancelar(ag.dataHora);
                
                return (
                  <div key={ag.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${ag.status === 'AGENDADO' ? 'bg-blue-500' : ag.status === 'CONCLUIDO' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    
                    <div className="flex justify-between items-start mb-3 pl-3">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#E4B77D] mb-1 block">
                          {ag.status}
                        </span>
                        <h3 className="text-lg font-bold capitalize text-white">
                          {formatarDataTela(ag.dataHora)}
                        </h3>
                      </div>
                    </div>

                    <div className="pl-3 flex flex-col gap-2">
                      <p className="text-sm text-zinc-300 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Profissional: <strong className="text-white">{ag.profissionalNome}</strong>
                      </p>
                      <p className="text-sm text-zinc-300 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-500"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" /></svg>
                        {ag.nomesServicos || "Serviço não especificado"}
                      </p>
                    </div>

                    {ag.status === 'AGENDADO' && (
                      <div className="mt-5 pt-4 border-t border-zinc-800/50 pl-3">
                        {podeCancelar ? (
                          <button onClick={() => abrirModalCancelar(ag.id)} disabled={loading} className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors disabled:opacity-50">
                            Cancelar Agendamento
                          </button>
                        ) : (
                          <p className="text-xs text-zinc-500 italic flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            Faltam menos de 2h. Para cancelar, ligue na barbearia.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="lg:col-span-7">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl relative">
            <h2 className="text-2xl font-bold text-white mb-6">Agendar Novo Horário</h2>
            
            <form onSubmit={salvarAgendamento} className="flex flex-col gap-8">
              {erroForm && <div className="bg-red-950/40 border border-red-900 text-red-400 p-3 rounded-lg text-sm">{erroForm}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div id="tour-barbeiro">
                  <label className="block text-sm font-bold text-zinc-400 mb-3 uppercase tracking-wider">1. Escolha o Barbeiro</label>
                  <select 
                    value={profissionalSelecionado} onChange={(e) => setProfissionalSelecionado(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-[#E4B77D] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Selecione um profissional...</option>
                    {listaProfissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>

                <div id="tour-servicos">
                  <label className="block text-sm font-bold text-zinc-400 mb-3 uppercase tracking-wider">2. Escolha os Serviços</label>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 max-h-40 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                    {listaServicos.map(serv => (
                      <label key={serv.id} className="flex items-center justify-between cursor-pointer p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            checked={servicosSelecionados.includes(serv.id)}
                            onChange={(e) => handleCheckboxServico(serv.id, e.target.checked)}
                            className="w-5 h-5 accent-[#E4B77D] rounded"
                          />
                          <span className="text-zinc-200">{serv.nome}</span>
                        </div>
                        <span className="text-[#E4B77D] text-sm font-medium">R$ {Number(serv.valor).toFixed(2)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-zinc-900 pt-6">
                <div id="tour-dia">
                  <label className="block text-sm font-bold text-zinc-400 mb-3 uppercase tracking-wider">3. Escolha o Dia</label>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-4">
                      <button type="button" onClick={mesAnterior} className="p-2 text-zinc-400 hover:text-[#E4B77D]"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                      <span className="font-bold text-white capitalize">{dataVisualizacao.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                      <button type="button" onClick={proximoMes} className="p-2 text-zinc-400 hover:text-[#E4B77D]"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => <span key={d} className="text-xs font-bold text-zinc-600">{d}</span>)}
                    </div>
                    <div className="grid grid-cols-7 gap-y-2">{renderizarDiasCalendario()}</div>
                  </div>
                </div>

                <div id="tour-horario">
                  <label className="block text-sm font-bold text-zinc-400 mb-3 uppercase tracking-wider">4. Escolha o Horário</label>
                  
                  {!profissionalSelecionado ? (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center text-sm text-zinc-500">
                      Selecione um barbeiro para ver os horários disponíveis.
                    </div>
                  ) : horariosDinamicos.length === 0 ? (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
                      <p className="text-zinc-400 text-sm font-medium">Dia de Folga</p>
                      <p className="text-zinc-600 text-xs mt-1">O barbeiro não atende neste dia.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
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
                            className={`py-3 rounded-lg text-sm font-bold font-mono transition-all border
                              ${horaSelecionada === hora 
                                ? "bg-[#E4B77D] text-black border-[#E4B77D] shadow-lg shadow-[#E4B77D]/20" 
                                : isDesabilitado 
                                ? "bg-zinc-950 border-zinc-900 text-zinc-800 cursor-not-allowed line-through"
                                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-[#E4B77D]/50 hover:text-white"}
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

              <div id="tour-resumo" className="bg-zinc-900/50 border border-[#E4B77D]/30 rounded-xl p-5 mt-2 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                  <span className="text-zinc-400 text-sm">Resumo do Agendamento:</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-extrabold text-[#E4B77D]">R$ {totalCalculado.valor.toFixed(2)}</span>
                    <span className="text-sm text-zinc-500">~ {totalCalculado.tempo} min estimados</span>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading || !horaSelecionada}
                  className="w-full sm:w-auto px-10 py-4 bg-[#E4B77D] text-black font-extrabold rounded-xl hover:bg-[#cfa56d] transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-[#E4B77D]/20"
                >
                  {loading ? "Processando..." : "Confirmar Agendamento"}
                </button>
              </div>

            </form>
          </div>
        </section>
      </main>

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