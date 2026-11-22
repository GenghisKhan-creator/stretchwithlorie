import { Calendar, Sparkles, Lock, LogOut, ArrowLeft } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Navbar({
  isAdminRoute = false,
  onNavigateHome,
  onScrollToCatalog,
  onOpenGiftModal,
  isAdminAuthenticated = false,
  onLogoutAdmin
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E6E1D8] bg-[#F7F4EF]/95 backdrop-blur-md transition-all pt-[env(safe-area-inset-top)]">
      <div className={`mx-auto flex items-center justify-between py-3 sm:py-4 transition-all ${
        isAdminRoute
          ? 'w-full max-w-none px-3.5 sm:px-6 lg:px-8 xl:px-12 2xl:px-16'
          : 'max-w-7xl px-3.5 sm:px-6 lg:px-8'
      }`}>
        
        {/* Brand identity with official lockup placement */}
        <div
          onClick={onNavigateHome}
          className="flex cursor-pointer items-center gap-2.5 transition-opacity hover:opacity-95"
          title="stretchwithlorie - Home"
        >
          <BrandLogo variant="image" size="md" />
          {isAdminRoute && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#232D21] px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-[#F7E7C4] border border-[#C8A253]/50 shadow-2xs">
              <Lock className="h-3 w-3 text-[#C8A253]" />
              <span>Admin Portal</span>
            </span>
          )}
        </div>

        {/* Right Actions: Public Student Controls vs Dedicated Admin Route Controls */}
        {!isAdminRoute ? (
          <div className="flex items-center gap-2 sm:gap-3">
            {onOpenGiftModal && (
              <button
                type="button"
                onClick={() => onOpenGiftModal('subscription')}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#C8A253]/70 bg-gradient-to-r from-[#FAF6EE] to-[#F5ECEE] px-3 py-1.5 text-xs font-bold text-[#2B2E31] hover:border-[#C8A253] hover:shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#C8A253]" />
                <span className="hidden xs:inline">Wellness Pass & Gift</span>
                <span className="xs:hidden">Gift Pass</span>
              </button>
            )}

            <button
              type="button"
              onClick={onScrollToCatalog}
              className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-[#232D21] hover:bg-[#2F3C2C] text-[#F7E7C4] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#C8A253]" />
              <span>Book a Class</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E6E1D8] bg-white px-3 py-1.5 text-xs font-semibold text-[#2B2E31] hover:bg-[#FAF8F5] transition-colors shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-[#7A8B71]" />
              <span>Public Website</span>
            </button>

            {isAdminAuthenticated && onLogoutAdmin && (
              <button
                type="button"
                onClick={onLogoutAdmin}
                title="Lock Instructor Portal"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#A44A4A]/25 bg-white px-3 py-1.5 text-xs font-semibold text-[#A44A4A] hover:bg-[#FFF5F5] transition-colors shadow-2xs cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Lock Portal</span>
              </button>
            )}
          </div>
        )}

      </div>
    </header>
  );
}
