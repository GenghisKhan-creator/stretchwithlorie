import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  X,
  Sparkles,
  Gift,
  Calendar,
  CreditCard,
  ShieldCheck,
  Check,
  ArrowRight,
  Copy,
  Download,
  Send,
  User,
  Phone,
  Mail,
  RotateCw,
  Wifi,
  Clock,
  Palette
} from 'lucide-react';
import MobileMoneyLogo from './MobileMoneyLogo';
import { PaystackIcon } from './RegistrationForm';
import { exportGiftPassPDF } from '../utils/pdfExport';
import loriePoseImg from '../assets/lorie_pose.png';

// SACRED LOTUS FLOWER SVG EMBLEM
export function LotusEmblem({ className = 'h-6 w-6 text-[#C8A253]' }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Central Petal */}
      <path
        d="M50 14C50 14 59 34 59 55C59 69 50 79 50 79C50 79 41 69 41 55C41 34 50 14 50 14Z"
        fill="currentColor"
        fillOpacity="0.9"
      />
      {/* Inner Petals */}
      <path
        d="M48 23C48 23 31 39 31 60C31 71 41 78 48 78C48 78 42 66 44 52C45 42 48 23 48 23Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
      <path
        d="M52 23C52 23 69 39 69 60C69 71 59 78 52 78C52 78 58 66 56 52C55 42 52 23 52 23Z"
        fill="currentColor"
        fillOpacity="0.75"
      />
      {/* Outer Petals */}
      <path
        d="M43 38C43 38 18 47 16 67C15 76 27 80 37 78C37 78 27 72 29 60C31 50 43 38 43 38Z"
        fill="currentColor"
        fillOpacity="0.55"
      />
      <path
        d="M57 38C57 38 82 47 84 67C85 76 73 80 63 78C63 78 73 72 71 60C69 50 57 38 57 38Z"
        fill="currentColor"
        fillOpacity="0.55"
      />
      {/* Sacred Water Ripples Base */}
      <path d="M22 84C34 88 66 88 78 84" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.65" />
      <path d="M32 90C41 92 59 92 68 90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.45" />
    </svg>
  );
}

// MANDALA SACRED GEOMETRY WATERMARK
function MandalaWatermark({ className = 'h-40 w-40 text-white/10' }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
      <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="1" />
      <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="0.8" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <line
          key={deg}
          x1="100"
          y1="10"
          x2="100"
          y2="190"
          stroke="currentColor"
          strokeWidth="0.75"
          transform={`rotate(${deg} 100 100)`}
          strokeOpacity="0.6"
        />
      ))}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <circle
          key={deg}
          cx="100"
          cy="45"
          r="14"
          stroke="currentColor"
          strokeWidth="0.9"
          transform={`rotate(${deg} 100 100)`}
          strokeOpacity="0.5"
        />
      ))}
    </svg>
  );
}

// METALLIC GOLD NFC KEYCARD CHIP SVG
function SanctuaryChipSVG({ className = 'h-8 w-10' }) {
  return (
    <svg viewBox="0 0 48 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect x="1" y="1" width="46" height="34" rx="6" fill="url(#chipGold)" stroke="#F7E7C4" strokeWidth="1" strokeOpacity="0.65" />
      <path d="M16 1V35M32 1V35M1 12H16M32 12H47M1 24H16M32 24H47" stroke="#695019" strokeWidth="0.9" strokeOpacity="0.55" />
      <rect x="19" y="9" width="10" height="18" rx="3" stroke="#695019" strokeWidth="0.9" strokeOpacity="0.5" />
      <defs>
        <linearGradient id="chipGold" x1="0" y1="0" x2="48" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F5DFAD" />
          <stop offset="0.45" stopColor="#C8A253" />
          <stop offset="1" stopColor="#9A7832" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// RE-IMAGINED YOGA SUBSCRIPTION PLANS WITH 3D CARD STYLING & PERK PILLS
const SUBSCRIPTION_PLANS = [
  {
    id: 'plan-starter',
    name: 'The Seed Flow',
    subtitle: 'Awaken Consistency',
    badge: 'Gentle Start',
    tierCode: 'SEED-02',
    classesPerMonth: 2,
    price: 380,
    savings: 'Save GH₵ 20',
    description: 'Bi-weekly mindful practice to gently loosen tight joints and restore nervous system calm.',
    themeColor: '#7A8B71',
    cardGradient: 'from-[#223020] via-[#31452E] to-[#192318]',
    borderAccent: 'border-[#96AD8B]/60',
    badgeStyle: 'bg-[#E5ECE2] text-[#232D21]',
    cardPerks: [
      '2 Studio Flows / Mo',
      'Manduka Pro Mat',
      'Herbal Tea Ritual',
      '35-Day Flex Grace'
    ],
    features: [
      '2 Studio Sessions per month (GH₵ 190/class)',
      'Complimentary Manduka Pro mat & blocks',
      'Fresh organic herbal tea ritual after flow',
      '35-day flexibility grace period',
      'Flexible reschedule up to 24h prior'
    ]
  },
  {
    id: 'plan-sanctuary',
    name: 'The Lotus Sanctuary',
    subtitle: 'Deepen Mobility & Calm',
    badge: 'Most Cherished Practice',
    tierCode: 'LOTUS-04',
    isPopular: true,
    classesPerMonth: 4,
    price: 700,
    savings: 'Save GH₵ 100',
    description: 'Weekly rhythmic practice for lasting flexibility, spine decompression & emotional grounding.',
    themeColor: '#C8A253',
    cardGradient: 'from-[#1C251B] via-[#2B3829] to-[#131A12]',
    borderAccent: 'border-[#C8A253]/75',
    badgeStyle: 'bg-gradient-to-r from-[#E6C981] to-[#C8A253] text-[#1C231A]',
    cardPerks: [
      '4 Studio Flows / Mo',
      'Priority Mat Spot',
      '10% Off Private Stretch',
      'Quarterly Guest Pass',
      '1 Class Rollover'
    ],
    features: [
      '4 Studio Classes per month (GH₵ 175/class)',
      'Priority Sanctuary mat spot reservation',
      'Complimentary mat & organic herbal tea ritual',
      '10% off any 1-on-1 Private Stretch session',
      '1 Free guest pass every quarter',
      'Roll over up to 1 unused class to next month'
    ]
  },
  {
    id: 'plan-vip',
    name: 'The Prana Immersion',
    subtitle: 'Full Body Transformation',
    badge: 'Ultimate Sanctuary Access',
    tierCode: 'PRANA-VIP',
    classesPerMonth: 8,
    price: 1350,
    savings: 'Save GH₵ 250',
    description: 'Complete studio immersion + dedicated 1-on-1 private assisted stretch session with Lorie.',
    themeColor: '#A44A4A',
    cardGradient: 'from-[#2D1D1E] via-[#232D21] to-[#141A13]',
    borderAccent: 'border-[#E2B86B]/85',
    badgeStyle: 'bg-gradient-to-r from-[#A44A4A] via-[#B85757] to-[#C8A253] text-white',
    cardPerks: [
      '8 Studio Flows / Mo',
      '1 Free Private 1-on-1',
      'Monthly Free Guest',
      'Front-Row Mat + Towel',
      'VIP WhatsApp Concierge'
    ],
    features: [
      '8 Studio Classes per month',
      '1 Private 1-on-1 Assisted Stretch session included',
      'Bring 1 guest free each month',
      'Personal postural & alignment consultation with Lorie',
      'Reserved front-row mat & complimentary studio towel',
      'VIP WhatsApp Concierge booking'
    ]
  }
];

// CUSTOMIZABLE SANCTUARY RITUAL PERKS FOR LIVE KEYCARD
const SANCTUARY_RITUAL_OPTIONS = [
  { id: 'tea-lemongrass', label: '🍵 Lemongrass & Ginger Tea', short: 'Lemongrass Tea Ritual' },
  { id: 'tea-hibiscus', label: '🌺 Hibiscus & Mint Infusion', short: 'Hibiscus Mint Ritual' },
  { id: 'aroma-lavender', label: '🌿 Lavender Cold Towel', short: 'Lavender Oil Cooldown' },
  { id: 'props-bolster', label: '🧘‍♀️ Extra Spine Bolster & Blocks', short: 'Restorative Bolster Set' }
];

// PREFERRED PRACTICE SESSIONS FOR KEYCARD
const PRACTICE_SCHEDULES = [
  'Wednesdays • 7:00 PM (Candlelight Flow)',
  'Saturdays • 8:00 AM (Morning Vinyasa)',
  'Sundays • 4:00 PM (Deep Yin & Stretch)',
  'Flexible Schedule (Any Open Session)'
];

// 4 WELLNESS PALETTES FOR THE MINDFUL GIFT CARD GENERATOR
const WELLNESS_PALETTES = [
  {
    id: 'sage',
    name: 'Eucalyptus Sanctuary',
    tagline: 'Botanical Forest & Soft Sage',
    swatchBg: 'bg-gradient-to-br from-[#7A8B71] to-[#232D21]',
    cardGradient: 'bg-gradient-to-br from-[#232D21] via-[#2F3C2C] to-[#182017]',
    borderClass: 'border-[#C8A253]/55',
    accentText: 'text-[#F7E7C4]',
    pillBg: 'bg-[#7A8B71]/30 border-[#C8A253]/40 text-[#F7E7C4]'
  },
  {
    id: 'gold',
    name: 'Champagne Sunlight',
    tagline: 'Warm Amber & Golden Lotus',
    swatchBg: 'bg-gradient-to-br from-[#E5C67B] to-[#8C6D27]',
    cardGradient: 'bg-gradient-to-br from-[#7D6020] via-[#9E7B2F] to-[#574112]',
    borderClass: 'border-[#F7E7C4]/80',
    accentText: 'text-[#FFF6E0]',
    pillBg: 'bg-black/25 border-[#F7E7C4]/45 text-[#FFF6E0]'
  },
  {
    id: 'blush',
    name: 'Terracotta Sunset',
    tagline: 'Earthy Rose & Warm Clay',
    swatchBg: 'bg-gradient-to-br from-[#C46868] to-[#7D4545]',
    cardGradient: 'bg-gradient-to-br from-[#7A3E3E] via-[#944F4F] to-[#542828]',
    borderClass: 'border-[#F2D5D7]/60',
    accentText: 'text-[#FCECEF]',
    pillBg: 'bg-black/25 border-[#F2D5D7]/35 text-[#FCECEF]'
  },
  {
    id: 'midnight',
    name: 'Midnight Nirvana',
    tagline: 'Obsidian Zen & Starlight Gold',
    swatchBg: 'bg-gradient-to-br from-[#2A3329] to-[#0D120C]',
    cardGradient: 'bg-gradient-to-br from-[#10160F] via-[#1C261A] to-[#090C08]',
    borderClass: 'border-[#C8A253]/75',
    accentText: 'text-[#E8C87A]',
    pillBg: 'bg-[#C8A253]/20 border-[#C8A253]/50 text-[#F7E7C4]'
  }
];

// GIFT CARD PRESETS
const GIFT_PRESETS = [
  { amount: 200, label: 'Single Flow', desc: '1 Group Studio Session', icon: '🌱' },
  { amount: 380, label: 'Starter Duet', desc: '2 Group Studio Sessions', icon: '🌿' },
  { amount: 700, label: 'Lotus Month', desc: '4 Classes + Tea Ritual', icon: '🪷' },
  { amount: 850, label: 'Private Sanctuary', desc: '1-on-1 Private Stretch', icon: '✨' },
  { amount: 1350, label: 'VIP Immersion', desc: '8 Classes + 1 Private', icon: '👑' }
];

// QUICK CUSTOM AMOUNT INCREMENTS
const CUSTOM_AMOUNT_QUICK_PICKS = [250, 500, 1000, 1500, 2000];

// 1-CLICK MINDFUL AFFIRMATION BUTTONS FOR PERSONALIZING GIFT MESSAGES
const MINDFUL_AFFIRMATIONS = [
  {
    id: 'peace-grounding',
    label: 'Inner peace & grounding',
    icon: '🪷',
    message: 'May this time on the mat bring you inner peace, deep grounding, and gentle physical renewal.'
  },
  {
    id: 'vitality-breath',
    label: 'Radiant vitality & deep breath',
    icon: '✨',
    message: 'Wishing you radiant vitality, deep restorative breath, and effortless flexibility in body and mind.'
  },
  {
    id: 'mindful-stillness',
    label: 'Mindful stillness & calm',
    icon: '🌿',
    message: 'A sanctuary of mindful stillness and warm herbal calm, specially chosen to rejuvenate your spirit.'
  },
  {
    id: 'strength-grace',
    label: 'Strength & grace on the mat',
    icon: '☀️',
    message: 'Here is to finding quiet strength in your movement, release in every stretch, and grace in your soul.'
  }
];

// HELPER: Calculate what a gift voucher amount unlocks
function getGiftExperienceEquivalent(amount) {
  const val = Number(amount) || 0;
  if (val >= 1350) return 'Unlocks VIP 8-Class Immersion + 1 Private Stretch';
  if (val >= 850) return 'Unlocks 1-on-1 Private Assisted Stretch + Group Flow';
  if (val >= 700) return 'Unlocks 4-Class Lotus Sanctuary Pass + Tea Ritual';
  if (val >= 380) return 'Unlocks 2-Class Seed Flow Pass + Tea Ritual';
  if (val >= 200) return 'Unlocks 1 Full Studio Yoga Flow + Tea Ritual';
  return 'Full Sanctuary Credit Toward Any Yoga Experience';
}

export default function WellnessGiftCardModal({
  isOpen,
  onClose,
  initialTab = 'subscription', // 'subscription' | 'gift'
  onSuccessBooking
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'subscription' | 'gift'

  const modalBackdropRef = useRef(null);
  const modalCardRef = useRef(null);
  const memberKeycardRef = useRef(null);
  const giftCertificateRef = useRef(null);
  const giftQuoteBoxRef = useRef(null);

  // Interactive 3D Tilt & Flip States for Member Keycard
  const [keycardTilt, setKeycardTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, isHovering: false });
  const [isKeycardFlipped, setIsKeycardFlipped] = useState(false);

  // Interactive 3D Tilt & Flip States for Mindful Gift Card
  const [giftCardTilt, setGiftCardTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, isHovering: false });
  const [isGiftCardFlipped, setIsGiftCardFlipped] = useState(false);

  // Interactive 3D Flip State for Issued Pass on Success Screen
  const [isCompletedCardFlipped, setIsCompletedCardFlipped] = useState(false);

  // Subscription state
  const [selectedPlanId, setSelectedPlanId] = useState('plan-sanctuary');
  const [selectedRitualPerks, setSelectedRitualPerks] = useState(['tea-lemongrass', 'aroma-lavender']);
  const [subFormData, setSubFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    startDate: new Date().toISOString().split('T')[0],
    preferredTime: PRACTICE_SCHEDULES[0],
    paymentChannel: 'momo',
    momoNetwork: 'MTN',
    momoNumber: '',
    notes: '',
    agreedToTerms: false
  });

  // Gift Card state
  const [giftAmount, setGiftAmount] = useState(700);
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [customAmountValue, setCustomAmountValue] = useState('500');
  const [giftTheme, setGiftTheme] = useState('sage'); // 'sage' | 'gold' | 'blush' | 'midnight'
  const [selectedAffirmationId, setSelectedAffirmationId] = useState(MINDFUL_AFFIRMATIONS[0].id);
  const [giftFormData, setGiftFormData] = useState({
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    personalNote: MINDFUL_AFFIRMATIONS[0].message,
    deliveryOption: 'whatsapp',
    paymentChannel: 'momo',
    momoNetwork: 'MTN',
    momoNumber: '',
    agreedToTerms: false
  });

  // Flow states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState(0);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [errors, setErrors] = useState({});

  useGSAP(() => {
    if (!isOpen) return;

    if (modalBackdropRef.current) {
      gsap.fromTo(
        modalBackdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    }

    if (modalCardRef.current) {
      gsap.fromTo(
        modalCardRef.current,
        { scale: 0.92, opacity: 0, y: 24 },
        { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.4)', clearProps: 'transform' }
      );
    }
  }, [isOpen]);

  // Animate 3D Member Keycard when tier changes
  useGSAP(() => {
    if (!isOpen || activeTab !== 'subscription' || !memberKeycardRef.current) return;
    gsap.fromTo(
      memberKeycardRef.current,
      { scale: 0.97, y: 6 },
      { scale: 1, y: 0, duration: 0.38, ease: 'back.out(2)' }
    );
  }, [selectedPlanId, activeTab, isOpen]);

  // Animate 3D Gift Certificate when palette or amount changes
  useGSAP(() => {
    if (!isOpen || activeTab !== 'gift' || !giftCertificateRef.current) return;
    gsap.fromTo(
      giftCertificateRef.current,
      { scale: 0.975, y: 5 },
      { scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.8)' }
    );
  }, [giftTheme, giftAmount, isCustomAmount, activeTab, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selectedPlan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[1];
  const activePalette = WELLNESS_PALETTES.find((p) => p.id === giftTheme) || WELLNESS_PALETTES[0];
  const finalGiftAmount = isCustomAmount ? (parseInt(customAmountValue, 10) || 0) : giftAmount;

  // 3D Pointer Tilt Handlers
  const handleCardMouseMove = (e, setTiltState) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 10;
    const glareX = Math.round((x / rect.width) * 100);
    const glareY = Math.round((y / rect.height) * 100);
    setTiltState({ rotateX, rotateY, glareX, glareY, isHovering: true });
  };

  const handleCardMouseLeave = (setTiltState) => {
    setTiltState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, isHovering: false });
  };

  // Toggle complimentary sanctuary ritual perk on Member Keycard
  const toggleRitualPerk = (perkId) => {
    setSelectedRitualPerks((prev) =>
      prev.includes(perkId)
        ? prev.length > 1 ? prev.filter((id) => id !== perkId) : prev
        : [...prev, perkId]
    );
  };

  // 1-Click Mindful Affirmation Handler with live quote pulse
  const handleSelectAffirmation = (affirmation) => {
    setSelectedAffirmationId(affirmation.id);
    setGiftFormData((prev) => ({ ...prev, personalNote: affirmation.message }));
    if (giftQuoteBoxRef.current) {
      gsap.fromTo(
        giftQuoteBoxRef.current,
        { scale: 0.96, backgroundColor: 'rgba(200, 162, 83, 0.35)' },
        { scale: 1, backgroundColor: 'rgba(0, 0, 0, 0.22)', duration: 0.45, ease: 'power2.out' }
      );
    }
  };

  // Validation
  const validateForm = () => {
    const errs = {};

    if (activeTab === 'subscription') {
      if (!subFormData.fullName.trim()) errs.subFullName = 'Please provide your full name for membership registration.';
      if (!subFormData.phone.trim()) errs.subPhone = 'WhatsApp or phone number is required.';
      if (!subFormData.email.trim() || !subFormData.email.includes('@')) errs.subEmail = 'Valid email is required for monthly pass receipt.';
      if (subFormData.paymentChannel === 'momo' && !subFormData.momoNumber.trim()) {
        errs.subMomoNumber = 'Mobile Money number is required to push authorization prompt.';
      }
      if (!subFormData.agreedToTerms) {
        errs.subAgreedToTerms = 'Please confirm agreement to the studio commitments before proceeding.';
      }
    } else {
      if (isCustomAmount && (!finalGiftAmount || finalGiftAmount < 100)) {
        errs.giftAmount = 'Minimum gift voucher amount is GH₵ 100.';
      }
      if (!giftFormData.recipientName.trim()) errs.recipientName = 'Please enter the recipient’s name.';
      if (!giftFormData.senderName.trim()) errs.senderName = 'Please enter your name as the sender.';
      if (!giftFormData.senderPhone.trim()) errs.senderPhone = 'Your contact number is required.';
      if (giftFormData.paymentChannel === 'momo' && !giftFormData.momoNumber.trim()) {
        errs.giftMomoNumber = 'Mobile Money number is required to push authorization prompt.';
      }
      if (!giftFormData.agreedToTerms) {
        errs.giftAgreedToTerms = 'Please confirm agreement to the studio commitments before proceeding.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Process Simulated Payment
  const handleProcessOrder = () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmissionStep(1);

    setTimeout(() => setSubmissionStep(2), 700);
    setTimeout(() => setSubmissionStep(3), 1400);

    const activeRitualLabels = SANCTUARY_RITUAL_OPTIONS
      .filter((r) => selectedRitualPerks.includes(r.id))
      .map((r) => r.short);

    setTimeout(() => {
      const order = activeTab === 'subscription'
        ? {
          orderId: `SUB-${Date.now().toString().slice(-6)}`,
          type: 'subscription',
          title: selectedPlan.name,
          subtitle: selectedPlan.subtitle,
          planId: selectedPlan.id,
          amount: selectedPlan.price,
          classesCount: selectedPlan.classesPerMonth,
          buyerName: subFormData.fullName,
          buyerPhone: subFormData.phone,
          buyerEmail: subFormData.email,
          recipientName: subFormData.fullName,
          startDate: subFormData.startDate,
          preferredTime: subFormData.preferredTime,
          ritualPerks: activeRitualLabels,
          voucherCode: `SWL-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          dateIssued: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          paymentMethod: subFormData.paymentChannel === 'momo' ? `${subFormData.momoNetwork} MoMo` : 'Card',
          theme: 'sage'
        }
        : {
          orderId: `GFT-${Date.now().toString().slice(-6)}`,
          type: 'gift',
          title: `Wellness Gift Card (GH₵ ${finalGiftAmount})`,
          amount: finalGiftAmount,
          buyerName: giftFormData.senderName,
          buyerPhone: giftFormData.senderPhone,
          buyerEmail: giftFormData.senderEmail || '',
          recipientName: giftFormData.recipientName,
          recipientPhone: giftFormData.recipientPhone || '',
          recipientEmail: giftFormData.recipientEmail || '',
          personalNote: giftFormData.personalNote,
          voucherCode: `GIFT-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          dateIssued: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          paymentMethod: giftFormData.paymentChannel === 'momo' ? `${giftFormData.momoNetwork} MoMo` : 'Card',
          theme: giftTheme,
          paletteName: activePalette.name
        };

      setCompletedOrder(order);
      setIsSubmitting(false);
      setSubmissionStep(0);
      if (onSuccessBooking) onSuccessBooking(order);
    }, 2100);
  };

  const copyVoucherCode = () => {
    if (!completedOrder?.voucherCode) return;
    navigator.clipboard.writeText(completedOrder.voucherCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!completedOrder) return;
    const isSub = completedOrder.type === 'subscription';
    const text = isSub
      ? `🌿 *Stretch with Lorie - Sanctuary Pass Activated*\n\nNamaste Lorie! I just activated *${completedOrder.title}* (${completedOrder.orderId}) for GH₵ ${completedOrder.amount}.\n\n*Member:* ${completedOrder.buyerName}\n*Phone:* ${completedOrder.buyerPhone}\n*Preferred Practice:* ${subFormData.preferredTime}\n*Start Date:* ${subFormData.startDate}\n*Voucher:* ${completedOrder.voucherCode}\n\nExcited to deepen my practice in the sanctuary! 🪷`
      : `🪷 *A Mindful Wellness Gift for You!* 🪷\n\nDearest *${completedOrder.recipientName}*,\n\n${completedOrder.buyerName} has blessed you with a *Stretch with Lorie Wellness Card* valued at *GH₵ ${completedOrder.amount}*!\n\n"${completedOrder.personalNote}"\n\n🌿 *Voucher Code:* ${completedOrder.voucherCode}\n🎨 *Theme:* ${completedOrder.paletteName || 'Eucalyptus Sanctuary'}\n📍 *Sanctuary:* Suite 4B, East Legon, Accra\n📞 *Book via WhatsApp:* +233 24 123 4567\n\nEnjoy your rejuvenating stretch journey! ✨`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleDownloadGiftPass = async () => {
    if (!completedOrder) return;
    try {
      setIsExportingPdf(true);
      await exportGiftPassPDF(completedOrder);
    } catch (err) {
      console.error('Failed to generate gift pass PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Active Ritual Short Labels for the Live 3D Keycard
  const activeRitualShortLabels = SANCTUARY_RITUAL_OPTIONS
    .filter((r) => selectedRitualPerks.includes(r.id))
    .map((r) => r.short);

  return (
    <div
      ref={modalBackdropRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto no-scrollbar bg-[#181B1C]/80 backdrop-blur-md p-2.5 sm:p-4 sm:py-6 overscroll-contain"
    >
      <div className="flex min-h-full items-center justify-center py-2 sm:py-4">
        <div
          ref={modalCardRef}
          className="relative w-full max-w-2xl rounded-3xl bg-[#FAF8F5] border border-[#E6E1D8] shadow-2xl overflow-hidden my-auto max-h-[94dvh] sm:max-h-[92vh] flex flex-col text-[#2B2E31]"
        >

          {/* SCROLLABLE INNER CONTAINER: Header + Body scroll naturally together (Header is NOT fixed) */}
          <div className="flex-1 overflow-y-auto no-scrollbar overscroll-contain">

            {/* ========================================================= */}
            {/* YOGA-THEMED ARTISANAL HEADER */}
            {/* ========================================================= */}
            <div className="relative bg-gradient-to-r from-[#1E261D] via-[#2A3728] to-[#1C231A] p-5 sm:p-6 text-white border-b border-[#C8A253]/35 overflow-hidden">
              {/* Ambient gold glow & subtle geometric mandala */}
              <div className="pointer-events-none absolute -right-12 -top-12 opacity-35">
                <MandalaWatermark className="h-44 w-44 text-[#C8A253]" />
              </div>
              <div className="pointer-events-none absolute left-1/3 -bottom-8 h-32 w-32 rounded-full bg-[#7A8B71]/20 blur-2xl" />

              <div className="relative z-10 flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#C8A253]/20 border border-[#C8A253]/50 px-3 py-0.5 text-[11px] font-semibold text-[#F7E7C4] mb-2 shadow-2xs">
                    <LotusEmblem className="h-3.5 w-3.5 text-[#C8A253]" />
                    <span>Sanctuary Offerings • Prāṇa & Śānti</span>
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#F7F4EF] leading-tight">
                    Studio Membership & Mindful Gifting
                  </h2>
                  <p className="text-xs sm:text-sm text-[#E6E1D8]/85 mt-1 leading-relaxed max-w-lg">
                    Customize your interactive 3D Sanctuary Member Keycard or design a bespoke Mindful Gift Voucher.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full bg-white/10 hover:bg-white/20 p-2 text-white/80 hover:text-white transition-colors cursor-pointer border border-white/10 shrink-0"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* CREATIVE YOGA DUAL-PILL SWITCHER */}
              {!completedOrder && (
                <div className="relative z-10 mt-5 grid grid-cols-2 gap-2 bg-[#141A13]/80 p-1.5 rounded-2xl border border-[#C8A253]/30 backdrop-blur-xs">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('subscription'); setErrors({}); }}
                    className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'subscription'
                      ? 'bg-gradient-to-r from-[#FAF8F5] to-[#F1F4EF] text-[#232D21] shadow-md font-bold ring-1 ring-[#C8A253]/60'
                      : 'text-[#E6E1D8]/75 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <LotusEmblem className={`h-4 w-4 ${activeTab === 'subscription' ? 'text-[#7A8B71]' : 'text-[#C8A253]'}`} />
                    <div className="text-left leading-tight">
                      <span className="block">Monthly Flow Pass</span>
                      <span className="text-[10px] font-normal opacity-75">3D Member Keycard</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('gift'); setErrors({}); }}
                    className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'gift'
                      ? 'bg-gradient-to-r from-[#FAF8F5] to-[#F1F4EF] text-[#232D21] shadow-md font-bold ring-1 ring-[#C8A253]/60'
                      : 'text-[#E6E1D8]/75 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <Gift className={`h-4 w-4 ${activeTab === 'gift' ? 'text-[#A44A4A]' : 'text-[#E6E1D8]'}`} />
                    <div className="text-left leading-tight">
                      <span className="block">Mindful Gift Card</span>
                      <span className="text-[10px] font-normal opacity-75">4 Palettes & Affirmations</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* ========================================================= */}
            {/* MODAL BODY */}
            {/* ========================================================= */}
            <div className="p-4 sm:p-6 space-y-6">

              {/* ========================================================= */}
              {/* SUCCESS CELEBRATION SCREEN */}
              {/* ========================================================= */}
              {completedOrder ? (
                <div className="space-y-6 animate-in zoom-in-95 duration-200">
                  <div className="text-center space-y-2">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E5ECE2] text-[#5A6952] ring-8 ring-[#E5ECE2]/40">
                      <LotusEmblem className="h-8 w-8 text-[#7A8B71]" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5ECE2] border border-[#DCE4D9] px-3 py-1 text-xs font-semibold text-[#5A6952]">
                      <Sparkles className="h-3.5 w-3.5 text-[#C8A253]" /> Payment Authorized via Paystack
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B2E31]">
                      {completedOrder.type === 'subscription' ? 'Your Sanctuary Keycard is Active!' : 'Mindful Gift Pass Issued!'}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5C6260] max-w-md mx-auto">
                      {completedOrder.type === 'subscription'
                        ? `Welcome to consistent yoga and renewal. Your ${completedOrder.title} is now active for ${completedOrder.buyerName}.`
                        : `A digital wellness certificate (${completedOrder.paletteName}) has been lovingly prepared for ${completedOrder.recipientName}.`}
                    </p>
                  </div>

                  {/* RENDERED LUXURY TACTILE PASS VOUCHER (3D FLIPPABLE) */}
                  <div className="space-y-2 max-w-[340px] sm:max-w-[460px] mx-auto w-full">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] sm:text-[11px] font-semibold text-[#5C6260]">
                        {isCompletedCardFlipped ? 'Back of Pass' : 'Front of Pass (Tap to flip)'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCompletedCardFlipped((prev) => !prev)}
                        className="inline-flex items-center gap-1 rounded-full bg-white border border-[#D5CEC2] hover:border-[#7A8B71] px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-[#232D21] shadow-2xs transition-all cursor-pointer"
                      >
                        <RotateCw className={`h-3 w-3 text-[#7A8B71] transition-transform duration-500 ${isCompletedCardFlipped ? 'rotate-180' : ''}`} />
                        <span>{isCompletedCardFlipped ? 'Front' : 'Flip 180°'}</span>
                      </button>
                    </div>

                    <div style={{ perspective: '1300px' }} className="w-full select-none">
                      <div
                        onClick={() => setIsCompletedCardFlipped((prev) => !prev)}
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: `rotateY(${isCompletedCardFlipped ? 180 : 0}deg)`,
                          transition: 'transform 0.68s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                        className="relative grid grid-cols-1 cursor-pointer"
                        title="Click to flip pass"
                      >
                        {/* FRONT FACE OF COMPLETED VOUCHER */}
                        <div
                          style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(0deg)'
                          }}
                          className={`col-start-1 row-start-1 relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 text-white shadow-xl border flex flex-col justify-between ${completedOrder.theme === 'gold'
                            ? 'bg-gradient-to-br from-[#7D6020] via-[#9E7B2F] to-[#574112] border-[#F7E7C4]/80'
                            : completedOrder.theme === 'blush'
                              ? 'bg-gradient-to-br from-[#7A3E3E] via-[#944F4F] to-[#542828] border-[#F2D5D7]/60'
                              : completedOrder.theme === 'midnight'
                                ? 'bg-gradient-to-br from-[#10160F] via-[#1C261A] to-[#090C08] border-[#C8A253]/75'
                                : 'bg-gradient-to-br from-[#232D21] via-[#2F3C2C] to-[#1C241B] border-[#C8A253]/50'
                            }`}
                        >
                          <div className="pointer-events-none absolute -right-8 -bottom-8 opacity-25">
                            <MandalaWatermark className="h-32 sm:h-40 w-32 sm:w-40 text-[#C8A253]" />
                          </div>

                          <div className="flex items-center justify-between text-[10px] sm:text-xs text-[#E6E1D8]/80 pb-2 border-b border-white/15">
                            <div className="flex items-center gap-1.5">
                              <LotusEmblem className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#C8A253]" />
                              <span className="font-serif tracking-widest uppercase font-bold text-[#F7F4EF]">
                                Stretch with Lorie
                              </span>
                            </div>
                            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[8px] sm:text-[9px] font-bold text-[#F7E7C4] border border-white/20">
                              {completedOrder.type === 'subscription' ? 'MEMBER KEYCARD' : 'GIFT VOUCHER'}
                            </span>
                          </div>

                          <div className="my-2.5">
                            <div className="text-[8px] sm:text-[9px] uppercase tracking-wider text-[#E6E1D8]/70">
                              {completedOrder.type === 'subscription' ? 'Member Name' : 'Gifted With Love To'}
                            </div>
                            <h4 className="text-base sm:text-xl font-serif font-bold text-[#F7F4EF] truncate">
                              {completedOrder.recipientName}
                            </h4>
                            {completedOrder.personalNote && (
                              <p className="mt-1 text-[10px] sm:text-xs italic text-[#E6E1D8]/95 bg-black/25 px-2.5 py-1.5 rounded-xl border border-white/10 line-clamp-2">
                                &ldquo;{completedOrder.personalNote}&rdquo;
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-white/15 flex items-center justify-between">
                            <div>
                              <span className="text-[8px] sm:text-[9px] uppercase text-[#E6E1D8]/70 block font-medium">Pass Value</span>
                              <span className="text-base sm:text-xl font-bold font-serif text-[#F7E7C4]">
                                GH₵ {completedOrder.amount}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-[8px] sm:text-[9px] uppercase text-[#E6E1D8]/70 block font-medium">Voucher Code</span>
                              <span className="font-mono text-xs sm:text-sm font-bold tracking-wider text-white bg-black/35 px-2.5 py-0.5 rounded-lg border border-white/20 inline-block">
                                {completedOrder.voucherCode}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* BACK FACE OF COMPLETED VOUCHER */}
                        <div
                          style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                          }}
                          className={`col-start-1 row-start-1 relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 text-white shadow-xl border flex flex-col justify-between ${completedOrder.theme === 'gold'
                            ? 'bg-gradient-to-br from-[#574112] via-[#7D6020] to-[#3B2B0A] border-[#F7E7C4]/80'
                            : completedOrder.theme === 'blush'
                              ? 'bg-gradient-to-br from-[#542828] via-[#7A3E3E] to-[#3A1A1A] border-[#F2D5D7]/60'
                              : completedOrder.theme === 'midnight'
                                ? 'bg-gradient-to-br from-[#090C08] via-[#151D13] to-[#050705] border-[#C8A253]/75'
                                : 'bg-gradient-to-br from-[#1C241B] via-[#232D21] to-[#121811] border-[#C8A253]/50'
                            }`}
                        >
                          <div className="-mx-3.5 sm:-mx-5 h-6 sm:h-7 bg-black/55 border-y border-[#C8A253]/40 flex items-center justify-between px-4 sm:px-5">
                            <span className="font-mono text-[8px] sm:text-[9px] tracking-widest text-[#C8A253] uppercase">
                              VOUCHER • {completedOrder.orderId}
                            </span>
                            <span className="font-mono text-[8px] sm:text-[9px] text-[#E6E1D8]/75">
                              {completedOrder.dateIssued}
                            </span>
                          </div>

                          <div className="my-2 space-y-1 text-[10px] sm:text-xs text-[#E6E1D8]/90">
                            <span className="text-[9px] uppercase tracking-wider text-[#C8A253] font-bold block">
                              How to Use at the Sanctuary
                            </span>
                            <p className="leading-snug">
                              Present code <span className="font-mono font-bold text-[#F7E7C4]">{completedOrder.voucherCode}</span> on WhatsApp or at Suite 4B, East Legon.
                            </p>
                            <p className="text-[9px] sm:text-[10px] text-[#E6E1D8]/75">
                              Includes Manduka Pro mat reservation & organic herbal tea ritual.
                            </p>
                          </div>

                          <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[9px] sm:text-[10px] text-[#F7E7C4]">
                            <span>📍 Suite 4B, East Legon</span>
                            <span className="underline font-semibold">Tap to flip ↻</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTONS ON SUCCESS */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] text-white py-3.5 px-4 font-bold text-sm shadow-md hover:bg-[#20ba5a] transition-all hover:scale-[1.01] cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                      <span>
                        {completedOrder.type === 'subscription' ? 'Confirm Start Date on WhatsApp' : 'Share Mindful Gift on WhatsApp'}
                      </span>
                    </button>

                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={copyVoucherCode}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#E6E1D8] bg-white py-2.5 px-3 text-xs font-semibold text-[#2B2E31] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                      >
                        {copiedCode ? <Check className="h-3.5 w-3.5 text-[#7A8B71]" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedCode ? 'Code Copied!' : 'Copy Voucher Code'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadGiftPass}
                        disabled={isExportingPdf}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#E6E1D8] bg-white py-2.5 px-3 text-xs font-semibold text-[#2B2E31] hover:bg-[#FAF8F5] transition-colors disabled:opacity-60 cursor-pointer"
                      >
                        {isExportingPdf ? (
                          <>
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#7A8B71] border-t-transparent shrink-0" />
                            <span>Preparing PDF...</span>
                          </>
                        ) : (
                          <>
                            <Download className="h-3.5 w-3.5 text-[#7A8B71]" />
                            <span>Download Pass PDF</span>
                          </>
                        )}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCompletedOrder(null);
                        onClose();
                      }}
                      className="w-full text-center text-xs text-[#5C6260] hover:text-[#2B2E31] font-semibold py-1.5 transition-colors cursor-pointer"
                    >
                      Close & Return to Studio
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* ========================================================= */}
                  {/* TAB 1: MONTHLY SUBSCRIPTION FLOW & LIVE 3D MEMBER KEYCARD */}
                  {/* ========================================================= */}
                  {activeTab === 'subscription' && (
                    <div className="space-y-6">

                      {/* ===================================================== */}
                      {/* LIVE 3D SANCTUARY MEMBER KEYCARD PREVIEW (INTERACTIVE) */}
                      {/* ===================================================== */}
                      <div className="space-y-2 max-w-[340px] sm:max-w-[460px] mx-auto w-full">
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#232D21] flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-[#C8A253]" />
                            <span>3D Sanctuary Keycard</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => setIsKeycardFlipped((prev) => !prev)}
                            className="inline-flex items-center gap-1 rounded-full bg-[#232D21] hover:bg-[#2F3C2C] text-[#F7E7C4] border border-[#C8A253]/60 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] font-semibold shadow-sm transition-all cursor-pointer"
                          >
                            <RotateCw className={`h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#C8A253] transition-transform duration-500 ${isKeycardFlipped ? 'rotate-180' : ''}`} />
                            <span>{isKeycardFlipped ? 'Flip to Front' : 'Flip Card 180°'}</span>
                          </button>
                        </div>

                        {/* 3D PERSPECTIVE STAGE WITH COMPACT CREDIT-CARD PROPORTIONS */}
                        <div
                          style={{ perspective: '1300px' }}
                          className="w-full select-none"
                        >
                          <div
                            ref={memberKeycardRef}
                            onClick={() => setIsKeycardFlipped((prev) => !prev)}
                            onMouseMove={(e) => handleCardMouseMove(e, setKeycardTilt)}
                            onMouseLeave={() => handleCardMouseLeave(setKeycardTilt)}
                            style={{
                              transformStyle: 'preserve-3d',
                              transform: `rotateX(${keycardTilt.rotateX}deg) rotateY(${(isKeycardFlipped ? 180 : 0) + (isKeycardFlipped ? -keycardTilt.rotateY : keycardTilt.rotateY)}deg)`,
                              transition: 'transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)'
                            }}
                            className="relative grid grid-cols-1 cursor-pointer group"
                            title="Tap anywhere on keycard to flip 180°"
                          >
                            {/* ================= FRONT FACE OF 3D MEMBER KEYCARD ================= */}
                            <div
                              style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transform: 'rotateY(0deg)'
                              }}
                              className={`col-start-1 row-start-1 relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 text-white shadow-2xl border-2 flex flex-col justify-between ${selectedPlan.borderAccent} bg-gradient-to-br ${selectedPlan.cardGradient}`}
                            >
                              {/* Dynamic 3D Metallic Foil Glare Overlay */}
                              <div
                                className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
                                style={{
                                  opacity: keycardTilt.isHovering ? 0.28 : 0.1,
                                  background: `radial-gradient(circle at ${keycardTilt.glareX}% ${keycardTilt.glareY}%, rgba(247, 231, 196, 0.65), transparent 60%)`
                                }}
                              />

                              {/* Background Yoga Pose Silhouette & Sacred Geometry */}
                              <div className="pointer-events-none absolute right-2 bottom-0 z-0 opacity-15">
                                <img
                                  src={loriePoseImg}
                                  alt=""
                                  aria-hidden="true"
                                  className="h-28 sm:h-40 w-auto object-contain filter brightness-125 contrast-125"
                                />
                              </div>
                              <div className="pointer-events-none absolute -right-8 -top-8 opacity-20">
                                <MandalaWatermark className="h-32 sm:h-44 w-32 sm:w-44 text-[#C8A253]" />
                              </div>

                              <div className="relative z-10 space-y-2.5 sm:space-y-3.5">
                                {/* Top Bar: Brand + Dynamic Tier Badge */}
                                <div className="flex items-center justify-between gap-2 pb-2 sm:pb-2.5 border-b border-white/15">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 border border-[#C8A253]/40">
                                      <LotusEmblem className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#C8A253]" />
                                    </div>
                                    <div className="min-w-0">
                                      <span className="font-serif tracking-widest text-[10px] sm:text-xs uppercase font-bold text-[#F7F4EF] block leading-none truncate">
                                        Stretch with Lorie
                                      </span>
                                      <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-[#C8A253] font-semibold mt-0.5 block">
                                        Keycard • {selectedPlan.tierCode}
                                      </span>
                                    </div>
                                  </div>

                                  <span className={`rounded-full px-2 py-0.5 sm:px-2.5 text-[9px] sm:text-[10px] font-bold tracking-wide shadow-sm shrink-0 ${selectedPlan.badgeStyle}`}>
                                    {selectedPlan.badge}
                                  </span>
                                </div>

                                {/* Middle Row: Always Horizontal on Mobile & Desktop like a Real Card */}
                                <div className="flex items-center justify-between gap-2">
                                  <div className="min-w-0 space-y-1">
                                    <div className="flex items-center gap-1.5">
                                      <SanctuaryChipSVG className="h-5 w-7 sm:h-6 sm:w-8 shrink-0" />
                                      <Wifi className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#C8A253]/80 rotate-90" />
                                      <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-wider text-[#E6E1D8]/70 truncate">
                                        NFC Pass
                                      </span>
                                    </div>

                                    <div className="min-w-0">
                                      <h4 className="text-sm sm:text-xl font-serif font-bold text-[#F7F4EF] tracking-tight truncate">
                                        {subFormData.fullName.trim() || 'Your Name on Mat'}
                                      </h4>
                                      <p className="text-[10px] sm:text-xs text-[#F7E7C4] font-semibold truncate">
                                        {selectedPlan.name} • {selectedPlan.classesPerMonth} Sessions/Mo
                                      </p>
                                    </div>
                                  </div>

                                  <div className="shrink-0 text-right bg-black/25 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-white/10">
                                    <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-[#E6E1D8]/70 block">
                                      Monthly
                                    </span>
                                    <span className="font-serif text-base sm:text-xl font-bold text-[#F7E7C4] block leading-tight">
                                      GH₵ {selectedPlan.price}
                                    </span>
                                    <span className="text-[8px] sm:text-[9px] text-[#96AD8B] font-semibold block">
                                      {selectedPlan.savings}
                                    </span>
                                  </div>
                                </div>

                                {/* Compact Single-Row Perks Strip on Mobile (No Scrollbar) */}
                                <div className="flex items-center gap-1 overflow-hidden py-0.5">
                                  {selectedPlan.cardPerks.slice(0, 2).map((perk, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1 rounded-full bg-white/12 border border-[#C8A253]/40 px-2 py-0.5 text-[8.5px] sm:text-[10px] font-semibold text-[#F7F4EF] whitespace-nowrap shrink-0"
                                    >
                                      <Check className="h-2.5 w-2.5 text-[#C8A253]" />
                                      {perk}
                                    </span>
                                  ))}
                                  {activeRitualShortLabels.slice(0, 1).map((ritual, idx) => (
                                    <span
                                      key={`ritual-${idx}`}
                                      className="inline-flex items-center gap-1 rounded-full bg-[#C8A253]/25 border border-[#F7E7C4]/50 px-2 py-0.5 text-[8.5px] sm:text-[10px] font-semibold text-[#F7E7C4] whitespace-nowrap shrink-0"
                                    >
                                      <Sparkles className="h-2.5 w-2.5 text-[#F7E7C4]" />
                                      {ritual}
                                    </span>
                                  ))}
                                  {(selectedPlan.cardPerks.length + activeRitualShortLabels.length > 3) && (
                                    <span className="rounded-full bg-black/30 border border-white/15 px-1.5 py-0.5 text-[8px] sm:text-[9px] text-[#E6E1D8]/85 whitespace-nowrap shrink-0">
                                      +{selectedPlan.cardPerks.length + activeRitualShortLabels.length - 3} more
                                    </span>
                                  )}
                                </div>

                                {/* Bottom Metadata Strip: Preferred Practice & Flip Hint */}
                                <div className="pt-2 border-t border-white/15 flex items-center justify-between gap-2 text-[9px] sm:text-[10px] text-[#E6E1D8]/85">
                                  <span className="flex items-center gap-1 font-medium truncate">
                                    <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#C8A253] shrink-0" />
                                    <span className="truncate">{subFormData.preferredTime}</span>
                                  </span>
                                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 group-hover:bg-[#C8A253]/30 border border-[#C8A253]/40 px-2 py-0.5 text-[8.5px] sm:text-[9px] font-bold text-[#F7E7C4] shrink-0 transition-colors">
                                    <RotateCw className="h-2.5 w-2.5" />
                                    Flip
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* ================= BACK FACE OF 3D MEMBER KEYCARD ================= */}
                            <div
                              style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)'
                              }}
                              className={`col-start-1 row-start-1 relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 text-white shadow-2xl border-2 flex flex-col justify-between ${selectedPlan.borderAccent} bg-gradient-to-br ${selectedPlan.cardGradient}`}
                            >
                              {/* Magnetic Sanctuary Gold Strip */}
                              <div className="relative z-10 -mx-3.5 sm:-mx-5 h-6 sm:h-8 bg-gradient-to-r from-[#0F130E] via-[#2B2518] to-[#0F130E] border-y border-[#C8A253]/45 flex items-center justify-between px-4 sm:px-5">
                                <span className="font-mono text-[8px] sm:text-[9px] tracking-widest text-[#C8A253] uppercase font-bold">
                                  SANCTUARY-KEYCARD • ACCRA
                                </span>
                                <span className="font-mono text-[8px] sm:text-[9px] text-[#F7E7C4]">
                                  {selectedPlan.tierCode}-2026
                                </span>
                              </div>

                              {/* Horizontal 12-Col Grid on Mobile & Desktop to Keep Height Compact */}
                              <div className="relative z-10 my-2 grid grid-cols-12 gap-2.5 items-center">
                                <div className="col-span-8 space-y-1">
                                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#C8A253] font-bold block truncate">
                                    {selectedPlan.name} Privileges
                                  </span>
                                  <ul className="space-y-0.5 text-[9.5px] sm:text-[11px] text-[#E6E1D8]/95 leading-tight">
                                    {selectedPlan.features.slice(0, 4).map((feat, i) => (
                                      <li key={i} className="flex items-start gap-1">
                                        <Check className="h-3 w-3 text-[#C8A253] shrink-0 mt-0.5" />
                                        <span className="line-clamp-1">{feat}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="col-span-4 flex flex-col items-center justify-center bg-black/35 rounded-xl p-2 border border-[#C8A253]/30 text-center">
                                  <LotusEmblem className="h-5 w-5 sm:h-7 sm:w-7 text-[#C8A253] mb-0.5" />
                                  <span className="text-[8.5px] sm:text-[10px] font-bold text-[#F7F4EF] truncate max-w-full block">
                                    {subFormData.fullName.trim() || 'Yogi Pass'}
                                  </span>
                                  <span className="text-[7.5px] sm:text-[9px] text-[#E6E1D8]/70 block">
                                    East Legon
                                  </span>
                                </div>
                              </div>

                              <div className="relative z-10 pt-2 border-t border-white/15 flex items-center justify-between text-[9px] sm:text-[10px] text-[#E6E1D8]/85">
                                <span className="truncate">Rituals: {activeRitualShortLabels.join(' • ')}</span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 border border-[#C8A253]/50 px-2 py-0.5 text-[8.5px] sm:text-[9px] font-bold text-[#F7E7C4] shrink-0">
                                  <RotateCw className="h-2.5 w-2.5" />
                                  Front
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ===================================================== */}
                      {/* STEP 1: CHOOSE YOUR MINDFUL PASS TIER */}
                      {/* ===================================================== */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold uppercase tracking-wider text-[#5C6260] block">
                            1. Select Your Membership Tier (Updates Keycard Live)
                          </label>
                          <span className="text-[11px] font-semibold text-[#7A8B71]">
                            {selectedPlan.savings}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          {SUBSCRIPTION_PLANS.map((plan) => {
                            const isSelected = selectedPlanId === plan.id;
                            return (
                              <div
                                key={plan.id}
                                onClick={() => setSelectedPlanId(plan.id)}
                                className={`relative cursor-pointer rounded-2xl p-4 transition-all border flex flex-col justify-between ${isSelected
                                  ? 'bg-white border-[#7A8B71] shadow-md ring-2 ring-[#7A8B71]/40 -translate-y-0.5'
                                  : 'bg-[#FAF8F5] border-[#E6E1D8] hover:border-[#7A8B71]/50 hover:bg-white'
                                  }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1 mb-1.5">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${plan.isPopular
                                      ? 'bg-[#A44A4A] text-white shadow-2xs'
                                      : 'bg-[#E5ECE2] text-[#5A6952]'
                                      }`}>
                                      {plan.badge}
                                    </span>
                                    {isSelected && (
                                      <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#7A8B71] text-white">
                                        <Check className="h-3 w-3" />
                                      </span>
                                    )}
                                  </div>

                                  <h4 className="font-serif font-bold text-sm sm:text-base text-[#2B2E31]">
                                    {plan.name}
                                  </h4>
                                  <p className="text-[11px] text-[#7A8B71] font-medium">
                                    {plan.subtitle}
                                  </p>
                                  <p className="text-[11px] text-[#5C6260] mt-1 leading-snug">
                                    {plan.description}
                                  </p>

                                  <div className="mt-3">
                                    <span className="text-xs text-[#5C6260]">GH₵</span>{' '}
                                    <span className="font-serif text-xl sm:text-2xl font-bold text-[#2B2E31]">
                                      {plan.price}
                                    </span>
                                    <span className="text-[11px] text-[#5C6260]"> / month</span>
                                  </div>
                                </div>

                                <ul className="mt-3 pt-3 border-t border-[#E6E1D8] space-y-1.5 text-[11px] text-[#5C6260]">
                                  {plan.features.slice(0, 3).map((feat, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5">
                                      <Check className="h-3 w-3 text-[#7A8B71] shrink-0 mt-0.5" />
                                      <span>{feat}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* ===================================================== */}
                      {/* STEP 2: CUSTOMIZE COMPLIMENTARY SESSION PERKS ON CARD */}
                      {/* ===================================================== */}
                      <div className="rounded-2xl bg-gradient-to-r from-[#EBF0E9] via-[#F3F6F2] to-[#FAF8F5] border border-[#D5E0D2] p-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-xs text-[#232D21]">
                            <LotusEmblem className="h-4 w-4 text-[#7A8B71]" />
                            <span>2. Customize Your Complimentary Session Ritual Perks</span>
                          </div>
                          <span className="text-[10px] font-semibold text-[#5A6952]">
                            Included Free • Tap to toggle on Keycard
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-0.5">
                          {SANCTUARY_RITUAL_OPTIONS.map((ritual) => {
                            const active = selectedRitualPerks.includes(ritual.id);
                            return (
                              <button
                                key={ritual.id}
                                type="button"
                                onClick={() => toggleRitualPerk(ritual.id)}
                                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer border ${active
                                  ? 'bg-[#232D21] text-[#F7E7C4] border-[#C8A253] shadow-xs'
                                  : 'bg-white/80 text-[#5C6260] border-[#D5E0D2] hover:border-[#7A8B71] hover:text-[#232D21]'
                                  }`}
                              >
                                <span>{ritual.label}</span>
                                {active && <Check className="h-3 w-3 text-[#C8A253]" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* ===================================================== */}
                      {/* STEP 3: SUBSCRIBER IDENTITY & PRACTICE SCHEDULE */}
                      {/* ===================================================== */}
                      <div className="rounded-2xl border border-[#E6E1D8] bg-white p-4 sm:p-5 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C6260] flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-[#7A8B71]" />
                          3. Personalize Your Keycard & Practice Schedule
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                              Your Name on Keycard *
                            </label>
                            <div className="relative">
                              <User className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#7A8B71]" />
                              <input
                                type="text"
                                value={subFormData.fullName}
                                onChange={(e) => setSubFormData({ ...subFormData, fullName: e.target.value })}
                                placeholder="e.g. Ama Mensah"
                                className={`w-full rounded-xl border pl-9 pr-3 py-2 text-xs sm:text-sm outline-none transition-colors ${errors.subFullName ? 'border-[#A44A4A] bg-[#FFF5F5]' : 'border-[#E6E1D8] focus:border-[#7A8B71]'
                                  }`}
                              />
                            </div>
                            {errors.subFullName && (
                              <p className="text-[11px] text-[#A44A4A] mt-1">{errors.subFullName}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                              WhatsApp / Phone Number *
                            </label>
                            <div className="relative">
                              <Phone className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#7A8B71]" />
                              <input
                                type="tel"
                                value={subFormData.phone}
                                onChange={(e) => setSubFormData({ ...subFormData, phone: e.target.value })}
                                placeholder="024 123 4567"
                                className={`w-full rounded-xl border pl-9 pr-3 py-2 text-xs sm:text-sm outline-none transition-colors ${errors.subPhone ? 'border-[#A44A4A] bg-[#FFF5F5]' : 'border-[#E6E1D8] focus:border-[#7A8B71]'
                                  }`}
                              />
                            </div>
                            {errors.subPhone && (
                              <p className="text-[11px] text-[#A44A4A] mt-1">{errors.subPhone}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                              Email Address (For Pass & Session Reminders) *
                            </label>
                            <div className="relative">
                              <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#7A8B71]" />
                              <input
                                type="email"
                                value={subFormData.email}
                                onChange={(e) => setSubFormData({ ...subFormData, email: e.target.value })}
                                placeholder="ama@example.com"
                                className={`w-full rounded-xl border pl-9 pr-3 py-2 text-xs sm:text-sm outline-none transition-colors ${errors.subEmail ? 'border-[#A44A4A] bg-[#FFF5F5]' : 'border-[#E6E1D8] focus:border-[#7A8B71]'
                                  }`}
                              />
                            </div>
                            {errors.subEmail && (
                              <p className="text-[11px] text-[#A44A4A] mt-1">{errors.subEmail}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                              Desired Activation Date
                            </label>
                            <input
                              type="date"
                              value={subFormData.startDate}
                              onChange={(e) => setSubFormData({ ...subFormData, startDate: e.target.value })}
                              className="w-full rounded-xl border border-[#E6E1D8] px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#7A8B71]"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                              Preferred Weekly Practice Session (Shown on Keycard)
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {PRACTICE_SCHEDULES.map((slot) => (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => setSubFormData({ ...subFormData, preferredTime: slot })}
                                  className={`text-left px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${subFormData.preferredTime === slot
                                    ? 'bg-[#FAF8F5] border-[#7A8B71] text-[#232D21] font-bold ring-1 ring-[#7A8B71]'
                                    : 'border-[#E6E1D8] text-[#5C6260] hover:border-[#7A8B71]/50'
                                    }`}
                                >
                                  <span className="truncate">{slot}</span>
                                  {subFormData.preferredTime === slot && (
                                    <Check className="h-3.5 w-3.5 text-[#7A8B71] shrink-0" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* PAYMENT METHOD SELECTOR */}
                      <div className="rounded-2xl border border-[#E6E1D8] bg-white p-4 sm:p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C6260] flex items-center gap-1.5">
                            <CreditCard className="h-3.5 w-3.5 text-[#7A8B71]" />
                            Payment Authorization
                          </h4>
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#5A6952]">
                            <PaystackIcon className="h-3 w-3" />
                            <span>Paystack Encrypted</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => setSubFormData({ ...subFormData, paymentChannel: 'momo' })}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${subFormData.paymentChannel === 'momo'
                              ? 'bg-[#FAF8F5] border-[#7A8B71] ring-1 ring-[#7A8B71]'
                              : 'border-[#E6E1D8] hover:border-[#7A8B71]/40'
                              }`}
                          >
                            <span className="text-xs font-bold block text-[#2B2E31]">Mobile Money</span>
                            <span className="text-[10px] text-[#5C6260]">MTN, Telecel, AT Money</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSubFormData({ ...subFormData, paymentChannel: 'card' })}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${subFormData.paymentChannel === 'card'
                              ? 'bg-[#FAF8F5] border-[#7A8B71] ring-1 ring-[#7A8B71]'
                              : 'border-[#E6E1D8] hover:border-[#7A8B71]/40'
                              }`}
                          >
                            <span className="text-xs font-bold block text-[#2B2E31]">Debit / Credit Card</span>
                            <span className="text-[10px] text-[#5C6260]">Visa, Mastercard</span>
                          </button>
                        </div>

                        {/* MOBILE MONEY NETWORK LOGOS */}
                        {subFormData.paymentChannel === 'momo' && (
                          <div className="space-y-3 pt-2 border-t border-[#E6E1D8]">
                            <label className="block text-xs font-semibold text-[#2B2E31]">
                              Select Network:
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { id: 'MTN', name: 'MTN MoMo' },
                                { id: 'Telecel', name: 'Telecel Cash' },
                                { id: 'AirtelTigo', name: 'AT Money' }
                              ].map((net) => (
                                <button
                                  key={net.id}
                                  type="button"
                                  onClick={() => setSubFormData({ ...subFormData, momoNetwork: net.id })}
                                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${subFormData.momoNetwork === net.id
                                    ? 'bg-[#FAF8F5] border-[#7A8B71] shadow-xs ring-1 ring-[#7A8B71]'
                                    : 'border-[#E6E1D8] hover:border-[#7A8B71]/40 bg-white'
                                    }`}
                                >
                                  <div className="h-7 flex items-center justify-center mb-1">
                                    <MobileMoneyLogo network={net.id} variant="image" size="sm" />
                                  </div>
                                  <span className="text-[11px] font-semibold text-[#2B2E31]">{net.name}</span>
                                </button>
                              ))}
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                                {subFormData.momoNetwork} Phone for Prompt *
                              </label>
                              <input
                                type="tel"
                                value={subFormData.momoNumber}
                                onChange={(e) => setSubFormData({ ...subFormData, momoNumber: e.target.value })}
                                placeholder={subFormData.phone || '024 XXX XXXX'}
                                className={`w-full rounded-xl border px-3 py-2 text-xs sm:text-sm outline-none transition-colors ${errors.subMomoNumber ? 'border-[#A44A4A] bg-[#FFF5F5]' : 'border-[#E6E1D8] focus:border-[#7A8B71]'
                                  }`}
                              />
                              {errors.subMomoNumber && (
                                <p className="text-[11px] text-[#A44A4A] mt-1">{errors.subMomoNumber}</p>
                              )}
                              <p className="text-[10px] text-[#5C6260] mt-1">
                                A Paystack mobile money prompt will be pushed directly to this phone to authorize GH₵ {selectedPlan.price}.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* MANDATORY MINDFUL STUDIO COMMITMENT */}
                      <div className={`rounded-2xl border p-4 transition-all ${errors.subAgreedToTerms
                        ? 'border-[#A44A4A] bg-[#FFF8F8] ring-2 ring-[#A44A4A]/25'
                        : 'border-[#E6E1D8] bg-[#FAF8F5]'
                        }`}>
                        <div className="flex items-center gap-2 pb-2 border-b border-[#E6E1D8]">
                          <LotusEmblem className="h-4 w-4 text-[#7A8B71]" />
                          <h5 className="font-serif text-xs font-bold tracking-wide uppercase text-[#2B2E31]">
                            Studio Sanctuary Commitments
                          </h5>
                        </div>

                        <div className="mt-2.5 space-y-2 text-xs text-[#2B2E31]">
                          <div className="flex items-start gap-2">
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E5ECE2] text-[#5A6952] text-[10px] font-bold mt-0.5">
                              1
                            </span>
                            <p className="leading-relaxed">
                              I will communicate any physical injuries, tightness, or limitations to Lorie prior to practicing.
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E5ECE2] text-[#5A6952] text-[10px] font-bold mt-0.5">
                              2
                            </span>
                            <p className="leading-relaxed">
                              I agree to arrive 10 minutes early to disconnect from digital noise and settle onto my mat.
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E5ECE2] text-[#5A6952] text-[10px] font-bold mt-0.5">
                              3
                            </span>
                            <p className="leading-relaxed">
                              I understand monthly passes can be rescheduled up to 24 hours in advance.
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-[#E6E1D8]">
                          <label className="flex items-start gap-2.5 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={subFormData.agreedToTerms || false}
                              onChange={(e) => {
                                setSubFormData((prev) => ({ ...prev, agreedToTerms: e.target.checked }));
                                if (errors.subAgreedToTerms) {
                                  setErrors((prev) => ({ ...prev, subAgreedToTerms: undefined }));
                                }
                              }}
                              className="mt-0.5 h-4 w-4 rounded border-[#D5CEC2] text-[#7A8B71] focus:ring-[#7A8B71] cursor-pointer"
                            />
                            <span className="text-xs font-semibold text-[#2B2E31] leading-snug group-hover:text-[#5A6952] transition-colors">
                              I accept the sanctuary commitments above and authorize my pass activation. *
                            </span>
                          </label>

                          {errors.subAgreedToTerms && (
                            <p className="mt-1.5 text-[11px] font-semibold text-[#A44A4A]">
                              {errors.subAgreedToTerms}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ========================================================= */}
                  {/* TAB 2: MINDFUL GIFT CARD GENERATOR (4 PALETTES & AFFIRMATIONS) */}
                  {/* ========================================================= */}
                  {activeTab === 'gift' && (
                    <div className="space-y-6">

                      {/* ===================================================== */}
                      {/* INTERACTIVE 3D MINDFUL GIFT CERTIFICATE PREVIEW */}
                      {/* ===================================================== */}
                      <div className="space-y-3">
                        <div className="space-y-2 max-w-[340px] sm:max-w-[460px] mx-auto w-full">
                          <div className="flex items-center justify-between gap-2">
                            <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#232D21] flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-[#C8A253]" />
                              <span>3D Mindful Gift Card</span>
                            </label>

                            <button
                              type="button"
                              onClick={() => setIsGiftCardFlipped((prev) => !prev)}
                              className="inline-flex items-center gap-1 rounded-full bg-[#232D21] hover:bg-[#2F3C2C] text-[#F7E7C4] border border-[#C8A253]/60 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-[11px] font-semibold shadow-sm transition-all cursor-pointer"
                            >
                              <RotateCw className={`h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#C8A253] transition-transform duration-500 ${isGiftCardFlipped ? 'rotate-180' : ''}`} />
                              <span>{isGiftCardFlipped ? 'Flip to Front' : 'Flip Card 180°'}</span>
                            </button>
                          </div>

                          {/* 3D GIFT CARD STAGE WITH COMPACT PHYSICAL CARD PROPORTIONS */}
                          <div style={{ perspective: '1300px' }} className="w-full select-none">
                            <div
                              ref={giftCertificateRef}
                              onClick={() => setIsGiftCardFlipped((prev) => !prev)}
                              onMouseMove={(e) => handleCardMouseMove(e, setGiftCardTilt)}
                              onMouseLeave={() => handleCardMouseLeave(setGiftCardTilt)}
                              style={{
                                transformStyle: 'preserve-3d',
                                transform: `rotateX(${giftCardTilt.rotateX}deg) rotateY(${(isGiftCardFlipped ? 180 : 0) + (isGiftCardFlipped ? -giftCardTilt.rotateY : giftCardTilt.rotateY)}deg)`,
                                transition: 'transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)'
                              }}
                              className="relative grid grid-cols-1 cursor-pointer group"
                              title="Tap anywhere on gift card to flip 180°"
                            >
                              {/* ================= FRONT FACE OF 3D GIFT CERTIFICATE ================= */}
                              <div
                                style={{
                                  backfaceVisibility: 'hidden',
                                  WebkitBackfaceVisibility: 'hidden',
                                  transform: 'rotateY(0deg)'
                                }}
                                className={`col-start-1 row-start-1 relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 text-white shadow-2xl border-2 flex flex-col justify-between transition-colors duration-300 ${activePalette.cardGradient} ${activePalette.borderClass}`}
                              >
                                {/* Dynamic 3D Metallic Foil Glare Overlay */}
                                <div
                                  className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
                                  style={{
                                    opacity: giftCardTilt.isHovering ? 0.28 : 0.1,
                                    background: `radial-gradient(circle at ${giftCardTilt.glareX}% ${giftCardTilt.glareY}%, rgba(255, 244, 214, 0.65), transparent 60%)`
                                  }}
                                />

                                {/* Sacred Geometry & Pose Watermarks */}
                                <div className="pointer-events-none absolute -right-8 -bottom-8 opacity-25">
                                  <MandalaWatermark className="h-32 sm:h-44 w-32 sm:w-44 text-[#C8A253]" />
                                </div>
                                <div className="pointer-events-none absolute right-4 top-8 opacity-12">
                                  <img
                                    src={loriePoseImg}
                                    alt=""
                                    aria-hidden="true"
                                    className="h-28 sm:h-36 w-auto object-contain filter brightness-150"
                                  />
                                </div>

                                {/* Certificate Header */}
                                <div className="relative z-10 flex items-center justify-between gap-2 pb-2 border-b border-white/15">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <LotusEmblem className="h-4 w-4 sm:h-5 sm:w-5 text-[#C8A253] shrink-0" />
                                    <div className="min-w-0">
                                      <span className="font-serif tracking-widest uppercase font-bold text-[10px] sm:text-xs text-[#F7F4EF] block leading-none truncate">
                                        Stretch with Lorie
                                      </span>
                                      <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-[#E6E1D8]/75 block mt-0.5 truncate">
                                        {activePalette.name}
                                      </span>
                                    </div>
                                  </div>
                                  <span className={`rounded-full px-2 py-0.5 text-[8.5px] sm:text-[10px] font-bold border shrink-0 ${activePalette.pillBg}`}>
                                    GIFT VOUCHER
                                  </span>
                                </div>

                                {/* Certificate Recipient & Live Personal Affirmation */}
                                <div className="relative z-10 my-2.5 space-y-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                      <span className="text-[8.5px] sm:text-[10px] uppercase tracking-wider text-[#E6E1D8]/75 block font-medium">
                                        For
                                      </span>
                                      <h4 className="text-base sm:text-xl font-serif font-bold text-[#F7F4EF] tracking-tight truncate">
                                        {giftFormData.recipientName.trim() || 'A Cherished Friend'}
                                      </h4>
                                    </div>

                                    <div className="text-right shrink-0">
                                      <span className="text-[8.5px] sm:text-[10px] uppercase tracking-wider text-[#E6E1D8]/75 block font-medium">
                                        Gift Value
                                      </span>
                                      <span className={`text-lg sm:text-2xl font-serif font-bold leading-none ${activePalette.accentText}`}>
                                        GH₵ {finalGiftAmount || 200}
                                      </span>
                                    </div>
                                  </div>

                                  <div
                                    ref={giftQuoteBoxRef}
                                    className="text-[10px] sm:text-xs italic text-[#F7F4EF]/95 leading-snug bg-black/22 px-2.5 py-2 rounded-xl border border-white/12 shadow-inner line-clamp-2"
                                  >
                                    &ldquo;{giftFormData.personalNote || 'Wishing you radiant wellness, presence, and calm.'}&rdquo;
                                  </div>
                                </div>

                                {/* Certificate Footer: Experience Equivalent, Sender & Flip Hint */}
                                <div className="relative z-10 pt-2 border-t border-white/15 flex items-center justify-between gap-2 text-[9px] sm:text-[10px]">
                                  <span className="text-[#E6E1D8]/85 truncate">
                                    From: <strong className="text-white">{giftFormData.senderName.trim() || 'Your Name'}</strong>
                                  </span>
                                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 group-hover:bg-[#C8A253]/30 border border-[#C8A253]/40 px-2 py-0.5 text-[8.5px] sm:text-[9px] font-bold text-[#F7E7C4] shrink-0 transition-colors">
                                    <RotateCw className="h-2.5 w-2.5" />
                                    Flip
                                  </span>
                                </div>
                              </div>

                              {/* ================= BACK FACE OF 3D GIFT CERTIFICATE ================= */}
                              <div
                                style={{
                                  backfaceVisibility: 'hidden',
                                  WebkitBackfaceVisibility: 'hidden',
                                  transform: 'rotateY(180deg)'
                                }}
                                className={`col-start-1 row-start-1 relative overflow-hidden rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 text-white shadow-2xl border-2 flex flex-col justify-between transition-colors duration-300 ${activePalette.cardGradient} ${activePalette.borderClass}`}
                              >
                                {/* Artisanal Gold Ribbon Strip */}
                                <div className="relative z-10 -mx-3.5 sm:-mx-5 h-6 sm:h-8 bg-black/45 border-y border-[#C8A253]/45 flex items-center justify-between px-4 sm:px-5">
                                  <span className="font-mono text-[8px] sm:text-[9px] tracking-widest text-[#F7E7C4] uppercase font-bold truncate">
                                    GIFT PASS • {activePalette.name.toUpperCase()}
                                  </span>
                                  <span className="font-mono text-[8px] sm:text-[9px] text-[#E6E1D8]/80 shrink-0">
                                    12 MO VALID
                                  </span>
                                </div>

                                <div className="relative z-10 my-2 grid grid-cols-12 gap-2.5 items-center">
                                  <div className="col-span-8 space-y-1">
                                    <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#F7E7C4] font-bold block truncate">
                                      Unlocks at Sanctuary (GH₵ {finalGiftAmount || 200})
                                    </span>
                                    <ul className="space-y-0.5 text-[9.5px] sm:text-[11px] text-[#E6E1D8]/95 leading-tight">
                                      <li className="flex items-start gap-1">
                                        <Check className="h-3 w-3 text-[#C8A253] shrink-0 mt-0.5" />
                                        <span className="line-clamp-1 font-semibold">{getGiftExperienceEquivalent(finalGiftAmount || 200)}</span>
                                      </li>
                                      <li className="flex items-start gap-1">
                                        <Check className="h-3 w-3 text-[#C8A253] shrink-0 mt-0.5" />
                                        <span className="line-clamp-1">Book any group flow or private 1-on-1 stretch</span>
                                      </li>
                                      <li className="flex items-start gap-1">
                                        <Check className="h-3 w-3 text-[#C8A253] shrink-0 mt-0.5" />
                                        <span className="line-clamp-1">Free Manduka mat, props & herbal tea ritual</span>
                                      </li>
                                    </ul>
                                  </div>

                                  <div className="col-span-4 flex flex-col items-center justify-center bg-black/30 rounded-xl p-2 border border-white/15 text-center">
                                    <LotusEmblem className="h-5 w-5 sm:h-7 sm:w-7 text-[#C8A253] mb-0.5" />
                                    <span className="text-[8.5px] sm:text-[10px] font-bold text-[#F7F4EF] truncate max-w-full block">
                                      {giftFormData.recipientName.trim() || 'Cherished'}
                                    </span>
                                    <span className="text-[7.5px] sm:text-[9px] text-[#E6E1D8]/75 block">
                                      East Legon
                                    </span>
                                  </div>
                                </div>

                                <div className="relative z-10 pt-2 border-t border-white/15 flex items-center justify-between text-[9px] sm:text-[10px] text-[#E6E1D8]/85">
                                  <span className="truncate">📍 Suite 4B, East Legon, Accra</span>
                                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 border border-[#C8A253]/50 px-2 py-0.5 text-[8.5px] sm:text-[9px] font-bold text-[#F7E7C4] shrink-0">
                                    <RotateCw className="h-2.5 w-2.5" />
                                    Front
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ===================================================== */}
                        {/* 4 WELLNESS PALETTES SELECTOR (NAMED SWATCH CARDS) */}
                        {/* ===================================================== */}
                        <div className="pt-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#5C6260] flex items-center gap-1.5">
                              <Palette className="h-3.5 w-3.5 text-[#7A8B71]" />
                              1. Choose Wellness Card Palette (4 Sanctuary Themes)
                            </label>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {WELLNESS_PALETTES.map((palette) => {
                              const isSelected = giftTheme === palette.id;
                              return (
                                <button
                                  key={palette.id}
                                  type="button"
                                  onClick={() => setGiftTheme(palette.id)}
                                  className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${isSelected
                                    ? 'bg-white border-[#232D21] shadow-md ring-2 ring-[#C8A253]/50 -translate-y-0.5'
                                    : 'bg-[#FAF8F5] border-[#E6E1D8] hover:bg-white hover:border-[#7A8B71]/50'
                                    }`}
                                >
                                  <span
                                    className={`h-7 w-7 rounded-full shrink-0 border-2 border-white shadow-sm ${palette.swatchBg}`}
                                  />
                                  <div className="min-w-0">
                                    <span className="text-[11px] font-bold text-[#2B2E31] block leading-tight truncate">
                                      {palette.name}
                                    </span>
                                    <span className="text-[9px] text-[#5C6260] block truncate mt-0.5">
                                      {palette.tagline}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* ===================================================== */}
                      {/* STEP 2: CHOOSE GIFT VALUE OR CUSTOM AMOUNT VOUCHER */}
                      {/* ===================================================== */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold uppercase tracking-wider text-[#5C6260] block">
                            2. Select Gift Voucher Amount or Custom Value
                          </label>
                          <span className="text-[11px] font-semibold text-[#A44A4A]">
                            GH₵ {finalGiftAmount || 200} Selected
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {GIFT_PRESETS.map((preset) => {
                            const isSelected = !isCustomAmount && giftAmount === preset.amount;
                            return (
                              <button
                                key={preset.amount}
                                type="button"
                                onClick={() => {
                                  setGiftAmount(preset.amount);
                                  setIsCustomAmount(false);
                                }}
                                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${isSelected
                                  ? 'bg-white border-[#A44A4A] shadow-sm ring-2 ring-[#A44A4A]/30'
                                  : 'bg-[#FAF8F5] border-[#E6E1D8] hover:border-[#A44A4A]/50 hover:bg-white'
                                  }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-[#A44A4A]">
                                    GH₵ {preset.amount}
                                  </span>
                                  <span className="text-xs">{preset.icon}</span>
                                </div>
                                <span className="text-xs font-semibold text-[#2B2E31] block mt-0.5">
                                  {preset.label}
                                </span>
                                <span className="text-[10px] text-[#5C6260] block mt-0.5">
                                  {preset.desc}
                                </span>
                              </button>
                            );
                          })}

                          {/* CUSTOM AMOUNT BUTTON */}
                          <button
                            type="button"
                            onClick={() => setIsCustomAmount(true)}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${isCustomAmount
                              ? 'bg-white border-[#A44A4A] shadow-sm ring-2 ring-[#A44A4A]/30'
                              : 'bg-[#FAF8F5] border-[#E6E1D8] hover:border-[#A44A4A]/50 hover:bg-white'
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#A44A4A] block">
                                Custom Voucher
                              </span>
                              <span className="text-xs">💎</span>
                            </div>
                            <span className="text-xs font-semibold text-[#2B2E31] block mt-0.5">
                              Enter Any Amount
                            </span>
                            <span className="text-[10px] text-[#5C6260] block mt-0.5">
                              Flexible Credit (Min GH₵ 100)
                            </span>
                          </button>
                        </div>

                        {isCustomAmount && (
                          <div className="mt-2 rounded-2xl bg-white border border-[#E6E1D8] p-3.5 space-y-2.5 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-[#2B2E31]">
                                Custom Voucher Amount (GH₵)
                              </span>
                              <span className="text-[10px] font-medium text-[#7A8B71]">
                                {getGiftExperienceEquivalent(finalGiftAmount)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] px-3 py-2 text-xs font-bold text-[#2B2E31]">
                                GH₵
                              </span>
                              <input
                                type="number"
                                min="100"
                                step="50"
                                placeholder="Enter custom amount (e.g. 500)"
                                value={customAmountValue}
                                onChange={(e) => setCustomAmountValue(e.target.value)}
                                className="flex-1 rounded-xl border border-[#E6E1D8] px-3 py-2 text-xs sm:text-sm font-semibold outline-none focus:border-[#A44A4A]"
                              />
                            </div>

                            {/* Quick-Pick Custom Amount Pills */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] text-[#5C6260] mr-1">Quick amounts:</span>
                              {CUSTOM_AMOUNT_QUICK_PICKS.map((amt) => (
                                <button
                                  key={amt}
                                  type="button"
                                  onClick={() => setCustomAmountValue(String(amt))}
                                  className={`rounded-lg px-2.5 py-1 text-[10px] font-bold border transition-all cursor-pointer ${Number(customAmountValue) === amt
                                    ? 'bg-[#A44A4A] text-white border-[#A44A4A]'
                                    : 'bg-[#FAF8F5] text-[#5C6260] border-[#E6E1D8] hover:border-[#A44A4A]'
                                    }`}
                                >
                                  GH₵ {amt}
                                </button>
                              ))}
                            </div>

                            {errors.giftAmount && (
                              <p className="text-[11px] text-[#A44A4A] mt-1">{errors.giftAmount}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* ===================================================== */}
                      {/* STEP 3: RECIPIENT & 1-CLICK MINDFUL AFFIRMATION BUTTONS */}
                      {/* ===================================================== */}
                      <div className="rounded-2xl border border-[#E6E1D8] bg-white p-4 sm:p-5 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C6260] flex items-center gap-1.5">
                          <Gift className="h-3.5 w-3.5 text-[#A44A4A]" />
                          3. Recipient & 1-Click Mindful Affirmations
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                              Recipient Full Name *
                            </label>
                            <input
                              type="text"
                              value={giftFormData.recipientName}
                              onChange={(e) => setGiftFormData({ ...giftFormData, recipientName: e.target.value })}
                              placeholder="e.g. Efua Darko"
                              className={`w-full rounded-xl border px-3 py-2 text-xs sm:text-sm outline-none transition-colors ${errors.recipientName ? 'border-[#A44A4A] bg-[#FFF5F5]' : 'border-[#E6E1D8] focus:border-[#7A8B71]'
                                }`}
                            />
                            {errors.recipientName && (
                              <p className="text-[11px] text-[#A44A4A] mt-1">{errors.recipientName}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                              Recipient WhatsApp / Phone
                            </label>
                            <input
                              type="tel"
                              value={giftFormData.recipientPhone}
                              onChange={(e) => setGiftFormData({ ...giftFormData, recipientPhone: e.target.value })}
                              placeholder="024 XXX XXXX"
                              className="w-full rounded-xl border border-[#E6E1D8] px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#7A8B71]"
                            />
                          </div>

                          {/* 1-CLICK MINDFUL AFFIRMATION BUTTONS */}
                          <div className="sm:col-span-2 space-y-2.5 pt-1">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-semibold text-[#2B2E31]">
                                1-Click Mindful Affirmation Buttons (Personalize Gift Message)
                              </label>
                              <span className="text-[10px] font-medium text-[#7A8B71]">
                                Tap to apply to card
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {MINDFUL_AFFIRMATIONS.map((aff) => {
                                const isSelected = selectedAffirmationId === aff.id && giftFormData.personalNote === aff.message;
                                return (
                                  <button
                                    key={aff.id}
                                    type="button"
                                    onClick={() => handleSelectAffirmation(aff)}
                                    className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-all cursor-pointer border ${isSelected
                                      ? 'bg-[#232D21] text-[#F7E7C4] border-[#C8A253] shadow-sm'
                                      : 'bg-[#FAF8F5] text-[#2B2E31] border-[#E6E1D8] hover:border-[#7A8B71] hover:bg-white'
                                      }`}
                                  >
                                    <span className="flex items-center gap-1.5 truncate">
                                      <span>{aff.icon}</span>
                                      <span className="truncate">&ldquo;{aff.label}&rdquo;</span>
                                    </span>
                                    {isSelected && <Check className="h-3.5 w-3.5 text-[#C8A253] shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>

                            <textarea
                              rows={2}
                              value={giftFormData.personalNote}
                              onChange={(e) => setGiftFormData({ ...giftFormData, personalNote: e.target.value })}
                              placeholder="Write or customize your mindful blessing for them..."
                              className="w-full rounded-xl border border-[#E6E1D8] px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#7A8B71]"
                            />
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#E6E1D8] grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                              Your Name (Sender) *
                            </label>
                            <input
                              type="text"
                              value={giftFormData.senderName}
                              onChange={(e) => setGiftFormData({ ...giftFormData, senderName: e.target.value })}
                              placeholder="e.g. Kojo Ansah"
                              className={`w-full rounded-xl border px-3 py-2 text-xs sm:text-sm outline-none transition-colors ${errors.senderName ? 'border-[#A44A4A] bg-[#FFF5F5]' : 'border-[#E6E1D8] focus:border-[#7A8B71]'
                                }`}
                            />
                            {errors.senderName && (
                              <p className="text-[11px] text-[#A44A4A] mt-1">{errors.senderName}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                              Your WhatsApp / Phone *
                            </label>
                            <input
                              type="tel"
                              value={giftFormData.senderPhone}
                              onChange={(e) => setGiftFormData({ ...giftFormData, senderPhone: e.target.value })}
                              placeholder="024 XXX XXXX"
                              className={`w-full rounded-xl border px-3 py-2 text-xs sm:text-sm outline-none transition-colors ${errors.senderPhone ? 'border-[#A44A4A] bg-[#FFF5F5]' : 'border-[#E6E1D8] focus:border-[#7A8B71]'
                                }`}
                            />
                            {errors.senderPhone && (
                              <p className="text-[11px] text-[#A44A4A] mt-1">{errors.senderPhone}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* GIFT PAYMENT SELECTOR */}
                      <div className="rounded-2xl border border-[#E6E1D8] bg-white p-4 sm:p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C6260] flex items-center gap-1.5">
                            <CreditCard className="h-3.5 w-3.5 text-[#7A8B71]" />
                            Payment Option
                          </h4>
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#5A6952]">
                            <PaystackIcon className="h-3 w-3" />
                            <span>Paystack Ghana</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'MTN', name: 'MTN MoMo' },
                            { id: 'Telecel', name: 'Telecel Cash' },
                            { id: 'AirtelTigo', name: 'AT Money' }
                          ].map((net) => (
                            <button
                              key={net.id}
                              type="button"
                              onClick={() => setGiftFormData({ ...giftFormData, momoNetwork: net.id })}
                              className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${giftFormData.momoNetwork === net.id
                                ? 'bg-[#FAF8F5] border-[#7A8B71] shadow-xs ring-1 ring-[#7A8B71]'
                                : 'border-[#E6E1D8] hover:border-[#7A8B71]/40 bg-white'
                                }`}
                            >
                              <div className="h-7 flex items-center justify-center mb-1">
                                <MobileMoneyLogo network={net.id} variant="image" size="sm" />
                              </div>
                              <span className="text-[11px] font-semibold text-[#2B2E31]">{net.name}</span>
                            </button>
                          ))}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                            {giftFormData.momoNetwork} Phone for Prompt
                          </label>
                          <input
                            type="tel"
                            value={giftFormData.momoNumber}
                            onChange={(e) => setGiftFormData({ ...giftFormData, momoNumber: e.target.value })}
                            placeholder={giftFormData.senderPhone || '024 XXX XXXX'}
                            className={`w-full rounded-xl border px-3 py-2 text-xs sm:text-sm outline-none transition-colors ${errors.giftMomoNumber ? 'border-[#A44A4A] bg-[#FFF5F5]' : 'border-[#E6E1D8] focus:border-[#7A8B71]'
                              }`}
                          />
                          {errors.giftMomoNumber && (
                            <p className="text-[11px] text-[#A44A4A] mt-1">{errors.giftMomoNumber}</p>
                          )}
                        </div>
                      </div>

                      {/* MANDATORY CONFIRMATION BEFORE MAKING PAYMENT */}
                      <div className={`rounded-2xl border p-4 transition-all ${errors.giftAgreedToTerms
                        ? 'border-[#A44A4A] bg-[#FFF8F8] ring-2 ring-[#A44A4A]/25'
                        : 'border-[#E6E1D8] bg-[#FAF8F5]'
                        }`}>
                        <div className="flex items-center gap-2 pb-2 border-b border-[#E6E1D8]">
                          <LotusEmblem className="h-4 w-4 text-[#A44A4A]" />
                          <h5 className="font-serif text-xs font-bold tracking-wide uppercase text-[#2B2E31]">
                            Studio Sanctuary Commitments
                          </h5>
                        </div>

                        <div className="mt-2.5 space-y-2 text-xs text-[#2B2E31]">
                          <div className="flex items-start gap-2">
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E5ECE2] text-[#5A6952] text-[10px] font-bold mt-0.5">
                              1
                            </span>
                            <p className="leading-relaxed">
                              Vouchers are valid for 12 months across all studio group sessions and 1-on-1 private stretches.
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E5ECE2] text-[#5A6952] text-[10px] font-bold mt-0.5">
                              2
                            </span>
                            <p className="leading-relaxed">
                              Recipient will receive instant entry code to book their preferred session date.
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-[#E6E1D8]">
                          <label className="flex items-start gap-2.5 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={giftFormData.agreedToTerms || false}
                              onChange={(e) => {
                                setGiftFormData((prev) => ({ ...prev, agreedToTerms: e.target.checked }));
                                if (errors.giftAgreedToTerms) {
                                  setErrors((prev) => ({ ...prev, giftAgreedToTerms: undefined }));
                                }
                              }}
                              className="mt-0.5 h-4 w-4 rounded border-[#D5CEC2] text-[#7A8B71] focus:ring-[#7A8B71] cursor-pointer"
                            />
                            <span className="text-xs font-semibold text-[#2B2E31] leading-snug group-hover:text-[#5A6952] transition-colors">
                              I agree to the studio voucher terms and authorize payment. *
                            </span>
                          </label>

                          {errors.giftAgreedToTerms && (
                            <p className="mt-1.5 text-[11px] font-semibold text-[#A44A4A]">
                              {errors.giftAgreedToTerms}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>
          </div>

          {/* ========================================================= */}
          {/* MODAL FOOTER */}
          {/* ========================================================= */}
          {!completedOrder && (
            <div className="bg-[#FAF8F5] border-t border-[#E6E1D8] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#7A8B71]" />
                <span className="text-xs text-[#5C6260]">
                  Paystack Mobile Money & Card • Instant Pass Issuance
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-[#E6E1D8] text-xs font-semibold text-[#5C6260] hover:bg-white hover:text-[#2B2E31] transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleProcessOrder}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#A44A4A] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#8f3e3e] transition-all hover:scale-[1.01] disabled:opacity-75 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>
                        {submissionStep === 1 && 'Initiating Paystack...'}
                        {submissionStep === 2 && 'Pushing MoMo prompt...'}
                        {submissionStep === 3 && 'Authorizing Pass...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <LotusEmblem className="h-4 w-4 text-[#F7E7C4]" />
                      <span>
                        {activeTab === 'subscription'
                          ? `Activate Keycard • GH₵ ${selectedPlan.price}`
                          : `Issue Gift Card • GH₵ ${finalGiftAmount || 200}`}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
