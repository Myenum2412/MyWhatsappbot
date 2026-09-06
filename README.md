# Next.js + Fastify + MongoDB (Local)

Full-stack starter with **Next.js 16 (Frontend)** and **Fastify (Backend)** connected to **MongoDB locally**.

## Structure
```
/
├── frontend/   # Next.js (http://localhost:3000)
├── backend/    # Fastify (http://localhost:5000)
└── docker-compose.yml # MongoDB + mongo-express
```

## Prerequisites
- Node.js 18+
- Either:
  - **Option A (Recommended):** Docker Desktop for MongoDB (`docker compose up -d`)
  - **Option B:** Local MongoDB installed & running on `mongodb://localhost:27017`
  - **Option C:** MongoDB Atlas (replace MONGODB_URI)

## 1. Start MongoDB Locally

### With Docker (easiest)
```bash
docker compose up -d
# Check: docker ps
# MongoDB -> localhost:27017
# Mongo Express GUI -> http://localhost:8081
```

### Without Docker (native install)
Install from https://www.mongodb.com/try/download/community then:
```bash
mongod --dbpath ./data/db
```

## 2. Backend Setup (Fastify)

```bash
cd backend
npm install
# edit .env if needed
npm run dev
# -> http://localhost:5000
# -> health: http://localhost:5000/api/health
```

Env (`backend/.env`):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/myapp
FRONTEND_URL=http://localhost:3000
```

API Routes:
- `GET /` - root
- `GET /api/health` - health check
- `GET /api/users` - list users
- `POST /api/users` - create { name, email }

## 3. Frontend Setup (Next.js)

```bash
cd frontend
npm install
npm run dev
# -> http://localhost:3000
```

Env (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Frontend fetches backend via `lib/api.ts` and displays health + CRUD demo on `/`.

## 4. Verify Connection

1. Start mongo: `docker compose up -d`
2. Start backend: `cd backend && npm run dev` -> should log `✅ MongoDB connected` + `🚀 Server running at http://localhost:5000`
3. Start frontend: `cd frontend && npm run dev`
4. Open http://localhost:3000 -> "Backend Health" should be green, create a user and see it in table + mongo-express.

## Scripts

| Location | Command | Description |
|----------|---------|-------------|
| backend | `npm run dev` | tsx watch |
| backend | `npm run build && npm start` | production |
| frontend | `npm run dev` | next dev |
| frontend | `npm run build && npm start` | production |

## Troubleshooting

- **Mongo connection failed**: Ensure `mongod` or `docker compose` is running. Test with `mongosh mongodb://localhost:27017/myapp` or check Docker logs `docker logs myapp-mongo`.
- **CORS error**: Check backend `FRONTEND_URL` matches frontend URL.
- **Port in use**: Change `PORT` in backend/.env and `NEXT_PUBLIC_API_URL` in frontend/.env.local.
