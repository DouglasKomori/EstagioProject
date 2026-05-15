"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type Tela = "login" | "esqueci_email" | "esqueci_codigo" | "sucesso";

export default function Login() {
  const router = useRouter();

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
          router.push("/");
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
    if (codigoStr.length < 6) {
      setErroEsqueci("Digite o código completo de 6 dígitos.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErroEsqueci("As senhas não coincidem.");
      return;
    }
    if (novaSenha.length < 6) {
      setErroEsqueci("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
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
    if (val && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleCodigoKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codigo[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleCodigoPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const novo = [...codigo];
      pasted.split("").forEach((c, i) => { if (i < 6) novo[i] = c; });
      setCodigo(novo);
      const nextIndex = Math.min(pasted.length, 5);
      inputsRef.current[nextIndex]?.focus();
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
    <div className="h-screen w-full bg-black flex items-center justify-center font-sans overflow-hidden px-4">
      <Link href="/" className="absolute top-6 left-6 text-zinc-400 hover:text-[#E4B77D] transition-colors">
        &larr; Voltar para o início
      </Link>

      <div className="w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-xl p-8 shadow-2xl shadow-[#E4B77D]/5">

        {/* ── LOGO ── */}
        <div className="flex flex-col items-center mb-8">
          <Image src="/logoSemFundo.png" alt="Victor Uematsu" width={150} height={150} className="mb-4" />
          {tela === "login" && (
            <>
              <h1 className="text-2xl font-bold text-white">Acesse sua conta</h1>
              <p className="text-zinc-400 text-sm mt-1">Informe seus dados para continuar</p>
            </>
          )}
          {tela === "esqueci_email" && (
            <>
              <h1 className="text-2xl font-bold text-white">Redefinir Senha</h1>
              <p className="text-zinc-400 text-sm mt-1 text-center">Informe o e-mail cadastrado para receber o código</p>
            </>
          )}
          {tela === "esqueci_codigo" && (
            <>
              <h1 className="text-2xl font-bold text-white">Verificar Código</h1>
              <p className="text-zinc-400 text-sm mt-1 text-center">
                Código enviado para <strong className="text-[#E4B77D]">{emailEsqueci}</strong>
              </p>
            </>
          )}
          {tela === "sucesso" && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-950/50 border border-green-900 flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-400">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Senha Redefinida!</h1>
              <p className="text-zinc-400 text-sm mt-1">Faça login com a nova senha.</p>
            </>
          )}
        </div>

        {/* ── TELA: LOGIN ── */}
        {tela === "login" && (
          <form onSubmit={fazerLogin} className="flex flex-col gap-4">
            {erro && (
              <div className="bg-red-950/50 border border-red-900 text-red-400 text-sm p-3 rounded-md text-center">
                {erro}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">E-mail</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D] transition-all"
                placeholder="seu@gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Senha</label>
              <input
                type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D] transition-all"
                placeholder="••••••••"
              />
            </div>
            <div className="text-right">
              <button type="button" onClick={() => setTela("esqueci_email")} className="text-xs text-zinc-500 hover:text-[#E4B77D] transition-colors">
                Esqueci minha senha
              </button>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full mt-2 bg-[#E4B77D] text-black font-bold py-3 rounded-md hover:bg-[#cfa56d] transition-colors disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        )}

        {/* ── TELA: INSERIR E-MAIL ── */}
        {tela === "esqueci_email" && (
          <form onSubmit={handleEnviarCodigo} className="flex flex-col gap-4">
            {erroEsqueci && (
              <div className="bg-red-950/50 border border-red-900 text-red-400 text-sm p-3 rounded-md text-center">
                {erroEsqueci}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">E-mail cadastrado</label>
              <input
                type="email" value={emailEsqueci} onChange={(e) => setEmailEsqueci(e.target.value)} required autoFocus
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D] transition-all"
                placeholder="seu@gmail.com"
              />
            </div>
            <button
              type="submit" disabled={loadingEsqueci}
              className="w-full bg-[#E4B77D] text-black font-bold py-3 rounded-md hover:bg-[#cfa56d] transition-colors disabled:opacity-50"
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
              <div className="bg-red-950/50 border border-red-900 text-red-400 text-sm p-3 rounded-md text-center">
                {erroEsqueci}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-3 text-center">Código de 6 dígitos</label>
              <div className="flex gap-2 justify-center" onPaste={handleCodigoPaste}>
                {codigo.map((c, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputsRef.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={1} value={c}
                    onChange={(e) => handleCodigoInput(i, e.target.value)}
                    onKeyDown={(e) => handleCodigoKeyDown(i, e)}
                    className="w-11 h-12 text-center text-xl font-bold bg-zinc-900 border border-zinc-700 rounded-lg text-[#E4B77D] focus:outline-none focus:border-[#E4B77D] focus:ring-1 focus:ring-[#E4B77D] transition-all"
                  />
                ))}
              </div>
              <p className="text-xs text-zinc-600 text-center mt-2">
                Não recebeu?{" "}
                <button type="button" onClick={() => setTela("esqueci_email")} className="text-[#E4B77D] hover:underline">
                  Reenviar
                </button>
              </p>
            </div>

            <div className="h-px bg-zinc-800" />

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Nova Senha</label>
              <input
                type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D] transition-all"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Confirmar Nova Senha</label>
              <input
                type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-[#E4B77D] transition-all"
                placeholder="Repita a nova senha"
              />
            </div>

            <button
              type="submit" disabled={loadingEsqueci}
              className="w-full bg-[#E4B77D] text-black font-bold py-3 rounded-md hover:bg-[#cfa56d] transition-colors disabled:opacity-50"
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
          <div className="flex flex-col gap-4 text-center">
            <p className="text-zinc-400 text-sm">Sua senha foi atualizada com sucesso. Agora você pode entrar com a nova senha.</p>
            <button
              onClick={voltarParaLogin}
              className="w-full bg-[#E4B77D] text-black font-bold py-3 rounded-md hover:bg-[#cfa56d] transition-colors"
            >
              Ir para o Login
            </button>
          </div>
        )}

        {/* ── CADASTRO (só no login) ── */}
        {tela === "login" && (
          <div className="mt-6 text-center text-sm text-zinc-400">
            Ainda não é cliente?{" "}
            <Link href="/cadastro" className="text-[#E4B77D] hover:underline">
              Crie sua conta
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
