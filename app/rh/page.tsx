"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../components/WakandaGuard";

/** * RECHARTS ENGINE - GESTION DES FLUX ANALYTIQUES */
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, ComposedChart
} from 'recharts';

/** * ICONSET - WAKANDA UI */
import { 
  Users, Wallet, Activity, Search, ChevronRight, X, Layout, 
  CheckCircle2, Clock, ListTodo, Briefcase, Save, MessageSquare, 
  ShieldCheck, Zap, TrendingUp, Target, Award, RefreshCcw,
  Star, History, Calendar, User, ArrowRightCircle, Terminal,
  Cpu, Database, ShieldAlert, Fingerprint, Layers
} from 'lucide-react';

// --- DESIGN SYSTEM : ECODREUM NEON DARK ---
const THEME = {
  emerald: "#10b981",
  blue: "#3b82f6",
  gold: "#FFD700",
  rose: "#f43f5e",
  zinc: "#71717a",
  bg: "#020202"
};

const CHART_PALETTE = [THEME.emerald, THEME.blue, "#8b5cf6", "#fbbf24", "#f43f5e"];

// --- SOUS-COMPOSANT : PLAQUE DORÉE CHEF ---
const GoldenBadge = ({ name }: { name: string }) => (
  <div className="relative group">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-yellow-200 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
    <div className="relative flex items-center gap-3 px-6 py-3 bg-black border border-yellow-500/30 rounded-xl shadow-2xl">
      <Star size={14} className="text-yellow-500 fill-yellow-500 animate-pulse" />
      <div className="flex flex-col">
        <span className="text-[7px] font-black text-yellow-500/70 uppercase tracking-[0.3em]">Directeur de Pôle</span>
        <span className="text-[10px] font-black text-white uppercase italic tracking-wider">{name}</span>
      </div>
    </div>
  </div>
);

// --- SOUS-COMPOSANT : KPI CARD ---
const CommandKPI = ({ title, value, trend, icon: Icon, color }: any) => (
  <div className="relative p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden group hover:bg-white/[0.04] transition-all duration-700">
    <div className={`absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-700`}>
      <Icon size={120} />
    </div>
    <div className="relative z-10">
      <div className="p-3 bg-white/5 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-500" style={{ color }}>
        <Icon size={20} />
      </div>
      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-1">{title}</p>
      <h2 className="text-4xl font-black italic tracking-tighter mb-2">{value}</h2>
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-bold text-emerald-500 px-2 py-0.5 bg-emerald-500/10 rounded tracking-widest">{trend}</span>
        <span className="text-[8px] font-bold text-zinc-600 uppercase">Live Intel</span>
      </div>
    </div>
  </div>
);

// --- COMPOSANT PRINCIPAL (600+ LIGNES POTENTIELLES AVEC STYLE) ---
export default function RHCommandMaster() {
  const user = useAuth();
  
  // -- ÉTATS DE DONNÉES --
  const [employees, setEmployees] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // -- ÉTATS D'INTERFACE --
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'EN_COURS' | 'TERMINEE'>('EN_COURS');
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 1. RÉCUPÉRATION DES DONNÉES BRUTES
  const fetchSecureData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Staff filtré par partenaire ou admin
      let query = supabase.from('staff').select('*').order('full_name');
      if (user.role !== 'ADMIN') query = query.eq('partner_id', user.id);
      
      const { data: emps, error: err1 } = await query;
      const { data: tks, error: err2 } = await supabase.from('tasks').select('*');
      
      if (err1) throw err1;
      setEmployees(emps || []);
      setTasks(tks || []);
    } catch (e) {
      console.error("DATA_ACCESS_DENIED:", e);
    } finally {
      setTimeout(() => setLoading(false), 1000); // Animation de chargement
    }
  }, [user]);

  useEffect(() => { fetchSecureData(); }, [fetchSecureData]);

  // 2. MOTEUR ANALYTIQUE (ANTI-NAN)
  const stats = useMemo(() => {
    const totalPayroll = employees.reduce((acc, curr) => acc + ((parseFloat(curr.pco) || 0) * 190), 0);
    const depts = employees.reduce((acc: any, curr) => {
      const d = curr.department || 'GLOBAL';
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});
    
    const pieData = Object.keys(depts).map(name => ({ name: name.toUpperCase(), value: depts[name] }));
    const lineData = employees.slice(0, 12).map(e => ({ name: e.full_name?.split(' ')[0], aura: e.aura, cost: (parseFloat(e.pco)||0)*190 }));

    return { totalPayroll, pieData, lineData, deptCount: Object.keys(depts).length };
  }, [employees]);

  // 3. LOGIQUE MÉTIER
  const getChef = (dept: string) => {
    return employees.find(e => e.department === dept && (e.role?.includes('CHEF') || e.aura > 89));
  };

  const departments = Array.from(new Set(employees.map(e => e.department || "GÉNÉRAL")));

  // 4. ACTION : SYNC NOTES
  const syncNotes = async () => {
    if (!selectedEmp) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('staff').update({ notes: noteContent }).eq('id', selectedEmp.id);
      if (error) throw error;
      setEmployees(prev => prev.map(e => e.id === selectedEmp.id ? { ...e, notes: noteContent } : e));
      alert("DOSSIER SYNCHRONISÉ");
    } catch (e: any) { alert("ERREUR RESEAU: " + e.message); }
    finally { setIsSaving(false); }
  };

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center space-y-8">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-t-2 border-emerald-500 rounded-full animate-spin"></div>
        <div className="absolute inset-4 border-t-2 border-blue-500 rounded-full animate-spin reverse-spin"></div>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[1em] animate-pulse">Ecodreum Intel</p>
        <p className="text-[8px] text-zinc-600 font-bold uppercase mt-2">Initialisation des protocoles de sécurité...</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020202] text-white overflow-hidden font-sans selection:bg-emerald-500/30">
      <Sidebar />

      <main className="flex-1 p-10 overflow-y-auto custom-scroll relative">
        
        {/* --- DÉCORATIONS DE FOND (GHOST UI) --- */}
        <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none">
          <Terminal size={400} />
        </div>

        {/* --- TOP BAR --- */}
        <header className="flex justify-between items-end mb-16 relative z-10">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-zinc-400">
                <Fingerprint size={10} className="text-emerald-500" /> Session : {user?.username}
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-zinc-400">
                <ShieldCheck size={10} className="text-blue-500" /> Rank : {user?.role}
              </div>
            </div>
            <h1 className="text-8xl font-black italic uppercase tracking-tighter leading-none">
              RH <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-600">INTEL</span>
            </h1>
          </div>

          <div className="relative group">
            <button 
              onClick={() => setShowWorkspace(!showWorkspace)}
              className="flex items-center gap-4 px-10 py-5 bg-white text-black rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-emerald-500 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.05)] active:scale-95"
            >
              <Layers size={18} /> Espace de Travail
            </button>

            {showWorkspace && (
              <div className="absolute right-0 mt-6 w-80 bg-[#080808] border border-white/10 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.9)] z-[100] overflow-hidden backdrop-blur-3xl animate-in slide-in-from-top-4 duration-500">
                <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Secteurs Déployés</p>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scroll">
                  {departments.map(dept => (
                    <button 
                      key={dept}
                      onClick={() => { setSelectedDept(dept); setShowWorkspace(false); }}
                      className="w-full text-left px-8 py-5 text-[10px] font-black uppercase hover:bg-emerald-500 hover:text-black transition-all border-b border-white/[0.02] flex items-center justify-between group"
                    >
                      {dept} <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* --- KPI GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <CommandKPI title="Effectif" value={employees.length} trend="+2.4%" icon={Users} color={THEME.blue} />
          <CommandKPI title="Masse Salariale" value={`${(stats.totalPayroll / 1000).toFixed(1)}k€`} trend="Stable" icon={Wallet} color={THEME.emerald} />
          <CommandKPI title="Aura Node" value="84.2%" trend="+0.8%" icon={Zap} color={THEME.gold} />
          <CommandKPI title="Départements" value={stats.deptCount} trend="Actifs" icon={Database} color={THEME.rose} />
        </div>

        {/* --- ANALYTICS SECTION (DESIGNÉ POUR VR/LARGE) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          
          {/* GRAPHIQUE PRINCIPAL */}
          <div className="lg:col-span-8 bg-white/[0.01] border border-white/5 rounded-[4rem] p-12 relative overflow-hidden group">
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-sm font-black uppercase italic tracking-[0.2em] flex items-center gap-3">
                <TrendingUp size={20} className="text-emerald-500" /> Performance & Coût Flux
              </h3>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stats.lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#333" fontSize={10} fontWeight="bold" />
                  <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #333', borderRadius: '20px', fontSize: '10px'}} />
                  <Area type="monotone" dataKey="aura" fill={THEME.emerald} fillOpacity={0.05} stroke={THEME.emerald} strokeWidth={4} />
                  <Bar dataKey="cost" barSize={10} fill={THEME.blue} radius={[10, 10, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GRAPHIQUE CIRCULAIRE */}
          <div className="lg:col-span-4 bg-white/[0.01] border border-white/5 rounded-[4rem] p-12 flex flex-col items-center justify-center">
            <p className="text-[10px] font-black uppercase text-zinc-500 mb-8 tracking-widest text-center">Structure des Pôles</p>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.pieData} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                    {stats.pieData.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8 w-full">
              {stats.pieData.slice(0, 4).map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_PALETTE[i] }}></div>
                  <span className="text-[8px] font-black uppercase text-zinc-400">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- REGISTRE OPÉRATIONNEL --- */}
        <div className="bg-white/[0.01] border border-white/5 rounded-[4rem] overflow-hidden shadow-2xl mb-20">
          <div className="p-12 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Registre Agents</h2>
              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Données synchronisées en temps réel</p>
            </div>
            <button onClick={fetchSecureData} className="p-5 bg-white/5 rounded-2xl hover:bg-emerald-500 hover:text-black transition-all group">
              <RefreshCcw size={20} className="group-active:rotate-180 transition-transform duration-700" />
            </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-black/40 text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em] border-b border-white/5">
              <tr>
                <th className="p-10">Identité & Statut</th>
                <th className="p-10">Département</th>
                <th className="p-10">Aura Score</th>
                <th className="p-10 text-right">Masse Individuelle</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold">
              {employees.map((emp) => (
                <tr 
                  key={emp.id} 
                  onClick={() => { setSelectedEmp(emp); setNoteContent(emp.notes || ""); }}
                  className="border-b border-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer group"
                >
                  <td className="p-10 flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-emerald-500 text-xl font-black italic group-hover:scale-110 transition-transform duration-500">
                      {emp.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-lg font-black uppercase italic tracking-tighter group-hover:text-emerald-500 transition-colors">{emp.full_name}</p>
                      <p className="text-[9px] text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Agent Certifié
                      </p>
                    </div>
                  </td>
                  <td className="p-10 text-zinc-500 uppercase italic tracking-wider">{emp.department}</td>
                  <td className="p-10">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400" style={{ width: `${emp.aura}%` }}></div>
                      </div>
                      <span className="text-emerald-500 italic text-[11px]">{emp.aura}%</span>
                    </div>
                  </td>
                  <td className="p-10 text-right font-black italic text-lg">{((parseFloat(emp.pco)||0)*190).toLocaleString()} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- MODAL : ESPACE DE TRAVAIL --- */}
        {selectedDept && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[200] flex items-center justify-center p-8 animate-in zoom-in-95 duration-500">
            <div className="w-full max-w-7xl h-[90vh] bg-[#080808] border border-white/10 rounded-[5rem] flex flex-col relative overflow-hidden shadow-[0_0_150px_rgba(0,0,0,1)]">
              
              {/* HEADER MODAL */}
              <div className="p-16 border-b border-white/5 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-6 mb-4">
                    <h2 className="text-8xl font-black italic uppercase tracking-tighter leading-none">{selectedDept}</h2>
                    {getChef(selectedDept) && <GoldenBadge name={getChef(selectedDept)?.full_name} />}
                  </div>
                  <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.5em]">Command Center / Pôle Opérationnel</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex bg-white/5 p-2 rounded-2xl border border-white/5">
                    <button 
                      onClick={() => setTaskFilter('EN_COURS')}
                      className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase transition-all ${taskFilter === 'EN_COURS' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-zinc-600 hover:text-white'}`}
                    >
                      En Cours
                    </button>
                    <button 
                      onClick={() => setTaskFilter('TERMINEE')}
                      className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase transition-all ${taskFilter === 'TERMINEE' ? 'bg-blue-500 text-black shadow-lg shadow-blue-500/20' : 'text-zinc-600 hover:text-white'}`}
                    >
                      Terminées
                    </button>
                  </div>
                  <button onClick={() => setSelectedDept(null)} className="p-6 bg-white/5 rounded-[2rem] hover:bg-rose-500 transition-all active:scale-90"><X size={28}/></button>
                </div>
              </div>

              {/* CONTENU MODAL */}
              <div className="flex-1 overflow-hidden flex">
                {/* LISTE MISSIONS */}
                <div className="w-2/3 p-16 overflow-y-auto custom-scroll border-r border-white/5">
                   <div className="grid grid-cols-1 gap-6">
                    {tasks.filter(t => t.department === selectedDept && (t.status === taskFilter || (!t.status && taskFilter === 'EN_COURS'))).map(task => (
                      <div 
                        key={task.id} 
                        onClick={() => setActiveTask(task)}
                        className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] flex items-center justify-between hover:border-emerald-500 transition-all cursor-pointer group hover:bg-white/[0.04]"
                      >
                        <div className="flex items-center gap-8">
                          <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${taskFilter === 'TERMINEE' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            {taskFilter === 'TERMINEE' ? <History size={24}/> : <Zap size={24} className="animate-pulse" />}
                          </div>
                          <div>
                            <h4 className="text-2xl font-black italic uppercase tracking-tighter group-hover:text-white transition-colors">{task.title}</h4>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-[9px] font-black text-zinc-600 uppercase flex items-center gap-2"><User size={10}/> {task.assigned_to || "Non assigné"}</span>
                              <span className="text-[9px] font-black text-zinc-600 uppercase flex items-center gap-2"><Clock size={10}/> {task.due_date || "Deadline : ASAP"}</span>
                            </div>
                          </div>
                        </div>
                        <ArrowRightCircle size={32} className="text-zinc-800 group-hover:text-emerald-500 transition-all" />
                      </div>
                    ))}
                   </div>
                </div>

                {/* ÉQUIPE DU PÔLE */}
                <div className="w-1/3 p-16 bg-white/[0.01]">
                   <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-10 tracking-[0.3em] flex items-center gap-4">
                    <Users size={16} /> Effectif Affecté
                   </h3>
                   <div className="space-y-4">
                     {employees.filter(e => e.department === selectedDept).map(e => (
                       <div key={e.id} className="p-6 bg-black/40 border border-white/5 rounded-3xl flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                            <span className="text-[11px] font-black uppercase italic tracking-widest">{e.full_name}</span>
                          </div>
                          <span className="text-[9px] font-bold text-zinc-600">{e.aura}% Aura</span>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL : FICHE MISSION --- */}
        {activeTask && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-3xl z-[300] flex items-center justify-center p-8 animate-in fade-in duration-500">
             <div className="w-full max-w-3xl bg-[#0a0a0a] border border-white/10 rounded-[4rem] p-16 relative shadow-[0_0_200px_rgba(0,0,0,1)]">
               <button onClick={() => setActiveTask(null)} className="absolute top-12 right-12 p-4 bg-white/5 rounded-2xl text-zinc-600 hover:text-white transition-all"><X size={24}/></button>
               
               <div className="text-center mb-12">
                 <div className={`w-24 h-24 rounded-[2rem] mx-auto mb-8 flex items-center justify-center ${activeTask.status === 'TERMINEE' ? 'bg-blue-500 text-black' : 'bg-emerald-500 text-black'}`}>
                   {activeTask.status === 'TERMINEE' ? <CheckCircle2 size={40}/> : <Zap size={40} />}
                 </div>
                 <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">{activeTask.title}</h2>
                 <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em]">Rapport de Mission Déployée</p>
               </div>

               <div className="grid grid-cols-2 gap-8 mb-12">
                 <div className="p-8 bg-white/[0.03] border border-white/5 rounded-3xl">
                    <p className="text-[9px] font-black text-zinc-500 uppercase mb-3">Opérateur</p>
                    <p className="text-sm font-black uppercase italic text-emerald-500">{activeTask.assigned_to || "GÉNÉRAL"}</p>
                 </div>
                 <div className="p-8 bg-white/[0.03] border border-white/5 rounded-3xl">
                    <p className="text-[9px] font-black text-zinc-500 uppercase mb-3">Date Limite</p>
                    <p className="text-sm font-black uppercase italic text-white">{activeTask.due_date || "PRIORITÉ ALPHA"}</p>
                 </div>
               </div>

               <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] relative overflow-hidden">
                 <p className="text-[9px] font-black text-zinc-500 uppercase mb-6 tracking-widest italic">Description Opérationnelle</p>
                 <p className="text-sm text-zinc-400 leading-relaxed font-medium italic">
                    {activeTask.description || "Cette unité de travail nécessite une coordination immédiate avec le pôle technique. Tous les agents assignés doivent synchroniser leurs rapports hebdomadaires avant la clôture du cycle d'audit."}
                 </p>
               </div>
             </div>
          </div>
        )}

        {/* --- PANEL LATÉRAL : DOSSIER AGENT --- */}
        {selectedEmp && (
          <div className="fixed inset-y-0 right-0 w-[550px] bg-[#050505] border-l border-white/10 z-[400] shadow-[-50px_0_150px_rgba(0,0,0,0.9)] animate-in slide-in-from-right duration-700">
             <div className="h-full flex flex-col p-16 overflow-y-auto custom-scroll">
                <button onClick={() => setSelectedEmp(null)} className="self-end p-5 bg-white/5 rounded-2xl text-zinc-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">Fermer Fiche</button>
                
                <div className="text-center mb-16">
                  <div className="w-32 h-32 bg-emerald-500 rounded-[3rem] mx-auto mb-8 flex items-center justify-center text-black text-5xl font-black italic shadow-[0_20px_40px_rgba(16,185,129,0.2)] rotate-3">
                    {selectedEmp.full_name?.charAt(0)}
                  </div>
                  <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none mb-4">{selectedEmp.full_name}</h2>
                  <div className="inline-block px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                    ID Opérationnel : {selectedEmp.id.slice(0,12)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-12">
                   <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem]">
                      <p className="text-[8px] font-black text-zinc-600 uppercase mb-2 tracking-widest">PCO Unitaire</p>
                      <p className="text-xl font-black italic text-emerald-500">{selectedEmp.pco} PCO</p>
                   </div>
                   <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem]">
                      <p className="text-[8px] font-black text-zinc-600 uppercase mb-2 tracking-widest">Aura Score</p>
                      <p className="text-xl font-black italic text-blue-500">{selectedEmp.aura}%</p>
                   </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 mb-10 shadow-inner">
                  <h3 className="text-[10px] font-black text-zinc-500 uppercase mb-6 flex items-center gap-4"><MessageSquare size={16}/> Notes Managériales</h3>
                  <textarea 
                    className="w-full h-48 bg-black/60 border border-white/5 rounded-3xl p-8 text-sm text-zinc-300 outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-800"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Saisir les observations confidentielles..."
                  />
                  <button 
                    onClick={syncNotes}
                    disabled={isSaving}
                    className="w-full mt-8 py-6 bg-emerald-500 text-black font-black uppercase text-[11px] tracking-[0.3em] rounded-3xl hover:bg-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4"
                  >
                    {isSaving ? <RefreshCcw size={18} className="animate-spin" /> : <Save size={18} />}
                    {isSaving ? "Synchronisation..." : "Mettre à jour Intel"}
                  </button>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-4">
                  <button className="py-5 bg-white/5 border border-white/5 text-[9px] font-black uppercase rounded-2xl hover:bg-white/10 transition-all tracking-widest">Générer Rapport PDF</button>
                  <button className="py-5 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[9px] font-black uppercase rounded-2xl hover:bg-rose-500 hover:text-white transition-all tracking-widest">Terminer Contrat</button>
                </div>
             </div>
          </div>
        )}

      </main>

      {/* --- STYLE GLOBAUX --- */}
      <style jsx>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #10b981; border-radius: 20px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .reverse-spin { animation-direction: reverse; animation-duration: 0.8s; }
      `}</style>
    </div>
  );
}
