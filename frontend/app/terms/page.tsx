"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShieldCheckIcon, FileTextIcon, AlertTriangleIcon, ExternalLinkIcon } from "lucide-react"
import Link from "next/link"

export default function Page() {
  const router = useRouter()
  const [checked, setChecked] = React.useState(false)
  const [accepted, setAccepted] = React.useState(false)

  React.useEffect(() => {
    if (localStorage.getItem("auth") !== "true") router.replace("/login")
    else {
      setChecked(true)
      setAccepted(localStorage.getItem("terms_accepted") === "true")
    }
  }, [router])

  function handleAccept() {
    localStorage.setItem("terms_accepted", "true")
    setAccepted(true)
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
                <BreadcrumbItem><BreadcrumbPage>Terms & Conditions</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 pt-0 max-w-4xl">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><ShieldCheckIcon className="size-6" /> Terms & Conditions — MyWhatsappMsg</h1>
            <p className="text-sm text-muted-foreground mt-1">Compliance with WhatsApp Business Terms, Meta Cloud API, and project-specific conditions. Alerts are enforced across the app.</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-xs">Version 1.0 • Effective 2024-11-19</Badge>
              {accepted ? <Badge className="bg-green-100 text-green-700 border-green-200">Accepted</Badge> : <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">Not Accepted</Badge>}
            </div>
          </div>

          {!accepted && (
            <Alert variant="destructive" className="border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100">
              <AlertTriangleIcon className="size-4" />
              <AlertTitle>Action Required — Accept Terms to continue WhatsApp Marketing</AlertTitle>
              <AlertDescription className="mt-2">
                You must accept MyWhatsappMsg Terms and WhatsApp Business Terms before creating campaigns or sending messages. Your account may be restricted until accepted.
                <div className="mt-3">
                  <Button size="sm" onClick={handleAccept}>I Accept Terms & Conditions</Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <FileTextIcon className="size-4" />
            <AlertTitle>WhatsApp Business Terms — https://www.whatsapp.com/legal/business-terms/</AlertTitle>
            <AlertDescription className="text-xs leading-relaxed">
              By using MyWhatsappMsg you agree to WhatsApp Business Terms: you will only message users who have <b>opted-in</b>, you will not spam, you will use <b>approved message templates</b> for business-initiated messages, you will respect <b>24-hour window</b> for replies, and you understand that violations may lead to <b>number ban, rate limiting, or account suspension</b> per Meta. See full terms at WhatsApp Business Terms link below.
              <div className="mt-2">
                <Button variant="outline" size="sm" render={<a href="https://www.whatsapp.com/legal/business-terms/?utm_source=chatgpt.com" target="_blank" rel="noopener" />}><ExternalLinkIcon className="size-3.5" /> View Business Terms</Button>
              </div>
            </AlertDescription>
          </Alert>

          <Alert>
            <ShieldCheckIcon className="size-4" />
            <AlertTitle>Meta WhatsApp Docs — https://developers.facebook.com/docs/whatsapp/</AlertTitle>
            <AlertDescription className="text-xs leading-relaxed">
              All API usage must comply with Meta WhatsApp documentation: Business verification, display name guidelines, quality rating, messaging limits, and webhook handling. MyWhatsappMsg implements these via Cloud API and wwebjs.dev (https://wwebjs.dev) for session management.
              <div className="mt-2 flex gap-2">
                <Button variant="outline" size="sm" render={<a href="https://developers.facebook.com/docs/whatsapp/?utm_source=chatgpt.com" target="_blank" rel="noopener" />}><ExternalLinkIcon className="size-3.5" /> WhatsApp Docs</Button>
                <Button variant="outline" size="sm" render={<a href="https://developers.facebook.com/docs/whatsapp/cloud-api/?utm_source=chatgpt.com" target="_blank" rel="noopener" />}><ExternalLinkIcon className="size-3.5" /> Cloud API Docs</Button>
              </div>
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertTriangleIcon className="size-4" />
            <AlertTitle>Cloud API — https://developers.facebook.com/docs/whatsapp/cloud-api/ + wwebjs.dev</AlertTitle>
            <AlertDescription className="text-xs leading-relaxed">
              MyWhatsappMsg uses <b>Cloud API</b> for business messaging and <b>wwebjs.dev</b> (whatsapp-web.js via Puppeteer) for QR/session. Cloud API requires <b>template approval</b> before sending, <b>opt-in consent</b>, and <b>rate limits</b> (tiered). Chat bubbles use <span className="font-mono">https://ui.meta-cloud-api.site/r/chat-bubble.json</span>. Violating Cloud API policies triggers <b>alerts</b> in Campaigns, Inbox, and WhatsApp pages.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader><CardTitle>MyWhatsappMsg Project Terms</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed">
              <div>
                <h3 className="font-semibold">1. Acceptance</h3>
                <p className="text-muted-foreground">By accessing MyWhatsappMsg (login: myenumam@gmail.com), you accept these terms, WhatsApp Business Terms, and Meta Cloud API terms. All 3 links above are binding.</p>
              </div>
              <div>
                <h3 className="font-semibold">2. Consent & Opt-in</h3>
                <p className="text-muted-foreground">You must have explicit opt-in for every contact before sending marketing messages. Importing contacts without consent is prohibited and will trigger an alert and may block sending.</p>
              </div>
              <div>
                <h3 className="font-semibold">3. Templates & Approval</h3>
                <p className="text-muted-foreground">All business-initiated messages must use approved templates (see <Link href="/campaigns/templates" className="underline">Templates</Link> and <Link href="/template-approval" className="underline">Template Approval</Link>). Unapproved templates will be rejected and alert shown.</p>
              </div>
              <div>
                <h3 className="font-semibold">4. Rate Limits & Quality</h3>
                <p className="text-muted-foreground">Meta enforces quality rating and messaging tiers. If your quality drops or you exceed limits, campaigns will be paused and an alert will appear in Analytics and Campaigns.</p>
              </div>
              <div>
                <h3 className="font-semibold">5. Data & Privacy</h3>
                <p className="text-muted-foreground">All data is stored in local MongoDB (mongodb://localhost:27017/myapp or in-memory fallback). You are responsible for GDPR/consent compliance. MyWhatsappMsg does not share data with Meta except via Cloud API.</p>
              </div>
              <div>
                <h3 className="font-semibold">6. Alerts</h3>
                <p className="text-muted-foreground">Alerts are enforced: <b>Terms not accepted</b> (this page), <b>Template not approved</b> (in Create Campaign), <b>Missing opt-in</b> (in Contacts import), <b>Rate limit</b> (in Scheduled), <b>QR not connected</b> (in WhatsApp). All alerts are visible in Inbox and WhatsApp pages.</p>
              </div>
              <div>
                <h3 className="font-semibold">7. Chat Bubbles</h3>
                <p className="text-muted-foreground">Chat UI uses <span className="font-mono">https://ui.meta-cloud-api.site/r/chat-bubble.json</span> (WhatsApp-style bubbles with tails, timestamps, read receipts, reactions) — already added via <span className="font-mono">npx shadcn@latest add https://ui.meta-cloud-api.site/r/chat-bubble.json</span></p>
              </div>
              <div className="flex gap-2 pt-2">
                {!accepted ? <Button onClick={handleAccept}>Accept & Continue</Button> : <Button variant="outline" disabled>Accepted ✓</Button>}
                <Button variant="outline" render={<Link href="/campaigns/create/new" />}>Go to Create Campaign</Button>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">References: <a href="https://www.whatsapp.com/legal/business-terms/?utm_source=chatgpt.com" target="_blank" className="underline">Business Terms</a> • <a href="https://developers.facebook.com/docs/whatsapp/?utm_source=chatgpt.com" target="_blank" className="underline">WhatsApp Docs</a> • <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/?utm_source=chatgpt.com" target="_blank" className="underline">Cloud API</a> • <a href="https://wwebjs.dev" target="_blank" className="underline">wwebjs.dev</a> • <a href="https://ui.meta-cloud-api.site/r/chat-bubble.json" target="_blank" className="underline">chat-bubble.json</a></p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
