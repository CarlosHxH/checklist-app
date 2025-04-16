import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authWithRoleMiddleware } from '@/lib/auth-middleware';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verificar autenticação e permissão
  const authResponse = await authWithRoleMiddleware(request, ["USER","DRIVER", "ADMIN"]);
  if (authResponse.status !== 200) return authResponse;

  try {
    const id = (await params).id;
    const keys = await prisma.vehicleKey.findMany({
      where: {
        userId: id,
        status: "PENDING"
      },
      include: {
        vehicle: {
          select: {
            id: true,
            plate: true,
            model: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(keys)
  } catch (error) {
    console.error('Error confirming transfer:', error)
    return NextResponse.json(
      { error: 'Error confirming transfer' },
      { status: 500 }
    )
  }
}