"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, CommandIcon } from "lucide-react";
import {
  destinationForRole,
  getSession,
  type AuthUser,
  type UserRole,
} from "@/lib/auth";

interface DashboardShellProps {
  title: string;
  requiredRole?: UserRole;
  children: React.ReactNode;
}

export function DashboardShell({
  title,
  requiredRole,
  children,
}: DashboardShellProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    if (requiredRole && session.user.role !== requiredRole) {
      router.replace(destinationForRole(session.user.role));
      return;
    }
    setUser(session.user);
  }, [router, requiredRole]);

  if (!user)
    return (
      <div className="flex min-h-svh flex-col gap-4 bg-background p-6">
        <div className="skeleton-shimmer h-12 rounded-2xl border bg-card" />
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="skeleton-shimmer h-28 rounded-2xl border bg-card"
            />
          ))}
        </div>
        <div className="skeleton-shimmer h-64 flex-1 rounded-2xl border bg-card" />
      </div>
    );

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar user={user} />
      <SidebarInset className="flex h-svh min-w-0 flex-col overflow-hidden bg-transparent">
        <header className="z-30 shrink-0 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            <SidebarTrigger className="-ml-1 rounded-lg" />
            <Separator
              orientation="vertical"
              className="mr-1 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink
                    href="/dashboard"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium">{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative hidden md:block">
                <SearchIcon
                  className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  placeholder="Search…"
                  aria-label="Search"
                  className="h-8 w-56 rounded-xl border-border/70 bg-muted/50 pr-12 pl-9 text-[13px] transition-all placeholder:text-muted-foreground/70 focus-visible:w-72 focus-visible:bg-card focus-visible:ring-brand/30"
                />
                <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground lg:inline-flex">
                  <CommandIcon className="size-2.5" />K
                </kbd>
              </div>
              <Badge
                variant="secondary"
                className="hidden rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 sm:inline-flex dark:text-emerald-300"
              >
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Operational
              </Badge>
            </div>
          </div>
        </header>
        <div className="page-shell flex h-full min-h-0 w-full max-w-none flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 sm:px-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
