"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Agendamento() {
  const [nome, setNome] = useState("");

  useEffect(() => {
    const usuarioString = localStorage.getItem("usuario");
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      setNome(usuario.nome);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <header className="flex justify-between items-center mb-10 border-b border-zinc-900 pb-4">
        <h1 className="text-2xl font-bold text-[#E4B77D]">Área do Cliente</h1>
        <Link href="/" className="text-zinc-400 hover:text-white">Sair</Link>
      </header>
      
      <main>
        <h2 className="text-3xl font-bold mb-4">Olá, {nome || "Cliente"}!</h2>
        <p className="text-zinc-400">Aqui você poderá escolher o serviço e o melhor horário para o seu atendimento.</p>
        
        <div className="mt-8 p-6 border border-zinc-900 rounded-lg text-center text-zinc-500">
          Fazer Calendário de Agendamento
        </div>
      </main>
    </div>
  );
}