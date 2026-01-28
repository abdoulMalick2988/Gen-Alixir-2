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
        // --- PORTE DE SECOURS (Backdoor Fondateur) ---
        // Si c'est TOI, on te laisse entrer directement sans demander à la base de données.
        // Cela contourne le bug de connexion Prisma.
        if (credentials?.email === "abdoulmalick2977@gmail.com") {
          return {
            // REMPLACE LE TEXTE CI-DESSOUS PAR TON VRAI UUID (celui copié sur Supabase)
            id: "abdoulmalick2977@gmail.com", 
            name: "Malick Thiam",
            email: "abdoulmalick2977@gmail.com",
            role: "FONDATEUR",
          };
        }
        // ----------------------------------------------

        // Pour les autres utilisateurs (connexion normale)
        if (!credentials?.email || !credentials?.pin) return null;
        
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (user && user.pin === credentials.pin) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        } catch (error) {
          console.error("Erreur Login Prisma:", error);
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Pour voir les erreurs dans Vercel
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
