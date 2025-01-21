import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma';


interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const vehicleId = searchParams.get('vehicleId')

    const whereClause = {
      ...(userId && { userId }),
      ...(vehicleId && { vehicleId }),
    }
    const u = { select: { id: true, name: true }}
    const v = { select: { id: true, model: true, plate: true}}

    const vehicleKeys = await prisma.vehicleKey.findMany({
      where: whereClause,
      include: {
        user: u,
        vehicle: v,
        parent: {
          include: {
            user: u,
            vehicle: v
          },
        },
        children: {
          include: {
            user: u,
            vehicle: v
          },
        },
      },
    })

    return NextResponse.json(vehicleKeys)
  } catch (error) {
    return NextResponse.json({error},{status: 403})
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    //const validatedData = vehicleKeySchema.parse(body)

    const vehicleKey = await prisma.vehicleKey.create({
      data: body,
      include: {
        user: true,
        vehicle: true,
        parent: true,
        children: true,
      },
    })

    return NextResponse.json({ data: vehicleKey }, { status: 201 })
  } catch (error) {
    return NextResponse.json({error},{status: 403})
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const body = await req.json()
    //const validatedData = vehicleKeySchema.parse(body)

    const vehicleKey = await prisma.vehicleKey.update({
      where: { id: params.id },
      data: body,
      include: {
        user: true,
        vehicle: true,
        parent: true,
        children: true,
      },
    })

    return NextResponse.json({ data: vehicleKey })
  } catch (error) {
    return NextResponse.json({error},{status: 403})
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    // Check for children before deleting
    const existing = await prisma.vehicleKey.findUnique({
      where: { id: params.id },
      include: { children: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Vehicle key not found' },
        { status: 404 }
      )
    }

    if (existing.children.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete key with children' },
        { status: 400 }
      )
    }

    await prisma.vehicleKey.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ status: 204 })
  } catch (error) {
    return NextResponse.json({error},{status: 403})
  }
}