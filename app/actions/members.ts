"use server"

import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"

import { db, isUniqueViolation } from "@/lib/db"
import { companies, users } from "@/lib/schema"
import { hashPin, normalizePhone, validPhone, validPin } from "@/lib/auth"
import { requireAdmin } from "@/lib/session"

export type MemberState = { error?: string; ok?: boolean }

export async function addMember(
  _prev: MemberState,
  formData: FormData
): Promise<MemberState> {
  const admin = await requireAdmin()
  const name = String(formData.get("name") ?? "").trim()
  const phone = normalizePhone(String(formData.get("phone") ?? ""))
  const role = String(formData.get("role") ?? "employee")
  const pin = String(formData.get("pin") ?? "")

  if (!name) return { error: "El nombre es obligatorio." }
  if (!validPhone(phone)) return { error: "Introduce un teléfono válido." }
  if (!validPin(pin)) return { error: "El PIN temporal debe tener 4 dígitos." }
  if (role !== "employee" && role !== "admin") return { error: "Rol no válido." }

  const existing = await db.query.users.findFirst({ where: eq(users.phone, phone) })
  if (existing) return { error: "Ese teléfono ya está registrado." }

  try {
    await db.insert(users).values({
      companyId: admin.companyId,
      phone,
      name,
      role: role as "employee" | "admin",
      pinHash: await hashPin(pin),
      mustChangePin: true,
    })
  } catch (e) {
    if (isUniqueViolation(e)) return { error: "Ese teléfono ya está registrado." }
    throw e
  }
  revalidatePath("/settings/members")
  return { ok: true }
}

export async function renameCompany(
  _prev: MemberState,
  formData: FormData
): Promise<MemberState> {
  const admin = await requireAdmin()
  const name = String(formData.get("name") ?? "").trim()
  if (!name) return { error: "El nombre es obligatorio." }

  await db.update(companies).set({ name }).where(eq(companies.id, admin.companyId))
  revalidatePath("/", "layout")
  return { ok: true }
}

export async function resetMemberPin(formData: FormData) {
  const admin = await requireAdmin()
  const id = String(formData.get("id") ?? "")
  const pin = String(formData.get("pin") ?? "")
  if (!validPin(pin)) return

  await db
    .update(users)
    .set({
      pinHash: await hashPin(pin),
      mustChangePin: true,
      failedAttempts: 0,
      lockedUntil: null,
    })
    .where(and(eq(users.id, id), eq(users.companyId, admin.companyId)))
  revalidatePath("/settings/members")
}

export async function setMemberActive(formData: FormData) {
  const admin = await requireAdmin()
  const id = String(formData.get("id") ?? "")
  const active = String(formData.get("active") ?? "") === "true"
  if (id === admin.id) return

  await db
    .update(users)
    .set({ active })
    .where(and(eq(users.id, id), eq(users.companyId, admin.companyId)))
  revalidatePath("/settings/members")
}
