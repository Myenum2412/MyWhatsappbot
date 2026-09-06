"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  GalleryVerticalEndIcon,
  LayoutDashboardIcon,
  InboxIcon,
  MegaphoneIcon,
  ContactIcon,
  TargetIcon,
  BarChart3Icon,
  SmartphoneIcon,
  ImageIcon,
  BellIcon,
  Settings2Icon,
  FileCheckIcon,
  WorkflowIcon,
  BotIcon,
  ScaleIcon,
} from "lucide-react"

const data = {
  user: {
    name: "Meenu",
    email: "myenumam@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Inbox",
      url: "/inbox",
      icon: <InboxIcon />,
    },
    {
      title: "Campaigns",
      url: "#",
      icon: <MegaphoneIcon />,
      items: [
        { title: "Create", url: "/campaigns/create" },
        { title: "Scheduled", url: "/campaigns/scheduled" },
        { title: "Templates", url: "/campaigns/templates" },
      ],
    },
    {
      title: "Contacts",
      url: "#",
      icon: <ContactIcon />,
      items: [
        { title: "All", url: "/contacts" },
        { title: "Create", url: "/contacts/create" },
        { title: "Import/Export", url: "/contacts/import-export" },
        { title: "Segments", url: "/contacts/segments" },
        { title: "Labels", url: "/contacts/labels" },
      ],
    },
    {
      title: "Leads",
      url: "#",
      icon: <TargetIcon />,
      items: [
        { title: "All", url: "/leads" },
        { title: "Create", url: "/leads/create" },
        { title: "Pipeline", url: "/leads/pipeline" },
        { title: "Tasks / Follow-ups", url: "/leads/tasks" },
      ],
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: <BarChart3Icon />,
    },
    {
      title: "Automation",
      url: "#",
      icon: <WorkflowIcon />,
      items: [
        { title: "Workflows", url: "/automation/workflows" },
        { title: "Auto-replies", url: "/automation/auto-replies" },
        { title: "Chatbot", url: "/automation/chatbot" },
        { title: "Webhooks", url: "/automation/webhooks" },
      ],
    },
    {
      title: "Template Approval",
      url: "/template-approval",
      icon: <FileCheckIcon />,
    },
    {
      title: "Ai Agent",
      url: "/ai-agent",
      icon: <BotIcon />,
    },
    {
      title: "WhatsApp Accounts",
      url: "/whatsapp",
      icon: <SmartphoneIcon />,
    },
    {
      title: "Media Library",
      url: "/media",
      icon: <ImageIcon />,
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: <BellIcon />,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: <Settings2Icon />,
    },
    {
      title: "Terms & Conditions",
      url: "/terms",
      icon: <ScaleIcon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEndIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">MyWhatsappMsg</span>
                <span className="truncate text-xs">Enterprise</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
