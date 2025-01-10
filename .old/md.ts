// middleware.ts
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { validateUserToken } from './utils/token';

export async function middleware(request: NextRequest) {
  // Ignora rotas públicas
  if (request.nextUrl.pathname.startsWith('/auth') || 
      request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Token não fornecido' },{ status: 401 });
  }

  const isValid = await validateUserToken(token);
  
  if (!isValid) {
    return NextResponse.json({ error: 'Token inválido ou expirado' },{ status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};