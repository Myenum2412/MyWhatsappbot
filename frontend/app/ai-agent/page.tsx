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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Ellipsis, BotIcon, SparklesIcon, SendIcon } from "lucide-react"

type AgentRow = { id: string; name: string; model: string; status: "Active" | "Draft" | "Training"; updated: string }

const initialAgents: AgentRow[] = []

export default function Page() {
  const router = useRouter()
  const [checked, setChecked] = React.useState(false)
  const [agents, setAgents] = React.useState<AgentRow[]>(initialAgents)
  const [showCreate, setShowCreate] = React.useState(false)
  const [newAgent, setNewAgent] = React.useState({ name: "", model: "GPT-4o", prompt: "" })
  const [chatInput, setChatInput] = React.useState("")
  const [messages, setMessages] = React.useState<{ role: "user" | "assistant"; text: string }[]>([])

  React.useEffect(() => {
    if (localStorage.getItem("auth") !== "true") router.replace("/login")
    else setChecked(true)
  }, [router])

  function handleCreate() {
    if (!newAgent.name.trim()) return
    setAgents(prev => [...prev, { id: Date.now().toString(), name: newAgent.name, model: newAgent.model, status: "Draft", updated: new Date().toISOString().slice(0, 10) }])
    setNewAgent({ name: "", model: "GPT-4o", prompt: "" })
    setShowCreate(false)
  }

  function handleSend() {
    if (!chatInput.trim()) return
    const text = chatInput
    setMessages(prev => [...prev, { role: "user", text }, { role: "assistant", text: `Echo (${agents[0]?.model || "GPT-4o"}): You said "${text}" â€” this is a demo AI Agent response from MyWhatsappMsg.` }])
    setChatInput("")
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
                <BreadcrumbItem><BreadcrumbPage>Ai Agent</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><BotIcon className="size-6" /> Ai Agent</h1>
            <p className="text-sm text-muted-foreground">Manage your AI agents, test them in the playground, and deploy to WhatsApp.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Table */}
            <div className="lg:col-span-2">
              <AppTable
                data={agents}
                title="Ai Agents"
                description={`${agents.length} agents â€¢ Active / Draft / Training`}
                icon={<BotIcon className="size-4" />}
                searchKey="name"
                searchPlaceholder="Search agents..."
                createLabel="Create Agent"
                onCreate={() => setShowCreate(true)}
                columns={[
                  { id: "select", enableSorting: false, enableHiding: false, header: ({ table }: any) => <Checkbox checked={table.getIsAllPageRowsSelected()} indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" />, cell: ({ row }: any) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label={`Select ${row.original.name}`} /> },
                  { accessorKey: "name", header: ({ column }: any) => <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-mx-1 inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground">Agent <SortIcon sorted={column.getIsSorted()} /></button>, cell: ({ row }: any) => <span className="font-medium text-sm flex items-center gap-2"><BotIcon className="size-3.5 text-muted-foreground" />{row.original.name}</span> },
                  { accessorKey: "model", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Model</span>, cell: ({ row }: any) => <Badge variant="secondary" className="text-xs">{row.original.model}</Badge> },
                  { accessorKey: "status", header: () => <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Status</span>, cell: ({ row }: any) => <Badge variant={row.original.status === "Active" ? "default" : row.original.status === "Training" ? "secondary" : "outline"} className={row.original.status === "Active" ? "bg-green-100 text-green-700 border-green-200" : row.original.status === "Training" ? "bg-amber-100 text-amber-700 border-amber-200" : ""}>{row.original.status}</Badge> },
                  { accessorKey: "updated", header: ({ column }: any) => <button type="button" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-mx-1 ml-auto inline-flex items-center gap-1 rounded-md px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground">Updated <SortIcon sorted={column.getIsSorted()} /></button>, cell: ({ row }: any) => <span className="block text-right text-xs text-muted-foreground tabular-nums">{row.original.updated}</span> },
                  { id: "actions", enableSorting: false, enableHiding: false, header: () => <span className="sr-only">Actions</span>, cell: ({ row }: any) => <div className="flex justify-end"><DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}><Ellipsis className="size-4" /></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-36"><DropdownMenuItem>Edit</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={() => setAgents(prev => prev.filter(a => a.id !== row.original.id))}>Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div> },
                ] as any}
              />
            </div>

            {/* Create form */}
            {showCreate && (
              <Card className="animate-in fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between"><span className="flex items-center gap-2"><SparklesIcon className="size-4" /> Create Ai Agent</span><Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Close</Button></CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2"><Label>Agent Name</Label><Input placeholder="Support Agent" value={newAgent.name} onChange={e => setNewAgent({ ...newAgent, name: e.target.value })} /></div>
                  <div className="grid gap-2"><Label>Model</Label><Input placeholder="GPT-4o" value={newAgent.model} onChange={e => setNewAgent({ ...newAgent, model: e.target.value })} /></div>
                  <div className="grid gap-2"><Label>System Prompt</Label><Textarea placeholder="You are a helpful WhatsApp assistant for MyWhatsappMsg..." value={newAgent.prompt} onChange={e => setNewAgent({ ...newAgent, prompt: e.target.value })} /></div>
                  <Button onClick={handleCreate} disabled={!newAgent.name.trim()}>Create Agent</Button>
                </CardContent>
              </Card>
            )}

            {/* Playground */}
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><BotIcon className="size-4" /> Playground</CardTitle><p className="text-sm text-muted-foreground">Test your AI Agent â€” chat here, deploy to WhatsApp via Automation â†’ Chatbot.</p></CardHeader>
              <CardContent className="grid gap-4">
                <div className="h-64 overflow-auto rounded-lg border bg-muted/20 p-3 space-y-2">
                  {messages.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No messages yet — start a conversation to test the agent.</p> : messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border"}`}>{m.text}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Type a message..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} />
                  <Button onClick={handleSend}><SendIcon className="size-4" /> Send</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Deploy</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>Connect your Ai Agent to WhatsApp:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Go to <span className="font-mono">Automation â†’ Chatbot</span></li>
                  <li>Select agent and assign to WhatsApp number</li>
                  <li>Enable auto-replies</li>
                </ul>
                <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>Create New Agent</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

