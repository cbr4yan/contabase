import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"

import { SESSION_COOKIE, SESSION_DAYS } from "./config"
import { db } from "./db"
import { users } from "./schema"
import { signSession, verifySession, type SessionPayload } from "./jwt"

export type { SessionPayload }

export async function createSession(payload: SessionPayload) {
  const token = await signSession(payload)
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  })
}

export async function destroySession() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

export async function getSession() {
  const store = await cookies()
  return verifySession(store.get(SESSION_COOKIE)?.value)
}

/** Load the live user row. Redirects to /login if there is no session, or to
 *  /logout (which clears the stale cookie) if the account is gone or
 *  deactivated — so a deactivated employee loses access immediately. */
export async function requireUser() {
  const s = await getSession()
  if (!s) redirect("/login")

  const user = await db.query.users.findFirst({ where: eq(users.id, s.userId) })
  if (!user || !user.active) redirect("/logout")
  return user
}

export async function requireAdmin() {
  const user = await requireUser()
  if (user.role !== "admin") redirect("/")
  return user
}
