import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server";

async function createInspectionWithTransaction({ data, id }: { data: any, id: string }) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Crie o registro de inspeção
      const inspection = await tx.inspection.create({data});
      // Crie o grupo de registro de inspeção
      const inspect = await tx.inspect.upsert({
        where: {
          id: id ?? 'dummy-id',
          ...(inspection.vehicleId?{}:{}),
        },
        create: {
          userId: data.userId,
          ...(data.status === "INICIO"
            ? { startId: inspection.id }
            : { endId: inspection.id }),
        },
        update: {
          userId: data.userId,
          ...(data.status === "INICIO"
            ? { startId: inspection.id }
            : { endId: inspection.id }),
        },
      })
      return { inspection, inspect }
    })
    return result
  } catch (error) {
    console.error('Transaction failed:', error)
    throw error
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const inspections = await prisma.inspect.findMany({
      where: { userId: id },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        start: true,
        end: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(inspections)
  } catch (error) {
    return NextResponse.json(error)
  }
}
