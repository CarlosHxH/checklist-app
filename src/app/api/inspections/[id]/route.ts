import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = (await params).id;
    const inspections = await prisma.inspection.findUnique({
      where: { userId, id: '' },
      include: { vehicle: true },
    });
    return NextResponse.json(inspections, { status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
/*
export async function PUT(request: Request) {
  try {
    const {
      id,
      userId,
      vehicleId,
      dataInspecao,
      crlvEmDia,
      certificadoTacografoEmDia,
      nivelAgua,
      nivelOleo,
      eixo,
      dianteira,
      descricaoDianteira,
      tracao,
      descricaoTracao,
      truck,
      descricaoTruck,
      quartoEixo,
      descricaoQuartoEixo,
      avariasCabine,
      descricaoAvariasCabine,
      bauPossuiAvarias,
      descricaoAvariasBau,
      funcionamentoParteEletrica,
      descricaoParteEletrica,
      fotoVeiculo
    } = await request.json();

    const data = {
      userId,
      vehicleId,
      dataInspecao,
      crlvEmDia,
      certificadoTacografoEmDia,
      nivelAgua,
      nivelOleo,
      eixo,
      dianteira,
      descricaoDianteira,
      tracao,
      descricaoTracao,
      truck,
      descricaoTruck,
      quartoEixo,
      descricaoQuartoEixo,
      avariasCabine,
      descricaoAvariasCabine,
      bauPossuiAvarias,
      descricaoAvariasBau,
      funcionamentoParteEletrica,
      descricaoParteEletrica,
      fotoVeiculo
    }
    const updatedInspection = await prisma.inspection.update({
      where: { id: String(id) },
      data: data,
    });
    return NextResponse.json(updatedInspection, { status: 200 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}*/