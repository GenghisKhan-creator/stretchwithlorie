-- Schema for Stretch With Lorie Yoga Platform

-- 1. Classes & Special Experiences
CREATE TABLE IF NOT EXISTS classes (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  badge VARCHAR(100),
  category VARCHAR(100) NOT NULL,
  instructor_name VARCHAR(100) NOT NULL DEFAULT 'Lorie',
  instructor_role VARCHAR(150) NOT NULL DEFAULT 'Founder & Lead Yoga Specialist',
  instructor_avatar TEXT,
  date_text VARCHAR(150) NOT NULL,
  time_text VARCHAR(100) NOT NULL,
  duration VARCHAR(50) NOT NULL DEFAULT '60 min',
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  location_pricing JSONB DEFAULT NULL,
  max_capacity INT NOT NULL DEFAULT 15,
  booked_count INT NOT NULL DEFAULT 0,
  level VARCHAR(100) NOT NULL DEFAULT 'All Levels',
  room VARCHAR(150) NOT NULL DEFAULT 'Studio Sanctuary',
  description TEXT NOT NULL,
  tagline VARCHAR(255),
  has_schedule_slots BOOLEAN DEFAULT FALSE,
  schedule_slots JSONB DEFAULT NULL,
  has_session_options BOOLEAN DEFAULT FALSE,
  session_options JSONB DEFAULT NULL,
  is_private_one_on_one BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  image_position VARCHAR(100) DEFAULT 'object-center',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Registrations / Bookings
CREATE TABLE IF NOT EXISTS registrations (
  id VARCHAR(60) PRIMARY KEY,
  booking_ref VARCHAR(50) UNIQUE NOT NULL,
  paystack_ref VARCHAR(100),
  student_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  class_id VARCHAR(50) REFERENCES classes(id) ON DELETE SET NULL,
  class_name VARCHAR(255) NOT NULL,
  class_date VARCHAR(150),
  class_time VARCHAR(100),
  slot_id VARCHAR(50),
  slot_label VARCHAR(150),
  location_type VARCHAR(100) DEFAULT 'Studio Sanctuary',
  client_address TEXT,
  instructor VARCHAR(100) DEFAULT 'Lorie',
  amount NUMERIC(10, 2) NOT NULL,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'Paid',
  payment_gateway VARCHAR(50) DEFAULT 'Paystack',
  payment_method VARCHAR(100) DEFAULT 'Paystack (MTN MoMo)',
  health_notes TEXT DEFAULT 'None reported',
  promo_code VARCHAR(50) DEFAULT NULL,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  creator_name VARCHAR(150) DEFAULT NULL,
  checked_in BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure columns exist on existing registrations table
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS promo_code VARCHAR(50) DEFAULT NULL;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS creator_name VARCHAR(150) DEFAULT NULL;

-- 3. Guided Stretch & Yoga Videos Library
CREATE TABLE IF NOT EXISTS videos (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  creator_name VARCHAR(100) NOT NULL DEFAULT 'Lorie',
  full_duration_minutes INT NOT NULL DEFAULT 20,
  full_duration_label VARCHAR(50) NOT NULL DEFAULT '20 mins',
  preview_duration_secs INT NOT NULL DEFAULT 30,
  price_ghs NUMERIC(10, 2) NOT NULL DEFAULT 30.00,
  category VARCHAR(100) NOT NULL DEFAULT 'Spine & Posture',
  video_url TEXT,
  thumbnail TEXT,
  description TEXT,
  views INT DEFAULT 0,
  purchases_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Video Purchases / Unlocks
CREATE TABLE IF NOT EXISTS video_purchases (
  id VARCHAR(60) PRIMARY KEY,
  video_id VARCHAR(50) REFERENCES videos(id) ON DELETE CASCADE,
  buyer_name VARCHAR(150) NOT NULL,
  buyer_phone VARCHAR(50) NOT NULL,
  amount_paid NUMERIC(10, 2) NOT NULL,
  momo_network VARCHAR(50) DEFAULT 'MTN',
  paystack_ref VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Custom Private Events & Celebrations Inquiries
CREATE TABLE IF NOT EXISTS event_inquiries (
  id VARCHAR(60) PRIMARY KEY,
  occasion_type VARCHAR(100) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(150) NOT NULL,
  guest_count INT DEFAULT 1,
  preferred_date VARCHAR(100),
  location_preference VARCHAR(150),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Wellness Gift Cards
CREATE TABLE IF NOT EXISTS gift_cards (
  id VARCHAR(60) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  recipient_name VARCHAR(150) NOT NULL,
  recipient_phone VARCHAR(50),
  recipient_email VARCHAR(150),
  buyer_name VARCHAR(150) NOT NULL,
  buyer_phone VARCHAR(50) NOT NULL,
  buyer_email VARCHAR(150),
  amount NUMERIC(10, 2) NOT NULL,
  personal_note TEXT,
  paystack_ref VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Creator Collaborations, Referrals & Discount Codes
CREATE TABLE IF NOT EXISTS referral_codes (
  id VARCHAR(60) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  creator_name VARCHAR(150) NOT NULL,
  creator_handle VARCHAR(100) DEFAULT '',
  creator_phone VARCHAR(50) DEFAULT '',
  discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC(10, 2) NOT NULL DEFAULT 10,
  commission_percent NUMERIC(5, 2) NOT NULL DEFAULT 10,
  max_uses INT DEFAULT NULL,
  uses_count INT NOT NULL DEFAULT 0,
  total_revenue_generated NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_commission_earned NUMERIC(10, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_registrations_class_id ON registrations(class_id);
CREATE INDEX IF NOT EXISTS idx_registrations_booking_ref ON registrations(booking_ref);
CREATE INDEX IF NOT EXISTS idx_video_purchases_video_id ON video_purchases(video_id);
CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
