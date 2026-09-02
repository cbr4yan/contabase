import type { Kind, Method } from "./schema"

type TxLike = {
  kind: Kind
  amountCents: number
  method: Method
  categoryName: string | null
}

export function summarize(rows: TxLike[]) {
  let income = 0
  let expense = 0
  const byCategory = new Map<string, number>()
  const byMethod = new Map<string, number>()

  for (const r of rows) {
    if (r.kind === "income") income += r.amountCents
    else expense += r.amountCents
    const catKey = `${r.kind}:${r.categoryName ?? "Sin categoría"}`
    byCategory.set(catKey, (byCategory.get(catKey) ?? 0) + r.amountCents)
    // byMethod = how expenses were paid; mixing in income makes the number meaningless.
    if (r.kind === "expense")
      byMethod.set(r.method, (byMethod.get(r.method) ?? 0) + r.amountCents)
  }

  return { income, expense, balance: income - expense, byCategory, byMethod }
}
