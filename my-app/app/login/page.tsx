"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fazerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/autenticacao/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));

      if (data.usuario.perfil === "ADMIN" || data.usuario.perfil === "FUNCIONARIO") {
        router.push("/admin");
        } else {
        router.push("/");
          }
      } else {
        setErro(data.msg || "Erro ao fazer login. Verifique suas credenciais.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      setErro("Não foi possível conectar ao servidor da barbearia.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center font-sans overflow-hidden px-4">
      
      <Link href="/" className="absolute top-6 left-6 text-zinc-400 hover:text-[#E4B77D] transition-colors">
        &larr; Voltar para o início
      </Link>

      <div className="w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-xl p-8 shadow-2xl shadow-[#E4B77D]/5">

        <div className="flex flex-col items-center mb-8">
          <Image src="/logoSemFundo.png" alt="Victor Uematsu" width={150} height={150} className="mb-4" />
          <h1 className="text-2xl font-bold text-white">Acesse sua conta</h1>
          <p className="text-zinc-400 text-sm mt-1">Informe seus dados para continuar</p>
        </div>

        <form onSubmit={fazerLogin} className="flex flex-col gap-4">
          
          {erro && (
            <div className="bg-red-950/50 border border-red-900 text-red-400 text-sm p-3 rounded-md text-center">
              {erro}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D] focus:ring-1 focus:ring-[#E4B77D] transition-all"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Senha</label>
            <input 
              type="password" 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D] focus:ring-1 focus:ring-[#E4B77D] transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 bg-[#E4B77D] text-black font-bold py-3 rounded-md hover:bg-[#cfa56d] transition-colors disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

        </form>

        <div className="mt-6 text-center text-sm text-zinc-400">
          Ainda não é cliente?{' '}
          <Link href="/cadastro" className="text-[#E4B77D] hover:underline">
            Crie sua conta
          </Link>
        </div>

      </div>
    </div>
  );
}