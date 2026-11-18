import { Gift, Calendar, ArrowRight, ShieldCheck, Check } from 'lucide-react';

export default function WellnessPassHeroCard({ onOpenGiftModal }) {
  return (
    <div className="relative group w-full max-w-full overflow-hidden rounded-3xl border border-[#C8A253]/50 bg-gradient-to-br from-[#232D21] via-[#2F3C2C] to-[#1C241B] p-5 sm:p-6 text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-[#C8A253]/80">

      {/* Decorative Gold & Botanical Ambient Glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#C8A253]/20 blur-2xl group-hover:bg-[#C8A253]/30 transition-colors" />
      <div className="pointer-events-none absolute -left-10 -bottom-10 h-36 w-36 rounded-full bg-[#7A8B71]/25 blur-xl" />

      {/* Subtle Metallic Card Header */}
      <div className="relative z-10 flex items-center justify-between pb-3.5 border-b border-white/15">
        <div className="flex items-center gap-2">
          {/* <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C8A253]/25 border border-[#C8A253]/60 text-[#F7E7C4]">
            <Sparkles className="h-4 w-4 text-[#C8A253]" />
          </div> */}
          <div>
            <span className="font-serif tracking-widest text-[11px] sm:text-xs uppercase font-bold text-[#F7F4EF]">
              Stretch with Lorie
            </span>
            <span className="block text-[9px] text-[#C8A253] font-medium tracking-wide">
              EXCLUSIVE MEMBERSHIP & GIFTING
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 rounded-full bg-[#C8A253] px-2.5 py-0.5 text-[10px] font-bold text-[#2B2E31] shadow-xs">
          {/* <Sparkles className="h-3 w-3" /> */}
          <span>SPECIAL OFFER</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="relative z-10 mt-4 space-y-3">
        <div>
          <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#F7F4EF] leading-snug">
            Wellness Pass & Gift Cards
          </h3>
          <p className="text-xs text-[#E6E1D8]/85 mt-1 leading-relaxed">
            Invest in consistent vitality or gift a mindful stretch experience to someone you care about.
          </p>
        </div>

        {/* Perks Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-[#E6E1D8]/90">
          <div className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-[#C8A253] shrink-0" />
            <span>2, 4 or 8 Classes / mo (Save to GH₵ 250)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-[#C8A253] shrink-0" />
            <span>Digital Gift Cards (From GH₵ 200)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-[#C8A253] shrink-0" />
            <span>Complimentary Manduka Mat & Towel</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-[#C8A253] shrink-0" />
            <span>Post-Class Herbal Tea Ritual</span>
          </div>
        </div>

        {/* Pricing / Flexibility Tag */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
          <div>
            <span className="text-[10px] uppercase text-[#C8A253] block font-semibold">Passes start at</span>
            <span className="font-serif text-base sm:text-lg font-bold text-[#F7F4EF]">
              GH₵ 380 <span className="text-xs font-normal text-[#E6E1D8]/70">/ month</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-[#E6E1D8]/75">
            <ShieldCheck className="h-3.5 w-3.5 text-[#7A8B71]" />
            <span>Pause or Cancel Anytime</span>
          </div>
        </div>

        {/* Two CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => onOpenGiftModal('subscription')}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#A44A4A] hover:bg-[#8f3e3e] text-white py-2.5 px-3 text-xs font-bold transition-all shadow-md hover:scale-[1.01]"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Buy Subscription Pass</span>
            <ArrowRight className="h-3 w-3" />
          </button>

          <button
            type="button"
            onClick={() => onOpenGiftModal('gift')}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#F7F4EF] border border-[#C8A253]/50 py-2.5 px-3 text-xs font-bold transition-all hover:border-[#C8A253]"
          >
            <Gift className="h-3.5 w-3.5 text-[#C8A253]" />
            <span>Gift to a Friend</span>
          </button>
        </div>
      </div>

    </div>
  );
}
