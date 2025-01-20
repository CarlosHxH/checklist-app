// lib/jwt.ts
import jwt from "jsonwebtoken";
import { headers } from "next/headers";

export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
  iat: number;
  exp: number;
}
const JWT_SECRET = process.env.JWT_SECRET || "";

export const generateToken = (payload: { id: string; email?: string, username?: string, role?: string }): string => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '1H',
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
    return false;
  }
};

export const isTokenValid = (token: TokenPayload): boolean => {
  try {
    const currentTime = Math.floor(Date.now() / 1000);
    // Verifica se o token tem uma data de expiração
    if (!token.exp) return false;
    // Adiciona uma margem de segurança de 5 segundos
    return currentTime <= (token.exp - 5);
  } catch (error) {
    console.error("Erro ao validar token:", error);
    return false;
  }
};