import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
        borrachariaId: { label: "Borracharia", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const borrachariaId = credentials.borrachariaId || null;

        // Busca o usuário pelo email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { borracharia: { select: { id: true, name: true, active: true } } },
        });

        if (!user || !user.active) return null;

        // Validação backend: usuário deve pertencer à borracharia selecionada
        if (borrachariaId) {
          // Usuário deve pertencer à borracharia informada
          if (user.borrachariaId !== borrachariaId) return null;
          // Borracharia deve estar ativa
          if (!user.borracharia?.active) return null;
          // SYSTEM_ADMIN não pode logar com borracharia
          if (user.role === Role.SYSTEM_ADMIN) return null;
        } else {
          // Sem borracharia: apenas SYSTEM_ADMIN pode logar
          if (user.role !== Role.SYSTEM_ADMIN) return null;
        }

        const passwordOk = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!passwordOk) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          borrachariaId: user.borrachariaId ?? null,
          borrachariaName: user.borracharia?.name ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: Role }).role;
        token.borrachariaId = (user as unknown as { borrachariaId: string | null }).borrachariaId;
        token.borrachariaName = (user as unknown as { borrachariaName: string | null }).borrachariaName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.borrachariaId = token.borrachariaId as string | null;
        session.user.borrachariaName = token.borrachariaName as string | null;
      }
      return session;
    },
  },
};

export const getSession = () => getServerSession(authOptions);

export const requireAuth = async () => {
  const session = await getSession();
  if (!session) return null;
  return session;
};

export const requireAdmin = async () => {
  const session = await getSession();
  if (!session || session.user.role !== Role.ADMIN) return null;
  return session;
};

export const requireSystemAdmin = async () => {
  const session = await getSession();
  if (!session || session.user.role !== Role.SYSTEM_ADMIN) return null;
  return session;
};
