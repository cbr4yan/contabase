import { requireUser } from "@/lib/session"
import {
  activeCategories,
  allCategories,
  monthTransactions,
  rangeTransactions,
  summarize,
} from "@/lib/queries"
import {
  amountColor,
  currentMonth,
  isDate,
  isMonth,
  money,
} from "@/lib/config"
import { FilterBar } from "@/components/filter-bar"
import { TransactionList } from "@/components/transaction-list"

export default async function ListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await requireUser()
  const sp = await searchParams
  const kind = sp.kind
  const cat = sp.cat

  // Range mode when both ?from and ?to are valid dates; otherwise month mode.
  const from = isDate(sp.from) ? sp.from : null
  const to = isDate(sp.to) ? sp.to : null
  const month = isMonth(sp.month) ? sp.month : currentMonth()

  const [all, active, everything] = await Promise.all([
    from && to
      ? rangeTransactions(user.companyId, from <= to ? from : to, from <= to ? to : from)
      : monthTransactions(user.companyId, month),
    activeCategories(user.companyId),
    allCategories(user.companyId),
  ])

  let rows = all
  if (kind === "expense" || kind === "income")
    rows = rows.filter((r) => r.kind === kind)
  if (typeof cat === "string" && cat)
    rows = rows.filter((r) => r.categoryId === cat)

  const s = summarize(rows)
  const n = rows.length

  return (
    <div>
      <FilterBar categories={everything} />
      <div className="flex items-baseline justify-between border-b px-4 py-2 text-xs text-muted-foreground">
        <span>
          {n} {n === 1 ? "movimiento" : "movimientos"}
        </span>
        <span className="tabular-nums">
          <span className={amountColor("income")}>+{money(s.income)}</span>{" "}
          <span className={amountColor("expense")}>−{money(s.expense)}</span>
        </span>
      </div>
      <TransactionList
        rows={rows}
        categories={active}
        userId={user.id}
        isAdmin={user.role === "admin"}
      />
    </div>
  )
}
