import logoFullImg from '../assets/logo_full.png';
import logoMarkImg from '../assets/logo.png';

/**
 * BrandLogo Component
 * Accurately replicates the official Stretch With Lorie logo placement:
 * [Yoga Icon] | Stretch (in vibrant green)
 *             | withlorie (in deep charcoal)
 *             | YOGA & FITNESS (spaced uppercase)
 */
export default function BrandLogo({
  variant = 'image', // 'image' | 'hybrid' | 'mark'
  size = 'md',       // 'sm' | 'md' | 'lg'
  className = ''
}) {
  if (variant === 'image') {
    const heightClasses = {
      sm: 'h-8 sm:h-9',
      md: 'h-10 sm:h-11',
      lg: 'h-14 sm:h-16'
    };

    return (
      <div className={`flex items-center ${className}`}>
        <img
          src={logoFullImg}
          alt="Stretch With Lorie - Yoga & Fitness"
          className={`${heightClasses[size] || heightClasses.md} w-auto object-contain select-none`}
        />
      </div>
    );
  }

  // Hybrid component using the extracted Prata / Didone font stack with exact typography
  const markSizes = {
    sm: 'h-8 w-6',
    md: 'h-10 w-7',
    lg: 'h-14 w-10'
  };

  const stretchSizes = {
    sm: 'text-base leading-none',
    md: 'text-xl leading-none',
    lg: 'text-3xl leading-none'
  };

  const withlorieSizes = {
    sm: 'text-base leading-none -mt-0.5',
    md: 'text-xl leading-none -mt-0.5',
    lg: 'text-3xl leading-none -mt-1'
  };

  const subtitleSizes = {
    sm: 'text-[8px] tracking-[0.24em] mt-0.5',
    md: 'text-[9.5px] tracking-[0.26em] mt-1',
    lg: 'text-xs tracking-[0.28em] mt-1.5'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Yoga Figure Icon */}
      <img
        src={logoMarkImg}
        alt="Stretch With Lorie"
        className={`${markSizes[size] || markSizes.md} object-contain shrink-0`}
      />

      {/* Stacked Typography */}
      <div className="flex flex-col">
        {/* Line 1: Stretch (Vibrant Lime-Olive Green) */}
        <span
          className={`font-['Prata','Playfair_Display',serif] font-normal text-[#8DBF15] ${stretchSizes[size]}`}
          style={{ letterSpacing: '-0.01em' }}
        >
          Stretch
        </span>

        {/* Line 2: withlorie (Deep Charcoal) */}
        <span
          className={`font-['Prata','Playfair_Display',serif] font-normal text-[#1C1F24] ${withlorieSizes[size]}`}
          style={{ letterSpacing: '-0.01em' }}
        >
          withlorie
        </span>

        {/* Line 3: YOGA & FITNESS (Wide Spaced Caps) */}
        <span
          className={`font-sans font-semibold uppercase text-[#1C1F24] ${subtitleSizes[size]}`}
        >
          YOGA & FITNESS
        </span>
      </div>
    </div>
  );
}
