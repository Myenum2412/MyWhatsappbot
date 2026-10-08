"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2Icon, ArrowRightIcon, SmartphoneIcon, LayoutTemplateIcon, MegaphoneIcon } from "lucide-react";

export default function BusinessPage() {
  return (
    <DashboardShell title="Business" requiredRole="businessowners">
      <PageHeader
        eyebrow="Workspace · Business"
        title="Business workspace"
        description="Manage your business here. Only users with the businessowners role can see this page."
        actions={
          <Badge variant="secondary" className="rounded-full">
            <Building2Icon className="size-3.5" />
            businessowners
          </Badge>
        }
      />
      <div className="grid w-full gap-4 sm:grid-cols-3">
        {[
          { icon: SmartphoneIcon, t: "Sessions", d: "Numbers & QR pairing", href: "/sessions" },
          { icon: LayoutTemplateIcon, t: "Templates", d: "Approved messages", href: "/templates" },
          { icon: MegaphoneIcon, t: "Campaigns", d: "Broadcasts & tracking", href: "/campaigns" },
        ].map((c) => (
          <Card key={c.t} className="surface-lift">
            <CardContent className="p-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <c.icon className="size-5" />
              </span>
              <p className="mt-3 text-[14px] font-semibold tracking-tight">{c.t}</p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">{c.d}</p>
              <Link
                href={c.href}
                className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-emerald-700 hover:gap-1.5 dark:text-emerald-300"
              >
                Open <ArrowRightIcon className="size-3.5" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-5">
          <h2 className="text-[14px] font-semibold tracking-tight">Overview</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            Placeholder — wire to your Fastify business API next. Layout, spacing
            and states are production-ready.
          </p>
          <div className="mt-4 flex gap-2">
            <Link href="/sessions">
              <Button className="h-9 rounded-xl">Connect number</Button>
            </Link>
            <Link href="/message-tester">
              <Button variant="outline" className="h-9 rounded-xl">
                Send test
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
