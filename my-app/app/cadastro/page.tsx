"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function Cadastro() {
  const router = useRouter();
  const [animado, setAnimado] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimado(true), 100);
    return () => clearTimeout(t);
  }, []);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, "");
    if (valor.length > 11) valor = valor.slice(0, 11);
    if (valor.length <= 2) setTelefone(valor);
    else if (valor.length <= 6) setTelefone(`(${valor.slice(0, 2)}) ${valor.slice(2)}`);
    else if (valor.length <= 10) setTelefone(`(${valor.slice(0, 2)}) ${valor.slice(2, 6)}-${valor.slice(6)}`);
    else setTelefone(`(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7, 11)}`);
  };

  const fazerCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha, telefone }),
      });
      const data = await response.json();
      if (response.ok) {
        setSucesso(true);
        setTimeout(() => router.push("/login"), 2500);
      } else {
        setErro(data.erro || data.msg || "Erro ao realizar o cadastro.");
      }
    } catch {
      setErro("Não foi possível conectar ao servidor. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const beneficios = [
    {
      icone: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      titulo: "Agendamento online",
      desc: "Marque seu horário a qualquer momento, sem precisar ligar",
    },
    {
      icone: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      titulo: "Sem filas",
      desc: "Chegue na hora certa e seja atendido na sua hora",
    },
    {
      icone: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      titulo: "Histórico de serviços",
      desc: "Acompanhe seus agendamentos e histórico de visitas",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex font-sans relative">

      {/* ── FUNDO MOBILE — visível apenas em telas pequenas ── */}
      <div className="lg:hidden absolute inset-0 z-0">
        <Image src="/img7.jpeg" alt="" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      {/* ── PAINEL ESQUERDO — Imagem + Branding ── */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-1/2 relative flex-col items-center justify-center overflow-hidden">
        <Image src="/img7.jpeg" alt="Victor Uematsu Barbearia" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-black/55" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.65) 100%)" }} />

        <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-lg">
          {/* Badge */}
          <div
            className={`transition-all duration-700 ${animado ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "0ms" }}
          >
            <span className="inline-flex items-center gap-2 text-[#E4B77D] text-xs font-bold tracking-[0.3em] uppercase border border-[#E4B77D]/30 px-5 py-2 rounded-full bg-[#E4B77D]/5 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E4B77D] animate-pulse" />
              Bem-vindo à família
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
              width={150}
              height={150}
              className="object-contain drop-shadow-[0_0_35px_rgba(228,183,125,0.35)]"
              priority
            />
          </div>

          {/* Headline */}
          <h1
            className={`text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4 transition-all duration-700 ${animado ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "250ms" }}
          >
            Sua primeira visita<br />
            <span className="text-[#E4B77D]">começa aqui.</span>
          </h1>

          {/* Benefícios */}
          <div
            className={`mt-6 flex flex-col gap-4 w-full text-left transition-all duration-700 ${animado ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "350ms" }}
          >
            {beneficios.map((b) => (
              <div key={b.titulo} className="flex items-start gap-4 bg-white/5 border border-white/8 rounded-xl px-5 py-4 backdrop-blur-sm">
                <div className="flex-shrink-0 mt-0.5 text-[#E4B77D]">{b.icone}</div>
                <div>
                  <p className="text-white text-sm font-semibold">{b.titulo}</p>
                  <p className="text-zinc-400 text-xs leading-relaxed mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Linha dourada decorativa */}
        <div
          className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-700 ${animado ? "opacity-60" : "opacity-0"}`}
          style={{ transitionDelay: "600ms" }}
        >
          <div className="w-px h-14 bg-gradient-to-b from-[#E4B77D] to-transparent" />
        </div>
      </div>

      {/* ── PAINEL DIREITO — Formulário ── */}
      <div className="w-full lg:w-[45%] xl:w-1/2 flex items-center justify-center px-6 py-16 overflow-y-auto relative z-10">

        {/* Voltar (mobile) */}
        <Link
          href="/login"
          className="lg:hidden absolute top-6 left-6 flex items-center gap-1.5 text-sm text-zinc-400 hover:text-[#E4B77D] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Login
        </Link>

        <div
          className={`w-full max-w-sm transition-all duration-700 ${animado ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ transitionDelay: "200ms" }}
        >
          {/* Logo mobile */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Image src="/logoSemFundo.png" alt="Victor Uematsu" width={100} height={100} />
          </div>

          {/* Cabeçalho */}
          <div className="mb-8">
            <p className="text-[#E4B77D] text-xs font-bold tracking-[0.3em] uppercase mb-2">Cadastro gratuito</p>
            <h2 className="text-3xl font-extrabold text-white">Criar nova conta</h2>
            <p className="text-zinc-500 text-sm mt-1.5">Cadastre-se para agendar seu horário</p>
          </div>

          {/* Mensagem de sucesso */}
          {sucesso && (
            <div className="mb-6 flex flex-col items-center gap-4 p-6 bg-green-950/40 border border-green-800/60 rounded-xl text-center">
              <div className="w-14 h-14 rounded-full bg-green-950/60 border border-green-800 flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.12)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-400">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-green-400 font-semibold text-sm">Cadastro realizado!</p>
                <p className="text-zinc-500 text-xs mt-1">Redirecionando para o login...</p>
              </div>
            </div>
          )}

          {/* Formulário */}
          {!sucesso && (
            <form onSubmit={fazerCadastro} className="flex flex-col gap-4">
              {erro && (
                <div className="bg-red-950/50 border border-red-900/70 text-red-400 text-sm p-3 rounded-lg text-center">
                  {erro}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Nome Completo</label>
                <input
                  type="text" value={nome} onChange={(e) => setNome(e.target.value)} required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#E4B77D] focus:ring-1 focus:ring-[#E4B77D]/20 transition-all"
                  placeholder="Seu nome"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-500 tracking-widest uppercase">E-mail</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#E4B77D] focus:ring-1 focus:ring-[#E4B77D]/20 transition-all"
                  placeholder="seu@email.com"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Telefone / WhatsApp</label>
                <input
                  type="tel" value={telefone} onChange={handleTelefoneChange} maxLength={15}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#E4B77D] focus:ring-1 focus:ring-[#E4B77D]/20 transition-all"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Senha</label>
                <input
                  type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#E4B77D] focus:ring-1 focus:ring-[#E4B77D]/20 transition-all"
                  placeholder="Crie uma senha forte"
                />
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full mt-2 bg-[#E4B77D] text-black font-extrabold py-3.5 rounded-lg hover:bg-[#cfa56d] transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(228,183,125,0.2)] disabled:opacity-50 disabled:scale-100"
              >
                {loading ? "Cadastrando..." : "Criar Conta"}
              </button>

              <div className="relative my-2">
                <div className="h-px bg-zinc-800" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-zinc-950 px-3 text-xs text-zinc-600">ou</span>
                </span>
              </div>

              <p className="text-center text-sm text-zinc-500">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-[#E4B77D] font-semibold hover:underline">
                  Fazer login
                </Link>
              </p>
            </form>
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
