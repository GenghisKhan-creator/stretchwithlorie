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
  const spotsLeft = Math.max(0, maxCapacity - bookedCount);
  const isFull = spotsLeft === 0;
  const isLowCapacity = spotsLeft > 0 && spotsLeft <= 3;

  // Render Card with Full-Bleed Image Background
  if (displayImage) {
    return (
      <div
        onClick={() => {
          if (!isFull) {
            onSelect(yogaClass);
          }
        }}
        className={`group relative flex flex-col justify-between rounded-3xl p-5 sm:p-6 transition-all duration-300 cursor-pointer border w-full max-w-full overflow-hidden text-white min-h-[460px] ${
          isSelected
            ? 'border-[#7A8B71] shadow-2xl ring-4 ring-[#7A8B71]'
            : isFull
            ? 'border-white/20 opacity-70 cursor-not-allowed'
            : 'border-white/20 hover:border-[#C8A253] hover:shadow-2xl hover:-translate-y-1'
        }`}
      >
        {/* Full-bleed background image */}
        <img
          src={displayImage}
          alt={title}
          className={`absolute inset-0 h-full w-full object-cover ${imagePos} transition-transform duration-700 ease-out group-hover:scale-105 select-none`}
        />

        {/* Multi-stage cinematic scrim for maximum legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#181B1C]/95 via-[#232729]/80 to-[#1F2321]/60 transition-opacity" />

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
            <div className="space-y-2 rounded-2xl bg-black/35 backdrop-blur-md p-3 text-xs text-[#EDE8E1] mb-4 border border-white/15 w-full max-w-full overflow-hidden">
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
                    <span className="text-base sm:text-lg font-bold text-white drop-shadow-sm">
                      GH₵{locationPricing.studio} <span className="text-[10px] font-normal text-[#EDE8E1]/80">studio</span>
                    </span>
                    <span className="text-[#EDE8E1]/60">•</span>
                    <span className="text-base sm:text-lg font-bold text-[#EAD3D5] drop-shadow-sm">
                      GH₵{locationPricing.clientLocation} <span className="text-[10px] font-normal text-[#EDE8E1]/80">location</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-[10px] text-[#EDE8E1]/80 uppercase font-semibold block">Price</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white drop-shadow-sm">GH₵{price}</span>
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

  // Standard Card for non-image sessions
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
      <div>
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
          
          {/* Time & Duration */}
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
      </div>

      {/* Bottom Footer */}
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