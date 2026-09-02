"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { FormSelect } from "@/components/form-select"
import { MonthNav } from "@/components/month-nav"
import { currentMonth, today } from "@/lib/config"
import type { Category } from "@/lib/schema"

export function FilterBar({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  function push(next: URLSearchParams) {
    router.replace(`${pathname}?${next.toString()}`)
  }

  function set(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value && value !== "all") next.set(key, value)
    else next.delete(key)
    push(next)
  }

  const from = params.get("from")
  const to = params.get("to")
  const isRange = from !== null || to !== null

  function setMode(mode: string) {
    const next = new URLSearchParams(params)
    if (mode === "range") {
      next.delete("month")
      next.set("from", `${currentMonth()}-01`)
      next.set("to", today())
    } else {
      next.delete("from")
      next.delete("to")
    }
    push(next)
  }

  const hasCatKind = params.has("kind") || params.has("cat")

  return (
    <div className="space-y-2 border-b p-3">
      <div className="flex items-center justify-between gap-2">
        <ToggleGroup
          value={[isRange ? "range" : "month"]}
          onValueChange={(v) => v[0] && setMode(v[0])}
          variant="outline"
          spacing={0}
        >
          <ToggleGroupItem value="month" className="h-8 px-3">
            Mes
          </ToggleGroupItem>
          <ToggleGroupItem value="range" className="h-8 px-3">
            Rango
          </ToggleGroupItem>
        </ToggleGroup>
        {hasCatKind && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const next = new URLSearchParams(params)
              next.delete("kind")
              next.delete("cat")
              push(next)
            }}
          >
            Limpiar
          </Button>
        )}
      </div>

      {isRange ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="from" className="text-xs text-muted-foreground">
              Desde
            </Label>
            <Input
              id="from"
              type="date"
              value={from ?? ""}
              max={to ?? undefined}
              onChange={(e) => set("from", e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="to" className="text-xs text-muted-foreground">
              Hasta
            </Label>
            <Input
              id="to"
              type="date"
              value={to ?? ""}
              min={from ?? undefined}
              onChange={(e) => set("to", e.target.value)}
              className="h-9"
            />
          </div>
        </div>
      ) : (
        <MonthNav />
      )}

      <div className="grid grid-cols-2 gap-2">
        <FormSelect
          className="h-9"
          value={params.get("kind") ?? "all"}
          onValueChange={(v) => set("kind", v)}
          options={[
            { label: "Todos", value: "all" },
            { label: "Gastos", value: "expense" },
            { label: "Ingresos", value: "income" },
          ]}
        />
        <FormSelect
          className="h-9"
          value={params.get("cat") ?? "all"}
          onValueChange={(v) => set("cat", v)}
          options={[
            { label: "Categoría", value: "all" },
            ...categories.map((c) => ({ label: c.name, value: c.id })),
          ]}
        />
      </div>
    </div>
  )
}
