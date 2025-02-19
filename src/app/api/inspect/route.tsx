import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const inspections = await prisma.inspect.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
        start: true,
        end: true,
        vehicle: true
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