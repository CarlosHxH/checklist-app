import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = (await params).id;
    const inspection = await prisma.inspection.findUnique({
      where: { id },
      include: {
        vehicle: {
          select: {
            plate: true,
            model: true,
          },
        },
        photos: {
          select: {
            id: true,
            type: true,
            photo: true,
            description: true,
          },
        },
      },
    });

    if (!inspection) {
      return NextResponse.json(
        { error: "Inspeção não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(inspection);
  } catch (error) {
    console.error("Error fetching inspection:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}