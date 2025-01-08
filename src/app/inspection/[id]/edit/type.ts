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