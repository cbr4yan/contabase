"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Input } from "@/components/ui/input"
import { currentMonth } from "@/lib/config"

export function MonthPicker() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const month = params.get("month") ?? currentMonth()

  return (
    <Input
      type="month"
      value={month}
      onChange={(e) => router.replace(`${pathname}?month=${e.target.value}`)}
      className="h-9 w-auto"
    />
  )
}
