// app/api/inspections/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inspection = await prisma.inspection.findUnique({
      where: { id: params.id },
    });

    if (!inspection) {
      return NextResponse.json(
        { error: 'Inspection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(inspection);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching inspection' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const inspection = await prisma.inspection.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(inspection);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error updating inspection' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.inspection.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error deleting inspection' },
      { status: 500 }
    );
  }
}