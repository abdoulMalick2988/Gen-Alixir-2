import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import WakandaGuard from "../components/WakandaGuard"; // Ligne importante : importe la sécurité

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ECODREUM - Intelligence RH",
  description: "Système de gestion partenaire agréé",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {/* On enveloppe tout le site avec le WakandaGuard */}
        <WakandaGuard>
          {children}
        </WakandaGuard>
      </body>
    </html>
  );
}
