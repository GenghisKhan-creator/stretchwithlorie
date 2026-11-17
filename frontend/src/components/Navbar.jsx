import { Calendar, LayoutDashboard, RefreshCw } from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Navbar({ activeTab, setActiveTab, totalBookings, onResetData }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E6E1D8] bg-[#F7F4EF]/95 backdrop-blur-md transition-all pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 lg:px-8">
        
        {/* Brand identity with official lockup placement */}
        <div 
          onClick={() => setActiveTab('student')}
          className="flex cursor-pointer items-center transition-opacity hover:opacity-95"
          title="stretchwithlorie - Home"
        >
          <BrandLogo variant="image" size="md" />
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2">
          <nav className="flex rounded-2xl bg-[#EDE7DD] p-1 shadow-inner border border-[#E0D8CB]">
            {/* Tab: Student Booking */}
            <button
              type="button"
              onClick={() => setActiveTab('student')}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 sm:px-4 sm:py-2 sm:text-sm ${
                activeTab === 'student'
                  ? 'bg-white text-[#2B2E31] shadow-sm'
                  : 'text-[#5C6260] hover:text-[#2B2E31]'
              }`}
            >
              <Calendar className={`h-4 w-4 ${activeTab === 'student' ? 'text-[#7A8B71]' : 'text-[#5C6260]'}`} />
              <span>Book a Class</span>
            </button>

            {/* Tab: Instructor Dashboard */}
            <button
              type="button"
              onClick={() => setActiveTab('instructor')}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 sm:px-4 sm:py-2 sm:text-sm ${
                activeTab === 'instructor'
                  ? 'bg-white text-[#2B2E31] shadow-sm'
                  : 'text-[#5C6260] hover:text-[#2B2E31]'
              }`}
            >
              <LayoutDashboard className={`h-4 w-4 ${activeTab === 'instructor' ? 'text-[#7A8B71]' : 'text-[#5C6260]'}`} />
              <span className="hidden xs:inline">Instructor Portal</span>
              <span className="xs:hidden">Portal</span>
              {totalBookings !== undefined && (
                <span className="ml-1 rounded-full bg-[#F1F4EF] border border-[#DDE4DA] px-1.5 py-0.2 text-[11px] font-bold text-[#5A6952]">
                  {totalBookings}
                </span>
              )}
            </button>
          </nav>

          {/* Quick reset data button for easy testing */}
          <button
            type="button"
            onClick={onResetData}
            title="Reset demo data to original state"
            className="hidden lg:flex items-center gap-1.5 rounded-xl border border-[#E6E1D8] bg-white px-2.5 py-2 text-xs font-medium text-[#5C6260] hover:bg-[#FAF6F3] hover:text-[#2B2E31] transition-colors shadow-2xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>

      </div>
    </header>
  );
}
