"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../components/WakandaGuard";

/** * RECHARTS ENGINE - ANALYTIQUE DE HAUT NIVEAU */
import { 
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, 
  Tooltip, ComposedChart, Bar, XAxis, CartesianGrid 
} from 'recharts';

/** * ICONSET - WAKANDA UI */
import { 
  Users, Wallet, Activity, ChevronRight, Layout, 
  RefreshCcw, TrendingUp, Database, Fingerprint, 
  ShieldCheck, ArrowUpRight, UserCircle2, Briefcase
} from 'lucide-react';

// --- DESIGN SYSTEM : ECODREUM NEON ---
const THEME = { emerald: "#10b981", blue: "#3b82f6", gold: "#fbbf24", bg: "#020202" };
const COLORS = [THEME.emerald, THEME.blue, "#8b5cf6", THEME.gold, "#f43f5e"];

export default function RHAnalyticsMaster() {
  const user = useAuth();
  const router = useRouter();
  
  // États de données
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États d'interface
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);

  // 1. CHARGEMENT DES DONNÉES ANALYTIQUES
  const loadAnalytics = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase.from('staff').select('*').order('full_name');
      // Filtre partenaire si l'utilisateur n'est pas Admin
      if (user.role !== 'ADMIN') query = query.eq('partner_id', user.id);
      
      const { data, error } = await query;
      if (error) throw error;
      setEmployees(data || []);
    } catch (e) {
      console.error("ANALYSIS_SYNC_ERROR:", e);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  }, [user]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  // 2. MOTEUR DE CALCUL STATISTIQUE
  const stats = useMemo(() => {
    const totalPayroll = employees.reduce((acc, curr) => acc + ((parseFloat(curr.pco) || 0) * 190), 0);
    const depts = employees.reduce((acc: any, curr) => {
      const d = curr.department || 'GÉNÉRAL';
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});
    
    const pieData = Object.keys(depts).map(name => ({ name, value: depts[name] }));
    const chartData = employees.slice(0, 10).map(e => ({ 
      name: e.full_name?.split(' ')[0], 
      aura: e.aura, 
      pco: (parseFloat(e.pco)||0) * 10 
    }));

    return { totalPayroll, pieData, chartData, deptCount: Object.keys(depts).length };
  }, [employees]);

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-t-2 border-emerald-500 rounded-full animate-spin mb-6"></div>
      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[1em] animate-pulse">Synchronisation Intel...</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020202] text-white overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 p-10 overflow-y-auto custom-scroll relative">
        
        {/* --- PORTAIL DE NAVIGATION HAUT --- */}
        <header className="flex justify-between items-end mb-16 relative z-10">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-zinc-400">
                <Fingerprint size={10} className="text-emerald-500" /> Analyste : {user?.username}
              </span>
            </div>
            <h1 className="text-8xl font-black italic uppercase tracking-tighter leading-none">
              RH <span className="text-emerald-500">INTEL</span>
            </h1>
          </div>

          <button 
            onClick={() => router.push('/rh/workspace')}
            className="group relative flex items-center gap-6 px-12 py-6 bg-white text-black rounded-[2.5rem] font-black uppercase text-[12px] tracking-[0.2em] hover:bg-emerald-500 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.3)] active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <Layout size={20} className="group-hover:rotate-12 transition-transform" />
            Espace de Travail
            <ArrowUpRight size={18} className="text-zinc-400 group-hover:text-black group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
          </button>
        </header>

        {/* --- KPI ANALYTICS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3.5rem] relative group hover:bg-white/[0.04] transition-all">
            <Users className="text-blue-500 mb-6" size={28} />
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Effectif Total</p>
            <h2 className="text-5xl font-black italic mt-2">{employees.length} <span className="text-sm not-italic font-bold text-zinc-700">Agents</span></h2>
          </div>

          <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3.5rem] relative group hover:bg-white/[0.04] transition-all">
            <Wallet className="text-emerald-500 mb-6" size={28} />
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Masse Salariale Est.</p>
            <h2 className="text-5xl font-black italic mt-2 text-emerald-500">{stats.totalPayroll.toLocaleString()} €</h2>
          </div>

          <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3.5rem] relative group hover:bg-white/[0.04] transition-all">
            <Database className="text-amber-500 mb-6" size={28} />
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Pôles Actifs</p>
            <h2 className="text-5xl font-black italic mt-2">{stats.deptCount} <span className="text-sm not-italic font-bold text-zinc-700">Unités</span></h2>
          </div>
        </div>

        {/* --- CHARTS SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          
          {/* PERF MONITOR */}
          <div className="lg:col-span-8 bg-white/[0.01] border border-white/5 rounded-[4rem] p-12">
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-sm font-black uppercase italic tracking-widest flex items-center gap-3">
                <TrendingUp size={20} className="text-emerald-500" /> Index Performance / PCO
              </h3>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#333" fontSize={10} fontWeight="black" />
                  <Tooltip contentStyle={{backgroundColor: '#000', border: 'none', borderRadius: '20px'}} />
                  <Area type="monotone" dataKey="aura" fill={THEME.emerald} fillOpacity={0.05} stroke={THEME.emerald} strokeWidth={4} />
                  <Bar dataKey="pco" barSize={12} fill={THEME.blue} radius={[10, 10, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DISTRIBUTION SECTEURS */}
          <div className="lg:col-span-4 bg-white/[0.01] border border-white/5 rounded-[4rem] p-12 flex flex-col items-center justify-center">
            <p className="text-[10px] font-black uppercase text-zinc-600 mb-10 tracking-[0.3em]">Distribution Secteurs</p>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.pieData} innerRadius={80} outerRadius={110} paddingAngle={10} dataKey="value">
                    {stats.pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-10">
              {stats.pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-[9px] font-black uppercase text-zinc-500">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- REGISTRE DES AGENTS --- */}
        <div className="bg-white/[0.01] border border-white/5 rounded-[4rem] overflow-hidden mb-20 shadow-2xl">
          <div className="p-12 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter italic">Registre Opérationnel</h2>
            <button onClick={loadAnalytics} className="p-5 bg-white/5 rounded-2xl hover:bg-emerald-500 hover:text-black transition-all">
              <RefreshCcw size={20} />
            </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-black/40 text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] border-b border-white/5">
              <tr>
                <th className="p-10">Agent Certifié</th>
                <th className="p-10">Secteur</th>
                <th className="p-10">Score Aura</th>
                <th className="p-10 text-right">PCO Unitaire</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold">
              {employees.map((emp) => (
                <tr 
                  key={emp.id} 
                  onClick={() => setSelectedEmp(emp)}
                  className="border-b border-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer group"
                >
                  <td className="p-10 flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-emerald-500 font-black italic">
                      {emp.full_name?.charAt(0)}
                    </div>
                    <span className="text-lg font-black uppercase italic tracking-tighter group-hover:text-emerald-500 transition-colors">{emp.full_name}</span>
                  </td>
                  <td className="p-10 text-zinc-500 uppercase italic text-[11px] tracking-widest">{emp.department}</td>
                  <td className="p-10">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${emp.aura}%` }}></div>
                      </div>
                      <span className="text-emerald-500 italic text-[11px]">{emp.aura}%</span>
                    </div>
                  </td>
                  <td className="p-10 text-right font-black italic text-xl text-blue-500">{emp.pco} PCO</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- MODAL : FOCUS AGENT (QUICK VIEW) --- */}
        {selectedEmp && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-3xl z-[100] flex items-center justify-center p-8 animate-in fade-in duration-500">
             <div className="w-full max-w-2xl bg-[#080808] border border-white/10 rounded-[4rem] p-16 relative shadow-[0_0_100px_rgba(0,0,0,1)]">
               <button onClick={() => setSelectedEmp(null)} className="absolute top-12 right-12 p-4 bg-white/5 rounded-2xl text-zinc-500 hover:text-white transition-all">Fermer</button>
               
               <div className="text-center mb-12">
                 <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] mx-auto mb-8 flex items-center justify-center text-black text-4xl font-black italic shadow-2xl">
                   {selectedEmp.full_name?.charAt(0)}
                 </div>
                 <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">{selectedEmp.full_name}</h2>
                 <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Fiche Agent Node.Staff</p>
               </div>

               <div className="grid grid-cols-2 gap-8">
                 <div className="p-8 bg-white/[0.03] border border-white/5 rounded-3xl text-center">
                    <Briefcase size={20} className="mx-auto mb-4 text-zinc-700" />
                    <p className="text-[9px] font-black text-zinc-500 uppercase mb-2">Département</p>
                    <p className="text-sm font-black uppercase text-white tracking-widest">{selectedEmp.department}</p>
                 </div>
                 <div className="p-8 bg-white/[0.03] border border-white/5 rounded-3xl text-center">
                    <Activity size={20} className="mx-auto mb-4 text-emerald-500" />
                    <p className="text-[9px] font-black text-zinc-500 uppercase mb-2">Score Aura</p>
                    <p className="text-2xl font-black italic text-emerald-500">{selectedEmp.aura}%</p>
                 </div>
               </div>

               <div className="mt-12 p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
                  <p className="text-[9px] font-black text-emerald-500 uppercase mb-4 tracking-widest">Résumé des Notes</p>
                  <p className="text-sm text-zinc-400 leading-relaxed italic">
                    {selectedEmp.notes || "Aucune observation particulière enregistrée pour cet agent dans le registre actuel."}
                  </p>
               </div>
             </div>
          </div>
        )}

      </main>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #10b981; border-radius: 20px; }
      `}</style>
    </div>
  );
}
