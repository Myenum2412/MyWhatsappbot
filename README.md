# MyWhatsappbot — Next.js + Fastify + PostgreSQL

Monorepo:
- `frontend/` — Next.js 16 (App Router) + TypeScript + Tailwind
- `backend/` — Fastify 5 + TypeScript + `pg` + Zod
- `docker-compose.yml` — Postgres 18 + backend + frontend

## Prerequisites
- Node 24+, npm
- Postgres 18 (local) OR Docker

## Quick start (local dev)

1. Start Postgres:
```bash
docker compose up db -d
# or use local postgres, ensure DB exists:
# createdb mywhatsappmsg
```

2. Backend:
```bash
cd backend
cp .env.example .env
npm install
npm run dev   # http://localhost:4000
```

Health: `GET http://localhost:4000/api/health`
Messages: `GET/POST http://localhost:4000/api/messages`

3. Frontend:
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev   # http://localhost:3000
```

`NEXT_PUBLIC_API_URL` must point to Fastify (default `http://localhost:4000`).

## Docker (full stack)
```bash
docker compose up --build
# frontend :3000, backend :4000, db :5432
```

## API
| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/api/health` | — | backend status |
| GET | `/api/messages` | — | list last 100 |
| POST | `/api/messages` | `{"to": "...", "body": "..."}` | queue message |

Table auto-created on boot:
```sql
messages(id SERIAL, recipient TEXT, body TEXT, status TEXT, created_at TIMESTAMPTZ)
```

## Scripts
- backend: `npm run dev` (tsx watch), `npm run build` + `npm start`, `npx tsc --noEmit`
- frontend: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`
