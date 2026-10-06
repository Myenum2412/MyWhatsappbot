"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { getSession, type AuthUser } from "@/lib/auth";

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getSession()?.user ?? null);
  }, []);

  return (
    <DashboardShell title="Overview">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-4">
          <p className="text-xs text-zinc-500">Signed in as</p>
          <p className="font-semibold">{user?.name ?? "..."}</p>
          <p className="text-sm text-zinc-500">{user?.email}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs text-zinc-500">Role</p>
          <p className="font-semibold">{user?.role}</p>
          <p className="text-sm text-zinc-500">
            {user?.role === "orgmenu" ? "Org menu admin" : "Business owner"}
          </p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-xs text-zinc-500">Workspace</p>
          <Link
            className="font-semibold underline"
            href={user?.role === "orgmenu" ? "/orgmenu" : "/business"}
          >
            {user?.role === "orgmenu" ? "Go to Org Menu" : "Go to Business"}
          </Link>
        </div>
      </div>
      <div className="min-h-[40vh] flex-1 rounded-xl border p-4">
        <h2 className="font-semibold">Getting started</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Use the sidebar to navigate. Collapse it to icons with the trigger in
          the header.
        </p>
      </div>
    </DashboardShell>
  );
}
