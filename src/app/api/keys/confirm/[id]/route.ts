// app/api/keys/confirm/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = (await params).id;

    // Start transaction
    const updatedTransfer = await prisma.$transaction(async (tx) => {
      // Get current transfer
      const currentTransfer = await tx.vehicleKey.findUnique({
        where: { id },
        include: {
          vehicle: true,
        }
      })

      if (!currentTransfer) {
        throw new Error('Transfer not found')
      }

      if (currentTransfer.status !== 'PENDING') {
        throw new Error('Transfer is not pending')
      }

      // Update current transfer
      const updated = await tx.vehicleKey.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
          updatedAt: new Date()
        },
        include: {
          user: true,
          vehicle: true
        }
      })

      return updated
    })

    return NextResponse.json(updatedTransfer)
  } catch (error) {
    console.error('Error confirming transfer:', error)
    return NextResponse.json(
      { error: 'Error confirming transfer' },
      { status: 500 }
    )
  }
}