/**
 * OPTIONAL — faster auth gate.
 * Protect /create before the heavy page starts rendering.
 * Adjust cookie name to match your auth.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/create") || pathname.startsWith("/studio")) {
    const session =
      req.cookies.get("session")?.value ||
      req.cookies.get("__session")?.value;

    if (!session) {
      const login = new URL("/login", req.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/create/:path*", "/studio/:path*"],
};
