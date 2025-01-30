import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createInspectionWithTransaction } from './inspection.service';

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
  try {
    const body = await request.json();
    const { id, user, vehicle, ...data } = body;

    // Validate required fields
    if (!data.userId || !data.vehicleId || !data.status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Crie ou atualize a inspeção
    const result = await createInspectionWithTransaction({ data, id: id ?? undefined });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating inspection:', error);
    
    if (error instanceof Error && error.message === 'No open inspection found for this vehicle') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to create inspection', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 403 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const {id, user, vehicle, ...data} = await request.json();
    const inspection = await prisma.inspection.update({where: { id }, data});
    return NextResponse.json(inspection);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update inspection', details: error instanceof Error ? error.message : 'Unknown error' },{ status: 403 });
  } finally {
    await prisma.$disconnect();
  }
}



export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    await prisma.inspection.delete({where: { id }});
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 403 }
    );
  } finally {
    await prisma.$disconnect();
  }
}