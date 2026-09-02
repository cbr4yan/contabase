import { SignJWT, jwtVerify } from "jose"

import { SESSION_DAYS } from "./config"

export type SessionPayload = {
  userId: string
  companyId: string
  role: "admin" | "employee"
}

if (!process.env.SESSION_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("SESSION_SECRET is required in production")
}
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-only-insecure-secret"
)

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret)
}

export async function verifySession(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret)
    return {
      userId: payload.userId,
      companyId: payload.companyId,
      role: payload.role,
    } as SessionPayload
  } catch {
    return null
  }
}
