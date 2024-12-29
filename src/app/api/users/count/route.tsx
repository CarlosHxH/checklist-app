// src/app/api/articles/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const count = await prisma.user.count();
    return NextResponse.json({count}, {status:201});
  } catch (error) {
    return NextResponse.json(error, {status:500});
  }
}