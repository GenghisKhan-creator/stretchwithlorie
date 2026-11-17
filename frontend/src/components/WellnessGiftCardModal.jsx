import { useState } from 'react';
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
  CheckCircle2,
  Send
} from 'lucide-react';
import MobileMoneyLogo from './MobileMoneyLogo';
import { PaystackIcon } from './RegistrationForm';

// SUBSCRIPTION PLANS DATA
const SUBSCRIPTION_PLANS = [
  {
    id: 'plan-starter',
    name: 'Starter Flow Pass',
    badge: 'Flexible',
    classesPerMonth: 2,
    price: 380,
    savings: 'Save GH₵ 20',
    description: 'Perfect for bi-weekly rejuvenation and balance.',
    features: [
      '2 Studio Sessions per month',
      'Complimentary Manduka Mat usage',
      'Infused herbal tea ritual after each class',
      'Valid for 35 days from start date',
      'Flexible reschedule up to 24h prior'
    ]
  },
  {
    id: 'plan-sanctuary',
    name: 'Sanctuary Flow Pass',
    badge: 'Most Popular',
    isPopular: true,
    classesPerMonth: 4,
    price: 700,
    savings: 'Save GH₵ 100',
    description: 'Weekly practice for deep mobility, strength & stress relief.',
    features: [
      '4 Studio Classes per month (GH₵ 175/class)',
      'Priority Sanctuary mat spot reservation',
      'Complimentary mat & organic herbal tea ritual',
      '10% off any Private 1-on-1 Stretch session',
      '1 Free guest pass per quarter',
      'Roll over up to 1 unused class to next month'
    ]
  },
  {
    id: 'plan-vip',
    name: 'VIP Immersion Pass',
    badge: 'Ultimate Value',
    classesPerMonth: 8,
    price: 1350,
    savings: 'Save GH₵ 250',
    description: 'Full studio access + 1 private 1-on-1 stretch session.',
    features: [
      '8 Studio Classes per month',
      '1 Private 1-on-1 Assisted Stretch session included',
      'Bring 1 guest free each month',
      'Dedicated alignment consultation with Lorie',
      'Reserved front-row mat & complimentary studio towel',
      'VIP WhatsApp Concierge booking'
    ]
  }
];

// GIFT CARD PRESET AMOUNTS
const GIFT_PRESETS = [
  { amount: 200, label: 'Single Class Pass', desc: '1 Group Studio Session' },
  { amount: 380, label: 'Starter Pass', desc: '2 Group Studio Sessions' },
  { amount: 700, label: '1-Month Pass', desc: '4 Classes + Tea Ritual' },
  { amount: 850, label: 'Private Sanctuary', desc: '1-on-1 Private Stretch' },
  { amount: 1350, label: 'VIP Immersion', desc: '8 Classes + 1 Private' }
];

export default function WellnessGiftCardModal({
  isOpen,
  onClose,
  initialTab = 'subscription', // 'subscription' | 'gift'
  onSuccessBooking
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'subscription' | 'gift'

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
  const [giftTheme, setGiftTheme] = useState('sage'); // 'sage' | 'gold' | 'blush'
  const [giftFormData, setGiftFormData] = useState({
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    personalNote: 'Wishing you peace, radiant energy, and mindful renewal on your wellness journey.',
    deliveryOption: 'whatsapp', // 'whatsapp' | 'email' | 'self'
    paymentChannel: 'momo',
    momoNetwork: 'MTN',
    momoNumber: '',
    agreedToTerms: false
  });

  // Flow states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState(0);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [errors, setErrors] = useState({});
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const selectedPlan = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlanId) || SUBSCRIPTION_PLANS[1];
  const finalGiftAmount = isCustomAmount ? (parseFloat(customAmountValue) || 0) : giftAmount;

  // Validation
  const validateSubscription = () => {
    const errs = {};
    if (!subFormData.fullName.trim()) errs.subFullName = 'Full name is required.';
    if (!subFormData.email.trim() || !/^\S+@\S+\.\S+$/.test(subFormData.email.trim())) {
      errs.subEmail = 'Valid email is required.';
    }
    if (!subFormData.phone.trim() || subFormData.phone.trim().length < 8) {
      errs.subPhone = 'WhatsApp / phone number is required.';
    }
    if (subFormData.paymentChannel === 'momo') {
      const num = subFormData.momoNumber || subFormData.phone;
      if (!num || num.trim().length < 8) {
        errs.subMomoNumber = 'Mobile Money phone number is required.';
      }
    }
    if (!subFormData.agreedToTerms) {
      errs.subAgreedToTerms = 'You must confirm and accept the mandatory studio conditions before making payment.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateGift = () => {
    const errs = {};
    if (isCustomAmount && (!finalGiftAmount || finalGiftAmount < 100)) {
      errs.giftAmount = 'Minimum gift card value is GH₵ 100.';
    }
    if (!giftFormData.senderName.trim()) errs.senderName = 'Your name is required.';
    if (!giftFormData.senderPhone.trim()) errs.senderPhone = 'Your phone number is required.';
    if (!giftFormData.recipientName.trim()) errs.recipientName = "Recipient's name is required.";
    if (giftFormData.paymentChannel === 'momo') {
      const num = giftFormData.momoNumber || giftFormData.senderPhone;
      if (!num || num.trim().length < 8) {
        errs.giftMomoNumber = 'Mobile Money phone number is required.';
      }
    }
    if (!giftFormData.agreedToTerms) {
      errs.giftAgreedToTerms = 'You must confirm and accept the mandatory studio conditions before making payment.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submission handler
  const handleProcessOrder = async () => {
    if (activeTab === 'subscription') {
      if (!validateSubscription()) return;
    } else {
      if (!validateGift()) return;
    }

    setIsSubmitting(true);
    setSubmissionStep(1);

    // Simulate Paystack Mobile Money prompt steps
    setTimeout(() => setSubmissionStep(2), 650);
    setTimeout(() => setSubmissionStep(3), 1350);

    setTimeout(() => {
      const codeSuffix = Math.floor(1000 + Math.random() * 9000);
      const isSub = activeTab === 'subscription';
      const order = {
        type: isSub ? 'subscription' : 'gift_card',
        orderId: isSub ? `SWL-SUB-${codeSuffix}` : `SWL-GIFT-${codeSuffix}`,
        voucherCode: `LORIE-${codeSuffix}`,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        amount: isSub ? selectedPlan.price : finalGiftAmount,
        title: isSub ? selectedPlan.name : `Wellness Gift Card (GH₵ ${finalGiftAmount})`,
        buyerName: isSub ? subFormData.fullName : giftFormData.senderName,
        buyerPhone: isSub ? subFormData.phone : giftFormData.senderPhone,
        buyerEmail: isSub ? subFormData.email : giftFormData.senderEmail,
        recipientName: isSub ? subFormData.fullName : giftFormData.recipientName,
        recipientPhone: isSub ? subFormData.phone : giftFormData.recipientPhone,
        personalNote: isSub ? '' : giftFormData.personalNote,
        paymentChannel: isSub ? subFormData.paymentChannel : giftFormData.paymentChannel,
        momoNetwork: isSub ? subFormData.momoNetwork : giftFormData.momoNetwork,
        momoNumber: isSub ? (subFormData.momoNumber || subFormData.phone) : (giftFormData.momoNumber || giftFormData.senderPhone),
        theme: giftTheme,
        plan: isSub ? selectedPlan : null
      };

      // Save to localStorage registrations so instructor can see it
      try {
        const storageKey = 'stretchwithlorie_registrations_v7';
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const newRecord = {
          id: `reg-${Date.now()}`,
          bookingRef: order.orderId,
          paystackRef: `pstk_pass_${Date.now().toString(36)}`,
          studentName: isSub ? order.buyerName : `${order.buyerName} (Gift for ${order.recipientName})`,
          email: order.buyerEmail || 'client@stretchwithlorie.com',
          phone: order.buyerPhone,
          className: order.title,
          classDate: isSub ? `Starts ${subFormData.startDate}` : 'Flexible / 6 Months Validity',
          classTime: isSub ? subFormData.preferredTime : 'On Demand',
          locationType: 'Studio Sanctuary',
          amountPaid: order.amount,
          paymentStatus: 'PAID',
          paymentChannel: order.paymentChannel === 'momo' ? `Mobile Money (${order.momoNetwork})` : 'Card',
          bookedAt: new Date().toISOString(),
          specialRequests: isSub
            ? `Monthly Subscription Pass: ${selectedPlan.name}. Tel: ${order.momoNumber}`
            : `Gift Card to ${order.recipientName}. Code: ${order.voucherCode}. Note: "${order.personalNote}"`
        };
        localStorage.setItem(storageKey, JSON.stringify([newRecord, ...existing]));
      } catch (e) {
        console.error('Failed to store order in local registry', e);
      }

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
      ? `Hello Lorie! 🌿\n\nI just purchased the *${completedOrder.title}* (ID: *${completedOrder.orderId}*) for GH₵ ${completedOrder.amount}.\n\n*Name:* ${completedOrder.buyerName}\n*Phone:* ${completedOrder.buyerPhone}\n*Preferred Start:* ${subFormData.startDate} (${subFormData.preferredTime})\n\nPlease confirm my monthly pass activation. Excited to stretch with you!`
      : `✨ *A Wellness Gift for You!* ✨\n\nDearest *${completedOrder.recipientName}*,\n\n${completedOrder.buyerName} has gifted you a *Stretch with Lorie Wellness Card* valued at *GH₵ ${completedOrder.amount}*!\n\n"${completedOrder.personalNote}"\n\n🌿 *Voucher Code:* ${completedOrder.voucherCode}\n📍 *Redeem at:* Stretch with Lorie Sanctuary\n📞 *Book via WhatsApp:* +233 24 123 4567\n\nEnjoy your rejuvenating wellness session!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 sm:py-6 overflow-y-auto bg-[#181B1C]/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#F7F4EF] border border-[#E6E1D8] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-[#2B2E31]">
        
        {/* MODAL HEADER */}
        <div className="relative bg-gradient-to-r from-[#2A3628] via-[#384635] to-[#252E23] p-5 sm:p-6 text-white shrink-0 border-b border-[#C8A253]/30">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#C8A253]/20 border border-[#C8A253]/50 px-3 py-0.5 text-xs font-semibold text-[#F7E7C4] mb-1.5 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-[#C8A253]" />
                Signature Special Offer
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#F7F4EF]">
                Wellness Pass & Gift Cards
              </h2>
              <p className="text-xs sm:text-sm text-[#E6E1D8]/85 mt-0.5">
                Monthly studio subscription memberships and digital gifting vouchers.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* TWO MAIN TABS (Subscription vs Gift) */}
          {!completedOrder && (
            <div className="mt-4 grid grid-cols-2 gap-2 bg-[#1F271E]/60 p-1 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => { setActiveTab('subscription'); setErrors({}); }}
                className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'subscription'
                    ? 'bg-[#F7F4EF] text-[#2B2E31] shadow-md font-bold'
                    : 'text-[#E6E1D8]/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <Calendar className="h-4 w-4 text-[#7A8B71]" />
                <span>Monthly Subscription</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('gift'); setErrors({}); }}
                className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'gift'
                    ? 'bg-[#F7F4EF] text-[#2B2E31] shadow-md font-bold'
                    : 'text-[#E6E1D8]/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <Gift className="h-4 w-4 text-[#A44A4A]" />
                <span>Gift to a Friend</span>
              </button>
            </div>
          )}
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* ========================================================= */}
          {/* SUCCESS SCREEN */}
          {/* ========================================================= */}
          {completedOrder ? (
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E5ECE2] text-[#5A6952] ring-8 ring-[#E5ECE2]/40">
                  <CheckCircle2 className="h-8 w-8 text-[#7A8B71]" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#2B2E31]">
                  {completedOrder.type === 'subscription' ? 'Subscription Activated!' : 'Wellness Gift Card Issued!'}
                </h3>
                <p className="text-xs sm:text-sm text-[#5C6260] max-w-md mx-auto">
                  {completedOrder.type === 'subscription'
                    ? 'Your monthly studio pass is confirmed. Welcome to consistent wellness with Lorie.'
                    : `Your digital gift voucher has been generated for ${completedOrder.recipientName}.`}
                </p>
              </div>

              {/* RENDERED LUXURY VOUCHER CARD */}
              <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-7 text-white shadow-xl border ${
                completedOrder.theme === 'gold'
                  ? 'bg-gradient-to-br from-[#8C6D27] via-[#A88434] to-[#695019] border-[#E8C87A]'
                  : completedOrder.theme === 'blush'
                  ? 'bg-gradient-to-br from-[#7D4545] via-[#8F5252] to-[#663535] border-[#EAD3D5]/40'
                  : 'bg-gradient-to-br from-[#2A3628] via-[#384635] to-[#1F271E] border-[#C8A253]/50'
              }`}>
                {/* Decorative foil glow */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-xl" />
                
                <div className="flex items-center justify-between text-xs text-[#E6E1D8]/80 pb-3 border-b border-white/15">
                  <span className="font-serif tracking-widest uppercase font-bold text-[#F7F4EF]">
                    Stretch with Lorie
                  </span>
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold text-[#F7E7C4] border border-white/20">
                    {completedOrder.type === 'subscription' ? 'ACTIVE MEMBERSHIP' : 'DIGITAL GIFT PASS'}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-[11px] uppercase tracking-wider text-[#E6E1D8]/70">
                    {completedOrder.type === 'subscription' ? 'Member Name' : 'Gifted To'}
                  </div>
                  <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#F7F4EF]">
                    {completedOrder.recipientName}
                  </h4>
                  {completedOrder.personalNote && (
                    <p className="mt-2 text-xs italic text-[#E6E1D8]/90 bg-black/20 p-2.5 rounded-xl border border-white/10">
                      &ldquo;{completedOrder.personalNote}&rdquo;
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-white/15 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-[#E6E1D8]/70 block">Pass Value</span>
                    <span className="text-xl font-bold font-serif text-[#F7E7C4]">
                      GH₵ {completedOrder.amount}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase text-[#E6E1D8]/70 block">Voucher Code</span>
                    <span className="font-mono text-sm sm:text-base font-bold tracking-wider text-white bg-black/30 px-2.5 py-1 rounded-lg border border-white/20">
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
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] text-white py-3.5 px-4 font-bold text-sm shadow-md hover:bg-[#20ba5a] transition-all hover:scale-[1.01]"
                >
                  <Send className="h-4 w-4" />
                  <span>
                    {completedOrder.type === 'subscription' ? 'Confirm Start on WhatsApp' : 'Send Gift Voucher on WhatsApp'}
                  </span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={copyVoucherCode}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#E6E1D8] bg-white py-2.5 px-3 text-xs font-semibold text-[#2B2E31] hover:bg-[#FAF8F5] transition-colors"
                  >
                    {copiedCode ? <Check className="h-3.5 w-3.5 text-[#7A8B71]" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedCode ? 'Voucher Copied!' : 'Copy Code'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#E6E1D8] bg-white py-2.5 px-3 text-xs font-semibold text-[#2B2E31] hover:bg-[#FAF8F5] transition-colors"
                  >
                    <Download className="h-3.5 w-3.5 text-[#7A8B71]" />
                    <span>Print / Save Pass</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCompletedOrder(null);
                    onClose();
                  }}
                  className="w-full text-center text-xs text-[#5C6260] hover:text-[#2B2E31] font-semibold py-1 transition-colors"
                >
                  Close & Return to Studio
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ========================================================= */}
              {/* TAB 1: MONTHLY SUBSCRIPTION PASS */}
              {/* ========================================================= */}
              {activeTab === 'subscription' && (
                <div className="space-y-6">
                  {/* Studio Member Perks Highlight */}
                  <div className="rounded-2xl bg-[#EBF0E9] border border-[#D5E0D2] p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs text-[#5A6952]">
                    <div className="flex items-center gap-2">
                      <Coffee className="h-4 w-4 text-[#7A8B71] shrink-0" />
                      <span><strong>Membership Perks:</strong> All passes include complimentary Manduka mat reservation & fresh organic herbal tea ritual.</span>
                    </div>
                  </div>

                  {/* SELECT SUBSCRIPTION PLAN */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#5C6260] block">
                      Choose Your Monthly Pass Tier
                    </label>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {SUBSCRIPTION_PLANS.map((plan) => {
                        const isSelected = selectedPlanId === plan.id;
                        return (
                          <div
                            key={plan.id}
                            onClick={() => setSelectedPlanId(plan.id)}
                            className={`relative cursor-pointer rounded-2xl p-4 transition-all border flex flex-col justify-between ${
                              isSelected
                                ? 'bg-white border-[#7A8B71] shadow-md ring-2 ring-[#7A8B71]/40'
                                : 'bg-[#FAF8F5] border-[#E6E1D8] hover:border-[#7A8B71]/50 hover:bg-white'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1.5">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  plan.isPopular
                                    ? 'bg-[#A44A4A] text-white'
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
                      Member Registration & Preferences
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={subFormData.fullName}
                          onChange={(e) => setSubFormData({ ...subFormData, fullName: e.target.value })}
                          placeholder="e.g. Ama Mensah"
                          className={`w-full rounded-xl border px-3 py-2 text-xs sm:text-sm outline-none transition-colors ${
                            errors.subFullName ? 'border-[#A44A4A] bg-[#FFF5F5]' : 'border-[#E6E1D8] focus:border-[#7A8B71]'
                          }`}
                        />
                        {errors.subFullName && (
                          <p className="text-[11px] text-[#A44A4A] mt-1">{errors.subFullName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                          WhatsApp / Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={subFormData.phone}
                          onChange={(e) => setSubFormData({ ...subFormData, phone: e.target.value })}
                          placeholder="024 123 4567"
                          className={`w-full rounded-xl border px-3 py-2 text-xs sm:text-sm outline-none transition-colors ${
                            errors.subPhone ? 'border-[#A44A4A] bg-[#FFF5F5]' : 'border-[#E6E1D8] focus:border-[#7A8B71]'
                          }`}
                        />
                        {errors.subPhone && (
                          <p className="text-[11px] text-[#A44A4A] mt-1">{errors.subPhone}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={subFormData.email}
                          onChange={(e) => setSubFormData({ ...subFormData, email: e.target.value })}
                          placeholder="ama@example.com"
                          className={`w-full rounded-xl border px-3 py-2 text-xs sm:text-sm outline-none transition-colors ${
                            errors.subEmail ? 'border-[#A44A4A] bg-[#FFF5F5]' : 'border-[#E6E1D8] focus:border-[#7A8B71]'
                          }`}
                        />
                        {errors.subEmail && (
                          <p className="text-[11px] text-[#A44A4A] mt-1">{errors.subEmail}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                          Starting Date
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
                        Paystack Mobile Money & Card
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-[#5A6952]">
                        <PaystackIcon className="h-3 w-3" />
                        <span>Secured by Paystack</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSubFormData({ ...subFormData, paymentChannel: 'momo' })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          subFormData.paymentChannel === 'momo'
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
                        className={`p-3 rounded-xl border text-left transition-all ${
                          subFormData.paymentChannel === 'card'
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
                          Select Mobile Money Network:
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
                              className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                                subFormData.momoNetwork === net.id
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
                            {subFormData.momoNetwork} Mobile Money Number *
                          </label>
                          <input
                            type="tel"
                            value={subFormData.momoNumber}
                            onChange={(e) => setSubFormData({ ...subFormData, momoNumber: e.target.value })}
                            placeholder={subFormData.phone || '024 XXX XXXX'}
                            className={`w-full rounded-xl border px-3 py-2 text-xs sm:text-sm outline-none transition-colors ${
                              errors.subMomoNumber ? 'border-[#A44A4A] bg-[#FFF5F5]' : 'border-[#E6E1D8] focus:border-[#7A8B71]'
                            }`}
                          />
                          {errors.subMomoNumber && (
                            <p className="text-[11px] text-[#A44A4A] mt-1">{errors.subMomoNumber}</p>
                          )}
                          <p className="text-[10px] text-[#5C6260] mt-1">
                            A payment prompt will be pushed directly to this phone to authorize Gh {selectedPlan.price}.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* MANDATORY CONFIRMATION BEFORE MAKING PAYMENT */}
                  <div className={`rounded-2xl border p-4 transition-all ${
                    errors.subAgreedToTerms
                      ? 'border-[#A44A4A] bg-[#FFF8F8] ring-2 ring-[#A44A4A]/25'
                      : 'border-[#E6E1D8] bg-[#FAF8F5]'
                  }`}>
                    <div className="flex items-center gap-2 pb-2 border-b border-[#E6E1D8]">
                      <ShieldCheck className="h-4 w-4 text-[#A44A4A]" />
                      <h5 className="font-serif text-xs font-bold tracking-wide uppercase text-[#2B2E31]">
                        MANDATORY CONFIRMATION BEFORE MAKING PAYMENT
                      </h5>
                    </div>

                    <div className="mt-2.5 space-y-2 text-xs text-[#2B2E31]">
                      <div className="flex items-start gap-2">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E5ECE2] text-[#5A6952] text-[10px] font-bold mt-0.5">
                          1
                        </span>
                        <p className="leading-relaxed">
                          I understand that I must disclose relevant injuries or physical limitations before participating.
                        </p>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E5ECE2] text-[#5A6952] text-[10px] font-bold mt-0.5">
                          2
                        </span>
                        <p className="leading-relaxed">
                          I agree to arrive 10 minutes before my scheduled session.
                        </p>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E5ECE2] text-[#5A6952] text-[10px] font-bold mt-0.5">
                          3
                        </span>
                        <p className="leading-relaxed">
                          I have read and accepted the studio&apos;s cancellation and rescheduling policy.
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
                          I agree to the mandatory studio confirmation above before proceeding to payment. *
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
              {/* TAB 2: DIGITAL WELLNESS GIFT CARD */}
              {/* ========================================================= */}
              {activeTab === 'gift' && (
                <div className="space-y-6">
                  {/* SELECT OR ENTER GIFT AMOUNT */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#5C6260] block">
                      Choose Gift Card Value (GH₵)
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
                            className={`p-3 rounded-2xl border text-left transition-all ${
                              isSelected
                                ? 'bg-white border-[#A44A4A] shadow-sm ring-2 ring-[#A44A4A]/30'
                                : 'bg-[#FAF8F5] border-[#E6E1D8] hover:border-[#A44A4A]/50 hover:bg-white'
                            }`}
                          >
                            <span className="text-xs font-bold text-[#A44A4A] block">
                              GH₵ {preset.amount}
                            </span>
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
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isCustomAmount
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
                            placeholder="Enter amount (e.g. 500)"
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

                  {/* INTERACTIVE LIVE PREVIEW OF THE GIFT CARD */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#5C6260] block">
                        Live Digital Card Preview
                      </label>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-[#5C6260]">Theme:</span>
                        <button
                          type="button"
                          onClick={() => setGiftTheme('sage')}
                          className={`h-4 w-4 rounded-full bg-[#7A8B71] border-2 transition-transform ${giftTheme === 'sage' ? 'border-[#2B2E31] scale-125' : 'border-white'}`}
                          title="Eucalyptus Sage"
                        />
                        <button
                          type="button"
                          onClick={() => setGiftTheme('gold')}
                          className={`h-4 w-4 rounded-full bg-[#C8A253] border-2 transition-transform ${giftTheme === 'gold' ? 'border-[#2B2E31] scale-125' : 'border-white'}`}
                          title="Champagne Gold"
                        />
                        <button
                          type="button"
                          onClick={() => setGiftTheme('blush')}
                          className={`h-4 w-4 rounded-full bg-[#A44A4A] border-2 transition-transform ${giftTheme === 'blush' ? 'border-[#2B2E31] scale-125' : 'border-white'}`}
                          title="Terracotta Blush"
                        />
                      </div>
                    </div>

                    <div className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 text-white shadow-md border ${
                      giftTheme === 'gold'
                        ? 'bg-gradient-to-br from-[#8C6D27] via-[#A88434] to-[#695019] border-[#E8C87A]'
                        : giftTheme === 'blush'
                        ? 'bg-gradient-to-br from-[#7D4545] via-[#8F5252] to-[#663535] border-[#EAD3D5]/40'
                        : 'bg-gradient-to-br from-[#2A3628] via-[#384635] to-[#1F271E] border-[#C8A253]/50'
                    }`}>
                      <div className="flex items-center justify-between pb-3 border-b border-white/15">
                        <span className="font-serif tracking-widest uppercase font-bold text-xs text-[#F7F4EF]">
                          STRETCH WITH LORIE
                        </span>
                        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-[#F7E7C4] border border-white/20">
                          WELLNESS GIFT PASS
                        </span>
                      </div>

                      <div className="mt-3">
                        <span className="text-[10px] uppercase text-[#E6E1D8]/70 block">Specially Prepared For</span>
                        <h4 className="text-lg sm:text-xl font-serif font-bold text-[#F7F4EF]">
                          {giftFormData.recipientName.trim() || 'A Cherished Friend'}
                        </h4>
                        <p className="mt-1 text-xs italic text-[#E6E1D8]/90">
                          &ldquo;{giftFormData.personalNote || 'Wishing you radiant wellness and calm.'}&rdquo;
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase text-[#E6E1D8]/70 block">Gift Amount</span>
                          <span className="text-xl font-serif font-bold text-[#F7E7C4]">
                            GH₵ {finalGiftAmount || 200}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase text-[#E6E1D8]/70 block">From</span>
                          <span className="text-xs font-semibold text-white">
                            {giftFormData.senderName.trim() || 'Your Name'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RECIPIENT & SENDER FIELDS */}
                  <div className="rounded-2xl border border-[#E6E1D8] bg-white p-4 sm:p-5 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C6260] flex items-center gap-1.5">
                      <Gift className="h-3.5 w-3.5 text-[#A44A4A]" />
                      Recipient & Greeting Details
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
                          className={`w-full rounded-xl border px-3 py-2 text-xs sm:text-sm outline-none transition-colors ${
                            errors.recipientName ? 'border-[#A44A4A] bg-[#FFF5F5]' : 'border-[#E6E1D8] focus:border-[#7A8B71]'
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

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                          Personal Note / Affirmation
                        </label>
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
                          className={`w-full rounded-xl border px-3 py-2 text-xs sm:text-sm outline-none transition-colors ${
                            errors.senderName ? 'border-[#A44A4A] bg-[#FFF5F5]' : 'border-[#E6E1D8] focus:border-[#7A8B71]'
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
                          className={`w-full rounded-xl border px-3 py-2 text-xs sm:text-sm outline-none transition-colors ${
                            errors.senderPhone ? 'border-[#A44A4A] bg-[#FFF5F5]' : 'border-[#E6E1D8] focus:border-[#7A8B71]'
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
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                            giftFormData.momoNetwork === net.id
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
                        className={`w-full rounded-xl border px-3 py-2 text-xs sm:text-sm outline-none transition-colors ${
                          errors.giftMomoNumber ? 'border-[#A44A4A] bg-[#FFF5F5]' : 'border-[#E6E1D8] focus:border-[#7A8B71]'
                        }`}
                      />
                      {errors.giftMomoNumber && (
                        <p className="text-[11px] text-[#A44A4A] mt-1">{errors.giftMomoNumber}</p>
                      )}
                    </div>
                  </div>
                  {/* MANDATORY CONFIRMATION BEFORE MAKING PAYMENT */}
                  <div className={`rounded-2xl border p-4 transition-all ${
                    errors.giftAgreedToTerms
                      ? 'border-[#A44A4A] bg-[#FFF8F8] ring-2 ring-[#A44A4A]/25'
                      : 'border-[#E6E1D8] bg-[#FAF8F5]'
                  }`}>
                    <div className="flex items-center gap-2 pb-2 border-b border-[#E6E1D8]">
                      <ShieldCheck className="h-4 w-4 text-[#A44A4A]" />
                      <h5 className="font-serif text-xs font-bold tracking-wide uppercase text-[#2B2E31]">
                        MANDATORY CONFIRMATION BEFORE MAKING PAYMENT
                      </h5>
                    </div>

                    <div className="mt-2.5 space-y-2 text-xs text-[#2B2E31]">
                      <div className="flex items-start gap-2">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E5ECE2] text-[#5A6952] text-[10px] font-bold mt-0.5">
                          1
                        </span>
                        <p className="leading-relaxed">
                          I understand that I must disclose relevant injuries or physical limitations before participating.
                        </p>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E5ECE2] text-[#5A6952] text-[10px] font-bold mt-0.5">
                          2
                        </span>
                        <p className="leading-relaxed">
                          I agree to arrive 10 minutes before my scheduled session.
                        </p>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E5ECE2] text-[#5A6952] text-[10px] font-bold mt-0.5">
                          3
                        </span>
                        <p className="leading-relaxed">
                          I have read and accepted the studio&apos;s cancellation and rescheduling policy.
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
                          I agree to the mandatory studio confirmation above before proceeding to payment. *
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

        {/* MODAL FOOTER */}
        {!completedOrder && (
          <div className="bg-[#FAF8F5] border-t border-[#E6E1D8] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#7A8B71]" />
              <span className="text-xs text-[#5C6260]">
                Safe Mobile Money & Card Checkout • Instant Delivery
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-[#E6E1D8] text-xs font-semibold text-[#5C6260] hover:bg-white hover:text-[#2B2E31] transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleProcessOrder}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#A44A4A] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#8f3e3e] transition-all hover:scale-[1.01] disabled:opacity-75"
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
                    <Sparkles className="h-4 w-4 text-[#C8A253]" />
                    <span>
                      {activeTab === 'subscription'
                        ? `Activate Pass • Gh ${selectedPlan.price}`
                        : `Buy Gift Card • Gh ${finalGiftAmount || 200}`}
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
  );
}
