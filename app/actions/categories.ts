"use server"

import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { categories } from "@/lib/schema"
import { requireAdmin } from "@/lib/session"
import { KINDS } from "@/lib/config"

export async function saveCategory(formData: FormData) {
  const admin = await requireAdmin()
  const id = String(formData.get("id") ?? "")
  const name = String(formData.get("name") ?? "").trim()
  const kind = String(formData.get("kind") ?? "")

  if (!name || !KINDS.includes(kind as never)) return

  if (id) {
    await db
      .update(categories)
      .set({ name, kind: kind as "expense" | "income" })
      .where(
        and(eq(categories.id, id), eq(categories.companyId, admin.companyId))
      )
  } else {
    await db.insert(categories).values({
      companyId: admin.companyId,
      name,
      kind: kind as "expense" | "income",
    })
  }
  revalidatePath("/", "layout")
}

export async function toggleArchiveCategory(formData: FormData) {
  const admin = await requireAdmin()
  const id = String(formData.get("id") ?? "")
  const archived = String(formData.get("archived") ?? "") === "true"

  await db
    .update(categories)
    .set({ archived: !archived })
    .where(and(eq(categories.id, id), eq(categories.companyId, admin.companyId)))
  revalidatePath("/", "layout")
}
