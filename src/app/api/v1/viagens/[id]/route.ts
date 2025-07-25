import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const inspections = await prisma.inspect.findUnique({
      where: { id },
      include: {
        vehicle: true
      }
    });
    return NextResponse.json(inspections)
  } catch (error) {
    return NextResponse.json(error)
  }
}


/*
async function createInspectionWithTransaction({ data, id }: { data: any, id: string }) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Crie o registro de inspeção
      const inspection = await tx.inspection.create({ data });
      // Crie o grupo de registro de inspeção
      const inspect = await tx.inspect.upsert({
        where: {
          id: id ?? 'dummy-id',
          ...(inspection.vehicleId ? {} : {}),
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
}*/