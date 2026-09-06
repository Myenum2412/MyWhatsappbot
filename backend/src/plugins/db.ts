import mongoose from "mongoose";
import { execSync } from "node:child_process";
import path from "node:path";

function tryStartDockerCompose() {
  const candidates = [
    process.cwd(),
    path.resolve(process.cwd(), ".."),
    "/root/mywhatsappmsg",
    path.resolve(process.cwd(), "../.."),
  ];
  for (const root of candidates) {
    try {
      execSync("docker compose up -d --wait", { stdio: "ignore", cwd: root, timeout: 15000 });
      console.log("🐳 Docker compose started (mongo + mongo-express)");
      return true;
    } catch {}
    try {
      execSync("docker compose up -d", { stdio: "ignore", cwd: root, timeout: 15000 });
      console.log("🐳 Docker compose started (mongo + mongo-express)");
      return true;
    } catch {}
  }
  return false;
}

export async function connectDB(uri: string) {
  const opts = { serverSelectionTimeoutMS: 2000 };

  // 1. Try local MongoDB first
  try {
    await mongoose.connect(uri, opts);
    console.log(`✅ MongoDB connected to ${uri}`);
    return;
  } catch (err: any) {
    const isRefused = err?.message?.includes("ECONNREFUSED") || err?.cause?.message?.includes("ECONNREFUSED") || String(err?.reason).includes("ECONNREFUSED");
    console.warn(`⚠️  Local MongoDB not available at ${uri}${isRefused ? " (ECONNREFUSED)" : ""}`);

    // 2. Try auto-start docker compose (if Docker Desktop is installed)
    console.log("🔄 Trying to auto-start MongoDB via docker compose...");
    const dockerStarted = tryStartDockerCompose();
    if (dockerStarted) {
      // wait a bit and retry local
      await new Promise((r) => setTimeout(r, 3000));
      try {
        await mongoose.connect(uri, opts);
        console.log(`✅ MongoDB connected via Docker at ${uri}`);
        return;
      } catch (retryErr) {
        console.warn("⚠️  Docker started but MongoDB still not ready, falling back to in-memory...");
      }
    } else {
      console.log("ℹ️  Docker not available / not running, using in-memory fallback");
    }

    // 3. Automatic in-memory fallback - no env needed, backend auto-starts DB
    console.log("🚀 Starting in-memory MongoDB (auto, no install needed)...");
    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      await mongoose.connect(memUri);
      console.log(`✅ Connected to IN-MEMORY MongoDB at ${memUri}`);
      console.log(`💡 This is automatic - when you run 'npm run dev' the DB starts itself.`);
      console.log(`   For persistent data, install real MongoDB: choco install mongodb -y  OR  docker compose up -d`);
      return;
    } catch (fallbackErr) {
      console.error("❌ All MongoDB auto-start attempts failed:", fallbackErr);
      console.error(`
Manual fix:
  docker compose up -d   # from D:\\mywhatsappmsg
  OR choco install mongodb -y; net start MongoDB
  OR https://www.mongodb.com/try/download/community
`);
      throw fallbackErr;
    }
  }
}
