import { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import ClassCard from './components/ClassCard';
import RegistrationForm from './components/RegistrationForm';
import SuccessModal from './components/SuccessModal';
import InstructorDashboard from './components/InstructorDashboard';
import Toast from './components/Toast';
import BrandLogo from './components/BrandLogo';
import { api } from './services/api';
import {
  Sparkles,
  Heart,
  ShieldCheck,
  Coffee
} from 'lucide-react';

export default function App() {
  const [classes, setClasses] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'instructor'
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState(null);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const registrationSectionRef = useRef(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Load initial data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [fetchedClasses, fetchedRegistrations] = await Promise.all([
          api.getClasses(),
          api.getRegistrations()
        ]);
        setClasses(fetchedClasses);
        setRegistrations(fetchedRegistrations);

        // Pre-select first available class for great preview
        if (fetchedClasses && fetchedClasses.length > 0) {
          const firstAvailable = fetchedClasses.find(
            (c) => c.maxCapacity - c.bookedCount > 0
          );
          setSelectedClass(firstAvailable || fetchedClasses[0]);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
        showToast('warning', 'Failed to load data from storage.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle class selection
  const handleSelectClass = (yogaClass) => {
    setSelectedClass(yogaClass);

    // If on mobile / small screen, smooth scroll to registration form
    if (window.innerWidth < 1024 && registrationSectionRef.current) {
      setTimeout(() => {
        registrationSectionRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  };

  // Handle mock booking and payment submit
  const handleBookingSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      const result = await api.createBooking(formData);

      // Update state locally
      setRegistrations((prev) => [result.registration, ...prev]);
      setClasses((prev) =>
        prev.map((c) => (c.id === result.updatedClass.id ? result.updatedClass : c))
      );
      setSelectedClass(result.updatedClass);

      // Trigger success screen
      setSuccessBooking(result.registration);
      showToast('success', `Payment authorized! Reservation ${result.registration.bookingRef} confirmed.`);
    } catch (err) {
      console.error('Booking error:', err);
      showToast('warning', err.message || 'Payment simulation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle adding a new class (Instructor view)
  const handleAddClass = async (newClassData) => {
    try {
      const created = await api.createClass(newClassData);
      setClasses((prev) => [created, ...prev]);
      showToast('success', `Class "${created.title}" published to student schedule!`);
    } catch {
      showToast('warning', 'Failed to create new class.');
    }
  };

  // Handle toggling student check-in
  const handleToggleCheckIn = async (registrationId) => {
    try {
      const updated = await api.toggleCheckIn(registrationId);
      setRegistrations((prev) =>
        prev.map((r) => (r.id === registrationId ? updated : r))
      );
      showToast(
        'success',
        `${updated.studentName} is now marked ${updated.checkedIn ? 'Present' : 'Not Checked In'}.`
      );
    } catch {
      showToast('warning', 'Failed to update attendance.');
    }
  };

  // Reset to default demo data
  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to original state?')) {
      api.resetToDefaults();
      window.location.reload();
    }
  };

  // Filtered classes list
  const filteredClasses = classes.filter((cls) => {
    if (categoryFilter === 'ALL') return true;
    return cls.category.toLowerCase() === categoryFilter.toLowerCase();
  });

  const categories = ['ALL', 'Vinyasa', 'Restorative', 'Yin', 'Power', 'Hatha', 'Pranayama'];

  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#201410] font-sans antialiased selection:bg-[#C9B6A5] selection:text-[#201410] flex flex-col">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalBookings={registrations.length}
        onResetData={handleResetData}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        
        {/* VIEW A: STUDENT BOOKING FLOW */}
        {activeTab === 'student' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Calming Studio Hero Banner in Warm Luxury Palette */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#EAE4DC] via-[#F4ECE3] to-[#F5F2EC] p-6 sm:p-10 border border-[#E0DFDB] shadow-sm">
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/80 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-[#774929] border border-[#C9B6A5] mb-3">
                  <Sparkles className="h-3.5 w-3.5 text-[#774929]" />
                  stretchwithlorie • Yoga, Mobility & Movement
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#201410] leading-tight">
                  Stretch Deeply. Move Freely. Reserve Your Mat.
                </h1>
                <p className="mt-3 text-sm sm:text-base text-[#88796B] max-w-2xl leading-relaxed">
                  Join Lorie and guest teachers for intimate, body-positive yoga and stretch sessions. All reservations include premium organic mats, support props, and herbal teas.
                </p>

                {/* Studio Highlights Bar */}
                <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-semibold text-[#774929]">
                  <span className="flex items-center gap-1.5 rounded-xl bg-white/80 px-3 py-1.5 border border-[#E0DFDB]">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#774929]" />
                    Clean Heated Air Filtration
                  </span>
                  <span className="flex items-center gap-1.5 rounded-xl bg-white/80 px-3 py-1.5 border border-[#E0DFDB]">
                    <Coffee className="h-3.5 w-3.5 text-[#774929]" />
                    Herbal Tea Lounge
                  </span>
                  <span className="flex items-center gap-1.5 rounded-xl bg-white/80 px-3 py-1.5 border border-[#E0DFDB]">
                    <Heart className="h-3.5 w-3.5 text-[#774929]" />
                    Trauma-Informed & All Bodies Welcome
                  </span>
                </div>
              </div>

              {/* Decorative Subtle Ambient Rings */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[#C9B6A5]/25 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-10 right-24 h-64 w-64 rounded-full bg-[#774929]/10 blur-2xl" />

              {/* Logo Lockup on Hero */}
              <div className="hidden lg:flex absolute right-8 xl:right-12 top-1/2 -translate-y-1/2 items-center justify-center rounded-3xl bg-white/85 backdrop-blur-md border border-white shadow-lg px-6 py-4 ring-4 ring-[#E0DFDB]/60">
                <BrandLogo variant="image" size="lg" />
              </div>
            </div>

            {/* Content Layout: 2 Columns on Desktop */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
              
              {/* Left Column: Class Selector (7 cols on lg) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Section Header & Filter Pills */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#201410]">
                        Upcoming Sessions
                      </h2>
                      <p className="text-xs sm:text-sm text-[#88796B]">
                        Select a session below to reserve your space on the floor.
                      </p>
                    </div>

                    <span className="text-xs font-semibold text-[#774929] bg-[#F5EBE1] border border-[#E8D7C8] px-2.5 py-1 rounded-full">
                      {filteredClasses.length} {filteredClasses.length === 1 ? 'class' : 'classes'} available
                    </span>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 text-xs no-scrollbar">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoryFilter(cat)}
                        className={`rounded-xl px-3.5 py-1.5 font-semibold transition-all whitespace-nowrap ${
                          categoryFilter === cat
                            ? 'bg-[#774929] text-white shadow-sm'
                            : 'bg-white text-[#88796B] border border-[#E0DFDB] hover:bg-[#F5EBE1] hover:text-[#201410]'
                        }`}
                      >
                        {cat === 'ALL' ? 'All Practices' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Class Cards Grid */}
                {isLoading ? (
                  <div className="py-12 text-center text-[#88796B]">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#774929] border-t-transparent" />
                    <p className="mt-3 text-xs font-semibold">Loading sanctuary schedule...</p>
                  </div>
                ) : filteredClasses.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-[#E0DFDB] bg-white p-8 text-center">
                    <p className="font-serif text-lg font-bold text-[#201410]">
                      No classes found for this style
                    </p>
                    <p className="text-xs text-[#88796B] mt-1">
                      Try selecting "All Practices" to view the complete schedule.
                    </p>
                    <button
                      onClick={() => setCategoryFilter('ALL')}
                      className="mt-3 text-xs font-semibold text-[#774929] underline"
                    >
                      Show All Classes
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {filteredClasses.map((cls) => (
                      <ClassCard
                        key={cls.id}
                        yogaClass={cls}
                        isSelected={selectedClass?.id === cls.id}
                        onSelect={handleSelectClass}
                      />
                    ))}
                  </div>
                )}

              </div>

              {/* Right Column: Registration Form (5 cols on lg, sticky on desktop) */}
              <div
                ref={registrationSectionRef}
                className="lg:col-span-5 lg:sticky lg:top-24 space-y-4"
              >
                <RegistrationForm
                  selectedClass={selectedClass}
                  onSubmitBooking={handleBookingSubmit}
                  isSubmitting={isSubmitting}
                  onCancel={() => setSelectedClass(null)}
                />
              </div>

            </div>

          </div>
        )}

        {/* VIEW B: INSTRUCTOR DASHBOARD */}
        {activeTab === 'instructor' && (
          <InstructorDashboard
            classes={classes}
            registrations={registrations}
            onAddClass={handleAddClass}
            onToggleCheckIn={handleToggleCheckIn}
            onRefreshData={() => {
              api.getClasses().then(setClasses);
              api.getRegistrations().then(setRegistrations);
              showToast('success', 'Roster and capacities refreshed.');
            }}
          />
        )}

      </main>

      {/* Success Modal Confirmation */}
      <SuccessModal
        booking={successBooking}
        onClose={() => setSuccessBooking(null)}
        onViewDashboard={() => {
          setSuccessBooking(null);
          setActiveTab('instructor');
        }}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Earthy Footer */}
      <footer className="mt-16 border-t border-[#E7DFD5] bg-[#FAF8F5] py-8 text-center text-xs text-[#7C887E]">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo variant="image" size="sm" />
            <span className="hidden sm:inline text-[#5A655E]">• Movement & Stretch Sanctuary</span>
          </div>
          <div className="flex items-center gap-4 text-[#5A655E]">
            <span>Hours: Mon - Sun 06:30 AM - 08:30 PM</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-[#58875B] font-medium">SPA Frontend Ready for Backend Integration</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
