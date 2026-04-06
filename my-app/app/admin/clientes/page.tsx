"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function GerenciarClientes() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [busca, setBusca] = useState("");

  const [id, setId] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");

  useEffect(() => {
    carregarClientes();
  }, []);

  const obterToken = () => {
    return localStorage.getItem("token") || "";
  };

  const carregarClientes = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuario`, {
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        const apenasClientes = data.filter((user: any) => user.perfil === "CLIENTE");
        setClientes(apenasClientes);
      }
    } catch (error) {
      console.error("Erro ao carregar clientes", error);
    }
  };

  const abrirModalNovo = () => {
    setId("");
    setNome("");
    setEmail("");
    setTelefone("");
    setSenha("");
    setErro("");
    setModalAberto(true);
  };

  const abrirModalEditar = (cliente: any) => {
    setId(cliente.id);
    setNome(cliente.nome);
    setEmail(cliente.email);
    setTelefone(cliente.telefone || "");
    setSenha("");
    setErro("");
    setModalAberto(true);
  };

  const exibirSucesso = (mensagem: string) => {
    setSucesso(mensagem);
    setTimeout(() => setSucesso(""), 3000);
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, "");
    if (valor.length > 11) valor = valor.slice(0, 11);
    if (valor.length <= 2) setTelefone(valor);
    else if (valor.length <= 6) setTelefone(`(${valor.slice(0, 2)}) ${valor.slice(2)}`);
    else if (valor.length <= 10) setTelefone(`(${valor.slice(0, 2)}) ${valor.slice(2, 6)}-${valor.slice(6)}`);
    else setTelefone(`(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7, 11)}`);
  };

  const salvarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const metodo = id ? "PUT" : "POST";
    const url = id ? `${process.env.NEXT_PUBLIC_API_URL}/usuario/${id}` : `${process.env.NEXT_PUBLIC_API_URL}/usuario`;

    const payload: any = { nome, email, telefone };
    if (!id && senha) payload.senha = senha;

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${obterToken()}`
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setModalAberto(false);
        carregarClientes();
        exibirSucesso(id ? "Dados do cliente atualizados!" : "Cliente cadastrado com sucesso!");
      } else {
        setErro(data.erro || data.msg || "Erro ao salvar o cliente.");
      }
    } catch (error) {
      setErro("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const excluirCliente = async (idExclusao: string) => {
    if (!window.confirm("Atenção: Tem certeza que deseja excluir/inativar este cliente do sistema?")) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuario/${idExclusao}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });

      if (response.ok) {
        carregarClientes();
        exibirSucesso("Cliente inativado com sucesso!");
      } else {
        alert("Não foi possível excluir o cliente.");
      }
    } catch (error) {
      console.error("Erro ao excluir", error);
    }
  };

  const clientesFiltrados = clientes.filter((c) => 
    c.nome.toLowerCase().includes(busca.toLowerCase()) || 
    c.email.toLowerCase().includes(busca.toLowerCase()) ||
    (c.telefone && c.telefone.includes(busca))
  );

  return (
    
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 font-sans relative">
      
      <header className="flex justify-between items-center mb-6 border-b border-zinc-900 pb-4 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-[#E4B77D]">Gerenciar Clientes</h1>
          <p className="text-sm text-zinc-400 mt-1">Lista de usuários cadastrados no sistema</p>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/admin" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Voltar
          </Link>
          <button 
            onClick={abrirModalNovo}
            className="px-4 py-2 bg-[#E4B77D] text-black font-bold rounded-md hover:bg-[#cfa56d] transition-colors shadow-lg shadow-[#E4B77D]/10"
          >
            + Novo Cliente
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

      <div className="max-w-6xl mx-auto mb-8 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-500">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar cliente por nome, e-mail ou telefone..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#E4B77D] transition-all shadow-sm"
        />
      </div>
      
      <main className="max-w-6xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Nome</th>
                <th className="p-4 font-medium">E-mail</th>
                <th className="p-4 font-medium">Telefone</th>
                <th className="p-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-zinc-500">
                    Nenhum cliente encontrado com a busca atual.
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[#E4B77D] font-bold text-xs uppercase border border-zinc-700 flex-shrink-0">
                          {cliente.nome.charAt(0)}
                        </div>
                        <span className="font-bold text-white whitespace-nowrap">{cliente.nome}</span>
                      </div>
                    </td>
                    <td className="p-4 text-zinc-300 text-sm whitespace-nowrap">{cliente.email}</td>
                    <td className="p-4 text-zinc-300 text-sm whitespace-nowrap">{cliente.telefone || "N/A"}</td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-4">
                        <button 
                          onClick={() => abrirModalEditar(cliente)}
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => excluirCliente(cliente.id)}
                          className="text-sm text-red-500 hover:text-red-400 transition-colors font-medium"
                        >
                          Inativar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModalAberto(false)} />
          
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-md p-6 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-white mb-6">
              {id ? "Editar Cliente" : "Novo Cliente"}
            </h2>

            <form onSubmit={salvarCliente} className="flex flex-col gap-4">
              {erro && <div className="bg-red-950/50 border border-red-900 text-red-400 text-sm p-3 rounded-md">{erro}</div>}
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Nome Completo</label>
                <input 
                  type="text" required value={nome} onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                  placeholder="Ex: João da Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">E-mail</label>
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                  placeholder="joao@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Telefone / WhatsApp</label>
                <input 
                  type="tel" required maxLength={15} value={telefone} onChange={handleTelefoneChange}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                  placeholder="(00) 00000-0000"
                />
              </div>

              {!id && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Senha Temporária</label>
                  <input 
                    type="password" required value={senha} onChange={(e) => setSenha(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                    placeholder="Crie uma senha de primeiro acesso"
                  />
                  <p className="text-xs text-zinc-500 mt-1">O cliente poderá alterar a senha depois.</p>
                </div>
              )}

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