"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusIcon, SearchIcon, RefreshCwIcon, EyeIcon, PencilIcon, CopyIcon, Trash2Icon, PauseIcon, PlayIcon, CalendarIcon, MegaphoneIcon } from "lucide-react"
import { getCampaigns, createCampaign, deleteCampaign, duplicateCampaign, getCampaignStats } from "@/lib/api"
import { AppTable, SortIcon } from "@/components/blocks/app-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Ellipsis } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { tableFeatures, rowSortingFeature, columnFilteringFeature, createSortedRowModel, createFilteredRowModel, createPaginatedRowModel, rowPaginationFeature, rowSelectionFeature, columnVisibilityFeature, sortFn_datetime } from "@tanstack/react-table"

type Campaign = {
  _id: string
  name: string
  template: string
  recipients: number
  sent: number
  delivered: number
  read: number
  failed: number
  status: string
  createdAt: string
  description?: string
}

const scheduled: any[] = []

const templates: any[] = []

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
  const [activeTab, setActiveTab] = React.useState("campaigns")
  const [search, setSearch] = React.useState("")
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([])
  const [stats, setStats] = React.useState<any>({ total: 0, running: 0, scheduled: 0, completed: 0, failed: 0 })
  const [loading, setLoading] = React.useState(false)
  const [creating, setCreating] = React.useState(false)
  const [msg, setMsg] = React.useState("")

  // Create form state
  const [form, setForm] = React.useState({
    name: "",
    description: "",
    template: "diwali_offer_v2",
    campaignType: "Marketing",
    account: "qr1",
    audience: "vip",
    recipients: "12500",
    scheduledDate: "",
    scheduledTime: "",
    timezone: "Asia/Kolkata",
    delay: "2",
    perMinute: "60",
  })

  async function fetchCampaigns() {
    try {
      setLoading(true)
      const [cRes, sRes] = await Promise.all([getCampaigns(), getCampaignStats().catch(() => ({ data: null }))])
      setCampaigns(cRes.data || [])
      if (sRes?.data) setStats(sRes.data)
      else {
        // fallback compute from campaigns
        const total = cRes.data?.length || 0
        const running = cRes.data?.filter((c: any) => c.status === "Running").length || 0
        const scheduled = cRes.data?.filter((c: any) => c.status === "Scheduled").length || 0
        const completed = cRes.data?.filter((c: any) => c.status === "Completed").length || 0
        const failed = cRes.data?.filter((c: any) => c.status === "Failed").length || 0
        setStats({ total, running, scheduled, completed, failed })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (localStorage.getItem("auth") !== "true") router.replace("/login")
    else {
      setChecked(true)
      fetchCampaigns()
    }
  }, [router])

  async function handleCreate(status: string) {
    if (!form.name.trim()) {
      setMsg("❌ Campaign Name is required")
      return
    }
    setCreating(true)
    setMsg("")
    try {
      await createCampaign({
        name: form.name,
        description: form.description,
        template: form.template,
        recipients: Number(form.recipients) || 0,
        status,
        campaignType: form.campaignType,
        account: form.account,
        audience: form.audience,
        scheduledDate: form.scheduledDate,
        scheduledTime: form.scheduledTime,
      })
      setMsg(`✅ Campaign "${form.name}" created as ${status}`)
      setForm({ ...form, name: "", description: "" })
      await fetchCampaigns()
      setActiveTab("campaigns")
    } catch (e: any) {
      setMsg(`❌ ${e.message}`)
    } finally {
      setCreating(false)
    }
  }

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

  const filtered = campaigns.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
  const displayCards = [
    { label: "Total Campaigns", value: String(stats.total || campaigns.length), sub: `${campaigns.length} in table`, color: "" },
    { label: "Running", value: String(stats.running ?? campaigns.filter(c => c.status === "Running").length), sub: "Active now", color: "bg-blue-500" },
    { label: "Scheduled", value: String(stats.scheduled ?? campaigns.filter(c => c.status === "Scheduled").length), sub: "Upcoming", color: "bg-amber-500" },
    { label: "Completed", value: String(stats.completed ?? campaigns.filter(c => c.status === "Completed").length), sub: "Done", color: "bg-green-600" },
    { label: "Failed", value: String(stats.failed ?? campaigns.filter(c => c.status === "Failed").length), sub: "Needs attention", color: "bg-red-500" },
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block"><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem><BreadcrumbPage>Campaigns</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
            <p className="text-sm text-muted-foreground">Manage all active/draft campaigns. Table below shows <b>created campaigns</b> from local MongoDB (Fastify). Create a new one in the Create tab.</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-1">
              <TabsTrigger value="campaigns">Campaigns {campaigns.length ? `(${campaigns.length})` : ""}</TabsTrigger>
              <TabsTrigger value="create">Create</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            {/* 1. Campaigns - DYNAMIC TABLE OF CREATED CAMPAIGNS - using @7ovr/table-1 design */}
            <TabsContent value="campaigns" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-5">
                {displayCards.map(c => (
                  <Card key={c.label}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        {c.color && <span className={`size-2 rounded-full ${c.color}`} />} {c.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{c.value}</div>
                      <p className="text-xs text-muted-foreground">{c.sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {msg && <div className="text-sm px-2">{msg}</div>}

              <AppTable
                data={campaigns.map(c => ({ ...c, id: c._id }))}
                title="Campaigns"
                description="Manage all active/draft campaigns"
                icon={<MegaphoneIcon className="size-4" />}
                searchKey="name"
                searchPlaceholder="Search campaigns..."
                createLabel="Create Campaign"
                onCreate={() => setActiveTab("create")}
                columns={[
                  {
                    id: "select",
                    enableSorting: false,
                    enableHiding: false,
                    header: ({ table }: any) => (
                      <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
                        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                        aria-label="Select all"
                      />
                    ),
                    cell: ({ row }: any) => (
                      <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(v) => row.toggleSelected(!!v)}
                        aria-label={`Select ${row.original.name}`}
                      />
                    ),
                  },
                  {
                    accessorKey: "name",
                    header: ({ column }: any) => (
                      <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-mx-1 inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground">
                        Campaign Name <SortIcon sorted={column.getIsSorted()} />
                      </button>
                    ),
                    cell: ({ row }: any) => <span className="font-medium text-sm">{row.original.name}</span>,
                    filterFn: (row: any, _id: string, value: string) => row.original.name.toLowerCase().includes(value.toLowerCase()),
                  },
                  {
                    accessorKey: "template",
                    header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Template</span>,
                    cell: ({ row }: any) => <span className="font-mono text-xs">{row.original.template}</span>,
                  },
                  {
                    accessorKey: "recipients",
                    header: ({ column }: any) => (
                      <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-mx-1 inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground">
                        Recipients <SortIcon sorted={column.getIsSorted()} />
                      </button>
                    ),
                    cell: ({ row }: any) => <span className="text-sm tabular-nums">{row.original.recipients?.toLocaleString()}</span>,
                  },
                  { accessorKey: "sent", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Sent</span>, cell: ({ row }: any) => <span className="text-sm tabular-nums">{row.original.sent}</span> },
                  { accessorKey: "delivered", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Delivered</span>, cell: ({ row }: any) => <span className="text-sm tabular-nums">{row.original.delivered}</span> },
                  { accessorKey: "read", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Read</span>, cell: ({ row }: any) => <span className="text-sm tabular-nums">{row.original.read}</span> },
                  { accessorKey: "failed", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Failed</span>, cell: ({ row }: any) => <span className="text-sm tabular-nums">{row.original.failed}</span> },
                  {
                    accessorKey: "status",
                    header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Status</span>,
                    cell: ({ row }: any) => <StatusBadge status={row.original.status} />,
                  },
                  {
                    accessorKey: "createdAt",
                    sortFn: "datetime",
                    header: ({ column }: any) => (
                      <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-mx-1 ml-auto inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground">
                        Created <SortIcon sorted={column.getIsSorted()} />
                      </button>
                    ),
                    cell: ({ row }: any) => <span className="block text-right text-xs text-muted-foreground tabular-nums">{new Date(row.original.createdAt).toLocaleDateString()}</span>,
                  },
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
            </TabsContent>

            {/* 2. Create - WIRED TO TABLE */}
            <TabsContent value="create" className="space-y-4 mt-4">
              <Card>
                <CardHeader><CardTitle>Create Campaign</CardTitle><p className="text-sm text-muted-foreground">Create and configure a new WhatsApp campaign — it will appear in the <b>Campaigns</b> table after creation.</p></CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2"><Label>Campaign Name *</Label><Input placeholder="Diwali Offer 2024" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                    <div className="grid gap-2"><Label>WhatsApp Account / QR Connection</Label>
                      <Select value={form.account} onValueChange={(v: any) => setForm({ ...form, account: v ?? "" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="qr1">QR - MyWhatsappMsg +91 98xxxxxx10</SelectItem><SelectItem value="qr2">QR - Sales +91 98xxxxxx11</SelectItem></SelectContent></Select>
                    </div>
                    <div className="grid gap-2 md:col-span-2"><Label>Campaign Description</Label><Textarea placeholder="Description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                    <div className="grid gap-2"><Label>Campaign Type</Label><Select value={form.campaignType} onValueChange={(v: any) => setForm({ ...form, campaignType: v ?? "" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Marketing">Marketing</SelectItem><SelectItem value="Utility">Utility</SelectItem></SelectContent></Select></div>
                    <div className="grid gap-2"><Label>Select Template</Label><Select value={form.template} onValueChange={(v: any) => setForm({ ...form, template: v ?? "" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="diwali_offer_v2">diwali_offer_v2</SelectItem><SelectItem value="welcome_01">welcome_01</SelectItem><SelectItem value="cart_reminder">cart_reminder</SelectItem></SelectContent></Select></div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold">Audience</h3>
                    <div className="grid md:grid-cols-3 gap-4 mt-3">
                      <div className="grid gap-2"><Label>Select Contact List</Label><Select value={form.audience} onValueChange={(v: any) => setForm({ ...form, audience: v ?? "" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="vip">VIP Customers (12,500)</SelectItem><SelectItem value="all">All Contacts</SelectItem></SelectContent></Select></div>
                      <div className="grid gap-2"><Label>Upload Excel / CSV</Label><Input type="file" /></div>
                      <div className="grid gap-2"><Label>Total Recipients</Label><Input value={form.recipients} onChange={e => setForm({ ...form, recipients: e.target.value })} /></div>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold">Scheduling</h3>
                    <div className="grid md:grid-cols-3 gap-4 mt-3">
                      <div className="grid gap-2"><Label>Date</Label><Input type="date" value={form.scheduledDate} onChange={e => setForm({ ...form, scheduledDate: e.target.value })} /></div>
                      <div className="grid gap-2"><Label>Time</Label><Input type="time" value={form.scheduledTime} onChange={e => setForm({ ...form, scheduledTime: e.target.value })} /></div>
                      <div className="grid gap-2"><Label>Timezone</Label><Select value={form.timezone} onValueChange={(v: any) => setForm({ ...form, timezone: v ?? "" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem><SelectItem value="UTC">UTC</SelectItem></SelectContent></Select></div>
                    </div>
                  </div>
                  {msg && <div className="text-sm">{msg}</div>}
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" disabled={creating} onClick={() => handleCreate("Draft")}>{creating ? "..." : "Save Draft"}</Button>
                    <Button variant="outline" disabled={creating} onClick={() => handleCreate("Scheduled")}>{creating ? "..." : "Schedule Campaign"}</Button>
                    <Button disabled={creating} onClick={() => handleCreate("Running")}>{creating ? "Creating..." : "Start Campaign"}</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">This form POSTs to <span className="font-mono">POST /api/campaigns</span> (Fastify + MongoDB) and the new row appears in the Campaigns table instantly.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 3. Scheduled - @7ovr/table-1 */}
            <TabsContent value="scheduled" className="space-y-4 mt-4">
              <AppTable
                data={campaigns.filter(c => c.status === "Scheduled").map(c => ({ ...c, id: c._id, campaign: c.name, template: c.template, recipients: c.recipients, status: c.status, created: new Date(c.createdAt).toLocaleDateString() } as any))}
                title="Scheduled"
                description="Manage campaigns that haven't been executed yet"
                icon={<CalendarIcon className="size-4" />}
                searchKey="campaign"
                searchPlaceholder="Search scheduled..."
                createLabel="Schedule"
                columns={[
                  { id: "select", enableSorting: false, enableHiding: false, header: ({ table }: any) => <Checkbox checked={table.getIsAllPageRowsSelected()} indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" />, cell: ({ row }: any) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label={`Select ${row.original.campaign}`} /> },
                  { accessorKey: "campaign", header: ({ column }: any) => <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-mx-1 inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground">Campaign <SortIcon sorted={column.getIsSorted()} /></button>, cell: ({ row }: any) => <span className="font-medium text-sm">{row.original.campaign}</span> },
                  { accessorKey: "template", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Template</span>, cell: ({ row }: any) => <span className="font-mono text-xs">{row.original.template}</span> },
                  { accessorKey: "recipients", header: ({ column }: any) => <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-mx-1 inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground">Recipients <SortIcon sorted={column.getIsSorted()} /></button>, cell: ({ row }: any) => <span className="text-sm tabular-nums">{row.original.recipients}</span> },
                  { accessorKey: "status", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Status</span>, cell: ({ row }: any) => <StatusBadge status={row.original.status} /> },
                  { accessorKey: "created", header: ({ column }: any) => <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-mx-1 ml-auto inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground">Created <SortIcon sorted={column.getIsSorted()} /></button>, cell: ({ row }: any) => <span className="block text-right text-xs text-muted-foreground tabular-nums">{row.original.created}</span> },
                ] as any}
              />
            </TabsContent>

            {/* 5. Templates - @7ovr/table-1 */}
            <TabsContent value="templates" className="space-y-4 mt-4">
              <AppTable
                data={templates.map(t => ({ ...t, id: t.name }))}
                title="Templates"
                description="Create and manage reusable WhatsApp message templates"
                icon={<MegaphoneIcon className="size-4" />}
                searchKey="name"
                searchPlaceholder="Search templates..."
                createLabel="Create Template"
                columns={[
                  { id: "select", enableSorting: false, enableHiding: false, header: ({ table }: any) => <Checkbox checked={table.getIsAllPageRowsSelected()} indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" />, cell: ({ row }: any) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label={`Select ${row.original.name}`} /> },
                  { accessorKey: "name", header: ({ column }: any) => <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-mx-1 inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground">Template Name <SortIcon sorted={column.getIsSorted()} /></button>, cell: ({ row }: any) => <span className="font-mono text-xs">{row.original.name}</span> },
                  { accessorKey: "category", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Category</span>, cell: ({ row }: any) => <span className="text-sm">{row.original.category}</span> },
                  { accessorKey: "preview", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Preview</span>, cell: ({ row }: any) => <span className="max-w-[200px] truncate text-sm">{row.original.preview}</span> },
                  { accessorKey: "vars", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Vars</span>, cell: ({ row }: any) => <span className="text-sm tabular-nums">{row.original.vars}</span> },
                  { accessorKey: "media", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Media</span>, cell: ({ row }: any) => <span className="text-sm">{row.original.media}</span> },
                  { accessorKey: "status", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Status</span>, cell: ({ row }: any) => <StatusBadge status={row.original.status} /> },
                  { accessorKey: "updated", header: ({ column }: any) => <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-mx-1 ml-auto inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground">Updated <SortIcon sorted={column.getIsSorted()} /></button>, cell: ({ row }: any) => <span className="block text-right text-xs text-muted-foreground tabular-nums">{row.original.updated}</span> },
                ] as any}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle>Create Template</CardTitle></CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid gap-2"><Label>Template Name</Label><Input placeholder="my_template_01" /></div>
                    <div className="grid grid-cols-2 gap-2"><div className="grid gap-2"><Label>Category</Label><Select><SelectTrigger><SelectValue placeholder="Marketing" /></SelectTrigger><SelectContent><SelectItem value="marketing">Marketing</SelectItem><SelectItem value="utility">Utility</SelectItem></SelectContent></Select></div><div className="grid gap-2"><Label>Language</Label><Select><SelectTrigger><SelectValue placeholder="en" /></SelectTrigger><SelectContent><SelectItem value="en">en</SelectItem><SelectItem value="hi">hi</SelectItem></SelectContent></Select></div></div>
                    <div className="grid gap-2"><Label>Header</Label><Select><SelectTrigger><SelectValue placeholder="None" /></SelectTrigger><SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="text">Text</SelectItem><SelectItem value="image">Image</SelectItem><SelectItem value="video">Video</SelectItem><SelectItem value="doc">Document</SelectItem></SelectContent></Select></div>
                    <div className="grid gap-2"><Label>Body</Label><Textarea placeholder="Hi {{name}}, We have a special offer..." /></div>
                    <div className="flex gap-2"><Button variant="secondary" size="sm">Add Variable</Button><Badge>{"{{name}}"} </Badge><Badge>{"{{company}}"}</Badge></div>
                    <div className="grid gap-2"><Label>Footer</Label><Input placeholder="Optional footer" /></div>
                    <div className="grid gap-2"><Label>Buttons</Label><Select><SelectTrigger><SelectValue placeholder="Quick Reply" /></SelectTrigger><SelectContent><SelectItem value="qr">Quick Reply</SelectItem><SelectItem value="web">Website</SelectItem><SelectItem value="call">Call</SelectItem><SelectItem value="none">None</SelectItem></SelectContent></Select></div>
                  </CardContent>
                </Card>
                <Card className="bg-muted">
                  <CardHeader><CardTitle>WhatsApp Preview</CardTitle></CardHeader>
                  <CardContent>
                    <div className="rounded-2xl bg-white p-4 shadow max-w-sm">
                      <p className="text-sm">Hi Aman,</p><p className="text-sm mt-1">We have a special offer for you from MyWhatsappMsg.</p>
                      <div className="mt-3 rounded-lg bg-zinc-100 h-20 flex items-center justify-center text-xs text-muted-foreground">Image / Video preview</div>
                      <p className="text-xs text-muted-foreground mt-2">Optional footer</p>
                      <div className="mt-2 grid gap-1"><Button size="sm" variant="outline" className="w-full">Visit Website</Button><Button size="sm" variant="outline" className="w-full">Quick Reply</Button></div>
                      <p className="text-[10px] text-muted-foreground mt-2 text-right">12:30 PM ✓✓</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

