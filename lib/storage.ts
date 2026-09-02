import { randomUUID } from "node:crypto"
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises"
import { join } from "node:path"

import { AwsClient } from "aws4fetch"

/** Object storage for receipt photos.
 *  - Production: Cloudflare R2 (set the R2_* env vars).
 *  - Local dev: files under ./.uploads (no config needed).
 *  Photos are always served through /media/[key] after an auth check —
 *  never a public URL — so both backends only need put/read/delete. */
export interface Storage {
  put(bytes: Uint8Array, contentType: string): Promise<string>
  read(key: string): Promise<{ bytes: Uint8Array; contentType: string } | null>
  delete(key: string): Promise<void>
}

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

function newKey(contentType: string) {
  return `${randomUUID()}.${EXT[contentType] ?? "bin"}`
}

const LOCAL_DIR = join(process.cwd(), ".uploads")

const localStorage: Storage = {
  async put(bytes, contentType) {
    const key = newKey(contentType)
    await mkdir(LOCAL_DIR, { recursive: true })
    await writeFile(join(LOCAL_DIR, key), bytes)
    return key
  },
  async read(key) {
    try {
      const bytes = await readFile(join(LOCAL_DIR, key))
      return { bytes, contentType: contentTypeFromKey(key) }
    } catch {
      return null
    }
  },
  async delete(key) {
    await unlink(join(LOCAL_DIR, key)).catch(() => {})
  },
}

function contentTypeFromKey(key: string) {
  const ext = key.split(".").pop() ?? ""
  return (
    Object.entries(EXT).find(([, e]) => e === ext)?.[0] ??
    "application/octet-stream"
  )
}

function r2Storage(): Storage {
  const account = process.env.R2_ACCOUNT_ID
  const bucket = process.env.R2_BUCKET
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  if (!account || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 storage needs R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY"
    )
  }
  const client = new AwsClient({
    accessKeyId,
    secretAccessKey,
    service: "s3",
    region: "auto",
  })
  const base = `https://${account}.r2.cloudflarestorage.com/${bucket}`

  return {
    async put(bytes, contentType) {
      const key = newKey(contentType)
      const res = await client.fetch(`${base}/${key}`, {
        method: "PUT",
        body: bytes as unknown as BodyInit,
        headers: { "content-type": contentType },
      })
      if (!res.ok) throw new Error(`R2 put failed: ${res.status}`)
      return key
    },
    async read(key) {
      const res = await client.fetch(`${base}/${key}`)
      if (!res.ok) return null
      return {
        bytes: new Uint8Array(await res.arrayBuffer()),
        contentType: res.headers.get("content-type") ?? contentTypeFromKey(key),
      }
    },
    async delete(key) {
      await client.fetch(`${base}/${key}`, { method: "DELETE" })
    },
  }
}

export const storage: Storage = process.env.R2_ACCOUNT_ID
  ? r2Storage()
  : localStorage
