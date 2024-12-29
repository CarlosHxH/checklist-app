import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function POST(request: Request, { params }:{params: Promise<{ id: string }>}) {
  try {
    const id = (await params).id;
    const data = await request.json()
    const session = await getServerSession();
    if(session && data) {
      const inspections = await prisma.inspection.update({ where: { id },data })
      return NextResponse.json(inspections, { status: 201 });
    } else {
      throw "Usuário não autenticado!"
    }
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}