import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const isProduction = process.env.NODE_ENV === 'production';
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

export const pool = new Pool(
  hasDatabaseUrl
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes('localhost')
          ? false
          : { rejectUnauthorized: false },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000
      }
    : {
        user: process.env.PG_USER || 'postgres',
        host: process.env.PG_HOST || 'localhost',
        database: process.env.PG_DATABASE?.trim() || 'stretchwithlorie',
        password: process.env.PG_PASSWORD,
        port: parseInt(process.env.PG_PORT || '5432', 10),
        ssl: process.env.PG_SSL === 'true' || isProduction ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
      }
);

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]:', err.message);
});

export const query = (text, params) => pool.query(text, params);

export async function testConnection(silent = false) {
  try {
    const res = await pool.query('SELECT NOW() AS current_time, current_database() AS db_name');
    if (!silent) {
      console.log(`[PostgreSQL Connected]: Database "${res.rows[0].db_name}" at ${res.rows[0].current_time}`);
    }
    return true;
  } catch (err) {
    if (!silent) {
      console.error(`[PostgreSQL Connection Error]: ${err.message}`);
    }
    return false;
  }
}

export default pool;
