import { Client, LocalAuth } from "whatsapp-web.js";
import QRCode from "qrcode";
import path from "node:path";
import fs from "node:fs/promises";
import { pool } from "../db/pool.js";

export type SessionStatus =
  | "qr"
  | "ready"
  | "paused"
  | "disconnected"
  | "failed";

export interface SessionInfo {
  id: string;
  name: string;
  status: SessionStatus;
  qrRaw: string | null;
  qrDataUrl: string | null;
  createdAt: string;
}

interface Entry {
  info: SessionInfo;
  client: Client | null;
}

// DB-persisted records; live browser clients + QR payloads stay in memory.
const sessions = new Map<string, Entry>();

const AUTH_DIR = path.resolve(process.cwd(), "..", ".wwebjs_auth");

function puppeteerConfig() {
  return {
    headless: true,
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH ??
      process.env.CHROME_PATH ??
      "/usr/bin/google-chrome",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  };
}

function makeId() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  ).toLowerCase();
}

function rowToInfo(row: {
  id: string;
  name: string;
  status: SessionStatus;
  created_at: Date | string;
}): SessionInfo {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    qrRaw: null,
    qrDataUrl: null,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

async function persistStatus(id: string, status: SessionStatus) {
  try {
    await pool.query(
      `UPDATE whatsapp_sessions SET status = $2, updated_at = NOW() WHERE id = $1`,
      [id, status]
    );
  } catch {
    // DB hiccup — runtime map stays authoritative until next restart
  }
}

function setStatus(entry: Entry, status: SessionStatus) {
  entry.info.status = status;
  if (status === "ready" || status === "paused") {
    entry.info.qrRaw = null;
    entry.info.qrDataUrl = null;
  }
  void persistStatus(entry.info.id, status);
}

/** Load persisted sessions on boot. Browsers are closed after a restart,
 *  so anything that was live goes back to `disconnected` (press Start). */
export async function restoreSessions() {
  const res = await pool.query(
    `SELECT id, name, status, created_at FROM whatsapp_sessions ORDER BY created_at ASC`
  );
  for (const row of res.rows as Array<{
    id: string;
    name: string;
    status: SessionStatus;
    created_at: string;
  }>) {
    const info = rowToInfo(row);
    if (info.status === "qr" || info.status === "ready") {
      info.status = "disconnected";
      await persistStatus(info.id, "disconnected");
    }
    sessions.set(info.id, { info, client: null });
  }
}

export function listSessions(): SessionInfo[] {
  return [...sessions.values()].map(({ info }) => ({ ...info }));
}

export function getSession(id: string) {
  return sessions.get(id);
}

function attachHandlers(id: string, entry: Entry, client: Client) {
  const { info } = entry;

  client.on("qr", async (qr: string) => {
    info.qrRaw = qr;
    info.status = "qr";
    try {
      info.qrDataUrl = await QRCode.toDataURL(qr, { margin: 1, width: 256 });
    } catch {
      info.qrDataUrl = null;
    }
    void persistStatus(id, "qr");
  });

  client.on("ready", () => {
    setStatus(entry, "ready");
  });

  client.on("authenticated", () => {
    setStatus(entry, "ready");
  });

  client.on("auth_failure", () => {
    setStatus(entry, "failed");
  });

  client.on("disconnected", () => {
    // Only mark disconnected if user didn't pause it
    if (info.status !== "paused") setStatus(entry, "disconnected");
  });

  // Launch without awaiting — chromium + QR take a while.
  void client.initialize().catch(() => {
    const current = sessions.get(id);
    if (current && current.info.status === "qr") setStatus(current, "failed");
  });
}

export async function createSession(name: string): Promise<SessionInfo> {
  const id = makeId();
  const cleanName = name.trim() || `Session ${id.slice(-4)}`;

  await pool.query(
    `INSERT INTO whatsapp_sessions (id, name, status) VALUES ($1, $2, 'qr')`,
    [id, cleanName]
  );

  const res = await pool.query(
    `SELECT id, name, status, created_at FROM whatsapp_sessions WHERE id = $1`,
    [id]
  );
  const info = rowToInfo(
    res.rows[0] as { id: string; name: string; status: SessionStatus; created_at: string }
  );

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: id, dataPath: AUTH_DIR }),
    puppeteer: puppeteerConfig(),
  });

  const entry: Entry = { info, client };
  sessions.set(id, entry);
  attachHandlers(id, entry, client);

  return { ...info };
}

/** Start (or restart) a session's browser client. Restores auth if saved. */
export async function startSession(id: string): Promise<SessionInfo | null> {
  const entry = sessions.get(id);
  if (!entry) return null;
  if (entry.info.status === "ready" || entry.info.status === "qr") {
    return { ...entry.info }; // already running
  }

  // Drop dead client if any
  if (entry.client) {
    try {
      await entry.client.destroy();
    } catch {
      // ignore
    }
  }

  entry.info.qrRaw = null;
  entry.info.qrDataUrl = null;
  setStatus(entry, "qr");

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: id, dataPath: AUTH_DIR }),
    puppeteer: puppeteerConfig(),
  });
  entry.client = client;
  attachHandlers(id, entry, client);

  return { ...entry.info };
}

/** Pause a session: close the browser, keep the record + saved auth. */export async function pauseSession(id: string): Promise<SessionInfo | null> {
  const entry = sessions.get(id);
  if (!entry) return null;
  if (entry.client) {
    try {
      await entry.client.destroy();
    } catch {
      // ignore — client may never have launched
    }
    entry.client = null;
  }
  setStatus(entry, "paused");
  return { ...entry.info };
}

export async function destroySession(id: string): Promise<boolean> {  const entry = sessions.get(id);
  if (!entry) {
    // Record may exist in DB only (e.g. after restart before restore) —
    // still delete it.
    const res = await pool.query(
      `DELETE FROM whatsapp_sessions WHERE id = $1`,
      [id]
    );
    return (res.rowCount ?? 0) > 0;
  }
  sessions.delete(id);
  if (entry.client) {
    try {
      await entry.client.destroy();
    } catch {
      // ignore
    }
  }
  await pool.query(`DELETE FROM whatsapp_sessions WHERE id = $1`, [id]);
  // Remove persisted auth so the number can be re-linked fresh later
  try {
    await fs.rm(path.join(AUTH_DIR, `session-${id}`), {
      recursive: true,
      force: true,
    });
  } catch {
    // ignore
  }
  return true;
}

// ─── Chats & messages (live WhatsApp data via wwebjs) ───────────────────────

export interface ChatLastMessage {
  body: string;
  fromMe: boolean;
  timestamp: string;
}

export interface ChatSummary {
  id: string;
  name: string;
  isGroup: boolean;
  unreadCount: number;
  lastMessage: ChatLastMessage | null;
}

export interface ChatMessageLocation {
  latitude: number;
  longitude: number;
  name: string;
}

export interface ChatMessagePoll {
  name: string;
  options: string[];
  multi: boolean;
}

export interface ChatMessage {
  id: string;
  body: string;
  fromMe: boolean;
  timestamp: string;
  ack: number;
  type: string;
  hasMedia: boolean;
  isForwarded: boolean;
  location: ChatMessageLocation | null;
  vcardName: string | null;
  vcardPhones: string[];
  poll: ChatMessagePoll | null;
}

function mapMessage(m: {
  id: { _serialized: string };
  body?: string;
  fromMe: boolean;
  timestamp: number;
  ack?: number;
  type: string;
  hasMedia: boolean;
  isForwarded?: boolean;
  location?: { latitude: number | string; longitude: number | string; description?: unknown } | null;
  vCards?: string[];
  pollName?: string;
  pollOptions?: Array<string | { name?: string }>;
  allowMultipleAnswers?: boolean;
}): ChatMessage {
  let vcardName: string | null = null;
  const vcardPhones: string[] = [];
  try {
    const first = m.vCards?.[0];
    if (typeof first === "string") {
      const fn = first.match(/^FN:(.+)$/m)?.[1]?.trim();
      if (fn) vcardName = fn;
      for (const tel of first.matchAll(/^TEL[^:]*:(.+)$/gm)) {
        const num = tel[1].replace(/[^\d+]/g, "");
        if (num) vcardPhones.push(num);
      }
    }
  } catch {
    // keep nulls
  }
  return {
    id: m.id._serialized,
    body: m.body ?? "",
    fromMe: m.fromMe,
    timestamp: toIso(m.timestamp),
    ack: m.ack ?? 0,
    type: m.type,
    hasMedia: m.hasMedia,
    isForwarded: m.isForwarded ?? false,
    location:
      m.location && Number.isFinite(Number(m.location.latitude))
        ? {
            latitude: Number(m.location.latitude),
            longitude: Number(m.location.longitude),
            name:
              typeof m.location.description === "string"
                ? m.location.description
                : ((m.location.description as { name?: string } | null)?.name ?? ""),
          }
        : null,
    vcardName,
    vcardPhones,
    poll: m.pollName
      ? {
          name: m.pollName,
          options: (m.pollOptions ?? []).map((o) =>
            typeof o === "string" ? o : (o.name ?? "")
          ).filter(Boolean),
          multi: m.allowMultipleAnswers ?? false,
        }
      : null,
  };
}

function requireLiveClient(
  id: string
): { error: "not-found" | "not-ready" } | { client: Client } {  const entry = sessions.get(id);
  if (!entry) return { error: "not-found" as const };
  if (!entry.client || entry.info.status !== "ready")
    return { error: "not-ready" as const };
  return { client: entry.client };
}

/** If the browser page died while status still says "ready" (crash/OOM),
 *  flip to disconnected so callers get a clean 400 instead of driver errors. */
function healDeadPage(id: string): boolean {
  try {
    const entry = sessions.get(id);
    const page = entry?.client
      ? (entry.client as unknown as { pupPage?: { isClosed?: () => boolean } }).pupPage
      : undefined;
    if (entry && entry.info.status === "ready" && (!page || page.isClosed?.())) {
      setStatus(entry, "disconnected");
      return true;
    }
  } catch {
    // ignore probe errors — fall through to the live call
  }
  return false;
}

function toIso(timestampSeconds: number): string {
  const ms = Number(timestampSeconds) * 1000;
  return Number.isFinite(ms) ? new Date(ms).toISOString() : new Date(0).toISOString();
}

/** Persistent file log for chat-driver failures (survives terminal scrollback). */
function logChatError(where: string, id: string, extra: string, err: unknown) {
  const line =
    JSON.stringify({
      time: new Date().toISOString(),
      where,
      sessionId: id,
      extra,
      name: err instanceof Error ? err.name : typeof err,
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    }) + "\n";
  const file = process.env.CHAT_ERROR_LOG ?? "/tmp/opencode/chat-errors.log";
  fs.appendFile(file, line).catch(() => {
    // never let diagnostics break the request
  });
}

interface LightChat {
  id: string;
  name: string;
  isGroup: boolean;
  unreadCount: number;
  lastMessage: { body: string; fromMe: boolean; timestamp: number } | null;
}

export async function getChatsList(
  id: string
): Promise<
  | { error: "not-found" | "not-ready" | "fetch-failed"; detail?: string }
  | { chats: ChatSummary[] }
> {
  const live = requireLiveClient(id);
  if ("error" in live) return live;
  if (healDeadPage(id)) return { error: "not-ready" as const };
  // The stock wwebjs serializer resolves group metadata + last-message
  // lookups per chat and rejects the whole list on a single bad/mid-sync
  // chat (surfacing as a minified one-letter page error). Fetch a light
  // snapshot instead, skipping bad chats individually — and retry, because
  // a freshly linked device is still syncing history for the first minutes.
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const pupPage = (
        live.client as unknown as {
          pupPage: { evaluate: (fn: () => unknown) => Promise<unknown> };
        }
      ).pupPage;
      if (!pupPage || typeof pupPage.evaluate !== "function") {
        throw new Error("Browser page is not ready — try again in a few seconds.");
      }
      const raw = (await pupPage.evaluate(() => {
        const g = globalThis as unknown as {
          require?: (mod: string) => Record<string, any>;
        };
        if (!g.require) {
          throw new Error(
            "WhatsApp Web is still loading — try again in a few seconds."
          );
        }
        const collections = g.require("WAWebCollections");
        if (!collections?.Chat) {
          throw new Error(
            "WhatsApp Web is still loading — try again in a few seconds."
          );
        }
        const models = collections.Chat.getModelsArray() as Array<any>;
        return models
          .map((chat) => {
            try {
              const msgs =
                chat?.msgs && typeof chat.msgs.getModelsArray === "function"
                  ? chat.msgs.getModelsArray()
                  : [];
              const last = msgs.length > 0 ? msgs[msgs.length - 1] : null;
              return {
                id: String(chat?.id?._serialized ?? ""),
                name: String(
                  chat?.name ?? chat?.formattedTitle ?? chat?.id?.user ?? "Unknown"
                ),
                isGroup: Boolean(chat?.groupMetadata),
                unreadCount: Number(chat?.unreadCount ?? 0),
                lastMessage: last
                  ? {
                      body: String(last.body ?? ""),
                      fromMe: Boolean(last.isFromMe),
                      timestamp: Number(last.t ?? 0),
                    }
                  : null,
              };
            } catch {
              return null;
            }
          })
          .filter((c) => c && c.id);
      })) as LightChat[];
      return {
        chats: raw.map((c) => ({
          id: c.id,
          name: c.name,
          isGroup: c.isGroup,
          unreadCount: c.unreadCount,
          lastMessage: c.lastMessage
            ? {
                body: c.lastMessage.body,
                fromMe: c.lastMessage.fromMe,
                timestamp: toIso(c.lastMessage.timestamp),
              }
            : null,
        })),
      };
    } catch (err) {
      lastErr = err;
      console.error(
        `[chats] getChats attempt ${attempt + 1} failed for session ${id}:`,
        err
      );
      logChatError("getChats", id, `attempt-${attempt + 1}`, err);
      await new Promise((r) => setTimeout(r, 2500));
    }
  }
  console.error(`[chats] getChats failed for session ${id}:`, lastErr);
  return {
    error: "fetch-failed" as const,
    detail:
      lastErr instanceof Error
        ? `${lastErr.name}: ${lastErr.message || "(no message)"}`
        : "Failed to load chats",
  };
}

export async function getChatMessages(
  id: string,
  chatId: string,
  limit: number
): Promise<
  | { error: "not-found" | "not-ready" | "chat-not-found" | "fetch-failed"; detail?: string }
  | { messages: ChatMessage[] }
> {
  const live = requireLiveClient(id);
  if ("error" in live) return live;
  if (healDeadPage(id)) return { error: "not-ready" as const };
  let chat;
  try {
    chat = await live.client.getChatById(chatId);
  } catch {
    return { error: "chat-not-found" as const };
  }
  const safeLimit = Math.min(Math.max(limit, 1), 500);
  try {
    const messages = await chat.fetchMessages({ limit: safeLimit });
    return { messages: messages.map(mapMessage) };
  } catch (err) {
    console.error(`[chats] fetchMessages failed for session ${id} chat ${chatId}:`, err);
    logChatError("fetchMessages", id, chatId, err);
    return {
      error: "fetch-failed" as const,
      detail:
        err instanceof Error
          ? `${err.name}: ${err.message || "(no message)"}`
          : "Failed to load messages",
    };
  }
}

export async function sendChatMessage(
  id: string,
  to: string,
  text: string
): Promise<
  { error: "not-found" | "not-ready" | "send-failed"; detail?: string } | { message: ChatMessage }
> {
  const live = requireLiveClient(id);
  if ("error" in live) return live;
  if (healDeadPage(id)) return { error: "not-ready" as const };
  try {
    const sent = await live.client.sendMessage(to, text);
    return {
      message: mapMessage(sent as unknown as Parameters<typeof mapMessage>[0]),
    };
  } catch (err) {
    return {
      error: "send-failed" as const,
      detail: err instanceof Error ? err.message : "Send failed",
    };
  }
}

export interface MessageMedia {
  mimetype: string;
  filename: string | null;
  data: string;
}

export async function getMessageMedia(
  id: string,
  messageId: string
): Promise<
  | { error: "not-found" | "not-ready" | "not-media" | "fetch-failed"; detail?: string }
  | { media: MessageMedia }
> {
  const live = requireLiveClient(id);
  if ("error" in live) return live;
  if (healDeadPage(id)) return { error: "not-ready" as const };
  try {
    const msg = await live.client.getMessageById(messageId);
    if (!msg || !msg.hasMedia) return { error: "not-media" as const };
    const media = await msg.downloadMedia();
    if (!media) return { error: "not-media" as const };
    return {
      media: {
        mimetype: media.mimetype,
        filename: (media as { filename?: string }).filename ?? null,
        data: media.data,
      },
    };
  } catch (err) {
    console.error(`[chats] downloadMedia failed for session ${id} msg ${messageId}:`, err);
    logChatError("downloadMedia", id, messageId, err);
    return {
      error: "fetch-failed" as const,
      detail:
        err instanceof Error
          ? `${err.name}: ${err.message || "(no message)"}`
          : "Failed to download media",
    };
  }
}
