import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "pg_admin_session";

/**
 * Simple password-gated admin panel (brief section 10) — no multi-role
 * user system for this stage. Login route sets a signed session cookie;
 * everything else under /admin requires it.
 */
export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  if (req.nextUrl.pathname.startsWith("/admin")) {
    const session = req.cookies.get(ADMIN_COOKIE);
    if (!session) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
