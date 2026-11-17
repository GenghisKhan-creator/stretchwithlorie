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

export default function SuccessModal({ booking, onClose, onViewDashboard }) {
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

  // Generate downloadable receipt text
  const handleDownloadReceipt = () => {
    const receiptText = `
========================================
       STRETCHWITHLORIE RECEIPT
========================================
Studio:            stretchwithlorie (Yoga & Fitness)
Booking Reference: ${bookingRef}
Paystack Ref:      ${paystackRef || 'pstk_tr_verified'}
Payment Gateway:   Paystack
Payment Method:    ${paymentMethod}
Payment Status:    PAID (Full Confirmation)
Date Issued:       ${new Date().toLocaleDateString()}

STUDENT DETAILS:
Name:  ${studentName}
Email: ${email}
Phone: ${phone}

SESSION DETAILS:
Class:      ${className}
Date:       ${classDate}
Time:       ${classTime}
Instructor: ${instructor}
Location:   stretchwithlorie Sanctuary

PAYMENT SUMMARY:
Class Registration Fee:  GH₵${amount}.00
Mat, Props & Tea:        Included
Total Amount Paid:       GH₵${amount}.00

HEALTH / INJURY NOTES:
${healthNotes || 'None'}

Please arrive 10-15 minutes before your session. Mats, organic bolsters, and complimentary infused tea are provided.
Namaste!
========================================
    `.trim();

    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `StretchWithLorie_Receipt_${bookingRef}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#2B2E31]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#FAF8F5] p-6 sm:p-8 shadow-2xl border border-[#E6E1D8] transition-all">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-[#5C6260] hover:bg-[#EAE4DC] hover:text-[#2B2E31] transition-colors"
          title="Close confirmation"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Celebration Header */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex items-center justify-center gap-3">
            <div className="rounded-2xl bg-white shadow-sm ring-2 ring-[#E6E1D8] px-3.5 py-1.5 overflow-hidden">
              <BrandLogo variant="image" size="sm" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E5ECE2] text-[#5A6952] shadow-inner ring-2 ring-[#DCE4D9]">
              <CheckCircle2 className="h-7 w-7 text-[#5A6952]" />
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#E5ECE2] border border-[#DCE4D9] px-3 py-1 text-xs font-semibold text-[#5A6952]">
            <Sparkles className="h-3 w-3" /> Booking & Payment Confirmed
          </span>
          <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#2B2E31]">
            Your Mat is Reserved!
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#5C6260]">
            We've sent your entry pass and session receipt to <span className="font-semibold text-[#2B2E31]">{email}</span>.
          </p>
        </div>

        {/* Booking Card Details */}
        <div className="mt-6 rounded-2xl border border-[#E6E1D8] bg-white p-5 shadow-sm space-y-4">
          
          {/* Reference & Amount */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D8]">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6260]">
                Booking Reference
              </span>
              <p className="font-mono text-base font-bold text-[#2B2E31]">
                {bookingRef}
              </p>
              {paystackRef && (
                <p className="font-mono text-[10px] text-[#0288D1] flex items-center gap-1 mt-0.5">
                  <PaystackIcon className="h-2.5 w-2.5" />
                  {paystackRef}
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F8FD] border border-[#B6EEFC] px-2.5 py-0.5 text-xs font-bold text-[#0288D1]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                PAID • GH₵{amount}.00
              </span>
              <div className="text-[11px] text-[#5C6260] mt-1 font-medium flex items-center justify-end gap-1.5">
                {paymentMethod && (paymentMethod.includes('MTN') || paymentMethod.includes('Telecel') || paymentMethod.includes('Airtel') || paymentMethod.includes('AT') || paymentMethod.includes('MoMo')) ? (
                  <MobileMoneyLogo network={paymentMethod} variant="image" size="xs" className="h-4.5 w-auto rounded-xs shadow-2xs" />
                ) : (
                  <CreditCard className="h-3 w-3 text-[#7A8B71]" />
                )}
                <span>{paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Class details */}
          <div className="space-y-2 text-xs sm:text-sm">
            <h4 className="font-serif text-base font-bold text-[#2B2E31]">
              {className}
            </h4>
            <div className="flex items-center gap-2 text-[#5C6260]">
              <Calendar className="h-4 w-4 text-[#7A8B71] shrink-0" />
              <span>{classDate}</span>
            </div>
            <div className="flex items-center gap-2 text-[#5C6260]">
              <Clock className="h-4 w-4 text-[#7A8B71] shrink-0" />
              <span>{classTime}</span>
            </div>
            <div className="flex items-center gap-2 text-[#5C6260]">
              <User className="h-4 w-4 text-[#7A8B71] shrink-0" />
              <span>Instructor: <strong className="text-[#2B2E31]">{instructor}</strong></span>
            </div>
          </div>

          {/* Health Notes preview if provided */}
          {healthNotes && healthNotes !== 'None' && healthNotes !== 'None reported' && (
            <div className="rounded-xl bg-[#FAF8F5] p-3 text-xs text-[#5C6260] border border-[#E6E1D8]">
              <span className="font-semibold text-[#2B2E31] flex items-center gap-1 mb-1">
                <HeartPulse className="h-3.5 w-3.5 text-[#7A8B71]" />
                Instructor Accommodation Note:
              </span>
              <p className="italic">{healthNotes}</p>
            </div>
          )}

          {/* Student summary */}
          <div className="pt-2 text-xs text-[#5C6260] border-t border-[#E6E1D8] flex justify-between">
            <span>Attendee: <strong className="text-[#2B2E31]">{studentName}</strong></span>
            <span>{phone}</span>
          </div>
        </div>

        {/* Quick Download Actions */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleDownloadCalendar}
            className="flex items-center justify-center gap-2 rounded-2xl border border-[#E6E1D8] bg-white p-3 text-xs font-semibold text-[#2B2E31] hover:bg-[#FAF8F5] transition-colors shadow-2xs"
          >
            <Calendar className="h-4 w-4 text-[#7A8B71]" />
            <span>Add to Calendar</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadReceipt}
            className="flex items-center justify-center gap-2 rounded-2xl border border-[#E6E1D8] bg-white p-3 text-xs font-semibold text-[#2B2E31] hover:bg-[#FAF8F5] transition-colors shadow-2xs"
          >
            <Download className="h-4 w-4 text-[#7A8B71]" />
            <span>Download Pass</span>
          </button>
        </div>

        {/* Primary Next Actions */}
        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            onClick={onViewDashboard}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#A44A4A] py-3.5 px-4 text-sm font-bold text-white shadow-md hover:bg-[#8C3E3E] transition-all"
          >
            <span>See Live in Instructor Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl border border-transparent py-2.5 text-center text-xs font-semibold text-[#5C6260] hover:text-[#2B2E31] hover:bg-[#EAE4DC]/50 transition-colors"
          >
            Book Another Class
          </button>
        </div>

      </div>
    </div>
  );
}