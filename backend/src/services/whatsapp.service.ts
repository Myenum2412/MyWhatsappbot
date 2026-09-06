import QRCode from "qrcode";

type WaStatus = "disconnected" | "qr" | "connected" | "initializing";

class WhatsappService {
  status: WaStatus = "disconnected";
  qrDataUrl: string | null = null;
  private client: any = null;
  private useReal = false;
  private initialized = false;

  async init() {
    if (this.initialized) return;
    this.initialized = true;

    // Try real whatsapp-web.js if installed - fallback to mock if Chromium missing
    try {
      const wwebjs: any = await import("whatsapp-web.js");
      const Client = wwebjs.Client ?? wwebjs.default?.Client;
      const LocalAuth = wwebjs.LocalAuth ?? wwebjs.default?.LocalAuth;
      this.client = new Client({
        authStrategy: new LocalAuth({ dataPath: "./.wwebjs_auth" }),
        puppeteer: {
          headless: true,
          executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium",
          args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
        },
      });
      this.client.on("qr", async (qr: string) => {
        this.status = "qr";
        try { this.qrDataUrl = await QRCode.toDataURL(qr); } catch {}
        console.log("📱 wwebjs QR generated - scan with WhatsApp (https://wwebjs.dev)");
      });
      this.client.on("ready", () => {
        this.status = "connected";
        console.log("✅ wwebjs client ready - connected");
      });
      this.client.on("authenticated", () => console.log("🔐 wwebjs authenticated"));
      this.client.on("auth_failure", (m: any) => console.warn("wwebjs auth_failure:", m));
      this.client.on("disconnected", (r: any) => {
        this.status = "disconnected";
        console.log("wwebjs disconnected:", r);
      });
      this.status = "initializing";
      this.useReal = true;
      this.client.initialize().catch((e: any) => {
        console.warn("wwebjs init failed, falling back to mock:", e?.message ?? e);
        this.useReal = false;
        this.generateMockQR();
      });
      return;
    } catch (e: any) {
      console.warn("whatsapp-web.js not available, using mock mode:", e?.message ?? e);
      this.useReal = false;
    }
    await this.generateMockQR();
  }

  private async generateMockQR() {
    this.status = "qr";
    const mockPayload = `mywhatsappmsg-mock-qr-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.qrDataUrl = await QRCode.toDataURL(mockPayload, { width: 280, margin: 2 });
    console.log("🔷 Mock QR generated at", new Date().toISOString(), "- ⚠️ NOT scannable by WhatsApp (mock). For real QR, ensure Chromium works - see logs above");
  }

  getQR() {
    return { status: this.status, qr: this.qrDataUrl, timestamp: new Date().toISOString(), mode: this.useReal ? "wwebjs" : "mock (https://wwebjs.dev)", error: !this.useReal ? "Mock QR is not scannable - Chromium failed to start, using fallback. Check backend logs." : undefined };
  }
  getStatus() {
    return { status: this.status, mode: this.useReal ? "wwebjs" : "mock", docs: "https://wwebjs.dev", error: !this.useReal ? "Mock mode - QR invalid for scanning" : undefined };
  }
  async sendMessage(to: string, message: string) {
    if (this.useReal && this.client && this.status === "connected") {
      try {
        const chatId = to.includes("@c.us") ? to : `${to.replace(/[^0-9]/g, "")}@c.us`;
        const sent = await this.client.sendMessage(chatId, message);
        return { success: true, id: sent.id._serialized, to, message, via: "wwebjs" };
      } catch (e: any) { return { success: false, message: e.message }; }
    }
    console.log(`[mock wwebjs] send to ${to}: ${message}`);
    return { success: true, id: `mock_${Date.now()}`, to, message, via: "mock", note: "Mock mode - install Chromium for real sends (see README)" };
  }
  async refreshQR() {
    if (this.useReal && this.client) {
      try { await this.client.logout(); } catch {}
      try { await this.client.initialize(); } catch {}
      this.status = "qr";
      return this.getQR();
    }
    await this.generateMockQR();
    return this.getQR();
  }
  disconnect() {
    this.status = "disconnected";
    this.qrDataUrl = null;
    if (this.client) { try { this.client.destroy(); } catch {} }
    return { status: this.status };
  }
}
export const whatsappService = new WhatsappService();
