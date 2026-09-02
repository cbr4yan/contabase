"use client"

import * as React from "react"
import { toast } from "sonner"

import { saveCategory, toggleArchiveCategory } from "@/app/actions/categories"
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
import { FormSelect } from "@/components/form-select"
import { SubmitButton } from "@/components/submit-button"
import type { Category } from "@/lib/schema"

export function CategorySheet({
  category,
  trigger,
}: {
  category?: Category
  trigger: React.ReactElement
}) {
  const [open, setOpen] = React.useState(false)

  async function onSubmit(formData: FormData) {
    await saveCategory(formData)
    setOpen(false)
    toast.success(category ? "Categoría actualizada" : "Categoría creada")
  }

  async function onArchive() {
    const fd = new FormData()
    fd.set("id", category!.id)
    fd.set("archived", String(category!.archived))
    await toggleArchiveCategory(fd)
    setOpen(false)
    toast.success(category!.archived ? "Categoría restaurada" : "Categoría archivada")
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger render={trigger} />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {category ? "Editar categoría" : "Nueva categoría"}
          </DrawerTitle>
        </DrawerHeader>

        <form action={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
            {category && <input type="hidden" name="id" value={category.id} />}
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Nombre</Label>
              <Input
                id="cat-name"
                name="name"
                required
                autoFocus={!category}
                defaultValue={category?.name ?? ""}
                className="h-11 text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-kind">Tipo</Label>
              <FormSelect
                id="cat-kind"
                name="kind"
                defaultValue={category?.kind ?? "expense"}
                options={[
                  { label: "Gasto", value: "expense" },
                  { label: "Ingreso", value: "income" },
                ]}
              />
            </div>
            {category && (
              <Button
                type="button"
                variant="outline"
                onClick={onArchive}
                className="h-11 w-full"
              >
                {category.archived ? "Restaurar" : "Archivar"}
              </Button>
            )}
          </div>

          <div className="shrink-0 border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <SubmitButton>{category ? "Guardar" : "Crear categoría"}</SubmitButton>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
