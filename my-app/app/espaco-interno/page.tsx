"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

const IMAGENS = [
  { id: 1, src: "/img1.jpeg", alt: "Cadeiras de barbeiro clássicas" },
  { id: 2, src: "/img2.jpeg", alt: "Portão da barbearia" },
  { id: 3, src: "/img3.jpeg", alt: "" },
  { id: 4, src: "/img4.jpeg", alt: "Espaço e espera" },
  { id: 5, src: "/img5.jpeg", alt: "Detalhe do espelho e iluminação" },
  { id: 6, src: "/img6.jpeg", alt: "Café para os clientes" },
  { id: 7, src: "/img7.jpeg", alt: "Ambiente geral da barbearia" },
];

export default function EspacoInterno() {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const proximaFoto = useCallback(() => {
    setIndiceAtual((prev) => (prev === IMAGENS.length - 1 ? 0 : prev + 1));
  }, []);

  const fotoAnterior = useCallback(() => {
    setIndiceAtual((prev) => (prev === 0 ? IMAGENS.length - 1 : prev - 1));
  }, []);

  useEffect(() => {
    if (!isAutoPlay) return;
    const intervalo = setInterval(proximaFoto, 4000);
    return () => clearInterval(intervalo);
  }, [isAutoPlay, proximaFoto]);

  const handleInteracaoUsuario = (novoIndice: number) => {
    setIsAutoPlay(false);
    setIndiceAtual(novoIndice);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#E4B77D] selection:text-black">

    <header className="flex items-center px-8 py-6 border-b border-zinc-900 shrink-0">
        <Link href="/" className="text-zinc-400 hover:text-[#E4B77D] transition-colors flex items-center gap-2 text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para o Início
        </Link>
      </header>
      
      {/* CABEÇALHO */}
      <header className="pt-24 pb-12 px-6 text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          Nosso <span className="text-[#E4B77D]">Ambiente</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 font-light max-w-2xl mx-auto">
          Um ambiente projetado para oferecer conforto, estilo e a verdadeira experiência da barbearia clássica.
        </p>
      </header>

      {/* SESSÃO 1: STACKED PHOTO DECK (O Baralho Interativo) */}
      <section className="relative w-full max-w-5xl mx-auto h-[400px] md:h-[600px] flex items-center justify-center overflow-hidden mb-20 px-4">
        
        {IMAGENS.map((img, index) => {
          const diferenca = index - indiceAtual;
          const distanciaAbsoluta = Math.abs(diferenca);
          
          if (distanciaAbsoluta > 2 && !(index === 0 && indiceAtual === IMAGENS.length - 1) && !(index === IMAGENS.length - 1 && indiceAtual === 0)) return null;

          let isEsquerda = diferenca < 0;
          let isDireita = diferenca > 0;
          if (index === IMAGENS.length - 1 && indiceAtual === 0) isEsquerda = true; isDireita = false;
          if (index === 0 && indiceAtual === IMAGENS.length - 1) isDireita = true; isEsquerda = false;

          const isCentro = index === indiceAtual;

          let classesPosicao = "";
          let zIndex = 10;

          if (isCentro) {
            classesPosicao = "scale-100 opacity-100 z-30 translate-x-0 cursor-default shadow-2xl shadow-black/80";
            zIndex = 30;
          } else if (isEsquerda) {
            classesPosicao = "-translate-x-16 md:-translate-x-32 scale-90 opacity-40 z-20 cursor-pointer hover:opacity-70 rotate-[-4deg]";
            zIndex = 20;
          } else if (isDireita) {
            classesPosicao = "translate-x-16 md:translate-x-32 scale-90 opacity-40 z-20 cursor-pointer hover:opacity-70 rotate-[4deg]";
            zIndex = 20;
          }

          return (
            <div
              key={img.id}
              onClick={() => {
                if (isEsquerda) { setIsAutoPlay(false); fotoAnterior(); }
                if (isDireita) { setIsAutoPlay(false); proximaFoto(); }
              }}
              className={`absolute top-0 bottom-0 w-[80%] md:w-[60%] lg:w-[50%] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] flex items-center justify-center ${classesPosicao}`}
              style={{ zIndex }}
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-zinc-800/50 bg-zinc-900 group">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover pointer-events-none transition-transform duration-1000 group-hover:scale-105"
                  priority={isCentro}
                />
                
                {/* Efeito de Reflexo no Centro */}
                {isCentro && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none flex items-end p-6">
                    <p className="text-white font-medium drop-shadow-md">{img.alt}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Setas de Controle para Mobile (Ficam no centro sobre a imagem principal) */}
        <button 
          onClick={() => { setIsAutoPlay(false); fotoAnterior(); }} 
          className="absolute left-4 md:hidden z-40 p-3 rounded-full bg-black/50 text-white backdrop-blur-md border border-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button 
          onClick={() => { setIsAutoPlay(false); proximaFoto(); }} 
          className="absolute right-4 md:hidden z-40 p-3 rounded-full bg-black/50 text-white backdrop-blur-md border border-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </section>

      {/* SESSÃO 2: MASONRY PEEK (Visão Geral de Mosaico) */}
      <section className="max-w-6xl mx-auto px-6 mb-24">
        <div className="flex items-center justify-between mb-8 border-b border-zinc-900 pb-4">
          <h2 className="text-xl font-bold text-zinc-300 uppercase tracking-widest">Galeria Completa</h2>
          <span className="text-zinc-600 text-sm font-mono">{indiceAtual + 1} / {IMAGENS.length}</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 md:gap-4">
          {IMAGENS.map((img, index) => (
            <button
              key={img.id}
              onClick={() => handleInteracaoUsuario(index)}
              className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-300 border-2 
                ${indiceAtual === index ? 'border-[#E4B77D] scale-105 shadow-[0_0_15px_rgba(228,183,125,0.4)]' : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'}`
              }
            >
              <Image 
                src={img.src} 
                alt={`Miniatura ${img.alt}`} 
                fill 
                className="object-cover"
                sizes="(max-width: 768px) 33vw, 15vw"
              />
              {/* Efeito escuro sobre as fotos não selecionadas */}
              {indiceAtual !== index && <div className="absolute inset-0 bg-black/30 transition-colors hover:bg-transparent"></div>}
            </button>
          ))}
        </div>
      </section>

      <section className="bg-zinc-900 border-t border-zinc-800 mt-auto py-16 px-6 text-center">
        <h3 className="text-2xl md:text-3xl font-bold mb-4">Gostou do ambiente?</h3>
        <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
          Venha tomar um café, trocar uma ideia e dar um trato no visual com a nossa equipe.
        </p>
        <Link 
          href="/agendamento" 
          className="inline-block px-8 py-4 text-lg font-bold bg-[#E4B77D] text-black rounded-lg hover:bg-[#cfa56d] transition-transform hover:scale-105 shadow-lg shadow-[#E4B77D]/10"
        >
          Agendar Meu Horário
        </Link>
      </section>

    </div>
  );
}