"use client";
import { useSession } from "next-auth/react";
import MemberCard from '@/components/shared/MemberCard';
import Navbar from '@/components/shared/Navbar';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-500"></div>
    </div>
  );

  if (!session) return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold mb-4 italic">ACCÈS RESTREINT</h1>
      <p className="text-gray-400 mb-6">L'alchimie demande une identification.</p>
      <a href="/" className="bg-yellow-500 text-black px-8 py-3 rounded-full font-black uppercase tracking-tighter shadow-lg shadow-yellow-500/20">Se Connecter</a>
    </div>
  );

  const user = session.user as any;

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      <Navbar />
      <div className="pt-24 px-6 max-w-lg mx-auto space-y-10">
        
        {/* CARTE DE MEMBRE DYNAMIQUE */}
        <section>
          <MemberCard user={{
            name: user.name,
            role: user.role,
            pco_points: user.pco,
            aura_level: user.aura
          }} />
        </section>

        {/* SECTION PROJETS (Simulation ECODREUM) */}
        <section className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-yellow-500/60">Incubation Active</h3>
            <span className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></span>
          </div>
          <h4 className="text-xl font-bold mb-2 uppercase">Gen Alixir V2</h4>
          <p className="text-xs text-gray-500 leading-relaxed mb-6">
            Refonte complète du hub numérique. Phase : Synchronisation Base de données.
          </p>
          <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400">
            <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10 italic">Équipe : 1 Membre</span>
            <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10 italic">Status : 15%</span>
          </div>
        </section>

      </div>
    </main>
  );
}
