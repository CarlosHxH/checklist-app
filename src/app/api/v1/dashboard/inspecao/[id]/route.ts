import { authWithRoleMiddleware } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    // Verificar autenticação e permissão
    const authResponse = await authWithRoleMiddleware(request, ["ADMIN"]);
    if (authResponse.status !== 200) return authResponse;
  
  try {
    const { id } = await params;
    const inspection = await prisma.inspection.findUnique({
      where: { id },
      include: {
        vehicle: {
          select: {
            plate: true,
            model: true,
          },
        },
        photos: {
          select: {
            id: true,
            type: true,
            photo: true,
            description: true,
          },
        },
      },
    });

    if (!inspection) {
      return NextResponse.json(
        { error: "Inspeção não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(inspection);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" },{ status: 500 });
  }
}