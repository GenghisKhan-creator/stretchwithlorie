import { pool } from '../config/db.js';

// GET /api/dashboard/stats
export async function getDashboardStats(req, res, next) {
  try {
    // 1. Class registrations revenue & counts
    const regStats = await pool.query(`
      SELECT
        COUNT(*)::int AS total_bookings,
        COUNT(CASE WHEN checked_in = true THEN 1 END)::int AS checked_in_count,
        COALESCE(SUM(amount), 0)::numeric AS class_revenue
      FROM registrations
      WHERE payment_status = 'Paid'
    `);

    // 2. Video purchases revenue & count
    const videoStats = await pool.query(`
      SELECT
        COUNT(*)::int AS total_video_unlocks,
        COALESCE(SUM(amount_paid), 0)::numeric AS video_revenue
      FROM video_purchases
    `);

    // 3. Gift cards revenue & count
    const giftStats = await pool.query(`
      SELECT
        COUNT(*)::int AS total_gift_cards,
        COALESCE(SUM(amount), 0)::numeric AS gift_card_revenue
      FROM gift_cards
    `);

    // 4. Inquiries count
    const eventStats = await pool.query(`
      SELECT COUNT(*)::int AS total_event_inquiries FROM event_inquiries
    `);

    // 5. Popular classes
    const popularClasses = await pool.query(`
      SELECT
        c.id,
        c.title,
        c.category,
        c.price,
        c.booked_count,
        c.max_capacity,
        COUNT(r.id)::int AS registered_students
      FROM classes c
      LEFT JOIN registrations r ON c.id = r.class_id
      GROUP BY c.id
      ORDER BY registered_students DESC
      LIMIT 5
    `);

    const classRev = Number(regStats.rows[0].class_revenue);
    const videoRev = Number(videoStats.rows[0].video_revenue);
    const giftRev = Number(giftStats.rows[0].gift_card_revenue);
    const totalRev = classRev + videoRev + giftRev;

    const totalBookings = regStats.rows[0].total_bookings;
    const checkedIn = regStats.rows[0].checked_in_count;
    const attendanceRate = totalBookings > 0 ? Math.round((checkedIn / totalBookings) * 100) : 0;

    res.json({
      success: true,
      stats: {
        totalRevenueGHS: totalRev,
        revenueBreakdown: {
          classBookingsGHS: classRev,
          videoVaultGHS: videoRev,
          giftCardsGHS: giftRev
        },
        totalBookings,
        checkedInStudents: checkedIn,
        attendanceRatePercent: attendanceRate,
        videoUnlocksCount: videoStats.rows[0].total_video_unlocks,
        giftCardsIssuedCount: giftStats.rows[0].total_gift_cards,
        eventInquiriesCount: eventStats.rows[0].total_event_inquiries
      },
      popularClasses: popularClasses.rows
    });
  } catch (err) {
    next(err);
  }
}
