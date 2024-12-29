import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  // Aqui você pode adicionar verificação de autenticação
  // e autorização para as rotas da API
  
  // Exemplo básico verificando se existe um token
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token && request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  
  return NextResponse.next()
}
 
export const config = {
  matcher: '/api/:path*',
}