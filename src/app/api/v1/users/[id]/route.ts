import { authWithRoleMiddleware } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verificar autenticação e permissão
  const authResponse = await authWithRoleMiddleware(request, ["ADMIN"]);
  if (authResponse.status !== 200) { return authResponse; }

  try {
    const id = (await params).id;
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json("Erro, Usuário vinculado a um registro!", {
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}
