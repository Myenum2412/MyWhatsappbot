"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ChatBubble } from "@/components/ui/whatsapp/chat-bubble";
import { ImageBubble } from "@/components/ui/whatsapp/image-bubble";
import { VideoBubble } from "@/components/ui/whatsapp/video-bubble";
import { FileAttachmentBubble } from "@/components/ui/whatsapp/file-attachment-bubble";
import { ContactBubble } from "@/components/ui/whatsapp/contact-bubble";
import { LocationBubble } from "@/components/ui/whatsapp/location-bubble";
import {
  FlaskConicalIcon,
  SendIcon,
  TypeIcon,
  ImageIcon,
  VideoIcon,
  MicIcon,
  FileTextIcon,
  MapPinIcon,
  ContactIcon,
  SmileIcon,
  BarChart3Icon,
  ForwardIcon,
  LayersIcon,
  CircleAlertIcon,
  CheckCircle2Icon,
  Loader2Icon,
  RotateCcwIcon,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type RecipientType = "personal" | "group";

type MsgType =
  | "text" | "image" | "video" | "audio" | "document"
  | "location" | "contact" | "sticker" | "poll" | "forward" | "bulk";

interface SessionOpt {
  id: string;
  name: string;
  status: string;
}

const MSG_TYPES: { id: MsgType; label: string; icon: typeof TypeIcon }[] = [
  { id: "text", label: "Text", icon: TypeIcon },
  { id: "image", label: "Image", icon: ImageIcon },
  { id: "video", label: "Video", icon: VideoIcon },
  { id: "audio", label: "Audio", icon: MicIcon },
  { id: "document", label: "Document", icon: FileTextIcon },
  { id: "location", label: "Location", icon: MapPinIcon },
  { id: "contact", label: "Contact", icon: ContactIcon },
  { id: "sticker", label: "Sticker", icon: SmileIcon },
  { id: "poll", label: "Poll", icon: BarChart3Icon },
  { id: "forward", label: "Forward", icon: ForwardIcon },
  { id: "bulk", label: "Bulk", icon: LayersIcon },
];

const selectClass =
  "h-10 w-full rounded-xl border border-input bg-card px-3 text-[13px] outline-none transition-all duration-150 focus-visible:border-emerald-500/50 focus-visible:ring-4 focus-visible:ring-emerald-500/15";

const textareaClass =
  "min-h-28 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm outline-none transition-all duration-150 placeholder:text-muted-foreground focus-visible:border-emerald-500/50 focus-visible:ring-4 focus-visible:ring-emerald-500/15";

const MEDIA_TYPES: Partial<Record<MsgType, string>> = {
  image: "image/*",
  video: "video/*",
  audio: "audio/*",
  sticker: "image/*",
};

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default function MessageTesterPage() {
  // Session
  const [sessions, setSessions] = useState<SessionOpt[]>([]);
  const [sessionId, setSessionId] = useState("");

  // Recipient
  const [recipientType, setRecipientType] = useState<RecipientType>("personal");
  const [phone, setPhone] = useState("");
  const [groupId, setGroupId] = useState("");

  // Message
  const [msgType, setMsgType] = useState<MsgType>("text");
  const [text, setText] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [locName, setLocName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [pollQ, setPollQ] = useState("");
  const [pollOptions, setPollOptions] = useState("");
  const [pollMulti, setPollMulti] = useState(false);
  const [forwardId, setForwardId] = useState("");
  const [bulkNumbers, setBulkNumbers] = useState("");
  const [bulkText, setBulkText] = useState("");

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/sessions`);
        const data = await res.json();
        const list: SessionOpt[] = data.sessions ?? [];
        setSessions(list);
        const ready = list.find((s) => s.status === "ready");
        setSessionId(ready?.id ?? list[0]?.id ?? "");
      } catch {
        // backend offline
      }
    })();
  }, []);

  useEffect(() => {
    if (!file) {
      setFileUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const to = recipientType === "personal" ? phone.trim() : groupId.trim();

  const bulkList = useMemo(
    () => bulkNumbers.split("\n").map((n) => n.trim()).filter(Boolean),
    [bulkNumbers]
  );

  const pollList = useMemo(
    () => pollOptions.split("\n").map((o) => o.trim()).filter(Boolean),
    [pollOptions]
  );

  const validationError = (): string | null => {
    if (!sessionId) return "Select a connected session first.";
    if (!to) return recipientType === "personal" ? "Enter the recipient phone number." : "Enter the group ID.";
    switch (msgType) {
      case "text": return text.trim() ? null : "Type a message.";
      case "image": case "video": case "audio": case "document": case "sticker":
        return file ? null : "Choose a file to send.";
      case "location":
        return lat.trim() !== "" && lng.trim() !== "" && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))
          ? null : "Enter a valid latitude and longitude.";
      case "contact": return contactName.trim() && contactPhone.trim() ? null : "Enter contact name and phone.";
      case "poll": return pollQ.trim() && pollList.length >= 2 ? null : "Enter a question with at least 2 options.";
      case "forward": return forwardId.trim() ? null : "Enter the source message ID to forward.";
      case "bulk": return bulkList.length > 0 && bulkText.trim() ? null : "Add recipients (one per line) and a message.";
    }
  };

  const handleSend = async () => {
    const err = validationError();
    if (err) {
      setResult({ ok: false, message: err });
      return;
    }
    setSending(true);
    setResult(null);
    try {
      const payload: Record<string, unknown> = {
        to,
        recipientType,
        type: msgType,
        text: msgType === "bulk" ? bulkText.trim() : text.trim() || undefined,
        caption: caption.trim() || undefined,
        fileName: file?.name,
        fileSize: file?.size,
        mimeType: file?.type,
        latitude: lat.trim() ? Number(lat) : undefined,
        longitude: lng.trim() ? Number(lng) : undefined,
        locationName: locName.trim() || undefined,
        contactName: contactName.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        pollQuestion: pollQ.trim() || undefined,
        pollOptions: pollList.length > 0 ? pollList : undefined,
        pollMulti,
        forwardMessageId: forwardId.trim() || undefined,
        bulkRecipients: bulkList.length > 0 ? bulkList : undefined,
      };
      const res = await fetch(`${API}/api/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResult({
          ok: false,
          message:
            res.status === 404
              ? "Send API not available yet (404) — wire POST /api/sessions/:id/messages in the backend to go live."
              : (data.error ?? `Send failed (HTTP ${res.status}).`),
        });
        return;
      }
      setResult({ ok: true, message: data.messageId ? `Sent · id ${data.messageId}` : "Sent successfully." });
    } catch {
      setResult({ ok: false, message: "Backend unreachable. Is it running on :4000?" });
    } finally {
      setSending(false);
    }
  };

  const handleClear = () => {
    setPhone("");
    setGroupId("");
    setText("");
    setCaption("");
    setFile(null);
    setLat("");
    setLng("");
    setLocName("");
    setContactName("");
    setContactPhone("");
    setPollQ("");
    setPollOptions("");
    setForwardId("");
    setBulkNumbers("");
    setBulkText("");
    setResult(null);
  };

  const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const fileExt = file?.name.includes(".") ? (file.name.split(".").pop() ?? "") : "";

  const hasPreview =
    msgType === "text" ||
    msgType === "forward" ||
    msgType === "bulk" ||
    !!fileUrl ||
    !!file ||
    (msgType === "poll" && (!!pollQ.trim() || pollList.length > 0)) ||
    (msgType === "location" && lat.trim() !== "" && lng.trim() !== "" && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))) ||
    (msgType === "contact" && (!!contactName.trim() || !!contactPhone.trim()));

  return (
    <DashboardShell title="Message Tester">
      <PageHeader
        eyebrow="Messaging · QA"
        title="Message Tester"
        description="Send a test message to validate templates and delivery."
      />

      <div className="grid w-full flex-1 grid-cols-1 items-start gap-4 xl:grid-cols-[1fr_360px]">
        {/* Left — tester form */}
        <div className="flex h-fit w-full flex-col gap-4">
          {/* Session */}
          <Card className="flex h-fit w-full flex-col gap-0">
            <div className="border-b border-border/70 px-5 py-3.5">
              <p className="text-[13.5px] font-semibold tracking-tight">Session</p>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                Which connected number sends this test.
              </p>
            </div>
            <div className="space-y-1.5 px-5 py-4">
              <Label htmlFor="ts-session">Session</Label>
              <select
                id="ts-session"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className={selectClass}
              >
                {sessions.length === 0 && <option value="">No sessions found</option>}
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.status}
                  </option>
                ))}
              </select>
              {sessions.length === 0 && (
                <p className="text-[12.5px] text-muted-foreground">
                  No sessions yet —{" "}
                  <Link href="/sessions" className="font-medium text-foreground underline underline-offset-4">
                    connect one first
                  </Link>
                  .
                </p>
              )}
            </div>
          </Card>

          {/* Recipient */}
          <Card className="flex h-fit w-full flex-col gap-0">
            <div className="border-b border-border/70 px-5 py-3.5">
              <p className="text-[13.5px] font-semibold tracking-tight">Recipient</p>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                Personal chat or group.
              </p>
            </div>
            <div className="space-y-4 px-5 py-4">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/50 p-1">
                {(["personal", "group"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRecipientType(r)}
                    className={cn(
                      "h-9 rounded-lg text-[13px] font-medium capitalize transition-all",
                      recipientType === r
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {recipientType === "personal" ? (
                <div className="space-y-1.5">
                  <Label htmlFor="ts-phone">Recipient phone number</Label>
                  <Input
                    id="ts-phone"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-10 rounded-xl font-mono text-[13px]"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="ts-group">Group</Label>
                  <Input
                    id="ts-group"
                    placeholder="1203630…@g.us"
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    className="h-10 rounded-xl font-mono text-[13px]"
                  />
                  <p className="text-[12px] text-muted-foreground">
                    Paste the group ID (ends with @g.us).
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Message type + content */}
          <Card className="flex h-fit w-full flex-col gap-0">
            <div className="border-b border-border/70 px-5 py-3.5">
              <p className="text-[13.5px] font-semibold tracking-tight">Message</p>
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                Pick a type, then fill its content.
              </p>
            </div>
            <div className="space-y-4 px-5 py-4">
              <div>
                <Label>Message type</Label>
                <div className="mt-1.5 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {MSG_TYPES.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMsgType(m.id)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-[12px] font-medium transition-all duration-150",
                        msgType === m.id
                          ? "border-primary/40 bg-primary/[0.04] text-foreground"
                          : "border-border/70 text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground"
                      )}
                    >
                      <m.icon className="size-5" />
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content per type */}
              {(msgType === "text" || msgType === "forward") && (
                <div className="space-y-1.5">
                  <Label htmlFor="ts-text">Message content</Label>
                  <textarea
                    id="ts-text"
                    className={textareaClass}
                    placeholder="Type your test message…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
              )}
              {msgType === "forward" && (
                <div className="space-y-1.5">
                  <Label htmlFor="ts-fwd">Source message ID</Label>
                  <Input
                    id="ts-fwd"
                    placeholder="e.g. 3EB0…"
                    value={forwardId}
                    onChange={(e) => setForwardId(e.target.value)}
                    className="h-10 rounded-xl font-mono text-[13px]"
                  />
                </div>
              )}
              {(msgType === "image" || msgType === "video" || msgType === "audio" || msgType === "document" || msgType === "sticker") && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="ts-file">File</Label>
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-6 text-[13px] font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted/40 hover:text-foreground">
                      {file ? file.name : `Choose ${msgType} file…`}
                      <input
                        id="ts-file"
                        type="file"
                        accept={MEDIA_TYPES[msgType]}
                        className="hidden"
                        onChange={(e) => {
                          setFile(e.target.files?.[0] ?? null);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {file && (
                      <p className="font-mono text-[11.5px] text-muted-foreground">
                        {formatBytes(file.size)} · {file.type || "unknown type"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ts-caption">Caption (optional)</Label>
                    <Input
                      id="ts-caption"
                      placeholder="Caption shown under the media…"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="h-10 rounded-xl"
                    />
                  </div>
                </div>
              )}
              {msgType === "location" && (
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
                  <div className="space-y-1.5">
                    <Label htmlFor="ts-lat">Latitude</Label>
                    <Input id="ts-lat" placeholder="19.0760" value={lat} onChange={(e) => setLat(e.target.value)} className="h-10 rounded-xl font-mono text-[13px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ts-lng">Longitude</Label>
                    <Input id="ts-lng" placeholder="72.8777" value={lng} onChange={(e) => setLng(e.target.value)} className="h-10 rounded-xl font-mono text-[13px]" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="ts-locname">Place name (optional)</Label>
                    <Input id="ts-locname" placeholder="Gateway of India" value={locName} onChange={(e) => setLocName(e.target.value)} className="h-10 rounded-xl" />
                  </div>
                </div>
              )}
              {msgType === "contact" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="ts-cname">Contact name</Label>
                    <Input id="ts-cname" placeholder="Jane Smith" value={contactName} onChange={(e) => setContactName(e.target.value)} className="h-10 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ts-cphone">Contact phone</Label>
                    <Input id="ts-cphone" placeholder="+91 98765 43210" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="h-10 rounded-xl font-mono text-[13px]" />
                  </div>
                </div>
              )}
              {msgType === "poll" && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="ts-pollq">Question</Label>
                    <Input id="ts-pollq" placeholder="Which plan do you prefer?" value={pollQ} onChange={(e) => setPollQ(e.target.value)} className="h-10 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ts-pollopts">Options (one per line, min 2)</Label>
                    <textarea id="ts-pollopts" className={textareaClass} placeholder={"Basic\nPro\nEnterprise"} value={pollOptions} onChange={(e) => setPollOptions(e.target.value)} />
                  </div>
                  <label className="flex cursor-pointer items-center gap-2.5 text-[13px]">
                    <Checkbox checked={pollMulti} onCheckedChange={(v) => setPollMulti(v === true)} aria-label="Allow multiple answers" />
                    Allow multiple answers
                  </label>
                </div>
              )}
              {msgType === "bulk" && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="ts-bulk-nums">Recipients (one number per line)</Label>
                    <textarea id="ts-bulk-nums" className={textareaClass} placeholder={"+919876543210\n+919876543211"} value={bulkNumbers} onChange={(e) => setBulkNumbers(e.target.value)} />
                    {bulkList.length > 0 && (
                      <p className="font-mono text-[11.5px] text-muted-foreground tabular-nums">
                        {bulkList.length} recipients
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ts-bulk-text">Message content</Label>
                    <textarea id="ts-bulk-text" className={textareaClass} placeholder="Message sent to everyone…" value={bulkText} onChange={(e) => setBulkText(e.target.value)} />
                  </div>
                </div>
              )}

              {result && (
                <p
                  role={result.ok ? "status" : "alert"}
                  className={cn(
                    "flex items-start gap-2 rounded-xl border px-3 py-2.5 text-[13px]",
                    result.ok
                      ? "border-emerald-500/25 bg-emerald-500/[0.07] text-emerald-800 dark:text-emerald-200"
                      : "border-red-500/20 bg-red-500/[0.06] text-red-700 dark:text-red-300"
                  )}
                >
                  {result.ok ? (
                    <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />
                  ) : (
                    <CircleAlertIcon className="mt-0.5 size-4 shrink-0" />
                  )}
                  {result.message}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-4">
                <Button type="button" variant="outline" onClick={handleClear} disabled={sending} className="h-10 rounded-xl">
                  <RotateCcwIcon />
                  Clear
                </Button>
                <Button onClick={() => void handleSend()} disabled={sending} className="h-10 rounded-xl px-5">
                  {sending ? <Loader2Icon className="animate-spin" /> : <SendIcon />}
                  {sending ? "Sending…" : "Send message"}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right — preview + checklist */}
        <div className="flex w-full flex-col gap-4">
          <Card className="flex h-fit w-full flex-col gap-0 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border/70 px-5 py-3.5">
              <FlaskConicalIcon className="size-4 text-emerald-600" />
              <p className="text-[13.5px] font-semibold">Preview · WhatsApp</p>
            </div>
            <div className="wa-wallpaper flex min-h-64 flex-col items-center justify-center gap-2 p-4">
              {msgType === "text" && (
                <ChatBubble variant="outgoing" timestamp={stamp} status="sent" showTail>
                  {text || "Start typing…"}
                </ChatBubble>
              )}
              {msgType === "image" && fileUrl && (
                <ImageBubble variant="outgoing" src={fileUrl} caption={caption || undefined} timestamp={stamp} status="sent" showTail />
              )}
              {msgType === "video" && fileUrl && (
                <VideoBubble variant="outgoing" src={fileUrl} caption={caption || undefined} timestamp={stamp} status="sent" showTail />
              )}
              {(msgType === "audio" || msgType === "document") && file && (
                <FileAttachmentBubble
                  variant="outgoing"
                  fileName={file.name}
                  fileSize={formatBytes(file.size)}
                  fileType={fileExt}
                  downloadUrl={fileUrl || undefined}
                  caption={caption || undefined}
                  timestamp={stamp}
                  status="sent"
                  showTail
                />
              )}
              {msgType === "sticker" && fileUrl && (
                <img src={fileUrl} alt="Sticker preview" className="size-40 object-contain" />
              )}
              {msgType === "location" && lat.trim() !== "" && lng.trim() !== "" && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng)) && (
                <LocationBubble
                  variant="outgoing"
                  name={locName || undefined}
                  latitude={Number(lat)}
                  longitude={Number(lng)}
                  timestamp={stamp}
                  status="sent"
                  showTail
                />
              )}
              {msgType === "contact" && (contactName.trim() || contactPhone.trim()) && (
                <ContactBubble
                  variant="outgoing"
                  contacts={[{ name: contactName || "Unnamed", phones: contactPhone ? [contactPhone] : [] }]}
                  timestamp={stamp}
                  status="sent"
                  showTail
                />
              )}
              {msgType === "poll" && (pollQ.trim() || pollList.length > 0) && (
                <div className="w-full min-w-[200px] max-w-[320px] overflow-hidden rounded-lg bg-wa-bubble-outgoing px-[9px] pb-[7px] pt-[6px] shadow-sm">
                  <p className="font-wa text-[14.2px] font-semibold leading-[19px] text-wa-text-primary">
                    {pollQ || "Poll question…"}
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {pollList.map((o) => (
                      <div key={o} className="flex items-center gap-2 rounded-md border border-wa-border px-2 py-1.5 font-wa text-[13px] text-wa-text-primary">
                        <span className="size-3.5 rounded-full border border-wa-text-secondary" />
                        {o}
                      </div>
                    ))}
                    {pollList.length === 0 && (
                      <p className="font-wa text-[13px] text-wa-text-secondary">Options appear here…</p>
                    )}
                  </div>
                  {pollMulti && <p className="mt-1.5 font-wa text-[11px] text-wa-text-secondary">Multiple answers allowed</p>}
                </div>
              )}
              {msgType === "forward" && (
                <div className="w-full">
                  <p className="mb-1 font-wa text-[12.5px] italic text-wa-text-secondary">Forwarded</p>
                  <ChatBubble variant="outgoing" timestamp={stamp} status="sent" showTail>
                    {text || (forwardId ? `Forwarding ${forwardId}…` : "Message to forward…")}
                  </ChatBubble>
                </div>
              )}
              {msgType === "bulk" && (
                <div className="w-full">
                  <ChatBubble variant="outgoing" timestamp={stamp} status="sent" showTail>
                    {bulkText || "Bulk message…"}
                  </ChatBubble>
                  <p className="mt-1.5 text-center font-mono text-[11px] text-wa-text-secondary tabular-nums">
                    → {bulkList.length} recipients
                  </p>
                </div>
              )}
              {!hasPreview && (
                <p className="font-wa text-[13px] text-wa-text-secondary">Fill the content to preview…</p>
              )}
            </div>
            <p className="border-t border-border/60 px-5 py-3 font-mono text-[11px] text-muted-foreground">
              to: {to || "—"} · {msgType} · {recipientType}
            </p>
          </Card>

          <Card className="flex h-fit w-full flex-col gap-0">
            <div className="flex items-center gap-2 border-b border-border/70 px-5 py-3.5">
              <FlaskConicalIcon className="size-4 text-emerald-600" />
              <p className="text-[13.5px] font-semibold">Delivery checklist</p>
            </div>
            <div className="space-y-2 p-4 text-[13px]">
              {[
                "Session shows Connected",
                "Template variables filled",
                "Recipient opted in",
                "Check Logs for status",
              ].map((t, i) => (
                <div
                  key={t}
                  className="flex items-center gap-2.5 rounded-xl border border-border/60 px-3 py-2.5"
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-muted font-mono text-[10.5px] text-muted-foreground">
                    {i + 1}
                  </span>
                  {t}
                </div>
              ))}
            </div>
          </Card>

          <Card className="flex h-fit w-full flex-col gap-0">
            <div className="border-b border-border/70 px-5 py-3.5">
              <p className="text-[13.5px] font-semibold">Send history</p>
            </div>
            <p className="p-4 text-[12.5px] leading-relaxed text-muted-foreground">
              Results from this tester appear in Logs with per-message status.
            </p>
            <div className="px-4 pb-4">
              <Link href="/logs">
                <Button variant="outline" className="h-9 w-full rounded-xl">
                  View logs
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
