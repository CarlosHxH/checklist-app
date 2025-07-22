// app/api/inspect/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    if (!id || id.length !== 25 || !/^[a-zA-Z0-9]+$/.test(id)) {
      return NextResponse.json({ error: "ID inválido", details: "Formato de ID inválido" },{ status: 400 });
    }
    // Verificar se o registro existe antes de tentar deletar
    const existingInspect = await prisma.inspect.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true
          }
        },
        start: {
          select: {
            id: true,
            status: true
          }
        },
        end: {
          select: {
            id: true,
            status: true
          }
        },
        vehicle: {
          select: {
            id: true,
            plate: true
          }
        }
      }
    });

    if (!existingInspect) {
      return NextResponse.json(
        { error: 'Registro da Viagem não encontrado' },
        { status: 404 }
      );
    }

    // Executar a deleção
    await prisma.inspect.delete({ where: { id } });

    // Log de sucesso
    try {
      await prisma.log.create({
        data: {
          level: 'INFO',
          message: `Viagem deletado com sucesso: ${id}`,
          context: JSON.stringify({
            deletedInspectId: id,
            userId: existingInspect.userId,
            userName: existingInspect.user?.name,
            vehiclePlate: existingInspect.vehicle?.plate,
            operation: 'DELETE_INSPECT'
          }),
          userId: existingInspect.userId
        }
      });
    } catch (logError) {
      console.warn('Erro ao criar log:', logError);
    }

    return NextResponse.json(
      {
        message: 'Viagem deletada com sucesso',
        deletedId: id
      },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error? error.message: "Erro inesperado durante a operação"},
      { status: 500 }
    );
  }
}