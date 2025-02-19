import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { InspectionFormData, InspectionSchema } from "@/types/InspectionSchema";

export const config = {
  api: {
      bodyParser: {
          sizeLimit: '50mb'
      }
  }
}

async function transaction(validatedData: InspectionFormData) {
  const { id, photos, ...data } = validatedData;
  // Executar a transação
  const result = await prisma.$transaction(async (tx) => {
    // 1. Criar a inspeção
    const inspection = await tx.inspection.create({ data });

    // 2. Se houver fotos, criar os registros de fotos
    if (photos && photos.length > 0) {
      await tx.inspectionPhoto.createMany({
        data: photos.map((photo) => ({
          inspectionId: inspection.id,
          photo: photo.photo,
        })),
      });
    }

    // 3. Retornar a inspeção criada com suas fotos
    return tx.inspection.findUnique({
      where: { id: inspection.id },
      include: { photos: true },
    });
  });

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validar os dados recebidos
    const validatedData = InspectionSchema.parse(body);
    const data = await transaction(validatedData);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}