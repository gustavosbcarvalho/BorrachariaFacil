import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    if (!token) return NextResponse.redirect(new URL("/login", req.url));

    const isSystemAdmin = token.role === "SYSTEM_ADMIN";
    const isAdminRoute = pathname.startsWith("/admin");
    const isProfileRoute = pathname.startsWith("/profile");

    // SYSTEM_ADMIN só acessa administração e próprio perfil
    if (isSystemAdmin && !isAdminRoute && !isProfileRoute) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // Outros usuários não acessam /admin
    if (!isSystemAdmin && isAdminRoute) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/services/:path*",
    "/expenses/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/convenios/:path*",
    "/companies/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
};
