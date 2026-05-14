"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ConfirmModal from "../../components/ConfirmModal";

const TOUR_STEPS = [
  { targetId: "tour-nova-marca", titulo: "Nova Marca", descricao: "Cadastre uma nova marca de produto. As marcas aparecem como opção ao cadastrar produtos no estoque.", posicao: "left" as const },
  { targetId: "tour-busca-marca", titulo: "Busca de Marcas", descricao: "Filtre as marcas pelo nome em tempo real para encontrar rapidamente a que deseja editar ou inativar.", posicao: "bottom" as const },
  { targetId: "tour-inativos-marca", titulo: "Exibir Inativos", descricao: "Marque para ver marcas desativadas. Você pode reativá-las a qualquer momento clicando em 'Reativar'.", posicao: "bottom" as const },
  { targetId: "tour-tabela-marcas", titulo: "Tabela de Marcas", descricao: "Lista todas as marcas cadastradas. Use 'Editar' para alterar o nome ou 'Inativar' para suspender a marca sem perder os produtos vinculados.", posicao: "top" as const },
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

export default function GerenciarMarcas() {
  const [tourAtivo, setTourAtivo] = useState(false);
  const [tourPasso, setTourPasso] = useState(0);
  const [tourEntrando, setTourEntrando] = useState(false);
  const iniciarTour = () => { setTourPasso(0); setTourEntrando(true); setTourAtivo(true); setTimeout(() => setTourEntrando(false), 350); };
  const irParaPasso = useCallback((novo: number) => { setTourEntrando(true); setTimeout(() => { setTourPasso(novo); setTimeout(() => setTourEntrando(false), 50); }, 150); }, []);

  const [marcas, setMarcas] = useState<any[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [loading, setLoading] = useState(false);

  // Feedbacks Visuais
  const [erro, setErro] = useState(""); 
  const [erroPrincipal, setErroPrincipal] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [busca, setBusca] = useState("");
  
  // ESTADO DO NOSSO NOVO MODAL DE CONFIRMAÇÃO
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    titulo: "",
    mensagem: "",
    tipo: "atencao" as "atencao" | "perigo",
    onConfirm: () => {}
  });

  const [mostrarInativos, setMostrarInativos] = useState(false);

  const [id, setId] = useState("");
  const [nome, setNome] = useState("");

  useEffect(() => {
    carregarMarcas();
  }, [mostrarInativos]);

  const obterToken = () => {
    return localStorage.getItem("token") || "";
  };

  const carregarMarcas = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/marcas${mostrarInativos ? '?inativos=true' : ''}`;
      const response = await fetch(url, {
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMarcas(data);
      } else {
        setMarcas([]);
      }
    } catch (error) {
      console.error("Erro ao carregar marcas", error);
    }
  };

  const abrirModalNovo = () => {
    setId("");
    setNome("");
    setErro("");
    setModalAberto(true);
  };

  const abrirModalEditar = (marca: any) => {
    setId(marca.id);
    setNome(marca.nome);
    setErro("");
    setModalAberto(true);
  };

  const exibirSucesso = (mensagem: string) => {
    setSucesso(mensagem);
    setTimeout(() => setSucesso(""), 3000);
  };

  const exibirErroPrincipal = (mensagem: string) => {
    setErroPrincipal(mensagem);
    setTimeout(() => setErroPrincipal(""), 4000);
  };

  const salvarMarca = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const metodo = id ? "PUT" : "POST";
    const url = id ? `${process.env.NEXT_PUBLIC_API_URL}/marcas/${id}` : `${process.env.NEXT_PUBLIC_API_URL}/marcas`;

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${obterToken()}`
        },
        body: JSON.stringify({ nome }),
      });

      const data = await response.json();

      if (response.ok) {
        setModalAberto(false);
        carregarMarcas();
        exibirSucesso(id ? "Marca atualizada com sucesso!" : "Marca cadastrada com sucesso!");
      } else {
        setErro(data.msg || "Erro ao salvar a marca.");
      }
    } catch (error) {
      setErro("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const abrirModalInativar = (idExclusao: string) => {
    setConfirmModal({
      isOpen: true,
      titulo: "Inativar Marca?",
      mensagem: "Atenção: Tem certeza que deseja inativar esta marca? Os produtos atrelados a ela continuarão existindo, mas a marca não aparecerá em novos cadastros.",
      tipo: "perigo", // Vermelho
      onConfirm: () => efetivarInativacao(idExclusao)
    });
  };

  const efetivarInativacao = async (idExclusao: string) => {
    setConfirmModal({ ...confirmModal, isOpen: false }); // Fecha o modal
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marcas/${idExclusao}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });

      if (response.ok) {
        carregarMarcas();
        exibirSucesso("Marca inativada com sucesso!");
      } else {
        exibirErroPrincipal("Não foi possível inativar a marca.");
      }
    } catch (error) {
      console.error("Erro ao excluir", error);
      exibirErroPrincipal("Erro de conexão ao tentar inativar.");
    }
  };

  const abrirModalReativar = (idReativacao: string) => {
    setConfirmModal({
      isOpen: true,
      titulo: "Reativar Marca?",
      mensagem: "Deseja reativar esta marca? Ela voltará a aparecer nas opções de cadastro do sistema.",
      tipo: "atencao", // Dourado
      onConfirm: () => efetivarReativacao(idReativacao)
    });
  };

  const efetivarReativacao = async (idReativacao: string) => {
    setConfirmModal({ ...confirmModal, isOpen: false }); // Fecha o modal
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marcas/${idReativacao}/reativar`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });

      if (response.ok) {
        carregarMarcas();
        exibirSucesso("Marca reativada com sucesso!");
      } else {
        exibirErroPrincipal("Não foi possível reativar a marca.");
      }
    } catch (error) {
      console.error("Erro ao reativar", error);
      exibirErroPrincipal("Erro de conexão ao tentar reativar.");
    }
  };

  // ==========================================

  const marcasFiltradas = marcas.filter((m) => 
    m.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 font-sans relative">
      {tourAtivo && (<Tour passo={tourPasso} entrando={tourEntrando} onProximo={() => irParaPasso(tourPasso + 1)} onAnterior={() => irParaPasso(tourPasso - 1)} onFechar={() => setTourAtivo(false)} />)}

      <header className="flex justify-between items-center mb-6 border-b border-zinc-900 pb-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="w-12 h-12 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-[#E4B77D] transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#E4B77D]">Gerenciar Marcas</h1>
            <p className="text-sm text-zinc-400 mt-1">Marcas de produtos comercializados ou utilizados</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={iniciarTour} className="px-4 py-2 bg-zinc-800 text-[#E4B77D] font-bold rounded-md hover:bg-zinc-700 transition-all border border-[#E4B77D]/30 hover:border-[#E4B77D]/70 flex items-center gap-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ? Ajuda
          </button>
          <button
            id="tour-nova-marca"
            onClick={abrirModalNovo}
            className="px-4 py-2 bg-[#E4B77D] text-black font-bold rounded-md hover:bg-[#cfa56d] transition-colors shadow-lg shadow-[#E4B77D]/10"
          >
            + Nova Marca
          </button>
        </div>
      </header>

      {/* FEEDBACKS VISUAIS NA TELA PRINCIPAL */}
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

      {/* Barra de Pesquisa e Filtro */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row gap-4">
        
        {/* Input de Busca */}
        <div id="tour-busca-marca" className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-500">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar marca pelo nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#E4B77D] transition-all shadow-sm"
          />
        </div>

        {/* Checkbox de Inativos */}
        <div id="tour-inativos-marca" className="flex items-center gap-3 px-5 py-3 bg-zinc-900 border border-zinc-800 rounded-lg">
          <input
            type="checkbox"
            id="filtroInativos"
            checked={mostrarInativos}
            onChange={(e) => setMostrarInativos(e.target.checked)}
            className="w-4 h-4 accent-[#E4B77D] cursor-pointer"
          />
          <label htmlFor="filtroInativos" className="text-sm text-zinc-300 cursor-pointer select-none">
            Exibir Inativos
          </label>
        </div>

      </div>
      
      {/* Tabela de Dados */}
      <main id="tour-tabela-marcas" className="max-w-6xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium w-16 text-center">ID</th>
                <th className="p-4 font-medium">Nome da Marca</th>
                <th className="p-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {marcasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-zinc-500">
                    Nenhuma marca encontrada.
                  </td>
                </tr>
              ) : (
                marcasFiltradas.map((marca) => (
                  <tr key={marca.id} className={`transition-colors ${marca.ativo === 0 ? 'bg-red-950/10 hover:bg-red-950/20' : 'hover:bg-zinc-800/50'}`}>
                    <td className="p-4 text-zinc-500 text-center text-sm font-mono">
                      #{marca.id}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className={`font-bold whitespace-nowrap ${marca.ativo === 0 ? 'text-zinc-500 line-through' : 'text-white'}`}>
                          {marca.nome}
                        </span>
                        {/* Selo Visual de Inativo */}
                        {marca.ativo === 0 && (
                          <span className="text-xs bg-red-900/40 text-red-400 px-2 py-0.5 rounded-md border border-red-900/50">
                            Inativo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-4">
                        <button 
                          onClick={() => abrirModalEditar(marca)}
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
                        >
                          Editar
                        </button>
                        
                        {/* Lógica Condicional do Modal */}
                        {marca.ativo !== 0 ? (
                          <button 
                            onClick={() => abrirModalInativar(marca.id)}
                            className="text-sm text-red-500 hover:text-red-400 transition-colors font-medium"
                          >
                            Inativar
                          </button>
                        ) : (
                          <button 
                            onClick={() => abrirModalReativar(marca.id)}
                            className="text-sm text-green-500 hover:text-green-400 transition-colors font-medium"
                          >
                            Reativar
                          </button>
                        )}
                        
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL: Formulário da Marca */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModalAberto(false)} />
          
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-sm p-6 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-white mb-6">
              {id ? "Editar Marca" : "Nova Marca"}
            </h2>

            <form onSubmit={salvarMarca} className="flex flex-col gap-4">
              {erro && <div className="bg-red-950/50 border border-red-900 text-red-400 text-sm p-3 rounded-md">{erro}</div>}
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Nome da Marca</label>
                <input 
                  type="text" required value={nome} onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                  placeholder="Ex: Baboon"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  type="button" onClick={() => setModalAberto(false)}
                  className="flex-1 py-3 border border-zinc-700 text-zinc-300 rounded-md hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" disabled={loading}
                  className="flex-1 py-3 bg-[#E4B77D] text-black font-bold rounded-md hover:bg-[#cfa56d] transition-colors disabled:opacity-50"
                >
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