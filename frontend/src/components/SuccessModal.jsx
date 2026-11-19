import { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  CheckCircle2,
  Calendar,
  Clock,
  HeartPulse,
  Download,
  ArrowRight,
  Sparkles,
  X,
  CreditCard,
  Lock,
  PlusCircle,
  ExternalLink,
  Send,
  Check
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import MobileMoneyLogo from './MobileMoneyLogo';
import { PaystackIcon } from './RegistrationForm';
import { exportBookingPassPDF } from '../utils/pdfExport';
import { STUDIO_SCHEDULES, DEFAULT_INSTRUCTOR_AVATAR } from '../data/mockData';

export default function SuccessModal({
  booking,
  classes = [],
  onBookAnotherSession,
  onClose,
  onViewDashboard
}) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadFeedback, setDownloadFeedback] = useState(null);

  const modalBackdropRef = useRef(null);
  const modalCardRef = useRef(null);
  const checkmarkBadgeRef = useRef(null);

  useGSAP(() => {
    if (!booking) return;

    // Animate backdrop
    if (modalBackdropRef.current) {
      gsap.fromTo(
        modalBackdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    }

    // Pop and rise modal card
    if (modalCardRef.current) {
      gsap.fromTo(
        modalCardRef.current,
        { scale: 0.9, opacity: 0, y: 24 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)', clearProps: 'transform' }
      );
    }

    // Rotating spring checkmark badge
    if (checkmarkBadgeRef.current) {
      gsap.fromTo(
        checkmarkBadgeRef.current,
        { scale: 0, rotate: -35 },
        { scale: 1, rotate: 0, duration: 0.5, delay: 0.15, ease: 'back.out(2)' }
      );
    }

    // Stagger ticket elements
    gsap.fromTo(
      '.gsap-success-elem',
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, delay: 0.22, ease: 'power2.out' }
    );
  }, [booking?.bookingRef]);

  if (!booking) return null;

  const {
    bookingRef,
    paystackRef,
    studentName,
    email,
    phone,
    className,
    classDate,
    classTime,
    instructor,
    amount,
    paymentMethod,
    healthNotes
  } = booking;

  // Find Mass Yoga class if exists
  const massClass = classes.find((c) => c.id === 'cls-mass') || null;
  const currentSlots = massClass?.scheduleSlots || STUDIO_SCHEDULES;

  // Generate downloadable iCalendar (.ics) file
  const handleDownloadCalendar = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//stretchwithlorie//EN',
      'BEGIN:VEVENT',
      `UID:${bookingRef}@stretchwithlorie.com`,
      `SUMMARY:🧘 Yoga: ${className} with ${instructor}`,
      `DESCRIPTION:Booking Ref: ${bookingRef}\\nPaystack Ref: ${paystackRef || 'Verified'}\\nStudio: stretchwithlorie\\nInstructor: ${instructor}\\nStudent: ${studentName}`,
      'LOCATION:stretchwithlorie Sanctuary',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${className.replace(/\s+/g, '_')}_${bookingRef}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate downloadable luxury PDF Studio Entry Pass (with native Mobile Share/Save to Files & direct download)
  const handleDownloadPass = async (options = {}) => {
    try {
      setIsGeneratingPdf(true);
      const res = await exportBookingPassPDF(booking, options);
      if (res?.method === 'share') {
        setDownloadFeedback('Pass shared!');
      } else if (res?.method === 'download') {
        setDownloadFeedback('Pass downloaded!');
      }
      setTimeout(() => setDownloadFeedback(null), 3500);
    } catch (err) {
      console.error('Failed to generate studio pass PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Explicitly preview / open PDF in new tab
  const handlePreviewPass = () => {
    handleDownloadPass({ preview: true });
  };

  // Direct WhatsApp Share of Pass & Confirmation Details
  const handleShareWhatsApp = () => {
    const text = `🧘 *Official Studio Pass - stretchwithlorie*\n\n*Booking Ref:* ${bookingRef}\n*Class:* ${className}\n*Scheduled Date:* ${classDate}\n*Time:* ${classTime}\n*Instructor:* ${instructor}\n*Attendee:* ${studentName}\n*Payment:* Verified Paid (${paymentMethod})\n*Status:* Confirmed Mat Reservation\n📍 *Sanctuary:* Suite 4B, East Legon, Accra, Ghana\n\nSee you on the mat! 🌿`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div ref={modalBackdropRef} className="fixed inset-0 z-50 overflow-y-auto bg-[#2B2E31]/75 backdrop-blur-sm p-3.5 sm:p-6 overscroll-contain">
      <div className="flex min-h-full items-center justify-center py-4 sm:py-6">
        <div ref={modalCardRef} className="relative w-full max-w-lg rounded-3xl bg-[#FAF8F5] p-4.5 sm:p-7 shadow-2xl border border-[#E6E1D8] transition-all my-auto">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 z-20 rounded-full p-2 text-[#5C6260] bg-white/90 hover:bg-[#EAE4DC] hover:text-[#2B2E31] border border-[#E6E1D8] shadow-2xs transition-colors cursor-pointer"
            title="Close confirmation"
            aria-label="Close"
          >
            <X className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          </button>

          {/* Celebration Header */}
          <div className="text-center pt-1 sm:pt-0">
            <div className="mx-auto mb-2.5 flex items-center justify-center gap-2.5 sm:gap-3">
              <div className="rounded-2xl bg-white shadow-2xs ring-1 ring-[#E6E1D8] px-3 py-1 sm:px-3.5 sm:py-1.5 overflow-hidden">
                <BrandLogo variant="image" size="sm" />
              </div>
              <div ref={checkmarkBadgeRef} className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-[#E5ECE2] text-[#5A6952] shadow-inner ring-1 ring-[#DCE4D9]">
                <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 text-[#5A6952]" />
              </div>
            </div>
            <span className="gsap-success-elem inline-flex items-center gap-1 rounded-full bg-[#E5ECE2] border border-[#DCE4D9] px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-[#5A6952]">
              <Sparkles className="h-3 w-3 shrink-0" /> Booking & Payment Confirmed
            </span>
            <h2 className="gsap-success-elem mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#2B2E31] leading-tight">
              Your Mat is Reserved!
            </h2>
            <p className="gsap-success-elem mt-1 text-xs sm:text-sm text-[#5C6260] px-1 break-words">
              We've sent your entry pass and session receipt to <span className="font-semibold text-[#2B2E31] break-all">{email}</span>.
            </p>
          </div>

          {/* Booking Card Details */}
          <div className="gsap-success-elem mt-4 sm:mt-5 rounded-2xl border border-[#E6E1D8] bg-white p-3.5 sm:p-5 shadow-2xs space-y-3.5 sm:space-y-4">
            
            {/* Reference & Amount */}
            <div className="flex items-start justify-between gap-2.5 pb-3 border-b border-[#E6E1D8]">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#5C6260] block">
                  Booking Reference
                </span>
                <p className="font-mono text-base sm:text-lg font-bold text-[#2B2E31] tracking-tight">
                  {bookingRef}
                </p>
                {paystackRef && (
                  <p className="font-mono text-[10px] sm:text-[11px] text-[#0288D1] flex items-center gap-1 mt-0.5 truncate" title={paystackRef}>
                    <PaystackIcon className="h-2.5 w-2.5 shrink-0" />
                    <span className="truncate">{paystackRef}</span>
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F8FD] border border-[#B6EEFC] px-2.5 py-0.5 text-xs font-bold text-[#0288D1] whitespace-nowrap shadow-2xs">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  PAID • GH₵{amount}.00
                </span>
                <div className="text-[11px] text-[#5C6260] mt-1 font-medium flex items-center justify-end gap-1.5">
                  {paymentMethod && (paymentMethod.includes('MTN') || paymentMethod.includes('Telecel') || paymentMethod.includes('Airtel') || paymentMethod.includes('AT') || paymentMethod.includes('MoMo')) ? (
                    <MobileMoneyLogo network={paymentMethod} variant="image" size="xs" className="h-4 w-auto rounded-xs shadow-2xs inline-block shrink-0" />
                  ) : (
                    <CreditCard className="h-3 w-3 text-[#7A8B71] shrink-0" />
                  )}
                  <span className="whitespace-nowrap">{paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Class details */}
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <h4 className="font-serif text-base sm:text-lg font-bold text-[#2B2E31] leading-snug">
                {className}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-[#5C6260]">
                <div className="flex items-center gap-2 min-w-0">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#7A8B71] shrink-0" />
                  <span className="truncate">{classDate}</span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#7A8B71] shrink-0" />
                  <span className="truncate">{classTime}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[#5C6260] pt-0.5">
                <img
                  src={DEFAULT_INSTRUCTOR_AVATAR}
                  alt={instructor}
                  className="h-4 w-4 sm:h-4.5 sm:w-4.5 rounded-full object-cover object-[center_20%] ring-1 ring-[#7A8B71]/40 shrink-0"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <span className="truncate">Instructor: <strong className="text-[#2B2E31]">{instructor}</strong></span>
              </div>
            </div>

            {/* Health Notes preview if provided */}
            {healthNotes && healthNotes !== 'None' && healthNotes !== 'None reported' && (
              <div className="rounded-xl bg-[#FAF8F5] p-2.5 sm:p-3 text-xs text-[#5C6260] border border-[#E6E1D8]">
                <span className="font-semibold text-[#2B2E31] flex items-center gap-1.5 mb-1.5">
                  <HeartPulse className="h-3.5 w-3.5 text-[#7A8B71] shrink-0" />
                  <span>Instructor Accommodation Note:</span>
                </span>
                {healthNotes.includes(' • ') ? (
                  <div className="space-y-1 text-[11px] sm:text-xs text-[#4A504E]">
                    {healthNotes.split(' • ').map((item, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-[#7A8B71] font-bold leading-none mt-1 shrink-0">•</span>
                        <span className="break-words leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="leading-relaxed text-[11px] sm:text-xs text-[#4A504E] break-words italic">
                    {healthNotes}
                  </p>
                )}
              </div>
            )}

            {/* Student summary */}
            <div className="pt-2 text-xs text-[#5C6260] border-t border-[#E6E1D8] flex flex-wrap items-center justify-between gap-1.5">
              <span className="truncate">Attendee: <strong className="text-[#2B2E31]">{studentName}</strong></span>
              <span className="font-mono text-[11px] sm:text-xs font-semibold text-[#2B2E31]">{phone}</span>
            </div>
          </div>

          {/* Quick Download & Share Actions */}
          <div className="mt-3.5 sm:mt-5 space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={handleDownloadCalendar}
                className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-2xl border border-[#E6E1D8] bg-white p-2.5 sm:p-3 text-xs font-semibold text-[#2B2E31] hover:bg-[#FAF8F5] active:scale-[0.98] transition-all shadow-2xs cursor-pointer"
              >
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#7A8B71] shrink-0" />
                <span className="truncate">Add to Calendar</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadPass()}
                disabled={isGeneratingPdf}
                className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-2xl border border-[#7A8B71] bg-[#7A8B71] p-2.5 sm:p-3 text-xs font-bold text-white hover:bg-[#687760] active:scale-[0.98] transition-all shadow-sm cursor-pointer disabled:opacity-60"
                title="Download official PDF entry pass & receipt to your phone or computer"
              >
                {isGeneratingPdf ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent shrink-0" />
                    <span className="truncate">Preparing Pass...</span>
                  </>
                ) : downloadFeedback ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-white shrink-0" />
                    <span className="truncate">{downloadFeedback}</span>
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white shrink-0" />
                    <span className="truncate">Download PDF Pass</span>
                  </>
                )}
              </button>
            </div>

            {/* Mobile Utility Actions (Preview in New Tab & Send to WhatsApp) */}
            <div className="flex items-center justify-between gap-2 px-1 pt-0.5 text-[11px]">
              <button
                type="button"
                onClick={handlePreviewPass}
                disabled={isGeneratingPdf}
                className="inline-flex items-center gap-1 text-[#5C6260] hover:text-[#2B2E31] hover:underline cursor-pointer disabled:opacity-50"
                title="Open PDF directly in a new tab"
              >
                <ExternalLink className="h-3 w-3 text-[#7A8B71]" />
                <span>Preview in Browser</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="inline-flex items-center gap-1 text-[#1E7E34] font-semibold hover:underline cursor-pointer"
                title="Send booking confirmation and pass details on WhatsApp"
              >
                <Send className="h-3 w-3 text-[#25D366]" />
                <span>Send to WhatsApp</span>
              </button>
            </div>

            {/* Mobile Download Helper Tip */}
            <div className="rounded-xl bg-[#F1F4EF]/80 border border-[#DCE4D9] p-2 text-[10.5px] text-[#5A6952] flex items-start gap-1.5 leading-relaxed">
              <span className="font-bold shrink-0">📱 Phone tip:</span>
              <span>
                Tap <strong>Download PDF Pass</strong> to save to your files or share. You can also tap <strong>Send to WhatsApp</strong> to keep your pass in your chat.
              </span>
            </div>
          </div>

          {/* Book for Other Days & Sessions Feature */}
          <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#F1F4EF] via-[#FAF8F5] to-[#EFECE6] border border-[#DCE4D9] p-3.5 sm:p-4 text-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#7A8B71] shrink-0" />
                <h4 className="font-serif text-xs sm:text-sm font-bold text-[#2B2E31]">
                  Book for Other Days & Sessions
                </h4>
              </div>
              <span className="text-[10px] font-bold text-[#5A6952] bg-white px-2 py-0.5 rounded-full border border-[#DCE4D9] shrink-0 shadow-2xs">
                1-Tap Pre-Filled
              </span>
            </div>

            <p className="text-[11px] text-[#5C6260] leading-relaxed">
              Want to stretch again this week? Pick another day below — your attendee information and health profile will stay pre-filled for a fast checkout.
            </p>

            {/* Other Weekly Mass Slots */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A6952] block">
                Available Weekly Mass Yoga Mats:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentSlots.map((slot) => {
                  const isSlotFull = slot.isFull || (slot.spotsLeft ?? (slot.maxCapacity - slot.bookedCount)) <= 0;
                  const left = slot.spotsLeft ?? Math.max(0, slot.maxCapacity - slot.bookedCount);
                  const isAlreadyBookedDay = className.includes(slot.day) || className.includes(slot.label);

                  return (
                    <button
                      key={slot.id || slot.label}
                      type="button"
                      disabled={isSlotFull}
                      onClick={() =>
                        onBookAnotherSession &&
                        onBookAnotherSession({
                          classId: 'cls-mass',
                          slot: `${slot.day} ${slot.time}`,
                          slotLabel: slot.label,
                          booking
                        })
                      }
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                        isSlotFull
                          ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed opacity-75'
                          : isAlreadyBookedDay
                          ? 'bg-[#E5ECE2]/70 border-[#7A8B71] text-[#2B2E31] cursor-pointer hover:bg-[#E5ECE2]'
                          : 'bg-white border-[#DCE4D9] hover:border-[#7A8B71] hover:bg-[#FAF8F5] cursor-pointer shadow-2xs group'
                      }`}
                    >
                      <div className="min-w-0 pr-1">
                        <div className="flex items-center gap-1 font-bold text-xs text-[#2B2E31] group-hover:text-[#5A6952] truncate">
                          <Calendar className="h-3 w-3 text-[#7A8B71] shrink-0" />
                          <span className="truncate">{slot.label}</span>
                        </div>
                        <span className="text-[10px] text-[#5C6260] block truncate">{slot.focus}</span>
                      </div>

                      <div className="shrink-0 text-right">
                        {isSlotFull ? (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[#A44A4A] bg-[#F9F3F4] px-1.5 py-0.5 rounded border border-[#EAD3D5]">
                            <Lock className="h-2 w-2" /> Full
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-[#5A6952] bg-[#E5ECE2] px-1.5 py-0.5 rounded border border-[#DCE4D9]">
                            {left} left
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Other Signature Offerings */}
            <div className="pt-2 border-t border-[#DCE4D9]/70 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  onBookAnotherSession &&
                  onBookAnotherSession({
                    classId: 'cls-masterclass',
                    booking
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#DCE4D9] hover:border-[#C8A253] text-[#2B2E31] text-[11px] font-semibold transition-all shadow-2xs cursor-pointer group"
              >
                <PlusCircle className="h-3.5 w-3.5 text-[#C8A253] group-hover:rotate-90 transition-transform" />
                <span>Flexibility Masterclass (GH₵250)</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onBookAnotherSession &&
                  onBookAnotherSession({
                    classId: 'cls-private',
                    booking
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#DCE4D9] hover:border-[#7A8B71] text-[#2B2E31] text-[11px] font-semibold transition-all shadow-2xs cursor-pointer group"
              >
                <PlusCircle className="h-3.5 w-3.5 text-[#7A8B71] group-hover:rotate-90 transition-transform" />
                <span>1-on-1 Private Session (From GH₵300)</span>
              </button>
            </div>
          </div>

          {/* Primary Next Actions */}
          <div className="mt-3.5 sm:mt-5 space-y-2">
            <button
              type="button"
              onClick={onViewDashboard}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#A44A4A] py-3 sm:py-3.5 px-4 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#8C3E3E] active:scale-[0.99] transition-all cursor-pointer"
            >
              <span>See Live in Instructor Dashboard</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl border border-transparent py-2 text-center text-xs font-semibold text-[#5C6260] hover:text-[#2B2E31] hover:bg-[#EAE4DC]/50 transition-colors cursor-pointer"
            >
              Close Confirmation
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}