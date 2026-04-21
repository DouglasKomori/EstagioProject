"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import ConfirmModal from "../../components/ConfirmModal";

export default function GerenciarPessoas() {
  const router = useRouter();
  
  const [perfilUsuario, setPerfilUsuario] = useState("");
  const [verificandoAcesso, setVerificandoAcesso] = useState(true);

  const [pessoas, setPessoas] = useState<any[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalAcessoAberto, setModalAcessoAberto] = useState(false);
  const [pessoaSelecionada, setPessoaSelecionada] = useState<any>(null);
  const [senhaAcesso, setSenhaAcesso] = useState("");

  const [loading, setLoading] = useState(false);
  
  // Feedbacks Visuais
  const [erro, setErro] = useState(""); 
  const [erroPrincipal, setErroPrincipal] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [busca, setBusca] = useState("");

  // ESTADO DO NOSSO NOVO MODAL DE CONFIRMAÇÃO
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    titulo: "",
    mensagem: "",
    tipo: "atencao" as "atencao" | "perigo",
    onConfirm: () => {}
  });

  const [id, setId] = useState("");
  const [nome, setNome] = useState("");
  const [tipoPessoa, setTipoPessoa] = useState("PF"); 
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  //PF
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  //PJ
  const [cnpj, setCnpj] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");

  useEffect(() => {
    const checarPermissao = () => {
      const usuarioString = localStorage.getItem("usuario");
      if (usuarioString) {
        const usuario = JSON.parse(usuarioString);
        setPerfilUsuario(usuario.perfil);
        if (usuario.perfil === "ADMIN") {
          carregarPessoas();
        }
      }
      setVerificandoAcesso(false); 
    };
    checarPermissao();
  }, []);

  const obterToken = () => {
    return localStorage.getItem("token") || "";
  };

  const carregarPessoas = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pessoas`, {
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPessoas(data);
      }
    } catch (error) {
      console.error("Erro ao carregar pessoas", error);
    }
  };

  const abrirModalNovo = () => {
    setId("");
    setNome("");
    setTipoPessoa("PF");
    setTelefone("");
    setEmail("");
    setCpf("");
    setDataNascimento("");
    setCnpj("");
    setNomeFantasia("");
    setErro("");
    setModalAberto(true);
  };

  const abrirModalEditar = (pessoa: any) => {
    setId(pessoa.id);
    setNome(pessoa.nome);
    setTipoPessoa(pessoa.tipoPessoa);
    setTelefone(pessoa.telefone || "");
    setEmail(pessoa.email || "");
    setCpf(pessoa.cpf || "");
    setDataNascimento(pessoa.dataNascimento ? pessoa.dataNascimento.split('T')[0] : "");
    setCnpj(pessoa.cnpj || "");
    setNomeFantasia(pessoa.nomeFantasia || "");
    setErro("");
    setModalAberto(true);
  };

  const abrirModalAcesso = (pessoa: any) => {
    if (!pessoa.email) {
      exibirErroPrincipal("É necessário que a pessoa tenha um E-mail cadastrado para gerar o acesso.");
      return;
    }
    setPessoaSelecionada(pessoa);
    setSenhaAcesso("");
    setErro("");
    setModalAcessoAberto(true);
  };

  const exibirSucesso = (mensagem: string) => {
    setSucesso(mensagem);
    setTimeout(() => setSucesso(""), 4000);
  };

  const exibirErroPrincipal = (mensagem: string) => {
    setErroPrincipal(mensagem);
    setTimeout(() => setErroPrincipal(""), 4000);
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, "");
    if (valor.length > 11) valor = valor.slice(0, 11);
    if (valor.length <= 2) setTelefone(valor);
    else if (valor.length <= 6) setTelefone(`(${valor.slice(0, 2)}) ${valor.slice(2)}`);
    else if (valor.length <= 10) setTelefone(`(${valor.slice(0, 2)}) ${valor.slice(2, 6)}-${valor.slice(6)}`);
    else setTelefone(`(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7, 11)}`);
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, "");
    if (valor.length > 11) valor = valor.slice(0, 11);
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setCpf(valor);
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, "");
    if (valor.length > 14) valor = valor.slice(0, 14);
    valor = valor.replace(/^(\d{2})(\d)/, "$1.$2");
    valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    valor = valor.replace(/\.(\d{3})(\d)/, ".$1/$2");
    valor = valor.replace(/(\d{4})(\d)/, "$1-$2");
    setCnpj(valor);
  };

  const salvarPessoa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const metodo = id ? "PUT" : "POST";
    const url = id ? `${process.env.NEXT_PUBLIC_API_URL}/pessoas/${id}` : `${process.env.NEXT_PUBLIC_API_URL}/pessoas`;

    const payload = {
      nome,
      tipoPessoa,
      telefone,
      email,
      cpf: tipoPessoa === 'PF' ? cpf : null,
      dataNascimento: tipoPessoa === 'PF' && dataNascimento ? dataNascimento : null,
      cnpj: tipoPessoa === 'PJ' ? cnpj : null,
      nomeFantasia: tipoPessoa === 'PJ' ? nomeFantasia : null
    };

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${obterToken()}`
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setModalAberto(false);
        carregarPessoas();
        exibirSucesso(id ? "Dados atualizados com sucesso!" : "Cadastro realizado com sucesso!");
      } else {
        setErro(data.msg || "Erro ao salvar o registro.");
      }
    } catch (error) {
      setErro("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const abrirModalInativar = (idExclusao: string) => {
    setConfirmModal({
      isOpen: true,
      titulo: "Inativar Registro?",
      mensagem: "Atenção: Tem certeza que deseja inativar este registro do sistema?",
      tipo: "perigo", // Vermelho
      onConfirm: () => efetivarInativacao(idExclusao)
    });
  };

  const efetivarInativacao = async (idExclusao: string) => {
    setConfirmModal({ ...confirmModal, isOpen: false }); // Fecha o modal
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pessoas/${idExclusao}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${obterToken()}` }
      });
      if (response.ok) {
        carregarPessoas();
        exibirSucesso("Registro inativado com sucesso!");
      } else {
        exibirErroPrincipal("Não foi possível excluir o registro.");
      }
    } catch (error) {
      console.error("Erro ao excluir", error);
      exibirErroPrincipal("Erro de conexão ao inativar.");
    }
  };

  // ==========================================

  const gerarAcessoAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuario/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${obterToken()}`
        },
        body: JSON.stringify({ 
          nome: pessoaSelecionada.nome, 
          email: pessoaSelecionada.email, 
          telefone: pessoaSelecionada.telefone, 
          senha: senhaAcesso 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setModalAcessoAberto(false);
        exibirSucesso(`Acesso de FUNCIONÁRIO gerado para ${pessoaSelecionada.nome.split(' ')[0]}!`);
      } else {
        setErro(data.erro || data.msg || "Erro ao gerar o acesso.");
      }
    } catch (error) {
      setErro("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const pessoasFiltradas = pessoas.filter((p) => 
    p.nome.toLowerCase().includes(busca.toLowerCase()) || 
    (p.cpf && p.cpf.includes(busca)) ||
    (p.cnpj && p.cnpj.includes(busca)) ||
    (p.nomeFantasia && p.nomeFantasia.toLowerCase().includes(busca.toLowerCase())) ||
    (p.email && p.email.toLowerCase().includes(busca.toLowerCase()))
  );

  if (verificandoAcesso) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Verificando permissões...</div>;
  }

  if (perfilUsuario !== "ADMIN") {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-red-500 mb-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h1 className="text-3xl font-bold mb-2">Acesso Restrito</h1>
        <p className="text-zinc-400 mb-8 text-center max-w-md">
          Esta área é de uso exclusivo do Administrador (Gestão de RH e Fornecedores). Seu perfil não tem permissão para visualizar esta página.
        </p>
        <button 
          onClick={() => router.push('/admin')}
          className="px-6 py-3 bg-zinc-800 text-white font-medium rounded-md hover:bg-zinc-700 transition-colors"
        >
          Voltar ao Painel
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 font-sans relative">
      
      <header className="flex justify-between items-center mb-6 border-b border-zinc-900 pb-4 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-[#E4B77D]">Gerenciar Equipe e Fornecedores</h1>
          <p className="text-sm text-zinc-400 mt-1">Cadastro de pessoas físicas e jurídicas</p>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/admin" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Voltar
          </Link>
          <button 
            onClick={abrirModalNovo}
            className="px-4 py-2 bg-[#E4B77D] text-black font-bold rounded-md hover:bg-[#cfa56d] transition-colors shadow-lg shadow-[#E4B77D]/10"
          >
            + Novo Cadastro
          </button>
        </div>
      </header>

      {/* FEEDBACKS VISUAIS */}
      {sucesso && (
        <div className="max-w-6xl mx-auto mb-6 bg-green-950/50 border border-green-900 text-green-400 p-4 rounded-lg flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">{sucesso}</span>
        </div>
      )}

      {erroPrincipal && (
        <div className="max-w-6xl mx-auto mb-6 bg-red-950/50 border border-red-900 text-red-400 p-4 rounded-lg flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="font-medium">{erroPrincipal}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto mb-8 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-500">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar por nome, documento ou fantasia..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#E4B77D] transition-all shadow-sm"
        />
      </div>
      
      <main className="max-w-6xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800 text-zinc-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Identificação</th>
                <th className="p-4 font-medium">Documento</th>
                <th className="p-4 font-medium">Contato</th>
                <th className="p-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {pessoasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-zinc-500">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                pessoasFiltradas.map((pessoa) => (
                  <tr key={pessoa.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-md flex items-center justify-center border flex-shrink-0 ${pessoa.tipoPessoa === 'PJ' ? 'bg-amber-950/30 text-amber-500 border-amber-900/50' : 'bg-zinc-800 text-[#E4B77D] border-zinc-700'}`}>
                          {pessoa.tipoPessoa === 'PJ' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          {/* PJ mostra nome fantasia, PF mostra nome */}
                          <span className="font-bold text-white block leading-tight">
                            {pessoa.tipoPessoa === 'PJ' ? (pessoa.nomeFantasia || pessoa.nome) : pessoa.nome}
                          </span>
                          <span className="text-xs font-medium text-zinc-500 tracking-wider">
                            {pessoa.tipoPessoa === 'PJ' ? 'FORNECEDOR (PJ)' : 'FUNCIONÁRIO (PF)'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-zinc-300 font-mono text-sm whitespace-nowrap">
                      {pessoa.tipoPessoa === 'PJ' ? pessoa.cnpj : pessoa.cpf}
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-zinc-300">{pessoa.telefone || "Sem telefone"}</div>
                      <div className="text-xs text-zinc-500">{pessoa.email || "Sem e-mail"}</div>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-3 items-center">
                        
                        {pessoa.tipoPessoa === 'PF' && (
                           <button 
                             onClick={() => abrirModalAcesso(pessoa)}
                             title="Gerar acesso ao sistema"
                             className="text-sm px-3 py-1 bg-zinc-800 text-[#E4B77D] hover:bg-zinc-700 border border-zinc-700 rounded-md transition-colors font-medium flex items-center gap-1"
                           >
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                             </svg>
                             Acesso
                           </button>
                        )}

                        <button 
                          onClick={() => abrirModalEditar(pessoa)}
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium ml-2"
                        >
                          Editar
                        </button>

                        <button 
                          onClick={() => abrirModalInativar(pessoa.id)}
                          className="text-sm text-red-500 hover:text-red-400 transition-colors font-medium"
                        >
                          Inativar
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModalAberto(false)} />
          
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-lg p-6 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-2xl font-bold text-white mb-6">
              {id ? "Editar Registro" : "Novo Registro"}
            </h2>

            <form onSubmit={salvarPessoa} className="flex flex-col gap-4">
              {erro && <div className="bg-red-950/50 border border-red-900 text-red-400 text-sm p-3 rounded-md">{erro}</div>}
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Tipo de Cadastro</label>
                <select 
                  value={tipoPessoa} 
                  onChange={(e) => {
                    setTipoPessoa(e.target.value);
                    setErro("");
                  }}
                  disabled={!!id} 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D] appearance-none disabled:opacity-50"
                >
                  <option value="PF">Pessoa Física (Funcionários/Parceiros)</option>
                  <option value="PJ">Pessoa Jurídica (Fornecedores)</option>
                </select>
                {!!id && <span className="text-xs text-zinc-500 mt-1 block">O tipo não pode ser alterado após o cadastro.</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  {tipoPessoa === 'PJ' ? 'Razão Social' : 'Nome Completo'}
                </label>
                <input 
                  type="text" required value={nome} onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                  placeholder={tipoPessoa === 'PJ' ? 'Distribuidora XYZ LTDA' : 'Ex: João Vitor Silva'}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Telefone / WhatsApp</label>
                  <input 
                    type="tel" maxLength={15} value={telefone} onChange={handleTelefoneChange}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-300 mb-1">E-mail</label>
                  <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                    placeholder="contato@email.com"
                  />
                </div>
              </div>

              {tipoPessoa === 'PF' && (
                <div className="flex gap-4 p-4 border border-zinc-800 rounded-lg bg-zinc-900/50 mt-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-zinc-300 mb-1">CPF</label>
                    <input 
                      type="text" required value={cpf} onChange={handleCpfChange}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Data de Nascimento</label>
                    <input 
                      type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D] color-scheme-dark"
                    />
                  </div>
                </div>
              )}

              {tipoPessoa === 'PJ' && (
                <div className="flex flex-col gap-4 p-4 border border-zinc-800 rounded-lg bg-zinc-900/50 mt-2">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">CNPJ</label>
                    <input 
                      type="text" required value={cnpj} onChange={handleCnpjChange}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Nome Fantasia</label>
                    <input 
                      type="text" required value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                      placeholder="Ex: Cavalera Cosméticos"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button 
                  type="button" onClick={() => setModalAberto(false)}
                  className="flex-1 py-3 border border-zinc-700 text-zinc-300 rounded-md hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" disabled={loading}
                  className="flex-1 py-3 bg-[#E4B77D] text-black font-bold rounded-md hover:bg-[#cfa56d] transition-colors disabled:opacity-50"
                >
                  {loading ? "Salvando..." : "Salvar Dados"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalAcessoAberto && pessoaSelecionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModalAcessoAberto(false)} />
          
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-sm p-6 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[#E4B77D]">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Gerar Acesso
            </h2>
            <p className="text-sm text-zinc-400 mb-6">
              Criar acesso de <strong>Funcionário</strong> para <span className="text-white">{pessoaSelecionada.nome}</span>.
            </p>

            <form onSubmit={gerarAcessoAdmin} className="flex flex-col gap-4">
              {erro && <div className="bg-red-950/50 border border-red-900 text-red-400 text-sm p-3 rounded-md">{erro}</div>}
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">E-mail de Login</label>
                <input 
                  type="email" disabled value={pessoaSelecionada.email}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-zinc-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Senha Provisória</label>
                <input 
                  type="password" required value={senhaAcesso} onChange={(e) => setSenhaAcesso(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                  placeholder="Defina uma senha..."
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  type="button" onClick={() => setModalAcessoAberto(false)}
                  className="flex-1 py-3 border border-zinc-700 text-zinc-300 rounded-md hover:bg-zinc-800 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" disabled={loading}
                  className="flex-1 py-3 bg-[#E4B77D] text-black font-bold rounded-md hover:bg-[#cfa56d] transition-colors disabled:opacity-50"
                >
                  {loading ? "Gerando..." : "Criar Acesso"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        titulo={confirmModal.titulo}
        mensagem={confirmModal.mensagem}
        tipo={confirmModal.tipo}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />

    </div>
  );
}