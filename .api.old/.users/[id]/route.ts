import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    await prisma.user.delete({where: { id }});
    return NextResponse.json({ success: true },{ status: 200 });
  } catch (error) {
    return NextResponse.json("Erro, Usuário vinculado a um registro!", { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}