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
    description
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
      className={`group relative flex flex-col justify-between rounded-3xl p-5 sm:p-6 transition-all duration-300 cursor-pointer border ${
        isSelected
          ? 'border-[#774929] bg-[#FAF6F2] shadow-md ring-2 ring-[#774929]/30'
          : isFull
          ? 'border-[#E0DFDB] bg-[#FAF8F5]/60 opacity-70 cursor-not-allowed'
          : 'border-[#E0DFDB] bg-white hover:border-[#C9B6A5] hover:shadow-lg hover:-translate-y-0.5'
      }`}
    >
      {/* Top row: Category tag & Availability badge */}
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="rounded-full bg-[#F5EBE1] border border-[#E8D7C8] px-2.5 py-1 text-xs font-semibold text-[#774929]">
            {category}
          </span>
          <span className="rounded-full bg-[#FAF8F5] border border-[#E0DFDB] px-2.5 py-1 text-[11px] font-medium text-[#88796B]">
            {level}
          </span>
        </div>

        {/* Spot availability pill */}
        {isFull ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 border border-stone-300 px-2.5 py-0.5 text-xs font-semibold text-[#88796B]">
            Sold Out
          </span>
        ) : isLowCapacity ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-900 animate-pulse">
            <AlertCircle className="h-3 w-3 text-amber-700" />
            Only {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F5EBE1] border border-[#E8D7C8] px-2.5 py-0.5 text-xs font-semibold text-[#774929]">
            {spotsLeft} spots left
          </span>
        )}
      </div>

      {/* Class Title & Description */}
      <div className="mb-4">
        <h3 className="font-serif text-lg font-bold text-[#201410] group-hover:text-[#774929] transition-colors sm:text-xl">
          {title}
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-[#88796B] line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Schedule & Location details */}
      <div className="space-y-2 rounded-2xl bg-[#FAF8F5] p-3.5 text-xs text-[#88796B] mb-4 border border-[#E0DFDB]">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-[#774929] shrink-0" />
          <span className="font-medium text-[#201410]">{date}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-[#774929] shrink-0" />
            <span>{time}</span>
          </div>
          <span className="rounded-lg bg-white px-2 py-0.5 text-[11px] font-medium text-[#88796B] border border-[#E0DFDB]">
            {duration}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#88796B]">
          <MapPin className="h-3.5 w-3.5 text-[#C9B6A5] shrink-0" />
          <span className="truncate">{room}</span>
        </div>
      </div>

      {/* Instructor info row */}
      <div className="flex items-center gap-3 pt-1 border-t border-[#EAE6DF] mb-4">
        <img
          src={instructor.avatar}
          alt={instructor.name}
          className="h-9 w-9 rounded-full object-cover ring-2 ring-[#E0DFDB]"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#201410] truncate">
            {instructor.name}
          </p>
          <p className="text-[11px] text-[#88796B] truncate">
            {instructor.role}
          </p>
        </div>
      </div>

      {/* Bottom Footer: Price & Selection Status */}
      <div className="flex items-center justify-between pt-2 border-t border-[#EAE6DF]">
        <div>
          <span className="text-xs text-[#88796B]">Price</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-[#201410]">GH₵{price}</span>
            <span className="text-xs text-[#88796B]">/ class</span>
          </div>
        </div>

        <div>
          {isFull ? (
            <button
              type="button"
              disabled
              className="rounded-xl bg-gray-100 px-3.5 py-2 text-xs font-medium text-gray-400 cursor-not-allowed"
            >
              Waitlist Only
            </button>
          ) : isSelected ? (
            <div className="flex items-center gap-1.5 rounded-xl bg-[#774929] px-3.5 py-2 text-xs font-semibold text-white shadow-sm">
              <Check className="h-3.5 w-3.5" />
              <span>Selected</span>
            </div>
          ) : (
            <button
              type="button"
              className="rounded-xl border border-[#E0DFDB] bg-[#F5EBE1]/70 px-3.5 py-2 text-xs font-semibold text-[#774929] transition-colors group-hover:bg-[#774929] group-hover:text-white"
            >
              Select Class
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
