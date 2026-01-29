// GEN ALIXIR - Root Layout Simplifié
// Fichier: src/app/layout.tsx
// ❗ REMPLACER complètement l'ancien fichier

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GEN ALIXIR - Incubateur Numérique Africain (Test Mode)',
  description: 'Incubateur numérique africain décentralisé rattaché à l\'écosystème ECODREUM - Version Test Phase 2',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
