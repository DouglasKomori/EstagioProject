"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import ConfirmModal from "../../components/ConfirmModal";

export default function GerenciarComandas() {
  // === CONTROLE DE ABAS ===
  const [abaAtual, setAbaAtual] = useState<"ABERTAS" | "RELATORIO">("ABERTAS");

  const [comandas, setComandas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Dados Base
  const [clientes, setClientes] = useState<any[]>([]);
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [servicos, setServicos] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);

  // Feedbacks Visuais da Tela Principal
  const [sucesso, setSucesso] = useState("");
  const [erroPrincipal, setErroPrincipal] = useState("");

  // Feedbacks Visuais DENTRO do Modal de Detalhes
  const [sucessoDetalhes, setSucessoDetalhes] = useState("");
  const [erroDetalhes, setErroDetalhes] = useState("");

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    titulo: "",
    mensagem: "",
    tipo: "atencao" as "atencao" | "perigo",
    onConfirm: () => {}
  });

  // Estados Relatório
  const [relatorio, setRelatorio] = useState<any[]>([]);
  const [filtroPeriodo, setFiltroPeriodo] = useState("HOJE");
  const [filtroProfissional, setFiltroProfissional] = useState("");

  // Estados Modal Nova Comanda
  const [modalNovaAberto, setModalNovaAberto] = useState(false);
  const [numeroComanda, setNumeroComanda] = useState("");
  const [clienteId, setClienteId] = useState<number | "">("");
  const [erroNova, setErroNova] = useState("");

  // Buscador de Cliente
  const [buscaCliente, setBuscaCliente] = useState("");
  const [dropdownClienteAberto, setDropdownClienteAberto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const clientesFiltrados = clientes.filter(c => c.nome.toLowerCase().includes(buscaCliente.toLowerCase()));

  useEffect(() => {
    const handleClickFora = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownClienteAberto(false);
      }
    };
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  // Estados Modal Detalhes
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [comandaAtual, setComandaAtual] = useState<any>(null);
  const [tipoItem, setTipoItem] = useState<"SERVICO" | "PRODUTO">("SERVICO");
  const [itemId, setItemId] = useState("");
  const [profissionalId, setProfissionalId] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [valorCobrado, setValorCobrado] = useState<number | "">("");

  const obterToken = () => localStorage.getItem("token") || "";

  useEffect(() => {
    carregarDadosBase();
  }, []);

  useEffect(() => {
    if (abaAtual === "ABERTAS") carregarComandasAbertas();
    else if (abaAtual === "RELATORIO") carregarRelatorio();
  }, [abaAtual, filtroPeriodo, filtroProfissional]);

  // === FUNÇÕES DE TEMPORIZADOR DOS AVISOS ===
  const exibirSucesso = (mensagem: string) => {
    setSucesso(mensagem);
    setTimeout(() => setSucesso(""), 4000);
  };

  const exibirErroPrincipal = (mensagem: string) => {
    setErroPrincipal(mensagem);
    setTimeout(() => setErroPrincipal(""), 4000);
  };

  const exibirSucessoDetalhes = (mensagem: string) => {
    setSucessoDetalhes(mensagem);
    setTimeout(() => setSucessoDetalhes(""), 3000);
  };

  const exibirErroDetalhes = (mensagem: string) => {
    setErroDetalhes(mensagem);
    setTimeout(() => setErroDetalhes(""), 4000);
  };
  // ===========================================

  const carregarDadosBase = async () => {
    const headers = { "Authorization": `Bearer ${obterToken()}` };
    try {
      const resCli = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuario`, { headers });
      if (resCli.ok) setClientes(await resCli.json());

      const resProf = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pessoas/profissionais`, { headers });
      if (resProf.ok) setProfissionais(await resProf.json());

      const resServ = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/servicos`, { headers });
      if (resServ.ok) setServicos(await resServ.json());

      const resProd = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/produtos`, { headers });
      if (resProd.ok) setProdutos(await resProd.json());
    } catch (e) { console.error("Erro base"); }
  };

  const carregarComandasAbertas = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comandas`, { headers: { "Authorization": `Bearer ${obterToken()}` } });
      if (res.ok) setComandas(await res.json());
    } catch (error) { console.error(error); }
  };

  // --- BUSCAR RELATÓRIO ---
  const carregarRelatorio = async () => {
    setLoading(true);
    let dataInicio = "";
    let dataFim = new Date().toISOString().split('T')[0];

    const hojeDate = new Date();
    if (filtroPeriodo === "HOJE") {
      dataInicio = dataFim;
    } else if (filtroPeriodo === "7DIAS") {
      const seteDiasAtras = new Date(hojeDate.setDate(hojeDate.getDate() - 7));
      dataInicio = seteDiasAtras.toISOString().split('T')[0];
    } else if (filtroPeriodo === "30DIAS") {
      const trintaDiasAtras = new Date(hojeDate.setDate(hojeDate.getDate() - 30));
      dataInicio = trintaDiasAtras.toISOString().split('T')[0];
    }

    let url = `${process.env.NEXT_PUBLIC_API_URL}/comandas/relatorio/faturamento?`;
    if (dataInicio) url += `dataInicio=${dataInicio}&dataFim=${dataFim}&`;
    if (filtroProfissional) url += `profissionalId=${filtroProfissional}`;

    try {
      const res = await fetch(url, { headers: { "Authorization": `Bearer ${obterToken()}` } });
      if (res.ok) setRelatorio(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // --- LÓGICA DA COMANDA ---
  const abrirNovaComanda = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroNova("");
    setLoading(true);

    if(!clienteId){ setErroNova("Selecione um cliente"); setLoading(false); return; }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comandas/abrir`, {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${obterToken()}` },
        body: JSON.stringify({ numero_comanda: Number(numeroComanda), clienteId: Number(clienteId) })
      });
      if (res.ok) {
        setModalNovaAberto(false); setNumeroComanda(""); setClienteId(""); setBuscaCliente(""); setDropdownClienteAberto(false);
        carregarComandasAbertas();
        exibirSucesso("Comanda aberta com sucesso!");
      } else {
        const data = await res.json(); setErroNova(data.msg);
      }
    } catch (error) { setErroNova("Erro."); }
    finally { setLoading(false); }
  };

  const abrirDetalhes = async (id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comandas/${id}`, { headers: { "Authorization": `Bearer ${obterToken()}` } });
      if (res.ok) {
        setComandaAtual(await res.json()); setItemId(""); setProfissionalId(""); setQuantidade(1); setValorCobrado(""); setModalDetalhesAberto(true);
      }
    } catch (error) { console.error(error); }
  };

  const handleSelecionarItem = (idSelecionado: string) => {
    setItemId(idSelecionado);
    if (tipoItem === "SERVICO") {
      const servico = servicos.find(s => s.id === Number(idSelecionado));
      if (servico) setValorCobrado(Number(servico.valor));
    } else {
      const produto = produtos.find(p => p.id === Number(idSelecionado));
      if (produto) setValorCobrado(Number(produto.precoVenda || 0));
    }
  };

  const adicionarItemComanda = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const payload = {
      comandaId: comandaAtual.id, tipo: tipoItem, idItem: Number(itemId), valor: Number(valorCobrado),
      quantidade: tipoItem === "PRODUTO" ? Number(quantidade) : 1,
      profissionalId: tipoItem === "SERVICO" ? Number(profissionalId) : null
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comandas/adicionar-item`, {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${obterToken()}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        abrirDetalhes(comandaAtual.id);
        exibirSucessoDetalhes("Item lançado com sucesso!");
      }
      else exibirErroDetalhes((await res.json()).msg);
    } catch (error) { exibirErroDetalhes("Erro ao adicionar item."); }
    finally { setLoading(false); }
  };

  // ==========================================
  // NOVAS FUNÇÕES USANDO O MODAL CUSTOMIZADO
  // ==========================================

  // 1. Remover Item da Comanda
  const abrirModalRemoverItem = (tipo: "SERVICO" | "PRODUTO", idInterno: number) => {
    setConfirmModal({
      isOpen: true,
      titulo: "Remover Item?",
      mensagem: "Tem certeza que deseja remover este item da ficha?",
      tipo: "perigo", // Vermelho
      onConfirm: () => efetivarRemocaoItem(tipo, idInterno)
    });
  };

  const efetivarRemocaoItem = async (tipo: "SERVICO" | "PRODUTO", idInterno: number) => {
    setConfirmModal({ ...confirmModal, isOpen: false });
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comandas/remover-item/${tipo}/${idInterno}`, { method: "DELETE", headers: { "Authorization": `Bearer ${obterToken()}` } });
      if (res.ok) {
        abrirDetalhes(comandaAtual.id);
        exibirSucessoDetalhes("Item removido!");
      } else {
        const data = await res.json();
        exibirErroDetalhes(data.msg || "Erro ao remover item.");
      }
    } catch (error) { exibirErroDetalhes("Erro de conexão."); }
    finally { setLoading(false); }
  };

  // 2. Fechar / Pagar a Conta
  const abrirModalFecharConta = () => {
    setConfirmModal({
      isOpen: true,
      titulo: "Confirmar Pagamento?",
      mensagem: `Deseja fechar esta conta e registrar o faturamento de R$ ${calcularTotal().toFixed(2)}?`,
      tipo: "atencao", // Dourado
      onConfirm: () => efetivarFechamento()
    });
  };

  const efetivarFechamento = async () => {
    setConfirmModal({ ...confirmModal, isOpen: false });
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comandas/${comandaAtual.id}/finalizar`, { method: "PUT", headers: { "Authorization": `Bearer ${obterToken()}` } });
      if (res.ok) { 
        exibirSucesso("Comanda fechada e paga com sucesso!"); 
        setModalDetalhesAberto(false); 
        carregarComandasAbertas(); 
      } else {
        // Captura o erro real do Back-end (Ex: "Abra o caixa do dia...")
        const data = await res.json();
        exibirErroDetalhes(data.msg || "Não foi possível fechar a conta.");
      }
    } catch (error) { exibirErroDetalhes("Erro de conexão ao fechar conta."); }
    finally { setLoading(false); }
  };

  // 3. Cancelar a Comanda
  const abrirModalCancelarComanda = () => {
    setConfirmModal({
      isOpen: true,
      titulo: "Cancelar Ficha?",
      mensagem: "Atenção: Tem certeza que deseja cancelar esta ficha? Todos os itens lançados serão perdidos.",
      tipo: "perigo", // Vermelho
      onConfirm: () => efetivarCancelamentoComanda()
    });
  };

  const efetivarCancelamentoComanda = async () => {
    setConfirmModal({ ...confirmModal, isOpen: false });
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comandas/${comandaAtual.id}/cancelar`, { method: "PUT", headers: { "Authorization": `Bearer ${obterToken()}` } });
      if (res.ok) { 
        exibirSucesso("Comanda cancelada com sucesso."); 
        setModalDetalhesAberto(false); 
        carregarComandasAbertas(); 
      } else {
        const data = await res.json();
        exibirErroDetalhes(data.msg || "Erro ao cancelar comanda.");
      }
    } catch (error) { exibirErroDetalhes("Erro de conexão ao cancelar."); }
    finally { setLoading(false); }
  };

  const calcularTotal = () => {
    if (!comandaAtual) return 0;
    return comandaAtual.servicos.reduce((a:number, s:any) => a + Number(s.valorCobrado), 0) + comandaAtual.produtos.reduce((a:number, p:any) => a + (Number(p.valorCobrado) * Number(p.quantidade)), 0);
  };

  const totalRelatorio = relatorio.reduce((acc, curr) => acc + Number(curr.valorCobrado), 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 font-sans">
      
      <header className="flex flex-col md:flex-row md:justify-between items-center border-b border-zinc-900 pb-4 max-w-6xl mx-auto gap-4 md:gap-0">
        <div>
          <h1 className="text-2xl font-bold text-[#E4B77D] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Comandas da Barbearia
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Gerencie os pagamentos e relatórios de faturamento.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Voltar</Link>
          <button 
            onClick={() => { setModalNovaAberto(true); setBuscaCliente(""); setClienteId(""); }} 
            className="px-6 py-2 bg-[#E4B77D] text-black font-bold rounded-md hover:bg-[#cfa56d] transition-colors shadow-lg"
          >
            + Abrir Comanda
          </button>
        </div>
      </header>

      {/* FEEDBACKS DA TELA PRINCIPAL */}
      {sucesso && (
        <div className="max-w-6xl mx-auto mt-4 mb-4 bg-green-950/50 border border-green-900 text-green-400 p-4 rounded-lg flex items-center justify-center gap-2 animate-in fade-in duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          <span className="font-medium">{sucesso}</span>
        </div>
      )}
      {erroPrincipal && (
        <div className="max-w-6xl mx-auto mt-4 mb-4 bg-red-950/50 border border-red-900 text-red-400 p-4 rounded-lg flex items-center justify-center gap-2 animate-in fade-in duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          <span className="font-medium">{erroPrincipal}</span>
        </div>
      )}

      {/* ABAS */}
      <div className="max-w-6xl mx-auto flex gap-4 my-8">
        <button 
          onClick={() => setAbaAtual("ABERTAS")}
          className={`pb-2 px-2 text-sm font-bold tracking-wide transition-colors ${abaAtual === "ABERTAS" ? "text-[#E4B77D] border-b-2 border-[#E4B77D]" : "text-zinc-500 hover:text-zinc-300"}`}
        >
          COMANDAS ABERTAS
        </button>
        <button 
          onClick={() => setAbaAtual("RELATORIO")}
          className={`pb-2 px-2 text-sm font-bold tracking-wide transition-colors ${abaAtual === "RELATORIO" ? "text-[#E4B77D] border-b-2 border-[#E4B77D]" : "text-zinc-500 hover:text-zinc-300"}`}
        >
          RELATÓRIO DE SERVIÇOS
        </button>
      </div>

      {abaAtual === "ABERTAS" ? (
        <main className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {comandas.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-500">
              <p>Nenhuma comanda aberta no momento.</p>
            </div>
          ) : (
            comandas.map(c => (
              <button 
                key={c.id} onClick={() => abrirDetalhes(c.id)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col items-center justify-center gap-2 hover:border-[#E4B77D] transition-all shadow-lg relative overflow-hidden group"
              >
                <div className="absolute top-0 w-full h-1 bg-[#E4B77D]"></div>
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">Ficha</span>
                <span className="text-5xl font-black text-white group-hover:text-[#E4B77D]">{c.numero_comanda}</span>
                <div className="w-full h-px bg-zinc-800 my-2"></div>
                <span className="text-sm font-medium text-zinc-300 truncate w-full text-center">{c.clienteNome.split(" ")[0]}</span>
              </button>
            ))
          )}
        </main>
      ) : (
        /* TELA DE RELATÓRIO */
        <main className="max-w-6xl mx-auto flex flex-col gap-6 animate-in fade-in duration-300">
          
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col md:flex-row items-center gap-6 justify-between shadow-lg">
            <div className="flex gap-4 w-full md:w-auto">
              <select value={filtroPeriodo} onChange={e => setFiltroPeriodo(e.target.value)} className="bg-zinc-950 border border-zinc-800 text-white rounded-lg p-3 outline-none focus:border-[#E4B77D] w-full md:w-48">
                <option value="HOJE">Hoje</option>
                <option value="7DIAS">Últimos 7 Dias</option>
                <option value="30DIAS">Últimos 30 Dias</option>
                <option value="TUDO">Todo o Período</option>
              </select>
              
              <select value={filtroProfissional} onChange={e => setFiltroProfissional(e.target.value)} className="bg-zinc-950 border border-zinc-800 text-white rounded-lg p-3 outline-none focus:border-[#E4B77D] w-full md:w-56">
                <option value="">Todos os Barbeiros</option>
                {profissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>

            <div className="text-right w-full md:w-auto bg-black/30 p-4 rounded-lg border border-zinc-800/50">
              <span className="block text-xs font-bold tracking-widest text-zinc-500 uppercase mb-1">Faturamento (Serviços)</span>
              <span className="text-3xl font-black text-[#E4B77D]">R$ {totalRelatorio.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800 text-xs tracking-widest uppercase text-zinc-500">
                  <th className="p-4 font-bold">Data/Hora</th>
                  <th className="p-4 font-bold">Comanda / Cliente</th>
                  <th className="p-4 font-bold">Serviço Prestado</th>
                  <th className="p-4 font-bold">Barbeiro</th>
                  <th className="p-4 font-bold text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {relatorio.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-zinc-500 italic">Nenhum serviço faturado neste período.</td></tr>
                ) : (
                  relatorio.map(item => (
                    <tr key={item.comandaId + item.servicoNome} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4 text-zinc-400">{new Date(item.dataFechamento).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' })}</td>
                      <td className="p-4"><span className="text-[#E4B77D] font-bold mr-2">#{item.numero_comanda}</span> {item.clienteNome}</td>
                      <td className="p-4 font-medium text-zinc-200">{item.servicoNome}</td>
                      <td className="p-4 text-zinc-400">{item.profissionalNome}</td>
                      <td className="p-4 text-right font-mono font-bold text-zinc-300">R$ {Number(item.valorCobrado).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      )}

      {/* MODAL 1: ABRIR NOVA COMANDA */}
      {modalNovaAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModalNovaAberto(false)} />
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-sm p-6 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-[#E4B77D] mb-6">Abrir Nova Comanda</h2>
            
            <form onSubmit={abrirNovaComanda} className="flex flex-col gap-4">
              {erroNova && <div className="bg-red-950/50 border border-red-900 text-red-400 text-sm p-3 rounded-md">{erroNova}</div>}
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">N.º da Ficha (Acrílico)</label>
                <input type="number" required min="1" value={numeroComanda} onChange={(e) => setNumeroComanda(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white text-lg font-bold focus:outline-none focus:border-[#E4B77D]" placeholder="Ex: 1" />
              </div>

              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Buscar Cliente</label>
                <input type="text" placeholder="Digite o nome..." value={buscaCliente} onChange={(e) => { setBuscaCliente(e.target.value); setDropdownClienteAberto(true); setClienteId(""); }} onFocus={() => setDropdownClienteAberto(true)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]" />
                
                {dropdownClienteAberto && (
                  <ul className="absolute z-20 w-full mt-1 max-h-48 overflow-y-auto bg-zinc-800 border border-zinc-700 rounded-md shadow-2xl custom-scrollbar">
                    {clientesFiltrados.length > 0 ? clientesFiltrados.map(c => (
                        <li key={c.id} onClick={() => { setClienteId(c.id); setBuscaCliente(c.nome); setDropdownClienteAberto(false); }} className="px-4 py-3 hover:bg-zinc-700 cursor-pointer text-zinc-300 hover:text-white transition-colors border-b border-zinc-700/50 last:border-0">{c.nome} <span className="text-xs text-zinc-500 ml-2">{c.telefone}</span></li>
                      )) : <li className="px-4 py-3 text-zinc-500 italic text-sm">Nenhum cliente encontrado.</li>}
                  </ul>
                )}
                {clienteId && !dropdownClienteAberto && <span className="absolute right-3 top-10 text-green-500"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></span>}
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-zinc-800">
                <button type="button" onClick={() => setModalNovaAberto(false)} className="flex-1 py-3 border border-zinc-700 text-zinc-300 rounded-md hover:bg-zinc-800 transition-colors">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-[#E4B77D] text-black font-bold rounded-md hover:bg-[#cfa56d] transition-colors">Abrir Comanda</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DETALHES DA COMANDA */}
      {modalDetalhesAberto && comandaAtual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModalDetalhesAberto(false)} />
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            
            <div className="w-full md:w-1/2 p-6 bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Adicionar à Ficha <span className="text-[#E4B77D]">{comandaAtual.numero_comanda}</span></h2>
                <button onClick={() => setModalDetalhesAberto(false)} className="text-zinc-500 hover:text-white md:hidden">✕</button>
              </div>

              {/* Feedbacks do Modal de Detalhes */}
              {sucessoDetalhes && <div className="mb-4 bg-green-950/50 border border-green-900 text-green-400 p-3 rounded-lg text-sm">{sucessoDetalhes}</div>}
              {erroDetalhes && <div className="mb-4 bg-red-950/50 border border-red-900 text-red-400 p-3 rounded-lg text-sm">{erroDetalhes}</div>}

              <div className="flex bg-zinc-950 rounded-lg p-1 mb-6">
                <button onClick={() => {setTipoItem("SERVICO"); setItemId(""); setValorCobrado("");}} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${tipoItem === "SERVICO" ? "bg-zinc-800 text-[#E4B77D]" : "text-zinc-500 hover:text-zinc-300"}`}>Serviço Prestado</button>
                <button onClick={() => {setTipoItem("PRODUTO"); setItemId(""); setValorCobrado("");}} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${tipoItem === "PRODUTO" ? "bg-zinc-800 text-[#E4B77D]" : "text-zinc-500 hover:text-zinc-300"}`}>Produto Consumido</button>
              </div>

              <form onSubmit={adicionarItemComanda} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">{tipoItem === "SERVICO" ? "Qual Serviço?" : "Qual Produto?"}</label>
                  <select required value={itemId} onChange={(e) => handleSelecionarItem(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white focus:border-[#E4B77D]">
                    <option value="" disabled>Selecione...</option>
                    {tipoItem === "SERVICO" ? servicos.map(s => <option key={s.id} value={s.id}>{s.nome} (R$ {Number(s.valor).toFixed(2)})</option>) : produtos.map(p => <option key={p.id} value={p.id}>{p.nome} (R$ {Number(p.precoVenda || 0).toFixed(2)})</option>)}
                  </select>
                </div>
                {tipoItem === "SERVICO" && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Quem executou? (Para Comissão)</label>
                    <select required value={profissionalId} onChange={(e) => setProfissionalId(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white focus:border-[#E4B77D]">
                      <option value="" disabled>Selecione o Barbeiro...</option>
                      {profissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                    </select>
                  </div>
                )}
                <div className="flex gap-4">
                  {tipoItem === "PRODUTO" && (
                    <div className="w-1/3">
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Qtd.</label>
                      <input type="number" required min="1" value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Valor Cobrado (R$)</label>
                    <input type="number" step="0.01" required value={valorCobrado} onChange={(e) => setValorCobrado(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-[#E4B77D] font-bold" />
                  </div>
                </div>
                <button type="submit" disabled={loading || !itemId} className="w-full py-3 bg-zinc-800 text-white font-bold rounded-md hover:bg-zinc-700 transition-colors mt-2 border border-zinc-700">{loading ? "Processando..." : "Lançar na Ficha"}</button>
              </form>
            </div>

            <div className="w-full md:w-1/2 flex flex-col bg-zinc-950 relative h-full max-h-[50vh] md:max-h-full">
              <div className="p-6 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center shrink-0">
                <div><p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Cliente</p><h3 className="text-lg font-bold text-white">{comandaAtual.clienteNome}</h3></div>
                <button onClick={() => setModalDetalhesAberto(false)} className="text-zinc-500 hover:text-white hidden md:block p-2">✕</button>
              </div>
              <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Extrato de Consumo</p>
                {comandaAtual.servicos.length === 0 && comandaAtual.produtos.length === 0 ? <p className="text-sm text-zinc-600 italic">Nenhum item lançado ainda.</p> : (
                  <div className="flex flex-col gap-3">
                    {comandaAtual.servicos.map((s: any) => (
                      <div key={`s-${s.id}`} className="flex justify-between items-center border-b border-zinc-800/50 pb-2 group">
                        <div><p className="text-zinc-200 text-sm font-medium">{s.servicoNome}</p><p className="text-zinc-500 text-xs">Por: {s.profissionalNome}</p></div>
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-400 font-mono text-sm">R$ {Number(s.valorCobrado).toFixed(2)}</span>
                          <button onClick={() => abrirModalRemoverItem("SERVICO", s.id)} className="text-zinc-700 hover:text-red-500 transition-colors p-1"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                      </div>
                    ))}
                    {comandaAtual.produtos.map((p: any) => (
                      <div key={`p-${p.id}`} className="flex justify-between items-center border-b border-zinc-800/50 pb-2 group">
                        <div><p className="text-zinc-200 text-sm font-medium">{p.quantidade}x {p.produtoNome}</p></div>
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-400 font-mono text-sm">R$ {(Number(p.valorCobrado) * Number(p.quantidade)).toFixed(2)}</span>
                          <button onClick={() => abrirModalRemoverItem("PRODUTO", p.id)} className="text-zinc-700 hover:text-red-500 transition-colors p-1"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-6 bg-zinc-900 border-t border-zinc-800 shrink-0">
                <div className="flex justify-between items-end mb-4"><span className="font-bold uppercase tracking-widest text-zinc-500 text-sm">Total Geral</span><span className="text-3xl font-black text-[#E4B77D]">R$ {calcularTotal().toFixed(2)}</span></div>
                <div className="flex flex-col gap-2">
                  <button onClick={abrirModalFecharConta} disabled={loading || calcularTotal() === 0} className="w-full py-4 bg-[#E4B77D] text-black font-extrabold rounded-lg hover:bg-[#cfa56d] transition-colors shadow-lg disabled:opacity-50">Confirmar Pagamento</button>
                  <button onClick={abrirModalCancelarComanda} disabled={loading} className="w-full py-2 bg-transparent text-red-500 border border-red-900/30 font-bold rounded-lg hover:bg-red-950/20 transition-colors">Cancelar Ficha</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-[999]">
        <ConfirmModal 
          isOpen={confirmModal.isOpen}
          titulo={confirmModal.titulo}
          mensagem={confirmModal.mensagem}
          tipo={confirmModal.tipo}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        />
      </div>

    </div>
  );
}