import { authWithRoleMiddleware } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  // Verificar autenticação e permissão
  const authResponse = await authWithRoleMiddleware(request, ["ADMIN"]);
  if (authResponse.status !== 200) return authResponse;

  try {
    const { id } = await request.json();

    const data = await prisma.vehicleKey.update({
      where: { id },
      data: { status: 'PENDING' }
    })
    return NextResponse.json(data,{status:201})
  } catch (error) {
    console.error('Error confirming transfer:', error)
    return NextResponse.json(
      { error: 'Error confirming transfer' },
      { status: 500 }
    )
  }
}