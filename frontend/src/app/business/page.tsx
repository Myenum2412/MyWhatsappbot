"use client";

import { DashboardShell } from "@/components/dashboard-shell";

export default function BusinessPage() {
  return (
    <DashboardShell title="Business" requiredRole="businessowners">
      <div className="rounded-xl border p-4">
        <h1 className="text-xl font-bold">Business workspace</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage your business here. Only users with the businessowners role
          can see this page.
        </p>
      </div>
      <div className="min-h-[40vh] flex-1 rounded-xl border p-4">
        <h2 className="font-semibold">Overview</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Placeholder — wire to your Fastify business API next.
        </p>
      </div>
    </DashboardShell>
  );
}
