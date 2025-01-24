// src/lib/auth.ts
import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { generateToken } from "./auth/jwt";
import { hoje } from "./ultils";

interface CustomUser extends User {
  id: string;
  role: string;
  username: string;
  email: string;
  name: string;
  image: string | null;
}

declare module "next-auth" {
  interface Session {
    user: {
      [x: string]: unknown;
      id: string;
      role?: string;
      username: string;
      email: string;
      name: string;
      image?: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            return null;
          }
          // Buscar usuário
          const user = await prisma.user.findUnique({
            where: { username: credentials.username }
          });

          console.log(
            "Resultado da busca:",
            user ? "Usuário encontrado: "+user.email : "Usuário não encontrado"
          );

          
          if (!user || !user.password || user.isActive) {
            throw "Credenciais inválidas";
          }
          // Verificar senha
          const isPasswordValid = await compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            return null;
          }

          // Atualizar ou criar Account
          try {
            // Gerar access token
            const expires_at = Math.floor(Date.now() / 1000) + .01 * 60 * 60;
            const access_token = generateToken({id: user.id, username:user.username});
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
                access_token: access_token,
                expires_at,
                token_type: "Bearer",
              },
              update: {
                access_token: access_token,
                expires_at,
              },
            });
            console.log("Sucesso ao atualizar account:",user.username);
          } catch (error) {
            console.log("Erro ao atualizar account: ",user.username);
            // continue com a autenticação mesmo se falhar
          }
          
          // Retornar objeto do usuário (importante!)
          return {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role
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
        token.username = (user as CustomUser).username;
        token.role = (user as CustomUser).role ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  events: {
    async signIn({ user }) {
      console.log(`${hoje} Usuário logado: ${(user as CustomUser).username}`);
    },
    async signOut({ token }) {
      // Remover tokens ao fazer logout
      await prisma.account.deleteMany({
        where: {
          userId: token.id as string,
          provider: "credentials",
        },
      });
      console.log(`${hoje} Usuário deslogado: ${token.username}`);
    },
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