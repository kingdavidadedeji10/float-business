import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    // Check for any Supabase auth session cookie (covers multiple naming conventions)
    const cookies = req.cookies.getAll();
    const hasAuthCookie = cookies.some(
      (cookie) =>
        cookie.name.startsWith("sb-") &&
        (cookie.name.endsWith("-auth-token") || cookie.name === "sb-access-token")
    );

    if (!hasAuthCookie) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
