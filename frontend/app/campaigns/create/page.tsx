"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AppTable, SortIcon } from "@/components/blocks/app-table"
import { MegaphoneIcon, Ellipsis, CopyIcon, Trash2Icon } from "lucide-react"
import { getCampaigns, deleteCampaign, duplicateCampaign } from "@/lib/api"

type Campaign = {
  _id: string
  id: string
  name: string
  template: string
  recipients: number
  sent: number
  delivered: number
  read: number
  failed: number
  status: string
  createdAt: string
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Completed: "bg-green-100 text-green-700 border-green-200",
    Running: "bg-blue-100 text-blue-700 border-blue-200",
    Scheduled: "bg-amber-100 text-amber-700 border-amber-200",
    Draft: "bg-zinc-100 text-zinc-700",
    Paused: "bg-orange-100 text-orange-700 border-orange-200",
    Failed: "bg-red-100 text-red-700 border-red-200",
  }
  return <Badge variant="outline" className={map[status] || ""}>{status}</Badge>
}

export default function Page() {
  const router = useRouter()
  const [checked, setChecked] = React.useState(false)
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([])

  async function fetchCampaigns() {
    try {
      const res = await getCampaigns()
      setCampaigns((res.data || []).map((c: any) => ({ ...c, id: c._id })))
    } catch (e) {
      console.error(e)
    }
  }

  React.useEffect(() => {
    if (localStorage.getItem("auth") !== "true") router.replace("/login")
    else {
      setChecked(true)
      fetchCampaigns()
    }
  }, [router])

  async function handleDelete(id: string) {
    if (!confirm("Delete this campaign?")) return
    await deleteCampaign(id)
    await fetchCampaigns()
  }
  async function handleDuplicate(id: string) {
    await duplicateCampaign(id)
    await fetchCampaigns()
  }

  if (!checked) return <div className="flex min-h-svh items-center justify-center"><p className="text-sm text-muted-foreground">Checking authentication...</p></div>

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink href="/campaigns">Campaigns</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>Create</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <AppTable
            data={campaigns}
            title="Campaigns — Create"
            description="Table of created campaigns • Shows every campaign you create"
            icon={<MegaphoneIcon className="size-4" />}
            searchKey="name"
            searchPlaceholder="Search campaigns..."
            createLabel="Create Campaign"
            onCreate={() => router.push("/campaigns/create/new")}
            columns={[
              { id: "select", enableSorting: false, enableHiding: false, header: ({ table }: any) => <Checkbox checked={table.getIsAllPageRowsSelected()} indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" />, cell: ({ row }: any) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label={`Select ${row.original.name}`} /> },
              { accessorKey: "name", header: ({ column }: any) => <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-mx-1 inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground">Campaign Name <SortIcon sorted={column.getIsSorted()} /></button>, cell: ({ row }: any) => <span className="font-medium text-sm">{row.original.name}</span> },
              { accessorKey: "template", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Template</span>, cell: ({ row }: any) => <span className="font-mono text-xs">{row.original.template}</span> },
              { accessorKey: "recipients", header: ({ column }: any) => <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-mx-1 inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground">Recipients <SortIcon sorted={column.getIsSorted()} /></button>, cell: ({ row }: any) => <span className="text-sm tabular-nums">{row.original.recipients?.toLocaleString()}</span> },
              { accessorKey: "sent", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Sent</span>, cell: ({ row }: any) => <span className="text-sm tabular-nums">{row.original.sent}</span> },
              { accessorKey: "delivered", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Delivered</span>, cell: ({ row }: any) => <span className="text-sm tabular-nums">{row.original.delivered}</span> },
              { accessorKey: "read", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Read</span>, cell: ({ row }: any) => <span className="text-sm tabular-nums">{row.original.read}</span> },
              { accessorKey: "failed", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Failed</span>, cell: ({ row }: any) => <span className="text-sm tabular-nums">{row.original.failed}</span> },
              { accessorKey: "status", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Status</span>, cell: ({ row }: any) => <StatusBadge status={row.original.status} /> },
              { accessorKey: "createdAt", sortFn: "datetime", header: ({ column }: any) => <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-mx-1 ml-auto inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground">Created <SortIcon sorted={column.getIsSorted()} /></button>, cell: ({ row }: any) => <span className="block text-right text-xs text-muted-foreground tabular-nums">{new Date(row.original.createdAt).toLocaleDateString()}</span> },
              {
                id: "actions",
                enableSorting: false,
                enableHiding: false,
                header: () => <span className="sr-only">Actions</span>,
                cell: ({ row }: any) => (
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}><Ellipsis className="size-4" /></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => handleDuplicate(row.original._id)}><CopyIcon className="size-4" /> Duplicate</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => handleDelete(row.original._id)}><Trash2Icon className="size-4" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ),
              },
            ] as any}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
