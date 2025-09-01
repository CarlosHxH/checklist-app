import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Order } from "@prisma/client";
import { getInspectionsReport12Months, lastMonthOrders } from "./inspectionServiceYears";

// Função auxiliar para formatar dados
const format = (title: string,href: string,value: number) => ({title,href,value });

// Versão corrigida - usando agregação correta do Prisma
async function processInspectionData() {
  const result = await prisma.user.findMany({
    where: { Inspect: { some: {} } },
    select: {
      name: true,
      Inspect: { select: { startId: true, endId: true } }
    }
  });

  return result.map(user => ({
    motorista: user.name,
    iniciada: user.Inspect.filter(i => i.startId !== null).length,
    finalizada: user.Inspect.filter(i => i.endId !== null).length
  }));
}

// Otimizado: Count agregado em uma única query
async function getStatusLast30Days() {
  const [totalResult, finishedResult] = await Promise.all([
    prisma.inspect.aggregate({
      _count: { startId: true },
      where: { startId: { not: null } }
    }),
    prisma.inspect.aggregate({
      _count: { endId: true },
      where: { endId: { not: null } }
    })
  ]);

  const total = totalResult._count.startId;
  const finished = finishedResult._count.endId;
  const unfinished = total - finished;
  
  const calcPct = (n: number): string => total > 0 ? (n / total * 100).toFixed(2) : '0.00';

  return { 
    finished, unfinished, total,
    finishedPercentage: calcPct(finished), 
    unfinishedPercentage: calcPct(unfinished) 
  };
}

// Funções utilitárias mantidas (já estão otimizadas)
function calcularTempoParado(order: Order): number {
  const inicio = order.startedData.getTime();
  const fim = (order.finishedData || new Date()).getTime();
  return Math.floor((fim - inicio) / (1000 * 60));
}

function formatarTempo(minutos: number): string {
  if (minutos < 60) return `${minutos} minutos`;
  
  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;
  
  if (horas < 24) {
    return minutosRestantes > 0 ? `${horas}h ${minutosRestantes}m` : `${horas}h`;
  }
  
  const dias = Math.floor(horas / 24);
  const horasRestantes = horas % 24;
  return horasRestantes === 0 ? `${dias} dias` : `${dias}d ${horasRestantes}h`;
}

// Otimizado: Menos operações e queries mais eficientes
async function gerarRelatorioTempoParado(filters?: {
  startDate?: Date;
  endDate?: Date;
  vehicleId?: string;
  status?: string;
}): Promise<any> {
  const whereClause = {
    ...(filters?.startDate && { startedData: { gte: filters.startDate } }),
    ...(filters?.endDate && { startedData: { lte: filters.endDate } }),
    ...(filters?.vehicleId && { vehicleId: filters.vehicleId }),
    ...(filters?.status && { status: filters.status })
  };

  const orders = await prisma.order.findMany({
    where: whereClause,
    include: { 
      vehicle: { select: { plate: true } }, 
      user: { select: { name: true } } 
    },
    orderBy: { startedData: 'desc' }
  });

  if (!orders.length) {
    const now = new Date();
    return {
      orders: [],
      totalTempoParadoGeral: '00:00',
      totalTempoParadoMinutos: 0,
      periodoInicio: now,
      periodoFim: now,
      totalOrdens: 0,
      ordensFinalizadas: 0,
      ordensPendentes: 0,
      veiculosUnicos: 0
    };
  }

  // Processamento em lote mais eficiente
  let minTimestamp = Infinity;
  let maxTimestamp = -Infinity;
  let ordensFinalizadas = 0;
  const vehicleIds = new Set<string>();
  let tempoTotalMinutos = 0;

  const ordersComTempo = orders.map(order => {
    const tempoParadoMinutos = calcularTempoParado(order);
    tempoTotalMinutos += tempoParadoMinutos;

    const startTime = order.startedData.getTime();
    minTimestamp = Math.min(minTimestamp, startTime);
    
    if (order.finishedData) {
      const endTime = order.finishedData.getTime();
      maxTimestamp = Math.max(maxTimestamp, endTime);
    }

    if (order.isCompleted) ordensFinalizadas++;
    vehicleIds.add(order.vehicleId);

    return {
      vehicle: order.vehicleId,
      placa: order.vehicle.plate,
      tempoParado: formatarTempo(tempoParadoMinutos),
      tempoParadoMinutos,
      startedData: order.startedData,
      finishedData: order.finishedData,
      motivoParada: order.motivoParada,
      osNumber: order.osNumber,
      status: order.status,
      motorista: order.user.name
    };
  });

  return {
    orders: ordersComTempo,
    totalTempoParadoGeral: formatarTempo(tempoTotalMinutos),
    totalTempoParadoMinutos: tempoTotalMinutos,
    periodoInicio: new Date(minTimestamp),
    periodoFim: maxTimestamp > -Infinity ? new Date(maxTimestamp) : new Date(),
    totalOrdens: orders.length,
    ordensFinalizadas,
    ordensPendentes: orders.length - ordensFinalizadas,
    veiculosUnicos: vehicleIds.size
  };
}

// Otimizado: Paralelização de queries e menos await sequenciais
export async function GET() {
  try {
    // Executa todas as queries em paralelo
    const [
      inspectionsCount,
      viagensCount,
      usersCount,
      vehiclesCount,
      byUsers,
      lastYears,
      statusSummary,
      ordens,
      lastOrders
    ] = await Promise.all([
      prisma.inspection.count({ where: { status: "INSPECAO" } }),
      prisma.inspection.count({ where: { NOT: { status: "INSPECAO" } } }),
      prisma.user.count(),
      prisma.vehicle.count(),
      processInspectionData(),
      getInspectionsReport12Months(),
      getStatusLast30Days(),
      gerarRelatorioTempoParado(),
      lastMonthOrders()
    ]);

    // Formatação síncrona (não precisa de await)
    const cards = [
      format("USUÁRIOS", "/dashboard/user", usersCount),
      format("VIAGENS", "/dashboard/viagens",  viagensCount),
      format("INSPEÇÕES", "/dashboard/inspecao", inspectionsCount),
      format("VEICULOS", "/dashboard/vehicle", vehiclesCount)
    ];

    return NextResponse.json(
      {
        cards,
        byUsers,
        lastYears,
        inspectionsByDate: lastYears.chartData,
        statusSummary,
        ordens,
        lastOrders
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}