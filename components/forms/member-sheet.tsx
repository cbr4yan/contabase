"use client"

import * as React from "react"
import { toast } from "sonner"

import { addMember, resetMemberPin, setMemberActive } from "@/app/actions/members"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { SubmitButton } from "@/components/submit-button"
import { ROLE_LABELS } from "@/lib/config"
import type { User } from "@/lib/schema"

const pinProps = {
  inputMode: "numeric" as const,
  pattern: "[0-9]*",
  maxLength: 4,
}

export function MemberSheet({
  member,
  isSelf = false,
  trigger,
}: {
  member?: User
  isSelf?: boolean
  trigger: React.ReactElement
}) {
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState<string>()

  async function onAdd(formData: FormData) {
    const res = await addMember({}, formData)
    if (res?.error) {
      setError(res.error)
      return
    }
    setError(undefined)
    setOpen(false)
    toast.success("Miembro añadido")
  }

  async function onResetPin(formData: FormData) {
    await resetMemberPin(formData)
    setOpen(false)
    toast.success("PIN restablecido")
  }

  async function onToggleActive() {
    const fd = new FormData()
    fd.set("id", member!.id)
    fd.set("active", String(!member!.active))
    await setMemberActive(fd)
    setOpen(false)
    toast.success(member!.active ? "Miembro desactivado" : "Miembro reactivado")
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger render={trigger} />
      <DrawerContent style={{ "--drawer-height": "88dvh" } as React.CSSProperties}>
        <DrawerHeader>
          <DrawerTitle>{member ? member.name : "Nuevo miembro"}</DrawerTitle>
        </DrawerHeader>

        {member ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{member.phone}</span>
                <span>{ROLE_LABELS[member.role]}</span>
              </div>

              <form action={onResetPin} className="space-y-2">
                <input type="hidden" name="id" value={member.id} />
                <Label htmlFor="reset-pin">Restablecer PIN</Label>
                <div className="flex gap-2">
                  <Input
                    id="reset-pin"
                    name="pin"
                    {...pinProps}
                    required
                    placeholder="PIN temporal nuevo"
                    className="h-11 text-base"
                  />
                  <Button type="submit" variant="outline" className="h-11 shrink-0">
                    Restablecer
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tendrá que elegir un PIN nuevo al entrar.
                </p>
              </form>

              {!isSelf && (
                <Button
                  type="button"
                  variant={member.active ? "destructive" : "outline"}
                  onClick={onToggleActive}
                  className="h-11 w-full"
                >
                  {member.active ? "Desactivar miembro" : "Reactivar miembro"}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <form action={onAdd} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
              <div className="space-y-1.5">
                <Label htmlFor="m-name">Nombre</Label>
                <Input id="m-name" name="name" required autoFocus className="h-11 text-base" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-phone">Número de teléfono</Label>
                <Input
                  id="m-phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  required
                  placeholder="612 345 678"
                  className="h-11 text-base"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-role">Rol</Label>
                <NativeSelect
                  className="w-full [&_select]:h-11 [&_select]:text-base"
                  id="m-role"
                  name="role"
                  defaultValue="employee"
                >
                  <NativeSelectOption value="employee">Empleado</NativeSelectOption>
                  <NativeSelectOption value="admin">Administrador</NativeSelectOption>
                </NativeSelect>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-pin">PIN temporal</Label>
                <Input
                  id="m-pin"
                  name="pin"
                  {...pinProps}
                  required
                  placeholder="4 dígitos"
                  className="h-11 text-base"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <p className="text-xs text-muted-foreground">
                Entra con este teléfono y PIN, y luego establece su propio PIN.
              </p>
            </div>
            <div className="shrink-0 border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <SubmitButton>Añadir miembro</SubmitButton>
            </div>
          </form>
        )}
      </DrawerContent>
    </Drawer>
  )
}
