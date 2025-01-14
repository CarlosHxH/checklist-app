import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { InspectionSchema } from "@/lib/InspectionSchema";
import { getOccurrences } from "@/lib/occurrences";

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho",
  "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

const format = async(title:string,label:"up"|"down"|"neutral",month:number,occurrences:any[])=>{
  const chartData = occurrences.map(item => item.count);
  const total = chartData.reduce((acc, curr) => acc + curr, 0);
  const average = (total / chartData.length).toFixed(1);
  return {
    title,
    value: `${total}`,
    interval: months[month-1],
    trend: {label,value: average},
    data: chartData,
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    //const be = new Date();
    //const af = new Date(new Date().setDate(be.getDate() - 30));
    const inspections = await getOccurrences(prisma.inspection, year, month);
    const users = await getOccurrences(prisma.user, year, month,{username:{ not: "admin" }});
    const vehicles = await getOccurrences(prisma.vehicle, year, month);

    // Buscando todos os usuários
    const inspection = await format("Inspeções", "up", month, inspections);
    const user = await format("Usuários", "down", month, users);
    const vehicle = await format("Veiculos", "neutral", month, vehicles);

    return NextResponse.json([user,inspection,vehicle]);
  } catch (error) {
    return NextResponse.json({ error },{status:403});
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
