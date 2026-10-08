"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckCircle2Icon,
  MessageCircleIcon,
  MegaphoneIcon,
  LayoutTemplateIcon,
  SmartphoneIcon,
  WorkflowIcon,
  FlaskConicalIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { getSession, type AuthUser } from "@/lib/auth";

const quickLinks = [
  {
    title: "Connect a number",
    desc: "Pair WhatsApp via QR in seconds",
    href: "/sessions",
    icon: SmartphoneIcon,
    accent: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  {
    title: "Create a template",
    desc: "Reusable approved messages",
    href: "/templates",
    icon: LayoutTemplateIcon,
    accent: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  {
    title: "Launch a campaign",
    desc: "Bulk send with tracking",
    href: "/campaigns",
    icon: MegaphoneIcon,
    accent: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  {
    title: "Build a flow",
    desc: "Keyword auto-replies",
    href: "/flow",
    icon: WorkflowIcon,
    accent: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
];

const checklist = [
  "Connect your first WhatsApp session",
  "Create a message template",
  "Send a test message",
  "Review compliance & opt-ins",
];

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getSession()?.user ?? null);
  }, []);

  return (
    <DashboardShell title="Overview">
      <PageHeader
        eyebrow="Workspace"
        title={`Good to see you, ${user?.name?.split(" ")[0] ?? "there"}`}
        description="Everything you need to message customers on WhatsApp — live status at a glance."
        actions={
          <Link href={user?.role === "orgmenu" ? "/orgmenu" : "/business"}>
            <Button className="h-9 rounded-xl bg-foreground text-background shadow-sm transition-all duration-150 hover:opacity-90">
              Open workspace
              <ArrowRightIcon />
            </Button>
          </Link>
        }
      />

      <div className="grid w-full auto-rows-min gap-4 md:grid-cols-3">
        <Card className="animate-rise p-0">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-lg font-semibold text-white shadow-sm">
              {(user?.name?.[0] ?? "W").toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="eyebrow">Signed in as</p>
              <p className="mt-0.5 truncate text-[14px] font-semibold">
                {user?.name ?? "…"}
              </p>
              <p className="truncate text-[12.5px] text-muted-foreground">
                {user?.email ?? "…"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-rise animate-rise-1 p-0">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-700 dark:text-blue-300">
              <ShieldCheckIcon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="eyebrow">Role</p>
              <p className="mt-0.5 flex items-center gap-2 text-[14px] font-semibold capitalize">
                {user?.role === "orgmenu" ? "Org menu" : user?.role ?? "…"}
                <Badge
                  variant="secondary"
                  className="rounded-full text-[10.5px]"
                >
                  {user?.role === "orgmenu" ? "Admin" : "Owner"}
                </Badge>
              </p>
              <p className="truncate text-[12.5px] text-muted-foreground">
                {user?.role === "orgmenu" ? "Org menu admin" : "Business owner"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-rise animate-rise-2 surface-lift p-0">
          <CardContent className="flex items-center justify-between gap-3 p-5">
            <div>
              <p className="eyebrow">Workspace</p>
              <p className="mt-0.5 text-[14px] font-semibold">
                {user?.role === "orgmenu" ? "Org Menu" : "Business"}
              </p>
              <p className="text-[12.5px] text-muted-foreground">
                Your dedicated area
              </p>
            </div>
            <Link
              href={user?.role === "orgmenu" ? "/orgmenu" : "/business"}
              className="inline-flex size-9 items-center justify-center rounded-xl border border-border bg-card transition-all duration-150 hover:border-emerald-500/40 hover:text-emerald-700"
              aria-label="Go to workspace"
            >
              <ArrowUpRightIcon className="size-4" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid w-full flex-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card className="animate-rise animate-rise-2">
          <div className="flex items-center justify-between px-5 pt-5">
            <div>
              <h2 className="text-[14px] font-semibold tracking-tight">
                Getting started
              </h2>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                Four steps to your first delivered message.
              </p>
            </div>
            <Badge variant="secondary" className="rounded-full">
              0 of 4 done
            </Badge>
          </div>
          <CardContent className="space-y-2.5 pt-4">
            {checklist.map((step, i) => (
              <div
                key={step}
                className="group flex items-center gap-3 rounded-xl border border-border/70 bg-muted/30 px-3.5 py-3 transition-all duration-150 hover:border-emerald-500/30 hover:bg-emerald-500/[0.04]"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-card text-[11px] font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <p className="flex-1 text-[13.5px] font-medium">{step}</p>
                <ArrowRightIcon className="size-4 text-muted-foreground opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-100" />
              </div>
            ))}
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/[0.07] px-3.5 py-3 text-[13px] text-emerald-900 dark:text-emerald-200">
              <CheckCircle2Icon className="size-4 shrink-0" />
              Use the sidebar to navigate — press ⌘B to collapse it.
            </div>
          </CardContent>
        </Card>

        <Card className="animate-rise animate-rise-3">
          <div className="px-5 pt-5">
            <h2 className="text-[14px] font-semibold tracking-tight">
              Quick actions
            </h2>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Jump to what matters most.
            </p>
          </div>
          <CardContent className="grid grid-cols-1 gap-2 pt-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {quickLinks.map((q) => (
              <Link
                key={q.title}
                href={q.href}
                className="group rounded-xl border border-border/70 p-3.5 transition-all duration-150 hover:-translate-y-0.5 hover:border-border hover:shadow-[var(--shadow-lift)]"
              >
                <span
                  className={`flex size-9 items-center justify-center rounded-xl ${q.accent}`}
                >
                  <q.icon className="size-4.5" />
                </span>
                <p className="mt-2.5 text-[13px] font-semibold">{q.title}</p>
                <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
                  {q.desc}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="animate-rise animate-rise-3 overflow-hidden">
        <div className="flex flex-col gap-3 px-5 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <MessageCircleIcon className="size-5" />
            </span>
            <div>
              <h2 className="text-[14px] font-semibold tracking-tight">
                Validate before you broadcast
              </h2>
              <p className="text-[13px] text-muted-foreground">
                Send a test message to confirm templates and delivery.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/message-tester">
              <Button variant="outline" className="h-9 rounded-xl">
                <FlaskConicalIcon />
                Open tester
              </Button>
            </Link>
            <Link href="/logs">
              <Button variant="ghost" className="h-9 rounded-xl">
                View logs
                <ArrowRightIcon />
              </Button>
            </Link>
          </div>
        </div>
        <div className="px-5 py-5">
          <div className="dot-grid flex items-center justify-between rounded-xl border border-dashed border-border px-4 py-3 text-[12.5px] text-muted-foreground">
            <span>No recent activity yet — your sends will appear here.</span>
            <span className="hidden font-mono text-[11px] sm:block">live · realtime</span>
          </div>
        </div>
      </Card>
    </DashboardShell>
  );
}
