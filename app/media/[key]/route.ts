import { and, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { transactions } from "@/lib/schema"
import { requireUser } from "@/lib/session"
import { storage } from "@/lib/storage"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const user = await requireUser()
  const { key } = await params

  // The photo must belong to a transaction in the caller's company.
  const tx = await db.query.transactions.findFirst({
    where: and(
      eq(transactions.photoKey, key),
      eq(transactions.companyId, user.companyId)
    ),
  })
  if (!tx) return new Response("Not found", { status: 404 })

  const file = await storage.read(key)
  if (!file) return new Response("Not found", { status: 404 })

  return new Response(file.bytes as BodyInit, {
    headers: {
      "content-type": file.contentType,
      "cache-control": "private, max-age=3600",
    },
  })
}
