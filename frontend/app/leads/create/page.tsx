"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppTable, SortIcon } from "@/components/blocks/app-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Ellipsis } from "lucide-react"
import { Target } from "lucide-react"

type Row = { id: string; name: string; email: string; status: string; created: string }

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
                <BreadcrumbItem><BreadcrumbPage>Create Lead</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <AppTable
            data={sample}
            title="Create Lead"
            description="Add a new lead"
            icon={<Target className="size-4" />}
            searchKey="name"
            searchPlaceholder="Search..."
            createLabel="Create Create Lead"
            columns={[
              { id: "select", enableSorting: false, enableHiding: false, header: ({ table }: any) => <Checkbox checked={table.getIsAllPageRowsSelected()} indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" />, cell: ({ row }: any) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label={`Select ${row.original.name}`} /> },
              { accessorKey: "name", header: ({ column }: any) => <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-mx-1 inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground">Name <SortIcon sorted={column.getIsSorted()} /></button>, cell: ({ row }: any) => <span className="font-medium text-sm">{row.original.name}</span> },
              { accessorKey: "email", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Email</span>, cell: ({ row }: any) => <span className="text-sm text-muted-foreground">{row.original.email}</span> },
              { accessorKey: "status", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Status</span>, cell: ({ row }: any) => <Badge variant={row.original.status === "Active" ? "default" : row.original.status === "Invited" ? "secondary" : "outline"} className="text-xs">{row.original.status}</Badge> },
              { accessorKey: "created", header: ({ column }: any) => <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-mx-1 ml-auto inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground">Created <SortIcon sorted={column.getIsSorted()} /></button>, cell: ({ row }: any) => <span className="block text-right text-xs text-muted-foreground tabular-nums">{row.original.created}</span> },
              { id: "actions", enableSorting: false, enableHiding: false, header: () => <span className="sr-only">Actions</span>, cell: ({ row }: any) => <div className="flex justify-end"><DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}><Ellipsis className="size-4" /></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-40"><DropdownMenuItem>Edit</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive">Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div> },
            ] as any}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


