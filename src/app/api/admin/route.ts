import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
      // Buscando todos os usuários
      const users = await prisma.user.findMany();
      const vehicle = await prisma.vehicle.findMany();
      const inspection = await prisma.vehicle.count();
      
      const userCount = users.length;
      //const userData = users.map(user => {return {createdAt: user.createdAt}});
      const vehicleCount = vehicle.length;
      //const vehicleData = vehicle.map(vehicle => {return {createdAt: vehicle.year}});
      
      const data = [
        {
          title: 'Usuários',
          value: `${userCount}`,
          interval: 'Últimos 30 dias',
          trend: 'up',
          data: [500, 400, 510, 530, 520, 600, 530, 520, 510, 730, 520, 510, 530, 620, 510, 530, 520, 410, 530,
            520, 610, 530, 520, 610, 530, 420, 510, 430, 520, 510,],
        },
        {
          title: 'Veiculos',
          value: `${vehicleCount}`,
          interval: 'Últimos 30 dias',
          trend: 'down',
          data: [500, 400, 510, 530, 520, 600, 530, 520, 510, 730, 520, 510, 530, 620, 510, 530, 520, 410, 530,
            520, 610, 530, 520, 610, 530, 420, 510, 430, 520, 510,],
        },
        {
          title: 'Inspeções',
          value: `${inspection}`,
          interval: 'Últimos 30 dias',
          trend: 'neutral',
          data: [
            500, 400, 510, 530, 520, 600, 530, 520, 510, 730, 520, 510, 530, 620, 510, 530, 520, 410, 530,
            520, 610, 530, 520, 610, 530, 420, 510, 430, 520, 510,
          ],
        }
      ];
      return NextResponse.json(data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      return NextResponse.json({error});
    } finally {
      await prisma.$disconnect();
    }
}