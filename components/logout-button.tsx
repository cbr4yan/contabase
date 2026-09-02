import { RiLogoutBoxLine } from "@remixicon/react"

import { logout } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button
        type="submit"
        variant="outline"
        className="h-11 w-full justify-start gap-2 text-destructive"
      >
        <RiLogoutBoxLine className="size-4" />
        Cerrar sesión
      </Button>
    </form>
  )
}
