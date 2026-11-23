import { useState, useEffect, useRef, useCallback } from 'react';
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
import AdminLoginModal from './components/AdminLoginModal';
import { api } from './services/api';
import { studioSocket } from './services/websocket';
import { STUDIO_SCHEDULES } from './data/mockData';
import loriePoseImg from './assets/lorie_pose_raw.png';
import flowClubPoseImg from './assets/flow_club_pose.jpg';
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
  Lock,
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Music
} from 'lucide-react';

const ADMIN_PATHS = ['/admin', '/portal', '/instructor'];
const HERO_SLIDE_DURATION = 6.5;
const ORB_RING_RADIUS = 94;
const ORB_RING_CIRCUMFERENCE = 2 * Math.PI * ORB_RING_RADIUS;

// Rotating featured offerings for the editorial hero (right column + vertical rail)
const HERO_SLIDES = [
  {
    id: 'classes',
    category: 'Yoga Classes',
    eyebrow: 'Group Sessions • Wed, Sat & Sun',
    light: 'Yoga',
    bold: 'Classes',
    image: '/images/mass_yoga_class.jpg',
    text: 'Group sessions designed to improve flexibility, strength, balance and overall well-being. Move, stretch, relax and connect with others.'
  },
  {
    id: 'private',
    category: 'Private Bookings',
    eyebrow: 'One-on-One • Studio or Your Space',
    light: 'Private',
    bold: 'Bookings',
    image: '/images/private_yoga_class.jpg',
    text: 'A personalised session tailored to your needs, goals and flexibility level — in our serene studio or at your own location.'
  },
  {
    id: 'special',
    category: 'Special Experiences',
    eyebrow: 'Couples • Celebrations • Champagne',
    light: 'Special',
    bold: 'Experiences',
    image: '/images/yoga_champagne.jpg',
    text: 'A unique way to celebrate a special occasion. A little movement, a little celebration and beautiful memories together.'
  }
];

function checkIsAdminPath(pathname) {
  const clean = (pathname || '/').toLowerCase().replace(/\/+$/, '') || '/';
  return ADMIN_PATHS.includes(clean);
}

// Ambient Sanctuary Audio Pill (Play & Mute controls with live dancing wave visualizer)
function SanctuaryAudioPill({
  isPlaying,
  isMuted,
  onTogglePlay,
  onToggleMute,
  variant = 'hero'
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 sm:gap-2.5 rounded-full border shadow-sm transition-all duration-300 ${
        variant === 'floating'
          ? 'bg-[#2B2E31]/95 text-white border-[#C8A253]/35 px-3 py-1.5 backdrop-blur-md shadow-lg hover:border-[#C8A253]'
          : 'bg-white/90 backdrop-blur-md border-[#E6E1D8] px-3 sm:px-3.5 py-1.5 hover:shadow-[0_4px_16px_-4px_rgba(43,46,49,0.12)] hover:border-[#C8A253]/60'
      }`}
    >
      {/* Play / Pause Button */}
      <button
        type="button"
        onClick={onTogglePlay}
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 active:scale-95 cursor-pointer shadow-sm ${
          variant === 'floating'
            ? 'bg-[#7A8B71] text-white hover:bg-[#687860]'
            : 'bg-[#7A8B71] text-white hover:bg-[#687860]'
        }`}
        title={isPlaying ? 'Pause Sanctuary Music' : 'Play Sanctuary Music'}
        aria-label={isPlaying ? 'Pause Sanctuary Music' : 'Play Sanctuary Music'}
      >
        {isPlaying ? (
          <Pause className="h-3 w-3 fill-current" />
        ) : (
          <Play className="h-3 w-3 fill-current ml-0.5" />
        )}
      </button>

      {/* Mute / Unmute Button */}
      <button
        type="button"
        onClick={onToggleMute}
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors cursor-pointer ${
          variant === 'floating'
            ? isMuted
              ? 'bg-white/10 text-[#E07A5F] hover:bg-white/20'
              : 'bg-white/10 text-[#E6E1D8] hover:text-white hover:bg-white/20'
            : isMuted
              ? 'bg-[#F4EFE6] text-[#A44A4A] hover:bg-[#EAE3D6]'
              : 'bg-[#F4EFE6] text-[#5C6260] hover:text-[#2B2E31] hover:bg-[#EAE3D6]'
        }`}
        title={isMuted ? 'Unmute Sanctuary Music' : 'Mute Sanctuary Music'}
        aria-label={isMuted ? 'Unmute Sanctuary Music' : 'Mute Sanctuary Music'}
      >
        {isMuted ? (
          <VolumeX className="h-3.5 w-3.5" />
        ) : (
          <Volume2 className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Track Info & Animated Equalizer Waves */}
      <div
        onClick={onTogglePlay}
        className="flex items-center gap-2 pr-1 cursor-pointer select-none"
        title="Toggle Background Music"
      >
        <div className="flex items-end gap-0.5 h-3">
          <span className={`w-0.5 rounded-full ${variant === 'floating' ? 'bg-[#C8A253]' : 'bg-[#7A8B71]'} ${isPlaying && !isMuted ? 'animate-music-bar-1' : 'h-1.5'}`} />
          <span className={`w-0.5 rounded-full ${variant === 'floating' ? 'bg-[#C8A253]' : 'bg-[#7A8B71]'} ${isPlaying && !isMuted ? 'animate-music-bar-2' : 'h-3'}`} />
          <span className={`w-0.5 rounded-full ${variant === 'floating' ? 'bg-[#C8A253]' : 'bg-[#7A8B71]'} ${isPlaying && !isMuted ? 'animate-music-bar-3' : 'h-2'}`} />
        </div>
        <div className="text-left">
          <span className={`block text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.18em] leading-tight ${variant === 'floating' ? 'text-white' : 'text-[#2B2E31]'}`}>
            Sanctuary Ambience
          </span>
          <span className={`block text-[8px] font-medium tracking-wider ${variant === 'floating' ? 'text-[#C8A253]' : 'text-[#7A8B71]'}`}>
            {isMuted ? 'Muted' : isPlaying ? 'Playing • Gayatri Mantra' : 'Tap to Play'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [classes, setClasses] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [preselectedSlot, setPreselectedSlot] = useState(null);
  const [bookingInitialData, setBookingInitialData] = useState(null);
  const [activePassCode, setActivePassCode] = useState(null);
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);
  const isAdminRoute = checkIsAdminPath(currentPath);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => api.isAdminLoggedIn());
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState(null);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const activeHeroSlide = HERO_SLIDES[heroSlideIndex];

  // Sanctuary Background Music State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showStickyAudioPill, setShowStickyAudioPill] = useState(false);
  const audioRef = useRef(null);

  // GSAP Animation Refs
  const heroSectionRef = useRef(null);
  const heroSplitBgRef = useRef(null);
  const poseImgRef = useRef(null);
  const poseShadowRef = useRef(null);
  const centerHaloRef = useRef(null);
  const centerRingRef = useRef(null);
  const verticalTextRef = useRef(null);
  const slideOrbWrapRef = useRef(null);
  const slideOrbImgRefs = useRef([]);
  const slideOrbShimmerRef = useRef(null);
  const slideProgressRef = useRef(null);
  const mobileProgressRef = useRef(null);
  const slideContentRef = useRef(null);
  const railCounterRef = useRef(null);
  const heroRailRef = useRef(null);
  const catalogGridRef = useRef(null);
  const drawerBackdropRef = useRef(null);
  const drawerPanelRef = useRef(null);
  const isClosingDrawerRef = useRef(false);

  // Slide orchestration refs (frame-accurate synced countdown + zero-flash transitions)
  const heroSlideIndexRef = useRef(0);
  const hasMountedSlideRef = useRef(false);
  const isHeroSlidePausedRef = useRef(false);
  const slideAutoTweenRef = useRef(null);
  const slideExitTlRef = useRef(null);
  const orbKenBurnsTweenRef = useRef(null);

  // Seamless futuristic slide transition (aperture iris orb morph + kinetic text cross-fade)
  const transitionToSlide = useCallback((targetIndex) => {
    const nextIdx = ((targetIndex % HERO_SLIDES.length) + HERO_SLIDES.length) % HERO_SLIDES.length;
    if (nextIdx === heroSlideIndexRef.current) return;

    const prevIdx = heroSlideIndexRef.current;

    if (slideAutoTweenRef.current) {
      slideAutoTweenRef.current.kill();
      slideAutoTweenRef.current = null;
    }
    if (slideExitTlRef.current) {
      slideExitTlRef.current.kill();
      slideExitTlRef.current = null;
    }
    if (orbKenBurnsTweenRef.current) {
      orbKenBurnsTweenRef.current.kill();
      orbKenBurnsTweenRef.current = null;
    }

    // 1. Immediate cross-morph on the stacked circular offering orb images (zero unmount flash)
    const prevImg = slideOrbImgRefs.current[prevIdx];
    const nextImg = slideOrbImgRefs.current[nextIdx];

    slideOrbImgRefs.current.forEach((imgEl, idx) => {
      if (!imgEl) return;
      if (idx !== prevIdx && idx !== nextIdx) {
        gsap.killTweensOf(imgEl);
        gsap.set(imgEl, { opacity: 0, zIndex: 0, clipPath: 'circle(75% at 50% 50%)', filter: 'blur(0px)' });
      }
    });

    if (prevImg) {
      gsap.killTweensOf(prevImg);
      gsap.set(prevImg, { zIndex: 1 });
      gsap.to(prevImg, {
        opacity: 0,
        scale: 1.14,
        filter: 'blur(8px)',
        duration: 0.65,
        ease: 'power2.inOut'
      });
    }

    if (nextImg) {
      gsap.killTweensOf(nextImg);
      gsap.set(nextImg, { zIndex: 2 });
      gsap.fromTo(
        nextImg,
        {
          opacity: 0.2,
          scale: 1.24,
          clipPath: 'circle(0% at 50% 50%)',
          filter: 'blur(8px)'
        },
        {
          opacity: 1,
          scale: 1,
          clipPath: 'circle(75% at 50% 50%)',
          filter: 'blur(0px)',
          duration: 0.92,
          ease: 'expo.out',
          onComplete: () => {
            orbKenBurnsTweenRef.current = gsap.to(nextImg, {
              scale: 1.06,
              duration: HERO_SLIDE_DURATION,
              ease: 'sine.inOut'
            });
          }
        }
      );
    }

    // Luminous futuristic prism sweep across the circular orb
    if (slideOrbShimmerRef.current) {
      gsap.killTweensOf(slideOrbShimmerRef.current);
      gsap.fromTo(
        slideOrbShimmerRef.current,
        { xPercent: -140, opacity: 0 },
        {
          xPercent: 165,
          keyframes: [
            { opacity: 0.9, duration: 0.28 },
            { opacity: 0, duration: 0.52 }
          ],
          duration: 0.8,
          ease: 'power2.inOut'
        }
      );
    }

    // 2. Smooth kinetic exit of current text & rail counter, then swap state at invisible peak
    const slideItems = slideContentRef.current?.querySelectorAll('.gsap-slide-item');
    const railItems = railCounterRef.current?.querySelectorAll('.gsap-rail-item');
    const exitTargets = [
      ...(slideItems ? Array.from(slideItems) : []),
      ...(railItems ? Array.from(railItems) : [])
    ];

    if (exitTargets.length > 0) {
      slideExitTlRef.current = gsap.timeline({
        onComplete: () => {
          heroSlideIndexRef.current = nextIdx;
          setHeroSlideIndex(nextIdx);
        }
      });
      slideExitTlRef.current.to(exitTargets, {
        opacity: 0,
        y: -14,
        filter: 'blur(5px)',
        duration: 0.24,
        stagger: 0.025,
        ease: 'power3.in'
      });
    } else {
      heroSlideIndexRef.current = nextIdx;
      setHeroSlideIndex(nextIdx);
    }
  }, []);

  const handleHeroSlidePause = useCallback(() => {
    isHeroSlidePausedRef.current = true;
    slideAutoTweenRef.current?.pause();
  }, []);

  const handleHeroSlideResume = useCallback(() => {
    isHeroSlidePausedRef.current = false;
    slideAutoTweenRef.current?.play();
  }, []);

  // Synced futuristic orbital progress ring + seamless slide text entrance + auto-advance
  useEffect(() => {
    if (isAdminRoute) {
      hasMountedSlideRef.current = false;
      return;
    }

    // Entrance choreography whenever slide index changes after initial mount
    if (hasMountedSlideRef.current) {
      const slideItems = slideContentRef.current?.querySelectorAll('.gsap-slide-item');
      if (slideItems && slideItems.length > 0) {
        gsap.fromTo(
          slideItems,
          { opacity: 0, y: 24, filter: 'blur(7px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.72,
            stagger: 0.065,
            ease: 'expo.out',
            clearProps: 'transform,filter'
          }
        );
      }

      const railItems = railCounterRef.current?.querySelectorAll('.gsap-rail-item');
      if (railItems && railItems.length > 0) {
        gsap.fromTo(
          railItems,
          { opacity: 0, y: 18, filter: 'blur(5px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.65,
            stagger: 0.05,
            ease: 'expo.out',
            clearProps: 'transform,filter'
          }
        );
      }
    } else {
      hasMountedSlideRef.current = true;
    }

    // Frame-accurate countdown driving both the desktop orbital ring and mobile progress bar
    const progressState = { value: 0 };
    if (slideProgressRef.current) {
      slideProgressRef.current.style.strokeDashoffset = String(ORB_RING_CIRCUMFERENCE);
    }
    if (mobileProgressRef.current) {
      mobileProgressRef.current.style.transform = 'scaleX(0)';
    }

    const tween = gsap.to(progressState, {
      value: 1,
      duration: HERO_SLIDE_DURATION,
      ease: 'none',
      onUpdate: () => {
        if (slideProgressRef.current) {
          slideProgressRef.current.style.strokeDashoffset = String(
            ORB_RING_CIRCUMFERENCE * (1 - progressState.value)
          );
        }
        if (mobileProgressRef.current) {
          mobileProgressRef.current.style.transform = `scaleX(${progressState.value})`;
        }
      },
      onComplete: () => {
        transitionToSlide((heroSlideIndexRef.current + 1) % HERO_SLIDES.length);
      }
    });

    slideAutoTweenRef.current = tween;
    if (isHeroSlidePausedRef.current) {
      tween.pause();
    }

    return () => {
      tween.kill();
    };
  }, [heroSlideIndex, isAdminRoute, transitionToSlide]);

  const handleHeroSlideAction = (slide) => {
    setCategoryFilter(slide.category);
    document.getElementById('class-catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filtered classes list
  const filteredClasses = classes.filter((cls) => {
    if (categoryFilter === 'ALL') return true;
    return cls.category.toLowerCase() === categoryFilter.toLowerCase();
  });

  // Registration Slide-In Drawer State
  const [isRegistrationDrawerOpen, setIsRegistrationDrawerOpen] = useState(false);

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

  // Sanctuary Background Music Handlers
  const handleTogglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.volume = 0.38;
      audioRef.current.muted = isMuted;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlayingAudio(true))
          .catch((err) => console.warn('Audio play prevented:', err));
      }
    }
  }, [isPlayingAudio, isMuted]);

  const handleToggleMute = useCallback((e) => {
    e?.stopPropagation?.();
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);

    // If unmuting while paused, resume playing
    if (!nextMuted && !isPlayingAudio) {
      audioRef.current.volume = 0.38;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => setIsPlayingAudio(true)).catch(() => {});
      }
    }
  }, [isMuted, isPlayingAudio]);

  // Attempt ambient autoplay on mount or resume on first user interaction
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    audioEl.volume = 0.38;

    const playPromise = audioEl.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlayingAudio(true);
        })
        .catch(() => {
          // Autoplay blocked by browser policy: listen for first interaction
          setIsPlayingAudio(false);
          const startOnInteraction = () => {
            if (audioRef.current && audioRef.current.paused) {
              audioRef.current.volume = 0.38;
              audioRef.current.play()
                .then(() => setIsPlayingAudio(true))
                .catch(() => {});
            }
          };
          window.addEventListener('click', startOnInteraction, { once: true });
          window.addEventListener('touchstart', startOnInteraction, { once: true });
        });
    }
  }, []);

  // Monitor scroll position to show sticky audio pill when scrolled past hero
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyAudioPill(window.scrollY > 480);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // GSAP: Futuristic Hero entrance, synchronized levitation physics & spatial parallax
  useGSAP(() => {
    if (isAdminRoute || !heroSectionRef.current) return;

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let cleanupParallax = null;

    const ctx = gsap.context(() => {
      // Initialize stacked orb images once (GSAP owns all cross-morph transitions from here)
      slideOrbImgRefs.current.forEach((imgEl, idx) => {
        if (!imgEl) return;
        const isCurrent = idx === heroSlideIndexRef.current;
        gsap.set(imgEl, {
          opacity: isCurrent ? 1 : 0,
          zIndex: isCurrent ? 2 : 0,
          scale: 1,
          clipPath: 'circle(75% at 50% 50%)',
          filter: 'blur(0px)'
        });
      });

      if (prefersReducedMotion) return;

      // 1. Two-tone split backdrop reveal
      if (heroSplitBgRef.current) {
        gsap.fromTo(
          heroSplitBgRef.current,
          { opacity: 0, clipPath: 'inset(0 0 0 18%)' },
          {
            opacity: 1,
            clipPath: 'inset(0 0 0 0%)',
            duration: 1.05,
            ease: 'expo.out',
            clearProps: 'clipPath'
          }
        );
      }

      // 2. Left & right column elements: futuristic blur-to-sharp kinetic cascade
      const heroElems = heroSectionRef.current.querySelectorAll('.gsap-hero-elem');
      if (heroElems.length > 0) {
        gsap.fromTo(
          heroElems,
          { opacity: 0, y: 26, filter: 'blur(8px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.9,
            stagger: 0.08,
            ease: 'expo.out',
            clearProps: 'transform,filter'
          }
        );
      }

      // 3. Champagne gold hairline rule draw-in
      const heroRule = heroSectionRef.current.querySelector('.gsap-hero-rule');
      if (heroRule) {
        gsap.fromTo(
          heroRule,
          { scaleX: 0, transformOrigin: 'left center' },
          { scaleX: 1, duration: 0.85, delay: 0.25, ease: 'expo.out' }
        );
      }

      // 4. Center architectural halo & white portal ring expansion
      if (centerHaloRef.current) {
        gsap.fromTo(
          centerHaloRef.current,
          { opacity: 0, scale: 0.82 },
          { opacity: 1, scale: 1, duration: 1.25, delay: 0.1, ease: 'expo.out' }
        );
      }
      if (centerRingRef.current) {
        gsap.fromTo(
          centerRingRef.current,
          { opacity: 0, scale: 0.86 },
          { opacity: 1, scale: 1, duration: 1.1, delay: 0.05, ease: 'expo.out' }
        );
      }

      // 5. Center Lorie pose focus-pull reveal (grounded & steady)
      if (poseImgRef.current) {
        gsap.fromTo(
          poseImgRef.current,
          { opacity: 0, y: 24, scale: 0.95, filter: 'blur(8px)' },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: 1.1,
            ease: 'expo.out',
            clearProps: 'transform,filter'
          }
        );
      }

      // Grounded studio floor shadow reveal (steady & grounded)
      if (poseShadowRef.current) {
        gsap.fromTo(
          poseShadowRef.current,
          { opacity: 0, scaleX: 0.65 },
          {
            opacity: 1,
            scaleX: 1,
            duration: 1.1,
            ease: 'expo.out',
            clearProps: 'transform'
          }
        );
      }

      // 6. Vertical STRETCH editorial lettering glide-in
      if (verticalTextRef.current) {
        gsap.fromTo(
          verticalTextRef.current,
          { opacity: 0, y: 34, filter: 'blur(6px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1.0,
            delay: 0.35,
            ease: 'expo.out',
            clearProps: 'filter'
          }
        );
      }

      // 7. Right offering orbital portal entrance + initial slow Ken Burns drift
      if (slideOrbWrapRef.current) {
        gsap.fromTo(
          slideOrbWrapRef.current,
          { opacity: 0, scale: 0.84, filter: 'blur(8px)' },
          {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 1.0,
            delay: 0.25,
            ease: 'expo.out',
            clearProps: 'filter'
          }
        );
      }
      const initialOrbImg = slideOrbImgRefs.current[heroSlideIndexRef.current];
      if (initialOrbImg) {
        orbKenBurnsTweenRef.current = gsap.to(initialOrbImg, {
          scale: 1.06,
          duration: HERO_SLIDE_DURATION,
          ease: 'sine.inOut'
        });
      }

      // Initial entrance for the right rotating offering text items
      const initialSlideItems = slideContentRef.current?.querySelectorAll('.gsap-slide-item');
      if (initialSlideItems && initialSlideItems.length > 0) {
        gsap.fromTo(
          initialSlideItems,
          { opacity: 0, y: 24, filter: 'blur(7px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.88,
            delay: 0.28,
            stagger: 0.075,
            ease: 'expo.out',
            clearProps: 'transform,filter'
          }
        );
      }

      // 8. Right-edge vertical telemetry rail entrance
      if (heroRailRef.current) {
        gsap.fromTo(
          heroRailRef.current,
          { opacity: 0, x: 18 },
          { opacity: 1, x: 0, duration: 0.9, delay: 0.42, ease: 'expo.out', clearProps: 'transform' }
        );
      }

      // 9. Interactive Desktop Spatial Depth Parallax (60fps quickTo inertia)
      if (window.matchMedia?.('(pointer: fine)').matches) {
        const heroEl = heroSectionRef.current;
        const haloX = centerHaloRef.current ? gsap.quickTo(centerHaloRef.current, 'x', { duration: 1.1, ease: 'power3.out' }) : null;
        const haloY = centerHaloRef.current ? gsap.quickTo(centerHaloRef.current, 'y', { duration: 1.1, ease: 'power3.out' }) : null;
        const textX = verticalTextRef.current ? gsap.quickTo(verticalTextRef.current, 'x', { duration: 0.85, ease: 'power3.out' }) : null;
        const textY = verticalTextRef.current ? gsap.quickTo(verticalTextRef.current, 'y', { duration: 0.85, ease: 'power3.out' }) : null;
        const orbX = slideOrbWrapRef.current ? gsap.quickTo(slideOrbWrapRef.current, 'x', { duration: 0.95, ease: 'power3.out' }) : null;
        const orbY = slideOrbWrapRef.current ? gsap.quickTo(slideOrbWrapRef.current, 'y', { duration: 0.95, ease: 'power3.out' }) : null;

        const handlePointerMove = (e) => {
          const rect = heroEl.getBoundingClientRect();
          const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;  // -1 to +1
          const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;  // -1 to +1
          haloX?.(-nx * 14);
          haloY?.(-ny * 9);
          textX?.(nx * 6);
          textY?.(ny * 10);
          orbX?.(nx * 8);
          orbY?.(ny * 6);
        };

        const handlePointerLeave = () => {
          haloX?.(0);
          haloY?.(0);
          textX?.(0);
          textY?.(0);
          orbX?.(0);
          orbY?.(0);
        };

        heroEl.addEventListener('pointermove', handlePointerMove, { passive: true });
        heroEl.addEventListener('pointerleave', handlePointerLeave);
        cleanupParallax = () => {
          heroEl.removeEventListener('pointermove', handlePointerMove);
          heroEl.removeEventListener('pointerleave', handlePointerLeave);
        };
      }
    }, heroSectionRef);

    return () => {
      cleanupParallax?.();
      slideExitTlRef.current?.kill();
      orbKenBurnsTweenRef.current?.kill();
      ctx.revert();
    };
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

  // Real-Time WebSocket Listener (Syncs bookings, class updates, inquiries live across all screens)
  useEffect(() => {
    studioSocket.connect();

    const unsubReg = studioSocket.subscribe('NEW_REGISTRATION', (data) => {
      if (data?.registration) {
        setRegistrations((prev) => [
          data.registration,
          ...prev.filter((r) => r.id !== data.registration.id)
        ]);

        if (isAdminRoute) {
          showToast(
            'info',
            `✨ New booking: ${data.registration.studentName} enrolled in ${data.registration.className}!`
          );
        }
      }

      if (data?.updatedClass) {
        setClasses((prev) =>
          prev.map((c) => (c.id === data.updatedClass.id ? { ...c, ...data.updatedClass } : c))
        );
      }
    });

    const unsubCheckin = studioSocket.subscribe('CHECKIN_UPDATED', (data) => {
      if (data?.registration) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === data.registration.id ? data.registration : r))
        );
      }
    });

    const unsubClassCreated = studioSocket.subscribe('CLASS_CREATED', (newClass) => {
      setClasses((prev) => [newClass, ...prev.filter((c) => c.id !== newClass.id)]);
      showToast('info', `🗓️ New session "${newClass.title}" published!`);
    });

    const unsubClassUpdated = studioSocket.subscribe('CLASS_UPDATED', (updatedClass) => {
      setClasses((prev) =>
        prev.map((c) => (c.id === updatedClass.id ? { ...c, ...updatedClass } : c))
      );
    });

    const unsubClassDeleted = studioSocket.subscribe('CLASS_DELETED', ({ id }) => {
      setClasses((prev) => prev.filter((c) => c.id !== id));
    });

    const unsubInquiry = studioSocket.subscribe('NEW_EVENT_INQUIRY', (inq) => {
      if (isAdminRoute) {
        showToast(
          'info',
          `💌 New celebration inquiry: ${inq.occasion_type || inq.occasionType} from ${inq.full_name || inq.fullName}!`
        );
      }
    });

    const unsubGiftCard = studioSocket.subscribe('NEW_GIFT_CARD', (card) => {
      if (isAdminRoute) {
        showToast(
          'info',
          `🎁 New gift voucher issued: GH₵${card.amount} for ${card.recipient_name || card.recipientName}!`
        );
      }
    });

    return () => {
      unsubReg();
      unsubCheckin();
      unsubClassCreated();
      unsubClassUpdated();
      unsubClassDeleted();
      unsubInquiry();
      unsubGiftCard();
    };
  }, [isAdminRoute]);

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
      setActivePassCode(null);
      setSuccessBooking(result.registration);
      const toastMsg = result.appliedPass
        ? `Reservation confirmed with ${result.appliedPass.cardType === 'subscription' ? 'Monthly Flow Pass' : 'Gift Voucher'}! Ref: ${result.registration.bookingRef}`
        : `Payment authorized via Paystack! Reservation ${result.registration.bookingRef} confirmed.`;
      showToast('success', toastMsg);
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

  // Handle updating an existing class (Instructor view)
  const handleUpdateClass = async (classId, updatedClassData) => {
    try {
      const updated = await api.updateClass(classId, updatedClassData);
      setClasses((prev) =>
        prev.map((c) => (c.id === classId ? { ...c, ...updated } : c))
      );
      showToast('success', `Session "${updated.title}" updated successfully!`);
      return updated;
    } catch (err) {
      showToast('warning', err.message || 'Failed to update class.');
      throw err;
    }
  };

  // Handle deleting a class (Instructor view)
  const handleDeleteClass = async (classId) => {
    try {
      await api.deleteClass(classId);
      setClasses((prev) => prev.filter((c) => c.id !== classId));
      showToast('success', 'Class removed from studio schedule.');
    } catch (err) {
      showToast('warning', err.message || 'Failed to delete class.');
      throw err;
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

      {/* FULL-WIDTH EDITORIAL SPLIT HERO (Public Route) */}
      {!isAdminRoute && (
        <section
          ref={heroSectionRef}
          className="relative overflow-hidden border-b border-[#E6E1D8] bg-[#FDFCFA] w-full"
        >
          {/* Two-tone split background spanning 100% viewport width */}
          <div
            ref={heroSplitBgRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] lg:h-auto lg:inset-y-0 lg:left-1/2 lg:right-0 bg-[#EEE9E1]"
          >
            {/* Subtle futuristic champagne-gold light filament gliding down the 50% split seam */}
            <div className="hidden lg:block absolute left-0 inset-y-0 w-px bg-[#C8A253]/15 overflow-hidden">
              <div className="hero-seam-filament h-36 w-full bg-gradient-to-b from-transparent via-[#C8A253]/75 to-transparent" />
            </div>
          </div>

          <div className="relative mx-auto max-w-[1440px] grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-0 px-5 sm:px-8 lg:px-14 xl:px-20 pt-8 sm:pt-10 pb-8 lg:py-14 lg:min-h-[660px]">

            {/* LEFT: Brand headline, story & membership badge */}
            <div className="lg:col-span-4 flex flex-col justify-between gap-8 lg:pr-4">
              <div className="space-y-4 lg:pt-14">
                <p className="gsap-hero-elem text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7A8B71]">
                  Movement • Relaxation • Connection
                </p>
                <h1 className="gsap-hero-elem text-[#2B2E31]">
                  <span className="block font-serif font-normal uppercase text-[2.25rem] sm:text-5xl lg:text-[3.5rem] leading-none tracking-[0.22em]">
                    Stretch
                  </span>
                  <span className="mt-2.5 flex items-center gap-3 font-sans text-[11px] sm:text-xs font-semibold uppercase tracking-[0.34em] text-[#5A6952]">
                    <span className="gsap-hero-rule h-px w-7 bg-[#C8A253]/80 inline-block" aria-hidden="true" />
                    <span>With Lorie • Yoga Studio</span>
                  </span>
                </h1>
                <p className="gsap-hero-elem font-serif italic text-xs sm:text-[13px] text-[#7A746B] leading-relaxed max-w-xs">
                  &ldquo;You cannot always control what goes on outside, but you can always control what goes on inside.&rdquo;
                </p>
                <p className="gsap-hero-elem text-xs sm:text-sm text-[#5C6260] leading-relaxed max-w-sm">
                  Yoga classes, private bookings &amp; special experiences — where movement meets relaxation, connection and beautiful memories.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenGiftModal('subscription')}
                  className="gsap-hero-elem group inline-flex items-center gap-2 text-xs font-semibold text-[#5C6260] hover:text-[#2B2E31] transition-colors cursor-pointer"
                >
                  <ArrowRight className="h-3.5 w-3.5 text-[#C8A253] group-hover:translate-x-1 transition-transform duration-300" />
                  <span className="border-b border-transparent group-hover:border-[#2B2E31] transition-colors">Wellness Pass &amp; Gift Cards</span>
                </button>

                {/* Left Bottom Corner: Sanctuary Music Controller (Mobile) */}
                <div className="gsap-hero-elem lg:hidden pt-2">
                  <SanctuaryAudioPill
                    isPlaying={isPlayingAudio}
                    isMuted={isMuted}
                    onTogglePlay={handleTogglePlay}
                    onToggleMute={handleToggleMute}
                    variant="hero"
                  />
                </div>
              </div>

              {/* Flow Club badge + studio highlights (desktop) */}
              <div className="gsap-hero-elem hidden lg:block space-y-4">
                <button
                  type="button"
                  onClick={() => handleOpenGiftModal('subscription')}
                  className="group flex items-end gap-3 text-left cursor-pointer"
                  title="Monthly Flow Pass & Gift Vouchers"
                >
                  <div className="relative h-24 w-24 shrink-0">
                    <span className="hero-bubble-a absolute -top-1 right-0 h-7 w-7 rounded-full bg-[#E7E1D6]" />
                    <span className="hero-bubble-b absolute top-3 -right-3 h-4 w-4 rounded-full bg-[#EEE9E1]" />
                    <span className="absolute inset-2 rounded-full bg-[#E7E1D6] group-hover:bg-[#E0D8CA] transition-colors duration-300" />
                    <img
                      src={flowClubPoseImg}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 m-auto h-[88px] w-[88px] object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="pb-1">
                    <span className="block text-[9px] font-semibold uppercase tracking-[0.25em] text-[#7A8B71]">
                      Monthly Flow Pass
                    </span>
                    <span className="block font-sans text-2xl leading-none tracking-tight text-[#CFC7B9] group-hover:text-[#B9AE9C] transition-colors">
                      <span className="font-bold">FLOW</span><span className="font-light">CLUB</span>
                    </span>
                  </div>
                </button>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-[#5C6260]">
                  <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[#7A8B71]" />All Levels</span>
                  <span className="inline-flex items-center gap-1.5"><Coffee className="h-3.5 w-3.5 text-[#C8A253]" />Mat &amp; Teas</span>
                  <span className="inline-flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-[#A44A4A]" />Mobile Money</span>
                </div>
                <div className="flex items-center justify-between gap-3 pt-0.5">
                  <p className="text-[9px] font-medium uppercase tracking-[0.32em] text-[#9A9387]">
                    5.60° N • Accra Sanctuary
                  </p>
                </div>

                {/* Left Bottom Corner: Sanctuary Music Controller (Desktop) */}
                <div className="pt-1.5">
                  <SanctuaryAudioPill
                    isPlaying={isPlayingAudio}
                    isMuted={isMuted}
                    onTogglePlay={handleTogglePlay}
                    onToggleMute={handleToggleMute}
                    variant="hero"
                  />
                </div>
              </div>
            </div>

            {/* CENTER: Pose figure over orbital architectural ring with vertical editorial type */}
            <div className="lg:col-span-4 relative flex items-center justify-center min-h-[360px] sm:min-h-[460px] lg:min-h-0">
              {/* Futuristic rotating celestial SVG halo with subtle orbital gold nodes */}
              <div
                ref={centerHaloRef}
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[290px] w-[290px] sm:h-[412px] sm:w-[412px] lg:h-[530px] lg:w-[530px] will-change-transform"
              >
                <svg viewBox="0 0 540 540" className="hero-orbit-slow h-full w-full overflow-visible">
                  <circle
                    cx="270"
                    cy="270"
                    r="260"
                    fill="none"
                    stroke="#2B2E31"
                    strokeOpacity="0.09"
                    strokeWidth="1"
                    strokeDasharray="120 18 28 18 190 22"
                  />
                  <circle
                    cx="270"
                    cy="270"
                    r="260"
                    fill="none"
                    stroke="#C8A253"
                    strokeOpacity="0.45"
                    strokeWidth="1.5"
                    strokeDasharray="48 480"
                    strokeLinecap="round"
                  />
                  <circle cx="270" cy="10" r="3.5" fill="#C8A253" fillOpacity="0.85" />
                  <circle cx="270" cy="10" r="8" fill="#C8A253" fillOpacity="0.16" />
                  <circle cx="495" cy="400" r="2.5" fill="#7A8B71" fillOpacity="0.7" />
                </svg>
                <svg viewBox="0 0 540 540" className="hero-orbit-reverse absolute inset-0 h-full w-full">
                  <circle
                    cx="270"
                    cy="270"
                    r="246"
                    fill="none"
                    stroke="#C8A253"
                    strokeOpacity="0.22"
                    strokeWidth="1"
                    strokeDasharray="4 14"
                  />
                </svg>
              </div>

              {/* Inner sculptural ring */}
              <div
                ref={centerRingRef}
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[250px] w-[250px] sm:h-[360px] sm:w-[360px] lg:h-[470px] lg:w-[470px] rounded-full border-[26px] sm:border-[36px] lg:border-[46px] border-white bg-[#E7E1D6] shadow-[0_12px_40px_-18px_rgba(43,46,49,0.12)]"
              />

              {/* Soft grounded studio floor shadow synchronized with pose levitation */}
              <div
                ref={poseShadowRef}
                aria-hidden="true"
                className="pointer-events-none absolute bottom-2 sm:bottom-3 lg:bottom-4 left-1/2 -translate-x-1/2 h-4 w-32 sm:w-44 lg:w-52 rounded-full bg-[#2B2E31]/18 blur-md will-change-transform"
              />

              <img
                ref={poseImgRef}
                src={loriePoseImg}
                alt="Lorie holding a standing vertical split stretch"
                className="relative z-10 h-[440px] sm:h-[500px] lg:h-[620px] xl:h-[660px] w-auto max-w-none object-contain mix-blend-multiply select-none will-change-transform"
              />

              <div
                ref={verticalTextRef}
                className="hidden sm:flex absolute z-20 right-0 lg:-right-2 top-1/2 -translate-y-1/2 gap-2 [writing-mode:vertical-rl] select-none pointer-events-none will-change-transform"
              >
                <span className="font-serif text-4xl lg:text-5xl tracking-[0.3em] text-[#2B2E31]">STRETCH</span>
                <span className="text-[9px] font-semibold uppercase tracking-[0.35em] text-[#5C6260]">Yoga • Wellness • Accra</span>
              </div>
            </div>

            {/* RIGHT: Seamless Futuristic Rotating Featured Offering */}
            <div
              onPointerEnter={handleHeroSlidePause}
              onPointerLeave={handleHeroSlideResume}
              className="lg:col-span-4 flex flex-col justify-between gap-6 lg:pl-10 lg:pr-14"
            >
              {/* Circular Portal Orb with Live SVG Orbital Progress Ring & Stacked Aperture Morph */}
              <div className="hidden lg:flex justify-center pt-5">
                <div
                  ref={slideOrbWrapRef}
                  className="relative h-48 w-48 xl:h-52 xl:w-52 flex items-center justify-center will-change-transform"
                >
                  {/* Counter-rotating segmented futuristic accent ring */}
                  <svg
                    viewBox="0 0 216 216"
                    aria-hidden="true"
                    className="hero-orbit-reverse pointer-events-none absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)]"
                  >
                    <circle
                      cx="108"
                      cy="108"
                      r="104"
                      fill="none"
                      stroke="#C8A253"
                      strokeOpacity="0.28"
                      strokeWidth="1"
                      strokeDasharray="16 12 4 12"
                    />
                  </svg>

                  {/* Live 6.5s Synced Countdown Progress Ring */}
                  <svg
                    viewBox="0 0 200 200"
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
                  >
                    <circle
                      cx="100"
                      cy="100"
                      r={ORB_RING_RADIUS}
                      fill="none"
                      stroke="#2B2E31"
                      strokeOpacity="0.08"
                      strokeWidth="1.5"
                    />
                    <circle
                      ref={slideProgressRef}
                      cx="100"
                      cy="100"
                      r={ORB_RING_RADIUS}
                      fill="none"
                      stroke="#C8A253"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray={ORB_RING_CIRCUMFERENCE}
                      strokeDashoffset={ORB_RING_CIRCUMFERENCE}
                    />
                  </svg>

                  {/* Stacked Cross-Morphing Image Aperture (all 3 slides mounted for zero flicker) */}
                  <div className="relative h-40 w-40 xl:h-44 xl:w-44 rounded-full overflow-hidden ring-[6px] ring-white/90 shadow-xl bg-[#E7E1D6]">
                    {HERO_SLIDES.map((slide, idx) => (
                      <img
                        key={slide.id}
                        ref={(el) => {
                          slideOrbImgRefs.current[idx] = el;
                        }}
                        src={slide.image}
                        alt={`${slide.light} ${slide.bold}`}
                        className="absolute inset-0 h-full w-full object-cover object-[center_30%] will-change-transform"
                      />
                    ))}

                    {/* Diagonal holographic light sweep fired on each slide switch */}
                    <div
                      ref={slideOrbShimmerRef}
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-y-0 -left-1/2 z-10 w-1/2 opacity-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/75 to-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                {/* Fixed min-height stage prevents any vertical layout shift during slide swaps */}
                <div
                  ref={slideContentRef}
                  className="min-h-[168px] sm:min-h-[188px] flex flex-col justify-center space-y-3"
                >
                  <p className="gsap-slide-item text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.25em] text-[#7A8B71]">
                    {activeHeroSlide.eyebrow}
                  </p>
                  <h2 className="gsap-slide-item font-serif uppercase text-2xl sm:text-3xl lg:text-[2.15rem] leading-[1.15] tracking-[0.16em] text-[#2B2E31]">
                    <span className="font-normal">{activeHeroSlide.light}</span>{' '}
                    <span className="font-normal text-[#5A6952]">{activeHeroSlide.bold}</span>
                  </h2>
                  <p className="gsap-slide-item text-xs sm:text-sm text-[#5C6260] leading-relaxed max-w-sm">
                    {activeHeroSlide.text}
                  </p>
                  <div className="gsap-slide-item pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleHeroSlideAction(activeHeroSlide)}
                      className="group inline-flex items-center gap-2 text-xs font-semibold text-[#5C6260] hover:text-[#2B2E31] transition-colors cursor-pointer"
                    >
                      <ArrowRight className="h-3.5 w-3.5 text-[#7A8B71] group-hover:translate-x-1 transition-transform duration-300" />
                      <span className="border-b border-transparent group-hover:border-[#2B2E31] transition-colors">
                        View {activeHeroSlide.light} {activeHeroSlide.bold}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Primary CTAs */}
                <div className="gsap-hero-elem flex flex-wrap items-center gap-2.5">
                  <a
                    href="#class-catalog"
                    className="hero-btn-sheen inline-flex items-center gap-2 rounded-full bg-[#232D21] text-[#F7E7C4] px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-sm hover:bg-[#2F3C2C] hover:shadow-md transition-all duration-300"
                  >
                    <span>Book a Class</span>
                    <ChevronDown className="h-3.5 w-3.5 text-[#C8A253]" />
                  </a>
                  <a
                    href="#short-videos-vault"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#2B2E31]/15 bg-white/70 backdrop-blur-sm px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#2B2E31] hover:bg-white hover:border-[#7A8B71]/50 transition-all duration-300"
                  >
                    <Film className="h-3.5 w-3.5 text-[#C8A253]" />
                    <span>Guided Videos</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleOpenGiftModal('gift')}
                    className="lg:hidden inline-flex items-center gap-1.5 rounded-full bg-[#A44A4A] text-white px-4 py-2.5 text-xs font-semibold hover:bg-[#8f3e3e] transition-colors cursor-pointer"
                  >
                    <Gift className="h-3.5 w-3.5" />
                    <span>Gift a Pass</span>
                  </button>
                </div>

                {/* Mobile slide dots with live futuristic progress fill */}
                <div className="flex lg:hidden items-center gap-2 pt-1">
                  {HERO_SLIDES.map((s, i) => {
                    const isActive = i === heroSlideIndex;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        aria-label={`Show ${s.light} ${s.bold}`}
                        onClick={() => transitionToSlide(i)}
                        className={`relative h-1.5 rounded-full overflow-hidden transition-all duration-300 cursor-pointer ${isActive ? 'w-9 bg-[#D5CEC2]' : 'w-2 bg-[#C9C2B6]'
                          }`}
                      >
                        {isActive && (
                          <span
                            ref={mobileProgressRef}
                            className="absolute inset-0 origin-left bg-[#2B2E31] rounded-full"
                            style={{ transform: 'scaleX(0)' }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT RAIL (desktop): vertical title, kinetic index, glowing dots & scroll cue */}
          <div
            ref={(el) => {
              heroRailRef.current = el;
              railCounterRef.current = el;
            }}
            onPointerEnter={handleHeroSlidePause}
            onPointerLeave={handleHeroSlideResume}
            className="hidden lg:flex absolute right-5 xl:right-8 inset-y-10 z-20 flex-col items-center justify-between"
          >
            <span className="gsap-rail-item [writing-mode:vertical-rl] rotate-180 text-[11px] uppercase tracking-[0.3em] text-[#5C6260]">
              <span className="font-bold text-[#2B2E31]">{activeHeroSlide.light}</span> {activeHeroSlide.bold}
            </span>

            <div className="flex flex-col items-center gap-3.5">
              <span className="gsap-rail-item [writing-mode:vertical-rl] rotate-180 font-sans text-3xl font-bold text-[#2B2E31] leading-none">
                0{heroSlideIndex + 1}
              </span>
              {HERO_SLIDES.map((s, i) => {
                const isActive = i === heroSlideIndex;
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={`Show ${s.light} ${s.bold}`}
                    onClick={() => transitionToSlide(i)}
                    className="relative flex h-4 w-4 items-center justify-center cursor-pointer group"
                  >
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="hero-dot-pulse absolute h-3.5 w-3.5 rounded-full border border-[#C8A253]"
                      />
                    )}
                    <span
                      className={`rounded-full transition-all duration-300 ${isActive
                        ? 'h-2.5 w-2.5 bg-[#2B2E31] ring-2 ring-[#C8A253]/40'
                        : 'h-1.5 w-1.5 bg-[#C9C2B6] group-hover:bg-[#7A8B71] group-hover:scale-125'
                        }`}
                    />
                  </button>
                );
              })}
            </div>

            <a href="#class-catalog" className="flex flex-col items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-[#5C6260] hover:text-[#2B2E31] transition-colors">
              <span className="[writing-mode:vertical-rl] rotate-180">Scroll</span>
              <span className="flex h-7 w-4 justify-center rounded-full border border-current pt-1">
                <span className="h-1.5 w-0.5 rounded-full bg-current animate-bounce" />
              </span>
            </a>
          </div>
        </section>
      )}

      {/* Main Container: Full width for dedicated admin portal, centered max-w-7xl for public client pages */}
      <main className={`flex-1 mx-auto w-full pt-6 sm:pt-10 space-y-8 sm:space-y-10 pb-28 sm:pb-12 transition-all ${isAdminRoute
        ? 'max-w-none px-3.5 sm:px-6 lg:px-8 xl:px-12 2xl:px-16'
        : 'max-w-7xl px-3.5 sm:px-6 lg:px-8'
        }`}>

        {/* ROUTE 1: PUBLIC STUDENT BOOKING FLOW (/) */}
        {!isAdminRoute && (
          <div className="space-y-8 sm:space-y-10 animate-in fade-in duration-300 w-full max-w-full">

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
              onUpdateClass={handleUpdateClass}
              onDeleteClass={handleDeleteClass}
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
        className={`fixed inset-0 z-50 transition-all duration-300 ${isRegistrationDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        aria-modal="true"
        role="dialog"
        aria-label="Class Registration Drawer"
      >
        {/* Soft Dark Backdrop */}
        <div
          ref={drawerBackdropRef}
          className={`fixed inset-0 bg-[#232D21]/60 backdrop-blur-xs transition-opacity duration-300 ${isRegistrationDrawerOpen ? 'opacity-100' : 'opacity-0'
            }`}
          onClick={handleCloseRegistration}
          aria-hidden="true"
        />

        {/* Sliding Drawer Container */}
        <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10 w-full justify-end pointer-events-none">
          <div
            ref={drawerPanelRef}
            className={`w-full max-w-2xl bg-[#FAF8F5] shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-out border-l border-[#E6E1D8] pointer-events-auto ${isRegistrationDrawerOpen ? 'translate-x-0' : 'translate-x-full'
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
                  key={`${selectedClass?.id || 'none'}-${preselectedSlot || 'none'}-${activePassCode || 'nopass'}-${bookingInitialData ? bookingInitialData.studentName : 'fresh'}`}
                  selectedClass={selectedClass}
                  preselectedSlot={preselectedSlot}
                  initialData={bookingInitialData}
                  initialPassCode={activePassCode}
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
        onBookWithPass={(passCode, passUser) => {
          setIsGiftModalOpen(false);
          setActivePassCode(passCode);
          if (passUser) {
            setBookingInitialData(passUser);
          }
          // Ensure the pre-selected experience is an eligible studio group class
          const eligibleGroupClass = classes.find((c) => c.isPassEligible !== false && c.category === 'Yoga Classes') || classes[0];
          if (eligibleGroupClass) {
            setSelectedClass(eligibleGroupClass);
          }
          setIsRegistrationDrawerOpen(true);
        }}
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
        <div className={`mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 ${isAdminRoute
          ? 'w-full max-w-none px-4 sm:px-8 xl:px-12 2xl:px-16'
          : 'max-w-7xl px-4'
          }`}>
          <div className="flex items-center gap-3">
            <BrandLogo variant="image" size="sm" />
            <span className="hidden sm:inline text-[#2B2E31] font-medium">• Yoga Classes, Private Bookings & Special Experiences</span>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 text-[#5C6260]">
            <span>Accra, Ghana • Studio Sanctuary & Client Locations</span>
            {!isAdminRoute && (
              <>
                <span className="hidden sm:inline text-[#D8D2C4]">•</span>
                <button
                  type="button"
                  onClick={() => navigateTo('/admin')}
                  className="inline-flex items-center gap-1 text-[#7A8B71] hover:text-[#2B2E31] transition-colors cursor-pointer font-medium"
                  title="Instructor & Admin Access"
                >
                  <Lock className="h-3 w-3" />
                  <span>Instructor Portal</span>
                </button>
              </>
            )}
          </div>
        </div>
      </footer>

      {/* Sticky Floating Audio Pill (stays accessible in bottom-left corner while users browse & book) */}
      {!isAdminRoute && (
        <div
          className={`fixed bottom-5 left-5 z-40 transition-all duration-300 ease-out ${
            showStickyAudioPill
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <SanctuaryAudioPill
            isPlaying={isPlayingAudio}
            isMuted={isMuted}
            onTogglePlay={handleTogglePlay}
            onToggleMute={handleToggleMute}
            variant="floating"
          />
        </div>
      )}

      {/* Persistent Background Sanctuary Music (Plays seamlessly across browsing and booking) */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
      >
        <source src="/audio/sanctuary_mantra.mp3" type="audio/mpeg" />
        <source src="/audio/sanctuary_mantra.m4a" type="audio/mp4" />
      </audio>

    </div>
  );
}