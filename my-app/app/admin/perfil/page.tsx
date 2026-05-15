"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type Etapa = "form" | "codigo";

export default function MeuPerfil() {
  const router = useRouter();
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);

  // Formulário de nova senha
  const [etapa, setEtapa] = useState<Etapa>("form");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // Verificação por código
  const [codigo, setCodigo] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    const usuarioString = localStorage.getItem("usuario");
    if (!usuarioString) { router.push("/login"); return; }
    setUsuarioLogado(JSON.parse(usuarioString));
  }, []);

  const exibirErro = (msg: string) => { setErro(msg); setTimeout(() => setErro(""), 5000); };
  const exibirSucesso = (msg: string) => { setSucesso(msg); setTimeout(() => setSucesso(""), 5000); };

  const handleEnviarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    if (novaSenha !== confirmarSenha) { exibirErro("As senhas não coincidem."); return; }
    if (novaSenha.length < 6) { exibirErro("A nova senha deve ter pelo menos 6 caracteres."); return; }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/autenticacao/enviar-codigo`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ email: usuarioLogado.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setCodigo(["", "", "", "", "", ""]);
        setEtapa("codigo");
        setTimeout(() => inputsRef.current[0]?.focus(), 100);
      } else {
        exibirErro(data.msg || "Erro ao enviar o código.");
      }
    } catch {
      exibirErro("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarAlteracao = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    const codigoStr = codigo.join("");
    if (codigoStr.length < 6) { exibirErro("Digite o código completo de 6 dígitos."); return; }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/autenticacao/redefinir-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ email: usuarioLogado.email, codigo: codigoStr, novaSenha }),
      });
      const data = await res.json();
      if (res.ok) {
        exibirSucesso("Senha alterada com sucesso!");
        setEtapa("form");
        setNovaSenha("");
        setConfirmarSenha("");
        setCodigo(["", "", "", "", "", ""]);
      } else {
        exibirErro(data.msg || "Código inválido ou expirado.");
      }
    } catch {
      exibirErro("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodigoInput = (index: number, value: string) => {
    const val = value.replace(/\D/g, "").slice(-1);
    const novo = [...codigo];
    novo[index] = val;
    setCodigo(novo);
    if (val && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleCodigoKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codigo[index] && index > 0) inputsRef.current[index - 1]?.focus();
  };

  const handleCodigoPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const novo = [...codigo];
      pasted.split("").forEach((c, i) => { if (i < 6) novo[i] = c; });
      setCodigo(novo);
      inputsRef.current[Math.min(pasted.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  if (!usuarioLogado) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 font-sans">
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-10 border-b border-zinc-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#E4B77D]">Minha Conta</h1>
          <p className="text-zinc-400 mt-1">Gerencie seus dados de acesso.</p>
        </div>
      </header>

      {sucesso && (
        <div className="max-w-4xl mx-auto mb-6 bg-green-950/50 border border-green-900 text-green-400 p-4 rounded-lg text-center font-medium">
          {sucesso}
        </div>
      )}
      {erro && (
        <div className="max-w-4xl mx-auto mb-6 bg-red-950/50 border border-red-900 text-red-400 p-4 rounded-lg text-center font-medium">
          {erro}
        </div>
      )}

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* CARD 1: Dados Pessoais */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl h-max">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-zinc-800 pb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[#E4B77D]">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Meus Dados
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Nome Completo</label>
              <div className="bg-zinc-950 px-4 py-3 rounded-lg border border-zinc-800 text-zinc-300">{usuarioLogado.nome}</div>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">E-mail de Acesso</label>
              <div className="bg-zinc-950 px-4 py-3 rounded-lg border border-zinc-800 text-zinc-300">{usuarioLogado.email}</div>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Telefone</label>
              <div className="bg-zinc-950 px-4 py-3 rounded-lg border border-zinc-800 text-zinc-300">{usuarioLogado.telefone || "Não informado"}</div>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Nível de Acesso</label>
              <span className="inline-block mt-1 px-3 py-1 bg-[#E4B77D]/10 text-[#E4B77D] border border-[#E4B77D]/30 rounded-md text-xs font-bold">
                {usuarioLogado.perfil}
              </span>
            </div>
          </div>
        </section>

        {/* CARD 2: Segurança */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2 border-b border-zinc-800 pb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[#E4B77D]">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Segurança
          </h2>

          {/* ETAPA 1: Nova senha */}
          {etapa === "form" && (
            <form onSubmit={handleEnviarCodigo} className="flex flex-col gap-4 mt-4">
              <p className="text-xs text-zinc-500">
                Um código de verificação será enviado para{" "}
                <strong className="text-zinc-400">{usuarioLogado.email}</strong>.
              </p>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Nova Senha</label>
                <input
                  type="password" required value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Confirmar Nova Senha</label>
                <input
                  type="password" required value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#E4B77D]"
                  placeholder="Repita a nova senha"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="mt-2 w-full py-4 bg-[#E4B77D] text-black font-extrabold rounded-lg hover:bg-[#cfa56d] transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-[#E4B77D]/20 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {loading ? "Enviando..." : "Enviar Código de Verificação"}
              </button>
            </form>
          )}

          {/* ETAPA 2: Inserir código */}
          {etapa === "codigo" && (
            <form onSubmit={handleConfirmarAlteracao} className="flex flex-col gap-5 mt-4">
              <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-3 text-sm text-blue-300 flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Código enviado para <strong className="text-white ml-1">{usuarioLogado.email}</strong>. Válido por 10 minutos.
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-3 text-center">Digite o código recebido</label>
                <div className="flex gap-2 justify-center" onPaste={handleCodigoPaste}>
                  {codigo.map((c, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputsRef.current[i] = el; }}
                      type="text" inputMode="numeric" maxLength={1} value={c}
                      onChange={(e) => handleCodigoInput(i, e.target.value)}
                      onKeyDown={(e) => handleCodigoKeyDown(i, e)}
                      className="w-11 h-12 text-center text-xl font-bold bg-zinc-950 border border-zinc-700 rounded-lg text-[#E4B77D] focus:outline-none focus:border-[#E4B77D] focus:ring-1 focus:ring-[#E4B77D] transition-all"
                    />
                  ))}
                </div>
                <p className="text-xs text-zinc-600 text-center mt-2">
                  Não recebeu?{" "}
                  <button type="button" onClick={() => setEtapa("form")} className="text-[#E4B77D] hover:underline">
                    Voltar e reenviar
                  </button>
                </p>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-4 bg-[#E4B77D] text-black font-extrabold rounded-lg hover:bg-[#cfa56d] transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-[#E4B77D]/20"
              >
                {loading ? "Verificando..." : "Confirmar Alteração"}
              </button>
            </form>
          )}
        </section>

      </main>
    </div>
  );
}
