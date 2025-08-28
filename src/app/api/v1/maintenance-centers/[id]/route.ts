// app/api/v1/maintenance-centers/[id]/route.ts

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET - Buscar centro de manutenção por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const maintenanceCenter = await prisma.maintenanceCenter.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });

    if (!maintenanceCenter) {
      return NextResponse.json(
        { error: 'Centro de manutenção não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(maintenanceCenter);
  } catch (error) {
    console.error('Erro ao buscar centro de manutenção:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar centro de manutenção
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { name } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nome do centro de manutenção é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o centro existe
    const existingCenter = await prisma.maintenanceCenter.findUnique({
      where: { id }
    });

    if (!existingCenter) {
      return NextResponse.json(
        { error: 'Centro de manutenção não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já existe outro centro com esse nome
    const duplicateCenter = await prisma.maintenanceCenter.findFirst({
      where: {
        name: name.trim(),
        id: { not: id }
      }
    });

    if (duplicateCenter) {
      return NextResponse.json(
        { error: 'Já existe um centro de manutenção com esse nome' },
        { status: 400 }
      );
    }

    const maintenanceCenter = await prisma.maintenanceCenter.update({
      where: { id },
      data: {
        name: name.trim()
      },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });

    return NextResponse.json(maintenanceCenter);
  } catch (error) {
    console.error('Erro ao atualizar centro de manutenção:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar centro de manutenção
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar se o centro existe
    const existingCenter = await prisma.maintenanceCenter.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });

    if (!existingCenter) {
      return NextResponse.json(
        { error: 'Centro de manutenção não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o centro tem pedidos associados
    if (existingCenter._count.orders > 0) {
      return NextResponse.json(
        { 
          error: `Não é possível deletar o centro de manutenção. Ele possui ${existingCenter._count.orders} pedido(s) associado(s).` 
        },
        { status: 400 }
      );
    }

    await prisma.maintenanceCenter.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Centro de manutenção deletado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao deletar centro de manutenção:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}