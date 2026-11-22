import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      }
    : {
        user: process.env.PG_USER || 'postgres',
        host: process.env.PG_HOST || 'localhost',
        database: process.env.PG_DATABASE?.trim() || 'stretchwithlorie',
        password: process.env.PG_PASSWORD,
        port: parseInt(process.env.PG_PORT || '5432', 10)
      }
);

const INITIAL_CLASSES = [
  {
    id: "cls-mass",
    title: "Mass Yoga Class",
    badge: "Group Sessions",
    category: "Yoga Classes",
    instructor_name: "Lorie",
    instructor_role: "Founder & Lead Yoga Specialist",
    instructor_avatar: "/images/lorie_avatar.jpg",
    date_text: "Wednesdays, Saturdays & Sundays",
    time_text: "Wed 7am • Sat 8:30am • Sun 6pm",
    duration: "60 min",
    price: 200,
    max_capacity: 45,
    booked_count: 39,
    level: "All Levels Welcome",
    room: "Studio Sanctuary",
    tagline: null,
    has_schedule_slots: true,
    schedule_slots: [
      {
        id: "slot-wed",
        day: "Wednesdays",
        time: "7:00 AM",
        label: "Wednesday 7:00 AM",
        focus: "Morning Stretch & Flow",
        maxCapacity: 15,
        bookedCount: 11,
        spotsLeft: 4,
        isFull: false
      },
      {
        id: "slot-sat",
        day: "Saturdays",
        time: "8:30 AM",
        label: "Saturday 8:30 AM",
        focus: "Weekend Awakening & Mobility",
        maxCapacity: 15,
        bookedCount: 13,
        spotsLeft: 2,
        isFull: false
      },
      {
        id: "slot-sun",
        day: "Sundays",
        time: "6:00 PM",
        label: "Sunday 6:00 PM",
        focus: "Sunset Grounding & Unwind",
        maxCapacity: 15,
        bookedCount: 15,
        spotsLeft: 0,
        isFull: true
      }
    ],
    has_session_options: false,
    session_options: null,
    is_private_one_on_one: false,
    location_pricing: null,
    image_url: "/images/mass_yoga_class.jpg",
    image_position: "object-[center_35%]",
    description: "Join our group yoga sessions designed to improve flexibility, strength, balance and overall well-being. A beautiful opportunity to move, stretch, relax and connect with others."
  },
  {
    id: "cls-private",
    title: "Private Yoga Class (One-on-One)",
    badge: "Personalised",
    category: "Private Bookings",
    instructor_name: "Lorie",
    instructor_role: "Founder & Lead Yoga Specialist",
    instructor_avatar: "/images/lorie_avatar.jpg",
    date_text: "Flexible Scheduling (Daily)",
    time_text: "By Appointment (Morning / Afternoon / Evening)",
    duration: "60 min",
    price: 300,
    location_pricing: { studio: 300, clientLocation: 500 },
    max_capacity: 6,
    booked_count: 2,
    level: "Tailored to You",
    room: "Studio Sanctuary or Client's Location",
    tagline: null,
    has_schedule_slots: false,
    schedule_slots: null,
    has_session_options: true,
    session_options: [
      { id: "opt-morn", timeWindow: "Morning (7:00 AM - 10:00 AM)", label: "Morning Energy Flow", desc: "Best for early focus & flexibility", spotsLeft: 2, isFull: false },
      { id: "opt-mid", timeWindow: "Midday (11:00 AM - 2:00 PM)", label: "Midday Reset", desc: "Lunchtime de-stress & spinal relief", spotsLeft: 2, isFull: false },
      { id: "opt-eve", timeWindow: "Sunset / Evening (4:00 PM - 7:00 PM)", label: "Evening Restoration", desc: "Wind down & nervous system release", spotsLeft: 0, isFull: true }
    ],
    is_private_one_on_one: true,
    image_url: "/images/private_yoga_class.jpg",
    image_position: "object-[center_25%]",
    description: "Enjoy a personalised yoga session tailored to your individual needs, goals and flexibility level. Perfect for anyone who prefers personal attention and a more intimate experience.\n\nAvailable in our serene studio (Gh 300) or at your own private location (Gh 500)."
  },
  {
    id: "cls-masterclass",
    title: "Flexibility MASTERCLASS",
    badge: "Intensive Program",
    category: "Masterclass",
    instructor_name: "Lorie",
    instructor_role: "Founder & Lead Yoga Specialist",
    instructor_avatar: "/images/lorie_avatar.jpg",
    date_text: "Saturday Intensive Session",
    time_text: "10:30 AM - 11:30 AM",
    duration: "60 min",
    price: 250,
    location_pricing: null,
    max_capacity: 36,
    booked_count: 23,
    level: "All Committed Yogis",
    room: "Studio Sanctuary",
    tagline: "Set your goals. Put in the work. Unlock your flexibility.",
    has_schedule_slots: false,
    schedule_slots: null,
    has_session_options: true,
    session_options: [
      { id: "mc-sess-1", date: "Saturday, 21 Nov 2026", time: "10:30 AM - 11:30 AM", label: "Saturday, 21 Nov (10:30 AM)", spotsLeft: 3, isFull: false },
      { id: "mc-sess-2", date: "Saturday, 28 Nov 2026", time: "10:30 AM - 11:30 AM", label: "Saturday, 28 Nov (10:30 AM)", spotsLeft: 8, isFull: false },
      { id: "mc-sess-3", date: "Saturday, 5 Dec 2026", time: "10:30 AM - 11:30 AM", label: "Saturday, 5 Dec (10:30 AM)", spotsLeft: 0, isFull: true }
    ],
    is_private_one_on_one: false,
    image_url: "/images/flexibility_masterclass.jpg",
    image_position: "object-[center_20%]",
    description: "Set your goals. Put in the work. Unlock your flexibility.\n\nThis is an intensive, goal-driven flexibility class designed for individuals who are serious about improving their flexibility and willing to put in the work."
  },
  {
    id: "cls-thai",
    title: "Thai Yoga Stretches",
    badge: "Therapeutic",
    category: "Therapeutic",
    instructor_name: "Lorie",
    instructor_role: "Founder & Lead Yoga Specialist",
    instructor_avatar: "/images/lorie_avatar.jpg",
    date_text: "By Appointment (Studio)",
    time_text: "Flexible Studio Time Slots",
    duration: "60 min",
    price: 500,
    location_pricing: null,
    max_capacity: 6,
    booked_count: 3,
    level: "All Levels (Restorative)",
    room: "Studio Sanctuary (Dedicated Props)",
    tagline: null,
    has_schedule_slots: false,
    schedule_slots: null,
    has_session_options: true,
    session_options: [
      { id: "thai-sess-1", day: "Weekday Morning", time: "09:00 AM - 11:00 AM", label: "Weekday Morning Window", spotsLeft: 1, isFull: false },
      { id: "thai-sess-2", day: "Weekday Afternoon", time: "02:00 PM - 05:00 PM", label: "Weekday Afternoon Window", spotsLeft: 2, isFull: false },
      { id: "thai-sess-3", day: "Weekend Studio Slot", time: "11:30 AM - 01:30 PM", label: "Saturday Studio Slot", spotsLeft: 0, isFull: true }
    ],
    is_private_one_on_one: false,
    image_url: "/images/thai_yoga_stretches.jpg",
    image_position: "object-[center_40%]",
    description: "A therapeutic assisted-stretching experience combining gentle yoga movements, guided stretches and mindful pressure to release tension, improve mobility and promote deep relaxation."
  },
  {
    id: "cls-couples",
    title: "Couples Yoga",
    badge: "Experience for Two",
    category: "Special Experiences",
    instructor_name: "Lorie",
    instructor_role: "Founder & Lead Yoga Specialist",
    instructor_avatar: "/images/lorie_avatar.jpg",
    date_text: "Private Booking for Two",
    time_text: "Selected by Appointment",
    duration: "60 min",
    price: 500,
    location_pricing: null,
    max_capacity: 6,
    booked_count: 2,
    level: "All Couples",
    room: "Studio Sanctuary",
    tagline: null,
    has_schedule_slots: false,
    schedule_slots: null,
    has_session_options: true,
    session_options: [
      { id: "cpl-sess-1", day: "Friday Date Night", time: "06:00 PM - 07:00 PM", label: "Friday Date Night (6:00 PM)", spotsLeft: 1, isFull: false },
      { id: "cpl-sess-2", day: "Saturday Sunset", time: "05:00 PM - 06:00 PM", label: "Saturday Sunset (5:00 PM)", spotsLeft: 2, isFull: false },
      { id: "cpl-sess-3", day: "Sunday Morning", time: "09:30 AM - 10:30 AM", label: "Sunday Morning (9:30 AM)", spotsLeft: 2, isFull: false }
    ],
    is_private_one_on_one: false,
    image_url: "/images/couples_yoga.jpg",
    image_position: "object-[center_35%]",
    description: "A shared wellness experience for two, encouraging connection, relaxation, balance and bonding through guided yoga movements and partner stretches."
  },
  {
    id: "cls-champagne",
    title: "YOGA & CHAMPAGNE",
    badge: "Signature Monthly",
    category: "Special Experiences",
    instructor_name: "Lorie",
    instructor_role: "Founder & Lead Yoga Specialist",
    instructor_avatar: "/images/lorie_avatar.jpg",
    date_text: "Last Sunday of Every Month",
    time_text: "04:30 PM - 05:30 PM",
    duration: "60 min",
    price: 400,
    location_pricing: null,
    max_capacity: 20,
    booked_count: 14,
    level: "All Levels Celebration",
    room: "Sanctuary & Terrace Lounge",
    tagline: "A little movement. A little celebration. A beautiful Sunday.",
    has_schedule_slots: false,
    schedule_slots: null,
    has_session_options: false,
    session_options: null,
    is_private_one_on_one: false,
    image_url: "/images/yoga_champagne.jpg",
    image_position: "object-[center_25%]",
    description: "A little movement. A little celebration. A beautiful Sunday.\n\nYoga & Champagne is our signature monthly wellness experience, happening on the last Sunday of every month."
  }
];

const INITIAL_VIDEOS = [
  {
    id: 'vid-full-spine',
    title: 'Full-Body Morning Spine & Neck Decompression Flow',
    creator_name: 'Lorie',
    full_duration_minutes: 24,
    full_duration_label: '24 mins',
    preview_duration_secs: 30,
    price_ghs: 30.00,
    category: 'Spine & Posture',
    thumbnail: '/images/flexibility_masterclass.jpg',
    video_url: '',
    description: 'Watch the first 30 seconds free! Unlock the complete 24-minute guided cervical, thoracic, and lower-back decompression class.',
    views: 120,
    purchases_count: 42
  },
  {
    id: 'vid-full-hips',
    title: 'Deep Hip Flexor, Psoas & Split Mobility Masterclass',
    creator_name: 'Lorie',
    full_duration_minutes: 32,
    full_duration_label: '32 mins',
    preview_duration_secs: 30,
    price_ghs: 30.00,
    category: 'Hip Mobility',
    thumbnail: '/images/thai_yoga_stretches.jpg',
    video_url: '',
    description: 'Try the 30-second preview on the site. Unlock the full 32-minute deep hip opening and hamstring flexibility session.',
    views: 95,
    purchases_count: 38
  },
  {
    id: 'vid-full-desk',
    title: 'Evening Shoulder, Upper Back & Tension Headache Relief',
    creator_name: 'Lorie',
    full_duration_minutes: 18,
    full_duration_label: '18 mins',
    preview_duration_secs: 30,
    price_ghs: 30.00,
    category: 'Desk & Shoulders',
    thumbnail: '/images/private_yoga_class.jpg',
    video_url: '',
    description: 'Preview 30 seconds free. Purchase to access the complete 18-minute upper-body melt designed to erase desk tension.',
    views: 80,
    purchases_count: 27
  },
  {
    id: 'vid-full-sleep',
    title: 'Bedtime Nervous System Reset & Restorative Yin Stretch',
    creator_name: 'Lorie',
    full_duration_minutes: 28,
    full_duration_label: '28 mins',
    preview_duration_secs: 30,
    price_ghs: 30.00,
    category: 'Breath & Calm',
    thumbnail: '/images/couples_yoga.jpg',
    video_url: '',
    description: 'Watch the 30-second preview free, then unlock the full 28-minute bedtime yin stretch and 4-7-8 breathwork ritual.',
    views: 160,
    purchases_count: 54
  }
];

const INITIAL_REGISTRATIONS = [
  {
    id: "reg-101",
    booking_ref: "SWL-8491",
    paystack_ref: "pstk_tr_9xa7bf101",
    student_name: "Chloe Dubois",
    email: "chloe.dubois@example.com",
    phone: "024 234 8901",
    class_id: "cls-mass",
    class_name: "Mass Yoga Class (Saturdays 8.30am)",
    class_date: "Saturday, Nov 21, 2026",
    class_time: "08:30 AM - 09:45 AM",
    slot_id: "slot-sat",
    slot_label: "Saturday 8:30 AM",
    location_type: "Studio Sanctuary",
    client_address: "",
    instructor: "Lorie",
    amount: 200,
    payment_status: "Paid",
    payment_gateway: "Paystack",
    payment_method: "Paystack (MTN MoMo)",
    health_notes: "Recovering from mild left knee strain; avoids deep pigeon pose without block.",
    checked_in: false
  },
  {
    id: "reg-102",
    booking_ref: "SWL-8492",
    paystack_ref: "pstk_tr_4kb2cd204",
    student_name: "Amara Okafor",
    email: "amara.okafor@wellness.io",
    phone: "020 349 1122",
    class_id: "cls-champagne",
    class_name: "YOGA & CHAMPAGNE",
    class_date: "Sunday, Nov 29, 2026 (Last Sunday)",
    class_time: "04:30 PM - 06:30 PM",
    slot_id: null,
    slot_label: null,
    location_type: "Studio Sanctuary",
    client_address: "",
    instructor: "Lorie",
    amount: 400,
    payment_status: "Paid",
    payment_gateway: "Paystack",
    payment_method: "Paystack (Telecel Cash)",
    health_notes: "None. Excited for the champagne social!",
    checked_in: true
  },
  {
    id: "reg-103",
    booking_ref: "SWL-8493",
    paystack_ref: "pstk_tr_7mn9gh309",
    student_name: "Nana Kwame Asante",
    email: "kwame.asante@ghmail.com",
    phone: "024 902 4411",
    class_id: "cls-masterclass",
    class_name: "Flexibility MASTERCLASS",
    class_date: "Saturday, Nov 21, 2026",
    class_time: "10:30 AM - 12:00 PM",
    slot_id: null,
    slot_label: "Saturday, 21 Nov (10:30 AM)",
    location_type: "Studio Sanctuary",
    client_address: "",
    instructor: "Lorie",
    amount: 250,
    payment_status: "Paid",
    payment_gateway: "Paystack",
    payment_method: "Paystack (MTN MoMo)",
    health_notes: "Goal is to unlock middle splits and open tight shoulders.",
    checked_in: false
  }
];

async function seed() {
  console.log('[Seed] Seeding database with initial classes, videos, and registrations...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Seed Classes
    for (const cls of INITIAL_CLASSES) {
      await client.query(
        `INSERT INTO classes (
          id, title, badge, category, instructor_name, instructor_role, instructor_avatar,
          date_text, time_text, duration, price, location_pricing, max_capacity, booked_count,
          level, room, description, tagline, has_schedule_slots, schedule_slots,
          has_session_options, session_options, is_private_one_on_one, image_url, image_position
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          badge = EXCLUDED.badge,
          category = EXCLUDED.category,
          date_text = EXCLUDED.date_text,
          time_text = EXCLUDED.time_text,
          duration = EXCLUDED.duration,
          price = EXCLUDED.price,
          location_pricing = EXCLUDED.location_pricing,
          max_capacity = EXCLUDED.max_capacity,
          booked_count = EXCLUDED.booked_count,
          level = EXCLUDED.level,
          room = EXCLUDED.room,
          description = EXCLUDED.description,
          tagline = EXCLUDED.tagline,
          has_schedule_slots = EXCLUDED.has_schedule_slots,
          schedule_slots = EXCLUDED.schedule_slots,
          has_session_options = EXCLUDED.has_session_options,
          session_options = EXCLUDED.session_options,
          is_private_one_on_one = EXCLUDED.is_private_one_on_one,
          image_url = EXCLUDED.image_url,
          image_position = EXCLUDED.image_position,
          updated_at = CURRENT_TIMESTAMP`,
        [
          cls.id,
          cls.title,
          cls.badge,
          cls.category,
          cls.instructor_name,
          cls.instructor_role,
          cls.instructor_avatar,
          cls.date_text,
          cls.time_text,
          cls.duration,
          cls.price,
          cls.location_pricing ? JSON.stringify(cls.location_pricing) : null,
          cls.max_capacity,
          cls.booked_count,
          cls.level,
          cls.room,
          cls.description,
          cls.tagline,
          cls.has_schedule_slots,
          cls.schedule_slots ? JSON.stringify(cls.schedule_slots) : null,
          cls.has_session_options,
          cls.session_options ? JSON.stringify(cls.session_options) : null,
          cls.is_private_one_on_one,
          cls.image_url,
          cls.image_position
        ]
      );
    }
    console.log(`[Seed] Seeded ${INITIAL_CLASSES.length} yoga classes.`);

    // 2. Seed Videos
    for (const vid of INITIAL_VIDEOS) {
      await client.query(
        `INSERT INTO videos (
          id, title, creator_name, full_duration_minutes, full_duration_label,
          preview_duration_secs, price_ghs, category, thumbnail, video_url, description,
          views, purchases_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          price_ghs = EXCLUDED.price_ghs,
          category = EXCLUDED.category,
          description = EXCLUDED.description`,
        [
          vid.id,
          vid.title,
          vid.creator_name,
          vid.full_duration_minutes,
          vid.full_duration_label,
          vid.preview_duration_secs,
          vid.price_ghs,
          vid.category,
          vid.thumbnail,
          vid.video_url,
          vid.description,
          vid.views,
          vid.purchases_count
        ]
      );
    }
    console.log(`[Seed] Seeded ${INITIAL_VIDEOS.length} guided stretch videos.`);

    // 3. Seed Registrations
    for (const reg of INITIAL_REGISTRATIONS) {
      await client.query(
        `INSERT INTO registrations (
          id, booking_ref, paystack_ref, student_name, email, phone, class_id,
          class_name, class_date, class_time, slot_id, slot_label, location_type,
          client_address, instructor, amount, payment_status, payment_gateway,
          payment_method, health_notes, checked_in
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        ON CONFLICT (id) DO NOTHING`,
        [
          reg.id,
          reg.booking_ref,
          reg.paystack_ref,
          reg.student_name,
          reg.email,
          reg.phone,
          reg.class_id,
          reg.class_name,
          reg.class_date,
          reg.class_time,
          reg.slot_id,
          reg.slot_label,
          reg.location_type,
          reg.client_address,
          reg.instructor,
          reg.amount,
          reg.payment_status,
          reg.payment_gateway,
          reg.payment_method,
          reg.health_notes,
          reg.checked_in
        ]
      );
    }
    console.log(`[Seed] Seeded ${INITIAL_REGISTRATIONS.length} sample registrations.`);

    // 4. Seed Initial Creator Collaborations & Discount Codes
    const INITIAL_REFERRALS = [
      {
        id: 'ref-ama15',
        code: 'AMA15',
        creator_name: 'Ama Serwaa',
        creator_handle: '@amaserwaa',
        creator_phone: '024 510 8821',
        discount_type: 'percentage',
        discount_value: 15,
        commission_percent: 10,
        max_uses: 50,
        uses_count: 4,
        total_revenue_generated: 680,
        total_commission_earned: 68,
        notes: 'TikTok & Instagram Wellness Creator Collaboration'
      },
      {
        id: 'ref-lorievip',
        code: 'LORIEVIP',
        creator_name: 'Sanctuary VIP Launch',
        creator_handle: '@stretchwithlorie',
        creator_phone: '',
        discount_type: 'fixed',
        discount_value: 30,
        commission_percent: 0,
        max_uses: 100,
        uses_count: 7,
        total_revenue_generated: 1190,
        total_commission_earned: 0,
        notes: 'Founding Members GH₵ 30 Off Discount Code'
      }
    ];

    for (const ref of INITIAL_REFERRALS) {
      await client.query(
        `INSERT INTO referral_codes (
          id, code, creator_name, creator_handle, creator_phone,
          discount_type, discount_value, commission_percent, max_uses,
          uses_count, total_revenue_generated, total_commission_earned, notes, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true)
        ON CONFLICT (code) DO NOTHING`,
        [
          ref.id,
          ref.code,
          ref.creator_name,
          ref.creator_handle,
          ref.creator_phone,
          ref.discount_type,
          ref.discount_value,
          ref.commission_percent,
          ref.max_uses,
          ref.uses_count,
          ref.total_revenue_generated,
          ref.total_commission_earned,
          ref.notes
        ]
      );
    }
    console.log(`[Seed] Seeded ${INITIAL_REFERRALS.length} creator referral & discount codes.`);

    // 5. Seed Initial Event Inquiries
    const INITIAL_INQUIRIES = [
      {
        id: 'evt-bridal-101',
        occasion_type: 'Bridal Showers',
        full_name: 'Akua Mensah',
        phone: '024 492 8812',
        email: 'akua.mensah@example.com',
        guest_count: 10,
        preferred_date: 'Saturday, Dec 12, 2026',
        location_preference: 'Studio Sanctuary',
        notes: 'Pre-wedding champagne stretch for bride & bridesmaids. Please include relaxation herbal teas.',
        status: 'pending'
      },
      {
        id: 'evt-corp-102',
        occasion_type: 'Corporate Wellness Events',
        full_name: 'Kofi Asare',
        phone: '020 819 4431',
        email: 'k.asare@fintechgh.com',
        guest_count: 25,
        preferred_date: 'Friday, Dec 18, 2026',
        location_preference: 'Client Location (Cantonments HQ)',
        notes: 'End-of-year executive desk posture & breathwork mobility session for tech team.',
        status: 'contacted'
      },
      {
        id: 'evt-bday-103',
        occasion_type: 'Birthdays',
        full_name: 'Nana Adwoa',
        phone: '055 310 9940',
        email: 'nana.adwoa@gmail.com',
        guest_count: 8,
        preferred_date: 'Sunday, Nov 29, 2026',
        location_preference: 'Studio Sanctuary',
        notes: '30th birthday mindful movement and private sunset yoga flow.',
        status: 'confirmed'
      }
    ];

    for (const inq of INITIAL_INQUIRIES) {
      await client.query(
        `INSERT INTO event_inquiries (
          id, occasion_type, full_name, phone, email, guest_count,
          preferred_date, location_preference, notes, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING`,
        [
          inq.id,
          inq.occasion_type,
          inq.full_name,
          inq.phone,
          inq.email,
          inq.guest_count,
          inq.preferred_date,
          inq.location_preference,
          inq.notes,
          inq.status
        ]
      );
    }
    console.log(`[Seed] Seeded ${INITIAL_INQUIRIES.length} sample event inquiries.`);

    // 6. Seed Initial Gift Cards
    const INITIAL_GIFT_CARDS = [
      {
        id: 'gift-101',
        code: 'SWL-GIFT-98B2-A1',
        recipient_name: 'Efua Hanson',
        recipient_phone: '024 883 1190',
        recipient_email: 'efua.hanson@gmail.com',
        buyer_name: 'Kojo Hanson',
        buyer_phone: '020 551 2284',
        buyer_email: 'kojo.hanson@gmail.com',
        amount: 300,
        personal_note: 'Happy Birthday my love! Enjoy this serene sanctuary time with Lorie.',
        status: 'active',
        paystack_ref: 'pstk_gift_98b2a1_live'
      },
      {
        id: 'gift-102',
        code: 'SWL-GIFT-7C14-B2',
        recipient_name: 'Sandra Appiah',
        recipient_phone: '055 994 3321',
        recipient_email: 'sandra.appiah@yahoo.com',
        buyer_name: 'Michael Appiah',
        buyer_phone: '024 330 1198',
        buyer_email: 'michael.appiah@gmail.com',
        amount: 200,
        personal_note: 'Congratulations on completing your master thesis! Breathe & stretch.',
        status: 'redeemed',
        paystack_ref: 'pstk_gift_7c14b2_live'
      },
      {
        id: 'gift-103',
        code: 'SWL-GIFT-5D88-C3',
        recipient_name: 'Naa Koshie',
        recipient_phone: '027 114 9023',
        recipient_email: 'naa.koshie@outlook.com',
        buyer_name: 'David Boateng',
        buyer_phone: '020 772 3341',
        buyer_email: 'david.b@gmail.com',
        amount: 500,
        personal_note: 'For a wonderful sister. Take time out of your busy schedule for wellness.',
        status: 'active',
        paystack_ref: 'pstk_gift_5d88c3_live'
      }
    ];

    for (const card of INITIAL_GIFT_CARDS) {
      await client.query(
        `INSERT INTO gift_cards (
          id, code, recipient_name, recipient_phone, recipient_email,
          buyer_name, buyer_phone, buyer_email, amount, personal_note, status, paystack_ref
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (code) DO NOTHING`,
        [
          card.id,
          card.code,
          card.recipient_name,
          card.recipient_phone,
          card.recipient_email,
          card.buyer_name,
          card.buyer_phone,
          card.buyer_email,
          card.amount,
          card.personal_note,
          card.status,
          card.paystack_ref
        ]
      );
    }
    console.log(`[Seed] Seeded ${INITIAL_GIFT_CARDS.length} sample gift cards.`);

    await client.query('COMMIT');
    console.log('[Seed] Database seeding completed successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Seed Error]: Seeding failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
