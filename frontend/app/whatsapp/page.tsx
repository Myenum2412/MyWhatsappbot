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
import { Badge } from "@/components/ui/badge"
import { AppTable, SortIcon } from "@/components/blocks/app-table"
import { QrCode, SmartphoneIcon, RefreshCwIcon, ShieldAlertIcon, AlertTriangleIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Ellipsis } from "lucide-react"
import { getWhatsappQR, refreshWhatsappQR, getWhatsappStatus, getWhatsappAccounts, createWhatsappAccount, updateWhatsappAccount, deleteWhatsappAccount, API_URL } from "@/lib/api"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"

type WhatsappRow = { id: string; sno: number; name: string; number: string; status: "Connected" | "Disconnected" }

export default function Page() {
  const router = useRouter()
  const [checked, setChecked] = React.useState(false)
  const [rows, setRows] = React.useState<WhatsappRow[]>([])
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [number, setNumber] = React.useState("")
  const [qrKey, setQrKey] = React.useState(0)
  const [qrData, setQrData] = React.useState<string | null>(null)
  const [waStatus, setWaStatus] = React.useState<string>("disconnected")
  const [waMode, setWaMode] = React.useState<string>("")
  const [qrError, setQrError] = React.useState<string>("")

  async function fetchQR() {
    try {
      setQrError("")
      const res = await getWhatsappQR()
      if (!res.qr) setQrError(`No QR yet (status: ${res.status})`)
      setQrData(res.qr)
      setWaStatus(res.status)
      setWaMode(res.mode || "")
    } catch (e: any) { setQrError(e.message || "Failed to fetch QR") }
  }
  async function fetchStatus() {
    try {
      const res = await getWhatsappStatus()
      setWaStatus(res.status)
      setWaMode(res.mode || "")
    } catch {}
  }
  async function fetchAccounts() {
    try {
      const data = await getWhatsappAccounts()
      setRows(data.map((a: any, i: number) => ({ id: a._id, sno: i + 1, name: a.name, number: a.number, status: a.status })))
    } catch {}
  }

  React.useEffect(() => {
    if (localStorage.getItem("auth") !== "true") router.replace("/login")
    else {
      setChecked(true)
      fetchQR()
      fetchStatus()
      fetchAccounts()
      const id = setInterval(fetchStatus, 3000)
      return () => clearInterval(id)
    }
  }, [router])

  // fetch fresh QR each time dialog opens
  async function handleOpen() {
    setOpen(true)
    setName("")
    setNumber("")
    const r = await refreshWhatsappQR().catch(() => null)
    if (r?.qr) { setQrData(r.qr); setWaStatus(r.status) } else fetchQR()
    setQrKey(k => k + 1)
  }

  async function handleConnect() {
    if (!name.trim() || !number.trim()) return
    const isConnected = waStatus === "connected"
    try {
      await createWhatsappAccount({ name: name.trim(), number: number.trim(), status: isConnected ? "Connected" : "Disconnected" })
      await fetchAccounts()
    } catch (e: any) { alert(e.message) }
    setOpen(false)
    setName("")
    setNumber("")
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
            <p className="text-sm text-muted-foreground">Connect WhatsApp numbers — each gets a fresh QR code and appears in the table automatically.</p>
          </div>

          {typeof window !== "undefined" && localStorage.getItem("terms_accepted") !== "true" && (
            <Alert variant="destructive" className="border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100">
              <ShieldAlertIcon className="size-4" />
              <AlertTitle>Terms not accepted — WhatsApp Business compliance required</AlertTitle>
              <AlertDescription className="text-xs">You must accept <Link href="/terms" className="underline">Terms & Conditions</Link> before connecting numbers. <Link href="/terms" className="underline font-medium">Accept now</Link></AlertDescription>
            </Alert>
          )}
          <Alert className="border-blue-200 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100">
            <AlertTriangleIcon className="size-4" />
            <AlertTitle>Compliance Alert — WhatsApp Business Terms</AlertTitle>
            <AlertDescription className="text-xs">Only connect numbers you own, ensure opt-in for contacts, use approved templates. <a href="https://www.whatsapp.com/legal/business-terms/?utm_source=chatgpt.com" target="_blank" className="underline">Business Terms</a>. QR via <span className="font-mono">wwebjs.dev</span></AlertDescription>
          </Alert>

          <AppTable
            data={rows}
            title="WhatsApp Numbers"
            description={`${rows.length} numbers • Connected / Disconnected`}
            icon={<SmartphoneIcon className="size-4" />}
            searchKey="name"
            searchPlaceholder="Search by name or number..."
            createLabel="Connect WhatsApp"
            onCreate={handleOpen}
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
                        <DropdownMenuItem onClick={async () => { const cur = row.original.status; await updateWhatsappAccount(row.original.id, { status: cur === "Connected" ? "Disconnected" : "Connected" }); fetchAccounts() }}>
                          {row.original.status === "Connected" ? "Disconnect" : "Connect"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={async () => { await deleteWhatsappAccount(row.original.id); fetchAccounts() }}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ),
              },
            ] as any}
          />

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Connect WhatsApp</DialogTitle>
                <DialogDescription>Enter name and number, then scan the QR code. A new QR is generated each time. Added automatically to the table.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="wa-name">Name</Label>
                  <Input id="wa-name" placeholder="MyWhatsappMsg Primary" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="wa-number">WhatsApp Number</Label>
                  <Input id="wa-number" placeholder="+91 98765 43210" value={number} onChange={e => setNumber(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>QR Code {waMode && <span className="text-xs text-muted-foreground">({waMode})</span>}</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant={waStatus === "connected" ? "default" : waStatus === "qr" ? "secondary" : "outline"} className={waStatus === "connected" ? "bg-green-100 text-green-700 border-green-200" : waStatus === "qr" ? "bg-amber-100 text-amber-700 border-amber-200" : ""}>{waStatus}</Badge>
                    <span className="text-xs text-muted-foreground">via wwebjs.dev</span>
                  </div>
                  <div key={qrKey} className="flex flex-col items-center gap-3 rounded-xl border bg-muted/20 p-4">
                    {qrData ? (
                      <img src={qrData} alt="WhatsApp QR" className="size-56 rounded-xl border bg-white p-2" />
                    ) : (
                      <div className="size-56 rounded-xl border-2 border-dashed bg-white flex flex-col items-center justify-center gap-2">
                        <QrCode className="size-12 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground text-center px-4">{qrError || "Loading QR..."}</p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground text-center">WhatsApp → Settings → Linked Devices → Link a Device → Scan QR</p>
                    <Button variant="outline" size="sm" onClick={async () => { const r = await refreshWhatsappQR(); setQrData(r.qr); setWaStatus(r.status); setQrKey(k => k + 1) }}><RefreshCwIcon className="size-4" /> Refresh QR</Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button disabled={!name.trim() || !number.trim()} onClick={handleConnect}>Connect</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
