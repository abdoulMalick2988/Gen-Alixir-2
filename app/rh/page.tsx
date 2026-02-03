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
  FileText, Download, X, ChevronRight, Fingerprint, History, CheckCircle2
} from 'lucide-react';

const THEME = { 
  emerald: "#10b981", 
  blue: "#3b82f6", 
  gold: "#fbbf24", 
  glass: "rgba(255, 255, 255, 0.04)",
  border: "rgba(255, 255, 255, 0.1)"
};
const COLORS = [THEME.emerald, THEME.blue, "#8b5cf6", THEME.gold, "#f43f5e", "#ec4899"];

export default function RHAnalyticsInteractive() {
  const user = useAuth();
  const router = useRouter();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'stats' | 'list'>('stats');
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);

  // --- DONNÉES FICTIVES AVEC MISSIONS ---
  const mockEmployees = useMemo(() => [
    { 
      id: '1', full_name: 'Malick Thiam', department: 'TECHNIQUE', manager: 'Admin', aura: 95, pco: '8.5', role: 'Lead Developer', 
      bio: 'Expert Cloud & Sécurité.', 
      missions: [
        { title: 'Migration AWS', date: 'Jan 2026', status: 'Terminé' },
        { title: 'Optimisation DB', date: 'Déc 2025', status: 'Terminé' }
      ]
    },
    { 
      id: '2', full_name: 'Awa Diop', department: 'MARKETING', manager: 'Sarah Kone', aura: 82, pco: '6.2', role: 'Brand Manager', 
      bio: 'Spécialiste croissance organique.',
      missions: [
        { title: 'Campagne Q4', date: 'Jan 2026', status: 'Terminé' },
        { title: 'Refonte Identité', date: 'Nov 2025', status: 'Terminé' }
      ]
    },
    { id: '3', full_name: 'Jean-Luc Moukin', department: 'TECHNIQUE', manager: 'Malick Thiam', aura: 78, pco: '7.0', role: 'Fullstack Dev', bio: 'Passionné par React & VR.', missions: [] },
    { id: '4', full_name: 'Fiona Uwimana', department: 'MANAGEMENT', manager: 'Direction', aura: 88, pco: '9.0', role: 'Opérations', bio: 'Gestion de projets complexes.', missions: [] },
    { id: '5', full_name: 'Eric Giba', department: 'TECHNIQUE', manager: 'Malick Thiam', aura: 65, pco: '5.5', role: 'Junior Dev', bio: 'Apprentissage rapide.', missions: [] },
    { id: '6', full_name: 'David Rukubu', department: 'MARKETING', manager: 'Awa Diop', aura: 91, pco: '7.8', role: 'Creative Director', bio: 'Visions futuristes.', missions: [] },
    { id: '7', full_name: 'Sarah Kone', department: 'RH', manager: 'Direction', aura: 85, pco: '6.5', role: 'Talent Acquisition', bio: 'Culture d\'entreprise.', missions: [] },
    { id: '8', full_name: 'Omar Sy', department: 'SÉCURITÉ', manager: 'Direction', aura: 98, pco: '9.5', role: 'Security Chief', bio: 'Protection périmétrique.', missions: [] }
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
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
      <Cpu className="text-emerald-500 animate-spin" size={40} />
      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.6em]">Calcul des Vecteurs...</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020202] text-white overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto custom-scroll relative">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
              RH <span className="text-emerald-500 text-shadow-glow">INTEL</span>
            </h1>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.4em] mt-2 italic flex items-center gap-2">
               <Fingerprint size={12} className="text-emerald-500" /> Terminal RH Interactif
            </p>
          </div>
          <div className="flex gap-4">
             {view === 'list' && (
               <button onClick={() => setView('stats')} className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                 Retour Stats
               </button>
             )}
             <button onClick={() => router.push('/rh/workspace')} className="group flex items-center gap-4 px-10 py-5 bg-white text-black rounded-[2rem] font-black uppercase text-[11px] tracking-widest hover:bg-emerald-500 transition-all shadow-2xl">
                <Layout size={18} /> ESPACE TRAVAIL
             </button>
          </div>
        </header>

        {view === 'stats' ? (
          <>
            {/* KPI CLICABLES */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div onClick={() => setView('list')} className="cursor-pointer p-8 bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-between group hover:border-emerald-500 transition-all">
                 <div>
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2">Base de Données</p>
                    <h3 className="text-4xl font-black italic uppercase tracking-tighter group-hover:text-emerald-500">{employees.length} Employés</h3>
                 </div>
                 <div className="p-5 rounded-3xl bg-black/40 border border-white/5 text-blue-500"><Users size={24} /></div>
              </div>
              <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[2.5rem] flex justify-between">
                 <div>
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2">Masse Salariale</p>
                    <h3 className="text-4xl font-black italic uppercase tracking-tighter">{(stats.totalPayroll/1000).toFixed(1)}k€</h3>
                 </div>
                 <div className="p-5 rounded-3xl bg-black/40 border border-white/5 text-emerald-500"><Wallet size={24} /></div>
              </div>
              <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[2.5rem] flex justify-between">
                 <div>
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2">Unités</p>
                    <h3 className="text-4xl font-black italic uppercase tracking-tighter">{stats.deptCount} Pôles</h3>
                 </div>
                 <div className="p-5 rounded-3xl bg-black/40 border border-white/5 text-amber-500"><Database size={24} /></div>
              </div>
            </div>

            {/* GRAPHS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
              <div className="lg:col-span-8 bg-white/[0.04] border border-white/10 rounded-[3.5rem] p-10 shadow-2xl">
                <h3 className="text-[10px] font-black uppercase italic tracking-[0.4em] mb-10 flex items-center gap-3"><Activity size={16} className="text-emerald-500" /> Flux Performance Individuelle</h3>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={stats.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="name" stroke="#555" fontSize={9} fontWeight="bold" />
                      <YAxis hide />
                      <Tooltip contentStyle={{backgroundColor: '#050505', border: 'none', borderRadius: '15px'}} />
                      <Area animationBegin={400} animationDuration={1500} type="monotone" dataKey="aura" fill={THEME.emerald} fillOpacity={0.1} stroke={THEME.emerald} strokeWidth={4} />
                      <Bar animationBegin={600} animationDuration={1500} dataKey="pco" barSize={10} fill={THEME.blue} radius={[5, 5, 0, 0]} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="lg:col-span-4 bg-white/[0.04] border border-white/10 rounded-[3.5rem] p-10 shadow-2xl flex flex-col items-center">
                <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-8 tracking-[0.4em]">Densité Secteurs</h3>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie animationBegin={800} animationDuration={1500} data={stats.pieData} innerRadius={60} outerRadius={90} paddingAngle={10} dataKey="value">
                        {stats.pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* LISTE DES EMPLOYÉS */
          <div className="bg-white/[0.02] border border-white/10 rounded-[3rem] overflow-hidden backdrop-blur-3xl animate-in fade-in duration-500">
            <div className="p-10 border-b border-white/10 flex justify-between items-center">
               <h2 className="text-3xl font-black italic uppercase tracking-tighter">Répertoire des Agents</h2>
            </div>
            <div className="divide-y divide-white/[0.05]">
               {employees.map((emp) => (
                 <div key={emp.id} onClick={() => setSelectedEmployee(emp)} className="p-8 flex items-center justify-between hover:bg-white/[0.03] transition-all cursor-pointer group">
                   <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-xl font-black italic text-emerald-500">{emp.full_name.charAt(0)}</div>
                      <div>
                         <h4 className="text-xl font-black uppercase tracking-tight">{emp.full_name}</h4>
                         <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{emp.role}</p>
                      </div>
                   </div>
                   <div className="flex gap-12 items-center">
                      <div className="text-right">
                        <p className="text-[7px] font-black text-zinc-600 uppercase tracking-widest mb-1">Pôle</p>
                        <p className="text-[11px] font-bold uppercase">{emp.department}</p>
                      </div>
                      <ChevronRight className="text-zinc-700 group-hover:text-emerald-500" />
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* MODAL FICHE TECHNIQUE AVEC MISSIONS */}
        {selectedEmployee && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 backdrop-blur-3xl bg-black/80 animate-in fade-in zoom-in duration-300">
            <div className="w-full max-w-5xl bg-[#080808] border border-white/10 rounded-[4rem] overflow-hidden shadow-2xl relative">
               <button onClick={() => setSelectedEmployee(null)} className="absolute top-10 right-10 p-4 bg-white/5 rounded-full hover:bg-white/10 transition-all z-50">
                 <X size={24} />
               </button>

               <div className="grid grid-cols-12 h-full">
                  <div className="col-span-4 bg-zinc-900/50 p-12 border-r border-white/10">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-emerald-500 flex items-center justify-center text-black text-5xl font-black italic mb-8 shadow-lg">
                      {selectedEmployee.full_name.charAt(0)}
                    </div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-4">{selectedEmployee.full_name}</h2>
                    <p className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em] mb-10">{selectedEmployee.role}</p>
                    
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5 mb-6">
                        <p className="text-[8px] font-black text-zinc-500 uppercase mb-2">Performance Aura</p>
                        <div className="flex items-end gap-3">
                           <span className="text-4xl font-black italic">{selectedEmployee.aura}</span>
                           <div className="flex-1 h-1.5 bg-zinc-800 rounded-full mb-2 overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${selectedEmployee.aura}%` }}></div>
                           </div>
                        </div>
                    </div>
                  </div>

                  <div className="col-span-8 p-12 flex flex-col">
                     <div className="flex-1">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-6 flex items-center gap-2">
                           <History size={14} className="text-blue-500" /> Historique des Missions Terminées
                        </h3>
                        
                        <div className="space-y-4 mb-10">
                           {selectedEmployee.missions && selectedEmployee.missions.length > 0 ? (
                             selectedEmployee.missions.map((m: any, idx: number) => (
                               <div key={idx} className="flex items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-2xl group hover:border-emerald-500/30 transition-all">
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><CheckCircle2 size={18} /></div>
                                     <div>
                                        <p className="text-sm font-bold uppercase tracking-tight">{m.title}</p>
                                        <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{m.date}</p>
                                     </div>
                                  </div>
                                  <span className="px-4 py-1.5 bg-zinc-900 border border-white/10 rounded-full text-[8px] font-black uppercase text-zinc-400 group-hover:text-emerald-500">Archives</span>
                               </div>
                             ))
                           ) : (
                             <div className="p-10 border border-dashed border-white/10 rounded-3xl text-center">
                                <p className="text-[10px] font-black text-zinc-600 uppercase">Aucune mission archivée pour cet agent</p>
                             </div>
                           )}
                        </div>
                     </div>

                     <div className="flex gap-4 pt-8 border-t border-white/10">
                        <button className="flex-1 py-6 bg-white text-black rounded-3xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all">
                           <Download size={18} /> Télécharger CV
                        </button>
                        <button className="flex-1 py-6 bg-white/5 border border-white/10 rounded-3xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all">
                           <FileText size={18} /> Missions en cours
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

      </main>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #10b981; border-radius: 20px; }
        .text-shadow-glow { text-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
      `}</style>
    </div>
  );
}
