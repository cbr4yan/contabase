import bcrypt from "bcryptjs"

export const hashPin = (pin: string) => bcrypt.hash(pin, 10)
export const checkPin = (pin: string, hash: string) => bcrypt.compare(pin, hash)

export const validPin = (pin: string) => /^\d{4}$/.test(pin)
// Spain only: strip everything non-digit, drop a leading 34 country code.
export const normalizePhone = (p: string) =>
  p.replace(/\D/g, "").replace(/^34(\d{9})$/, "$1")
export const validPhone = (p: string) => /^\d{9}$/.test(normalizePhone(p))
