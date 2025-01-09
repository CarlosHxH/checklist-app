// lib/jwt.ts
import jwt from "jsonwebtoken";
import { TokenPayload } from "@/types/auth";
import { headers } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "";

export const generateToken = (payload: { id: string; email: string }): string => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, { 
      expiresIn: "12h",
      algorithm: 'HS256'
    });
    return token;
  } catch (error) {
    console.error("Erro ao gerar token:", error);
    throw new Error("Falha ao gerar token de acesso");
  }
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
};

export const verifyHeader = async () => {
  try {
    const authorization = (await headers()).get("authorization");
    if (!authorization) {
      throw new Error("Authorization header is missing");
    }
    const token = authorization.substring(7, authorization.length);
    const verify = verifyToken(token);
    return verify;
  } catch (error) {
    return new Error("InvalidAuthenticationToken");
  }
};
