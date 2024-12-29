import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid payload');
    }

    const inspections = await prisma.inspection.create({ data });
    return NextResponse.json(inspections, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const userId = (await params).userId;
    const session = await getServerSession();
    if (session && userId) {
      const inspections = await prisma.inspection.findMany({
        where: { userId },
        include: { vehicle: true },
        orderBy: { dataInspecao: "desc" },
      });
      return NextResponse.json(inspections, { status: 200 });
    } else {
      throw "Usuário não autenticado!";
    }
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}