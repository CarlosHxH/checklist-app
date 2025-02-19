import { prisma } from "@/lib/prisma";


export interface InspectionInput {
  id: string | '';
  userId: string;
  vehicleId: string;
  status: "INICIO" | "FINAL";
  vehicleKey?: string | null;
  crlvEmDia: string;
  certificadoTacografoEmDia: string | null;
  nivelAgua: string;
  nivelOleo: string;
  eixo: string;
  dianteira: string;
  descricaoDianteira: string;
  tracao: string;
  descricaoTracao: string;
  truck?: string | null;
  descricaoTruck?: string | null;
  quartoEixo?: string | null;
  descricaoQuartoEixo?: string | null;
  avariasCabine: string;
  descricaoAvariasCabine?: string | null;
  bauPossuiAvarias: string;
  descricaoAvariasBau?: string | null;
  funcionamentoParteEletrica: string;
  descricaoParteEletrica: string;
  kilometer: string;
  isFinished: boolean;
  photos: [{[x:string]:string}]
}

export async function createInspectionWithTransaction(validatedData: InspectionInput) {
  const { id, photos, ...data } = validatedData;
  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Criar o registro de inspeção
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

      let inspect;
      if (data.status === "INICIO") {
        // Criar novo registro de inspeção
        inspect = await tx.inspect.create({
          data: {
            userId: data.userId,
            vehicleId: data.vehicleId,
            startId: inspection.id
          }
        });
      } else {
        // Procurar por uma inspeção aberta para este veículo
        const openInspection = await tx.inspect.findFirst({
          where: {
            AND: [
              { userId: data.userId },
              { startId: { not: null } },
              { endId: null }
            ]
          },
          orderBy: { createdAt: 'desc' }
        });

        // 
        if (!openInspection) {
          inspect = await tx.inspect.create({
            data: {
              userId: data.userId,
              endId: inspection.id,
              vehicleId: data.vehicleId,
            }
          });
        } else {
          inspect = await tx.inspect.update({
            where: { id: openInspection.id },
            data: { endId: inspection.id }
          });
        }
      }

      return { inspection, inspect };
    });
  } catch (error) {
    console.error("A transação falhou:", error);
    throw error;
  }
}