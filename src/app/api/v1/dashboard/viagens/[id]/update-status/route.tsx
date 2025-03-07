//// app/api/dashboard/viagens/[id]/update-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';


interface UpdateStatusRequest {
  section: 'start' | 'end';
  data: {
    nivelAgua?: string;
    nivelOleo?: string;
    avariasCabine?: string;
    bauPossuiAvarias?: string;
    funcionamentoParteEletrica?: string;
    descricaoAvariasCabine?: string | null;
    descricaoAvariasBau?: string | null;
    descricaoParteEletrica?: string | null;
    resolvidoPor: string;
    observacoes?: string | null;
  };
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const inspectionId = (await params).id;
    const body: UpdateStatusRequest = await request.json();

    if (!body || !body.section || !body.data) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Primeiro, obtenha a inspeção para verificar que ele existe e para obter os IDs relacionados
    const inspection = await prisma.inspect.findUnique({where: { id: inspectionId }});

    if (!inspection) {
      return NextResponse.json({ error: 'Inspeção não encontrada' }, { status: 404 });
    }

    // Determine qual registro a atualizar com base na seção
    const recordId = body.section === 'start' ? inspection.startId : inspection.endId;

    if (!recordId) {
      return NextResponse.json(
        { error: `Registro de ${body.section === 'start' ? 'início' : 'fim'} não encontrado` },
        { status: 404 }
      );
    }

    // Create update data
    const updateData: any = { updatedAt: new Date() };

    // Only include fields that were sent in the request
    if (body.data.nivelAgua !== undefined) updateData.nivelAgua = body.data.nivelAgua;
    if (body.data.nivelOleo !== undefined) updateData.nivelOleo = body.data.nivelOleo;
    if (body.data.avariasCabine !== undefined) updateData.avariasCabine = body.data.avariasCabine;
    if (body.data.bauPossuiAvarias !== undefined) updateData.bauPossuiAvarias = body.data.bauPossuiAvarias;
    if (body.data.funcionamentoParteEletrica !== undefined) updateData.funcionamentoParteEletrica = body.data.funcionamentoParteEletrica;

    // Atualizar campos de descrição apenas se o problema ainda estiver presente
    if (body.data.avariasCabine === 'SIM' && body.data.descricaoAvariasCabine !== undefined) {
      updateData.descricaoAvariasCabine = body.data.descricaoAvariasCabine;
    } else if (body.data.avariasCabine === 'NÃO') {
      updateData.descricaoAvariasCabine = null; // Clear description if issue is resolved
    }

    if (body.data.bauPossuiAvarias === 'SIM' && body.data.descricaoAvariasBau !== undefined) {
      updateData.descricaoAvariasBau = body.data.descricaoAvariasBau;
    } else if (body.data.bauPossuiAvarias === 'NÃO') {
      updateData.descricaoAvariasBau = null; // Clear description if issue is resolved
    }

    if (body.data.funcionamentoParteEletrica === 'PROBLEMAS' && body.data.descricaoParteEletrica !== undefined) {
      updateData.descricaoParteEletrica = body.data.descricaoParteEletrica;
    } else if (body.data.funcionamentoParteEletrica === 'OK') {
      updateData.descricaoParteEletrica = null; // Clear description if issue is resolved
    }
/*
    await prisma.inspectionCorrection.create({
      data: {
        inspectionId,
        section: body.section,
        resolvidoPor: body.data.resolvidoPor,
        observacoes: body.data.observacoes || null,
        userId: session.user.id,
        createdAt: new Date(),
      },
    });*/

    // Update the inspection record
    const updateResult = await prisma.inspection.update({
      where: { id: recordId },
      data: updateData,
    });

    return NextResponse.json({
      message: 'Status atualizado com sucesso',
      data: updateResult
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar o status da inspeção' },
      { status: 500 }
    );
  }
}