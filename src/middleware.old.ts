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
  },{
    callbacks: {
      //authorized: ({ token }) => token?.role === "admin",
    },
  },
)

export const config = {
  matcher: ['/admin/:path*','/dashboard/:path*','/','/api/inspections/:path*','/api/users/:path*','/api/vehicles/:path*'], // Rotas protegidas
};

/*
export async function middleware(req: NextRequest) {
  //const token = req.headers.get('authorization')?.replace('Bearer ', '')
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token && req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Authentication required' },{ status: 401 })
  }
  // Verifica se o token existe
  if (!token) {
    // Redireciona para a página de login se não estiver autenticado
    return NextResponse.redirect(new URL('/api/auth/signin', req.url));
  }
  // Se o token existir, permite o acesso à rota
  return NextResponse.next();
}
// Define as rotas que o middleware deve proteger
export const config = {
  matcher: ['/admin/:path*','/dashboard/:path*','/','/api/inspections/:path*','/api/users/:path*','/api/vehicles/:path*'], // Rotas protegidas
};

/*
import { withAuth } from "next-auth/middleware"

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    console.log(req.nextauth.token)
  },
  {
    callbacks: {
      authorized: ({ token }) => token?.role === "admin",
    },
  },
)

export const config = { matcher: ["/admin"] }
*/