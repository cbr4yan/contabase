import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())

const createdAt = () =>
  integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())

export const companies = sqliteTable("companies", {
  id: id(),
  name: text("name").notNull(),
  createdAt: createdAt(),
})

export const users = sqliteTable("users", {
  id: id(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  phone: text("phone").notNull().unique(),
  pinHash: text("pin_hash").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "employee"] })
    .notNull()
    .default("employee"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  mustChangePin: integer("must_change_pin", { mode: "boolean" })
    .notNull()
    .default(false),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  lockedUntil: integer("locked_until", { mode: "timestamp" }),
  createdAt: createdAt(),
})

export const categories = sqliteTable("categories", {
  id: id(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  name: text("name").notNull(),
  kind: text("kind", { enum: ["expense", "income"] }).notNull(),
  archived: integer("archived", { mode: "boolean" }).notNull().default(false),
})

export const transactions = sqliteTable("transactions", {
  id: id(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  kind: text("kind", { enum: ["expense", "income"] }).notNull(),
  amountCents: integer("amount_cents").notNull(),
  categoryId: text("category_id").references(() => categories.id),
  method: text("method", { enum: ["cash", "card", "bank"] }).notNull(),
  note: text("note"),
  photoKey: text("photo_key"), // object-storage key of an attached receipt photo
  occurredOn: text("occurred_on").notNull(), // YYYY-MM-DD
  createdAt: createdAt(),
})

export type Kind = "expense" | "income"
export type Method = "cash" | "card" | "bank"
export type Role = "admin" | "employee"
export type User = typeof users.$inferSelect
export type Category = typeof categories.$inferSelect
export type Transaction = typeof transactions.$inferSelect
