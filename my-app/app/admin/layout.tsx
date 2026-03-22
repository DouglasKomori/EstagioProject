"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);

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

    setAutorizado(true);
  }, [router]);

  if (!autorizado) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-500">
        <div className="w-8 h-8 border-4 border-[#E4B77D] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Verificando credenciais de segurança...</p>
      </div>
    );
  }

  return <>{children}</>;
}