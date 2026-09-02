import { requireUser } from "@/lib/session"
import { monthTransactions, summarize } from "@/lib/queries"
import {
  KIND_LABELS,
  METHOD_LABELS,
  amountColor,
  currentMonth,
  isMonth,
  money,
} from "@/lib/config"
import { cn } from "@/lib/utils"
import { MonthNav } from "@/components/month-nav"
import { Card, CardContent, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty"

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await requireUser()
  const sp = await searchParams
  const month = isMonth(sp.month) ? sp.month : currentMonth()
  const rows = await monthTransactions(user.companyId, month)
  const s = summarize(rows)

  const categoryRows = [...s.byCategory.entries()]
    .map(([key, cents]) => {
      const [kind, name] = key.split(/:(.+)/)
      return { kind: kind as "expense" | "income", name, cents }
    })
    .sort((a, b) => b.cents - a.cents)

  const maxCat = Math.max(1, ...categoryRows.map((r) => r.cents))

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Informes</h1>
        <MonthNav />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Ingresos" value={money(s.income)} tone={amountColor("income")} />
        <Stat label="Gastos" value={money(s.expense)} tone={amountColor("expense")} />
        <Stat
          label="Balance"
          value={money(s.balance)}
          tone={s.balance < 0 ? amountColor("expense") : undefined}
        />
      </div>

      <section className="space-y-3">
        <h2 className="text-xs font-medium text-muted-foreground">
          Por categoría
        </h2>
        {categoryRows.length === 0 ? (
          <Empty className="py-6">
            <EmptyHeader>
              <EmptyDescription>Sin datos este mes.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          categoryRows.map((r) => (
            <div key={`${r.kind}-${r.name}`}>
              <div className="flex justify-between text-xs">
                <span>
                  {r.name}
                  <span className="text-muted-foreground">
                    {" · "}
                    {KIND_LABELS[r.kind].toLowerCase()}
                  </span>
                </span>
                <span className="tabular-nums">{money(r.cents)}</span>
              </div>
              <Progress
                value={(r.cents / maxCat) * 100}
                aria-hidden
                className={cn(
                  "mt-1",
                  r.kind === "income"
                    ? "[&_[data-slot=progress-indicator]]:bg-green-600 dark:[&_[data-slot=progress-indicator]]:bg-green-500"
                    : "[&_[data-slot=progress-indicator]]:bg-red-600 dark:[&_[data-slot=progress-indicator]]:bg-red-500"
                )}
              />
            </div>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-medium text-muted-foreground">
          Gastos por método
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {(["cash", "card", "bank"] as const).map((m) => (
            <Stat
              key={m}
              label={METHOD_LABELS[m]}
              value={money(s.byMethod.get(m) ?? 0)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: string
}) {
  return (
    <Card size="sm" className="text-center">
      <CardContent>
        <CardDescription className="text-[10px]">{label}</CardDescription>
        <p className={cn("text-sm font-semibold tabular-nums", tone)}>{value}</p>
      </CardContent>
    </Card>
  )
}
