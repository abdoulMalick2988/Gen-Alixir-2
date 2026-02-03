import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import WakandaGuard from "../components/WakandaGuard"; // Sécurité conservée
import { ThemeProvider } from "../components/ThemeProvider"; // Notre nouveau moteur

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
      <body className={`${inter.className} bg-zinc-50 dark:bg-[#010101] transition-colors duration-300`}>
        {/* Le moteur de thème englobe l'application */}
        <ThemeProvider>
          {/* La sécurité protège le contenu */}
          <WakandaGuard>
            {children}
          </WakandaGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}
