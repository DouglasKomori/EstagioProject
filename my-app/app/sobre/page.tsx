"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/* ─── Hooks utilitários ─────────────────────────────────── */

function useIntersection(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visivel, setVisivel] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisivel(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, visivel };
}

function useContador(alvo: number, visivel: boolean, duracao = 1600) {
  const [valor, setValor] = useState(0);
  useEffect(() => {
    if (!visivel) return;
    let atual = 0;
    const passo = alvo / (duracao / 16);
    const timer = setInterval(() => {
      atual += passo;
      if (atual >= alvo) { setValor(alvo); clearInterval(timer); }
      else setValor(Math.floor(atual));
    }, 16);
    return () => clearInterval(timer);
  }, [visivel, alvo, duracao]);
  return valor;
}

/* ─── Ícones SVG ────────────────────────────────────────── */

const IconeTesoura = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6m0 0l6-6M12 15V3m0 12a3 3 0 110 6 3 3 0 010-6z" />
  </svg>
);
const IconeEstrela = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);
const IconeCafe = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9h2m0 0V5a2 2 0 012-2h10a2 2 0 012 2v4m-14 0h14m0 0v6a2 2 0 01-2 2H7a2 2 0 01-2-2V9m14 0h2m-2 0a2 2 0 012 2v2a2 2 0 01-2 2h-2" />
  </svg>
);
const IconeGraduacao = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
  </svg>
);

/* ─── Componente de Stat com contador ────────────────────── */

function StatCard({ prefixo = "", numero, sufixo = "", legenda, visivel }: {
  prefixo?: string; numero: number; sufixo?: string; legenda: string; visivel: boolean;
}) {
  const valor = useContador(numero, visivel);
  return (
    <div className="flex flex-col items-center text-center gap-2">
      <span className="text-4xl md:text-5xl font-extrabold text-[#E4B77D] tabular-nums">
        {prefixo}{valor}{sufixo}
      </span>
      <span className="text-xs font-bold text-zinc-500 uppercase tracking-[0.25em]">{legenda}</span>
    </div>
  );
}

/* ─── Página ─────────────────────────────────────────────── */

export default function Sobre() {
  const router = useRouter();
  const [heroAnimado, setHeroAnimado] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroAnimado(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleAgendarClick = () => {
    const token = localStorage.getItem("token");
    router.push(token ? "/agendamento" : "/login");
  };

  const secaoHistoria = useIntersection();
  const secaoNumeros = useIntersection(0.3);
  const secaoValores = useIntersection(0.15);
  const secaoTimeline = useIntersection(0.15);

  const VALORES = [
    {
      icone: <IconeTesoura />,
      titulo: "Precisão Artesanal",
      descricao: "Cada corte é uma obra executada com técnica refinada e atenção minuciosa a cada detalhe do seu estilo.",
    },
    {
      icone: <IconeCafe />,
      titulo: "Experiência Completa",
      descricao: "Mais do que um corte: café, conversa e um ambiente que faz você querer ficar um pouco mais.",
    },
    {
      icone: <IconeGraduacao />,
      titulo: "Evolução Constante",
      descricao: "Mais de 15 especializações em técnicas, gestão e inteligência emocional para entregar sempre o melhor.",
    },
    {
      icone: <IconeEstrela />,
      titulo: "Relacionamento Genuíno",
      descricao: "Cada cliente é único. Tratamos cada atendimento com cuidado, respeito e dedicação desde o primeiro dia.",
    },
  ];

  const TIMELINE = [
    {
      ano: "2016",
      titulo: "O Começo",
      descricao: "Em outubro de 2016, a Barbearia Victor Uematsu abriu suas portas com coragem e muita vontade de fazer diferente. Os primeiros dez clientes semanais foram a faísca que acendeu tudo.",
    },
    {
      ano: "2018–20",
      titulo: "Crescimento e Saber",
      descricao: "Investimento pesado em capacitação: cursos de corte, barba, gestão e marketing. Cada nova técnica aprendida virou experiência entregue ao cliente.",
    },
    {
      ano: "Hoje",
      titulo: "Referência na Cidade",
      descricao: "Centenas de atendimentos mensais, equipe especializada e um sistema moderno de agendamento online. A história continua sendo escrita, um corte de cada vez.",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-[#E4B77D] selection:text-black">

      {/* ─── HERO ────────────────────────────────────────────── */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <Image
          src="/img1.jpeg"
          alt="Interior da Barbearia Victor Uematsu"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-zinc-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/20" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.75) 100%)" }} />

        {/* Botão voltar */}
        <div
          className={`absolute top-6 left-6 z-20 transition-all duration-700 ${heroAnimado ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
          style={{ transitionDelay: "0ms" }}
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
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">

          <div
            className={`transition-all duration-700 ${heroAnimado ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "100ms" }}
          >
            <span className="inline-flex items-center gap-2 text-[#E4B77D] text-xs font-bold tracking-[0.35em] uppercase border border-[#E4B77D]/30 px-5 py-2 rounded-full bg-[#E4B77D]/5 backdrop-blur-sm mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E4B77D]" />
              Presidente Prudente · SP · Desde 2016
            </span>
          </div>

          <Image
            src="/logoSemFundo.png"
            alt="Logo Victor Uematsu"
            width={100}
            height={100}
            className={`object-contain drop-shadow-[0_0_35px_rgba(228,183,125,0.4)] mb-7 transition-all duration-700 ${heroAnimado ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
            style={{ transitionDelay: "200ms" }}
            priority
          />

          <h1
            className={`text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-none mb-6 transition-all duration-700 ${heroAnimado ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "300ms" }}
          >
            Nossa <span className="text-[#E4B77D]">História</span>
          </h1>

          <p
            className={`text-lg md:text-xl text-zinc-300 font-light max-w-2xl leading-relaxed transition-all duration-700 ${heroAnimado ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "450ms" }}
          >
            Uma trajetória construída sobre coragem, dedicação e o prazer genuíno de fazer cada cliente sair melhor do que entrou.
          </p>
        </div>

        {/* Indicador de scroll */}
        <div
          className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-700 ${heroAnimado ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "700ms" }}
        >
          <span className="text-zinc-500 text-[10px] tracking-[0.35em] uppercase">Explorar</span>
          <div className="w-px h-12 bg-gradient-to-b from-[#E4B77D] to-transparent animate-pulse" />
        </div>
      </section>

      {/* ─── A HISTÓRIA ──────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6">
        <div
          ref={secaoHistoria.ref}
          className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center"
        >
          {/* Foto com overlay */}
          <div
            className={`relative transition-all duration-1000 ${secaoHistoria.visivel ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
          >
            <div className="relative h-[480px] md:h-[560px] rounded-2xl overflow-hidden group">
              <Image
                src="/img4.jpeg"
                alt="Área de espera da barbearia"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              {/* Badge flutuante */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-black/60 backdrop-blur-md border border-[#E4B77D]/30 rounded-xl px-5 py-4">
                  <p className="text-[#E4B77D] text-[10px] font-bold uppercase tracking-[0.3em] mb-1">Conforto e Estilo</p>
                  <p className="text-white text-sm font-medium">Um ambiente pensado para você se sentir em casa.</p>
                </div>
              </div>
            </div>

            {/* Detalhe decorativo */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 border border-[#E4B77D]/20 rounded-2xl -z-10" />
            <div className="absolute -top-4 -left-4 w-20 h-20 border border-zinc-800 rounded-xl -z-10" />
          </div>

          {/* Texto */}
          <div
            className={`transition-all duration-1000 delay-200 ${secaoHistoria.visivel ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
          >
            <p className="text-[#E4B77D] text-xs font-bold tracking-[0.3em] uppercase mb-4">Quem Somos</p>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-8">
              Uma barbearia<br />
              <span className="text-zinc-500">feita de</span> pessoas.
            </h2>

            <div className="space-y-5 text-zinc-400 leading-relaxed text-base">
              <p>
                A nossa jornada começou em <strong className="text-[#E4B77D] font-bold">outubro de 2016</strong>, fundamentada na coragem e no desejo de empreender. Os primeiros passos foram desafiadores — dias de espera, pouca movimentação — mas cada minuto de dedicação valeu a pena.
              </p>
              <p>
                O que começou com a alegria dos primeiros <strong className="text-white font-semibold">dez clientes semanais</strong> se transformou em uma operação que realiza <strong className="text-[#E4B77D] font-bold">centenas de atendimentos</strong> todos os meses.
              </p>
              <p>
                Ao longo desses anos, investimos incansavelmente em aperfeiçoamento: <strong className="text-white font-semibold">mais de 15 especializações</strong> em técnicas de corte, gestão, marketing e inteligência emocional.
              </p>
            </div>

            {/* Pull-quote */}
            <blockquote className="mt-10 pl-5 border-l-2 border-[#E4B77D]">
              <p className="text-white text-lg font-semibold leading-snug italic">
                "Olhar para trás e ver nossa evolução é gratificante, mas o nosso olhar está sempre no futuro."
              </p>
              <footer className="text-zinc-500 text-sm mt-2 not-italic">
                — Victor Uematsu
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ─── LINHA DO TEMPO ──────────────────────────────────── */}
      <section className="py-24 px-6 bg-zinc-900/30 border-y border-zinc-900">
        <div
          ref={secaoTimeline.ref}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-16">
            <p className="text-[#E4B77D] text-xs font-bold tracking-[0.3em] uppercase mb-3">Nossa Trajetória</p>
            <h2 className="text-3xl md:text-4xl font-extrabold">
              Uma década de <span className="text-[#E4B77D]">evolução</span>
            </h2>
          </div>

          <div className="relative">
            {/* Linha central */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#E4B77D]/40 via-[#E4B77D]/20 to-transparent hidden md:block" />

            <div className="flex flex-col gap-12">
              {TIMELINE.map((item, i) => (
                <div
                  key={item.ano}
                  className={`relative flex flex-col md:flex-row items-center gap-8 transition-all duration-700 ${secaoTimeline.visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: `${i * 200}ms` }}
                >
                  {/* Lado esquerdo (ano) */}
                  <div className={`flex-1 text-center md:text-right ${i % 2 !== 0 ? "md:order-3" : ""}`}>
                    <span className="text-4xl font-extrabold text-zinc-800">{item.ano}</span>
                  </div>

                  {/* Marcador central */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-zinc-950 border-2 border-[#E4B77D] flex items-center justify-center shadow-[0_0_20px_rgba(228,183,125,0.3)]">
                      <div className="w-3 h-3 rounded-full bg-[#E4B77D]" />
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className={`flex-1 ${i % 2 !== 0 ? "md:order-1 md:text-right" : ""}`}>
                    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 hover:border-[#E4B77D]/30 transition-colors duration-300">
                      <h3 className="text-lg font-bold text-white mb-2">{item.titulo}</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">{item.descricao}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── NÚMEROS ─────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div
          ref={secaoNumeros.ref}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-16">
            <p className="text-[#E4B77D] text-xs font-bold tracking-[0.3em] uppercase mb-3">Em Números</p>
            <h2 className="text-3xl md:text-4xl font-extrabold">
              Uma história que <span className="text-[#E4B77D]">fala por si.</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {/* Separadores verticais visíveis no desktop */}
            <div className="relative flex flex-col items-center gap-4">
              <StatCard numero={2016} legenda="Ano de fundação" visivel={secaoNumeros.visivel} />
            </div>
            <div className="relative flex flex-col items-center gap-4 md:border-l md:border-zinc-800">
              <StatCard numero={10} sufixo=" anos" legenda="De história e excelência" visivel={secaoNumeros.visivel} />
            </div>
            <div className="relative flex flex-col items-center gap-4 md:border-l md:border-zinc-800">
              <StatCard prefixo="⭐" numero={4.9} legenda="Avaliação no Google" visivel={secaoNumeros.visivel} />
            </div>
            <div className="relative flex flex-col items-center gap-4 md:border-l md:border-zinc-800">
              <StatCard prefixo="+" numero={15} legenda="Especializações" visivel={secaoNumeros.visivel} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── GALERIA RÁPIDA ──────────────────────────────────── */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:h-[400px]">
            <div className="relative rounded-2xl overflow-hidden group md:row-span-2 h-48 md:h-full">
              <Image src="/img5.jpeg" alt="Espelho e iluminação" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
            </div>
            <div className="relative rounded-2xl overflow-hidden group h-48 md:h-auto">
              <Image src="/img3.jpeg" alt="Interior da barbearia" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
            </div>
            <div className="relative rounded-2xl overflow-hidden group h-48 md:h-auto">
              <Image src="/img6.jpeg" alt="Café para os clientes" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10">
                ☕ Café incluso
              </div>
            </div>
            <div className="relative col-span-2 rounded-2xl overflow-hidden group h-48 md:h-auto">
              <Image src="/img2.jpeg" alt="Fachada da barbearia" fill className="object-cover object-center transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-5">
                <p className="text-[#E4B77D] text-[10px] font-bold uppercase tracking-widest">Entrada</p>
                <p className="text-white text-sm font-medium">Vila Maristela, Presidente Prudente</p>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Link
              href="/espaco-interno"
              className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-[#E4B77D] transition-colors"
            >
              Ver galeria completa
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── NOSSOS VALORES ──────────────────────────────────── */}
      <section className="py-24 px-6 bg-zinc-900/30 border-t border-zinc-900">
        <div
          ref={secaoValores.ref}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-16">
            <p className="text-[#E4B77D] text-xs font-bold tracking-[0.3em] uppercase mb-3">O que nos move</p>
            <h2 className="text-3xl md:text-4xl font-extrabold">
              Nossos <span className="text-[#E4B77D]">Valores</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALORES.map((v, i) => (
              <div
                key={v.titulo}
                className={`group bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-[#E4B77D]/40 transition-all duration-500 hover:-translate-y-1 ${secaoValores.visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-[#E4B77D]/10 border border-[#E4B77D]/20 flex items-center justify-center text-[#E4B77D] mb-5 group-hover:bg-[#E4B77D]/20 transition-colors duration-300">
                  {v.icone}
                </div>
                <h3 className="text-white font-bold text-base mb-2">{v.titulo}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{v.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────── */}
      <section className="relative py-32 md:py-40 px-6 text-center overflow-hidden">
        <Image src="/img7.jpeg" alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-zinc-950/88" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(228,183,125,0.09) 0%, transparent 65%)" }} />

        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-[#E4B77D] text-xs font-bold tracking-[0.3em] uppercase mb-5">Pronto para o próximo passo?</p>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
            Vamos marcar<br />
            <span className="text-[#E4B77D]">seu horário?</span>
          </h2>
          <p className="text-zinc-400 mb-10 text-base leading-relaxed max-w-lg mx-auto">
            Venha tomar um café, trocar uma ideia e dar um trato no visual com a nossa equipe. Sem fila, sem espera.
          </p>
          <button
            onClick={handleAgendarClick}
            className="inline-block px-12 py-5 text-base font-extrabold bg-[#E4B77D] text-black rounded-xl hover:bg-[#cfa56d] transition-all hover:scale-105 shadow-[0_0_50px_rgba(228,183,125,0.4)]"
          >
            Agendar Meu Horário →
          </button>
        </div>
      </section>

    </div>
  );
}
