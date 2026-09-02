/* Runnable check for the money + query + auth-hash paths.
   Run: node --env-file=.env scripts/smoke.ts   (uses a throwaway DB) */
import assert from "node:assert/strict"
import { existsSync, rmSync } from "node:fs"

process.env.DATABASE_URL = "file:smoke-test.db"
for (const f of ["smoke-test.db", "smoke-test.db-shm", "smoke-test.db-wal"])
  if (existsSync(f)) rmSync(f)

const { createClient } = await import("@libsql/client")
const { drizzle } = await import("drizzle-orm/libsql")
const { migrate } = await import("drizzle-orm/libsql/migrator")
const { and, eq, like } = await import("drizzle-orm")
const schema = await import("../lib/schema.ts")
const { hashPin, checkPin } = await import("../lib/auth.ts")
const { summarize } = await import("../lib/summarize.ts")
const { money } = await import("../lib/config.ts")

const raw = drizzle(createClient({ url: process.env.DATABASE_URL! }), { schema })
await migrate(raw, { migrationsFolder: "drizzle" })

// --- auth hashing ---
const h = await hashPin("1234")
assert.ok(await checkPin("1234", h), "correct PIN verifies")
assert.equal(await checkPin("0000", h), false, "wrong PIN rejected")

// --- money formatting (EUR / es-ES) ---
const eur = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" })
assert.equal(money(123456), eur.format(1234.56))
assert.equal(money(0), eur.format(0))
assert.ok(money(500).includes("€"))

// --- db round-trip + summarize ---
const [co] = await raw.insert(schema.companies).values({ name: "Test Co" }).returning()
const [u] = await raw
  .insert(schema.users)
  .values({ companyId: co.id, phone: "611111111", pinHash: h, name: "Ada", role: "admin" })
  .returning()
const [cat] = await raw
  .insert(schema.categories)
  .values({ companyId: co.id, name: "Sales", kind: "income" })
  .returning()

await raw.insert(schema.transactions).values([
  { companyId: co.id, createdBy: u.id, kind: "income", amountCents: 10000, method: "bank", categoryId: cat.id, occurredOn: "2026-09-05" },
  { companyId: co.id, createdBy: u.id, kind: "expense", amountCents: 2500, method: "cash", occurredOn: "2026-09-06" },
  { companyId: co.id, createdBy: u.id, kind: "expense", amountCents: 1500, method: "card", occurredOn: "2026-08-30" },
])

const septRows = await raw
  .select({
    kind: schema.transactions.kind,
    amountCents: schema.transactions.amountCents,
    method: schema.transactions.method,
    categoryName: schema.categories.name,
  })
  .from(schema.transactions)
  .leftJoin(
    schema.categories,
    eq(schema.categories.id, schema.transactions.categoryId)
  )
  .where(
    and(
      eq(schema.transactions.companyId, co.id),
      like(schema.transactions.occurredOn, "2026-09%")
    )
  )
assert.equal(septRows.length, 2, "month filter excludes August")
const s = summarize(septRows)
assert.equal(s.income, 10000)
assert.equal(s.expense, 2500)
assert.equal(s.balance, 7500)
assert.equal(s.byMethod.get("bank"), undefined) // byMethod = expenses only
assert.equal(s.byMethod.get("cash"), 2500)
assert.equal(s.byCategory.get("income:Sales"), 10000)
assert.equal(s.byCategory.get("expense:Sin categoría"), 2500)

for (const f of ["smoke-test.db", "smoke-test.db-shm", "smoke-test.db-wal"])
  if (existsSync(f)) rmSync(f)

console.log("smoke ok")
