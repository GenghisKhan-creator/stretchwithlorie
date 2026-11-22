// API Service Abstraction for Stretch With Lorie
// Connects to Express.js + PostgreSQL Backend (http://localhost:5000/api)
// with seamless LocalStorage fallback if backend is offline.

import { INITIAL_CLASSES, INITIAL_REGISTRATIONS, DEFAULT_INSTRUCTOR_AVATAR } from '../data/mockData';

const STORAGE_KEY_CLASSES = 'stretchwithlorie_classes_v12';
const STORAGE_KEY_REGISTRATIONS = 'stretchwithlorie_registrations_v12';
const STORAGE_KEY_REFERRALS = 'stretchwithlorie_referrals_v12';
const STORAGE_KEY_EVENT_INQUIRIES = 'stretchwithlorie_event_inquiries_v12';
const STORAGE_KEY_GIFT_CARDS = 'stretchwithlorie_gift_cards_v12';
const STORAGE_KEY_ADMIN_TOKEN = 'stretchwithlorie_admin_token';
const rawBackendUrl = (import.meta.env.VITE_BACKEND_URL || '').trim().replace(/\/+$/, '');
const API_BASE_URL = rawBackendUrl
  ? rawBackendUrl.endsWith('/api')
    ? rawBackendUrl
    : `${rawBackendUrl}/api`
  : '/api';

const INITIAL_EVENT_INQUIRIES = [];

const INITIAL_GIFT_CARDS = [];

const INITIAL_REFERRALS = [
  {
    id: 'ref-ama15',
    code: 'AMA15',
    creatorName: 'Ama Serwaa',
    creatorHandle: '@amaserwaa',
    creatorPhone: '024 510 8821',
    discountType: 'percentage',
    discountValue: 15,
    commissionPercent: 10,
    maxUses: 50,
    usesCount: 0,
    totalRevenueGenerated: 0,
    totalCommissionEarned: 0,
    isActive: true,
    notes: 'TikTok & Instagram Wellness Creator Collaboration'
  },
  {
    id: 'ref-lorievip',
    code: 'LORIEVIP',
    creatorName: 'Sanctuary VIP Launch',
    creatorHandle: '@stretchwithlorie',
    creatorPhone: '',
    discountType: 'fixed',
    discountValue: 30,
    commissionPercent: 0,
    maxUses: 100,
    usesCount: 0,
    totalRevenueGenerated: 0,
    totalCommissionEarned: 0,
    isActive: true,
    notes: 'Founding Members GH₵ 30 Off Discount Code'
  }
];

export function getAdminToken() {
  try {
    return localStorage.getItem(STORAGE_KEY_ADMIN_TOKEN) || sessionStorage.getItem(STORAGE_KEY_ADMIN_TOKEN) || null;
  } catch {
    return null;
  }
}

export function setAdminToken(token, remember = true) {
  try {
    if (remember) {
      localStorage.setItem(STORAGE_KEY_ADMIN_TOKEN, token);
    } else {
      sessionStorage.setItem(STORAGE_KEY_ADMIN_TOKEN, token);
    }
  } catch (e) {
    console.warn('Could not store admin token:', e);
  }
}

export function clearAdminToken() {
  try {
    localStorage.removeItem(STORAGE_KEY_ADMIN_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY_ADMIN_TOKEN);
  } catch (e) {
    console.warn('Could not clear admin token:', e);
  }
}

export function getAuthHeaders() {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function initStorage() {
  if (!localStorage.getItem(STORAGE_KEY_CLASSES)) {
    localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(INITIAL_CLASSES));
  }
  if (!localStorage.getItem(STORAGE_KEY_REGISTRATIONS)) {
    localStorage.setItem(STORAGE_KEY_REGISTRATIONS, JSON.stringify(INITIAL_REGISTRATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEY_REFERRALS)) {
    localStorage.setItem(STORAGE_KEY_REFERRALS, JSON.stringify(INITIAL_REFERRALS));
  }
  if (!localStorage.getItem(STORAGE_KEY_EVENT_INQUIRIES)) {
    localStorage.setItem(STORAGE_KEY_EVENT_INQUIRIES, JSON.stringify(INITIAL_EVENT_INQUIRIES));
  }
  if (!localStorage.getItem(STORAGE_KEY_GIFT_CARDS)) {
    localStorage.setItem(STORAGE_KEY_GIFT_CARDS, JSON.stringify(INITIAL_GIFT_CARDS));
  }
}

initStorage();

export const api = {
  /**
   * Fetch all upcoming classes from Express + PostgreSQL (falls back to localStorage)
   */
  async getClasses() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${API_BASE_URL}/classes`, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          // Hydrate fallback images if needed
          return json.data.map((cls) => {
            const initial = INITIAL_CLASSES.find((ic) => ic.id === cls.id);
            return {
              ...cls,
              image: cls.image || initial?.image,
              instructor: {
                ...(cls.instructor || {}),
                avatar: initial?.instructor?.avatar || cls.instructor?.avatar || DEFAULT_INSTRUCTOR_AVATAR
              }
            };
          });
        }
      }
    } catch {
      // Backend offline: gracefully fall back to local storage
    }

    // LocalStorage Fallback
    await delay(150);
    const data = localStorage.getItem(STORAGE_KEY_CLASSES);
    if (!data) return INITIAL_CLASSES;
    try {
      const parsed = JSON.parse(data);
      return parsed.map((cls) => {
        const initial = INITIAL_CLASSES.find((ic) => ic.id === cls.id);
        return {
          ...cls,
          image: cls.image || initial?.image,
          instructor: {
            ...(cls.instructor || {}),
            avatar: initial?.instructor?.avatar || cls.instructor?.avatar || DEFAULT_INSTRUCTOR_AVATAR,
            name: cls.instructor?.name || initial?.instructor?.name || 'Lorie',
            role: cls.instructor?.role || initial?.instructor?.role || 'Founder & Lead Yoga Specialist'
          },
          duration: initial?.duration || cls.duration || '60 min',
          scheduleSlots: cls.scheduleSlots || initial?.scheduleSlots,
          hasSessionOptions: initial?.hasSessionOptions,
          sessionOptions: cls.sessionOptions || initial?.sessionOptions,
          locationPricing: cls.locationPricing || initial?.locationPricing,
          tagline: cls.tagline || initial?.tagline
        };
      });
    } catch {
      return INITIAL_CLASSES;
    }
  },

  /**
   * Fetch single class by ID
   */
  async getClassById(id) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE_URL}/classes/${id}`, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {
      // fallback
    }

    const classes = await this.getClasses();
    return classes.find((c) => c.id === id) || null;
  },

  /**
   * Process booking and Paystack payment in PostgreSQL
   */
  async createBooking(bookingData) {
    // 1. Try Express + PostgreSQL Backend
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          // Sync locally as cache
          try {
            const existingRegs = JSON.parse(localStorage.getItem(STORAGE_KEY_REGISTRATIONS) || '[]');
            localStorage.setItem(STORAGE_KEY_REGISTRATIONS, JSON.stringify([json.registration, ...existingRegs]));
          } catch (cacheErr) {
            console.warn('Could not cache registration locally:', cacheErr);
          }
          return json;
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        if (errJson.error) {
          throw new Error(errJson.error);
        }
      }
    } catch (err) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('network') && !err.message.includes('aborted')) {
        throw err;
      }
      // If network error, proceed to local fallback below
    }

    // 2. Local Fallback Booking Processor
    await delay(1200);
    const classes = await this.getClasses();
    const targetClass = classes.find((c) => c.id === bookingData.classId);

    if (!targetClass) {
      throw new Error('Experience not found. Please refresh the page.');
    }

    let updatedSlots = targetClass.scheduleSlots ? [...targetClass.scheduleSlots] : null;
    let updatedSessionOptions = targetClass.sessionOptions ? [...targetClass.sessionOptions] : null;
    let selectedSlotObj = null;
    let selectedOptionObj = null;

    if (updatedSlots && updatedSlots.length > 0) {
      selectedSlotObj = updatedSlots.find(
        (s) =>
          s.id === bookingData.slotId ||
          `${s.day} ${s.time}` === bookingData.selectedSlot ||
          s.label === bookingData.selectedSlot ||
          (bookingData.selectedSlot && bookingData.selectedSlot.includes(s.day))
      );

      if (selectedSlotObj) {
        if (selectedSlotObj.isFull || selectedSlotObj.spotsLeft <= 0) {
          const availableSlots = updatedSlots.filter((s) => !s.isFull && s.spotsLeft > 0);
          const altText = availableSlots.length > 0
            ? `Open mats available on: ${availableSlots.map((s) => s.label).join(', ')}`
            : 'All sessions for this week are fully booked.';
          throw new Error(`The ${selectedSlotObj.label} session is fully booked. ${altText}`);
        }

        updatedSlots = updatedSlots.map((s) => {
          if (s.id === selectedSlotObj.id) {
            const newBooked = (s.bookedCount || 0) + 1;
            const newSpots = Math.max(0, s.maxCapacity - newBooked);
            return {
              ...s,
              bookedCount: newBooked,
              spotsLeft: newSpots,
              isFull: newSpots <= 0
            };
          }
          return s;
        });
      }
    }

    if (updatedSessionOptions && updatedSessionOptions.length > 0) {
      selectedOptionObj = updatedSessionOptions.find(
        (opt) =>
          opt.id === bookingData.selectedSessionId ||
          opt.id === bookingData.selectedOptionId ||
          opt.label === bookingData.selectedSessionOption ||
          opt.timeWindow === bookingData.selectedTimeWindow
      );

      if (selectedOptionObj) {
        if (selectedOptionObj.isFull || selectedOptionObj.spotsLeft <= 0) {
          const openOptions = updatedSessionOptions.filter((opt) => !opt.isFull && opt.spotsLeft > 0);
          const altText = openOptions.length > 0
            ? `Open sessions available: ${openOptions.map((opt) => opt.label || opt.date).join(', ')}`
            : 'All sessions are fully booked.';
          throw new Error(`This session option (${selectedOptionObj.label || selectedOptionObj.date}) is fully booked. ${altText}`);
        }

        updatedSessionOptions = updatedSessionOptions.map((opt) => {
          if (opt.id === selectedOptionObj.id) {
            const newSpots = Math.max(0, (opt.spotsLeft || 1) - 1);
            return {
              ...opt,
              spotsLeft: newSpots,
              isFull: newSpots <= 0
            };
          }
          return opt;
        });
      }
    }

    const totalMax = targetClass.maxCapacity;
    const currentBooked = targetClass.bookedCount;
    if (totalMax && currentBooked >= totalMax && !updatedSlots) {
      throw new Error('This session is fully booked. Please select another time or experience.');
    }

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const bookingRef = `SWL-${randomCode}`;
    const paystackRef = `pstk_${Math.random().toString(36).substring(2, 8)}_${Date.now().toString(36)}`;
    const now = new Date();

    const finalAmount = bookingData.amount || targetClass.price;
    let finalClassName = bookingData.classTitle || targetClass.title;
    if (selectedSlotObj && !finalClassName.includes(selectedSlotObj.label) && !finalClassName.includes(selectedSlotObj.day)) {
      finalClassName = `${targetClass.title} (${selectedSlotObj.label})`;
    } else if (selectedOptionObj && !finalClassName.includes(selectedOptionObj.label || '')) {
      finalClassName = `${targetClass.title} - ${selectedOptionObj.label || selectedOptionObj.date || selectedOptionObj.timeWindow}`;
    }

    const finalDate = selectedSlotObj
      ? selectedSlotObj.day
      : bookingData.preferredDate || selectedOptionObj?.date || targetClass.date;

    const finalTime = selectedSlotObj
      ? `${selectedSlotObj.time} (60 min)`
      : selectedOptionObj?.time || selectedOptionObj?.timeWindow || targetClass.time;

    const newRegistration = {
      id: `reg-${Date.now()}`,
      bookingRef,
      paystackRef,
      studentName: bookingData.fullName.trim(),
      email: bookingData.email.trim().toLowerCase(),
      phone: bookingData.phone.trim(),
      classId: targetClass.id,
      className: finalClassName,
      classDate: finalDate,
      classTime: finalTime,
      slotId: selectedSlotObj?.id,
      slotLabel: selectedSlotObj?.label,
      locationType: bookingData.locationType || (bookingData.locationOption === 'clientLocation' ? "Client's Location" : 'Studio Sanctuary'),
      clientAddress: bookingData.clientAddress || '',
      instructor: targetClass.instructor.name,
      amount: finalAmount,
      paymentStatus: 'Paid',
      paymentGateway: 'Paystack',
      paymentMethod: bookingData.paymentMethod || 'Paystack (MTN MoMo)',
      healthNotes: bookingData.healthNotes?.trim() || 'None reported',
      intake: bookingData.intake || null,
      isFirstTime: bookingData.isFirstTime !== false,
      registeredAt: now.toISOString(),
      formattedTime: 'Just now',
      checkedIn: false
    };

    const newClassBookedCount = updatedSlots
      ? updatedSlots.reduce((sum, s) => sum + (s.bookedCount || 0), 0)
      : targetClass.bookedCount + 1;

    const isClassFullyBooked = updatedSlots
      ? updatedSlots.every((s) => s.isFull || s.spotsLeft <= 0)
      : newClassBookedCount >= targetClass.maxCapacity;

    const updatedClasses = classes.map((c) => {
      if (c.id === targetClass.id) {
        return {
          ...c,
          bookedCount: newClassBookedCount,
          isFull: isClassFullyBooked,
          scheduleSlots: updatedSlots || c.scheduleSlots,
          sessionOptions: updatedSessionOptions || c.sessionOptions
        };
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(updatedClasses));

    const existingRegs = JSON.parse(localStorage.getItem(STORAGE_KEY_REGISTRATIONS) || '[]');
    const updatedRegs = [newRegistration, ...existingRegs];
    localStorage.setItem(STORAGE_KEY_REGISTRATIONS, JSON.stringify(updatedRegs));

    return {
      success: true,
      registration: newRegistration,
      updatedClass: updatedClasses.find((c) => c.id === targetClass.id)
    };
  },

  /**
   * Fetch all live registrations for the Instructor Dashboard (Admin Protected)
   */
  async getRegistrations() {
    if (!getAdminToken()) {
      return [];
    }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE_URL}/bookings/registrations`, {
        headers: getAuthHeaders(),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.status === 401) {
        clearAdminToken();
        return [];
      }
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (err) {
      console.warn('Could not fetch registrations from backend:', err);
    }

    await delay(150);
    const data = localStorage.getItem(STORAGE_KEY_REGISTRATIONS);
    return data ? JSON.parse(data) : INITIAL_REGISTRATIONS;
  },

  /**
   * Add a new class (Instructor Dashboard - Admin Protected)
   */
  async createClass(classData) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${API_BASE_URL}/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(classData),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (err) {
      console.warn('Could not create class in backend:', err);
    }

    await delay(200);
    const classes = await this.getClasses();
    const newClass = {
      id: `cls-${Date.now()}`,
      bookedCount: 0,
      tags: classData.tags || ['Studio Sanctuary'],
      intensity: classData.intensity || 'Moderate',
      ...classData
    };

    const updatedClasses = [newClass, ...classes];
    localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(updatedClasses));
    return newClass;
  },

  /**
   * Update an existing class (Instructor Dashboard - Admin Protected)
   */
  async updateClass(id, updatedData) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${API_BASE_URL}/classes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(updatedData),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const current = await this.getClasses();
          const updated = current.map((c) => (c.id === id ? { ...c, ...json.data } : c));
          localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(updated));
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Could not update class in backend:', err);
    }

    await delay(150);
    const classes = await this.getClasses();
    const updated = classes.map((c) => (c.id === id ? { ...c, ...updatedData } : c));
    localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(updated));
    return updated.find((c) => c.id === id);
  },

  /**
   * Delete a class (Instructor Dashboard - Admin Protected)
   */
  async deleteClass(id) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${API_BASE_URL}/classes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        const classes = await this.getClasses();
        const filtered = classes.filter((c) => c.id !== id);
        localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(filtered));
        return true;
      }
    } catch (err) {
      console.warn('Could not delete class in backend:', err);
    }

    await delay(100);
    const classes = await this.getClasses();
    const filtered = classes.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(filtered));
    return true;
  },

  /**
   * Toggle student check-in status (attendance - Admin Protected)
   */
  async toggleCheckIn(registrationId) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE_URL}/bookings/registrations/${registrationId}/checkin`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (err) {
      console.warn('Could not update check-in on backend:', err);
    }

    await delay(100);
    const registrations = await this.getRegistrations();
    const updated = registrations.map((r) =>
      r.id === registrationId ? { ...r, checkedIn: !r.checkedIn } : r
    );
    localStorage.setItem(STORAGE_KEY_REGISTRATIONS, JSON.stringify(updated));
    return updated.find((r) => r.id === registrationId);
  },

  /**
   * Dashboard Statistics (Admin Protected)
   */
  async getDashboardStats() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        headers: getAuthHeaders(),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        const json = await res.json();
        if (json.stats) return json.stats;
      }
    } catch (err) {
      console.warn('Could not fetch dashboard stats:', err);
    }
    return null;
  },

  /**
   * Master Financial Transactions Ledger (Admin Protected)
   */
  async getAllTransactions() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${API_BASE_URL}/dashboard/transactions`, {
        headers: getAuthHeaders(),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          localStorage.setItem('stretchwithlorie_transactions_cache', JSON.stringify(json));
          return json;
        }
      }
    } catch (err) {
      console.warn('Could not load transactions from backend:', err);
    }

    // Local fallback: Synthesize transactions from locally stored registrations and gift cards
    const registrations = await this.getRegistrations();
    const giftCards = await this.getAllGiftCards();
    const raw = [
      ...registrations.map((r) => ({
        id: r.id,
        streamType: 'class_booking',
        streamLabel: 'Class Booking',
        itemTitle: r.className,
        customerName: r.studentName,
        customerEmail: r.email,
        customerPhone: r.phone,
        amount: Number(r.amount) || 0,
        paymentMethod: r.paymentMethod || 'Paystack MoMo',
        paymentGateway: r.paymentGateway || 'Paystack',
        paymentStatus: r.paymentStatus || 'Paid',
        paystackRef: r.paystackRef,
        bookingRef: r.bookingRef,
        promoCode: r.promoCode,
        discountAmount: Number(r.discountAmount || 0),
        slotLabel: r.slotLabel,
        classDate: r.classDate,
        classTime: r.classTime,
        timestamp: r.registeredAt || new Date().toISOString()
      })),
      ...giftCards.map((g) => ({
        id: g.id,
        streamType: g.cardType === 'subscription' ? 'pass_purchase' : 'gift_card_purchase',
        streamLabel: g.cardType === 'subscription' ? 'Monthly Flow Pass' : 'Wellness Gift Card',
        itemTitle: g.planName || (g.cardType === 'subscription' ? 'Monthly Flow Pass' : 'Wellness Gift Voucher'),
        customerName: g.buyerName || g.recipientName,
        customerEmail: g.buyerEmail || g.recipientEmail,
        customerPhone: g.buyerPhone || g.recipientPhone,
        amount: Number(g.amount) || 0,
        paymentMethod: 'Paystack Online',
        paymentGateway: 'Paystack',
        paymentStatus: 'Paid',
        paystackRef: g.paystackRef,
        bookingRef: g.code,
        promoCode: null,
        discountAmount: 0,
        slotLabel: null,
        classDate: null,
        classTime: null,
        timestamp: g.createdAt || new Date().toISOString()
      }))
    ];

    raw.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const totalRev = raw.reduce((sum, t) => sum + t.amount, 0);

    return {
      success: true,
      count: raw.length,
      metrics: {
        totalRevenueGHS: totalRev,
        todayRevenueGHS: totalRev,
        monthRevenueGHS: totalRev,
        avgOrderValueGHS: raw.length > 0 ? Math.round(totalRev / raw.length) : 0,
        totalCount: raw.length,
        breakdown: {
          classBookings: raw.filter((t) => t.streamType === 'class_booking').reduce((s, t) => s + t.amount, 0),
          flowPasses: raw.filter((t) => t.streamType === 'pass_purchase').reduce((s, t) => s + t.amount, 0),
          giftCards: raw.filter((t) => t.streamType === 'gift_card_purchase').reduce((s, t) => s + t.amount, 0),
          videoUnlocks: 0
        }
      },
      data: raw
    };
  },

  /**
   * DEV ONLY: Purge all operational test data while preserving admin authentication
   */
  async purgeTestData() {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/purge-test-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ confirm: true })
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to purge database test data.');
      }

      // Clear operational caches in localStorage while strictly preserving admin auth token!
      localStorage.removeItem(STORAGE_KEY_REGISTRATIONS);
      localStorage.removeItem(STORAGE_KEY_GIFT_CARDS);
      localStorage.removeItem(STORAGE_KEY_EVENT_INQUIRIES);
      localStorage.removeItem('stretchwithlorie_transactions_cache');

      return json;
    } catch (err) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('network')) {
        throw err;
      }
      // Local fallback reset
      localStorage.removeItem(STORAGE_KEY_REGISTRATIONS);
      localStorage.removeItem(STORAGE_KEY_GIFT_CARDS);
      localStorage.removeItem(STORAGE_KEY_EVENT_INQUIRIES);
      localStorage.removeItem('stretchwithlorie_transactions_cache');
      return { success: true, message: 'Local test data cleared.' };
    }
  },

  /**
   * Admin Authentication Methods (Strictly verified server-side; zero secrets in frontend bundle)
   */
  async loginAdmin(password, remember = true) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Incorrect admin password.');
    }
    setAdminToken(data.token, remember);
    return data;
  },

  async verifyAdminSession() {
    const token = getAdminToken();
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        return json.valid === true;
      }
      clearAdminToken();
      return false;
    } catch {
      return Boolean(token);
    }
  },

  logoutAdmin() {
    clearAdminToken();
  },

  isAdminLoggedIn() {
    return Boolean(getAdminToken());
  },

  /**
   * Submit Private Celebrations / Events inquiry
   */
  async submitEventInquiry(eventData) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return { success: true, message: 'Inquiry received!' };
  },

  /**
   * Fetch all event inquiries (Admin Protected)
   */
  async getEventInquiries() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${API_BASE_URL}/events`, {
        headers: getAuthHeaders(),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          const normalized = json.data.map((row) => ({
            id: row.id,
            occasionType: row.occasion_type || row.occasionType,
            fullName: row.full_name || row.fullName,
            phone: row.phone,
            email: row.email,
            guestCount: row.guest_count !== undefined ? row.guest_count : row.guestCount,
            preferredDate: row.preferred_date || row.preferredDate,
            locationPreference: row.location_preference || row.locationPreference,
            notes: row.notes,
            status: row.status || 'pending',
            createdAt: row.created_at || row.createdAt
          }));
          localStorage.setItem(STORAGE_KEY_EVENT_INQUIRIES, JSON.stringify(normalized));
          return normalized;
        }
      }
    } catch (err) {
      console.warn('Could not fetch event inquiries from backend:', err);
    }

    const data = localStorage.getItem(STORAGE_KEY_EVENT_INQUIRIES);
    return data ? JSON.parse(data) : INITIAL_EVENT_INQUIRIES;
  },

  /**
   * Update event inquiry status (Admin Protected)
   */
  async updateEventStatus(id, status) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${API_BASE_URL}/events/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ status }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const current = JSON.parse(localStorage.getItem(STORAGE_KEY_EVENT_INQUIRIES) || '[]');
          const updated = current.map((item) => (item.id === id ? { ...item, status } : item));
          localStorage.setItem(STORAGE_KEY_EVENT_INQUIRIES, JSON.stringify(updated));
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Could not update event status on backend:', err);
    }

    const current = JSON.parse(localStorage.getItem(STORAGE_KEY_EVENT_INQUIRIES) || JSON.stringify(INITIAL_EVENT_INQUIRIES));
    const updated = current.map((item) => (item.id === id ? { ...item, status } : item));
    localStorage.setItem(STORAGE_KEY_EVENT_INQUIRIES, JSON.stringify(updated));
    return updated.find((item) => item.id === id);
  },

  /**
   * Fetch all issued gift cards and monthly flow passes (Admin Protected)
   */
  async getAllGiftCards() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${API_BASE_URL}/gift-cards`, {
        headers: getAuthHeaders(),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          const normalized = json.data.map((row) => ({
            id: row.id,
            code: row.code,
            cardType: row.card_type || row.cardType || 'gift',
            planId: row.plan_id || row.planId || null,
            planName: row.plan_name || row.planName || null,
            totalClasses: row.total_classes !== null && row.total_classes !== undefined
              ? Number(row.total_classes)
              : (row.totalClasses !== undefined ? Number(row.totalClasses) : 1),
            classesRemaining: row.classes_remaining !== null && row.classes_remaining !== undefined
              ? Number(row.classes_remaining)
              : (row.classesRemaining !== undefined ? Number(row.classesRemaining) : 1),
            classesUsed: Number(row.classes_used || row.classesUsed || 0),
            recipientName: row.recipient_name || row.recipientName,
            recipientPhone: row.recipient_phone || row.recipientPhone,
            recipientEmail: row.recipient_email || row.recipientEmail,
            buyerName: row.buyer_name || row.buyerName,
            buyerPhone: row.buyer_phone || row.buyerPhone,
            buyerEmail: row.buyer_email || row.buyerEmail,
            amount: Number(row.amount),
            balance: row.balance !== null && row.balance !== undefined ? Number(row.balance) : Number(row.amount),
            personalNote: row.personal_note || row.personalNote,
            status: row.status,
            paystackRef: row.paystack_ref || row.paystackRef,
            createdAt: row.created_at || row.createdAt
          }));
          localStorage.setItem(STORAGE_KEY_GIFT_CARDS, JSON.stringify(normalized));
          return normalized;
        }
      }
    } catch (err) {
      console.warn('Could not fetch gift cards from backend:', err);
    }

    const data = localStorage.getItem(STORAGE_KEY_GIFT_CARDS);
    return data ? JSON.parse(data) : INITIAL_GIFT_CARDS;
  },

  /**
   * Create a Monthly Flow Pass or Gift Card
   */
  async createPassOrGiftCard(data) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${API_BASE_URL}/gift-cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      clearTimeout(timeout);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to issue pass or gift card.');
      }
      if (json.data) {
        const current = JSON.parse(localStorage.getItem(STORAGE_KEY_GIFT_CARDS) || '[]');
        const updated = [json.data, ...current.filter((c) => c.id !== json.data.id)];
        localStorage.setItem(STORAGE_KEY_GIFT_CARDS, JSON.stringify(updated));
        return json.data;
      }
    } catch (err) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('network') && !err.message.includes('aborted')) {
        throw err;
      }
      console.warn('Backend unavailable, generating pass locally:', err);
    }

    // Local fallback
    const id = `${data.cardType === 'subscription' ? 'pass' : 'gift'}-${Date.now()}`;
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = data.preferredCode || `${data.cardType === 'subscription' ? 'SWL-PASS' : 'SWL-GIFT'}-${randomHex}`;
    const totalClasses = data.totalClasses || (data.cardType === 'subscription' ? 4 : 1);
    const newCard = {
      id,
      code,
      cardType: data.cardType || 'gift',
      planId: data.planId || null,
      planName: data.planName || (data.cardType === 'subscription' ? 'Monthly Flow Pass' : 'Wellness Gift Card'),
      totalClasses,
      classesRemaining: totalClasses,
      classesUsed: 0,
      recipientName: data.recipientName || data.buyerName,
      recipientPhone: data.recipientPhone || '',
      recipientEmail: data.recipientEmail || '',
      buyerName: data.buyerName || data.recipientName,
      buyerPhone: data.buyerPhone,
      buyerEmail: data.buyerEmail || '',
      amount: Number(data.amount),
      balance: Number(data.amount),
      personalNote: data.personalNote || '',
      paystackRef: data.paystackRef || `pstk_local_${randomHex}`,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY_GIFT_CARDS) || '[]');
    localStorage.setItem(STORAGE_KEY_GIFT_CARDS, JSON.stringify([newCard, ...current]));
    return newCard;
  },

  /**
   * Validate a Monthly Flow Pass or Gift Card code
   */
  async validatePassOrVoucher(code) {
    const cleanCode = String(code || '').trim().toUpperCase();
    if (!cleanCode) throw new Error('Please enter a voucher or pass code.');

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${API_BASE_URL}/gift-cards/${cleanCode}`, {
        signal: controller.signal
      });
      clearTimeout(timeout);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Pass or voucher code not found.');
      }
      return json.data;
    } catch (err) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('network') && !err.message.includes('aborted')) {
        throw err;
      }
    }

    // Local fallback check
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY_GIFT_CARDS) || '[]');
    const found = current.find((c) => c.code.toUpperCase() === cleanCode);
    if (!found) {
      throw new Error(`Pass or voucher code "${cleanCode}" was not found.`);
    }
    return found;
  },

  /**
   * Book a walk-in session with pass at studio front desk (Admin Protected)
   */
  async deskWalkInBooking(code, bookingDetails) {
    const cleanCode = String(code || '').trim().toUpperCase();
    if (!cleanCode) throw new Error('Pass or voucher code is required.');

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${API_BASE_URL}/gift-cards/${cleanCode}/walk-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(bookingDetails),
        signal: controller.signal
      });
      clearTimeout(timeout);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to book walk-in student.');
      }
      return json;
    } catch (err) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('network') && !err.message.includes('aborted')) {
        throw err;
      }
      throw new Error(err.message || 'Network error booking walk-in.', { cause: err });
    }
  },

  /**
   * Adjust remaining classes or balance on a pass (Admin Protected: Courtesy +1 or extension)
   */
  async adjustCard(id, adjustment) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${API_BASE_URL}/gift-cards/${id}/adjust`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(adjustment),
        signal: controller.signal
      });
      clearTimeout(timeout);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to adjust pass.');
      }
      return json.data;
    } catch (err) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('network') && !err.message.includes('aborted')) {
        throw err;
      }
      throw new Error(err.message || 'Network error adjusting pass.', { cause: err });
    }
  },

  /**
   * Void or cancel a pass/voucher (Admin Protected)
   */
  async voidCard(id, reason = 'Voided by studio admin') {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${API_BASE_URL}/gift-cards/${id}/void`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ reason }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to void pass.');
      }
      return json.data;
    } catch (err) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('network') && !err.message.includes('aborted')) {
        throw err;
      }
      throw new Error(err.message || 'Network error voiding pass.', { cause: err });
    }
  },

  /**
   * Redeem gift card code at studio desk (Admin Protected or Counter Desk)
   */
  async redeemGiftCard(code) {
    const cleanCode = String(code || '').trim().toUpperCase();
    if (!cleanCode) throw new Error('Gift card code is required.');

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${API_BASE_URL}/gift-cards/${cleanCode}/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        signal: controller.signal
      });
      clearTimeout(timeout);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to redeem gift card.');
      }
      if (json.data) {
        const current = JSON.parse(localStorage.getItem(STORAGE_KEY_GIFT_CARDS) || '[]');
        const updated = current.map((c) => (c.code.toUpperCase() === cleanCode ? { ...c, status: 'redeemed' } : c));
        localStorage.setItem(STORAGE_KEY_GIFT_CARDS, JSON.stringify(updated));
        return json.data;
      }
    } catch (err) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('network') && !err.message.includes('aborted')) {
        throw err;
      }
    }

    // Local fallback
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY_GIFT_CARDS) || JSON.stringify(INITIAL_GIFT_CARDS));
    const card = current.find((c) => c.code.toUpperCase() === cleanCode);
    if (!card) throw new Error('Gift card code not found.');
    if (card.status === 'redeemed') throw new Error('This gift card has already been redeemed.');

    const updated = current.map((c) => (c.code.toUpperCase() === cleanCode ? { ...c, status: 'redeemed' } : c));
    localStorage.setItem(STORAGE_KEY_GIFT_CARDS, JSON.stringify(updated));
    return { ...card, status: 'redeemed' };
  },

  /**
   * Fetch all guided stretch videos
   */
  async getVideos() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${API_BASE_URL}/videos`, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch {
      // fallback
    }
    return null;
  },

  /**
   * Admin posts a new video
   */
  async createVideo(videoData) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${API_BASE_URL}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(videoData),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {
      // fallback
    }
    return null;
  },

  /**
   * Purchase / Unlock Full Video
   */
  async purchaseVideo(videoId, purchaseData) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${API_BASE_URL}/videos/${videoId}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return { success: true };
  },

  /**
   * Creator Collaborations, Referral Links & Discount Codes
   */
  async getReferrals() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${API_BASE_URL}/referrals`, {
        headers: getAuthHeaders(),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          localStorage.setItem(STORAGE_KEY_REFERRALS, JSON.stringify(json.data));
          return json.data;
        }
      }
    } catch {
      // fallback
    }
    const saved = localStorage.getItem(STORAGE_KEY_REFERRALS);
    return saved ? JSON.parse(saved) : INITIAL_REFERRALS;
  },

  async createReferral(referralData) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${API_BASE_URL}/referrals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(referralData),
        signal: controller.signal
      });
      clearTimeout(timeout);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Could not create referral code.');
      }
      if (json.data) {
        const current = JSON.parse(localStorage.getItem(STORAGE_KEY_REFERRALS) || '[]');
        localStorage.setItem(STORAGE_KEY_REFERRALS, JSON.stringify([json.data, ...current]));
        return json.data;
      }
    } catch (err) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('network') && !err.message.includes('aborted')) {
        throw err;
      }
    }

    // Local fallback
    const cleanCode = String(referralData.code).trim().toUpperCase().replace(/\s+/g, '');
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY_REFERRALS) || '[]');
    if (current.some((r) => r.code.toUpperCase() === cleanCode)) {
      throw new Error(`Code "${cleanCode}" already exists.`);
    }
    const newRef = {
      id: `ref-${Date.now()}`,
      code: cleanCode,
      creatorName: referralData.creatorName.trim(),
      creatorHandle: referralData.creatorHandle?.trim() || '',
      creatorPhone: referralData.creatorPhone?.trim() || '',
      discountType: referralData.discountType === 'fixed' ? 'fixed' : 'percentage',
      discountValue: Number(referralData.discountValue) || 10,
      commissionPercent: Number(referralData.commissionPercent) || 0,
      maxUses: referralData.maxUses ? Number(referralData.maxUses) : null,
      usesCount: 0,
      totalRevenueGenerated: 0,
      totalCommissionEarned: 0,
      isActive: true,
      notes: referralData.notes?.trim() || '',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY_REFERRALS, JSON.stringify([newRef, ...current]));
    return newRef;
  },

  async toggleReferralStatus(id) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${API_BASE_URL}/referrals/${id}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {
      // fallback
    }
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY_REFERRALS) || '[]');
    const updated = current.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r));
    localStorage.setItem(STORAGE_KEY_REFERRALS, JSON.stringify(updated));
    return updated.find((r) => r.id === id);
  },

  async deleteReferral(id) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${API_BASE_URL}/referrals/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        const current = JSON.parse(localStorage.getItem(STORAGE_KEY_REFERRALS) || '[]');
        localStorage.setItem(STORAGE_KEY_REFERRALS, JSON.stringify(current.filter((r) => r.id !== id)));
        return true;
      }
    } catch {
      // fallback
    }
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY_REFERRALS) || '[]');
    localStorage.setItem(STORAGE_KEY_REFERRALS, JSON.stringify(current.filter((r) => r.id !== id)));
    return true;
  },

  async validateReferralCode(code, amount) {
    const cleanCode = String(code || '').trim().toUpperCase();
    if (!cleanCode) {
      throw new Error('Please enter a referral or discount code.');
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${API_BASE_URL}/referrals/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode, amount }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Invalid or expired discount code.');
      }
      return json.data;
    } catch (err) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('network') && !err.message.includes('aborted')) {
        throw err;
      }
    }

    // Local fallback validation
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY_REFERRALS) || JSON.stringify(INITIAL_REFERRALS));
    const found = current.find((r) => r.code.toUpperCase() === cleanCode);
    if (!found) {
      throw new Error('Invalid discount or referral code.');
    }
    if (!found.isActive) {
      throw new Error('This promo code is currently paused or expired.');
    }
    if (found.maxUses !== null && found.usesCount >= found.maxUses) {
      throw new Error('This promo code has reached its maximum redemption limit.');
    }
    const basePrice = Math.max(0, Number(amount) || 0);
    const discountAmount =
      found.discountType === 'percentage'
        ? Math.round((basePrice * Math.min(100, found.discountValue)) / 100)
        : Math.min(basePrice, found.discountValue);
    const finalPrice = Math.max(0, basePrice - discountAmount);

    return {
      code: found.code,
      creatorName: found.creatorName,
      creatorHandle: found.creatorHandle,
      discountType: found.discountType,
      discountValue: found.discountValue,
      discountAmount,
      finalPrice
    };
  }
};
