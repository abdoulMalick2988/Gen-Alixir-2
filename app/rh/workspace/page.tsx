"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../components/WakandaGuard";
import Sidebar from "../../../components/Sidebar";
import { 
  Layout, CheckCircle2, Clock, ListTodo, Briefcase, 
  Star, History, Calendar, User, ArrowRightCircle,
  Zap, ChevronLeft, Search, Filter, MoreVertical,
  Target, ShieldCheck, Activity, Terminal, AlertCircle,
  RefreshCcw, X, Users 
} from 'lucide-react';
// --- DESIGN SYSTEM : WORKSPACE PRO ---
const THEME = {
  emerald: "#10b981",
  blue: "#3b82f6",
  gold: "#FFD700",
  zinc: "#18181b",
  bg: "#020202"
};

/**
 * SOUS-COMPOSANT : PLAQUE DORÉE DU CHEF DE PÔLE
 */
const ChefPlaque = ({ name }: { name: string }) => (
  <div className="relative group animate-in fade-in slide-in-from-left duration-1000">
    <div className="absolute -inset-1 bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
    <div className="relative flex items-center gap-4 px-8 py-4 bg-[#050505] border border-yellow-500/20 rounded-2xl">
      <div className="p-2 bg-yellow-500/10 rounded-lg">
        <Star size={18} className="text-yellow-500 fill-yellow-500 animate-pulse" />
      </div>
      <div>
        <p className="text-[8px] font-black text-yellow-500/60 uppercase tracking-[0.4em]">Commandant de Pôle</p>
        <p className="text-sm font-black text-white uppercase italic tracking-tighter">{name}</p>
      </div>
    </div>
  </div>
);

/**
 * COMPOSANT PRINCIPAL : WORKSPACE HUB
 */
export default function WorkspaceHub() {
  const user = useAuth();
  
  // États de données
  const [employees, setEmployees] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États de navigation & filtres
  const [activeDept, setActiveDept] = useState<string>("");
  const [taskStatus, setTaskStatus] = useState<'EN_COURS' | 'TERMINEE'>('EN_COURS');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  // 1. SYNCHRONISATION SUPABASE
  const syncIntel = useCallback(async () => {
    setLoading(true);
    try {
      const { data: emps } = await supabase.from('staff').select('*').order('full_name');
      const { data: tks } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      
      setEmployees(emps || []);
      setTasks(tks || []);
      
      // Définit le premier département par défaut
      if (emps && emps.length > 0 && !activeDept) {
        setActiveDept(emps[0].department);
      }
    } catch (e) {
      console.error("Critical Workspace Sync Error", e);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  }, [activeDept]);

  useEffect(() => { syncIntel(); }, [syncIntel]);

  // 2. LOGIQUE DE FILTRAGE
  const departments = useMemo(() => Array.from(new Set(employees.map(e => e.department))), [employees]);
  
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => 
      t.department === activeDept && 
      (t.status === taskStatus || (!t.status && taskStatus === 'EN_COURS')) &&
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, activeDept, taskStatus, searchQuery]);

  const deptMembers = useMemo(() => employees.filter(e => e.department === activeDept), [employees, activeDept]);
  
  const currentChef = useMemo(() => {
    return employees.find(e => e.department === activeDept && (e.role?.includes('CHEF') || e.aura > 89));
  }, [employees, activeDept]);

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <Terminal className="text-emerald-500 animate-bounce mx-auto" size={40} />
        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.8em] animate-pulse">Déploiement Workspace...</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020202] text-white overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* --- HEADER DE NAVIGATION (GLASSMORPHISM) --- */}
        <header className="h-24 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-12 z-50">
          <div className="flex items-center gap-8">
            <a href="/rh" className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-zinc-500 hover:text-white">
              <ChevronLeft size={20} />
            </a>
            <div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter">Command <span className="text-emerald-500">Center</span></h1>
              <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest italic">Node.Intel / Workspace / {activeDept}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
              <input 
                type="text" 
                placeholder="RECHERCHER UNE MISSION..."
                className="bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 text-[10px] font-black w-64 focus:w-80 focus:border-emerald-500/50 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-px h-8 bg-white/10 mx-2"></div>
            <button onClick={syncIntel} className="p-4 bg-emerald-500 text-black rounded-xl hover:bg-white transition-all">
              <RefreshCcw size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          
          {/* --- BARRE LATÉRALE : SÉLECTION DE PÔLE --- */}
          <aside className="w-80 border-r border-white/5 bg-[#050505] flex flex-col">
            <div className="p-8 border-b border-white/5">
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Secteurs Actifs</p>
            </div>
            <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-2">
              {departments.map(dept => (
                <button
                  key={dept}
                  onClick={() => setActiveDept(dept)}
                  className={`w-full p-6 rounded-[2rem] text-left transition-all relative group overflow-hidden ${activeDept === dept ? 'bg-emerald-500 text-black shadow-xl shadow-emerald-500/10' : 'hover:bg-white/5 text-zinc-500'}`}
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase italic tracking-tighter">{dept}</span>
                    <Target size={14} className={activeDept === dept ? 'opacity-100' : 'opacity-20 group-hover:opacity-100'} />
                  </div>
                  {activeDept === dept && (
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <ShieldCheck size={60} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </aside>

          {/* --- ZONE CENTRALE : MISSIONS & ÉQUIPE --- */}
          <section className="flex-1 overflow-y-auto p-12 custom-scroll bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent">
            
            {/* TOP INFOS */}
            <div className="flex justify-between items-end mb-16">
              <div>
                <h2 className="text-7xl font-black italic uppercase tracking-tighter leading-none mb-6">{activeDept}</h2>
                <div className="flex items-center gap-4">
                  <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
                    <button 
                      onClick={() => setTaskStatus('EN_COURS')}
                      className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${taskStatus === 'EN_COURS' ? 'bg-emerald-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                    >
                      En cours ({tasks.filter(t => t.department === activeDept && (t.status === 'EN_COURS' || !t.status)).length})
                    </button>
                    <button 
                      onClick={() => setTaskStatus('TERMINEE')}
                      className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${taskStatus === 'TERMINEE' ? 'bg-blue-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                    >
                      Terminées ({tasks.filter(t => t.department === activeDept && t.status === 'TERMINEE').length})
                    </button>
                  </div>
                </div>
              </div>
              
              {currentChef && <ChefPlaque name={currentChef.full_name} />}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
              
              {/* COLONNE MISSIONS (2/3) */}
              <div className="xl:col-span-2 space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-black uppercase text-zinc-500 flex items-center gap-3 italic"><ListTodo size={16} className="text-emerald-500"/> Dossiers Opérationnels</h3>
                  <div className="h-px flex-1 bg-white/5 mx-6"></div>
                </div>

                {filteredTasks.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredTasks.map(task => (
                      <div 
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="group relative p-8 bg-[#080808] border border-white/5 rounded-[2.5rem] hover:border-emerald-500/50 transition-all cursor-pointer overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRightCircle size={24} className="text-emerald-500" />
                        </div>
                        <div className="flex items-center gap-8">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${taskStatus === 'TERMINEE' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                            {taskStatus === 'TERMINEE' ? <History size={24}/> : <Zap size={24} className="animate-pulse"/>}
                          </div>
                          <div>
                            <h4 className="text-xl font-black italic uppercase tracking-tighter mb-2 group-hover:text-emerald-500 transition-colors">{task.title}</h4>
                            <div className="flex gap-6">
                              <span className="text-[9px] font-black text-zinc-600 uppercase flex items-center gap-2 italic"><User size={12}/> {task.assigned_to || "Non Assigné"}</span>
                              <span className="text-[9px] font-black text-zinc-600 uppercase flex items-center gap-2 italic"><Clock size={12}/> {task.due_date || "Priorité Alpha"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center border border-dashed border-white/10 rounded-[3rem]">
                    <AlertCircle className="mx-auto text-zinc-800 mb-4" size={40} />
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Aucune donnée trouvée dans ce filtre</p>
                  </div>
                )}
              </div>

              {/* COLONNE EFFECTIF (1/3) */}
              <div className="space-y-8">
                <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3.5rem] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12"><Activity size={150}/></div>
                  <h3 className="text-xs font-black uppercase text-zinc-500 mb-10 flex items-center gap-3 italic"><Users size={16} className="text-blue-500"/> Effectif du Pôle</h3>
                  <div className="space-y-4 relative z-10">
                    {deptMembers.map(e => (
                      <div key={e.id} className="flex items-center justify-between p-5 bg-black/60 border border-white/5 rounded-2xl group hover:border-blue-500/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${e.aura > 80 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-blue-500 shadow-[0_0_10px_#3b82f6]'}`}></div>
                          <span className="text-[11px] font-black uppercase italic tracking-tighter">{e.full_name}</span>
                        </div>
                        <span className="text-[8px] font-black text-zinc-600 uppercase group-hover:text-white transition-colors">{e.aura}% Aura</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* STATS RAPIDES DU PÔLE */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] text-center">
                    <p className="text-[8px] font-black text-zinc-600 uppercase mb-2">KPI Secteur</p>
                    <p className="text-2xl font-black italic text-emerald-500">88.4%</p>
                  </div>
                  <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] text-center">
                    <p className="text-[8px] font-black text-zinc-600 uppercase mb-2">Missions</p>
                    <p className="text-2xl font-black italic text-blue-500">{filteredTasks.length}</p>
                  </div>
                </div>
              </div>

            </div>
          </section>
        </div>

        {/* --- MODAL : FICHE DE MISSION --- */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-3xl z-[100] flex items-center justify-center p-8 animate-in fade-in duration-500">
            <div className="w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-[4rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col">
              
              <div className="p-16 border-b border-white/5 relative">
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="absolute top-12 right-12 p-4 bg-white/5 rounded-2xl text-zinc-500 hover:text-white transition-all"
                >
                  <X size={24} />
                </button>
                <div className="flex items-center gap-8 mb-6">
                  <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center ${selectedTask.status === 'TERMINEE' ? 'bg-blue-500' : 'bg-emerald-500'} text-black`}>
                    {selectedTask.status === 'TERMINEE' ? <CheckCircle2 size={32}/> : <Zap size={32}/>}
                  </div>
                  <div>
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none mb-2">{selectedTask.title}</h2>
                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">Operational Mission File / ID-{selectedTask.id.slice(0,8)}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-16 grid grid-cols-2 gap-16">
                <div className="space-y-12">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="p-8 bg-white/[0.03] border border-white/5 rounded-3xl">
                      <p className="text-[9px] font-black text-zinc-500 uppercase mb-4 flex items-center gap-2"><User size={12}/> Agent Assigné</p>
                      <p className="text-lg font-black italic uppercase tracking-tighter text-emerald-500">{selectedTask.assigned_to || "GÉNÉRAL"}</p>
                    </div>
                    <div className="p-8 bg-white/[0.03] border border-white/5 rounded-3xl">
                      <p className="text-[9px] font-black text-zinc-500 uppercase mb-4 flex items-center gap-2"><Calendar size={12}/> Délai d'Exécution</p>
                      <p className="text-lg font-black italic uppercase tracking-tighter text-white">{selectedTask.due_date || "PRIORITÉ ALPHA"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex-1 p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] relative overflow-hidden">
                    <p className="text-[9px] font-black text-zinc-500 uppercase mb-8 flex items-center gap-2 italic"><Briefcase size={12}/> Objectifs & Instructions</p>
                    <p className="text-base text-zinc-400 leading-relaxed font-medium italic">
                      {selectedTask.description || "Cette mission stratégique nécessite une synchronisation immédiate. L'agent doit s'assurer que tous les paramètres du pôle sont respectés avant la clôture du cycle hebdomadaire. Un rapport détaillé est attendu."}
                    </p>
                    <div className="absolute bottom-0 right-0 p-10 opacity-[0.02] -rotate-12">
                      <ShieldCheck size={180} />
                    </div>
                  </div>
                  <button className="w-full mt-8 py-6 bg-white text-black font-black uppercase text-[11px] tracking-[0.3em] rounded-3xl hover:bg-emerald-500 transition-all shadow-xl active:scale-95">
                    Générer Rapport de Mission
                  </button>
                </div>
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
