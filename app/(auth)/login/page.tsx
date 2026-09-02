import { signupEnabled } from "@/lib/config"
import { LoginForm } from "@/components/forms/login-form"

// Reads SIGNUP_ENABLED at request time, not build time.
export const dynamic = "force-dynamic"

export default function LoginPage() {
  return <LoginForm signupEnabled={signupEnabled()} />
}
