"use client";
import { useState } from "react";

interface MovimentacaoModalProps {
  produto: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MovimentacaoEstoqueModal({ produto, onClose, onSuccess }: MovimentacaoModalProps) {
  const [tipo, setTipo] = useState<"ENTRADA" | "SAIDA">("ENTRADA");
  const [quantidade, setQuantidade] = useState("");
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/estoque`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          produtoId: produto.id,
          tipo,
          quantidade: Number(quantidade),
          motivo,
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const error = await res.json();
        setErro(error.msg || "Erro ao atualizar estoque.");
      }
    } catch (err) {
      setErro("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
        <h2 className="text-2xl font-bold text-white mb-2">Ajustar Estoque</h2>
        <p className="text-zinc-400 text-sm mb-6">
          Produto: <span className="text-[#E4B77D] font-bold">{produto.nome}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {erro && (
            <div className="bg-red-950/50 border border-red-900/70 text-red-400 text-sm p-3 rounded-xl flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              {erro}
            </div>
          )}
          {/* Toggle de Tipo */}
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setTipo("ENTRADA")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                tipo === "ENTRADA" ? "bg-emerald-500 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              ENTRADA (+)
            </button>
            <button
              type="button"
              onClick={() => setTipo("SAIDA")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                tipo === "SAIDA" ? "bg-red-500 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              SAÍDA (-)
            </button>
          </div>

          <div>
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Quantidade</label>
            <input
              type="number"
              required
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-[#E4B77D] transition-colors"
              placeholder="Ex: 5"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Motivo / Observação</label>
            <textarea
              required
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-[#E4B77D] transition-colors h-24 resize-none"
              placeholder="Ex: Compra com fornecedor ou Produto quebrado."
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-zinc-500 font-bold hover:text-white transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-[2] py-4 rounded-2xl font-black transition-all ${
                tipo === "ENTRADA" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
              } text-white shadow-lg`}
            >
              {loading ? "Processando..." : `Confirmar ${tipo === "ENTRADA" ? "Entrada" : "Saída"}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}