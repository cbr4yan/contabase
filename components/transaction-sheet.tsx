"use client"

import * as React from "react"
import { toast } from "sonner"

import { saveTransaction } from "@/app/actions/transactions"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { FormSelect } from "@/components/form-select"
import { PhotoInput } from "@/components/photo-input"
import { SubmitButton } from "@/components/submit-button"
import { KIND_LABELS, METHOD_LABELS, METHODS, today } from "@/lib/config"
import type { Category, Kind, Method } from "@/lib/schema"

type EditTx = {
  id: string
  kind: Kind
  amountCents: number
  method: Method
  categoryId: string | null
  note: string | null
  occurredOn: string
  photoKey: string | null
}

export function TransactionSheet({
  categories,
  tx,
  trigger,
}: {
  categories: Category[]
  tx?: EditTx
  trigger: React.ReactElement
}) {
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState<string>()
  const [kind, setKind] = React.useState<Kind>(tx?.kind ?? "expense")
  const [method, setMethod] = React.useState<Method>(tx?.method ?? "cash")
  const [categoryId, setCategoryId] = React.useState<string | null>(
    tx?.categoryId ?? null
  )

  async function onSubmit(formData: FormData) {
    const res = await saveTransaction(formData)
    if (res?.error) {
      setError(res.error)
      return
    }
    setError(undefined)
    setOpen(false)
    toast.success(tx ? "Movimiento actualizado" : "Movimiento añadido")
  }

  const options = categories.filter((c) => c.kind === kind)
  // If the picked category doesn't belong to the current kind, show none.
  const catValue = options.some((c) => c.id === categoryId) ? categoryId : null

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger render={trigger} />
      <DrawerContent style={{ "--drawer-height": "88dvh" } as React.CSSProperties}>
        <DrawerHeader>
          <DrawerTitle>
            {tx ? "Editar movimiento" : "Nuevo movimiento"}
          </DrawerTitle>
        </DrawerHeader>

        <form action={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
            {tx && <input type="hidden" name="id" value={tx.id} />}
            <input type="hidden" name="kind" value={kind} />
            <input type="hidden" name="method" value={method} />

            <ToggleGroup
              value={[kind]}
              onValueChange={(v) => v[0] && setKind(v[0] as Kind)}
              variant="outline"
              spacing={0}
              className="w-full"
            >
              <ToggleGroupItem
                value="expense"
                className="h-11 flex-1 aria-pressed:border-red-600 aria-pressed:bg-red-600 aria-pressed:text-white aria-pressed:hover:bg-red-600"
              >
                {KIND_LABELS.expense}
              </ToggleGroupItem>
              <ToggleGroupItem
                value="income"
                className="h-11 flex-1 aria-pressed:border-green-600 aria-pressed:bg-green-600 aria-pressed:text-white aria-pressed:hover:bg-green-600"
              >
                {KIND_LABELS.income}
              </ToggleGroupItem>
            </ToggleGroup>

            <div className="space-y-1.5">
              <Label htmlFor="amount">Importe</Label>
              <Input
                id="amount"
                name="amount"
                inputMode="decimal"
                required
                autoFocus={!tx}
                defaultValue={tx ? (tx.amountCents / 100).toString() : ""}
                placeholder="0,00"
                className="h-14 text-center text-3xl font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="categoryId">Categoría</Label>
              <FormSelect
                id="categoryId"
                name="categoryId"
                placeholder="Sin categoría"
                value={catValue}
                onValueChange={setCategoryId}
                options={options.map((c) => ({ label: c.name, value: c.id }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Método</Label>
              <ToggleGroup
                value={[method]}
                onValueChange={(v) => v[0] && setMethod(v[0] as Method)}
                variant="outline"
                spacing={0}
                className="w-full"
              >
                {METHODS.map((m) => (
                  <ToggleGroupItem key={m} value={m} className="h-11 flex-1">
                    {METHOD_LABELS[m]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="occurredOn">Fecha</Label>
              <Input
                id="occurredOn"
                name="occurredOn"
                type="date"
                required
                defaultValue={tx?.occurredOn ?? today()}
                className="h-11 text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note">Nota (opcional)</Label>
              <Input
                id="note"
                name="note"
                defaultValue={tx?.note ?? ""}
                className="h-11 text-base"
              />
            </div>

            <PhotoInput existingKey={tx?.photoKey} />

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="shrink-0 border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <SubmitButton>
              {tx ? "Guardar cambios" : "Añadir movimiento"}
            </SubmitButton>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
