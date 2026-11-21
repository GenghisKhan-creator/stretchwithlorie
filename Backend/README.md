# Stretch With Lorie — Express.js & PostgreSQL Backend

Production-ready backend API service for **Stretch With Lorie** yoga class bookings, guided stretch video vault, wellness gift cards, custom celebration inquiries, and instructor analytics.

---

## 🛠️ Tech Stack & Architecture

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: PostgreSQL (via `pg` connection pool with automatic ACID transactions)
- **Security**: Cryptographically signed HMAC tokens & password-protected admin routes
- **Environment**: `dotenv` for configuration
- **CORS**: Enabled for `http://localhost:5173` frontend client
- **Logging**: Morgan HTTP logger

---

## 🗄️ Database & Security Configuration

Configured in `Backend/.env`:

```env
PORT=5000
NODE_ENV=development

# PostgreSQL Database Credentials
PG_USER=postgres
PG_HOST=localhost
PG_DATABASE=stretchwithlorie
PG_PASSWORD=socrates
PG_PORT=5432

# Client Origin for CORS
CLIENT_URL=http://localhost:5173

# Admin Security Credentials
ADMIN_PASSWORD=socrates
ADMIN_SECRET=stretchwithlorie_secret_admin_key_2026
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Initialize Database Tables & Schema
Creates all tables (`classes`, `registrations`, `videos`, `video_purchases`, `event_inquiries`, `gift_cards`) and indexes:
```bash
npm run db:init
```

### 3. Seed Initial Studio Data
Populates all 6 signature yoga classes, video library, and sample student registrations:
```bash
npm run db:seed
```

### 4. Start the Express Server
Development mode (auto-reload with Nodemon):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server URL: **`http://localhost:5000`**

---

## 🔒 Authentication & Route Protection

The API separates public visitor capabilities from instructor/admin controls:

### Public Endpoints (Accessible to all students):
- `GET /api/classes` — Browse yoga experiences
- `GET /api/classes/:id` — View single experience details
- `POST /api/bookings` — Student booking & payment creation
- `GET /api/bookings/ref/:bookingRef` — View individual booking confirmation
- `GET /api/videos` — Browse video vault & 30-sec free preview
- `GET /api/videos/:id` — View video info
- `POST /api/videos/:id/purchase` — Pay to unlock full video session
- `POST /api/events` — Submit custom celebration inquiry
- `POST /api/gift-cards` — Purchase wellness gift card
- `GET /api/gift-cards/:code` — Check gift card validity
- `POST /api/gift-cards/:code/redeem` — Redeem gift card
- `POST /api/auth/login` — Sign in with admin password (`ADMIN_PASSWORD=socrates`)

### 🛡️ Admin-Only Protected Endpoints (Requires `Authorization: Bearer <token>` or `x-admin-key: <ADMIN_PASSWORD>`):
- `GET /api/bookings/registrations` — Attendee roster with student contacts & medical notes
- `PATCH /api/bookings/registrations/:id/checkin` — Toggle check-in / attendance
- `POST /api/classes` — Add a new yoga class
- `PUT /api/classes/:id` — Update existing class
- `DELETE /api/classes/:id` — Delete a class
- `POST /api/videos` — Post new guided stretch video
- `GET /api/videos/purchases` — View video unlock purchases
- `GET /api/events` — View all private celebration inquiries
- `PATCH /api/events/:id/status` — Update inquiry status (`pending`, `contacted`, `confirmed`)
- `GET /api/gift-cards` — View all issued gift cards
- `GET /api/dashboard/stats` — Financial revenue, attendance rates & metrics
- `GET /api/auth/verify` — Verify existing admin session
