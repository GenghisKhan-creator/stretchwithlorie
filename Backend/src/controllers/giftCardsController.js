import crypto from 'crypto';
import { pool } from '../config/db.js';
import { formatClass } from './classesController.js';
import { formatRegistration } from './bookingsController.js';
import { maskEmail, maskPhone } from '../middleware/securityMiddleware.js';
import { broadcast } from '../websocket.js';

// Format gift card row for consistent API response
export function formatGiftCard(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    cardType: row.card_type || 'gift',
    planId: row.plan_id || null,
    planName: row.plan_name || null,
    totalClasses: row.total_classes !== null ? Number(row.total_classes) : (row.card_type === 'subscription' ? 4 : 1),
    classesRemaining: row.classes_remaining !== null ? Number(row.classes_remaining) : (row.status === 'active' ? 1 : 0),
    classesUsed: Number(row.classes_used || 0),
    recipientName: row.recipient_name,
    recipientPhone: row.recipient_phone,
    recipientEmail: row.recipient_email,
    buyerName: row.buyer_name,
    buyerPhone: row.buyer_phone,
    buyerEmail: row.buyer_email,
    amount: Number(row.amount),
    balance: row.balance !== null ? Number(row.balance) : Number(row.amount),
    personalNote: row.personal_note || '',
    paystackRef: row.paystack_ref,
    status: row.status,
    createdAt: row.created_at,
    redeemedAt: row.redeemed_at || null,
    redemptionHistory: typeof row.redemption_history === 'string'
      ? JSON.parse(row.redemption_history)
      : (Array.isArray(row.redemption_history) ? row.redemption_history : [])
  };
}

// POST /api/gift-cards
export async function createGiftCard(req, res, next) {
  try {
    const {
      cardType = 'gift', // 'subscription' | 'gift'
      planId = null,
      planName = null,
      totalClasses,
      classesRemaining,
      recipientName,
      recipientPhone = '',
      recipientEmail = '',
      buyerName,
      buyerPhone,
      buyerEmail = '',
      amount,
      balance,
      personalNote = '',
      paystackRef = `pstk_${cardType === 'subscription' ? 'pass' : 'gift'}_${crypto.randomBytes(6).toString('hex')}`,
      preferredCode
    } = req.body;

    const resolvedRecipient = recipientName || buyerName;
    const resolvedBuyer = buyerName || recipientName;

    if (!resolvedRecipient || !resolvedBuyer || !buyerPhone || amount === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Recipient Name, Buyer Name, Phone, and Amount are required.'
      });
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 10 || numericAmount > 20000) {
      return res.status(400).json({
        success: false,
        error: 'Pass or gift card amount must be between GH₵ 10 and GH₵ 20,000.'
      });
    }

    if (
      String(resolvedRecipient).length > 150 ||
      String(resolvedBuyer).length > 150 ||
      String(buyerPhone).length > 40 ||
      String(recipientPhone).length > 40 ||
      String(personalNote).length > 500
    ) {
      return res.status(400).json({
        success: false,
        error: 'One or more fields exceed maximum allowed length.'
      });
    }

    const id = `${cardType === 'subscription' ? 'pass' : 'gift'}-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;
    
    // Generate clean, memorable human-readable code
    let code = preferredCode ? String(preferredCode).trim().toUpperCase() : null;
    if (!code || !code.startsWith('SWL-')) {
      const entropy = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars (e.g. 4B82A1)
      const prefix = cardType === 'subscription' ? 'SWL-PASS' : 'SWL-GIFT';
      code = `${prefix}-${entropy}`;
    }

    const resolvedTotalClasses = totalClasses !== undefined
      ? Number(totalClasses)
      : (cardType === 'subscription' ? 4 : 1);

    const resolvedRemaining = classesRemaining !== undefined
      ? Number(classesRemaining)
      : resolvedTotalClasses;

    const resolvedBalance = balance !== undefined
      ? Number(balance)
      : numericAmount;

    const { rows } = await pool.query(
      `INSERT INTO gift_cards (
        id, code, recipient_name, recipient_phone, recipient_email,
        buyer_name, buyer_phone, buyer_email, amount, balance, personal_note, paystack_ref,
        status, card_type, plan_id, plan_name, total_classes, classes_remaining, classes_used
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active', $13, $14, $15, $16, $17, 0)
      RETURNING *`,
      [
        id,
        code,
        String(resolvedRecipient).trim(),
        String(recipientPhone).trim(),
        String(recipientEmail).trim().toLowerCase(),
        String(resolvedBuyer).trim(),
        String(buyerPhone).trim(),
        String(buyerEmail).trim().toLowerCase(),
        numericAmount,
        resolvedBalance,
        String(personalNote).trim(),
        String(paystackRef).slice(0, 100),
        cardType,
        planId ? String(planId).slice(0, 50) : null,
        planName ? String(planName).slice(0, 150) : (cardType === 'subscription' ? 'Monthly Flow Pass' : 'Wellness Gift Card'),
        resolvedTotalClasses,
        resolvedRemaining
      ]
    );

    const formatted = formatGiftCard(rows[0]);
    broadcast('NEW_GIFT_CARD', formatted);

    res.status(201).json({
      success: true,
      message: cardType === 'subscription' ? 'Monthly Flow Pass generated successfully!' : 'Gift card generated successfully!',
      data: formatted
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/gift-cards/:code (Public lookup — masks phone & email PII)
export async function getGiftCardByCode(req, res, next) {
  try {
    const { code } = req.params;
    const clean = String(code || '').trim().toUpperCase();
    const { rows } = await pool.query('SELECT * FROM gift_cards WHERE UPPER(code) = $1', [clean]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Pass or gift card code not found or invalid.' });
    }
    const row = rows[0];
    res.json({
      success: true,
      data: {
        id: row.id,
        code: row.code,
        cardType: row.card_type || 'gift',
        planId: row.plan_id || null,
        planName: row.plan_name || (row.card_type === 'subscription' ? 'Monthly Flow Pass' : 'Wellness Gift Card'),
        totalClasses: row.total_classes !== null ? Number(row.total_classes) : (row.card_type === 'subscription' ? 4 : 1),
        classesRemaining: row.classes_remaining !== null ? Number(row.classes_remaining) : (row.status === 'active' ? 1 : 0),
        classesUsed: Number(row.classes_used || 0),
        recipientName: row.recipient_name,
        recipientPhone: maskPhone(row.recipient_phone),
        recipientEmail: maskEmail(row.recipient_email),
        buyerName: row.buyer_name,
        amount: Number(row.amount),
        balance: row.balance !== null ? Number(row.balance) : Number(row.amount),
        personalNote: row.personal_note,
        status: row.status,
        createdAt: row.created_at
      }
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/gift-cards/:code/walk-in (Desk walk-in check-in)
export async function deskWalkInBooking(req, res, next) {
  const client = await pool.connect();
  try {
    const { code } = req.params;
    const {
      classId,
      slotId,
      selectedSlot,
      studentName,
      studentPhone,
      studentEmail,
      notes = 'Desk walk-in check-in'
    } = req.body;

    const cleanCode = String(code || '').trim().toUpperCase();
    if (!classId) {
      return res.status(400).json({ success: false, error: 'Target Class ID is required for walk-in check-in.' });
    }

    await client.query('BEGIN');

    // 1. Lock and fetch gift card / pass
    const cardRes = await client.query(
      'SELECT * FROM gift_cards WHERE UPPER(code) = $1 FOR UPDATE',
      [cleanCode]
    );

    if (cardRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: `Card or pass code "${cleanCode}" not found.` });
    }

    const cardRow = cardRes.rows[0];
    if (cardRow.status !== 'active') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: `This pass is currently ${cardRow.status} and cannot be used.`
      });
    }

    // 2. Lock and fetch class
    const classRes = await client.query('SELECT * FROM classes WHERE id = $1 FOR UPDATE', [classId]);
    if (classRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Experience not found. Please refresh.' });
    }

    const targetClass = classRes.rows[0];

    // Enforce Option A: Subscription passes only apply to Studio Group Classes
    if (cardRow.card_type === 'subscription') {
      const isEligible = targetClass.is_pass_eligible !== false &&
        !targetClass.is_private_one_on_one &&
        targetClass.category === 'Yoga Classes';

      if (!isEligible) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: `Monthly Flow Passes apply to Studio Group Classes only. "${targetClass.title}" is a premium experience.`
        });
      }

      const remaining = cardRow.classes_remaining !== null ? Number(cardRow.classes_remaining) : 1;
      if (remaining <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: `All ${cardRow.total_classes || 4} classes on this Monthly Flow Pass have been used.`
        });
      }
    } else {
      // Cash gift voucher check
      const currentBalance = cardRow.balance !== null ? Number(cardRow.balance) : Number(cardRow.amount);
      const classPrice = Number(targetClass.price || 0);
      if (currentBalance < classPrice) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: `Voucher balance (GH₵ ${currentBalance}) is insufficient for this class (GH₵ ${classPrice}).`
        });
      }
    }

    // 3. Decrement slot or class capacity
    let scheduleSlots = targetClass.schedule_slots;
    let selectedSlotObj = null;

    if (scheduleSlots && scheduleSlots.length > 0) {
      selectedSlotObj = scheduleSlots.find(
        (s) =>
          s.id === slotId ||
          `${s.day} ${s.time}` === selectedSlot ||
          s.label === selectedSlot ||
          (selectedSlot && selectedSlot.includes(s.day))
      ) || scheduleSlots[0];

      if (selectedSlotObj) {
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

    const newBookedCount = (targetClass.booked_count || 0) + 1;
    const updateClassRes = await client.query(
      `UPDATE classes
       SET booked_count = $1,
           schedule_slots = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [newBookedCount, scheduleSlots ? JSON.stringify(scheduleSlots) : null, targetClass.id]
    );

    // 4. Prepare walk-in registration details & identifiers
    const regId = `reg-desk-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;
    const bookingRef = `SWL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const studentFullName = studentName?.trim() || cardRow.recipient_name || cardRow.buyer_name || 'Walk-in Student';
    const studentEmailAddr = studentEmail?.trim() || cardRow.recipient_email || cardRow.buyer_email || 'passholder@stretchwithlorie.com';
    const studentPhoneNum = studentPhone?.trim() || cardRow.recipient_phone || cardRow.buyer_phone || 'N/A';
    const finalDate = selectedSlotObj ? `${selectedSlotObj.day} Flow` : targetClass.date_text;
    const finalTime = selectedSlotObj ? selectedSlotObj.time : targetClass.time_text;
    const walkInIntake = {
      practicedBefore: 'Yes',
      experienceLevel: 'Regular Member',
      mainGoal: 'Studio Practice & Mobility',
      customGoal: '',
      hasInjuries: 'No',
      injuriesDetails: '',
      pregnancyStatus: 'No',
      instructorNotes: notes || 'Front desk walk-in check-in',
      returningNotes: ''
    };

    // 5. Decrement pass or voucher & record exact redemption timestamp + history
    let updatedCardRow = null;
    let paymentMethodName = '';

    if (cardRow.card_type === 'subscription') {
      const newRemaining = Number(cardRow.classes_remaining) - 1;
      const newUsed = Number(cardRow.classes_used || 0) + 1;
      const newStatus = newRemaining === 0 ? 'exhausted' : 'active';
      const redemptionEvent = {
        timestamp: new Date().toISOString(),
        action: 'desk_walk_in',
        classId: targetClass.id,
        className: targetClass.title,
        studentName: studentFullName,
        bookingRef,
        slot: selectedSlotObj?.label || finalTime,
        classesRemainingAfter: newRemaining
      };

      const updatePassRes = await client.query(
        `UPDATE gift_cards
         SET classes_remaining = $1, classes_used = $2, status = $3,
             redeemed_at = CURRENT_TIMESTAMP,
             redemption_history = COALESCE(redemption_history, '[]'::jsonb) || $4::jsonb
         WHERE id = $5
         RETURNING *`,
        [newRemaining, newUsed, newStatus, JSON.stringify([redemptionEvent]), cardRow.id]
      );
      updatedCardRow = updatePassRes.rows[0];
      paymentMethodName = `Monthly Flow Pass (Desk Check-in • ${cardRow.code})`;
    } else {
      const classPrice = Number(targetClass.price || 0);
      const newBalance = Math.max(0, Number(cardRow.balance || cardRow.amount) - classPrice);
      const newStatus = newBalance === 0 ? 'redeemed' : 'active';
      const redemptionEvent = {
        timestamp: new Date().toISOString(),
        action: 'desk_walk_in',
        classId: targetClass.id,
        className: targetClass.title,
        studentName: studentFullName,
        bookingRef,
        amountDeducted: classPrice,
        balanceAfter: newBalance
      };

      const updateVoucherRes = await client.query(
        `UPDATE gift_cards
         SET balance = $1, status = $2,
             redeemed_at = CURRENT_TIMESTAMP,
             redemption_history = COALESCE(redemption_history, '[]'::jsonb) || $3::jsonb
         WHERE id = $4
         RETURNING *`,
        [newBalance, newStatus, JSON.stringify([redemptionEvent]), cardRow.id]
      );
      updatedCardRow = updateVoucherRes.rows[0];
      paymentMethodName = `Gift Voucher (Desk Check-in • ${cardRow.code})`;
    }

    // 6. Create confirmed & checked-in registration

    const insertRegRes = await client.query(
      `INSERT INTO registrations (
        id, booking_ref, paystack_ref, student_name, email, phone, class_id,
        class_name, class_date, class_time, slot_id, slot_label, location_type,
        client_address, instructor, amount, payment_status, payment_gateway,
        payment_method, health_notes, checked_in, intake, is_first_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, '', $14, 0, 'Paid', 'Studio Desk', $15, $16, true, $17, false)
      RETURNING *`,
      [
        regId,
        bookingRef,
        `desk_${cardRow.code}`,
        studentFullName,
        studentEmailAddr.toLowerCase(),
        studentPhoneNum,
        targetClass.id,
        targetClass.title,
        finalDate,
        finalTime,
        selectedSlotObj?.id || null,
        selectedSlotObj?.label || null,
        'Studio Sanctuary',
        targetClass.instructor_name || 'Lorie',
        paymentMethodName,
        notes,
        JSON.stringify(walkInIntake)
      ]
    );

    await client.query('COMMIT');

    const formattedReg = formatRegistration(insertRegRes.rows[0]);
    const formattedClass = formatClass(updateClassRes.rows[0]);
    const formattedCard = formatGiftCard(updatedCardRow);

    broadcast('NEW_REGISTRATION', { registration: formattedReg, updatedClass: formattedClass });
    broadcast('GIFT_CARD_REDEEMED', formattedCard);
    broadcast('CLASS_UPDATED', formattedClass);

    res.json({
      success: true,
      message: `Walk-in student checked in! 1 session deducted from pass (${formattedCard.classesRemaining} left).`,
      data: {
        registration: formattedReg,
        class: formattedClass,
        giftCard: formattedCard
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

// PATCH /api/gift-cards/:id/adjust (Admin adjustment: +1 Courtesy session, balance fix)
export async function adjustCard(req, res, next) {
  try {
    const { id } = req.params;
    const { deltaClasses = 0, deltaBalance = 0, reason = 'Administrative courtesy adjustment' } = req.body;

    const { rows: existing } = await pool.query('SELECT * FROM gift_cards WHERE id = $1', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Card not found.' });
    }

    const card = existing[0];
    let updateQuery;
    let params;

    if (card.card_type === 'subscription') {
      const newRemaining = Math.max(0, (card.classes_remaining || 0) + Number(deltaClasses));
      const newTotal = Math.max(1, (card.total_classes || 4) + (Number(deltaClasses) > 0 ? Number(deltaClasses) : 0));
      const newStatus = newRemaining > 0 ? 'active' : 'exhausted';
      updateQuery = `UPDATE gift_cards SET classes_remaining = $1, total_classes = $2, status = $3, personal_note = COALESCE(personal_note, '') || ' [Adj: ' || $4 || ']' WHERE id = $5 RETURNING *`;
      params = [newRemaining, newTotal, newStatus, reason, id];
    } else {
      const newBalance = Math.max(0, Number(card.balance || card.amount) + Number(deltaBalance));
      const newStatus = newBalance > 0 ? 'active' : 'redeemed';
      updateQuery = `UPDATE gift_cards SET balance = $1, status = $2, personal_note = COALESCE(personal_note, '') || ' [Adj: ' || $3 || ']' WHERE id = $4 RETURNING *`;
      params = [newBalance, newStatus, reason, id];
    }

    const { rows } = await pool.query(updateQuery, params);
    const formatted = formatGiftCard(rows[0]);
    broadcast('GIFT_CARD_REDEEMED', formatted);

    res.json({
      success: true,
      message: `Card adjusted successfully (${card.card_type === 'subscription' ? `${formatted.classesRemaining} classes left` : `GH₵ ${formatted.balance} balance`})`,
      data: formatted
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/gift-cards/:id/void (Admin void/cancel)
export async function voidCard(req, res, next) {
  try {
    const { id } = req.params;
    const { reason = 'Voided by studio administrator' } = req.body;

    const { rows } = await pool.query(
      `UPDATE gift_cards
       SET status = 'voided', personal_note = COALESCE(personal_note, '') || ' [Voided: ' || $1 || ']'
       WHERE id = $2
       RETURNING *`,
      [reason, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Card not found.' });
    }

    const formatted = formatGiftCard(rows[0]);
    broadcast('GIFT_CARD_REDEEMED', formatted);

    res.json({
      success: true,
      message: `Card ${formatted.code} has been voided.`,
      data: formatted
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/gift-cards/:code/redeem (Safe backwards-compatible single voucher redemption)
export async function redeemGiftCard(req, res, next) {
  try {
    const { code } = req.params;
    const clean = String(code || '').trim().toUpperCase();

    // Check card type: if subscription, only decrement 1 session rather than wiping all!
    const { rows: existing } = await pool.query('SELECT * FROM gift_cards WHERE UPPER(code) = $1', [clean]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Card not found.' });
    }

    const card = existing[0];
    if (card.status !== 'active') {
      return res.status(400).json({ success: false, error: `Card is ${card.status}.` });
    }

    let updateQuery;
    let params;

    if (card.card_type === 'subscription') {
      const newRemaining = Math.max(0, Number(card.classes_remaining || 1) - 1);
      const newUsed = Number(card.classes_used || 0) + 1;
      const newStatus = newRemaining === 0 ? 'exhausted' : 'active';
      const redemptionEvent = {
        timestamp: new Date().toISOString(),
        action: 'manual_redeem',
        note: 'Admin manual pass session deduction',
        classesRemainingAfter: newRemaining
      };
      updateQuery = `UPDATE gift_cards SET classes_remaining = $1, classes_used = $2, status = $3, redeemed_at = CURRENT_TIMESTAMP, redemption_history = COALESCE(redemption_history, '[]'::jsonb) || $4::jsonb WHERE id = $5 RETURNING *`;
      params = [newRemaining, newUsed, newStatus, JSON.stringify([redemptionEvent]), card.id];
    } else {
      const redemptionEvent = {
        timestamp: new Date().toISOString(),
        action: 'manual_redeem',
        note: 'Admin manual voucher redemption to 0',
        amountDeducted: Number(card.balance || card.amount),
        balanceAfter: 0
      };
      updateQuery = `UPDATE gift_cards SET balance = 0, status = 'redeemed', redeemed_at = CURRENT_TIMESTAMP, redemption_history = COALESCE(redemption_history, '[]'::jsonb) || $1::jsonb WHERE id = $2 RETURNING *`;
      params = [JSON.stringify([redemptionEvent]), card.id];
    }

    const { rows } = await pool.query(updateQuery, params);
    const formatted = formatGiftCard(rows[0]);
    broadcast('GIFT_CARD_REDEEMED', formatted);

    res.json({ success: true, message: 'Deducted 1 session successfully!', data: formatted });
  } catch (err) {
    next(err);
  }
}

// GET /api/gift-cards (Admin Protected — full records)
export async function getAllGiftCards(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM gift_cards ORDER BY created_at DESC');
    const formatted = rows.map(formatGiftCard);
    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (err) {
    next(err);
  }
}
