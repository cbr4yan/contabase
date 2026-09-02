import { and, desc, eq, gte, like, lte, type SQL } from "drizzle-orm"

import { db } from "./db"
import { categories, transactions, users } from "./schema"

export function activeCategories(companyId: string) {
  return db
    .select()
    .from(categories)
    .where(
      and(eq(categories.companyId, companyId), eq(categories.archived, false))
    )
    .orderBy(categories.kind, categories.name)
}

export function allCategories(companyId: string) {
  return db
    .select()
    .from(categories)
    .where(eq(categories.companyId, companyId))
    .orderBy(categories.kind, categories.name)
}

export function companyMembers(companyId: string) {
  return db
    .select()
    .from(users)
    .where(eq(users.companyId, companyId))
    .orderBy(users.name)
}

function txQuery(companyId: string, dateWhere: SQL | undefined) {
  return db
    .select({
      id: transactions.id,
      kind: transactions.kind,
      amountCents: transactions.amountCents,
      method: transactions.method,
      note: transactions.note,
      occurredOn: transactions.occurredOn,
      createdBy: transactions.createdBy,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      photoKey: transactions.photoKey,
    })
    .from(transactions)
    .leftJoin(categories, eq(categories.id, transactions.categoryId))
    .where(and(eq(transactions.companyId, companyId), dateWhere))
    .orderBy(desc(transactions.occurredOn), desc(transactions.createdAt))
}

/** `month` is YYYY-MM. occurred_on is stored as YYYY-MM-DD text, so a prefix
 *  LIKE and lexical range comparisons both work. */
export function monthTransactions(companyId: string, month: string) {
  return txQuery(companyId, like(transactions.occurredOn, `${month}%`))
}

export function rangeTransactions(companyId: string, from: string, to: string) {
  return txQuery(
    companyId,
    and(gte(transactions.occurredOn, from), lte(transactions.occurredOn, to))
  )
}

export type TxRow = Awaited<ReturnType<typeof monthTransactions>>[number]

export { summarize } from "./summarize"
