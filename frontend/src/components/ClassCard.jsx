import { Calendar, Clock, MapPin, Check, AlertCircle } from 'lucide-react';
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

const CLASS_IMAGE_POSITIONS = {
  'cls-mass': 'object-[center_35%]',
  'cls-private': 'object-[center_25%]',
  'cls-masterclass': 'object-[center_20%]',
  'cls-thai': 'object-[center_40%]',
  'cls-couples': 'object-[center_35%]',
  'cls-champagne': 'object-[center_25%]'
};

export default function ClassCard({ yogaClass, isSelected, onSelect }) {
  const {
    title,
    instructor,
    date,
    time,
    duration,
    price,
    maxCapacity,
    bookedCount,
    level,
    room,
    category,
    description,
    tagline,
    locationPricing,
    badge,
    image,
    imagePosition
  } = yogaClass;

  const displayImage = image || CLASS_FALLBACK_IMAGES[yogaClass.id] || null;
  const imagePos = imagePosition || CLASS_IMAGE_POSITIONS[yogaClass.id] || 'object-center';

  // Compute slot-aware or session-option-aware capacities
  let spotsLeft = Math.max(0, maxCapacity - bookedCount);
  let isFull = spotsLeft === 0;
  let slotSummaryText = null;

  if (yogaClass.hasScheduleSlots && yogaClass.scheduleSlots?.length > 0) {
    const openSlots = yogaClass.scheduleSlots.filter((s) => !s.isFull && (s.spotsLeft ?? (s.maxCapacity - s.bookedCount)) > 0);
    const fullSlots = yogaClass.scheduleSlots.filter((s) => s.isFull || (s.spotsLeft ?? (s.maxCapacity - s.bookedCount)) <= 0);
    
    // Total remaining spots across all slots
    const totalSlotsLeft = yogaClass.scheduleSlots.reduce(
      (sum, s) => sum + Math.max(0, s.spotsLeft ?? (s.maxCapacity - s.bookedCount)),
      0
    );
    spotsLeft = totalSlotsLeft;
    // Entire class is only full if ALL slots are full
    isFull = openSlots.length === 0;

    if (fullSlots.length > 0 && openSlots.length > 0) {
      const fullDayNames = fullSlots.map((s) => s.day.replace(/s$/, '')).join(' & ');
      const openDayNames = openSlots.map((s) => s.day.replace(/s$/, '')).join(' & ');
      slotSummaryText = `${fullDayNames} Sold Out • ${openDayNames} Open`;
    }
  } else if (yogaClass.hasSessionOptions && yogaClass.sessionOptions?.length > 0) {
    const openOptions = yogaClass.sessionOptions.filter((opt) => !opt.isFull && (opt.spotsLeft ?? 1) > 0);
    const fullOptions = yogaClass.sessionOptions.filter((opt) => opt.isFull || (opt.spotsLeft ?? 1) <= 0);
    const totalOptsLeft = yogaClass.sessionOptions.reduce((sum, opt) => sum + Math.max(0, opt.spotsLeft ?? 1), 0);
    spotsLeft = totalOptsLeft;
    isFull = openOptions.length === 0;

    if (fullOptions.length > 0 && openOptions.length > 0) {
      slotSummaryText = `${openOptions.length} of ${yogaClass.sessionOptions.length} dates open`;
    }
  }

  const isLowCapacity = spotsLeft > 0 && spotsLeft <= 4;

  // Render Card with Full-Bleed Image Background
  if (displayImage) {
    return (
      <div
        onClick={() => {
          if (!isFull) {
            onSelect(yogaClass);
          }
        }}
        className={`group relative flex flex-col justify-between rounded-3xl p-5 sm:p-6 transition-all duration-300 cursor-pointer border w-full max-w-full overflow-hidden text-white min-h-[460px] bg-gradient-to-br from-[#232D21] via-[#2F3C2C] to-[#1C241B] shadow-xl ${
          isSelected
            ? 'border-[#C8A253] shadow-2xl ring-4 ring-[#C8A253]/60 scale-[1.01]'
            : isFull
            ? 'border-white/15 opacity-65 cursor-not-allowed'
            : 'border-[#C8A253]/35 hover:border-[#C8A253] hover:shadow-2xl hover:-translate-y-1'
        }`}
      >
        {/* Full-bleed background image */}
        <img
          src={displayImage}
          alt={title}
          className={`absolute inset-0 h-full w-full object-cover ${imagePos} transition-transform duration-700 ease-out group-hover:scale-105 select-none`}
        />

        {/* Ambient Gold & Botanical Lighting Sheen */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#C8A253]/15 blur-2xl group-hover:bg-[#C8A253]/25 transition-colors" />
        <div className="pointer-events-none absolute -left-8 -bottom-8 h-36 w-36 rounded-full bg-[#7A8B71]/20 blur-xl" />

        {/* Atmospheric Botanical Green Scrim (signature membership green + clear image visibility) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#161D15]/95 via-[#232D21]/70 to-[#2F3C2C]/35 transition-opacity" />

        {/* Floating Content on top of Image */}
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            {/* Top row: Category tag & Availability badge */}
            <div className="flex items-center justify-between gap-2 mb-3.5 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-2.5 py-0.5 text-xs font-semibold text-white shadow-xs">
                  {category}
                </span>
                {badge && (
                  <span className="rounded-full bg-[#A44A4A] border border-white/25 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                    {badge}
                  </span>
                )}
                <span className="rounded-full bg-black/40 backdrop-blur-md border border-white/20 px-2 py-0.5 text-[11px] font-medium text-[#F7F4EF]">
                  {level}
                </span>
              </div>

              {/* Spot availability pill */}
              {isFull ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-stone-900/80 backdrop-blur-md border border-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-xs">
                  Sold Out
                </span>
              ) : slotSummaryText ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md border border-[#C8A253]/60 px-2.5 py-0.5 text-[11px] font-semibold text-[#F7E7C4] shadow-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C8A253] shrink-0" />
                  <span>{spotsLeft} spots • {slotSummaryText}</span>
                </span>
              ) : isLowCapacity ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-600/90 backdrop-blur-md border border-white/30 px-2.5 py-0.5 text-[11px] font-semibold text-white animate-pulse shadow-xs">
                  <AlertCircle className="h-3 w-3 text-white" />
                  Only {spotsLeft} left
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-xs">
                  {spotsLeft} spots left
                </span>
              )}
            </div>

            {/* Class Title, Tagline & Description */}
            <div className="mb-4">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white group-hover:text-[#F7F4EF] transition-colors leading-snug drop-shadow-sm">
                {title}
              </h3>
              {tagline && (
                <p className="mt-1 text-xs font-serif italic text-[#EAD3D5]">
                  "{tagline}"
                </p>
              )}
              <p className="mt-1.5 text-xs sm:text-sm text-[#F7F4EF]/90 line-clamp-3 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Schedule & Location details box */}
            <div className="space-y-2 rounded-2xl bg-[#182117]/65 backdrop-blur-md p-3 text-xs text-[#EDE8E1] mb-4 border border-[#C8A253]/25 w-full max-w-full overflow-hidden">
              <div className="flex items-center gap-2 min-w-0">
                <Calendar className="h-3.5 w-3.5 text-[#C8A253] shrink-0" />
                <span className="font-medium text-white truncate">{date}</span>
              </div>
              
              {/* Time & Duration */}
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <Clock className="h-3.5 w-3.5 text-[#C8A253] shrink-0" />
                  <span className="truncate text-[#EDE8E1]">{time}</span>
                </div>
                <span className="rounded-lg bg-white/20 backdrop-blur-sm px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-white border border-white/25 shrink-0">
                  {duration}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#EDE8E1] min-w-0">
                <MapPin className="h-3.5 w-3.5 text-[#C8A253] shrink-0" />
                <span className="truncate">{room}</span>
              </div>

              {/* Slot-level capacity indicator pills */}
              {yogaClass.hasScheduleSlots && yogaClass.scheduleSlots?.length > 0 && (
                <div className="pt-2 border-t border-white/15 flex flex-wrap gap-1.5">
                  {yogaClass.scheduleSlots.map((slot) => {
                    const isSlotFull = slot.isFull || (slot.spotsLeft ?? (slot.maxCapacity - slot.bookedCount)) <= 0;
                    const left = slot.spotsLeft ?? (slot.maxCapacity - slot.bookedCount);
                    return (
                      <span
                        key={slot.id}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors ${
                          isSlotFull
                            ? 'bg-black/50 text-white/50 border border-white/10 line-through'
                            : left <= 2
                            ? 'bg-[#C8A253]/25 text-[#F7E7C4] border border-[#C8A253]/40'
                            : 'bg-white/15 text-white border border-white/20'
                        }`}
                        title={isSlotFull ? `${slot.label} is fully booked` : `${slot.label}: ${left} spots available`}
                      >
                        <span>{slot.day.slice(0, 3)} {slot.time}</span>
                        <span className="font-bold">
                          {isSlotFull ? '(Full)' : `(${left} left)`}
                        </span>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Session options indicator pills (e.g. Masterclass dates) */}
              {yogaClass.hasSessionOptions && yogaClass.sessionOptions?.length > 0 && !yogaClass.isPrivateOneOnOne && (
                <div className="pt-2 border-t border-white/15 flex flex-wrap gap-1.5">
                  {yogaClass.sessionOptions.slice(0, 3).map((opt) => {
                    const isOptFull = opt.isFull || (opt.spotsLeft ?? 1) <= 0;
                    const left = opt.spotsLeft ?? 1;
                    return (
                      <span
                        key={opt.id}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium ${
                          isOptFull
                            ? 'bg-black/50 text-white/50 border border-white/10 line-through'
                            : 'bg-white/15 text-white border border-white/20'
                        }`}
                        title={isOptFull ? `${opt.label || opt.date} is fully booked` : `${opt.label || opt.date}: ${left} spots`}
                      >
                        <span className="truncate max-w-[130px]">{opt.label || opt.date}</span>
                        <span className="font-bold">{isOptFull ? '(Full)' : `(${left})`}</span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Instructor info row */}
            <div className="flex items-center gap-3 pt-2 border-t border-white/20 mb-4">
              <img
                src={instructor.avatar}
                alt={instructor.name}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover ring-2 ring-white/40 shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">
                  {instructor.name}
                </p>
                <p className="text-[11px] text-[#EDE8E1]/80 truncate">
                  {instructor.role}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Footer: Price & Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/20 w-full mt-2">
            <div className="min-w-0">
              {locationPricing ? (
                <div>
                  <span className="text-[10px] text-[#EDE8E1]/80 uppercase font-semibold block">Pricing</span>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-base sm:text-lg font-bold font-serif text-[#F7E7C4] drop-shadow-sm">
                      GH₵{locationPricing.studio} <span className="text-[10px] font-sans font-normal text-[#EDE8E1]/80">studio</span>
                    </span>
                    <span className="text-[#EDE8E1]/60">•</span>
                    <span className="text-base sm:text-lg font-bold font-serif text-[#EAD3D5] drop-shadow-sm">
                      GH₵{locationPricing.clientLocation} <span className="text-[10px] font-sans font-normal text-[#EDE8E1]/80">location</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-[10px] text-[#EDE8E1]/80 uppercase font-semibold block">Price</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-serif text-[#F7E7C4] drop-shadow-sm">GH₵{price}</span>
                    <span className="text-xs text-[#EDE8E1]/80">/ session</span>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full sm:w-auto shrink-0">
              {isFull ? (
                <button
                  type="button"
                  disabled
                  className="w-full sm:w-auto rounded-xl bg-white/20 text-white/50 px-4 py-2.5 text-xs font-medium cursor-not-allowed text-center"
                >
                  Sold Out
                </button>
              ) : isSelected ? (
                <div className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-[#5A6952] px-4 py-2.5 text-xs font-semibold text-white shadow-lg border border-white/30 text-center">
                  <Check className="h-3.5 w-3.5" />
                  <span>Selected</span>
                </div>
              ) : (
                <button
                  type="button"
                  className="w-full sm:w-auto rounded-xl bg-[#A44A4A] hover:bg-[#8C3E3E] text-white px-4 py-2.5 text-xs font-semibold shadow-xl border border-white/20 transition-all text-center"
                >
                  Select Experience
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard Card for non-image sessions
  return (
    <div
      onClick={() => {
        if (!isFull) {
          onSelect(yogaClass);
        }
      }}
      className={`group relative flex flex-col justify-between rounded-3xl p-5 sm:p-6 transition-all duration-300 cursor-pointer border w-full max-w-full overflow-hidden text-white bg-gradient-to-br from-[#232D21] via-[#2F3C2C] to-[#1C241B] shadow-xl ${
        isSelected
          ? 'border-[#C8A253] shadow-2xl ring-4 ring-[#C8A253]/60 scale-[1.01]'
          : isFull
          ? 'border-white/15 opacity-65 cursor-not-allowed'
          : 'border-[#C8A253]/35 hover:border-[#C8A253] hover:shadow-2xl hover:-translate-y-1'
      }`}
    >
      {/* Ambient Gold & Botanical Lighting */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#C8A253]/15 blur-2xl group-hover:bg-[#C8A253]/25 transition-colors" />
      <div className="pointer-events-none absolute -left-8 -bottom-8 h-36 w-36 rounded-full bg-[#7A8B71]/20 blur-xl" />

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div>
          {/* Top row: Category tag & Availability badge */}
          <div className="flex items-center justify-between gap-2 mb-3.5 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-2.5 py-0.5 text-xs font-semibold text-white shadow-xs">
                {category}
              </span>
              {badge && (
                <span className="rounded-full bg-[#A44A4A] border border-white/25 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                  {badge}
                </span>
              )}
              <span className="rounded-full bg-[#1C241B]/60 backdrop-blur-md border border-[#C8A253]/30 px-2 py-0.5 text-[11px] font-medium text-[#F7E7C4]">
                {level}
              </span>
            </div>

            {/* Spot availability pill */}
            {isFull ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-stone-900/80 backdrop-blur-md border border-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-xs">
                Sold Out
              </span>
            ) : slotSummaryText ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md border border-[#C8A253]/60 px-2.5 py-0.5 text-[11px] font-semibold text-[#F7E7C4] shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C8A253] shrink-0" />
                <span>{spotsLeft} spots • {slotSummaryText}</span>
              </span>
            ) : isLowCapacity ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-600/90 backdrop-blur-md border border-white/30 px-2.5 py-0.5 text-[11px] font-semibold text-white animate-pulse shadow-xs">
                <AlertCircle className="h-3 w-3 text-white" />
                Only {spotsLeft} left
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-xs">
                {spotsLeft} spots left
              </span>
            )}
          </div>

          {/* Class Title, Tagline & Description */}
          <div className="mb-4">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white group-hover:text-[#F7F4EF] transition-colors leading-snug drop-shadow-sm">
              {title}
            </h3>
            {tagline && (
              <p className="mt-1 text-xs font-serif italic text-[#EAD3D5]">
                &ldquo;{tagline}&rdquo;
              </p>
            )}
            <p className="mt-1.5 text-xs sm:text-sm text-[#F7F4EF]/90 line-clamp-3 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Schedule & Location details box */}
          <div className="space-y-2 rounded-2xl bg-[#182117]/65 backdrop-blur-md p-3 text-xs text-[#EDE8E1] mb-4 border border-[#C8A253]/25 w-full max-w-full overflow-hidden">
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="h-3.5 w-3.5 text-[#C8A253] shrink-0" />
              <span className="font-medium text-white truncate">{date}</span>
            </div>
            
            {/* Time & Duration */}
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <Clock className="h-3.5 w-3.5 text-[#C8A253] shrink-0" />
                <span className="truncate text-[#EDE8E1]">{time}</span>
              </div>
              <span className="rounded-lg bg-white/20 backdrop-blur-sm px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-white border border-white/25 shrink-0">
                {duration}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#EDE8E1] min-w-0">
              <MapPin className="h-3.5 w-3.5 text-[#C8A253] shrink-0" />
              <span className="truncate">{room}</span>
            </div>

            {/* Slot-level capacity indicator pills */}
            {yogaClass.hasScheduleSlots && yogaClass.scheduleSlots?.length > 0 && (
              <div className="pt-2 border-t border-white/15 flex flex-wrap gap-1.5">
                {yogaClass.scheduleSlots.map((slot) => {
                  const isSlotFull = slot.isFull || (slot.spotsLeft ?? (slot.maxCapacity - slot.bookedCount)) <= 0;
                  const left = slot.spotsLeft ?? (slot.maxCapacity - slot.bookedCount);
                  return (
                    <span
                      key={slot.id}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors ${
                        isSlotFull
                          ? 'bg-black/50 text-white/50 border border-white/10 line-through'
                          : left <= 2
                          ? 'bg-[#C8A253]/25 text-[#F7E7C4] border border-[#C8A253]/40'
                          : 'bg-white/15 text-white border border-white/20'
                      }`}
                      title={isSlotFull ? `${slot.label} is fully booked` : `${slot.label}: ${left} spots available`}
                    >
                      <span>{slot.day.slice(0, 3)} {slot.time}</span>
                      <span className="font-bold">
                        {isSlotFull ? '(Full)' : `(${left} left)`}
                      </span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Instructor info row */}
          <div className="flex items-center gap-3 pt-2 border-t border-white/20 mb-4">
            <img
              src={instructor.avatar}
              alt={instructor.name}
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover ring-2 ring-white/40 shrink-0"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {instructor.name}
              </p>
              <p className="text-[11px] text-[#EDE8E1]/80 truncate">
                {instructor.role}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Footer: Price & Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/20 w-full mt-2">
          <div className="min-w-0">
            {locationPricing ? (
              <div>
                <span className="text-[10px] text-[#EDE8E1]/80 uppercase font-semibold block">Pricing</span>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-base sm:text-lg font-bold font-serif text-[#F7E7C4] drop-shadow-sm">
                    GH₵{locationPricing.studio} <span className="text-[10px] font-sans font-normal text-[#EDE8E1]/80">studio</span>
                  </span>
                  <span className="text-[#EDE8E1]/60">•</span>
                  <span className="text-base sm:text-lg font-bold font-serif text-[#EAD3D5] drop-shadow-sm">
                    GH₵{locationPricing.clientLocation} <span className="text-[10px] font-sans font-normal text-[#EDE8E1]/80">location</span>
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <span className="text-[10px] text-[#EDE8E1]/80 uppercase font-semibold block">Price</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-serif text-[#F7E7C4] drop-shadow-sm">GH₵{price}</span>
                  <span className="text-xs text-[#EDE8E1]/80">/ session</span>
                </div>
              </div>
            )}
          </div>

          <div className="w-full sm:w-auto shrink-0">
            {isFull ? (
              <button
                type="button"
                disabled
                className="w-full sm:w-auto rounded-xl bg-white/20 text-white/50 px-4 py-2.5 text-xs font-medium cursor-not-allowed text-center"
              >
                Waitlist Only
              </button>
            ) : isSelected ? (
              <div className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-[#5A6952] px-4 py-2.5 text-xs font-semibold text-white shadow-lg border border-white/30 text-center">
                <Check className="h-3.5 w-3.5" />
                <span>Selected</span>
              </div>
            ) : (
              <button
                type="button"
                className="w-full sm:w-auto rounded-xl bg-[#A44A4A] hover:bg-[#8C3E3E] text-white px-4 py-2.5 text-xs font-semibold shadow-xl border border-white/20 transition-all text-center"
              >
                Select Experience
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}