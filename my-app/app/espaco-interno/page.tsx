"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

const IMAGENS = [
  { id: 1, src: "/img1.jpeg", alt: "Cadeiras de barbeiro clássicas", categoria: "Ambiente" },
  { id: 2, src: "/img2.jpeg", alt: "Portão da barbearia", categoria: "Entrada" },
  { id: 3, src: "/img3.jpeg", alt: "Interior da barbearia", categoria: "Ambiente" },
  { id: 4, src: "/img4.jpeg", alt: "Espaço de espera", categoria: "Conforto" },
  { id: 5, src: "/img5.jpeg", alt: "Detalhe do espelho e iluminação", categoria: "Estilo" },
  { id: 6, src: "/img6.jpeg", alt: "Café para os clientes", categoria: "Experiência" },
  { id: 7, src: "/img7.jpeg", alt: "Ambiente geral da barbearia", categoria: "Panorâmica" },
];

const IconeLupa = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const IconeSetaEsq = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);
const IconeSetaDir = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
const IconeFechar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function EspacoInterno() {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [progresso, setProgresso] = useState(0);
  const [animado, setAnimado] = useState(false);
  const [lightboxAberto, setLightboxAberto] = useState(false);
  const [lightboxIndice, setLightboxIndice] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimado(true), 100);
    return () => clearTimeout(t);
  }, []);

  const proximaFoto = useCallback(() => {
    setIndiceAtual((prev) => (prev === IMAGENS.length - 1 ? 0 : prev + 1));
  }, []);

  const fotoAnterior = useCallback(() => {
    setIndiceAtual((prev) => (prev === 0 ? IMAGENS.length - 1 : prev - 1));
  }, []);

  // Barra de progresso + autoplay
  useEffect(() => {
    if (!isAutoPlay || lightboxAberto) return;
    setProgresso(0);
    const DURACAO = 4000;
    const TICK = 50;
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += TICK;
      setProgresso(Math.min((elapsed / DURACAO) * 100, 100));
      if (elapsed >= DURACAO) {
        clearInterval(timer);
        proximaFoto();
      }
    }, TICK);
    return () => clearInterval(timer);
  }, [indiceAtual, isAutoPlay, lightboxAberto, proximaFoto]);

  // Teclado para o lightbox
  useEffect(() => {
    if (!lightboxAberto) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setLightboxIndice((p) => (p + 1) % IMAGENS.length);
      if (e.key === "ArrowLeft") setLightboxIndice((p) => (p - 1 + IMAGENS.length) % IMAGENS.length);
      if (e.key === "Escape") setLightboxAberto(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxAberto]);

  // Bloqueia scroll quando lightbox está aberto
  useEffect(() => {
    document.body.style.overflow = lightboxAberto ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxAberto]);

  const abrirLightbox = (index: number) => {
    setLightboxIndice(index);
    setLightboxAberto(true);
    setIsAutoPlay(false);
  };

  const irParaFoto = (index: number) => {
    setIsAutoPlay(false);
    setIndiceAtual(index);
    setProgresso(0);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-[#E4B77D] selection:text-black">

      {/* ── HERO ── */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <Image src="/img7.jpeg" alt="Ambiente da barbearia" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-zinc-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

        {/* Botão Voltar */}
        <div
          className={`absolute top-6 left-6 z-20 transition-all duration-700 ${animado ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-[#E4B77D] transition-colors bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para o Início
          </Link>
        </div>

        {/* Conteúdo central */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div
            className={`transition-all duration-700 ${animado ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "100ms" }}
          >
            <span className="inline-block text-[#E4B77D] text-xs font-semibold tracking-[0.4em] uppercase mb-5 border border-[#E4B77D]/30 px-5 py-1.5 rounded-full">
              Conheça o Espaço
            </span>
          </div>
          <h1
            className={`text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 leading-none transition-all duration-700 ${animado ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "200ms" }}
          >
            Nosso <span className="text-[#E4B77D]">Ambiente</span>
          </h1>
          <p
            className={`text-lg md:text-xl text-zinc-300 font-light max-w-2xl mx-auto leading-relaxed transition-all duration-700 ${animado ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "350ms" }}
          >
            Um espaço projetado para oferecer conforto, estilo e a verdadeira experiência da barbearia clássica.
          </p>
        </div>

        {/* Indicador de scroll */}
        <div
          className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-700 ${animado ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "600ms" }}
        >
          <span className="text-zinc-500 text-[10px] tracking-[0.35em] uppercase">Explorar</span>
          <div className="w-px h-12 bg-gradient-to-b from-[#E4B77D] to-transparent animate-pulse" />
        </div>
      </section>

      {/* ── CARROSSEL ── */}
      <section className="py-20 md:py-28 px-4 bg-zinc-950 overflow-hidden">
        <div className="max-w-6xl mx-auto">

          {/* Cabeçalho do carrossel */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 px-2">
            <div>
              <p className="text-[#E4B77D] text-xs font-semibold tracking-[0.35em] uppercase mb-2">Galeria em Destaque</p>
              <h2 className="text-3xl md:text-4xl font-bold">Cada Detalhe <span className="text-zinc-500">Importa</span></h2>
            </div>
            <div className="flex items-center gap-3 self-end">
              <button
                onClick={() => { setIsAutoPlay(false); fotoAnterior(); }}
                className="p-3 rounded-full border border-zinc-700 text-zinc-400 hover:border-[#E4B77D] hover:text-[#E4B77D] transition-colors"
                aria-label="Foto anterior"
              >
                <IconeSetaEsq />
              </button>
              <span className="text-zinc-500 font-mono text-sm tabular-nums w-16 text-center">
                {String(indiceAtual + 1).padStart(2, "0")} / {String(IMAGENS.length).padStart(2, "0")}
              </span>
              <button
                onClick={() => { setIsAutoPlay(false); proximaFoto(); }}
                className="p-3 rounded-full border border-zinc-700 text-zinc-400 hover:border-[#E4B77D] hover:text-[#E4B77D] transition-colors"
                aria-label="Próxima foto"
              >
                <IconeSetaDir />
              </button>
            </div>
          </div>

          {/* Carrossel principal */}
          <div className="relative h-[380px] md:h-[560px] flex items-center justify-center">
            {IMAGENS.map((img, index) => {
              const diferenca = index - indiceAtual;
              const distanciaAbsoluta = Math.abs(diferenca);
              if (
                distanciaAbsoluta > 2 &&
                !(index === 0 && indiceAtual === IMAGENS.length - 1) &&
                !(index === IMAGENS.length - 1 && indiceAtual === 0)
              ) return null;

              let isEsquerda = diferenca < 0;
              let isDireita = diferenca > 0;
              if (index === IMAGENS.length - 1 && indiceAtual === 0) { isEsquerda = true; isDireita = false; }
              if (index === 0 && indiceAtual === IMAGENS.length - 1) { isDireita = true; isEsquerda = false; }
              const isCentro = index === indiceAtual;

              let classesPosicao = "";
              let zIndex = 10;

              if (isCentro) {
                classesPosicao = "scale-100 opacity-100 translate-x-0 shadow-2xl shadow-black/80";
                zIndex = 30;
              } else if (isEsquerda) {
                classesPosicao = "-translate-x-20 md:-translate-x-44 scale-[0.86] opacity-25 cursor-pointer hover:opacity-50 rotate-[-3deg]";
                zIndex = 20;
              } else if (isDireita) {
                classesPosicao = "translate-x-20 md:translate-x-44 scale-[0.86] opacity-25 cursor-pointer hover:opacity-50 rotate-[3deg]";
                zIndex = 20;
              }

              return (
                <div
                  key={img.id}
                  onClick={() => {
                    if (isCentro) { abrirLightbox(index); return; }
                    setIsAutoPlay(false);
                    if (isEsquerda) fotoAnterior();
                    else if (isDireita) proximaFoto();
                  }}
                  className={`absolute w-[78%] md:w-[56%] h-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${classesPosicao} ${isCentro ? "cursor-zoom-in" : ""}`}
                  style={{ zIndex }}
                >
                  <div className="relative w-full h-full rounded-2xl overflow-hidden border border-zinc-800/50 group">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      priority={isCentro}
                    />
                    {isCentro && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 flex items-end justify-between">
                          <div>
                            <span className="text-[#E4B77D] text-[10px] font-bold uppercase tracking-[0.3em]">{img.categoria}</span>
                            <p className="text-white font-medium mt-1 text-sm md:text-base">{img.alt}</p>
                          </div>
                          <div className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                            <IconeLupa size={16} />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Setas mobile */}
            <button
              onClick={() => { setIsAutoPlay(false); fotoAnterior(); }}
              className="absolute left-1 md:hidden z-40 p-3 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10"
              aria-label="Foto anterior"
            >
              <IconeSetaEsq size={18} />
            </button>
            <button
              onClick={() => { setIsAutoPlay(false); proximaFoto(); }}
              className="absolute right-1 md:hidden z-40 p-3 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10"
              aria-label="Próxima foto"
            >
              <IconeSetaDir size={18} />
            </button>
          </div>

          {/* Barra de progresso */}
          <div className="mt-6 max-w-sm mx-auto h-px bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E4B77D] rounded-full"
              style={{ width: `${isAutoPlay && !lightboxAberto ? progresso : 0}%`, transition: "width 50ms linear" }}
            />
          </div>

          {/* Miniaturas */}
          <div className="mt-6 flex items-center justify-center gap-2 flex-wrap px-2">
            {IMAGENS.map((img, index) => (
              <button
                key={img.id}
                onClick={() => irParaFoto(index)}
                className={`relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-300 border-2
                  ${indiceAtual === index
                    ? "border-[#E4B77D] scale-110 shadow-[0_0_14px_rgba(228,183,125,0.4)]"
                    : "border-zinc-700/40 opacity-45 hover:opacity-80 hover:scale-105"
                  }`}
                aria-label={`Ver foto ${index + 1}`}
              >
                <Image src={img.src} alt={`Miniatura ${index + 1}`} fill className="object-cover" sizes="56px" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALERIA BENTO ── */}
      <section className="py-20 md:py-28 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[#E4B77D] text-xs font-semibold tracking-[0.35em] uppercase mb-3">Todos os Ambientes</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Nossa <span className="text-zinc-500">Galeria</span></h2>
          <p className="text-zinc-600 text-sm">Clique em qualquer foto para ver em tela cheia</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-4" style={{ gridAutoRows: "200px" }}>

          {/* img1 — destaque: 7 cols × 2 linhas */}
          <button
            onClick={() => abrirLightbox(0)}
            className="relative col-span-2 md:col-span-7 md:row-span-2 rounded-2xl overflow-hidden group"
          >
            <Image src={IMAGENS[0].src} alt={IMAGENS[0].alt} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 rounded-full bg-black/50 border border-[#E4B77D]/50 text-[#E4B77D]">
                <IconeLupa size={24} />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <span className="text-[#E4B77D] text-[10px] font-bold uppercase tracking-widest">{IMAGENS[0].categoria}</span>
              <p className="text-white text-sm mt-0.5">{IMAGENS[0].alt}</p>
            </div>
          </button>

          {/* img2 — 5 cols × 1 linha */}
          <button
            onClick={() => abrirLightbox(1)}
            className="relative col-span-1 md:col-span-5 rounded-2xl overflow-hidden group"
          >
            <Image src={IMAGENS[1].src} alt={IMAGENS[1].alt} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 rounded-full bg-black/50 border border-[#E4B77D]/50 text-[#E4B77D]">
                <IconeLupa />
              </div>
            </div>
          </button>

          {/* img3 — 5 cols × 1 linha */}
          <button
            onClick={() => abrirLightbox(2)}
            className="relative col-span-1 md:col-span-5 rounded-2xl overflow-hidden group"
          >
            <Image src={IMAGENS[2].src} alt={IMAGENS[2].alt} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 rounded-full bg-black/50 border border-[#E4B77D]/50 text-[#E4B77D]">
                <IconeLupa />
              </div>
            </div>
          </button>

          {/* img4, img5, img6 — 4 cols cada */}
          {[3, 4, 5].map((i) => (
            <button
              key={i}
              onClick={() => abrirLightbox(i)}
              className="relative col-span-1 md:col-span-4 rounded-2xl overflow-hidden group"
            >
              <Image src={IMAGENS[i].src} alt={IMAGENS[i].alt} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 rounded-full bg-black/50 border border-[#E4B77D]/50 text-[#E4B77D]">
                  <IconeLupa />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-[#E4B77D] text-[10px] font-bold uppercase tracking-widest">{IMAGENS[i].categoria}</span>
              </div>
            </button>
          ))}

          {/* img7 — panorâmica: 12 cols */}
          <button
            onClick={() => abrirLightbox(6)}
            className="relative col-span-2 md:col-span-12 rounded-2xl overflow-hidden group"
          >
            <Image src={IMAGENS[6].src} alt={IMAGENS[6].alt} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/50 border border-[#E4B77D]/50 text-[#E4B77D]">
                <IconeLupa size={18} />
                <span className="text-sm font-medium">Ver panorâmica</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <span className="text-[#E4B77D] text-[10px] font-bold uppercase tracking-widest">{IMAGENS[6].categoria}</span>
              <p className="text-white text-sm mt-0.5">{IMAGENS[6].alt}</p>
            </div>
          </button>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-32 md:py-40 px-6 text-center overflow-hidden">
        <Image src="/img1.jpeg" alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-zinc-950/88" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(228,183,125,0.10) 0%, transparent 65%)" }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-[#E4B77D] text-xs font-semibold tracking-[0.35em] uppercase mb-5">Venha nos visitar</p>
          <h3 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
            Gostou do <span className="text-[#E4B77D]">Ambiente?</span>
          </h3>
          <p className="text-zinc-400 mb-10 text-lg leading-relaxed">
            Venha tomar um café, trocar uma ideia e dar um trato no visual com a nossa equipe.
          </p>
          <Link
            href="/agendamento"
            className="inline-block px-10 py-4 text-base font-bold bg-[#E4B77D] text-black rounded-lg hover:bg-[#cfa56d] transition-all duration-200 hover:scale-105 shadow-xl shadow-[#E4B77D]/20"
          >
            Agendar Meu Horário
          </Link>
        </div>
      </section>

      {/* ── LIGHTBOX ── */}
      {lightboxAberto && (
        <div
          className="fixed inset-0 z-[200] bg-black/96 flex items-center justify-center"
          onClick={() => setLightboxAberto(false)}
        >
          <div
            className="relative w-full h-full flex items-center justify-center p-4 md:p-16"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fechar */}
            <button
              onClick={() => setLightboxAberto(false)}
              className="absolute top-5 right-5 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              aria-label="Fechar"
            >
              <IconeFechar />
            </button>

            {/* Contador */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-zinc-500 text-sm font-mono tabular-nums">
              {String(lightboxIndice + 1).padStart(2, "0")} / {String(IMAGENS.length).padStart(2, "0")}
            </div>

            {/* Imagem */}
            <div className="relative w-full max-w-5xl" style={{ height: "70vh" }}>
              <Image
                src={IMAGENS[lightboxIndice].src}
                alt={IMAGENS[lightboxIndice].alt}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Legenda */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
              <span className="text-[#E4B77D] text-[10px] font-bold uppercase tracking-[0.3em]">
                {IMAGENS[lightboxIndice].categoria}
              </span>
              <p className="text-zinc-400 text-sm mt-1">{IMAGENS[lightboxIndice].alt}</p>
              <p className="text-zinc-700 text-xs mt-2">← → para navegar · Esc para fechar</p>
            </div>

            {/* Prev */}
            <button
              onClick={() => setLightboxIndice((p) => (p - 1 + IMAGENS.length) % IMAGENS.length)}
              className="absolute left-4 md:left-8 p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              aria-label="Foto anterior"
            >
              <IconeSetaEsq size={24} />
            </button>

            {/* Next */}
            <button
              onClick={() => setLightboxIndice((p) => (p + 1) % IMAGENS.length)}
              className="absolute right-4 md:right-8 p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              aria-label="Próxima foto"
            >
              <IconeSetaDir size={24} />
            </button>

            {/* Miniaturas no lightbox */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
              {IMAGENS.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setLightboxIndice(index)}
                  className={`relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 border-2
                    ${lightboxIndice === index
                      ? "border-[#E4B77D] opacity-100"
                      : "border-transparent opacity-35 hover:opacity-70"
                    }`}
                  aria-label={`Foto ${index + 1}`}
                >
                  <Image src={img.src} alt="" fill className="object-cover" sizes="40px" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
