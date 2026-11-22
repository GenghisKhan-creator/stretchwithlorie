// Initial mock data for stretchwithlorie
// YOGA CLASSES, PRIVATE BOOKINGS & SPECIAL EXPERIENCES
import massYogaImg from '../assets/mass_yoga_class.jpg';
import privateYogaImg from '../assets/private_yoga_class.jpg';
import flexibilityMasterclassImg from '../assets/flexibility_masterclass.jpg';
import thaiYogaStretchesImg from '../assets/thai_yoga_stretches.jpg';
import couplesYogaImg from '../assets/couples_yoga.jpg';
import yogaChampagneImg from '../assets/yoga_champagne.jpg';
import lorieAvatarImg from '../assets/lorie_avatar.jpg';

export const DEFAULT_INSTRUCTOR_AVATAR = lorieAvatarImg;

export const STUDIO_SCHEDULES = [
  {
    id: "sched-wed",
    day: "Wednesdays",
    time: "7:00 AM",
    fullTime: "07:00 AM - 08:00 AM",
    price: 200,
    label: "Wednesdays 7:00 AM",
    focus: "Morning Stretch & Flow",
    classId: "cls-mass",
    maxCapacity: 15,
    bookedCount: 0,
    spotsLeft: 15,
    isFull: false
  },
  {
    id: "sched-sat",
    day: "Saturdays",
    time: "8:30 AM",
    fullTime: "08:30 AM - 09:30 AM",
    price: 200,
    label: "Saturdays 8:30 AM",
    focus: "Weekend Awakening & Mobility",
    classId: "cls-mass",
    maxCapacity: 15,
    bookedCount: 0,
    spotsLeft: 15,
    isFull: false
  },
  {
    id: "sched-sun",
    day: "Sundays",
    time: "6:00 PM",
    fullTime: "06:00 PM - 07:00 PM",
    price: 200,
    label: "Sundays 6:00 PM",
    focus: "Sunset Grounding & Unwind",
    classId: "cls-mass",
    maxCapacity: 15,
    bookedCount: 0,
    spotsLeft: 15,
    isFull: false
  }
];

export const SPECIAL_OCCASIONS = [
  { id: "birthdays", title: "Birthdays", icon: "🎂", description: "Celebrate life and health with private movement & celebratory refreshments." },
  { id: "bachelorette", title: "Bachelorette Parties", icon: "💍", description: "A joyful pre-wedding yoga flow with mats, music, and bubbles." },
  { id: "bridal-showers", title: "Bridal Showers", icon: "👰", description: "Nourishing, relaxing movements tailored for the bride and her circle." },
  { id: "girls-wellness", title: "Girls’ Wellness Days", icon: "🌸", description: "Dedicated self-care, deep stretching, herbal teas, and sisterhood bonding." },
  { id: "anniversaries", title: "Anniversaries", icon: "🥂", description: "Intimate couples movement and mindful connection to mark your milestone." },
  { id: "couples-celebrations", title: "Couples’ Celebrations", icon: "✨", description: "Shared balance, guided partner stretches, and romantic ambiance." },
  { id: "wellness-brunches", title: "Private Wellness Brunches", icon: "🥑", description: "Gentle morning flow followed by healthy catering and socializing." },
  { id: "corporate-wellness", title: "Corporate Wellness Events", icon: "🌿", description: "Desk-worker mobility, team de-stress sessions, and mindful breathing." },
  { id: "friendship-gatherings", title: "Friendship Gatherings", icon: "💛", description: "Reconnect, unwind together, and create lasting mindful memories." },
  { id: "mini-retreats", title: "Mini Retreats", icon: "🧘‍♀️", description: "Half-day curated immersive wellness experiences in our studio or venue." },
  { id: "special-group", title: "Special Group Celebrations", icon: "🎉", description: "Custom group sizes, music playlists, and tailored yoga flows." }
];

export const BOUTIQUE_ITEMS = [
  {
    id: "item-socks",
    name: "Yoga Socks",
    tagline: "Studio Grip & Alignment",
    price: 60,
    description: "Non-slip silicone grip socks designed for safety, balance, and barefoot feel during dynamic flows and deep stretches.",
    badge: "In Studio"
  },
  {
    id: "item-mats",
    name: "Mats for Home Practice",
    tagline: "Eco-Friendly Dense Cushion",
    price: 350,
    description: "Premium high-density, non-slip textured yoga mats providing supportive joint cushioning for home sessions.",
    badge: "Bestseller"
  },
  {
    id: "item-wears",
    name: "Yoga Wears",
    tagline: "Breathable Seamless Sets",
    price: 280,
    description: "Ultra-soft, moisture-wicking stretch tops, bras, and high-waist leggings designed for effortless mobility and comfort.",
    badge: "New Arrival"
  },
  {
    id: "item-props",
    name: "Yoga Props",
    tagline: "Blocks, Bolsters & Straps",
    price: 180,
    description: "Eco cork support blocks, cotton stretching straps, and restorative bolsters to help you safely deepen every pose.",
    badge: "Essentials"
  }
];

export const INITIAL_CLASSES = [
  {
    id: "cls-mass",
    title: "Mass Yoga Class",
    image: massYogaImg,
    imagePosition: 'object-[center_35%]',
    badge: "Group Sessions",
    category: "Yoga Classes",
    instructor: {
      name: "Lorie",
      role: "Founder & Lead Yoga Specialist",
      avatar: lorieAvatarImg,
    },
    date: "Wednesdays, Saturdays & Sundays",
    rawDate: "2026-11-18",
    time: "Wed 7am • Sat 8:30am • Sun 6pm",
    duration: "60 min",
    price: 200,
    maxCapacity: 45,
    bookedCount: 0,
    level: "All Levels Welcome",
    intensity: "Moderate / Accessible",
    room: "Studio Sanctuary",
    isPassEligible: true,
    hasScheduleSlots: true,
    scheduleSlots: [
      {
        id: "slot-wed",
        day: "Wednesdays",
        time: "7:00 AM",
        label: "Wednesday 7:00 AM",
        focus: "Morning Stretch & Flow",
        maxCapacity: 15,
        bookedCount: 0,
        spotsLeft: 15,
        isFull: false
      },
      {
        id: "slot-sat",
        day: "Saturdays",
        time: "8:30 AM",
        label: "Saturday 8:30 AM",
        focus: "Weekend Awakening & Mobility",
        maxCapacity: 15,
        bookedCount: 0,
        spotsLeft: 15,
        isFull: false
      },
      {
        id: "slot-sun",
        day: "Sundays",
        time: "6:00 PM",
        label: "Sunday 6:00 PM",
        focus: "Sunset Grounding & Unwind",
        maxCapacity: 15,
        bookedCount: 0,
        spotsLeft: 15,
        isFull: false
      }
    ],
    description: "Join our group yoga sessions designed to improve flexibility, strength, balance and overall well-being. A beautiful opportunity to move, stretch, relax and connect with others.",
    tags: ["Community", "Flexibility", "Strength", "Balance"]
  },
  {
    id: "cls-private",
    title: "Private Yoga Class (One-on-One)",
    image: privateYogaImg,
    imagePosition: 'object-[center_25%]',
    badge: "Personalised",
    category: "Private Bookings",
    instructor: {
      name: "Lorie",
      role: "Founder & Lead Yoga Specialist",
      avatar: lorieAvatarImg,
    },
    date: "Flexible Scheduling (Daily)",
    rawDate: "2026-11-19",
    time: "By Appointment (Morning / Afternoon / Evening)",
    duration: "60 min",
    price: 300, // studio price; client's location is 500
    locationPricing: {
      studio: 300,
      clientLocation: 500
    },
    maxCapacity: 6,
    bookedCount: 0,
    level: "Tailored to You",
    intensity: "Custom",
    room: "Studio Sanctuary or Client's Location",
    isPrivateOneOnOne: true,
    isPassEligible: false,
    hasSessionOptions: true,
    sessionOptions: [
      { id: "opt-morn", timeWindow: "Morning (7:00 AM - 10:00 AM)", label: "Morning Energy Flow", desc: "Best for early focus & flexibility", spotsLeft: 2, isFull: false },
      { id: "opt-mid", timeWindow: "Midday (11:00 AM - 2:00 PM)", label: "Midday Reset", desc: "Lunchtime de-stress & spinal relief", spotsLeft: 2, isFull: false },
      { id: "opt-eve", timeWindow: "Sunset / Evening (4:00 PM - 7:00 PM)", label: "Evening Restoration", desc: "Wind down & nervous system release", spotsLeft: 2, isFull: false }
    ],
    description: "Enjoy a personalised yoga session tailored to your individual needs, goals and flexibility level. Perfect for anyone who prefers personal attention and a more intimate experience.\n\nAvailable in our serene studio (Gh 300) or at your own private location (Gh 500).",
    tags: ["1-on-1", "Custom Goals", "Studio or Home"]
  },
  {
    id: "cls-masterclass",
    title: "Flexibility MASTERCLASS",
    image: flexibilityMasterclassImg,
    imagePosition: 'object-[center_20%]',
    badge: "Intensive Program",
    category: "Masterclass",
    instructor: {
      name: "Lorie",
      role: "Founder & Lead Yoga Specialist",
      avatar: lorieAvatarImg,
    },
    date: "Saturday Intensive Session",
    rawDate: "2026-11-21",
    time: "10:30 AM - 11:30 AM",
    duration: "60 min",
    price: 250,
    maxCapacity: 36, // across 3 dates
    bookedCount: 0,
    level: "All Committed Yogis",
    intensity: "Intensive & Focused",
    room: "Studio Sanctuary",
    tagline: "Set your goals. Put in the work. Unlock your flexibility.",
    isPassEligible: false,
    hasSessionOptions: true,
    sessionOptions: [
      { id: "mc-sess-1", date: "Saturday, 21 Nov 2026", time: "10:30 AM - 11:30 AM", label: "Saturday, 21 Nov (10:30 AM)", spotsLeft: 12, isFull: false },
      { id: "mc-sess-2", date: "Saturday, 28 Nov 2026", time: "10:30 AM - 11:30 AM", label: "Saturday, 28 Nov (10:30 AM)", spotsLeft: 12, isFull: false },
      { id: "mc-sess-3", date: "Saturday, 5 Dec 2026", time: "10:30 AM - 11:30 AM", label: "Saturday, 5 Dec (10:30 AM)", spotsLeft: 12, isFull: false }
    ],
    description: "Set your goals. Put in the work. Unlock your flexibility.\n\nThis is an intensive, goal-driven flexibility class designed for individuals who are serious about improving their flexibility and willing to put in the work.\n\nThrough focused stretches, progressive flexibility training and guided techniques, you will work towards achieving your personal flexibility goals safely and progressively.\n\nThis is not a casual stretching class. It requires commitment, consistency, patience and a willingness to challenge yourself within your body’s limits.\n\nWhether your goal is to achieve your splits, improve your back flexibility or develop greater overall mobility, this class provides a structured environment to work towards it.\n\nCome ready to work. Leave one step closer to your flexibility goals.",
    tags: ["Goal-Driven", "Splits & Backbends", "Progressive Training"]
  },
  {
    id: "cls-thai",
    title: "Thai Yoga Stretches",
    image: thaiYogaStretchesImg,
    imagePosition: 'object-[center_40%]',
    badge: "Therapeutic",
    category: "Therapeutic",
    instructor: {
      name: "Lorie",
      role: "Founder & Lead Yoga Specialist",
      avatar: lorieAvatarImg,
    },
    date: "By Appointment (Studio)",
    rawDate: "2026-11-20",
    time: "Flexible Studio Time Slots",
    duration: "60 min",
    price: 500,
    maxCapacity: 6,
    bookedCount: 0,
    level: "All Levels (Restorative)",
    intensity: "Assisted / Deep Release",
    room: "Studio Sanctuary (Dedicated Props)",
    isPassEligible: false,
    hasSessionOptions: true,
    sessionOptions: [
      { id: "thai-sess-1", day: "Weekday Morning", time: "09:00 AM - 11:00 AM", label: "Weekday Morning Window", spotsLeft: 2, isFull: false },
      { id: "thai-sess-2", day: "Weekday Afternoon", time: "02:00 PM - 05:00 PM", label: "Weekday Afternoon Window", spotsLeft: 2, isFull: false },
      { id: "thai-sess-3", day: "Weekend Studio Slot", time: "11:30 AM - 01:30 PM", label: "Saturday Studio Slot", spotsLeft: 2, isFull: false }
    ],
    description: "A therapeutic assisted-stretching experience combining gentle yoga movements, guided stretches and mindful pressure to release tension, improve mobility and promote deep relaxation.",
    tags: ["Assisted Stretches", "Mindful Pressure", "Tension Release"]
  },
  {
    id: "cls-couples",
    title: "Couples Yoga",
    image: couplesYogaImg,
    imagePosition: 'object-[center_35%]',
    badge: "Experience for Two",
    category: "Special Experiences",
    instructor: {
      name: "Lorie",
      role: "Founder & Lead Yoga Specialist",
      avatar: lorieAvatarImg,
    },
    date: "Private Booking for Two",
    rawDate: "2026-11-22",
    time: "Selected by Appointment",
    duration: "60 min",
    price: 500,
    maxCapacity: 6,
    bookedCount: 0,
    level: "All Couples",
    intensity: "Gentle Partner Flow",
    room: "Studio Sanctuary",
    isPassEligible: false,
    hasSessionOptions: true,
    sessionOptions: [
      { id: "cpl-sess-1", day: "Friday Date Night", time: "06:00 PM - 07:00 PM", label: "Friday Date Night (6:00 PM)", spotsLeft: 2, isFull: false },
      { id: "cpl-sess-2", day: "Saturday Sunset", time: "05:00 PM - 06:00 PM", label: "Saturday Sunset (5:00 PM)", spotsLeft: 2, isFull: false },
      { id: "cpl-sess-3", day: "Sunday Morning", time: "09:30 AM - 10:30 AM", label: "Sunday Morning (9:30 AM)", spotsLeft: 2, isFull: false }
    ],
    description: "A shared wellness experience for two, encouraging connection, relaxation, balance and bonding through guided yoga movements and partner stretches.",
    tags: ["Two People", "Partner Stretches", "Bonding & Balance"]
  },
  {
    id: "cls-champagne",
    title: "YOGA & CHAMPAGNE",
    image: yogaChampagneImg,
    imagePosition: 'object-[center_25%]',
    badge: "Signature Monthly",
    category: "Special Experiences",
    instructor: {
      name: "Lorie",
      role: "Founder & Lead Yoga Specialist",
      avatar: lorieAvatarImg,
    },
    date: "Last Sunday of Every Month",
    rawDate: "2026-11-29",
    time: "04:30 PM - 05:30 PM",
    duration: "60 min",
    price: 400,
    maxCapacity: 20,
    bookedCount: 0,
    level: "All Levels Celebration",
    intensity: "Uplifting & Relaxing",
    room: "Sanctuary & Terrace Lounge",
    isPassEligible: false,
    tagline: "A little movement. A little celebration. A beautiful Sunday.",
    description: "A little movement. A little celebration. A beautiful Sunday.\n\nYoga & Champagne is our signature monthly wellness experience, happening on the last Sunday of every month.\n\nIt is an opportunity to slow down, stretch, unwind, connect with beautiful people and enjoy a refreshing yoga experience followed by champagne.\n\nExpect good energy, relaxing music, movement, connection and a touch of indulgence.\n\nWhether you are coming alone, with your partner or with your friends, there is always room for you.\n\nWhen: Last Sunday of every month\nBooking: Advance booking available. Reserve your spot ahead of time.",
    tags: ["Signature Monthly", "Champagne Celebration", "Social Wellness"]
  }
];

export const INITIAL_REGISTRATIONS = [];

export const INSTRUCTORS_LIST = [
  { name: "Lorie", role: "Founder & Lead Yoga Specialist" },
  { name: "Guest Teacher", role: "Certified Visiting Practitioner" }
];