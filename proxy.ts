import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { SESSION_COOKIE, signupEnabled } from "@/lib/config"
import { verifySession } from "@/lib/jwt"

const PUBLIC = ["/login", "/signup", "/logout"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === "/signup" && !signupEnabled()) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value)

  if (!session && !PUBLIC.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  if (session && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
