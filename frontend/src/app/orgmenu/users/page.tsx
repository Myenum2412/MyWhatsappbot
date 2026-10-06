"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import TableBlock from "@/components/blocks/table-1";
import { getSession, getUsers, type DirectoryUser } from "@/lib/auth";

// Orgmenu-only: every signup (business by default) shows up here.
export default function OrgUsersPage() {
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const session = getSession();
    if (!session) {
      setError("Not signed in.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setUsers(await getUsers(session.token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DashboardShell title="Users" requiredRole="orgmenu">
      <TableBlock users={users} loading={loading} error={error} onRefresh={load} />
    </DashboardShell>
  );
}
