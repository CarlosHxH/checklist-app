import { authWithRoleMiddleware } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verificar autenticação e permissão
  const authResponse = await authWithRoleMiddleware(request, ["DRIVER","USER","ADMIN"]);
  if (authResponse.status !== 200) return authResponse;

  try {
    const userId = (await params).id;
    const inspections = await prisma.inspect.findMany({
      where: { userId },
      include: {
        user: { select: { name: true }},
        start: true,
        end: true,
        vehicle: true
      },
      orderBy: {createdAt: 'desc'},
    });
    return NextResponse.json(inspections)
  } catch (error) {
    return NextResponse.json(error)
  }
}