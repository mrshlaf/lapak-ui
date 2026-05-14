import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";

// Protected routes yang butuh login
const PROTECTED_ROUTES = [
  "/dashboard",
  "/sell",
  "/my-products",
  "/reservations",
  "/transactions",
  "/community",
  "/wishlist",
  "/chat",
  "/notifications",
  "/profile",
];

// Admin-only routes
const ADMIN_ROUTES = ["/admin"];

// Auth routes yang harus redirect ke dashboard jika sudah login
const AUTH_ROUTES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("lapak_session")?.value;
  const session = token ? await verifySession(token) : null;

  // Redirect ke dashboard jika sudah login dan akses auth pages
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protect admin routes
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (session.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protect user routes
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
