import { TempoParadoService } from '@/lib/tempoParadoService';
import { RelatorioFilters } from '@/types/relatorio';

interface timeType {
    startDate?:string;
    endDate?:string;
    vehicleId?: string;
    status?: string;
}

export default async function tempoParado({ startDate, endDate, vehicleId, status }: timeType) {

  try {
    const filters: RelatorioFilters = {};
    
    if (startDate) {
      filters.startDate = new Date(startDate as string);
    }
    
    if (endDate) {
      filters.endDate = new Date(endDate as string);
    }
    
    if (vehicleId) {
      filters.vehicleId = vehicleId as string;
    }
    
    if (status) {
      filters.status = status as string;
    }
    
    const relatorio = await TempoParadoService.gerarRelatorioTempoParado(filters);
    
    return relatorio
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return []
  }
}