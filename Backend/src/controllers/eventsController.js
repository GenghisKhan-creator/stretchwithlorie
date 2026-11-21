import crypto from 'crypto';
import { pool } from '../config/db.js';

const ALLOWED_EVENT_STATUSES = ['pending', 'contacted', 'confirmed', 'cancelled'];

// POST /api/events
export async function createEventInquiry(req, res, next) {
  try {
    const {
      occasionType,
      fullName,
      phone,
      email,
      guestCount = 1,
      preferredDate = '',
      locationPreference = 'Studio Sanctuary',
      notes = ''
    } = req.body;

    if (!occasionType || !fullName || !phone || !email) {
      return res.status(400).json({
        success: false,
        error: 'Occasion type, Full Name, Phone, and Email are required.'
      });
    }

    if (
      String(occasionType).length > 100 ||
      String(fullName).length > 150 ||
      String(phone).length > 40 ||
      String(email).length > 150 ||
      String(preferredDate).length > 100 ||
      String(locationPreference).length > 150 ||
      String(notes).length > 2000
    ) {
      return res.status(400).json({
        success: false,
        error: 'One or more inquiry fields exceed maximum allowed length.'
      });
    }

    const parsedGuestCount = Math.min(500, Math.max(1, parseInt(guestCount, 10) || 1));
    const id = `evt-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;

    const { rows } = await pool.query(
      `INSERT INTO event_inquiries (
        id, occasion_type, full_name, phone, email, guest_count,
        preferred_date, location_preference, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
      RETURNING *`,
      [
        id,
        String(occasionType).trim(),
        String(fullName).trim(),
        String(phone).trim(),
        String(email).trim().toLowerCase(),
        parsedGuestCount,
        String(preferredDate).trim(),
        String(locationPreference).trim(),
        String(notes).trim()
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Inquiry received! Lorie will reach out via WhatsApp / phone to curate your celebration.',
      data: rows[0]
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/events
export async function getAllEventInquiries(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM event_inquiries ORDER BY created_at DESC');
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/events/:id/status
export async function updateEventStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const cleanStatus = String(status || '').trim().toLowerCase();

    if (!ALLOWED_EVENT_STATUSES.includes(cleanStatus)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Allowed values: ${ALLOWED_EVENT_STATUSES.join(', ')}`
      });
    }

    const { rows } = await pool.query(
      `UPDATE event_inquiries SET status = $1 WHERE id = $2 RETURNING *`,
      [cleanStatus, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Inquiry not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
}
