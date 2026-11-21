import crypto from 'crypto';
import { pool } from '../config/db.js';
import { isSafeMediaUrl } from '../middleware/securityMiddleware.js';

export function formatVideo(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    creatorName: row.creator_name,
    creatorRole: 'Founder & Lead Yoga Specialist',
    fullDurationMinutes: row.full_duration_minutes,
    fullDurationLabel: row.full_duration_label,
    previewSeconds: row.preview_duration_secs,
    minPrice: Number(row.price_ghs),
    category: row.category,
    thumbnail: row.thumbnail,
    videoUrl: row.video_url,
    description: row.description,
    views: row.views,
    purchasesCount: row.purchases_count,
    createdAt: row.created_at
  };
}

// GET /api/videos
export async function getAllVideos(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM videos ORDER BY created_at DESC');
    res.json({ success: true, count: rows.length, data: rows.map(formatVideo) });
  } catch (err) {
    next(err);
  }
}

// GET /api/videos/:id
export async function getVideoById(req, res, next) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM videos WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }
    res.json({ success: true, data: formatVideo(rows[0]) });
  } catch (err) {
    next(err);
  }
}

// POST /api/videos (Admin only)
export async function createVideo(req, res, next) {
  try {
    const {
      title,
      creatorName = 'Lorie',
      fullDurationMinutes = 20,
      minPrice = 30,
      category = 'Spine & Posture',
      thumbnail = '/src/assets/flexibility_masterclass.jpg',
      videoUrl = '',
      description = ''
    } = req.body;

    if (!title || String(title).trim().length === 0 || String(title).length > 255) {
      return res.status(400).json({ success: false, error: 'A valid title (up to 255 characters) is required.' });
    }

    if (!isSafeMediaUrl(thumbnail) || !isSafeMediaUrl(videoUrl)) {
      return res.status(400).json({ success: false, error: 'Invalid or unsafe media URL protocol.' });
    }

    const parsedDuration = Math.min(300, Math.max(1, parseInt(fullDurationMinutes, 10) || 20));
    const finalPrice = Math.min(5000, Math.max(30, Number(minPrice) || 30));
    const id = `vid-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;
    const fullDurationLabel = `${parsedDuration} mins`;

    const { rows } = await pool.query(
      `INSERT INTO videos (
        id, title, creator_name, full_duration_minutes, full_duration_label,
        preview_duration_secs, price_ghs, category, thumbnail, video_url, description
      ) VALUES ($1, $2, $3, $4, $5, 30, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        id,
        String(title).trim(),
        String(creatorName).trim().slice(0, 100),
        parsedDuration,
        fullDurationLabel,
        finalPrice,
        String(category).trim().slice(0, 100),
        thumbnail,
        videoUrl,
        String(description).trim().slice(0, 2000)
      ]
    );

    res.status(201).json({ success: true, data: formatVideo(rows[0]) });
  } catch (err) {
    next(err);
  }
}

// POST /api/videos/:id/purchase (Unlock Full Video)
export async function purchaseVideo(req, res, next) {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const {
      buyerName,
      buyerPhone,
      amount,
      momoNetwork = 'MTN',
      paystackRef = `pstk_vid_${crypto.randomBytes(6).toString('hex')}`
    } = req.body;

    if (!buyerName || !buyerPhone) {
      return res.status(400).json({ success: false, error: 'Buyer name and phone are required.' });
    }

    if (String(buyerName).length > 150 || String(buyerPhone).length > 40) {
      return res.status(400).json({ success: false, error: 'Buyer name or phone exceeds maximum allowed length.' });
    }

    await client.query('BEGIN');

    // 1. Check video
    const videoRes = await client.query('SELECT * FROM videos WHERE id = $1 FOR UPDATE', [id]);
    if (videoRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    const video = videoRes.rows[0];
    const minRequired = Number(video.price_ghs) || 30;
    const numericAmount = Number(amount);
    const finalAmount = Number.isFinite(numericAmount)
      ? Math.min(10000, Math.max(minRequired, numericAmount))
      : minRequired;

    // 2. Record purchase
    const purchaseId = `vpur-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;
    await client.query(
      `INSERT INTO video_purchases (
        id, video_id, buyer_name, buyer_phone, amount_paid, momo_network, paystack_ref
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        purchaseId,
        id,
        String(buyerName).trim(),
        String(buyerPhone).trim(),
        finalAmount,
        String(momoNetwork).slice(0, 50),
        String(paystackRef).slice(0, 100)
      ]
    );

    // 3. Increment purchases count
    const updateVidRes = await client.query(
      `UPDATE videos SET purchases_count = purchases_count + 1 WHERE id = $1 RETURNING *`,
      [id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: `Full video unlocked for ${String(buyerName).trim()}!`,
      purchase: {
        id: purchaseId,
        videoId: id,
        amountPaid: finalAmount,
        paystackRef
      },
      video: formatVideo(updateVidRes.rows[0])
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

// GET /api/videos/purchases (Admin Dashboard)
export async function getAllVideoPurchases(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT vp.*, v.title AS video_title
       FROM video_purchases vp
       JOIN videos v ON vp.video_id = v.id
       ORDER BY vp.created_at DESC`
    );
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
}
