# Contabase

Mobile-first web app to track company expenses and income. Next.js 16
(App Router) · Drizzle + libSQL/Turso · shadcn/ui. Spanish UI, EUR,
`Europe/Madrid`.

## Local development

```bash
pnpm install
cp .env.example .env          # fill SESSION_SECRET; SIGNUP_ENABLED=true for first run
pnpm db:migrate               # creates tables in ./local.db
pnpm dev
```

Then open http://localhost:3000/signup to create the first company.

- `pnpm db:seed` — wipe local.db and insert a demo company (prints a login: `612345678` / PIN `1234`)
- `pnpm test` — data-layer self-check
- `pnpm check:r2` — verify R2 credentials (needs the `R2_*` vars set)

Receipt photos go to `./.uploads` locally (no config needed).

## Environment variables

| Var | Required | Notes |
|-----|----------|-------|
| `DATABASE_URL` | yes | `file:local.db` locally, `libsql://…turso.io` in prod |
| `DATABASE_AUTH_TOKEN` | prod only | Turso token |
| `SESSION_SECRET` | yes | long random string; rotating it logs everyone out |
| `SIGNUP_ENABLED` | no | `true` enables public `/signup`. Turn on to register the first company, then remove. |
| `R2_ACCOUNT_ID` `R2_BUCKET` `R2_ACCESS_KEY_ID` `R2_SECRET_ACCESS_KEY` | prod (for photos) | Cloudflare R2. If `R2_ACCOUNT_ID` is unset, photos use the local filesystem. |

## Deploy (Vercel)

1. **Turso** — create a database, grab its URL + auth token.

2. **Run the migrations against Turso from your machine** — Vercel does *not*
   run migrations. Do this once now, and again after every schema change:

   ```bash
   DATABASE_URL='libsql://<db>.turso.io' DATABASE_AUTH_TOKEN='<token>' pnpm db:migrate
   ```

3. **Vercel → Project → Settings → Environment Variables** (Production):

   | Var | Value |
   |-----|-------|
   | `DATABASE_URL` | `libsql://<db>.turso.io` |
   | `DATABASE_AUTH_TOKEN` | Turso token |
   | `SESSION_SECRET` | `openssl rand -base64 32` |
   | `R2_ACCOUNT_ID` `R2_BUCKET` `R2_ACCESS_KEY_ID` `R2_SECRET_ACCESS_KEY` | Cloudflare R2 — **required on Vercel** (the local-filesystem photo fallback only works on your machine) |
   | `SIGNUP_ENABLED` | `true` — first deploy only |

4. Deploy (default `pnpm build`). Open `/signup`, create the company, then
   **delete `SIGNUP_ENABLED`** and redeploy.

Notes:
- `proxy.ts` runs on Vercel Edge (no DB there — only a JWT signature check).
  Pages/actions run as Node serverless functions.
- `no such table: users` in production = step 2 was skipped.
