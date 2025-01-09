// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { generateToken } from "@/lib/auth/jwt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
          // Formata o email
          const email = credentials.email.toLowerCase().trim();
          // Buscar usuário
          const user = await prisma.user.findUnique({where: { email }});

          if (!user || !user.password) {
            return null;
          }

          // Verificar senha
          const isPasswordValid = await compare(credentials.password, user.password);

          if (!isPasswordValid) {
            return null;
          }

          // Atualizar ou criar Account
          try {
            // Gerar access token
            const access_token = await generateToken(user.id, user.email||"");
            await prisma.account.upsert({
              where: {
                provider_providerAccountId: {
                  provider: "credentials",
                  providerAccountId: user.id,
                }
              },
              create: {
                userId: user.id,
                type: "credentials",
                provider: "credentials",
                providerAccountId: user.id,
                access_token: access_token||"",
                expires_at: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
                token_type: "Bearer",
              },
              update: {
                access_token: access_token,
                expires_at: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
              },
            });
          } catch (error) {
            console.error("Erro ao atualizar account:", error);
            // Não throw error aqui - continue com a autenticação mesmo se falhar
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
      }
    })
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
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
