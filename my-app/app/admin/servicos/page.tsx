"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function GerenciarServicos() {
  const [servicos, setServicos] = useState<any[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [busca, setBusca] = useState("");

  const [id, setId] = useState("");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tempoEstimadoMinutos, setTempoEstimadoMinutos] = useState("");

  useEffect(() => {
    carregarServicos();
  }, []);

  const obterToken = () => {
    return localStorage.getItem("token") || "";
  };

  const carregarServicos = async () => {
    try {
      const response = await fetch("process.env.NEXT_PUBLIC_API_URL/servicos", {
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setServicos(data);
      }
    } catch (error) {
      console.error("Erro ao carregar serviços", error);
    }
  };

  const abrirModalNovo = () => {
    setId("");
    setNome("");
    setDescricao("");
    setValor("");
    setTempoEstimadoMinutos("");
    setErro("");
    setModalAberto(true);
  };

  const abrirModalEditar = (servico: any) => {
    setId(servico.id);
    setNome(servico.nome);
    setDescricao(servico.descricao);
    setValor(servico.valor);
    setTempoEstimadoMinutos(servico.tempoEstimadoMinutos);
    setErro("");
    setModalAberto(true);
  };

  const exibirSucesso = (mensagem: string) => {
    setSucesso(mensagem);
    setTimeout(() => {
      setSucesso("");
    }, 3000);
  };

  const salvarServico = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const metodo = id ? "PUT" : "POST";
    const url = id ? `process.env.NEXT_PUBLIC_API_URL/servicos/${id}` : "process.env.NEXT_PUBLIC_API_URL/servicos";

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
          valor: Number(valor), 
          tempoEstimadoMinutos: Number(tempoEstimadoMinutos) 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setModalAberto(false);
        carregarServicos();
        exibirSucesso(id ? "Serviço atualizado com sucesso!" : "Novo serviço cadastrado com sucesso!");
      } else {
        setErro(data.msg || "Erro ao salvar o serviço.");
      }
    } catch (error) {
      setErro("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const excluirServico = async (idExclusao: string) => {
    if (!window.confirm("Tem certeza que deseja inativar este serviço?")) return;

    try {
      const response = await fetch(`process.env.NEXT_PUBLIC_API_URL/servicos/${idExclusao}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });

      if (response.ok) {
        carregarServicos();
        exibirSucesso("Serviço inativado com sucesso!");
      } else {
        alert("Não foi possível excluir o serviço.");
      }
    } catch (error) {
      console.error("Erro ao excluir", error);
    }
  };

  //Filtra os serviços pelo nome em tempo real
  const servicosFiltrados = servicos.filter((servico) => 
    servico.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 font-sans relative">
      
      <header className="flex justify-between items-center mb-6 border-b border-zinc-900 pb-4 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-[#E4B77D]">Gerenciar Serviços</h1>
          <p className="text-sm text-zinc-400 mt-1">Cadastre ou altere os cortes e tratamentos</p>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/admin" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Voltar
          </Link>
          <button 
            onClick={abrirModalNovo}
            className="px-4 py-2 bg-[#E4B77D] text-black font-bold rounded-md hover:bg-[#cfa56d] transition-colors shadow-lg shadow-[#E4B77D]/10"
          >
            + Novo Serviço
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

      {/* Barra de Pesquisa */}
      <div className="max-w-6xl mx-auto mb-8 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {/* Ícone de Lupa */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-500">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar serviço pelo nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#E4B77D] transition-all shadow-sm"
        />
      </div>
      
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicosFiltrados.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-zinc-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mb-4 opacity-50">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-lg">Nenhum serviço encontrado.</p>
          </div>
        ) : (
          servicosFiltrados.map((servico) => (
            <div key={servico.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col shadow-lg hover:border-zinc-700 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">{servico.nome}</h3>
                <span className="text-[#E4B77D] font-bold bg-[#E4B77D]/10 px-3 py-1 rounded-full text-sm whitespace-nowrap">
                  R$ {Number(servico.valor).toFixed(2).replace('.', ',')}
                </span>
              </div>
              <p className="text-zinc-400 text-sm mb-4 flex-grow">{servico.descricao}</p>
              
              <div className="flex items-center text-zinc-500 text-sm mb-4 gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {servico.tempoEstimadoMinutos} minutos
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button 
                  onClick={() => abrirModalEditar(servico)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center gap-1"
                >
                  Editar
                </button>
                <button 
                  onClick={() => excluirServico(servico.id)}
                  className="text-sm text-red-500 hover:text-red-400 transition-colors font-medium flex items-center gap-1"
                >
                  Inativar
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      {/* MODAL: Formulário de Cadastro/Edição */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModalAberto(false)} />
          
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-md p-6 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-white mb-6">
              {id ? "Editar Serviço" : "Novo Serviço"}
            </h2>

            <form onSubmit={salvarServico} className="flex flex-col gap-4">
              {erro && <div className="bg-red-950/50 border border-red-900 text-red-400 text-sm p-3 rounded-md">{erro}</div>}
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Nome do Serviço</label>
                <input 
                  type="text" required value={nome} onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                  placeholder="Ex: Corte Degradê"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Descrição</label>
                <textarea 
                  required value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D] resize-none"
                  placeholder="Detalhes do corte ou tratamento..."
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Valor (R$)</label>
                  <input 
                    type="number" required step="0.01" min="0" value={valor} onChange={(e) => setValor(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                    placeholder="45.00"
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Tempo (Min)</label>
                  <input 
                    type="number" required min="1" value={tempoEstimadoMinutos} onChange={(e) => setTempoEstimadoMinutos(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                    placeholder="30"
                  />
                </div>
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