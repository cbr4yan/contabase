"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { LOCALE, currentMonth } from "@/lib/config"

const FMT = new Intl.DateTimeFormat(LOCALE, { month: "long", year: "numeric" })

function shift(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

export function MonthNav() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const month = params.get("month") ?? currentMonth()

  function go(delta: number) {
    const next = new URLSearchParams(params)
    next.set("month", shift(month, delta))
    router.replace(`${pathname}?${next.toString()}`)
  }

  const label = FMT.format(new Date(month + "-01T00:00:00"))

  return (
    <div className="flex items-center">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => go(-1)}
        aria-label="Mes anterior"
      >
        <RiArrowLeftSLine />
      </Button>
      <span className="min-w-28 text-center text-sm whitespace-nowrap first-letter:uppercase">
        {label}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => go(1)}
        aria-label="Mes siguiente"
      >
        <RiArrowRightSLine />
      </Button>
    </div>
  )
}
