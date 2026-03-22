"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, "");
    
    if (valor.length > 11) {
      valor = valor.slice(0, 11);
    }

    if (valor.length <= 2) {
      setTelefone(valor);
    } else if (valor.length <= 6) {
      setTelefone(`(${valor.slice(0, 2)}) ${valor.slice(2)}`);
    } else if (valor.length <= 10) {
      setTelefone(`(${valor.slice(0, 2)}) ${valor.slice(2, 6)}-${valor.slice(6)}`);
    } else {
      setTelefone(`(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7, 11)}`);
    }
  };

  const fazerCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/usuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome, email, senha, telefone }),
      });

      const data = await response.json();

      if (response.ok) {
        setSucesso(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setErro(data.erro || data.msg || "Erro ao realizar o cadastro.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      setErro("Não foi possível conectar ao servidor. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center font-sans py-10 px-4">
      
      <Link href="/login" className="absolute top-6 left-6 text-zinc-400 hover:text-[#E4B77D] transition-colors">
        &larr; Voltar para Login
      </Link>

      <div className="w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-xl p-8 shadow-2xl shadow-[#E4B77D]/5">
        
        <div className="flex flex-col items-center mb-6">
          <Image src="/logoSemFundo.png" alt="Victor Uematsu" width={150} height={150} className="mb-4" />
          <h1 className="text-2xl font-bold text-white">Criar nova conta</h1>
          <p className="text-zinc-400 text-sm mt-1">Cadastre-se para agendar seu horário</p>
        </div>

        {sucesso && (
          <div className="mb-4 bg-green-950/50 border border-green-900 text-green-400 text-sm p-3 rounded-md text-center">
            Cadastro realizado com sucesso! Redirecionando...
          </div>
        )}

        {!sucesso && (
          <form onSubmit={fazerCadastro} className="flex flex-col gap-4">
            
            {erro && (
              <div className="bg-red-950/50 border border-red-900 text-red-400 text-sm p-3 rounded-md text-center">
                {erro}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Nome Completo</label>
              <input 
                type="text" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D] focus:ring-1 focus:ring-[#E4B77D] transition-all"
                placeholder="Nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">E-mail</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D] focus:ring-1 focus:ring-[#E4B77D] transition-all"
                placeholder="seu@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Telefone / WhatsApp</label>
                <input 
                    type="tel" 
                    value={telefone}
                    onChange={handleTelefoneChange} 
                    maxLength={15} 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D] focus:ring-1 focus:ring-[#E4B77D] transition-all"
                    placeholder="(00) 00000-0000"
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
                placeholder="Crie uma senha forte"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 bg-[#E4B77D] text-black font-bold py-3 rounded-md hover:bg-[#cfa56d] transition-colors disabled:opacity-50"
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}