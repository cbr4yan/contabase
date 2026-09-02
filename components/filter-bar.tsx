"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { FormSelect } from "@/components/form-select"
import { MonthNav } from "@/components/month-nav"
import type { Category } from "@/lib/schema"

export function FilterBar({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  function set(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value && value !== "all") next.set(key, value)
    else next.delete(key)
    router.replace(`${pathname}?${next.toString()}`)
  }

  const hasFilters = params.has("kind") || params.has("cat")

  return (
    <div className="space-y-2 border-b p-3">
      <div className="flex items-center justify-between">
        <MonthNav />
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const next = new URLSearchParams(params)
              next.delete("kind")
              next.delete("cat")
              router.replace(`${pathname}?${next.toString()}`)
            }}
          >
            Limpiar
          </Button>
        )}
      </div>
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
