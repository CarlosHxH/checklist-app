// app/api/v1/oficinas/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET - Listar todas as oficinas
export async function GET() {
  try {
    const oficinas = await prisma.oficina.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });

    return NextResponse.json(oficinas);
  } catch (error) {
    console.error('Erro ao buscar oficinas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar nova oficina
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nome da oficina é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se já existe uma oficina com esse nome
    const existingOficina = await prisma.oficina.findUnique({
      where: { name: name.trim() }
    });

    if (existingOficina) {
      return NextResponse.json(
        { error: 'Já existe uma oficina com esse nome' },
        { status: 400 }
      );
    }

    const oficina = await prisma.oficina.create({
      data: {
        name: name.trim()
      },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });

    return NextResponse.json(oficina, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar oficina:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}