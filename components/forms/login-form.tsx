"use client"

import { useActionState } from "react"
import Link from "next/link"

import { login } from "@/app/actions/auth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PinField } from "@/components/pin-field"
import { SubmitButton } from "@/components/submit-button"

export function LoginForm({ signupEnabled = false }: { signupEnabled?: boolean }) {
  const [state, action] = useActionState(login, {})

  return (
    <form action={action} className="flex min-h-svh flex-col p-6">
      <div className="flex-1 space-y-6 pt-12">
        <div>
          <h1 className="text-xl font-semibold">Contabase</h1>
          <p className="text-sm text-muted-foreground">
            Inicia sesión en tu cuenta
          </p>
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
        <PinField label="PIN de 4 dígitos" />
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
      <div className="space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <SubmitButton>Iniciar sesión</SubmitButton>
        {signupEnabled && (
          <p className="text-center text-xs text-muted-foreground">
            ¿Empresa nueva?{" "}
            <Link href="/signup" className="underline">
              Crear una
            </Link>
          </p>
        )}
      </div>
    </form>
  )
}
