"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function AgendaAdmin() {
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [dataVisualizacao, setDataVisualizacao] = useState(new Date());
  
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados para os dados vindos do Banco
  const [listaClientes, setListaClientes] = useState<any[]>([]);
  const [listaProfissionais, setListaProfissionais] = useState<any[]>([]);
  const [listaServicos, setListaServicos] = useState<any[]>([]);

  // Estados do Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [horaSelecionada, setHoraSelecionada] = useState("");
  const [profissionalSelecionado, setProfissionalSelecionado] = useState("");
  const [servicosSelecionados, setServicosSelecionados] = useState<number[]>([]);
  const [observacao, setObservacao] = useState("");
  const [erroModal, setErroModal] = useState("");

  // ESTADOS PARA O BUSCADOR DE CLIENTES
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

  const horarios = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", 
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"
  ];


  // FUNÇÃO: VERIFICA SE A HORA JÁ PASSOU

  const isHoraPassada = (horaString: string) => {
    const hoje = new Date();
    // Zeramos as horas para comparar apenas os dias de forma exata
    const dataSel = new Date(dataSelecionada.getFullYear(), dataSelecionada.getMonth(), dataSelecionada.getDate());
    const dataHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

    // Se o dia selecionado for antes de hoje, todas as horas já passaram
    if (dataSel < dataHoje) return true;
    
    // Se o dia selecionado for no futuro, nenhuma hora passou
    if (dataSel > dataHoje) return false;

    // Se o dia selecionado for HOJE, precisamos comparar as horas e os minutos
    const [horaSelecionadaNum, minutoSelecionadoNum] = horaString.split(':').map(Number);
    const horaAtual = hoje.getHours();
    const minutoAtual = hoje.getMinutes();

    if (horaSelecionadaNum < horaAtual) return true;
    if (horaSelecionadaNum === horaAtual && minutoSelecionadoNum <= minutoAtual) return true;
    
    return false;
  };

  useEffect(() => {
    setDataVisualizacao(new Date(dataSelecionada.getFullYear(), dataSelecionada.getMonth(), 1));
    carregarAgendamentos();
  }, [dataSelecionada]);

  useEffect(() => {
    carregarDadosParaModal();
  }, []);
  
  const obterToken = () => localStorage.getItem("token") || "";

  const carregarAgendamentos = async () => {
    setLoading(true);
    try {
      const ano = dataSelecionada.getFullYear();
      const mes = String(dataSelecionada.getMonth() + 1).padStart(2, '0');
      const dia = String(dataSelecionada.getDate()).padStart(2, '0');
      const dataFormatada = `${ano}-${mes}-${dia}`;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agendamentos?data=${dataFormatada}`, {
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });

      if (response.ok) setAgendamentos(await response.json());
      else setAgendamentos([]); 
    } catch (error) { console.error("Erro ao carregar agendamentos:", error); } 
    finally { setLoading(false); }
  };

  const carregarDadosParaModal = async () => {
    try {
      const headers = { "Authorization": `Bearer ${obterToken()}` };
      const resClientes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuario`, { headers });
      if(resClientes.ok) setListaClientes(await resClientes.json());

      const resPro = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pessoas/profissionais`, { headers });
      if(resPro.ok) setListaProfissionais(await resPro.json());

      const resServicos = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/servicos`, { headers });
      if(resServicos.ok) setListaServicos(await resServicos.json());
    } catch (error) { console.error("Erro ao carregar listas do modal", error); }
  };

  const concluirAgendamento = async (id: number) => {
    if (!window.confirm("Deseja marcar este agendamento como CONCLUÍDO?")) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agendamentos/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${obterToken()}` },
        body: JSON.stringify({ status: "CONCLUIDO" })
      });
      if (response.ok) carregarAgendamentos();
      else alert("Erro ao concluir o agendamento.");
    } catch (error) { console.error(error); }
  };

  const cancelarAgendamento = async (id: number) => {
    if (!window.confirm("Atenção: Deseja realmente CANCELAR este agendamento?")) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agendamentos/${id}/cancelar`, {
        method: "PUT", headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      const data = await response.json();
      if (response.ok) carregarAgendamentos();
      else alert(data.msg || data.erro || "Erro ao cancelar.");
    } catch (error) { console.error(error); }
  };

  const abrirModal = (hora: string = "") => {
    if (hora && !isHoraPassada(hora)) {
      setHoraSelecionada(hora);
    } else {
      const primeiroDisponivel = horarios.find(h => !isHoraPassada(h));
      setHoraSelecionada(primeiroDisponivel || horarios[0]);
    }
    
    setClienteSelecionado("");
    setBuscaCliente("");
    setProfissionalSelecionado("");
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
        carregarAgendamentos();
      } else { setErroModal(data.msg || "Erro ao salvar agendamento."); }
    } catch (error) { setErroModal("Erro de conexão com a API."); } 
    finally { setLoading(false); }
  };

    const extrairHoraDeISO = (isoString: string) => {
    if (!isoString) return "";
    const data = new Date(isoString);
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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
      {/* CABEÇALHO */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8 border-b border-zinc-900 pb-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="w-12 h-12 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-[#E4B77D] transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#E4B77D]">Agenda do Barbeiro</h1>
            <p className="text-sm text-zinc-400 mt-1">Gerencie os horários e atendimentos</p>
          </div>
        </div>
        <button onClick={() => abrirModal()} className="px-6 py-3 bg-[#E4B77D] text-black font-bold rounded-md hover:bg-[#cfa56d] transition-colors shadow-lg shadow-[#E4B77D]/10 flex items-center gap-2 justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Novo Encaixe
        </button>
      </header>

      <main className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* COLUNA ESQUERDA: Navegação */}
        <aside className="w-full lg:w-80 flex flex-col gap-6">
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
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500"></span> Agendado</li>
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500"></span> Concluído</li>
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500"></span> Cancelado</li>
              </ul>
            </div>
          </div>
        </aside>

        {/* COLUNA DIREITA: Grade de Horários */}
        <section className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg overflow-hidden flex flex-col">
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

          <div className="p-2 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-2 p-4">
              {horarios.map((hora) => {
                
                // === LÓGICA DE BUSCA ===
                const agendamentosDaHora = agendamentos.filter(a => extrairHoraDeISO(a.dataHora) === hora);
                let agendamento = agendamentosDaHora.find(a => a.status === "AGENDADO" || a.status === "CONCLUIDO");
                if (!agendamento && agendamentosDaHora.length > 0) {
                    agendamento = agendamentosDaHora[0]; // Só sobrou cancelados
                }

                const passouDaHora = !agendamento && isHoraPassada(hora);

                let bgClass = "bg-zinc-950 border-zinc-800 hover:border-[#E4B77D]/50";
                let textClass = "text-zinc-500";
                
                if (agendamento) {
                  if (agendamento.status === "AGENDADO") { bgClass = "bg-blue-950/30 border-blue-900/50"; textClass = "text-blue-400"; } 
                  else if (agendamento.status === "CONCLUIDO") { bgClass = "bg-green-950/30 border-green-900/50 opacity-60"; textClass = "text-green-400"; } 
                  else if (agendamento.status === "CANCELADO") { bgClass = "bg-red-950/20 border-red-900/30 opacity-50"; textClass = "text-red-400"; }
                } else if (passouDaHora) {
                  bgClass = "bg-zinc-900/30 border-zinc-900 opacity-50 pointer-events-none";
                }

                const isDisponivelParaAgendar = !agendamento || agendamento.status === "CANCELADO";

                return (
                  <div key={hora} className={`flex items-stretch border rounded-lg transition-all group ${bgClass}`}>
                    <div className={`w-20 p-4 flex flex-col items-center justify-center border-r border-zinc-800/50 font-mono font-bold text-lg ${agendamento && agendamento.status !== "CANCELADO" ? textClass : (passouDaHora ? 'text-zinc-700 line-through' : 'text-zinc-500 group-hover:text-[#E4B77D]')}`}>
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
                        <span className={`italic text-sm transition-colors ${passouDaHora ? 'text-zinc-700' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                          {passouDaHora ? "Horário indisponível (já passou)" : "Horário disponível..."}
                        </span>
                      )}

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {agendamento && agendamento.status === 'AGENDADO' && (
                           <>
                            <button onClick={() => cancelarAgendamento(agendamento.id)} className="p-2 text-zinc-400 hover:text-red-400 bg-zinc-900 rounded-md border border-zinc-800" title="Cancelar Agendamento">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <button onClick={() => concluirAgendamento(agendamento.id)} className="p-2 text-zinc-400 hover:text-green-400 bg-zinc-900 rounded-md border border-zinc-800" title="Marcar como Concluído">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </button>
                           </>
                        )}
                        
                        {/* Se estiver disponível E a hora não tiver passado, exibe o botão Agendar */}
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
          </div>
        </section>
      </main>

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
                    {horarios.map(h => (
                      <option key={h} value={h} disabled={isHoraPassada(h)}>
                        {h} {isHoraPassada(h) ? '(Indisponível)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-[2]">
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Profissional</label>
                  <select 
                    value={profissionalSelecionado} onChange={(e) => setProfissionalSelecionado(e.target.value)} required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D] appearance-none"
                  >
                    <option value="" disabled>Selecione...</option>
                    {listaProfissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
              </div>

              {/* BUSCADOR DE CLIENTES (AUTOCOMPLETE) */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Cliente</label>
                <input 
                  type="text"
                  placeholder="Busque pelo nome..."
                  value={buscaCliente}
                  onChange={(e) => {
                    setBuscaCliente(e.target.value);
                    setDropdownClienteAberto(true);
                    setClienteSelecionado(""); 
                  }}
                  onFocus={() => setDropdownClienteAberto(true)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                />
                
                {/* Lista Suspensa (Dropdown) */}
                {dropdownClienteAberto && (
                  <ul className="absolute z-20 w-full mt-1 max-h-48 overflow-y-auto bg-zinc-800 border border-zinc-700 rounded-md shadow-2xl custom-scrollbar">
                    {clientesFiltrados.length > 0 ? (
                      clientesFiltrados.map(c => (
                        <li 
                          key={c.id} 
                          onClick={() => {
                            setClienteSelecionado(c.id);
                            setBuscaCliente(c.nome); 
                            setDropdownClienteAberto(false); 
                          }}
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
                
                {/* Indicador visual se o cliente foi selecionado corretamente */}
                {clienteSelecionado && !dropdownClienteAberto && (
                  <span className="absolute right-3 top-10 text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </span>
                )}
              </div>

              {/* CHECKBOXES DE SERVIÇOS COM DURAÇÃO */}
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
                
                {/* ALERTA DE HORÁRIO DE FIM */}
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

    </div>
  );
}