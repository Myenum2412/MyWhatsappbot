"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  MessageSquareIcon,
  StoreIcon,
  UserIcon,
  UsersIcon,
  UtensilsCrossedIcon,
} from "lucide-react"
import type { AuthUser } from "@/lib/auth"

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: AuthUser }) {
  const navMain =
    user.role === "orgmenu"
      ? [
          {
            title: "Dashboard",
            url: "/dashboard",
            icon: <LayoutDashboardIcon />,
            isActive: true,
            items: [{ title: "Overview", url: "/dashboard" }],
          },
          {
            title: "Org Menu",
            url: "/orgmenu",
            icon: <UtensilsCrossedIcon />,
            items: [
              { title: "Manage menu", url: "/orgmenu" },
              { title: "Users", url: "/orgmenu/users" },
            ],
          },
          {
            title: "Users",
            url: "/orgmenu/users",
            icon: <UsersIcon />,
            items: [{ title: "All users", url: "/orgmenu/users" }],
          },
          {
            title: "Messages",
            url: "/messages",
            icon: <MessageSquareIcon />,
            items: [{ title: "All messages", url: "/messages" }],
          },
          {
            title: "Profile",
            url: "/profile",
            icon: <UserIcon />,
            items: [{ title: "My profile", url: "/profile" }],
          },
        ]
      : [
          {
            title: "Dashboard",
            url: "/dashboard",
            icon: <LayoutDashboardIcon />,
            isActive: true,
            items: [{ title: "Overview", url: "/dashboard" }],
          },
          {
            title: "Business",
            url: "/business",
            icon: <StoreIcon />,
            items: [{ title: "My business", url: "/business" }],
          },
          {
            title: "Messages",
            url: "/messages",
            icon: <MessageSquareIcon />,
            items: [{ title: "All messages", url: "/messages" }],
          },
          {
            title: "Profile",
            url: "/profile",
            icon: <UserIcon />,
            items: [{ title: "My profile", url: "/profile" }],
          },
        ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: user.name, email: user.email, avatar: "" }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
