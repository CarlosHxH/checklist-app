import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  const users = await prisma.user.findMany({
    select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
  })
  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const data = await request.json()
  const user = await prisma.user.create({ data })
  return NextResponse.json(user)
}

export async function PUT(request: NextRequest) {
  const { id, ...data } = await request.json()
  const user = await prisma.user.update({
    where: { id },
    data
  })
  return NextResponse.json(user)
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ message: 'User deleted' })
}