import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

export default async function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const token = await getToken({ req, secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET });
  const isLoggedIn = !!token;

  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  // Standard NextAuth routes that should NOT be proxied
  const isNextAuthRoute =
    nextUrl.pathname.startsWith("/api/auth/callback") ||
    nextUrl.pathname.startsWith("/api/auth/signin") ||
    nextUrl.pathname.startsWith("/api/auth/signout") ||
    nextUrl.pathname.startsWith("/api/auth/session") ||
    nextUrl.pathname.startsWith("/api/auth/csrf") ||
    nextUrl.pathname.startsWith("/api/auth/providers");

  // Proxy API requests to backend
  if (isApiRoute && !isNextAuthRoute) {
    const backendUrl = new URL(
      nextUrl.pathname + nextUrl.search,
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
    );
    return NextResponse.rewrite(backendUrl);
  }

  const isPublicRoute =
    nextUrl.pathname === "/" ||
    nextUrl.pathname === "/login" ||
    nextUrl.pathname === "/auth/callback" ||
    nextUrl.pathname === "/pricing";

  if (isApiAuthRoute) return NextResponse.next();
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
  if (isLoggedIn && nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.mp4|.*\\.webm|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.ico|.*\\.woff2?|.*\\.ttf).*)",
  ],
};
