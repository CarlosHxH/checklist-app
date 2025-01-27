import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const keyLog = await prisma.vehicleKey.update({
      where: {
        id: params.id,
      },
      data: {
        createdAt: new Date(),
      },
      include: {
        vehicle: true,
        user: true,
      },
    });
    return NextResponse.json(keyLog);
  } catch (error) {
    return NextResponse.json({ error: 'Error returning key' }, { status: 500 });
  }
}