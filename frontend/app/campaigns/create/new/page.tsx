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
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createCampaign } from "@/lib/api"
import { ArrowLeftIcon, PaperclipIcon, UploadIcon, XIcon, FileIcon, ImageIcon, FileTextIcon, ShieldAlertIcon, AlertTriangleIcon } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function NewCampaignPage() {
  const router = useRouter()
  const [checked, setChecked] = React.useState(false)
  const [creating, setCreating] = React.useState(false)
  const [msg, setMsg] = React.useState("")
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
  const [attachments, setAttachments] = React.useState<File[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length) setAttachments(prev => [...prev, ...files])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }
  function removeFile(idx: number) {
    setAttachments(prev => prev.filter((_, i) => i !== idx))
  }
  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  React.useEffect(() => {
    if (localStorage.getItem("auth") !== "true") router.replace("/login")
    else setChecked(true)
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
        attachments: attachments.map(f => ({ name: f.name, size: f.size, type: f.type })),
      })
      setMsg(`✅ Campaign "${form.name}" created as ${status} — redirecting...`)
      setTimeout(() => router.push("/campaigns/create"), 800)
    } catch (e: any) {
      setMsg(`❌ ${e.message}`)
    } finally {
      setCreating(false)
    }
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
                <BreadcrumbItem><BreadcrumbLink href="/campaigns/create">Create</BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>New Campaign</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" render={<Link href="/campaigns/create" />}><ArrowLeftIcon className="size-4" /></Button>
            <div>
              <h1 className="text-2xl font-bold">New Campaign</h1>
              <p className="text-sm text-muted-foreground">Create and configure a new WhatsApp campaign — this is the dedicated form page opened from Create Campaign button.</p>
            </div>
          </div>

          {typeof window !== "undefined" && localStorage.getItem("terms_accepted") !== "true" && (
            <Alert variant="destructive" className="border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100">
              <ShieldAlertIcon className="size-4" />
              <AlertTitle>Terms & Conditions not accepted</AlertTitle>
              <AlertDescription className="text-xs">
                You must accept <Link href="/terms" className="underline font-medium">Terms & Conditions</Link> (WhatsApp Business Terms • https://www.whatsapp.com/legal/business-terms/ • Cloud API https://developers.facebook.com/docs/whatsapp/cloud-api/) before sending. Campaigns may be blocked until accepted. <Link href="/terms" className="underline">Accept now</Link>
              </AlertDescription>
            </Alert>
          )}

          <Alert className="border-blue-200 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100">
            <AlertTriangleIcon className="size-4" />
            <AlertTitle>WhatsApp Compliance Alert</AlertTitle>
            <AlertDescription className="text-xs">
              Only send to opted-in contacts, use approved templates (see <Link href="/template-approval" className="underline">Template Approval</Link>), respect 24-hour window — violates <a href="https://www.whatsapp.com/legal/business-terms/?utm_source=chatgpt.com" target="_blank" className="underline">Business Terms</a> and <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/?utm_source=chatgpt.com" target="_blank" className="underline">Cloud API</a> may cause ban. Chat bubbles: <span className="font-mono">npx shadcn add https://ui.meta-cloud-api.site/r/chat-bubble.json</span> already integrated.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader><CardTitle>Campaign Details</CardTitle></CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2"><Label>Campaign Name *</Label><Input placeholder="Diwali Offer 2024" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid gap-2"><Label>WhatsApp Account / QR Connection</Label><Select value={form.account} onValueChange={(v: any) => setForm({ ...form, account: v ?? "" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="qr1">QR - MyWhatsappMsg +91 98xxxxxx10</SelectItem><SelectItem value="qr2">QR - Sales +91 98xxxxxx11</SelectItem></SelectContent></Select></div>
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
                <div className="flex gap-4 mt-3 text-sm"><label className="flex items-center gap-2"><input type="checkbox" /> Remove Duplicates</label><label className="flex items-center gap-2"><input type="checkbox" /> Exclude Previously Contacted</label></div>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold">Message</h3>
                <div className="grid md:grid-cols-2 gap-4 mt-3">
                  <div className="grid gap-2"><Label>Message Content</Label><Textarea defaultValue="Hi {{name}}, We have a special offer for you from {{company}}. Call {{phone}}" rows={3} /></div>
                  <div className="flex gap-2 items-start pt-6"><Badge variant="secondary">{"{{name}}"}</Badge><Badge variant="secondary">{"{{company}}"}</Badge><Badge variant="secondary">{"{{phone}}"}</Badge></div>
                  <div className="rounded-lg border bg-muted p-3 text-sm md:col-span-2"><p className="font-medium">Preview</p><p className="mt-1">Hi Aman, We have a special offer for you from MyWhatsappMsg. Call +91 98xxxxxx10</p></div>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold flex items-center gap-2"><PaperclipIcon className="size-4" /> File Attachment</h3>
                <p className="text-xs text-muted-foreground mt-1">Attach files to send with this campaign (images, PDFs, documents). Files are uploaded with the campaign.</p>
                <div
                  className="mt-3 rounded-xl border-2 border-dashed bg-muted/20 p-6 text-center cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("bg-muted/40") }}
                  onDragLeave={(e) => e.currentTarget.classList.remove("bg-muted/40")}
                  onDrop={(e) => {
                    e.preventDefault();
                    const files = Array.from(e.dataTransfer.files || [])
                    if (files.length) setAttachments(prev => [...prev, ...files])
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-3">
                      <UploadIcon className="size-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium">Drag & drop files here or click to browse</p>
                    <p className="text-xs text-muted-foreground">Supports: JPG, PNG, PDF, DOCX, XLSX, MP4, MP3 up to 16MB each</p>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}>
                      <PaperclipIcon className="size-4" /> Browse Files
                    </Button>
                  </div>
                  <Input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.mp4,.mp3" className="hidden" onChange={handleFiles} />
                </div>

                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">{attachments.length} file{attachments.length > 1 ? "s" : ""} attached</p>
                    <div className="grid gap-2">
                      {attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                          <div className="flex size-8 items-center justify-center rounded bg-muted">
                            {file.type.startsWith("image/") ? <ImageIcon className="size-4" /> : file.type.includes("pdf") ? <FileTextIcon className="size-4" /> : <FileIcon className="size-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatSize(file.size)} • {file.type || "unknown"}</p>
                          </div>
                          <Button variant="ghost" size="icon-sm" onClick={() => removeFile(idx)}><XIcon className="size-4" /></Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
              <Separator />
              <div>
                <h3 className="font-semibold">Advanced Settings</h3>
                <div className="grid md:grid-cols-2 gap-4 mt-3">
                  <div className="grid gap-2"><Label>Message delay (sec)</Label><Input value={form.delay} onChange={e => setForm({ ...form, delay: e.target.value })} /></div>
                  <div className="grid gap-2"><Label>Messages per minute</Label><Input value={form.perMinute} onChange={e => setForm({ ...form, perMinute: e.target.value })} /></div>
                </div>
              </div>
              {msg && <div className="text-sm">{msg}</div>}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" render={<Link href="/campaigns/create" />}>Cancel</Button>
                <Button variant="outline" disabled={creating} onClick={() => handleCreate("Draft")}>{creating ? "..." : "Save Draft"}</Button>
                <Button variant="outline" disabled={creating} onClick={() => handleCreate("Scheduled")}>{creating ? "..." : "Schedule Campaign"}</Button>
                <Button disabled={creating} onClick={() => handleCreate("Running")}>{creating ? "Creating..." : "Start Campaign"}</Button>
              </div>
              <p className="text-xs text-muted-foreground">POST to <span className="font-mono">/api/campaigns</span> (Fastify + MongoDB local). After creation you will be redirected to <span className="font-mono">/campaigns/create</span> table.</p>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
