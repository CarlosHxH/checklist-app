import { NextAuthOptions, User, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import jwt from "jsonwebtoken";

interface CustomUser extends User {
  id: string;
  role?: string;
  email: string;
  name: string;
  image?: string;
}

class AuthError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}

const JWT_SECRET =
  process.env.JWT_SECRET || process.env.AUTH_SECRET || "sua-chave-secreta";

// Função para gerar access token
const generateAccessToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email, type: "access_token" }, JWT_SECRET, {
    expiresIn: "12h",
  });
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
      email: string;
      name: string;
      image?: string;
    };
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
          placeholder: "seu@email.com",
        },
        password: {
          label: "Senha",
          type: "password",
          placeholder: "Sua senha",
        },
      },
      async authorize(credentials): Promise<CustomUser | null> {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new AuthError(
              "Credenciais incompletas",
              "MISSING_CREDENTIALS"
            );
          }

          const email = credentials.email.toLowerCase().trim();
          console.log("Buscando usuário no banco de dados");

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
            },
          });

          console.log(
            "Resultado da busca:",
            user ? "Usuário encontrado" : "Usuário não encontrado"
          );

          if (!user) {
            throw new AuthError("Credenciais inválidas", "INVALID_CREDENTIALS");
          }

          if (!user.isActive) {
            throw new AuthError("Conta desativada", "ACCOUNT_DISABLED");
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password || ""
          );
          console.log(isValid ? "Senha valida" : "Senha invalida");

          if (!isValid) {
            throw new AuthError("Credenciais inválidas", "INVALID_CREDENTIALS");
          }

          // Gerar access token
          const access_token = generateAccessToken(user.id, user.email);
          console.log("Token de acesso:", access_token);

          await prisma.account
            .create({
              data: {
                userId: user.id,
                type: "credentials",
                provider: "credentials",
                providerAccountId: user.id,
                access_token: access_token,
                expires_at: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 horas em segundos
                token_type: "Bearer",
              },
            })
            .then(console.log)
            .catch((e) => console.log("Erro account"));

          // Atualizar ou criar Account para armazenar tokens
          try {
            const account = await prisma.account.upsert({
              where: {
                provider_providerAccountId: {
                  // Usar composite unique key
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
                expires_at: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 horas
                token_type: "Bearer",
              },
              update: {
                access_token: access_token,
                expires_at: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
              },
            });

            console.log("Account atualizada ou criada com sucesso:", account);
          } catch (error) {
            console.error("Erro ao atualizar ou criar Account:"); // Melhor logging do erro
            throw error; // Re-throw do erro para tratamento adequado
          }

          // Atualizar dados do usuário
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                lastLogin: new Date(),
                loginCount: { increment: 1 },
              },
            });
            console.log("Atualizado lastLogin");
          } catch (error) {
            console.log("Erro ao atualizar lastLogin");
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image ?? "",
            role: user.role,
          };
        } catch (error) {
          console.error("Erro na autenticação:", {
            error,
            message: (error as Error).message,
            stack: (error as Error).stack,
          });
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
  },/*
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.role = (user as CustomUser).role ?? "";
        token.access_token = (user as any).access_token;
      }
      if (account) {
        token.access_token = account.access_token;
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

        // Buscar o token mais recente do usuário
        const account = await prisma.account.findFirst({
          where: {
            userId: token.id as string,
            provider: "credentials",
          },
          orderBy: { expires_at: "desc" },
        });

        if (account?.access_token) {
          (session.user as any).access_token = account.access_token;
        }
      }
      return session;
    },
  },*/
  events: {
    async signIn({ user }) {
      console.log(`Usuário logado: ${user.email}`);
    },
    async signOut({ token }) {
      // Remover tokens ao fazer logout
      await prisma.account.deleteMany({
        where: {
          userId: token.id as string,
          provider: "credentials",
        },
      });
      console.log(`Usuário deslogado: ${token.email}`);
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV !== "production",
};
