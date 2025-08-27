import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow internal next/_next, api, static, assets, and auth callback
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/auth/callback")
  ) {
    return NextResponse.next();
  }

  // read cookie (Edge runtime)
  const seen = req.cookies.get("seenOnboarding")?.value === "true";

  if (!seen) {
    // redirect to onboarding preserving origin
    const url = req.nextUrl.clone();
    url.pathname = "/onboarding";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// only apply to all routes (except _next and api are handled above)
export const config = {
  matcher: ['/((?!_next|api|static|favicon.ico).*)'],
}