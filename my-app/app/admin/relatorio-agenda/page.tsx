"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function RelatorioAgenda() {
  const [relatorio, setRelatorio] = useState<any[]>([]);
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // Filtros de Período
  const dataHoje = new Date().toISOString().split('T')[0];
  const [filtroDataInicio, setFiltroDataInicio] = useState(dataHoje);
  const [filtroDataFim, setFiltroDataFim] = useState(dataHoje);
  
  const [filtroProfissional, setFiltroProfissional] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");

  const obterToken = () => localStorage.getItem("token") || "";

  useEffect(() => {
    carregarProfissionais();
    buscarRelatorio(dataHoje, dataHoje, "", "", "");
  }, []);

  const carregarProfissionais = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pessoas/profissionais`, {
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      if (res.ok) setProfissionais(await res.json());
    } catch (e) {
      console.error("Erro ao carregar profissionais", e);
    }
  };

  const buscarRelatorio = async (
    inicio = filtroDataInicio, 
    fim = filtroDataFim, 
    profId = filtroProfissional, 
    status = filtroStatus, 
    cliente = filtroCliente
  ) => {
    setLoading(true);
    setErro("");
    setRelatorio([]);

    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/agendamentos/relatorio/agenda?`;
      if (inicio) url += `dataInicio=${inicio}&`;
      if (fim) url += `dataFim=${fim}&`;
      if (profId) url += `profissionalId=${profId}&`;
      if (status) url += `status=${status}&`;
      if (cliente) url += `clienteNome=${encodeURIComponent(cliente)}&`;

      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });

      if (res.ok) {
        const dados = await res.json();
        setRelatorio(dados);
      } else {
        const err = await res.json();
        setErro(err.msg || err.erro || "Nenhum agendamento encontrado no período.");
      }
    } catch (e) {
      setErro("Erro de conexão ao gerar o relatório.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Pequena trava de segurança para o usuário não colocar fim antes do início
    if (filtroDataInicio && filtroDataFim && filtroDataInicio > filtroDataFim) {
      setErro("A Data Início não pode ser maior que a Data Fim.");
      return;
    }

    buscarRelatorio();
  };

  const handleImprimir = () => {
    window.print();
  };

  const formatarHora = (isoString: string) => {
    if (!isoString) return "--:--";
    const data = new Date(isoString);
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatarData = (isoString: string) => {
    if (!isoString) return "--/--/----";
    const data = new Date(isoString);
    return data.toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 font-sans relative print:bg-white print:text-black print:p-0">
      
      <header className="flex flex-col md:flex-row md:justify-between items-center mb-6 border-b border-zinc-900 pb-4 max-w-6xl mx-auto print:hidden gap-4 md:gap-0">
        <div>
          <h1 className="text-2xl font-bold text-[#E4B77D] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Emissão de Agenda
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Gere relatórios de agendamentos com filtros por período</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Voltar</Link>
          <button 
            onClick={handleImprimir}
            className="px-6 py-2 bg-zinc-800 text-white font-bold rounded-md hover:bg-zinc-700 transition-colors border border-zinc-700 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Imprimir / PDF
          </button>
        </div>
      </header>

      {/* CABEÇALHO PARA IMPRESSÃO */}
      <div className="hidden print:block text-center mb-6 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-black uppercase tracking-widest">Barbearia Victor Uematsu</h1>
        <h2 className="text-lg font-bold mt-1">Relatório de Agendamentos</h2>
        <p className="text-sm mt-1">
          Período: {formatarData(`${filtroDataInicio}T00:00:00`)} até {formatarData(`${filtroDataFim}T00:00:00`)}
        </p>
        <p className="text-xs mt-1 text-gray-500">
          Impresso em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
        </p>
      </div>

      {/* FORMULÁRIO DE FILTROS */}
      <section className="max-w-6xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg mb-8 print:hidden">
        <form onSubmit={handleBuscar} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
          
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Início</label>
            <input 
              type="date" 
              value={filtroDataInicio} 
              onChange={(e) => setFiltroDataInicio(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white focus:border-[#E4B77D] outline-none color-scheme-dark"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Fim</label>
            <input 
              type="date" 
              value={filtroDataFim} 
              onChange={(e) => setFiltroDataFim(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white focus:border-[#E4B77D] outline-none color-scheme-dark"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Profissional</label>
            <select 
              value={filtroProfissional} 
              onChange={(e) => setFiltroProfissional(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white focus:border-[#E4B77D] outline-none"
            >
              <option value="">Todos</option>
              {profissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Status</label>
            <select 
              value={filtroStatus} 
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white focus:border-[#E4B77D] outline-none"
            >
              <option value="">Todos</option>
              <option value="AGENDADO">Agendados</option>
              <option value="CONCLUIDO">Concluídos</option>
              <option value="CANCELADO">Cancelados</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Cliente</label>
            <input 
              type="text" 
              value={filtroCliente} 
              onChange={(e) => setFiltroCliente(e.target.value)}
              placeholder="Ex: João"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white focus:border-[#E4B77D] outline-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-[#E4B77D] text-black font-bold rounded-md hover:bg-[#cfa56d] transition-colors h-[46px] flex items-center justify-center"
          >
            {loading ? "..." : "Buscar"}
          </button>
        </form>
      </section>

      {erro && (
        <div className="max-w-6xl mx-auto mb-6 bg-red-950/30 border border-red-900 text-red-400 p-4 rounded-lg text-center print:hidden">
          {erro}
        </div>
      )}

      {/* TABELA DE RESULTADOS */}
      <main className="max-w-6xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg print:bg-white print:border-none print:shadow-none print:rounded-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse print:border-black print:border">
            <thead>
              <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-widest print:bg-gray-200 print:text-black print:border-black">
                <th className="p-4 font-bold border-r border-zinc-800/50 print:border-black w-28">Horário</th>
                <th className="p-4 font-bold border-r border-zinc-800/50 print:border-black">Cliente / Contato</th>
                <th className="p-4 font-bold border-r border-zinc-800/50 print:border-black">Serviços</th>
                <th className="p-4 font-bold border-r border-zinc-800/50 print:border-black">Profissional</th>
                <th className="p-4 font-bold print:border-black w-32 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-zinc-800 print:divide-black">
              {relatorio.length === 0 && !loading && !erro ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500 italic print:text-black">
                    Nenhum agendamento encontrado no período.
                  </td>
                </tr>
              ) : (
                relatorio.map((ag) => (
                  <tr key={ag.id} className="hover:bg-zinc-800/30 transition-colors print:hover:bg-transparent">
                    
                    <td className="p-4 font-mono border-r border-zinc-800/50 print:border-black print:text-black align-top">
                      <div className="font-bold text-[#E4B77D] text-lg print:text-black">{formatarHora(ag.dataHora)}</div>
                      <div className="text-xs text-zinc-500 print:text-gray-700">{formatarData(ag.dataHora)}</div>
                    </td>

                    <td className="p-4 border-r border-zinc-800/50 print:border-black print:text-black align-top">
                      <div className="font-bold text-white print:text-black">{ag.clienteNome}</div>
                      <div className="text-zinc-400 text-xs mt-1 print:text-gray-700">{ag.clienteTelefone || "Sem telefone"}</div>
                    </td>

                    <td className="p-4 text-zinc-300 border-r border-zinc-800/50 print:border-black print:text-black align-top leading-relaxed">
                      {ag.servicos || <span className="italic text-zinc-600 print:text-gray-400">Nenhum serviço atrelado</span>}
                    </td>

                    <td className="p-4 text-zinc-400 border-r border-zinc-800/50 print:border-black print:text-black align-top">
                      {ag.profissionalNome}
                    </td>

                    <td className="p-4 text-center print:border-black print:text-black align-top">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider print:border print:bg-transparent print:text-black
                        ${ag.status === 'AGENDADO' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                          ag.status === 'CONCLUIDO' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                          'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                      >
                        {ag.status}
                      </span>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

    </div>
  );
}