// src/app/api/access/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    //const ip = request.headers.get("x-real-ip")
    const ip = request.headers.get('x-forwarded-for')?.slice(7);
    const accessData = await prisma.access.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    })

    return NextResponse.json({accessData, ip})
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar dados de acesso' },
      { status: 500 }
    )
  }
}