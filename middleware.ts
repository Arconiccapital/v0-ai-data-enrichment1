import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Allow all requests to pass through without authentication
  return NextResponse.next()
}

export const config = {
  matcher: [
    // No paths are protected anymore
  ],
}