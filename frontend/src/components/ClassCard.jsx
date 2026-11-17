import { Calendar, Clock, MapPin, Check, AlertCircle } from 'lucide-react';

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
    badge
  } = yogaClass;

  const spotsLeft = Math.max(0, maxCapacity - bookedCount);
  const isFull = spotsLeft === 0;
  const isLowCapacity = spotsLeft > 0 && spotsLeft <= 3;

  return (
    <div
      onClick={() => {
        if (!isFull) {
          onSelect(yogaClass);
        }
      }}
      className={`group relative flex flex-col justify-between rounded-3xl p-5 sm:p-6 transition-all duration-300 cursor-pointer border w-full max-w-full overflow-hidden ${
        isSelected
          ? 'border-[#7A8B71] bg-[#F1F4EF] shadow-md ring-2 ring-[#7A8B71]/30'
          : isFull
          ? 'border-[#E6E1D8] bg-[#FAF8F5]/60 opacity-70 cursor-not-allowed'
          : 'border-[#E6E1D8] bg-white hover:border-[#C8A253] hover:shadow-lg hover:-translate-y-0.5'
      }`}
    >
      {/* Top row: Category tag & Availability badge */}
      <div className="flex items-center justify-between gap-2 mb-3.5 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="rounded-full bg-[#F1F4EF] border border-[#DDE4DA] px-2.5 py-0.5 text-xs font-semibold text-[#5A6952]">
            {category}
          </span>
          {badge && (
            <span className="rounded-full bg-[#F9F3F4] border border-[#EAD3D5] px-2.5 py-0.5 text-[10px] font-bold text-[#A44A4A]">
              {badge}
            </span>
          )}
          <span className="rounded-full bg-[#FAF6F3] border border-[#E6E1D8] px-2 py-0.5 text-[11px] font-medium text-[#5C6260]">
            {level}
          </span>
        </div>

        {/* Spot availability pill */}
        {isFull ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 border border-stone-300 px-2.5 py-0.5 text-[11px] font-semibold text-[#5C6260]">
            Sold Out
          </span>
        ) : isLowCapacity ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[11px] font-semibold text-[#A44A4A] animate-pulse">
            <AlertCircle className="h-3 w-3 text-[#A44A4A]" />
            Only {spotsLeft} left
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F1F4EF] border border-[#DDE4DA] px-2.5 py-0.5 text-[11px] font-semibold text-[#5A6952]">
            {spotsLeft} spots left
          </span>
        )}
      </div>

      {/* Class Title, Tagline & Description */}
      <div className="mb-4">
        <h3 className="font-serif text-lg font-bold text-[#2B2E31] group-hover:text-[#5A6952] transition-colors sm:text-xl leading-snug">
          {title}
        </h3>
        {tagline && (
          <p className="mt-1 text-xs font-serif italic text-[#A44A4A]">
            "{tagline}"
          </p>
        )}
        <p className="mt-1.5 text-xs sm:text-sm text-[#5C6260] line-clamp-3 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Schedule & Location details box */}
      <div className="space-y-2 rounded-2xl bg-[#FAF6F3] p-3 text-xs text-[#5C6260] mb-4 border border-[#E6E1D8] w-full max-w-full overflow-hidden">
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="h-3.5 w-3.5 text-[#7A8B71] shrink-0" />
          <span className="font-medium text-[#2B2E31] truncate">{date}</span>
        </div>
        
        {/* Time & Duration: Flex wrap so badge NEVER pokes outside */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <Clock className="h-3.5 w-3.5 text-[#7A8B71] shrink-0" />
            <span className="truncate">{time}</span>
          </div>
          <span className="rounded-lg bg-white px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-[#5C6260] border border-[#E6E1D8] shrink-0">
            {duration}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#5C6260] min-w-0">
          <MapPin className="h-3.5 w-3.5 text-[#C8A253] shrink-0" />
          <span className="truncate">{room}</span>
        </div>
      </div>

      {/* Instructor info row */}
      <div className="flex items-center gap-3 pt-1 border-t border-[#EDE8E0] mb-4">
        <img
          src={instructor.avatar}
          alt={instructor.name}
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover ring-2 ring-[#E6E1D8] shrink-0"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[#2B2E31] truncate">
            {instructor.name}
          </p>
          <p className="text-[11px] text-[#5C6260] truncate">
            {instructor.role}
          </p>
        </div>
      </div>

      {/* Bottom Footer: Mobile-Optimized Price & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#EDE8E0] w-full">
        <div className="min-w-0">
          {locationPricing ? (
            <div>
              <span className="text-[10px] text-[#5C6260] uppercase font-semibold block">Pricing</span>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-base font-bold text-[#2B2E31]">
                  GH₵{locationPricing.studio} <span className="text-[10px] font-normal text-[#5C6260]">studio</span>
                </span>
                <span className="text-[#5C6260]">•</span>
                <span className="text-base font-bold text-[#A44A4A]">
                  GH₵{locationPricing.clientLocation} <span className="text-[10px] font-normal text-[#5C6260]">location</span>
                </span>
              </div>
            </div>
          ) : (
            <div>
              <span className="text-[10px] text-[#5C6260] uppercase font-semibold block">Price</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-[#2B2E31]">GH₵{price}</span>
                <span className="text-xs text-[#5C6260]">/ session</span>
              </div>
            </div>
          )}
        </div>

        <div className="w-full sm:w-auto shrink-0">
          {isFull ? (
            <button
              type="button"
              disabled
              className="w-full sm:w-auto rounded-xl bg-gray-100 px-4 py-2.5 text-xs font-medium text-gray-400 cursor-not-allowed text-center"
            >
              Waitlist Only
            </button>
          ) : isSelected ? (
            <div className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-[#5A6952] px-4 py-2.5 text-xs font-semibold text-white shadow-sm text-center">
              <Check className="h-3.5 w-3.5" />
              <span>Selected</span>
            </div>
          ) : (
            <button
              type="button"
              className="w-full sm:w-auto rounded-xl bg-[#A44A4A] hover:bg-[#8C3E3E] text-white px-4 py-2.5 text-xs font-semibold shadow-sm transition-all text-center"
            >
              Select Experience
            </button>
          )}
        </div>
      </div>
    </div>
  );
}