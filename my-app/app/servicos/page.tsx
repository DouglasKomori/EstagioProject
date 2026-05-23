"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Servico {
  id: number;
  nome: string;
  descricao: string;
  valor: number;
  tempoEstimadoMinutos: number;
}

function IconTesoura() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="text-[#E4B77D]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-zinc-500">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/servicos/publico`)
      .then(res => {
        if (!res.ok) throw new Error("Falha ao carregar serviços");
        return res.json();
      })
      .then(data => setServicos(data))
      .catch(() => setErro("Não foi possível carregar os serviços. Tente novamente mais tarde."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(228,183,125,0.08) 0%, transparent 65%)"
        }} />
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#E4B77D] mb-4">Barbearia Victor Uematsu</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Nossos Serviços</h1>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto">
          Conheça todos os cortes e tratamentos disponíveis. Agende agora e garanta seu horário.
        </p>
        <div className="mt-8">
          <Link
            href="/agendamento"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#E4B77D] text-black font-bold rounded-lg hover:bg-[#cfa56d] transition-colors text-sm"
          >
            Agendar Agora
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Divisor */}
      <div className="h-px max-w-4xl mx-auto bg-gradient-to-r from-transparent via-zinc-800 to-transparent mb-16" />

      {/* Lista de serviços */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-2/3 mb-3" />
                <div className="h-3 bg-zinc-800 rounded w-full mb-2" />
                <div className="h-3 bg-zinc-800 rounded w-4/5" />
                <div className="h-6 bg-zinc-800 rounded w-1/4 mt-5" />
              </div>
            ))}
          </div>
        ) : erro ? (
          <div className="text-center py-20 text-zinc-500">
            <p>{erro}</p>
          </div>
        ) : servicos.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <p>Nenhum serviço disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {servicos.map((serv, i) => (
              <div
                key={serv.id}
                className="relative bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 group hover:border-zinc-700 hover:bg-zinc-900/80 transition-all duration-300 overflow-hidden"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Glow no hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at top left, rgba(228,183,125,0.05) 0%, transparent 60%)" }} />

                {/* Linha dourada lateral */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl bg-gradient-to-b from-[#E4B77D]/60 via-[#E4B77D]/20 to-transparent" />

                <div className="pl-3 flex flex-col h-full gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                        <IconTesoura />
                      </div>
                      <h3 className="font-bold text-white text-base leading-tight">{serv.nome}</h3>
                    </div>
                    <span className="text-[#E4B77D] font-bold text-lg shrink-0">
                      R$ {Number(serv.valor).toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <p className="text-zinc-400 text-sm leading-relaxed">{serv.descricao}</p>

                  <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-zinc-800/60">
                    <IconClock />
                    <span className="text-xs text-zinc-500">
                      Duração estimada: <strong className="text-zinc-400">{serv.tempoEstimadoMinutos} min</strong>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA final */}
        {!loading && !erro && servicos.length > 0 && (
          <div className="mt-16 text-center">
            <div className="inline-block border border-zinc-800 rounded-2xl px-10 py-8 bg-zinc-900/40">
              <p className="text-zinc-300 text-base font-medium mb-1">Pronto para marcar?</p>
              <p className="text-zinc-500 text-sm mb-6">Agende online em menos de 1 minuto.</p>
              <Link
                href="/agendamento"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#E4B77D] text-black font-bold rounded-lg hover:bg-[#cfa56d] transition-colors text-sm"
              >
                Fazer Agendamento
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
