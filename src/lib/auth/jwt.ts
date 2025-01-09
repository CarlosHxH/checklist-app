// lib/jwt.ts
import jwt from "jsonwebtoken";
import { TokenPayload } from "@/types/auth";
import { headers } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "";

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
