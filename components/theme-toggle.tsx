"use client"

import { useTheme } from "next-themes"
import { RiMoonLine, RiSunLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const dark = resolvedTheme === "dark"

  return (
    <Button
      variant="outline"
      className="h-11 w-full justify-start gap-2"
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? <RiSunLine className="size-4" /> : <RiMoonLine className="size-4" />}
      {dark ? "Modo claro" : "Modo oscuro"}
    </Button>
  )
}
