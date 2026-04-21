"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ConfirmModal from "../../components/ConfirmModal";

export default function GerenciarBloqueios() {
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
      
      <header className="flex justify-between items-center mb-6 border-b border-zinc-900 pb-4 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-[#E4B77D] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Bloqueios de Agenda
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Gerencie atestados, imprevistos e férias dos barbeiros</p>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/admin" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Voltar
          </Link>
          <button onClick={abrirModalNovo} className="px-4 py-2 bg-red-950/80 text-red-400 border border-red-900 font-bold rounded-md hover:bg-red-900 hover:text-red-100 transition-colors shadow-lg flex items-center gap-2">
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
        <div className="flex items-center gap-3 w-max px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg">
          <input
            type="checkbox" id="filtroInativos" checked={mostrarInativos} onChange={(e) => setMostrarInativos(e.target.checked)}
            className="w-4 h-4 accent-[#E4B77D] cursor-pointer"
          />
          <label htmlFor="filtroInativos" className="text-sm text-zinc-300 cursor-pointer select-none">
            Exibir Histórico de Bloqueios Antigos
          </label>
        </div>
      </div>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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