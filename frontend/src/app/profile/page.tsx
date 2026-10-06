"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import ProfileBlock from "@/components/blocks/profile-1";
import { getSession, type AuthUser } from "@/lib/auth";

// Shared profile page — open to both orgmenu and businessowners.
export default function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getSession()?.user ?? null);
  }, []);

  return (
    <DashboardShell title="Profile">
      {user ? (
        <ProfileBlock
          user={{ name: user.name, email: user.email, role: user.role }}
        />
      ) : (
        <p className="text-sm text-zinc-500">Loading profile...</p>
      )}
    </DashboardShell>
  );
}
