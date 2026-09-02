"use server"

import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { transactions } from "@/lib/schema"
import { requireUser } from "@/lib/session"
import { storage } from "@/lib/storage"
import { KINDS, METHODS } from "@/lib/config"

export type TxState = { error?: string; ok?: boolean }

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_PHOTO_BYTES = 5_000_000

function parseAmount(raw: string): number | null {
  let s = raw.trim().replace(/\s/g, "")
  // "1.234,56" -> "1234.56"; "1234,56" -> "1234.56"
  if (s.includes(",") && s.includes(".")) s = s.replace(/\./g, "").replace(",", ".")
  else s = s.replace(",", ".")
  const n = Number(s)
  if (!Number.isFinite(n) || n <= 0 || n > 1e12) return null
  return Math.round(n * 100)
}

/** undefined = leave photo untouched, null = remove it, string = new key */
async function resolvePhoto(
  formData: FormData
): Promise<string | null | undefined | { error: string }> {
  const photo = formData.get("photo")
  if (photo instanceof File && photo.size > 0) {
    if (!IMAGE_TYPES.includes(photo.type))
      return { error: "Formato de imagen no admitido." }
    if (photo.size > MAX_PHOTO_BYTES)
      return { error: "La imagen es demasiado grande." }
    return storage.put(new Uint8Array(await photo.arrayBuffer()), photo.type)
  }
  if (formData.get("removePhoto") === "1") return null
  return undefined
}

export async function saveTransaction(formData: FormData): Promise<TxState> {
  const user = await requireUser()

  const id = String(formData.get("id") ?? "")
  const kind = String(formData.get("kind") ?? "")
  const method = String(formData.get("method") ?? "")
  const categoryId = String(formData.get("categoryId") ?? "") || null
  const occurredOn = String(formData.get("occurredOn") ?? "")
  const note = String(formData.get("note") ?? "").trim() || null
  const amountCents = parseAmount(String(formData.get("amount") ?? ""))

  if (!KINDS.includes(kind as never)) return { error: "Elige gasto o ingreso." }
  if (!METHODS.includes(method as never)) return { error: "Elige un método." }
  if (amountCents === null) return { error: "Introduce un importe válido." }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(occurredOn)) return { error: "Elige una fecha." }

  const values = {
    kind: kind as "expense" | "income",
    method: method as "cash" | "card" | "bank",
    categoryId,
    occurredOn,
    note,
    amountCents,
  }

  const photo = await resolvePhoto(formData)
  if (photo && typeof photo === "object") return photo // { error }

  if (id) {
    const existing = await db.query.transactions.findFirst({
      where: and(
        eq(transactions.id, id),
        eq(transactions.companyId, user.companyId)
      ),
    })
    if (!existing) return { error: "No encontrado." }
    if (existing.createdBy !== user.id && user.role !== "admin")
      return { error: "Solo puedes editar tus propios movimientos." }

    await db
      .update(transactions)
      .set(photo === undefined ? values : { ...values, photoKey: photo })
      .where(eq(transactions.id, id))

    if (photo !== undefined && existing.photoKey && existing.photoKey !== photo)
      await storage.delete(existing.photoKey)
  } else {
    await db.insert(transactions).values({
      ...values,
      photoKey: typeof photo === "string" ? photo : null,
      companyId: user.companyId,
      createdBy: user.id,
    })
  }

  revalidatePath("/", "layout")
  return { ok: true }
}

export async function deleteTransaction(formData: FormData) {
  const user = await requireUser()
  const id = String(formData.get("id") ?? "")

  const existing = await db.query.transactions.findFirst({
    where: and(
      eq(transactions.id, id),
      eq(transactions.companyId, user.companyId)
    ),
  })
  if (!existing) return
  if (existing.createdBy !== user.id && user.role !== "admin") return

  await db.delete(transactions).where(eq(transactions.id, id))
  if (existing.photoKey) await storage.delete(existing.photoKey)
  revalidatePath("/", "layout")
}
