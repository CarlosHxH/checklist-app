import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const inspections = await prisma.inspection.findMany({include:{vehicle:true}});
    const vehicle = await prisma.vehicle.findMany();
    const user = await prisma.user.findMany();

    return NextResponse.json({inspections,vehicle,user});
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