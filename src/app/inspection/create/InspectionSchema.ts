import { z } from "zod";

const MAX_FILE_SIZE = 15000000
const ACCEPTED_IMAGE_TYPES = [
 'image/jpeg',
 'image/jpg',
 'image/png',
 'image/webp',
]

export const InspectionSchema = z.object({
  id: z.string().optional(),
  status: z.enum(["INICIO", "FINAL"]),
  userId: z.string().min(1),
  vehicleId: z.string().min(1),
  crlvEmDia: z.string(),
  certificadoTacografoEmDia: z.string(),
  nivelAgua: z.enum(["NORMAL", "BAIXO", "CRITICO"]),
  nivelOleo: z.enum(["NORMAL", "BAIXO", "CRITICO"]),
  
  eixo: z.string(),
  dianteira: z.string().optional().nullable(),
  descricaoDianteira: z.string().optional().nullable(),
  tracao: z.string().optional().nullable(),
  descricaoTracao: z.string().optional().nullable(),
  truck: z.string().optional().nullable(),
  descricaoTruck: z.string().optional().nullable(),
  quartoEixo: z.string().optional().nullable(),
  descricaoQuartoEixo: z.string().optional().nullable(),
  
  avariasCabine: z.string(),
  descricaoAvariasCabine: z.string().optional().nullable(),
  bauPossuiAvarias: z.string(),
  descricaoAvariasBau: z.string().optional().nullable(),
  funcionamentoParteEletrica: z.string(),
  descricaoParteEletrica: z.string().optional().nullable(),
  fotoVeiculo: z
  .union([
    z
      .instanceof(File, { message: "Image is required" })
      .refine(
        (file) => !file || file.size !== 0 || file.size <= 5000000,
        `Max image size is ${5000000}MB`
      )
      .refine(
        (file) =>
          !file ||
          file.type === "" ||
          ["image/jpeg", "image/png", "image/jpg"].includes(file.type),
        "Only .jpg, .jpeg, and .png formats are supported"
      ),
    z.string().optional(),
  ])
  .refine((value) => value instanceof File || typeof value === "string", {
    message: "Image is required",
  }),
});

export type InspectionFormData = z.infer<typeof InspectionSchema>;