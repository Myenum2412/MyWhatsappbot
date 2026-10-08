"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { TemplateBubble } from "@/components/ui/whatsapp/template-bubble";
import { ImageBubble } from "@/components/ui/whatsapp/image-bubble";
import { VideoBubble } from "@/components/ui/whatsapp/video-bubble";
import { FileAttachmentBubble } from "@/components/ui/whatsapp/file-attachment-bubble";
import {
  UploadIcon,
  FileSpreadsheetIcon,
  Trash2Icon,
  SendIcon,
  PaperclipIcon,
  CircleAlertIcon,
  CheckCircle2Icon,
  TableIcon,
  TimerIcon,
  ListChecksIcon,
  XIcon,
  PlusIcon,
  MegaphoneIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import * as XLSX from "xlsx";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const MAX_FILE_BYTES = 50 * 1024 * 1024;
const SHEET_PAGE_SIZE = 10;

interface SheetRow {
  values: string[];
}

interface Template {
  id: number;
  name: string;
  header: string;
  body: string;
  footer: string;
}

const selectClass =
  "h-10 w-full rounded-xl border border-input bg-card px-3 text-[13px] outline-none transition-all duration-150 focus-visible:border-emerald-500/50 focus-visible:ring-4 focus-visible:ring-emerald-500/15";

const textareaClass =
  "min-h-28 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm outline-none transition-all duration-150 placeholder:text-muted-foreground focus-visible:border-emerald-500/50 focus-visible:ring-4 focus-visible:ring-emerald-500/15";

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function formatEta(totalSeconds: number) {
  if (totalSeconds < 60) return `~${totalSeconds}s`;
  const m = Math.floor(totalSeconds / 60);
  if (m < 60) return `~${m}m ${totalSeconds % 60}s`;
  return `~${Math.floor(m / 60)}h ${m % 60}m`;
}

function normalizePhone(raw: string, countryCode: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) return `+${trimmed.slice(1).replace(/\D/g, "")}`;
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  const cc = countryCode.trim().replace(/\D/g, "") || "91";
  // Already includes country code
  if (digits.startsWith(cc)) return `+${digits}`;
  // Drop local trunk zero
  return `+${cc}${digits.replace(/^0+/, "")}`;
}

function extractVariables(text: string): string[] {
  const out = new Set<string>();
  const re = /\{\{\s*([^}]+?)\s*\}\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) out.add(m[1].trim());
  return [...out];
}

function SectionTitle({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground font-mono text-[12px] font-semibold text-background">
        {n}
      </span>
      <div>
        <h2 className="text-[14px] font-semibold tracking-tight">{title}</h2>
        <p className="mt-0.5 text-[12.5px] text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

export default function CampaignsPage() {
  const [open, setOpen] = useState(false);

  // 1 — spreadsheet
  const [fileName, setFileName] = useState<string | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<SheetRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [sheetPage, setSheetPage] = useState(0);

  // 2 — recipients
  const [campaignName, setCampaignName] = useState("");
  const [phoneColumn, setPhoneColumn] = useState("");
  const [countryCode, setCountryCode] = useState("+91");

  // 3 — message
  const [msgMode, setMsgMode] = useState<"custom" | "template">("custom");
  const [customText, setCustomText] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateId, setTemplateId] = useState("");

  // 4 — attachments
  const [files, setFiles] = useState<File[]>([]);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [asDocument, setAsDocument] = useState(false);

  // 5 — pacing
  const [delaySec, setDelaySec] = useState(5);
  const [skipEmpty, setSkipEmpty] = useState(true);
  const [skipped, setSkipped] = useState<Set<number> | null>(null);

  const [launched, setLaunched] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/templates`);
        const data = await res.json();
        setTemplates(data.templates ?? []);
      } catch {
        // backend offline — template select stays empty
      }
    })();
  }, []);

  const parseFile = useCallback(async (file: File) => {
    setParseError(null);
    setSkipped(null);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const matrix = XLSX.utils.sheet_to_json<string[]>(ws, {
        header: 1,
        raw: false,
        defval: "",
      });
      const nonEmpty = matrix.filter((r) =>
        r.some((c) => String(c ?? "").trim() !== "")
      );
      if (nonEmpty.length < 2) {
        setParseError("No data rows found. First row must be the header.");
        return;
      }
      const header = nonEmpty[0].map((c, i) =>
        String(c ?? "").trim() === "" ? `Column ${i + 1}` : String(c).trim()
      );
      const data: SheetRow[] = nonEmpty.slice(1).map((r) => ({
        values: header.map((_, i) => String(r[i] ?? "").trim()),
      }));
      setColumns(header);
      setRows(data);
      setFileName(file.name);
      setSheetPage(0);
      // Auto-detect phone column
      const guess =
        header.findIndex((h) => /phone|mobile|number|contact|whatsapp/i.test(h));
      setPhoneColumn(header[guess >= 0 ? guess : 0]);
    } catch {
      setParseError("Could not read this file. Try CSV or XLSX.");
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files?.[0];
      if (f) void parseFile(f);
    },
    [parseFile]
  );

  const clearSheet = () => {
    setFileName(null);
    setColumns([]);
    setRows([]);
    setPhoneColumn("");
    setSkipped(null);
    setParseError(null);
    setSheetPage(0);
  };

  const onAttach = (list: FileList | null) => {
    if (!list) return;
    const bad = [...list].find((f) => f.size > MAX_FILE_BYTES);
    if (bad) {
      setAttachError(`"${bad.name}" is ${formatBytes(bad.size)} — limit is 50 MB per file.`);
      return;
    }
    setAttachError(null);
    setFiles((prev) => [...prev, ...[...list]]);
  };

  // Local preview URLs for attached files (revoked on change/unmount)
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setFileUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const activeText = useMemo(() => {
    if (msgMode === "template") {
      const t = templates.find((x) => String(x.id) === templateId);
      return t ? [t.header, t.body, t.footer].filter(Boolean).join("\n") : "";
    }
    return customText;
  }, [msgMode, customText, templates, templateId]);

  const variables = useMemo(() => extractVariables(activeText), [activeText]);

  const normalized = useMemo(() => {
    const idx = columns.indexOf(phoneColumn);
    if (idx < 0) return [];
    return rows.map((r) => normalizePhone(r.values[idx] ?? "", countryCode));
  }, [rows, columns, phoneColumn, countryCode]);

  const invalidCount = useMemo(
    () => normalized.filter((n, i) => rows[i] && n.replace(/\D/g, "").length < 7).length,
    [normalized, rows]
  );

  const validCount = rows.length - (skipped?.size ?? 0);

  const sheetPageCount = Math.max(1, Math.ceil(rows.length / SHEET_PAGE_SIZE));
  const safeSheetPage = Math.min(sheetPage, sheetPageCount - 1);
  const sheetPageRows = rows.slice(
    safeSheetPage * SHEET_PAGE_SIZE,
    safeSheetPage * SHEET_PAGE_SIZE + SHEET_PAGE_SIZE
  );
  const sheetFrom = rows.length === 0 ? 0 : safeSheetPage * SHEET_PAGE_SIZE + 1;
  const sheetTo = Math.min(rows.length, safeSheetPage * SHEET_PAGE_SIZE + SHEET_PAGE_SIZE);

  const handleCheckRows = () => {
    if (variables.length === 0) {
      setSkipped(new Set());
      return;
    }
    const skip = new Set<number>();
    rows.forEach((r, i) => {
      const map = new Map(columns.map((c, ci) => [c.toLowerCase(), r.values[ci] ?? ""]));
      const missing = variables.some((v) => {
        const val = map.get(v.toLowerCase());
        return val === undefined || val.trim() === "";
      });
      if (missing) skip.add(i);
    });
    setSkipped(skip);
  };

  const openForm = () => {
    setLaunched(false);
    setOpen(true);
  };

  const closeForm = () => {
    setOpen(false);
  };

  const handleLaunch = () => {
    setLaunched(true);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canLaunch) return;
    handleLaunch();
  };

  const canLaunch =
    campaignName.trim() !== "" &&
    rows.length > 0 &&
    phoneColumn !== "" &&
    activeText.trim() !== "" &&
    invalidCount === 0;

  const selectedTemplate = templates.find((x) => String(x.id) === templateId);
  const showPreview = msgMode === "template" ? !!selectedTemplate : true;

  const previewFiles = useMemo(
    () => files.map((f, i) => ({ file: f, url: fileUrls[i] ?? "" })),
    [files, fileUrls]
  );
  const previewImages = previewFiles.filter(
    ({ file }) => !asDocument && file.type.startsWith("image/")
  );
  const previewVideos = previewFiles.filter(
    ({ file }) => !asDocument && file.type.startsWith("video/")
  );
  const previewDocs = previewFiles.filter(
    ({ file }) =>
      asDocument ||
      (!file.type.startsWith("image/") && !file.type.startsWith("video/"))
  );
  const fileExt = (name: string) =>
    name.includes(".") ? (name.split(".").pop() ?? "") : "";
  const previewStamp = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <DashboardShell title="Campaigns">
      <PageHeader
        eyebrow="Messaging · Broadcast"
        title="Campaigns"
        description="Bulk-send campaigns with scheduling and progress tracking."
        actions={
          <Button onClick={openForm} className="h-9 rounded-xl">
            <PlusIcon />
            New Campaign
          </Button>
        }
      />

      {/* Landing — only the entry point shows until the form is opened */}
      <Card className="dot-grid flex w-full flex-1 flex-col items-center px-6 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground shadow-sm">
          <MegaphoneIcon className="size-5" />
        </span>
        <h2 className="mt-4 text-[15px] font-semibold tracking-tight">
          Ready for your first broadcast
        </h2>
        <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
          Upload a sheet, map your audience, compose the message and launch
          with pacing — all in one form.
        </p>
        <Button onClick={openForm} className="mt-5 h-10 rounded-xl px-5">
          <PlusIcon />
          New Campaign
        </Button>
      </Card>

      {/* Fullscreen form popup with its own scroll */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm sm:p-4"
          onClick={closeForm}
        >
          <div
            className="animate-pop flex h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-pop)]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="New Campaign"
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border/70 px-5 py-4 sm:px-6">
              <div>
                <p className="eyebrow">Campaigns</p>
                <h3 className="mt-1 text-[16px] font-semibold tracking-tight">
                  New Campaign
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  Fill the form below — it scrolls inside this window.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="secondary" className="hidden rounded-full sm:inline-flex">
                  {validCount} recipients
                </Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={closeForm}
                  className="rounded-lg"
                  aria-label="Close"
                >
                  <XIcon />
                </Button>
              </div>
            </div>

            <form
              id="campaign-form"
              onSubmit={onSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 overflow-y-auto">
                {/* 1 — Upload spreadsheet */}
                <section className="space-y-4 px-5 py-5 sm:px-6">
                  <SectionTitle
                    n="01"
                    title="Upload spreadsheet"
                    desc="CSV or XLSX. First row is treated as the header."
                  />
                  {!fileName ? (
                    <label
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={onDrop}
                      className={cn(
                        "flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
                        dragOver
                          ? "border-primary/50 bg-primary/[0.04]"
                          : "border-border hover:border-primary/30 hover:bg-muted/40"
                      )}
                    >
                      <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                        <UploadIcon className="size-5" />
                      </span>
                      <p className="text-[13.5px] font-medium">
                        Drop your sheet here, or click to browse
                      </p>
                      <p className="font-mono text-[11.5px] text-muted-foreground">
                        .csv · .xlsx · .xls
                      </p>
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void parseFile(f);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-border/70">
                      <div className="flex items-center gap-3 border-b border-border/60 bg-muted/30 px-4 py-3">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                          <FileSpreadsheetIcon className="size-4.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13.5px] font-semibold">{fileName}</p>
                          <p className="font-mono text-[11.5px] text-muted-foreground tabular-nums">
                            {rows.length} rows · {columns.length} columns
                          </p>
                        </div>
                        <label className="cursor-pointer rounded-lg border border-border bg-card px-2.5 py-1.5 text-[12px] font-medium transition-colors hover:bg-muted">
                          Replace
                          <input
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) void parseFile(f);
                              e.target.value = "";
                            }}
                          />
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={clearSheet}
                          title="Remove sheet"
                          className="rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-600"
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                      <div className="max-h-64 overflow-auto">
                        <table className="w-full border-collapse text-left text-[12.5px]">
                          <thead className="sticky top-0 bg-card">
                            <tr>
                              <th className="w-10 border-b border-border/60 px-3 py-2 font-mono text-[11px] text-muted-foreground">
                                #
                              </th>
                              {columns.map((c) => (
                                <th
                                  key={c}
                                  className="border-b border-border/60 px-3 py-2 font-semibold whitespace-nowrap"
                                >
                                  {c}
                                  {c === phoneColumn && (
                                    <span className="ml-1.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                                      phone
                                    </span>
                                  )}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {sheetPageRows.map((r, k) => {
                              const i = safeSheetPage * SHEET_PAGE_SIZE + k;
                              return (
                                <tr
                                  key={i}
                                  className={cn(
                                    "border-b border-border/40 transition-colors last:border-0 hover:bg-muted/30",
                                    skipped?.has(i) && "bg-red-500/[0.05]"
                                  )}
                                >
                                  <td className="px-3 py-1.5 font-mono text-[11px] text-muted-foreground tabular-nums">
                                    {i + 1}
                                    {skipped?.has(i) && (
                                      <span className="ml-1 text-red-600">skip</span>
                                    )}
                                  </td>
                                  {r.values.map((v, j) => (
                                    <td
                                      key={j}
                                      className="max-w-44 truncate px-3 py-1.5 whitespace-nowrap"
                                      title={v}
                                    >
                                      {v || <span className="text-muted-foreground/50">—</span>}
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-muted/30 px-4 py-2">
                        <p className="font-mono text-[11px] text-muted-foreground tabular-nums">
                          Rows {sheetFrom}–{sheetTo} of {rows.length}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-xs"
                            onClick={() => setSheetPage((p) => Math.max(0, p - 1))}
                            disabled={safeSheetPage === 0}
                            aria-label="Previous page"
                            className="rounded-lg"
                          >
                            <ChevronLeftIcon />
                          </Button>
                          <span className="min-w-20 text-center font-mono text-[11px] text-muted-foreground tabular-nums">
                            Page {safeSheetPage + 1} of {sheetPageCount}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-xs"
                            onClick={() => setSheetPage((p) => Math.min(sheetPageCount - 1, p + 1))}
                            disabled={safeSheetPage >= sheetPageCount - 1}
                            aria-label="Next page"
                            className="rounded-lg"
                          >
                            <ChevronRightIcon />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  {parseError && (
                    <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3 py-2.5 text-[13px] text-red-700 dark:text-red-300">
                      <CircleAlertIcon className="mt-0.5 size-4 shrink-0" />
                      {parseError}
                    </p>
                  )}
                </section>

                <div className="mx-5 border-t border-border/60 sm:mx-6" />

                {/* 2 — Recipients */}
                <section className="space-y-4 px-5 py-5 sm:px-6">
                  <SectionTitle
                    n="02"
                    title="Recipients"
                    desc="Name the campaign and map the phone column."
                  />
                  <div className="grid gap-4 sm:grid-cols-[1fr_1fr_160px]">
                    <div className="space-y-1.5">
                      <Label htmlFor="cp-name">Campaign name</Label>
                      <Input
                        id="cp-name"
                        placeholder="e.g. Diwali offer 2026"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        className="h-10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cp-phone-col">Phone number column</Label>
                      <select
                        id="cp-phone-col"
                        value={phoneColumn}
                        onChange={(e) => setPhoneColumn(e.target.value)}
                        disabled={columns.length === 0}
                        className={selectClass}
                      >
                        {columns.length === 0 && <option value="">Upload a sheet first</option>}
                        {columns.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cp-cc">Default country code</Label>
                      <Input
                        id="cp-cc"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        placeholder="+91"
                        className="h-10 rounded-xl font-mono text-[13px]"
                      />
                    </div>
                  </div>
                  {rows.length > 0 && phoneColumn && (
                    <p className="text-[12.5px] text-muted-foreground">
                      <span className="font-mono">{normalized[0] || "—"}</span>
                      {rows.length > 1 && (
                        <>, <span className="font-mono">{normalized[1] || "—"}</span></>
                      )}
                      {rows.length > 2 && <> … {rows.length} numbers total</>}
                      {invalidCount > 0 ? (
                        <span className="ml-2 font-medium text-red-600">
                          {invalidCount} invalid
                        </span>
                      ) : (
                        <span className="ml-2 inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2Icon className="size-3.5" /> all valid
                        </span>
                      )}
                    </p>
                  )}
                </section>

                <div className="mx-5 border-t border-border/60 sm:mx-6" />

                {/* 3 — Message */}
                <section className="space-y-4 px-5 py-5 sm:px-6">
                  <SectionTitle
                    n="03"
                    title="Message"
                    desc="Write it inline with {{columns}} or reuse a template."
                  />
                  <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
                    <div className="min-w-0 space-y-4">
                      <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/50 p-1">
                        {(["custom", "template"] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => {
                              setMsgMode(m);
                              setSkipped(null);
                            }}
                            className={cn(
                              "h-9 rounded-lg text-[13px] font-medium transition-all",
                              msgMode === m
                                ? "bg-card text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {m === "custom" ? "Write a message" : "Use a template"}
                          </button>
                        ))}
                      </div>
                      {msgMode === "custom" ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="cp-text">Message</Label>
                            {columns.length > 0 && (
                              <select
                                aria-label="Insert variable"
                                value=""
                                onChange={(e) => {
                                  if (e.target.value)
                                    setCustomText((t) => `${t}{{${e.target.value}}}`);
                                }}
                                className="h-7 rounded-lg border border-border bg-card px-2 text-[12px]"
                              >
                                <option value="">+ Insert {"{{column}}"}</option>
                                {columns.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                          <textarea
                            id="cp-text"
                            className={textareaClass}
                            placeholder={"Hi {{name}}, your order {{order_id}} is ready…"}
                            value={customText}
                            onChange={(e) => {
                              setCustomText(e.target.value);
                              setSkipped(null);
                            }}
                          />
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <Label htmlFor="cp-tpl">Template</Label>
                          <select
                            id="cp-tpl"
                            value={templateId}
                            onChange={(e) => {
                              setTemplateId(e.target.value);
                              setSkipped(null);
                            }}
                            className={selectClass}
                          >
                            <option value="">Select a template…</option>
                            {templates.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      {variables.length > 0 && (
                        <p className="text-[12.5px] text-muted-foreground">
                          Variables:{" "}
                          {variables.map((v) => (
                            <code key={v} className="mr-1 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11.5px]">
                              {`{{${v}}}`}
                            </code>
                          ))}
                        </p>
                      )}
                    </div>
                    {showPreview && (
                      <div className="h-fit overflow-hidden rounded-xl border border-border/70">
                        <p className="border-b border-border/60 bg-muted/40 px-3 py-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                          Preview · WhatsApp
                        </p>
                        <div className="wa-wallpaper flex flex-col items-center gap-2 p-4">
                          {previewImages.length > 0 && (
                            <ImageBubble
                              variant="incoming"
                              images={previewImages.map((p) => p.url)}
                              timestamp={previewStamp}
                            />
                          )}
                          {previewVideos.map((p) => (
                            <VideoBubble
                              key={p.url}
                              variant="incoming"
                              src={p.url}
                              timestamp={previewStamp}
                            />
                          ))}
                          {previewDocs.map((p) => (
                            <FileAttachmentBubble
                              key={p.url || p.file.name}
                              variant="incoming"
                              fileName={p.file.name}
                              fileSize={formatBytes(p.file.size)}
                              fileType={fileExt(p.file.name)}
                              downloadUrl={p.url || undefined}
                              timestamp={previewStamp}
                            />
                          ))}
                          {msgMode === "template" && selectedTemplate ? (
                            <TemplateBubble
                              variant="incoming"
                              header={selectedTemplate.header ? { type: "text", text: selectedTemplate.header } : undefined}
                              body={selectedTemplate.body}
                              footer={selectedTemplate.footer || undefined}
                              timestamp={previewStamp}
                            />
                          ) : (
                            <div className="w-full min-w-[200px] max-w-[320px] overflow-hidden rounded-lg bg-wa-bubble-incoming shadow-sm">
                              <p className="px-[9px] pb-[7px] pt-[6px] font-wa text-[14.2px] leading-[19px] text-wa-text-primary">
                                {activeText || "Start typing…"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                <div className="mx-5 border-t border-border/60 sm:mx-6" />

                {/* 4 — Attachments */}
                <section className="space-y-3 px-5 py-5 sm:px-6">
                  <SectionTitle
                    n="04"
                    title="Attachments (optional)"
                    desc="Any file type. 50 MB max per file."
                  />
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-6 text-[13px] font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted/40 hover:text-foreground">
                    <PaperclipIcon className="size-4" />
                    Click to attach files
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        onAttach(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {files.map((f, i) => (
                    <div
                      key={`${f.name}-${i}`}
                      className="flex items-center gap-3 rounded-xl border border-border/70 px-3.5 py-2.5 text-[13px]"
                    >
                      <PaperclipIcon className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate font-medium">{f.name}</span>
                      <span className="font-mono text-[11.5px] text-muted-foreground">
                        {formatBytes(f.size)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                        className="rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-600"
                        title="Remove file"
                      >
                        <XIcon />
                      </Button>
                    </div>
                  ))}
                  {attachError && (
                    <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3 py-2.5 text-[13px] text-red-700 dark:text-red-300">
                      <CircleAlertIcon className="mt-0.5 size-4 shrink-0" />
                      {attachError}
                    </p>
                  )}
                  <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border/60 px-3.5 py-3 text-[13px] transition-colors hover:bg-muted/40">
                    <Checkbox
                      checked={asDocument}
                      onCheckedChange={(v) => setAsDocument(v === true)}
                      aria-label="Send photos and videos as documents"
                    />
                    <span>
                      Send photos and videos as documents{" "}
                      <span className="text-muted-foreground">(original quality)</span>
                    </span>
                  </label>
                </section>

                <div className="mx-5 border-t border-border/60 sm:mx-6" />

                {/* 5 — Pacing */}
                <section className="space-y-4 px-5 py-5 sm:px-6">
                  <SectionTitle
                    n="05"
                    title="Pacing"
                    desc="Throttle sends to protect your number."
                  />
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="cp-delay">Seconds between messages</Label>
                      <Input
                        id="cp-delay"
                        type="number"
                        min={1}
                        max={600}
                        value={delaySec}
                        onChange={(e) =>
                          setDelaySec(Math.min(600, Math.max(1, Number(e.target.value) || 1)))
                        }
                        className="h-10 w-32 rounded-xl font-mono text-[13px]"
                      />
                    </div>
                    <p className="pb-2.5 font-mono text-[11.5px] text-muted-foreground">
                      1–600 · a little random jitter is added
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 px-3.5 py-3">
                    <div className="flex items-center gap-2.5">
                      <Switch
                        checked={skipEmpty}
                        onCheckedChange={setSkipEmpty}
                        aria-label="Skip rows where a column in the message is empty"
                      />
                      <span className="text-[13px] font-medium">
                        Skip rows where a column in the message is empty
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCheckRows}
                      disabled={rows.length === 0 || variables.length === 0}
                      className="h-8 rounded-lg"
                      title="Scan the sheet against the message variables"
                    >
                      <ListChecksIcon className="size-3.5" />
                      Check rows
                    </Button>
                  </div>
                  {skipped !== null && (
                    <p className={cn(
                      "flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[13px]",
                      skipped.size > 0
                        ? "border-amber-500/25 bg-amber-500/[0.07] text-amber-800 dark:text-amber-200"
                        : "border-emerald-500/25 bg-emerald-500/[0.07] text-emerald-800 dark:text-emerald-200"
                    )}>
                      <TableIcon className="size-4 shrink-0" />
                      {skipped.size > 0
                        ? `${skipped.size} of ${rows.length} rows would be skipped (highlighted in the table).`
                        : variables.length === 0
                          ? "No variables in the message — nothing to skip."
                          : `All ${rows.length} rows have every variable filled.`}
                    </p>
                  )}
                </section>

                {launched && (
                  <p className="mx-5 mb-5 flex items-start gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07] px-3.5 py-2.5 text-[12.5px] text-emerald-800 sm:mx-6 dark:text-emerald-200">
                    <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />
                    Ready to send to {validCount} recipients at ~{delaySec}s apart.
                    Connect the backend send API to go live.
                  </p>
                )}
              </div>

              {/* Sticky form footer */}
              <div className="flex shrink-0 flex-col gap-3 border-t border-border/70 bg-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px]">
                  <span className="text-muted-foreground">
                    <span className="font-mono font-semibold text-foreground tabular-nums">{validCount}</span>{" "}
                    recipients
                  </span>
                  <span className="text-muted-foreground">
                    <span className="font-mono font-semibold text-foreground tabular-nums">{files.length}</span>{" "}
                    attachments
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <TimerIcon className="size-3.5" />
                    <span className="font-mono font-semibold text-foreground tabular-nums">
                      {validCount > 0 ? formatEta(validCount * delaySec) : "—"}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={closeForm}
                    className="h-10 rounded-xl text-muted-foreground"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!canLaunch} className="h-10 rounded-xl px-5">
                    <SendIcon />
                    Launch campaign
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
