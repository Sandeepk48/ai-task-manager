# Deploying the Next.js frontend (Vercel)

The app calls your NestJS API using **`NEXT_PUBLIC_API_URL`**. That value is embedded at **build time**, so each Vercel environment (Production / Preview / Development) should set the variable to the correct API origin.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | **Yes** for deployed builds | Full origin of the API, **no trailing slash**, e.g. `https://your-api.onrender.com`. |

Local development: copy `.env.local.example` to **`.env.local`** and point at `http://localhost:4000` (or your local API port).

### Backend CORS

Your Nest API must allow your Vercel origin. Set **`FRONTEND_URL`** (or **`CORS_ORIGINS`**) on the API to match the deployed site, for example:

- Production: `https://your-app.vercel.app`
- Preview (optional): add preview URLs to **`CORS_ORIGINS`** as a comma-separated list.

See [backend/DEPLOYMENT.md](../backend/DEPLOYMENT.md).

## Deploy on Vercel

### 1. Push the repository

Push this monorepo to GitHub, GitLab, or Bitbucket.

### 2. Import the project in Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New…** → **Project**.
2. **Import** your Git repository.

### 3. Configure the app root (monorepo)

Because the Next app lives in **`frontend/`**:

1. In the import flow, open **Root Directory** (or **Edit** after import).
2. Set **Root Directory** to **`frontend`**.
3. Framework Preset should detect **Next.js**. Build command stays **`next build`**; output is handled by Vercel.

### 4. Set environment variables

In **Project → Settings → Environment Variables**:

1. Add **`NEXT_PUBLIC_API_URL`** = your deployed API URL (e.g. `https://api.example.com`).
2. Attach it to **Production** (and **Preview** / **Development** if those environments should hit a real API).
3. **Redeploy** after changing this variable so the client bundle picks up the new value.

### 5. Deploy

Click **Deploy**. Vercel runs `npm install` (or `pnpm`/`yarn` if detected), then **`next build`**, then serves the app.

### 6. Smoke test

1. Open the production URL.
2. **Sign up / Log in** — requests should go to `NEXT_PUBLIC_API_URL`.
3. If the browser shows **CORS** errors, update the API’s **`FRONTEND_URL`** / **`CORS_ORIGINS`** to your exact Vercel URL (scheme + host, no path).

## Preview deployments

Each Git branch / PR can get a **Preview URL** (e.g. `https://my-app-git-feature-xyz.vercel.app`). Either:

- Point **`NEXT_PUBLIC_API_URL`** for **Preview** at a **staging API** that allows those origins in CORS, or  
- Use the same production API and add preview origins to **`CORS_ORIGINS`** on the backend.

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| API calls still hit `localhost` | `NEXT_PUBLIC_API_URL` missing or wrong **environment** on Vercel; trigger a **redeploy**. |
| CORS blocked | Nest **`FRONTEND_URL`** / **`CORS_ORIGINS`** must include the Vercel origin exactly. |
| 401 after deploy | New API **`JWT_SECRET`** or domain change — users need to **log in again**. |
| Mixed content (HTTPS page → HTTP API) | Serve the API over **HTTPS** in production. |

## Local production build

```bash
cd frontend
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL in .env.local
npm ci
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) and verify API connectivity.
