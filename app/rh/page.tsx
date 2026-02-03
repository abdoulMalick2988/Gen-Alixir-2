"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../components/WakandaGuard";

/** * ANALYTIQUE ENGINE */
import { 
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, 
  Tooltip, ComposedChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';

/** * ICONSET */
import { 
  Users, Wallet, Activity, Layout, RefreshCcw, 
  Database, ArrowUpRight, Cpu, BarChart3, ShieldCheck,
  FileText, Download, X, ChevronRight, Fingerprint, History, CheckCircle2, Menu
} from 'lucide-react';

const THEME = { 
  emerald: "#10b981", 
  blue: "#3b82f6", 
  gold: "#fbbf24", 
  glass: "rgba(255, 255, 255, 0.04)",
  border: "rgba(255, 255, 255, 0.1)"
};
const COLORS = [THEME.emerald, THEME.blue, "#8b5cf6", THEME.gold, "#f43f5e", "#ec4899"];

export default function RHAnalyticsResponsive() {
  const user = useAuth();
  const router = useRouter();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'stats' | 'list'>('stats');
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Pour mobile

  const mockEmployees = useMemo(() => [
    { 
      id: '1', full_name: 'Malick Thiam', department: 'TECHNIQUE', manager: 'Admin', aura: 95, pco: '8.5', role: 'Lead Developer', 
      bio: 'Expert Cloud & Sécurité.', 
      missions: [{ title: 'Migration AWS', date: 'Jan 2026', status: 'Terminé' }, { title: 'Optimisation DB', date: 'Déc 2025', status: 'Terminé' }]
    },
    { 
      id: '2', full_name: 'Awa Diop', department: 'MARKETING', manager: 'Sarah Kone', aura: 82, pco: '6.2', role: 'Brand Manager', 
      bio: 'Spécialiste croissance organique.',
      missions: [{ title: 'Campagne Q4', date: 'Jan 2026', status: 'Terminé' }]
    },
    { id: '3', full_name: 'Jean-Luc Moukin', department: 'TECHNIQUE', manager: 'Malick Thiam', aura: 78, pco: '7.0', role: 'Fullstack Dev', missions: [] },
    { id: '4', full_name: 'Fiona Uwimana', department: 'MANAGEMENT', manager: 'Direction', aura: 88, pco: '9.0', role: 'Opérations', missions: [] },
  ], []);

  const loadAnalytics = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setEmployees(mockEmployees); 
    setTimeout(() => setLoading(false), 800);
  }, [user, mockEmployees]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  const stats = useMemo(() => {
    const totalPayroll = employees.reduce((acc, curr) => acc + ((parseFloat(curr.pco) || 0) * 190), 0);
    const depts = employees.reduce((acc: any, curr) => {
      const d = curr.department || 'GÉNÉRAL';
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});
    const profitabilityData = Object.keys(depts).map(deptName => {
      const members = employees.filter(e => e.department === deptName);
      const avgAura = members.reduce((sum, e) => sum + (e.aura || 0), 0) / members.length;
      return { name: deptName, performance: Math.round(avgAura), charge: members.reduce((sum, e) => sum + (parseFloat(e.pco) || 0), 0) * 10 };
    });
    return { totalPayroll, pieData: Object.keys(depts).map(name => ({ name, value: depts[name] })), 
             chartData: employees.map(e => ({ name: e.full_name?.split(' ')[0], aura: e.aura, pco: (parseFloat(e.pco)||0) * 10 })), 
             profitabilityData, deptCount: Object.keys(depts).length };
  }, [employees]);

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-4 text-emerald-500">
      <Cpu className="animate-spin" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.6em]">Syncing Interface...</p>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#020202] text-white overflow-hidden font-sans">
      {/* SIDEBAR RESPONSIVE */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block fixed lg:relative z-50 h-full`}>
        <Sidebar />
      </div>

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scroll relative w-full">
        
        {/* MOBILE HEADER */}
        <div className="lg:hidden flex justify-between items-center mb-6">
           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-white/5 rounded-xl border border-white/10">
              <Menu size={20} />
           </button>
           <h1 className="text-2xl font-black italic tracking-tighter">RH <span className="text-emerald-500">INTEL</span></h1>
           <div className="w-10"></div>
        </div>

        {/* MAIN HEADER (DESKTOP/TAB) */}
        <header className="hidden lg:flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl xl:text-6xl font-black italic uppercase tracking-tighter leading-none">
              RH <span className="text-emerald-500 text-shadow-glow">INTEL</span>
            </h1>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.4em] mt-2 flex items-center gap-2 italic">
               <Fingerprint size={12} className="text-emerald-500" /> Multi-Platform System
            </p>
          </div>
          <div className="flex gap-4">
             {view === 'list' && <button onClick={() => setView('stats')} className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10">Retour</button>}
             <button onClick={() => router.push('/rh/workspace')} className="flex items-center gap-4 px-8 py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all">
                <Layout size={16} /> WORKSPACE
             </button>
          </div>
        </header>

        {view === 'stats' ? (
          <>
            {/* KPI GRID RESPONSIVE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8">
              <div onClick={() => setView('list')} className="cursor-pointer p-6 lg:p-8 bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-[2rem] lg:rounded-[2.5rem] flex items-center justify-between group hover:border-emerald-500/50 transition-all hover:bg-emerald-500/5">
                 <div>
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1 lg:mb-2">Employés</p>
                    <h3 className="text-2xl lg:text-4xl font-black italic uppercase tracking-tighter group-hover:text-emerald-500 transition-colors">{employees.length} Agents</h3>
                 </div>
                 <Users className="text-blue-500 group-hover:scale-110 transition-transform" size={24} />
              </div>
              <div className="p-6 lg:p-8 bg-white/[0.03] border border-white/10 rounded-[2rem] lg:rounded-[2.5rem] flex items-center justify-between">
                 <div>
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1 lg:mb-2">Budget</p>
                    <h3 className="text-2xl lg:text-4xl font-black italic uppercase tracking-tighter">{(stats.totalPayroll/1000).toFixed(1)}k€</h3>
                 </div>
                 <Wallet className="text-emerald-500" size={24} />
              </div>
              <div className="p-6 lg:p-8 bg-white/[0.03] border border-white/10 rounded-[2rem] lg:rounded-[2.5rem] flex items-center justify-between">
                 <div>
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1 lg:mb-2">Secteurs</p>
                    <h3 className="text-2xl lg:text-4xl font-black italic uppercase tracking-tighter">{stats.deptCount} Unités</h3>
                 </div>
                 <Database className="text-amber-500" size={24} />
              </div>
            </div>

            {/* CHARTS GRID RESPONSIVE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-8">
              <div className="lg:col-span-8 bg-white/[0.04] border border-white/10 backdrop-blur-3xl rounded-[2.5rem] lg:rounded-[3.5rem] p-6 lg:p-10 shadow-2xl">
                <h3 className="text-[10px] font-black uppercase italic tracking-[0.4em] mb-6 lg:mb-10 flex items-center gap-3">
                   <Activity size={16} className="text-emerald-500" /> Performance
                </h3>
                <div className="h-[240px] lg:h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={stats.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="name" stroke="#555" fontSize={8} fontWeight="bold" />
                      <Tooltip contentStyle={{backgroundColor: '#050505', border: 'none', borderRadius: '15px'}} />
                      <Area type="monotone" dataKey="aura" fill={THEME.emerald} fillOpacity={0.1} stroke={THEME.emerald} strokeWidth={3} />
                      <Bar dataKey="pco" barSize={8} fill={THEME.blue} radius={[4, 4, 0, 0]} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-4 bg-white/[0.04] border border-white/10 backdrop-blur-3xl rounded-[2.5rem] lg:rounded-[3.5rem] p-6 lg:p-10 shadow-2xl flex flex-col items-center">
                <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-6 lg:mb-8 tracking-[0.4em]">Secteurs</h3>
                <div className="h-[200px] lg:h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.pieData} innerRadius={50} outerRadius={75} paddingAngle={8} dataKey="value">
                        {stats.pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* LISTE EMPLOYEES RESPONSIVE */
          <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] lg:rounded-[3rem] overflow-hidden backdrop-blur-3xl">
            <div className="p-6 lg:p-10 border-b border-white/10 flex justify-between items-center">
               <h2 className="text-2xl lg:text-3xl font-black italic uppercase tracking-tighter">Répertoire Agents</h2>
               <button onClick={() => setView('stats')} className="lg:hidden p-3 bg-white/5 rounded-xl"><X size={16} /></button>
            </div>
            <div className="divide-y divide-white/[0.05]">
               {employees.map((emp) => (
                 <div key={emp.id} onClick={() => setSelectedEmployee(emp)} className="p-4 lg:p-8 flex items-center justify-between hover:bg-white/[0.03] transition-all cursor-pointer group">
                   <div className="flex items-center gap-4 lg:gap-6">
                      <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-sm lg:text-xl font-black italic text-emerald-500 group-hover:scale-110 transition-transform">
                        {emp.full_name.charAt(0)}
                      </div>
                      <div>
                         <h4 className="text-base lg:text-xl font-black uppercase tracking-tight">{emp.full_name}</h4>
                         <p className="text-[7px] lg:text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{emp.role}</p>
                      </div>
                   </div>
                   <ChevronRight className="text-zinc-700 group-hover:text-emerald-500" size={18} />
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* MODAL FICHE TECHNIQUE FULL RESPONSIVE */}
        {selectedEmployee && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8 backdrop-blur-3xl bg-black/80 overflow-y-auto">
            <div className="w-full max-w-5xl bg-[#080808] border border-white/10 rounded-[2.5rem] lg:rounded-[4rem] overflow-hidden shadow-2xl relative my-auto">
               <button onClick={() => setSelectedEmployee(null)} className="absolute top-6 right-6 lg:top-10 lg:right-10 p-3 lg:p-4 bg-white/5 rounded-full hover:bg-white/10 z-50">
                 <X size={20} />
               </button>

               <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
                  <div className="lg:col-span-4 bg-zinc-900/50 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-white/10">
                    <div className="w-20 h-20 lg:w-32 lg:h-32 rounded-2xl lg:rounded-[2.5rem] bg-emerald-500 flex items-center justify-center text-black text-3xl lg:text-5xl font-black italic mb-6 lg:mb-8">
                      {selectedEmployee.full_name.charAt(0)}
                    </div>
                    <h2 className="text-2xl lg:text-4xl font-black italic uppercase tracking-tighter mb-2 lg:mb-4">{selectedEmployee.full_name}</h2>
                    <p className="text-emerald-500 font-black text-[9px] lg:text-[10px] uppercase tracking-[0.3em] mb-6 lg:mb-10">{selectedEmployee.role}</p>
                    
                    <div className="p-4 lg:p-6 bg-white/5 rounded-2xl lg:rounded-3xl border border-white/5">
                        <p className="text-[7px] lg:text-[8px] font-black text-zinc-500 uppercase mb-2">Performance Aura</p>
                        <div className="flex items-end gap-3">
                           <span className="text-2xl lg:text-4xl font-black italic">{selectedEmployee.aura}</span>
                           <div className="flex-1 h-1 bg-zinc-800 rounded-full mb-2 overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${selectedEmployee.aura}%` }}></div>
                           </div>
                        </div>
                    </div>
                  </div>

                  <div className="lg:col-span-8 p-8 lg:p-12 flex flex-col">
                     <h3 className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-6 flex items-center gap-2 italic">
                        <History size={14} className="text-blue-500" /> Missions Terminées
                     </h3>
                     <div className="space-y-3 mb-8 max-h-[200px] lg:max-h-none overflow-y-auto">
                        {selectedEmployee.missions.map((m: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-4 lg:p-6 bg-white/[0.03] border border-white/5 rounded-xl lg:rounded-2xl">
                             <div className="flex items-center gap-4">
                                <CheckCircle2 className="text-emerald-500" size={16} />
                                <div>
                                   <p className="text-xs lg:text-sm font-bold uppercase tracking-tight">{m.title}</p>
                                   <p className="text-[7px] lg:text-[8px] font-black text-zinc-500 uppercase">{m.date}</p>
                                </div>
                             </div>
                          </div>
                        ))}
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-white/10">
                        <button className="py-4 lg:py-6 bg-white text-black rounded-2xl lg:rounded-3xl font-black uppercase text-[10px] lg:text-[11px] tracking-widest flex items-center justify-center gap-3">
                           <Download size={16} /> CV
                        </button>
                        <button className="py-4 lg:py-6 bg-white/5 border border-white/10 rounded-2xl lg:rounded-3xl font-black uppercase text-[10px] lg:text-[11px] tracking-widest flex items-center justify-center gap-3">
                           <FileText size={16} /> Missions
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

      </main>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar { width: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #10b981; border-radius: 20px; }
        .text-shadow-glow { text-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
      `}</style>
    </div>
  );
}
