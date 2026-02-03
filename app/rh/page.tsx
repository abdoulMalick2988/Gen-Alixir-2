"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../components/WakandaGuard";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, Tooltip 
} from 'recharts';
import { 
  Users, Wallet, Activity, ChevronRight, X, Layout, 
  CheckCircle2, Clock, ListTodo, Briefcase, Save, MessageSquare, 
  ShieldCheck, Zap, TrendingUp, Target, Award, RefreshCcw,
  Star, History, Calendar, User, ArrowRightCircle
} from 'lucide-react';

// --- DESIGN SYSTEM ---
const THEME = { emerald: "#10b981", blue: "#3b82f6", gold: "#FFD700", bg: "#020202" };
const COLORS = [THEME.emerald, THEME.blue, "#8b5cf6", "#f43f5e", "#fbbf24"];

export default function RHCommandMaster() {
  const user = useAuth();
  
  // États de données
  const [employees, setEmployees] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États d'interface
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'EN_COURS' | 'TERMINEE'>('EN_COURS');
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);

  // 1. Chargement des données
  const loadIntel = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: emps } = await supabase.from('staff').select('*').order('full_name');
      setEmployees(emps || []);
      
      const { data: tks } = await supabase.from('tasks').select('*');
      setTasks(tks || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadIntel(); }, [loadIntel]);

  // 2. Intelligence Analytique
  const analytics = useMemo(() => {
    const payroll = employees.reduce((acc, curr) => acc + ((parseFloat(curr.pco) || 0) * 190), 0);
    const depts = employees.reduce((acc: any, curr) => {
      acc[curr.department] = (acc[curr.department] || 0) + 1;
      return acc;
    }, {});
    const pieData = Object.keys(depts).map(name => ({ name, value: depts[name] }));
    return { payroll, pieData };
  }, [employees]);

  const departmentList = Array.from(new Set(employees.map(e => e.department || "Général")));

  // 3. Identification du Chef de Département
  const getDeptHead = (dept: string) => {
    // On considère ici que le Chef est celui qui a le plus d'aura ou un rôle spécifique
    return employees.find(e => e.department === dept && (e.role === 'CHEF' || e.aura > 90));
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-emerald-500 font-black italic tracking-[1em]">SYNCHRONISATION...</div>;

  return (
    <div className="flex h-screen bg-[#020202] text-white overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto relative custom-scroll">
        
        {/* --- HEADER --- */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-6xl font-black italic uppercase tracking-tighter">RH <span className="text-emerald-500">SYSTEM</span></h1>
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1 italic">Authorized Personnel Only - v2.8</p>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowWorkspace(!showWorkspace)}
              className="flex items-center gap-4 px-10 py-5 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all shadow-2xl"
            >
              <Layout size={18} /> Espace de Travail
            </button>

            {showWorkspace && (
              <div className="absolute right-0 mt-4 w-72 bg-[#080808] border border-white/10 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-50 overflow-hidden backdrop-blur-3xl">
                <div className="p-6 border-b border-white/5 bg-white/[0.02] text-[9px] font-black text-zinc-500 uppercase tracking-widest">Secteurs Ecodreum</div>
                {departmentList.map(dept => (
                  <button 
                    key={dept}
                    onClick={() => { setSelectedDept(dept); setShowWorkspace(false); }}
                    className="w-full text-left px-8 py-5 text-[10px] font-bold uppercase hover:bg-emerald-500 hover:text-black transition-all border-b border-white/[0.01] flex items-center justify-between group"
                  >
                    {dept} <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* --- KPI SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] group hover:bg-white/[0.04] transition-all">
            <Users className="text-blue-500 mb-4" size={24} />
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Effectif Global</p>
            <h2 className="text-4xl font-black italic mt-2">{employees.length} Agents</h2>
          </div>
          <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] group hover:bg-white/[0.04] transition-all">
            <Wallet className="text-emerald-500 mb-4" size={24} />
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Masse Salariale</p>
            <h2 className="text-4xl font-black italic text-emerald-500 mt-2">{analytics.payroll.toLocaleString()} €</h2>
          </div>
          <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] group hover:bg-white/[0.04] transition-all">
            <Activity className="text-amber-500 mb-4" size={24} />
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Performance Node</p>
            <h2 className="text-4xl font-black italic mt-2">84.2%</h2>
          </div>
        </div>

        {/* --- GRAPH SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/[0.01] border border-white/5 rounded-[3.5rem] p-10 h-[320px]">
            <p className="text-[10px] font-black uppercase text-zinc-600 mb-8 tracking-[0.2em]">Analytique Secteurs</p>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie data={analytics.pieData} innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                  {analytics.pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{background: '#000', border: 'none', borderRadius: '15px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white/[0.01] border border-white/5 rounded-[3.5rem] p-10 h-[320px]">
            <p className="text-[10px] font-black uppercase text-zinc-600 mb-8 tracking-[0.2em]">Aura Évolutif</p>
            <ResponsiveContainer width="100%" height="80%">
              <AreaChart data={employees.slice(0, 10)}>
                <Area type="monotone" dataKey="aura" stroke={THEME.emerald} fill={THEME.emerald} fillOpacity={0.05} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- REGISTRE TABLE --- */}
        <div className="bg-white/[0.01] border border-white/5 rounded-[3.5rem] overflow-hidden mb-20">
          <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Registre Opérationnel</h2>
            <button onClick={loadIntel} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all"><RefreshCcw size={18} /></button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-white/[0.01] text-[10px] text-zinc-600 font-black uppercase tracking-widest border-b border-white/5">
              <tr><th className="p-10">Agent</th><th className="p-10">Département</th><th className="p-10">Performance</th><th className="p-10">Masse</th></tr>
            </thead>
            <tbody className="text-sm font-bold">
              {employees.map(emp => (
                <tr key={emp.id} className="border-b border-white/[0.02] hover:bg-white/[0.03] transition-all group">
                  <td className="p-10 uppercase italic">{emp.full_name}</td>
                  <td className="p-10 text-zinc-500 uppercase">{emp.department}</td>
                  <td className="p-10 text-emerald-500 italic">{emp.aura}%</td>
                  <td className="p-10 font-black italic">{((parseFloat(emp.pco)||0)*190).toLocaleString()} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- MODAL ESPACE DE TRAVAIL (DÉPARTEMENT) --- */}
        {selectedDept && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[200] flex items-center justify-center p-8 animate-in zoom-in-95 duration-300">
            <div className="w-full max-w-6xl bg-[#080808] border border-white/10 rounded-[4rem] p-16 relative shadow-[0_0_150px_rgba(0,0,0,1)] overflow-hidden">
              <button onClick={() => setSelectedDept(null)} className="absolute top-12 right-12 p-5 bg-white/5 rounded-2xl hover:bg-rose-500 text-white transition-all"><X size={24}/></button>
              
              <div className="flex justify-between items-start mb-16">
                <div>
                  <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.5em] mb-4">Espace de Travail / {selectedDept}</p>
                  <h2 className="text-7xl font-black italic uppercase tracking-tighter leading-none mb-6">{selectedDept}</h2>
                  
                  {/* PLAQUE DORÉE DU CHEF */}
                  {getDeptHead(selectedDept) && (
                    <div className="inline-flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] rounded-xl shadow-2xl animate-pulse">
                      <Star size={16} className="text-black fill-black" />
                      <span className="text-black font-black uppercase text-[10px] tracking-widest">Chef de Pôle : {getDeptHead(selectedDept)?.full_name}</span>
                    </div>
                  )}
                </div>

                {/* BOUTONS DE FILTRE MISSIONS */}
                <div className="flex bg-white/5 p-2 rounded-2xl border border-white/5">
                  <button 
                    onClick={() => setTaskFilter('EN_COURS')}
                    className={`flex items-center gap-2 px-8 py-4 rounded-xl text-[10px] font-black uppercase transition-all ${taskFilter === 'EN_COURS' ? 'bg-emerald-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                  >
                    <Clock size={14}/> Missions en cours
                  </button>
                  <button 
                    onClick={() => setTaskFilter('TERMINEE')}
                    className={`flex items-center gap-2 px-8 py-4 rounded-xl text-[10px] font-black uppercase transition-all ${taskFilter === 'TERMINEE' ? 'bg-blue-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                  >
                    <History size={14}/> Missions Terminées
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                {/* LISTE DES MISSIONS FILTRÉES */}
                <div className="space-y-6">
                   <h3 className="text-xs font-black uppercase text-zinc-600 mb-8 flex items-center gap-3"><ListTodo size={16}/> Dossiers du Pôle</h3>
                   <div className="max-h-[400px] overflow-y-auto pr-4 custom-scroll space-y-4">
                    {tasks.filter(t => t.department === selectedDept && (t.status === taskFilter || (!t.status && taskFilter === 'EN_COURS'))).map(task => (
                      <div 
                        key={task.id} 
                        onClick={() => setActiveTask(task)}
                        className="p-8 bg-white/[0.03] border border-white/5 rounded-3xl flex items-center justify-between hover:border-emerald-500/50 hover:bg-white/[0.05] transition-all cursor-pointer group"
                      >
                        <div>
                          <p className="text-lg font-black italic uppercase tracking-tighter group-hover:text-emerald-500 transition-colors">{task.title}</p>
                          <p className="text-[9px] text-zinc-500 font-bold uppercase mt-2">ID: {task.id.slice(0,8)}</p>
                        </div>
                        <ArrowRightCircle size={24} className="text-zinc-800 group-hover:text-emerald-500 group-hover:translate-x-2 transition-all" />
                      </div>
                    ))}
                   </div>
                </div>

                {/* ÉQUIPE DU DÉPARTEMENT */}
                <div className="bg-white/[0.02] border border-white/5 rounded-[3.5rem] p-12 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-10 opacity-[0.02] rotate-12"><Briefcase size={200}/></div>
                   <h3 className="text-xs font-black uppercase text-zinc-600 mb-10 flex items-center gap-3"><Users size={16}/> Effectif du Secteur</h3>
                   <div className="space-y-4">
                     {employees.filter(e => e.department === selectedDept).map(e => (
                       <div key={e.id} className="flex items-center justify-between p-5 bg-black/40 border border-white/5 rounded-2xl group hover:border-emerald-500/30 transition-all">
                          <span className="text-xs font-black uppercase italic tracking-tighter">{e.full_name}</span>
                          <div className={`w-2 h-2 rounded-full shadow-[0_0_10px] ${e.aura > 80 ? 'bg-emerald-500 shadow-emerald-500' : 'bg-blue-500 shadow-blue-500'}`}></div>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL DÉTAILS MISSION --- */}
        {activeTask && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-3xl z-[300] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-12 relative shadow-2xl">
              <button onClick={() => setActiveTask(null)} className="absolute top-8 right-8 p-3 bg-white/5 rounded-xl hover:bg-rose-500/20 text-rose-500"><X size={20}/></button>
              
              <div className="text-center mb-10">
                <div className={`w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center ${activeTask.status === 'TERMINEE' ? 'bg-blue-500' : 'bg-emerald-500'} text-black`}>
                  {activeTask.status === 'TERMINEE' ? <CheckCircle2 size={32}/> : <Zap size={32}/>}
                </div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">{activeTask.title}</h2>
                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">Fiche de Mission Opérationnelle</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl text-center">
                  <User size={16} className="text-zinc-600 mx-auto mb-3" />
                  <p className="text-[9px] font-black text-zinc-500 uppercase mb-1">Agent Assigné</p>
                  <p className="text-xs font-bold uppercase">{activeTask.assigned_to || "GÉNÉRAL"}</p>
                </div>
                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl text-center">
                  <Calendar size={16} className="text-zinc-600 mx-auto mb-3" />
                  <p className="text-[9px] font-black text-zinc-500 uppercase mb-1">Délai d'exécution</p>
                  <p className="text-xs font-bold uppercase text-emerald-500">{activeTask.due_date || "SANS LIMITE"}</p>
                </div>
              </div>

              <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl">
                <p className="text-[9px] font-black text-zinc-500 uppercase mb-4 tracking-widest italic">Instructions du Manager</p>
                <p className="text-sm text-zinc-400 leading-relaxed italic">
                  {activeTask.description || "Cette mission requiert une attention immédiate du pôle concerné. La synchronisation des données doit être effectuée avant le prochain cycle d'audit."}
                </p>
              </div>
            </div>
          </div>
        )}

      </main>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
      `}</style>
    </div>
  );
}
