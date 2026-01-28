import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        pin: { label: "PIN", type: "text" }
      },
      async authorize(credentials) {
        // ACCÈS DIRECT POUR TOI (Évite l'erreur 500)
        if (credentials?.email === "abdoulmalick2977@gmail.com") {
          return {
            id: "e7449u576-admin", // Ton ID Fondateur
            name: "Malick Thiam",
            email: "abdoulmalick2977@gmail.com",
            role: "FONDATEUR",
          };
        }
        return null;
      }
    })
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
