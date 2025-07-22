import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getInspectionsReport12Months } from "./inspectionServiceYears.ts";

const format = async (
  title: string,
  label: "up" | "down" | "neutral",
  interval: number | string,
  occurrences: string | number
) => {
  return {
    title,
    value: `${occurrences}`,
    interval: interval,
    trend: { label },
  };
};

async function processInspectionData() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true },
  });
  const iniciada = await prisma.inspection.groupBy({
    by: ["userId"],
    where: { status: "INICIO" },
    _count: { id: true },
  });
  const finalizada = await prisma.inspection.groupBy({
    by: ["userId"],
    where: { status: "FINAL" },
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

export async function GET(request: NextRequest) {
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
    const inspection = await format("Inspeções", "up", "Total", inspections);
    const viagen = await format("Viagens", "up", "Total", viagens);
    const user = await format("Usuários", "down", "Total", users);
    const vehicle = await format("Veiculos", "neutral", "Total", vehicles);
    const byUsers = await processInspectionData();
    const lastYears = await getInspectionsReport12Months();
    const statusSummary = await getStatusLast30Days();
    const inspectionsByDate = lastYears.chartData;

    return NextResponse.json(
      {
        cards: [user, viagen, inspection, vehicle],
        byUsers,
        lastYears,
        inspectionsByDate,
        statusSummary,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error }, { status: 403 });
  } finally {
    await prisma.$disconnect();
  }
}
