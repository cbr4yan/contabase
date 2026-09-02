"use client"

import { RiAttachmentLine, RiDeleteBin6Line } from "@remixicon/react"

import { deleteTransaction } from "@/app/actions/transactions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty"
import { TransactionSheet } from "@/components/transaction-sheet"
import { LOCALE, METHOD_LABELS, money } from "@/lib/config"
import { cn } from "@/lib/utils"
import type { Category } from "@/lib/schema"
import type { TxRow } from "@/lib/queries"

const DATE_FMT = new Intl.DateTimeFormat(LOCALE, {
  weekday: "short",
  month: "short",
  day: "numeric",
})

export function TransactionList({
  rows,
  categories,
  userId,
  isAdmin,
}: {
  rows: TxRow[]
  categories: Category[]
  userId: string
  isAdmin: boolean
}) {
  if (rows.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyDescription>
            Aún no hay movimientos. Pulsa + para añadir uno.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const groups = new Map<string, TxRow[]>()
  for (const r of rows) {
    const list = groups.get(r.occurredOn) ?? []
    list.push(r)
    groups.set(r.occurredOn, list)
  }

  return (
    <div className="divide-y">
      {[...groups.entries()].map(([date, items]) => (
        <div key={date}>
          <div className="bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            {DATE_FMT.format(new Date(date + "T00:00:00"))}
          </div>
          <div className="divide-y">
            {items.map((r) => {
              const canEdit = isAdmin || r.createdBy === userId
              const row = (
                <span className="flex items-center gap-3 px-4 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {r.note || r.categoryName || "Sin categoría"}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Badge variant="outline">{METHOD_LABELS[r.method]}</Badge>
                      {r.photoKey && (
                        <RiAttachmentLine
                          className="size-3.5 shrink-0"
                          aria-label="Con foto"
                        />
                      )}
                      {r.note && r.categoryName && (
                        <span className="truncate">{r.categoryName}</span>
                      )}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-sm font-semibold tabular-nums",
                      r.kind === "income" && "text-green-600 dark:text-green-500"
                    )}
                  >
                    {r.kind === "income" ? "+" : "−"}
                    {money(r.amountCents)}
                  </span>
                </span>
              )

              if (!canEdit)
                return (
                  <div key={r.id} className="[&>span]:flex">
                    {row}
                  </div>
                )

              return (
                <div key={r.id} className="flex items-stretch">
                  <TransactionSheet
                    categories={categories}
                    tx={{
                      id: r.id,
                      kind: r.kind,
                      amountCents: r.amountCents,
                      method: r.method,
                      categoryId: r.categoryId,
                      note: r.note,
                      occurredOn: r.occurredOn,
                      photoKey: r.photoKey,
                    }}
                    trigger={
                      <button type="button" className="min-w-0 flex-1 text-left">
                        {row}
                      </button>
                    }
                  />
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <button
                          type="button"
                          aria-label="Eliminar"
                          className="flex w-11 shrink-0 items-center justify-center text-muted-foreground"
                        >
                          <RiDeleteBin6Line className="size-4" />
                        </button>
                      }
                    />
                    <AlertDialogContent>
                      <AlertDialogTitle>¿Eliminar movimiento?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                      <form action={deleteTransaction}>
                        <input type="hidden" name="id" value={r.id} />
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction type="submit" variant="destructive">
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </form>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
