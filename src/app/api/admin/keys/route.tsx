import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const vehicleKeySchema = z.object({
  userId: z.string(),
  vehicleId: z.string(),
  parentId: z.string().optional().nullable()
})

interface RouteParams {
  params: {
    id: string
  }
}

const commonSelect = {
  id: true,
  select:{parentId:true},
  createdAt: true,
  user: {
    select: {
      id: true,
      name: true
    }
  },
  vehicle: {
    select: {
      id: true,
      model: true,
      plate: true
    }
  }
}

const u = { select: { id:true, name: true }}
const v = { select: { id:true, model: true, plate: true}}

async function getData() {
  const [chaves, usuarios, veiculos] = await Promise.all([
    prisma.vehicleKey.findMany({
      include: {
        user: u,
        vehicle: v,
        parent: {
          include: {
            user: u,
            vehicle: v,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.user.findMany(u),
    prisma.vehicle.findMany(v),
  ]);

  
  return {chaves, usuarios, veiculos };
}

export async function GET() {
  try {
    const data = await getData()
    return NextResponse.json(data)
  } catch (error) {
    /*console.error('GET Error:', error)*/
    return NextResponse.json({ error: 'Failed to fetch data' },{ status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    //const validatedData = vehicleKeySchema.parse(body)
    const validatedData = body
    const existingParent = validatedData.parentId && await prisma.vehicleKey.findUnique({
      where: { id: validatedData.parentId },
      include: { vehicle: true }
    })

    if (validatedData.parentId && !existingParent) {
      return NextResponse.json({ error: 'Parent key not found' },{ status: 404 })
    }

    if (existingParent && existingParent.vehicle.id !== validatedData.vehicleId) {
      return NextResponse.json({ error: 'Parent key must be for the same vehicle' },{ status: 400 })
    }

    const vehicleKey = await prisma.vehicleKey.create({
      data: validatedData,
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
            vehicle: v,
          },
        },
      },
      /*
      include: {
        ...commonSelect,
        parent: {
          include: commonSelect
        },
        children: {
          include: commonSelect
        }
      }*/
    })

    return NextResponse.json(vehicleKey)
  } catch (error) {
    console.error('POST Error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create vehicle key' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const body = await req.json()
    const validatedData = vehicleKeySchema.parse(body)

    const existing = await prisma.vehicleKey.findUnique({
      where: { id: params.id },
      include: { children: true }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Vehicle key not found' },
        { status: 404 }
      )
    }

    if (existing.children.length > 0) {
      return NextResponse.json(
        { error: 'Cannot modify parent key' },
        { status: 400 }
      )
    }

    const vehicleKey = await prisma.vehicleKey.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        ...commonSelect,
        parent: {
          include: commonSelect
        },
        children: {
          include: commonSelect
        }
      }
    })

    return NextResponse.json(vehicleKey)
  } catch (error) {
    console.error('PUT Error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update vehicle key' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await req.json()
    const existing = await prisma.vehicleKey.findUnique({
      where: { id },
      include: { children: true }
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
      where: { id }
    })

    return NextResponse.json({message:"success"}, { status: 201 })
  } catch (error) {
    console.error('DELETE Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete vehicle key' },
      { status: 500 }
    )
  }
}

/*
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
*/