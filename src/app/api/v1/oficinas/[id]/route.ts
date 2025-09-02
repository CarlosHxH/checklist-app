import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET - Buscar oficina por ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const newId = parseInt(id);

    if (isNaN(newId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const oficina = await prisma.oficina.findUnique({
      where: { id: newId },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });

    if (!oficina) {
      return NextResponse.json(
        { error: 'Oficina não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(oficina);
  } catch (error) {
    console.error('Erro ao buscar oficina:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar oficina
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const newId = parseInt(id);
    const body = await request.json();
    const { name } = body;

    if (isNaN(newId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nome da oficina é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a oficina existe
    const existingOficina = await prisma.oficina.findUnique({
      where: { id: newId }
    });

    if (!existingOficina) {
      return NextResponse.json(
        { error: 'Oficina não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se já existe outra oficina com esse nome
    const duplicateOficina = await prisma.oficina.findFirst({
      where: {
        name: name.trim(),
        id: { not: newId }
      }
    });

    if (duplicateOficina) {
      return NextResponse.json(
        { error: 'Já existe uma oficina com esse nome' },
        { status: 400 }
      );
    }

    const oficina = await prisma.oficina.update({
      where: { id: newId },
      data: {
        name: name.trim()
      },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });

    return NextResponse.json(oficina);
  } catch (error) {
    console.error('Erro ao atualizar oficina:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar oficina
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const newId = parseInt(id);

    if (isNaN(newId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar se a oficina existe
    const existingOficina = await prisma.oficina.findUnique({
      where: { id: newId },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });

    if (!existingOficina) {
      return NextResponse.json(
        { error: 'Oficina não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se a oficina tem pedidos associados
    if (existingOficina._count.orders > 0) {
      return NextResponse.json(
        { 
          error: `Não é possível deletar a oficina. Ela possui ${existingOficina._count.orders} pedido(s) associado(s).` 
        },
        { status: 400 }
      );
    }

    await prisma.oficina.delete({
      where: { id: newId }
    });

    return NextResponse.json(
      { message: 'Oficina deletada com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao deletar oficina:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}