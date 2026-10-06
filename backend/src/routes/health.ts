import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({ status: "ok" }));
  app.get("/api/health", async () => ({
    status: "ok",
    service: "mywhatsappmsg-backend",
    time: new Date().toISOString(),
  }));
}
