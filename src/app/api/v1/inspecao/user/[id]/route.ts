import { authWithRoleMiddleware } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verificar autenticação e permissão
  const authResponse = await authWithRoleMiddleware(request, ["DRIVER","USER","ADMIN"]);
  if (authResponse.status !== 200) return authResponse;
    
  try {
    const id = (await params).id;
    const inspections = await prisma.inspection.findMany({
      where: { userId: id, status: "INSPECAO" },
      include: { vehicle: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(inspections, { status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}