import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest,{ params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const data = await prisma.order.findMany({
            where: { userId: id },
            orderBy: {createdAt: 'desc'}})
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({error, message: 'Erro interno no servidor'},{status:500});
    }
}