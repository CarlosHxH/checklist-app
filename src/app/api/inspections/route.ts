import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { InspectionSchema } from '@/lib/InspectionSchema';


export async function GET(request: Request) {
  try {
    const inspections = await prisma.inspection.findMany({
      include: { vehicle: true },
      orderBy: { dataInspecao: "desc" }
    });
    return NextResponse.json(inspections, { status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  try {
    const dataForm = { ...body};
    delete dataForm.id;
    delete dataForm.dataInspecao;

    const data = InspectionSchema.parse(dataForm);
    
    const inspection = await prisma.inspection.create({data});

    return NextResponse.json(inspection);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create inspection', body, details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 403 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const updateData = { ...body };
    delete updateData.id;
    const data = InspectionSchema.parse(updateData);
    
    const inspection = await prisma.inspection.update({where: { id: body.id },data});

    return NextResponse.json(inspection);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update inspection', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest)
{
  try
  {
    const { id } = await request.json();
    await prisma.inspection.delete({where: { id }});
    return NextResponse.json({ success: true });
  } catch (error)
  {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}