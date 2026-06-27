import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect dashboard routes
  const protectedPaths = ["/proposals", "/services", "/sections", "/case-studies", "/testimonials", "/dashboard", "/users"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected) {
    const token = request.cookies.get("__Secure-authjs.session-token") || request.cookies.get("authjs.session-token");
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/proposals/:path*", "/services/:path*", "/sections/:path*", "/case-studies/:path*", "/testimonials/:path*", "/dashboard/:path*", "/users/:path*"],
};
