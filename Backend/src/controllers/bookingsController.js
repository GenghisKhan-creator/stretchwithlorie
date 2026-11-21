import crypto from 'crypto';
import { pool } from '../config/db.js';
import { formatClass } from './classesController.js';
import { computeDiscount } from './referralsController.js';
import { maskEmail, maskPhone } from '../middleware/securityMiddleware.js';

// Format registration row to camelCase
export function formatRegistration(row) {
  if (!row) return null;
  return {
    id: row.id,
    bookingRef: row.booking_ref,
    paystackRef: row.paystack_ref,
    studentName: row.student_name,
    email: row.email,
    phone: row.phone,
    classId: row.class_id,
    className: row.class_name,
    classDate: row.class_date,
    classTime: row.class_time,
    slotId: row.slot_id,
    slotLabel: row.slot_label,
    locationType: row.location_type,
    clientAddress: row.client_address || '',
    instructor: row.instructor || 'Lorie',
    amount: Number(row.amount),
    paymentStatus: row.payment_status,
    paymentGateway: row.payment_gateway,
    paymentMethod: row.payment_method,
    healthNotes: row.health_notes,
    promoCode: row.promo_code || null,
    discountAmount: Number(row.discount_amount || 0),
    creatorName: row.creator_name || null,
    checkedIn: row.checked_in,
    registeredAt: row.created_at
  };
}

// POST /api/bookings
export async function createBooking(req, res, next) {
  const client = await pool.connect();

  try {
    const {
      classId,
      fullName,
      email,
      phone,
      slotId,
      selectedSlot,
      selectedSessionId,
      selectedOptionId,
      selectedSessionOption,
      selectedTimeWindow,
      locationType,
      locationOption,
      clientAddress = '',
      paymentMethod = 'Paystack (MTN MoMo)',
      healthNotes = 'None reported',
      promoCode = null
    } = req.body;

    if (!classId || !fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Class ID, Full Name, Email, and Phone number are required.'
      });
    }

    if (
      String(fullName).length > 150 ||
      String(email).length > 150 ||
      String(phone).length > 40 ||
      String(healthNotes).length > 2000 ||
      String(clientAddress).length > 300
    ) {
      return res.status(400).json({
        success: false,
        error: 'One or more input fields exceed maximum allowed length.'
      });
    }

    await client.query('BEGIN');

    // 1. Fetch class with row lock for update
    const classRes = await client.query('SELECT * FROM classes WHERE id = $1 FOR UPDATE', [classId]);
    if (classRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Experience not found. Please refresh.' });
    }

    const targetClass = classRes.rows[0];
    let scheduleSlots = targetClass.schedule_slots;
    let sessionOptions = targetClass.session_options;
    let selectedSlotObj = null;
    let selectedOptionObj = null;

    // 2. Schedule slot check & decrement
    if (scheduleSlots && scheduleSlots.length > 0) {
      selectedSlotObj = scheduleSlots.find(
        (s) =>
          s.id === slotId ||
          `${s.day} ${s.time}` === selectedSlot ||
          s.label === selectedSlot ||
          (selectedSlot && selectedSlot.includes(s.day))
      );

      if (selectedSlotObj) {
        const spotsLeft = selectedSlotObj.spotsLeft ?? (selectedSlotObj.maxCapacity - selectedSlotObj.bookedCount);
        if (selectedSlotObj.isFull || spotsLeft <= 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            error: `The ${selectedSlotObj.label} session is fully booked. Please select another slot.`
          });
        }

        scheduleSlots = scheduleSlots.map((s) => {
          if (s.id === selectedSlotObj.id) {
            const newBooked = (s.bookedCount || 0) + 1;
            const newSpots = Math.max(0, (s.maxCapacity || 15) - newBooked);
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

    // 3. Session options check & decrement
    if (sessionOptions && sessionOptions.length > 0) {
      selectedOptionObj = sessionOptions.find(
        (opt) =>
          opt.id === selectedSessionId ||
          opt.id === selectedOptionId ||
          opt.label === selectedSessionOption ||
          opt.timeWindow === selectedTimeWindow
      );

      if (selectedOptionObj) {
        const spotsLeft = selectedOptionObj.spotsLeft ?? 1;
        if (selectedOptionObj.isFull || spotsLeft <= 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            error: `The selected session date/window (${selectedOptionObj.label || selectedOptionObj.date}) is fully booked.`
          });
        }

        sessionOptions = sessionOptions.map((opt) => {
          if (opt.id === selectedOptionObj.id) {
            const newSpots = Math.max(0, spotsLeft - 1);
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

    // 4. Overall capacity check
    const currentBooked = targetClass.booked_count;
    const maxCap = targetClass.max_capacity;
    if (maxCap && currentBooked >= maxCap && !scheduleSlots) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'This session is fully booked. Please select another time or experience.'
      });
    }

    // 5. Generate cryptographically strong identifiers (32-bit hex entropy prevents enumeration)
    const randomCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    const bookingRef = `SWL-${randomCode}`;
    const paystackRef = `pstk_${crypto.randomBytes(6).toString('hex')}_${Date.now().toString(36)}`;
    const regId = `reg-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;

    // Base price calculation (Studio vs Client's Location for private 1-on-1)
    let basePrice = Number(targetClass.price) || 0;
    if (targetClass.location_pricing) {
      basePrice =
        locationOption === 'clientLocation'
          ? Number(targetClass.location_pricing.clientLocation || targetClass.price)
          : Number(targetClass.location_pricing.studio || targetClass.price);
    }

    // Check and apply promo / creator referral code if provided
    // SECURITY: Never trust client-supplied req.body.amount; always compute finalAmount on the server
    let appliedCode = null;
    let appliedDiscount = 0;
    let appliedCreator = null;
    let finalAmount = basePrice;

    if (promoCode && String(promoCode).trim()) {
      const cleanCode = String(promoCode).trim().toUpperCase();
      const refRes = await client.query(
        'SELECT * FROM referral_codes WHERE UPPER(code) = $1 FOR UPDATE',
        [cleanCode]
      );
      if (refRes.rows.length > 0) {
        const refRow = refRes.rows[0];
        if (refRow.is_active && (refRow.max_uses === null || refRow.uses_count < refRow.max_uses)) {
          const calc = computeDiscount(basePrice, refRow);
          appliedCode = refRow.code;
          appliedDiscount = calc.discountAmount;
          appliedCreator = refRow.creator_name;
          finalAmount = calc.finalPrice;

          const commissionEarned = Math.round((finalAmount * Number(refRow.commission_percent || 0)) / 100);
          await client.query(
            `UPDATE referral_codes
             SET uses_count = uses_count + 1,
                 total_revenue_generated = total_revenue_generated + $1,
                 total_commission_earned = total_commission_earned + $2
             WHERE id = $3`,
            [finalAmount, commissionEarned, refRow.id]
          );
        }
      }
    }

    let finalClassName = targetClass.title;
    if (selectedSlotObj) {
      finalClassName = `${targetClass.title} (${selectedSlotObj.label})`;
    } else if (selectedOptionObj) {
      finalClassName = `${targetClass.title} - ${selectedOptionObj.label || selectedOptionObj.date || selectedOptionObj.timeWindow}`;
    }

    const finalDate = selectedSlotObj
      ? selectedSlotObj.day
      : req.body.preferredDate || selectedOptionObj?.date || targetClass.date_text;

    const finalTime = selectedSlotObj
      ? `${selectedSlotObj.time} (60 min)`
      : selectedOptionObj?.time || selectedOptionObj?.timeWindow || targetClass.time_text;

    const resolvedLocationType = locationType || (locationOption === 'clientLocation' ? "Client's Location" : 'Studio Sanctuary');

    // 6. Insert registration
    const insertRegRes = await client.query(
      `INSERT INTO registrations (
        id, booking_ref, paystack_ref, student_name, email, phone, class_id,
        class_name, class_date, class_time, slot_id, slot_label, location_type,
        client_address, instructor, amount, payment_status, payment_gateway,
        payment_method, health_notes, promo_code, discount_amount, creator_name, checked_in
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, false)
      RETURNING *`,
      [
        regId,
        bookingRef,
        paystackRef,
        fullName.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        targetClass.id,
        finalClassName,
        finalDate,
        finalTime,
        selectedSlotObj?.id || null,
        selectedSlotObj?.label || null,
        resolvedLocationType,
        clientAddress.trim(),
        targetClass.instructor_name || 'Lorie',
        finalAmount,
        'Paid',
        'Paystack',
        paymentMethod,
        healthNotes.trim(),
        appliedCode,
        appliedDiscount,
        appliedCreator
      ]
    );

    // 7. Update class booked count and slots
    const newBookedCount = scheduleSlots
      ? scheduleSlots.reduce((sum, s) => sum + (s.bookedCount || 0), 0)
      : currentBooked + 1;

    const updateClassRes = await client.query(
      `UPDATE classes SET
        booked_count = $1,
        schedule_slots = $2,
        session_options = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *`,
      [
        newBookedCount,
        scheduleSlots ? JSON.stringify(scheduleSlots) : null,
        sessionOptions ? JSON.stringify(sessionOptions) : null,
        targetClass.id
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      registration: formatRegistration(insertRegRes.rows[0]),
      updatedClass: formatClass(updateClassRes.rows[0])
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

// GET /api/registrations (Instructor Dashboard)
export async function getAllRegistrations(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM registrations ORDER BY created_at DESC');
    res.json({ success: true, count: rows.length, data: rows.map(formatRegistration) });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/registrations/:id/checkin
export async function toggleCheckIn(req, res, next) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `UPDATE registrations
       SET checked_in = NOT checked_in
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Registration not found' });
    }

    res.json({ success: true, data: formatRegistration(rows[0]) });
  } catch (err) {
    next(err);
  }
}

// GET /api/bookings/ref/:bookingRef (Public ticket verification — masks sensitive PII & medical history)
export async function getBookingByRef(req, res, next) {
  try {
    const { bookingRef } = req.params;
    const cleanRef = String(bookingRef || '').trim().toUpperCase();
    const { rows } = await pool.query('SELECT * FROM registrations WHERE UPPER(booking_ref) = $1', [cleanRef]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking reference not found' });
    }
    const full = formatRegistration(rows[0]);
    const publicSafeTicket = {
      id: full.id,
      bookingRef: full.bookingRef,
      studentName: full.studentName,
      email: maskEmail(full.email),
      phone: maskPhone(full.phone),
      classId: full.classId,
      className: full.className,
      classDate: full.classDate,
      classTime: full.classTime,
      slotLabel: full.slotLabel,
      locationType: full.locationType,
      instructor: full.instructor,
      amount: full.amount,
      paymentStatus: full.paymentStatus,
      checkedIn: full.checkedIn,
      registeredAt: full.registeredAt
    };
    res.json({ success: true, data: publicSafeTicket });
  } catch (err) {
    next(err);
  }
}
