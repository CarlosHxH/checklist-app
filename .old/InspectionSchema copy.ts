import { z } from "zod";

export const InspectionSchema = z.object({
  id: z.string().optional(),
  dataInspecao: z.string().min(1, { message: "Data da inspeção é obrigatória" }),
  status: z.enum(["INICIO", "FINAL"], {
    required_error: "Status é obrigatório",
  }),
  userId: z.string().min(1, { message: "Usuário é obrigatório" }),
  vehicleId: z.string().min(1, { message: "Veículo é obrigatório" }),
  
  crlvEmDia: z.enum(["SIM", "NÃO"], {
    required_error: "CRLV é obrigatório",
  }),
  certificadoTacografoEmDia: z.enum(["SIM", "NÃO"], {
    required_error: "Certificado do tacógrafo é obrigatório",
  }),
  
  nivelAgua: z.enum(["NORMAL", "BAIXO", "CRITICO"], {
    required_error: "Nível de água é obrigatório",
  }),

  nivelOleo: z.enum(["NORMAL", "BAIXO", "CRITICO"], {
    required_error: "Nível de óleo é obrigatório",
  }),
  
  dianteira: z.enum(["BOM", "RUIM"], {
    required_error: "Estado da dianteira é obrigatório",
  }),
  descricaoDianteira: z.string().optional().refine(
    (val) => !(val === "RUIM" && !val),
    { message: "Descrição obrigatória quando dianteira está RUIM" }
  ),
  
  eixo: z.string(),
  tracao: z.enum(["BOM", "RUIM", ""]).optional(),
  descricaoTracao: z.string().optional(),
  truck: z.enum(["BOM", "RUIM", ""]).optional(),
  descricaoTruck: z.string().optional(),
  quartoEixo: z.enum(["BOM", "RUIM", ""]).optional(),
  descricaoQuartoEixo: z.string().optional(),
  
  avariasCabine: z.enum(["SIM", "NÃO"], {
    required_error: "Avarias na cabine é obrigatório",
  }),

  descricaoAvariasCabine: z.string().optional().refine(
    (val) => !(val === "SIM" && !val),
    { message: "Descrição obrigatória quando há avarias na cabine" }
  ),
  
  bauPossuiAvarias: z.enum(["SIM", "NÃO"], {
    required_error: "Avarias no baú é obrigatório",
  }),
  descricaoAvariasBau: z.string().optional().refine(
    (val) => !(val === "SIM" && !val),
    { message: "Descrição obrigatória quando há avarias no baú" }
  ),
  
  funcionamentoParteEletrica: z.enum(["BOM", "RUIM"], {
    required_error: "Estado da parte elétrica é obrigatório",
  }),
  descricaoParteEletrica: z.string().optional().refine(
    (val) => !(val === "RUIM" && !val),
    { message: "Descrição obrigatória quando parte elétrica está RUIM" }
  ),
  
  fotoVeiculo: z.string().min(1, { message: "Foto do veículo é obrigatória" }),
});

export type InspectionFormData = z.infer<typeof InspectionSchema>;