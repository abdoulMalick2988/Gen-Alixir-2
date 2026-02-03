"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../components/WakandaGuard";

/** * ANALYTIQUE ENGINE - CONFIGURATION HAUTE PRÉCISION 
 * Utilisation de Recharts pour la visualisation de données RH
 */
import { 
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, 
  Tooltip, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

/** * ICONSET - SYSTÈME NEON UI 
 */
import { 
  Users, Wallet, Activity, Layout, Database, 
  Cpu, ShieldCheck, FileText, Download, X, 
  ChevronRight, Fingerprint, History, CheckCircle2, 
  Menu, Leaf, Zap, TrendingUp, Briefcase
} from 'lucide-react';

// --- SYSTÈME DE CONSTANTES ET THEME ---
const THEME = { 
  emerald: "#10b981", 
  blue: "#3b82f6", 
  gold: "#fbbf24", 
  rose: "#f43f5e",
  slate: "#64748b",
  glass: "rgba(255, 255, 255, 0.04)",
  border: "rgba(255, 255, 255, 0.1)"
};
const CHART_COLORS = [THEME.emerald, THEME.blue, "#8b5cf6", THEME.gold, "#ec4899"];

// --- TYPES DE DONNÉES ---
interface Mission {
  title: string;
  date: string;
  status: 'Terminé' | 'En cours';
}

interface Employee {
  id: string;
  full_name: string;
  department: string;
  manager: string;
  aura: number;
  pco: string; // Coût horaire ou point d'indice
  role: string;
  bio: string;
  missions: Mission[];
  performanceHistory: { month: string; score: number }[];
}

export default function RHAnalyticsRobust() {
  const user = useAuth();
  const router = useRouter();

  // --- 1. ÉTATS DE L'INTERFACE ---
  const [view, setView] = useState<'stats' | 'list'>('stats');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [ecoMode, setEcoMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // --- 2. JEU DE DONNÉES ROBUSTE (MOCK DATA) ---
  const initialData: Employee[] = useMemo(() => [
    { 
      id: '1', full_name: 'Malick Thiam', department: 'TECHNIQUE', manager: 'Admin', aura: 95, pco: '8.5', role: 'Lead Developer', 
      bio: 'Expert en architecture Cloud et cybersécurité. Leader technique du projet Wakanda.', 
      missions: [
        { title: 'Migration AWS Region West', date: 'Jan 2026', status: 'Terminé' },
        { title: 'Audit Sécurité Q4', date: 'Déc 2025', status: 'Terminé' },
        { title: 'Implémentation CI/CD', date: 'Oct 2025', status: 'Terminé' }
      ],
      performanceHistory: [{ month: 'Oct', score: 88 }, { month: 'Nov', score: 92 }, { month: 'Dec', score: 95 }]
    },
    { 
      id: '2', full_name: 'Awa Diop', department: 'MARKETING', manager: 'Sarah Kone', aura: 82, pco: '6.2', role: 'Brand Manager', 
      bio: 'Spécialiste en acquisition de talents et croissance organique sur les marchés émergents.',
      missions: [
        { title: 'Lancement Campagne Horizon', date: 'Jan 2026', status: 'Terminé' },
        { title: 'Refonte Identité Visuelle', date: 'Sept 2025', status: 'Terminé' }
      ],
      performanceHistory: [{ month: 'Oct', score: 75 }, { month: 'Nov', score: 80 }, { month: 'Dec', score: 82 }]
    },
    { 
      id: '3', full_name: 'Jean-Luc Moukin', department: 'TECHNIQUE', manager: 'Malick Thiam', aura: 78, pco: '7.0', role: 'Fullstack Dev', 
      bio: 'Passionné par React et les interfaces immersives.',
      missions: [{ title: 'Développement Dashboard RH', date: 'Fév 2026', status: 'Terminé' }],
      performanceHistory: [{ month: 'Dec', score: 70 }, { month: 'Jan', score: 78 }]
    },
    { 
      id: '4', full_name: 'Fiona Uwimana', department: 'MANAGEMENT', manager: 'Direction', aura: 88, pco: '9.0', role: 'Directrice Opérations', 
      bio: 'Optimisation des processus internes et gestion stratégique des ressources.',
      missions: [{ title: 'Plan de Restructuration Q1', date: 'Jan 2026', status: 'Terminé' }],
      performanceHistory: [{ month: 'Dec', score: 85 }, { month: 'Jan', score: 88 }]
    },
    { 
      id: '5', full_name: 'Omar Sy', department: 'SÉCURITÉ', manager: 'Direction', aura: 98, pco: '9.5', role: 'Chief Security Officer', 
      bio: 'Responsable de la protection des actifs numériques et physiques de l\'organisation.',
      missions: [{ title: 'Protocole Défense Grid', date: 'Jan 2026', status: 'Terminé' }],
      performanceHistory: [{ month: 'Nov', score: 96 }, { month: 'Dec', score: 98 }]
    },
    { 
      id: '6', full_name: 'Sarah Kone', department: 'RH', manager: 'Direction', aura: 85, pco: '6.5', role: 'Talent Acquisition', 
      bio: 'Développement de la culture d\'entreprise et recrutement stratégique.',
      missions: [{ title: 'Recrutement Tech 2026', date: 'Fév 2026', status: 'Terminé' }],
      performanceHistory: [{ month: 'Dec', score: 82 }, { month: 'Jan', score: 85 }]
    }
  ], []);

  const [employees] = useState<Employee[]>(initialData);

  // --- 3. MOTEUR DE CALCULS (MÉMOÏSÉ POUR LA PERFORMANCE) ---
  const stats = useMemo(() => {
    const totalPayroll = employees.reduce((acc, curr) => acc + ((parseFloat(curr.pco) || 0) * 190), 0);
    
    const deptsRaw = employees.reduce((acc: any, curr) => {
      acc[curr.department] = (acc[curr.department] || 0) + 1;
      return acc;
    }, {});

    const pieData = Object.keys(deptsRaw).map(name => ({ name, value: deptsRaw[name] }));
    
    const chartData = employees.map(e => ({ 
      name: e.full_name.split(' ')[0], 
      aura: e.aura, 
      pco: (parseFloat(e.pco) || 0) * 10 
    }));

    return { totalPayroll, pieData, chartData, deptCount: Object.keys(deptsRaw).length };
  }, [employees]);

  // Filtrage de la liste
  const filteredEmployees = useMemo(() => {
    return employees.filter(e => 
      e.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [employees, searchQuery]);

  // --- 4. LOGIQUE DE STYLE DYNAMIQUE ---
  const glassEffect = ecoMode 
    ? "bg-[#0a0a0a] border border-zinc-800" 
    : "bg-white/[0.03] border border-white/10 backdrop-blur-xl";

  const cardHover = ecoMode
    ? "hover:bg-zinc-900"
    : "hover:bg-white/[0.05] hover:border-white/20";

  // --- 5. COMPOSANTS DE L'INTERFACE ---
  
  // Vue Statistiques
  const StatsView = () => (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Effectif Total", val: employees.length, sub: "Agents actifs", icon: Users, col: THEME.blue },
          { label: "Masse Salariale", val: `${(stats.totalPayroll/1000).toFixed(1)}k€`, sub: "Estimation mensuelle", icon: Wallet, col: THEME.emerald },
          { label: "Départements", val: stats.deptCount, sub: "Unités structurées", icon: Database, col: THEME.gold }
        ].map((kpi, i) => (
          <div key={i} className={`${glassEffect} p-8 rounded-[2.5rem] flex items-center justify-between group`}>
            <div>
              <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">{kpi.label}</p>
              <h3 className="text-4xl font-black italic uppercase tracking-tighter">{kpi.val}</h3>
              <p className="text-[10px] text-zinc-600 mt-1">{kpi.sub}</p>
            </div>
            <div className={`p-5 rounded-3xl bg-black/40 border border-white/5`} style={{ color: kpi.col }}>
              <kpi.icon size={28} />
            </div>
          </div>
        ))}
      </div>

      {/* Graphique Central */}
      <div className={`${glassEffect} p-10 rounded-[3.5rem] shadow-2xl`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <h3 className="text-[10px] font-black uppercase italic tracking-[0.4em] flex items-center gap-3">
            <Zap size={16} className="text-emerald-500" /> Analyse des performances vs Coût
          </h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-[8px] font-bold uppercase">Aura</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-[8px] font-bold uppercase">Charge</span></div>
          </div>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="name" stroke="#555" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 110]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '15px', fontSize: '12px' }}
                itemStyle={{ fontWeight: 'bold', textTransform: 'uppercase' }}
              />
              <Area 
                isAnimationActive={!ecoMode}
                type="monotone" 
                dataKey="aura" 
                fill="url(#colorAura)" 
                stroke={THEME.emerald} 
                strokeWidth={4} 
              />
              <Bar 
                isAnimationActive={!ecoMode}
                dataKey="pco" 
                barSize={15} 
                fill={THEME.blue} 
                radius={[10, 10, 0, 0]} 
              />
              <defs>
                <linearGradient id="colorAura" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={THEME.emerald} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={THEME.emerald} stopOpacity={0}/>
                </linearGradient>
              </defs>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  // Vue Liste
  const ListView = () => (
    <div className={`${glassEffect} rounded-[3rem] overflow-hidden animate-in slide-in-from-bottom-8 duration-500`}>
      <div className="p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">Répertoire Global</h2>
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="RECHERCHER UN AGENT OU PÔLE..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-[10px] font-bold tracking-widest focus:border-emerald-500 outline-none transition-all uppercase"
          />
        </div>
      </div>
      <div className="divide-y divide-white/5">
        {filteredEmployees.map((emp) => (
          <div 
            key={emp.id} 
            onClick={() => setSelectedEmployee(emp)}
            className={`p-8 flex flex-col md:flex-row items-center justify-between transition-all cursor-pointer group ${cardHover}`}
          >
            <div className="flex items-center gap-8 w-full md:w-auto">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-2xl font-black italic text-emerald-500 group-hover:scale-110 transition-transform">
                {emp.full_name.charAt(0)}
              </div>
              <div>
                <h4 className="text-2xl font-black uppercase tracking-tight">{emp.full_name}</h4>
                <div className="flex items-center gap-3 mt-1 text-zinc-500">
                  <Briefcase size={12} className="text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{emp.role}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-16 mt-6 md:mt-0 w-full md:w-auto justify-between md:justify-end items-center">
              <div className="text-right">
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Pôle opérationnel</p>
                <p className="text-sm font-bold uppercase">{emp.department}</p>
              </div>
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all">
                <ChevronRight size={20} className="group-hover:text-black" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col lg:flex-row h-screen ${ecoMode ? 'bg-black' : 'bg-[#020202]'} text-white overflow-hidden font-sans transition-colors duration-500`}>
      {/* Sidebar Responsive */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-[200] transition-transform duration-500 h-full`}>
        <Sidebar />
      </div>

      <main className="flex-1 p-4 lg:p-10 overflow-y-auto custom-scroll relative">
        
        {/* TOP NAVIGATION HEADER */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-4 bg-white/5 rounded-2xl border border-white/10">
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-4xl lg:text-7xl font-black italic uppercase tracking-tighter leading-none">
                RH <span className="text-emerald-500 text-shadow-glow">INTEL</span>
              </h1>
              <p className="hidden md:flex text-[9px] font-bold text-zinc-500 uppercase tracking-[0.4em] mt-3 items-center gap-3 italic">
                 <Cpu size={14} className="text-emerald-500" /> Wakanda OS v4.0.2 • Flux {ecoMode ? 'Économique' : 'Standard'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {/* Toggle ECO Mode */}
             <button 
                onClick={() => setEcoMode(!ecoMode)} 
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all ${ecoMode ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'bg-white/5 border-white/10 text-zinc-400'}`}
             >
                <Leaf size={18} className={ecoMode ? 'animate-pulse' : ''} />
                <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">ECO</span>
             </button>

             {view === 'list' ? (
               <button onClick={() => setView('stats')} className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                 Retour Analytics
               </button>
             ) : (
               <button onClick={() => setView('list')} className="px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all">
                 Répertoire
               </button>
             )}
          </div>
        </header>

        {/* --- CONTENT AREA --- */}
        {view === 'stats' ? <StatsView /> : <ListView />}

        {/* --- FOOTER BANNER --- */}
        <div className={`mt-12 p-10 ${glassEffect} rounded-[3.5rem] flex flex-col md:flex-row items-center justify-between gap-8`}>
          <div className="flex items-center gap-8">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h4 className="text-2xl font-black italic uppercase tracking-tighter leading-none">Accès Sécurité Alpha</h4>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2">Le registre est chiffré et audité en temps réel.</p>
            </div>
          </div>
          <button onClick={() => router.push('/rh/workspace')} className="group flex items-center gap-4 px-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
            Dashboard Complet <TrendingUp size={16} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        {/* --- MODAL FICHE TECHNIQUE (INTERACTIF) --- */}
        {selectedEmployee && (
          <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 lg:p-8 ${ecoMode ? 'bg-black' : 'bg-black/90 backdrop-blur-3xl'} animate-in fade-in duration-300`}>
            <div className={`w-full max-w-5xl bg-[#080808] border border-white/10 rounded-[4rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] relative`}>
               <button onClick={() => setSelectedEmployee(null)} className="absolute top-10 right-10 p-4 bg-white/5 rounded-full hover:bg-rose-500 hover:text-white transition-all z-50">
                 <X size={24} />
               </button>

               <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
                  {/* Colonne Gauche : Identité */}
                  <div className="lg:col-span-4 bg-zinc-900/30 p-12 border-b lg:border-b-0 lg:border-r border-white/10">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-emerald-500 flex items-center justify-center text-black text-5xl font-black italic mb-10 shadow-lg">
                      {selectedEmployee.full_name.charAt(0)}
                    </div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-4">{selectedEmployee.full_name}</h2>
                    <p className="text-emerald-500 font-black text-[11px] uppercase tracking-[0.4em] mb-12">{selectedEmployee.role}</p>
                    
                    <div className="space-y-4">
                       <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                          <p className="text-[9px] font-black text-zinc-500 uppercase mb-3 tracking-widest italic">Aura Index</p>
                          <div className="flex items-end gap-3">
                             <span className="text-5xl font-black italic">{selectedEmployee.aura}</span>
                             <div className="flex-1 h-2 bg-zinc-800 rounded-full mb-3 overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${selectedEmployee.aura}%` }}></div>
                             </div>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                             <p className="text-[7px] font-black text-zinc-600 uppercase mb-1">Manager</p>
                             <p className="text-[10px] font-bold uppercase text-blue-400">{selectedEmployee.manager}</p>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                             <p className="text-[7px] font-black text-zinc-600 uppercase mb-1">Unité</p>
                             <p className="text-[10px] font-bold uppercase">{selectedEmployee.department}</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Colonne Droite : Missions et Actions */}
                  <div className="lg:col-span-8 p-12 flex flex-col justify-between overflow-y-auto max-h-[80vh]">
                     <div>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-8 flex items-center gap-3 italic">
                           <History size={16} className="text-blue-500" /> Missions Archivées
                        </h3>
                        
                        <div className="space-y-4 mb-12">
                           {selectedEmployee.missions.map((m, idx) => (
                             <div key={idx} className="flex items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] group hover:border-emerald-500/40 transition-all">
                                <div className="flex items-center gap-6">
                                   <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                      <CheckCircle2 size={20} />
                                   </div>
                                   <div>
                                      <p className="text-base font-black uppercase tracking-tight">{m.title}</p>
                                      <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{m.date}</p>
                                   </div>
                                </div>
                                <span className="px-5 py-2 bg-zinc-900 border border-white/10 rounded-full text-[9px] font-black uppercase text-zinc-400 italic">Terminé</span>
                             </div>
                           ))}
                        </div>

                        <div className={`${glassEffect} p-8 rounded-[2.5rem] italic text-zinc-400 text-sm leading-relaxed`}>
                           "{selectedEmployee.bio}"
                        </div>
                     </div>

                     <div className="flex flex-col sm:flex-row gap-4 mt-12">
                        <button className="flex-1 py-6 bg-white text-black rounded-3xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-500 hover:scale-[1.02] transition-all">
                           <Download size={20} /> Dossier PDF Agent
                        </button>
                        <button className="flex-1 py-6 bg-white/5 border border-white/10 rounded-3xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all">
                           <FileText size={20} /> Missions en cours
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>

      {/* --- DESIGN SYSTEM GLOBAL --- */}
      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 20px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #10b981; }
        .text-shadow-glow { text-shadow: 0 0 25px rgba(16, 185, 129, 0.5); }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}
