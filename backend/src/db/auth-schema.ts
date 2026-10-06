import bcrypt from "bcryptjs";
import { pool } from "./pool.js";

export const VALID_ROLES = ["orgmenu", "businessowners"] as const;
export type UserRole = (typeof VALID_ROLES)[number];

const SEED_USERS: Array<{
  name: string;
  email: string;
  role: UserRole;
  password: string;
}> = [
  {
    name: "Org Menu Admin",
    email: "orgmenu@example.com",
    role: "orgmenu",
    password: process.env.SEED_ORGMENU_PASSWORD ?? "ChangeMe123!",
  },
  {
    name: "Business Owner",
    email: "businessowner@example.com",
    role: "businessowners",
    password: process.env.SEED_OWNER_PASSWORD ?? "ChangeMe123!",
  },
];

export async function runAuthMigrations() {
  // Base table (creates if missing, e.g. fresh DB)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Add new columns for auth + roles (idempotent)
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT;`);
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;`
  );

  // Backfill existing rows without a role
  await pool.query(
    `UPDATE users SET role = 'businessowners' WHERE role IS NULL;`
  );

  // Enforce valid roles going forward
  await pool.query(`ALTER TABLE users ALTER COLUMN role SET NOT NULL;`);
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
      ) THEN
        ALTER TABLE users ADD CONSTRAINT users_role_check
          CHECK (role IN ('orgmenu', 'businessowners'));
      END IF;
    END
    $$;
  `);

  // Password reset tokens (one-time, expiring)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Seed the 2 users (one per role)
  for (const u of SEED_USERS) {
    const existing = await pool.query(`SELECT id FROM users WHERE email = $1`, [
      u.email,
    ]);
    if (existing.rowCount === 0) {
      const hash = await bcrypt.hash(u.password, 10);
      await pool.query(
        `INSERT INTO users (name, email, role, password_hash) VALUES ($1, $2, $3, $4)`,
        [u.name, u.email, u.role, hash]
      );
    }
  }
}
