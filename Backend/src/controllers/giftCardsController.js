import crypto from 'crypto';
import { pool } from '../config/db.js';
import { maskEmail, maskPhone } from '../middleware/securityMiddleware.js';

// POST /api/gift-cards
export async function createGiftCard(req, res, next) {
  try {
    const {
      recipientName,
      recipientPhone = '',
      recipientEmail = '',
      buyerName,
      buyerPhone,
      buyerEmail = '',
      amount,
      personalNote = '',
      paystackRef = `pstk_gift_${crypto.randomBytes(6).toString('hex')}`
    } = req.body;

    if (!recipientName || !buyerName || !buyerPhone || amount === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Recipient Name, Buyer Name, Phone, and Gift Amount are required.'
      });
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 50 || numericAmount > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Gift card amount must be between GH₵ 50 and GH₵ 10,000.'
      });
    }

    if (
      String(recipientName).length > 150 ||
      String(buyerName).length > 150 ||
      String(buyerPhone).length > 40 ||
      String(recipientPhone).length > 40 ||
      String(personalNote).length > 500
    ) {
      return res.status(400).json({
        success: false,
        error: 'One or more gift card fields exceed maximum allowed length.'
      });
    }

    const id = `gift-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;
    const randomCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    const code = `SWL-GIFT-${randomCode}`;

    const { rows } = await pool.query(
      `INSERT INTO gift_cards (
        id, code, recipient_name, recipient_phone, recipient_email,
        buyer_name, buyer_phone, buyer_email, amount, personal_note, paystack_ref, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active')
      RETURNING *`,
      [
        id,
        code,
        String(recipientName).trim(),
        String(recipientPhone).trim(),
        String(recipientEmail).trim().toLowerCase(),
        String(buyerName).trim(),
        String(buyerPhone).trim(),
        String(buyerEmail).trim().toLowerCase(),
        numericAmount,
        String(personalNote).trim(),
        String(paystackRef).slice(0, 100)
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Gift card generated successfully!',
      data: rows[0]
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/gift-cards/:code (Public lookup — masks phone & email PII)
export async function getGiftCardByCode(req, res, next) {
  try {
    const { code } = req.params;
    const { rows } = await pool.query('SELECT * FROM gift_cards WHERE code = $1', [String(code || '').trim().toUpperCase()]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Gift card code not found or invalid.' });
    }
    const row = rows[0];
    res.json({
      success: true,
      data: {
        id: row.id,
        code: row.code,
        recipientName: row.recipient_name,
        recipientPhone: maskPhone(row.recipient_phone),
        recipientEmail: maskEmail(row.recipient_email),
        buyerName: row.buyer_name,
        amount: Number(row.amount),
        personalNote: row.personal_note,
        status: row.status,
        createdAt: row.created_at
      }
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/gift-cards/:code/redeem
export async function redeemGiftCard(req, res, next) {
  try {
    const { code } = req.params;
    const { rows } = await pool.query(
      `UPDATE gift_cards
       SET status = 'redeemed'
       WHERE code = $1 AND status = 'active'
       RETURNING id, code, recipient_name, amount, status, created_at`,
      [String(code || '').trim().toUpperCase()]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Gift card is either invalid, already redeemed, or expired.'
      });
    }

    res.json({ success: true, message: 'Gift card redeemed successfully!', data: rows[0] });
  } catch (err) {
    next(err);
  }
}

// GET /api/gift-cards (Admin Protected — full records)
export async function getAllGiftCards(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM gift_cards ORDER BY created_at DESC');
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
}
