import { FastifyInstance } from "fastify";
import { User } from "../models/User.js";

export async function userRoutes(app: FastifyInstance) {
  // GET /api/users
  app.get("/api/users", async () => {
    const users = await User.find().sort({ createdAt: -1 });
    return { success: true, data: users };
  });

  // POST /api/users
  app.post("/api/users", async (request, reply) => {
    const { name, email } = request.body as { name: string; email: string };
    if (!name || !email) {
      return reply.status(400).send({ success: false, message: "name and email required" });
    }
    try {
      const user = await User.create({ name, email });
      return reply.status(201).send({ success: true, data: user });
    } catch (err: any) {
      if (err.code === 11000) {
        return reply.status(409).send({ success: false, message: "Email already exists" });
      }
      throw err;
    }
  });

  // GET /api/health
  app.get("/api/health", async () => {
    return { success: true, message: "Backend is running", timestamp: new Date().toISOString() };
  });
}
