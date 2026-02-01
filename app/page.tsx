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
  loading: () => <div className="h-full w-full flex items-center justify-center text-emerald-500 animate-pulse">GPS INITIALIZATION...</div>
});

export default function Home() {
  const [stats, setStats] = useState({ users: 0, totalEco: 0, revenue: 0 });
  const currentPartnerLevel = 'Elite' as string; 

  useEffect(() => {
    async function fetchRealData() {
      // 1. Compter les clients
      const { count } = await supabase.from('users_data').select('*', { count: 'exact', head: true });
      
      // 2. Calculer le total eCo (Somme de la colonne total_eco_spent)
      const { data: transacs } = await supabase.from('transactions').select('amount_eco');
      const total = transacs?.reduce((acc, curr) => acc + Number(curr.amount_eco), 0) || 0;

      setStats({ 
        users: count || 0, 
        totalEco: total,
        revenue: total * 0.15 // Simulation : 15% de commission
      });
    }
    fetchRealData();
  }, []);

  return (
    <div className="flex h-screen bg-black overflow-hidden font-sans text-white">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* HEADER */}
        <div className="gold-border-glow glass-card p-6 md:p-8 mb-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 blur-[100px] -z-10"></div>
          <div>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 tracking-tight">ECODREUM BI</h2>
            <p className="text-emerald-400 font-medium uppercase tracking-widest text-[10px] italic">Live Supabase Feed Active</p>
          </div>
          <div className="mt-4 md:mt-0 px-6 py-2 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-end">
            <span className="text-gray-400 text-[10px] uppercase font-bold">Status</span>
            <span className="text-gold font-bold">{currentPartnerLevel.toUpperCase()}</span>
          </div>
        </div>

        {/* KPIs GRID - ICI LES DONNÉES SONT MAINTENANT RÉELLES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatCard title="Total eCo" value={stats.totalEco.toLocaleString()} change="LIVE" />
          <StatCard title="eCoLixir" value="Calcul..." change="+25%" />
          <StatCard title="Clients" value={stats.users.toString()} change="LIVE" />
          <StatCard title="Revenue (Est.)" value={`${stats.revenue.toLocaleString()} Fbu`} change="+8%" />
        </div>

        {/* ANALYTICS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 glass-card p-6 min-h-[350px]">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3 shadow-[0_0_8px_#2ecc71]"></span>
              Flux Financier (Bujumbura)
            </h3>
            <MainChart />
          </div>

          <div className="glass-card p-6 relative overflow-hidden">
            {currentPartnerLevel !== 'Elite' && <LockedOverlay levelRequired="ELITE" />}
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <span className="w-2 h-2 bg-gold rounded-full mr-3 shadow-[0_0_8px_#f1c40f]"></span>
              Fidélité par Palier
            </h3>
            <div className={currentPartnerLevel !== 'Elite' ? 'blur-md opacity-40' : ''}>
                <LoyaltyChart />
            </div>
          </div>
        </div>

        {/* MAP SECTION */}
        <div className="glass-card p-4 md:p-6 min-h-[500px] relative overflow-hidden mb-8">
           {currentPartnerLevel !== 'Elite' && <LockedOverlay levelRequired="ELITE" />}
           <h3 className="text-lg font-bold text-emerald-400 mb-6 flex items-center tracking-wider">
              <span className="w-3 h-3 bg-emerald-500/20 border border-emerald-500 rounded-full mr-3 animate-pulse"></span>
              Géo-Intelligence : Heatmap Live
           </h3>
           <div className={`h-[400px] w-full rounded-2xl overflow-hidden relative border border-white/5 ${currentPartnerLevel !== 'Elite' ? 'blur-xl' : ''}`}>
              <AnalyticsMap />
           </div>
        </div>
      </main>
    </div>
  );
}
