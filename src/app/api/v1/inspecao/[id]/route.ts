import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json(
        { error: "Inspeção não encontrada" },
        { status: 404 }
      );
    }

    const inspection = await prisma.inspection.findUnique({
      where: { id },
      include: {
        vehicle: true,
        photos: true,
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
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}