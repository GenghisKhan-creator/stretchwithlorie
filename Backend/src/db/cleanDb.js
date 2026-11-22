import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE?.trim() || 'stretchwithlorie',
  password: process.env.PG_PASSWORD,
  port: parseInt(process.env.PG_PORT || '5432', 10)
});

async function cleanDatabase() {
  const client = await pool.connect();
  const wipeAll = process.argv.includes('--wipe-all');

  try {
    await client.query('BEGIN');

    console.log('[CleanDB] Starting database purge for fresh site testing...');

    // 1. Delete all student registrations & bookings
    const delRegs = await client.query('DELETE FROM registrations');
    console.log(`[CleanDB] Cleared ${delRegs.rowCount} student registrations.`);

    // 2. Delete all video purchases
    const delPurchases = await client.query('DELETE FROM video_purchases');
    console.log(`[CleanDB] Cleared ${delPurchases.rowCount} video purchases.`);

    // 3. Delete all celebration event inquiries
    const delInquiries = await client.query('DELETE FROM event_inquiries');
    console.log(`[CleanDB] Cleared ${delInquiries.rowCount} celebration inquiries.`);

    // 4. Delete all wellness gift cards
    const delGiftCards = await client.query('DELETE FROM gift_cards');
    console.log(`[CleanDB] Cleared ${delGiftCards.rowCount} gift cards.`);

    if (wipeAll) {
      // Complete wipe including catalog classes & videos
      const delClasses = await client.query('DELETE FROM classes');
      const delVideos = await client.query('DELETE FROM videos');
      const delRefs = await client.query('DELETE FROM referral_codes');
      console.log(`[CleanDB] Wiped all catalog items: ${delClasses.rowCount} classes, ${delVideos.rowCount} videos, ${delRefs.rowCount} referral codes.`);
    } else {
      // 5. Reset all classes: booked_count = 0, reset schedule slots and session options to 100% capacity
      const { rows: classes } = await client.query('SELECT id, max_capacity, schedule_slots, session_options FROM classes');

      for (const cls of classes) {
        let updatedSlots = null;
        if (cls.schedule_slots && Array.isArray(cls.schedule_slots)) {
          updatedSlots = cls.schedule_slots.map((s) => ({
            ...s,
            bookedCount: 0,
            spotsLeft: s.maxCapacity || 15,
            isFull: false
          }));
        }

        let updatedOptions = null;
        if (cls.session_options && Array.isArray(cls.session_options)) {
          updatedOptions = cls.session_options.map((opt) => ({
            ...opt,
            spotsLeft: opt.maxCapacity || 6,
            isFull: false
          }));
        }

        await client.query(
          `UPDATE classes SET
            booked_count = 0,
            schedule_slots = $1,
            session_options = $2,
            updated_at = CURRENT_TIMESTAMP
           WHERE id = $3`,
          [
            updatedSlots ? JSON.stringify(updatedSlots) : null,
            updatedOptions ? JSON.stringify(updatedOptions) : null,
            cls.id
          ]
        );
      }
      console.log(`[CleanDB] Reset ${classes.length} classes to 0 booked attendees with 100% room availability.`);

      // 6. Reset videos: purchases_count = 0, views = 0
      await client.query('UPDATE videos SET views = 0, purchases_count = 0');
      console.log('[CleanDB] Reset video views and purchase counts to 0.');

      // 7. Reset referral codes: uses_count = 0, revenue = 0, commission = 0
      await client.query(`
        UPDATE referral_codes SET
          uses_count = 0,
          total_revenue_generated = 0,
          total_commission_earned = 0,
          is_active = true
      `);
      console.log('[CleanDB] Reset creator referral codes to 0 uses (active and ready for promo testing).');
    }

    await client.query('COMMIT');
    console.log('[CleanDB] Database purge and reset completed successfully! Ready for live testing.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[CleanDB Error]: Failed to purge database:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

cleanDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
