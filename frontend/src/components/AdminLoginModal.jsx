import { useState, useRef, useEffect } from 'react';
import { Lock, Eye, EyeOff, Sparkles, X, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import lorieAvatar from '../assets/lorie_avatar.jpg';

export default function AdminLoginModal({ isOpen, inline = false, onClose, onSuccess }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter your admin password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await api.loginAdmin(password.trim(), rememberMe);
      setIsLoading(false);
      onSuccess(res.user);
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Incorrect admin password.');
    }
  };

  const cardContent = (
    <div className="relative w-full max-w-md rounded-3xl bg-[#FAF8F5] text-[#2B2E31] border border-[#E6E1D8] shadow-2xl overflow-hidden mx-auto my-auto animate-scale-up">
      {/* Header with Botanical Gradient */}
      <div className="bg-gradient-to-r from-[#1E261D] via-[#2A3728] to-[#1C231A] p-5 sm:p-6 text-white border-b border-[#C8A253]/35 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={lorieAvatar}
              alt="Lorie"
              className="h-12 w-12 rounded-2xl object-cover border-2 border-[#C8A253]/60 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#C8A253] text-[#1E261D] shadow-xs">
              <Lock className="h-3 w-3" />
            </span>
          </div>

          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#C8A253]/25 border border-[#C8A253]/50 px-2.5 py-0.5 text-[10px] font-bold text-[#F7E7C4]">
              <Sparkles className="h-3 w-3 text-[#C8A253]" />
              Dedicated Admin Route (/admin)
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#F7F4EF] mt-0.5">
              Lorie’s Portal Access
            </h3>
            <p className="text-xs text-[#E6E1D8]/80">
              Password protected for instructor and admin management
            </p>
          </div>
        </div>

        {!inline && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 hover:bg-white/20 p-1.5 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Login Form Body */}
      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#2B2E31] mb-1.5">
            Admin Password
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter password to unlock..."
              className="w-full rounded-xl border border-[#E6E1D8] bg-white px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-[#2B2E31] outline-none transition-colors focus:border-[#7A8B71] focus:ring-2 focus:ring-[#7A8B71]/20 font-sans"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#5C6260] hover:text-[#2B2E31] transition-colors"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#A44A4A]">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between text-xs text-[#5C6260] pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-[#E6E1D8] text-[#232D21] focus:ring-[#7A8B71]"
            />
            <span>Remember on this device</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex items-center justify-end gap-2.5">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E6E1D8] text-xs font-semibold text-[#5C6260] hover:bg-white transition-colors cursor-pointer"
            >
              {inline && <ArrowLeft className="h-3.5 w-3.5" />}
              <span>{inline ? 'Public Site' : 'Cancel'}</span>
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#232D21] hover:bg-[#2F3C2C] text-[#F7E7C4] px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-75"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#F7E7C4] border-t-transparent" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 text-[#C8A253]" />
                <span>Unlock Portal</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  if (inline) {
    return <div className="py-8 sm:py-16 flex items-center justify-center">{cardContent}</div>;
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
      className="fixed inset-0 z-50 overflow-hidden bg-[#121712]/80 backdrop-blur-md p-3 sm:p-5 flex items-center justify-center animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      {cardContent}
    </div>
  );
}
