// app/api/v1/keys/reject/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;

    // Start transaction
    const updatedTransfer = await prisma.$transaction(async (tx) => {
      // Get current transfer
      const currentTransfer = await tx.vehicleKey.findUnique({
        where: { id },
        include: { vehicle: true }
      })
      if (!currentTransfer) throw new Error('Transferência não encontrada ');
      if (currentTransfer.status !== 'PENDING') throw new Error('Transferência não está pendente');
      const dell = await tx.vehicleKey.delete({where: { id }})
      return dell
    })

    return NextResponse.json(updatedTransfer)
  } catch (error) {
    console.error('Erro rejeitando a transferência:', error)
    return NextResponse.json({ error: 'Erro rejeitando a transferência' },{ status: 500 })
  }
}