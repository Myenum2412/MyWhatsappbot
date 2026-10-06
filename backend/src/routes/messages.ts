import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { pool } from "../db/pool.js";

const createMessageSchema = z.object({
  to: z.string().min(1),
  body: z.string().min(1),
});

export interface MessageRow {
  id: number;
  recipient: string;
  body: string;
  status: string;
  created_at: string;
}

export async function messageRoutes(app: FastifyInstance) {
  app.get("/api/messages", async () => {
    const { rows } = await pool.query<MessageRow>(
      "SELECT id, recipient, body, status, created_at FROM messages ORDER BY id DESC LIMIT 100"
    );
    return { messages: rows };
  });

  app.post("/api/messages", async (req, reply) => {
    const parsed = createMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    const { rows } = await pool.query<MessageRow>(
      "INSERT INTO messages (recipient, body, status) VALUES ($1, $2, 'queued') RETURNING id, recipient, body, status, created_at",
      [parsed.data.to, parsed.data.body]
    );
    return reply.status(201).send({ message: rows[0] });
  });
}
