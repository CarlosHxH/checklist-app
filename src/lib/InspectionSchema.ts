import { z } from "zod";

export const InspectionSchema = z.object({
  id: z.string().optional(),
  dataInspecao: z.string().transform(str => new Date(str)),
  status: z.enum(["INICIO", "FINAL"]),
  userId: z.string().min(1),
  vehicleId: z.string().min(1),
  
  crlvEmDia: z.enum(["SIM", "NÃO"]).optional().nullable(),
  certificadoTacografoEmDia: z.enum(["SIM", "NÃO"]).optional().nullable(),
  nivelAgua: z.enum(["NORMAL", "BAIXO", "CRITICO"]).optional().nullable(),
  nivelOleo: z.enum(["NORMAL", "BAIXO", "CRITICO"]).optional().nullable(),
  
  eixo: z.string(),
  dianteira: z.enum(["BOM", "RUIM"]).optional().nullable(),
  descricaoDianteira: z.string().optional().nullable(),
  tracao: z.enum(["BOM", "RUIM"]).optional().nullable(),
  descricaoTracao: z.string().optional().nullable(),
  truck: z.enum(["BOM", "RUIM"]).optional().nullable(),
  descricaoTruck: z.string().optional().nullable(),
  quartoEixo: z.enum(["BOM", "RUIM"]).optional().nullable(),
  descricaoQuartoEixo: z.string().optional().nullable(),
  
  avariasCabine: z.enum(["SIM", "NÃO"]).optional().nullable(),
  descricaoAvariasCabine: z.string().optional().nullable(),
  bauPossuiAvarias: z.enum(["SIM", "NÃO"]).optional().nullable(),
  descricaoAvariasBau: z.string().optional().nullable(),
  funcionamentoParteEletrica: z.enum(["BOM", "RUIM"]).optional().nullable(),
  descricaoParteEletrica: z.string().optional().nullable(),
  
  fotoVeiculo: z.string().nullable(),
});

export type InspectionFormData = z.infer<typeof InspectionSchema>;