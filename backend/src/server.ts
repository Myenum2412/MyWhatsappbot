import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import { healthRoutes } from "./routes/health.js";
import { messageRoutes } from "./routes/messages.js";
import { authRoutes } from "./routes/auth.js";
import { runAuthMigrations } from "./db/auth-schema.js";
import { pool } from "./db/pool.js";

dotenv.config();

const app = Fastify({ logger: true });

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "0.0.0.0";

async function main() {
  try {
    await app.register(cors, {
      origin: (process.env.CORS_ORIGIN ?? "http://localhost:3000").split(","),
    });

    await app.register(healthRoutes);
    await app.register(messageRoutes);
    await app.register(authRoutes);

    // Ensure messages table exists (simple auto-migrate for dev)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        recipient TEXT NOT NULL,
        body TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'queued',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await runAuthMigrations();
    await app.listen({ port, host });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

void main();
