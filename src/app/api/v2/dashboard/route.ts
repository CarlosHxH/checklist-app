import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getInspectionsReport12Months, lastMonthOrders } from "./inspectionServiceYears.ts";
import { Order } from "@prisma/client";

const format = async (
  title: string,
  href: string,
  label: "up" | "down" | "neutral",
  interval: number | string,
  occurrences: string | number
) => {
  return {
    title,
    href,
    value: `${occurrences}`,
    interval: interval,
    trend: { label },
  };
};

async function processInspectionData() {
  const users = await prisma.user.findMany({select: { id: true, name: true }});
  const iniciada = await prisma.inspect.groupBy({
    by: ["userId"],
    where: { startId: { not: null } },
    _count: { id: true },
  });
  const finalizada = await prisma.inspect.groupBy({
    by: ["userId"],
    where: { endId: { not: null } },
    _count: { id: true },
  });

  const result = iniciada.map((inicio) => {
    const userId = inicio.userId;
    const final = finalizada.find((f) => f.userId === userId);
    const user = users.find((e) => e.id === userId);
    return {
      iniciada: inicio._count.id,
      finalizada: final?._count.id || 0,
      motorista: user?.name,
    };
  });
  return result;
}

// Removed 'export' keyword - this function is only used within this route
async function getStatusLast30Days() {
  const startIdCount = await prisma.inspect.count({
    where: { startId: { not: null } },
  });
  const endIdCount = await prisma.inspect.count({
    where: { endId: { not: null } },
  });
  const finishedPercentage =
    startIdCount > 0 ? (endIdCount / startIdCount) * 100 : 0;
  const unfinishedCount = startIdCount - endIdCount;
  const unfinishedPercentage =
    startIdCount > 0 ? (unfinishedCount / startIdCount) * 100 : 0;

  return {
    finished: endIdCount,
    unfinished: unfinishedCount,
    total: startIdCount,
    finishedPercentage: finishedPercentage.toFixed(2),
    unfinishedPercentage: unfinishedPercentage.toFixed(2),
  };
}

function calcularTempoParado(order: Order): number {
  const inicio = order.startedData;
  const fim = order.finishedData || new Date();
  const diffMs = fim.getTime() - inicio.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  return diffMinutes;
}

function formatarTempo(minutos: number): string {
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

  if (horasRestantes === 0) return `${dias} dias`;
  return `${dias}d ${horasRestantes}h`;
}
async function gerarRelatorioTempoParado(filters?: {
  startDate?: Date;
  endDate?: Date;
  vehicleId?: string;
  status?: string;
}): Promise<any> {
  const orders = await prisma.order.findMany({
    include: {
      vehicle: { select: { plate: true}},
      user: { select: { name: true }}
    },
    orderBy: {startedData: 'desc'}
  });
  
  const ordersComTempo = orders.map(order => {
    const tempoParadoMinutos = calcularTempoParado(order);
    
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
  
  // Calcula tempo total parado geral
  const tempoTotalMinutos = ordersComTempo.reduce((total, order) => {
    return total + (order.tempoParadoMinutos || 0);
  }, 0);
  
  // Encontra as datas de início e fim do período
  const datasInicio = orders.map(o => o.startedData);
  const datasFim = orders.filter(o => o.finishedData).map(o => o.finishedData!);
  
  const periodoInicio = datasInicio.length > 0 ? new Date(Math.min(...datasInicio.map(d => d.getTime()))) : new Date();
  
  const periodoFim = datasFim.length > 0 ? new Date(Math.max(...datasFim.map(d => d.getTime()))) : new Date();
  
  // Estatísticas
  const totalOrdens = orders.length;
  const ordensFinalizadas = orders.filter(o => o.isCompleted).length;
  const ordensPendentes = totalOrdens - ordensFinalizadas;
  
  return {
    orders: ordersComTempo,
    totalTempoParadoGeral: formatarTempo(tempoTotalMinutos),
    totalTempoParadoMinutos: tempoTotalMinutos,
    periodoInicio,
    periodoFim,
    totalOrdens,
    ordensFinalizadas,
    ordensPendentes,
    veiculosUnicos: [...new Set(orders.map(o => o.vehicleId))].length
  };
}



export async function GET() {
  try {
    const inspections = await prisma.inspection.count({
      where: { status: "INSPECAO" },
    });
    const viagens = await prisma.inspection.count({
      where: { NOT: { status: "INSPECAO" } },
    });
    const users = await prisma.user.count();
    const vehicles = await prisma.vehicle.count();
    // Buscando todos os usuários
    const inspection = await format("INSPEÇÕES","/dashboard/inspecao", "up", "Total", inspections);
    const viagen = await format("VIAGENS","/dashboard/viagens", "up", "Total", viagens);
    const user = await format("USUÁRIOS","/dashboard/user", "down", "Total", users);
    const vehicle = await format("VEICULOS","/dashboard/vehicle", "neutral", "Total", vehicles);
    
    const byUsers = await processInspectionData();
    const lastYears = await getInspectionsReport12Months();
    const statusSummary = await getStatusLast30Days();
    const inspectionsByDate = lastYears.chartData;

    //const orderTime = await tempoParado({});
    const ordens = await gerarRelatorioTempoParado();
    const lastOrders = await lastMonthOrders();
    
    return NextResponse.json(
      {
        cards: [user, viagen, inspection, vehicle],
        byUsers,
        lastYears,
        inspectionsByDate,
        statusSummary,
        ordens,
        lastOrders
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error }, { status: 403 });
  } finally {
    await prisma.$disconnect();
  }
}
