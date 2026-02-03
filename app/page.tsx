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
  loading: () => <div className="h-full w-full flex items-center justify-center text-emerald-500 animate-pulse text-[10px]">CHARGEMENT GPS...</div>
});

export default function Home() {
  const [stats, setStats] = useState({ users: 0, totalEco: 1240000 });
  const currentPartnerLevel = 'Elite'; 

  useEffect(() => {
    async function fetchRealData() {
      const { count } = await supabase.from('users_data').select('*', { count: 'exact', head: true });
      setStats(prev => ({ ...prev, users: count || 0 }));
    }
    fetchRealData();
  }, []);

  return (
    /* MODIFICATION ICI : bg-zinc-50 (clair) et dark:bg-[#010101] (sombre) 
       On change aussi text-white en text-zinc-900 (clair) et dark:text-white
    */
    <div className="flex h-screen bg-zinc-50 dark:bg-[#010101] text-zinc-900 dark:text-white font-sans overflow-hidden transition-colors duration-500">
      
      <Sidebar />
      
      <main className="flex-1 p-3 flex flex-col gap-3 min-w-0 overflow-y-auto lg:overflow-hidden">
        
        {/* HEADER : Adapté pour les deux modes */}
        <div className="gold-border-glow bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 p-4 flex flex-col md:flex-row justify-between items-center gap-3 shrink-0 rounded-2xl shadow-sm dark:shadow-none">
          <div className="text-center md:text-left">
            <h2 className="text-xl font-black italic tracking-tighter uppercase text-zinc-800 dark:text-white">ECODREUM BI</h2>
            <p className="text-[9px] text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-[0.2em]">Strategic Intelligence Node</p>
          </div>
          <div className="px-4 py-1 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-full text-[10px] font-bold text-amber-600 dark:text-gold italic">
            {currentPartnerLevel.toUpperCase()} ACCESS
          </div>
        </div>

        {/* STATS : Les StatCards vont maintenant recevoir le style du parent */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
          <StatCard title="Total eCo" value={stats.totalEco.toLocaleString()} change="+12%" />
          <StatCard title="eCoLixir" value="3,500" change="+25%" />
          <StatCard title="Clients" value={stats.users.toString()} change="LIVE" />
          <StatCard title="Revenue" value="45.2M" change="+8%" />
        </div>

        {/* SECTION GRAPHIQUES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:flex-1 min-h-[300px] lg:min-h-0">
          <div className="lg:col-span-2 bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 p-4 flex flex-col min-h-[250px] lg:min-h-0 rounded-3xl shadow-sm dark:shadow-none">
            <h3 className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-2 uppercase italic">Financial Flow (30 Days)</h3>
            <div className="flex-1 min-h-0">
              <MainChart />
            </div>
          </div>

          <div className="bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 p-4 flex flex-col relative overflow-hidden min-h-[250px] lg:min-h-0 rounded-3xl shadow-sm dark:shadow-none">
             {currentPartnerLevel !== 'Elite' && <LockedOverlay levelRequired="ELITE" />}
             <h3 className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-2 uppercase italic">Loyalty Analysis</h3>
             <div className={`flex-1 min-h-0 ${currentPartnerLevel !== 'Elite' ? 'blur-md' : ''}`}>
                <LoyaltyChart />
             </div>
          </div>
        </div>

        {/* SECTION CARTE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:h-1/3 shrink-0 min-h-[300px] lg:min-h-0 pb-4 lg:pb-0">
           <div className="lg:col-span-2 bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 p-3 relative overflow-hidden rounded-3xl shadow-sm dark:shadow-none">
              {currentPartnerLevel !== 'Elite' && <LockedOverlay levelRequired="ELITE" />}
              <h3 className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-2 uppercase italic flex items-center">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                Géo-Intelligence Live
              </h3>
              <div className={`h-full w-full rounded-xl overflow-hidden relative ${currentPartnerLevel !== 'Elite' ? 'blur-xl' : ''}`}>
                 <AnalyticsMap />
              </div>
           </div>

           <div className="bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 p-4 flex-col justify-center items-center text-center space-y-3 hidden lg:flex rounded-3xl shadow-sm dark:shadow-none">
              <h3 className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase italic">System Status</h3>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full border border-emerald-500/30 flex items-center justify-center">
                 <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
              </div>
              <p className="text-[9px] text-zinc-400 dark:text-gray-400 uppercase tracking-widest">Global Sync<br/>Active</p>
           </div>
        </div>

      </main>
    </div>
  );
}
