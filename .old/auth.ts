// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { generateToken } from "./auth/jwt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          // Buscar usuário
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          if (!user || !user.password) {
            return null;
          }

          // Verificar senha
          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          // Gerar token
          let access_token;
          try {
            access_token = generateToken({
              id: user.id,
              email: user.email,
            });
          } catch (error) {
            console.error("Erro ao gerar token:", error);
            // Não bloquear autenticação se falhar a geração do token
            access_token = null;
          }

          // Atualizar ou criar Account apenas se tivermos um token
          if (access_token) {
            try {
              await prisma.account.upsert({
                where: {
                  provider_providerAccountId: {
                    provider: "credentials",
                    providerAccountId: user.id,
                  },
                },
                create: {
                  userId: user.id,
                  type: "credentials",
                  provider: "credentials",
                  providerAccountId: user.id,
                  access_token: access_token,
                  expires_at: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
                  token_type: "Bearer",
                },
                update: {
                  access_token: access_token,
                  expires_at: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
                },
              });
            } catch (error) {
              return new Error("Erro ao atualizar account");
            }
          }

          // Retornar objeto do usuário (importante!)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Erro na autenticação:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
