import { X, Mail, Phone, Calendar, Clock, HeartPulse, CheckCircle2 } from 'lucide-react';
import { PaystackIcon } from './RegistrationForm';

export default function StudentDetailsModal({ registration, onClose, onToggleCheckIn }) {
  if (!registration) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#2B2E31]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#FAF8F5] p-6 sm:p-7 shadow-2xl border border-[#E6E1D8]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-[#5C6260] hover:bg-[#EAE4DC] hover:text-[#2B2E31] transition-colors"
          title="Close details"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-[#E6E1D8]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E5ECE2] text-[#5A6952] font-bold text-lg font-serif">
            {registration.studentName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-xl font-bold text-[#2B2E31]">
                {registration.studentName}
              </h3>
              <span className="rounded-full bg-[#E5ECE2] border border-[#DCE4D9] px-2 py-0.5 text-[10px] font-bold text-[#5A6952]">
                {registration.bookingRef}
              </span>
            </div>
            <p className="text-xs text-[#5C6260]">
              Booked on {registration.formattedTime}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="mt-5 space-y-4 text-xs sm:text-sm">
          
          {/* Class Information */}
          <div className="rounded-2xl border border-[#E6E1D8] bg-white p-4 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6260]">
              Class Enrolled
            </span>
            <p className="font-serif text-base font-bold text-[#2B2E31]">
              {registration.className}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5C6260]">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#7A8B71]" />
                {registration.classDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#7A8B71]" />
                {registration.classTime}
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="rounded-2xl border border-[#E6E1D8] bg-white p-4 space-y-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6260]">
              Contact & Messaging
            </span>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#5C6260]">
                <Mail className="h-4 w-4 text-[#5C6260]" />
                {registration.email}
              </span>
              <a
                href={`mailto:${registration.email}`}
                className="text-xs font-semibold text-[#7A8B71] hover:underline"
              >
                Send Email
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[#5C6260]">
                <Phone className="h-4 w-4 text-[#5C6260]" />
                {registration.phone}
              </span>
              <a
                href={`https://wa.me/${registration.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-[#5A6952] bg-[#E5ECE2] border border-[#DCE4D9] px-2 py-0.5 rounded-lg hover:bg-[#DCE4D9] transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>

          {/* Health & Injury Notes */}
          <div className="rounded-2xl border border-[#E6E1D8] bg-white p-4">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#5C6260] mb-1.5">
              <HeartPulse className="h-4 w-4 text-[#7A8B71]" />
              Health, Physical Accommodations & Injuries
            </span>
            <div className="rounded-xl bg-[#FAF8F5] p-3 text-xs text-[#2B2E31] leading-relaxed border border-[#E6E1D8]">
              {registration.healthNotes && registration.healthNotes !== 'None reported' ? (
                <p className="font-medium">{registration.healthNotes}</p>
              ) : (
                <p className="text-[#5C6260] italic">No physical injuries or accommodations submitted by student.</p>
              )}
            </div>
          </div>

          {/* Payment & Attendance Status */}
          <div className="rounded-2xl border border-[#E6E1D8] bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6260] block">
                Payment Status
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F8FD] border border-[#B6EEFC] px-2.5 py-0.5 text-xs font-bold text-[#0288D1]">
                  <CheckCircle2 className="h-3 w-3" />
                  PAID • GH₵{registration.amount}.00
                </span>
                <span className="text-xs text-[#5C6260] font-medium">
                  {registration.paymentMethod}
                </span>
              </div>
              {registration.paystackRef && (
                <span className="font-mono text-[10px] text-[#0288D1] flex items-center gap-1 mt-1">
                  <PaystackIcon className="h-2.5 w-2.5" />
                  Ref: {registration.paystackRef}
                </span>
              )}
            </div>

            <div className="sm:text-right">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6260] block">
                Mat Attendance
              </span>
              <button
                type="button"
                onClick={() => onToggleCheckIn(registration.id)}
                className={`mt-1 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                  registration.checkedIn
                    ? 'bg-[#5A6952] text-white hover:bg-[#4E5C47]'
                    : 'bg-[#E5ECE2] text-[#5A6952] hover:bg-[#DCE4D9]'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{registration.checkedIn ? 'Checked In' : 'Mark Present'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-[#A44A4A] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#8C3E3E] transition-colors"
          >
            Close Details
          </button>
        </div>

      </div>
    </div>
  );
}