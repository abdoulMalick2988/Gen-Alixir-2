import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

const authOptions = {
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
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.pco = user.pco;
        token.aura = user.aura;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role;
        session.user.pco = token.pco;
        session.user.aura = token.aura;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/' }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
