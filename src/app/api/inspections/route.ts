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

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Validar campos obrigatórios
    if (!body.userId || !body.vehicleId || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, vehicleId, or status' },
        { status: 400 }
      );
    }

    const result = await createInspectionWithTransaction(body);
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating inspection:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create inspection', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
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