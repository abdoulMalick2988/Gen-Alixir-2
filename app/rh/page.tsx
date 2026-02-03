"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../components/WakandaGuard";

/** * ANALYTIQUE ENGINE - CONFIGURATION MULTI-GRAPHIQUES ROBUSTE
 * Optimisé pour affichage VR (densité d'information élevée)
 */
import { 
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, 
  Tooltip, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, 
  Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';

/** * ICONSET - CORRIGÉ (Suppression de VenusMars)
 */
import { 
  Users, Wallet, Activity, Database, Cpu, ShieldCheck, 
  FileText, Download, X, ChevronRight, Fingerprint, 
  History, CheckCircle2, Menu, Zap, TrendingUp, 
  Briefcase, Clock, Target, Scale, UserPlus
} from 'lucide-react';

// --- DESIGN SYSTEM : PALETTE NEON & DARK MODE ---
const THEME = {
  emerald: "#10b981",
  blue: "#3b82f6",
  violet: "#8b5cf6",
  amber: "#f59e0b",
  rose: "#f43f5e",
  zinc: "#71717a",
  glass: "rgba(255, 255, 255, 0.02)",
  border: "rgba(255, 255, 255, 0.08)"
};

const CHART_COLORS = [THEME.emerald, THEME.blue, THEME.violet, THEME.amber, THEME.rose];

// --- INTERFACES STRUCTURELLES ---
interface Mission {
  title: string;
  date: string;
  impact: number;
}

interface Employee {
  id: string;
  full_name: string;
  department: string;
  gender: 'M' | 'F';
  contract: 'CDI' | 'CDD' | 'Freelance';
  seniority: number;
  aura: number;
  pco: number; // Point de coût horaire
  role: string;
  missions: Mission[];
}

export default function RHIntelAdvanced() {
  const user = useAuth();
  const router = useRouter();
  
  // États de navigation et sélection
  const [view, setView] = useState<'stats' | 'list'>('stats');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  // --- DATASET ROBUSTE (MOCK DATA) ---
  const employees: Employee[] = useMemo(() => [
    { id: '1', full_name: 'Malick Thiam', department: 'TECH', gender: 'M', contract: 'CDI', seniority: 5, aura: 95, pco: 85, role: 'Lead Dev', missions: [{title: 'Cloud Core', date: '2026', impact: 98}] },
    { id: '2', full_name: 'Awa Diop', department: 'MARKETING', gender: 'F', contract: 'CDI', seniority: 3, aura: 82, pco: 62, role: 'Brand Mgr', missions: [{title: 'Global Launch', date: '2026', impact: 85}] },
    { id: '3', full_name: 'Jean-Luc Moukin', department: 'TECH', gender: 'M', contract: 'CDD', seniority: 1, aura: 78, pco: 70, role: 'Fullstack', missions: [] },
    { id: '4', full_name: 'Fiona Uwimana', department: 'OPS', gender: 'F', contract: 'CDI', seniority: 4, aura: 88, pco: 90, role: 'COO', missions: [] },
    { id: '5', full_name: 'Omar Sy', department: 'SECURITY', gender: 'M', contract: 'CDI', seniority: 6, aura: 98, pco: 95, role: 'CSO', missions: [] },
    { id: '6', full_name: 'Sarah Kone', department: 'RH', gender: 'F', contract: 'Freelance', seniority: 2, aura: 85, pco: 65, role: 'Talent Scout', missions: [] },
    { id: '7', full_name: 'Eric Gila', department: 'TECH', gender: 'M', contract: 'CDI', seniority: 2, aura: 80, pco: 75, role: 'DevOps', missions: [] },
    { id: '8', full_name: 'David Bukuru', department: 'OPS', gender: 'M', contract: 'CDD', seniority: 1, aura: 72, pco: 55, role: 'Analyst', missions: [] },
  ], []);

  // --- ANALYTICS ENGINE (CALCULS COMPLEXES) ---
  const analytics = useMemo(() => {
    // 1. Genre
    const male = employees.filter(e => e.gender === 'M').length;
    const female = employees.filter(e => e.gender === 'F').length;
    
    // 2. Contrats
    const contractsMap = employees.reduce((acc: any, curr) => {
      acc[curr.contract] = (acc[curr.contract] || 0) + 1;
      return acc;
    }, {});

    // 3. Performance Radar (Moyenne par département)
    const depts = Array.from(new Set(employees.map(e => e.department)));
    const radarData = depts.map(d => {
      const group = employees.filter(e => e.department === d);
      const avgAura = group.reduce((sum, e) => sum + e.aura, 0) / group.length;
      return { subject: d, A: avgAura, fullMark: 100 };
    });

    // 4. Masse Salariale
    const totalPCO = employees.reduce((acc, curr) => acc + (curr.pco * 168), 0);

    return {
      gender: [{ name: 'M', value: male }, { name: 'F', value: female }],
      contracts: Object.keys(contractsMap).map(k => ({ name: k, value: contractsMap[k] })),
      radar: radarData,
      perf: employees.map(e => ({ name: e.full_name.split(' ')[0], aura: e.aura, cost: e.pco })),
      seniority: employees.sort((a,b) => a.seniority - b.seniority).map(e => ({ name: e.full_name.split(' ')[0], value: e.seniority })),
      totalPCO
    };
  }, [employees]);

  const filteredList = employees.filter(e => 
    e.full_name.toLowerCase().includes(search.toLowerCase()) || 
    e.department.toLowerCase().includes(search.toLowerCase())
  );

  // --- UI PARTIALS ---
  const Card = ({ children, title, icon: Icon, className = "" }: any) => (
    <div className={`bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-6 flex flex-col hover:border-white/20 transition-all ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
          {Icon && <Icon size={16} />}
        </div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">{title}</h3>
      </div>
      <div className="flex-1 min-h-[180px]">{children}</div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020202] text-white overflow-hidden font-sans">
      <div className="hidden lg:block h-full border-r border-white/5">
        <Sidebar />
      </div>

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scroll relative">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-10 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              <h1 className="text-4xl lg:text-6xl font-black italic uppercase tracking-tighter leading-none">
                RH <span className="text-emerald-500">INTEL</span>
              </h1>
            </div>
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
               <Fingerprint size={12} className="text-emerald-500" /> Interface de Pilotage • v4.2
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
             <button 
              onClick={() => setView(view === 'stats' ? 'list' : 'stats')}
              className="flex-1 md:flex-none px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all"
             >
               {view === 'stats' ? 'Afficher Liste' : 'Retour Analytics'}
             </button>
             <button onClick={() => router.push('/rh/workspace')} className="flex-1 md:flex-none px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all shadow-xl">
               <Zap size={14} /> Workspace
             </button>
          </div>
        </header>

        {view === 'stats' ? (
          <div className="grid grid-cols-12 gap-5 animate-in fade-in duration-700">
            
            {/* KPI TOP ROW */}
            <div className="col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-5 mb-2">
              {[
                { label: "Agents", val: employees.length, icon: Users, c: THEME.blue },
                { label: "Budget Est.", val: `${(analytics.totalPCO/1000).toFixed(1)}k€`, icon: Wallet, c: THEME.emerald },
                { label: "Aura Global", val: "88.4%", icon: Activity, c: THEME.violet },
                { label: "Ancienneté", val: "3.2 ans", icon: Clock, c: THEME.amber },
              ].map((k, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl flex items-center justify-between group">
                  <div>
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block mb-1">{k.label}</span>
                    <span className="text-2xl font-black italic">{k.val}</span>
                  </div>
                  <k.icon size={20} style={{ color: k.c }} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>

            {/* GRAPHIQUE 1 : PERFORMANCE & COUT */}
            <Card title="Efficience : Aura vs Coût" icon={Target} className="col-span-12 lg:col-span-8">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={analytics.perf}>
                    <defs>
                      <linearGradient id="auraGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={THEME.emerald} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={THEME.emerald} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                    <XAxis dataKey="name" stroke="#444" fontSize={9} fontWeight="bold" axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #222', borderRadius: '12px'}} />
                    <Area type="monotone" dataKey="aura" fill="url(#auraGrad)" stroke={THEME.emerald} strokeWidth={3} />
                    <Bar dataKey="cost" barSize={12} fill={THEME.blue} radius={[6, 6, 0, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* GRAPHIQUE 2 : GENRE (PARITÉ) */}
            <Card title="Distribution Genre" icon={Scale} className="col-span-12 md:col-span-6 lg:col-span-4">
              <div className="h-[280px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.gender} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">
                      <Cell fill={THEME.blue} stroke="none" />
                      <Cell fill={THEME.rose} stroke="none" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <p className="text-[10px] font-black text-zinc-600 uppercase">Ratio</p>
                   <p className="text-xl font-black italic">50/50</p>
                </div>
              </div>
            </Card>

            {/* GRAPHIQUE 3 : RADAR PÔLES */}
            <Card title="Potentiel par Pôle" icon={Cpu} className="col-span-12 md:col-span-6 lg:col-span-4">
               <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={analytics.radar}>
                      <PolarGrid stroke="rgba(255,255,255,0.05)" />
                      <PolarAngleAxis dataKey="subject" tick={{fill: '#888', fontSize: 9, fontWeight: 'bold'}} />
                      <Radar name="Force" dataKey="A" stroke={THEME.emerald} fill={THEME.emerald} fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
               </div>
            </Card>

            {/* GRAPHIQUE 4 : CONTRATS */}
            <Card title="Structure Contractuelle" icon={Briefcase} className="col-span-12 md:col-span-6 lg:col-span-4">
               <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analytics.contracts} innerRadius={0} outerRadius={80} dataKey="value" labelLine={false}>
                        {analytics.contracts.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % 5]} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />)}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px'}} />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
            </Card>

            {/* GRAPHIQUE 5 : ANCIENNETÉ */}
            <Card title="Courbe d'Expérience" icon={History} className="col-span-12 md:col-span-6 lg:col-span-4">
               <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.seniority}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                      <XAxis dataKey="name" hide />
                      <Tooltip />
                      <Area type="stepBefore" dataKey="value" stroke={THEME.amber} fill={THEME.amber} fillOpacity={0.2} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </Card>

          </div>
        ) : (
          /* VUE LISTE AVANCÉE */
          <div className="bg-white/[0.02] border border-white/10 rounded-[3rem] overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
            <div className="p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 bg-white/[0.01]">
               <div className="flex items-center gap-4">
                  <UserPlus className="text-emerald-500" />
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter">Registre des Agents</h2>
               </div>
               <input 
                type="text" 
                placeholder="RECHERCHER (NOM, PÔLE...)" 
                className="w-full md:w-80 bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-[10px] font-bold tracking-widest outline-none focus:border-emerald-500 transition-all uppercase"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
               />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 p-6 gap-5">
               {filteredList.map((emp) => (
                 <div key={emp.id} onClick={() => setSelectedEmployee(emp)} className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={16} />
                   </div>
                   <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-2xl font-black italic text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
                      {emp.full_name.charAt(0)}
                   </div>
                   <h4 className="text-lg font-black uppercase tracking-tight mb-1">{emp.full_name}</h4>
                   <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-4">{emp.role}</p>
                   <div className="flex items-center justify-between border-t border-white/5 pt-4">
                      <span className="text-[10px] font-black text-emerald-500">{emp.aura}% Aura</span>
                      <span className="px-3 py-1 bg-white/5 rounded-full text-[7px] font-black uppercase text-zinc-400">{emp.contract}</span>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* MODAL FICHE TECHNIQUE */}
        {selectedEmployee && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-in zoom-in duration-300">
            <div className="w-full max-w-5xl bg-[#080808] border border-white/10 rounded-[4rem] overflow-hidden relative shadow-2xl">
               <button onClick={() => setSelectedEmployee(null)} className="absolute top-10 right-10 p-4 bg-white/5 rounded-full hover:bg-rose-500 transition-all">
                 <X size={24} />
               </button>
               <div className="grid grid-cols-1 lg:grid-cols-12">
                  <div className="lg:col-span-5 p-12 bg-zinc-900/30 border-r border-white/5">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-emerald-500 flex items-center justify-center text-black text-5xl font-black italic mb-8 shadow-2xl">
                      {selectedEmployee.full_name.charAt(0)}
                    </div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-3">{selectedEmployee.full_name}</h2>
                    <p className="text-emerald-500 font-black text-[11px] uppercase tracking-[0.4em] mb-12">Expertise : {selectedEmployee.department}</p>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                          <p className="text-[8px] font-black text-zinc-600 uppercase mb-2">Performance</p>
                          <span className="text-4xl font-black italic text-emerald-500">{selectedEmployee.aura}</span>
                       </div>
                       <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                          <p className="text-[8px] font-black text-zinc-600 uppercase mb-2">Expérience</p>
                          <span className="text-4xl font-black italic">{selectedEmployee.seniority}y</span>
                       </div>
                    </div>
                  </div>
                  <div className="lg:col-span-7 p-12 flex flex-col justify-between">
                     <div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-8 flex items-center gap-3 italic">
                           <History size={16} className="text-blue-500" /> Historique des Missions
                        </h3>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scroll pr-4">
                           {selectedEmployee.missions.map((m, i) => (
                             <div key={i} className="p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] flex items-center justify-between group hover:border-emerald-500/40 transition-all">
                                <div className="flex items-center gap-6">
                                   <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><CheckCircle2 size={20} /></div>
                                   <div><p className="text-base font-black uppercase">{m.title}</p><p className="text-[9px] font-bold text-zinc-600 uppercase mt-1">Impact Score: {m.impact}%</p></div>
                                </div>
                                <span className="text-[10px] font-black text-zinc-500 italic">{m.date}</span>
                             </div>
                           ))}
                        </div>
                     </div>
                     <div className="flex gap-4 mt-12">
                        <button className="flex-1 py-6 bg-white text-black rounded-3xl font-black uppercase text-[11px] tracking-widest hover:bg-emerald-500 transition-all"><Download className="inline-block mr-2" size={18} /> Dossier Complet</button>
                        <button className="flex-1 py-6 bg-white/5 border border-white/10 rounded-3xl font-black uppercase text-[11px] tracking-widest hover:bg-white hover:text-black transition-all">Mettre à Jour</button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

      </main>

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #10b981; border-radius: 20px; }
        .text-shadow-glow { text-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
      `}</style>
    </div>
  );
}
