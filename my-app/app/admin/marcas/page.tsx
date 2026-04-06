"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function GerenciarMarcas() {
  const [marcas, setMarcas] = useState<any[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [loading, setLoading] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [busca, setBusca] = useState("");
  
  // NOVO: Estado para controlar o filtro de inativos
  const [mostrarInativos, setMostrarInativos] = useState(false);

  const [id, setId] = useState("");
  const [nome, setNome] = useState("");

  // NOVO: Atualizamos o useEffect para recarregar sempre que o filtro mudar
  useEffect(() => {
    carregarMarcas();
  }, [mostrarInativos]);

  const obterToken = () => {
    return localStorage.getItem("token") || "";
  };

  // ATUALIZADO: Agora envia o parâmetro ?inativos=true se o checkbox estiver marcado
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
        // Se a API retornar 404 (Nenhuma marca), limpamos a lista
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

  const excluirMarca = async (idExclusao: string) => {
    if (!window.confirm("Atenção: Tem certeza que deseja inativar esta marca?")) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marcas/${idExclusao}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });

      if (response.ok) {
        carregarMarcas();
        exibirSucesso("Marca inativada com sucesso!");
      } else {
        alert("Não foi possível excluir a marca.");
      }
    } catch (error) {
      console.error("Erro ao excluir", error);
    }
  };

  const reativarMarca = async (idReativacao: string) => {
    if (!window.confirm("Deseja reativar esta marca? Ela voltará a aparecer no sistema.")) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marcas/${idReativacao}/reativar`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });

      if (response.ok) {
        carregarMarcas();
        exibirSucesso("Marca reativada com sucesso!");
      } else {
        alert("Não foi possível reativar a marca.");
      }
    } catch (error) {
      console.error("Erro ao reativar", error);
    }
  };

  const marcasFiltradas = marcas.filter((m) => 
    m.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 font-sans relative">
      
      <header className="flex justify-between items-center mb-6 border-b border-zinc-900 pb-4 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-[#E4B77D]">Gerenciar Marcas</h1>
          <p className="text-sm text-zinc-400 mt-1">Marcas de produtos comercializados ou utilizados</p>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/admin" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Voltar
          </Link>
          <button 
            onClick={abrirModalNovo}
            className="px-4 py-2 bg-[#E4B77D] text-black font-bold rounded-md hover:bg-[#cfa56d] transition-colors shadow-lg shadow-[#E4B77D]/10"
          >
            + Nova Marca
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

      {/* Barra de Pesquisa e Filtro */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row gap-4">
        
        {/* Input de Busca */}
        <div className="relative flex-1">
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
      
      {/* Tabela de Dados */}
      <main className="max-w-6xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
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
                        
                        {/* Lógica Condicional: Se ativo=1 mostra inativar, se ativo=0 mostra reativar */}
                        {marca.ativo !== 0 ? (
                          <button 
                            onClick={() => excluirMarca(marca.id)}
                            className="text-sm text-red-500 hover:text-red-400 transition-colors font-medium"
                          >
                            Inativar
                          </button>
                        ) : (
                          <button 
                            onClick={() => reativarMarca(marca.id)}
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

    </div>
  );
}