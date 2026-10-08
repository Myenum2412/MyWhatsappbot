"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollTextIcon, SearchIcon } from "lucide-react";

const rows = [
  { to: "+91 98••••210", tpl: "order_confirmation", st: "Delivered", t: "2m ago", tone: "emerald" },
  { to: "+91 97••••440", tpl: "otp_login", st: "Read", t: "18m ago", tone: "emerald" },
  { to: "+91 99••••018", tpl: "campaign_diwali", st: "Queued", t: "1h ago", tone: "amber" },
  { to: "+91 96••••772", tpl: "payment_reminder", st: "Failed", t: "3h ago", tone: "red" },
];

export default function LogsPage() {
  return (
    <DashboardShell title="Logs">
      <PageHeader
        eyebrow="System · Observability"
        title="Logs"
        description="Delivery history, statuses, and error traces."
        actions={
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Filter logs…" className="h-9 w-56 rounded-xl pl-9" />
          </div>
        }
      />
      <Card className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-3.5">
          <p className="flex items-center gap-2 text-[13.5px] font-semibold">
            <ScrollTextIcon className="size-4 text-muted-foreground" />
            Recent deliveries
          </p>
          <Badge variant="secondary" className="rounded-full font-mono">
            live tail
          </Badge>
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {rows.map((r) => (
              <div
                key={r.to + r.tpl}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors duration-150 hover:bg-muted/40"
              >
                <span className="font-mono text-[12.5px]">{r.to}</span>
                <span className="hidden font-mono text-[12px] text-muted-foreground sm:block">
                  {r.tpl}
                </span>
                <span className="ml-auto text-[12px] text-muted-foreground">{r.t}</span>
                <Badge
                  variant="secondary"
                  className={
                    r.tone === "emerald"
                      ? "rounded-full border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : r.tone === "amber"
                        ? "rounded-full border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        : "rounded-full border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300"
                  }
                >
                  {r.st}
                </Badge>
              </div>
            ))}
          </div>
          <p className="border-t border-border/60 bg-muted/30 px-5 py-3 font-mono text-[11.5px] text-muted-foreground">
            Wire this table to GET /api/messages for live data — layout is final.
          </p>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
