"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../components/WakandaGuard";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Users, Wallet, Activity, ChevronRight, X, Layout, 
  CheckCircle2, Clock, ListTodo, Briefcase, Save, MessageSquare, Globe
} from 'lucide-react';

const THEME = { emerald: "#10b981", blue: "#3b82f6", bg: "#020202" };
const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#fbbf24", "#f43f5e"];

export default function RHCommandMaster() {
  const user = useAuth();
  
  // États de données
  const [employees, setEmployees] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États d'interface
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);

  // 1. Chargement des données (Employés + Tâches)
  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      // Récupération employés
      let empQuery = supabase.from('staff').select('*');
      if (user.role !== 'ADMIN') empQuery = empQuery.eq('partner_id', user.id);
      const { data: emps } = await empQuery;
      setEmployees(emps || []);

      // Récupération tâches (Table 'tasks' à créer sur Supabase si besoin)
      const { data: tks } = await supabase.from('tasks').select('*');
      setTasks(tks || []);
      
      setLoading(false);
    }
    loadData();
  }, [user]);

  // 2. Calculs (Correction NAN et Graphiques)
  const stats = useMemo(() => {
    const total = employees.length;
    const payroll = employees.reduce((acc, curr) => acc + ((Number(curr.pco) || 0) * 190), 0);
    
    // Groupement par département pour le petit graphique
    const depts = employees.reduce((acc: any, curr) => {
      acc[curr.department] = (acc[curr.department] || 0) + 1;
      return acc;
    }, {});
    const pieData = Object.keys(depts).map(k => ({ name: k, value: depts[k] }));

    return { total, payroll, pieData };
  }, [employees]);

  // Départements uniques pour le menu Espace de Travail
  const departments = Array.from(new Set(employees.map(e => e.department || "Général")));

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-emerald-500 font-black italic tracking-[1em]">CHARGEMENT...</div>;

  return (
    <div className="flex h-screen bg-[#020202] text-white overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto relative">
        
        {/* --- HEADER AVEC ESPACE DE TRAVAIL --- */}
        <header className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter">RH <span className="text-emerald-500">INTEL</span></h1>
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Node: {user?.username} / Burundi</p>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowWorkspace(!showWorkspace)}
              className="flex items-center gap-3 px-6 py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              <Layout size={16} /> Espace de Travail
            </button>

            {/* Menu Déroulant Départements */}
            {showWorkspace && (
              <div className="absolute right-0 mt-3 w-64 bg-[#080808] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
                <div className="p-4 border-b border-white/5 bg-white/5 text-[9px] font-black text-zinc-500 uppercase tracking-widest text-center">Sélectionner Département</div>
                {departments.map(dept => (
                  <button 
                    key={dept}
                    onClick={() => { setSelectedDept(dept); setShowWorkspace(false); }}
                    className="w-full text-left px-6 py-4 text-[10px] font-bold uppercase hover:bg-emerald-500 hover:text-black transition-all border-b border-white/[0.02]"
                  >
                    {dept}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* --- KPI SECTION (TAILLE RÉDUITE) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
            <Users className="text-blue-500 mb-4" size={20} />
            <p className="text-[9px] font-black text-zinc-500 uppercase">Effectif Actif</p>
            <h2 className="text-3xl font-black italic">{stats.total}</h2>
          </div>
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
            <Wallet className="text-emerald-500 mb-4" size={20} />
            <p className="text-[9px] font-black text-zinc-500 uppercase">Masse Mensuelle</p>
            <h2 className="text-3xl font-black italic text-emerald-500">{stats.payroll.toLocaleString()} €</h2>
          </div>
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
            <Activity className="text-amber-500 mb-4" size={20} />
            <p className="text-[9px] font-black text-zinc-500 uppercase">Stabilité Node</p>
            <h2 className="text-3xl font-black italic">96.2%</h2>
          </div>
        </div>

        {/* --- GRAPHIQUES (CONTENUS DANS LE TABLEAU) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <div className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-8 h-[300px]">
            <p className="text-[9px] font-black text-zinc-500 uppercase mb-6 tracking-widest">Répartition Secteurs</p>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.pieData} innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                    {stats.pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{backgroundColor: '#000', borderRadius: '10px', fontSize: '10px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-8 h-[300px]">
             <p className="text-[9px] font-black text-zinc-500 uppercase mb-6 tracking-widest">Aura Performance</p>
             <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={employees.slice(0, 8)}>
                  <Area type="monotone" dataKey="aura" stroke={THEME.emerald} fill={THEME.emerald} fillOpacity={0.1} />
                  <Tooltip contentStyle={{backgroundColor: '#000', borderRadius: '10px', fontSize: '10px'}} />
                </AreaChart>
              </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* --- LISTE DES AGENTS --- */}
        <div className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-[9px] text-zinc-600 font-black uppercase tracking-widest border-b border-white/5">
              <tr><th className="p-8">Identité Agent</th><th className="p-8">Secteur</th><th className="p-8">Masse Indiv.</th><th className="p-8"></th></tr>
            </thead>
            <tbody className="text-xs">
              {employees.map(emp => (
                <tr key={emp.id} className="border-b border-white/[0.02] hover:bg-white/[0.03] transition-all cursor-pointer group">
                  <td className="p-8 font-bold uppercase italic text-sm">{emp.full_name}</td>
                  <td className="p-8 text-zinc-500 uppercase font-black">{emp.department}</td>
                  <td className="p-8 text-emerald-500 font-black italic">{((Number(emp.pco)||0)*190).toLocaleString()} €</td>
                  <td className="p-8 text-right"><ChevronRight size={18} className="inline group-hover:text-emerald-500 transition-colors" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- MODAL ESPACE DE TRAVAIL (TÂCHES DU DÉPARTEMENT) --- */}
        {selectedDept && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
            <div className="w-full max-w-4xl bg-[#080808] border border-white/10 rounded-[3rem] p-12 relative shadow-[0_0_100px_rgba(16,185,129,0.1)] overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5">
                <Briefcase size={200} className="text-emerald-500" />
              </div>
              
              <button onClick={() => setSelectedDept(null)} className="absolute top-10 right-10 p-4 bg-white/5 rounded-2xl hover:bg-rose-500/20 text-rose-500"><X size={24}/></button>
              
              <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] mb-2">Workspace / Ecodreum</h2>
              <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-12">DÉPT. {selectedDept}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase text-zinc-500 flex items-center gap-2"><ListTodo size={14}/> Tâches en cours</h3>
                  {tasks.filter(t => t.department === selectedDept).map(task => (
                    <div key={task.id} className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition-all group">
                      <div>
                        <p className="text-xs font-bold text-white uppercase">{task.title}</p>
                        <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1 flex items-center gap-1"><Clock size={10}/> Échéance : {task.due_date || 'ASAP'}</p>
                      </div>
                      <CheckCircle2 size={18} className="text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  ))}
                  {tasks.filter(t => t.department === selectedDept).length === 0 && (
                    <p className="text-[9px] font-bold text-zinc-700 uppercase italic">Aucune tâche assignée à ce pôle.</p>
                  )}
                </div>
                
                <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
                   <h3 className="text-xs font-black uppercase text-emerald-500 mb-6 flex items-center gap-2"><Briefcase size={14}/> Effectif assigné</h3>
                   <div className="space-y-4">
                     {employees.filter(e => e.department === selectedDept).map(e => (
                       <div key={e.id} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-tighter">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                          {e.full_name}
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
