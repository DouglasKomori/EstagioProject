"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import MovimentacaoEstoqueModal from "../../components/MovimentacaoEstoqueModal";
import ConfirmModal from "../../components/ConfirmModal";

const TOUR_STEPS = [
  { targetId: "tour-novo-produto", titulo: "Novo Produto", descricao: "Cadastre um produto no estoque informando nome, marca, preço de custo, preço de venda e quantidade inicial.", posicao: "left" as const },
  { targetId: "tour-busca-produto", titulo: "Busca de Produtos", descricao: "Filtre a lista de produtos pelo nome em tempo real para localizar rapidamente o item desejado.", posicao: "bottom" as const },
  { targetId: "tour-inativos-produto", titulo: "Exibir Inativos", descricao: "Marque para visualizar os produtos inativados. Você pode reativá-los a qualquer momento.", posicao: "bottom" as const },
  { targetId: "tour-tabela-produtos", titulo: "Tabela de Produtos", descricao: "Cada linha exibe código, nome, marca, estoque atual e preços. Use '+ Acerto' para ajustar o estoque, 'Editar' para alterar dados ou 'Inativar' para suspender o produto.", posicao: "top" as const },
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

export default function GerenciarProdutos() {
  const [tourAtivo, setTourAtivo] = useState(false);
  const [tourPasso, setTourPasso] = useState(0);
  const [tourEntrando, setTourEntrando] = useState(false);
  const iniciarTour = () => { setTourPasso(0); setTourEntrando(true); setTourAtivo(true); setTimeout(() => setTourEntrando(false), 350); };
  const irParaPasso = useCallback((novo: number) => { setTourEntrando(true); setTimeout(() => { setTourPasso(novo); setTimeout(() => setTourEntrando(false), 50); }, 150); }, []);

  const [produtos, setProdutos] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]); 
  
  const [modalAberto, setModalAberto] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Estados para o Modal de Estoque
  const [modalMovimentacaoAberto, setModalMovimentacaoAberto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);

  // ESTADO DO NOSSO NOVO MODAL DE CONFIRMAÇÃO
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    titulo: "",
    mensagem: "",
    tipo: "atencao" as "atencao" | "perigo",
    onConfirm: () => {}
  });

  // Feedbacks Visuais
  const [erro, setErro] = useState(""); // Erro do modal de cadastro/edição
  const [erroPrincipal, setErroPrincipal] = useState(""); // Erro da tela principal
  const [sucesso, setSucesso] = useState("");
  const [busca, setBusca] = useState("");

  const [mostrarInativos, setMostrarInativos] = useState(false);

  const [id, setId] = useState("");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [precoCusto, setPrecoCusto] = useState("");
  const [precoVenda, setPrecoVenda] = useState("");
  const [quantidadeEstoque, setQuantidadeEstoque] = useState(""); // Mantido apenas para criação de NOVO produto
  const [marcaId, setMarcaId] = useState("");

  useEffect(() => {
    carregarMarcas(); 
  }, []);

  useEffect(() => {
    carregarProdutos();
  }, [mostrarInativos]);

  const obterToken = () => {
    return localStorage.getItem("token") || "";
  };

  const carregarProdutos = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/produtos${mostrarInativos ? '?inativos=true' : ''}`;
      const response = await fetch(url, {
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProdutos(data);
      } else {
        setProdutos([]);
      }
    } catch (error) {
      console.error("Erro ao carregar produtos", error);
    }
  };

  const carregarMarcas = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marcas`, {
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMarcas(data); 
      }
    } catch (error) {
      console.error("Erro ao carregar marcas", error);
    }
  };

  const abrirModalNovo = () => {
    setId("");
    setNome("");
    setDescricao("");
    setPrecoCusto("");
    setPrecoVenda("");
    setQuantidadeEstoque(""); // Zerado para cadastro
    setMarcaId("");
    setErro("");
    setModalAberto(true);
  };

  const abrirModalEditar = (produto: any) => {
    setId(produto.id);
    setNome(produto.nome);
    setDescricao(produto.descricao);
    setPrecoCusto(produto.precoCusto);
    setPrecoVenda(produto.precoVenda);
    // IMPORTANTE: setQuantidadeEstoque NÃO é preenchido aqui para edição
    setQuantidadeEstoque(produto.quantidadeEstoque); 
    setMarcaId(produto.marcaId ? String(produto.marcaId) : ""); 
    setErro("");
    setModalAberto(true);
  };

  const abrirModalMovimentacao = (produto: any) => {
    setProdutoSelecionado(produto);
    setModalMovimentacaoAberto(true);
  };

  const exibirSucesso = (mensagem: string) => {
    setSucesso(mensagem);
    setTimeout(() => setSucesso(""), 3000);
  };

  const exibirErroPrincipal = (mensagem: string) => {
    setErroPrincipal(mensagem);
    setTimeout(() => setErroPrincipal(""), 4000);
  };

  const salvarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const metodo = id ? "PUT" : "POST";
    const url = id ? `${process.env.NEXT_PUBLIC_API_URL}/produtos/${id}` : `${process.env.NEXT_PUBLIC_API_URL}/produtos`;

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${obterToken()}`
        },
        body: JSON.stringify({ 
          nome, 
          descricao, 
          precoCusto: Number(precoCusto), 
          precoVenda: Number(precoVenda), 
          quantidadeEstoque: id ? undefined : Number(quantidadeEstoque), 
          marcaId: Number(marcaId) 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setModalAberto(false);
        carregarProdutos();
        exibirSucesso(id ? "Produto atualizado com sucesso!" : "Produto cadastrado com sucesso!");
      } else {
        setErro(data.msg || "Erro ao salvar o produto.");
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
      titulo: "Inativar Produto?",
      mensagem: "Atenção: Tem certeza que deseja inativar este produto do estoque?",
      tipo: "perigo", // Botão vermelho!
      onConfirm: () => efetivarInativacao(idExclusao)
    });
  };

  const efetivarInativacao = async (idExclusao: string) => {
    setConfirmModal({ ...confirmModal, isOpen: false }); // Fecha o modal
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/produtos/${idExclusao}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });

      if (response.ok) {
        carregarProdutos();
        exibirSucesso("Produto inativado com sucesso!");
      } else {
        exibirErroPrincipal("Não foi possível inativar o produto.");
      }
    } catch (error) {
      console.error("Erro ao excluir", error);
      exibirErroPrincipal("Erro de conexão ao tentar inativar.");
    }
  };

  const abrirModalReativar = (idReativacao: string) => {
    setConfirmModal({
      isOpen: true,
      titulo: "Reativar Produto?",
      mensagem: "Deseja reativar este produto? Ele voltará a aparecer no sistema de vendas e estoque.",
      tipo: "atencao", // Botão dourado
      onConfirm: () => efetivarReativacao(idReativacao)
    });
  };

  const efetivarReativacao = async (idReativacao: string) => {
    setConfirmModal({ ...confirmModal, isOpen: false }); // Fecha o modal
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/produtos/${idReativacao}/reativar`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });

      if (response.ok) {
        carregarProdutos();
        exibirSucesso("Produto reativado com sucesso!");
      } else {
        exibirErroPrincipal("Não foi possível reativar o produto.");
      }
    } catch (error) {
      console.error("Erro ao reativar", error);
      exibirErroPrincipal("Erro de conexão ao tentar reativar.");
    }
  };

  // ==========================================

  const produtosFiltrados = produtos.filter((p) => 
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const obterNomeMarca = (idDaMarca: any) => {
    if (!idDaMarca) return "SEM MARCA";
    const marcaEncontrada = marcas.find(m => Number(m.id) === Number(idDaMarca));
    return marcaEncontrada ? marcaEncontrada.nome : "SEM MARCA";
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 font-sans relative">
      {tourAtivo && (<Tour passo={tourPasso} entrando={tourEntrando} onProximo={() => irParaPasso(tourPasso + 1)} onAnterior={() => irParaPasso(tourPasso - 1)} onFechar={() => setTourAtivo(false)} />)}

      <header className="flex justify-between items-center mb-6 border-b border-zinc-900 pb-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="w-12 h-12 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-[#E4B77D] transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#E4B77D]">Gerenciar Produtos</h1>
            <p className="text-sm text-zinc-400 mt-1">Controle de estoque e valores</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={iniciarTour} className="px-4 py-2 bg-zinc-800 text-[#E4B77D] font-bold rounded-md hover:bg-zinc-700 transition-all border border-[#E4B77D]/30 hover:border-[#E4B77D]/70 flex items-center gap-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ? Ajuda
          </button>
          <button
            id="tour-novo-produto"
            onClick={abrirModalNovo}
            className="px-4 py-2 bg-[#E4B77D] text-black font-bold rounded-md hover:bg-[#cfa56d] transition-colors shadow-lg shadow-[#E4B77D]/10"
          >
            + Novo Produto
          </button>
        </div>
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

      {/* Barra de Pesquisa e Filtro de Inativos */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row gap-4">
        
        <div id="tour-busca-produto" className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-500">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar produto pelo nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#E4B77D] transition-all shadow-sm"
          />
        </div>

        <div id="tour-inativos-produto" className="flex items-center gap-3 px-5 py-3 bg-zinc-900 border border-zinc-800 rounded-lg">
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
      
      <main id="tour-tabela-produtos" className="max-w-6xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium w-16 text-center">Cód</th>
                <th className="p-4 font-medium">Produto & Marca</th>
                <th className="p-4 font-medium text-center">Estoque</th>
                <th className="p-4 font-medium text-right">Custo / Venda</th>
                <th className="p-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map((produto) => (
                  <tr key={produto.id} className={`transition-colors ${produto.ativo === 0 ? 'bg-red-950/10 hover:bg-red-950/20' : 'hover:bg-zinc-800/50'}`}>
                    <td className="p-4 text-zinc-500 text-center text-sm font-mono">
                      #{produto.id}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-md bg-zinc-800 flex items-center justify-center border border-zinc-700 flex-shrink-0 ${produto.ativo === 0 ? 'text-zinc-600' : 'text-[#E4B77D]'}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold block ${produto.ativo === 0 ? 'text-zinc-500 line-through' : 'text-white'}`}>
                              {produto.nome}
                            </span>
                            {produto.ativo === 0 && (
                              <span className="text-[10px] uppercase font-bold bg-red-900/40 text-red-400 px-2 py-0.5 rounded-md border border-red-900/50">
                                Inativo
                              </span>
                            )}
                          </div>
                          <span className={`text-xs font-medium tracking-wide uppercase ${produto.ativo === 0 ? 'text-zinc-600' : 'text-zinc-400'}`}>
                            {obterNomeMarca(produto.marcaId)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${produto.ativo === 0 ? 'bg-zinc-900 text-zinc-500 border border-zinc-700' : (produto.quantidadeEstoque > 5 ? 'bg-green-950/50 text-green-400 border border-green-900' : 'bg-red-950/50 text-red-400 border border-red-900')}`}>
                        {produto.quantidadeEstoque} un
                      </span>
                    </td>
                    
                    <td className="p-4 text-right">
                      <div className={`text-[10px] font-semibold tracking-widest uppercase mb-0.5 ${produto.ativo === 0 ? 'text-zinc-600' : 'text-zinc-500'}`}>
                        Custo: R$ {Number(produto.precoCusto).toFixed(2).replace('.', ',')}
                      </div>
                      <div className={`text-md font-bold ${produto.ativo === 0 ? 'text-zinc-500' : 'text-[#E4B77D]'}`}>
                        R$ {Number(produto.precoVenda).toFixed(2).replace('.', ',')}
                      </div>
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-4 items-center">
                        
                        {produto.ativo !== 0 && (
                          <button 
                            onClick={() => abrirModalMovimentacao(produto)}
                            className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors font-bold tracking-wide"
                            title="Ajustar Estoque"
                          >
                            + Acerto
                          </button>
                        )}
                        
                        <div className="w-px h-4 bg-zinc-800"></div>

                        <button 
                          onClick={() => abrirModalEditar(produto)}
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
                        >
                          Editar
                        </button>
                        
                        {/* BOTÕES ATUALIZADOS PARA O NOVO MODAL */}
                        {produto.ativo !== 0 ? (
                          <button 
                            onClick={() => abrirModalInativar(produto.id)}
                            className="text-sm text-red-500 hover:text-red-400 transition-colors font-medium"
                          >
                            Inativar
                          </button>
                        ) : (
                          <button 
                            onClick={() => abrirModalReativar(produto.id)}
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

      {/* MODAL DE EDIÇÃO / CADASTRO */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModalAberto(false)} />
          
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-lg p-6 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-white mb-6">
              {id ? "Editar Produto" : "Novo Produto"}
            </h2>

            <form onSubmit={salvarProduto} className="flex flex-col gap-4">
              {erro && <div className="bg-red-950/50 border border-red-900 text-red-400 text-sm p-3 rounded-md">{erro}</div>}
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Nome do Produto</label>
                <input 
                  type="text" required value={nome} onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                  placeholder="Ex: Pomada Modeladora Efeito Matte"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-[2]">
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Marca</label>
                  <select 
                    required value={marcaId} onChange={(e) => setMarcaId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D] appearance-none"
                  >
                    <option value="" disabled>Selecione uma marca...</option>
                    {marcas.map(marca => (
                      <option key={marca.id} value={marca.id}>
                        {marca.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {!id && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Estoque Inicial</label>
                    <input 
                      type="number" required min="0" value={quantidadeEstoque} onChange={(e) => setQuantidadeEstoque(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                      placeholder="0"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Descrição</label>
                <textarea 
                  required value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D] resize-none"
                  placeholder="Detalhes adicionais do produto..."
                />
              </div>

              <div className="flex gap-4 border-t border-zinc-800 pt-4 mt-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Preço de Custo (R$)</label>
                  <input 
                    type="number" required step="0.01" min="0" value={precoCusto} onChange={(e) => setPrecoCusto(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-zinc-400 focus:outline-none focus:border-[#E4B77D]"
                    placeholder="15.00"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Preço de Venda (R$)</label>
                  <input 
                    type="number" required step="0.01" min="0" value={precoVenda} onChange={(e) => setPrecoVenda(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-[#E4B77D] font-bold focus:outline-none focus:border-[#E4B77D]"
                    placeholder="35.00"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-2">
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

      {/* 5. MODAL DE MOVIMENTAÇÃO DE ESTOQUE */}
      {modalMovimentacaoAberto && produtoSelecionado && (
        <MovimentacaoEstoqueModal
          produto={produtoSelecionado}
          onClose={() => setModalMovimentacaoAberto(false)}
          onSuccess={() => {
            carregarProdutos(); 
            exibirSucesso("Estoque atualizado com sucesso!");
          }}
        />
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