// app/api/users/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Ajuste o caminho conforme necessário
import bcrypt from 'bcryptjs';

export async function GET() {
  // Obter todos os usuários
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  // Criar um novo usuário
  const { email, password, name, role } = await request.json();

  if (!email || !password || !name) {
    return NextResponse.json({ message: 'Email, password, and name are required.' }, { status: 400 });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email,password: hashedPassword, name,role},});
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  // Editar um usuário
  const { id, email, name, role } = await request.json();

  if (!id || !email || !name) {
    return NextResponse.json({ message: 'ID, email, and name are required.' }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { email, name, role },
    });
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  // Deletar um usuário
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ message: 'ID is required.' }, { status: 400 });
  }

  try {
    await prisma.user.delete({
      where: { id },
    });
    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}