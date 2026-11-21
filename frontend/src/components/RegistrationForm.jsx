import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  HeartPulse,
  CreditCard,
  Lock,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Smartphone,
  CheckCircle2,
  Home,
  Building2,
  Sparkles,
  ClipboardList,
  Check,
  AlertCircle,
  Tag,
  X
} from 'lucide-react';
import MobileMoneyLogo from './MobileMoneyLogo';
import { api } from '../services/api';
import massYogaImg from '../assets/mass_yoga_class.jpg';
import privateYogaImg from '../assets/private_yoga_class.jpg';
import flexibilityMasterclassImg from '../assets/flexibility_masterclass.jpg';
import thaiYogaStretchesImg from '../assets/thai_yoga_stretches.jpg';
import couplesYogaImg from '../assets/couples_yoga.jpg';
import yogaChampagneImg from '../assets/yoga_champagne.jpg';

const CLASS_FALLBACK_IMAGES = {
  'cls-mass': massYogaImg,
  'cls-private': privateYogaImg,
  'cls-masterclass': flexibilityMasterclassImg,
  'cls-thai': thaiYogaStretchesImg,
  'cls-couples': couplesYogaImg,
  'cls-champagne': yogaChampagneImg
};

// Paystack Official Mark Icon
export function PaystackIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 6.5C3 5.67157 3.67157 5 4.5 5H19.5C20.3284 5 21 5.67157 21 6.5C21 7.32843 20.3284 8 19.5 8H4.5C3.67157 8 3 7.32843 3 6.5Z" fill="#00C3F7" />
      <path d="M3 12C3 11.1716 3.67157 10.5 4.5 10.5H15.5C16.3284 10.5 17 11.1716 17 12C17 12.8284 16.3284 13.5 15.5 13.5H4.5C3.67157 13.5 3 12.8284 3 12Z" fill="#00C3F7" />
      <path d="M3 17.5C3 16.6716 3.67157 16 4.5 16H19.5C20.3284 16 21 16.6716 21 17.5C21 18.3284 20.3284 19 19.5 19H4.5C3.67157 19 3 18.3284 3 17.5Z" fill="#00C3F7" />
    </svg>
  );
}

export default function RegistrationForm({
  selectedClass,
  preselectedSlot,
  initialData,
  onSubmitBooking,
  isSubmitting,
  onCancel
}) {
  // Compute initial slot
  const defaultSlot = () => {
    if (preselectedSlot) return preselectedSlot;
    if (selectedClass?.hasScheduleSlots && selectedClass.scheduleSlots?.length > 0) {
      const firstOpen =
        selectedClass.scheduleSlots.find(
          (s) => !s.isFull && (s.spotsLeft ?? (s.maxCapacity - s.bookedCount)) > 0
        ) || selectedClass.scheduleSlots[0];
      return `${firstOpen.day} ${firstOpen.time}`;
    }
    return 'Wednesdays 7:00 AM';
  };

  // Compute initial session option ID
  const defaultSessionId = () => {
    if (selectedClass?.hasSessionOptions && selectedClass.sessionOptions?.length > 0) {
      const firstOpenOpt =
        selectedClass.sessionOptions.find((opt) => !opt.isFull && (opt.spotsLeft ?? 1) > 0) ||
        selectedClass.sessionOptions[0];
      return firstOpenOpt.id;
    }
    return '';
  };

  // Compute default private session date
  const defaultPrivateDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    fullName: initialData?.studentName || initialData?.fullName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    healthNotes: '',
    paymentChannel: 'momo', // 'momo' (Mobile Money) or 'card'
    momoNetwork: 'MTN', // 'MTN' | 'Telecel' | 'AirtelTigo'
    momoNumber: initialData?.phone || '',
    locationOption: 'studio', // 'studio' | 'clientLocation'
    clientAddress: '',
    selectedSlot: defaultSlot(),
    selectedSessionId: defaultSessionId(),
    preferredDate: defaultPrivateDate(),
    selectedTimeWindow: 'Morning (7:00 AM - 10:00 AM)',
    // New Client Questionnaire State
    isFirstTime: initialData?.isFirstTime !== undefined ? initialData.isFirstTime : true,
    intake: initialData?.intake || {
      practicedBefore: 'Yes', // 'Yes' | 'No'
      experienceLevel: 'Beginner', // 'Beginner' | 'Intermediate' | 'Advanced'
      mainGoal: 'Flexibility & Mobility',
      customGoal: '',
      hasInjuries: 'No', // 'No' | 'Yes'
      injuriesDetails: '',
      pregnancyStatus: 'No', // 'No' | 'Pregnant' | 'Postpartum'
      instructorNotes: '',
      returningNotes: ''
    },
    // Mandatory Confirmation Before Payment
    agreedToMandatoryTerms: false
  });

  const handleIntakeChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      intake: {
        ...prev.intake,
        [field]: value
      }
    }));
  };

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submissionPhase, setSubmissionPhase] = useState(0);

  // Creator Referral & Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState(() => {
    try {
      return sessionStorage.getItem('stretchwithlorie_active_ref') || '';
    } catch {
      return '';
    }
  });
  const [appliedReferral, setAppliedReferral] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  // Base price before discount (handles studio Gh 300 vs client location Gh 500 for private sessions)
  const basePrice = selectedClass
    ? selectedClass.locationPricing
      ? selectedClass.locationPricing[formData.locationOption] || selectedClass.price
      : selectedClass.price
    : 0;

  // Auto-apply URL referral code or recalculate discount when basePrice changes
  useEffect(() => {
    if (!selectedClass) return;
    let activeCode = appliedReferral?.code;
    if (!activeCode) {
      try {
        activeCode = sessionStorage.getItem('stretchwithlorie_active_ref') || '';
      } catch {
        activeCode = '';
      }
    }
    if (!activeCode) return;

    let mounted = true;
    api
      .validateReferralCode(activeCode, basePrice)
      .then((res) => {
        if (mounted && res) {
          setAppliedReferral(res);
          setPromoCodeInput(res.code);
          setPromoError('');
        }
      })
      .catch(() => {
        // silent on auto-check
      });
    return () => {
      mounted = false;
    };
  }, [basePrice, selectedClass, appliedReferral?.code]);

  const handleApplyPromoCode = async () => {
    const clean = promoCodeInput.trim().toUpperCase();
    if (!clean) {
      setPromoError('Please enter a referral or discount code.');
      return;
    }
    setIsValidatingPromo(true);
    setPromoError('');
    try {
      const res = await api.validateReferralCode(clean, basePrice);
      setAppliedReferral(res);
      setPromoCodeInput(res.code);
      try {
        sessionStorage.setItem('stretchwithlorie_active_ref', res.code);
      } catch {
        // ignore
      }
    } catch (err) {
      setAppliedReferral(null);
      setPromoError(err.message || 'Invalid or expired discount code.');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromoCode = () => {
    setAppliedReferral(null);
    setPromoCodeInput('');
    setPromoError('');
    try {
      sessionStorage.removeItem('stretchwithlorie_active_ref');
    } catch {
      // ignore
    }
  };

  // Progressive simulation phases while submitting
  useEffect(() => {
    if (!isSubmitting) {
      return;
    }
    const timer1 = setTimeout(() => setSubmissionPhase(2), 600);
    const timer2 = setTimeout(() => setSubmissionPhase(3), 1300);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isSubmitting]);

  const currentPhase = isSubmitting ? (submissionPhase || 1) : 0;

  if (!selectedClass) {
    return (
      <div className="rounded-3xl border border-dashed border-[#E6E1D8] bg-[#FAF8F5]/80 p-8 sm:p-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E5ECE2] text-[#5A6952]">
          <Calendar className="h-7 w-7" />
        </div>
        <h3 className="font-serif text-xl font-bold text-[#2B2E31]">
          Select an Experience to Book
        </h3>
        <p className="mt-2 text-sm text-[#5C6260] max-w-md mx-auto">
          Choose a group class, 1-on-1 private session, or signature experience from the catalog to begin your reservation.
        </p>
      </div>
    );
  }

  // Active slot lookup & capacity state
  const currentSlotObj = selectedClass?.scheduleSlots?.find(
    (s) =>
      s.id === formData.selectedSlot ||
      `${s.day} ${s.time}` === formData.selectedSlot ||
      s.label === formData.selectedSlot ||
      (formData.selectedSlot && formData.selectedSlot.includes(s.day))
  );

  const isSelectedSlotFull = currentSlotObj
    ? currentSlotObj.isFull || (currentSlotObj.spotsLeft ?? (currentSlotObj.maxCapacity - currentSlotObj.bookedCount)) <= 0
    : false;

  const availableAlternativeSlots = selectedClass?.scheduleSlots?.filter(
    (s) =>
      !s.isFull &&
      (s.spotsLeft ?? (s.maxCapacity - s.bookedCount)) > 0 &&
      s.id !== currentSlotObj?.id
  ) || [];

  // Active session option lookup for Masterclass / Thai Yoga
  const currentOptionObj = selectedClass?.sessionOptions?.find(
    (opt) => opt.id === formData.selectedSessionId
  );

  const isSelectedOptionFull = currentOptionObj
    ? currentOptionObj.isFull || (currentOptionObj.spotsLeft ?? 1) <= 0
    : false;

  const availableAlternativeOptions = selectedClass?.sessionOptions?.filter(
    (opt) =>
      !opt.isFull &&
      (opt.spotsLeft ?? 1) > 0 &&
      opt.id !== currentOptionObj?.id
  ) || [];

  // Calculate dynamic payable price (after any creator referral / discount code)
  const discountAmount = appliedReferral ? Number(appliedReferral.discountAmount || 0) : 0;
  const currentPrice = Math.max(0, basePrice - discountAmount);

  // Form validation rules
  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) {
      errs.fullName = 'Please enter your full name.';
    } else if (formData.fullName.trim().length < 2) {
      errs.fullName = 'Full name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Please provide a phone / WhatsApp number.';
    } else if (formData.phone.trim().length < 7) {
      errs.phone = 'Please provide a valid phone number.';
    }

    // Capacity checks:
    if (selectedClass.hasScheduleSlots && isSelectedSlotFull) {
      errs.selectedSlot = `The ${currentSlotObj?.label || 'selected'} session is fully booked. Please select an open day.`;
    }

    if (selectedClass.hasSessionOptions && !selectedClass.isPrivateOneOnOne && isSelectedOptionFull) {
      errs.selectedSession = `The ${currentOptionObj?.label || currentOptionObj?.date || 'selected'} session date is fully booked. Please select an alternative date.`;
    }

    if (selectedClass.locationPricing && formData.locationOption === 'clientLocation') {
      if (!formData.clientAddress.trim()) {
        errs.clientAddress = 'Please specify your location or address in Accra.';
      }
    }

    if (formData.paymentChannel === 'momo') {
      const activeMoMo = formData.momoNumber || formData.phone;
      if (!activeMoMo.trim() || activeMoMo.trim().length < 7) {
        errs.momoNumber = 'Please provide your Mobile Money number for the prompt.';
      }
    }

    // Mandatory Studio Policy & Injury Disclosure Confirmation
    if (!formData.agreedToMandatoryTerms) {
      errs.agreedToMandatoryTerms = 'You must confirm and accept the mandatory studio conditions before making payment.';
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const currentErrors = validate();
    if (currentErrors[name]) {
      setErrors((prev) => ({ ...prev, [name]: currentErrors[name] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentErrors = validate();
    setErrors(currentErrors);
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      momoNumber: true,
      clientAddress: true,
      agreedToMandatoryTerms: true
    });

    if (Object.keys(currentErrors).length === 0) {
      const momoProviderName =
        formData.momoNetwork === 'Telecel'
          ? 'Telecel Cash'
          : formData.momoNetwork === 'AirtelTigo'
            ? 'AT Money'
            : 'MTN MoMo';

      const paymentMethodName =
        formData.paymentChannel === 'momo'
          ? `Paystack (${momoProviderName})`
          : 'Paystack (Card)';

      const sessionTitle = selectedClass.hasScheduleSlots
        ? `${selectedClass.title} (${formData.selectedSlot})`
        : selectedClass.title;

      // Compile comprehensive intake summary for backward compatibility
      const intakeSummary = formData.isFirstTime
        ? [
            `Yoga Experience: ${formData.intake.experienceLevel} (Practiced before: ${formData.intake.practicedBefore})`,
            `Goal: ${formData.intake.customGoal?.trim() || formData.intake.mainGoal}`,
            formData.intake.hasInjuries === 'Yes' && formData.intake.injuriesDetails?.trim()
              ? `Injuries/Conditions: ${formData.intake.injuriesDetails.trim()}`
              : 'Injuries/Limitations: None reported',
            formData.intake.pregnancyStatus && formData.intake.pregnancyStatus !== 'No'
              ? `Pregnancy/Postpartum: ${formData.intake.pregnancyStatus === 'Pregnant' ? 'Currently Pregnant' : 'Recently Given Birth'}`
              : null,
            formData.intake.instructorNotes?.trim() ? `Instructor Note: "${formData.intake.instructorNotes.trim()}"` : null
          ].filter(Boolean).join(' • ')
        : `Returning Student. Updates: ${formData.intake.returningNotes?.trim() || 'No new updates'}`;

      await onSubmitBooking({
        ...formData,
        healthNotes: intakeSummary,
        intake: formData.intake,
        isFirstTime: formData.isFirstTime,
        amount: currentPrice,
        price: currentPrice,
        promoCode: appliedReferral?.code || null,
        discountAmount: discountAmount || 0,
        creatorName: appliedReferral?.creatorName || null,
        paymentMethod: paymentMethodName,
        classTitle: sessionTitle,
        classId: selectedClass.id,
        slotId: currentSlotObj?.id,
        selectedSlot: currentSlotObj ? `${currentSlotObj.day} ${currentSlotObj.time}` : formData.selectedSlot,
        selectedSessionId: formData.selectedSessionId,
        selectedOptionId: formData.selectedSessionId,
        preferredDate: formData.preferredDate,
        selectedTimeWindow: formData.selectedTimeWindow,
        locationType: selectedClass.locationPricing
          ? formData.locationOption === 'clientLocation'
            ? `Client Location (${formData.clientAddress.trim()})`
            : 'Studio Sanctuary'
          : 'Studio Sanctuary'
      });
    }
  };

  const spotsLeft = Math.max(0, selectedClass.maxCapacity - selectedClass.bookedCount);

  return (
    <div className="overflow-hidden rounded-3xl border border-[#E6E1D8] bg-white shadow-xl transition-all">

      {/* Top Banner: Selected Class Summary */}
      <div className="border-b border-[#E6E1D8] bg-gradient-to-br from-[#F9F3F4] via-[#F7F4EF] to-[#F1F4EF] p-4 sm:p-6 w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="rounded-full bg-[#F1F4EF] border border-[#DDE4DA] px-2.5 py-0.5 text-xs font-semibold text-[#5A6952]">
              {selectedClass.category}
            </span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-[#5C6260] border border-[#E6E1D8]">
              {selectedClass.level}
            </span>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-semibold text-[#A44A4A] hover:underline"
            >
              Change
            </button>
          )}
        </div>

        <div className="flex items-start gap-3.5 sm:gap-4">
          {(selectedClass.image || CLASS_FALLBACK_IMAGES[selectedClass.id]) && (
            <img
              src={selectedClass.image || CLASS_FALLBACK_IMAGES[selectedClass.id]}
              alt={selectedClass.title}
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover object-[center_25%] ring-2 ring-[#E6E1D8] shrink-0 shadow-xs"
            />
          )}
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2B2E31] leading-snug">
              {selectedClass.title}
            </h2>

            <div className="mt-1.5 flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-[#5C6260]">
              <span className="flex items-center gap-1.5 font-medium text-[#2B2E31]">
                <Calendar className="h-3.5 w-3.5 text-[#7A8B71] shrink-0" />
                {selectedClass.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#7A8B71] shrink-0" />
                {selectedClass.time} ({selectedClass.duration})
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#C8A253] shrink-0" />
                {selectedClass.room}
              </span>
            </div>
          </div>
        </div>

        {/* Dedicated Price & Spots Strip - Always readable, never clipped */}
        <div className="mt-3.5 pt-3 border-t border-[#EDE8E0] flex items-center justify-between gap-2">
          <div>
            <span className="text-[11px] text-[#5C6260] uppercase font-semibold block">Total Fee</span>
            <span className="text-[11px] font-medium text-[#5A6952]">
              {spotsLeft > 0 ? `${spotsLeft} spots available` : 'Advance booking'}
            </span>
          </div>
          <div className="text-right">
            {discountAmount > 0 && (
              <span className="text-xs text-[#88908D] line-through mr-1.5">
                GH₵{basePrice}.00
              </span>
            )}
            <p className="text-xl sm:text-2xl font-bold text-[#2B2E31] inline">
              GH₵{currentPrice}.00
            </p>
            {appliedReferral && (
              <span className="block text-[10px] font-bold text-[#5A6952]">
                Code {appliedReferral.code} (-GH₵{discountAmount})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-7 space-y-5">

        {/* Step 1: Session Preferences (Weekly Schedule Slot for Mass Yoga) */}
        {selectedClass.hasScheduleSlots && selectedClass.scheduleSlots?.length > 0 && (
          <div className="space-y-3 pb-4 border-b border-[#EDE8E0]">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B2E31]">
                Choose Your Weekly Schedule Slot
              </label>
              <span className="text-[11px] font-medium text-[#5A6952]">
                60 min each • Studio Sanctuary
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {selectedClass.scheduleSlots.map((slot) => {
                const isSelectedSlot =
                  formData.selectedSlot === `${slot.day} ${slot.time}` ||
                  formData.selectedSlot === slot.label ||
                  formData.selectedSlot === slot.id;
                const isSlotFull =
                  slot.isFull ||
                  (slot.spotsLeft ?? (slot.maxCapacity - slot.bookedCount)) <= 0;
                const left =
                  slot.spotsLeft ??
                  Math.max(0, slot.maxCapacity - slot.bookedCount);

                return (
                  <button
                    key={slot.id || slot.label}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        selectedSlot: `${slot.day} ${slot.time}`
                      }));
                      if (errors.selectedSlot) {
                        setErrors((prev) => ({ ...prev, selectedSlot: undefined }));
                      }
                    }}
                    className={`relative flex sm:flex-col items-center sm:items-start justify-between rounded-2xl p-3 border transition-all text-left ${
                      isSelectedSlot
                        ? isSlotFull
                          ? 'border-[#A44A4A] bg-[#FFF8F8] ring-2 ring-[#A44A4A]/30 shadow-xs'
                          : 'border-[#7A8B71] bg-[#F1F4EF] ring-2 ring-[#7A8B71]/30 shadow-xs'
                        : isSlotFull
                        ? 'border-stone-200 bg-stone-50/80 hover:bg-stone-100/90 text-stone-500'
                        : 'border-[#E6E1D8] bg-white hover:bg-[#FAF6F3]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#2B2E31]">
                        <Calendar className={`h-3.5 w-3.5 shrink-0 ${isSlotFull ? 'text-stone-400' : 'text-[#7A8B71]'}`} />
                        <span className={isSlotFull ? 'line-through text-stone-600' : ''}>{slot.label}</span>
                      </div>
                      <span className="text-[11px] text-[#5C6260] block mt-0.5">{slot.focus}</span>
                    </div>

                    <div className="mt-0 sm:mt-2 flex items-center gap-1.5 flex-wrap justify-end sm:justify-start">
                      {isSlotFull ? (
                        <span className="inline-flex items-center gap-1 font-bold text-[10px] text-[#A44A4A] bg-[#F9F3F4] px-2 py-0.5 rounded-lg border border-[#EAD3D5]">
                          <Lock className="h-2.5 w-2.5" />
                          Sold Out
                        </span>
                      ) : left <= 2 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-[10px] text-[#B45309] bg-[#FFFBEB] px-2 py-0.5 rounded-lg border border-[#FDE68A] animate-pulse">
                          Only {left} spots left
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-[10px] text-[#5A6952] bg-[#E5ECE2] px-2 py-0.5 rounded-lg border border-[#DCE4D9]">
                          {left} spots open
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Alternative Day Recommendation Banner if Selected Slot is Full */}
            {isSelectedSlotFull && (
              <div className="rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-50 to-[#FFFDF9] p-3.5 sm:p-4 text-xs space-y-2.5 animate-in fade-in duration-200 shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs shadow-2xs">
                    !
                  </div>
                  <div>
                    <p className="font-bold text-[#8C5E14] text-xs sm:text-sm">
                      {currentSlotObj?.label} is currently fully booked!
                    </p>
                    <p className="text-[#5C6260] text-[11px] sm:text-xs mt-0.5 leading-relaxed">
                      All 15 mats for this day are reserved. You can easily switch to another open day this week:
                    </p>
                  </div>
                </div>

                {availableAlternativeSlots.length > 0 ? (
                  <div className="pt-1 flex flex-wrap gap-2">
                    {availableAlternativeSlots.map((altSlot) => {
                      const left = altSlot.spotsLeft ?? (altSlot.maxCapacity - altSlot.bookedCount);
                      return (
                        <button
                          key={altSlot.id}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              selectedSlot: `${altSlot.day} ${altSlot.time}`
                            }));
                            if (errors.selectedSlot) {
                              setErrors((prev) => ({ ...prev, selectedSlot: undefined }));
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#7A8B71] text-[#2B2E31] font-semibold hover:bg-[#F1F4EF] hover:border-[#5A6952] active:scale-[0.98] transition-all shadow-xs group cursor-pointer"
                        >
                          <Calendar className="h-3.5 w-3.5 text-[#7A8B71] group-hover:scale-110 transition-transform" />
                          <span>Switch to <strong>{altSlot.label}</strong></span>
                          <span className="text-[10px] text-[#5A6952] font-bold bg-[#E5ECE2] px-1.5 py-0.5 rounded">
                            {left} spots left
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[#A44A4A] font-semibold italic">
                    All group sessions for this week are fully booked. Check our Flexibility Masterclass or 1-on-1 Private Yoga sessions below.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Masterclass Session Dates Selection */}
        {selectedClass.hasSessionOptions && !selectedClass.isPrivateOneOnOne && selectedClass.sessionOptions?.length > 0 && (
          <div className="space-y-3 pb-4 border-b border-[#EDE8E0]">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B2E31]">
                Select Masterclass Session Date
              </label>
              <span className="text-[11px] font-medium text-[#5A6952]">
                60 min intensive
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {selectedClass.sessionOptions.map((opt) => {
                const isSelected = formData.selectedSessionId === opt.id;
                const isOptFull = opt.isFull || (opt.spotsLeft ?? 1) <= 0;
                const left = opt.spotsLeft ?? 1;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, selectedSessionId: opt.id }));
                      if (errors.selectedSession) {
                        setErrors((prev) => ({ ...prev, selectedSession: undefined }));
                      }
                    }}
                    className={`flex flex-col justify-between rounded-2xl p-3 border transition-all text-left ${
                      isSelected
                        ? isOptFull
                          ? 'border-[#A44A4A] bg-[#FFF8F8] ring-2 ring-[#A44A4A]/30 shadow-xs'
                          : 'border-[#7A8B71] bg-[#F1F4EF] ring-2 ring-[#7A8B71]/30 shadow-xs'
                        : isOptFull
                        ? 'border-stone-200 bg-stone-50/80 text-stone-500 hover:bg-stone-100'
                        : 'border-[#E6E1D8] bg-white hover:bg-[#FAF6F3]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#2B2E31]">
                        <Calendar className={`h-3.5 w-3.5 shrink-0 ${isOptFull ? 'text-stone-400' : 'text-[#7A8B71]'}`} />
                        <span className={isOptFull ? 'line-through text-stone-600' : ''}>{opt.label || opt.date}</span>
                      </div>
                      <span className="text-[11px] text-[#5C6260] block mt-0.5">{opt.time}</span>
                    </div>

                    <div className="mt-2">
                      {isOptFull ? (
                        <span className="inline-flex items-center gap-1 font-bold text-[10px] text-[#A44A4A] bg-[#F9F3F4] px-2 py-0.5 rounded-lg border border-[#EAD3D5]">
                          <Lock className="h-2.5 w-2.5" />
                          Sold Out
                        </span>
                      ) : left <= 3 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-[10px] text-[#B45309] bg-[#FFFBEB] px-2 py-0.5 rounded-lg border border-[#FDE68A]">
                          Only {left} spots left
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-[10px] text-[#5A6952] bg-[#E5ECE2] px-2 py-0.5 rounded-lg border border-[#DCE4D9]">
                          {left} spots open
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Alternative Date Suggestion if Selected Option is Full */}
            {isSelectedOptionFull && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-3.5 text-xs space-y-2 animate-in fade-in duration-200">
                <p className="font-bold text-[#8C5E14]">
                  This session date ({currentOptionObj?.label || currentOptionObj?.date}) is fully booked!
                </p>
                <p className="text-[#5C6260] text-[11px]">
                  Switch to one of our other open Saturday intensive dates:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {availableAlternativeOptions.map((altOpt) => (
                    <button
                      key={altOpt.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, selectedSessionId: altOpt.id }))}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#7A8B71] text-[#2B2E31] font-semibold hover:bg-[#F1F4EF] cursor-pointer"
                    >
                      <span>Switch to <strong>{altOpt.label || altOpt.date}</strong></span>
                      <span className="text-[10px] text-[#5A6952] font-bold bg-[#E5ECE2] px-1.5 py-0.2 rounded">
                        {altOpt.spotsLeft} spots
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Private One-on-One: Preferred Date & Time Window */}
        {selectedClass.isPrivateOneOnOne && (
          <div className="space-y-3 pb-4 border-b border-[#EDE8E0]">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B2E31]">
              Preferred Session Date & Time Window
            </label>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#5C6260]">
                Select Date for Your Private Session
              </label>
              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#E6E1D8] bg-[#FAF8F5] py-2.5 px-4 text-xs sm:text-sm text-[#2B2E31] outline-none focus:border-[#7A8B71] focus:bg-white"
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-medium text-[#5C6260]">
                Preferred Time of Day Window
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {selectedClass.sessionOptions?.map((opt) => {
                  const isSelected = formData.selectedTimeWindow === opt.timeWindow;
                  const isOptFull = opt.isFull || (opt.spotsLeft ?? 1) <= 0;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, selectedTimeWindow: opt.timeWindow }))}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        isSelected
                          ? isOptFull
                            ? 'border-[#A44A4A] bg-[#FFF8F8] ring-2 ring-[#A44A4A]/20'
                            : 'border-[#7A8B71] bg-[#F1F4EF] ring-2 ring-[#7A8B71]/20 font-bold'
                          : isOptFull
                          ? 'border-stone-200 bg-stone-50 text-stone-400'
                          : 'border-[#E6E1D8] bg-white hover:bg-[#FAF6F3]'
                      }`}
                    >
                      <span className="block font-semibold text-[#2B2E31]">{opt.label}</span>
                      <span className="text-[10px] text-[#5C6260] block">{opt.timeWindow}</span>
                      <span className={`text-[10px] font-bold mt-1 inline-block ${
                        isOptFull ? 'text-[#A44A4A]' : 'text-[#5A6952]'
                      }`}>
                        {isOptFull ? 'Full (Pick other)' : `${opt.spotsLeft} openings`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Private Yoga: Choose Studio (Gh 300) vs Client Location (Gh 500) */}
        {selectedClass.locationPricing && (
          <div className="space-y-3 pb-4 border-b border-[#EDE8E0]">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B2E31]">
              Session Location Preference
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, locationOption: 'studio' }))}
                className={`flex items-start gap-2.5 rounded-2xl p-3.5 border transition-all text-left ${formData.locationOption === 'studio'
                    ? 'border-[#7A8B71] bg-[#F1F4EF] ring-2 ring-[#7A8B71]/20'
                    : 'border-[#E6E1D8] bg-[#FAF6F3] hover:bg-white'
                  }`}
              >
                <Building2 className="h-5 w-5 text-[#7A8B71] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-[#2B2E31] block">In Studio Sanctuary</span>
                  <span className="text-[11px] font-bold text-[#A44A4A]">GH₵ 300</span>
                  <p className="text-[10px] text-[#5C6260] mt-0.5">Fully equipped props & mat provided</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, locationOption: 'clientLocation' }))}
                className={`flex items-start gap-2.5 rounded-2xl p-3.5 border transition-all text-left ${formData.locationOption === 'clientLocation'
                    ? 'border-[#7A8B71] bg-[#F1F4EF] ring-2 ring-[#7A8B71]/20'
                    : 'border-[#E6E1D8] bg-[#FAF6F3] hover:bg-white'
                  }`}
              >
                <Home className="h-5 w-5 text-[#7A8B71] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-[#2B2E31] block">At Your Location</span>
                  <span className="text-[11px] font-bold text-[#A44A4A]">GH₵ 500</span>
                  <p className="text-[10px] text-[#5C6260] mt-0.5">Lorie travels to your home or space</p>
                </div>
              </button>
            </div>

            {formData.locationOption === 'clientLocation' && (
              <div className="pt-2 animate-in fade-in duration-200">
                <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                  Your Address / Neighborhood in Accra <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5C6260]">
                    <MapPin className="h-4 w-4 text-[#C8A253]" />
                  </div>
                  <input
                    type="text"
                    name="clientAddress"
                    placeholder="e.g. Cantonments, Airport Residential, East Legon, Labone..."
                    value={formData.clientAddress}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    className={`w-full rounded-2xl border bg-white py-2.5 pl-10 pr-4 text-base sm:text-sm text-[#2B2E31] outline-none transition-all ${touched.clientAddress && errors.clientAddress
                        ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/20'
                        : 'border-[#E6E1D8] focus:border-[#7A8B71] focus:ring-2 focus:ring-[#7A8B71]/20'
                      }`}
                  />
                </div>
                {touched.clientAddress && errors.clientAddress && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {errors.clientAddress}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Signature Experience Highlight Note for Yoga & Champagne */}
        {selectedClass.id === 'cls-champagne' && (
          <div className="rounded-2xl bg-[#FAF5EB] border border-[#E8D7B0] p-4 text-xs space-y-1.5">
            <span className="inline-flex items-center gap-1 font-bold text-[#8C6D23]">
              <Sparkles className="h-4 w-4 text-[#C8A253]" />
              Our Signature Monthly Experience • Last Sunday of Every Month
            </span>
            <p className="text-[#5C6260] leading-relaxed">
              Includes our signature uplifting stretch session, relaxing music, mindful connection, and complimentary celebratory champagne.
            </p>
          </div>
        )}

        {/* Student Contact Information Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D8]">
          <h3 className="font-serif text-base sm:text-lg font-bold text-[#2B2E31] flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7A8B71] text-white text-xs font-semibold">
              1
            </span>
            Your Details
          </h3>
          <span className="text-xs text-[#5C6260]">
            * Required fields
          </span>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B2E31] mb-1.5">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5C6260]">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              name="fullName"
              placeholder="e.g. Adjoa Mensah"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              className={`w-full rounded-2xl border bg-[#FAF8F5] py-3 pl-10 pr-4 text-base sm:text-sm text-[#2B2E31] placeholder-[#88908D] outline-none transition-all ${touched.fullName && errors.fullName
                  ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/20'
                  : 'border-[#E6E1D8] focus:border-[#7A8B71] focus:bg-white focus:ring-3 focus:ring-[#7A8B71]/20'
                }`}
            />
          </div>
          {touched.fullName && errors.fullName && (
            <p className="mt-1 text-xs text-rose-600 font-medium">
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Email & Phone Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B2E31] mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5C6260]">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                name="email"
                placeholder="adjoa@example.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isSubmitting}
                className={`w-full rounded-2xl border bg-[#FAF8F5] py-3 pl-10 pr-4 text-base sm:text-sm text-[#2B2E31] placeholder-[#88908D] outline-none transition-all ${touched.email && errors.email
                    ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/20'
                    : 'border-[#E6E1D8] focus:border-[#7A8B71] focus:bg-white focus:ring-3 focus:ring-[#7A8B71]/20'
                  }`}
              />
            </div>
            {touched.email && errors.email && (
              <p className="mt-1 text-xs text-rose-600 font-medium">
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone / WhatsApp */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B2E31] mb-1.5">
              Phone / WhatsApp <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5C6260]">
                <Phone className="h-4 w-4" />
              </div>
              <input
                type="tel"
                name="phone"
                placeholder="024 123 4567"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isSubmitting}
                className={`w-full rounded-2xl border bg-[#FAF8F5] py-3 pl-10 pr-4 text-base sm:text-sm text-[#2B2E31] placeholder-[#88908D] outline-none transition-all ${touched.phone && errors.phone
                    ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/20'
                    : 'border-[#E6E1D8] focus:border-[#7A8B71] focus:bg-white focus:ring-3 focus:ring-[#7A8B71]/20'
                  }`}
              />
            </div>
            {touched.phone && errors.phone && (
              <p className="mt-1 text-xs text-rose-600 font-medium">
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        {/* New Client Wellness & Intake Questionnaire */}
        <div className="rounded-2xl border border-[#E6E1D8] bg-[#FAF8F5] p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D8]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E5ECE2] text-[#5A6952]">
                <ClipboardList className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-serif text-sm sm:text-base font-bold text-[#2B2E31]">
                  Client Wellness & Intake Questionnaire
                </h4>
                <p className="text-[11px] text-[#5C6260]">
                  Confidential details to help Lorie personalize your alignments & safety
                </p>
              </div>
            </div>
            
            <span className="hidden xs:inline-flex items-center gap-1 rounded-full bg-[#E5ECE2] border border-[#DCE4D9] px-2.5 py-0.5 text-[10px] font-bold text-[#5A6952]">
              <HeartPulse className="h-3 w-3 text-[#7A8B71]" />
              Private to Lorie
            </span>
          </div>

          {/* Student Status Toggle */}
          <div className="grid grid-cols-2 gap-2 bg-[#EFECE6] p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, isFirstTime: true }))}
              className={`py-1.5 px-2 rounded-lg transition-all text-center ${
                formData.isFirstTime
                  ? 'bg-white text-[#2B2E31] shadow-2xs font-bold'
                  : 'text-[#5C6260] hover:text-[#2B2E31]'
              }`}
            >
              First time with Lorie
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, isFirstTime: false }))}
              className={`py-1.5 px-2 rounded-lg transition-all text-center ${
                !formData.isFirstTime
                  ? 'bg-white text-[#2B2E31] shadow-2xs font-bold'
                  : 'text-[#5C6260] hover:text-[#2B2E31]'
              }`}
            >
              Returning Student
            </button>
          </div>

          {formData.isFirstTime ? (
            <div className="space-y-4 pt-1 text-xs">
              
              {/* Question 1: Have you practised yoga before? */}
              <div>
                <label className="block text-xs font-semibold text-[#2B2E31] mb-1.5">
                  1. Have you practised yoga before? *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'Yes', label: 'Yes, I have' },
                    { val: 'No', label: 'No, first time' }
                  ].map((opt) => {
                    const isSelected = formData.intake.practicedBefore === opt.val;
                    return (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => handleIntakeChange('practicedBefore', opt.val)}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                          isSelected
                            ? 'bg-white border-[#7A8B71] text-[#2B2E31] ring-1 ring-[#7A8B71] font-bold shadow-2xs'
                            : 'bg-white/80 border-[#E6E1D8] text-[#5C6260] hover:border-[#7A8B71]/40'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-[#7A8B71]" />}
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 2: What is your experience level with yoga? */}
              <div>
                <label className="block text-xs font-semibold text-[#2B2E31] mb-1.5">
                  2. What is your experience level with yoga? *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => {
                    const isSelected = formData.intake.experienceLevel === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => handleIntakeChange('experienceLevel', lvl)}
                        className={`flex items-center justify-center gap-1 py-2 px-2 rounded-xl border text-center font-medium transition-all text-xs ${
                          isSelected
                            ? 'bg-white border-[#7A8B71] text-[#2B2E31] ring-1 ring-[#7A8B71] font-bold shadow-2xs'
                            : 'bg-white/80 border-[#E6E1D8] text-[#5C6260] hover:border-[#7A8B71]/40'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-[#7A8B71]" />}
                        <span>{lvl}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 3: What is your main goal for this session? */}
              <div>
                <label className="block text-xs font-semibold text-[#2B2E31] mb-1.5">
                  3. What is your main goal for this session? *
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    'Flexibility & Mobility',
                    'Stress Relief & Calm',
                    'Core Strength & Balance',
                    'Pain Relief / Posture',
                    'Mind-Body Connection',
                    'Fun & Celebration'
                  ].map((goal) => {
                    const isSelected = formData.intake.mainGoal === goal;
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => handleIntakeChange('mainGoal', goal)}
                        className={`py-1.5 px-3 rounded-full border text-[11px] font-medium transition-all ${
                          isSelected
                            ? 'bg-[#7A8B71] border-[#7A8B71] text-white font-bold shadow-2xs'
                            : 'bg-white border-[#E6E1D8] text-[#5C6260] hover:border-[#7A8B71]/50'
                        }`}
                      >
                        {goal}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  placeholder="Or write a custom goal (optional)..."
                  value={formData.intake.customGoal || ''}
                  onChange={(e) => handleIntakeChange('customGoal', e.target.value)}
                  className="w-full rounded-xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs text-[#2B2E31] placeholder-[#88908D] outline-none focus:border-[#7A8B71]"
                />
              </div>

              {/* Question 4: Do you have any injuries, physical limitations or health conditions that may affect your participation? */}
              <div>
                <label className="block text-xs font-semibold text-[#2B2E31] mb-1.5">
                  4. Do you have any injuries, physical limitations or health conditions? *
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => handleIntakeChange('hasInjuries', 'No')}
                    className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                      formData.intake.hasInjuries === 'No'
                        ? 'bg-white border-[#7A8B71] text-[#2B2E31] ring-1 ring-[#7A8B71] font-bold shadow-2xs'
                        : 'bg-white/80 border-[#E6E1D8] text-[#5C6260] hover:border-[#7A8B71]/40'
                    }`}
                  >
                    No, none
                  </button>
                  <button
                    type="button"
                    onClick={() => handleIntakeChange('hasInjuries', 'Yes')}
                    className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                      formData.intake.hasInjuries === 'Yes'
                        ? 'bg-white border-[#A44A4A] text-[#2B2E31] ring-1 ring-[#A44A4A] font-bold shadow-2xs'
                        : 'bg-white/80 border-[#E6E1D8] text-[#5C6260] hover:border-[#A44A4A]/40'
                    }`}
                  >
                    Yes, I have some
                  </button>
                </div>

                {formData.intake.hasInjuries === 'Yes' && (
                  <textarea
                    rows={2}
                    placeholder="Please specify (e.g. lower back stiffness, wrist discomfort, knee surgery, tight shoulders, high blood pressure)..."
                    value={formData.intake.injuriesDetails || ''}
                    onChange={(e) => handleIntakeChange('injuriesDetails', e.target.value)}
                    className="w-full rounded-xl border border-[#A44A4A]/50 bg-white p-2.5 text-xs text-[#2B2E31] placeholder-[#88908D] outline-none focus:border-[#A44A4A] animate-in fade-in duration-150"
                  />
                )}
              </div>

              {/* Question 5: Are you currently pregnant or have you recently given birth? */}
              <div>
                <label className="block text-xs font-semibold text-[#2B2E31] mb-1.5">
                  5. Are you currently pregnant or have you recently given birth? *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'No', label: 'No' },
                    { id: 'Pregnant', label: 'Currently Pregnant' },
                    { id: 'Postpartum', label: 'Recently Given Birth' }
                  ].map((item) => {
                    const isSelected = formData.intake.pregnancyStatus === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleIntakeChange('pregnancyStatus', item.id)}
                        className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl border text-center font-medium transition-all text-[11px] sm:text-xs ${
                          isSelected
                            ? 'bg-white border-[#7A8B71] text-[#2B2E31] ring-1 ring-[#7A8B71] font-bold shadow-2xs'
                            : 'bg-white/80 border-[#E6E1D8] text-[#5C6260] hover:border-[#7A8B71]/40'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-[#7A8B71]" />}
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 6: Is there anything specific you would like your instructor to know before your session? */}
              <div>
                <label className="block text-xs font-semibold text-[#2B2E31] mb-1">
                  6. Anything specific you would like your instructor to know?
                </label>
                <textarea
                  rows={2}
                  placeholder="Preferences, gentle adjustments, music vibe, intentions, or questions (optional)..."
                  value={formData.intake.instructorNotes || ''}
                  onChange={(e) => handleIntakeChange('instructorNotes', e.target.value)}
                  className="w-full rounded-xl border border-[#E6E1D8] bg-white p-2.5 text-xs text-[#2B2E31] placeholder-[#88908D] outline-none focus:border-[#7A8B71]"
                />
              </div>

            </div>
          ) : (
            /* Returning Student Flow */
            <div className="space-y-3 pt-1 text-xs">
              <p className="text-[#5C6260]">
                Welcome back! Your previous wellness profile is on file. Any new updates or specific areas to focus on today?
              </p>
              <textarea
                rows={2}
                placeholder="E.g. Feeling neck stiffness today, want to focus on deep hamstrings..."
                value={formData.intake.returningNotes || ''}
                onChange={(e) => handleIntakeChange('returningNotes', e.target.value)}
                className="w-full rounded-xl border border-[#E6E1D8] bg-white p-2.5 text-xs text-[#2B2E31] placeholder-[#88908D] outline-none focus:border-[#7A8B71]"
              />
            </div>
          )}
        </div>

        {/* Creator Referral / Promo Code Section */}
        <div className="pt-4 border-t border-[#E6E1D8]">
          <div className="rounded-2xl bg-[#FAF8F5] border border-[#E6E1D8] p-3.5 sm:p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#2B2E31] flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-[#C8A253]" />
                <span>Creator Referral or Discount Code</span>
              </label>
              {appliedReferral && (
                <button
                  type="button"
                  onClick={handleRemovePromoCode}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A44A4A] hover:underline cursor-pointer"
                >
                  <X className="h-3 w-3" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            {!appliedReferral ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => {
                    setPromoCodeInput(e.target.value.toUpperCase());
                    setPromoError('');
                  }}
                  placeholder="Enter code (e.g. AMA15 or LORIEVIP)"
                  className="flex-1 rounded-xl border border-[#E6E1D8] bg-white px-3 py-2 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[#2B2E31] placeholder:font-sans placeholder:font-normal placeholder:normal-case outline-none focus:border-[#7A8B71]"
                />
                <button
                  type="button"
                  onClick={handleApplyPromoCode}
                  disabled={isValidatingPromo || !promoCodeInput.trim()}
                  className="rounded-xl bg-[#232D21] hover:bg-[#2F3C2C] text-[#F7E7C4] px-4 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isValidatingPromo ? 'Checking...' : 'Apply'}
                </button>
              </div>
            ) : (
              <div className="rounded-xl bg-[#E5ECE2] border border-[#DCE4D9] px-3 py-2.5 flex items-center justify-between gap-2 text-xs text-[#232D21]">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="h-4 w-4 text-[#5A6952] shrink-0" />
                  <div className="truncate">
                    <span className="font-mono font-bold">{appliedReferral.code}</span> applied
                    {appliedReferral.creatorName ? ` (${appliedReferral.creatorName})` : ''}
                  </div>
                </div>
                <span className="font-bold text-[#5A6952] shrink-0">
                  -GH₵{discountAmount}.00 saved
                </span>
              </div>
            )}

            {promoError && (
              <p className="text-[11px] font-semibold text-[#A44A4A] flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{promoError}</span>
              </p>
            )}
          </div>
        </div>

        {/* Step 2: Payment via Paystack */}
        <div className="pt-4 border-t border-[#E6E1D8] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#2B2E31] flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7A8B71] text-white text-xs font-semibold">
                2
              </span>
              Payment via Paystack
            </h3>
          </div>

          <p className="text-xs text-[#5C6260]">
            All transactions are powered securely by Paystack. Choose <strong>Mobile Money</strong> for an instant prompt on your phone or pay by card.
          </p>

          {/* Paystack Channel Selector: Mobile Money (Primary) vs Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {/* Mobile Money Option (Highlighted as default) */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, paymentChannel: 'momo' })}
              className={`relative flex items-center gap-3 rounded-2xl p-3 sm:p-3.5 border transition-all text-left ${formData.paymentChannel === 'momo'
                  ? 'border-[#7A8B71] bg-[#F1F4EF] shadow-sm ring-2 ring-[#7A8B71]/20'
                  : 'border-[#E6E1D8] bg-[#FAF8F5] hover:bg-white'
                }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E5ECE2] text-[#5A6952]">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#2B2E31]">Mobile Money</span>
                  <span className="rounded bg-[#FAF5EB] text-[#8C6D23] border border-[#E8D7B0] px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider">
                    Popular
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <MobileMoneyLogo network="MTN" variant="image" size="xs" className="h-4.5 w-auto rounded-xs shadow-2xs" />
                  <MobileMoneyLogo network="Telecel" variant="image" size="xs" className="h-4.5 w-auto rounded-xs" />
                  <MobileMoneyLogo network="AT" variant="image" size="xs" className="h-4.5 w-auto rounded-xs" />
                </div>
              </div>
            </button>

            {/* Debit/Credit Card Option */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, paymentChannel: 'card' })}
              className={`relative flex items-center gap-3 rounded-2xl p-3 sm:p-3.5 border transition-all text-left ${formData.paymentChannel === 'card'
                  ? 'border-[#7A8B71] bg-[#F1F4EF] shadow-sm ring-2 ring-[#7A8B71]/20'
                  : 'border-[#E6E1D8] bg-[#FAF8F5] hover:bg-white'
                }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E5ECE2] text-[#5A6952]">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-[#2B2E31] block">Debit / Credit Card</span>
                <p className="text-[11px] text-[#5C6260] truncate">
                  Visa, Mastercard, Verve
                </p>
              </div>
            </button>
          </div>

          {/* Channel Content: Mobile Money Provider & Number */}
          {formData.paymentChannel === 'momo' ? (
            <div className="rounded-2xl bg-[#FAF8F5] p-3.5 sm:p-5 border border-[#E6E1D8] space-y-4">

              {/* Select MoMo Network with Actual Official Logos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B2E31]">
                    Select Mobile Money Network
                  </label>
                  <span className="text-[11px] font-semibold text-[#5A6952] bg-white px-2 py-0.5 rounded-md border border-[#E6E1D8]">
                    {formData.momoNetwork === 'Telecel' ? 'Telecel Cash' : formData.momoNetwork === 'AirtelTigo' ? 'AT Money' : 'MTN MoMo'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {/* MTN MoMo */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, momoNetwork: 'MTN' })}
                    className={`relative flex flex-col items-center justify-between rounded-2xl p-2 sm:p-3 border transition-all text-center ${formData.momoNetwork === 'MTN'
                        ? 'border-[#FFCC00] bg-[#FFFBEA] shadow-md ring-2 ring-[#FFCC00]/50'
                        : 'border-[#E6E1D8] bg-white text-[#5C6260] hover:bg-[#FAF8F5]'
                      }`}
                  >
                    <div className="h-10 sm:h-12 flex items-center justify-center w-full mb-1.5 px-0.5">
                      <MobileMoneyLogo network="MTN" variant="image" size="lg" className="h-9 sm:h-10 w-auto max-w-full rounded shadow-2xs" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-[#2B2E31] leading-tight">MTN MoMo</span>
                    <span className="text-[9px] sm:text-[10px] text-[#5C6260] mt-0.5">Instant prompt</span>
                    {formData.momoNetwork === 'MTN' && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFCC00] text-[#002B49] text-[9px] font-bold">
                        ✓
                      </span>
                    )}
                  </button>

                  {/* Telecel Cash */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, momoNetwork: 'Telecel' })}
                    className={`relative flex flex-col items-center justify-between rounded-2xl p-2 sm:p-3 border transition-all text-center ${formData.momoNetwork === 'Telecel'
                        ? 'border-[#ED1C24] bg-rose-50/70 shadow-md ring-2 ring-[#ED1C24]/30'
                        : 'border-[#E6E1D8] bg-white text-[#5C6260] hover:bg-[#FAF8F5]'
                      }`}
                  >
                    <div className="h-10 sm:h-12 flex items-center justify-center w-full mb-1.5 px-0.5">
                      <MobileMoneyLogo network="Telecel" variant="image" size="lg" className="h-8 sm:h-9 w-auto max-w-full" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-[#2B2E31] leading-tight">Telecel Cash</span>
                    <span className="text-[9px] sm:text-[10px] text-[#5C6260] mt-0.5">Voda / Telecel</span>
                    {formData.momoNetwork === 'Telecel' && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ED1C24] text-white text-[9px] font-bold">
                        ✓
                      </span>
                    )}
                  </button>

                  {/* AirtelTigo / AT Money */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, momoNetwork: 'AirtelTigo' })}
                    className={`relative flex flex-col items-center justify-between rounded-2xl p-2 sm:p-3 border transition-all text-center ${formData.momoNetwork === 'AirtelTigo'
                        ? 'border-[#002060] bg-blue-50/70 shadow-md ring-2 ring-[#002060]/30'
                        : 'border-[#E6E1D8] bg-white text-[#5C6260] hover:bg-[#FAF8F5]'
                      }`}
                  >
                    <div className="h-10 sm:h-12 flex items-center justify-center w-full mb-1.5 px-0.5">
                      <MobileMoneyLogo network="AirtelTigo" variant="image" size="lg" className="h-9 sm:h-10 w-auto max-w-full" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-[#2B2E31] leading-tight">AT Money</span>
                    <span className="text-[9px] sm:text-[10px] text-[#5C6260] mt-0.5">AirtelTigo / AT</span>
                    {formData.momoNetwork === 'AirtelTigo' && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#002060] text-white text-[9px] font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* MoMo Phone Number Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B2E31]">
                    {formData.momoNetwork} Mobile Money Number
                  </label>
                  {formData.phone && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, momoNumber: prev.phone }))}
                      className="text-[11px] font-medium text-[#7A8B71] hover:text-[#5A6952] hover:underline"
                    >
                      Use WhatsApp Phone
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5C6260]">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    name="momoNumber"
                    placeholder="Enter phone number to receive authorization prompt"
                    value={formData.momoNumber || formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    className="w-full rounded-2xl border border-[#E6E1D8] bg-white py-2.5 pl-10 pr-4 text-base sm:text-sm text-[#2B2E31] placeholder-[#88908D] outline-none focus:border-[#7A8B71] focus:ring-2 focus:ring-[#7A8B71]/20"
                  />
                </div>
                {touched.momoNumber && errors.momoNumber && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {errors.momoNumber}
                  </p>
                )}
              </div>

              {/* How it works banner with Provider Logo */}
              <div className="rounded-xl bg-[#F1F4EF] p-3 text-xs text-[#2B2E31] border border-[#DCE4D9] flex items-start gap-3">
                <MobileMoneyLogo network={formData.momoNetwork} variant="image" size="md" className="h-9 w-auto shrink-0 mt-0.5 rounded shadow-2xs" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-[#5A6952] flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#7A8B71]" />
                    Instant {formData.momoNetwork === 'Telecel' ? 'Telecel Cash' : formData.momoNetwork === 'AirtelTigo' ? 'AT Money' : 'MTN MoMo'} Prompt:
                  </p>
                  <p className="text-[11px] text-[#5C6260] leading-relaxed">
                    When you tap <strong>Pay with Paystack</strong>, an on-screen USSD prompt will be sent directly to your phone ({formData.momoNumber || formData.phone || 'provided number'}). Simply enter your MoMo PIN on your device to authorize.
                  </p>
                </div>
              </div>

            </div>
          ) : (
            /* Card Option Box */
            <div className="rounded-2xl bg-[#FAF8F5] p-4 sm:p-5 border border-[#E6E1D8] space-y-3">
              <div className="flex items-center justify-between text-[#5C6260] text-xs">
                <span>Paystack Card Gateway</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#0288D1] bg-[#E6F8FD] border border-[#B6EEFC] px-2 py-0.5 rounded">
                  <ShieldCheck className="h-3 w-3" />
                  PAYSTACK_INLINE_JS
                </span>
              </div>
              <div className="flex items-center justify-between text-[#2B2E31] font-medium text-xs">
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[#7A8B71]" />
                  Visa • Mastercard • Verve
                </span>
                <span className="text-[11px] text-[#5C6260]">3D-Secure Protected</span>
              </div>
              <p className="text-[11px] text-[#5C6260]">
                Your card will be securely charged in Ghana Cedis (GHS) via Paystack's PCI-DSS compliant checkout window.
              </p>
            </div>
          )}

          {/* Included perks reminder */}
          <div className="rounded-xl bg-[#FAF8F5] px-4 py-2.5 border border-[#E6E1D8] flex items-center justify-between text-xs text-[#5C6260]">
            <span>Complimentary Manduka Mat, Props & Infused Tea</span>
            <span className="text-[#5A6952] font-bold">Included</span>
          </div>

        </div>

        {/* Live Submission Simulation Overlay or Progress Notification */}
        {isSubmitting && (
          <div className="rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] p-4 text-xs space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 text-[#0369A1] font-bold">
              {formData.paymentChannel === 'momo' ? (
                <MobileMoneyLogo network={formData.momoNetwork} variant="image" size="xs" className="h-5 w-auto shrink-0 rounded-xs shadow-2xs" />
              ) : (
                <CreditCard className="h-4 w-4 text-[#0288D1] shrink-0" />
              )}
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#0288D1] border-t-transparent shrink-0" />
              <span>
                {currentPhase === 1 && 'Connecting to Paystack Secure Gateway...'}
                {currentPhase === 2 &&
                  (formData.paymentChannel === 'momo'
                    ? `Sending MoMo PIN prompt to ${formData.momoNetwork === 'Telecel' ? 'Telecel Cash' : formData.momoNetwork === 'AirtelTigo' ? 'AT Money' : 'MTN MoMo'} (${formData.momoNumber || formData.phone})...`
                    : 'Verifying 3D-Secure Card Authorization...')}
                {currentPhase === 3 && 'Payment Authorized! Generating Class Pass...'}
              </span>
            </div>
            {formData.paymentChannel === 'momo' && (
              <p className="text-[11px] text-[#0288D1] pl-1">
                📲 Please check your mobile phone and approve the prompt with your Mobile Money PIN.
              </p>
            )}
          </div>
        )}

        {/* MANDATORY CONFIRMATION BEFORE MAKING PAYMENT */}
        <div className={`rounded-2xl border p-4 sm:p-5 transition-all ${
          touched.agreedToMandatoryTerms && errors.agreedToMandatoryTerms
            ? 'border-[#A44A4A] bg-[#FFF8F8] ring-2 ring-[#A44A4A]/25'
            : 'border-[#E6E1D8] bg-[#FAF8F5]'
        }`}>
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#E6E1D8]">
            <ShieldCheck className="h-4 w-4 text-[#A44A4A]" />
            <h4 className="font-serif text-xs sm:text-sm font-bold tracking-wide uppercase text-[#2B2E31]">
              MANDATORY CONFIRMATION BEFORE MAKING PAYMENT
            </h4>
          </div>

          <div className="mt-3 space-y-2.5 text-xs text-[#2B2E31]">
            <div className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E5ECE2] text-[#5A6952] text-[11px] font-bold mt-0.5">
                1
              </span>
              <p className="leading-relaxed">
                I understand that I must disclose relevant injuries or physical limitations before participating.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E5ECE2] text-[#5A6952] text-[11px] font-bold mt-0.5">
                2
              </span>
              <p className="leading-relaxed">
                I agree to arrive 10 minutes before my scheduled session.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E5ECE2] text-[#5A6952] text-[11px] font-bold mt-0.5">
                3
              </span>
              <p className="leading-relaxed">
                I have read and accepted the studio&apos;s cancellation and rescheduling policy.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E6E1D8]">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="agreedToMandatoryTerms"
                checked={formData.agreedToMandatoryTerms}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, agreedToMandatoryTerms: e.target.checked }));
                  if (errors.agreedToMandatoryTerms) {
                    setErrors((prev) => ({ ...prev, agreedToMandatoryTerms: undefined }));
                  }
                }}
                className="mt-0.5 h-4 w-4 rounded border-[#D5CEC2] text-[#7A8B71] focus:ring-[#7A8B71] cursor-pointer"
              />
              <span className="text-xs font-semibold text-[#2B2E31] leading-snug group-hover:text-[#5A6952] transition-colors">
                I agree to the mandatory studio confirmation above before proceeding to payment. *
              </span>
            </label>

            {touched.agreedToMandatoryTerms && errors.agreedToMandatoryTerms && (
              <p className="mt-2 text-xs font-semibold text-[#A44A4A] flex items-center gap-1.5 animate-in fade-in duration-150">
                <AlertCircle className="h-4 w-4 shrink-0 text-[#A44A4A]" />
                <span>{errors.agreedToMandatoryTerms}</span>
              </p>
            )}
          </div>
        </div>

        {/* Action Button: Pay & Register via Paystack */}
        <div className="pt-2">
          {((selectedClass.hasScheduleSlots && isSelectedSlotFull) ||
            (selectedClass.hasSessionOptions && !selectedClass.isPrivateOneOnOne && isSelectedOptionFull)) ? (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-center space-y-2.5">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#8C5E14]">
                <AlertCircle className="h-4 w-4 text-[#8C5E14] shrink-0" />
                <span>Selected Session Day Is Fully Booked</span>
              </div>
              <p className="text-[11px] text-[#5C6260]">
                All mats for {currentSlotObj?.label || currentOptionObj?.label || 'this session'} are taken. Please select an available alternative day above to continue to payment.
              </p>
              {availableAlternativeSlots.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  {availableAlternativeSlots.map((altSlot) => (
                    <button
                      key={altSlot.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, selectedSlot: `${altSlot.day} ${altSlot.time}` }))}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#7A8B71] text-[#2B2E31] text-xs font-semibold hover:bg-[#F1F4EF] shadow-2xs cursor-pointer"
                    >
                      <Calendar className="h-3.5 w-3.5 text-[#7A8B71]" />
                      <span>Switch to <strong>{altSlot.label}</strong></span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full relative flex items-center justify-center gap-2.5 rounded-2xl py-4 px-6 text-base font-bold text-white shadow-lg transition-all duration-300 ${isSubmitting
                  ? 'bg-[#A44A4A]/80 cursor-wait'
                  : 'bg-[#A44A4A] hover:bg-[#8C3E3E] active:scale-[0.99] hover:shadow-xl cursor-pointer'
                }`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Processing Paystack Reservation...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>
                    Pay GH₵{currentPrice}.00 with Paystack
                  </span>
                </>
              )}
            </button>
          )}

          {/* Security & Cancellation guarantees */}
          <div className="mt-3.5 flex flex-col sm:flex-row items-center justify-center gap-2 text-center text-xs text-[#5C6260]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-[#7A8B71]" />
              Secured by Paystack • PCI-DSS Certified
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Advance booking reservation</span>
          </div>
        </div>

      </form>
    </div>
  );
}