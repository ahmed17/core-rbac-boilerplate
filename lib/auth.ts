import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { verifyTurnstileToken } from "@/lib/turnstile";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        turnstileToken: { label: "Turnstile Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password wajib diisi.");
        }

        // --- TURNSTILE ANTI-BOT VERIFICATION ---
        if (credentials.turnstileToken) {
          const isTurnstileValid = await verifyTurnstileToken(credentials.turnstileToken);
          if (!isTurnstileValid) {
            throw new Error("Verifikasi keamanan gagal. Silakan muat ulang halaman.");
          }
        }

        let user;
        try {
          user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              role: {
                include: {
                  permissions: true,
                },
              },
            },
          });
        } catch (error) {
          console.error("Database error during login:", error);
          throw new Error("Sistem sedang mengalami gangguan. Gagal terhubung ke server.");
        }

        if (!user || !user.password) {
          throw new Error("Email atau password salah.");
        }

        // --- ACCOUNT LOCKOUT CHECK ---
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
          throw new Error(`Akun terkunci karena terlalu banyak percobaan. Coba lagi dalam ${remainingMinutes} menit.`);
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          // --- BRUTE FORCE PENALTY ---
          const newFailedAttempts = user.failedAttempts + 1;
          const isLocked = newFailedAttempts >= 5;
          const lockedUntil = isLocked ? new Date(Date.now() + 15 * 60 * 1000) : null;
          
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedAttempts: newFailedAttempts,
              lockedUntil,
            },
          });

          if (isLocked) {
            throw new Error("Akun Anda telah dikunci selama 15 menit karena terlalu banyak percobaan salah.");
          }

          throw new Error("Email atau password salah.");
        }

        // --- RESET PENALTY ON SUCCESS ---
        if (user.failedAttempts > 0 || user.lockedUntil) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedAttempts: 0,
              lockedUntil: null,
            },
          });
        }

        const permissions = user.role?.permissions.map((p) => p.action) || [];

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          roleName: user.role?.name || null,
          permissions,
        } as any;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60, // 12 jam (1 shift kerja)
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roleName = (user as any).roleName;
        token.permissions = (user as any).permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).roleName = token.roleName as string | null;
        (session.user as any).permissions = token.permissions as string[];
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
