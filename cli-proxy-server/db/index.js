import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';

let db = null;

export function getDb() {
  if (db) return db;
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn('[db] DATABASE_URL not set — database features disabled.');
    return null;
  }
  const sql = neon(url);
  db = drizzle(sql, { schema });
  console.log('[db] Connected to Neon Postgres');
  return db;
}

export function isDbAvailable() {
  return !!process.env.DATABASE_URL;
}

export { schema };
