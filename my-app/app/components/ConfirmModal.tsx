import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  titulo: string;
  mensagem: string;
  onConfirm: () => void;
  onCancel: () => void;
  tipo?: "atencao" | "perigo"; // Muda a cor do ícone e do botão se for algo destrutivo (ex: excluir)
}

export default function ConfirmModal({ isOpen, titulo, mensagem, onConfirm, onCancel, tipo = "atencao" }: ConfirmModalProps) {
  if (!isOpen) return null;

  const isPerigo = tipo === "perigo";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 text-center">
        
        {/* Ícone Dinâmico */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isPerigo ? 'bg-red-500/10 text-red-500' : 'bg-[#E4B77D]/10 text-[#E4B77D]'}`}>
          {isPerigo ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        <h2 className="text-xl font-bold text-white mb-2">{titulo}</h2>
        <p className="text-zinc-400 text-sm mb-6">{mensagem}</p>

        <div className="flex gap-3">
          <button 
            onClick={onCancel} 
            className="flex-1 py-3 border border-zinc-700 text-zinc-300 font-bold rounded-xl hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            className={`flex-1 py-3 font-black rounded-xl transition-all text-white ${isPerigo ? 'bg-red-500 hover:bg-red-600' : 'bg-[#E4B77D] text-black hover:bg-[#cfa56d]'}`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}