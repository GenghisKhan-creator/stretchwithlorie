import { useState } from 'react';
import {
  CheckCircle2,
  Calendar,
  Clock,
  User,
  HeartPulse,
  Download,
  ArrowRight,
  Sparkles,
  X,
  CreditCard
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import MobileMoneyLogo from './MobileMoneyLogo';
import { PaystackIcon } from './RegistrationForm';
import { exportBookingPassPDF } from '../utils/pdfExport';

export default function SuccessModal({ booking, onClose, onViewDashboard }) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

  // Generate downloadable luxury PDF Studio Entry Pass
  const handleDownloadPass = async () => {
    try {
      setIsGeneratingPdf(true);
      await exportBookingPassPDF(booking);
    } catch (err) {
      console.error('Failed to generate studio pass PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2B2E31]/75 backdrop-blur-sm p-3.5 sm:p-6 overscroll-contain animate-in fade-in duration-200">
      <div className="flex min-h-full items-center justify-center py-4 sm:py-6">
        <div className="relative w-full max-w-lg rounded-3xl bg-[#FAF8F5] p-4.5 sm:p-7 shadow-2xl border border-[#E6E1D8] transition-all my-auto">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-3.5 top-3.5 sm:right-4 sm:top-4 z-20 rounded-full p-2 text-[#5C6260] bg-white/90 hover:bg-[#EAE4DC] hover:text-[#2B2E31] border border-[#E6E1D8] shadow-2xs transition-colors"
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
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-[#E5ECE2] text-[#5A6952] shadow-inner ring-1 ring-[#DCE4D9]">
                <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 text-[#5A6952]" />
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E5ECE2] border border-[#DCE4D9] px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-[#5A6952]">
              <Sparkles className="h-3 w-3 shrink-0" /> Booking & Payment Confirmed
            </span>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#2B2E31] leading-tight">
              Your Mat is Reserved!
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#5C6260] px-1 break-words">
              We've sent your entry pass and session receipt to <span className="font-semibold text-[#2B2E31] break-all">{email}</span>.
            </p>
          </div>

          {/* Booking Card Details */}
          <div className="mt-4 sm:mt-5 rounded-2xl border border-[#E6E1D8] bg-white p-3.5 sm:p-5 shadow-2xs space-y-3.5 sm:space-y-4">
            
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
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#7A8B71] shrink-0" />
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

          {/* Quick Download Actions */}
          <div className="mt-3.5 sm:mt-5 grid grid-cols-2 gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={handleDownloadCalendar}
              className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-2xl border border-[#E6E1D8] bg-white p-2.5 sm:p-3 text-xs font-semibold text-[#2B2E31] hover:bg-[#FAF8F5] active:scale-[0.98] transition-all shadow-2xs"
            >
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#7A8B71] shrink-0" />
              <span className="truncate">Add to Calendar</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPass}
              disabled={isGeneratingPdf}
              className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-2xl border border-[#E6E1D8] bg-white p-2.5 sm:p-3 text-xs font-semibold text-[#2B2E31] hover:bg-[#FAF8F5] active:scale-[0.98] transition-all shadow-2xs cursor-pointer disabled:opacity-60"
              title="Download official PDF entry pass & receipt"
            >
              {isGeneratingPdf ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#7A8B71] border-t-transparent shrink-0" />
                  <span className="truncate">Preparing PDF...</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#7A8B71] shrink-0" />
                  <span className="truncate">Download PDF Pass</span>
                </>
              )}
            </button>
          </div>

          {/* Primary Next Actions */}
          <div className="mt-3.5 sm:mt-5 space-y-2">
            <button
              type="button"
              onClick={onViewDashboard}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#A44A4A] py-3 sm:py-3.5 px-4 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#8C3E3E] active:scale-[0.99] transition-all"
            >
              <span>See Live in Instructor Dashboard</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl border border-transparent py-2 text-center text-xs font-semibold text-[#5C6260] hover:text-[#2B2E31] hover:bg-[#EAE4DC]/50 transition-colors"
            >
              Book Another Class
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}