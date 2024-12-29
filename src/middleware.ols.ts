import { NextResponse } from 'next/server';
import { NextRequestWithAuth, withAuth } from 'next-auth/middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Tipos de roles disponíveis
type Role = 'admin' | 'user' | 'driver';

// Interface para definir as permissões
interface RoutePermissions {
  path: string;
  roles: Role[];
  methods?: string[];
}

// Define as permissões para cada rota
const routePermissions: RoutePermissions[] = [
  // Rotas Admin
  {
    path: '/dashboard/admin',
    roles: ['admin'],
  },
  {
    path: '/users/manage',
    roles: ['admin'],
  },
  {
    path: '/settings/system',
    roles: ['admin'],
  },
  
  // Rotas User
  {
    path: '/dashboard/user',
    roles: ['user', 'admin'],
  },
  {
    path: '/orders',
    roles: ['user', 'admin'],
    methods: ['GET', 'POST']
  },
  {
    path: '/profile',
    roles: ['user', 'admin', 'driver'],
  },
  
  // Rotas Driver
  {
    path: '/dashboard/driver',
    roles: ['driver', 'admin'],
  },
  {
    path: '/deliveries',
    roles: ['driver', 'admin'],
  },
  {
    path: '/routes',
    roles: ['driver', 'admin'],
    methods: ['GET']
  }
];

// Rotas públicas que não precisam de autenticação
const publicRoutes = [
  '/auth/signin',
  '/'
];

export default withAuth(
  async function middleware(request: NextRequestWithAuth) {
    const token = request.nextauth.token;
    const path = request.nextUrl.pathname;
    const method = request.method;

    // Verifica se é uma rota pública
    if (publicRoutes.some(route => path.startsWith(route))) {
      return NextResponse.next();
    }

    // Verifica se o usuário está autenticado
    if (!token?.email) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    try {
      // Busca o usuário no banco de dados
      const user = await prisma.user.findUnique({
        where: { email: token.email },
        select: {
          id: true,
          role: true,
          isActive: true,
          lastLogin: true
        }
      });

      if (!user) {
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }

      // Verifica se o usuário está ativo
      if (!user.isActive) {
        return NextResponse.redirect(new URL('/auth/suspended', request.url));
      }

      // Encontra a configuração de permissão para a rota atual
      const routeConfig = routePermissions.find(route => path.startsWith(route.path));

      if (routeConfig) {
        // Verifica se o usuário tem a role necessária
        const hasPermission = routeConfig.roles.includes(user.role as Role);
        
        // Verifica se o método HTTP é permitido (se especificado)
        const isMethodAllowed = !routeConfig.methods || routeConfig.methods.includes(method);

        if (!hasPermission || !isMethodAllowed) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }

      // Adiciona informações do usuário ao cabeçalho
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', user.id);
      requestHeaders.set('x-user-role', user.role);
      requestHeaders.set('x-last-login', user.lastLogin?.toISOString() || '');

      // Atualiza o último acesso
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

    } catch (error) {
      console.error('Erro no middleware de permissões:', error);
      return NextResponse.redirect(new URL('/erro', request.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Configuração de quais rotas o middleware deve ser executado
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};