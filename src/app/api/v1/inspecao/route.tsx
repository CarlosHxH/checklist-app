import { NextRequest, NextResponse } from "next/server";
import { InspectionFormData } from "@/types/InspectionSchema";
import { authWithRoleMiddleware } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";

async function transaction(validatedData: InspectionFormData) {
  const { photos, ...data } = validatedData;
  // Executar a transação
  const result = await prisma.$transaction(async (tx) => {
    // 1. Criar a inspeção
    const inspection = await tx.inspection.create({ data });

    // 2. Se houver fotos, criar os registros de fotos
    if (photos && photos.length > 0) {
      await tx.inspectionPhoto.createMany({
        data: photos.map((photo) => ({
          inspectionId: inspection.id,
          ...photo
        })),
      });
    }
    return inspection;
  });
  return result;
}


export async function POST(request: NextRequest) {
  // Verificar autenticação e permissão
  const authResponse = await authWithRoleMiddleware(request, ["DRIVER", "USER", "ADMIN"]);
  if (authResponse.status !== 200) return authResponse;

  try {
    const data = await request.json();
    // Validar os dados recebidos
    const response = await transaction(data);
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ error: 'Dados inválidos', details: error.message }, { status: 400 })
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}