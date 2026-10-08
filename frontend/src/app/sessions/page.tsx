"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader, SkeletonCard } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  PauseIcon,
  PlayIcon,
  PlusIcon,
  QrCodeIcon,
  RefreshCwIcon,
  SmartphoneIcon,
  Trash2Icon,
  XIcon,
  CheckCircle2Icon,
  CircleAlertIcon,
  CheckIcon,
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

type ModalStep = "form" | "qr";

const STATUS_STYLE: Record<SessionStatus, string> = {
  qr: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  ready: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  paused: "border-border bg-muted text-muted-foreground",
  disconnected: "border-border bg-muted/60 text-muted-foreground",
  failed: "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300",
};

const STATUS_LABEL: Record<SessionStatus, string> = {
  qr: "Awaiting scan",
  ready: "Connected",
  paused: "Paused",
  disconnected: "Disconnected",
  failed: "Failed",
};

function StatusBadge({ status }: { status: SessionStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-medium ${STATUS_STYLE[status]}`}
    >
      <span
        className={`size-1.5 rounded-full ${
          status === "ready"
            ? "bg-emerald-500"
            : status === "qr"
              ? "animate-pulse bg-amber-500"
              : status === "failed"
                ? "bg-red-500"
                : "bg-zinc-400"
        }`}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<ModalStep>("form");
  const [title, setTitle] = useState("");
  const [active, setActive] = useState<Session | null>(null);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/sessions`);
      const data = await res.json();
      setSessions(data.sessions ?? []);
    } catch {
      // backend offline — keep empty list
    } finally {
      setLoading(false);
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

  const pollSession = useCallback(
    (id: string) => {
      stopPolling();
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`${API}/api/sessions/${id}`);
          if (!res.ok) return;
          const data = await res.json();
          setActive(data.session);
          if (
            data.session?.status === "ready" ||
            data.session?.status === "failed"
          ) {
            stopPolling();
            void fetchSessions();
          }
        } catch {
          // retry on next tick
        }
      }, 2000);
    },
    [fetchSessions, stopPolling]
  );

  const handleCreate = async () => {
    if (!title.trim()) {
      setError("Please enter a session title.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: title.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create session.");
        return;
      }
      setActive(data.session);
      setStep("qr");
      pollSession(data.session.id);
      void fetchSessions();
    } catch {
      setError("Backend unreachable. Is it running on :4000?");
    } finally {
      setCreating(false);
    }
  };

  /** Open the QR popup for an existing session (scan / re-scan). */
  const viewQr = async (session: Session) => {
    setActive(session);
    setStep("qr");
    setError(null);
    setOpen(true);
    // If it isn't running, start it first so a QR gets generated
    if (session.status !== "ready" && session.status !== "qr") {
      await handleStart(session.id, true);
    }
    pollSession(session.id);
    // Refresh popup immediately
    try {
      const res = await fetch(`${API}/api/sessions/${session.id}`);
      if (res.ok) {
        const data = await res.json();
        setActive(data.session);
      }
    } catch {
      // polling will pick it up
    }
  };

  const closeModal = () => {
    stopPolling();
    setOpen(false);
    setStep("form");
    setTitle("");
    setActive(null);
    setError(null);
    void fetchSessions();
  };

  const openModal = () => {
    setOpen(true);
    setStep("form");
    setTitle("");
    setActive(null);
    setError(null);
  };

  const handleStart = async (id: string, silent = false) => {
    if (!silent) setBusyId(id);
    try {
      await fetch(`${API}/api/sessions/${id}/start`, { method: "POST" });
      await fetchSessions();
    } finally {
      if (!silent) setBusyId(null);
    }
  };

  const handlePause = async (id: string) => {
    setBusyId(id);
    try {
      await fetch(`${API}/api/sessions/${id}/pause`, { method: "POST" });
      await fetchSessions();
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      await fetch(`${API}/api/sessions/${id}`, { method: "DELETE" });
      await fetchSessions();
    } finally {
      setBusyId(null);
      setPendingDelete(null);
    }
  };

  const canStart = (s: Session) =>
    s.status === "paused" || s.status === "disconnected" || s.status === "failed";
  const canPause = (s: Session) => s.status === "ready" || s.status === "qr";

  const connected = sessions.filter((s) => s.status === "ready").length;

  return (
    <DashboardShell title="Sessions">
      <PageHeader
        eyebrow="Messaging · Connections"
        title="WhatsApp Sessions"
        description="Connect a phone number by scanning the QR code. Each session is an independent device link."
        actions={
          <>
            <Badge variant="secondary" className="hidden rounded-full sm:inline-flex">
              {connected} of {sessions.length} connected
            </Badge>
            <Button
              onClick={openModal}
              className="h-9 rounded-xl bg-foreground text-background shadow-sm transition-all duration-150 hover:opacity-90 active:translate-y-px"
            >
              <PlusIcon />
              New Session
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="grid w-full flex-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i} lines={2} />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={<QrCodeIcon className="size-5" />}
          title="No sessions yet"
          description="Click New Session to connect your first WhatsApp number. Scan the QR with Linked Devices."
          action={
            <Button
              onClick={openModal}
              className="h-9 rounded-xl bg-foreground text-background"
            >
              <PlusIcon />
              New Session
            </Button>
          }
        />
      ) : (
        <div className="grid w-full grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sessions.map((s) => {
            const busy = busyId === s.id;
            const isOn = s.status === "ready";
            return (
              <Card
                key={s.id}
                className={cn(
                  "flex h-fit w-full flex-col gap-0 transition-colors",
                  isOn && "border-primary/40 bg-primary/[0.03]"
                )}
              >
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-foreground transition-colors",
                        isOn && "border-primary/30 bg-primary/10 text-primary"
                      )}
                    >
                      <SmartphoneIcon className="size-5" />
                    </span>
                    <div className="min-w-0 space-y-0.5">
                      <CardTitle className="truncate text-base leading-none">
                        {s.name}
                      </CardTitle>
                      <CardDescription className="truncate font-mono text-xs">
                        {s.id.slice(0, 8)} ·{" "}
                        {new Date(s.createdAt).toLocaleString()}
                      </CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={isOn}
                    disabled={busy}
                    onCheckedChange={() =>
                      void (isOn
                        ? handlePause(s.id)
                        : handleStart(s.id))
                    }
                    aria-label={`Toggle ${s.name}`}
                  />
                </CardHeader>

                <CardContent className="flex-1 py-4">
                  <p className="text-sm text-muted-foreground">
                    {s.status === "ready"
                      ? "This number is live and ready to send and receive messages."
                      : s.status === "qr"
                        ? "Scan the QR code with WhatsApp to connect this number."
                        : s.status === "paused"
                          ? "Paused — flip the switch or press Start to reconnect."
                          : s.status === "failed"
                            ? "Connection failed — press Start to retry pairing."
                            : "Disconnected — press Start to generate a fresh QR code."}
                  </p>
                  {busy && (
                    <p className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <RefreshCwIcon className="size-3 animate-spin" />
                      Working…
                    </p>
                  )}
                </CardContent>

                <CardFooter className="items-center justify-between gap-2">
                  {isOn ? (
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                      <CheckIcon
                        data-icon="inline-start"
                        className="size-3.5"
                      />
                      Connected
                    </Badge>
                  ) : (
                    <StatusBadge status={s.status} />
                  )}
                  <div className="flex items-center gap-1.5">
                    {canStart(s) ? (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => void handleStart(s.id)}
                        disabled={busy}
                      >
                        <PlayIcon />
                        Start
                      </Button>
                    ) : (
                      <Button
                        variant={isOn ? "ghost" : "default"}
                        size="sm"
                        onClick={() => void viewQr(s)}
                        disabled={busy}
                        title="Show QR code"
                        className={cn(isOn && "text-muted-foreground")}
                      >
                        <QrCodeIcon />
                        {isOn ? "QR Code" : "Connect"}
                      </Button>
                    )}
                    {canPause(s) && !isOn && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void handlePause(s.id)}
                        disabled={busy}
                      >
                        <PauseIcon />
                        Pause
                      </Button>
                    )}
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="rounded-lg text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600"
                      onClick={() => setPendingDelete(s)}
                      disabled={busy}
                      title="Delete session"
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="animate-pop w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-pop)]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="New Session"
          >
            <div className="flex items-start justify-between gap-3 px-6 pt-6">
              <div>
                <p className="eyebrow">Sessions</p>
                <h3 className="mt-1 text-[16px] font-semibold tracking-tight">
                  New Session
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  {step === "form"
                    ? "Give this connection a title, then scan the QR code."
                    : "Scan the QR code with WhatsApp."}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={closeModal}
                className="rounded-lg"
                aria-label="Close"
              >
                <XIcon />
              </Button>
            </div>

            {step === "form" ? (
              <div className="space-y-3 px-6 py-5">
                <div className="space-y-1.5">
                  <Label htmlFor="session-title">Session title</Label>
                  <Input
                    id="session-title"
                    placeholder="e.g. Sales number"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleCreate();
                    }}
                    autoFocus
                    className="h-10 rounded-xl"
                  />
                </div>
                {error && (
                  <p
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3 py-2.5 text-[13px] text-red-700 dark:text-red-300"
                  >
                    <CircleAlertIcon className="mt-0.5 size-4 shrink-0" />
                    {error}
                  </p>
                )}
                <Button
                  className="h-10 w-full rounded-xl"
                  onClick={() => void handleCreate()}
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <RefreshCwIcon className="animate-spin" /> Starting…
                    </>
                  ) : (
                    <>
                      <QrCodeIcon /> Generate QR Code
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 px-6 py-5">
                <p className="text-[13.5px] font-medium">{active?.name}</p>
                {active?.status === "ready" ? (
                  <div className="w-full rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] p-6 text-center">
                    <CheckCircle2Icon className="mx-auto size-8 text-emerald-600" />
                    <p className="mt-2 font-semibold text-emerald-700 dark:text-emerald-300">
                      Connected
                    </p>
                    <p className="mt-1 text-[13px] text-emerald-700/80 dark:text-emerald-300/80">
                      This number is now live.
                    </p>
                  </div>
                ) : active?.qrDataUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={active.qrDataUrl}
                      alt="WhatsApp QR code"
                      className="size-60 rounded-2xl border border-border bg-white p-2 shadow-sm"
                    />
                    <p className="max-w-[280px] text-center text-[12.5px] leading-relaxed text-muted-foreground">
                      Open WhatsApp → Settings → Linked devices → Link a
                      device, then scan.
                    </p>
                    <p className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-[12px] text-muted-foreground">
                      <RefreshCwIcon className="size-3 animate-spin" />
                      Waiting for scan… (auto-refreshes)
                    </p>
                  </>
                ) : (
                  <div className="flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-10">
                    <RefreshCwIcon className="size-6 animate-spin text-muted-foreground" />
                    <p className="text-[13px] text-muted-foreground">
                      Starting browser, generating QR…
                    </p>
                  </div>
                )}
                {error && <p className="text-[13px] text-red-600">{error}</p>}
                <Button variant="outline" className="h-10 w-full rounded-xl" onClick={closeModal}>
                  {active?.status === "ready" ? "Done" : "Close"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setPendingDelete(null)}
        >
          <div
            className="animate-pop w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-pop)]"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-label="Delete session"
          >
            <div className="flex flex-col items-center px-6 pt-6 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/10 text-red-600">
                <Trash2Icon className="size-5" />
              </span>
              <h3 className="mt-4 text-[16px] font-semibold tracking-tight">
                Delete this session?
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">“{pendingDelete.name}”</span>{" "}
                will be removed and the linked device will be disconnected. This
                cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-5">
              <Button
                variant="outline"
                onClick={() => setPendingDelete(null)}
                disabled={busyId === pendingDelete.id}
                className="h-10 rounded-xl px-5"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => void handleDelete(pendingDelete.id)}
                disabled={busyId === pendingDelete.id}
                className="h-10 rounded-xl px-5"
              >
                {busyId === pendingDelete.id ? (
                  <>
                    <RefreshCwIcon className="animate-spin" /> Deleting…
                  </>
                ) : (
                  <>
                    <Trash2Icon /> Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
