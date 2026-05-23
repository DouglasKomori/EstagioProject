"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { io as socketIo, Socket } from "socket.io-client";
import Link from "next/link";
import Image from "next/image";

export default function MinhaComanda() {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [comanda, setComanda] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [usuarioNome, setUsuarioNome] = useState("");

  // Modal PIX
  const [modalPixAberto, setModalPixAberto] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [pixCopiaECola, setPixCopiaECola] = useState("");
  const [carregandoQr, setCarregandoQr] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const obterToken = () => localStorage.getItem("token") || "";

  const calcularTotal = (c: any) => {
    if (!c) return 0;
    const s = (c.servicos || []).reduce((a: number, s: any) => a + Number(s.valorCobrado), 0);
    const p = (c.produtos || []).reduce((a: number, p: any) => a + Number(p.valorCobrado) * Number(p.quantidade), 0);
    return s + p;
  };

  const fmt = (v: number) =>
    Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Busca a comanda aberta do cliente
  const buscarComanda = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comandas/minha`, {
        headers: { Authorization: `Bearer ${obterToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  // Conecta ao Socket.io e entra na sala da comanda
  const conectarSocket = useCallback((comandaId: number) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = socketIo(process.env.NEXT_PUBLIC_API_URL!, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      socket.emit("join-comanda", comandaId);
    });

    socket.on("comanda-atualizada", (dados: any) => {
      setComanda(dados);
    });

    socketRef.current = socket;
  }, []);

  // Inicialização
  useEffect(() => {
    const usuarioStr = localStorage.getItem("usuario");
    if (!usuarioStr || !obterToken()) {
      router.push("/login");
      return;
    }
    const usuario = JSON.parse(usuarioStr);
    setUsuarioNome(usuario.nome?.split(" ")[0] || "");

    const init = async () => {
      setCarregando(true);
      const dados = await buscarComanda();
      setCarregando(false);

      if (dados) {
        setComanda(dados);
        conectarSocket(dados.id);
      } else {
        // Sem comanda: poll a cada 5s até abrir uma
        pollingRef.current = setInterval(async () => {
          const novo = await buscarComanda();
          if (novo) {
            setComanda(novo);
            conectarSocket(novo.id);
            clearInterval(pollingRef.current!);
            pollingRef.current = null;
          }
        }, 5000);
      }
    };

    init();

    return () => {
      socketRef.current?.disconnect();
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const abrirModalPix = async () => {
    const total = calcularTotal(comanda);
    if (total <= 0) return;
    setModalPixAberto(true);
    setCarregandoQr(true);
    setQrCode("");
    setPixCopiaECola("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pix/qrcode?valor=${total.toFixed(2)}`,
        { headers: { Authorization: `Bearer ${obterToken()}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setQrCode(data.qrCode);
        setPixCopiaECola(data.payload);
      }
    } catch {
      // erro silencioso — o modal mostra o estado de erro
    } finally {
      setCarregandoQr(false);
    }
  };

  const copiarPix = async () => {
    if (!pixCopiaECola) return;
    await navigator.clipboard.writeText(pixCopiaECola);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const total = calcularTotal(comanda);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-zinc-950">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#E4B77D]/40 to-transparent" />
        <div className="max-w-2xl mx-auto px-5 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image src="/logoSemFundo.png" alt="Logo" width={44} height={44} className="object-contain" />
            <div>
              <p className="text-[#E4B77D] text-[10px] font-bold tracking-[0.3em] uppercase">Minha Comanda</p>
              <p className="text-white font-bold text-lg leading-tight">
                {usuarioNome ? `Olá, ${usuarioNome}` : "Barbearia Victor Uematsu"}
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors border border-zinc-800 px-3 py-1.5 rounded-lg"
          >
            ← Voltar
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8">
        {/* Loading inicial */}
        {carregando && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-4 border-[#E4B77D] border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-500 text-sm">Buscando sua comanda...</p>
          </div>
        )}

        {/* Sem comanda aberta */}
        {!carregando && !comanda && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-5">
            <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-zinc-600">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Aguardando atendimento</h2>
              <p className="text-zinc-500 text-sm max-w-xs">
                Assim que o barbeiro abrir sua ficha, ela aparecerá aqui automaticamente.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Verificando a cada 5 segundos...
            </div>
          </div>
        )}

        {/* Comanda aberta */}
        {!carregando && comanda && (
          <div className="flex flex-col gap-6">

            {/* Cabeçalho da comanda */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Ficha</p>
                <p className="text-5xl font-black text-[#E4B77D]">{comanda.numero_comanda}</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-900/50 px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Em atendimento
                </span>
                <p className="text-xs text-zinc-600 mt-2">
                  Atualiza automaticamente
                </p>
              </div>
            </div>

            {/* Extrato */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Extrato de Consumo</p>
              </div>

              {comanda.servicos.length === 0 && comanda.produtos.length === 0 ? (
                <div className="px-5 py-10 text-center text-zinc-600 text-sm italic">
                  Nenhum item lançado ainda...
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/50">
                  {comanda.servicos.map((s: any) => (
                    <div key={`s-${s.id}`} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <p className="text-white font-medium text-sm">{s.servicoNome}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">por {s.profissionalNome}</p>
                      </div>
                      <span className="text-zinc-300 font-mono text-sm font-semibold">
                        {fmt(s.valorCobrado)}
                      </span>
                    </div>
                  ))}
                  {comanda.produtos.map((p: any) => (
                    <div key={`p-${p.id}`} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <p className="text-white font-medium text-sm">{p.produtoNome}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{p.quantidade}x</p>
                      </div>
                      <span className="text-zinc-300 font-mono text-sm font-semibold">
                        {fmt(Number(p.valorCobrado) * Number(p.quantidade))}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="px-5 py-4 border-t border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
                <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Total</span>
                <span className="text-3xl font-black text-[#E4B77D]">{fmt(total)}</span>
              </div>
            </div>

            {/* Botão PIX */}
            {total > 0 && (
              <button
                onClick={abrirModalPix}
                className="w-full py-5 bg-[#E4B77D] text-black font-extrabold rounded-2xl hover:bg-[#cfa56d] transition-all hover:scale-[1.02] shadow-xl shadow-[#E4B77D]/15 text-lg flex items-center justify-center gap-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                Pagar com PIX — {fmt(total)}
              </button>
            )}

            <p className="text-center text-xs text-zinc-600">
              O barbeiro fechará a ficha após confirmar o pagamento.
            </p>
          </div>
        )}
      </main>

      {/* Modal QR Code PIX */}
      {modalPixAberto && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setModalPixAberto(false)} />
          <div className="relative bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm p-6 shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">

            {/* Puxador mobile */}
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-5 sm:hidden" />

            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-white">Pagar com PIX</h2>
                <p className="text-[#E4B77D] font-black text-2xl mt-0.5">{fmt(total)}</p>
              </div>
              <button onClick={() => setModalPixAberto(false)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {carregandoQr ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="w-10 h-10 border-4 border-[#E4B77D] border-t-transparent rounded-full animate-spin" />
                <p className="text-zinc-500 text-sm">Gerando QR Code...</p>
              </div>
            ) : qrCode ? (
              <div className="flex flex-col items-center gap-5">
                {/* QR Code */}
                <div className="bg-white p-3 rounded-2xl">
                  <img src={qrCode} alt="QR Code PIX" width={240} height={240} className="block" />
                </div>

                <p className="text-zinc-500 text-xs text-center">
                  Aponte a câmera do seu app de banco para o QR Code acima
                </p>

                {/* Separador */}
                <div className="w-full flex items-center gap-3">
                  <div className="flex-1 h-px bg-zinc-800" />
                  <span className="text-zinc-600 text-xs">ou</span>
                  <div className="flex-1 h-px bg-zinc-800" />
                </div>

                {/* Copia e cola */}
                <button
                  onClick={copiarPix}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all border flex items-center justify-center gap-2 ${
                    copiado
                      ? "bg-emerald-950/50 border-emerald-900/50 text-emerald-400"
                      : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:text-white"
                  }`}
                >
                  {copiado ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Copiado!
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copiar código Pix
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-6">
                <p className="text-zinc-500 text-sm text-center">Não foi possível gerar o QR Code.</p>
                <button
                  onClick={abrirModalPix}
                  className="px-5 py-2.5 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-xl font-bold text-sm hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
