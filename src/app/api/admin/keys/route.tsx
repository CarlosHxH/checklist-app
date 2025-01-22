import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const u = { select: { name: true } }
    const v = { select: { model: true, plate: true } }
    const [vehicleKeys, users, vehicles] = await Promise.all([
      prisma.vehicleKey.findMany({
        include: {
          user: u,
          vehicle: v,
        },
      }),
      prisma.user.findMany(),
      prisma.vehicle.findMany(),
    ]);
    return NextResponse.json({ vehicleKeys, users, vehicles })
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching vehicle keys' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { vehicleId } = body;
    const find = await prisma.vehicleKey.findFirst({
      where: {
        vehicleId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    const vehicleKey = await prisma.vehicleKey.create({
      data: {
        userId: body.userId,
        vehicleId: body.vehicleId,
        parentId: find?.id || null,
      },
    })
    return NextResponse.json(vehicleKey)
  } catch (error) {
    return NextResponse.json({ error: 'Error creating vehicle key' }, { status: 500 })
  }
}