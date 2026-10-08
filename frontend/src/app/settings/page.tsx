"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { KeyRoundIcon, BellIcon, Building2Icon } from "lucide-react";

export default function SettingsPage() {
  return (
    <DashboardShell title="Settings">
      <PageHeader
        eyebrow="Workspace · Preferences"
        title="Settings"
        description="Workspace settings, API keys, and preferences."
      />
      <div className="grid w-full flex-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-3 px-5 pt-5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Building2Icon className="size-5" />
            </span>
            <div>
              <p className="text-[14px] font-semibold tracking-tight">Workspace</p>
              <p className="text-[12.5px] text-muted-foreground">Name, timezone, sender defaults</p>
            </div>
          </div>
          <CardContent className="space-y-3.5 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="ws-name">Workspace name</Label>
              <Input id="ws-name" defaultValue="My Business" className="h-10 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ws-tz">Timezone</Label>
                <Input id="ws-tz" defaultValue="Asia/Kolkata" className="h-10 rounded-xl font-mono text-[13px]" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ws-lang">Default locale</Label>
                <Input id="ws-lang" defaultValue="en_IN" className="h-10 rounded-xl font-mono text-[13px]" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="h-9 rounded-xl">Save changes</Button>
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex items-center justify-between px-5 pt-5">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <KeyRoundIcon className="size-5" />
                </span>
                <div>
                  <p className="text-[14px] font-semibold tracking-tight">API keys</p>
                  <p className="text-[12.5px] text-muted-foreground">Backend on :4000</p>
                </div>
              </div>
              <Badge variant="secondary" className="rounded-full font-mono">v1</Badge>
            </div>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-muted/30 px-3 py-2.5 font-mono text-[12px]">
                <span className="flex-1 truncate">mw_live_••••••••••••4f2a</span>
                <Button variant="outline" size="xs" className="rounded-lg">Reveal</Button>
                <Button variant="outline" size="xs" className="rounded-lg">Rotate</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <div className="flex items-center gap-3 px-5 pt-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <BellIcon className="size-5" />
              </span>
              <div>
                <p className="text-[14px] font-semibold tracking-tight">Notifications</p>
                <p className="text-[12.5px] text-muted-foreground">Failures, QR expiry, limits</p>
              </div>
            </div>
            <CardContent className="space-y-2 pt-4 text-[13px]">
              {["Delivery failures", "Session disconnected", "Weekly summary"].map((t) => (
                <label
                  key={t}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-border/60 px-3.5 py-2.5 transition-colors hover:bg-muted/40"
                >
                  {t}
                  <input
                    type="checkbox"
                    defaultChecked
                    className="size-4 accent-emerald-600"
                    aria-label={t}
                  />
                </label>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
