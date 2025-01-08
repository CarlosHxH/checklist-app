// lib/jwt.ts
import jwt from "jsonwebtoken";
import { TokenPayload } from "@/types/auth";

const JWT_SECRET = process.env.JWT_SECRET || "sua-chave-secreta";

export const generateToken = (userId: string, email: string): string => {
  const expiresIn = "12h";
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
};