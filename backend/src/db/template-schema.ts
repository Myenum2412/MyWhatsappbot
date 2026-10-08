import { pool } from "./pool.js";

export async function runTemplateMigrations() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS message_templates (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      header TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL DEFAULT '',
      footer TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}
