import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        pin: { label: "PIN", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.pin) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (user && user.pin === credentials.pin) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            pco: user.pco_points,
            aura: user.aura_level
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.pco = (user as any).pco;
        token.aura = (user as any).aura;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).pco = token.pco;
        (session.user as any).aura = token.aura;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/' }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
