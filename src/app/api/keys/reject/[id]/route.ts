// app/api/keys/reject/[id]/route.ts
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

      // Update current transfer status to REJECTED
      const updated = await tx.vehicleKey.update({
        where: { id },
        data: {
          status: 'REJECTED',
          updatedAt: new Date()
        },
        include: {
          user: true,
          vehicle: true
        }
      })

      // If there was a previous transfer, reactivate it
      if (currentTransfer.parentId) {
        await tx.vehicleKey.update({
          where: { id: currentTransfer.parentId },
          data: {
            status: 'CONFIRMED'
          }
        })
      }

      return updated
    })

    return NextResponse.json(updatedTransfer)
  } catch (error) {
    console.error('Error rejecting transfer:', error)
    return NextResponse.json(
      { error: 'Error rejecting transfer' },
      { status: 500 }
    )
  }
}