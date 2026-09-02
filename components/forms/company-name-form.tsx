"use client"

import { useActionState, useEffect } from "react"
import { toast } from "sonner"

import { renameCompany } from "@/app/actions/members"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function CompanyNameForm({ name }: { name: string }) {
  const [state, action] = useActionState(renameCompany, {})

  useEffect(() => {
    if (state.ok) toast.success("Nombre de la empresa actualizado")
  }, [state])

  return (
    <form action={action} className="flex gap-2">
      <Input name="name" defaultValue={name} required className="h-11 text-base" />
      <Button type="submit" variant="outline" className="h-11 shrink-0">
        Guardar
      </Button>
    </form>
  )
}
