"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader } from "@/components/ui/page-header";
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
import { cn } from "@/lib/utils";
import { TemplateBubble } from "@/components/ui/whatsapp/template-bubble";
import {
  FileTextIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  CircleAlertIcon,
  Loader2Icon,
  CheckIcon,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface Template {
  id: number;
  name: string;
  header: string;
  body: string;
  footer: string;
  created_at: string;
  updated_at: string;
}

const emptyForm = { name: "", header: "", body: "", footer: "" };

const textareaClass =
  "min-h-28 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm outline-none transition-all duration-150 placeholder:text-muted-foreground focus-visible:border-emerald-500/50 focus-visible:ring-4 focus-visible:ring-emerald-500/15";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editing = selectedId !== null;

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/templates`);
      const data = await res.json();
      setTemplates(data.templates ?? []);
    } catch {
      // backend offline — keep empty list
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  const selectTemplate = (t: Template) => {
    setSelectedId(t.id);
    setForm({ name: t.name, header: t.header, body: t.body, footer: t.footer });
    setError(null);
  };

  const handleCancel = () => {
    setSelectedId(null);
    setForm(emptyForm);
    setError(null);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.body.trim()) {
      setError("Name and Body are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const url = editing
        ? `${API}/api/templates/${selectedId}`
        : `${API}/api/templates`;
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save template.");
        return;
      }
      await fetchTemplates();
      handleCancel();
    } catch {
      setError("Backend unreachable. Is it running on :4000?");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this template?")) return;
    await fetch(`${API}/api/templates/${id}`, { method: "DELETE" });
    if (selectedId === id) handleCancel();
    void fetchTemplates();
  };

  const set = (key: keyof typeof emptyForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <DashboardShell title="Templates">
      <PageHeader
        eyebrow="Messaging · Library"
        title="Message Templates"
        description="Reusable approved messages for campaigns and flows. Use {{variables}} for personalization."
        actions={
          <Badge variant="secondary" className="rounded-full">
            {templates.length} {templates.length === 1 ? "template" : "templates"}
          </Badge>
        }
      />

      <div className="grid w-full flex-1 grid-cols-1 gap-4 lg:min-h-[calc(100svh-12rem)] lg:grid-cols-[380px_1fr]">
        {/* Left — saved templates */}
        <Card className="flex h-full w-full flex-col gap-0 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="text-base leading-none">
                Saved Templates
              </CardTitle>
              <CardDescription className="mt-1 text-xs">
                Click a template to edit it on the right
              </CardDescription>
            </div>
            <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[11.5px] text-muted-foreground tabular-nums">
              {templates.length}
            </span>
          </CardHeader>
          <CardContent className="flex-1 py-4">
            {loading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="skeleton-shimmer h-20 rounded-xl border border-border/60 bg-card"
                  />
                ))}
              </div>
            ) : templates.length === 0 ? (
              <div className="dot-grid flex flex-col items-center gap-2 rounded-xl p-8 text-center">
                <span className="flex size-11 items-center justify-center rounded-md border border-border bg-muted text-foreground">
                  <FileTextIcon className="size-5" />
                </span>
                <p className="mt-1 text-sm font-medium">No templates yet</p>
                <p className="max-w-sm text-[13px] leading-relaxed text-muted-foreground">
                  Fill the form on the right to create your first one.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {templates.map((t) => {
                  const isActive = selectedId === t.id;
                  return (
                    <li key={t.id}>
                      <div
                        className={cn(
                          "group flex flex-col gap-0 rounded-xl border p-3 text-left transition-colors",
                          isActive
                            ? "border-primary/40 bg-primary/[0.03]"
                            : "border-border/70 hover:border-border"
                        )}
                      >
                        <button
                          className="min-w-0 flex-1 cursor-pointer text-left"
                          onClick={() => selectTemplate(t)}
                        >
                          <p className="flex items-center gap-2 truncate text-[13.5px] font-semibold">
                            <span
                              className={cn(
                                "flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-foreground",
                                isActive &&
                                  "border-primary/30 bg-primary/10 text-primary"
                              )}
                            >
                              <FileTextIcon className="size-4" />
                            </span>
                            <span className="truncate">{t.name}</span>
                          </p>
                          {t.header ? (
                            <p className="mt-1.5 truncate text-[12px] font-medium text-muted-foreground">
                              {t.header}
                            </p>
                          ) : null}
                          <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
                            {t.body}
                          </p>
                          {t.footer ? (
                            <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground/80">
                              {t.footer}
                            </p>
                          ) : null}
                        </button>
                        <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2">
                          {isActive ? (
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                              <CheckIcon
                                data-icon="inline-start"
                                className="size-3.5"
                              />
                              Editing
                            </Badge>
                          ) : (
                            <Badge variant="outline">Saved</Badge>
                          )}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => selectTemplate(t)}
                              title="Edit"
                              className="h-8 rounded-lg text-[12.5px] text-muted-foreground"
                            >
                              <PencilIcon />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 rounded-lg text-[12.5px] text-muted-foreground hover:bg-red-500/10 hover:text-red-600"
                              onClick={() => void handleDelete(t.id)}
                              title="Delete"
                            >
                              <Trash2Icon />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Right — form, always visible */}
        <Card
          className={cn(
            "flex h-full w-full flex-col gap-0 transition-colors",
            editing && "border-primary/40 bg-primary/[0.03]"
          )}
        >
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-base leading-none">
                {editing && (
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                    Editing
                  </span>
                )}
                {editing ? "Edit Template" : "New Template"}
              </CardTitle>
              <CardDescription className="mt-1 text-xs">
                {editing
                  ? "Update Name, Header, Body, Footer and save."
                  : "Fill in Name, Header, Body, Footer and create."}
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-[11px]">
              {form.body.length} chars
            </Badge>
          </CardHeader>

          <CardContent className="flex-1 space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="tpl-name">Name</Label>
                <Input
                  id="tpl-name"
                  placeholder="e.g. order_confirmation"
                  value={form.name}
                  onChange={set("name")}
                  className="h-10 rounded-xl font-mono text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tpl-header">Header</Label>
                <Input
                  id="tpl-header"
                  placeholder="Optional title shown on top"
                  value={form.header}
                  onChange={set("header")}
                  className="h-10 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tpl-body">Body</Label>
              <textarea
                id="tpl-body"
                className={textareaClass}
                placeholder="Hi {{name}}, your order {{order_id}} is confirmed…"
                value={form.body}
                onChange={set("body")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tpl-footer">Footer</Label>
              <Input
                id="tpl-footer"
                placeholder="Optional sign-off line"
                value={form.footer}
                onChange={set("footer")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleSave();
                }}
                className="h-10 rounded-xl"
              />
            </div>

            {/* Live preview — real WhatsApp template bubble (WA UI) */}
            <div className="overflow-hidden rounded-xl border border-border/70">
              <p className="border-b border-border/60 bg-muted/40 px-3 py-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Live preview · WhatsApp
              </p>
              <div className="wa-wallpaper flex justify-center p-4">
                <TemplateBubble
                  variant="incoming"
                  header={
                    form.header
                      ? { type: "text", text: form.header }
                      : undefined
                  }
                  body={
                    form.body || "Your message preview appears here…"
                  }
                  footer={form.footer || undefined}
                  timestamp={new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
              </div>
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
          </CardContent>

          <CardFooter className="items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {editing ? "Unsaved changes" : "Saves to your library"}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={handleCancel}
                disabled={saving}
                className="h-9 rounded-xl text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                onClick={() => void handleSave()}
                disabled={saving}
                className="h-9 rounded-xl"
              >
                {saving ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <PlusIcon />
                )}
                {saving
                  ? "Saving…"
                  : editing
                    ? "Save Changes"
                    : "Create Template"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </DashboardShell>
  );
}
