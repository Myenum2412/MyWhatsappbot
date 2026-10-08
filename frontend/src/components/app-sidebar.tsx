"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import {
  FlaskConicalIcon,
  LayoutDashboardIcon,
  LayoutTemplateIcon,
  MegaphoneIcon,
  MessageCircleIcon,
  ScrollTextIcon,
  SettingsIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  WorkflowIcon,
} from "lucide-react"
import type { AuthUser } from "@/lib/auth"

const sections = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboardIcon },
    ],
  },
  {
    label: "Messaging",
    items: [
      { title: "Sessions", url: "/sessions", icon: SmartphoneIcon, badge: "Live" },
      { title: "Chats", url: "/chats", icon: MessageCircleIcon },
      { title: "Templates", url: "/templates", icon: LayoutTemplateIcon },
      { title: "Campaigns", url: "/campaigns", icon: MegaphoneIcon },
    ],
  },
  {
    label: "Automation",
    items: [
      { title: "Flow", url: "/flow", icon: WorkflowIcon },
      { title: "Message Tester", url: "/message-tester", icon: FlaskConicalIcon },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Logs", url: "/logs", icon: ScrollTextIcon },
      { title: "Compliance", url: "/compliance", icon: ShieldCheckIcon },
    ],
  },
]

function isActivePath(pathname: string | null, url: string) {
  return pathname === url || pathname?.startsWith(`${url}/`)
}

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: AuthUser }) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="pt-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="MyWhatsAppMsg"
              render={<Link href="/dashboard" />}
              className="rounded-xl transition-colors duration-150 hover:bg-sidebar-accent"
            >
              <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_4px_12px_-2px_oklch(0.62_0.17_155/0.5)]">
                <MessageCircleIcon className="size-4.5" strokeWidth={2.2} />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-[13.5px] font-semibold tracking-tight">
                  MyWhatsAppMsg
                </span>
                <span className="truncate text-[11.5px] text-muted-foreground">
                  WhatsApp Platform
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-1 px-2">
        {sections.map((section) => (
          <SidebarGroup key={section.label} className="px-0 py-1">
            <SidebarGroupLabel className="px-2 text-[10.5px] font-semibold tracking-[0.08em] uppercase">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {section.items.map((item) => {
                  const active = isActivePath(pathname, item.url)
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={active}
                        render={<Link href={item.url} />}
                        className={
                          active
                            ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-[inset_0_0_0_1px_var(--sidebar-border)]"
                            : "text-sidebar-foreground/80 transition-all duration-150 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
                        }
                      >
                        <item.icon
                          className={active ? "text-emerald-600 dark:text-emerald-400" : undefined}
                        />
                        <span className="flex-1">{item.title}</span>
                        {"badge" in item && item.badge ? (
                          <Badge
                            variant="secondary"
                            className="h-4.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-1.5 text-[10px] font-semibold text-emerald-700 group-data-[collapsible=icon]:hidden dark:text-emerald-300"
                          >
                            {item.badge}
                          </Badge>
                        ) : null}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="gap-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Settings"
              isActive={isActivePath(pathname, "/settings")}
              render={<Link href="/settings" />}
              className="text-sidebar-foreground/80 transition-colors duration-150 hover:bg-sidebar-accent/70"
            >
              <SettingsIcon />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator className="mx-0" />
        <NavUser user={{ name: user.name, email: user.email, avatar: "" }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
