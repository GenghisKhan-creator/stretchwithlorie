// API Service Abstraction for stretchwithlorie
// YOGA CLASSES, PRIVATE BOOKINGS & SPECIAL EXPERIENCES
//
// PAYSTACK INTEGRATION GUIDE:
// When your backend is ready, you can integrate Paystack in one of two ways:
//
// 1. Direct Paystack Inline JS (Frontend Trigger):
//    import PaystackPop from '@paystack/inline-js';
//    const paystack = new PaystackPop();
//    paystack.newTransaction({
//      key: process.env.VITE_PAYSTACK_PUBLIC_KEY, // e.g. pk_test_xxxx or pk_live_xxxx
//      email: bookingData.email,
//      amount: bookingData.amount * 100, // in pesewas (e.g. 200 * 100 = 20000)
//      currency: 'GHS',
//      channels: ['mobile_money', 'card'],
//      metadata: {
//        custom_fields: [
//          { display_name: "Class Name", variable_name: "class_name", value: bookingData.classTitle },
//          { display_name: "Student Name", variable_name: "student_name", value: bookingData.fullName },
//          { display_name: "Phone", variable_name: "phone", value: bookingData.phone },
//          { display_name: "Location", variable_name: "location", value: bookingData.locationType }
//        ]
//      },
//      onSuccess: (transaction) => {
//        // Send transaction.reference to your backend for verification
//        api.verifyAndRecordBooking(transaction.reference, bookingData);
//      },
//      onCancel: () => {
//        console.log('User cancelled Paystack popup');
//      }
//    });
//
// 2. Standard Backend Initialization (Server-to-Server Flow):
//    POST /api/paystack/initialize -> calls https://api.paystack.co/transaction/initialize
//    Returns authorization_url and reference. Webhook listens for 'charge.success'.

import { INITIAL_CLASSES, INITIAL_REGISTRATIONS } from '../data/mockData';

const STORAGE_KEY_CLASSES = 'stretchwithlorie_classes_v9';
const STORAGE_KEY_REGISTRATIONS = 'stretchwithlorie_registrations_v9';

// Helper to simulate realistic network latency (e.g. 400ms - 1200ms)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Initialize storage with default data if empty
 */
function initStorage() {
  if (!localStorage.getItem(STORAGE_KEY_CLASSES)) {
    localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(INITIAL_CLASSES));
  }
  if (!localStorage.getItem(STORAGE_KEY_REGISTRATIONS)) {
    localStorage.setItem(STORAGE_KEY_REGISTRATIONS, JSON.stringify(INITIAL_REGISTRATIONS));
  }
}

initStorage();

export const api = {
  /**
   * Fetch all upcoming classes
   * Backend equivalent: return (await fetch('/api/classes')).json()
   */
  async getClasses() {
    await delay(150);
    const data = localStorage.getItem(STORAGE_KEY_CLASSES);
    if (!data) return INITIAL_CLASSES;
    try {
      const parsed = JSON.parse(data);
      // Ensure static assets, updated slots, and session options are properly hydrated
      return parsed.map((cls) => {
        const initial = INITIAL_CLASSES.find((ic) => ic.id === cls.id);
        return {
          ...cls,
          image: cls.image || initial?.image,
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
   * Backend equivalent: return (await fetch(`/api/classes/${id}`)).json()
   */
  async getClassById(id) {
    await delay(150);
    const classes = await this.getClasses();
    return classes.find((c) => c.id === id) || null;
  },

  /**
   * Process booking and Paystack payment
   * Backend equivalent:
   * return (await fetch('/api/bookings', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify(bookingData)
   * })).json()
   */
  async createBooking(bookingData) {
    // Simulate Paystack Mobile Money push prompt latency & authorization
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

    // 1. Check schedule slot availability if class has slots
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

        // Increment slot booking
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

    // 2. Check session options availability if class has session options
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

    // Overall class capacity check
    const totalMax = targetClass.maxCapacity;
    const currentBooked = targetClass.bookedCount;
    if (totalMax && currentBooked >= totalMax && !updatedSlots) {
      throw new Error('This session is fully booked. Please select another time or experience.');
    }

    // Generate internal studio booking reference (e.g. SWL-8592)
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const bookingRef = `SWL-${randomCode}`;

    // Generate realistic Paystack Transaction Reference (e.g. pstk_tr_9xa7bf102)
    const paystackRef = `pstk_${Math.random().toString(36).substring(2, 8)}_${Date.now().toString(36)}`;
    const now = new Date();

    const finalAmount = bookingData.amount || targetClass.price;
    
    // Class name with slot label if applicable
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

    // Calculate total booked count and full status for the class
    const newClassBookedCount = updatedSlots
      ? updatedSlots.reduce((sum, s) => sum + (s.bookedCount || 0), 0)
      : targetClass.bookedCount + 1;

    const isClassFullyBooked = updatedSlots
      ? updatedSlots.every((s) => s.isFull || s.spotsLeft <= 0)
      : newClassBookedCount >= targetClass.maxCapacity;

    // Update class in storage
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

    // Save registration
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
   * Fetch all live registrations for the Instructor Dashboard
   * Backend equivalent: return (await fetch('/api/registrations')).json()
   */
  async getRegistrations() {
    await delay(200);
    const data = localStorage.getItem(STORAGE_KEY_REGISTRATIONS);
    return data ? JSON.parse(data) : INITIAL_REGISTRATIONS;
  },

  /**
   * Add a new class (Instructor Dashboard)
   * Backend equivalent:
   * return (await fetch('/api/classes', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify(classData)
   * })).json()
   */
  async createClass(classData) {
    await delay(300);
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
   * Toggle student check-in status (attendance)
   * Backend equivalent: return (await fetch(`/api/registrations/${id}/checkin`, { method: 'PATCH' })).json()
   */
  async toggleCheckIn(registrationId) {
    await delay(100);
    const registrations = await this.getRegistrations();
    const updated = registrations.map((r) =>
      r.id === registrationId ? { ...r, checkedIn: !r.checkedIn } : r
    );
    localStorage.setItem(STORAGE_KEY_REGISTRATIONS, JSON.stringify(updated));
    return updated.find((r) => r.id === registrationId);
  },

  /**
   * Reset data back to initial mock state (useful for testing & demo)
   */
  resetToDefaults() {
    localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(INITIAL_CLASSES));
    localStorage.setItem(STORAGE_KEY_REGISTRATIONS, JSON.stringify(INITIAL_REGISTRATIONS));
  }
};