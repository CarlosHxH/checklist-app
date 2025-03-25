import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { username:{ not: "admin" }},
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        isActive: true
      }
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' },{ status: 500 });
  }
}

export async function POST(request: Request) {
  const { username, password, name, role } = await request.json();
  if (!username || !password || !name) {
    return NextResponse.json({ message: 'Usuárion, Senha, e o Nome é necessário.' }, { status: 400 });
  }
  try {
    const existingUser = await prisma.user.findUnique({ where: { username } })
    if (existingUser) throw 'Usuário já existe';
    const hashedPassword = await hash(password, 12);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, name, role},
      select: { id: true, username: true, email: true, name: true, role: true, createdAt: true, isActive: true}
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest)
{
  try
  {
    const {id, ...data} = await request.json();
    if (data.password) data.password = await hash(data.password, 12);
    else delete data.password;

    const user = await prisma.user.update({
      where: { id: id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        isActive: true
      }
    });

    return NextResponse.json(user);
  } catch (error)
  {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

/*

export async function POSTs(request: NextRequest)
{
  const { email, password, name, role } = await request.json();
  if (!email || !password || !name) {
    return NextResponse.json({ message: 'Email, password, and name are required.' }, { status: 400 });
  }
  try {
    const body = await request.json();
    const existingUser = await prisma.user.findUnique({ where: { email: body.email } })
    if (existingUser) throw 'User already exists';

    const hashedPassword = await hash(body.password, 12);
    const user = await prisma.user.create({
      data: { ...body, password: hashedPassword},
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    });
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating user:', {message: error});
    return NextResponse.json({ error: 'Failed to create user', message: error },{ status: 500 });
  }
}*/