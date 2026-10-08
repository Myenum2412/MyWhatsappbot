import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import { healthRoutes } from "./routes/health.js";
import { authRoutes } from "./routes/auth.js";
import { sessionRoutes } from "./routes/sessions.js";
import { templateRoutes } from "./routes/templates.js";
import { runAuthMigrations } from "./db/auth-schema.js";
import { runSessionMigrations } from "./db/session-schema.js";
import { runTemplateMigrations } from "./db/template-schema.js";
import { restoreSessions } from "./whatsapp/manager.js";

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
    await app.register(authRoutes);
    await app.register(sessionRoutes);
    await app.register(templateRoutes);

    // Wait for Postgres (handles `docker compose up` race where db isn't ready yet)
    const maxAttempts = Number(process.env.DB_CONNECT_RETRIES ?? 15);
    const delayMs = Number(process.env.DB_CONNECT_DELAY_MS ?? 2000);
    for (let attempt = 1; ; attempt++) {
      try {
        await runAuthMigrations();
        await runSessionMigrations();
        await runTemplateMigrations();
        await restoreSessions();
        break;
      } catch (err) {
        if (attempt >= maxAttempts) throw err;
        app.log.warn(
          `Database not ready (attempt ${attempt}/${maxAttempts}), retrying in ${delayMs}ms...`
        );
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
    await app.listen({ port, host });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

void main();
