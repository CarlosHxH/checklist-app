import { inspection } from "@prisma/client";

// Type definition for the inspection data
export interface VehicleInspection {
  id: string;
  startId: string;
  endId: string;
  start: inspection;
  end: inspection;
  vehicle: {
    make: string;
    model: string;
    year: string;
    plate: string;
    eixo: string;
    cidadeBase: string;
  };
  dataInspecao: string;
  status: string;
  crlvEmDia: string;
  certificadoTacografoEmDia: string;
  nivelAgua: string;
  nivelOleo: string;
  dianteira: string;
  tracao: string;
  truck: string;
  avariasCabine: string;
  bauPossuiAvarias: string;
  funcionamentoParteEletrica: string;
}
