import { prisma } from "@/lib/prisma";

export interface InspectionPhoto {
  photo: string;
  type: string;
  description?: string;
}

export interface InspectionInput {
  id: string;
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
  photos?: InspectionPhoto[];
}

export interface CreateInspectionResult {
  success: boolean;
  data?: {
    inspection: any;
    inspect: any;
  };
  error?: string;
}

export async function createInspectionWithTransaction(
  validatedData: InspectionInput
): Promise<CreateInspectionResult> {
  const { id, ...data } = validatedData;

  if (!["INICIO", "FINAL"].includes(data.status)) {
    return {
      success: false,
      error: "Invalid status. Must be 'INICIO' or 'FINAL'"
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create the inspection record
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
          eixo: data.eixo, // Added missing field
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
          vehicleKey: data.vehicleKey, // Added missing field
          isFinished: data.isFinished,
          photos: data.photos && data.photos.length > 0 ? {
            create: data.photos.map((photo) => ({
              photo: photo.photo,
              type: photo.type,
              description: photo.description
            }))
          } : undefined
        }
      });

      // Handle inspect record based on status
      let inspect;
      const inspectData = {
        userId: data.userId,
        vehicleId: data.vehicleId
      };

      if (data.status === "INICIO") {
        inspect = await tx.inspect.create({
          data: {
            ...inspectData,
            startId: inspection.id
          }
        });
      } else if (data.status === "FINAL") {
        inspect = await tx.inspect.update({
          where: { id },
          data: { endId: inspection.id }
        });
      }
      return { inspection, inspect };
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating inspection:", error);
    
    return {
      success: false,
      error: error instanceof Error 
        ? error.message 
        : "An unexpected error occurred while creating the inspection"
    };
  }
}

// Helper function to validate inspection data
export function validateInspectionInput(data: Partial<InspectionInput>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!data.id) errors.push("ID is required");
  if (!data.userId) errors.push("User ID is required");
  if (!data.vehicleId) errors.push("Vehicle ID is required");
  if (!data.status || !["INICIO", "FINAL"].includes(data.status)) {
    errors.push("Status must be 'INICIO' or 'FINAL'");
  }
  if (!data.kilometer) errors.push("Kilometer reading is required");
  if (!data.crlvEmDia) errors.push("CRLV status is required");
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Utility function to get inspection by ID
export async function getInspectionById(inspectionId: string) {
  try {
    return await prisma.inspection.findUnique({
      where: { id: inspectionId },
      include: {
        photos: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        vehicle: {
          select: {
            id: true,
            plate: true,
            model: true
          }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching inspection:", error);
    return null;
  }
}