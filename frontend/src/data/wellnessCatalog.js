// Default Wellness Membership Plans & Mindful Gift Card Presets
// Shared between the public WellnessGiftCardModal, Admin Dashboard editor, and API service.

export const DEFAULT_SUBSCRIPTION_PLANS = [
  {
    id: 'plan-starter',
    name: 'The Seed Flow',
    subtitle: 'Awaken Consistency',
    badge: 'Gentle Start',
    tierCode: 'SEED-02',
    isPopular: false,
    classesPerMonth: 2,
    price: 380,
    savings: 'Save GH₵ 20',
    description: 'Bi-weekly mindful practice to gently loosen tight joints and restore nervous system calm.',
    themeColor: '#7A8B71',
    cardGradient: 'from-[#223020] via-[#31452E] to-[#192318]',
    borderAccent: 'border-[#96AD8B]/60',
    badgeStyle: 'bg-[#E5ECE2] text-[#232D21]',
    cardPerks: [
      '2 Studio Flows / Mo',
      'Manduka Pro Mat',
      'Herbal Tea Ritual',
      '35-Day Flex Grace'
    ],
    features: [
      '2 Studio Group Classes per month (GH₵ 190/class)',
      'Valid for all weekly studio group classes',
      'Complimentary Manduka Pro mat & blocks',
      'Fresh organic herbal tea ritual after flow',
      '35-day flexibility grace period',
      'Flexible reschedule up to 24h prior'
    ]
  },
  {
    id: 'plan-sanctuary',
    name: 'The Lotus Sanctuary',
    subtitle: 'Deepen Mobility & Calm',
    badge: 'Most Cherished Practice',
    tierCode: 'LOTUS-04',
    isPopular: true,
    classesPerMonth: 4,
    price: 700,
    savings: 'Save GH₵ 100',
    description: 'Weekly rhythmic practice for lasting flexibility, spine decompression & emotional grounding.',
    themeColor: '#C8A253',
    cardGradient: 'from-[#1C251B] via-[#2B3829] to-[#131A12]',
    borderAccent: 'border-[#C8A253]/75',
    badgeStyle: 'bg-gradient-to-r from-[#E6C981] to-[#C8A253] text-[#1C231A]',
    cardPerks: [
      '4 Studio Flows / Mo',
      'Priority Mat Spot',
      '10% Off Private Stretch',
      'Quarterly Guest Pass',
      '1 Class Rollover'
    ],
    features: [
      '4 Studio Classes per month (GH₵ 175/class)',
      'Priority Sanctuary mat spot reservation',
      'Complimentary mat & organic herbal tea ritual',
      '10% off any 1-on-1 Private Stretch session',
      '1 Free guest pass every quarter',
      'Roll over up to 1 unused class to next month'
    ]
  },
  {
    id: 'plan-vip',
    name: 'The Prana Immersion',
    subtitle: 'Full Body Transformation',
    badge: 'Ultimate Sanctuary Access',
    tierCode: 'PRANA-VIP',
    isPopular: false,
    classesPerMonth: 8,
    price: 1350,
    savings: 'Save GH₵ 250',
    description: 'Complete studio immersion + dedicated 1-on-1 private assisted stretch session with Lorie.',
    themeColor: '#A44A4A',
    cardGradient: 'from-[#2D1D1E] via-[#232D21] to-[#141A13]',
    borderAccent: 'border-[#E2B86B]/85',
    badgeStyle: 'bg-gradient-to-r from-[#A44A4A] via-[#B85757] to-[#C8A253] text-white',
    cardPerks: [
      '8 Studio Flows / Mo',
      '1 Free Private 1-on-1',
      'Monthly Free Guest',
      'Front-Row Mat + Towel',
      'VIP WhatsApp Concierge'
    ],
    features: [
      '8 Studio Classes per month',
      '1 Private 1-on-1 Assisted Stretch session included',
      'Bring 1 guest free each month',
      'Personal postural & alignment consultation with Lorie',
      'Reserved front-row mat & complimentary studio towel',
      'VIP WhatsApp Concierge booking'
    ]
  }
];

export const DEFAULT_GIFT_PRESETS = [
  { amount: 200, label: 'Single Flow', desc: '1 Group Studio Session', icon: '🌱' },
  { amount: 380, label: 'Starter Duet', desc: '2 Group Studio Sessions', icon: '🌿' },
  { amount: 700, label: 'Lotus Month', desc: '4 Classes + Tea Ritual', icon: '🪷' },
  { amount: 850, label: 'Private Sanctuary', desc: '1-on-1 Private Stretch', icon: '✨' },
  { amount: 1350, label: 'VIP Immersion', desc: '8 Classes + 1 Private', icon: '👑' }
];

export const DEFAULT_CUSTOM_AMOUNT_PICKS = [250, 500, 1000, 1500, 2000];
export const DEFAULT_MIN_CUSTOM_GIFT = 100;

export const DEFAULT_WELLNESS_CATALOG = {
  subscriptionPlans: DEFAULT_SUBSCRIPTION_PLANS,
  giftPresets: DEFAULT_GIFT_PRESETS,
  customAmountPicks: DEFAULT_CUSTOM_AMOUNT_PICKS,
  minCustomGiftAmount: DEFAULT_MIN_CUSTOM_GIFT
};
