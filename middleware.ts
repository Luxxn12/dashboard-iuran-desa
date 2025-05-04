import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get the token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Check if user is authenticated
  const isAuthenticated = !!token

  // Define public routes
  const isPublicRoute = pathname === "/login" || pathname === "/register"

  // Define admin routes
  const isAdminRoute = pathname.startsWith("/admin")

  // Redirect logic
  if (isPublicRoute) {
    if (isAuthenticated) {
      // Redirect authenticated users from public routes to appropriate dashboard
      return token.role === "ADMIN"
        ? NextResponse.redirect(new URL("/admin", request.url))
        : NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return NextResponse.next()
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated users to login
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAdminRoute && token.role !== "ADMIN") {
    // Redirect non-admin users trying to access admin routes
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/login", "/register", "/admin/:path*", "/dashboard/:path*"],
}
