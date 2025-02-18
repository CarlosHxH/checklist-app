import { z } from "zod";

export const InspectionSchema = z.object({
  id: z.string().optional(),
  status: z.enum(["INICIO", "FINAL"]),
  kilometer: z.string().optional().nullable(),
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
  fotoVeiculo: z.string().optional().nullable(),
});

export type InspectionFormData = z.infer<typeof InspectionSchema>;