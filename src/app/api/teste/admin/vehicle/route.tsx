import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {

    const { id } = await request.json();
    if(!id){
        return NextResponse.json({ error: 'Erro ao buscar ocorrências' },{ status: 403 });
    }
    try {
        const inspection = await prisma.inspection.findMany({
            where: { vehicleId: id },
            include: {
                vehicle: true,
                user: true
            }
        })
        return NextResponse.json(inspection);
    } catch (error) {
        return NextResponse.json(
            { error: 'Erro ao buscar ocorrências' },
            { status: 500 }
        );
    }
}