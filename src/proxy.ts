import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth Proxy — protects /dashboard routes.
 *
 * Strategy (optimistic / Edge-compatible):
 *  - Firebase Admin SDK cannot run in the Edge runtime, so we use a short-lived
 *    session cookie (`__session`) that the client sets after successful sign-in.
 *  - The cookie carries a minimal JSON payload: { uid, onboardingComplete }.
 *  - Full token verification happens in RSC / Server Actions; this proxy only
 *    performs fast, optimistic redirects.
 *
 * Cookie schema:
 *   __session = base64(JSON.stringify({ uid: string, onboardingComplete: boolean }))
 */

const PUBLIC_PATHS = ["/", "/auth", "/onboarding"];

function parseSession(
  cookie: string | undefined
): { uid: string; onboardingComplete: boolean } | null {
  if (!cookie) return null;
  try {
    return JSON.parse(Buffer.from(cookie, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths through
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  // Protect /dashboard/**
  if (pathname.startsWith("/dashboard")) {
    const raw = request.cookies.get("__session")?.value;
    const session = parseSession(raw);

    if (!session) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    if (!session.onboardingComplete) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
