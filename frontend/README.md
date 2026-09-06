# MyWhatsappMsg — Frontend (Next.js 16)

WhatsApp Marketing UI — part of [MyWhatsappMsg](https://github.com/Myenum2412/mywhatsappmsg) full-stack.

## Stack
Next.js 16 App Router (Turbopack), React 19, TypeScript, Tailwind 4, shadcn/ui, `@7ovr/table-1` (TanStack Table), `chat-bubble.json` (ui.meta-cloud-api.site), `lucide-react`, Roboto.

## Routes
`/login` (myenumam@gmail.com / @Meenu2412), `/dashboard`, `/campaigns` (hub with @7ovr/table-1 + file attachment → `/campaigns/create/new`), `/inbox` (AppTable + premium ChatBubble preview via wwebjs.dev), `/whatsapp` (S.no table + Name+QR form via `GET /api/whatsapp/qr`), `/contacts/*`, `/leads/*`, `/analytics`, `/automation/*`, `/template-approval`, `/ai-agent`, `/media`, `/notifications`, `/settings`.

## Env
`frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Run
```bash
npm install
npm run dev      # http://localhost:3000 → /login
npm run build    # next build (Turbopack) → 32 routes
```

See root [README.md](../README.md) for full stack, backend (Fastify), MongoDB, and WhatsApp (wwebjs.dev) setup.
