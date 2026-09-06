import QRCode from "qrcode";

// Lightweight WhatsApp service inspired by https://wwebjs.dev (whatsapp-web.js)
// - If whatsapp-web.js is installed and env USE_WWEBJS=true, it will use real Client
// - Otherwise it runs in mock mode (QR generated locally, status simulated) so dev works without Puppeteer

type WaStatus = "disconnected" | "qr" | "connected" | "initializing";

class WhatsappService {
  status: WaStatus = "disconnected";
  qrDataUrl: string | null = null;
  private client: any = null;
  private useReal = process.env.USE_WWEBJS === "true";

  async init() {
    if (this.useReal) {
      try {
        const { Client, LocalAuth } = await import("whatsapp-web.js");
        // @ts-ignore
        this.client = new Client({
          authStrategy: new LocalAuth({ dataPath: "./.wwebjs_auth" }),
          puppeteer: { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] },
        });
        this.client.on("qr", async (qr: string) => {
          this.status = "qr";
          try {
            this.qrDataUrl = await QRCode.toDataURL(qr);
          } catch {}
          console.log("📱 wwebjs QR generated (https://wwebjs.dev/docs/#qr-code)");
        });
        this.client.on("ready", () => {
          this.status = "connected";
          console.log("✅ wwebjs client ready - connected");
        });
        this.client.on("disconnected", () => {
          this.status = "disconnected";
        });
        this.status = "initializing";
        this.client.initialize().catch((e: any) => {
          console.warn("wwebjs init failed, falling back to mock:", e.message);
          this.useReal = false;
          this.generateMockQR();
        });
        return;
      } catch (e: any) {
        console.warn("whatsapp-web.js not installed or failed to load, using mock mode. Install with: npm i whatsapp-web.js qrcode-terminal");
        this.useReal = false;
      }
    }
    // Mock mode: generate QR immediately
    await this.generateMockQR();
  }

  private async generateMockQR() {
    this.status = "qr";
    const mockPayload = `mywhatsappmsg-mock-qr-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    // Generate QR data URL (simulates wwebjs QR event)
    this.qrDataUrl = await QRCode.toDataURL(mockPayload, { width: 280, margin: 2 });
    console.log("🔷 Mock QR generated (wwebjs.dev mock) at", new Date().toISOString());
    // Auto-connect after 8s for demo
    setTimeout(() => {
      if (this.status === "qr") {
        this.status = "connected";
        console.log("🔗 Mock WhatsApp connected (auto)");
      }
    }, 8000);
  }

  getQR() {
    return { status: this.status, qr: this.qrDataUrl, timestamp: new Date().toISOString(), mode: this.useReal ? "wwebjs" : "mock (https://wwebjs.dev)" };
  }

  getStatus() {
    return { status: this.status, mode: this.useReal ? "wwebjs" : "mock", docs: "https://wwebjs.dev" };
  }

  async sendMessage(to: string, message: string) {
    if (this.useReal && this.client && this.status === "connected") {
      try {
        const chatId = to.includes("@c.us") ? to : `${to.replace(/[^0-9]/g, "")}@c.us`;
        // @ts-ignore
        const sent = await this.client.sendMessage(chatId, message);
        return { success: true, id: sent.id._serialized, to, message, via: "wwebjs" };
      } catch (e: any) {
        return { success: false, message: e.message };
      }
    }
    // Mock send
    console.log(`[mock wwebjs] send to ${to}: ${message}`);
    return { success: true, id: `mock_${Date.now()}`, to, message, via: "mock", note: "Install whatsapp-web.js + set USE_WWEBJS=true for real sends (https://wwebjs.dev)" };
  }

  async refreshQR() {
    await this.generateMockQR();
    return this.getQR();
  }

  disconnect() {
    this.status = "disconnected";
    this.qrDataUrl = null;
    if (this.client) {
      try { this.client.destroy(); } catch {}
    }
    return { status: this.status };
  }
}

export const whatsappService = new WhatsappService();
