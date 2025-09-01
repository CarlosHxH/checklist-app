// app/api/v1/maintenance-centers/[id]/route.ts

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Add this interface to help with type inference
interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Buscar centro por ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params; // Await the params promise
  const centerId = parseInt(id);
  
  if (isNaN(centerId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const center = await prisma.maintenanceCenter.findUnique({
    where: { id: centerId },
    include: { _count: { select: { orders: true } } }
  });

  if (!center) {
    return NextResponse.json({ error: 'Centro não encontrado' }, { status: 404 });
  }

  return NextResponse.json(center);
}

// PUT - Atualizar centro
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params; // Await the params promise
  const centerId = parseInt(id);
  
  if (isNaN(centerId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const { name } = await request.json();
  
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
  }

  const trimmedName = name.trim();

  // Verifica se existe e se nome já está em uso
  const [existing, duplicate] = await Promise.all([
    prisma.maintenanceCenter.findUnique({ where: { id: centerId } }),
    prisma.maintenanceCenter.findFirst({
      where: { name: trimmedName, id: { not: centerId } }
    })
  ]);

  if (!existing) {
    return NextResponse.json({ error: 'Centro não encontrado' }, { status: 404 });
  }

  if (duplicate) {
    return NextResponse.json({ error: 'Nome já está em uso' }, { status: 400 });
  }

  const updated = await prisma.maintenanceCenter.update({
    where: { id: centerId },
    data: { name: trimmedName },
    include: { _count: { select: { orders: true } } }
  });

  return NextResponse.json(updated);
}

// DELETE - Deletar centro
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params; // Await the params promise
  const centerId = parseInt(id);
  
  if (isNaN(centerId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const center = await prisma.maintenanceCenter.findUnique({
    where: { id: centerId },
    include: { _count: { select: { orders: true } } }
  });

  if (!center) {
    return NextResponse.json({ error: 'Centro não encontrado' }, { status: 404 });
  }

  if (center._count.orders > 0) {
    return NextResponse.json({ error: 'Centro possui pedidos associados' }, { status: 400 });
  }

  await prisma.maintenanceCenter.delete({ where: { id: centerId } });

  return NextResponse.json({ message: 'Centro deletado com sucesso' });
}