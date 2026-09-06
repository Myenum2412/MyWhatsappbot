# MyWhatsappMsg — WhatsApp Marketing Platform

Full-stack **WhatsApp Marketing & Automation** platform built with **Next.js 16 (App Router)**, **Fastify 5**, **MongoDB (Mongoose)**, **whatsapp-web.js (wwebjs.dev)** and **shadcn/ui + chat-bubble**.

> **Live Demo Auth:** `myenumam@gmail.com` / `@Meenu2412` → `/login` → `/dashboard` (sidebar-07, MyWhatsappMsg)

## ✨ Features

- **Auth** — `login-05` (shadcn) → hardcoded `myenumam@gmail.com / @Meenu2412` → `sidebar-07` dashboard, `localStorage` guard, logout
- **Branding** — `MyWhatsappMsg` everywhere (Acme Inc removed), **Roboto** via `@import` + `--font-sans: "Roboto"`, `TooltipProvider`
- **Campaigns Hub** (`/campaigns`) — tabbed **Campaigns / Create / Scheduled / Templates** + `POST /api/campaigns` (MongoDB)  
  - **Campaigns Table** `@7ovr/table-1` (12 cols: Name, Template, Recipients, Sent/Delivered/Read/Failed, Status, Created, Actions Duplicate/Delete) + status cards (Total/Running/Scheduled/Completed/Failed)
  - **Create** — multi-section form (Details, Audience, Message `{{name}}`/`{{company}}`/`{{phone}}`, Media, **File Attachment** drag-drop `qrcode` + preview, Scheduling `Send Now/Schedule`, Advanced) → `Save Draft / Schedule / Start Campaign` → appears in table instantly
  - **History / Scheduled / Templates** — filtered tables + `View Report` dialog, WhatsApp preview
  - **Standalone** `/campaigns/create` (table + button → `/campaigns/create/new` form page with Name+QR+file attachment)
- **WhatsApp Accounts** (`/whatsapp`) — single page (no dropdown) with **S.no, name, WhatsApp number, Connected/Disconnected** `AppTable` + button → **Name + QR Code** form (QR `data:image/png` from `GET /api/whatsapp/qr` via `qrcode`, status `connected/qr`, refresh, `ChatBubble` preview)
- **Inbox** (`/inbox`) — `AppTable` inbox list + **premium WhatsApp chat preview** `ChatBubble` (`chat-bubble.json` same size, tails, timestamps, read receipts) + `POST /api/whatsapp/send` (wwebjs.dev mock)
- **Other Hubs** — `Inbox`, `Contacts` (All/Create/Import-Export/Segments/Labels), `Leads` (All/Create/Pipeline/Tasks), `Analytics` (single), `Automation` (Workflows/Auto-replies/Chatbot/Webhooks), `Template Approval` (`Pending/Approved/Rejected`), `Ai Agent` (table + playground chat), `Media Library`, `Notifications`, `Settings` — all `@7ovr/table-1` headers
- **Sidebar** — `sidebar-07` collapsible `icon`, `MyWhatsappMsg` header, no Teams, no unwanted dropdowns (fixed `nav-main.tsx` to render single pages as links, not collapsible)
- **Backend WhatsApp** — `https://wwebjs.dev` service: `Client` + `LocalAuth` + `qrcode` mock fallback (auto QR, auto-connected after 8s), endpoints `GET /api/whatsapp/qr`, `POST /api/whatsapp/qr/refresh`, `GET /api/whatsapp/status`, `POST /api/whatsapp/send`, `POST /api/whatsapp/disconnect`

## 🧱 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind 4, shadcn/ui (`button/input/label/field/card/badge/table/tabs/dialog/select/textarea/checkbox/dropdown/sidebar/tooltip`), `@7ovr/table-1` (TanStack Table), `chat-bubble.json` (`ui.meta-cloud-api.site`), `lucide-react` |
| Backend | Fastify 5, `@fastify/cors`, Mongoose 8, `dotenv`, `tsx`, `qrcode`, `mongodb-memory-server` (auto in-memory fallback) |
| DB | MongoDB `mongodb://localhost:27017/myapp` (local) → auto in-memory if not running (`mongodb-memory-server` 11) |
| WhatsApp | `whatsapp-web.js` (optional, `USE_WWEBJS=true` → real `Client`, else mock + `qrcode` `dataURL`) |

## 📁 Structure

```
mywhatsappmsg/
├── backend/               # Fastify :5000
│   ├── src/
│   │   ├── server.ts      # Fastify + CORS + routes
│   │   ├── plugins/db.ts  # auto: localhost → docker compose → in-memory
│   │   ├── models/        # User, Campaign (+attachments)
│   │   ├── routes/        # user.routes, campaign.routes, whatsapp.routes
│   │   └── services/whatsapp.service.ts # wwebjs.dev mock/real
│   └── .env.example
├── frontend/              # Next.js :3000
│   ├── app/
│   │   ├── login/         # login-05
│   │   ├── dashboard/     # redirect → /login
│   │   ├── campaigns/     # hub + create/new, scheduled, templates
│   │   ├── whatsapp/      # single: S.no table + Name+QR form
│   │   ├── inbox/         # AppTable + premium ChatBubble preview
│   │   ├── contacts|leads|analytics|automation|template-approval|ai-agent|media|notifications|settings
│   │   └── globals.css    # Roboto @import + @7ovr/table-1 + whatsapp.css
│   ├── components/
│   │   ├── ui/whatsapp/   # chat-bubble, message-status, reaction, whatsapp.css
│   │   ├── blocks/app-table.tsx # @7ovr/table-1 wrapper (header + search + pagination)
│   │   └── app-sidebar.tsx# MyWhatsappMsg nav (no Teams/Automation unwanted)
│   └── lib/api.ts         # getCampaigns/createCampaign, whatsapp QR/status/send
└── docker-compose.yml     # mongo:7 + mongo-express:8081
```

## 🚀 Quick Start (Local MongoDB auto)

Prereqs: Node 18+, optional Docker Desktop.

```bash
# 1. Clone
git clone https://github.com/Myenum2412/mywhatsappmsg.git
cd mywhatsappmsg

# 2. Backend (auto-starts MongoDB: localhost → docker compose → in-memory)
cd backend
npm install
npm run dev          # → ✅ MongoDB connected (or in-memory) + 🚀 Server running at http://localhost:5000
# health: curl http://localhost:5000/api/health
# whatsapp QR: curl http://localhost:5000/api/whatsapp/qr

# 3. Frontend
cd ../frontend
npm install
# .env.local already: NEXT_PUBLIC_API_URL=http://localhost:5000
npm run dev          # → http://localhost:3000 → redirect /login
# login: myenumam@gmail.com / @Meenu2412 → /dashboard
```

**First run** of `mongodb-memory-server` downloads ~750MB MongoDB binary once (cached in `node_modules/.cache`), next runs instant. For persistent local DB: `docker compose up -d` (from root) or `choco install mongodb -y; net start MongoDB`.

## 🔧 Env

**backend/.env**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/myapp
FRONTEND_URL=http://localhost:3000
# Optional: USE_WWEBJS=true  # use real whatsapp-web.js instead of mock
```

**frontend/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 🔌 API Routes (Fastify)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | `Fastify API 🚀` |
| GET | `/api/health` | Health + timestamp |
| GET | `/api/users` | List users |
| POST | `/api/users` | Create `{name,email}` |
| GET | `/api/campaigns` | List campaigns (MongoDB) |
| GET | `/api/campaigns/stats` | Status counts |
| POST | `/api/campaigns` | Create `{name,template,recipients,status,campaignType,account,audience,scheduledDate,attachments[]}` |
| PUT | `/api/campaigns/:id` | Update |
| DELETE | `/api/campaigns/:id` | Delete |
| POST | `/api/campaigns/:id/duplicate` | Duplicate |
| GET | `/api/whatsapp/qr` | QR `data:image/png` + status (wwebjs.dev mock) |
| POST | `/api/whatsapp/qr/refresh` | Regenerate QR |
| GET | `/api/whatsapp/status` | `connected/qr/disconnected` + docs |
| POST | `/api/whatsapp/send` | Send `{to,message}` via wwebjs or mock |
| POST | `/api/whatsapp/disconnect` | Disconnect |

## 🎨 Frontend Routes

`/`, `/login` (login-05), `/dashboard` (redirect), `/campaigns` (tabs: Campaigns/Create/Scheduled/Templates), `/campaigns/create` (table → `/campaigns/create/new` form with file attachment), `/inbox` (AppTable + premium ChatBubble preview), `/whatsapp` (S.no table + Name+QR form), `/contacts/*`, `/leads/*`, `/analytics`, `/automation/*`, `/template-approval`, `/ai-agent` (table + playground), `/media`, `/notifications`, `/settings`

All tables use **`@7ovr/table-1`** (`components/blocks/app-table.tsx`) — header with icon/title/description/search/View/Create, sorting, selection, pagination.

## 💬 WhatsApp Integration

- **https://wwebjs.dev** — `backend/src/services/whatsapp.service.ts` wraps `whatsapp-web.js` `Client` + `LocalAuth` + `qrcode` `toDataURL`. Runs in **mock** by default (no Puppeteer needed) — generates QR via `qrcode`, auto `connected` after 8s, `sendMessage` logs mock. Set `USE_WWEBJS=true` + `npm i whatsapp-web.js` for real browser automation.
- **https://ui.meta-cloud-api.site/r/chat-bubble.json** — `npx shadcn@latest add https://ui.meta-cloud-api.site/r/chat-bubble.json` → `components/ui/whatsapp/chat-bubble.tsx` + `message-status.tsx` + `reaction.tsx` + `whatsapp.css` (WDS tokens). Used in `app/inbox` (premium Card with `ChatHeader`/`DateSeparator`/`TypingIndicator`/`MessageInput`) and `app/whatsapp` (preview bubbles with tails, `wa-wallpaper`, `read` receipts).

## 🧪 Scripts

| Location | Command | Description |
|----------|---------|-------------|
| backend | `npm run dev` | `tsx watch src/server.ts` (auto MongoDB) |
| backend | `npm run build && npm start` | `tsc` → `node dist/server.js` |
| frontend | `npm run dev` | `next dev` (Turbopack) |
| frontend | `npm run build && npm start` | `next build` → `next start` |

## ❓ Troubleshooting

- **ECONNREFUSED 127.0.0.1:27017** — MongoDB not running → backend auto falls back to in-memory (or `docker compose up -d`, or `choco install mongodb`)
- **CORS** — ensure `FRONTEND_URL` matches `NEXT_PUBLIC_API_URL`
- **415 Unsupported Media Type** on duplicate/refresh — fixed by sending `Content-Type: application/json {}` in `lib/api.ts`
- **No campaigns** — `GET /api/campaigns` initially `0` (fake data removed) — create via `POST /api/campaigns` in Create tab/new page, then appears in table

---

Built for **MyWhatsappMsg** — WhatsApp marketing at scale. PRs/issues at `https://github.com/Myenum2412/mywhatsappmsg`.
