"use client"

import { useActionState } from "react"

import { changePin } from "@/app/actions/auth"
import { PinField } from "@/components/pin-field"
import { SubmitButton } from "@/components/submit-button"

export function ChangePinForm({ forced = false }: { forced?: boolean }) {
  const [state, action] = useActionState(changePin, {})

  return (
    <form action={action} className="flex min-h-svh flex-col p-6">
      <div className="flex-1 space-y-6 pt-12">
        <div>
          <h1 className="text-xl font-semibold">
            {forced ? "Establece tu PIN" : "Cambiar PIN"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {forced
              ? "Elige un PIN nuevo de 4 dígitos para terminar de configurar tu cuenta."
              : "Introduce tu PIN actual y luego elige uno nuevo."}
          </p>
        </div>
        {!forced && <PinField name="current" label="PIN actual" autoFocus />}
        <PinField name="pin" label="PIN nuevo" autoFocus={forced} />
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
      <div className="pb-[max(1rem,env(safe-area-inset-bottom))]">
        <SubmitButton>Guardar PIN</SubmitButton>
      </div>
    </form>
  )
}
