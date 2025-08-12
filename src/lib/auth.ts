// src/lib/auth.ts
import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
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
          if (!credentials?.username || !credentials?.password) return null;
          // Buscar usuário
          const user = await prisma.user.findUnique({
            where: { username: credentials.username }
          });

          console.log("Resultado da busca:",user ? `${hoje} Usuário encontrado: ${user.email}` : `${hoje} Usuário: ${credentials?.username}, não encontrado`);

          if (!user || !user.password || !user?.isActive) throw "Credenciais inválidas!";

          // Verificar senha
          const isPasswordValid = await compare(credentials.password, user.password);
          
          if (!isPasswordValid) throw "Credenciais inválidas!";
          // Retornar objeto do usuário (importante!)
          return {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role
          };
        } catch (error) {
          console.error(`${hoje} Erro na autenticação:`, error);
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
    signIn: '/auth/signin'
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};