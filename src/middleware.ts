// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import withAuth from "next-auth/middleware";
import { TokenPayload } from "./types/auth";
import { isTokenValid } from "./lib/auth/jwt";

// Tipos para as roles do usuário
type UserRole = "ADMIN" | "USER";

interface CustomToken extends TokenPayload {
  role?: UserRole;
}
// Função para verificar se é rota do dashboard
const isDashboardRoute = (pathname: string): boolean => {
  return pathname.startsWith("/dashboard");
};

// Função para verificar se o usuário é admin
const isAdminUser = (token: CustomToken | null): boolean => {
  return token?.role === "ADMIN";
};

// Função para redirecionar para o login
const redirectToLogin = (req: NextRequest): NextResponse => {
  const loginUrl = new URL("/api/auth/signin", req.url);
  return NextResponse.redirect(loginUrl);
};

export default withAuth(
  async function middleware(req: NextRequest) {
    try {
      // Obter o token da requisição
      const token = await getToken({ req, secret: process.env.AUTH_SECRET }) as CustomToken | null;
      
      // Verificar acesso ao dashboard
      if (isDashboardRoute(req.nextUrl.pathname)) {
        if (!isAdminUser(token)) {
          console.log("Acesso não autorizado ao dashboard");
          return redirectToLogin(req);
        }
      }

      // Verificar se existe token
      if (!token) {
        console.log("Token não encontrado");
        return redirectToLogin(req);
      }

      // Continuar com a requisição se tudo estiver ok
      return NextResponse.next();
    } catch (error) {
      console.error("Erro no middleware:", error);
      return redirectToLogin(req);
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token && isTokenValid(token as unknown as CustomToken)
    },
  }
);

// Configuração das rotas protegidas
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/(!/api/auth|/_next/static|/_next/image|/favicon.ico|/public)',
    "/",
    "/api/:path*",
    "/favicon.ico",
    "/inspection/:path*",
    "/dashboard/:path*",
  ],
};
