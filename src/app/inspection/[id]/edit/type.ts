import { Vehicle } from "@prisma/client";

export interface InspectionFormData {
  fotoCRLV?: string;
  fotoTacografo?: string;
  vehicle: Vehicle;
  placa?: string;
  modelo?: string;
  crlvEmDia?: boolean;
  certificadoTacografoEmDia?: boolean;
  nivelAgua?: "NORMAL" | "BAIXO" | "CRITICO";
  nivelOleo?: "NORMAL" | "BAIXO" | "CRITICO";
  dianteira?: "BOM" | "RUIM";
  tracao?: "BOM" | "RUIM";
  truck?: "BOM" | "RUIM";
  quartoEixo?: "BOM" | "RUIM";
  descricaoDianteira?: string;
  descricaoTracao?: string;
  descricaoTruck?: string;
  descricaoQuartoEixo?: string;
  avariasCabine?: "SIM" | "NÃO";
  descricaoAvariasCabine?: string;
  bauPossuiAvarias?: "SIM" | "NÃO";
  descricaoAvariasBau?: string;
  funcionamentoParteEletrica?: "BOM" | "RUIM";
  descricaoParteEletrica?: string;
  fotoVeiculo?: string | File;
  eixo?: number;
}


/*

export interface InspectionFormData
{
  fotoCRLV: string | undefined;
  fotoTacografo: string | undefined;
  vehicle: {
    id: string;
    plate: string;
    model: string;
  };
  placa: string;
  modelo: string;
  crlvEmDia: boolean;
  certificadoTacografoEmDia: boolean;
  nivelAgua: string;
  nivelOleo: string;
  situacaoPneus: string;
  motivoPneuRuim: string;
  pneuFurado: boolean;
  avariasCabine: boolean;
  descricaoAvariasCabine: string;
  bauPossuiAvarias: boolean;
  descricaoAvariasBau: string;
  funcionamentoParteEletrica: boolean;
  motivoParteEletricaRuim: string;
  sugestao: string;
}
  */