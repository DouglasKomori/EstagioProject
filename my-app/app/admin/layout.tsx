"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const MENU = [
  {
    secao: "Operacional",
    itens: [
      {
        href: "/",
        label: "Início / Dashboard",
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        ),
      },
      {
        href: "/admin/caixa",
        label: "Fluxo de Caixa",
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        ),
      },
      {
        href: "/admin/agenda",
        label: "Agenda de Hoje",
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        ),
      },
      {
        href: "/admin/disponibilidade",
        label: "Escala de Trabalho",
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        ),
      },
      {
        href: "/admin/bloqueios",
        label: "Bloqueios / Folgas",
        danger: true,
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        ),
      },
    ],
  },
  {
    secao: "Cadastros",
    itens: [
      {
        href: "/admin/servicos",
        label: "Serviços",
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
        ),
      },
      {
        href: "/admin/marcas",
        label: "Marcas",
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        ),
      },
      {
        href: "/admin/produtos",
        label: "Produtos",
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        ),
      },
      {
        href: "/admin/clientes",
        label: "Clientes",
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        ),
      },
      {
        href: "/admin/pessoas",
        label: "Pessoas",
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        ),
      },
      {
        href: "/admin/comandas",
        label: "Comandas",
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        ),
      },
    ],
  },
  {
    secao: "Relatórios",
    itens: [
      {
        href: "/admin/relatorio-agenda",
        label: "Emissão de Agenda",
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        ),
      },
      {
        href: "/admin/relatorio-produtos",
        label: "Relatório de Estoque",
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        ),
      },
      {
        href: "/admin/relatorio-servicos",
        label: "Relatório de Serviços",
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        ),
      },
    ],
  },
];

const SECAO_COR: Record<string, string> = {
  Operacional: "text-sky-500",
  Cadastros:   "text-violet-400",
  Relatórios:  "text-[#E4B77D]",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();

  const [autorizado,    setAutorizado]    = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  const [menuAberto,    setMenuAberto]    = useState(false);

  useEffect(() => {
    const token         = localStorage.getItem("token");
    const usuarioString = localStorage.getItem("usuario");
    if (!token || !usuarioString) { router.push("/login"); return; }
    const usuario = JSON.parse(usuarioString);
    if (usuario.perfil === "CLIENTE" || !usuario.perfil) { router.push("/"); return; }
    setUsuarioLogado(usuario);
    setAutorizado(true);
  }, [router]);

  useEffect(() => { setMenuAberto(false); }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    router.push("/login");
  };

  const isAtivo = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  if (!autorizado) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-500">
        <div className="w-8 h-8 border-4 border-[#E4B77D] border-t-transparent rounded-full animate-spin mb-4" />
        <p>Verificando credenciais de segurança...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-50 font-sans flex flex-col overflow-x-hidden relative">

      {/* Overlay */}
      {menuAberto && (
        <div
          className="fixed inset-0 bg-black/70 z-40 transition-opacity backdrop-blur-sm"
          onClick={() => setMenuAberto(false)}
        />
      )}

      {/* Menu lateral */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-zinc-950 border-r border-zinc-900 z-50
        transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col
        ${menuAberto ? "translate-x-0" : "-translate-x-full"}`}>

        {/* Cabeçalho do menu */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-zinc-900 shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Ícone de tesoura — identidade da barbearia */}
            <div className="w-8 h-8 rounded-lg bg-[#E4B77D]/10 border border-[#E4B77D]/20
              flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
                viewBox="0 0 24 24" stroke="#E4B77D" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Victor Uematsu</p>
              <p className="text-zinc-500 text-[11px] leading-tight">Painel Admin</p>
            </div>
          </div>
          <button onClick={() => setMenuAberto(false)}
            className="text-zinc-600 hover:text-zinc-300 transition-colors p-1.5 rounded-md hover:bg-zinc-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navegação com seções */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {MENU.map(({ secao, itens }) => (
            <div key={secao}>

              {/* Rótulo de seção */}
              <div className="flex items-center gap-2 px-2 mb-2">
                <span className={`text-[10px] font-black uppercase tracking-[0.12em] ${SECAO_COR[secao]}`}>
                  {secao}
                </span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>

              {/* Itens da seção */}
              <div className="space-y-0.5">
                {itens.map(({ href, label, icon, danger }) => {
                  const ativo = isAtivo(href);
                  return (
                    <Link key={href} href={href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                        transition-all duration-150 group relative
                        ${danger
                          ? ativo
                            ? "bg-red-950/40 text-red-400 border border-red-900/60"
                            : "text-red-500/70 hover:bg-red-950/20 hover:text-red-400"
                          : ativo
                            ? "bg-[#E4B77D]/10 text-[#E4B77D] border border-[#E4B77D]/20"
                            : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                        }`}>

                      {/* Indicador lateral do item ativo */}
                      {ativo && !danger && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5
                          bg-[#E4B77D] rounded-r-full" />
                      )}

                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor"
                        className={`shrink-0 transition-colors ${
                          danger
                            ? ativo ? "text-red-400" : "text-red-600 group-hover:text-red-400"
                            : ativo ? "text-[#E4B77D]" : "text-zinc-600 group-hover:text-zinc-300"
                        }`}>
                        {icon}
                      </svg>

                      <span className="truncate">{label}</span>

                      {/* Ponto dourado à direita quando ativo */}
                      {ativo && !danger && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#E4B77D] shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Rodapé do menu — info do usuário + logout */}
        <div className="border-t border-zinc-900 p-4 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#E4B77D]/15 border border-[#E4B77D]/25
              flex items-center justify-center text-[#E4B77D] font-bold text-sm shrink-0">
              {usuarioLogado?.nome?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate leading-tight">
                {usuarioLogado?.nome?.split(" ")[0]}
              </p>
              <p className="text-zinc-500 text-[11px] truncate leading-tight">
                {usuarioLogado?.perfil}
              </p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
              bg-red-950/30 text-red-500 text-sm font-bold border border-red-900/40
              hover:bg-red-900/40 hover:text-red-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair da conta
          </button>
          <p className="text-center text-[10px] text-zinc-700 mt-3">
            © 2026 Victor Uematsu Barbearia
          </p>
        </div>

      </div>

      {/* ── Topbar ───────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-zinc-900
        shrink-0 sticky top-0 bg-black/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-4">
          <button onClick={() => setMenuAberto(true)}
            className="text-zinc-400 hover:text-[#E4B77D] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-[#E4B77D] hidden md:block">Painel Gerencial</h1>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/admin/perfil"
            className="text-sm text-zinc-400 hidden sm:flex items-center gap-1
              hover:text-white transition-colors group cursor-pointer">
            Olá,{" "}
            <strong className="text-[#E4B77D] font-bold group-hover:underline
              underline-offset-4 decoration-[#E4B77D]">
              {usuarioLogado?.nome.split(" ")[0]}
            </strong>
          </Link>

          <button onClick={handleLogout}
            className="px-4 py-2 text-sm font-bold bg-red-950/50 text-red-500 rounded-md
              hover:bg-red-900 hover:text-red-100 transition-colors border border-red-900/50">
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