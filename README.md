# AI Task Manager

Monorepo for a full-stack task manager with JWT authentication, PostgreSQL via Prisma, and OpenAI-powered task summaries and priority suggestions.

## Structure

- `frontend` — Next.js (App Router, TypeScript, Tailwind CSS)
- `backend` — NestJS (TypeScript), Prisma, JWT auth, OpenAI integration

## Prerequisites

- Node.js 20+
- PostgreSQL instance

## Run locally (quick)

1. **PostgreSQL** — install locally, or from the repo root with Docker: `docker compose up -d`
2. **Backend** — `cd backend` → copy [`.env.example`](backend/.env.example) to `.env` and set `DATABASE_URL` / `JWT_SECRET` / `FRONTEND_URL=http://localhost:3000` (a dev [`.env`](backend/.env) may already exist) → `npx prisma migrate deploy` → `npm run start:dev` (port **4000**)
3. **Frontend** — `cd frontend` → `cp .env.local.example .env.local` → `npm run dev` (port **3000**)

## Backend

```bash
cd backend
cp .env.example .env
# Edit .env: DATABASE_URL, JWT_SECRET, OPENAI_API_KEY (optional for AI)
npm install
npx prisma migrate dev --name init
npm run start:dev
```

API listens on `http://localhost:4000` by default.

**Production / Render / Railway:** see [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md). Optional Render blueprint: [render.yaml](render.yaml) (set `rootDir: backend` for this monorepo).

## Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

App runs at `http://localhost:3000`. Set `NEXT_PUBLIC_API_URL` in `.env.local` (see `frontend/.env.local.example`) to match the API origin (default `http://localhost:4000`).

**Vercel / production:** [frontend/DEPLOYMENT.md](frontend/DEPLOYMENT.md).

## Features (boilerplate)

- Sign up and log in (JWT returned as `access_token`)
- CRUD tasks (`title`, `description`, `priority`, `dueDate`, AI fields)
- Creating a task runs AI summary + suggested priority (OpenAI when `OPENAI_API_KEY` is set; otherwise placeholders)
- `POST /ai/tasks/preview` — preview AI without persisting a task (JWT required)
- Dashboard route at `/dashboard` after authentication
