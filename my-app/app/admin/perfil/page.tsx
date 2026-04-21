"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MeuPerfil() {
  const router = useRouter();
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);

  // Estados do Formulário de Senha
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    const usuarioString = localStorage.getItem("usuario");
    if (!usuarioString) {
      router.push("/login");
      return;
    }
    setUsuarioLogado(JSON.parse(usuarioString));
  }, []);

  const exibirErro = (msg: string) => {
    setErro(msg);
    setTimeout(() => setErro(""), 4000);
  };

  const exibirSucesso = (msg: string) => {
    setSucesso(msg);
    setTimeout(() => setSucesso(""), 4000);
  };

  const handleTrocarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    
    if (novaSenha !== confirmarSenha) {
      exibirErro("A nova senha e a confirmação não são iguais.");
      return;
    }

    if (novaSenha.length < 3) {
      exibirErro("A nova senha deve ter pelo menos 3 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuario/alterar-senha`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ senhaAtual, novaSenha })
      });

      const data = await res.json();

      if (res.ok) {
        exibirSucesso("Senha alterada com sucesso!");
        setSenhaAtual("");
        setNovaSenha("");
        setConfirmarSenha("");
      } else {
        exibirErro(data.msg || "Erro ao alterar a senha.");
      }
    } catch (error) {
      exibirErro("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (!usuarioLogado) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 font-sans">
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-10 border-b border-zinc-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#E4B77D]">
            Minha Conta
          </h1>
          <p className="text-zinc-400 mt-1">Gerencie seus dados de acesso.</p>
        </div>
      </header>

      {/* Feedbacks */}
      {sucesso && (
        <div className="max-w-4xl mx-auto mb-6 bg-green-950/50 border border-green-900 text-green-400 p-4 rounded-lg text-center font-medium">
          {sucesso}
        </div>
      )}
      {erro && (
        <div className="max-w-4xl mx-auto mb-6 bg-red-950/50 border border-red-900 text-red-400 p-4 rounded-lg text-center font-medium">
          {erro}
        </div>
      )}

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* CARD 1: Dados Pessoais (Apenas leitura) */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl h-max">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-zinc-800 pb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[#E4B77D]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Meus Dados
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Nome Completo</label>
              <div className="bg-zinc-950 px-4 py-3 rounded-lg border border-zinc-800 text-zinc-300">
                {usuarioLogado.nome}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">E-mail de Acesso</label>
              <div className="bg-zinc-950 px-4 py-3 rounded-lg border border-zinc-800 text-zinc-300">
                {usuarioLogado.email}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Telefone</label>
              <div className="bg-zinc-950 px-4 py-3 rounded-lg border border-zinc-800 text-zinc-300">
                {usuarioLogado.telefone || "Não informado"}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Nível de Acesso</label>
              <span className="inline-block mt-1 px-3 py-1 bg-[#E4B77D]/10 text-[#E4B77D] border border-[#E4B77D]/30 rounded-md text-xs font-bold">
                {usuarioLogado.perfil}
              </span>
            </div>
          </div>
        </section>

        {/* CARD 2: Troca de Senha */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-zinc-800 pb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[#E4B77D]"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Segurança
          </h2>

          <form onSubmit={handleTrocarSenha} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Senha Atual</label>
              <input 
                type="password" required value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                placeholder="Sua senha atual"
              />
            </div>
            <div className="h-px bg-zinc-800 my-2"></div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Nova Senha</label>
              <input 
                type="password" required value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                placeholder="Pelo menos 3 caracteres"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Confirmar Nova Senha</label>
              <input 
                type="password" required value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                placeholder="Repita a nova senha"
              />
            </div>

            <button 
              type="submit" disabled={loading}
              className="mt-4 w-full py-4 bg-[#E4B77D] text-black font-extrabold rounded-lg hover:bg-[#cfa56d] transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-[#E4B77D]/20"
            >
              {loading ? "Atualizando..." : "Alterar Senha"}
            </button>
          </form>
        </section>

      </main>
    </div>
  );
}