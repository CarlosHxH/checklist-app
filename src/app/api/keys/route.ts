import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const keyLogs = await prisma.vehicleKey.findMany({
      include: {
        vehicle: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(keyLogs);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching key logs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const keyLog = await prisma.vehicleKey.create({
      data: {
        vehicleId: body.vehicleId,
        userId: body.userId,
      },
      include: {
        vehicle: true,
        user: true
      },
    });
    return NextResponse.json(keyLog);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating key log' }, { status: 500 });
  }
}