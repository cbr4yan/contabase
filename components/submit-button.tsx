"use client"

import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SubmitButton({
  children,
  className,
  variant,
}: {
  children: React.ReactNode
  className?: string
  variant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      variant={variant}
      disabled={pending}
      className={cn("h-11 w-full text-sm", className)}
    >
      {pending ? "…" : children}
    </Button>
  )
}
