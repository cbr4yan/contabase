// App-wide constants. Single currency by design — swap these two lines
// (and add a per-company column) if you ever need multi-currency.
export const CURRENCY = "EUR"
export const LOCALE = "es-ES"

export const METHODS = ["cash", "card", "bank"] as const
export const KINDS = ["expense", "income"] as const

export const METHOD_LABELS: Record<(typeof METHODS)[number], string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  bank: "Banco",
}
export const KIND_LABELS: Record<(typeof KINDS)[number], string> = {
  expense: "Gasto",
  income: "Ingreso",
}
export const ROLE_LABELS: Record<"admin" | "employee", string> = {
  admin: "Administrador",
  employee: "Empleado",
}

// PIN lockout. 4 digits = 10k combos, so the lockout is the real defense.
export const MAX_ATTEMPTS = 5
export const LOCK_MINUTES = 15 // ponytail: flat lockout; add escalating tiers if abused

export const SESSION_COOKIE = "cb_session"
export const SESSION_DAYS = 30

// Public company registration. Off unless SIGNUP_ENABLED=true. Server-only.
export const signupEnabled = () => process.env.SIGNUP_ENABLED === "true"

const fmt = new Intl.NumberFormat(LOCALE, { style: "currency", currency: CURRENCY })
export const money = (cents: number) => fmt.format(cents / 100)

// Spain only — anchor "today"/"this month" to Madrid, not the server's UTC clock,
// so entries near midnight/month-end don't land on the wrong day.
export const TZ = "Europe/Madrid"
const dateFmt = new Intl.DateTimeFormat("sv-SE", { timeZone: TZ }) // -> YYYY-MM-DD
export const today = () => dateFmt.format(new Date())
export const currentMonth = () => today().slice(0, 7)
export const monthOf = (isoDate: string) => isoDate.slice(0, 7) // YYYY-MM
export const isMonth = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}$/.test(v)
