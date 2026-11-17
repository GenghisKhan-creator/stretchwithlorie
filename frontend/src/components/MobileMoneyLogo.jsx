import mtnLogo from '../assets/logo_mtn_momo.png';
import telecelLogo from '../assets/logo_telecel_cash.png';
import atLogo from '../assets/logo_at_money.png';

/**
 * MobileMoneyLogo Component
 * Renders the actual official logos provided by the user:
 * 1. MTN Mobile Money (Yellow SIM card with phone & GH₵ cash note)
 * 2. Telecel Cash (Red circle 't' telecel | cash fanned notes with green arrow)
 * 3. AT Money (Red 'a' and navy 't' with 'Money' in navy)
 */
export default function MobileMoneyLogo({
  network = 'MTN',
  variant = 'badge', // 'badge' | 'image' | 'inline'
  size = 'md',       // 'xs' | 'sm' | 'md' | 'lg'
  className = ''
}) {
  const norm = (network || '').toUpperCase();
  const isMTN = norm.includes('MTN');
  const isTelecel = norm.includes('TELECEL') || norm.includes('VODA');
  // Default to AT if not MTN and not Telecel
  const isAT = !isMTN && !isTelecel;

  // Selected logo & meta
  let src = mtnLogo;
  let alt = 'MTN Mobile Money';
  let bgClass = 'bg-[#FECA05]';

  if (isTelecel) {
    src = telecelLogo;
    alt = 'Telecel Cash';
    bgClass = 'bg-white';
  } else if (isAT) {
    src = atLogo;
    alt = 'AT Money';
    bgClass = 'bg-white';
  }

  // Sizing styles
  const sizeMap = {
    xs: {
      badge: 'h-6 px-1.5 py-0.5',
      img: 'h-4 w-auto max-w-full'
    },
    sm: {
      badge: 'h-8 px-2 py-1',
      img: 'h-6 w-auto max-w-full'
    },
    md: {
      badge: 'h-10 px-2.5 py-1',
      img: 'h-8 w-auto max-w-full'
    },
    lg: {
      badge: 'h-14 px-3 py-1.5',
      img: 'h-11 w-auto max-w-full'
    }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (variant === 'image') {
    return (
      <img
        src={src}
        alt={alt}
        className={`object-contain select-none ${currentSize.img} ${className}`}
        loading="lazy"
      />
    );
  }

  // Framed badge variant
  return (
    <div
      className={`inline-flex items-center justify-center rounded-lg border border-[#E0DFDB] shadow-2xs overflow-hidden ${bgClass} ${currentSize.badge} ${className}`}
      title={alt}
    >
      <img
        src={src}
        alt={alt}
        className={`object-contain select-none ${currentSize.img}`}
        loading="lazy"
      />
    </div>
  );
}
