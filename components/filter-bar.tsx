"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Input } from "@/components/ui/input"
import { FormSelect } from "@/components/form-select"
import { currentMonth } from "@/lib/config"
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

  const month = params.get("month") ?? currentMonth()

  return (
    <div className="grid grid-cols-3 gap-2 border-b p-3">
      <Input
        type="month"
        value={month}
        onChange={(e) => set("month", e.target.value)}
        className="h-9"
      />
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
          { label: "Todas", value: "all" },
          ...categories.map((c) => ({ label: c.name, value: c.id })),
        ]}
      />
    </div>
  )
}
