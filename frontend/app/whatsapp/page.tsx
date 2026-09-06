"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { AppTable, SortIcon } from "@/components/blocks/app-table"
import { QrCode, PlusIcon, SmartphoneIcon, RefreshCwIcon, ShieldAlertIcon, AlertTriangleIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Ellipsis } from "lucide-react"
import { ChatBubble } from "@/components/ui/whatsapp/chat-bubble"
import { getWhatsappQR, refreshWhatsappQR, getWhatsappStatus } from "@/lib/api"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

type WhatsappRow = { id: string; sno: number; name: string; number: string; status: "Connected" | "Disconnected" }

const initialData: WhatsappRow[] = []

export default function Page() {
  const router = useRouter()
  const [checked, setChecked] = React.useState(false)
  const [rows, setRows] = React.useState<WhatsappRow[]>(initialData)
  const [showForm, setShowForm] = React.useState(false)
  const [name, setName] = React.useState("")
  const [number, setNumber] = React.useState("")
  const [qrKey, setQrKey] = React.useState(0)
  const [qrData, setQrData] = React.useState<string | null>(null)
  const [waStatus, setWaStatus] = React.useState<string>("disconnected")
  const [waMode, setWaMode] = React.useState<string>("")

  async function fetchQR() {
    try {
      const res = await getWhatsappQR()
      setQrData(res.qr)
      setWaStatus(res.status)
      setWaMode(res.mode || "")
    } catch {}
  }
  async function fetchStatus() {
    try {
      const res = await getWhatsappStatus()
      setWaStatus(res.status)
      setWaMode(res.mode || "")
    } catch {}
  }
  React.useEffect(() => {
    if (localStorage.getItem("auth") !== "true") router.replace("/login")
    else {
      setChecked(true)
      fetchQR()
      fetchStatus()
      const id = setInterval(fetchStatus, 3000)
      return () => clearInterval(id)
    }
  }, [router])

  function handleCreate() {
    if (!name.trim() || !number.trim()) return
    const newRow: WhatsappRow = {
      id: Date.now().toString(),
      sno: rows.length + 1,
      name: name.trim(),
      number: number.trim(),
      status: "Connected",
    }
    setRows(prev => [...prev, newRow])
    setName("")
    setNumber("")
    setShowForm(false)
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
                <BreadcrumbItem><BreadcrumbPage>WhatsApp Accounts</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">WhatsApp Accounts</h1>
            <p className="text-sm text-muted-foreground">S.no, Name, WhatsApp Number, Status — click Create to open form with Name + QR.</p>
          </div>

          {typeof window !== "undefined" && localStorage.getItem("terms_accepted") !== "true" && (
            <Alert variant="destructive" className="border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100">
              <ShieldAlertIcon className="size-4" />
              <AlertTitle>Terms not accepted — WhatsApp Business compliance required</AlertTitle>
              <AlertDescription className="text-xs">You must accept <Link href="/terms" className="underline">Terms & Conditions</Link> (https://www.whatsapp.com/legal/business-terms/ • https://developers.facebook.com/docs/whatsapp/cloud-api/) before connecting numbers. <Link href="/terms" className="underline font-medium">Accept now</Link></AlertDescription>
            </Alert>
          )}
          <Alert className="border-blue-200 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100">
            <AlertTriangleIcon className="size-4" />
            <AlertTitle>Compliance Alert — WhatsApp Business Terms</AlertTitle>
            <AlertDescription className="text-xs">Only connect numbers you own, ensure opt-in for contacts, use Cloud API template approval. Violations may lead to ban per <a href="https://www.whatsapp.com/legal/business-terms/?utm_source=chatgpt.com" target="_blank" className="underline">Business Terms</a>. QR via <span className="font-mono">wwebjs.dev</span> + chat bubbles via <span className="font-mono">chat-bubble.json</span></AlertDescription>
          </Alert>

          <AppTable
            data={rows}
            title="WhatsApp Numbers"
            description={`${rows.length} numbers • Connected / Disconnected`}
            icon={<SmartphoneIcon className="size-4" />}
            searchKey="name"
            searchPlaceholder="Search by name or number..."
            createLabel="Create Number"
            onCreate={() => setShowForm(true)}
            columns={[
              { accessorKey: "sno", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">S.no</span>, cell: ({ row }: any) => <span className="text-sm tabular-nums">{row.original.sno}</span> },
              { accessorKey: "name", header: ({ column }: any) => <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-mx-1 inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground">Name <SortIcon sorted={column.getIsSorted()} /></button>, cell: ({ row }: any) => <span className="font-medium text-sm">{row.original.name}</span> },
              { accessorKey: "number", header: ({ column }: any) => <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-mx-1 inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground">WhatsApp Number <SortIcon sorted={column.getIsSorted()} /></button>, cell: ({ row }: any) => <span className="font-mono text-sm">{row.original.number}</span> },
              {
                accessorKey: "status",
                header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Status</span>,
                cell: ({ row }: any) => <Badge variant={row.original.status === "Connected" ? "default" : "outline"} className={row.original.status === "Connected" ? "bg-green-100 text-green-700 border-green-200" : "bg-zinc-100 text-zinc-700"}>{row.original.status}</Badge>,
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
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem onClick={() => setRows(prev => prev.map(r => r.id === row.original.id ? { ...r, status: r.status === "Connected" ? "Disconnected" : "Connected" } as WhatsappRow : r))}>
                          {row.original.status === "Connected" ? "Disconnect" : "Connect"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setRows(prev => prev.filter(r => r.id !== row.original.id).map((r, i) => ({ ...r, sno: i + 1 })))}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ),
              },
            ] as any}
          />

          {showForm && (
            <Card className="max-w-xl animate-in fade-in">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>New WhatsApp Account</span>
                  <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Close</Button>
                </CardTitle>
                <p className="text-sm text-muted-foreground">This form appears when you click the Create button above. Enter Name and scan QR.</p>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="MyWhatsappMsg Primary" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="number">WhatsApp Number</Label>
                  <Input id="number" placeholder="+91 98765 43210" value={number} onChange={e => setNumber(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>QR Code — wwebjs.dev {waMode && <span className="text-xs text-muted-foreground">({waMode})</span>}</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant={waStatus === "connected" ? "default" : waStatus === "qr" ? "secondary" : "outline"} className={waStatus === "connected" ? "bg-green-100 text-green-700 border-green-200" : waStatus === "qr" ? "bg-amber-100 text-amber-700 border-amber-200" : ""}>{waStatus}</Badge>
                    <span className="text-xs text-muted-foreground">via https://wwebjs.dev {waStatus === "connected" ? "• Auto-connected (mock)" : ""}</span>
                  </div>
                  <div key={qrKey} className="flex flex-col items-center gap-4 rounded-xl border bg-muted/20 p-6">
                    {qrData ? (
                      <img src={qrData} alt="WhatsApp QR" className="size-56 rounded-xl border bg-white p-2" />
                    ) : (
                      <div className="size-56 rounded-xl border-2 border-dashed bg-white flex flex-col items-center justify-center gap-2">
                        <QrCode className="size-12 text-muted-foreground" />
                        <p className="text-sm font-medium">QR Code</p>
                        <p className="text-xs text-muted-foreground text-center px-4">Scan to connect {name ? `“${name}”` : ""} {number ? `(${number})` : ""}</p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground text-center">Open WhatsApp → Settings → Linked Devices → Link a Device → Scan QR</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={async () => { const r = await refreshWhatsappQR(); setQrData(r.qr); setWaStatus(r.status); setQrKey(k => k + 1) }}><RefreshCwIcon className="size-4" /> Refresh QR (wwebjs)</Button>
                      <Button variant="outline" size="sm" onClick={fetchQR}>Check Status</Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Backend: GET /api/whatsapp/qr • POST /api/whatsapp/qr/refresh • wwebjs.dev mock QR generated via qrcode</p>
                  </div>
                  {/* Chat bubble preview using https://ui.meta-cloud-api.site/r/chat-bubble.json */}
                  <div className="rounded-xl border bg-wa-bg p-3 wa-wallpaper">
                    <p className="text-xs font-medium mb-2">Chat Bubble Preview (chat-bubble.json)</p>
                    <div className="space-y-1">
                      <ChatBubble variant="incoming" timestamp="10:30" showTail sender="Aman" isGroupChat={false}>Hi {name || "there"}, welcome to MyWhatsappMsg!</ChatBubble>
                      <ChatBubble variant="outgoing" timestamp="10:31" status="read" showTail>Thanks! QR for {number || "+91 98xxxxxx10"} looks good ✓</ChatBubble>
                      <ChatBubble variant="incoming" timestamp="10:32" showTail>Great! Your status is {waStatus}.</ChatBubble>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" disabled={!name.trim() || !number.trim()} onClick={handleCreate}><PlusIcon className="size-4" /> Connect</Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

