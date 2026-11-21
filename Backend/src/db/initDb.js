import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client, Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  const targetDb = process.env.PG_DATABASE?.trim() || 'stretchwithlorie';
  const dbUser = process.env.PG_USER || 'postgres';
  const dbPassword = process.env.PG_PASSWORD;
  const dbHost = process.env.PG_HOST || 'localhost';
  const dbPort = parseInt(process.env.PG_PORT || '5432', 10);

  console.log(`[InitDB] Connecting to PostgreSQL at ${dbHost}:${dbPort}...`);

  // Step 1: Connect to default 'postgres' database to ensure target DB exists
  const rootClient = new Client({
    user: dbUser,
    host: dbHost,
    database: 'postgres',
    password: dbPassword,
    port: dbPort
  });

  try {
    await rootClient.connect();
    console.log('[InitDB] Connected to PostgreSQL server.');

    // Check if target database exists
    const checkDb = await rootClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDb]
    );

    if (checkDb.rowCount === 0) {
      // Strictly validate identifier before CREATE DATABASE to prevent SQL injection via env var
      if (!/^[a-zA-Z0-9_]+$/.test(targetDb)) {
        throw new Error(`Unsafe database identifier "${targetDb}". Only alphanumeric and underscore characters are allowed.`);
      }
      console.log(`[InitDB] Database "${targetDb}" does not exist. Creating...`);
      await rootClient.query(`CREATE DATABASE "${targetDb}"`);
      console.log(`[InitDB] Database "${targetDb}" created successfully.`);
    } else {
      console.log(`[InitDB] Database "${targetDb}" already exists.`);
    }
  } catch (err) {
    console.warn(`[InitDB Warning]: Could not auto-create database via root client: ${err.message}`);
    console.warn(`[InitDB]: Attempting direct connection to "${targetDb}"...`);
  } finally {
    try {
      await rootClient.end();
    } catch (_) {
      // ignore
    }
  }

  // Step 2: Connect to target database and execute schema.sql
  const targetPool = new Pool({
    user: dbUser,
    host: dbHost,
    database: targetDb,
    password: dbPassword,
    port: dbPort
  });

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log(`[InitDB] Applying schema from schema.sql to "${targetDb}"...`);
    await targetPool.query(sql);
    console.log(`[InitDB] Tables and indexes created successfully!`);
  } catch (err) {
    console.error(`[InitDB Error]: Failed to apply schema:`, err.message);
    throw err;
  } finally {
    await targetPool.end();
  }
}

initDatabase()
  .then(() => {
    console.log('[InitDB] Database initialization completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[InitDB] Fatal initialization error:', err);
    process.exit(1);
  });
