// app/api/v2/users/route.ts - Exemplo em API Route
// app/api/users/route.ts - Exemplo em API Route
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuditLogger } from '@/lib/audit';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const audit = getAuditLogger(prisma);
    const userData = await request.json();

    // Criar usuário
    const newUser = await prisma.user.create({
      data: userData,
    });

    // Registrar auditoria
    await audit.logCreate(
      session.user.id,
      'user',
      newUser.id,
      'user',
      newUser,
      'Novo usuário criado via API'
    );

    return NextResponse.json(newUser);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const audit = getAuditLogger(prisma);
    const { id, ...updateData } = await request.json();

    // Buscar dados antigos
    const oldUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!oldUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Registrar auditoria para cada campo alterado
    for (const [field, newValue] of Object.entries(updateData)) {
      const oldValue = oldUser[field as keyof typeof oldUser];
      if (oldValue !== newValue) {
        await audit.logUpdate(
          session.user.id,
          'user',
          id,
          'user',
          oldValue,
          newValue,
          field,
          `Campo ${field} alterado`
        );
      }
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
