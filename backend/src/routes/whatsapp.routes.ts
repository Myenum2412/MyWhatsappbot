import { FastifyInstance } from "fastify";
import { whatsappService } from "../services/whatsapp.service.js";
import { WhatsappAccount } from "../models/WhatsappAccount.js";

export async function whatsappRoutes(app: FastifyInstance) {
  // Ensure service initialized
  await whatsappService.init();

  // GET /api/whatsapp/qr - get QR code (wwebjs.dev style)
  app.get("/api/whatsapp/qr", async () => {
    return whatsappService.getQR();
  });

  // POST /api/whatsapp/qr/refresh - regenerate QR
  app.post("/api/whatsapp/qr/refresh", async () => {
    return await whatsappService.refreshQR();
  });

  // GET /api/whatsapp/status
  app.get("/api/whatsapp/status", async () => {
    return whatsappService.getStatus();
  });

  // POST /api/whatsapp/send
  app.post("/api/whatsapp/send", async (request, reply) => {
    const { to, message } = request.body as { to: string; message: string };
    if (!to || !message) return reply.status(400).send({ success: false, message: "to and message required" });
    const result = await whatsappService.sendMessage(to, message);
    return result;
  });

  // POST /api/whatsapp/disconnect
  app.post("/api/whatsapp/disconnect", async () => {
    return whatsappService.disconnect();
  });

  // MongoDB CRUD for accounts table
  app.get("/api/whatsapp/accounts", async () => {
    const accounts = await WhatsappAccount.find().sort({ createdAt: 1 });
    return accounts;
  });
  app.post("/api/whatsapp/accounts", async (request, reply) => {
    const { name, number, status } = request.body as { name: string; number: string; status?: string };
    if (!name || !number) return reply.status(400).send({ success: false, message: "name and number required" });
    const acc = await WhatsappAccount.create({ name, number, status: status || "Connected" });
    return acc;
  });
  app.put("/api/whatsapp/accounts/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    const acc = await WhatsappAccount.findByIdAndUpdate(id, body, { new: true });
    if (!acc) return reply.status(404).send({ success: false, message: "Not found" });
    return acc;
  });
  app.delete("/api/whatsapp/accounts/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const acc = await WhatsappAccount.findByIdAndDelete(id);
    if (!acc) return reply.status(404).send({ success: false, message: "Not found" });
    return { success: true };
  });
}
