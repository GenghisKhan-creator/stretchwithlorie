import { pool } from '../config/db.js';

export function formatReferralCode(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    creatorName: row.creator_name,
    creatorHandle: row.creator_handle || '',
    creatorPhone: row.creator_phone || '',
    discountType: row.discount_type, // 'percentage' | 'fixed'
    discountValue: Number(row.discount_value),
    commissionPercent: Number(row.commission_percent),
    maxUses: row.max_uses !== null ? Number(row.max_uses) : null,
    usesCount: Number(row.uses_count || 0),
    totalRevenueGenerated: Number(row.total_revenue_generated || 0),
    totalCommissionEarned: Number(row.total_commission_earned || 0),
    isActive: row.is_active,
    notes: row.notes || '',
    createdAt: row.created_at
  };
}

// Helper to calculate discount amount given a base price and referral row
export function computeDiscount(basePrice, referralRow) {
  const price = Math.max(0, Number(basePrice) || 0);
  if (!referralRow || !referralRow.is_active) {
    return { discountAmount: 0, finalPrice: price };
  }
  if (referralRow.max_uses !== null && referralRow.uses_count >= referralRow.max_uses) {
    return { discountAmount: 0, finalPrice: price };
  }

  let discountAmount = 0;
  const val = Number(referralRow.discount_value) || 0;
  if (referralRow.discount_type === 'percentage') {
    const clampedPct = Math.min(100, Math.max(0, val));
    discountAmount = Math.round((price * clampedPct) / 100);
  } else {
    discountAmount = Math.min(price, Math.max(0, val));
  }

  // Keep a minimum payable floor of GH₵ 10 if original price > 0 unless 100% off
  const finalPrice = Math.max(0, price - discountAmount);
  return { discountAmount, finalPrice };
}

// PUBLIC: POST /api/referrals/validate
export async function validateReferralCode(req, res, next) {
  try {
    const { code, amount } = req.body;
    if (!code || !String(code).trim()) {
      return res.status(400).json({ success: false, error: 'Please enter a referral or discount code.' });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const { rows } = await pool.query('SELECT * FROM referral_codes WHERE UPPER(code) = $1', [cleanCode]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Invalid discount or referral code.' });
    }

    const refRow = rows[0];
    if (!refRow.is_active) {
      return res.status(400).json({ success: false, error: 'This promo code is currently paused or expired.' });
    }

    if (refRow.max_uses !== null && refRow.uses_count >= refRow.max_uses) {
      return res.status(400).json({ success: false, error: 'This promo code has reached its maximum redemption limit.' });
    }

    const basePrice = Number(amount) || 0;
    const { discountAmount, finalPrice } = computeDiscount(basePrice, refRow);

    res.json({
      success: true,
      data: {
        code: refRow.code,
        creatorName: refRow.creator_name,
        creatorHandle: refRow.creator_handle,
        discountType: refRow.discount_type,
        discountValue: Number(refRow.discount_value),
        discountAmount,
        finalPrice
      }
    });
  } catch (err) {
    next(err);
  }
}

// ADMIN: GET /api/referrals
export async function getAllReferralCodes(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM referral_codes ORDER BY created_at DESC');
    res.json({
      success: true,
      count: rows.length,
      data: rows.map(formatReferralCode)
    });
  } catch (err) {
    next(err);
  }
}

// ADMIN: POST /api/referrals
export async function createReferralCode(req, res, next) {
  try {
    const {
      code,
      creatorName,
      creatorHandle = '',
      creatorPhone = '',
      discountType = 'percentage',
      discountValue = 10,
      commissionPercent = 10,
      maxUses = null,
      notes = ''
    } = req.body;

    if (!code || !creatorName) {
      return res.status(400).json({
        success: false,
        error: 'Code and Creator / Campaign Name are required.'
      });
    }

    const cleanCode = String(code).trim().toUpperCase().replace(/\s+/g, '');
    const id = `ref-${Date.now()}`;
    const parsedMaxUses = maxUses && Number(maxUses) > 0 ? Number(maxUses) : null;

    const existing = await pool.query('SELECT id FROM referral_codes WHERE UPPER(code) = $1', [cleanCode]);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Code "${cleanCode}" already exists. Please choose another code.`
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO referral_codes (
        id, code, creator_name, creator_handle, creator_phone,
        discount_type, discount_value, commission_percent, max_uses, notes, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
      RETURNING *`,
      [
        id,
        cleanCode,
        creatorName.trim(),
        creatorHandle.trim(),
        creatorPhone.trim(),
        discountType === 'fixed' ? 'fixed' : 'percentage',
        Math.max(0, Number(discountValue) || 0),
        Math.min(100, Math.max(0, Number(commissionPercent) || 0)),
        parsedMaxUses,
        notes.trim()
      ]
    );

    res.status(201).json({
      success: true,
      data: formatReferralCode(rows[0])
    });
  } catch (err) {
    next(err);
  }
}

// ADMIN: PATCH /api/referrals/:id/toggle
export async function toggleReferralCodeStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `UPDATE referral_codes
       SET is_active = NOT is_active
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Referral code not found.' });
    }

    res.json({
      success: true,
      data: formatReferralCode(rows[0])
    });
  } catch (err) {
    next(err);
  }
}

// ADMIN: DELETE /api/referrals/:id
export async function deleteReferralCode(req, res, next) {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM referral_codes WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Referral code not found.' });
    }
    res.json({ success: true, message: 'Referral code deleted.' });
  } catch (err) {
    next(err);
  }
}
