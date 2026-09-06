import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import { connectDB } from "./plugins/db.js";
import { userRoutes } from "./routes/user.routes.js";
import { campaignRoutes } from "./routes/campaign.routes.js";
import { whatsappRoutes } from "./routes/whatsapp.routes.js";

dotenv.config();

const app = Fastify({ logger: true });
const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/myapp";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

await app.register(cors, {
  origin: [FRONTEND_URL, "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
});

await app.register(userRoutes);
await app.register(campaignRoutes);
await app.register(whatsappRoutes);

// root route
app.get("/", async () => {
  return { message: "Fastify API 🚀", docs: "/api/health" };
});

const start = async () => {
  try {
    await connectDB(MONGODB_URI);
    await app.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
