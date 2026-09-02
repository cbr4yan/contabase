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

## Deploy

1. Create a Turso database, get its URL + auth token.
2. **Run the migrations against it** (once, and after every schema change):

   ```bash
   DATABASE_URL='libsql://<db>.turso.io' DATABASE_AUTH_TOKEN='<token>' pnpm db:migrate
   ```

3. Set all env vars on the host (`DATABASE_URL`, `DATABASE_AUTH_TOKEN`,
   `SESSION_SECRET`, the `R2_*` set, and `SIGNUP_ENABLED=true` for the first
   deploy only).
4. Deploy. Visit `/signup`, create the company, then unset `SIGNUP_ENABLED`
   and redeploy.

> `no such table: users` in production means step 2 was skipped.
