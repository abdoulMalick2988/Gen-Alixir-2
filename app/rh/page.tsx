"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../components/WakandaGuard";

/** * ANALYTIQUE ENGINE - CONFIGURATION COMPACTE */
import { 
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, 
  Tooltip, ComposedChart, Bar, XAxis, CartesianGrid, YAxis 
} from 'recharts';

/** * ICONSET - NEON UI */
import { 
  Users, Wallet, Activity, Layout, RefreshCcw, TrendingUp, 
  Database, Fingerprint, ArrowUpRight, Cpu
} from 'lucide-react';

const THEME = { emerald: "#10b981", blue: "#3b82f6", gold: "#fbbf24", glass: "rgba(255, 255, 255, 0.03)" };
const COLORS = [THEME.emerald, THEME.blue, "#8b5cf6", THEME.gold, "#f43f5e"];

export default function RHModernAnalytics() {
  const user = useAuth();
  const router = useRouter();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase.from('staff').select('*').order('full_name');
      if (user.role !== 'ADMIN') query = query.eq('partner_id', user.id);
      const { data } = await query;
      setEmployees(data || []);
    } catch (e) { console.error(e); }
    finally { setTimeout(() => setLoading(false), 600); }
  }, [user]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  const stats = useMemo(() => {
    const totalPayroll = employees.reduce((acc, curr) => acc + ((parseFloat(curr.pco) || 0) * 190), 0);
    const depts = employees.reduce((acc: any, curr) => {
      const d = curr.department || 'GÉNÉRAL';
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});
    const pieData = Object.keys(depts).map(name => ({ name, value: depts[name] }));
    const chartData = employees.slice(0, 8).map(e => ({ 
      name: e.full_name?.split(' ')[0], 
      aura: e.aura, 
      pco: (parseFloat(e.pco)||0) * 10 
    }));
    return { totalPayroll, pieData, chartData, deptCount: Object.keys(depts).length };
  }, [employees]);

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <Cpu className="text-emerald-500 animate-spin" size={32} />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020202] text-white overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto custom-scroll relative">
        
        {/* --- HEADER COMPACT --- */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
              RH <span className="text-emerald-500">INTEL</span>
            </h1>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.4em] mt-2 italic flex items-center gap-2">
               <Fingerprint size={12} className="text-emerald-500" /> Terminal de pilotage stratégique
            </p>
          </div>

          <div className="flex gap-4">
             <button onClick={loadAnalytics} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-emerald-500/10 transition-all">
                <RefreshCcw size={18} />
             </button>
             <button 
                onClick={() => router.push('/rh/workspace')}
                className="flex items-center gap-4 px-8 py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all shadow-xl"
             >
                <Layout size={16} /> Espace Travail <ArrowUpRight size={14} />
             </button>
          </div>
        </header>

        {/* --- KPI MINIATURES --- */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {[
            { label: "Effectif total", val: employees.length, sub: "Agents actifs", icon: Users, color: THEME.blue },
            { label: "Masse Salariale", val: `${(stats.totalPayroll/1000).toFixed(1)}k€`, sub: "Estimation brute", icon: Wallet, color: THEME.emerald },
            { label: "Unités actives", val: stats.deptCount, sub: "Départements", icon: Database, color: THEME.gold }
          ].map((kpi, i) => (
            <div key={i} className="p-6 bg-white/[0.03] border border-white/10 backdrop-blur-md rounded-[2rem] flex items-center gap-6 group hover:border-white/20 transition-all">
               <div className="p-4 rounded-2xl bg-black/40 border border-white/5" style={{ color: kpi.color }}>
                  <kpi.icon size={20} />
               </div>
               <div>
                  <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">{kpi.label}</p>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">{kpi.val}</h3>
               </div>
            </div>
          ))}
        </div>

        {/* --- ANALYTICS GLASS GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* GRAPH PERFORMANCE (GLASS) */}
          <div className="lg:col-span-7 bg-white/[0.04] border border-white/10 backdrop-blur-3xl rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none"><TrendingUp size={200}/></div>
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h3 className="text-[10px] font-black uppercase italic tracking-[0.3em] flex items-center gap-2">
                <Activity size={14} className="text-emerald-500" /> Flux Performance & PCO
              </h3>
            </div>
            <div className="h-[280px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" stroke="#444" fontSize={9} fontWeight="bold" />
                  <YAxis hide />
                  <Tooltip contentStyle={{backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', fontSize: '10px'}} />
                  <Area type="monotone" dataKey="aura" fill={THEME.emerald} fillOpacity={0.1} stroke={THEME.emerald} strokeWidth={3} />
                  <Bar dataKey="pco" barSize={8} fill={THEME.blue} radius={[4, 4, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DISTRIBUTION SECTEURS (GLASS) */}
          <div className="lg:col-span-5 bg-white/[0.04] border border-white/10 backdrop-blur-3xl rounded-[3rem] p-8 shadow-2xl flex flex-col items-center">
            <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-6 tracking-[0.3em]">Répartition Pôles</h3>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.pieData} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">
                    {stats.pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-4 w-full px-4">
              {stats.pieData.slice(0, 4).map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-[8px] font-bold uppercase text-zinc-400 tracking-tighter truncate">{d.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* --- RÉSUMÉ ANALYTIQUE (REMPLACE LA LISTE DÉTAILLÉE) --- */}
        <div className="mt-8 p-10 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-[3rem] flex items-center justify-between">
            <div className="flex items-center gap-8">
               <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                  <TrendingUp size={28} />
               </div>
               <div>
                  <h4 className="text-xl font-black italic uppercase tracking-tighter">Optimisation de l'Aura G globale</h4>
                  <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mt-1">L'analyse actuelle indique un rendement moyen de 84.2% sur l'ensemble des pôles.</p>
               </div>
            </div>
            <button 
              onClick={() => router.push('/rh/workspace')}
              className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
            >
              Consulter les agents
            </button>
        </div>

      </main>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #10b981; border-radius: 20px; }
      `}</style>
    </div>
  );
}
