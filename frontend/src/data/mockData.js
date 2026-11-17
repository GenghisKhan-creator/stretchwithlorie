// Initial mock data for stretchwithlorie
// YOGA CLASSES, PRIVATE BOOKINGS & SPECIAL EXPERIENCES

export const STUDIO_SCHEDULES = [
  {
    id: "sched-wed",
    day: "Wednesdays",
    time: "7:00 AM",
    fullTime: "07:00 AM - 08:00 AM",
    price: 200,
    label: "Wednesdays 7:00 AM",
    focus: "Morning Stretch & Flow",
    classId: "cls-mass"
  },
  {
    id: "sched-sat",
    day: "Saturdays",
    time: "8:30 AM",
    fullTime: "08:30 AM - 09:45 AM",
    price: 200,
    label: "Saturdays 8:30 AM",
    focus: "Weekend Awakening & Mobility",
    classId: "cls-mass"
  },
  {
    id: "sched-sun",
    day: "Sundays",
    time: "6:00 PM",
    fullTime: "06:00 PM - 07:15 PM",
    price: 200,
    label: "Sundays 6:00 PM",
    focus: "Sunset Grounding & Unwind",
    classId: "cls-mass"
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
    badge: "Group Sessions",
    category: "Yoga Classes",
    instructor: {
      name: "Lorie",
      role: "Founder & Lead Yoga Specialist",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80",
    },
    date: "Wednesdays, Saturdays & Sundays",
    rawDate: "2026-11-18",
    time: "Wed 7am • Sat 8:30am • Sun 6pm",
    duration: "60-75 min",
    price: 200,
    maxCapacity: 15,
    bookedCount: 11, // 4 spots left
    level: "All Levels Welcome",
    intensity: "Moderate / Accessible",
    room: "Studio Sanctuary",
    hasScheduleSlots: true,
    scheduleSlots: [
      { id: "slot-wed", day: "Wednesdays", time: "7:00 AM", label: "Wednesday 7:00 AM" },
      { id: "slot-sat", day: "Saturdays", time: "8:30 AM", label: "Saturday 8:30 AM" },
      { id: "slot-sun", day: "Sundays", time: "6:00 PM", label: "Sunday 6:00 PM" }
    ],
    description: "Join our group yoga sessions designed to improve flexibility, strength, balance and overall well-being. A beautiful opportunity to move, stretch, relax and connect with others.",
    tags: ["Community", "Flexibility", "Strength", "Balance"]
  },
  {
    id: "cls-private",
    title: "Private Yoga Class (One-on-One)",
    badge: "Personalised",
    category: "Private Bookings",
    instructor: {
      name: "Lorie",
      role: "Founder & Lead Yoga Specialist",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80",
    },
    date: "Flexible Scheduling (Daily)",
    rawDate: "2026-11-19",
    time: "By Appointment (Morning / Afternoon / Evening)",
    duration: "60-75 min",
    price: 300, // studio price; client's location is 500
    locationPricing: {
      studio: 300,
      clientLocation: 500
    },
    maxCapacity: 2,
    bookedCount: 0,
    level: "Tailored to You",
    intensity: "Custom",
    room: "Studio Sanctuary or Client's Location",
    isPrivateOneOnOne: true,
    description: "Enjoy a personalised yoga session tailored to your individual needs, goals and flexibility level. Perfect for anyone who prefers personal attention and a more intimate experience.\n\nAvailable in our serene studio (Gh 300) or at your own private location (Gh 500).",
    tags: ["1-on-1", "Custom Goals", "Studio or Home"]
  },
  {
    id: "cls-masterclass",
    title: "Flexibility MASTERCLASS",
    badge: "Intensive Program",
    category: "Masterclass",
    instructor: {
      name: "Lorie",
      role: "Founder & Lead Yoga Specialist",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80",
    },
    date: "Saturday Intensive Session",
    rawDate: "2026-11-21",
    time: "10:30 AM - 12:00 PM",
    duration: "90 min",
    price: 250,
    maxCapacity: 12,
    bookedCount: 9, // 3 spots left
    level: "All Committed Yogis",
    intensity: "Intensive & Focused",
    room: "Studio Sanctuary",
    tagline: "Set your goals. Put in the work. Unlock your flexibility.",
    description: "Set your goals. Put in the work. Unlock your flexibility.\n\nThis is an intensive, goal-driven flexibility class designed for individuals who are serious about improving their flexibility and willing to put in the work.\n\nThrough focused stretches, progressive flexibility training and guided techniques, you will work towards achieving your personal flexibility goals safely and progressively.\n\nThis is not a casual stretching class. It requires commitment, consistency, patience and a willingness to challenge yourself within your body’s limits.\n\nWhether your goal is to achieve your splits, improve your back flexibility or develop greater overall mobility, this class provides a structured environment to work towards it.\n\nCome ready to work. Leave one step closer to your flexibility goals.",
    tags: ["Goal-Driven", "Splits & Backbends", "Progressive Training"]
  },
  {
    id: "cls-thai",
    title: "Thai Yoga Stretches",
    badge: "Therapeutic",
    category: "Therapeutic",
    instructor: {
      name: "Lorie",
      role: "Founder & Lead Yoga Specialist",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80",
    },
    date: "By Appointment (Studio)",
    rawDate: "2026-11-20",
    time: "Flexible Studio Time Slots",
    duration: "75 min",
    price: 400,
    maxCapacity: 2,
    bookedCount: 1, // 1 spot left
    level: "All Levels (Restorative)",
    intensity: "Assisted / Deep Release",
    room: "Studio Sanctuary (Dedicated Props)",
    description: "A therapeutic assisted-stretching experience combining gentle yoga movements, guided stretches and mindful pressure to release tension, improve mobility and promote deep relaxation.",
    tags: ["Assisted Stretches", "Mindful Pressure", "Tension Release"]
  },
  {
    id: "cls-couples",
    title: "Couples Yoga",
    badge: "Experience for Two",
    category: "Special Experiences",
    instructor: {
      name: "Lorie",
      role: "Founder & Lead Yoga Specialist",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80",
    },
    date: "Private Booking for Two",
    rawDate: "2026-11-22",
    time: "Selected by Appointment",
    duration: "75 min",
    price: 500,
    maxCapacity: 4, // 2 couples
    bookedCount: 2,
    level: "All Couples",
    intensity: "Gentle Partner Flow",
    room: "Studio Sanctuary",
    description: "A shared wellness experience for two, encouraging connection, relaxation, balance and bonding through guided yoga movements and partner stretches.",
    tags: ["Two People", "Partner Stretches", "Bonding & Balance"]
  },
  {
    id: "cls-champagne",
    title: "YOGA & CHAMPAGNE",
    badge: "Signature Monthly",
    category: "Special Experiences",
    instructor: {
      name: "Lorie",
      role: "Founder & Lead Yoga Specialist",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80",
    },
    date: "Last Sunday of Every Month",
    rawDate: "2026-11-29",
    time: "04:30 PM - 06:30 PM",
    duration: "120 min",
    price: 350,
    maxCapacity: 20,
    bookedCount: 14, // 6 spots left
    level: "All Levels Celebration",
    intensity: "Uplifting & Relaxing",
    room: "Sanctuary & Terrace Lounge",
    tagline: "A little movement. A little celebration. A beautiful Sunday.",
    description: "A little movement. A little celebration. A beautiful Sunday.\n\nYoga & Champagne is our signature monthly wellness experience, happening on the last Sunday of every month.\n\nIt is an opportunity to slow down, stretch, unwind, connect with beautiful people and enjoy a refreshing yoga experience followed by champagne.\n\nExpect good energy, relaxing music, movement, connection and a touch of indulgence.\n\nWhether you are coming alone, with your partner or with your friends, there is always room for you.\n\nWhen: Last Sunday of every month\nBooking: Advance booking available. Reserve your spot ahead of time.",
    tags: ["Signature Monthly", "Champagne Celebration", "Social Wellness"]
  }
];

export const INITIAL_REGISTRATIONS = [
  {
    id: "reg-101",
    bookingRef: "SWL-8491",
    paystackRef: "pstk_tr_9xa7bf101",
    studentName: "Chloe Dubois",
    email: "chloe.dubois@example.com",
    phone: "024 234 8901",
    classId: "cls-mass",
    className: "Mass Yoga Class (Saturdays 8.30am)",
    classDate: "Saturday, Nov 21, 2026",
    classTime: "08:30 AM - 09:45 AM",
    instructor: "Lorie",
    amount: 200,
    paymentStatus: "Paid",
    paymentGateway: "Paystack",
    paymentMethod: "Paystack (MTN MoMo)",
    locationType: "Studio",
    healthNotes: "Recovering from mild left knee strain; avoids deep pigeon pose without block.",
    registeredAt: "2026-11-16T08:15:00Z",
    formattedTime: "Today at 08:15 AM",
    checkedIn: false
  },
  {
    id: "reg-102",
    bookingRef: "SWL-8492",
    paystackRef: "pstk_tr_4kb2cd204",
    studentName: "Amara Okafor",
    email: "amara.okafor@wellness.io",
    phone: "020 349 1122",
    classId: "cls-champagne",
    className: "YOGA & CHAMPAGNE",
    classDate: "Sunday, Nov 29, 2026 (Last Sunday)",
    classTime: "04:30 PM - 06:30 PM",
    instructor: "Lorie",
    amount: 350,
    paymentStatus: "Paid",
    paymentGateway: "Paystack",
    paymentMethod: "Paystack (Telecel Cash)",
    locationType: "Studio",
    healthNotes: "None. Excited for the champagne social!",
    registeredAt: "2026-11-16T08:42:00Z",
    formattedTime: "Today at 08:42 AM",
    checkedIn: true
  },
  {
    id: "reg-103",
    bookingRef: "SWL-8493",
    paystackRef: "pstk_tr_7mn9gh309",
    studentName: "Nana Kwame Asante",
    email: "kwame.asante@ghmail.com",
    phone: "024 902 4411",
    classId: "cls-masterclass",
    className: "Flexibility MASTERCLASS",
    classDate: "Saturday, Nov 21, 2026",
    classTime: "10:30 AM - 12:00 PM",
    instructor: "Lorie",
    amount: 250,
    paymentStatus: "Paid",
    paymentGateway: "Paystack",
    paymentMethod: "Paystack (MTN MoMo)",
    locationType: "Studio",
    healthNotes: "Goal is to unlock middle splits and open tight shoulders.",
    registeredAt: "2026-11-16T07:20:00Z",
    formattedTime: "Today at 07:20 AM",
    checkedIn: false
  },
  {
    id: "reg-104",
    bookingRef: "SWL-8494",
    paystackRef: "pstk_tr_1jk5pq412",
    studentName: "Priya & Daniel Mensah",
    email: "priya.mensah@global.org",
    phone: "026 671 8890",
    classId: "cls-couples",
    className: "Couples Yoga",
    classDate: "Sunday, Nov 22, 2026",
    classTime: "05:00 PM - 06:15 PM",
    instructor: "Lorie",
    amount: 500,
    paymentStatus: "Paid",
    paymentGateway: "Paystack",
    paymentMethod: "Paystack (Card)",
    locationType: "Studio",
    healthNotes: "Anniversary celebration session. Request gentle partner stretches.",
    registeredAt: "2026-11-15T18:30:00Z",
    formattedTime: "Yesterday at 06:30 PM",
    checkedIn: false
  },
  {
    id: "reg-105",
    bookingRef: "SWL-8495",
    paystackRef: "pstk_tr_8uv3wx551",
    studentName: "Kofi Boateng",
    email: "kofi.b@techventures.gh",
    phone: "024 812 9904",
    classId: "cls-private",
    className: "Private Yoga Class (One-on-One) - Client's Location",
    classDate: "Thursday, Nov 19, 2026",
    classTime: "06:00 PM - 07:15 PM",
    instructor: "Lorie",
    amount: 500,
    paymentStatus: "Paid",
    paymentGateway: "Paystack",
    paymentMethod: "Paystack (MTN MoMo)",
    locationType: "Client Location (Airport Residential)",
    healthNotes: "Chronic lower back stiffness from desk work.",
    registeredAt: "2026-11-15T16:10:00Z",
    formattedTime: "Yesterday at 04:10 PM",
    checkedIn: true
  },
  {
    id: "reg-106",
    bookingRef: "SWL-8496",
    paystackRef: "pstk_tr_3ab8ef672",
    studentName: "Esi Sutherland",
    email: "esi.sutherland@accraart.com",
    phone: "054 438 7712",
    classId: "cls-thai",
    className: "Thai Yoga Stretches (Studio)",
    classDate: "Friday, Nov 20, 2026",
    classTime: "04:00 PM - 05:15 PM",
    instructor: "Lorie",
    amount: 400,
    paymentStatus: "Paid",
    paymentGateway: "Paystack",
    paymentMethod: "Paystack (AirtelTigo)",
    locationType: "Studio",
    healthNotes: "Assisted mobility for hips and thoracic spine release.",
    registeredAt: "2026-11-15T14:05:00Z",
    formattedTime: "Yesterday at 02:05 PM",
    checkedIn: false
  },
  {
    id: "reg-107",
    bookingRef: "SWL-8497",
    paystackRef: "pstk_tr_6cd4gh890",
    studentName: "Abena Darko",
    email: "adarko@legonlaw.com",
    phone: "024 765 4321",
    classId: "cls-mass",
    className: "Mass Yoga Class (Wednesdays 7am)",
    classDate: "Wednesday, Nov 18, 2026",
    classTime: "07:00 AM - 08:00 AM",
    instructor: "Lorie",
    amount: 200,
    paymentStatus: "Paid",
    paymentGateway: "Paystack",
    paymentMethod: "Paystack (MTN MoMo)",
    locationType: "Studio",
    healthNotes: "Morning practitioner. Looking forward to Wednesday flow.",
    registeredAt: "2026-11-15T11:40:00Z",
    formattedTime: "Yesterday at 11:40 AM",
    checkedIn: false
  }
];

export const INSTRUCTORS_LIST = [
  { name: "Lorie", role: "Founder & Lead Yoga Specialist" },
  { name: "Guest Teacher", role: "Certified Visiting Practitioner" }
];