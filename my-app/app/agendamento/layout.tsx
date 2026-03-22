"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AgendamentoLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login"); 
      return;
    }

    setAutorizado(true);
  }, [router]);

  if (!autorizado) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-500 font-sans">
        <div className="w-8 h-8 border-4 border-[#E4B77D] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Preparando a agenda...</p>
      </div>
    );
  }

  return <>{children}</>;
}