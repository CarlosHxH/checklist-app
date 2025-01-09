import { prisma } from '@/lib/prisma'

interface DailyOccurrence {
  day: number;
  count: number;
}


export async function getMonthlyOccurrences(
  year: number,
  month: number
): Promise<DailyOccurrence[]> {
  // Primeiro dia do mês
  const startDate = new Date(year, month - 1, 1);
  
  // Último dia do mês
  const endDate = new Date(year, month, 0);
  const daysInMonth = endDate.getDate();
  
  // Buscar todas as ocorrências do mês
  const occurrences = await prisma.inspection.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lt: new Date(year, month, 1) // Primeiro dia do próximo mês
      }
    },
    select: {
      createdAt: true
    }
  });
  
  // Inicializar array com zeros para todos os dias do mês
  const dailyCounts: number[] = Array(daysInMonth).fill(0);
  
  // Contar ocorrências por dia
  occurrences.forEach(occurrence => {
    const day = occurrence.createdAt.getDate();
    dailyCounts[day - 1]++; // Subtrai 1 porque array começa em 0
  });
  
  // Formatar resultado
  const result: DailyOccurrence[] = dailyCounts.map((count, index) => ({
    day: index + 1,
    count: count
  }));
  
  return result;
}

export async function getMonthlyOccurrencesVehicles(
  year: number,
  month: number
): Promise<DailyOccurrence[]> {
  // Primeiro dia do mês
  const startDate = new Date(year, month - 1, 1);
  
  // Último dia do mês
  const endDate = new Date(year, month, 0);
  const daysInMonth = endDate.getDate();
  
  // Buscar todas as ocorrências do mês
  const occurrences = await prisma.vehicle.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lt: new Date(year, month, 1) // Primeiro dia do próximo mês
      }
    },
    select: {
      createdAt: true
    }
  });
  
  // Inicializar array com zeros para todos os dias do mês
  const dailyCounts: number[] = Array(daysInMonth).fill(0);
  
  // Contar ocorrências por dia
  occurrences.forEach(occurrence => {
    const day = occurrence.createdAt.getDate();
    dailyCounts[day - 1]++; // Subtrai 1 porque array começa em 0
  });
  
  // Formatar resultado
  const result: DailyOccurrence[] = dailyCounts.map((count, index) => ({
    day: index + 1,
    count: count
  }));
  
  return result;
}

export async function getMonthlyOccurrencesUsers(
  year: number,
  month: number
): Promise<DailyOccurrence[]> {
  // Primeiro dia do mês
  const startDate = new Date(year, month - 1, 1);
  
  // Último dia do mês
  const endDate = new Date(year, month, 0);
  const daysInMonth = endDate.getDate();
  
  // Buscar todas as ocorrências do mês
  const occurrences = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lt: new Date(year, month, 1) // Primeiro dia do próximo mês
      }
    },
    select: {
      createdAt: true
    }
  });
  
  // Inicializar array com zeros para todos os dias do mês
  const dailyCounts: number[] = Array(daysInMonth).fill(0);
  
  // Contar ocorrências por dia
  occurrences.forEach(occurrence => {
    const day = occurrence.createdAt.getDate();
    dailyCounts[day - 1]++; // Subtrai 1 porque array começa em 0
  });
  
  // Formatar resultado
  const result: DailyOccurrence[] = dailyCounts.map((count, index) => ({
    day: index + 1,
    count: count
  }));
  
  return result;
}