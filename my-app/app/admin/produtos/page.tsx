"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import MovimentacaoEstoqueModal from "../../components/MovimentacaoEstoqueModal"; 
import ConfirmModal from "../../components/ConfirmModal";

export default function GerenciarProdutos() {
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
      
      <header className="flex justify-between items-center mb-6 border-b border-zinc-900 pb-4 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-[#E4B77D]">Gerenciar Produtos</h1>
          <p className="text-sm text-zinc-400 mt-1">Controle de estoque e valores</p>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/admin" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Voltar
          </Link>
          <button 
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
        
        <div className="relative flex-1">
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

        <div className="flex items-center gap-3 px-5 py-3 bg-zinc-900 border border-zinc-800 rounded-lg">
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
      
      <main className="max-w-6xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
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