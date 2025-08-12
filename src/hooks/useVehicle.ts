// lib/actions/vehicle-actions.ts
'use server';

import { prisma } from '@/lib/prisma';

export async function getVehicleById(id: string) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id }
    });
    return { data: vehicle, error: null };
  } catch (error) {
    console.error('Erro ao buscar veículo:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

export async function getAllVehicles() {
  try {
    const vehicles = await prisma.vehicle.findMany();
    return { data: vehicles, error: null };
  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}