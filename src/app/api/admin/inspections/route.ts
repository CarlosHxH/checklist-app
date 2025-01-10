import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const inspections = await prisma.inspection.findMany({ include: { vehicle: true, user: true } });
    const vehicle = await prisma.vehicle.findMany();
    const user = await prisma.user.findMany( {where: { username:{ not: "admin" }}})

    return NextResponse.json({ inspections, vehicle, user });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching inspections' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = { ...body };
    delete data.id;
    const inspection = await prisma.inspection.create({ data });
    return NextResponse.json(inspection, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creating inspection' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest)
{
  try
  {
    const body = await request.json();
    const updateData = { ...body };
    delete updateData.id;
    delete updateData.dataInspecao
    
    const inspection = await prisma.inspection.update({
      where: { id: body.id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });
    return NextResponse.json(inspection);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update inspection' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body.id;
    await prisma.inspection.delete({where: { id }});
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error deleting inspection' },
      { status: 500 }
    );
  }
}