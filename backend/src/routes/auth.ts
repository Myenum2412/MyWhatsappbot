import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { VALID_ROLES, type UserRole } from "../db/auth-schema.js";

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(VALID_ROLES),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  password_hash: string | null;
  created_at: string;
}

function getJwtSecret(): string {
  return process.env.JWT_SECRET ?? "dev-only-secret-change-me";
}

function toPublicUser(row: UserRow) {
  return { id: row.id, name: row.name, email: row.email, role: row.role };
}

export async function authRoutes(app: FastifyInstance) {
  // Common signup — caller picks role (orgmenu | businessowners)
  app.post("/api/auth/signup", async (req, reply) => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    const existing = await pool.query(`SELECT id FROM users WHERE email = $1`, [
      parsed.data.email,
    ]);
    if ((existing.rowCount ?? 0) > 0) {
      return reply.status(409).send({ error: "Email already registered" });
    }
    const hash = await bcrypt.hash(parsed.data.password, 10);
    const { rows } = await pool.query<UserRow>(
      `INSERT INTO users (name, email, role, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, password_hash, created_at`,
      [parsed.data.name, parsed.data.email, parsed.data.role, hash]
    );
    const user = toPublicUser(rows[0]);
    const token = jwt.sign(user, getJwtSecret(), { expiresIn: "7d" });
    return reply.status(201).send({ user, token });
  });

  // Common login — same page for both roles, response includes role
  app.post("/api/auth/login", async (req, reply) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    const { rows } = await pool.query<UserRow>(
      `SELECT id, name, email, role, password_hash, created_at FROM users WHERE email = $1`,
      [parsed.data.email]
    );
    const row = rows[0];
    if (!row || !row.password_hash) {
      return reply.status(401).send({ error: "Invalid email or password" });
    }
    const ok = await bcrypt.compare(parsed.data.password, row.password_hash);
    if (!ok) {
      return reply.status(401).send({ error: "Invalid email or password" });
    }
    const user = toPublicUser(row);
    const token = jwt.sign(user, getJwtSecret(), { expiresIn: "7d" });
    return { user, token };
  });

  app.get("/api/auth/me", async (req, reply) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "Missing token" });
    }
    try {
      const payload = jwt.verify(header.slice(7), getJwtSecret());
      return { user: payload };
    } catch {
      return reply.status(401).send({ error: "Invalid token" });
    }
  });

  // List all users — orgmenu role only (feeds the Users table).
  // Every signup lands here, so new business accounts appear immediately.
  app.get("/api/users", async (req, reply) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "Missing token" });
    }
    let payload: { role?: string };
    try {
      payload = jwt.verify(header.slice(7), getJwtSecret()) as {
        role?: string;
      };
    } catch {
      return reply.status(401).send({ error: "Invalid token" });
    }
    if (payload.role !== "orgmenu") {
      return reply.status(403).send({ error: "Org menu access only" });
    }
    const { rows } = await pool.query(
      `SELECT id, name, email, role, created_at FROM users ORDER BY id DESC`
    );
    return { users: rows };
  });

  // Request a password reset. Always returns 200 so emails can't be probed.
  // Dev mode (non-production) also returns the reset token/URL since no
  // email service is wired up yet — check backend logs for the link.
  app.post("/api/auth/forgot-password", async (req, reply) => {
    const parsed = forgotSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    const { rows } = await pool.query<UserRow>(
      `SELECT id, name, email, role, password_hash, created_at FROM users WHERE email = $1`,
      [parsed.data.email]
    );
    const row = rows[0];
    let devPayload = {};
    if (row) {
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      await pool.query(
        `INSERT INTO password_resets (user_id, token_hash, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '1 hour')`,
        [row.id, tokenHash]
      );
      const base =
        process.env.FRONTEND_URL ?? "http://localhost:3000";
      app.log.info(
        `Password reset for ${row.email}: ${base}/reset-password?token=${token}`
      );
      if (process.env.NODE_ENV !== "production") {
        devPayload = {
          resetToken: token,
          resetUrl: `${base}/reset-password?token=${token}`,
        };
      }
    }
    return {
      message: "If an account exists for that email, a reset link was sent.",
      ...devPayload,
    };
  });

  // Consume a reset token and set a new password (single-use, 1h expiry)
  app.post("/api/auth/reset-password", async (req, reply) => {
    const parsed = resetSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    const tokenHash = crypto
      .createHash("sha256")
      .update(parsed.data.token)
      .digest("hex");
    const { rows } = await pool.query<{
      id: number;
      user_id: number;
      expires_at: string;
      used_at: string | null;
    }>(
      `SELECT id, user_id, expires_at, used_at FROM password_resets WHERE token_hash = $1`,
      [tokenHash]
    );
    const reset = rows[0];
    if (
      !reset ||
      reset.used_at ||
      new Date(reset.expires_at).getTime() < Date.now()
    ) {
      return reply
        .status(400)
        .send({ error: "Reset link is invalid or has expired" });
    }
    const hash = await bcrypt.hash(parsed.data.password, 10);
    await pool.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [
      hash,
      reset.user_id,
    ]);
    await pool.query(
      `UPDATE password_resets SET used_at = NOW() WHERE id = $1`,
      [reset.id]
    );
    await pool.query(`DELETE FROM password_resets WHERE user_id = $1 AND id <> $2`, [
      reset.user_id,
      reset.id,
    ]);
    return { message: "Password updated. You can now log in." };
  });
}
