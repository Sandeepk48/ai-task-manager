# Deploying the NestJS API

This service uses **PostgreSQL** (via Prisma), **JWT auth**, and **CORS** for your Next.js (or other) frontend. Production builds compile to `dist/` and run with `node dist/main`.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (cloud hosts often require `?sslmode=require`). |
| `JWT_SECRET` | Yes | Secret for signing access tokens. Use a long random value in production. |
| `FRONTEND_URL` | Yes (prod) | Single allowed browser origin, e.g. `https://my-app.vercel.app`. No trailing slash. |
| `CORS_ORIGINS` | Alternative | Comma-separated list if you need multiple origins (overrides single-URL logic when set). |
| `PORT` | No | HTTP port (Render/Railway set this automatically). |
| `NODE_ENV` | No | Set to `production` on the platform. |
| `JWT_EXPIRES_IN` | No | JWT lifetime (default `7d`). |
| `OPENAI_API_KEY` | No | **Required for real AI summaries** on new tasks. If unset, `aiSummary` explains that the key is missing (it will not duplicate your description). |

After deploy, open **`GET /health`**: the JSON field **`openaiConfigured`** is `true` only when the running process sees a non-empty `OPENAI_API_KEY` (same logic as task AI). If it is `false`, the secret is missing on that Web Service or the service was not redeployed after saving env.

Production startup **fails fast** if `DATABASE_URL`, `JWT_SECRET`, or CORS configuration is missing.

## PostgreSQL (cloud)

1. Create a managed Postgres instance (Neon, Supabase, **Render Postgres**, **Railway Postgres**, etc.).
2. Copy the **connection string** into `DATABASE_URL`.
3. Run migrations against that database (see below).

## Build (production)

From the `backend` directory:

```bash
npm ci
npx prisma generate
npm run build
```

Run the compiled app:

```bash
NODE_ENV=production npm run start:prod
```

Apply database schema in production (run on every release after `build`, or once before first traffic):

```bash
npx prisma migrate deploy
```

## Deploy on Render

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In [Render Dashboard](https://dashboard.render.com) → **New** → **Web Service** → connect the repo.
3. Set **Root Directory** to `backend` (monorepo) or leave blank if the repo is only the API.
4. **Runtime**: Node.
5. **Build Command**:

   ```bash
   npm ci && npx prisma generate && npm run build
   ```

6. **Start Command**:

   ```bash
   npm run start:prod
   ```

7. **Add a Render PostgreSQL** instance (or use Neon etc.). Copy its **Internal Database URL** (or external URL with SSL) into `DATABASE_URL`.

8. **Environment** → add variables:

   - `DATABASE_URL` — from Postgres.
   - `JWT_SECRET` — generate a strong random string.
   - `FRONTEND_URL` — your deployed Next.js URL.
   - `NODE_ENV` = `production`.

9. **Shell** (one-time or each release): run migrations, or add a **Release Command** on the Web Service:

   ```bash
   npx prisma migrate deploy
   ```

10. **Health check**: use path **`/health`** (JSON). Opening **`/`** in a browser returns a small HTML page; API clients without `Accept: text/html` still get JSON on **`/`**.

11. Point your frontend `NEXT_PUBLIC_API_URL` at the Render service URL (e.g. `https://ai-task-manager-api.onrender.com`).

## Deploy on Railway

1. Push the repo to GitHub and open [Railway](https://railway.app).
2. **New Project** → **Deploy from GitHub** → select the repo.
3. Add a **PostgreSQL** plugin (or provision **Database** → Postgres). Railway injects `DATABASE_URL` into services in the same project — link the variable to your API service if needed.
4. Create a **service** from the repo (or use the auto-created one). Set **Root Directory** to `backend` for a monorepo.
5. **Variables** tab:

   - `DATABASE_URL` — reference Railway Postgres, or paste external URL.
   - `JWT_SECRET` — random secret.
   - `FRONTEND_URL` — your frontend origin.
   - `NODE_ENV` = `production`.
   - `PORT` is set automatically by Railway; Nest reads `process.env.PORT`.

6. **Settings** → **Build**:

   - **Build command**: `npm ci && npx prisma generate && npm run build`
   - **Start command**: `npm run start:prod`

7. Run migrations once (Railway **Shell** on the service):

   ```bash
   npx prisma migrate deploy
   ```

   Or add a **Deploy** → **Custom Start Command** that runs migrate then start (less common; usually migrate is a one-off or CI step).

8. Generate a **public URL** (Settings → Networking → Generate Domain) and set `NEXT_PUBLIC_API_URL` on the frontend to that URL.

## CORS checklist

- Frontend origin must **exactly** match `FRONTEND_URL` (scheme + host + port if non-default).
- With credentials (cookies / `Authorization` from browsers), you cannot use `*`; use explicit origins.
- Multiple environments: use `CORS_ORIGINS=https://a.com,https://b.com`.

## Troubleshooting

- **502 / crash on boot**: Check logs for missing `DATABASE_URL` / `JWT_SECRET` / CORS env in production.
- **Prisma P1001**: Database unreachable — verify URL, firewall, and `sslmode` for cloud Postgres.
- **CORS errors in browser**: Mismatch between frontend URL and `FRONTEND_URL` / `CORS_ORIGINS`.
- **401 after deploy**: New `JWT_SECRET` invalidates old tokens — users must log in again.

### OpenAI / “AI summary” on Render

1. Put **`OPENAI_API_KEY`** on the **Web Service** that runs Nest (not the Postgres service). Use the full key (`sk-proj-…` or `sk-…`) with **no leading/trailing spaces**. Click **Save, rebuild, and deploy** so the running service picks it up.
2. **Redeploy** after changing env vars; old containers keep the old env until replaced.
3. **Logs** (service → **Logs**): search for `OpenAI API error` or `OpenAI request failed`. **401** = invalid/revoked key, **429** = rate limit, **quota** messages = billing/credits.
4. **`aiSummary` is set when a task is created** — existing tasks are not backfilled. Create a **new** task after fixing the key to verify.
5. For **project keys** (`sk-proj-`), confirm the OpenAI project allows **chat** models (e.g. `gpt-4o-mini`) and billing is active.
6. In production, **`ConfigModule` uses `ignoreEnvFile: true`**, so only platform env (Render) applies — no `.env` file on the server.
