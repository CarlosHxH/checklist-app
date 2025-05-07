// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "SSnT2A7mADqhTAZWnCzvY9zfzdIjftEZNYULtVaxydQ="
);

// Using Next-Auth v5's middleware pattern
// This exports a middleware function that's enhanced by the auth function
export default auth((req) => {
  // The auth function adds the auth object to the request
  const { auth: session } = req;
  const { nextUrl } = req;

  // Verificar se a rota começa com /api/v1
  if (req.nextUrl.pathname.startsWith("/api/v1")) {
    try {
      // Obter o token do header de autorização
      const authHeader = req.headers.get("authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new NextResponse(
          JSON.stringify({ error: "Token não fornecido" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      // Extrair o token
      const token = authHeader.split(" ")[1];

      // Verificar o token
      const payload =jwtVerify(token, SECRET_KEY).then(({ payload }) => {
        return payload;
      });
      console.log({ payload });
      

      // Se chegou até aqui, o token é válido
      // Você pode adicionar verificações adicionais como roles, permissões, etc.

      // Opcional: adicionar o usuário aos headers para uso nas rotas da API
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user-id", (payload as any).sub as string);

      // Continuar com a requisição
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      // Token inválido ou expirado
      return new NextResponse(
        JSON.stringify({ error: "Token inválido ou expirado" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
  }
  
  if (session?.user?.role === "DRIVER" && nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  if (session?.user?.role === "DRIVER" && nextUrl.pathname.startsWith("/api/v1/dashboard")) {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  // First handle API routes - always let auth API routes pass through
  if (nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  // REDIRECT LOGIC:

  // If user is NOT logged in and tries to access protected routes
  if (!session?.user && !nextUrl.pathname.startsWith("/auth/")) {
    // Store the original URL they were trying to visit
    const redirectUrl = new URL("/auth/signin", nextUrl.origin);
    redirectUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user IS logged in and tries to access auth pages (prevent logged-in users from seeing login page)
  if (session?.user && nextUrl.pathname.startsWith("/auth/")) {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  // Permit all other scenarios
  return NextResponse.next();
}) as unknown as (request: NextRequest) => Promise<NextResponse>;

// Configure which routes the middleware applies to
export const config = {
  // Add all routes that should be protected or have redirect logic
  matcher: [
    // Auth routes
    "/auth/:path*",
    
    // Protected routes
    "/",
    "/dashboard/:path*",
    "/inspection/:path*",
    "/api/v1/:path*",
    
    // Add other routes as needed
  ],
};
