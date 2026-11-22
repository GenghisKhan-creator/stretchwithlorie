import { pool } from '../config/db.js';
import { broadcast } from '../websocket.js';

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

// GET /api/dashboard/transactions (Admin Protected — Master Financial Ledger)
export async function getAllTransactions(req, res, next) {
  try {
    // 1. Class registrations (Paid)
    const registrationsRes = await pool.query(`
      SELECT
        id,
        'class_booking' AS stream_type,
        'Class Booking' AS stream_label,
        class_name AS item_title,
        student_name AS customer_name,
        email AS customer_email,
        phone AS customer_phone,
        amount,
        payment_method,
        payment_gateway,
        payment_status,
        paystack_ref,
        booking_ref,
        promo_code,
        discount_amount,
        slot_label,
        class_date,
        class_time,
        created_at AS timestamp
      FROM registrations
      ORDER BY created_at DESC
    `);

    // 2. Gift cards & subscription passes
    const giftCardsRes = await pool.query(`
      SELECT
        id,
        CASE WHEN card_type = 'subscription' THEN 'pass_purchase' ELSE 'gift_card_purchase' END AS stream_type,
        CASE WHEN card_type = 'subscription' THEN 'Monthly Flow Pass' ELSE 'Wellness Gift Card' END AS stream_label,
        COALESCE(plan_name, CASE WHEN card_type = 'subscription' THEN 'Monthly Flow Pass' ELSE 'Wellness Gift Voucher' END) AS item_title,
        COALESCE(buyer_name, recipient_name) AS customer_name,
        COALESCE(buyer_email, recipient_email) AS customer_email,
        COALESCE(buyer_phone, recipient_phone) AS customer_phone,
        amount,
        'Paystack Online' AS payment_method,
        'Paystack' AS payment_gateway,
        'Paid' AS payment_status,
        paystack_ref,
        code AS booking_ref,
        NULL AS promo_code,
        0 AS discount_amount,
        NULL AS slot_label,
        NULL AS class_date,
        NULL AS class_time,
        created_at AS timestamp
      FROM gift_cards
      ORDER BY created_at DESC
    `);

    // 3. Short video library unlocks
    const videoPurchasesRes = await pool.query(`
      SELECT
        vp.id,
        'video_purchase' AS stream_type,
        'Video Library Unlock' AS stream_label,
        COALESCE(v.title, 'On-Demand Video') AS item_title,
        vp.buyer_name AS customer_name,
        '' AS customer_email,
        vp.buyer_phone AS customer_phone,
        vp.amount_paid AS amount,
        COALESCE(vp.momo_network || ' MoMo', 'Paystack MoMo') AS payment_method,
        'Paystack' AS payment_gateway,
        'Paid' AS payment_status,
        vp.paystack_ref,
        vp.id AS booking_ref,
        NULL AS promo_code,
        0 AS discount_amount,
        NULL AS slot_label,
        NULL AS class_date,
        NULL AS class_time,
        vp.created_at AS timestamp
      FROM video_purchases vp
      LEFT JOIN videos v ON vp.video_id = v.id
      ORDER BY vp.created_at DESC
    `);

    const rawTransactions = [
      ...registrationsRes.rows.map(r => ({ ...r, amount: Number(r.amount) })),
      ...giftCardsRes.rows.map(g => ({ ...g, amount: Number(g.amount) })),
      ...videoPurchasesRes.rows.map(v => ({ ...v, amount: Number(v.amount) }))
    ];

    // Sort globally by timestamp DESC (newest transactions first)
    rawTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Calculate executive financial metrics
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const thisMonthPrefix = now.toISOString().slice(0, 7);

    let totalRevenue = 0;
    let todayRevenue = 0;
    let monthRevenue = 0;

    const breakdown = {
      classBookings: 0,
      flowPasses: 0,
      giftCards: 0,
      videoUnlocks: 0
    };

    for (const tx of rawTransactions) {
      const amt = tx.amount || 0;
      totalRevenue += amt;

      const txDateStr = tx.timestamp ? new Date(tx.timestamp).toISOString().slice(0, 10) : '';
      if (txDateStr === todayStr) {
        todayRevenue += amt;
      }
      if (txDateStr.startsWith(thisMonthPrefix)) {
        monthRevenue += amt;
      }

      if (tx.stream_type === 'class_booking') breakdown.classBookings += amt;
      else if (tx.stream_type === 'pass_purchase') breakdown.flowPasses += amt;
      else if (tx.stream_type === 'gift_card_purchase') breakdown.giftCards += amt;
      else if (tx.stream_type === 'video_purchase') breakdown.videoUnlocks += amt;
    }

    const avgTransactionValue = rawTransactions.length > 0 ? Math.round(totalRevenue / rawTransactions.length) : 0;

    res.json({
      success: true,
      count: rawTransactions.length,
      metrics: {
        totalRevenueGHS: totalRevenue,
        todayRevenueGHS: todayRevenue,
        monthRevenueGHS: monthRevenue,
        avgOrderValueGHS: avgTransactionValue,
        totalCount: rawTransactions.length,
        breakdown
      },
      data: rawTransactions.map(tx => ({
        id: tx.id,
        streamType: tx.stream_type,
        streamLabel: tx.stream_label,
        itemTitle: tx.item_title,
        customerName: tx.customer_name,
        customerEmail: tx.customer_email,
        customerPhone: tx.customer_phone,
        amount: tx.amount,
        paymentMethod: tx.payment_method,
        paymentGateway: tx.payment_gateway,
        paymentStatus: tx.payment_status,
        paystackRef: tx.paystack_ref,
        bookingRef: tx.booking_ref,
        promoCode: tx.promo_code,
        discountAmount: Number(tx.discount_amount || 0),
        slotLabel: tx.slot_label,
        classDate: tx.class_date,
        classTime: tx.class_time,
        timestamp: tx.timestamp
      }))
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/dashboard/purge-test-data (Admin Protected — Dev Testing Control)
// Wipes all operational test data (bookings, passes, inquiries, video purchases) while preserving admin auth
export async function purgeTestData(req, res, next) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Delete all student registrations & bookings
    const delRegs = await client.query('DELETE FROM registrations');

    // 2. Delete all video purchases
    const delPurchases = await client.query('DELETE FROM video_purchases');

    // 3. Delete all celebration event inquiries
    const delInquiries = await client.query('DELETE FROM event_inquiries');

    // 4. Delete all wellness gift cards & flow passes
    const delGiftCards = await client.query('DELETE FROM gift_cards');

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

    // 6. Reset videos: purchases_count = 0, views = 0
    await client.query('UPDATE videos SET views = 0, purchases_count = 0');

    // 7. Reset referral codes: uses_count = 0, revenue = 0, commission = 0
    await client.query(`
      UPDATE referral_codes SET
        uses_count = 0,
        total_revenue_generated = 0,
        total_commission_earned = 0,
        is_active = true
    `);

    await client.query('COMMIT');

    // Live broadcast to all connected admin clients to immediately refresh their view
    broadcast('DATABASE_PURGED', {
      clearedRegistrations: delRegs.rowCount,
      clearedGiftCards: delGiftCards.rowCount,
      clearedInquiries: delInquiries.rowCount,
      clearedVideoPurchases: delPurchases.rowCount
    });

    res.json({
      success: true,
      message: `Studio operational test data purged successfully. Cleared ${delRegs.rowCount} bookings, ${delGiftCards.rowCount} passes/vouchers, ${delInquiries.rowCount} celebration inquiries, and ${delPurchases.rowCount} video unlocks. Class attendee counts reset to 0. Admin authentication is 100% preserved.`,
      stats: {
        clearedRegistrations: delRegs.rowCount,
        clearedGiftCards: delGiftCards.rowCount,
        clearedInquiries: delInquiries.rowCount,
        clearedVideoPurchases: delPurchases.rowCount
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}
