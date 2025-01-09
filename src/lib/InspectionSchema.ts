import { z } from "zod";

export const InspectionSchema = z.object({
  id: z.string().optional(),
  //dataInspecao: z.date().optional().nullable(),//string().transform(str => new Date(str)),
  status: z.enum(["INICIO", "FINAL"]).optional().nullable(),
  userId: z.string().min(1),
  vehicleId: z.string().min(1),
  
  crlvEmDia: z.string().optional().nullable(),
  certificadoTacografoEmDia: z.string().optional().nullable(),
  nivelAgua: z.enum(["NORMAL", "BAIXO", "CRITICO"]).optional().nullable(),
  nivelOleo: z.enum(["NORMAL", "BAIXO", "CRITICO"]).optional().nullable(),
  
  eixo: z.string(),
  dianteira: z.string().optional().nullable(),
  descricaoDianteira: z.string().optional().nullable(),
  tracao: z.string().optional().nullable(),
  descricaoTracao: z.string().optional().nullable(),
  truck: z.string().optional().nullable(),
  descricaoTruck: z.string().optional().nullable(),
  quartoEixo: z.string().optional().nullable(),
  descricaoQuartoEixo: z.string().optional().nullable(),
  
  avariasCabine: z.string().optional().nullable(),
  descricaoAvariasCabine: z.string().optional().nullable(),
  bauPossuiAvarias: z.string().optional().nullable(),
  descricaoAvariasBau: z.string().optional().nullable(),
  funcionamentoParteEletrica: z.string().optional().nullable(),
  descricaoParteEletrica: z.string().optional().nullable(),
  fotoVeiculo: z.string().nullable(),
});

export type InspectionFormData = z.infer<typeof InspectionSchema>;