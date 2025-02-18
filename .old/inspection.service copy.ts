import { prisma } from "@/lib/prisma";

export interface InspectionInput {
  userId: string;
  vehicleId: string;
  status: "INICIO" | "FINAL";
  vehicleKey: string | null;
  crlvEmDia: string;
  certificadoTacografoEmDia: string;
  nivelAgua: string;
  nivelOleo: string;
  eixo: string;
  dianteira: string;
  descricaoDianteira: string;
  tracao: string;
  descricaoTracao: string;
  truck: string | null;
  descricaoTruck: string | null;
  quartoEixo: string | null;
  descricaoQuartoEixo: string | null;
  avariasCabine: string;
  descricaoAvariasCabine: string | null;
  bauPossuiAvarias: string;
  descricaoAvariasBau: string | null;
  funcionamentoParteEletrica: string;
  descricaoParteEletrica: string;
  fotoVeiculo: string | null;
  kilometer: string;
  isFinished: boolean;
}

export async function createInspectionWithTransaction({ data, id }: { data: InspectionInput; id?: string; }) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid inspection data');
  }
  try {
    return await prisma.$transaction(async (tx) => {
      // Crie o registro de inspeção com todos os dados
      const inspection = await tx.inspection.create({
        data: {
          ...data,
          dataInspecao: new Date(),
          updatedAt: new Date(),
        },
      });

      if (data.status === "INICIO") {
        // Crie um novo recorde de inspeção para o início da viagem
        const inspect = await tx.inspect.create({
          data: {
            userId: data.userId,
            startId: inspection.id,
          },
        });
        return { inspection, inspect };
      } else {
        // Encontre o registro de inspeção existente sem fim e atualiza
        const existingInspect = await tx.inspect.findFirst({
          where: {
            userId: data.userId,
            vehicleId: data.vehicleId,
            startId: { not: null },
            endId: null,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        if (!existingInspect && !id) {
          throw new Error("Nenhuma inspeção aberta encontrada para este veículo");
        }

        const inspect = await tx.inspect.upsert({
          where: {
            id: id ?? existingInspect?.id ?? "dummy-id",
          },
          create: {
            userId: data.userId,
            endId: inspection.id,
          },
          update: {
            endId: inspection.id,
          },
        });

        return { inspection, inspect };
      }
    });
  } catch (error) {
    console.error("A transação falhou:", error);
    throw error;
  }
}
