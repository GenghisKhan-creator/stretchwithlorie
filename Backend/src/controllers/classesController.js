import { pool } from '../config/db.js';
import { isSafeMediaUrl } from '../middleware/securityMiddleware.js';
import { broadcast } from '../websocket.js';

// Format database row to frontend-friendly camelCase object
export function formatClass(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    badge: row.badge,
    category: row.category,
    instructor: {
      name: row.instructor_name || 'Lorie',
      role: row.instructor_role || 'Founder & Lead Yoga Specialist',
      avatar: row.instructor_avatar || '/images/lorie_avatar.jpg'
    },
    date: row.date_text,
    time: row.time_text,
    duration: row.duration || '60 min',
    price: Number(row.price),
    locationPricing: row.location_pricing || null,
    maxCapacity: row.max_capacity,
    bookedCount: row.booked_count,
    level: row.level,
    room: row.room,
    description: row.description,
    tagline: row.tagline,
    hasScheduleSlots: row.has_schedule_slots,
    scheduleSlots: row.schedule_slots || null,
    hasSessionOptions: row.has_session_options,
    sessionOptions: row.session_options || null,
    isPrivateOneOnOne: row.is_private_one_on_one,
    isPassEligible: row.is_pass_eligible !== undefined && row.is_pass_eligible !== null ? Boolean(row.is_pass_eligible) : (!row.is_private_one_on_one && row.category === 'Yoga Classes'),
    image: row.image_url,
    imagePosition: row.image_position || 'object-center',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// GET /api/classes
export async function getAllClasses(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM classes ORDER BY created_at ASC');
    const classes = rows.map(formatClass);
    res.json({ success: true, count: classes.length, data: classes });
  } catch (err) {
    next(err);
  }
}

// GET /api/classes/:id
export async function getClassById(req, res, next) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM classes WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Experience not found' });
    }
    res.json({ success: true, data: formatClass(rows[0]) });
  } catch (err) {
    next(err);
  }
}

// POST /api/classes
export async function createClass(req, res, next) {
  try {
    const {
      id = `cls-${Date.now()}`,
      title,
      badge,
      category,
      instructor = {},
      date,
      time,
      duration = '60 min',
      price = 0,
      locationPricing = null,
      maxCapacity = 15,
      level = 'All Levels',
      room = 'Studio Sanctuary',
      description = '',
      tagline = null,
      hasScheduleSlots = false,
      scheduleSlots = null,
      hasSessionOptions = false,
      sessionOptions = null,
      isPrivateOneOnOne = false,
      image = null,
      imagePosition = 'object-center'
    } = req.body;

    if (!title || !category || !date || !time) {
      return res.status(400).json({ success: false, error: 'Title, category, date, and time are required.' });
    }

    if (!isSafeMediaUrl(image) || !isSafeMediaUrl(instructor?.avatar)) {
      return res.status(400).json({ success: false, error: 'Invalid or unsafe image URL protocol.' });
    }

    const safePrice = Math.min(50000, Math.max(0, Number(price) || 0));
    const safeMaxCapacity = Math.min(500, Math.max(1, parseInt(maxCapacity, 10) || 15));
    const resolvedIsPassEligible = req.body.isPassEligible !== undefined
      ? Boolean(req.body.isPassEligible)
      : (!isPrivateOneOnOne && category === 'Yoga Classes');

    const { rows } = await pool.query(
      `INSERT INTO classes (
        id, title, badge, category, instructor_name, instructor_role, instructor_avatar,
        date_text, time_text, duration, price, location_pricing, max_capacity, booked_count,
        level, room, description, tagline, has_schedule_slots, schedule_slots,
        has_session_options, session_options, is_private_one_on_one, is_pass_eligible, image_url, image_position
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 0, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
      RETURNING *`,
      [
        id,
        title,
        badge || null,
        category,
        instructor.name || 'Lorie',
        instructor.role || 'Founder & Lead Yoga Specialist',
        instructor.avatar || null,
        date,
        time,
        duration,
        safePrice,
        locationPricing ? JSON.stringify(locationPricing) : null,
        safeMaxCapacity,
        level,
        room,
        description,
        tagline || null,
        hasScheduleSlots,
        scheduleSlots ? JSON.stringify(scheduleSlots) : null,
        hasSessionOptions,
        sessionOptions ? JSON.stringify(sessionOptions) : null,
        isPrivateOneOnOne,
        resolvedIsPassEligible,
        image || null,
        imagePosition
      ]
    );

    const formatted = formatClass(rows[0]);
    broadcast('CLASS_CREATED', formatted);
    res.status(201).json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
}

// PUT /api/classes/:id
export async function updateClass(req, res, next) {
  try {
    const { id } = req.params;
    const {
      title,
      badge,
      category,
      price,
      maxCapacity,
      room,
      duration,
      level,
      date,
      dateText,
      time,
      timeText,
      description,
      scheduleSlots,
      sessionOptions,
      isPassEligible
    } = req.body;

    const resolvedDateText = dateText || date;
    const resolvedTimeText = timeText || time;

    const { rows } = await pool.query(
      `UPDATE classes SET
        title = COALESCE($1, title),
        badge = COALESCE($2, badge),
        category = COALESCE($3, category),
        price = COALESCE($4::numeric, price),
        max_capacity = COALESCE($5::int, max_capacity),
        room = COALESCE($6, room),
        duration = COALESCE($7, duration),
        level = COALESCE($8, level),
        date_text = COALESCE($9, date_text),
        time_text = COALESCE($10, time_text),
        description = COALESCE($11, description),
        schedule_slots = COALESCE($12::jsonb, schedule_slots),
        session_options = COALESCE($13::jsonb, session_options),
        is_pass_eligible = COALESCE($14::boolean, is_pass_eligible),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $15
      RETURNING *`,
      [
        title || null,
        badge || null,
        category || null,
        price !== undefined ? Number(price) : null,
        maxCapacity !== undefined ? Number(maxCapacity) : null,
        room || null,
        duration || null,
        level || null,
        resolvedDateText || null,
        resolvedTimeText || null,
        description || null,
        scheduleSlots ? JSON.stringify(scheduleSlots) : null,
        sessionOptions ? JSON.stringify(sessionOptions) : null,
        isPassEligible !== undefined ? Boolean(isPassEligible) : null,
        id
      ]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    const formatted = formatClass(rows[0]);
    broadcast('CLASS_UPDATED', formatted);
    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/classes/:id
export async function deleteClass(req, res, next) {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM classes WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }
    broadcast('CLASS_DELETED', { id });
    res.json({ success: true, message: 'Class deleted successfully' });
  } catch (err) {
    next(err);
  }
}
