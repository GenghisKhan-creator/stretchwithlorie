import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Navbar from './components/Navbar';
import ClassCard from './components/ClassCard';
import RegistrationForm from './components/RegistrationForm';
import SuccessModal from './components/SuccessModal';
import InstructorDashboard from './components/InstructorDashboard';
import SpecialOccasionsSection from './components/SpecialOccasionsSection';
import BoutiqueSection from './components/BoutiqueSection';
import ShortVideosSection from './components/ShortVideosSection';
import ScrollToTop from './components/ScrollToTop';
import Toast from './components/Toast';
import BrandLogo from './components/BrandLogo';
import WellnessGiftCardModal from './components/WellnessGiftCardModal';
import WellnessPassHeroCard from './components/WellnessPassHeroCard';
import AdminLoginModal from './components/AdminLoginModal';
import { api } from './services/api';
import { STUDIO_SCHEDULES } from './data/mockData';
import loriePoseImg from './assets/lorie_pose.png';
import {
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Coffee,
  Heart,
  Gift,
  ChevronDown,
  Film,
  X
} from 'lucide-react';

const ADMIN_PATHS = ['/admin', '/portal', '/instructor'];

function checkIsAdminPath(pathname) {
  const clean = (pathname || '/').toLowerCase().replace(/\/+$/, '') || '/';
  return ADMIN_PATHS.includes(clean);
}

export default function App() {
  const [classes, setClasses] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [preselectedSlot, setPreselectedSlot] = useState(null);
  const [bookingInitialData, setBookingInitialData] = useState(null);
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);
  const isAdminRoute = checkIsAdminPath(currentPath);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => api.isAdminLoggedIn());
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState(null);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filtered classes list
  const filteredClasses = classes.filter((cls) => {
    if (categoryFilter === 'ALL') return true;
    return cls.category.toLowerCase() === categoryFilter.toLowerCase();
  });

  // Registration Slide-In Drawer State
  const [isRegistrationDrawerOpen, setIsRegistrationDrawerOpen] = useState(false);

  // GSAP Animation Refs
  const heroSectionRef = useRef(null);
  const poseImgRef = useRef(null);
  const catalogGridRef = useRef(null);
  const drawerBackdropRef = useRef(null);
  const drawerPanelRef = useRef(null);
  const isClosingDrawerRef = useRef(false);

  // Wellness Gift Card & Subscription Modal State
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [giftModalTab, setGiftModalTab] = useState('subscription'); // 'subscription' | 'gift'

  const handleOpenGiftModal = (tab = 'subscription') => {
    setGiftModalTab(tab);
    setIsGiftModalOpen(true);
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Close Registration Slide-in Drawer smoothly with GSAP exit animation
  const handleCloseRegistration = () => {
    if (isClosingDrawerRef.current) return;
    isClosingDrawerRef.current = true;

    if (drawerBackdropRef.current && drawerPanelRef.current) {
      gsap.to(drawerBackdropRef.current, {
        opacity: 0,
        duration: 0.28,
        ease: 'power2.in'
      });
      gsap.to(drawerPanelRef.current, {
        x: '100%',
        duration: 0.32,
        ease: 'power3.in',
        onComplete: () => {
          setIsRegistrationDrawerOpen(false);
          setSelectedClass(null);
          setPreselectedSlot(null);
          isClosingDrawerRef.current = false;
        }
      });
    } else {
      setIsRegistrationDrawerOpen(false);
      setSelectedClass(null);
      setPreselectedSlot(null);
      isClosingDrawerRef.current = false;
    }
  };

  // GSAP: Hero section entrance & gentle breathing float animation
  useGSAP(() => {
    if (isAdminRoute) return;

    const ctx = gsap.context(() => {
      // Hero headline & content staggered reveal
      gsap.fromTo(
        '.gsap-hero-elem',
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power2.out',
          clearProps: 'transform'
        }
      );

      // Hero pose image fade in & subtle organic breathing pulse
      if (poseImgRef.current) {
        gsap.fromTo(
          poseImgRef.current,
          { opacity: 0, scale: 0.94 },
          {
            opacity: 0.38,
            scale: 1,
            duration: 1.2,
            ease: 'power2.out'
          }
        );

        // Gentle ambient floating breathing motion
        gsap.to(poseImgRef.current, {
          y: -8,
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }

      // VIP Wellness Card entrance
      gsap.fromTo(
        '.gsap-hero-card',
        { opacity: 0, y: 28, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          delay: 0.15,
          ease: 'power3.out',
          clearProps: 'transform'
        }
      );

      // Schedule slots reveal
      gsap.fromTo(
        '.gsap-sched-slot',
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.06,
          delay: 0.25,
          ease: 'power2.out',
          clearProps: 'transform'
        }
      );
    }, heroSectionRef);

    return () => ctx.revert();
  }, [isAdminRoute]);

  // GSAP: Class Cards Grid stagger entrance on category change or initial load
  useGSAP(() => {
    if (isAdminRoute || isLoading) return;

    const cards = catalogGridRef.current?.querySelectorAll('.gsap-class-card');
    if (cards && cards.length > 0) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 24, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power2.out',
          clearProps: 'transform'
        }
      );
    }
  }, [categoryFilter, filteredClasses.length, isLoading, isAdminRoute]);

  // GSAP: Slide-in Registration Drawer entrance animation
  useGSAP(() => {
    if (isRegistrationDrawerOpen && !isClosingDrawerRef.current) {
      if (drawerBackdropRef.current) {
        gsap.fromTo(
          drawerBackdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.35, ease: 'power2.out' }
        );
      }
      if (drawerPanelRef.current) {
        gsap.fromTo(
          drawerPanelRef.current,
          { x: '100%' },
          { x: '0%', duration: 0.45, ease: 'power3.out' }
        );
      }
    }
  }, [isRegistrationDrawerOpen]);

  // Lock body scroll and listen for Escape key when registration drawer is open
  useEffect(() => {
    if (isRegistrationDrawerOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          handleCloseRegistration();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isRegistrationDrawerOpen]);

  // Navigate smoothly between Public route (/) and Dedicated Admin route (/admin)
  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Detect creator referral link (?ref=CODE or ?promo=CODE) from URL
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const refCode = (params.get('ref') || params.get('promo') || '').trim().toUpperCase();
      if (refCode) {
        sessionStorage.setItem('stretchwithlorie_active_ref', refCode);
        const timer = setTimeout(() => {
          showToast('success', `Creator referral code "${refCode}" activated! Discount will auto-apply at checkout.`);
        }, 150);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  // Load initial public classes on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const fetchedClasses = await api.getClasses();
        setClasses(fetchedClasses);
      } catch (err) {
        console.error('Failed to load initial data:', err);
        showToast('warning', 'Failed to load data from storage.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Verify active admin session and fetch protected registrations ONLY on the /admin route
  useEffect(() => {
    if (!isAdminRoute) return;

    if (api.isAdminLoggedIn()) {
      api.verifyAdminSession().then((valid) => {
        setIsAdminAuthenticated(valid);
        if (valid) {
          api.getRegistrations().then(setRegistrations);
        }
      });
    }
  }, [isAdminRoute]);

  const handleAdminLoginSuccess = (adminUser) => {
    setIsAdminAuthenticated(true);
    // Fetch live registrations with newly granted admin authorization
    api.getRegistrations().then(setRegistrations);
    showToast('success', `Welcome back, ${adminUser?.name || 'Lorie'}! Instructor Portal unlocked.`);
  };

  const handleLogoutAdmin = () => {
    api.logoutAdmin();
    setIsAdminAuthenticated(false);
    setRegistrations([]);
    showToast('info', 'Instructor Portal locked.');
  };

  // Handle class selection - smoothly slides in the registration form without page scrolling
  const handleSelectClass = (yogaClass) => {
    setSelectedClass(yogaClass);
    setIsRegistrationDrawerOpen(true);
  };

  // 1-Click Select Studio Schedule Slot (Wed 7am, Sat 8.30am, Sun 6pm) - slides in the registration drawer
  const handleSelectScheduleSlot = (schedule) => {
    const massClass = classes.find((c) => c.id === 'cls-mass') || classes[0];
    setSelectedClass(massClass);
    const slotString = schedule.label || `${schedule.day} ${schedule.time}`;
    setPreselectedSlot(slotString);
    setIsRegistrationDrawerOpen(true);

    const isSlotFull =
      schedule.isFull ||
      (schedule.spotsLeft ?? (schedule.maxCapacity - schedule.bookedCount)) <= 0;

    if (isSlotFull) {
      showToast('warning', `${schedule.label || schedule.day} is currently fully booked! Alternative open days are shown below.`);
    } else {
      showToast('info', `Selected ${schedule.label || schedule.day} (GH₵ ${schedule.price})`);
    }
  };

  // Handle booking another session from SuccessModal (retaining student details)
  const handleBookAnotherSession = (option) => {
    setSuccessBooking(null);

    if (!option) {
      setIsRegistrationDrawerOpen(true);
      return;
    }

    // Preserve attendee details for fast 1-tap rebooking
    if (option.booking) {
      setBookingInitialData({
        studentName: option.booking.studentName,
        email: option.booking.email,
        phone: option.booking.phone,
        momoNumber: option.booking.phone,
        intake: option.booking.intake
      });
    }

    const targetClass = classes.find((c) => c.id === option.classId) || classes[0];
    setSelectedClass(targetClass);

    if (option.slot) {
      setPreselectedSlot(option.slot);
      showToast('info', `Switched to ${option.slotLabel || option.slot}! Your details are pre-filled.`);
    } else {
      showToast('info', `Selected ${targetClass.title}! Your details are pre-filled.`);
    }

    setIsRegistrationDrawerOpen(true);
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

      // Trigger success screen and close registration drawer
      setIsRegistrationDrawerOpen(false);
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
      {/* <div className="bg-gradient-to-r from-[#2A3628] via-[#384635] to-[#252E23] text-white text-xs px-3.5 sm:px-6 py-2 border-b border-[#C8A253]/35 shrink-0 z-50">
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
      </div> */}

      {/* Navigation Header */}
      <Navbar
        isAdminRoute={isAdminRoute}
        onNavigateHome={() => navigateTo('/')}
        onScrollToCatalog={() => {
          document.getElementById('class-catalog')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenGiftModal={handleOpenGiftModal}
        isAdminAuthenticated={isAdminAuthenticated}
        onLogoutAdmin={handleLogoutAdmin}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-3.5 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-8 sm:space-y-10 pb-28 sm:pb-12">

        {/* ROUTE 1: PUBLIC STUDENT BOOKING FLOW (/) */}
        {!isAdminRoute && (
          <div className="space-y-8 sm:space-y-10 animate-in fade-in duration-300 w-full max-w-full">

            {/* Hero Banner with Botanical Calm, Architectural Warmth & Wellness Pass Spotlight */}
            <div ref={heroSectionRef} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#EBF0E9] via-[#F7F4EF] to-[#F5ECEE] p-5 sm:p-8 lg:p-10 border border-[#E6E1D8] shadow-sm w-full max-w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">

                {/* Left Column: Headline, Story & Quick CTAs (7 cols) */}
                <div className="lg:col-span-7 relative space-y-4">
                  {/* Layered Yoga Stretch Pose (Positioned under the text with lower z-index, shifted right) */}
                  <div className="pointer-events-none absolute left-2 sm:left-8 lg:left-16 top-1/2 -translate-y-1/2 z-0 opacity-35 sm:opacity-40 select-none">
                    <img
                      ref={poseImgRef}
                      src={loriePoseImg}
                      alt=""
                      aria-hidden="true"
                      className="h-[380px] sm:h-[520px] lg:h-[620px] w-auto max-w-none object-contain filter drop-shadow-sm will-change-transform"
                    />
                  </div>

                  {/* Text & CTAs Content Layer (Layered on top of image, z-10) */}
                  <div className="relative z-10 space-y-4">
                    <h1 className="gsap-hero-elem font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2B2E31] leading-tight drop-shadow-2xs">
                      YOGA CLASSES, PRIVATE BOOKINGS & SPECIAL EXPERIENCES
                    </h1>

                    <p className="gsap-hero-elem text-xs sm:text-base text-[#5C6260] leading-relaxed">
                      Welcome to our yoga and wellness experiences, where movement meets relaxation, connection and beautiful memories.
                    </p>

                    <p className="gsap-hero-elem text-xs sm:text-sm text-[#2B2E31] font-medium leading-relaxed">
                      Whether you are looking for a regular yoga session, a private class or a unique way to celebrate a special occasion, we have an experience for you.
                    </p>

                    {/* Studio Highlights Bar */}
                    <div className="gsap-hero-elem flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs font-semibold text-[#5A6952] pt-0.5">
                      <span className="flex items-center gap-1.5 rounded-xl bg-white/85 backdrop-blur-xs px-2.5 sm:px-3 py-1.5 border border-[#E6E1D8] shadow-2xs">
                        <ShieldCheck className="h-3.5 w-3.5 text-[#7A8B71]" />
                        All Levels Welcome
                      </span>
                      <span className="flex items-center gap-1.5 rounded-xl bg-white/85 backdrop-blur-xs px-2.5 sm:px-3 py-1.5 border border-[#E6E1D8] shadow-2xs">
                        <Coffee className="h-3.5 w-3.5 text-[#C8A253]" />
                        Complimentary Mat & Teas
                      </span>
                      <span className="flex items-center gap-1.5 rounded-xl bg-white/85 backdrop-blur-xs px-2.5 sm:px-3 py-1.5 border border-[#E6E1D8] shadow-2xs">
                        <Heart className="h-3.5 w-3.5 text-[#A44A4A]" />
                        Paystack Mobile Money
                      </span>
                    </div>

                    {/* Hero Action Buttons */}
                    <div className="gsap-hero-elem flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1.5">
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
                        className="flex items-center gap-1.5 rounded-xl border border-[#E6E1D8] bg-white/85 backdrop-blur-sm px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#2B2E31] hover:bg-white hover:border-[#7A8B71] transition-colors"
                      >
                        <span>Explore Single Classes</span>
                        <ChevronDown className="h-3.5 w-3.5 text-[#7A8B71]" />
                      </a>

                      <a
                        href="#short-videos-vault"
                        className="flex items-center gap-1.5 rounded-xl border border-[#C8A253]/70 bg-[#232D21] text-[#F7E7C4] px-4 py-2.5 text-xs sm:text-sm font-semibold hover:bg-[#2F3C2C] transition-colors shadow-xs"
                      >
                        <Film className="h-3.5 w-3.5 text-[#C8A253]" />
                        <span>Guided Videos (30s Preview • From GH₵ 30)</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Right Column: Physical VIP Wellness Card Spotlight (5 cols) */}
                <div className="lg:col-span-5 w-full gsap-hero-card">
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

                {/* 3 Schedule Slots with Real-time Capacity */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 md:gap-3 w-full md:w-auto">
                  {(classes.find((c) => c.id === 'cls-mass')?.scheduleSlots || STUDIO_SCHEDULES).map((sched) => {
                    const isSlotFull =
                      sched.isFull ||
                      (sched.spotsLeft ?? (sched.maxCapacity - sched.bookedCount)) <= 0;
                    const left =
                      sched.spotsLeft ??
                      Math.max(0, (sched.maxCapacity || 15) - (sched.bookedCount || 0));

                    return (
                      <button
                        key={sched.id || sched.label}
                        type="button"
                        onClick={() => handleSelectScheduleSlot(sched)}
                        className={`gsap-sched-slot group flex items-center justify-between sm:flex-col sm:items-start rounded-2xl border p-3 text-left transition-all hover:shadow-sm cursor-pointer ${isSlotFull
                          ? 'border-stone-200 bg-stone-50/90 hover:border-amber-300'
                          : 'border-[#E6E1D8] bg-[#FAF8F5] hover:border-[#7A8B71] hover:bg-[#F1F4EF]'
                          }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#2B2E31] group-hover:text-[#5A6952] transition-colors">
                            <Calendar className={`h-3.5 w-3.5 ${isSlotFull ? 'text-stone-400' : 'text-[#7A8B71]'}`} />
                            <span className={isSlotFull ? 'line-through text-stone-600' : ''}>{sched.day}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-[#5C6260] mt-0.5">
                            <Clock className="h-3 w-3 text-[#7A8B71]" />
                            <span>{sched.time}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:mt-2 sm:w-full sm:justify-between pt-1 border-t sm:border-[#EDE8E0]">
                          <span className="font-bold text-xs text-[#2B2E31]">
                            GH₵ {sched.price || 200}
                          </span>
                          {isSlotFull ? (
                            <span className="text-[10px] font-bold text-[#A44A4A] bg-[#F9F3F4] px-1.5 py-0.5 rounded border border-[#EAD3D5]">
                              Sold Out
                            </span>
                          ) : left <= 2 ? (
                            <span className="text-[10px] font-bold text-[#B45309] bg-[#FFFBEB] px-1.5 py-0.5 rounded border border-[#FDE68A] animate-pulse">
                              {left} left
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-[#5A6952] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                              <span>{left} open</span>
                              <ArrowRight className="h-2.5 w-2.5" />
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Offerings & Experiences Catalog (Full-width 3-column responsive grid) */}
            <div id="class-catalog" className="space-y-6 w-full max-w-full scroll-mt-24">

              {/* Section Header & Filter Pills */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2B2E31]">
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
                    className="mt-3 text-xs font-semibold text-[#7A8B71] underline cursor-pointer"
                  >
                    Show All Experiences
                  </button>
                </div>
              ) : (
                <div ref={catalogGridRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-full items-stretch">
                  {filteredClasses.map((cls) => (
                    <div key={cls.id} className="gsap-class-card w-full h-full flex flex-col">
                      <ClassCard
                        yogaClass={cls}
                        isSelected={selectedClass?.id === cls.id && isRegistrationDrawerOpen}
                        onSelect={handleSelectClass}
                      />
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* FULL-WIDTH SUITE: GUIDED VIDEOS & CUSTOM PRIVATE EVENTS (TOUCHING SEAMLESSLY) */}
            <div className="space-y-0">
              <ShortVideosSection showToast={showToast} isAdmin={false} />
              <SpecialOccasionsSection />
            </div>

            {/* STUDIO BOUTIQUE / ITEMS AVAILABLE FOR SALE */}
            <BoutiqueSection />

          </div>
        )}

        {/* ROUTE 2: DEDICATED ADMIN PORTAL ROUTE (/admin, /portal, /instructor) */}
        {isAdminRoute && (
          isAdminAuthenticated ? (
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
              showToast={showToast}
            />
          ) : (
            <AdminLoginModal
              isOpen={true}
              inline={true}
              onClose={() => navigateTo('/')}
              onSuccess={handleAdminLoginSuccess}
            />
          )
        )}

      </main>

      {/* Slide-In Registration Drawer (Slides in on class selection, zero page scrolling) */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          isRegistrationDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-modal="true"
        role="dialog"
        aria-label="Class Registration Drawer"
      >
        {/* Soft Dark Backdrop */}
        <div
          ref={drawerBackdropRef}
          className={`fixed inset-0 bg-[#232D21]/60 backdrop-blur-xs transition-opacity duration-300 ${
            isRegistrationDrawerOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={handleCloseRegistration}
          aria-hidden="true"
        />

        {/* Sliding Drawer Container */}
        <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10 w-full justify-end pointer-events-none">
          <div
            ref={drawerPanelRef}
            className={`w-full max-w-2xl bg-[#FAF8F5] shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-out border-l border-[#E6E1D8] pointer-events-auto ${
              isRegistrationDrawerOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Sticky Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-white/95 backdrop-blur-md border-b border-[#E6E1D8] z-20 shrink-0">
              <div className="flex items-center gap-3">
                <BrandLogo size="sm" showSubtext={false} />
                <div className="min-w-0">
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#2B2E31] leading-none truncate">
                    Class Reservation
                  </h3>
                  <p className="text-[11px] text-[#5A6952] font-medium mt-0.5">
                    Secure Paystack Checkout • Instant Confirmation
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseRegistration}
                className="h-9 w-9 rounded-full bg-[#FAF8F5] hover:bg-[#EBF0E9] text-[#5C6260] hover:text-[#2B2E31] flex items-center justify-center border border-[#E6E1D8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A8B71] cursor-pointer shrink-0"
                aria-label="Close registration form"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Registration Form Body */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-4 overscroll-contain">
              {selectedClass && (
                <RegistrationForm
                  key={`${selectedClass?.id || 'none'}-${preselectedSlot || 'none'}-${bookingInitialData ? bookingInitialData.studentName : 'fresh'}`}
                  selectedClass={selectedClass}
                  preselectedSlot={preselectedSlot}
                  initialData={bookingInitialData}
                  onSubmitBooking={handleBookingSubmit}
                  isSubmitting={isSubmitting}
                  onCancel={handleCloseRegistration}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal Confirmation */}
      <SuccessModal
        booking={successBooking}
        classes={classes}
        onBookAnotherSession={handleBookAnotherSession}
        onClose={() => setSuccessBooking(null)}
      />

      {/* Signature Wellness Gift Card & Subscription Modal */}
      <WellnessGiftCardModal
        key={giftModalTab}
        isOpen={isGiftModalOpen}
        initialTab={giftModalTab}
        onClose={() => setIsGiftModalOpen(false)}
        onSuccessBooking={(order) => {
          showToast('success', `${order.title} completed successfully!`);
          if (isAdminRoute && isAdminAuthenticated) {
            api.getRegistrations().then(setRegistrations);
          }
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