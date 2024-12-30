import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter');

    const inspections = await prisma.inspection.findMany({
      where: filter
        ? {
            OR: [
              { vehicleId: { contains: filter } },
              { crlvEmDia: { contains: filter } },
              { nivelAgua: { contains: filter } },
              { nivelOleo: { contains: filter } },
            ],
          }
        : undefined,
      orderBy: {
        dataInspecao: 'desc',
      },
    });

    return NextResponse.json(inspections);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching inspections' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const inspection = await prisma.inspection.create({
      data,
    });

    return NextResponse.json(inspection, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creating inspection' },
      { status: 500 }
    );
  }
}