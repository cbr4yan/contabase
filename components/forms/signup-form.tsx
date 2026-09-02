"use client"

import { useActionState } from "react"
import Link from "next/link"

import { signup } from "@/app/actions/auth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PinField } from "@/components/pin-field"
import { SubmitButton } from "@/components/submit-button"

export function SignupForm() {
  const [state, action] = useActionState(signup, {})

  return (
    <form action={action} className="flex min-h-svh flex-col p-6">
      <div className="flex-1 space-y-5 pt-12">
        <div>
          <h1 className="text-xl font-semibold">Crea tu empresa</h1>
          <p className="text-sm text-muted-foreground">
            Serás el administrador. Añade a tu equipo después.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company">Nombre de la empresa</Label>
          <Input id="company" name="company" required className="h-12 text-base" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">Tu nombre</Label>
          <Input id="name" name="name" required className="h-12 text-base" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Número de teléfono</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            required
            placeholder="612 345 678"
            className="h-12 text-base"
          />
        </div>
        <PinField label="Elige un PIN de 4 dígitos" />
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
      <div className="space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <SubmitButton>Crear empresa</SubmitButton>
        <p className="text-center text-xs text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </form>
  )
}
