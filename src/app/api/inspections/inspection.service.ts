import { prisma } from "@/lib/prisma";


export interface InspectionInput {
  userId: string;
  vehicleId: string;
  status: "INICIO" | "FINAL";
  vehicleKey?: string | null;
  crlvEmDia: string;
  certificadoTacografoEmDia: string;
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
  //fotoVeiculo?: string | null;
  kilometer: string;
  isFinished: boolean;
}

export async function createInspectionWithTransaction(data: InspectionInput) {
  try {
    return await prisma.$transaction(async (tx) => {
      // Criar o registro de inspeção
      const inspection = await tx.inspection.create({
        data: {
          ...data,
          dataInspecao: new Date(),
          updatedAt: new Date(),
        }
      });

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