// types/relatorio.ts
export interface OrderTempoParado {
    vehicle: string;
    placa: string;
    tempoParado: string;
    startedData: Date;
    finishedData?: Date;
    motivoParada?: string;
    osNumber: string;
  }
  
  export interface RelatorioTempoParado {
    orders: OrderTempoParado[];
    totalTempoParadoGeral: string;
    periodoInicio: Date;
    periodoFim: Date;
    totalOrdens: number;
    ordensFinalizadas: number;
    ordensPendentes: number;
  }
  
  export interface RelatorioFilters {
    startDate?: Date;
    endDate?: Date;
    vehicleId?: string;
    status?: string;
  }