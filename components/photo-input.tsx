"use client"

import * as React from "react"
import { RiImageAddLine, RiCloseLine } from "@remixicon/react"

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const MAX_DIM = 1600
const QUALITY = 0.7

async function compress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("compress failed"))),
      "image/jpeg",
      QUALITY
    )
  )
}

export function PhotoInput({ existingKey }: { existingKey?: string | null }) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [preview, setPreview] = React.useState<string | null>(
    existingKey ? `/media/${existingKey}` : null
  )
  const [removed, setRemoved] = React.useState(false)
  const [busy, setBusy] = React.useState(false)

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      const blob = await compress(file)
      const dt = new DataTransfer()
      dt.items.add(new File([blob], "photo.jpg", { type: "image/jpeg" }))
      if (inputRef.current) inputRef.current.files = dt.files
      setPreview(URL.createObjectURL(blob))
      setRemoved(false)
    } finally {
      setBusy(false)
    }
  }

  function clear() {
    if (inputRef.current) inputRef.current.value = ""
    setPreview(null)
    setRemoved(true)
  }

  return (
    <div className="space-y-1.5">
      <Label>Foto (opcional)</Label>
      {/* tells the server to drop the existing photo */}
      {removed && <input type="hidden" name="removePhoto" value="1" />}

      {preview ? (
        <div className="relative w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Foto adjunta"
            className="max-h-48 rounded-none border object-contain"
          />
          <Button
            type="button"
            size="icon"
            variant="secondary"
            aria-label="Quitar foto"
            onClick={clear}
            className="absolute top-1 right-1 size-7"
          >
            <RiCloseLine />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="h-11 w-full gap-2"
        >
          <RiImageAddLine className="size-4" />
          {busy ? "Procesando…" : "Añadir foto"}
        </Button>
      )}

      {/* no `capture` attr: lets the user choose camera *or* gallery */}
      <input
        ref={inputRef}
        type="file"
        name="photo"
        accept="image/*"
        onChange={onChange}
        className="hidden"
      />
    </div>
  )
}
