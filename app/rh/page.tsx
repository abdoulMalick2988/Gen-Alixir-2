"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../components/WakandaGuard";

/** * ANALYTIQUE ENGINE - CONFIGURATION HAUTE DENSITÉ */
import { 
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, 
  Tooltip, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';

/** * ICONSET - NEON UI */
import { 
  Users, Wallet, Activity, Layout, RefreshCcw, TrendingUp, 
  Database, Fingerprint, ArrowUpRight, Cpu, BarChart3, ShieldCheck
} from 'lucide-react';

// --- DESIGN SYSTEM : GLASS & NEON ---
const THEME = { 
  emerald: "#10b981", 
  blue: "#3b82f6", 
  gold: "#fbbf24", 
  glass: "rgba(255, 255, 255, 0.04)",
  border: "rgba(255, 255, 255, 0.1)"
};
const COLORS = [THEME.emerald, THEME.blue, "#8b5cf6", THEME.gold, "#f43f5e", "#ec4899"];

export default function RHAnalyticsRobust() {
  const user = useAuth();
  const router = useRouter();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. RÉCUPÉRATION DES DONNÉES
  const loadAnalytics = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase.from('staff').select('*').order('full_name');
      if (user.role !== 'ADMIN') query = query.eq('partner_id', user.id);
      const { data, error } = await query;
      if (error) throw error;
      setEmployees(data || []);
    } catch (e) { 
      console.error("Critical Sync Error:", e); 
    } finally { 
      setTimeout(() => setLoading(false), 600); 
    }
  }, [user]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  // 2. MOTEUR DE CALCULS STATISTIQUES
  const stats = useMemo(() => {
    // Calcul Masse Salariale
    const totalPayroll = employees.reduce((acc, curr) => acc + ((parseFloat(curr.pco) || 0) * 190), 0);
    
    // Distribution par Département
    const depts = employees.reduce((acc: any, curr) => {
      const d = curr.department || 'GÉNÉRAL';
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});

    // Rentabilité par Pôle (Calcul basé sur l'Aura moyenne vs PCO)
    const profitabilityData = Object.keys(depts).map(deptName => {
      const members = employees.filter(e => e.department === deptName);
      const avgAura = members.reduce((sum, e) => sum + (e.aura || 0), 0) / members.length;
      const totalPco = members.reduce((sum, e) => sum + (parseFloat(e.pco) || 0), 0);
      return {
        name: deptName,
        performance: Math.round(avgAura),
        charge: totalPco * 10
      };
    });

    const pieData = Object.keys(depts).map(name => ({ name, value: depts[name] }));
    
    const chartData = employees.slice(0, 8).map(e => ({ 
      name: e.full_name?.split(' ')[0], 
      aura: e.aura, 
      pco: (parseFloat(e.pco)||0) * 10 
    }));

    return { totalPayroll, pieData, chartData, profitabilityData, deptCount: Object.keys(depts).length };
  }, [employees]);

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
      <Cpu className="text-emerald-500 animate-spin" size={40} />
      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.6em]">Calcul des vecteurs...</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020202] text-white overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto custom-scroll relative">
        
        {/* --- HEADER STRATÉGIQUE --- */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
              RH <span className="text-emerald-500 text-shadow-glow">INTEL</span>
            </h1>
            <div className="flex items-center gap-3 mt-2">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
               <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.4em] italic">
                 SYSTÈME DE SURVEILLANCE DES PERFORMANCES BIOMÉTRIQUES
               </p>
            </div>
          </div>

          <div className="flex gap-4">
             <button onClick={loadAnalytics} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-emerald-500/20 transition-all text-zinc-400 hover:text-white">
                <RefreshCcw size={20} />
             </button>
             <button 
                onClick={() => router.push('/rh/workspace')}
                className="group flex items-center gap-4 px-10 py-5 bg-white text-black rounded-[2rem] font-black uppercase text-[11px] tracking-widest hover:bg-emerald-500 transition-all shadow-2xl active:scale-95"
             >
                <Layout size={18} /> ESPACE TRAVAIL <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
             </button>
          </div>
        </header>

        {/* --- KPI MINIATURES (GLASS) --- */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {[
            { label: "Vecteur Humain", val: employees.length, sub: "Agents actifs", icon: Users, color: THEME.blue },
            { label: "Masse Salariale", val: `${(stats.totalPayroll/1000).toFixed(1)}k€`, sub: "Budget prévisionnel", icon: Wallet, color: THEME.emerald },
            { label: "Secteurs", val: stats.deptCount, sub: "Unités opérationnelles", icon: Database, color: THEME.gold }
          ].map((kpi, i) => (
            <div key={i} className="p-8 bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-between group hover:border-white/20 transition-all">
               <div>
                  <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2">{kpi.label}</p>
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter">{kpi.val}</h3>
               </div>
               <div className="p-5 rounded-3xl bg-black/40 border border-white/5" style={{ color: kpi.color }}>
                  <kpi.icon size={24} />
               </div>
            </div>
          ))}
        </div>

        {/* --- GRID ANALYTIQUE SUPÉRIEUR --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* PERF AGENTS (GLASS) */}
          <div className="lg:col-span-8 bg-white/[0.04] border border-white/10 backdrop-blur-3xl rounded-[3.5rem] p-10 shadow-2xl relative group">
            <h3 className="text-[10px] font-black uppercase italic tracking-[0.4em] mb-10 flex items-center gap-3">
              <Activity size={16} className="text-emerald-500" /> Rendement & PCO Individuel
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" stroke="#555" fontSize={9} fontWeight="bold" />
                  <YAxis hide />
                  <Tooltip contentStyle={{backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '10px'}} />
                  <Area type="monotone" dataKey="aura" fill={THEME.emerald} fillOpacity={0.1} stroke={THEME.emerald} strokeWidth={4} />
                  <Bar dataKey="pco" barSize={10} fill={THEME.blue} radius={[5, 5, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DISTRIBUTION (GLASS) */}
          <div className="lg:col-span-4 bg-white/[0.04] border border-white/10 backdrop-blur-3xl rounded-[3.5rem] p-10 shadow-2xl flex flex-col items-center">
            <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-8 tracking-[0.4em]">Densité Secteurs</h3>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.pieData} innerRadius={65} outerRadius={95} paddingAngle={10} dataKey="value">
                    {stats.pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              {stats.pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-[8px] font-black uppercase text-zinc-500">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- NOUVEAU GRAPHIQUE : RENTABILITÉ PAR PÔLE --- */}
        <div className="bg-white/[0.04] border border-white/10 backdrop-blur-3xl rounded-[3.5rem] p-10 shadow-2xl mb-12 relative overflow-hidden">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-[10px] font-black uppercase italic tracking-[0.4em] flex items-center gap-3">
                <BarChart3 size={16} className="text-amber-500" /> Analyse Comparative de Rentabilité par Pôle
              </h3>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2 text-[8px] font-bold text-zinc-500 uppercase"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Perf %</div>
                 <div className="flex items-center gap-2 text-[8px] font-bold text-zinc-500 uppercase"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Charge (PCO)</div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.profitabilityData}>
                  <defs>
                    <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={THEME.emerald} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={THEME.emerald} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCharge" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={THEME.blue} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={THEME.blue} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" stroke="#555" fontSize={10} fontWeight="black" tickLine={false} axisLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip contentStyle={{backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px'}} />
                  <Area type="stepAfter" dataKey="performance" stroke={THEME.emerald} strokeWidth={3} fillOpacity={1} fill="url(#colorPerf)" />
                  <Area type="monotone" dataKey="charge" stroke={THEME.blue} strokeWidth={3} fillOpacity={1} fill="url(#colorCharge)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
        </div>

        {/* --- FOOTER BANNER --- */}
        <div className="p-10 bg-gradient-to-r from-emerald-500/10 via-white/[0.02] to-blue-500/10 border border-white/10 rounded-[3.5rem] flex items-center justify-between">
           <div className="flex items-center gap-8">
              <div className="w-14 h-14 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-emerald-500">
                 <ShieldCheck size={28} />
              </div>
              <div>
                 <h4 className="text-xl font-black italic uppercase tracking-tighter">Sécurité des Données Active</h4>
                 <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest mt-1">
                   Registre complet disponible uniquement via le terminal sécurisé de l'Espace de Travail.
                 </p>
              </div>
           </div>
           <button 
             onClick={() => router.push('/rh/workspace')}
             className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all"
           >
             Accéder au registre détaillé
           </button>
        </div>

      </main>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #10b981; border-radius: 20px; }
        .text-shadow-glow { text-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
      `}</style>
    </div>
  );
}
