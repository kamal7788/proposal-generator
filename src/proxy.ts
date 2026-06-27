import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = [
  "/proposals",
  "/services",
  "/sections",
  "/case-studies",
  "/testimonials",
  "/dashboard",
  "/users",
];

const apiProtectedPaths = [
  "/api/proposals",
  "/api/services",
  "/api/sections",
  "/api/case-studies",
  "/api/testimonials",
  "/api/users",
  "/api/upload",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPage = protectedPaths.some((path) => pathname.startsWith(path));
  const isProtectedApi = apiProtectedPaths.some((path) => pathname.startsWith(path));

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const token =
    request.cookies.get("__Secure-authjs.session-token") ||
    request.cookies.get("authjs.session-token");

  if (!token) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/proposals/:path*",
    "/services/:path*",
    "/sections/:path*",
    "/case-studies/:path*",
    "/testimonials/:path*",
    "/dashboard/:path*",
    "/users/:path*",
    "/api/proposals/:path*",
    "/api/services/:path*",
    "/api/sections/:path*",
    "/api/case-studies/:path*",
    "/api/testimonials/:path*",
    "/api/users/:path*",
    "/api/upload/:path*",
  ],
};
