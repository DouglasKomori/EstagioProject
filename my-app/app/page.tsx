"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [usuarioLogado, setUsuarioLogado] = useState<{nome: string, perfil: string} | null>(null);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    const usuarioString = localStorage.getItem("usuario");
    if (usuarioString) {
      setUsuarioLogado(JSON.parse(usuarioString));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuarioLogado(null);
  };

  return (
    <div className="h-screen w-full bg-black text-zinc-50 font-sans flex flex-col overflow-hidden relative">
      
      {menuAberto && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 transition-opacity backdrop-blur-sm"
          onClick={() => setMenuAberto(false)}
        />
      )}

      {/* MENU LATERAL*/}
      <div 
        className={`fixed top-0 left-0 h-full w-72 bg-zinc-950 border-r border-zinc-900 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${
          menuAberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          
          {/* Cabeçalho do Menu Lateral */}
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-900">
            <span className="text-[#E4B77D] font-bold tracking-widest text-sm uppercase">Menu</span>
            <button 
              onClick={() => setMenuAberto(false)}
              className="text-zinc-500 hover:text-[#E4B77D] transition-colors p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Links do Menu */}
          <nav className="flex flex-col gap-2">
            
            <Link href="/sobre" className="flex items-center gap-4 px-4 py-3 rounded-lg text-zinc-300 hover:text-[#E4B77D] hover:bg-zinc-900/50 transition-all group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-500 group-hover:text-[#E4B77D] transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Nossa História</span>
            </Link>

            <Link href="/espaco-interno" className="flex items-center gap-4 px-4 py-3 rounded-lg text-zinc-300 hover:text-[#E4B77D] hover:bg-zinc-900/50 transition-all group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-500 group-hover:text-[#E4B77D] transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Espaço Interno</span>
            </Link>

            {/* Linha Divisória */}
            <div className="h-px w-full bg-zinc-900 my-4"></div>

            <Link href={usuarioLogado ? "/agendamento" : "/login"} className="flex items-center gap-4 px-4 py-3 rounded-lg text-zinc-300 hover:text-[#E4B77D] hover:bg-zinc-900/50 transition-all group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-500 group-hover:text-[#E4B77D] transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Meus Agendamentos</span>
            </Link>

            {/* Opção Exclusiva para o ADMIN */}
            {usuarioLogado?.perfil === "ADMIN" && (
              <Link href="/admin" className="flex items-center gap-4 px-4 py-3 mt-2 rounded-lg border border-amber-900/30 bg-amber-950/20 text-amber-500 hover:bg-amber-900/40 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-bold">Painel do Barbeiro</span>
              </Link>
            )}

          </nav>

          {/* Rodapé do Menu */}
          <div className="mt-auto pt-8 border-t border-zinc-900 text-sm text-zinc-500 text-center">
            <Image src="/logoSemFundo.png" alt="Logo" width={60} height={60} className="mx-auto mb-3 opacity-30 object-contain" />
            <p>Desde 2016</p>
          </div>
        </div>
      </div>

      {/* Cabeçalho / Navbar */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-zinc-900 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMenuAberto(true)}
            className="text-zinc-300 hover:text-[#E4B77D] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {usuarioLogado ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400 hidden sm:block">
              Olá, <strong className="text-[#E4B77D] font-medium">{usuarioLogado.nome.split(" ")[0]}</strong>
            </span>
            <Link 
              href={usuarioLogado.perfil === "ADMIN" ? "/admin" : "/agendamento"} 
              className="px-4 py-2 text-sm font-bold bg-[#E4B77D] text-black rounded-md hover:bg-[#cfa56d] transition-colors"
            >
              {usuarioLogado.perfil === "ADMIN" ? "Meu Painel" : "Meus Agendamentos"}
            </Link>
            <button 
              onClick={handleLogout} 
              className="px-3 py-2 text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
            >
              Sair
            </button>
          </div>
        ) : (
          <nav className="flex gap-4">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-[#E4B77D] transition-colors">
              Entrar
            </Link>
            <Link href="/cadastro" className="px-4 py-2 text-sm font-bold bg-[#E4B77D] text-black rounded-md hover:bg-[#cfa56d] transition-colors">
              Cadastrar
            </Link>
          </nav>
        )}
      </header>

      <main className="flex flex-col items-center justify-center flex-grow px-4 text-center">
        <div className="mb-6 drop-shadow-[0_0_25px_rgba(228,183,125,0.15)]">
           <Image 
            src="/logoSemFundo.png" 
            alt="Victor Uematsu Barbearia Desde 2016" 
            width={300} 
            height={300} 
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
          O seu estilo, <br className="hidden md:block" />
          <span className="text-[#E4B77D]">em boas mãos.</span>
        </h1>
        <p className="text-base md:text-lg text-zinc-400 max-w-2xl mb-8">
          Agende seu corte, barba ou tratamento na melhor barbearia da cidade. Profissionais qualificados e um ambiente preparado para você.
        </p>
        <Link 
          href={usuarioLogado ? "/agendamento" : "/login"} 
          className="px-8 py-3 text-lg font-bold bg-[#E4B77D] text-black rounded-md hover:bg-[#cfa56d] transition-transform hover:scale-105 shadow-lg shadow-[#E4B77D]/10"
        >
          Agendar Meu Horário
        </Link>
      </main>

      {/* Rodapé */}
      <footer className="w-full text-center py-4 text-xs text-zinc-600 border-t border-zinc-900 bg-black shrink-0">
        <p>© 2026 Victor Uematsu Barbearia.</p>
        <p>Endereço: R. Cel. Albino, 22 - Vila Maristela, Pres. Prudente - SP, 19020-360</p>
      </footer>
    </div>
  );
}