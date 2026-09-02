import { requireUser } from "@/lib/session"
import { ChangePinForm } from "@/components/forms/change-pin-form"

export default async function SetPinPage() {
  const user = await requireUser()
  return <ChangePinForm forced={user.mustChangePin} />
}
