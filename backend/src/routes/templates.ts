import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { pool } from "../db/pool.js";

const templateBody = z.object({
  name: z.string().trim().min(1).max(100),
  header: z.string().trim().max(200).default(""),
  body: z.string().trim().min(1).max(2000),
  footer: z.string().trim().max(200).default(""),
});

export async function templateRoutes(app: FastifyInstance) {
  app.get("/api/templates", async () => {
    const res = await pool.query(
      `SELECT id, name, header, body, footer, created_at, updated_at
       FROM message_templates ORDER BY updated_at DESC`
    );
    return { templates: res.rows };
  });

  app.post("/api/templates", async (req, reply) => {
    const parsed = templateBody.safeParse(req.body);
    if (!parsed.success) {
      return reply
        .status(400)
        .send({ error: "Name and body are required." });
    }
    try {
      const res = await pool.query(
        `INSERT INTO message_templates (name, header, body, footer)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, header, body, footer, created_at, updated_at`,
        [
          parsed.data.name,
          parsed.data.header,
          parsed.data.body,
          parsed.data.footer,
        ]
      );
      return reply.status(201).send({ template: res.rows[0] });
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        "code" in err &&
        (err as { code: string }).code === "23505"
      ) {
        return reply
          .status(409)
          .send({ error: "A template with this name already exists." });
      }
      throw err;
    }
  });

  app.put("/api/templates/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = templateBody.safeParse(req.body);
    if (!parsed.success) {
      return reply
        .status(400)
        .send({ error: "Name and body are required." });
    }
    try {
      const res = await pool.query(
        `UPDATE message_templates
         SET name = $2, header = $3, body = $4, footer = $5, updated_at = NOW()
         WHERE id = $1
         RETURNING id, name, header, body, footer, created_at, updated_at`,
        [
          Number(id),
          parsed.data.name,
          parsed.data.header,
          parsed.data.body,
          parsed.data.footer,
        ]
      );
      if (res.rowCount === 0) {
        return reply.status(404).send({ error: "Template not found." });
      }
      return { template: res.rows[0] };
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        "code" in err &&
        (err as { code: string }).code === "23505"
      ) {
        return reply
          .status(409)
          .send({ error: "A template with this name already exists." });
      }
      throw err;
    }
  });

  app.delete("/api/templates/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const res = await pool.query(
      `DELETE FROM message_templates WHERE id = $1`,
      [Number(id)]
    );
    if (res.rowCount === 0) {
      return reply.status(404).send({ error: "Template not found." });
    }
    return { ok: true };
  });
}
