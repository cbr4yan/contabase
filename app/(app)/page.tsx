import { requireUser } from "@/lib/session"
import { monthTransactions, summarize } from "@/lib/queries"
import { LOCALE, amountColor, currentMonth, money } from "@/lib/config"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty"

const MONTH_FMT = new Intl.DateTimeFormat(LOCALE, {
  month: "long",
  year: "numeric",
})

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export default async function HomePage() {
  const user = await requireUser()
  const month = currentMonth()
  const rows = await monthTransactions(user.companyId, month)
  const s = summarize(rows)

  const allGastos = [...s.byCategory.entries()]
    .filter(([k]) => k.startsWith("expense:"))
    .map(([k, cents]) => ({ name: k.slice("expense:".length), cents }))
    .sort((a, b) => b.cents - a.cents)
  const gastos = allGastos.slice(0, 6)
  const rest = allGastos.slice(6)
  if (rest.length)
    gastos.push({
      name: `Otras (${rest.length})`,
      cents: rest.reduce((sum, g) => sum + g.cents, 0),
    })
  const max = Math.max(1, ...gastos.map((g) => g.cents))

  return (
    <div>
      <header className="space-y-2 p-4">
        <p className="text-xs text-muted-foreground">
          {cap(MONTH_FMT.format(new Date(month + "-01T00:00:00")))}
        </p>
        <p
          className={cn(
            "text-4xl font-semibold tabular-nums",
            s.balance < 0 && "text-destructive"
          )}
        >
          {money(s.balance)}
        </p>
        <div className="flex gap-4 text-sm">
          <span>
            <span className="text-muted-foreground">Ingresos </span>
            <span className={cn("tabular-nums", amountColor("income"))}>
              {money(s.income)}
            </span>
          </span>
          <span>
            <span className="text-muted-foreground">Gastos </span>
            <span className={cn("tabular-nums", amountColor("expense"))}>
              {money(s.expense)}
            </span>
          </span>
        </div>
      </header>

      <section className="border-t p-4">
        <h2 className="mb-3 text-xs font-medium text-muted-foreground">
          Gastos por categoría
        </h2>
        {gastos.length === 0 ? (
          <Empty className="py-6">
            <EmptyHeader>
              <EmptyDescription>
                Sin gastos registrados este mes.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="space-y-3">
            {gastos.map((g) => (
              <li key={g.name}>
                <div className="flex justify-between text-sm">
                  <span>{g.name}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {money(g.cents)}
                  </span>
                </div>
                <Progress
                  value={(g.cents / max) * 100}
                  aria-hidden
                  className="mt-1 [&_[data-slot=progress-indicator]]:bg-red-600 dark:[&_[data-slot=progress-indicator]]:bg-red-500"
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
