"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WorkflowIcon, ArrowRightIcon, ZapIcon } from "lucide-react";

export default function FlowPage() {
  return (
    <DashboardShell title="Flow">
      <PageHeader
        eyebrow="Automation · Chatbot"
        title="Flow"
        description="Build automated chatbot flows and keyword replies."
        actions={
          <Badge variant="secondary" className="rounded-full">
            Visual builder
          </Badge>
        }
      />
      <Card className="dot-grid flex-1 overflow-hidden">
        <CardContent className="flex flex-col items-center px-6 py-14 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground shadow-sm">
            <WorkflowIcon className="size-5" />
          </span>
          <h2 className="mt-4 text-[15px] font-semibold tracking-tight">
            Automate the repetitive 80%
          </h2>
          <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            Keyword triggers, welcome messages and fallback replies — without
            writing backend code.
          </p>
          <div className="mt-5 flex items-center gap-2">
            <Button className="h-9 rounded-xl">
              <ZapIcon />
              New flow
              <ArrowRightIcon />
            </Button>
          </div>
          <div className="mt-8 flex w-full flex-col items-center gap-0">
            {["Incoming: “price”", "Match keyword → send template", "Fallback to human"].map(
              (t, i) => (
                <div key={t} className="flex w-full flex-col items-center">
                  <div className="w-full rounded-xl border border-border/70 bg-card/80 px-4 py-3 text-[13px] font-medium backdrop-blur">
                    {t}
                  </div>
                  {i < 2 && <div className="h-4 w-px bg-border" />}
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
