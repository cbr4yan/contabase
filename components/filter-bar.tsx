"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { currentMonth } from "@/lib/config"
import type { Category } from "@/lib/schema"

export function FilterBar({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  function set(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
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
      <NativeSelect
        className="w-full [&_select]:h-9"
        value={params.get("kind") ?? ""}
        onChange={(e) => set("kind", e.target.value)}
      >
        <NativeSelectOption value="">Todos</NativeSelectOption>
        <NativeSelectOption value="expense">Gastos</NativeSelectOption>
        <NativeSelectOption value="income">Ingresos</NativeSelectOption>
      </NativeSelect>
      <NativeSelect
        className="w-full [&_select]:h-9"
        value={params.get("cat") ?? ""}
        onChange={(e) => set("cat", e.target.value)}
      >
        <NativeSelectOption value="">Todas</NativeSelectOption>
        {categories.map((c) => (
          <NativeSelectOption key={c.id} value={c.id}>
            {c.name}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  )
}
