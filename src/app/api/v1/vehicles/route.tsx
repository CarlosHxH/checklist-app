import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authWithRoleMiddleware } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  // Verificar autenticação e permissão
  const authResponse = await authWithRoleMiddleware(request, ["DRIVER","USER","ADMIN"]);
  if (authResponse.status !== 200) return authResponse;

  try {
    const vehicle = await prisma.vehicle.findMany();
    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Error fetching:', error);
    return NextResponse.json({ error: 'Failed to fetch' },{ status: 500 });
  }
}