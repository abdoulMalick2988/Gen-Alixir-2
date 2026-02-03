"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../components/WakandaGuard";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  Users, Wallet, Activity, Search, ChevronRight, X, Layout, 
  CheckCircle2, Clock, ListTodo, Briefcase, Save, MessageSquare, 
  Globe, ShieldCheck, Zap, TrendingUp, Target, Award, RefreshCcw,
  PlusCircle, Filter, MoreHorizontal
} from 'lucide-react';

// --- CONFIGURATION DU DESIGN SYSTEM ---
const THEME = {
  emerald: "#10b981",
  blue: "#3b82f6",
  violet: "#8b5cf6",
  bg: "#020202"
};

const CHART_PALETTE = [THEME.emerald, THEME.blue, THEME.violet, "#fbbf24", "#f43f5e"];

export default function RHCommandMaster() {
  const user = useAuth(); // Session Wakanda
  
  // --- ÉTATS DE DONNÉES ---
  const [employees, setEmployees] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- ÉTATS D'INTERFACE ---
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  /**
   * CHARGEMENT SÉCURISÉ (MÊME SI LES TABLES SONT VIDES)
   */
  const loadMasterData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Récupération des employés
      let empQuery = supabase.from('staff').select('*');
      if (user.role !== 'ADMIN') empQuery = empQuery.eq('partner_id', user.id);
      const { data: emps, error: empErr } = await empQuery;
      if (empErr) console.error("Erreur Staff:", empErr);
      setEmployees(emps || []);

      // 2. Récupération des tâches (Table optionnelle)
      const { data: tks, error: tkErr } = await supabase.from('tasks').select('*');
      if (tkErr) console.warn("La table 'tasks' n'existe pas encore.");
      setTasks(tks || []);

    } catch (err) {
      console.error("Critical Failure:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadMasterData();
  }, [loadMasterData]);

  /**
   * MOTEUR DE CALCUL (ANTI-NAN)
   */
  const analytics = useMemo(() => {
    const total = employees.length;
    // Force le calcul en nombre pour éviter NAN
    const payroll = employees.reduce((acc, curr) => acc + ((parseFloat(curr.pco) || 0) * 190), 0);
    
    // Groupement pour les graphiques
    const depts = employees.reduce((acc: any, curr) => {
      const d = curr.department || 'Général';
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});

    const pieData = Object.keys(depts).map(name => ({
      name: name.toUpperCase(),
      value: depts[name]
    }));

    return { total, payroll, pieData };
  }, [employees]);

  // Départements uniques pour le menu "Espace de Travail"
  const departmentList = useMemo(() => {
    return Array.from(new Set(employees.map(e => e.department || "Général")));
  }, [employees]);

  /**
   * SAUVEGARDE DES NOTES
   */
  const handleUpdateNotes = async () => {
    if (!selectedEmp) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('staff')
        .update({ notes: noteContent })
        .eq('id', selectedEmp.id);

      if (error) throw error;
      setEmployees(prev => prev.map(e => e.id === selectedEmp.id ? { ...e, notes: noteContent } : e));
      alert("✅ DOSSIER AGENT MIS À JOUR");
    } catch (err: any) {
      alert("❌ ERREUR DE SYNCHRONISATION : " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- RENDU : CHARGEMENT ---
  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em]">Initialisation Intel...</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020202] text-white overflow-hidden">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto relative custom-scroll">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase rounded border border-emerald-500/20">Accès : {user?.role}</span>
              <span className="text-zinc-600 text-[8px] font-bold uppercase tracking-widest italic">Ecodreum Intel Node v2.6</span>
            </div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter">RH <span className="text-emerald-500">SYSTEM</span></h1>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowWorkspace(!showWorkspace)}
              className="group flex items-center gap-4 px-8 py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all shadow-xl"
            >
              <Layout size={16} className="group-hover:rotate-90 transition-transform duration-500" /> 
              Espace de Travail
            </button>

            {/* MENU DÉROULANT ESPACE DE TRAVAIL */}
            {showWorkspace && (
              <div className="absolute right-0 mt-4 w-72 bg-[#080808] border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden backdrop-blur-2xl animate-in fade-in slide-in-from-top-2">
                <div className="p-5 border-b border-white/5 bg-white/[0.02] text-[9px] font-black text-zinc-500 uppercase tracking-widest">Secteurs Opérationnels</div>
                <div className="max-h-64 overflow-y-auto">
                  {departmentList.map(dept => (
                    <button 
                      key={dept}
                      onClick={() => { setSelectedDept(dept); setShowWorkspace(false); }}
                      className="w-full text-left px-6 py-4 text-[10px] font-bold uppercase hover:bg-emerald-500 hover:text-black transition-all border-b border-white/[0.02] flex items-center justify-between group"
                    >
                      {dept}
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- KPI SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Effectif", val: analytics.total, sub: "Agents", icon: Users, col: THEME.blue },
            { label: "Masse Salariale", val: `${analytics.payroll.toLocaleString()}€`, sub: "Mensuel", icon: Wallet, col: THEME.emerald },
            { label: "Performance", val: "88%", sub: "Score Aura", icon: Award, col: "#fbbf24" },
            { label: "Rétention", val: "94%", sub: "Stabilité", icon: Activity, col: "#f43f5e" }
          ].map((kpi, i) => (
            <div key={i} className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] relative overflow-hidden group hover:border-white/10 transition-all">
              <kpi.icon size={20} className="mb-4" style={{ color: kpi.col }} />
              <p className="text-[9px] font-black text-zinc-500 uppercase mb-1 tracking-widest">{kpi.label}</p>
              <h2 className="text-3xl font-black italic tracking-tighter group-hover:scale-105 transition-transform origin-left">{kpi.val}</h2>
            </div>
          ))}
        </div>

        {/* --- GRAPH SECTION (TAILLE CORRIGÉE) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/[0.01] border border-white/5 rounded-[3rem] p-10">
            <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-8 flex items-center gap-2"><TrendingUp size={14} /> Flux Analytique</h3>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={employees.slice(0, 10)}>
                  <Area type="monotone" dataKey="aura" stroke={THEME.emerald} fill={THEME.emerald} fillOpacity={0.05} strokeWidth={3} />
                  <Tooltip contentStyle={{backgroundColor: '#000', border: 'none', borderRadius: '12px', fontSize: '10px'}} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/[0.01] border border-white/5 rounded-[3rem] p-10">
            <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-8 flex items-center gap-2"><Target size={14} /> Répartition Pôles</h3>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analytics.pieData} innerRadius={50} outerRadius={80} paddingAngle={8} dataKey="value">
                    {analytics.pieData.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* --- TABLE DES AGENTS --- */}
        <div className="bg-white/[0.01] border border-white/5 rounded-[3rem] overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
             <h2 className="text-xl font-black italic uppercase italic tracking-tighter text-emerald-500">Registre Opérationnel</h2>
             <button onClick={loadMasterData} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all"><RefreshCcw size={16}/></button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-white/[0.01] text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] border-b border-white/5">
              <tr>
                <th className="p-8">Nom de l'Agent</th>
                <th className="p-8">Secteur</th>
                <th className="p-8">Performance</th>
                <th className="p-8">Masse Estimée</th>
              </tr>
            </thead>
            <tbody className="text-xs font-bold">
              {employees.map((emp) => (
                <tr 
                  key={emp.id} 
                  onClick={() => { setSelectedEmp(emp); setNoteContent(emp.notes || ""); }}
                  className="border-b border-white/[0.02] hover:bg-white/[0.03] transition-all cursor-pointer group"
                >
                  <td className="p-8 flex items-center gap-4 uppercase italic">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-emerald-500">{emp.full_name?.charAt(0)}</div>
                    {emp.full_name}
                  </td>
                  <td className="p-8 text-zinc-500 uppercase">{emp.department}</td>
                  <td className="p-8">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${emp.aura}%` }}></div>
                      </div>
                      <span className="text-[10px] text-emerald-500">{emp.aura}%</span>
                    </div>
                  </td>
                  <td className="p-8 text-white font-black italic">{((parseFloat(emp.pco) || 0) * 190).toLocaleString()} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- MODAL ESPACE DE TRAVAIL (DÉPARTEMENT) --- */}
        {selectedDept && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-3xl z-[200] flex items-center justify-center p-6 animate-in zoom-in duration-300">
            <div className="w-full max-w-5xl bg-[#080808] border border-white/10 rounded-[4rem] p-16 relative overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.05)]">
              <button onClick={() => setSelectedDept(null)} className="absolute top-12 right-12 p-4 bg-white/5 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><X size={24}/></button>
              
              <div className="mb-12">
                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.5em] mb-4">Workspace Department</p>
                <h2 className="text-6xl font-black italic uppercase tracking-tighter">{selectedDept}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-[10px] font-black uppercase text-zinc-600 mb-8 tracking-widest flex items-center gap-3"><ListTodo size={14}/> Objectifs en cours</h3>
                  <div className="space-y-4">
                    {tasks.filter(t => t.department === selectedDept).length > 0 ? (
                      tasks.filter(t => t.department === selectedDept).map(task => (
                        <div key={task.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between group">
                          <p className="font-bold text-sm uppercase">{task.title}</p>
                          <CheckCircle2 size={18} className="text-zinc-800 group-hover:text-emerald-500" />
                        </div>
                      ))
                    ) : (
                      <div className="p-10 border border-dashed border-white/5 rounded-3xl text-center">
                        <p className="text-[10px] text-zinc-700 font-bold uppercase italic">Aucune tâche enregistrée dans ce pôle</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-emerald-500/[0.02] border border-emerald-500/10 rounded-[3rem] p-10">
                  <h3 className="text-[10px] font-black uppercase text-emerald-500 mb-8 tracking-widest flex items-center gap-3"><Users size={14}/> Équipe Assignée</h3>
                  <div className="space-y-4">
                    {employees.filter(e => e.department === selectedDept).map(e => (
                      <div key={e.id} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                        <span className="text-[11px] font-black uppercase italic">{e.full_name}</span>
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- PANEL LATÉRAL DÉTAILS AGENT --- */}
        {selectedEmp && (
          <div className="fixed inset-y-0 right-0 w-[500px] bg-[#050505] border-l border-white/10 z-[300] shadow-[-50px_0_100px_rgba(0,0,0,0.8)] animate-in slide-in-from-right duration-500">
             <div className="p-12 h-full flex flex-col overflow-y-auto">
               <button onClick={() => setSelectedEmp(null)} className="self-end p-4 bg-white/5 rounded-2xl mb-10 text-zinc-500 hover:text-white transition-all text-[10px] font-black uppercase">Fermer</button>
               
               <div className="text-center mb-12">
                 <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] mx-auto mb-6 flex items-center justify-center text-black text-4xl font-black italic">{selectedEmp.full_name?.charAt(0)}</div>
                 <h2 className="text-3xl font-black italic uppercase tracking-tighter">{selectedEmp.full_name}</h2>
                 <p className="text-[10px] text-zinc-600 font-black uppercase mt-1 tracking-widest">{selectedEmp.department}</p>
               </div>

               <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 mb-8">
                 <h3 className="text-[10px] font-black text-zinc-500 uppercase mb-6 flex items-center gap-2"><MessageSquare size={14}/> Notes Managériales</h3>
                 <textarea 
                    className="w-full h-40 bg-black/50 border border-white/5 rounded-2xl p-6 text-sm text-zinc-300 outline-none focus:border-emerald-500 transition-all"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Saisir les observations..."
                 />
                 <button 
                  onClick={handleUpdateNotes}
                  disabled={isSaving}
                  className="w-full mt-6 py-5 bg-emerald-500 text-black font-black uppercase text-[10px] rounded-2xl hover:bg-white transition-all shadow-lg"
                 >
                   {isSaving ? "Synchronisation..." : "Mettre à jour le dossier"}
                 </button>
               </div>
             </div>
          </div>
        )}

      </main>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar { width: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
      `}</style>
    </div>
  );
}
