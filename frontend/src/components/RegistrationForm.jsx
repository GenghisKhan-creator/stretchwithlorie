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
  Sparkles
} from 'lucide-react';
import MobileMoneyLogo from './MobileMoneyLogo';

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

export default function RegistrationForm({ selectedClass, onSubmitBooking, isSubmitting, onCancel }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    healthNotes: '',
    paymentChannel: 'momo', // 'momo' (Mobile Money) or 'card'
    momoNetwork: 'MTN', // 'MTN' | 'Telecel' | 'AirtelTigo'
    momoNumber: '',
    locationOption: 'studio', // 'studio' | 'clientLocation'
    clientAddress: '',
    selectedSlot: 'Wednesdays 7:00 AM'
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submissionPhase, setSubmissionPhase] = useState(0);

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
      <div className="rounded-3xl border border-dashed border-[#E0DFDB] bg-[#FAF8F5]/80 p-8 sm:p-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5EBE1] text-[#774929]">
          <Calendar className="h-7 w-7" />
        </div>
        <h3 className="font-serif text-xl font-bold text-[#201410]">
          Select an Experience to Book
        </h3>
        <p className="mt-2 text-sm text-[#88796B] max-w-md mx-auto">
          Choose a group class, 1-on-1 private session, or signature experience from the catalog to begin your reservation.
        </p>
      </div>
    );
  }

  // Calculate dynamic price (handles studio Gh 300 vs client location Gh 500 for private sessions)
  const currentPrice = selectedClass.locationPricing
    ? selectedClass.locationPricing[formData.locationOption] || selectedClass.price
    : selectedClass.price;

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
    setTouched({ fullName: true, email: true, phone: true, momoNumber: true, clientAddress: true });

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

      await onSubmitBooking({
        ...formData,
        amount: currentPrice,
        price: currentPrice,
        paymentMethod: paymentMethodName,
        classTitle: sessionTitle,
        classId: selectedClass.id,
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
    <div className="overflow-hidden rounded-3xl border border-[#E0DFDB] bg-white shadow-xl transition-all">

      {/* Top Banner: Selected Class Summary */}
      <div className="border-b border-[#E0DFDB] bg-[#FAF6F2] p-4 sm:p-6 w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="rounded-full bg-[#F5EBE1] border border-[#E8D7C8] px-2.5 py-0.5 text-xs font-semibold text-[#774929]">
              {selectedClass.category}
            </span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-[#88796B] border border-[#E0DFDB]">
              {selectedClass.level}
            </span>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-semibold text-[#774929] hover:underline"
            >
              Change
            </button>
          )}
        </div>

        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#201410] leading-snug">
          {selectedClass.title}
        </h2>

        <div className="mt-2 flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-[#88796B]">
          <span className="flex items-center gap-1.5 font-medium text-[#201410]">
            <Calendar className="h-3.5 w-3.5 text-[#774929] shrink-0" />
            {selectedClass.date}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[#774929] shrink-0" />
            {selectedClass.time} ({selectedClass.duration})
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[#C9B6A5] shrink-0" />
            {selectedClass.room}
          </span>
        </div>

        {/* Dedicated Price & Spots Strip - Always readable, never clipped */}
        <div className="mt-3.5 pt-3 border-t border-[#EAE4DC] flex items-center justify-between gap-2">
          <div>
            <span className="text-[11px] text-[#88796B] uppercase font-semibold block">Total Fee</span>
            <span className="text-[11px] font-medium text-[#774929]">
              {spotsLeft > 0 ? `${spotsLeft} spots available` : 'Advance booking'}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xl sm:text-2xl font-bold text-[#201410]">
              GH₵{currentPrice}.00
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-7 space-y-5">

        {/* Step 1: Session Preferences (If Mass Yoga or Private One-on-One) */}
        {selectedClass.hasScheduleSlots && (
          <div className="space-y-2.5 pb-4 border-b border-[#EAE6DF]">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#382823]">
              Choose Your Weekly Schedule Slot
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { day: 'Wednesdays', time: '7:00 AM', label: 'Wed 7:00 AM', focus: 'Morning Stretch' },
                { day: 'Saturdays', time: '8:30 AM', label: 'Sat 8:30 AM', focus: 'Weekend Awakening' },
                { day: 'Sundays', time: '6:00 PM', label: 'Sun 6:00 PM', focus: 'Sunset Grounding' }
              ].map((slot) => {
                const isSelectedSlot = formData.selectedSlot === `${slot.day} ${slot.time}`;
                return (
                  <button
                    key={slot.label}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, selectedSlot: `${slot.day} ${slot.time}` }))}
                    className={`flex sm:flex-col items-center sm:items-start justify-between rounded-2xl p-3 border transition-all text-left ${isSelectedSlot
                        ? 'border-[#774929] bg-[#FAF6F2] ring-2 ring-[#774929]/20'
                        : 'border-[#E0DFDB] bg-white hover:bg-[#FAF8F5]'
                      }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#201410]">
                        <Calendar className="h-3.5 w-3.5 text-[#774929] shrink-0" />
                        <span>{slot.label}</span>
                      </div>
                      <span className="text-[11px] text-[#88796B] block mt-0.5">{slot.focus}</span>
                    </div>
                    <span className="font-bold text-xs text-[#774929] mt-0 sm:mt-1.5 bg-[#F5EBE1] px-2 py-0.5 rounded-lg border border-[#E8D7C8]">
                      GH₵ 200
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Private Yoga: Choose Studio (Gh 300) vs Client Location (Gh 500) */}
        {selectedClass.locationPricing && (
          <div className="space-y-3 pb-4 border-b border-[#EAE6DF]">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#382823]">
              Session Location Preference
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, locationOption: 'studio' }))}
                className={`flex items-start gap-2.5 rounded-2xl p-3.5 border transition-all text-left ${formData.locationOption === 'studio'
                    ? 'border-[#774929] bg-[#FAF6F2] ring-2 ring-[#774929]/20'
                    : 'border-[#E0DFDB] bg-[#FAF8F5] hover:bg-white'
                  }`}
              >
                <Building2 className="h-5 w-5 text-[#774929] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-[#201410] block">In Studio Sanctuary</span>
                  <span className="text-[11px] font-bold text-[#774929]">GH₵ 300</span>
                  <p className="text-[10px] text-[#88796B] mt-0.5">Fully equipped props & mat provided</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, locationOption: 'clientLocation' }))}
                className={`flex items-start gap-2.5 rounded-2xl p-3.5 border transition-all text-left ${formData.locationOption === 'clientLocation'
                    ? 'border-[#774929] bg-[#FAF6F2] ring-2 ring-[#774929]/20'
                    : 'border-[#E0DFDB] bg-[#FAF8F5] hover:bg-white'
                  }`}
              >
                <Home className="h-5 w-5 text-[#774929] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-[#201410] block">At Your Location</span>
                  <span className="text-[11px] font-bold text-[#774929]">GH₵ 500</span>
                  <p className="text-[10px] text-[#88796B] mt-0.5">Lorie travels to your home or space</p>
                </div>
              </button>
            </div>

            {formData.locationOption === 'clientLocation' && (
              <div className="pt-2 animate-in fade-in duration-200">
                <label className="block text-xs font-semibold text-[#382823] mb-1">
                  Your Address / Neighborhood in Accra <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#88796B]">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    name="clientAddress"
                    placeholder="e.g. Cantonments, Airport Residential, East Legon, Labone..."
                    value={formData.clientAddress}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    className={`w-full rounded-2xl border bg-white py-2.5 pl-10 pr-4 text-sm text-[#201410] outline-none transition-all ${touched.clientAddress && errors.clientAddress
                        ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/20'
                        : 'border-[#E0DFDB] focus:border-[#774929] focus:ring-2 focus:ring-[#774929]/20'
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
          <div className="rounded-2xl bg-[#F5EBE1] border border-[#E8D7C8] p-4 text-xs space-y-1.5">
            <span className="inline-flex items-center gap-1 font-bold text-[#774929]">
              <Sparkles className="h-4 w-4 text-[#774929]" />
              Our Signature Monthly Experience • Last Sunday of Every Month
            </span>
            <p className="text-[#88796B] leading-relaxed">
              Includes our signature uplifting stretch session, relaxing music, mindful connection, and complimentary celebratory champagne.
            </p>
          </div>
        )}

        {/* Student Contact Information Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EAE6DF]">
          <h3 className="font-serif text-base sm:text-lg font-bold text-[#201410] flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#774929] text-white text-xs font-semibold">
              1
            </span>
            Your Details
          </h3>
          <span className="text-xs text-[#88796B]">
            * Required fields
          </span>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#382823] mb-1.5">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#88796B]">
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
              className={`w-full rounded-2xl border bg-[#FAF8F5] py-3 pl-10 pr-4 text-sm text-[#201410] placeholder-[#A89E96] outline-none transition-all ${touched.fullName && errors.fullName
                  ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/20'
                  : 'border-[#E0DFDB] focus:border-[#774929] focus:bg-white focus:ring-3 focus:ring-[#774929]/20'
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#382823] mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#88796B]">
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
                className={`w-full rounded-2xl border bg-[#FAF8F5] py-3 pl-10 pr-4 text-sm text-[#201410] placeholder-[#A89E96] outline-none transition-all ${touched.email && errors.email
                    ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/20'
                    : 'border-[#E0DFDB] focus:border-[#774929] focus:bg-white focus:ring-3 focus:ring-[#774929]/20'
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#382823] mb-1.5">
              Phone / WhatsApp <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#88796B]">
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
                className={`w-full rounded-2xl border bg-[#FAF8F5] py-3 pl-10 pr-4 text-sm text-[#201410] placeholder-[#A89E96] outline-none transition-all ${touched.phone && errors.phone
                    ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/20'
                    : 'border-[#E0DFDB] focus:border-[#774929] focus:bg-white focus:ring-3 focus:ring-[#774929]/20'
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

        {/* Health & Injury Notes (Optional) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#382823]">
              Health, Goals, Injuries or Pregnancy Notes
            </label>
            <span className="text-[11px] text-[#88796B]">Optional</span>
          </div>
          <div className="relative">
            <textarea
              name="healthNotes"
              rows={2}
              placeholder="E.g., tight hamstrings, lower back sensitivity, goals for splits, or recent surgery so Lorie can offer personalized guidance..."
              value={formData.healthNotes}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full rounded-2xl border border-[#E0DFDB] bg-[#FAF8F5] p-3 text-sm text-[#201410] placeholder-[#A89E96] outline-none transition-all focus:border-[#774929] focus:bg-white focus:ring-3 focus:ring-[#774929]/20"
            />
          </div>
          <p className="mt-1.5 text-[11px] text-[#88796B] flex items-center gap-1">
            <HeartPulse className="h-3.5 w-3.5 text-[#774929]" />
            Shared privately with Lorie before your session.
          </p>
        </div>

        {/* Step 2: Payment via Paystack */}
        <div className="pt-4 border-t border-[#EAE6DF] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#201410] flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#774929] text-white text-xs font-semibold">
                2
              </span>
              Payment via Paystack
            </h3>
          </div>

          <p className="text-xs text-[#88796B]">
            All transactions are powered securely by Paystack. Choose <strong>Mobile Money</strong> for an instant prompt on your phone or pay by card.
          </p>

          {/* Paystack Channel Selector: Mobile Money (Primary) vs Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {/* Mobile Money Option (Highlighted as default) */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, paymentChannel: 'momo' })}
              className={`relative flex items-center gap-3 rounded-2xl p-3 sm:p-3.5 border transition-all text-left ${formData.paymentChannel === 'momo'
                  ? 'border-[#774929] bg-[#FAF6F2] shadow-sm ring-2 ring-[#774929]/20'
                  : 'border-[#E0DFDB] bg-[#FAF8F5] hover:bg-white'
                }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5EBE1] text-[#774929]">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#201410]">Mobile Money</span>
                  <span className="rounded bg-[#8DBF15]/20 text-[#476606] px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider">
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
                  ? 'border-[#774929] bg-[#FAF6F2] shadow-sm ring-2 ring-[#774929]/20'
                  : 'border-[#E0DFDB] bg-[#FAF8F5] hover:bg-white'
                }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5EBE1] text-[#774929]">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-[#201410] block">Debit / Credit Card</span>
                <p className="text-[11px] text-[#88796B] truncate">
                  Visa, Mastercard, Verve
                </p>
              </div>
            </button>
          </div>

          {/* Channel Content: Mobile Money Provider & Number */}
          {formData.paymentChannel === 'momo' ? (
            <div className="rounded-2xl bg-[#FAF8F5] p-3.5 sm:p-5 border border-[#E0DFDB] space-y-4">

              {/* Select MoMo Network with Actual Official Logos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#382823]">
                    Select Mobile Money Network
                  </label>
                  <span className="text-[11px] font-semibold text-[#774929] bg-white px-2 py-0.5 rounded-md border border-[#E0DFDB]">
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
                        : 'border-[#E0DFDB] bg-white text-[#88796B] hover:bg-[#FAF8F5]'
                      }`}
                  >
                    <div className="h-10 sm:h-12 flex items-center justify-center w-full mb-1.5 px-0.5">
                      <MobileMoneyLogo network="MTN" variant="image" size="lg" className="h-9 sm:h-10 w-auto max-w-full rounded shadow-2xs" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-[#201410] leading-tight">MTN MoMo</span>
                    <span className="text-[9px] sm:text-[10px] text-[#88796B] mt-0.5">Instant prompt</span>
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
                        : 'border-[#E0DFDB] bg-white text-[#88796B] hover:bg-[#FAF8F5]'
                      }`}
                  >
                    <div className="h-10 sm:h-12 flex items-center justify-center w-full mb-1.5 px-0.5">
                      <MobileMoneyLogo network="Telecel" variant="image" size="lg" className="h-8 sm:h-9 w-auto max-w-full" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-[#201410] leading-tight">Telecel Cash</span>
                    <span className="text-[9px] sm:text-[10px] text-[#88796B] mt-0.5">Voda / Telecel</span>
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
                        : 'border-[#E0DFDB] bg-white text-[#88796B] hover:bg-[#FAF8F5]'
                      }`}
                  >
                    <div className="h-10 sm:h-12 flex items-center justify-center w-full mb-1.5 px-0.5">
                      <MobileMoneyLogo network="AirtelTigo" variant="image" size="lg" className="h-9 sm:h-10 w-auto max-w-full" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-[#201410] leading-tight">AT Money</span>
                    <span className="text-[9px] sm:text-[10px] text-[#88796B] mt-0.5">AirtelTigo / AT</span>
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#382823]">
                    {formData.momoNetwork} Mobile Money Number
                  </label>
                  {formData.phone && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, momoNumber: prev.phone }))}
                      className="text-[11px] font-medium text-[#774929] hover:underline"
                    >
                      Use WhatsApp Phone
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#88796B]">
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
                    className="w-full rounded-2xl border border-[#E0DFDB] bg-white py-2.5 pl-10 pr-4 text-sm text-[#201410] placeholder-[#A89E96] outline-none focus:border-[#774929] focus:ring-2 focus:ring-[#774929]/20"
                  />
                </div>
                {touched.momoNumber && errors.momoNumber && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {errors.momoNumber}
                  </p>
                )}
              </div>

              {/* How it works banner with Provider Logo */}
              <div className="rounded-xl bg-[#FAF6F2] p-3 text-xs text-[#201410] border border-[#E8D7C8] flex items-start gap-3">
                <MobileMoneyLogo network={formData.momoNetwork} variant="image" size="md" className="h-9 w-auto shrink-0 mt-0.5 rounded shadow-2xs" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-[#774929] flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Instant {formData.momoNetwork === 'Telecel' ? 'Telecel Cash' : formData.momoNetwork === 'AirtelTigo' ? 'AT Money' : 'MTN MoMo'} Prompt:
                  </p>
                  <p className="text-[11px] text-[#88796B] leading-relaxed">
                    When you tap <strong>Pay with Paystack</strong>, an on-screen USSD prompt will be sent directly to your phone ({formData.momoNumber || formData.phone || 'provided number'}). Simply enter your MoMo PIN on your device to authorize.
                  </p>
                </div>
              </div>

            </div>
          ) : (
            /* Card Option Box */
            <div className="rounded-2xl bg-[#FAF8F5] p-4 sm:p-5 border border-[#E0DFDB] space-y-3">
              <div className="flex items-center justify-between text-[#88796B] text-xs">
                <span>Paystack Card Gateway</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#0288D1] bg-[#E6F8FD] border border-[#B6EEFC] px-2 py-0.5 rounded">
                  <ShieldCheck className="h-3 w-3" />
                  PAYSTACK_INLINE_JS
                </span>
              </div>
              <div className="flex items-center justify-between text-[#201410] font-medium text-xs">
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[#774929]" />
                  Visa • Mastercard • Verve
                </span>
                <span className="text-[11px] text-[#88796B]">3D-Secure Protected</span>
              </div>
              <p className="text-[11px] text-[#88796B]">
                Your card will be securely charged in Ghana Cedis (GHS) via Paystack's PCI-DSS compliant checkout window.
              </p>
            </div>
          )}

          {/* Included perks reminder */}
          <div className="rounded-xl bg-[#FAF8F5] px-4 py-2.5 border border-[#E0DFDB] flex items-center justify-between text-xs text-[#88796B]">
            <span>Complimentary Manduka Mat, Props & Infused Tea</span>
            <span className="text-[#774929] font-bold">Included</span>
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

        {/* Action Button: Pay & Register via Paystack */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full relative flex items-center justify-center gap-2.5 rounded-2xl py-4 px-6 text-base font-bold text-white shadow-lg transition-all duration-300 ${isSubmitting
                ? 'bg-[#774929]/80 cursor-wait'
                : 'bg-[#774929] hover:bg-[#663D21] active:scale-[0.99] hover:shadow-xl'
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

          {/* Security & Cancellation guarantees */}
          <div className="mt-3.5 flex flex-col sm:flex-row items-center justify-center gap-2 text-center text-xs text-[#88796B]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-[#774929]" />
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