import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { InspectionSchema } from "@/lib/InspectionSchema";
import { getMonthlyOccurrences } from "@/lib/occurrences";

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
    const users = await prisma.user.findMany();
    const vehicle = await prisma.vehicle.findMany();
    const inspection = await prisma.vehicle.count();
    const occurrences = await getMonthlyOccurrences(year, month);

    const chartData = occurrences.map(item => item.count);
    const total = chartData.reduce((acc, curr) => acc + curr, 0);
    const average = (total / chartData.length).toFixed(1);

    const userCount = users.length;
    //const userData = users.map(user => {return {createdAt: user.createdAt}});
    const vehicleCount = vehicle.length;
    //const vehicleData = vehicle.map(vehicle => {return {createdAt: vehicle.year}});

    const data = [
      {
        title: "Usuários",
        value: `${userCount}`,
        interval: "Últimos 30 dias",
        trend: "up",
        data: [
          500, 400, 510, 530, 520, 600, 530, 520, 510, 730, 520, 510, 530, 620,
          510, 530, 520, 410, 530, 520, 610, 530, 520, 610, 530, 420, 510, 430,
          520, 510,
        ],
      },
      {
        title: "Veiculos",
        value: `${vehicleCount}`,
        interval: "Últimos 30 dias",
        trend: "down",
        data: [
          500, 400, 510, 530, 520, 600, 530, 520, 510, 730, 520, 510, 530, 620,
          510, 530, 520, 410, 530, 520, 610, 530, 520, 610, 530, 420, 510, 430,
          520, 510,
        ],
      },
      {
        title: "Inspeções",
        value: `${inspection}`,
        interval: "Últimos 30 dias",
        trend: "neutral",
        data: [
          500, 400, 510, 530, 520, 600, 530, 520, 510, 730, 520, 510, 530, 620,
          510, 530, 520, 410, 530, 520, 610, 530, 520, 610, 530, 420, 510, 430,
          520, 510,
        ],
      },
      {
        title: "Ocorrências",
        value: `${total}`,
        interval: `Média: ${average}/dia`,
        trend: "up",
        data: chartData,
      },
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
      },
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

    await prisma.inspection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting inspection:", error);
    return NextResponse.json(
      { error: "Failed to delete inspection" },
      { status: 500 }
    );
  }
}
