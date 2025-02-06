import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Definindo o schema de validação
const PhotoSchema = z.object({
  photo: z.string(),
});

const InspectionSchema = z.object({
  userId: z.string(),
  vehicleId: z.string(),
  vehicleKey: z.string().optional(),
  status: z.string().optional(),
  crlvEmDia: z.string().optional(),
  certificadoTacografoEmDia: z.string().optional(),
  nivelAgua: z.string().optional(),
  nivelOleo: z.string().optional(),
  eixo: z.string().optional(),
  dianteira: z.string().optional(),
  descricaoDianteira: z.string().optional(),
  tracao: z.string().optional(),
  descricaoTracao: z.string().optional(),
  truck: z.string().optional(),
  descricaoTruck: z.string().optional(),
  quartoEixo: z.string().optional(),
  descricaoQuartoEixo: z.string().optional(),
  avariasCabine: z.string().optional(),
  descricaoAvariasCabine: z.string().optional(),
  bauPossuiAvarias: z.string().optional(),
  descricaoAvariasBau: z.string().optional(),
  funcionamentoParteEletrica: z.string().optional(),
  descricaoParteEletrica: z.string().optional(),
  fotoVeiculo: z.string().optional(),
  kilometer: z.string().optional(),
  isFinished: z.boolean().optional(),
  photos: z.array(PhotoSchema).optional(),
});

type InspectionInput = z.infer<typeof InspectionSchema>;

export async function POST(request: NextRequest) {
  try {
    const body: InspectionInput = await request.json();

    // Validar os dados recebidos
    const validatedData = InspectionSchema.parse(body);

    // Executar a transação
    const result = await prisma.$transaction(async (tx) => {
      // 1. Criar a inspeção
      const inspection = await tx.inspection.create({
        data: {
          userId: validatedData.userId,
          vehicleId: validatedData.vehicleId,
          vehicleKey: validatedData.vehicleKey,
          status: validatedData.status,
          crlvEmDia: validatedData.crlvEmDia,
          certificadoTacografoEmDia: validatedData.certificadoTacografoEmDia,
          nivelAgua: validatedData.nivelAgua,
          nivelOleo: validatedData.nivelOleo,
          eixo: validatedData.eixo,
          dianteira: validatedData.dianteira,
          descricaoDianteira: validatedData.descricaoDianteira,
          tracao: validatedData.tracao,
          descricaoTracao: validatedData.descricaoTracao,
          truck: validatedData.truck,
          descricaoTruck: validatedData.descricaoTruck,
          quartoEixo: validatedData.quartoEixo,
          descricaoQuartoEixo: validatedData.descricaoQuartoEixo,
          avariasCabine: validatedData.avariasCabine,
          descricaoAvariasCabine: validatedData.descricaoAvariasCabine,
          bauPossuiAvarias: validatedData.bauPossuiAvarias,
          descricaoAvariasBau: validatedData.descricaoAvariasBau,
          funcionamentoParteEletrica: validatedData.funcionamentoParteEletrica,
          descricaoParteEletrica: validatedData.descricaoParteEletrica,
          fotoVeiculo: validatedData.fotoVeiculo,
          kilometer: validatedData.kilometer,
          isFinished: validatedData.isFinished,
        },
      });

      // 2. Se houver fotos, criar os registros de fotos
      if (validatedData.photos && validatedData.photos.length > 0) {
        await tx.inspectionPhoto.createMany({
          data: validatedData.photos.map((photo) => ({
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

    return NextResponse.json(result, { status: 201 });
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