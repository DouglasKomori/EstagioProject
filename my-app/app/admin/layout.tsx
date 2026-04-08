"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); 
  
  const [autorizado, setAutorizado] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuarioString = localStorage.getItem("usuario");

    if (!token || !usuarioString) {
      router.push("/login"); 
      return;
    }

    const usuario = JSON.parse(usuarioString);
    
    if (usuario.perfil === "CLIENTE" || !usuario.perfil) {
      router.push("/"); 
      return;
    }

    setUsuarioLogado(usuario);
    setAutorizado(true);
  }, [router]);

  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    router.push("/login");
  };

  if (!autorizado) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-500">
        <div className="w-8 h-8 border-4 border-[#E4B77D] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Verificando credenciais de segurança...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-50 font-sans flex flex-col overflow-x-hidden relative">
      
      {/* 1. OVERLAY ESCURO */}
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
        <div className="p-6 flex flex-col h-full overflow-y-auto custom-scrollbar">
          
          {/* Cabeçalho do Menu Lateral */}
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-900 shrink-0">
            <span className="text-[#E4B77D] font-bold tracking-widest text-sm uppercase">Painel Admin</span>
            <button 
              onClick={() => setMenuAberto(false)}
              className="text-zinc-500 hover:text-[#E4B77D] transition-colors p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Links do Menu (Reordenados) */}
          <nav className="flex flex-col gap-2">
            
            <Link href="/" className="flex items-center gap-4 px-4 py-3 rounded-lg text-zinc-300 hover:text-[#E4B77D] hover:bg-zinc-900/50 transition-all group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-500 group-hover:text-[#E4B77D] transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">Início / Dashboard</span>
            </Link>

            <div className="h-px w-full bg-zinc-900/50 my-1"></div>

            {/* 1. Agenda */}
            <Link href="/admin/agenda" className="flex items-center gap-4 px-4 py-3 rounded-lg text-zinc-300 hover:text-[#E4B77D] hover:bg-zinc-900/50 transition-all group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-500 group-hover:text-[#E4B77D] transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Agenda de Hoje</span>
            </Link>

            {/* 2. Disponibilidade */}
            <Link href="/admin/disponibilidade" className="flex items-center gap-4 px-4 py-3 rounded-lg text-zinc-300 hover:text-[#E4B77D] hover:bg-zinc-900/50 transition-all group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-500 group-hover:text-[#E4B77D] transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Escala de Trabalho</span>
            </Link>

            {/* 3. Bloqueios */}
            <Link href="/admin/bloqueios" className="flex items-center gap-4 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-red-500 group-hover:text-red-400 transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="font-medium">Bloqueios / Folgas</span>
            </Link>

            <div className="h-px w-full bg-zinc-900/50 my-1"></div>

            {/* 4. Serviços */}
            <Link href="/admin/servicos" className="flex items-center gap-4 px-4 py-3 rounded-lg text-zinc-300 hover:text-[#E4B77D] hover:bg-zinc-900/50 transition-all group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-500 group-hover:text-[#E4B77D] transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
              <span className="font-medium">Serviços</span>
            </Link>

            {/* 5. Marcas */}
            <Link href="/admin/marcas" className="flex items-center gap-4 px-4 py-3 rounded-lg text-zinc-300 hover:text-[#E4B77D] hover:bg-zinc-900/50 transition-all group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-500 group-hover:text-[#E4B77D] transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="font-medium">Marcas</span>
            </Link>

            {/* 6. Produtos */}
            <Link href="/admin/produtos" className="flex items-center gap-4 px-4 py-3 rounded-lg text-zinc-300 hover:text-[#E4B77D] hover:bg-zinc-900/50 transition-all group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-500 group-hover:text-[#E4B77D] transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="font-medium">Produtos</span>
            </Link>

            <div className="h-px w-full bg-zinc-900/50 my-1"></div>

            {/* 7. Clientes */}
            <Link href="/admin/clientes" className="flex items-center gap-4 px-4 py-3 rounded-lg text-zinc-300 hover:text-[#E4B77D] hover:bg-zinc-900/50 transition-all group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-500 group-hover:text-[#E4B77D] transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="font-medium">Clientes</span>
            </Link>

            {/* 8. Pessoas */}
            <Link href="/admin/pessoas" className="flex items-center gap-4 px-4 py-3 rounded-lg text-zinc-300 hover:text-[#E4B77D] hover:bg-zinc-900/50 transition-all group">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-500 group-hover:text-[#E4B77D] transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              <span className="font-medium">Pessoas</span>
            </Link>

          </nav>

          <div className="mt-8 pt-6 border-t border-zinc-900 shrink-0 text-sm text-zinc-500 text-center">
            <p>© 2026 Victor Uematsu Barbearia</p>
          </div>
        </div>
      </div>

      <header className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-zinc-900 shrink-0 sticky top-0 bg-black/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-4">
          <button onClick={() => setMenuAberto(true)} className="text-zinc-300 hover:text-[#E4B77D] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#E4B77D] hidden md:block">Painel Gerencial</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400 hidden sm:block">
            Olá, <strong className="text-[#E4B77D] font-medium">{usuarioLogado?.nome.split(" ")[0]}</strong>
          </span>
          <button onClick={handleLogout} className="px-4 py-2 text-sm font-bold bg-red-950/50 text-red-500 rounded-md hover:bg-red-900 hover:text-red-100 transition-colors border border-red-900/50">
            Sair
          </button>
        </div>
      </header>

      <div className="flex-1 w-full relative">
        {children}
      </div>

    </div>
  );
}