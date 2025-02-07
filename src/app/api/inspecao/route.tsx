import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { InspectionFormData, InspectionSchema } from "@/types/InspectionSchema";


type InspectionInput = z.infer<typeof InspectionSchema>;

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
    const body: InspectionInput = await request.json();

    // Validar os dados recebidos
    const validatedData = InspectionSchema.parse(body);
    console.log({is: validatedData.userId});
    

    return NextResponse.json(validatedData, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar inspeção:', error);

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