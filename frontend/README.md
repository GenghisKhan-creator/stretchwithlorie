# stretchwithlorie — Yoga Booking & Instructor Portal

A clean, modern, mobile-responsive Single-Page Application (SPA) frontend for **stretchwithlorie** Yoga Class Registration and Payment portal, crafted with an earthy wellness aesthetic (sage greens, warm creams, charcoal typography, and subtle organic shadows).

---

## 🌿 Overview & Key Features

### 1. View A: Student Booking Flow (Public Portal)
- **Class Selector**:
  - Filterable by yoga style (*All Practices, Vinyasa, Restorative & Sound, Yin, Power, Hatha, Pranayama*).
  - Dynamic availability badges (`X spots left`, `Only 2 spots left!`, `Sold Out / Waitlist Only`).
  - Metadata display: Instructor profile & avatar, schedule, duration, studio room, level, and price.
  - Responsive split layout: on desktop, the registration form sticks conveniently to the side while comparing sessions; on mobile, selecting a class smoothly scrolls to the form.
- **Registration Form**:
  - Validated fields: **Full Name**, **Email Address**, **Phone / WhatsApp Number**.
  - Optional **Health, Injuries & Pregnancy Notes** (e.g. *lower back tightness, prenatal accommodations*).
  - Order summary breakdown with included studio mat and botanical tea perks.
- **Payment Trigger ("Mock Checkout")**:
  - Payment method selector (*Credit/Debit Card, Apple Pay, Google Pay*).
  - Prominent **Pay & Register** CTA with secure loading state simulation (spinner & authorization delay).
  - Real-time decrement of available class capacity.
- **Success Confirmation Screen / Modal**:
  - Unique booking reference code (e.g., `#SWL-8492`).
  - Complete reservation summary & student details.
  - **Add to Calendar**: Generates and downloads a real `.ics` calendar file.
  - **Download Pass**: Generates a downloadable text receipt.
  - Quick action to jump straight into the **Instructor Dashboard** to see the new booking live.

### 2. View B: Instructor Dashboard (Studio Client View)
- **Capacity Overview & Metrics**:
  - High-level KPIs: Total Bookings, Studio Revenue ($), Capacity Fill Rate (%), and Active Sessions.
  - Visual per-class capacity cards with animated progress bars (`signups / maxCapacity`).
  - One-click **"Filter Roster"** to immediately isolate attendees for any class.
- **Live Registrations Table**:
  - Search by student name, email, phone, booking ID, or class.
  - Filter by class session and attendance status.
  - Formatted badges for payment status (`Paid • $25.00`), timestamp, and health notes.
  - Interactive **Attendance Check-In** button (`Mark Present` / `Checked In`).
  - Student details modal for complete health notes & direct WhatsApp / Email shortcuts.
- **Quick Actions**:
  - **Export Attendee List (CSV)**: Generates and downloads a CSV file formatted with all booking records.
  - **Add New Class**: Comprehensive modal to create and publish a new class that immediately reflects across both views.
  - **Reset Demo Data**: Easily restore initial mock state for testing.

---

## 🛠️ Tech Stack

- **React 19**
- **Vite 8**
- **Tailwind CSS v4** (with custom earthy theme palette)
- **Lucide React** (icons)
- **Google Fonts** (`Playfair Display` serif + `Plus Jakarta Sans` sans-serif)

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── assets/              # Static assets
│   ├── components/
│   │   ├── AddClassModal.jsx        # Modal to publish a new class
│   │   ├── ClassCard.jsx           # Card for class selection
│   │   ├── InstructorDashboard.jsx # Studio overview & registrations table
│   │   ├── Navbar.jsx              # Header & view switcher (Student / Instructor)
│   │   ├── RegistrationForm.jsx    # Booking form & mock checkout
│   │   ├── StudentDetailsModal.jsx # Detailed student info & health notes modal
│   │   ├── SuccessModal.jsx        # Booking confirmation & calendar export
│   │   └── Toast.jsx               # Feedback notifications
│   ├── data/
│   │   └── mockData.js             # Initial mock data for classes & registrations
│   ├── services/
│   │   └── api.js                  # API service abstraction (ready for backend)
│   ├── App.jsx                     # Top-level state & layout orchestration
│   ├── index.css                   # Tailwind CSS theme & styles
│   └── main.jsx                    # Application entry point
├── index.html
├── package.json
└── vite.config.js
```

---

## 🔌 Connecting to Your Backend Later

The frontend is architected with a decoupled service layer in [`src/services/api.js`](file:///c:/Users/Niawere/Documents/Work/Yoga%20Form/frontend/src/services/api.js).

Currently, it simulates latency and stores data in `localStorage`. When your backend API is ready, you only need to swap the methods inside `api.js` to call your endpoints:

```javascript
// Example: src/services/api.js

export const api = {
  // Fetch classes:
  async getClasses() {
    const res = await fetch('/api/classes');
    return res.json();
  },

  // Create booking:
  async createBooking(bookingData) {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    return res.json();
  },

  // Fetch registrations:
  async getRegistrations() {
    const res = await fetch('/api/registrations');
    return res.json();
  },

  // Add new class:
  async createClass(classData) {
    const res = await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classData)
    });
    return res.json();
  },

  // Toggle check-in:
  async toggleCheckIn(registrationId) {
    const res = await fetch(`/api/registrations/${registrationId}/checkin`, {
      method: 'PATCH'
    });
    return res.json();
  }
};
```

---

## 🚀 Running the Project

From the `frontend` folder:

```bash
# Run local development server
npm run dev

# Run production build
npm run build

# Run linter
npm run lint
```
