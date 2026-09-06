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
import { Ellipsis, FileCheckIcon, CheckIcon, XIcon } from "lucide-react"

type TemplateRow = { id: string; name: string; category: string; submittedBy: string; submittedAt: string; status: "Pending" | "Approved" | "Rejected" }

const initial: TemplateRow[] = []

export default function Page() {
  const router = useRouter()
  const [checked, setChecked] = React.useState(false)
  const [rows, setRows] = React.useState<TemplateRow[]>(initial)

  React.useEffect(() => {
    if (localStorage.getItem("auth") !== "true") router.replace("/login")
    else setChecked(true)
  }, [router])

  function handleApprove(id: string) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, status: "Approved" } : r))
  }
  function handleReject(id: string) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, status: "Rejected" } : r))
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
                <BreadcrumbItem><BreadcrumbPage>Template Approval</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <AppTable
            data={rows}
            title="Template Approval"
            description={`${rows.filter(r => r.status === "Pending").length} pending â€¢ Approve or reject WhatsApp templates`}
            icon={<FileCheckIcon className="size-4" />}
            searchKey="name"
            searchPlaceholder="Search templates..."
            columns={[
              { id: "select", enableSorting: false, enableHiding: false, header: ({ table }: any) => <Checkbox checked={table.getIsAllPageRowsSelected()} indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" />, cell: ({ row }: any) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label={`Select ${row.original.name}`} /> },
              { accessorKey: "name", header: ({ column }: any) => <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-mx-1 inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground">Template Name <SortIcon sorted={column.getIsSorted()} /></button>, cell: ({ row }: any) => <span className="font-mono text-xs">{row.original.name}</span> },
              { accessorKey: "category", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Category</span>, cell: ({ row }: any) => <span className="text-sm">{row.original.category}</span> },
              { accessorKey: "submittedBy", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Submitted By</span>, cell: ({ row }: any) => <span className="text-sm">{row.original.submittedBy}</span> },
              { accessorKey: "submittedAt", header: ({ column }: any) => <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-mx-1 inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground">Submitted <SortIcon sorted={column.getIsSorted()} /></button>, cell: ({ row }: any) => <span className="text-xs text-muted-foreground tabular-nums">{row.original.submittedAt}</span> },
              {
                accessorKey: "status",
                header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Status</span>,
                cell: ({ row }: any) => {
                  const s = row.original.status
                  return <Badge variant={s === "Approved" ? "default" : s === "Pending" ? "secondary" : "outline"} className={s === "Pending" ? "bg-amber-100 text-amber-700 border-amber-200" : s === "Rejected" ? "bg-red-100 text-red-700 border-red-200" : ""}>{s}</Badge>
                },
              },
              {
                id: "actions",
                enableSorting: false,
                enableHiding: false,
                header: () => <span className="sr-only">Actions</span>,
                cell: ({ row }: any) => (
                  <div className="flex justify-end gap-1">
                    {row.original.status === "Pending" ? (
                      <>
                        <Button size="sm" className="h-7" onClick={() => handleApprove(row.original.id)}><CheckIcon className="size-3.5" /> Approve</Button>
                        <Button size="sm" variant="outline" className="h-7" onClick={() => handleReject(row.original.id)}><XIcon className="size-3.5" /> Reject</Button>
                      </>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}><Ellipsis className="size-4" /></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem>View</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem>History</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
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

