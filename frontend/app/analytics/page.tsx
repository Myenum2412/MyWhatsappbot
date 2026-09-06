"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppTable, SortIcon } from "@/components/blocks/app-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BarChart3Icon, Ellipsis } from "lucide-react"

type Row = { id: string; metric: string; value: string; change: string; status: string }

const sample: Row[] = []

export default function Page() {
  const router = useRouter()
  const [checked, setChecked] = React.useState(false)
  React.useEffect(() => {
    if (localStorage.getItem("auth") !== "true") router.replace("/login")
    else setChecked(true)
  }, [router])
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
                <BreadcrumbItem><BreadcrumbPage>Analytics</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid gap-4 md:grid-cols-3">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Campaigns</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">42</div><p className="text-xs text-muted-foreground">All time</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Delivery Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">96.8%</div><p className="text-xs text-muted-foreground">Last 30 days</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Read Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">73.5%</div><p className="text-xs text-muted-foreground">Last 30 days</p></CardContent></Card>
          </div>

          <AppTable
            data={sample}
            title="Analytics"
            description="Single page — overview of campaign, leads, agent and reports"
            icon={<BarChart3Icon className="size-4" />}
            searchKey="metric"
            searchPlaceholder="Search analytics..."
            createLabel="Export Report"
            columns={[
              { id: "select", enableSorting: false, enableHiding: false, header: ({ table }: any) => <Checkbox checked={table.getIsAllPageRowsSelected()} indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" />, cell: ({ row }: any) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label={`Select ${row.original.metric}`} /> },
              { accessorKey: "metric", header: ({ column }: any) => <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-mx-1 inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground">Metric <SortIcon sorted={column.getIsSorted()} /></button>, cell: ({ row }: any) => <span className="font-medium text-sm">{row.original.metric}</span> },
              { accessorKey: "value", header: ({ column }: any) => <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-mx-1 inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground">Value <SortIcon sorted={column.getIsSorted()} /></button>, cell: ({ row }: any) => <span className="font-mono text-sm">{row.original.value}</span> },
              { accessorKey: "change", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Change</span>, cell: ({ row }: any) => <Badge variant="outline" className="text-xs">{row.original.change}</Badge> },
              { accessorKey: "status", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Status</span>, cell: ({ row }: any) => <Badge variant={row.original.status === "Active" ? "default" : row.original.status === "Invited" ? "secondary" : "outline"} className="text-xs">{row.original.status}</Badge> },
              { id: "actions", enableSorting: false, enableHiding: false, header: () => <span className="sr-only">Actions</span>, cell: () => <div className="flex justify-end"><DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}><Ellipsis className="size-4" /></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-32"><DropdownMenuItem>View</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div> },
            ] as any}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

