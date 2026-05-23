"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type Tela = "login" | "esqueci_email" | "esqueci_codigo" | "sucesso";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";
  const [animado, setAnimado] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimado(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Login
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  // Esqueci minha senha
  const [tela, setTela] = useState<Tela>("login");
  const [emailEsqueci, setEmailEsqueci] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erroEsqueci, setErroEsqueci] = useState("");
  const [loadingEsqueci, setLoadingEsqueci] = useState(false);

  // Código de verificação — 6 inputs individuais
  const [codigo, setCodigo] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const fazerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/autenticacao/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        if (data.usuario.perfil === "ADMIN" || data.usuario.perfil === "FUNCIONARIO") {
          router.push("/admin");
        } else {
          router.push(returnUrl);
        }
      } else {
        setErro(data.msg || "Erro ao fazer login. Verifique suas credenciais.");
      }
    } catch {
      setErro("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroEsqueci("");
    setLoadingEsqueci(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/autenticacao/enviar-codigo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailEsqueci }),
      });
      const data = await res.json();
      if (res.ok) {
        setCodigo(["", "", "", "", "", ""]);
        setNovaSenha("");
        setConfirmarSenha("");
        setTela("esqueci_codigo");
        setTimeout(() => inputsRef.current[0]?.focus(), 100);
      } else {
        setErroEsqueci(data.msg || "Erro ao enviar o código.");
      }
    } catch {
      setErroEsqueci("Erro de conexão com o servidor.");
    } finally {
      setLoadingEsqueci(false);
    }
  };

  const handleRedefinirSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroEsqueci("");
    const codigoStr = codigo.join("");
    if (codigoStr.length < 6) { setErroEsqueci("Digite o código completo de 6 dígitos."); return; }
    if (novaSenha !== confirmarSenha) { setErroEsqueci("As senhas não coincidem."); return; }
    if (novaSenha.length < 6) { setErroEsqueci("A nova senha deve ter pelo menos 6 caracteres."); return; }
    setLoadingEsqueci(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/autenticacao/redefinir-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailEsqueci, codigo: codigoStr, novaSenha }),
      });
      const data = await res.json();
      if (res.ok) {
        setTela("sucesso");
      } else {
        setErroEsqueci(data.msg || "Erro ao redefinir a senha.");
      }
    } catch {
      setErroEsqueci("Erro de conexão com o servidor.");
    } finally {
      setLoadingEsqueci(false);
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

  const voltarParaLogin = () => {
    setTela("login");
    setEmailEsqueci("");
    setCodigo(["", "", "", "", "", ""]);
    setNovaSenha("");
    setConfirmarSenha("");
    setErroEsqueci("");
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex font-sans relative">

      {/* ── FUNDO MOBILE — visível apenas em telas pequenas ── */}
      <div className="lg:hidden absolute inset-0 z-0">
        <Image src="/img3.jpeg" alt="" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      {/* ── PAINEL ESQUERDO — Imagem + Branding ── */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-1/2 relative flex-col items-center justify-center overflow-hidden">
        <Image src="/img3.jpeg" alt="Victor Uematsu Barbearia" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/50" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.65) 100%)" }} />

        <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-lg">
          {/* Badge */}
          <div
            className={`transition-all duration-700 ${animado ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "0ms" }}
          >
            <span className="inline-flex items-center gap-2 text-[#E4B77D] text-xs font-bold tracking-[0.3em] uppercase border border-[#E4B77D]/30 px-5 py-2 rounded-full bg-[#E4B77D]/5 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E4B77D] animate-pulse" />
              Presidente Prudente · SP · Desde 2016
            </span>
          </div>

          {/* Logo */}
          <div
            className={`mt-8 mb-6 transition-all duration-700 ${animado ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "150ms" }}
          >
            <Image
              src="/logoSemFundo.png"
              alt="Victor Uematsu Barbearia"
              width={155}
              height={155}
              className="object-contain drop-shadow-[0_0_35px_rgba(228,183,125,0.35)]"
              priority
            />
          </div>

          {/* Headline */}
          <h1
            className={`text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4 transition-all duration-700 ${animado ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "250ms" }}
          >
            O seu estilo,<br />
            <span className="text-[#E4B77D]">em boas mãos.</span>
          </h1>

          <p
            className={`text-zinc-400 text-sm leading-relaxed max-w-xs transition-all duration-700 ${animado ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "350ms" }}
          >
            Cortes precisos, barba impecável e um ambiente que respira tradição e modernidade.
          </p>
        </div>

        {/* Linha dourada decorativa */}
        <div
          className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-700 ${animado ? "opacity-60" : "opacity-0"}`}
          style={{ transitionDelay: "500ms" }}
        >
          <div className="w-px h-14 bg-gradient-to-b from-[#E4B77D] to-transparent" />
        </div>
      </div>

      {/* ── PAINEL DIREITO — Formulário ── */}
      <div className="w-full lg:w-[45%] xl:w-1/2 flex items-center justify-center px-6 py-16 overflow-y-auto relative z-10">

        {/* Voltar (mobile) */}
        <Link
          href="/"
          className="lg:hidden absolute top-6 left-6 flex items-center gap-1.5 text-sm text-zinc-400 hover:text-[#E4B77D] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Início
        </Link>

        <div
          className={`w-full max-w-sm transition-all duration-700 ${animado ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ transitionDelay: "200ms" }}
        >
          {/* Logo mobile */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Image src="/logoSemFundo.png" alt="Victor Uematsu" width={100} height={100} />
          </div>

          {/* Cabeçalho do formulário */}
          <div className="mb-8">
            {tela === "login" && (
              <>
                <p className="text-[#E4B77D] text-xs font-bold tracking-[0.3em] uppercase mb-2">Bem-vindo de volta</p>
                <h2 className="text-3xl font-extrabold text-white">Acesse sua conta</h2>
                <p className="text-zinc-500 text-sm mt-1.5">Informe seus dados para continuar</p>
              </>
            )}
            {tela === "esqueci_email" && (
              <>
                <p className="text-[#E4B77D] text-xs font-bold tracking-[0.3em] uppercase mb-2">Recuperação de acesso</p>
                <h2 className="text-3xl font-extrabold text-white">Redefinir Senha</h2>
                <p className="text-zinc-500 text-sm mt-1.5">Informe o e-mail cadastrado para receber o código</p>
              </>
            )}
            {tela === "esqueci_codigo" && (
              <>
                <p className="text-[#E4B77D] text-xs font-bold tracking-[0.3em] uppercase mb-2">Verificação</p>
                <h2 className="text-3xl font-extrabold text-white">Verificar Código</h2>
                <p className="text-zinc-500 text-sm mt-1.5">
                  Código enviado para{" "}
                  <span className="text-[#E4B77D] font-medium">{emailEsqueci}</span>
                </p>
              </>
            )}
            {tela === "sucesso" && (
              <>
                <p className="text-[#E4B77D] text-xs font-bold tracking-[0.3em] uppercase mb-2">Tudo certo!</p>
                <h2 className="text-3xl font-extrabold text-white">Senha Redefinida</h2>
                <p className="text-zinc-500 text-sm mt-1.5">Faça login com a sua nova senha</p>
              </>
            )}
          </div>

          {/* Ícone de sucesso */}
          {tela === "sucesso" && (
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-950/60 border border-green-800 flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.12)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-400">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}

          {/* ── TELA: LOGIN ── */}
          {tela === "login" && (
            <form onSubmit={fazerLogin} className="flex flex-col gap-4">
              {erro && (
                <div className="bg-red-950/50 border border-red-900/70 text-red-400 text-sm p-3 rounded-lg text-center">
                  {erro}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-500 tracking-widest uppercase">E-mail</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#E4B77D] focus:ring-1 focus:ring-[#E4B77D]/20 transition-all"
                  placeholder="seu@email.com"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Senha</label>
                <input
                  type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#E4B77D] focus:ring-1 focus:ring-[#E4B77D]/20 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setTela("esqueci_email")}
                  className="text-xs text-zinc-500 hover:text-[#E4B77D] transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full mt-1 bg-[#E4B77D] text-black font-extrabold py-3.5 rounded-lg hover:bg-[#cfa56d] transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(228,183,125,0.2)] disabled:opacity-50 disabled:scale-100"
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>

              <div className="relative my-2">
                <div className="h-px bg-zinc-800" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-zinc-950 px-3 text-xs text-zinc-600">ou</span>
                </span>
              </div>

              <p className="text-center text-sm text-zinc-500">
                Ainda não é cliente?{" "}
                <Link href="/cadastro" className="text-[#E4B77D] font-semibold hover:underline">
                  Crie sua conta
                </Link>
              </p>
            </form>
          )}

          {/* ── TELA: INSERIR E-MAIL ── */}
          {tela === "esqueci_email" && (
            <form onSubmit={handleEnviarCodigo} className="flex flex-col gap-4">
              {erroEsqueci && (
                <div className="bg-red-950/50 border border-red-900/70 text-red-400 text-sm p-3 rounded-lg text-center">
                  {erroEsqueci}
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-500 tracking-widest uppercase">E-mail cadastrado</label>
                <input
                  type="email" value={emailEsqueci} onChange={(e) => setEmailEsqueci(e.target.value)} required autoFocus
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#E4B77D] focus:ring-1 focus:ring-[#E4B77D]/20 transition-all"
                  placeholder="seu@email.com"
                />
              </div>
              <button
                type="submit" disabled={loadingEsqueci}
                className="w-full bg-[#E4B77D] text-black font-extrabold py-3.5 rounded-lg hover:bg-[#cfa56d] transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(228,183,125,0.2)] disabled:opacity-50 disabled:scale-100"
              >
                {loadingEsqueci ? "Enviando..." : "Enviar Código"}
              </button>
              <button type="button" onClick={voltarParaLogin} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors text-center">
                ← Voltar para o login
              </button>
            </form>
          )}

          {/* ── TELA: CÓDIGO + NOVA SENHA ── */}
          {tela === "esqueci_codigo" && (
            <form onSubmit={handleRedefinirSenha} className="flex flex-col gap-5">
              {erroEsqueci && (
                <div className="bg-red-950/50 border border-red-900/70 text-red-400 text-sm p-3 rounded-lg text-center">
                  {erroEsqueci}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-500 tracking-widest uppercase mb-4 text-center">
                  Código de 6 dígitos
                </label>
                <div className="flex gap-2 justify-center" onPaste={handleCodigoPaste}>
                  {codigo.map((c, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputsRef.current[i] = el; }}
                      type="text" inputMode="numeric" maxLength={1} value={c}
                      onChange={(e) => handleCodigoInput(i, e.target.value)}
                      onKeyDown={(e) => handleCodigoKeyDown(i, e)}
                      className="w-11 h-12 text-center text-xl font-bold bg-zinc-900 border border-zinc-700 rounded-lg text-[#E4B77D] focus:outline-none focus:border-[#E4B77D] focus:ring-1 focus:ring-[#E4B77D]/20 transition-all"
                    />
                  ))}
                </div>
                <p className="text-xs text-zinc-600 text-center mt-3">
                  Não recebeu?{" "}
                  <button type="button" onClick={() => setTela("esqueci_email")} className="text-[#E4B77D] hover:underline">
                    Reenviar
                  </button>
                </p>
              </div>

              <div className="h-px bg-zinc-800" />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Nova Senha</label>
                <input
                  type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#E4B77D] focus:ring-1 focus:ring-[#E4B77D]/20 transition-all"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Confirmar Nova Senha</label>
                <input
                  type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#E4B77D] focus:ring-1 focus:ring-[#E4B77D]/20 transition-all"
                  placeholder="Repita a nova senha"
                />
              </div>

              <button
                type="submit" disabled={loadingEsqueci}
                className="w-full bg-[#E4B77D] text-black font-extrabold py-3.5 rounded-lg hover:bg-[#cfa56d] transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(228,183,125,0.2)] disabled:opacity-50 disabled:scale-100"
              >
                {loadingEsqueci ? "Redefinindo..." : "Redefinir Senha"}
              </button>
              <button type="button" onClick={voltarParaLogin} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors text-center">
                ← Voltar para o login
              </button>
            </form>
          )}

          {/* ── TELA: SUCESSO ── */}
          {tela === "sucesso" && (
            <div className="flex flex-col gap-5">
              <p className="text-zinc-400 text-sm text-center leading-relaxed">
                Sua senha foi atualizada com sucesso. Agora você pode entrar com a nova senha.
              </p>
              <button
                onClick={voltarParaLogin}
                className="w-full bg-[#E4B77D] text-black font-extrabold py-3.5 rounded-lg hover:bg-[#cfa56d] transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(228,183,125,0.2)]"
              >
                Ir para o Login
              </button>
            </div>
          )}

          {/* Voltar ao início (desktop) */}
          <div className="mt-10 pt-6 border-t border-zinc-900 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar para o início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
