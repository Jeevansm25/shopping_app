import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/auth"

export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const isPublicPath = path === "/login" || path === "/register" || path === "/"

  // Check if the user is authenticated
  const token = request.cookies.get("token")?.value
  const isAuthenticated = token && (await verifyToken(token))

  // Redirect logic for authenticated users
  if (isPublicPath && isAuthenticated) {
    const payload = await verifyToken(token!)
    if (payload?.role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }
    return NextResponse.redirect(new URL("/courses", request.url))
  }

  // Redirect logic for unauthenticated users
  if (!isPublicPath && !isAuthenticated) {
    const loginUrl = path.startsWith("/admin") ? "/login?type=admin" : "/login"
    return NextResponse.redirect(new URL(loginUrl, request.url))
  }

  // Admin route protection
  if (path.startsWith("/admin") && isAuthenticated) {
    const payload = await verifyToken(token!)
    if (payload?.role !== "admin") {
      return NextResponse.redirect(new URL("/courses", request.url))
    }
  }

  return NextResponse.next()
}

// Specify the paths that should be processed by the middleware
export const config = {
  matcher: ["/login", "/register", "/courses/:path*", "/cart/:path*", "/admin/:path*", "/profile/:path*"],
}

