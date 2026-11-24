import { pool } from './config/db.js';

async function test() {
  try {
    const id = 'test-' + Date.now();
    const query = `INSERT INTO classes (
      id, title, badge, category, instructor_name, instructor_role, instructor_avatar,
      date_text, time_text, duration, price, location_pricing, max_capacity, booked_count,
      level, room, description, tagline, has_schedule_slots, schedule_slots,
      has_session_options, session_options, is_private_one_on_one, is_pass_eligible, image_url, image_position
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 0, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
    RETURNING *`;
    const params = [
      id, 'Test Class', null, 'Yoga Classes', 'Lorie', 'Founder', null,
      'Monday, Nov 24, 2026', '08:00 AM', '60 min', 160, null, 15,
      'All Levels', 'Studio Sanctuary', 'Test description', null,
      false, null, false, null, false, true, null, 'object-center'
    ];
    const r = await pool.query(query, params);
    console.log('Insert success:', r.rows[0].id);
    await pool.query('DELETE FROM classes WHERE id = $1', [id]);
    console.log('Cleaned up test row');
    process.exit(0);
  } catch (err) {
    console.error('Insert error:', err);
    process.exit(1);
  }
}

test();
