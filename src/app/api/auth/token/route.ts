import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateToken, verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("next-auth.session-token");
    const cookieStore = await cookies();
    //const token = cookieStore.get('token');
    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao gerar token" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    const token = generateToken(user.id, user.email);

    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}


/*
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const userEmail = request.headers.get('x-user-email');

  return NextResponse.json({
    message: 'Rota protegida acessada com sucesso',
    user: { id: userId, email: userEmail }
  });
}
*/
