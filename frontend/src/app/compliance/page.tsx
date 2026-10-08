"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheckIcon, CheckCircle2Icon } from "lucide-react";

const items = [
  { t: "Explicit opt-in captured", d: "Checkbox + timestamp stored per recipient" },
  { t: "One-tap opt-out (STOP)", d: "Auto-suppression list, no re-contact" },
  { t: "DLT headers registered", d: "Principal entity + template IDs verified" },
  { t: "Audit trail exportable", d: "Every send, status change and consent event" },
];

export default function CompliancePage() {
  return (
    <DashboardShell title="Compliance">
      <PageHeader
        eyebrow="System · Trust"
        title="Compliance"
        description="Opt-in / opt-out management, DLT headers, and audit trail."
        actions={
          <Badge className="rounded-full border-emerald-500/25 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300">
            <ShieldCheckIcon className="size-3.5" />
            Healthy
          </Badge>
        }
      />
      <div className="grid w-full flex-1 gap-4 md:grid-cols-2">
        {items.map((c, i) => (
          <Card key={c.t} className="animate-rise" >
            <CardContent className="flex items-start gap-3.5 p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2Icon className="size-5" />
              </span>
              <div>
                <p className="text-[11px] font-mono text-muted-foreground">0{i + 1}</p>
                <p className="mt-0.5 text-[14px] font-semibold tracking-tight">{c.t}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{c.d}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="w-full">
        <CardContent className="flex flex-col gap-2 p-5 text-[13px] leading-relaxed text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            Connect your suppression list and DLT credentials in{" "}
            <span className="font-medium text-foreground">Settings → Compliance</span>.
          </span>
          <span className="font-mono text-[11.5px]">retention · 13 months</span>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
