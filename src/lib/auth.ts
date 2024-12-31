import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

// Define tipos personalizados para melhor type safety
interface CustomUser extends User {
  id: string;
  role?: string;
  email: string;
  name: string;
  image?: string;
}

// Extensão do tipo Session
declare module "next-auth" {
  interface Session {
    user: CustomUser;
  }
}

// Extensão do tipo JWT
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

// Erros customizados para autenticação
class AuthError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "AuthError";
  }
}

export const authOptions: NextAuthOptions = {
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
    updateAge: 24 * 60 * 60, // 24 horas
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { 
          label: "Email",
          type: "email",
          placeholder: "seu@email.com"
        },
        password: { 
          label: "Senha",
          type: "password",
          placeholder: "Sua senha"
        },
      },
      async authorize(credentials): Promise<CustomUser | null> {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new AuthError("Credenciais incompletas", "MISSING_CREDENTIALS");
          }

          // Normaliza o email
          const email = credentials.email.toLowerCase().trim();

          // Busca o usuário
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              image: true,
              isActive: true,
              lastLogin: true,
            }
          });

          if (!user) {
            throw new AuthError("Credenciais inválidas", "INVALID_CREDENTIALS");
          }

          if (!user.isActive) {
            throw new AuthError("Conta desativada", "ACCOUNT_DISABLED");
          }

          // Verifica a senha
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password || ""
          );

          if (!isValid) {
            throw new AuthError("Credenciais inválidas", "INVALID_CREDENTIALS");
          }

          // Atualiza último login
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              lastLogin: new Date(),
              loginCount: { increment: 1 }
            }
          });

          // Retorna os dados do usuário sem informações sensíveis
          return {
            id: user.id,
            name: user?.name,
            email: user.email,
            image: user.image ?? "",
            role: user.role,
          };
        } catch (error) {
          // Log do erro para monitoramento
          console.error("Erro na autenticação:", error);

          if (error instanceof AuthError) {
            throw new Error(error.message);
          }

          if (error instanceof PrismaClientKnownRequestError) {
            throw new Error("Erro no servidor. Tente novamente mais tarde.");
          }

          throw new Error("Erro inesperado na autenticação");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }:any) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    //error: "/auth/error",
    //signOut: "/auth/signout",
    //verifyRequest: "/auth/verify-request",
  },
  events: {
    async signIn({ user }) {
      console.log(`Usuário logado: ${user.email}`);
    },
    async signOut({ token }) {
      console.log(`Usuário deslogado: ${token.email}`);
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== "production"
};