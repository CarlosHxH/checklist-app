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
  extintor: string;
  photos?: [{
    [x: string]: string,
  }]
}

export async function createInspectionWithTransaction(validatedData: InspectionInput) {
  const { id, ...data } = validatedData;

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Create the inspection record
      const inspection = await tx.inspection.create({
        data: {
          userId: data.userId,
          vehicleId: data.vehicleId,
          status: data.status,
          kilometer: data.kilometer,
          crlvEmDia: data.crlvEmDia,
          certificadoTacografoEmDia: data.certificadoTacografoEmDia,
          nivelAgua: data.nivelAgua,
          nivelOleo: data.nivelOleo,
          avariasCabine: data.avariasCabine,
          descricaoAvariasCabine: data.descricaoAvariasCabine,
          bauPossuiAvarias: data.bauPossuiAvarias,
          descricaoAvariasBau: data.descricaoAvariasBau,
          funcionamentoParteEletrica: data.funcionamentoParteEletrica,
          descricaoParteEletrica: data.descricaoParteEletrica,
          extintor: data.extintor,
          dianteira: data.dianteira,
          descricaoDianteira: data.descricaoDianteira,
          tracao: data.tracao,
          descricaoTracao: data.descricaoTracao,
          truck: data.truck,
          descricaoTruck: data.descricaoTruck,
          quartoEixo: data.quartoEixo,
          descricaoQuartoEixo: data.descricaoQuartoEixo,
          isFinished: true,
          photos: {
            create: data?.photos ? data.photos?.map((photo: any) => ({
              photo: photo.photo,
              type: photo.type,
              description: photo.description
            })) : []
          }
        }
      });

      let inspect;

      // 2. Check if there's an existing Inspect record for this vehicle and user
      // This step is different depending on whether this is a start or end inspection
      if (data.status === "INICIO") {
        // For START inspections:
        // First check if there's an open inspection (has start but no end)
        const existingOpenInspect = await tx.inspect.findUnique({
          where: {
            id,
            //userId: data.userId,
            //vehicleId: data.vehicleId,
            //startId: { not: null },
            //endId: null
          }
        });

        if (existingOpenInspect) {
          // If there's an open inspection, update its startId
          inspect = await tx.inspect.update({
            where: { id: existingOpenInspect.id },
            data: { startId: inspection.id }
          });
        } else {
          // Create a new Inspect record with the start inspection
          inspect = await tx.inspect.create({
            data: {
              userId: data.userId,
              vehicleId: data.vehicleId,
              startId: inspection.id
            }
          });
        }
      } else if (data.status === "FINAL") {
        // For END inspections:
        // Look for an open inspection (has start but no end)
        const openInspection = await tx.inspect.findFirst({
          where: {
            userId: data.userId,
            vehicleId: data.vehicleId,
            startId: { not: null },
            endId: null
          },
          orderBy: { createdAt: 'desc' }
        });

        if (openInspection) {
          // Update the existing Inspect record with the end inspection
          inspect = await tx.inspect.update({
            where: { id: openInspection.id },
            data: { endId: inspection.id }
          });
        } else {
          // If no open inspection found, create a new Inspect with only the end inspection
          inspect = await tx.inspect.create({
            data: {
              userId: data.userId,
              vehicleId: data.vehicleId,
              endId: inspection.id
            }
          });
        }
      }

      return { inspection, inspect };
    });
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
}