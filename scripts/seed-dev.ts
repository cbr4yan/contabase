/* Dev-only: create a company + admin in local.db and print a session cookie.
   node --env-file=.env scripts/seed-dev.ts */
import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import { SignJWT } from "jose"

import * as schema from "../lib/schema.ts"
import { hashPin } from "../lib/auth.ts"

const db = drizzle(createClient({ url: process.env.DATABASE_URL! }), { schema })

// Wipe so the script is re-runnable.
await db.delete(schema.transactions)
await db.delete(schema.categories)
await db.delete(schema.users)
await db.delete(schema.companies)

const [co] = await db.insert(schema.companies).values({ name: "Acme" }).returning()
const [admin] = await db
  .insert(schema.users)
  .values({
    companyId: co.id,
    phone: "612345678",
    name: "Admin",
    role: "admin",
    pinHash: await hashPin("1234"),
  })
  .returning()
const cats = await db
  .insert(schema.categories)
  .values([
    { companyId: co.id, name: "Ventas", kind: "income" as const },
    { companyId: co.id, name: "Alquiler", kind: "expense" as const },
    { companyId: co.id, name: "Comida", kind: "expense" as const },
  ])
  .returning()

const m = new Date().toISOString().slice(0, 7)
await db.insert(schema.transactions).values([
  { companyId: co.id, createdBy: admin.id, kind: "income" as const, amountCents: 250000, method: "bank" as const, categoryId: cats[0].id, occurredOn: `${m}-02`, note: "Factura #12" },
  { companyId: co.id, createdBy: admin.id, kind: "expense" as const, amountCents: 120000, method: "bank" as const, categoryId: cats[1].id, occurredOn: `${m}-03` },
  { companyId: co.id, createdBy: admin.id, kind: "expense" as const, amountCents: 4200, method: "card" as const, categoryId: cats[2].id, occurredOn: `${m}-03`, note: "Comida equipo" },
  { companyId: co.id, createdBy: admin.id, kind: "expense" as const, amountCents: 1800, method: "cash" as const, categoryId: cats[2].id, occurredOn: `${m}-05` },
])

const token = await new SignJWT({
  userId: admin.id,
  companyId: co.id,
  role: "admin",
})
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("30d")
  .sign(new TextEncoder().encode(process.env.SESSION_SECRET))

console.log("cb_session=" + token)
