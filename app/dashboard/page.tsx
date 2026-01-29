"use client";
import { useSession } from "next-auth/react";
import Navbar from '@/components/shared/Navbar';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div className="min-h-screen bg-white" />;

  if (!session) return (
    <main className="min-h-screen bg-white bg-gradient-emerald flex flex-col items-center justify-center p-6 text-center">
      <Navbar />
      <h1 className="text-3xl font-black mb-4 uppercase text-black italic">Accès Restreint</h1>
      <p className="text-gray-500 mb-8 font-medium italic">L'identification est requise pour accéder à l'alchimie.</p>
      <a href="/" className="bg-[#10b981] text-white px-10 py-4 rounded-full font-black uppercase tracking-tighter shadow-xl shadow-emerald-500/20 hover:scale-105 transition-transform">
        Se Connecter
      </a>
    </main>
  );

  return (
    <main className="min-h-screen bg-white text-black">
      <Navbar />
      {/* Le reste de ton dashboard ici... */}
    </main>
  );
}
