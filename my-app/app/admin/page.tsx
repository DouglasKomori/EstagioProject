"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [nome, setNome] = useState("");

  useEffect(() => {
    const usuarioString = localStorage.getItem("usuario");
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      setNome(usuario.nome.split(" ")[0]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 font-sans">

      {/* CABEÇALHO */}
      <header className="flex justify-between items-center mb-8 border-b border-zinc-900 pb-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-[#E4B77D]">Painel de Gerenciamento</h1>
        <Link href="/" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
          Voltar ao Início
        </Link>
      </header>

      <main className="max-w-6xl mx-auto space-y-10">
        
        <div>
          <h2 className="text-3xl font-extrabold mb-1">Olá, {nome || "Admin"}!</h2>
          <p className="text-zinc-400">Visão geral da Barbearia</p>
        </div>

        {/* SEÇÃO 1: OPERACIONAL (DIA A DIA) */}
        <section>
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 border-l-2 border-[#E4B77D] pl-3">Operação Diária</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            
            <Link href="/admin/agenda" className="group p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-[#E4B77D]/70 hover:bg-zinc-800/80 transition-all duration-300 hover:-translate-y-1 flex flex-col items-start shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#E4B77D]/5 rounded-bl-full -z-0"></div>
              <div className="p-3 bg-zinc-950/80 rounded-lg mb-4 text-[#E4B77D] group-hover:scale-110 transition-transform z-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-[#E4B77D] transition-colors z-10">Agenda de Hoje</h3>
              <p className="text-zinc-400 mt-2 text-sm z-10">Visualizar e gerenciar os horários do dia.</p>
            </Link>

            <Link href="/admin/comandas" className="group p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-[#E4B77D]/70 hover:bg-zinc-800/80 transition-all duration-300 hover:-translate-y-1 flex flex-col items-start shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#E4B77D]/5 rounded-bl-full -z-0"></div>
              <div className="p-3 bg-zinc-950/80 rounded-lg mb-4 text-[#E4B77D] group-hover:scale-110 transition-transform z-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-[#E4B77D] transition-colors z-10">Comandas</h3>
              <p className="text-zinc-400 mt-2 text-sm z-10">Lançar consumos e fechar contas de clientes.</p>
            </Link>

            <Link href="/admin/caixa" className="group p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-[#E4B77D]/70 hover:bg-zinc-800/80 transition-all duration-300 hover:-translate-y-1 flex flex-col items-start shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#E4B77D]/5 rounded-bl-full -z-0"></div>
              <div className="p-3 bg-zinc-950/80 rounded-lg mb-4 text-[#E4B77D] group-hover:scale-110 transition-transform z-10">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-[#E4B77D] transition-colors z-10">Caixa</h3>
              <p className="text-zinc-400 mt-2 text-sm z-10">Abertura, fechamento e resumo financeiro.</p>
            </Link>

          </div>
        </section>

        {/* SEÇÃO 2: GESTÃO E CADASTROS */}
        <section>
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 border-l-2 border-zinc-600 pl-3">Cadastros e Gestão</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <Link href="/admin/clientes" className="group flex items-center p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-[#E4B77D]/50 hover:bg-zinc-800/80 transition-all duration-300">
              <div className="p-3 bg-zinc-950 rounded-lg text-zinc-400 group-hover:text-[#E4B77D] group-hover:scale-110 transition-all mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-[#E4B77D] transition-colors">Clientes</h3>
                <p className="text-zinc-500 text-xs mt-0.5 line-clamp-1">Base de usuários do app</p>
              </div>
            </Link>

            <Link href="/admin/pessoas" className="group flex items-center p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-[#E4B77D]/50 hover:bg-zinc-800/80 transition-all duration-300">
              <div className="p-3 bg-zinc-950 rounded-lg text-zinc-400 group-hover:text-[#E4B77D] group-hover:scale-110 transition-all mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-[#E4B77D] transition-colors">Equipe</h3>
                <p className="text-zinc-500 text-xs mt-0.5 line-clamp-1">Barbeiros e Fornecedores</p>
              </div>
            </Link>

            <Link href="/admin/servicos" className="group flex items-center p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-[#E4B77D]/50 hover:bg-zinc-800/80 transition-all duration-300">
              <div className="p-3 bg-zinc-950 rounded-lg text-zinc-400 group-hover:text-[#E4B77D] group-hover:scale-110 transition-all mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-[#E4B77D] transition-colors">Serviços</h3>
                <p className="text-zinc-500 text-xs mt-0.5 line-clamp-1">Catálogo de cortes e valores</p>
              </div>
            </Link>

            <Link href="/admin/produtos" className="group flex items-center p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-[#E4B77D]/50 hover:bg-zinc-800/80 transition-all duration-300">
              <div className="p-3 bg-zinc-950 rounded-lg text-zinc-400 group-hover:text-[#E4B77D] group-hover:scale-110 transition-all mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-[#E4B77D] transition-colors">Produtos</h3>
                <p className="text-zinc-500 text-xs mt-0.5 line-clamp-1">Gestão de estoque e vendas</p>
              </div>
            </Link>

            <Link href="/admin/marcas" className="group flex items-center p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-[#E4B77D]/50 hover:bg-zinc-800/80 transition-all duration-300">
              <div className="p-3 bg-zinc-950 rounded-lg text-zinc-400 group-hover:text-[#E4B77D] group-hover:scale-110 transition-all mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-[#E4B77D] transition-colors">Marcas</h3>
                <p className="text-zinc-500 text-xs mt-0.5 line-clamp-1">Marcas e fornecedores</p>
              </div>
            </Link>

            <Link href="/admin/disponibilidade" className="group flex items-center p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-[#E4B77D]/50 hover:bg-zinc-800/80 transition-all duration-300">
              <div className="p-3 bg-zinc-950 rounded-lg text-zinc-400 group-hover:text-[#E4B77D] group-hover:scale-110 transition-all mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-[#E4B77D] transition-colors">Escalas</h3>
                <p className="text-zinc-500 text-xs mt-0.5 line-clamp-1">Dias e horários fixos</p>
              </div>
            </Link>

            <Link href="/admin/bloqueios" className="group flex items-center p-4 bg-red-950/10 border border-red-900/30 rounded-xl hover:border-red-500/50 hover:bg-red-950/20 transition-all duration-300 lg:col-span-2">
              <div className="p-3 bg-red-950/50 rounded-lg text-red-500 group-hover:scale-110 transition-all mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">Bloqueios de Agenda</h3>
                <p className="text-red-500/60 text-xs mt-0.5 line-clamp-1">Registrar folgas, férias e atestados médicos</p>
              </div>
            </Link>

          </div>
        </section>

        {/* SEÇÃO 3: RELATÓRIOS */}
        <section>
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 border-l-2 border-zinc-600 pl-3">Relatórios</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <Link href="/admin/relatorio-agenda" className="group flex items-center p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-blue-500/50 hover:bg-zinc-800/80 transition-all duration-300">
              <div className="p-3 bg-blue-950/30 rounded-lg text-blue-500 group-hover:scale-110 transition-all mr-4 border border-blue-900/50">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">Relatório de Atendimentos</h3>
                <p className="text-zinc-500 text-xs mt-0.5 line-clamp-1">Emissão de agenda filtrada por período e status</p>
              </div>
            </Link>

            <Link href="/admin/relatorio-produtos" className="group flex items-center p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-green-500/50 hover:bg-zinc-800/80 transition-all duration-300">
              <div className="p-3 bg-green-950/30 rounded-lg text-green-500 group-hover:scale-110 transition-all mr-4 border border-green-900/50">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-green-400 transition-colors">Relatório de Estoque</h3>
                <p className="text-zinc-500 text-xs mt-0.5 line-clamp-1">Giro de vendas, curva ABC e estoque crítico</p>
              </div>
            </Link>

          </div>
        </section>

      </main>
    </div>
  );
}