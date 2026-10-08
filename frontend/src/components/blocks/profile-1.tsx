"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Mail, ShieldCheck, KeyRoundIcon, BellIcon } from "lucide-react"

export interface ProfileUser {
  name: string
  email: string
  role: string
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export default function ProfileBlock({ user }: { user?: ProfileUser }) {
  const name = user?.name ?? "Priya Nair"
  const email = user?.email ?? "m@example.com"
  const roleLabel =
    user?.role === "orgmenu"
      ? "Org Menu Admin"
      : user?.role === "businessowners"
        ? "Business Owner"
        : "Pro"
  const initials = user ? initialsOf(user.name) : "PN"

  const info = [
    { icon: Mail, label: email },
    { icon: ShieldCheck, label: `Role: ${roleLabel}` },
    { icon: Calendar, label: "Joined March 2021" },
  ]

  return (
    <div className="grid w-full flex-1 gap-4 lg:grid-cols-[340px_1fr]">
      <Card className="h-fit overflow-hidden">
        <div
          className="h-24 w-full bg-gradient-to-br from-emerald-500/30 via-emerald-500/10 to-blue-500/15"
          aria-hidden="true"
        />
        <CardContent className="pt-0">
          <Avatar className="-mt-8 size-16 border-4 border-card shadow-sm">
            <AvatarImage
              src={`https://i.pravatar.cc/160?u=${encodeURIComponent(email)}`}
              alt={name}
            />
            <AvatarFallback className="bg-emerald-600 font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="mt-3 flex items-center gap-2">
            <h1 className="text-[16px] font-semibold tracking-tight">{name}</h1>
            <Badge
              variant="secondary"
              className="rounded-full border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            >
              {roleLabel}
            </Badge>
          </div>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{email}</p>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
            Workspace member with full access to messaging, templates and
            automation for this organization.
          </p>
          <Separator className="my-4" />
          <ul className="flex flex-col gap-2.5">
            {info.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-2.5 text-[13px] text-muted-foreground"
              >
                <item.icon className="size-4 shrink-0" aria-hidden="true" />
                {item.label}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" className="h-8 flex-1 rounded-lg">
              Edit profile
            </Button>
            <Button size="sm" className="h-8 flex-1 rounded-lg">
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <Tabs defaultValue="about" className="gap-0">
          <div className="border-b border-border/70 px-2 pt-2">
            <TabsList className="h-9 rounded-xl bg-muted/60">
              <TabsTrigger value="about" className="rounded-lg">
                About
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-lg">
                Security
              </TabsTrigger>
              <TabsTrigger value="activity" className="rounded-lg">
                Activity
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="about" className="flex flex-col gap-4 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/70 p-4">
                <p className="eyebrow">Display name</p>
                <p className="mt-1 text-[14px] font-medium">{name}</p>
              </div>
              <div className="rounded-xl border border-border/70 p-4">
                <p className="eyebrow">Contact</p>
                <p className="mt-1 truncate text-[14px] font-medium">{email}</p>
              </div>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Profiles sync from your auth session. Role changes are managed by
              an orgmenu admin and take effect on next login.
            </p>
          </TabsContent>
          <TabsContent value="security" className="flex flex-col gap-2.5 p-5">
            {[
              { icon: KeyRoundIcon, t: "Password", d: "Last changed 30 days ago", a: "Change" },
              { icon: ShieldCheck, t: "Two-factor", d: "Recommended for admins", a: "Enable" },
              { icon: BellIcon, t: "Login alerts", d: "Email on new device", a: "Manage" },
            ].map((r) => (
              <div
                key={r.t}
                className="flex items-center gap-3 rounded-xl border border-border/70 px-4 py-3"
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <r.icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium">{r.t}</p>
                  <p className="text-[12.5px] text-muted-foreground">{r.d}</p>
                </div>
                <Button variant="outline" size="sm" className="h-8 rounded-lg">
                  {r.a}
                </Button>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="activity" className="p-5">
            <div className="dot-grid rounded-xl border border-dashed border-border px-4 py-8 text-center text-[13px] text-muted-foreground">
              Recent sign-ins, sends and template edits will appear here.
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
