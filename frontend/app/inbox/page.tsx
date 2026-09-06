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
import { Ellipsis, SendIcon } from "lucide-react"
import { Inbox } from "lucide-react"
import { ChatBubble } from "@/components/ui/whatsapp/chat-bubble"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { sendWhatsappMessage } from "@/lib/api"

type Row = { id: string; name: string; email: string; status: string; created: string }

const sample: Row[] = []

export default function Page() {
  const router = useRouter()
  const [checked, setChecked] = React.useState(false)
  const [chatInput, setChatInput] = React.useState("")
  const [messages, setMessages] = React.useState<{ variant: "incoming" | "outgoing"; text: string; timestamp: string; status?: any }[]>([])
  React.useEffect(() => {
    if (localStorage.getItem("auth") !== "true") router.replace("/login")
    else setChecked(true)
  }, [router])
  async function handleSend() {
    if (!chatInput.trim()) return
    const text = chatInput
    setMessages(prev => [...prev, { variant: "outgoing", text, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), status: "sent" }])
    setChatInput("")
    try {
      await sendWhatsappMessage("+91 98765 43210", text)
      setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, status: "delivered" } : m))
    } catch {}
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
                <BreadcrumbItem><BreadcrumbPage>Inbox</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <AppTable
            data={sample}
            title="Inbox"
            description="WhatsApp inbox • All conversations (wwebjs.dev)"
            icon={<Inbox className="size-4" />}
            searchKey="name"
            searchPlaceholder="Search inbox..."
            createLabel="New Chat"
            columns={[
              { id: "select", enableSorting: false, enableHiding: false, header: ({ table }: any) => <Checkbox checked={table.getIsAllPageRowsSelected()} indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" />, cell: ({ row }: any) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label={`Select ${row.original.name}`} /> },
              { accessorKey: "name", header: ({ column }: any) => <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-mx-1 inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground">Name <SortIcon sorted={column.getIsSorted()} /></button>, cell: ({ row }: any) => <span className="font-medium text-sm">{row.original.name}</span> },
              { accessorKey: "email", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Last Message</span>, cell: ({ row }: any) => <span className="text-sm text-muted-foreground truncate max-w-[280px]">{row.original.email}</span> },
              { accessorKey: "status", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Status</span>, cell: ({ row }: any) => <Badge variant={row.original.status === "Active" ? "default" : row.original.status === "Invited" ? "secondary" : "outline"} className="text-xs">{row.original.status}</Badge> },
              { accessorKey: "created", header: ({ column }: any) => <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-mx-1 ml-auto inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground">Time <SortIcon sorted={column.getIsSorted()} /></button>, cell: ({ row }: any) => <span className="block text-right text-xs text-muted-foreground tabular-nums">{row.original.created}</span> },
              { id: "actions", enableSorting: false, enableHiding: false, header: () => <span className="sr-only">Actions</span>, cell: () => <div className="flex justify-end"><DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}><Ellipsis className="size-4" /></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-40"><DropdownMenuItem>View Chat</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem>Archive</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div> },
            ] as any}
          />
          <Card className="overflow-hidden">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">WhatsApp Chat Preview — chat-bubble.json + wwebjs.dev</CardTitle>
                <Badge variant="secondary" className="text-xs">wwebjs.dev mock • POST /api/whatsapp/send</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Incoming/outgoing bubbles with tails, timestamps, read receipts — from https://ui.meta-cloud-api.site/r/chat-bubble.json</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="wa-wallpaper p-4 space-y-0 min-h-[280px] flex flex-col">
                {messages.length === 0 ? (
                  <p className="m-auto text-sm text-muted-foreground">No messages yet — send a message via WhatsApp to see real conversations here.</p>
                ) : messages.map((m, i) => (
                  <ChatBubble key={i} variant={m.variant} timestamp={m.timestamp} status={m.status as any} showTail={i === messages.length - 1 || messages[i + 1]?.variant !== m.variant}>
                    {m.text}
                  </ChatBubble>
                ))}
              </div>
              <div className="flex gap-2 p-3 border-t bg-wa-compose-bg">
                <Input placeholder="Type a message (sends via wwebjs mock)..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} />
                <Button onClick={handleSend}><SendIcon className="size-4" /> Send</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
