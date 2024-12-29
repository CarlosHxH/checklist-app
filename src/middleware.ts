// middleware.ts

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware"

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  async function middleware(req: NextRequest) {
    //const token = req.headers.get('authorization')?.replace('Bearer ', '')
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      // Redireciona para a página de login se não estiver autenticado
      return NextResponse.redirect(new URL('/api/auth/signin', req.url));
    }
    // Se o token existir, permite o acesso à rota
    return NextResponse.next();
  },{
    callbacks: {
      //authorized: ({ token }) => token?.role === "admin",
    },
  },
)

export const config = {
  matcher: ['/admin/:path*','/dashboard/:path*'], // Rotas protegidas
};