import { X, Mail, Phone, Calendar, Clock, HeartPulse, CheckCircle2, ClipboardList, AlertTriangle } from 'lucide-react';
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

          {/* Student Wellness & Intake Profile */}
          <div className="rounded-2xl border border-[#E6E1D8] bg-white p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E6E1D8]">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#5A6952]">
                <ClipboardList className="h-4 w-4 text-[#7A8B71]" />
                Client Intake & Wellness Questionnaire
              </span>
              <span className="rounded-full bg-[#E5ECE2] border border-[#DCE4D9] px-2 py-0.5 text-[10px] font-bold text-[#5A6952]">
                {registration.isFirstTime === false ? 'Returning Student' : 'New Client'}
              </span>
            </div>

            {registration.intake ? (
              <div className="space-y-2.5 text-xs text-[#2B2E31]">
                {/* Background & Goal */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-[#FAF8F5] p-2.5 border border-[#E6E1D8]">
                    <span className="text-[10px] font-bold uppercase text-[#5C6260] block">
                      Yoga Experience
                    </span>
                    <span className="font-semibold text-[#2B2E31]">
                      {registration.intake.experienceLevel || 'Beginner'}
                    </span>
                    <span className="text-[10px] text-[#5C6260] block mt-0.5">
                      Practiced before: <strong>{registration.intake.practicedBefore || 'Yes'}</strong>
                    </span>
                  </div>

                  <div className="rounded-xl bg-[#FAF8F5] p-2.5 border border-[#E6E1D8]">
                    <span className="text-[10px] font-bold uppercase text-[#5C6260] block">
                      Session Goal
                    </span>
                    <span className="font-semibold text-[#7A8B71]">
                      {registration.intake.customGoal || registration.intake.mainGoal || 'Mobility & Wellness'}
                    </span>
                  </div>
                </div>

                {/* Injuries & Physical Limitations */}
                <div className={`rounded-xl p-2.5 border ${
                  registration.intake.hasInjuries === 'Yes'
                    ? 'bg-[#FFF8F8] border-[#A44A4A]/30 text-[#A44A4A]'
                    : 'bg-[#FAF8F5] border-[#E6E1D8] text-[#2B2E31]'
                }`}>
                  <div className="flex items-center gap-1.5 mb-1 font-bold text-[11px]">
                    {registration.intake.hasInjuries === 'Yes' ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-[#A44A4A]" />
                    ) : (
                      <HeartPulse className="h-3.5 w-3.5 text-[#7A8B71]" />
                    )}
                    <span>Physical Limitations & Injuries</span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#2B2E31]">
                    {registration.intake.hasInjuries === 'Yes' && registration.intake.injuriesDetails
                      ? registration.intake.injuriesDetails
                      : 'None reported (All clear for standard movement)'}
                  </p>
                </div>

                {/* Pregnancy / Postpartum & Notes */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-xl bg-[#FAF8F5] p-2.5 border border-[#E6E1D8]">
                    <span className="text-[10px] font-bold uppercase text-[#5C6260] block">
                      Pregnancy / Postpartum
                    </span>
                    <span className="font-semibold text-[#2B2E31]">
                      {registration.intake.pregnancyStatus === 'Pregnant'
                        ? 'Currently Pregnant'
                        : registration.intake.pregnancyStatus === 'Postpartum'
                        ? 'Recently Given Birth'
                        : 'No'}
                    </span>
                  </div>

                  <div className="rounded-xl bg-[#FAF8F5] p-2.5 border border-[#E6E1D8]">
                    <span className="text-[10px] font-bold uppercase text-[#5C6260] block">
                      Instructor Note
                    </span>
                    <span className="font-medium text-[#2B2E31] italic">
                      {registration.intake.instructorNotes || registration.intake.returningNotes || 'None'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Fallback for legacy registration records */
              <div className="rounded-xl bg-[#FAF8F5] p-3 text-xs text-[#2B2E31] leading-relaxed border border-[#E6E1D8]">
                {registration.healthNotes && registration.healthNotes !== 'None reported' ? (
                  <p className="font-medium">{registration.healthNotes}</p>
                ) : (
                  <p className="text-[#5C6260] italic">No physical injuries or accommodations submitted by student.</p>
                )}
              </div>
            )}
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