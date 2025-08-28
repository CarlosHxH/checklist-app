// app/api/v1/maintenance-centers/route.ts

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET - Listar todos os centros de manutenção
export async function GET() {
  try {
    const maintenanceCenters = await prisma.maintenanceCenter.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });

    return NextResponse.json(maintenanceCenters);
  } catch (error) {
    console.error('Erro ao buscar centros de manutenção:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo centro de manutenção
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nome do centro de manutenção é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se já existe um centro com esse nome
    const existingCenter = await prisma.maintenanceCenter.findUnique({
      where: { name: name.trim() }
    });

    if (existingCenter) {
      return NextResponse.json(
        { error: 'Já existe um centro de manutenção com esse nome' },
        { status: 400 }
      );
    }

    const maintenanceCenter = await prisma.maintenanceCenter.create({
      data: {
        name: name.trim()
      },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });

    return NextResponse.json(maintenanceCenter, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar centro de manutenção:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}