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
  Coffee,
  Send,
  Feather,
  User,
  Phone,
  Mail
} from 'lucide-react';
import MobileMoneyLogo from './MobileMoneyLogo';
import { PaystackIcon } from './RegistrationForm';
import { exportGiftPassPDF } from '../utils/pdfExport';

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

// RE-IMAGINED YOGA SUBSCRIPTION PLANS
const SUBSCRIPTION_PLANS = [
  {
    id: 'plan-starter',
    name: 'The Seed Flow',
    subtitle: 'Awaken Consistency',
    badge: 'Gentle Start',
    classesPerMonth: 2,
    price: 380,
    savings: 'Save GH₵ 20',
    description: 'Bi-weekly mindful practice to gently loosen tight joints and restore nervous system calm.',
    themeColor: '#7A8B71',
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
    isPopular: true,
    classesPerMonth: 4,
    price: 700,
    savings: 'Save GH₵ 100',
    description: 'Weekly rhythmic practice for lasting flexibility, spine decompression & emotional grounding.',
    themeColor: '#C8A253',
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
    classesPerMonth: 8,
    price: 1350,
    savings: 'Save GH₵ 250',
    description: 'Complete studio immersion + dedicated 1-on-1 private assisted stretch session with Lorie.',
    themeColor: '#A44A4A',
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

// GIFT CARD PRESETS
const GIFT_PRESETS = [
  { amount: 200, label: 'Single Flow', desc: '1 Group Studio Session', icon: '🌱' },
  { amount: 380, label: 'Starter Duet', desc: '2 Group Studio Sessions', icon: '🌿' },
  { amount: 700, label: 'Lotus Month', desc: '4 Classes + Tea Ritual', icon: '🪷' },
  { amount: 850, label: 'Private Sanctuary', desc: '1-on-1 Private Stretch', icon: '✨' },
  { amount: 1350, label: 'VIP Immersion', desc: '8 Classes + 1 Private', icon: '👑' }
];

// MINDFUL AFFIRMATION PRESETS FOR GIFTING
const MINDFUL_AFFIRMATIONS = [
  'May this time on the mat bring you grounding, peace, and deep physical renewal.',
  'A breath of fresh air and mindful stillness, specially chosen for your soul.',
  'Here is to finding strength in your movement and quiet calm in your spirit.',
  'Wishing you radiant energy, effortless flexibility, and joyful presence.'
];

export default function WellnessGiftCardModal({
  isOpen,
  onClose,
  initialTab = 'subscription', // 'subscription' | 'gift'
  onSuccessBooking
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'subscription' | 'gift'

  const modalBackdropRef = useRef(null);
  const modalCardRef = useRef(null);

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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Subscription state
  const [selectedPlanId, setSelectedPlanId] = useState('plan-sanctuary');
  const [subFormData, setSubFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    startDate: new Date().toISOString().split('T')[0],
    preferredTime: 'Wednesdays 7:00 AM',
    paymentChannel: 'momo',
    momoNetwork: 'MTN',
    momoNumber: '',
    notes: '',
    agreedToTerms: false
  });

  // Gift Card state
  const [giftAmount, setGiftAmount] = useState(700);
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [customAmountValue, setCustomAmountValue] = useState('');
  const [giftTheme, setGiftTheme] = useState('sage'); // 'sage' | 'gold' | 'blush' | 'midnight'
  const [giftFormData, setGiftFormData] = useState({
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    personalNote: MINDFUL_AFFIRMATIONS[0],
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

  if (!isOpen) return null;

  const selectedPlan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[1];
  const finalGiftAmount = isCustomAmount ? (parseInt(customAmountValue, 10) || 0) : giftAmount;

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
          theme: giftTheme
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
      ? `🌿 *Stretch with Lorie - Sanctuary Pass Activated*\n\nNamaste Lorie! I just activated *${completedOrder.title}* (${completedOrder.orderId}) for GH₵ ${completedOrder.amount}.\n\n*Member:* ${completedOrder.buyerName}\n*Phone:* ${completedOrder.buyerPhone}\n*Preferred Start:* ${subFormData.startDate} (${subFormData.preferredTime})\n*Voucher:* ${completedOrder.voucherCode}\n\nExcited to deepen my practice in the sanctuary! 🪷`
      : `🪷 *A Mindful Wellness Gift for You!* 🪷\n\nDearest *${completedOrder.recipientName}*,\n\n${completedOrder.buyerName} has blessed you with a *Stretch with Lorie Wellness Card* valued at *GH₵ ${completedOrder.amount}*!\n\n"${completedOrder.personalNote}"\n\n🌿 *Voucher Code:* ${completedOrder.voucherCode}\n📍 *Sanctuary:* Suite 4B, East Legon, Accra\n📞 *Book via WhatsApp:* +233 24 123 4567\n\nEnjoy your rejuvenating stretch journey! ✨`;
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

  return (
    <div
      ref={modalBackdropRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#181B1C]/80 backdrop-blur-md p-2.5 sm:p-4 sm:py-6 overscroll-contain"
    >
      <div className="flex min-h-full items-center justify-center py-2 sm:py-4">
        <div ref={modalCardRef} className="relative w-full max-w-2xl rounded-3xl bg-[#FAF8F5] border border-[#E6E1D8] shadow-2xl overflow-hidden my-auto max-h-[94dvh] sm:max-h-[92vh] flex flex-col text-[#2B2E31]">

          {/* SCROLLABLE INNER CONTAINER: Header + Body scroll naturally together (Header is NOT fixed) */}
          <div className="flex-1 overflow-y-auto overscroll-contain">

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
                    Cultivate personal vitality with monthly studio passes, or gift mindful stretch and relaxation to someone you cherish.
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
                      <span className="text-[10px] font-normal opacity-75">Personal Practice</span>
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
                      <span className="block">Gift Mindful Stretch</span>
                      <span className="text-[10px] font-normal opacity-75">Share the Blessing</span>
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
                      {completedOrder.type === 'subscription' ? 'Your Sanctuary Practice is Confirmed!' : 'Mindful Gift Pass Issued!'}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5C6260] max-w-md mx-auto">
                      {completedOrder.type === 'subscription'
                        ? `Welcome to consistent yoga and renewal. Your ${completedOrder.title} is now active for ${completedOrder.buyerName}.`
                        : `A digital wellness certificate has been lovingly prepared for ${completedOrder.recipientName}.`}
                    </p>
                  </div>

                  {/* RENDERED LUXURY TACTILE PASS VOUCHER */}
                  <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-7 text-white shadow-xl border ${completedOrder.theme === 'gold'
                    ? 'bg-gradient-to-br from-[#8C6D27] via-[#A88434] to-[#695019] border-[#E8C87A]'
                    : completedOrder.theme === 'blush'
                      ? 'bg-gradient-to-br from-[#7D4545] via-[#8F5252] to-[#663535] border-[#EAD3D5]/40'
                      : completedOrder.theme === 'midnight'
                        ? 'bg-gradient-to-br from-[#121811] via-[#1E291C] to-[#0D120C] border-[#C8A253]/60'
                        : 'bg-gradient-to-br from-[#232D21] via-[#2F3C2C] to-[#1C241B] border-[#C8A253]/50'
                    }`}>
                    <div className="pointer-events-none absolute -right-10 -bottom-10 opacity-25">
                      <MandalaWatermark className="h-48 w-48 text-[#C8A253]" />
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#E6E1D8]/80 pb-3 border-b border-white/15">
                      <div className="flex items-center gap-2">
                        <LotusEmblem className="h-4 w-4 text-[#C8A253]" />
                        <span className="font-serif tracking-widest uppercase font-bold text-[#F7F4EF]">
                          Stretch with Lorie
                        </span>
                      </div>
                      <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold text-[#F7E7C4] border border-white/20">
                        {completedOrder.type === 'subscription' ? 'SANCTUARY MEMBER' : 'MINDFUL GIFT PASS'}
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="text-[10px] uppercase tracking-wider text-[#E6E1D8]/70">
                        {completedOrder.type === 'subscription' ? 'Member Name' : 'Gifted With Love To'}
                      </div>
                      <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#F7F4EF] mt-0.5">
                        {completedOrder.recipientName}
                      </h4>
                      {completedOrder.personalNote && (
                        <p className="mt-2 text-xs italic text-[#E6E1D8]/95 bg-black/25 p-3 rounded-2xl border border-white/10 leading-relaxed">
                          &ldquo;{completedOrder.personalNote}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-white/15 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase text-[#E6E1D8]/70 block font-medium">Pass Value</span>
                        <span className="text-xl sm:text-2xl font-bold font-serif text-[#F7E7C4]">
                          GH₵ {completedOrder.amount}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase text-[#E6E1D8]/70 block font-medium">Sanctuary Voucher Code</span>
                        <span className="font-mono text-sm sm:text-base font-bold tracking-wider text-white bg-black/35 px-3 py-1 rounded-xl border border-white/20 inline-block mt-0.5">
                          {completedOrder.voucherCode}
                        </span>
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
                  {/* TAB 1: MONTHLY SUBSCRIPTION FLOW */}
                  {/* ========================================================= */}
                  {activeTab === 'subscription' && (
                    <div className="space-y-6">

                      {/* SENSORY YOGA RITUAL BAR */}
                      <div className="rounded-2xl bg-gradient-to-r from-[#EBF0E9] via-[#F3F6F2] to-[#FAF8F5] border border-[#D5E0D2] p-3.5 sm:p-4 text-xs text-[#5A6952] space-y-2">
                        <div className="flex items-center gap-2 font-bold text-[#232D21]">
                          <LotusEmblem className="h-4 w-4 text-[#7A8B71]" />
                          <span>Included in Every Studio Membership</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-[#5C6260]">
                          <div className="flex items-center gap-1.5">
                            <Coffee className="h-3.5 w-3.5 text-[#C8A253] shrink-0" />
                            <span>Post-flow herbal tea ritual</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Check className="h-3.5 w-3.5 text-[#7A8B71] shrink-0" />
                            <span>Manduka Pro mat & blocks reserved</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Feather className="h-3.5 w-3.5 text-[#7A8B71] shrink-0" />
                            <span>Calming essential oil cooldown</span>
                          </div>
                        </div>
                      </div>

                      {/* TACTILE 3D MEMBER CARD PREVIEW */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold uppercase tracking-wider text-[#5C6260] flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-[#C8A253]" />
                            Your Sanctuary Member Keycard
                          </label>
                          <span className="text-[11px] font-semibold text-[#7A8B71]">Live Dynamic Preview</span>
                        </div>

                        <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 text-white shadow-lg border border-[#C8A253]/50 bg-gradient-to-br from-[#232D21] via-[#2F3C2C] to-[#1C241B]">
                          <div className="pointer-events-none absolute -right-8 -bottom-8 opacity-20">
                            <MandalaWatermark className="h-44 w-44 text-[#C8A253]" />
                          </div>

                          <div className="flex items-center justify-between pb-3 border-b border-white/15">
                            <div className="flex items-center gap-2">
                              <LotusEmblem className="h-4 w-4 text-[#C8A253]" />
                              <span className="font-serif tracking-widest text-xs uppercase font-bold text-[#F7F4EF]">
                                Stretch with Lorie
                              </span>
                            </div>
                            <span className="rounded-full bg-[#C8A253] px-2.5 py-0.5 text-[10px] font-bold text-[#232D21]">
                              {selectedPlan.badge}
                            </span>
                          </div>

                          <div className="mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                            <div>
                              <span className="text-[10px] uppercase text-[#E6E1D8]/70 block font-medium">Sanctuary Yogi</span>
                              <h4 className="text-lg sm:text-xl font-serif font-bold text-[#F7F4EF]">
                                {subFormData.fullName.trim() || 'Your Name on Mat'}
                              </h4>
                              <p className="text-xs text-[#C8A253] font-medium mt-0.5">
                                {selectedPlan.name} • {selectedPlan.classesPerMonth} Sessions / Month
                              </p>
                            </div>

                            <div className="text-left sm:text-right">
                              <span className="text-[10px] uppercase text-[#E6E1D8]/70 block font-medium">Monthly Investment</span>
                              <span className="font-serif text-xl sm:text-2xl font-bold text-[#F7E7C4]">
                                GH₵ {selectedPlan.price}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-[#E6E1D8]/75">
                            <span>📍 Studio Sanctuary, East Legon</span>
                            <span>Starts: {subFormData.startDate || 'Immediate'}</span>
                          </div>
                        </div>
                      </div>

                      {/* SELECT SUBSCRIPTION TIER */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#5C6260] block">
                          Choose Your Mindful Pass Tier
                        </label>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          {SUBSCRIPTION_PLANS.map((plan) => {
                            const isSelected = selectedPlanId === plan.id;
                            return (
                              <div
                                key={plan.id}
                                onClick={() => setSelectedPlanId(plan.id)}
                                className={`relative cursor-pointer rounded-2xl p-4 transition-all border flex flex-col justify-between ${isSelected
                                  ? 'bg-white border-[#7A8B71] shadow-md ring-2 ring-[#7A8B71]/40'
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
                                    <span className="text-[11px] font-semibold text-[#7A8B71]">
                                      {plan.savings}
                                    </span>
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

                      {/* SUBSCRIBER CONTACT DETAILS */}
                      <div className="rounded-2xl border border-[#E6E1D8] bg-white p-4 sm:p-5 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C6260] flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-[#7A8B71]" />
                          Member Registration & Practice Schedule
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                              Full Name *
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
                              Email Address (For Pass & Receipts) *
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
                  {/* TAB 2: DIGITAL MINDFUL GIFT CARD */}
                  {/* ========================================================= */}
                  {activeTab === 'gift' && (
                    <div className="space-y-6">

                      {/* INTERACTIVE LIVE PREVIEW OF THE MINDFUL GIFT CARD */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold uppercase tracking-wider text-[#5C6260] flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-[#C8A253]" />
                            Mindful Gift Certificate Preview
                          </label>

                          {/* YOGA PALETTE SELECTOR */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-[#5C6260]">Palette:</span>
                            <button
                              type="button"
                              onClick={() => setGiftTheme('sage')}
                              className={`h-4.5 w-4.5 rounded-full bg-[#7A8B71] border-2 transition-transform cursor-pointer ${giftTheme === 'sage' ? 'border-[#2B2E31] scale-125 ring-2 ring-[#7A8B71]/40' : 'border-white'}`}
                              title="Eucalyptus Sanctuary"
                            />
                            <button
                              type="button"
                              onClick={() => setGiftTheme('gold')}
                              className={`h-4.5 w-4.5 rounded-full bg-[#C8A253] border-2 transition-transform cursor-pointer ${giftTheme === 'gold' ? 'border-[#2B2E31] scale-125 ring-2 ring-[#C8A253]/40' : 'border-white'}`}
                              title="Champagne Sunlight"
                            />
                            <button
                              type="button"
                              onClick={() => setGiftTheme('blush')}
                              className={`h-4.5 w-4.5 rounded-full bg-[#A44A4A] border-2 transition-transform cursor-pointer ${giftTheme === 'blush' ? 'border-[#2B2E31] scale-125 ring-2 ring-[#A44A4A]/40' : 'border-white'}`}
                              title="Terracotta Sunset"
                            />
                            <button
                              type="button"
                              onClick={() => setGiftTheme('midnight')}
                              className={`h-4.5 w-4.5 rounded-full bg-[#182017] border-2 transition-transform cursor-pointer ${giftTheme === 'midnight' ? 'border-[#2B2E31] scale-125 ring-2 ring-black/40' : 'border-white'}`}
                              title="Midnight Nirvana"
                            />
                          </div>
                        </div>

                        <div className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 text-white shadow-lg border transition-all ${giftTheme === 'gold'
                          ? 'bg-gradient-to-br from-[#8C6D27] via-[#A88434] to-[#695019] border-[#E8C87A]'
                          : giftTheme === 'blush'
                            ? 'bg-gradient-to-br from-[#7D4545] via-[#8F5252] to-[#663535] border-[#EAD3D5]/40'
                            : giftTheme === 'midnight'
                              ? 'bg-gradient-to-br from-[#121811] via-[#1E291C] to-[#0D120C] border-[#C8A253]/60'
                              : 'bg-gradient-to-br from-[#232D21] via-[#2F3C2C] to-[#1C241B] border-[#C8A253]/50'
                          }`}>
                          <div className="pointer-events-none absolute -right-6 -bottom-6 opacity-25">
                            <MandalaWatermark className="h-44 w-44 text-[#C8A253]" />
                          </div>

                          <div className="flex items-center justify-between pb-3 border-b border-white/15">
                            <div className="flex items-center gap-2">
                              <LotusEmblem className="h-4 w-4 text-[#C8A253]" />
                              <span className="font-serif tracking-widest uppercase font-bold text-xs text-[#F7F4EF]">
                                Stretch with Lorie
                              </span>
                            </div>
                            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-[#F7E7C4] border border-white/20">
                              MINDFUL WELLNESS GIFT
                            </span>
                          </div>

                          <div className="mt-3.5">
                            <span className="text-[10px] uppercase text-[#E6E1D8]/70 block font-medium">Prepared Specially For</span>
                            <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#F7F4EF]">
                              {giftFormData.recipientName.trim() || 'A Cherished Friend'}
                            </h4>
                            <p className="mt-1.5 text-xs italic text-[#E6E1D8]/95 leading-relaxed bg-black/20 p-2.5 rounded-xl border border-white/10">
                              &ldquo;{giftFormData.personalNote || 'Wishing you radiant wellness, presence, and calm.'}&rdquo;
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] uppercase text-[#E6E1D8]/70 block font-medium">Gift Amount</span>
                              <span className="text-xl sm:text-2xl font-serif font-bold text-[#F7E7C4]">
                                GH₵ {finalGiftAmount || 200}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] uppercase text-[#E6E1D8]/70 block font-medium">Blessed By</span>
                              <span className="text-xs font-semibold text-white">
                                {giftFormData.senderName.trim() || 'Your Name'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CHOOSE GIFT VALUE */}
                      <div className="space-y-2.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#5C6260] block">
                          Choose Gift Amount
                        </label>

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
                            <span className="text-xs font-bold text-[#A44A4A] block">
                              Custom Amount
                            </span>
                            <span className="text-xs font-semibold text-[#2B2E31] block mt-0.5">
                              Any Value
                            </span>
                            <span className="text-[10px] text-[#5C6260] block mt-0.5">
                              Min GH₵ 100
                            </span>
                          </button>
                        </div>

                        {isCustomAmount && (
                          <div className="pt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#2B2E31]">GH₵</span>
                              <input
                                type="number"
                                min="100"
                                step="50"
                                placeholder="Enter custom amount (e.g. 500)"
                                value={customAmountValue}
                                onChange={(e) => setCustomAmountValue(e.target.value)}
                                className="flex-1 rounded-xl border border-[#E6E1D8] px-3 py-2 text-xs sm:text-sm outline-none focus:border-[#A44A4A]"
                              />
                            </div>
                            {errors.giftAmount && (
                              <p className="text-[11px] text-[#A44A4A] mt-1">{errors.giftAmount}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* RECIPIENT & SENDER FIELDS */}
                      <div className="rounded-2xl border border-[#E6E1D8] bg-white p-4 sm:p-5 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C6260] flex items-center gap-1.5">
                          <Gift className="h-3.5 w-3.5 text-[#A44A4A]" />
                          Recipient & Heartfelt Affirmation
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

                          {/* MINDFUL AFFIRMATION SELECTOR */}
                          <div className="sm:col-span-2 space-y-2">
                            <label className="block text-xs font-semibold text-[#2B2E31]">
                              Personal Note / Mindful Blessing
                            </label>

                            <div className="flex flex-wrap gap-1.5 pb-1">
                              {MINDFUL_AFFIRMATIONS.map((aff, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setGiftFormData({ ...giftFormData, personalNote: aff })}
                                  className="text-[10px] font-medium rounded-full bg-[#FAF8F5] border border-[#E6E1D8] hover:border-[#7A8B71] hover:text-[#5A6952] px-2.5 py-1 transition-colors cursor-pointer text-[#5C6260]"
                                >
                                  {i === 0 && '🪷 Peace & Grounding'}
                                  {i === 1 && '✨ Mindful Stillness'}
                                  {i === 2 && '🌿 Strength & Calm'}
                                  {i === 3 && '☀️ Radiant Vitality'}
                                </button>
                              ))}
                            </div>

                            <textarea
                              rows={2}
                              value={giftFormData.personalNote}
                              onChange={(e) => setGiftFormData({ ...giftFormData, personalNote: e.target.value })}
                              placeholder="Write a warm note for them..."
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
              {/* <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#7A8B71]" />
                <span className="text-xs text-[#5C6260]">
                  Paystack Mobile Money & Card • Instant Pass Issuance
                </span>
              </div> */}

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
                          ? `Activate Pass • GH₵ ${selectedPlan.price}`
                          : `Send Gift Pass • GH₵ ${finalGiftAmount || 200}`}
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
