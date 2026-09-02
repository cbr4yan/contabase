"use server"

import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"

import { db, isUniqueViolation } from "@/lib/db"
import { companies, categories, users } from "@/lib/schema"
import { checkPin, hashPin, normalizePhone, validPhone, validPin } from "@/lib/auth"
import { createSession, destroySession, requireUser } from "@/lib/session"
import { LOCK_MINUTES, MAX_ATTEMPTS, signupEnabled } from "@/lib/config"

export type FormState = { error?: string }

// A valid bcrypt hash (of a throwaway value) used only to equalize login timing
// when the phone number isn't found.
const DUMMY_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"

const DEFAULT_CATEGORIES: { name: string; kind: "income" | "expense" }[] = [
  { name: "Nómina", kind: "income" },
  { name: "Ventas", kind: "income" },
  { name: "Otros ingresos", kind: "income" },
  { name: "Alquiler", kind: "expense" },
  { name: "Suministros", kind: "expense" },
  { name: "Material", kind: "expense" },
  { name: "Comida", kind: "expense" },
  { name: "Transporte", kind: "expense" },
  { name: "Otros gastos", kind: "expense" },
]

export async function signup(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  if (!signupEnabled()) return { error: "El registro de empresas está desactivado." }

  const company = String(formData.get("company") ?? "").trim()
  const name = String(formData.get("name") ?? "").trim()
  const phone = normalizePhone(String(formData.get("phone") ?? ""))
  const pin = String(formData.get("pin") ?? "")

  if (!company || !name)
    return { error: "La empresa y tu nombre son obligatorios." }
  if (!validPhone(phone)) return { error: "Introduce un teléfono válido." }
  if (!validPin(pin)) return { error: "El PIN debe tener 4 dígitos." }

  const existing = await db.query.users.findFirst({ where: eq(users.phone, phone) })
  if (existing) return { error: "Ese teléfono ya está registrado." }

  const pinHash = await hashPin(pin)
  let session: { userId: string; companyId: string }
  try {
    session = await db.transaction(async (tx) => {
      const [co] = await tx.insert(companies).values({ name: company }).returning()
      const [user] = await tx
        .insert(users)
        .values({ companyId: co.id, phone, pinHash, name, role: "admin" })
        .returning()
      await tx
        .insert(categories)
        .values(DEFAULT_CATEGORIES.map((c) => ({ ...c, companyId: co.id })))
      return { userId: user.id, companyId: co.id }
    })
  } catch (e) {
    if (isUniqueViolation(e))
      return { error: "Ese teléfono ya está registrado." }
    throw e
  }

  await createSession({ ...session, role: "admin" })
  redirect("/")
}

export async function login(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const phone = normalizePhone(String(formData.get("phone") ?? ""))
  const pin = String(formData.get("pin") ?? "")

  if (!validPhone(phone) || !validPin(pin))
    return { error: "Revisa el teléfono y el PIN." }

  const user = await db.query.users.findFirst({ where: eq(users.phone, phone) })
  // Same message whether or not the phone exists — don't leak which.
  const genericFail = { error: "Teléfono o PIN incorrectos." }
  if (!user || !user.active) {
    // Burn a hash comparison so response time doesn't reveal whether the
    // phone is registered.
    await checkPin(pin, DUMMY_HASH)
    return genericFail
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { error: "Demasiados intentos. Inténtalo más tarde." }
  }

  if (!(await checkPin(pin, user.pinHash))) {
    const attempts = user.failedAttempts + 1
    const locked = attempts >= MAX_ATTEMPTS
    await db
      .update(users)
      .set({
        failedAttempts: locked ? 0 : attempts,
        lockedUntil: locked
          ? new Date(Date.now() + LOCK_MINUTES * 60_000)
          : null,
      })
      .where(eq(users.id, user.id))
    return locked
      ? { error: `Demasiados intentos. Bloqueado ${LOCK_MINUTES} minutos.` }
      : genericFail
  }

  await db
    .update(users)
    .set({ failedAttempts: 0, lockedUntil: null })
    .where(eq(users.id, user.id))
  await createSession({
    userId: user.id,
    companyId: user.companyId,
    role: user.role,
  })
  redirect(user.mustChangePin ? "/set-pin" : "/")
}

export async function logout() {
  await destroySession()
  redirect("/login")
}

export async function changePin(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await requireUser()
  const current = String(formData.get("current") ?? "")
  const next = String(formData.get("pin") ?? "")

  if (!validPin(next)) return { error: "El PIN nuevo debe tener 4 dígitos." }
  if (!user.mustChangePin && !(await checkPin(current, user.pinHash)))
    return { error: "El PIN actual es incorrecto." }

  await db
    .update(users)
    .set({ pinHash: await hashPin(next), mustChangePin: false })
    .where(eq(users.id, user.id))
  redirect("/")
}
