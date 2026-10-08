import { pool } from "./pool.js";

export async function runSessionMigrations() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS whatsapp_sessions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'qr',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'whatsapp_sessions_status_check'
      ) THEN
        ALTER TABLE whatsapp_sessions ADD CONSTRAINT whatsapp_sessions_status_check
          CHECK (status IN ('qr', 'ready', 'paused', 'disconnected', 'failed'));
      END IF;
    END
    $$;
  `);
}
