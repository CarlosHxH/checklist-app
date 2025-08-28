// lib/tempoParadoService.ts
import { PrismaClient, Order } from '@prisma/client';

const prisma = new PrismaClient();

export class TempoParadoService {
  
  // Calcula o tempo parado de uma ordem individual
  static calcularTempoParado(order: Order): number {
    const inicio = order.startedData;
    const fim = order.finishedData || new Date();
    
    const diffMs = fim.getTime() - inicio.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    return diffMinutes;
  }
  
  // Formata o tempo para exibição
  static formatarTempo(minutos: number): string {
    if (minutos < 60) {
      return `${minutos} minutos`;
    }
    
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    
    if (horas < 24) {
      return minutosRestantes > 0 
        ? `${horas}h ${minutosRestantes}min` 
        : `${horas}h`;
    }
    
    const dias = Math.floor(horas / 24);
    const horasRestantes = horas % 24;
    
    if (horasRestantes === 0) {
      return `${dias} dias`;
    }
    
    return `${dias}d ${horasRestantes}h`;
  }
  
  // Busca ordens com filtros
  static async buscarOrdensComFiltros(filters: {
    startDate?: Date;
    endDate?: Date;
    vehicleId?: string;
    status?: string;
  } = {}) {
    const where: any = {};
    
    if (filters.startDate || filters.endDate) {
      where.startedData = {};
      if (filters.startDate) {
        where.startedData.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.startedData.lte = filters.endDate;
      }
    }
    
    if (filters.vehicleId) {
      where.vehicleId = filters.vehicleId;
    }
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    return await prisma.order.findMany({
      where,
      include: {
        vehicle: {
          select: {
            plate: true
          }
        },
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        startedData: 'desc'
      }
    });
  }
  
  // Gera o relatório completo
  static async gerarRelatorioTempoParado(filters?: {
    startDate?: Date;
    endDate?: Date;
    vehicleId?: string;
    status?: string;
  }): Promise<any> {
    const orders = await this.buscarOrdensComFiltros(filters);
    
    const ordersComTempo = orders.map(order => {
      const tempoParadoMinutos = this.calcularTempoParado(order);
      
      return {
        vehicle: order.vehicleId,
        placa: order.vehicle.plate,
        tempoParado: this.formatarTempo(tempoParadoMinutos),
        tempoParadoMinutos,
        startedData: order.startedData,
        finishedData: order.finishedData,
        motivoParada: order.motivoParada,
        osNumber: order.osNumber,
        status: order.status,
        motorista: order.user.name
      };
    });
    
    // Calcula tempo total parado geral
    const tempoTotalMinutos = ordersComTempo.reduce((total, order) => {
      return total + (order.tempoParadoMinutos || 0);
    }, 0);
    
    // Encontra as datas de início e fim do período
    const datasInicio = orders.map(o => o.startedData);
    const datasFim = orders.filter(o => o.finishedData).map(o => o.finishedData!);
    
    const periodoInicio = datasInicio.length > 0 
      ? new Date(Math.min(...datasInicio.map(d => d.getTime())))
      : new Date();
    
    const periodoFim = datasFim.length > 0 
      ? new Date(Math.max(...datasFim.map(d => d.getTime())))
      : new Date();
    
    // Estatísticas
    const totalOrdens = orders.length;
    const ordensFinalizadas = orders.filter(o => o.isCompleted).length;
    const ordensPendentes = totalOrdens - ordensFinalizadas;
    
    return {
      orders: ordersComTempo,
      totalTempoParadoGeral: this.formatarTempo(tempoTotalMinutos),
      totalTempoParadoMinutos: tempoTotalMinutos,
      periodoInicio,
      periodoFim,
      totalOrdens,
      ordensFinalizadas,
      ordensPendentes,
      veiculosUnicos: [...new Set(orders.map(o => o.vehicleId))].length
    };
  }
}