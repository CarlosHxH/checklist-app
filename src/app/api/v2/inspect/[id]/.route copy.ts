// app/api/inspect/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    if (!id || id.length !== 25 || !/^[a-zA-Z0-9]+$/.test(id)) {// || !/^[a-zA-Z0-9]{25}$/.test(id)) {
      return NextResponse.json({ error: 'ID inválido', details: 'Formato de ID inválido'},{ status: 400 });
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
    })

    if (!existingInspect) {
      return NextResponse.json(
        { error: 'Registro da Viagem não encontrado' },
        { status: 404 }
      )
    }
    // Executar a deleção
    await prisma.inspect.delete({where: { id }})

    // Log de sucesso (opcional - apenas se o modelo Log existir)
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
      })
    } catch (logError) {
      // Log error não deve afetar a operação principal
      console.warn('Erro ao criar log:', logError)
    }

    return NextResponse.json(
      {
        message: 'Viagem deletada com sucesso',
        deletedId: id
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Erro ao deletar Viagem:', error)
    // Log do erro (opcional)
    try {
      const resolvedParams = await params
      await prisma.log.create({
        data: {
          level: 'ERROR',
          message: `Erro ao deletar Viagem: ${resolvedParams.id}`,
          context: JSON.stringify({
            error: error instanceof Error ? error.message : 'Erro desconhecido',
            stack: error instanceof Error ? error.stack : undefined,
            inspectId: resolvedParams.id,
            operation: 'DELETE_INSPECT'
          })
        }
      })
    } catch (logError) {
      console.warn('Erro ao registrar log de erro:', logError)
    }

    // Tratamento de erros específicos do Prisma
    if (error && typeof error === 'object' && 'code' in error) {
      switch (error.code) {
        case 'P2025':
          return NextResponse.json(
            { error: 'Registro não encontrado para deleção' },
            { status: 404 }
          )
        case 'P2003':
          return NextResponse.json(
            { 
              error: 'Não é possível deletar devido a dependências',
              details: 'Existem registros relacionados que impedem a deleção'
            },
            { status: 409 }
          )
        case 'P2002':
          return NextResponse.json(
            { 
              error: 'Violação de constraint',
              details: 'Operação não permitida devido a restrições do banco'
            },
            { status: 409 }
          )
        default:
          return NextResponse.json(
            { 
              error: 'Erro no banco de dados',
              details: `Código: ${error.code}`
            },
            { status: 500 }
          )
      }
    }

    // Erro genérico
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro inesperado durante a operação'
      },
      { status: 500 }
    )
  }
}

// Método OPTIONS para CORS (se necessário)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
