"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  RiAddLine,
  RiBarChartBoxLine,
  RiHome5Line,
  RiListCheck2,
  RiSettings3Line,
} from "@remixicon/react"

import { TransactionSheet } from "@/components/transaction-sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Category } from "@/lib/schema"

const TABS = [
  { href: "/", label: "Inicio", icon: RiHome5Line },
  { href: "/list", label: "Movimientos", icon: RiListCheck2 },
  { href: "/reports", label: "Informes", icon: RiBarChartBoxLine },
  { href: "/settings", label: "Ajustes", icon: RiSettings3Line },
]

export function BottomNav({ categories }: { categories: Category[] }) {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md items-stretch border-t bg-background pb-[env(safe-area-inset-bottom)]">
      {TABS.slice(0, 2).map((t) => (
        <NavLink key={t.href} {...t} active={pathname === t.href} />
      ))}

      <div className="flex flex-1 items-center justify-center">
        <TransactionSheet
          categories={categories}
          trigger={
            <Button
              size="icon"
              aria-label="Añadir movimiento"
              className="-mt-6 size-14 rounded-full shadow-lg [&_svg:not([class*='size-'])]:size-6"
            >
              <RiAddLine />
            </Button>
          }
        />
      </div>

      {TABS.slice(2).map((t) => (
        <NavLink
          key={t.href}
          {...t}
          active={pathname === t.href || pathname.startsWith(t.href + "/")}
        />
      ))}
    </nav>
  )
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: typeof RiHome5Line
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]",
        active ? "text-foreground" : "text-muted-foreground"
      )}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  )
}
