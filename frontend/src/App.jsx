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
import WellnessGiftCardModal from './components/WellnessGiftCardModal';
import WellnessPassHeroCard from './components/WellnessPassHeroCard';
import { api } from './services/api';
import { STUDIO_SCHEDULES } from './data/mockData';
import {
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Coffee,
  Heart,
  Gift,
  ChevronDown
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

  // Wellness Gift Card & Subscription Modal State
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [giftModalTab, setGiftModalTab] = useState('subscription'); // 'subscription' | 'gift'

  const handleOpenGiftModal = (tab = 'subscription') => {
    setGiftModalTab(tab);
    setIsGiftModalOpen(true);
  };

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

      {/* Top Announcement Bar for Signature Special Offer */}
      <div className="bg-gradient-to-r from-[#2A3628] via-[#384635] to-[#252E23] text-white text-xs px-3.5 sm:px-6 py-2 border-b border-[#C8A253]/35 shrink-0 z-50">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#C8A253] text-[#2B2E31] px-2 py-0.5 font-extrabold text-[10px] tracking-wide shadow-2xs">
              <Sparkles className="h-3 w-3" />
              SPECIAL OFFER
            </span>
            <span className="text-[#F7F4EF] font-medium text-[11px] sm:text-xs">
              Monthly Studio Subscriptions & Digital Wellness Gift Cards are now available!
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleOpenGiftModal('subscription')}
            className="inline-flex items-center gap-1 text-[#F7E7C4] hover:text-white font-bold text-[11px] sm:text-xs underline underline-offset-2 transition-colors cursor-pointer"
          >
            <span>Buy / Gift Now</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalBookings={registrations.length}
        onResetData={handleResetData}
        onOpenGiftModal={handleOpenGiftModal}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-3.5 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-8 sm:space-y-10 pb-28 sm:pb-12 overflow-x-hidden">

        {/* VIEW A: STUDENT BOOKING FLOW */}
        {activeTab === 'student' && (
          <div className="space-y-8 sm:space-y-10 animate-in fade-in duration-300 w-full max-w-full overflow-hidden">

            {/* Hero Banner with Botanical Calm, Architectural Warmth & Wellness Pass Spotlight */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#EBF0E9] via-[#F7F4EF] to-[#F5ECEE] p-5 sm:p-8 lg:p-10 border border-[#E6E1D8] shadow-sm w-full max-w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
                
                {/* Left Column: Headline, Story & Quick CTAs (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-3.5 py-1 text-xs font-semibold text-[#5A6952] border border-[#7A8B71]/30 shadow-2xs">
                    <Sparkles className="h-3.5 w-3.5 text-[#C8A253]" />
                    stretchwithlorie • Yoga & Fitness
                  </div>

                  <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2B2E31] leading-tight">
                    YOGA CLASSES, PRIVATE BOOKINGS & SPECIAL EXPERIENCES
                  </h1>

                  <p className="text-xs sm:text-base text-[#5C6260] leading-relaxed">
                    Welcome to our yoga and wellness experiences, where movement meets relaxation, connection and beautiful memories.
                  </p>

                  <p className="text-xs sm:text-sm text-[#2B2E31] font-medium leading-relaxed">
                    Whether you are looking for a regular yoga session, a private class or a unique way to celebrate a special occasion, we have an experience for you.
                  </p>

                  {/* Studio Highlights Bar */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold text-[#5A6952] pt-1">
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

                  {/* Hero Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleOpenGiftModal('subscription')}
                      className="flex items-center gap-2 rounded-xl bg-[#A44A4A] text-white px-4 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:bg-[#8f3e3e] transition-all hover:scale-[1.01] cursor-pointer"
                    >
                      <Gift className="h-4 w-4" />
                      <span>Buy Wellness Pass / Gift Card</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>

                    <a
                      href="#class-catalog"
                      className="flex items-center gap-1.5 rounded-xl border border-[#E6E1D8] bg-white/80 backdrop-blur-sm px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#2B2E31] hover:bg-white hover:border-[#7A8B71] transition-colors"
                    >
                      <span>Explore Single Classes</span>
                      <ChevronDown className="h-3.5 w-3.5 text-[#7A8B71]" />
                    </a>
                  </div>
                </div>

                {/* Right Column: Physical VIP Wellness Card Spotlight (5 cols) */}
                <div className="lg:col-span-5 w-full">
                  <WellnessPassHeroCard onOpenGiftModal={handleOpenGiftModal} />
                </div>

              </div>

              {/* Decorative Subtle Ambient Rings */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[#C8A253]/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-10 right-24 h-64 w-64 rounded-full bg-[#7A8B71]/15 blur-2xl" />
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
                <div id="class-catalog" className="space-y-3 scroll-mt-24">
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

      {/* Signature Wellness Gift Card & Subscription Modal */}
      <WellnessGiftCardModal
        isOpen={isGiftModalOpen}
        initialTab={giftModalTab}
        onClose={() => setIsGiftModalOpen(false)}
        onSuccessBooking={(order) => {
          showToast('success', `${order.title} completed successfully!`);
          api.getRegistrations().then(setRegistrations);
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