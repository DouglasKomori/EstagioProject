"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function RelatorioGiroProdutos() {
  const [relatorio, setRelatorio] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // Filtros de Período (Padrão: Mês Atual)
  const dataHoje = new Date();
  const primeiroDiaMes = new Date(dataHoje.getFullYear(), dataHoje.getMonth(), 1).toISOString().split('T')[0];
  const hojeString = dataHoje.toISOString().split('T')[0];
  
  const [filtroDataInicio, setFiltroDataInicio] = useState(primeiroDiaMes);
  const [filtroDataFim, setFiltroDataFim] = useState(hojeString);
  const [filtroMarca, setFiltroMarca] = useState("");
  const [filtroOrdem, setFiltroOrdem] = useState("mais_vendidos");
  const [filtroEstoqueBaixo, setFiltroEstoqueBaixo] = useState(false);

  const obterToken = () => localStorage.getItem("token") || "";

  useEffect(() => {
    carregarMarcas();
    buscarRelatorio(primeiroDiaMes, hojeString, "", "mais_vendidos", false);
  }, []);

  const carregarMarcas = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marcas`, {
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      if (res.ok) setMarcas(await res.json());
    } catch (e) {
      console.error("Erro ao carregar marcas", e);
    }
  };

  const buscarRelatorio = async (
    inicio = filtroDataInicio, 
    fim = filtroDataFim, 
    marcaId = filtroMarca, 
    ordem = filtroOrdem,
    estoqueBaixo = filtroEstoqueBaixo
  ) => {
    setLoading(true);
    setErro("");
    setRelatorio([]);

    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/produtos/relatorio/giro?`;
      if (inicio) url += `dataInicio=${inicio}&`;
      if (fim) url += `dataFim=${fim}&`;
      if (marcaId) url += `marcaId=${marcaId}&`;
      if (ordem) url += `ordem=${ordem}&`;
      if (estoqueBaixo) url += `estoqueBaixo=true&`;

      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });

      if (res.ok) {
        const dados = await res.json();
        setRelatorio(dados);
      } else {
        const err = await res.json();
        setErro(err.msg || "Erro ao buscar relatório.");
      }
    } catch (e) {
      setErro("Erro de conexão ao gerar o relatório.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    if (filtroDataInicio && filtroDataFim && filtroDataInicio > filtroDataFim) {
      setErro("A Data Início não pode ser maior que a Data Fim.");
      return;
    }
    buscarRelatorio();
  };

  const handleImprimir = () => window.print();

  const formatarMoeda = (valor: number) => {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatarData = (isoString: string) => {
    if (!isoString) return "--/--/----";
    return new Date(isoString).toLocaleDateString('pt-BR');
  };

  // Cálculos para o Resumo do Período
  const totalProdutosVendidos = relatorio.reduce((acc, curr) => acc + Number(curr.quantidadeVendida), 0);
  const totalFaturado = relatorio.reduce((acc, curr) => acc + Number(curr.faturamentoTotal), 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 font-sans relative print:bg-white print:text-black print:p-0">
      
      {/* HEADER TELA */}
      <header className="flex flex-col md:flex-row md:justify-between items-center mb-6 border-b border-zinc-900 pb-4 max-w-6xl mx-auto print:hidden gap-4 md:gap-0">
        <div>
          <h1 className="text-2xl font-bold text-[#E4B77D] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Relatório de Giro (Venda de Produtos)
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Relatório, saídas e controle de estoque crítico.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Voltar</Link>
          <button 
            onClick={handleImprimir}
            className="px-6 py-2 bg-zinc-800 text-white font-bold rounded-md hover:bg-zinc-700 transition-colors border border-zinc-700 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Imprimir PDF
          </button>
        </div>
      </header>

      {/* CABEÇALHO DE IMPRESSÃO */}
      <div className="hidden print:block text-center mb-6 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-black uppercase tracking-widest">Barbearia Victor Uematsu</h1>
        <h2 className="text-lg font-bold mt-1">Relatório de Giro de Produtos</h2>
        <p className="text-sm mt-1">
          Período analisado: {formatarData(`${filtroDataInicio}T00:00:00`)} até {formatarData(`${filtroDataFim}T00:00:00`)}
        </p>
        <div className="flex justify-center gap-8 mt-4 pt-4 border-t border-gray-300">
          <div><span className="text-xs text-gray-500 uppercase">Qtd. Vendida</span><br/><strong className="text-xl">{totalProdutosVendidos} itens</strong></div>
          <div><span className="text-xs text-gray-500 uppercase">Faturamento</span><br/><strong className="text-xl">{formatarMoeda(totalFaturado)}</strong></div>
        </div>
      </div>

      {/* FORMULÁRIO DE FILTROS */}
      <section className="max-w-6xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg mb-8 print:hidden">
        <form onSubmit={handleBuscar} className="flex flex-wrap gap-4 items-end">
          
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Início</label>
            <input 
              type="date" 
              value={filtroDataInicio} 
              onChange={(e) => setFiltroDataInicio(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white focus:border-[#E4B77D] outline-none color-scheme-dark"
            />
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Fim</label>
            <input 
              type="date" 
              value={filtroDataFim} 
              onChange={(e) => setFiltroDataFim(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white focus:border-[#E4B77D] outline-none color-scheme-dark"
            />
          </div>

          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Marca</label>
            <select 
              value={filtroMarca} 
              onChange={(e) => setFiltroMarca(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white focus:border-[#E4B77D] outline-none"
            >
              <option value="">Todas as Marcas</option>
              {marcas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Ordenar por</label>
            <select 
              value={filtroOrdem} 
              onChange={(e) => setFiltroOrdem(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white focus:border-[#E4B77D] outline-none"
            >
              <option value="mais_vendidos">Mais Vendidos (Qtd)</option>
              <option value="maior_faturamento">Maior Faturamento (R$)</option>
              <option value="menos_vendidos">Menos Vendidos</option>
              <option value="alfabetica">Ordem Alfabética</option>
            </select>
          </div>

          <div className="flex items-center min-w-[160px] h-[50px] bg-zinc-950 border border-zinc-800 rounded-md px-4">
            <label className="flex items-center gap-3 cursor-pointer w-full h-full">
              <input 
                type="checkbox" 
                checked={filtroEstoqueBaixo} 
                onChange={(e) => setFiltroEstoqueBaixo(e.target.checked)} 
                className="w-4 h-4 accent-red-500" 
              />
              <span className="text-sm font-medium text-red-400">Estoque Crítico ( {"<"} 5 )</span>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="px-8 py-3 bg-[#E4B77D] text-black font-bold rounded-md hover:bg-[#cfa56d] transition-colors h-[50px] min-w-[120px] flex items-center justify-center"
          >
            {loading ? "..." : "Buscar"}
          </button>
        </form>
      </section>

      {/* DASHBOARD RESUMO (Oculto na impressão, pois o papel já tem o seu) */}
      {!loading && relatorio.length > 0 && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 print:hidden">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-950/30 text-blue-500 rounded-full flex items-center justify-center border border-blue-900/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <div>
              <span className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Produtos Vendidos</span>
              <strong className="text-2xl text-white block leading-tight">{totalProdutosVendidos} <span className="text-sm font-normal text-zinc-400">unidades</span></strong>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-950/30 text-green-500 rounded-full flex items-center justify-center border border-green-900/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <span className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">Faturamento</span>
              <strong className="text-2xl text-green-400 block leading-tight">{formatarMoeda(totalFaturado)}</strong>
            </div>
          </div>
        </div>
      )}

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
                <th className="p-4 font-bold border-r border-zinc-800/50 print:border-black">Produto</th>
                <th className="p-4 font-bold border-r border-zinc-800/50 print:border-black text-center w-32">Estoque Na Gaveta</th>
                <th className="p-4 font-bold border-r border-zinc-800/50 print:border-black text-center w-32">Vendidos No Período</th>
                <th className="p-4 font-bold print:border-black text-right w-40">Faturamento</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-zinc-800 print:divide-black">
              {relatorio.length === 0 && !loading && !erro ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-zinc-500 italic print:text-black">
                    Não houve vendas para os filtros informados.
                  </td>
                </tr>
              ) : (
                relatorio.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors print:hover:bg-transparent">
                    
                    {/* PRODUTO */}
                    <td className="p-4 border-r border-zinc-800/50 print:border-black print:text-black">
                      <div className="font-bold text-white text-base print:text-black">{item.produtoNome}</div>
                      <div className="text-xs text-zinc-500 mt-0.5 print:text-gray-600">{item.marcaNome || "Sem marca"}</div>
                    </td>

                    {/* ESTOQUE ATUAL */}
                    <td className="p-4 border-r border-zinc-800/50 print:border-black text-center">
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold border print:bg-transparent print:text-black
                        ${item.estoqueAtual <= 0 ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                          item.estoqueAtual < 5 ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                          'bg-zinc-800 text-zinc-300 border-zinc-700'}`}
                      >
                        {item.estoqueAtual} un
                      </span>
                    </td>

                    {/* VENDIDOS NO PERÍODO */}
                    <td className="p-4 text-center border-r border-zinc-800/50 print:border-black">
                      <span className="text-lg font-bold text-blue-400 print:text-black">
                        {item.quantidadeVendida}
                      </span>
                    </td>

                    {/* FATURAMENTO */}
                    <td className="p-4 text-right font-mono print:border-black print:text-black">
                      <div className="text-green-400 font-bold text-lg print:text-black">
                        {formatarMoeda(item.faturamentoTotal)}
                      </div>
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