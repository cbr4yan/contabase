/* Verify R2 credentials with a put -> read -> delete round-trip.
   node --env-file=.env scripts/check-r2.ts */
import assert from "node:assert/strict"

if (!process.env.R2_ACCOUNT_ID) {
  console.error("R2_ACCOUNT_ID not set — nothing to check.")
  process.exit(1)
}

const { storage } = await import("../lib/storage.ts")

const payload = new TextEncoder().encode("contabase r2 check " + Date.now())
const key = await storage.put(payload, "image/webp")
console.log("put   ->", key)

const got = await storage.read(key)
assert.ok(got, "read returned null")
assert.deepEqual([...got.bytes], [...payload], "bytes differ")
console.log("read  -> ok")

await storage.delete(key)
assert.equal(await storage.read(key), null, "still present after delete")
console.log("delete-> ok")

console.log("\nR2 OK — bucket is writable and readable.")
