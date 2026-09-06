import { FastifyInstance } from "fastify";
import { Campaign } from "../models/Campaign.js";

export async function campaignRoutes(app: FastifyInstance) {
  // GET /api/campaigns - list all campaigns
  app.get("/api/campaigns", async () => {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    return { success: true, data: campaigns };
  });

  // GET /api/campaigns/stats - status counts for cards
  app.get("/api/campaigns/stats", async () => {
    const total = await Campaign.countDocuments();
    const running = await Campaign.countDocuments({ status: "Running" });
    const scheduled = await Campaign.countDocuments({ status: "Scheduled" });
    const completed = await Campaign.countDocuments({ status: "Completed" });
    const failed = await Campaign.countDocuments({ status: "Failed" });
    const draft = await Campaign.countDocuments({ status: "Draft" });
    const paused = await Campaign.countDocuments({ status: "Paused" });
    return { success: true, data: { total, running, scheduled, completed, failed, draft, paused } };
  });

  // POST /api/campaigns - create campaign
  app.post("/api/campaigns", async (request, reply) => {
    const body = request.body as any;
    const { name, template, recipients, status, description, category, campaignType, account, audience, scheduledDate, scheduledTime, attachments } = body;

    if (!name || !name.trim()) {
      return reply.status(400).send({ success: false, message: "Campaign Name is required" });
    }

    // Default template if not provided
    const tpl = template || "default_template";
    const rec = Number(recipients) || 0;

    // Determine status: if scheduledDate provided, use Scheduled unless explicitly Draft
    let finalStatus = status || "Draft";
    if ((scheduledDate || scheduledTime) && !status) finalStatus = "Scheduled";

    try {
      const campaign = await Campaign.create({
        name: name.trim(),
        description,
        template: tpl,
        category,
        recipients: rec,
        sent: body.sent || 0,
        delivered: body.delivered || 0,
        read: body.read || 0,
        failed: body.failed || 0,
        status: finalStatus,
        campaignType,
        account,
        audience,
        scheduledDate,
        scheduledTime,
        attachments,
      });
      return reply.status(201).send({ success: true, data: campaign });
    } catch (err: any) {
      request.log.error(err);
      return reply.status(500).send({ success: false, message: err.message });
    }
  });

  // PUT /api/campaigns/:id - update status / edit
  app.put("/api/campaigns/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    try {
      const updated = await Campaign.findByIdAndUpdate(id, body, { new: true });
      if (!updated) return reply.status(404).send({ success: false, message: "Campaign not found" });
      return { success: true, data: updated };
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: err.message });
    }
  });

  // DELETE /api/campaigns/:id
  app.delete("/api/campaigns/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const deleted = await Campaign.findByIdAndDelete(id);
      if (!deleted) return reply.status(404).send({ success: false, message: "Campaign not found" });
      return { success: true, message: "Deleted" };
    } catch (err: any) {
      return reply.status(500).send({ success: false, message: err.message });
    }
  });

  // POST /api/campaigns/:id/duplicate
  app.post("/api/campaigns/:id/duplicate", async (request, reply) => {
    const { id } = request.params as { id: string };
    const orig = await Campaign.findById(id);
    if (!orig) return reply.status(404).send({ success: false, message: "Campaign not found" });
    const dup = await Campaign.create({
      name: `${orig.name} (Copy)`,
      description: orig.description,
      template: orig.template,
      category: orig.category,
      recipients: orig.recipients,
      status: "Draft",
      campaignType: orig.campaignType,
      account: orig.account,
      audience: orig.audience,
    });
    return reply.status(201).send({ success: true, data: dup });
  });
}
