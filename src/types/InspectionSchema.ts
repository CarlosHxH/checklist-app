import { z } from "zod";

const PhotoSchema = z.object({
  photo: z.string(),
});

export const InspectionSchema = z.object({
  id:                         z.string().optional(),
  status:                     z.enum(["INICIO", "FINAL","INSPECAO"]),
  kilometer:                  z.string(),
  userId:                     z.string().min(1),
  vehicleId:                  z.string().min(1),
  crlvEmDia:                  z.enum(["SIM", "NÃO"]),
  certificadoTacografoEmDia:  z.enum(["SIM", "NÃO"]),
  nivelAgua:                  z.enum(["NORMAL", "BAIXO", "CRITICO"]),
  nivelOleo:                  z.enum(["NORMAL", "BAIXO", "CRITICO"]),
  
  eixo:                       z.string(),
  dianteira:                  z.string().optional().nullable(),
  descricaoDianteira:         z.string().optional().nullable(),
  tracao:                     z.string().optional().nullable(),
  descricaoTracao:            z.string().optional().nullable(),
  truck:                      z.string().optional().nullable(),
  descricaoTruck:             z.string().optional().nullable(),
  quartoEixo:                 z.string().optional().nullable(),
  descricaoQuartoEixo:        z.string().optional().nullable(),

  avariasCabine:              z.enum(["SIM", "NÃO"]),
  descricaoAvariasCabine:     z.string().optional().nullable(),
  bauPossuiAvarias:           z.enum(["SIM", "NÃO"]),
  descricaoAvariasBau:        z.string().optional().nullable(),
  funcionamentoParteEletrica: z.enum(["BOM", "RUIM"]),
  descricaoParteEletrica:     z.string().optional().nullable(),
  
  isFinished:                 z.boolean().optional(),
  
  user:                       z.any(),
  vehicle:                    z.any(),
  
  photos:                     z.array(PhotoSchema).min(4).optional(),

  extintor:                   z.string().optional().nullable(),
  fotoExtintor:               z.string().optional().nullable(),

  fotoDocumento:              z.string().optional().nullable(),
  fotoTacografo:              z.string().optional().nullable(),

  fotoAvarias1:               z.string().optional().nullable(),
  fotoAvarias2:               z.string().optional().nullable(),
  fotoAvarias3:               z.string().optional().nullable(),
  fotoAvarias4:               z.string().optional().nullable(),

});

export type InspectionFormData = z.infer<typeof InspectionSchema>;