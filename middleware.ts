import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Add custom logic here if needed
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Protect dashboard routes
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token
        }
        
        // Protect API routes (except auth and public endpoints)
        if (req.nextUrl.pathname.startsWith("/api")) {
          // Allow auth endpoints
          if (req.nextUrl.pathname.startsWith("/api/auth")) {
            return true
          }
          // Allow public share endpoints
          if (req.nextUrl.pathname.startsWith("/api/share/view")) {
            return true
          }
          // Allow dashboard generation without auth (users process their own data)
          if (req.nextUrl.pathname === "/api/generate-dashboard") {
            return true
          }
          // Require auth for other API routes
          return !!token
        }
        
        // Allow all other routes
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    // Protect dashboard routes
    "/dashboard/:path*",
    // Protect API routes (except auth and public endpoints)
    "/api/((?!auth|share/view).*)",
  ],
}