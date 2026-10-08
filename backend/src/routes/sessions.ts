import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  createSession,
  destroySession,
  getChatMessages,
  getChatsList,
  getMessageMedia,
  getSession,
  listSessions,
  pauseSession,
  sendChatMessage,
  startSession,
} from "../whatsapp/manager.js";

const createBody = z.object({
  name: z.string().trim().min(1).max(80),
});

const sendBody = z.object({
  to: z.string().trim().min(1).max(64),
  type: z.string().trim().default("text"),
  text: z.string().trim().min(1).max(4096),
});

export async function sessionRoutes(app: FastifyInstance) {
  app.get("/api/sessions", async () => {
    return { sessions: listSessions() };
  });

  app.post("/api/sessions", async (req, reply) => {
    const parsed = createBody.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Session title is required" });
    }
    const info = await createSession(parsed.data.name);
    return reply.status(201).send({ session: info });
  });

  app.get("/api/sessions/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const entry = getSession(id);
    if (!entry) return reply.status(404).send({ error: "Session not found" });
    return { session: { ...entry.info } };
  });

  app.delete("/api/sessions/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const ok = await destroySession(id);
    if (!ok) return reply.status(404).send({ error: "Session not found" });
    return { ok: true };
  });

  app.post("/api/sessions/:id/start", async (req, reply) => {
    const { id } = req.params as { id: string };
    const session = await startSession(id);
    if (!session)
      return reply.status(404).send({ error: "Session not found" });
    return { session };
  });

  app.post("/api/sessions/:id/pause", async (req, reply) => {
    const { id } = req.params as { id: string };
    const session = await pauseSession(id);
    if (!session)
      return reply.status(404).send({ error: "Session not found" });
    return { session };
  });

  app.get("/api/sessions/:id/chats", async (req, reply) => {
    const { id } = req.params as { id: string };
    const result = await getChatsList(id);
    if ("error" in result) {
      if (result.error === "not-found")
        return reply.status(404).send({ error: "Session not found" });
      if (result.error === "fetch-failed")
        return reply.status(502).send({ error: result.detail ?? "Failed to load chats" });
      return reply.status(400).send({ error: "Session is not connected" });
    }
    return result;
  });

  app.get("/api/sessions/:id/chats/:chatId/messages", async (req, reply) => {
    const { id, chatId } = req.params as { id: string; chatId: string };
    const { limit } = req.query as { limit?: string };
    const result = await getChatMessages(id, chatId, Number(limit) || 50);
    if ("error" in result) {
      if (result.error === "not-found")
        return reply.status(404).send({ error: "Session not found" });
      if (result.error === "chat-not-found")
        return reply.status(404).send({ error: "Chat not found" });
      if (result.error === "fetch-failed")
        return reply.status(502).send({ error: result.detail ?? "Failed to load messages" });
      return reply.status(400).send({ error: "Session is not connected" });
    }
    return result;
  });

  app.get(
    "/api/sessions/:id/chats/:chatId/messages/:messageId/media",
    async (req, reply) => {
      const { id, messageId } = req.params as { id: string; chatId: string; messageId: string };
      const result = await getMessageMedia(id, messageId);
      if ("error" in result) {
        if (result.error === "not-found")
          return reply.status(404).send({ error: "Session not found" });
        if (result.error === "not-media")
          return reply.status(404).send({ error: "No downloadable media on this message" });
        if (result.error === "fetch-failed")
          return reply.status(502).send({ error: result.detail ?? "Failed to download media" });
        return reply.status(400).send({ error: "Session is not connected" });
      }
      return result;
    }
  );

  app.post("/api/sessions/:id/messages", async (req, reply) => {    const { id } = req.params as { id: string };
    const parsed = sendBody.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Recipient and text are required" });
    }
    if (parsed.data.type !== "text") {
      return reply
        .status(400)
        .send({ error: `Message type "${parsed.data.type}" is not supported yet — text only.` });
    }
    const result = await sendChatMessage(id, parsed.data.to, parsed.data.text);
    if ("error" in result) {
      if (result.error === "not-found")
        return reply.status(404).send({ error: "Session not found" });
      if (result.error === "not-ready")
        return reply.status(400).send({ error: "Session is not connected" });
      return reply.status(502).send({ error: result.detail ?? "Send failed" });
    }
    return reply.status(201).send(result);
  });
}
