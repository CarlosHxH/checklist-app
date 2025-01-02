import { z } from "zod";

export const InspectionSchema = z.object({
  id: z.string().optional(),
  dataInspecao: z.string().transform(str => new Date(str)),
  status: z.enum(["INICIO", "FINAL"]),
  userId: z.string().min(1),
  vehicleId: z.string().min(1),
  
  crlvEmDia: z.enum(["SIM", "NÃO"]),
  certificadoTacografoEmDia: z.enum(["SIM", "NÃO"]),
  nivelAgua: z.enum(["NORMAL", "BAIXO", "CRITICO"]),
  nivelOleo: z.enum(["NORMAL", "BAIXO", "CRITICO"]),
  
  eixo: z.string(),
  dianteira: z.enum(["BOM", "RUIM"]),
  descricaoDianteira: z.string().optional().nullable(),
  tracao: z.enum(["BOM", "RUIM"]).optional().nullable(),
  descricaoTracao: z.string().optional().nullable(),
  truck: z.enum(["BOM", "RUIM"]).optional().nullable(),
  descricaoTruck: z.string().optional().nullable(),
  quartoEixo: z.enum(["BOM", "RUIM"]).optional().nullable(),
  descricaoQuartoEixo: z.string().optional().nullable(),
  
  avariasCabine: z.enum(["SIM", "NÃO"]),
  descricaoAvariasCabine: z.string().optional().nullable(),
  bauPossuiAvarias: z.enum(["SIM", "NÃO"]),
  descricaoAvariasBau: z.string().optional().nullable(),
  funcionamentoParteEletrica: z.enum(["BOM", "RUIM"]),
  descricaoParteEletrica: z.string().optional().nullable(),
  
  fotoVeiculo: z.string().nullable(),
});

export type InspectionFormData = z.infer<typeof InspectionSchema>;