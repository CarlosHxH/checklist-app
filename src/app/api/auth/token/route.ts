import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { decoded, encoded } from "@/webToken";

export async function GET(request: NextRequest) {
  try {
    const authHeader = await request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    if (!token) throw new Error("Erro interno do servidor")
    const decode = await decoded(token);
    return NextResponse.json( decode );
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    // Validate input
    if (!username || !password) {
      return NextResponse.json({ error: "Username e password são obrigatórios" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    // Use async version of bcrypt.compare
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const { id, role } = user;
    const token = await encoded({ user: { id, username, role } });

    if (!token) {
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Return specific error messages for known errors
    if (error instanceof Error && error.message === "Credenciais inválidas") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}