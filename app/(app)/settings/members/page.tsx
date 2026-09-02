import Link from "next/link"
import { RiAddLine, RiArrowLeftLine, RiArrowRightSLine } from "@remixicon/react"

import { requireAdmin } from "@/lib/session"
import { companyMembers } from "@/lib/queries"
import { ROLE_LABELS } from "@/lib/config"
import { MemberSheet } from "@/components/forms/member-sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default async function MembersPage() {
  const admin = await requireAdmin()
  const members = await companyMembers(admin.companyId)

  return (
    <div>
      <header className="flex items-center gap-2 border-b p-4">
        <Link href="/settings" aria-label="Atrás">
          <RiArrowLeftLine className="size-5" />
        </Link>
        <h1 className="text-lg font-semibold">Miembros</h1>
        <MemberSheet
          trigger={
            <Button size="icon" aria-label="Añadir miembro" className="ml-auto">
              <RiAddLine />
            </Button>
          }
        />
      </header>

      <div className="divide-y">
        {members.map((m) => (
          <MemberSheet
            key={m.id}
            member={m}
            isSelf={m.id === admin.id}
            trigger={
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-3 text-left"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {m.name}
                    {m.id === admin.id && (
                      <span className="text-muted-foreground"> (tú)</span>
                    )}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {m.phone}
                  </span>
                </span>
                <Badge variant="outline">{ROLE_LABELS[m.role]}</Badge>
                {!m.active && <Badge variant="destructive">Inactivo</Badge>}
                <RiArrowRightSLine className="size-4 text-muted-foreground" />
              </button>
            }
          />
        ))}
      </div>
    </div>
  )
}
