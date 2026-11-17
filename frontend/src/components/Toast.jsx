import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { type = 'success', message } = toast;

  return (
    <div className="fixed top-16 right-3 sm:top-20 sm:right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#2B2E31] px-4 py-3 text-white shadow-2xl border border-[#3E4348] animate-in slide-in-from-top-3 duration-200 max-w-[92vw]">
      {type === 'success' ? (
        <CheckCircle2 className="h-4 w-4 text-[#7A8B71]" />
      ) : type === 'warning' ? (
        <AlertCircle className="h-4 w-4 text-amber-400" />
      ) : (
        <Info className="h-4 w-4 text-blue-400" />
      )}
      <p className="text-xs sm:text-sm font-medium pr-2 text-[#F7F4EF]">
        {message}
      </p>
      <button
        onClick={onClose}
        className="rounded-lg p-1 text-[#EAD3D5] hover:bg-white/10 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
