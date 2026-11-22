import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  X,
  Mail,
  Phone,
  Calendar,
  Clock,
  HeartPulse,
  CheckCircle2,
  ClipboardList,
  AlertTriangle,
  Check,
  Copy,
  Sparkles,
  MapPin,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import { PaystackIcon } from './RegistrationForm';

// Helper to extract or parse structured intake from registration
function resolveIntake(registration) {
  if (registration?.intake && typeof registration.intake === 'object') {
    return registration.intake;
  }

  // Parse legacy healthNotes string fallback
  const text = registration?.healthNotes || '';
  if (!text || text === 'None' || text === 'None reported') {
    return null;
  }

  const practicedBefore = text.includes('Practiced before: No') ? 'No' : 'Yes';
  const experienceLevel = text.includes('Intermediate')
    ? 'Intermediate'
    : text.includes('Advanced')
    ? 'Advanced'
    : 'Beginner';

  const goalMatch = text.match(/Goal:\s*([^•]+)/);
  const mainGoal = goalMatch ? goalMatch[1].trim() : 'Flexibility & Mobility';

  const hasInjuries = text.includes('Injuries/Conditions:') ? 'Yes' : 'No';
  const injuriesMatch = text.match(/Injuries\/Conditions:\s*([^•]+)/);
  const injuriesDetails = injuriesMatch ? injuriesMatch[1].trim() : '';

  const pregnancyStatus = text.includes('Currently Pregnant')
    ? 'Pregnant'
    : text.includes('Recently Given Birth')
    ? 'Postpartum'
    : 'No';

  const noteMatch = text.match(/Instructor Note:\s*"?([^"•]+)"?/);
  const instructorNotes = noteMatch ? noteMatch[1].trim() : '';

  const updatesMatch = text.match(/Updates:\s*(.+)/);
  const returningNotes = updatesMatch ? updatesMatch[1].trim() : '';

  return {
    practicedBefore,
    experienceLevel,
    mainGoal,
    customGoal: '',
    hasInjuries,
    injuriesDetails,
    pregnancyStatus,
    instructorNotes,
    returningNotes
  };
}

export default function StudentDetailsModal({ registration, onClose, onToggleCheckIn }) {
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!registration) return null;

  const intake = resolveIntake(registration);
  const isFirstTimer = registration.isFirstTime !== false && !intake?.returningNotes;

  const handleCopySummary = () => {
    const lines = [
      `🧘 Yogi: ${registration.studentName}`,
      `📌 Class: ${registration.className} (${registration.classDate || ''} • ${registration.classTime || ''})`,
      `📞 Phone: ${registration.phone} • Email: ${registration.email}`,
      `🌱 Status: ${isFirstTimer ? 'First-Time Client' : 'Returning Student'}`,
      `✨ Experience: ${intake?.experienceLevel || 'Beginner'} (Practiced before: ${intake?.practicedBefore || 'Yes'})`,
      `🎯 Goal: ${intake?.customGoal || intake?.mainGoal || 'Flexibility & Mobility'}`,
      `⚠️ Injuries / Conditions: ${intake?.hasInjuries === 'Yes' && intake.injuriesDetails ? intake.injuriesDetails : 'None reported (All clear)'}`,
      `🤰 Pregnancy / Postpartum: ${intake?.pregnancyStatus || 'No'}`,
      intake?.instructorNotes ? `💬 Note for Lorie: "${intake.instructorNotes}"` : null,
      intake?.returningNotes ? `💬 Returning Update: "${intake.returningNotes}"` : null
    ].filter(Boolean).join('\n');

    navigator.clipboard?.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF8F5] overflow-y-auto w-screen h-screen min-h-screen flex flex-col animate-in fade-in duration-150">
      
      {/* =========================================================================
          STICKY TOP APP BAR (Edge-to-Edge Full Screen Header)
         ========================================================================= */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E6E1D8] px-4 sm:px-8 py-3.5 sm:py-4 shadow-2xs">
        <div className="w-full max-w-[1600px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Left: Back Arrow + Student Identity */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2 text-xs font-bold text-[#2B2E31] hover:bg-[#EAE4DC] transition-all shadow-2xs cursor-pointer shrink-0"
              title="Return to Attendees Roster (Esc)"
            >
              <ArrowLeft className="h-4 w-4 text-[#5A6952]" />
              <span className="hidden xs:inline">Back to Roster</span>
            </button>

            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E5ECE2] text-[#5A6952] font-bold text-lg font-serif shrink-0 shadow-2xs">
                {registration.studentName ? registration.studentName.slice(0, 2).toUpperCase() : 'SW'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-serif text-lg sm:text-2xl font-bold text-[#2B2E31] truncate">
                    {registration.studentName}
                  </h2>
                  <span className="font-mono text-xs font-bold text-[#5A6952] bg-[#E5ECE2] border border-[#DCE4D9] px-2 py-0.5 rounded-lg shadow-2xs">
                    {registration.bookingRef}
                  </span>
                  <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                    isFirstTimer
                      ? 'bg-[#FAF5EB] text-[#8C6D23] border-[#E8D7B0]'
                      : 'bg-[#E5ECE2] text-[#232D21] border-[#7A8B71]/40'
                  }`}>
                    {isFirstTimer ? '✦ First-Time Client' : '✦ Returning Student'}
                  </span>
                </div>
                <p className="text-xs text-[#5C6260] truncate">
                  {registration.className} • Booked on {registration.formattedTime || registration.registeredAt || 'Recent'}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Actions & Close */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2 text-xs font-semibold text-[#5C6260] hover:bg-[#FAF8F5] transition-colors shadow-2xs cursor-pointer"
              title="Copy student intake summary to clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Summary</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-[#5C6260] bg-white hover:bg-[#EAE4DC] hover:text-[#2B2E31] border border-[#E6E1D8] shadow-2xs transition-colors cursor-pointer"
              title="Close full-screen view (Esc)"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

        </div>
      </header>

      {/* =========================================================================
          MAIN WORKSPACE (Full-Screen Responsive 2-Column Dashboard Grid)
         ========================================================================= */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* -----------------------------------------------------------------------
              LEFT COLUMN: Logistics, Contacts & Mat Check-In (Col 1 to 4)
             ----------------------------------------------------------------------- */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Class & Session Schedule Card */}
            <div className="rounded-3xl border border-[#E6E1D8] bg-white p-5 sm:p-6 space-y-3.5 shadow-2xs">
              <div className="flex items-center gap-2 pb-2.5 border-b border-[#E6E1D8]">
                <Calendar className="h-4 w-4 text-[#5A6952]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#5C6260]">
                  Class Enrolled & Schedule
                </span>
              </div>

              <div>
                <h4 className="font-serif text-xl font-bold text-[#2B2E31]">
                  {registration.className}
                </h4>
                <div className="space-y-2 mt-3 text-xs text-[#5C6260]">
                  <div className="flex items-center gap-2.5 text-[#2B2E31] font-medium">
                    <Calendar className="h-4 w-4 text-[#7A8B71] shrink-0" />
                    <span className="text-sm">{registration.classDate || 'Upcoming Session'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#2B2E31] font-medium">
                    <Clock className="h-4 w-4 text-[#7A8B71] shrink-0" />
                    <span className="text-sm">{registration.classTime || 'Scheduled Time'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#8C6D23] font-semibold pt-1">
                    <MapPin className="h-4 w-4 text-[#C8A253] shrink-0" />
                    <span className="text-sm">{registration.locationType || 'Studio Sanctuary'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info & 1-Click Outreach Card */}
            <div className="rounded-3xl border border-[#E6E1D8] bg-white p-5 sm:p-6 space-y-3.5 shadow-2xs">
              <div className="flex items-center gap-2 pb-2.5 border-b border-[#E6E1D8]">
                <Phone className="h-4 w-4 text-[#5A6952]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#5C6260]">
                  Contact Info & Outreach
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Email */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-[#E6E1D8]">
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <Mail className="h-4 w-4 text-[#5C6260] shrink-0" />
                    <span className="truncate text-[#2B2E31] font-medium text-sm">{registration.email}</span>
                  </div>
                  <a
                    href={`mailto:${registration.email}`}
                    className="text-xs font-bold text-[#7A8B71] hover:underline shrink-0"
                  >
                    Email
                  </a>
                </div>

                {/* Phone & WhatsApp */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] border border-[#E6E1D8]">
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <Phone className="h-4 w-4 text-[#5C6260] shrink-0" />
                    <span className="truncate text-[#2B2E31] font-bold text-sm">{registration.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`https://wa.me/${String(registration.phone).replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-[#5A6952] bg-[#E5ECE2] border border-[#DCE4D9] px-3 py-1.5 rounded-xl hover:bg-[#DCE4D9] transition-colors shadow-2xs"
                    >
                      WhatsApp
                    </a>
                    <a
                      href={`tel:${registration.phone}`}
                      className="text-xs font-bold text-[#7A8B71] hover:underline px-2 py-1"
                    >
                      Call
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment & Attendance Verification Card */}
            <div className="rounded-3xl border border-[#E6E1D8] bg-white p-5 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-2.5 border-b border-[#E6E1D8]">
                <CreditCard className="h-4 w-4 text-[#5A6952]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#5C6260]">
                  Payment & Mat Attendance
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F8FD] border border-[#B6EEFC] px-3.5 py-1 text-xs font-bold text-[#0288D1]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      PAID • GH₵{registration.amount}.00
                    </span>
                    <span className="text-xs text-[#5C6260] font-medium">
                      {registration.paymentMethod}
                    </span>
                  </div>
                  {registration.paystackRef && (
                    <span className="font-mono text-xs text-[#0288D1] flex items-center gap-1.5 mt-2">
                      <PaystackIcon className="h-3.5 w-3.5" />
                      Ref: {registration.paystackRef}
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E6E1D8] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C6260] block">
                      Mat Attendance
                    </span>
                    <span className="text-xs font-semibold text-[#2B2E31]">
                      {registration.checkedIn ? 'Checked in on roster' : 'Pending check-in'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleCheckIn?.(registration.id)}
                    className={`inline-flex items-center gap-1.5 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all shadow-md cursor-pointer ${
                      registration.checkedIn
                        ? 'bg-[#5A6952] text-white hover:bg-[#4E5C47]'
                        : 'bg-[#E5ECE2] text-[#5A6952] hover:bg-[#DCE4D9]'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{registration.checkedIn ? 'Checked In' : 'Mark Present'}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* -----------------------------------------------------------------------
              RIGHT COLUMN: Full Intake & Wellness Questionnaire (Col 5 to 12)
             ----------------------------------------------------------------------- */}
          <div className="lg:col-span-8 space-y-5">
            
            <div className="rounded-3xl border-2 border-[#7A8B71]/30 bg-gradient-to-br from-[#FAF8F5] via-white to-[#F7F4EF] p-6 sm:p-8 space-y-6 shadow-sm">
              
              {/* Questionnaire Title Banner */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E6E1D8]">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E5ECE2] text-[#5A6952] shadow-2xs">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2B2E31] flex items-center gap-2">
                      <span>Client Wellness & Intake Questionnaire</span>
                      <span className="text-xs font-sans font-semibold text-[#5A6952] bg-[#E5ECE2] px-2.5 py-0.5 rounded-full">
                        Confidential
                      </span>
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5C6260] mt-0.5">
                      Submitted by student during registration to inform adjustments, safety cues, and props.
                    </p>
                  </div>
                </div>
              </div>

              {intake ? (
                <div className="space-y-5">
                  
                  {/* Q1 & Q2: Yoga Experience & Background */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    {/* Q1 */}
                    <div className="rounded-2xl bg-white p-5 border border-[#E6E1D8] space-y-2 shadow-2xs">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#5C6260] block">
                        1. Practised Yoga Before?
                      </span>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF5EB] border border-[#E8D7B0] text-[#8C6D23]">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-[#2B2E31]">
                            {intake.practicedBefore === 'No' ? 'No, first time practicing' : 'Yes, has practiced before'}
                          </p>
                          <span className="text-xs text-[#5C6260]">
                            {intake.practicedBefore === 'No' ? 'Needs foundational cueing & alignment pacing' : 'Familiar with regular yoga asanas'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Q2 */}
                    <div className="rounded-2xl bg-white p-5 border border-[#E6E1D8] space-y-2 shadow-2xs">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#5C6260] block">
                        2. Experience Level
                      </span>
                      <div className="flex items-center gap-3">
                        <span className={`inline-block px-4 py-1.5 rounded-xl text-sm font-bold border shadow-2xs ${
                          intake.experienceLevel === 'Beginner'
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : intake.experienceLevel === 'Advanced'
                            ? 'bg-purple-50 text-purple-900 border-purple-200'
                            : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                        }`}>
                          {intake.experienceLevel || 'Beginner'}
                        </span>
                        <span className="text-xs text-[#5C6260]">
                          {intake.experienceLevel === 'Beginner'
                            ? 'Requires clear posture pacing'
                            : intake.experienceLevel === 'Advanced'
                            ? 'Open to deeper variations'
                            : 'Comfortable with standard flow tempo'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Q3: Main Session Goal */}
                  <div className="rounded-2xl bg-white p-5 border border-[#E6E1D8] space-y-2.5 shadow-2xs">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#5C6260] block">
                      3. Main Goal for This Session
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-block rounded-2xl bg-[#5A6952] text-white px-5 py-2 text-sm font-bold shadow-md">
                        🎯 {intake.customGoal || intake.mainGoal || 'Flexibility & Mobility'}
                      </span>
                      {intake.customGoal && intake.mainGoal && (
                        <span className="text-xs text-[#5C6260] bg-[#FAF8F5] border border-[#E6E1D8] px-3 py-1.5 rounded-xl">
                          Category: <strong>{intake.mainGoal}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Q4: Physical Limitations & Injuries (High-Visibility Safety Priority) */}
                  <div className={`rounded-3xl p-6 sm:p-7 border-2 transition-all shadow-sm ${
                    intake.hasInjuries === 'Yes'
                      ? 'bg-[#FFF8F8] border-[#A44A4A] text-[#2B2E31]'
                      : 'bg-white border-[#E6E1D8] text-[#2B2E31]'
                  }`}>
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                        {intake.hasInjuries === 'Yes' ? (
                          <>
                            <AlertTriangle className="h-5 w-5 text-[#A44A4A]" />
                            <span className="text-[#A44A4A]">4. Physical Limitations & Injuries Reported</span>
                          </>
                        ) : (
                          <>
                            <HeartPulse className="h-5 w-5 text-[#5A6952]" />
                            <span className="text-[#5C6260]">4. Physical Limitations & Injuries</span>
                          </>
                        )}
                      </span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${
                        intake.hasInjuries === 'Yes'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {intake.hasInjuries === 'Yes' ? 'ATTENTION REQUIRED' : 'ALL CLEAR'}
                      </span>
                    </div>

                    {intake.hasInjuries === 'Yes' ? (
                      <div className="space-y-3 mt-2">
                        <div className="rounded-2xl bg-white p-4 sm:p-5 border border-red-200 text-sm sm:text-base font-semibold text-red-950 leading-relaxed shadow-xs">
                          {intake.injuriesDetails || 'Injuries indicated (no specific condition notes provided)'}
                        </div>
                        <div className="rounded-2xl bg-red-50/80 p-4 border border-red-200/60 text-xs sm:text-sm text-[#A44A4A] font-medium flex items-center gap-2.5">
                          <ShieldCheck className="h-5 w-5 shrink-0 text-[#A44A4A]" />
                          <span><strong>Instructor Safety Directive:</strong> Prepare yoga blocks, bolsters, and offer gentle posture alignment adjustments.</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-[#5C6260] italic">
                        No physical injuries, joint issues, or movement restrictions declared. All clear for standard flows.
                      </p>
                    )}
                  </div>

                  {/* Q5 & Q6: Pregnancy Status & Notes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    {/* Q5: Pregnancy Status */}
                    <div className={`rounded-2xl p-5 border shadow-2xs ${
                      intake.pregnancyStatus && intake.pregnancyStatus !== 'No'
                        ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                        : 'bg-white border-[#E6E1D8] text-[#2B2E31]'
                    }`}>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#5C6260] block">
                        5. Pregnancy / Postpartum
                      </span>
                      <p className="font-bold text-sm sm:text-base mt-2">
                        {intake.pregnancyStatus === 'Pregnant'
                          ? '🤰 Currently Pregnant (Avoid deep closed twists)'
                          : intake.pregnancyStatus === 'Postpartum'
                          ? '🍼 Recently Given Birth'
                          : 'No pregnancy considerations'}
                      </p>
                    </div>

                    {/* Q6: Notes / Special Instructions */}
                    <div className="rounded-2xl bg-white p-5 border border-[#E6E1D8] space-y-2 shadow-2xs">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#5C6260] block">
                        6. Special Note for Instructor
                      </span>
                      <p className="text-xs sm:text-sm italic text-[#2B2E31] leading-relaxed pt-1">
                        {intake.instructorNotes || intake.returningNotes ? (
                          `"${intake.instructorNotes || intake.returningNotes}"`
                        ) : (
                          <span className="text-[#88908D] not-italic">No special notes provided</span>
                        )}
                      </p>
                    </div>
                  </div>

                </div>
              ) : (
                /* Fallback for records with zero intake text */
                <div className="rounded-2xl bg-white p-8 text-center border border-[#E6E1D8] space-y-2">
                  <HeartPulse className="h-8 w-8 text-[#7A8B71] mx-auto opacity-60" />
                  <p className="font-serif text-lg font-bold text-[#2B2E31]">No Questionnaire on Record</p>
                  <p className="text-xs text-[#5C6260] max-w-md mx-auto">
                    This student was registered directly without a health questionnaire submission.
                  </p>
                </div>
              )}

            </div>

          </div>

        </div>
      </main>

      {/* =========================================================================
          STICKY BOTTOM BAR (Edge-to-Edge Navigation Bar)
         ========================================================================= */}
      <footer className="sticky bottom-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E6E1D8] px-4 sm:px-8 py-3.5 shadow-md">
        <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between">
          <span className="text-xs text-[#5C6260]">
            Press <kbd className="px-2 py-0.5 rounded bg-stone-100 border border-stone-300 text-xs font-mono">Esc</kbd> or click Back to Roster
          </span>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-[#232D21] px-6 py-2.5 text-xs font-bold text-[#F7E7C4] hover:bg-[#2F3C2C] transition-colors cursor-pointer shadow-md"
          >
            Back to Roster
          </button>
        </div>
      </footer>

    </div>
  );
}
