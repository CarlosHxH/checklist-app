// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { decoded } from "./webToken";

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Get NextAuth token for page routes
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (token && pathname.startsWith('/api/v1')) {
    return NextResponse.next()
  }

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Handle API routes with Bearer token authentication
  if (pathname.startsWith("/api/v1")) {
    const authHeader = req.headers.get('Authorization');
    const bearer = authHeader?.split('Bearer ')[1]?.trim();

    if (!bearer) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    try {
      const verify = await decoded(bearer);
      if (!verify?.exp || verify.exp <= Date.now() / 1000) {
        return NextResponse.json({ error: "Token expired" }, { status: 401 });
      }
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  }

  // Allow NextAuth API routes to proceed
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow other API routes to proceed (add specific protection if needed)
  if (pathname.startsWith("/api/v1")) {
    return NextResponse.next();
  }

  
  // Public routes that don't require authentication
  const publicRoutes = ['/auth/signin', '/auth/signup', '/auth/error'];
  if (publicRoutes.includes(pathname)) {
    // Redirect authenticated users away from auth pages
    if (token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Check if user is authenticated for protected routes
  if (!token) {
    const signInUrl = new URL("/api/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Admin-only routes
  const isAdmin = token.role === "ADMIN";
  if (pathname.startsWith("/api/v2") && !isAdmin) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }
  if (pathname.startsWith("/dashboard") && !isAdmin) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};