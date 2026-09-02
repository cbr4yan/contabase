import Link from "next/link"
import { eq } from "drizzle-orm"
import { RiArrowRightSLine } from "@remixicon/react"

import { db } from "@/lib/db"
import { companies } from "@/lib/schema"
import { ROLE_LABELS } from "@/lib/config"
import { requireUser } from "@/lib/session"
import { CompanyNameForm } from "@/components/forms/company-name-form"
import { LogoutButton } from "@/components/logout-button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"

export default async function SettingsPage() {
  const user = await requireUser()
  const company = await db.query.companies.findFirst({
    where: eq(companies.id, user.companyId),
  })

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-lg font-semibold">Ajustes</h1>

      <section className="space-y-2">
        <h2 className="text-xs font-medium text-muted-foreground">Cuenta</h2>
        <ItemGroup className="gap-0">
          <InfoRow label="Nombre" value={user.name} />
          <InfoRow label="Teléfono" value={user.phone} />
          <InfoRow label="Rol" value={ROLE_LABELS[user.role]} />
          <Item variant="outline" render={<Link href="/set-pin" />}>
            <ItemContent>
              <ItemTitle>Cambiar PIN</ItemTitle>
            </ItemContent>
            <RiArrowRightSLine className="size-4 text-muted-foreground" />
          </Item>
        </ItemGroup>
      </section>

      {user.role === "admin" && (
        <section className="space-y-2">
          <h2 className="text-xs font-medium text-muted-foreground">Empresa</h2>
          <CompanyNameForm name={company?.name ?? ""} />
          <ItemGroup className="gap-0">
            <NavRow href="/settings/categories" label="Categorías" />
            <NavRow href="/settings/members" label="Miembros" />
          </ItemGroup>
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-xs font-medium text-muted-foreground">Apariencia</h2>
        <ThemeToggle />
      </section>

      <LogoutButton />
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Item variant="outline">
      <ItemContent>
        <ItemDescription>{label}</ItemDescription>
      </ItemContent>
      <span className="text-sm">{value}</span>
    </Item>
  )
}

function NavRow({ href, label }: { href: string; label: string }) {
  return (
    <Item variant="outline" render={<Link href={href} />}>
      <ItemContent>
        <ItemTitle>{label}</ItemTitle>
      </ItemContent>
      <RiArrowRightSLine className="size-4 text-muted-foreground" />
    </Item>
  )
}
