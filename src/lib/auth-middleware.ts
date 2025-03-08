import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export const userApiSession = async ( req: NextRequest, allowedRoles: string[] ) => {
  // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
  return [session, await authWithRoleMiddleware(req,allowedRoles)];
};

// Essa função verifica se o usuário está autenticado
export async function authMiddleware(req: NextRequest) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Se não houver sessão, retorna 401 Unauthorized
  if (!session) {
    return NextResponse.json(
      { error: "Não autorizado. Faça login para acessar este recurso." },
      { status: 401 }
    );
  }

  // Usuário está autenticado, continue
  return NextResponse.next();
}

// Função auxiliar para verificar roles (opcional)
export async function authWithRoleMiddleware(
  req: NextRequest,
  allowedRoles: string[]
) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Se não houver sessão, retorna 401 Unauthorized
  if (!session) {
    return NextResponse.json(
      { error: "Não autorizado. Faça login para acessar este recurso." },
      { status: 401 }
    );
  }

  // Verifica as roles do usuário (assumindo que role está no token)
  if (session.role && allowedRoles.includes(session.role)) {
    return NextResponse.next();
  }

  // Usuário não tem a role necessária
  return NextResponse.json(
    {
      error:
        "Acesso proibido. Você não tem permissão para acessar este recurso.",
    },
    { status: 403 }
  );
}
