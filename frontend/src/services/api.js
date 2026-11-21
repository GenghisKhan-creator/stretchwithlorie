// API Service Abstraction for Stretch With Lorie
// Connects to Express.js + PostgreSQL Backend (http://localhost:5000/api)
// with seamless LocalStorage fallback if backend is offline.

import { INITIAL_CLASSES, INITIAL_REGISTRATIONS, DEFAULT_INSTRUCTOR_AVATAR } from '../data/mockData';

const STORAGE_KEY_CLASSES = 'stretchwithlorie_classes_v10';
const STORAGE_KEY_REGISTRATIONS = 'stretchwithlorie_registrations_v10';
const STORAGE_KEY_REFERRALS = 'stretchwithlorie_referrals_v1';
const STORAGE_KEY_ADMIN_TOKEN = 'stretchwithlorie_admin_token';
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '/api';

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
    usesCount: 4,
    totalRevenueGenerated: 680,
    totalCommissionEarned: 68,
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
    usesCount: 7,
    totalRevenueGenerated: 1190,
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
