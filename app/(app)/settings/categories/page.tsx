import Link from "next/link"
import { RiAddLine, RiArrowLeftLine, RiArrowRightSLine } from "@remixicon/react"

import { requireAdmin } from "@/lib/session"
import { allCategories } from "@/lib/queries"
import { CategorySheet } from "@/components/forms/category-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default async function CategoriesPage() {
  const admin = await requireAdmin()
  const cats = await allCategories(admin.companyId)

  return (
    <div>
      <header className="flex items-center gap-2 border-b p-4">
        <Link href="/settings" aria-label="Atrás">
          <RiArrowLeftLine className="size-5" />
        </Link>
        <h1 className="text-lg font-semibold">Categorías</h1>
        <CategorySheet
          trigger={
            <Button size="icon" aria-label="Añadir categoría" className="ml-auto">
              <RiAddLine />
            </Button>
          }
        />
      </header>

      <div className="divide-y">
        {cats.map((c) => (
          <CategorySheet
            key={c.id}
            category={c}
            trigger={
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-3 text-left"
              >
                <span
                  className={
                    c.archived
                      ? "flex-1 text-muted-foreground line-through"
                      : "flex-1"
                  }
                >
                  {c.name}
                </span>
                <Badge variant="outline">
                  {c.kind === "income" ? "Ingreso" : "Gasto"}
                </Badge>
                <RiArrowRightSLine className="size-4 text-muted-foreground" />
              </button>
            }
          />
        ))}
      </div>
    </div>
  )
}
