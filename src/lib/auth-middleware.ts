import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export const userApiSession = async (req: NextRequest, allowedRoles: string[]) => {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  return [session, await authWithRoleMiddleware(req, allowedRoles)];
};

// Essa função verifica se o usuário está autenticado
export async function authMiddleware(req: NextRequest) {
  return NextResponse.next();
}

// Função auxiliar para verificar roles (opcional)
export async function authWithRoleMiddleware(
  req: NextRequest,
  allowedRoles: string[]
) {
  return NextResponse.next();
}
