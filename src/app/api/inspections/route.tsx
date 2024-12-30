import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(request: Request,{ params }: { params: Promise<{ userId: string }> }) {
  try {
    const userId = (await params).userId;
    if (userId) {
      const inspections = await prisma.inspection.findMany({
        where: { userId },
        include: { vehicle: true },
        orderBy: { dataInspecao: "desc" },
      });
      return NextResponse.json(inspections, { status: 200 });
    } else {
      throw "Usuário não autenticado!";
    }
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}


export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid payload');
    }
    const inspections = await prisma.inspection.create({ data });
    return NextResponse.json(inspections, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}


export async function PUT(request: NextRequest)
{
  try
  {
    const body = await request.json();
    const updateData = { ...body };
    delete updateData.id;
    const inspection = await prisma.inspection.update({
      where: { id: body.id },
      data: updateData,
    });
    return NextResponse.json(inspection);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' },{ status: 500 }
    );
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