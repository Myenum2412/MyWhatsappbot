"use client";

import { DashboardShell } from "@/components/dashboard-shell";

export default function OrgMenuPage() {
  return (
    <DashboardShell title="Org Menu" requiredRole="orgmenu">
      <div className="rounded-xl border p-4">
        <h1 className="text-xl font-bold">Org Menu workspace</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage organization menus here. Only users with the orgmenu role can
          see this page.
        </p>
      </div>
      <div className="min-h-[40vh] flex-1 rounded-xl border p-4">
        <h2 className="font-semibold">Menu items</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Placeholder — wire to your Fastify menu API next.
        </p>
      </div>
    </DashboardShell>
  );
}
