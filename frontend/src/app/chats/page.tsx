"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChatHeader } from "@/components/ui/whatsapp/chat-header";
import { ChatListItem } from "@/components/ui/whatsapp/chat-list-item";
import { ChatBubble } from "@/components/ui/whatsapp/chat-bubble";
import { DateSeparator } from "@/components/ui/whatsapp/date-separator";
import { MessageInput } from "@/components/ui/whatsapp/message-input";
import { ImageBubble } from "@/components/ui/whatsapp/image-bubble";
import { VideoBubble } from "@/components/ui/whatsapp/video-bubble";
import { VoiceMessageBubble } from "@/components/ui/whatsapp/voice-message-bubble";
import { FileAttachmentBubble } from "@/components/ui/whatsapp/file-attachment-bubble";
import { StickerBubble } from "@/components/ui/whatsapp/sticker-bubble";
import { LocationBubble } from "@/components/ui/whatsapp/location-bubble";
import { ContactBubble } from "@/components/ui/whatsapp/contact-bubble";
import { SystemMessageBubble } from "@/components/ui/whatsapp/system-message-bubble";
import { ForwardedLabel } from "@/components/ui/whatsapp/forwarded-label";
import { UnsupportedMessageBubble } from "@/components/ui/whatsapp/unsupported-message-bubble";
import type { MessageStatus } from "@/components/ui/whatsapp/message-status";
import {
  SmartphoneIcon,
  PlusIcon,
  SearchIcon,
  SendIcon,
  QrCodeIcon,
  RefreshCwIcon,
  PlayIcon,
  PauseIcon,
  CheckCircle2Icon,
  MessageCircleIcon,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type SessionStatus = "qr" | "ready" | "paused" | "disconnected" | "failed";

interface Session {
  id: string;
  name: string;
  status: SessionStatus;
  qrRaw: string | null;
  qrDataUrl: string | null;
  createdAt: string;
}

interface ChatLastMessage {
  body: string;
  fromMe: boolean;
  timestamp: string;
}

interface ChatSummary {
  id: string;
  name: string;
  isGroup: boolean;
  unreadCount: number;
  lastMessage: ChatLastMessage | null;
}

interface ChatMessage {
  id: string;
  body: string;
  fromMe: boolean;
  timestamp: string;
  ack: number;
  type: string;
  hasMedia: boolean;
  isForwarded: boolean;
  location: { latitude: number; longitude: number; name: string } | null;
  vcardName: string | null;
  vcardPhones: string[];
  poll: { name: string; options: string[]; multi: boolean } | null;
}

interface MediaInfo {
  url: string;
  filename: string | null;
  mimetype: string;
}

const STATUS_TEXT: Record<SessionStatus, string> = {
  qr: "Awaiting scan",
  ready: "Connected",
  paused: "Paused",
  disconnected: "Disconnected",
  failed: "Failed",
};

function fmtTime(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Today";
  const today = new Date();
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = Math.round((now.getTime() - day.getTime()) / 86400000);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function ackToStatus(ack: number): MessageStatus {
  if (ack >= 3) return "read";
  if (ack === 2) return "delivered";
  if (ack === 1) return "sent";
  if (ack === 0) return "sending";
  return "failed";
}

function displayBody(m: ChatMessage) {
  if (m.body) return m.body;
  if (m.hasMedia) return `[${m.type || "media"}]`;
  return "—";
}

const SYSTEM_TYPES = new Set([
  "e2e_notification",
  "notification",
  "gp2",
  "group_notification",
  "notification_template",
]);

function ThreadMessage({
  m,
  isLast,
  media,
  onDownload,
}: {
  m: ChatMessage;
  isLast: boolean;
  media?: MediaInfo;
  onDownload: () => void;
}) {
  const variant = m.fromMe ? "outgoing" : "incoming";
  const time = fmtTime(m.timestamp);
  const status = m.fromMe ? ackToStatus(m.ack) : undefined;

  if (SYSTEM_TYPES.has(m.type)) {
    return <SystemMessageBubble>{m.body || "System message"}</SystemMessageBubble>;
  }

  const wrapForwarded = (node: React.ReactNode) =>
    m.isForwarded ? (
      <div className="w-full">
        <ForwardedLabel />
        {node}
      </div>
    ) : (
      node
    );

  switch (m.type) {
    case "image":
      return wrapForwarded(
        media ? (
          <ImageBubble variant={variant} images={[media.url]} timestamp={time} status={status} showTail={isLast} />
        ) : (
          <ChatBubble variant={variant} timestamp={time} status={status} showTail={isLast}>
            {m.hasMedia ? "📷 Photo — loading…" : displayBody(m)}
          </ChatBubble>
        )
      );
    case "video":
      return wrapForwarded(
        media ? (
          <VideoBubble variant={variant} src={media.url} timestamp={time} status={status} showTail={isLast} />
        ) : (
          <ChatBubble variant={variant} timestamp={time} status={status} showTail={isLast}>
            {m.hasMedia ? "🎬 Video — loading…" : displayBody(m)}
          </ChatBubble>
        )
      );
    case "audio":
    case "ptt":
      return wrapForwarded(
        media ? (
          <VoiceMessageBubble variant={variant} audioSrc={media.url} duration="--:--" timestamp={time} status={status} showTail={isLast} />
        ) : (
          <ChatBubble variant={variant} timestamp={time} status={status} showTail={isLast}>
            {m.hasMedia ? "🎤 Voice message — loading…" : displayBody(m)}
          </ChatBubble>
        )
      );
    case "document":
      return wrapForwarded(
        <FileAttachmentBubble
          variant={variant}
          fileName={media?.filename ?? (m.body || "document")}
          fileType={(media?.filename ?? m.body ?? "").split(".").pop() ?? ""}
          downloadUrl={media?.url}
          onDownload={media ? undefined : onDownload}
          caption={m.body && media?.filename && m.body !== media.filename ? m.body : undefined}
          timestamp={time}
          status={status}
          showTail={isLast}
        />
      );
    case "sticker":
      return media ? (
        <StickerBubble
          variant={variant}
          src={media.url}
          animated={media.mimetype.includes("gif")}
          timestamp={time}
          status={status}
          showTail={isLast}
        />
      ) : (
        <ChatBubble variant={variant} timestamp={time} status={status} showTail={isLast}>
          {m.hasMedia ? "⭐ Sticker — loading…" : displayBody(m)}
        </ChatBubble>
      );
    case "location":
      return m.location ? (
        <LocationBubble
          variant={variant}
          name={m.location.name || undefined}
          latitude={m.location.latitude}
          longitude={m.location.longitude}
          timestamp={time}
          status={status}
          showTail={isLast}
        />
      ) : (
        <ChatBubble variant={variant} timestamp={time} status={status} showTail={isLast}>
          📍 {m.body || "Location"}
        </ChatBubble>
      );
    case "contact":
    case "contact_multi":
      return (
        <ContactBubble
          variant={variant}
          contacts={[
            {
              name: m.vcardName ?? m.body ?? "Contact",
              phones: m.vcardPhones.length > 0 ? m.vcardPhones : undefined,
            },
          ]}
          timestamp={time}
          status={status}
          showTail={isLast}
        />
      );
    case "poll_creation":
      return wrapForwarded(
        <div className="flex w-full justify-start">
          <div className="w-full min-w-[200px] max-w-[320px] overflow-hidden rounded-lg bg-wa-bubble-incoming px-[9px] pb-[7px] pt-[6px] shadow-sm">
            <p className="font-wa text-[14.2px] font-semibold leading-[19px] text-wa-text-primary">
              {m.poll?.name ?? m.body ?? "Poll"}
            </p>
            <div className="mt-2 space-y-1.5">
              {(m.poll?.options ?? []).map((o) => (
                <div key={o} className="flex items-center gap-2 rounded-md border border-wa-border px-2 py-1.5 font-wa text-[13px] text-wa-text-primary">
                  <span className="size-3.5 rounded-full border border-wa-text-secondary" />
                  {o}
                </div>
              ))}
            </div>
            {m.poll?.multi && (
              <p className="mt-1.5 font-wa text-[11px] text-wa-text-secondary">Multiple answers allowed</p>
            )}
            <p className="mt-1 text-right font-wa text-[11px] text-wa-bubble-meta">{time}</p>
          </div>
        </div>
      );
    case "chat":
    case "revoked":
      return wrapForwarded(
        <ChatBubble variant={variant} timestamp={time} status={status} showTail={isLast}>
          {m.type === "revoked" ? "🚫 This message was deleted." : displayBody(m)}
        </ChatBubble>
      );
    default:
      if (!m.body && !m.hasMedia) {
        return (
          <UnsupportedMessageBubble
            variant={variant}
            title="Unsupported message"
            description={`Type "${m.type}" can't be previewed yet.`}
            timestamp={time}
            status={status}
            showTail={isLast}
          />
        );
      }
      return wrapForwarded(
        <ChatBubble variant={variant} timestamp={time} status={status} showTail={isLast}>
          {displayBody(m)}
        </ChatBubble>
      );
  }
}

export default function ChatsPage() {
  // Sessions (real backend)
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [pairing, setPairing] = useState<Session | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Real chats for the selected session
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [chatsLoading, setChatsLoading] = useState(false);
  const [chatsError, setChatsError] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [msgLimit, setMsgLimit] = useState(50);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [chatFilter, setChatFilter] = useState<"all" | "unread" | "groups">("all");
  const [media, setMedia] = useState<Record<string, MediaInfo>>({});
  const threadPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMedia = useCallback(async (sessionId: string, chat: string, msgId: string) => {
    try {
      const res = await fetch(
        `${API}/api/sessions/${sessionId}/chats/${encodeURIComponent(chat)}/messages/${encodeURIComponent(msgId)}/media`
      );
      const data = await res.json();
      if (res.ok && data.media) {
        const info: MediaInfo = {
          url: `data:${data.media.mimetype};base64,${data.media.data}`,
          filename: data.media.filename,
          mimetype: data.media.mimetype,
        };
        setMedia((prev) => (prev[msgId] ? prev : { ...prev, [msgId]: info }));
      }
    } catch {
      // placeholder stays until user retries by reopening the chat
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/sessions`);
      const data = await res.json();
      setSessions(data.sessions ?? []);
    } catch {
      // backend offline
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const stopThreadPolling = useCallback(() => {
    if (threadPollRef.current) {
      clearInterval(threadPollRef.current);
      threadPollRef.current = null;
    }
  }, []);

  useEffect(() => stopThreadPolling, [stopThreadPolling]);

  // Auto-select first ready session (else first session)
  useEffect(() => {
    if (selectedSessionId || sessions.length === 0) return;
    const ready = sessions.find((s) => s.status === "ready");
    setSelectedSessionId(ready?.id ?? sessions[0].id);
  }, [sessions, selectedSessionId]);

  // Always stick to a connected number when one is available
  useEffect(() => {
    if (sessions.length === 0) return;
    const current = sessions.find((s) => s.id === selectedSessionId);
    if (current?.status === "ready") return;
    // Don't yank the user away while they're pairing this number
    if (pairing && pairing.status !== "ready") return;
    const ready = sessions.find((s) => s.status === "ready");
    if (ready && ready.id !== selectedSessionId) {
      stopPolling();
      setPairing(null);
      setSelectedSessionId(ready.id);
    }
  }, [sessions, selectedSessionId, pairing, stopPolling]);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) ?? null;
  const sessionReady = selectedSession?.status === "ready";

  const fetchChats = useCallback(async (sessionId: string) => {
    setChatsLoading(true);
    setChatsError(null);
    try {
      const res = await fetch(`${API}/api/sessions/${sessionId}/chats`);
      const data = await res.json();
      if (!res.ok) {
        setChatsError(data.error ?? "Failed to load chats.");
        setChats([]);
        return;
      }
      setChats(data.chats ?? []);
    } catch {
      setChatsError("Backend unreachable. Is it running on :4000?");
      setChats([]);
    } finally {
      setChatsLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (sessionId: string, id: string, limit = 50) => {
    setMsgsLoading(true);
    try {
      const res = await fetch(
        `${API}/api/sessions/${sessionId}/chats/${encodeURIComponent(id)}/messages?limit=${limit}`
      );
      const data = await res.json();
      if (res.ok) setMessages(data.messages ?? []);
    } catch {
      // keep previous messages on poll failure
    } finally {
      setMsgsLoading(false);
    }
  }, []);

  // Load chats when a connected session is selected
  useEffect(() => {
    stopThreadPolling();
    if (!selectedSessionId || !sessionReady) {
      setChats([]);
      setChatId(null);
      setMessages([]);
      return;
    }
    setChatId(null);
    setMessages([]);
    void fetchChats(selectedSessionId);
  }, [selectedSessionId, sessionReady, fetchChats, stopThreadPolling]);

  // Load thread when a chat is opened + poll it for new messages
  useEffect(() => {
    stopThreadPolling();
    setMedia({});
    if (!selectedSessionId || !chatId) return;
    void fetchMessages(selectedSessionId, chatId, msgLimit);
    threadPollRef.current = setInterval(() => {
      void fetchMessages(selectedSessionId, chatId, msgLimit);
    }, 10000);
    return stopThreadPolling;
  }, [selectedSessionId, chatId, msgLimit, fetchMessages, stopThreadPolling]);

  // Lazy-load media for the newest attachments in the open thread
  useEffect(() => {
    if (!selectedSessionId || !chatId) return;
    messages
      .filter((m) => m.hasMedia && !media[m.id])
      .slice(-8)
      .forEach((m) => void fetchMedia(selectedSessionId, chatId, m.id));
  }, [messages, selectedSessionId, chatId, fetchMedia]);

  const pollPairing = useCallback(
    (id: string) => {
      stopPolling();
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`${API}/api/sessions/${id}`);
          if (!res.ok) return;
          const data = await res.json();
          setPairing(data.session);
          if (data.session?.status === "ready" || data.session?.status === "failed") {
            stopPolling();
            void fetchSessions();
          }
        } catch {
          // retry next tick
        }
      }, 2000);
    },
    [fetchSessions, stopPolling]
  );

  const startPairing = useCallback(
    async (s: Session) => {
      setPairing(s);
      if (s.status !== "ready" && s.status !== "qr") {
        setBusyId(s.id);
        try {
          await fetch(`${API}/api/sessions/${s.id}/start`, { method: "POST" });
          await fetchSessions();
        } finally {
          setBusyId(null);
        }
      }
      pollPairing(s.id);
      try {
        const res = await fetch(`${API}/api/sessions/${s.id}`);
        if (res.ok) {
          const data = await res.json();
          setPairing(data.session);
        }
      } catch {
        // polling picks it up
      }
    },
    [fetchSessions, pollPairing]
  );

  const selectSession = (s: Session) => {
    stopPolling();
    stopThreadPolling();
    setSelectedSessionId(s.id);
    if (s.status === "ready") {
      setPairing(null);
    } else {
      void startPairing(s);
    }
  };

  const handleStart = async (id: string) => {
    setBusyId(id);
    try {
      await fetch(`${API}/api/sessions/${id}/start`, { method: "POST" });
      await fetchSessions();
      const res = await fetch(`${API}/api/sessions/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPairing(data.session);
        pollPairing(id);
      }
    } finally {
      setBusyId(null);
    }
  };

  const handlePause = async (id: string) => {
    setBusyId(id);
    try {
      await fetch(`${API}/api/sessions/${id}/pause`, { method: "POST" });
      stopPolling();
      await fetchSessions();
      setPairing(null);
    } finally {
      setBusyId(null);
    }
  };

  const handleSend = async (text: string) => {
    if (!selectedSessionId || !chatId) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch(`${API}/api/sessions/${selectedSessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: chatId, type: "text", text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSendError(data.error ?? "Send failed.");
        return;
      }
      if (data.message) setMessages((prev) => [...prev, data.message]);
      void fetchChats(selectedSessionId);
    } catch {
      setSendError("Backend unreachable. Is it running on :4000?");
    } finally {
      setSending(false);
    }
  };

  const activeChat = chats.find((c) => c.id === chatId) ?? null;
  const unreadTotal = chats.reduce((n, c) => n + (c.unreadCount > 0 ? 1 : 0), 0);
  const groupTotal = chats.filter((c) => c.isGroup).length;
  const searched = chats.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.lastMessage?.body ?? "").toLowerCase().includes(search.toLowerCase())
  );
  const filtered = searched.filter((c) => {
    if (chatFilter === "unread") return c.unreadCount > 0;
    if (chatFilter === "groups") return c.isGroup;
    return true;
  });

  const livePairing = pairing && pairing.id === selectedSessionId ? pairing : null;

  return (
    <DashboardShell title="Chats">
      {/* Slim WhatsApp-style toolbar */}
      <div className="-mb-2 flex flex-wrap items-center gap-2">
        <h1 className="font-wa text-[19px] font-medium text-wa-text-primary">
          Chats
        </h1>
        {sessionReady && chats.length > 0 && (
          <span className="rounded-full bg-wa-unread-marker px-2 py-0.5 font-wa text-[11px] font-bold text-white">
            {chats.length}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <select
            value={selectedSessionId ?? ""}
            onChange={(e) => {
              const s = sessions.find((x) => x.id === e.target.value);
              if (s) selectSession(s);
            }}
            aria-label="Select number"
            title="Select number"
            className="h-9 max-w-44 cursor-pointer truncate rounded-xl border border-border/70 bg-card px-2.5 text-[13px] font-medium outline-none transition-colors hover:border-border focus-visible:border-emerald-500/50"
          >
            {sessions.length === 0 && <option value="">No numbers</option>}
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.status === "ready" ? "● " : "○ "}
                {s.name} · {STATUS_TEXT[s.status]}
              </option>
            ))}
          </select>
          {sessionReady && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedSessionId && void fetchChats(selectedSessionId)}
              disabled={chatsLoading}
              className="h-9 rounded-xl"
            >
              <RefreshCwIcon className={cn(chatsLoading && "animate-spin")} />
              Refresh
            </Button>
          )}
          <Link href="/sessions">
            <Button variant="outline" className="h-9 rounded-xl">
              <SmartphoneIcon />
              <span className="hidden sm:inline">Manage sessions</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Full-bleed WhatsApp UI — chats + conversation */}
      <div className="flex min-h-[calc(100svh-11rem)] w-full flex-1 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm lg:flex-row">
        {/* Pair screen OR real conversations */}
        {sessionsLoading ? (
          <div className="flex flex-1 flex-col gap-2 p-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton-shimmer h-16 rounded-xl border border-border/60" />
            ))}
          </div>
        ) : !selectedSession ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground shadow-sm">
              <QrCodeIcon className="size-5" />
            </span>
            <h2 className="text-[15px] font-semibold tracking-tight">No numbers yet</h2>
            <p className="max-w-sm text-[13px] leading-relaxed text-muted-foreground">
              Connect your first WhatsApp number to start chatting.
            </p>
            <Link href="/sessions">
              <Button className="h-9 rounded-xl">
                <PlusIcon />
                Connect a number
              </Button>
            </Link>
          </div>
        ) : !sessionReady ? (
          <div className="wa-wallpaper flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
            <Badge variant="secondary" className="rounded-full font-mono">
              {selectedSession ? STATUS_TEXT[selectedSession.status] : "no number selected"}
            </Badge>
            <h2 className="font-wa text-2xl font-light text-wa-text-primary">
              {selectedSession ? `Connect “${selectedSession.name}”` : "Select a number"}
            </h2>
            {livePairing?.status === "ready" ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-emerald-500/25 bg-wa-bubble-incoming p-6 shadow-sm">
                <CheckCircle2Icon className="size-8 text-emerald-600" />
                <p className="font-wa font-semibold text-wa-text-primary">Connected</p>
                <p className="font-wa text-[13px] text-wa-text-secondary">This number is now live — its chats load automatically.</p>
              </div>
            ) : livePairing?.qrDataUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={livePairing.qrDataUrl}
                  alt="WhatsApp QR code"
                  className="size-64 rounded-2xl border border-wa-border bg-white p-3 shadow-sm"
                />
                <ol className="max-w-sm space-y-1.5 font-wa text-[13.5px] text-wa-text-primary">
                  <li>1. Open WhatsApp on your phone</li>
                  <li>2. Go to Settings → Linked devices</li>
                  <li>3. Tap “Link a device” and scan</li>
                </ol>
                <p className="flex items-center gap-1.5 rounded-full bg-wa-bubble-incoming px-3 py-1.5 font-wa text-[12px] text-wa-text-secondary shadow-sm">
                  <RefreshCwIcon className="size-3 animate-spin" />
                  Waiting for scan… (auto-refreshes)
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <RefreshCwIcon className="size-8 animate-spin text-wa-text-secondary" />
                <p className="font-wa text-[13.5px] text-wa-text-secondary">
                  Starting browser, generating QR…
                </p>
                {selectedSession && (selectedSession.status === "paused" || selectedSession.status === "disconnected" || selectedSession.status === "failed") && (
                  <Button
                    onClick={() => void handleStart(selectedSession.id)}
                    disabled={busyId === selectedSession.id}
                    className="h-9 rounded-xl"
                  >
                    <PlayIcon /> Start session
                  </Button>
                )}
              </div>
            )}
            {selectedSession && (selectedSession.status === "qr") && (
              <Button
                type="button"
                variant="outline"
                onClick={() => void handlePause(selectedSession.id)}
                disabled={busyId === selectedSession.id}
                className="h-8 rounded-lg bg-wa-bubble-incoming font-wa"
              >
                <PauseIcon /> Pause session
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Pane 2 — every conversation, filterable */}
            <div className="flex w-full shrink-0 flex-col border-b border-border/60 lg:h-auto lg:w-80 lg:border-r lg:border-b-0">
              <div className="space-y-2.5 border-b border-border/60 p-3">
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search conversations…"
                    aria-label="Search conversations"
                    className="h-9 rounded-xl bg-muted/50 pr-3 pl-9 text-[13px]"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  {(
                    [
                      { id: "all", label: "All", count: chats.length },
                      { id: "unread", label: "Unread", count: unreadTotal },
                      { id: "groups", label: "Groups", count: groupTotal },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setChatFilter(t.id)}
                      className={cn(
                        "flex h-7 items-center gap-1.5 rounded-full px-3 font-wa text-[12.5px] transition-colors",
                        chatFilter === t.id
                          ? "bg-wa-filter-bg-active font-medium text-wa-filter-active"
                          : "text-wa-filter-text hover:bg-wa-hover"
                      )}
                    >
                      {t.label}
                      <span className="font-mono text-[11px] tabular-nums">{t.count}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="max-h-64 flex-1 overflow-y-auto py-1 lg:max-h-none">
                {chatsLoading ? (
                  [0, 1, 2, 3].map((i) => (
                    <div key={i} className="mx-2 my-1 h-16 rounded-xl bg-muted/50" />
                  ))
                ) : chatsError ? (
                  <p className="px-4 py-8 text-center text-[13px] text-red-600">{chatsError}</p>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                    <MessageCircleIcon className="size-6 text-muted-foreground" />
                    <p className="text-[13px] text-muted-foreground">
                      {chats.length === 0
                        ? "No conversations on this number yet — send it a message from your phone."
                        : chatFilter !== "all"
                          ? `Nothing under “${chatFilter}” — try All.`
                          : "No conversations match your search."}
                    </p>
                  </div>
                ) : (
                  filtered.map((c) => (
                    <ChatListItem
                      key={c.id}
                      name={c.isGroup ? `👥 ${c.name}` : c.name}
                      lastMessage={c.lastMessage?.body || ""}
                      lastMessageStatus={
                        c.lastMessage?.fromMe ? "delivered" : undefined
                      }
                      timestamp={c.lastMessage ? fmtTime(c.lastMessage.timestamp) : ""}
                      unreadCount={chatId === c.id ? 0 : c.unreadCount}
                      isSelected={chatId === c.id}
                      onClick={() => {
                        setMsgLimit(50);
                        setChatId(c.id);
                      }}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Pane 3 — real conversation */}
            <div className="flex min-h-[480px] min-w-0 flex-1 flex-col">
              {!activeChat ? (
                <div className="wa-wallpaper flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
                  <MessageCircleIcon className="size-8 text-wa-text-secondary" />
                  <p className="font-wa text-[15px] text-wa-text-primary">Select a conversation</p>
                  <p className="font-wa text-[13px] text-wa-text-secondary">
                    {chats.length > 0 ? "Pick a chat on the left to read and reply." : "Chats from this number appear here."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="border-b border-border/60">
                    <ChatHeader
                      name={activeChat.name}
                      status={`via ${selectedSession?.name ?? ""}${activeChat.isGroup ? " · group" : ""}`}
                      onSearch={() => {}}
                      onMenu={() => {}}
                    />
                  </div>
                  <div className="wa-wallpaper flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto px-4 py-3 sm:px-8">
                    {msgsLoading && messages.length === 0 ? (
                      <div className="flex flex-1 items-center justify-center gap-2 font-wa text-[13px] text-wa-text-secondary">
                        <RefreshCwIcon className="size-4 animate-spin" />
                        Loading messages…
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-1 items-center justify-center">
                        <DateSeparator label="No messages yet — say hi" />
                      </div>
                    ) : (
                      <>
                        <DateSeparator label={dayLabel(messages[0].timestamp)} />
                        {msgLimit < 500 && messages.length >= msgLimit && (
                          <button
                            type="button"
                            onClick={() => setMsgLimit((l) => Math.min(l + 100, 500))}
                            className="mx-auto mb-2 rounded-full bg-wa-bubble-incoming px-4 py-1.5 font-wa text-[12px] text-wa-text-secondary shadow-sm transition-colors hover:text-wa-text-primary"
                          >
                            Load older messages
                          </button>
                        )}
                        {messages.map((m, i) => (
                          <ThreadMessage
                            key={m.id}
                            m={m}
                            isLast={i === messages.length - 1}
                            media={media[m.id]}
                            onDownload={() =>
                              selectedSessionId &&
                              chatId &&
                              void fetchMedia(selectedSessionId, chatId, m.id)
                            }
                          />
                        ))}
                      </>
                    )}
                    {sendError && (
                      <p className="mx-auto mb-2 max-w-md rounded-xl border border-red-500/25 bg-wa-bubble-incoming px-3 py-2 text-center font-wa text-[12.5px] text-red-600">
                        {sendError}
                      </p>
                    )}
                  </div>
                  <div className="border-t border-border/60">
                    <MessageInput
                      placeholder={`Message ${activeChat.name}…`}
                      onSubmit={(text) => void handleSend(text)}
                      rightAction={({ hasMessage, submit }) => (
                        <button
                          type="button"
                          onClick={submit}
                          disabled={!hasMessage || sending}
                          aria-label={hasMessage ? "Send message" : "Voice message"}
                          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-wa-emerald-500 text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-40"
                        >
                          {hasMessage ? (
                            <SendIcon className="size-4" />
                          ) : (
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              <path d="M12 15a3.5 3.5 0 0 0 3.5-3.5V6a3.5 3.5 0 0 0-7 0v5.5A3.5 3.5 0 0 0 12 15zm6-3.5a6 6 0 0 1-12 0H4a8 8 0 0 0 7 7.94V22h2v-2.06a8 8 0 0 0 7-7.94h-2z" />
                            </svg>
                          )}
                        </button>
                      )}
                    />
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
