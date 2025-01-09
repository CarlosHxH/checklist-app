import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateToken, verifyHeader } from "@/lib/auth/jwt";
import { cookies, headers } from "next/headers";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const authorization = await verifyHeader();
    if (!authorization) {
      throw new Error("Authorization header is missing");
    }
    return NextResponse.json({ authorization });
  } catch (error : any) {
    return NextResponse.json({ error: error?.message }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return NextResponse.json({ error: "Credenciais inválidas" },{ status: 403 });
    }
    const { id } = user;
    const token = generateToken({id, email});

    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 403 }
    );
  }
}