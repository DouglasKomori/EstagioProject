import Image from "next/image";
import Link from "next/link";

export default function Sobre() {
  return (
    <div className="min-h-screen w-full bg-black text-zinc-50 font-sans flex flex-col">
      
      <header className="flex items-center px-8 py-6 border-b border-zinc-900 shrink-0">
        <Link href="/" className="text-zinc-400 hover:text-[#E4B77D] transition-colors flex items-center gap-2 text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para o Início
        </Link>
      </header>

      <main className="flex-grow flex flex-col items-center py-12 px-6">
        <div className="w-full max-w-3xl">
          
          <div className="text-center mb-12">
            <Image 
              src="/logoSemFundo.png" 
              alt="Selo Victor Uematsu" 
              width={80} 
              height={80} 
              className="mx-auto mb-6 opacity-80 object-contain"
            />
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
              Nossa <span className="text-[#E4B77D]">História</span>
            </h1>
            <p className="text-lg text-zinc-400">
              Conheça a trajetória por trás da Barbearia Victor Uematsu.
            </p>
          </div>

          <div className="space-y-6 text-zinc-300 leading-relaxed text-lg text-justify md:text-left">
            <p>
              A nossa jornada começou em <strong className="text-[#E4B77D] font-bold">outubro de 2016</strong>, fundamentada na coragem e no desejo de empreender. Os primeiros passos foram desafiadores; enfrentamos dias de espera e pouca movimentação, mas cada minuto de dedicação valeu a pena. 
            </p>
            <p>
              O que começou com a alegria dos primeiros <strong className="text-white font-bold">dez clientes semanais</strong>, hoje se transformou em uma operação que realiza <strong className="text-[#E4B77D] font-bold">centenas de atendimentos</strong> todos os meses.
            </p>
            <p>
              Ao longo desses anos, investimos incansavelmente em aperfeiçoamento. Com <strong className="text-[#E4B77D] font-bold">mais de 15 especializações</strong> em técnicas de corte, gestão, marketing e inteligência emocional, unimos a experiência prática ao conhecimento técnico de ponta.
            </p>
            <p>
              Olhar para trás e ver nossa evolução é gratificante, mas o nosso olhar está no futuro: seguimos crescendo para entregar sempre <strong className="text-white font-bold">o melhor estilo e cuidado para você.</strong>
            </p>
          </div>

          <div className="mt-16 text-center border-t border-zinc-900 pt-12">
            <h2 className="text-2xl font-bold mb-6 text-white">Vamos marcar um horário?</h2>
            <Link 
              href="/agendamento" 
              className="inline-block px-8 py-4 text-lg font-bold bg-[#E4B77D] text-black rounded-md hover:bg-[#cfa56d] transition-transform hover:scale-105 shadow-lg shadow-[#E4B77D]/10"
            >
              Agendar Meu Horário
            </Link>
          </div>

        </div>
      </main>

      <footer className="w-full text-center py-6 text-xs text-zinc-600 border-t border-zinc-900 bg-black shrink-0">
        <p>© 2026 Victor Uematsu Barbearia. Todos os direitos reservados.</p>
        <p>Endereço: R. Cel. Albino, 22 - Vila Maristela, Pres. Prudente - SP, 19020-360</p>
      </footer>
      
    </div>
  );
}