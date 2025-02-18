import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const userId = (await params).userId;
    const session = await getServerSession()
    if (session) {
      const inspections = await prisma.inspection.findMany({
        where: { userId },
        include: { vehicle: true },
        orderBy: { dataInspecao: 'desc' },
      })
      return NextResponse.json(inspections, { status: 200 });
    } else {
      throw "Usuário não autenticado!"
    }
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}