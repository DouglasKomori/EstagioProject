"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
// IMPORTAÇÃO DO NOSSO NOVO COMPONENTE
import ConfirmModal from "../../components/ConfirmModal";

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
      
      <header className="flex justify-between items-center mb-6 border-b border-zinc-900 pb-4 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-[#E4B77D] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Escala de Trabalho
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Defina os dias e horários fixos de cada barbeiro</p>
        </div>
        <Link href="/admin" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
          Voltar
        </Link>
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
      <div className="max-w-6xl mx-auto mb-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg">
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
        <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-500">
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