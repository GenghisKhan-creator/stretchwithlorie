import { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import ClassCard from './components/ClassCard';
import RegistrationForm from './components/RegistrationForm';
import SuccessModal from './components/SuccessModal';
import InstructorDashboard from './components/InstructorDashboard';
import SpecialOccasionsSection from './components/SpecialOccasionsSection';
import BoutiqueSection from './components/BoutiqueSection';
import ScrollToTop from './components/ScrollToTop';
import Toast from './components/Toast';
import BrandLogo from './components/BrandLogo';
import { api } from './services/api';
import { STUDIO_SCHEDULES } from './data/mockData';
import {
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Coffee,
  Heart
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

        // Pre-select first class
        if (fetchedClasses && fetchedClasses.length > 0) {
          setSelectedClass(fetchedClasses[0]);
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

  // 1-Click Select Studio Schedule Slot (Wed 7am, Sat 8.30am, Sun 6pm)
  const handleSelectScheduleSlot = (schedule) => {
    const massClass = classes.find((c) => c.id === 'cls-mass') || classes[0];
    setSelectedClass(massClass);

    if (registrationSectionRef.current) {
      registrationSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    showToast('info', `Selected ${schedule.label} (GH₵ ${schedule.price})`);
  };

  // Handle booking and Paystack payment submit
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
      showToast('success', `Payment authorized via Paystack! Reservation ${result.registration.bookingRef} confirmed.`);
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
      showToast('success', `Session "${created.title}" published to schedule!`);
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

  const categories = [
    { id: 'ALL', label: 'All Experiences' },
    { id: 'Yoga Classes', label: 'Yoga Classes' },
    { id: 'Private Bookings', label: 'Private Bookings' },
    { id: 'Masterclass', label: 'Flexibility Masterclass' },
    { id: 'Therapeutic', label: 'Therapeutic' },
    { id: 'Special Experiences', label: 'Special Experiences' }
  ];

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#2B2E31] font-sans antialiased selection:bg-[#EAD3D5] selection:text-[#2B2E31] flex flex-col w-full max-w-full overflow-x-hidden">

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalBookings={registrations.length}
        onResetData={handleResetData}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-3.5 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-8 sm:space-y-10 pb-28 sm:pb-12 overflow-x-hidden">

        {/* VIEW A: STUDENT BOOKING FLOW */}
        {activeTab === 'student' && (
          <div className="space-y-8 sm:space-y-10 animate-in fade-in duration-300 w-full max-w-full overflow-hidden">

            {/* Hero Banner with Botanical Calm & Architectural Warmth */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#EBF0E9] via-[#F7F4EF] to-[#F5ECEE] p-6 sm:p-10 border border-[#E6E1D8] shadow-sm w-full max-w-full">
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-3.5 py-1 text-xs font-semibold text-[#5A6952] border border-[#7A8B71]/30 mb-3 shadow-2xs">
                  <Sparkles className="h-3.5 w-3.5 text-[#C8A253]" />
                  stretchwithlorie • Yoga & Fitness
                </div>

                <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2B2E31] leading-tight">
                  YOGA CLASSES, PRIVATE BOOKINGS & SPECIAL EXPERIENCES
                </h1>

                <p className="mt-3 sm:mt-4 text-xs sm:text-base text-[#5C6260] max-w-2xl leading-relaxed">
                  Welcome to our yoga and wellness experiences, where movement meets relaxation, connection and beautiful memories.
                </p>

                <p className="mt-2 text-xs sm:text-sm text-[#2B2E31] font-medium max-w-2xl leading-relaxed">
                  Whether you are looking for a regular yoga session, a private class or a unique way to celebrate a special occasion, we have an experience for you.
                </p>

                {/* Studio Highlights Bar */}
                <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold text-[#5A6952]">
                  <span className="flex items-center gap-1.5 rounded-xl bg-white/80 px-2.5 sm:px-3 py-1.5 border border-[#E6E1D8] shadow-2xs">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#7A8B71]" />
                    All Levels Welcome
                  </span>
                  <span className="flex items-center gap-1.5 rounded-xl bg-white/80 px-2.5 sm:px-3 py-1.5 border border-[#E6E1D8] shadow-2xs">
                    <Coffee className="h-3.5 w-3.5 text-[#C8A253]" />
                    Complimentary Mat & Teas
                  </span>
                  <span className="flex items-center gap-1.5 rounded-xl bg-white/80 px-2.5 sm:px-3 py-1.5 border border-[#E6E1D8] shadow-2xs">
                    <Heart className="h-3.5 w-3.5 text-[#A44A4A]" />
                    Paystack Mobile Money
                  </span>
                </div>
              </div>

              {/* Decorative Subtle Ambient Rings */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[#C8A253]/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-10 right-24 h-64 w-64 rounded-full bg-[#7A8B71]/15 blur-2xl" />

              {/* Logo Lockup on Hero */}
              <div className="hidden lg:flex absolute right-8 xl:right-12 top-1/2 -translate-y-1/2 items-center justify-center rounded-3xl bg-white/90 backdrop-blur-md border border-white shadow-lg px-6 py-4 ring-4 ring-[#E6E1D8]/70">
                <BrandLogo variant="image" size="lg" />
              </div>
            </div>

            {/* STUDIO SCHEDULES QUICK BAR */}
            <div className="rounded-3xl border border-[#E6E1D8] bg-white p-4 sm:p-6 shadow-sm w-full max-w-full overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#F1F4EF] border border-[#DDE4DA] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#5A6952]">
                      Regular Group Timetable
                    </span>
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2B2E31] mt-1">
                    STUDIO SCHEDULES
                  </h3>
                  <p className="text-xs text-[#5C6260]">
                    Join our weekly group yoga sessions at the Studio Sanctuary.
                  </p>
                </div>

                {/* 3 Schedule Slots */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 md:gap-3 w-full md:w-auto">
                  {STUDIO_SCHEDULES.map((sched) => (
                    <button
                      key={sched.id}
                      type="button"
                      onClick={() => handleSelectScheduleSlot(sched)}
                      className="group flex items-center justify-between sm:flex-col sm:items-start rounded-2xl border border-[#E6E1D8] bg-[#FAF8F5] p-3 text-left hover:border-[#7A8B71] hover:bg-[#F1F4EF] transition-all hover:shadow-sm"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#2B2E31] group-hover:text-[#5A6952] transition-colors">
                          <Calendar className="h-3.5 w-3.5 text-[#7A8B71]" />
                          <span>{sched.day}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-[#5C6260] mt-0.5">
                          <Clock className="h-3 w-3 text-[#7A8B71]" />
                          <span>{sched.time}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:mt-2 sm:w-full sm:justify-between pt-1 border-t sm:border-[#EDE8E0]">
                        <span className="font-bold text-xs text-[#2B2E31]">
                          Gh {sched.price}
                        </span>
                        <span className="text-[10px] font-semibold text-[#A44A4A] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                          <span>Book Slot</span>
                          <ArrowRight className="h-2.5 w-2.5" />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Layout: 2 Columns on Desktop */}
            <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-12 items-start w-full max-w-full">

              {/* Left Column: Offerings & Experiences Selector (7 cols on lg) */}
              <div className="lg:col-span-7 space-y-6 w-full max-w-full">

                {/* Section Header & Filter Pills */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2B2E31]">
                        Choose Your Experience
                      </h2>
                      <p className="text-xs sm:text-sm text-[#5C6260]">
                        Select a class or private session below to reserve your space.
                      </p>
                    </div>

                    <span className="text-xs font-semibold text-[#5A6952] bg-[#F1F4EF] border border-[#DDE4DA] px-2.5 py-1 rounded-full shrink-0">
                      {filteredClasses.length} {filteredClasses.length === 1 ? 'offering' : 'offerings'}
                    </span>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 text-xs no-scrollbar -mx-1 px-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryFilter(cat.id)}
                        className={`rounded-xl px-3.5 py-1.5 font-semibold transition-all whitespace-nowrap shrink-0 ${categoryFilter === cat.id
                          ? 'bg-[#7A8B71] text-white shadow-sm'
                          : 'bg-white text-[#5C6260] border border-[#E6E1D8] hover:bg-[#F1F4EF] hover:text-[#2B2E31]'
                          }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Class Cards Grid */}
                {isLoading ? (
                  <div className="py-12 text-center text-[#5C6260]">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#7A8B71] border-t-transparent" />
                    <p className="mt-3 text-xs font-semibold">Loading experiences...</p>
                  </div>
                ) : filteredClasses.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-[#E6E1D8] bg-white p-8 text-center">
                    <p className="font-serif text-lg font-bold text-[#2B2E31]">
                      No sessions found for this category
                    </p>
                    <p className="text-xs text-[#5C6260] mt-1">
                      Try selecting "All Experiences" to browse everything.
                    </p>
                    <button
                      onClick={() => setCategoryFilter('ALL')}
                      className="mt-3 text-xs font-semibold text-[#7A8B71] underline"
                    >
                      Show All Experiences
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 w-full max-w-full">
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
                className="lg:col-span-5 lg:sticky lg:top-24 space-y-4 w-full max-w-full overflow-hidden scroll-mt-20 sm:scroll-mt-24"
              >
                <RegistrationForm
                  selectedClass={selectedClass}
                  onSubmitBooking={handleBookingSubmit}
                  isSubmitting={isSubmitting}
                  onCancel={() => setSelectedClass(null)}
                />
              </div>

            </div>

            {/* SPECIAL OCCASION BOOKINGS & PRIVATE EVENTS SECTION */}
            <SpecialOccasionsSection />

            {/* STUDIO BOUTIQUE / ITEMS AVAILABLE FOR SALE */}
            <BoutiqueSection />

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

      {/* Floating Back to Top Button */}
      <ScrollToTop />

      {/* Earthy Botanical Footer */}
      <footer className="mt-16 border-t border-[#E6E1D8] bg-[#F1F4EF]/70 py-8 text-center text-xs text-[#5C6260]">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo variant="image" size="sm" />
            <span className="hidden sm:inline text-[#2B2E31] font-medium">• Yoga Classes, Private Bookings & Special Experiences</span>
          </div>
          <div className="flex items-center gap-4 text-[#5C6260]">
            <span>Accra, Ghana • Studio Sanctuary & Client Locations</span>
          </div>
        </div>
      </footer>

    </div>
  );
}