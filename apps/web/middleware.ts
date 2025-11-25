import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect all /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const adminSession = request.cookies.get("admin_session");

    if (adminSession?.value !== "authenticated") {
      const loginUrl = new URL("/admin-login", request.url);
      const next = `${pathname}${request.nextUrl.search}`;
      if (next.startsWith("/")) {
        loginUrl.searchParams.set("next", next);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
