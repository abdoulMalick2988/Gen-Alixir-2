import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import WakandaGuard from "../components/WakandaGuard"; // Sécurité Wakanda préservée

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
    <html lang="fr" className="dark">
      <body className={`${inter.className} bg-[#010101]`}>
        {/* On garde uniquement la sécurité Wakanda */}
        <WakandaGuard>
          {children}
        </WakandaGuard>
      </body>
    </html>
  );
}
