
// app/api/inspections/route.ts - Exemplo com inspeções
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuditLogger } from '@/lib/audit';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const audit = getAuditLogger(prisma);
    const inspectionData = await request.json();

    const inspection = await prisma.inspection.create({
      data: {
        ...inspectionData,
        userId: session?.user?.id || null,
      },
    });

    // Registrar auditoria
    await audit.logCreate(
      session?.user?.id || 'unknown', // Trata caso de sessão nula
      'inspection',
      inspection.id,
      'inspection',
      inspection,
      `Inspeção criada para veículo ${inspection.vehicleId}`
    );

    return NextResponse.json(inspection);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
