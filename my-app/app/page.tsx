"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  const [heroCarregado, setHeroCarregado] = useState(false);

  useEffect(() => {
    const usuarioString = localStorage.getItem("usuario");
    if (usuarioString) setUsuarioLogado(JSON.parse(usuarioString));
    const t = setTimeout(() => setHeroCarregado(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-[93vh] flex items-center justify-center overflow-hidden">
        {/* Background image com overlay em camadas */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/img1.jpeg"
            alt="Interior da Barbearia Victor Uematsu"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30" />
          {/* Vinheta dourada sutil */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)" }} />
        </div>

        {/* Conteúdo centralizado */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto">

          {/* Badge "Desde 2016" */}
          <div className={`transition-all duration-700 ${heroCarregado ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "0ms" }}>
            <span className="inline-flex items-center gap-2 text-[#E4B77D] text-xs font-bold tracking-[0.3em] uppercase border border-[#E4B77D]/30 px-5 py-2 rounded-full bg-[#E4B77D]/5 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E4B77D] animate-pulse" />
              Presidente Prudente · SP · Desde 2016
            </span>
          </div>

          {/* Logo */}
          <div className={`mt-6 mb-6 transition-all duration-700 ${heroCarregado ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "100ms" }}>
            <Image
              src="/logoSemFundo.png"
              alt="Victor Uematsu Barbearia"
              width={170}
              height={170}
              className="object-contain drop-shadow-[0_0_35px_rgba(228,183,125,0.35)]"
              priority
            />
          </div>

          {/* Headline */}
          <h1 className={`text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight mb-5 transition-all duration-700 ${heroCarregado ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "200ms" }}>
            O seu estilo,<br />
            <span className="text-[#E4B77D]">em boas mãos.</span>
          </h1>

          <p className={`text-base md:text-lg text-zinc-400 max-w-xl mb-10 leading-relaxed transition-all duration-700 ${heroCarregado ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "300ms" }}>
            Cortes precisos, barba impecável e um ambiente que respira tradição e modernidade.
            Agende online e apareça na hora certa.
          </p>

          {/* CTAs */}
          <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 ${heroCarregado ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "400ms" }}>
            <Link
              href={usuarioLogado ? "/agendamento" : "/login"}
              className="px-10 py-4 text-base font-extrabold bg-[#E4B77D] text-black rounded-xl hover:bg-[#cfa56d] transition-all hover:scale-105 shadow-[0_0_40px_rgba(228,183,125,0.4)]"
            >
              Agendar Meu Horário
            </Link>
            <Link
              href="/espaco-interno"
              className="px-10 py-4 text-base font-bold border border-white/20 text-white rounded-xl hover:border-[#E4B77D]/60 hover:text-[#E4B77D] backdrop-blur-sm transition-all"
            >
              Conhecer o Espaço →
            </Link>
          </div>
        </div>

        {/* Indicador de scroll */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 animate-bounce opacity-50">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-400">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>



      {/* ─── GALERIA PREVIEW ──────────────────────────────── */}
      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[#E4B77D] text-xs font-bold tracking-[0.3em] uppercase mb-2">Nossa Barbearia</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                Conheça o <span className="text-[#E4B77D]">Espaço</span>
              </h2>
            </div>
            <Link
              href="/espaco-interno"
              className="hidden sm:flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-[#E4B77D] transition-colors border border-zinc-800 hover:border-[#E4B77D]/40 px-4 py-2 rounded-lg"
            >
              Ver galeria completa
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>

          {/* Bento grid de 2 colunas no desktop */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:h-[500px]">
            {/* Imagem grande à esquerda */}
            <div className="md:col-span-7 h-64 md:h-full relative rounded-2xl overflow-hidden group">
              <Image
                src="/img1.jpeg"
                alt="Interior da barbearia"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white font-bold text-lg">Ambiente Premium</p>
                <p className="text-zinc-300 text-sm">Conforto e estilo em cada detalhe</p>
              </div>
            </div>

            {/* Coluna direita com 2 imagens */}
            <div className="md:col-span-5 grid grid-rows-2 gap-3 h-64 md:h-full">
              <div className="relative rounded-2xl overflow-hidden group">
                <Image
                  src="/img4.jpeg"
                  alt="Área de espera"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
              </div>
              <div className="relative rounded-2xl overflow-hidden group">
                <Image
                  src="/img6.jpeg"
                  alt="Café para clientes"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
                  ☕ Café incluso
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/espaco-interno"
            className="flex sm:hidden items-center justify-center gap-2 mt-5 text-sm font-bold text-zinc-400 hover:text-[#E4B77D] transition-colors"
          >
            Ver galeria completa
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </section>

      {/* ─── CTA BAND ─────────────────────────────────────── */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/img7.jpeg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/88" />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(228,183,125,0.06) 0%, transparent 70%)" }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-[#E4B77D] text-xs font-bold tracking-[0.3em] uppercase mb-5">Pronto para o próximo nível?</p>
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Agende seu horário<br />
            <span className="text-[#E4B77D]">agora mesmo.</span>
          </h2>
          <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
            Sem filas, sem espera. Escolha o dia e horário que preferir e apareça na barbearia com tudo certo.
          </p>
          <Link
            href={usuarioLogado ? "/agendamento" : "/login"}
            className="inline-block px-12 py-5 text-lg font-extrabold bg-[#E4B77D] text-black rounded-xl hover:bg-[#cfa56d] transition-all hover:scale-105 shadow-[0_0_50px_rgba(228,183,125,0.45)]"
          >
            Agendar Agora →
          </Link>
        </div>
      </section>

      {/* ─── COMO CHEGAR ──────────────────────────────────── */}
      <section id="como-chegar" className="w-full bg-zinc-950 border-t border-zinc-900 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#E4B77D] text-xs font-bold tracking-[0.3em] uppercase mb-3">Localização</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white">
              Como <span className="text-[#E4B77D]">Chegar</span>
            </h2>
            <p className="text-zinc-500 mt-3 text-lg">Fácil acesso na Vila Maristela, Presidente Prudente.</p>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch gap-8">
            {/* Info cards */}
            <div className="flex flex-col gap-4 lg:w-80">
              {[
                { emoji: "📍", titulo: "Endereço", desc: "R. Cel. Albino, 22 - Vila Maristela\nPres. Prudente - SP, 19020-360" },
                { emoji: "📞", titulo: "WhatsApp", desc: "+55 (18) 98194-7357" },
                { emoji: "🕐", titulo: "Funcionamento", desc: "Seg – Sex: 9h às 19h\nSábado: 8h às 17h" },
              ].map((item) => (
                <div
                  key={item.titulo}
                  className="flex items-start gap-4 p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl hover:border-[#E4B77D]/30 transition-colors"
                >
                  <span className="text-xl mt-0.5">{item.emoji}</span>
                  <div>
                    <p className="font-bold text-white text-sm mb-1">{item.titulo}</p>
                    <p className="text-zinc-400 text-sm whitespace-pre-line leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mapa */}
            <div className="flex-1 bg-zinc-900 p-2 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden min-h-[320px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3696.085816480521!2d-51.39343362375836!3d-22.122619179815042!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9493f44e5bc111e1%3A0x6b1cc46162ab8f90!2sR.%20Cel.%20Albino%2C%2022%20-%20Vila%20Maristela%2C%20Pres.%20Prudente%20-%20SP%2C%2019020-360!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: "0.75rem", minHeight: "360px" }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale contrast-125 opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
