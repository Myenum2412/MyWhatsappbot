"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CrownIcon, UsersIcon, ArrowRightIcon } from "lucide-react";

export default function OrgMenuPage() {
  return (
    <DashboardShell title="Org Menu" requiredRole="orgmenu">
      <PageHeader
        eyebrow="Workspace · Admin"
        title="Org Menu workspace"
        description="Manage organization menus here. Only users with the orgmenu role can see this page."
        actions={
          <Badge className="rounded-full border-amber-500/25 bg-amber-500/10 text-amber-700 hover:bg-amber-500/15 dark:text-amber-300">
            <CrownIcon className="size-3.5" />
            orgmenu
          </Badge>
        }
      />
      <Card>
        <CardContent className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <UsersIcon className="size-5" />
            </span>
            <div>
              <p className="text-[14px] font-semibold tracking-tight">Team directory</p>
              <p className="text-[13px] text-muted-foreground">
                Every signup appears here — newest first.
              </p>
            </div>
          </div>
          <Link href="/orgmenu/users">
            <Button className="h-9 rounded-xl">
              View users
              <ArrowRightIcon />
            </Button>
          </Link>
        </CardContent>
      </Card>
      <Card className="dot-grid">
        <CardContent className="p-5">
          <h2 className="text-[14px] font-semibold tracking-tight">Menu items</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            Placeholder — wire to your Fastify menu API next.
          </p>
          <div className="mt-4 grid w-full gap-2 sm:grid-cols-3">
            {["Breakfast", "Lunch", "Dinner"].map((m) => (
              <div
                key={m}
                className="rounded-xl border border-border/70 bg-card/80 px-3.5 py-3 text-[13px] font-medium backdrop-blur"
              >
                {m}
                <span className="mt-0.5 block text-[12px] font-normal text-muted-foreground">
                  0 items
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
