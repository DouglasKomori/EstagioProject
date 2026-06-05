"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [menuAberto, setMenuAberto] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);

  // Carrega o usuário logado e atualiza sempre que mudar de tela
  useEffect(() => {
    const usuarioString = localStorage.getItem("usuario");
    if (usuarioString) {
      setUsuarioLogado(JSON.parse(usuarioString));
    } else {
      setUsuarioLogado(null);
    }
  }, [pathname]);

  // Fecha o menu lateral automaticamente quando o cliente clica em um link
  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuarioLogado(null);
    router.push("/login");
  };

  const whatsappNumber = "5518981947357"; 
  const whatsappMessage = "Olá! Gostaria de tirar uma dúvida sobre a Barbearia Victor Uematsu.";

  // A MÁGICA DE SEGURANÇA: Se a URL for do Admin, este layout de cliente se desativa sozinho!
  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-full bg-black text-zinc-50 font-sans flex flex-col overflow-x-hidden relative scroll-smooth">
      
      {/* 1. OVERLAY (Fundo escuro quando o menu abre) */}
      {menuAberto && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 transition-opacity backdrop-blur-sm"
          onClick={() => setMenuAberto(false)}
        />
      )}

      {/* 2. MENU LATERAL GLOBAL (Hambúrguer) */}
      <div 
        className={`fixed top-0 left-0 h-full w-72 bg-zinc-950 border-r border-zinc-900 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${
          menuAberto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          
          {/* Cabeçalho do Menu Lateral */}
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-900">
            <span className="text-[#E4B77D] font-bold tracking-widest text-sm uppercase">Menu</span>
            <button 
              onClick={() => setMenuAberto(false)}
              className="text-zinc-500 hover:text-[#E4B77D] transition-colors p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Links do Menu */}
          <nav className="flex flex-col gap-2">
            <Link href="/servicos" className="flex items-center gap-4 px-4 py-3 rounded-lg text-zinc-300 hover:text-[#E4B77D] hover:bg-zinc-900/50 transition-all group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-500 group-hover:text-[#E4B77D] transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
              </svg>
              <span className="font-medium">Serviços e Preços</span>
            </Link>

            <Link href="/sobre" className="flex items-center gap-4 px-4 py-3 rounded-lg text-zinc-300 hover:text-[#E4B77D] hover:bg-zinc-900/50 transition-all group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-500 group-hover:text-[#E4B77D] transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Nossa História</span>
            </Link>

            <Link href="/espaco-interno" className="flex items-center gap-4 px-4 py-3 rounded-lg text-zinc-300 hover:text-[#E4B77D] hover:bg-zinc-900/50 transition-all group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-500 group-hover:text-[#E4B77D] transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Espaço Interno</span>
            </Link>

            <Link href="/#como-chegar" className="flex items-center gap-4 px-4 py-3 rounded-lg text-zinc-300 hover:text-[#E4B77D] hover:bg-zinc-900/50 transition-all group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-500 group-hover:text-[#E4B77D] transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">Como Chegar</span>
            </Link>

            <div className="h-px w-full bg-zinc-900 my-4"></div>

            <Link href={usuarioLogado ? "/agendamento" : "/login?returnUrl=/agendamento"} className="flex items-center gap-4 px-4 py-3 rounded-lg text-zinc-300 hover:text-[#E4B77D] hover:bg-zinc-900/50 transition-all group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-500 group-hover:text-[#E4B77D] transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Meus Agendamentos</span>
            </Link>

            {/* Minha Comanda — visível apenas para CLIENTE logado */}
            {usuarioLogado?.perfil === "CLIENTE" && (
              <Link href="/minha-comanda" className="flex items-center gap-4 px-4 py-3 rounded-lg text-zinc-300 hover:text-[#E4B77D] hover:bg-zinc-900/50 transition-all group">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-500 group-hover:text-[#E4B77D] transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span className="font-medium">Minha Comanda</span>
              </Link>
            )}

            {/* Opção Exclusiva para o ADMIN/FUNCIONARIO */}
            {(usuarioLogado?.perfil === "ADMIN" || usuarioLogado?.perfil === "FUNCIONARIO") && (
              <Link href="/admin" className="flex items-center gap-4 px-4 py-3 mt-2 rounded-lg border border-amber-900/30 bg-amber-950/20 text-amber-500 hover:bg-amber-900/40 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-bold">Painel do Barbeiro</span>
              </Link>
            )}

          </nav>

          <div className="mt-auto pt-8 border-t border-zinc-900 text-sm text-zinc-500 text-center">
            <p>Desde 2016</p>
          </div>
        </div>
      </div>

      {/* 3. CABEÇALHO GLOBAL DO CLIENTE */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-zinc-900 shrink-0 sticky top-0 bg-black/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMenuAberto(true)}
            className="text-zinc-300 hover:text-[#E4B77D] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {usuarioLogado ? (
          <div className="flex items-center gap-4">
            
            <span className="text-sm text-zinc-400 hidden sm:block">
              Olá, <strong className="text-[#E4B77D] font-medium">{usuarioLogado?.nome?.split(" ")[0] ?? ""}</strong>
            </span>

            <Link
              href={usuarioLogado.perfil !== "CLIENTE" ? "/admin" : "/agendamento"}
              className="px-4 py-2 text-sm font-bold bg-[#E4B77D] text-black rounded-md hover:bg-[#cfa56d] transition-colors"
            >
              {usuarioLogado.perfil !== "CLIENTE" ? "Meu Painel" : "Meus Agendamentos"}
            </Link>
            {usuarioLogado.perfil === "CLIENTE" && (
              <Link
                href="/minha-comanda"
                className="px-4 py-2 text-sm font-bold border border-[#E4B77D] text-[#E4B77D] rounded-md hover:bg-[#E4B77D] hover:text-black transition-colors"
              >
                Minha Comanda
              </Link>
            )}
            <button 
              onClick={handleLogout} 
              className="px-3 py-2 text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
            >
              Sair
            </button>
          </div>
        ) : (
          <nav className="flex gap-4">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-[#E4B77D] transition-colors">
              Entrar
            </Link>
            <Link href="/cadastro" className="px-4 py-2 text-sm font-bold bg-[#E4B77D] text-black rounded-md hover:bg-[#cfa56d] transition-colors">
              Cadastrar
            </Link>
          </nav>
        )}
      </header>

      {/* 4. CONTEÚDO DINÂMICO (Páginas renderizam aqui) */}
      <main className="flex-grow flex flex-col">
        {children}
      </main>

      {/* 5. RODAPÉ E WHATSAPP GLOBAIS */}
      <footer className="w-full text-center py-6 text-xs text-zinc-600 border-t border-zinc-900 bg-black shrink-0 relative z-20">
        <p>© 2026 Victor Uematsu Barbearia.</p>
        <p className="mt-1">Presidente Prudente - SP</p>
      </footer>

      <a 
        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 w-14 h-14 md:w-16 md:h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:scale-110 hover:shadow-[0_0_30px_rgba(37,211,102,0.6)] transition-all duration-300 z-40 group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.405-.883-.733-1.48-1.64-1.653-1.938-.173-.298-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>

    </div>
  );
}