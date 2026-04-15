"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function GestaoCaixa() {
  const [caixaAberto, setCaixaAberto] = useState(false);
  const [dadosCaixa, setDadosCaixa] = useState<any>(null);
  const [resumo, setResumo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para Modais
  const [modalAbrirAberto, setModalAbrirAberto] = useState(false);
  const [modalFecharAberto, setModalFecharAberto] = useState(false);
  const [saldoInicial, setSaldoInicial] = useState("");

  const obterToken = () => localStorage.getItem("token") || "";

  useEffect(() => {
    carregarDadosCaixa();
  }, []);

  const carregarDadosCaixa = async () => {
    setLoading(true);
    try {
      const headers = { "Authorization": `Bearer ${obterToken()}` };
      
      // 1. Verifica Status
      const resStatus = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/caixas/status`, { headers });
      const statusData = await resStatus.json();
      setCaixaAberto(statusData.aberto);
      setDadosCaixa(statusData.caixa);

      // 2. Se estiver aberto, busca o resumo financeiro atualizado
      if (statusData.aberto) {
        const resResumo = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/caixas/resumo`, { headers });
        if (resResumo.ok) setResumo(await resResumo.json());
      }
    } catch (e) {
      console.error("Erro ao carregar dados do caixa");
    } finally {
      setLoading(false);
    }
  };

  const abrirCaixa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/caixas/abrir`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${obterToken()}` },
        body: JSON.stringify({ saldoInicial: Number(saldoInicial.replace(',', '.')) })
      });

      if (res.ok) {
        setModalAbrirAberto(false);
        setSaldoInicial("");
        carregarDadosCaixa();
      } else {
        const err = await res.json();
        alert(err.msg);
      }
    } catch (e) { alert("Erro de conexão"); }
  };

  const confirmarFechamento = async () => {
    if (!window.confirm("Deseja encerrar o expediente e fechar o caixa?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/caixas/fechar`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      if (res.ok) {
        alert("Caixa fechado com sucesso!");
        setModalFecharAberto(false);
        carregarDadosCaixa();
      }
    } catch (e) { alert("Erro ao fechar"); }
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#E4B77D] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 font-sans">
      <header className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <span className="p-2 bg-[#E4B77D]/10 rounded-lg text-[#E4B77D]">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </span>
            Fluxo de Caixa
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Monitore as entradas e saídas em tempo real.</p>
        </div>

        <div className="flex gap-3">
          <button onClick={carregarDadosCaixa} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
          {!caixaAberto && (
            <button onClick={() => setModalAbrirAberto(true)} className="px-6 py-3 bg-[#E4B77D] text-black font-bold rounded-xl hover:bg-[#cfa56d] transition-all shadow-lg shadow-[#E4B77D]/10">
              Abrir Novo Caixa
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {caixaAberto ? (
          <>
            {/* CARD 1: SALDO ATUAL */}
            <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                 <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Saldo Final Esperado</span>
              <h2 className="text-6xl font-black text-[#E4B77D] mt-2 mb-8">R$ {Number(resumo?.saldoFinalEsperado || 0).toFixed(2)}</h2>
              
              <div className="grid grid-cols-2 gap-8 border-t border-zinc-800 pt-8">
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Fundo Inicial</p>
                  <p className="text-xl font-mono text-zinc-300">R$ {Number(resumo?.saldoInicial || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-emerald-500/60 uppercase font-bold mb-1">Total em Comandas</p>
                  <p className="text-xl font-mono text-emerald-400 font-bold">+ R$ {Number(resumo?.faturamento || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* CARD 2: STATUS E AÇÕES */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-sm font-bold text-emerald-500 uppercase">Caixa Operacional</span>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Caixa aberto por <span className="text-white font-medium">Você</span> às {new Date(resumo?.dataAbertura).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}.
                </p>
              </div>

              <div className="space-y-3 mt-8">
                <button onClick={() => setModalFecharAberto(true)} className="w-full py-4 bg-zinc-950 border border-red-900/30 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all">
                  Encerrar Expediente
                </button>
                <Link href="/admin/comandas" className="block text-center w-full py-3 text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
                  Ir para as Comandas
                </Link>
              </div>
            </div>
          </>
        ) : (
          /* ESTADO FECHADO */
          <div className="col-span-full py-32 bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-600"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-white">O Caixa está fechado</h3>
            <p className="text-zinc-500 mt-2 max-w-sm">Você precisa abrir o caixa para começar a registrar os pagamentos dos clientes hoje.</p>
            <button onClick={() => setModalAbrirAberto(true)} className="mt-8 px-8 py-4 bg-[#E4B77D] text-black font-black rounded-xl hover:bg-[#cfa56d] transition-all transform hover:scale-105">
              Começar Expediente
            </button>
          </div>
        )}
      </main>

      {/* MODAL ABRIR */}
      {modalAbrirAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-bold text-white mb-2">Abertura de Caixa</h2>
            <p className="text-zinc-400 mb-8 text-sm">Confirme o valor em dinheiro disponível para troco na gaveta.</p>
            <form onSubmit={abrirCaixa} className="space-y-6">
              <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Saldo Inicial em Espécie</label>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-[#E4B77D]">R$</span>
                  <input type="number" step="0.01" required autoFocus value={saldoInicial} onChange={(e) => setSaldoInicial(e.target.value)} className="bg-transparent text-4xl font-black text-white outline-none w-full" placeholder="0,00" />
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setModalAbrirAberto(false)} className="flex-1 py-4 text-zinc-500 font-bold hover:text-white transition-colors">Cancelar</button>
                <button type="submit" className="flex-[2] py-4 bg-[#E4B77D] text-black font-black rounded-2xl hover:bg-[#cfa56d] transition-all">Abrir Caixa</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FECHAR */}
      {modalFecharAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Fechar Expediente?</h2>
            <p className="text-zinc-400 text-sm mb-8">O saldo final de <strong className="text-white">R$ {Number(resumo?.saldoFinalEsperado || 0).toFixed(2)}</strong> será registrado e o caixa será encerrado.</p>
            
            <div className="flex flex-col gap-3">
              <button onClick={confirmarFechamento} className="w-full py-4 bg-red-500 text-white font-black rounded-2xl hover:bg-red-600 transition-all">Confirmar Fechamento</button>
              <button onClick={() => setModalFecharAberto(false)} className="w-full py-4 text-zinc-500 font-bold hover:text-white transition-colors">Voltar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}