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

async function migrate() {
  try {
    console.log('[Migration] Adding redeemed_at and redemption_history to gift_cards...');
    await pool.query(`
      ALTER TABLE gift_cards ADD COLUMN IF NOT EXISTS redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
      ALTER TABLE gift_cards ADD COLUMN IF NOT EXISTS redemption_history JSONB DEFAULT '[]'::jsonb;
    `);

    // Backfill redeemed_at for any gift cards that already have classes_used > 0 or status != 'active'
    await pool.query(`
      UPDATE gift_cards
      SET redeemed_at = created_at + interval '10 minutes'
      WHERE redeemed_at IS NULL AND (classes_used > 0 OR status IN ('exhausted', 'redeemed'));
    `);

    console.log('[Migration] Successfully updated gift_cards schema and backfilled timestamps!');
  } catch (err) {
    console.error('[Migration Error]:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
