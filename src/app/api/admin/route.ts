import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { InspectionSchema } from "@/lib/InspectionSchema";
import { getMonthlyOccurrences, getMonthlyOccurrencesUsers, getMonthlyOccurrencesVehicles } from "@/lib/occurrences";

const format = async(occurrences:any[])=>{
  const chartData = occurrences.map(item => item.count);
  const total = chartData.reduce((acc, curr) => acc + curr, 0);
  const average = (total / chartData.length).toFixed(1);
  return {chartData,total,average}
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(
      searchParams.get("year") || String(new Date().getFullYear())
    );
    const month = parseInt(
      searchParams.get("month") || String(new Date().getMonth() + 1)
    );
    // Buscando todos os usuários
    const inspection = format(await getMonthlyOccurrences(year, month));
    const users = format(await getMonthlyOccurrencesUsers(year, month));
    const vehicle = format(await getMonthlyOccurrencesVehicles(year, month));

    const months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho",
      "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ]
    const data = [
      {
        title: "Usuários",
        value: `${(await users).total}`,
        interval: months[month-1],
        trend: {label:"up",value:(await users).average},
        data: (await users).chartData,
      },
      {
        title: "Veiculos",
        value: `${(await vehicle).total}`,
        interval: months[month-1],
        trend: {label:"down",value:(await vehicle).average},
        data: (await vehicle).chartData,
      },
      {
        title: "Inspeções",
        value: `${(await inspection).total}`,
        interval: months[month-1],
        trend: {label:"neutral",value:(await vehicle).average},
        data: (await inspection).chartData,
      }
    ];
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json({ error });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    //delete data.id; // Remove ID to let Prisma auto-generate it
    const newData = { ...data };
    delete newData.id;

    if (!data.dataInspecao) delete data.dataInspecao;

    const validatedData = InspectionSchema.parse(newData);

    const inspection = await prisma.inspection.create({
      data: validatedData,
      include: {
        user: true,
        vehicle: true,
      },
    });

    return NextResponse.json(inspection);
  } catch (error) {
    console.error("Error creating inspection:", error);
    return NextResponse.json(
      { error: "Failed to create inspection" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!!updateData.dataInspecao) delete updateData.dataInspecao;

    const validatedData = InspectionSchema.parse(updateData);

    const inspection = await prisma.inspection.update({
      where: { id },
      data: validatedData,
      include: {
        user: true,
        vehicle: true,
      }
    });
    return NextResponse.json(inspection);
  } catch (error) {
    console.error("Error updating inspection:", error);
    return NextResponse.json(
      { error: "Failed to update inspection" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.inspection.delete({where: { id }});
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting inspection:", error);
    return NextResponse.json(
      { error: "Failed to delete inspection" },
      { status: 500 }
    );
  }
}
