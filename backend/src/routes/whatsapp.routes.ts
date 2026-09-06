import { FastifyInstance } from "fastify";
import { whatsappService } from "../services/whatsapp.service.js";

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
}
