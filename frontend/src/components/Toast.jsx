import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { type = 'success', message } = toast;

  return (
    <div className="fixed bottom-20 right-5 sm:right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#201410] px-4 py-3 text-white shadow-2xl border border-[#422613] animate-in slide-in-from-bottom-5 duration-200">
      {type === 'success' ? (
        <CheckCircle2 className="h-4 w-4 text-[#C9B6A5]" />
      ) : type === 'warning' ? (
        <AlertCircle className="h-4 w-4 text-amber-400" />
      ) : (
        <Info className="h-4 w-4 text-blue-400" />
      )}
      <p className="text-xs sm:text-sm font-medium pr-2">
        {message}
      </p>
      <button
        onClick={onClose}
        className="rounded-lg p-1 text-[#C9B6A5] hover:bg-[#382823] transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
