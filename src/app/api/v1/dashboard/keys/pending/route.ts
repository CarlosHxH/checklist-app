import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authWithRoleMiddleware } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  // Verificar autenticação e permissão
  const authResponse = await authWithRoleMiddleware(request, ["ADMIN"]);
  if (authResponse.status !== 200) return authResponse;

  try {
    const pendingTransfers = await prisma.vehicleKey.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          }
        },
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

    return NextResponse.json(pendingTransfers)
  } catch (error) {
    console.error('Error fetching pending transfers:', error)
    return NextResponse.json(
      { error: 'Error fetching pending transfers' },
      { status: 500 }
    )
  }
}