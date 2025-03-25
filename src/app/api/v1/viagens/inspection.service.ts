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
  photos: [{
    [x: string]: string,
  }]
}

export async function createInspectionWithTransaction(validatedData: InspectionInput) {
  const { id, ...data } = validatedData;

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Criar o registro de inspeção
      // Create the inspection record in the database
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
            create: data.photos.map((photo: any) => ({
              photo: photo.photo,
              type: photo.type,
              description: photo.description
            }))
          }
        }
      });
      
      console.log("inspection created", inspection);

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
        // Se não houver uma inspeção aberta, criar um novo registro de inspeção
        if (!openInspection) {
          inspect = await tx.inspect.create({
            data: {
              userId: data.userId,
              endId: inspection.id,
              vehicleId: data.vehicleId,
            }
          });
          console.log("inspect created");
        } else {
          inspect = await tx.inspect.update({
            where: { id: openInspection.id },
            data: { endId: inspection.id }
          });
          console.log("inspect updated");
        }
      }

      return { inspection };
    });
  } catch (error) {
    console.error("A transação falhou:", error);
    throw error;
  }
}