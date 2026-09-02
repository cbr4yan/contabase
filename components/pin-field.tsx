"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PinField({
  name = "pin",
  label = "PIN",
  autoFocus,
}: {
  name?: string
  label?: string
  autoFocus?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type="password"
        inputMode="numeric"
        autoComplete="off"
        pattern="[0-9]*"
        maxLength={4}
        required
        autoFocus={autoFocus}
        placeholder="••••"
        className="h-12 text-center text-2xl tracking-[0.5em]"
      />
    </div>
  )
}
