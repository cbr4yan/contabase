import { redirect } from "next/navigation"

import { requireUser } from "@/lib/session"
import { activeCategories } from "@/lib/queries"
import { BottomNav } from "@/components/bottom-nav"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()
  if (user.mustChangePin) redirect("/set-pin")

  const categories = await activeCategories(user.companyId)

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col">
      <main className="flex-1 pb-24">{children}</main>
      <BottomNav categories={categories} />
    </div>
  )
}
