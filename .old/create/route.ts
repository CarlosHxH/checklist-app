import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const articles = await prisma.inspection.findMany();
  return NextResponse.json(articles);
}

export async function POST(request: Request) {
  const { data } = await request.json();
  
  if(data){
    return NextResponse.json(data, { status: 201 });
  }

  return NextResponse.json({}, { status: 201 });
}