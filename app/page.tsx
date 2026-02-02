"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "../lib/supabase";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import MainChart from "../components/MainChart";
import LoyaltyChart from "../components/LoyaltyChart";
import LockedOverlay from "../components/LockedOverlay";

const AnalyticsMap = dynamic(() => import("../components/AnalyticsMap"), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center text-emerald-500 animate-pulse text-xs">GPS...</div>
});

export default function Home() {
  const [stats, setStats] = useState({ users: 0, totalEco: 1240000 });
  const currentPartnerLevel = 'Elite'; // MODIFICATION ICI : 'Elite' ou 'Business'

  useEffect(() => {
    async function fetchRealData() {
      const { count } = await supabase.from('users_data').select('*', { count: 'exact', head: true });
      setStats(prev => ({ ...prev, users: count || 0 }));
    }
    fetchRealData();
  }, []);

  return (
    <div className="flex h-screen bg-transparent overflow-hidden text-white">
      <Sidebar />
      
      <main className="flex-1 p-3 flex flex-col gap-3 min-w-0">
        
        {/* HEADER MINI */}
        <div className="gold-border-glow glass-card p-3 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-black text-white italic tracking-tighter">ECODREUM BI</h2>
            <p className="text-[9px] text-emerald-header uppercase font-bold tracking-[0.2em]">Data Engine v1.2</p>
          </div>
          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-gold italic">
            {currentPartnerLevel.toUpperCase()} ACCESS
          </div>
        </div>

        {/* GRILLE STATS (Ligne du haut) */}
        <div className="grid grid-cols-4 gap-3 shrink-0">
          <StatCard title="Total eCo Generated" value={stats.totalEco.toLocaleString()} change="+12%" />
          <StatCard title="eCoLixir Accmum." value="3,500" change="+25%" />
          <StatCard title="Active Clients" value={stats.users.toString()} change="LIVE" />
          <StatCard title="Revenue (XAF)" value="45.2M" change="+8%" />
        </div>

        {/* SECTION GRAPHIQUES (Milieu) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1 min-h-0">
          <div className="lg:col-span-2 glass-card p-4 flex flex-col">
            <h3 className="text-[10px] font-bold text-emerald-header mb-2 uppercase italic">Financial Flow (30 Days)</h3>
            <div className="flex-1 min-h-0">
              <MainChart />
            </div>
          </div>

          <div className="glass-card p-4 flex flex-col relative overflow-hidden">
             {currentPartnerLevel !== 'Elite' && <LockedOverlay levelRequired="ELITE" />}
             <h3 className="text-[10px] font-bold text-emerald-header mb-2 uppercase italic">Client Loyalty Levels</h3>
             <div className={`flex-1 min-h-0 ${currentPartnerLevel !== 'Elite' ? 'blur-md' : ''}`}>
                <LoyaltyChart />
             </div>
          </div>
        </div>

        {/* BAS DE PAGE (Carte & Dernières Transactions) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-40 shrink-0">
           <div className="lg:col-span-2 glass-card p-3 relative overflow-hidden">
              {currentPartnerLevel !== 'Elite' && <LockedOverlay levelRequired="ELITE" />}
              <h3 className="text-[9px] font-bold text-emerald-header mb-2 uppercase italic">Géo-Intelligence Burundi</h3>
              <div className={`h-full w-full rounded-xl overflow-hidden ${currentPartnerLevel !== 'Elite' ? 'blur-xl' : ''}`}>
                 <AnalyticsMap />
              </div>
           </div>

           <div className="glass-card p-3">
              <h3 className="text-[9px] font-bold text-emerald-header mb-2 uppercase italic">Status Node</h3>
              <div className="flex items-center space-x-2 text-[10px] text-gray-400">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>Bujumbura HUB - Online</span>
              </div>
           </div>
        </div>

      </main>
    </div>
  );
}
