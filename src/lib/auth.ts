// src/lib/auth.ts
import NextAuth, { JWT, NextAuthConfig, User} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { generateToken } from "./auth/jwt";
import { hoje } from "./ultils";
import * as jose from 'jose';
interface CustomUser extends User {
  id: string;
  role: string;
  username: string;
  email: string;
  name: string;
  image: string | null;
}
/*
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
*/

// Generate a secure key (in production, use environment variables)
export const SECRET_KEY = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET
);
// JOSE encryption configuration
const ENCRYPTION_ALG = 'A256GCM'; // AES-GCM with 256-bit key
const KEY_ALG = 'dir';           // Direct encryption with shared key
/**
 * Custom JWT Encoding function using JOSE
 * @param token - The token to encrypt
 */
export async function encodeJWT({ token }: { token: JWT }): Promise<string> {
  try {
    // Convert token to a string for encryption
    const tokenString = JSON.stringify(token);
    
    // Create a JWE (JSON Web Encryption)
    const jwe = await new jose.CompactEncrypt(
      new TextEncoder().encode(tokenString)
    )
      .setProtectedHeader({ 
        alg: KEY_ALG, 
        enc: ENCRYPTION_ALG 
      })
      .encrypt(SECRET_KEY);
      
    return jwe;
  } catch (error) {
    console.error("Error encoding JWT:", error);
    throw new Error("Failed to encode JWT");
  }
}

/**
 * Custom JWT Decoding function using JOSE
 * @param token - The encrypted token to decrypt
 */
export async function decodeJWT(token: string): Promise<JWT> {
  try {
    // Decrypt the JWE
    const { plaintext } = await jose.compactDecrypt(token, SECRET_KEY);
    
    // Convert decrypted data back to an object
    const decodedToken = JSON.parse(new TextDecoder().decode(plaintext));
    return decodedToken;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    throw new Error("Failed to decode JWT");
  }
}
// Example of using custom payloads in the token
export interface CustomJWT extends JWT {
  user?: {
    id: string;
    name?: string;
    email?: string;
    role?: string;
  };
  customClaims?: {
    permissions?: string[];
    metadata?: Record<string, any>;
  };
}


export const authOptions: NextAuthConfig = {
  //adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) throw "Campos não preenchidos!";
          const { username, password } = credentials as { username:string, password:string };
          // Buscar usuário
          const user = await prisma.user.findUnique({where: { username }});

          if (!user || !user.password || !user?.isActive) throw "Credenciais inválidas!";
          // Verificar senha
          if (!(await compare(password, user.password))) throw "Credenciais inválidas!";

          await prisma.log.create({
            data:{
              level: "INFO",
              message: JSON.stringify({type: "AuthLogin"}),
              context: `${hoje} - SIGNIN: ${user?.username}`,
              userId: user.id,
          }});

          // Atualizar ou criar Account
          try {
            // Gerar access token
            const expires_at = Math.floor(Date.now() / 1000) + 12 * 60 * 60;
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
            console.log(`${hoje} Sucesso ao atualizar account: `,user.username);
          } catch (error) {
            console.log("Erro ao atualizar account: ",user.username);
            // continue com a autenticação mesmo se falhar
            await prisma.log.create({
              data:{
                level: "WARN",
                message: JSON.stringify({error}),
                context: `${hoje} Erro ao atualizar account: ${user?.username}`,
                userId: user.id,
            }});
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
          await prisma.log.create({
            data:{
              level: "ERROR",
              message: JSON.stringify({error}),
              context: `${hoje} Erro na autenticação: ${credentials?.username}`,
          }});
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
    async signOut({ token }:any) {
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
  logger: {
    error(code, ...message) {
    },
    warn(code, ...message) {
    },
    debug(code, ...message) {
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  //debug: process.env.NODE_ENV === "development",
};

export const { auth, handlers, signIn, signOut } = NextAuth(authOptions);