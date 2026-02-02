"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

import { 
  Users, Wallet, Activity, Search, ChevronRight, X,
  ShieldCheck, Zap, TrendingUp, Target, Mail, Calendar,
  MessageSquare, Star, Save, Trash2, Filter, FileText,
  Briefcase, ArrowUpRight, Award, LayoutDashboard
} from 'lucide-react';

/**
 * THEME ENGINE - ECO DREUM INTELLIGENCE
 */
const THEME = {
  emerald: "#10b981",
  blue: "#3b82f6",
  rose: "#f43f5e",
  amber: "#fbbf24",
  violet: "#8b5cf6",
  zinc: "#71717a",
  bg: "#020202"
};

const CHART_PALETTE = [THEME.emerald, THEME.blue, THEME.violet, THEME.amber, THEME.rose];

// --- COMPOSANTS ATOMIQUES ---

const KPICard = ({ title, value, sub, icon: Icon, color, active, onClick }: any) => (
  <button 
    onClick={onClick} 
    className={`group relative p-8 rounded-[2.5rem] border transition-all duration-500 text-left overflow-hidden w-full
      ${active ? 'bg-white/10 border-white/20 scale-[1.02] shadow-2xl' : 'bg-white/[0.02] border-white/5 hover:border-white/10 opacity-80 hover:opacity-100'}`}
  >
    <div className={`p-4 rounded-2xl w-fit mb-6 transition-all duration-500 ${active ? 'bg-white text-black' : 'bg-white/5 text-zinc-500'}`}>
      <Icon size={24} />
    </div>
    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.25em] mb-1">{title}</p>
    <div className="flex items-baseline gap-2">
      <h2 className="text-4xl font-black italic tracking-tighter" style={{ color: active ? '#fff' : color }}>{value}</h2>
      <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{sub}</span>
    </div>
    {active && <div className="absolute top-0 right-0 p-6"><Zap size={14} className="text-emerald-500 animate-pulse" /></div>}
  </button>
);

const InfoBlock = ({ icon: Icon, label, value, color = "text-white" }: any) => (
  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl group hover:border-white/10 transition-all">
    <Icon size={16} className="text-zinc-600 mb-3 group-hover:text-emerald-500 transition-colors" />
    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</p>
    <p className={`text-xs font-bold uppercase mt-1 tracking-tight ${color}`}>{value}</p>
  </div>
);

export default function RHCommandMaster() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewContext, setViewContext] = useState<'headcount' | 'payroll' | 'performance' | 'attrition'>('headcount');
  const [search, setSearch] = useState('');
  
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // --- RÉCUPÉRATION DES DONNÉES ---
  useEffect(() => {
    async function init() {
      try {
        const { data, error } = await supabase.from('staff').select('*').order('full_name', { ascending: true });
        if (error) throw error;
        setEmployees(data || []);
      } catch (err) {
        console.error("Critical connection error", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // --- MOTEUR ANALYTIQUE (FIXED NaN ISSUE) ---
  const analytics = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(e => e.status !== 'Parti').length;
    const departed = employees.filter(e => e.status === 'Parti').length;
    
    const payroll = employees.reduce((acc, curr) => {
      const pcoVal = parseFloat(curr.pco) || 0;
      const auraVal = parseFloat(curr.aura) || 0;
      return acc + (pcoVal * 190) + (auraVal * 5);
    }, 0);
    
    const turnover = total > 0 ? ((departed / total) * 100).toFixed(1) : "0.0";

    const depts = employees.reduce((acc: any, curr) => {
      const d = curr.department || 'Général';
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});
    const chartData = Object.keys(depts).map(name => ({ name: name.toUpperCase(), value: depts[name] }));

    return { total, active, payroll, turnover, chartData };
  }, [employees]);

  const filteredList = employees.filter(e => 
    (e.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.department || "").toLowerCase().includes(search.toLowerCase())
  );

  // --- GESTION DES ACTIONS ---
  const openProfile = (emp: any) => {
    setSelectedEmp(emp);
    setNoteContent(emp.notes || "");
    setIsPanelOpen(true);
  };

  /**
   * CORRECTIF : SYNCHRONISATION DES NOTES
   * Utilisation de try/finally pour garantir que isSaving repasse à false
   */
  const syncNotes = async () => {
    if (!selectedEmp) return;
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('staff')
        .update({ notes: noteContent })
        .eq('id', selectedEmp.id);
      
      if (error) throw error;

      // Mise à jour locale pour éviter un re-fetch complet
      setEmployees(prev => prev.map(e => 
        e.id === selectedEmp.id ? { ...e, notes: noteContent } : e
      ));
      
      console.log("Notes synchronisées avec succès.");
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      alert("Erreur de synchronisation réseau.");
    } finally {
      // On attend un court délai pour l'effet visuel avant de débloquer
      setTimeout(() => setIsSaving(false), 800);
    }
  };

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[1em]">RH INTEL BOOTING...</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020202] text-white overflow-hidden font-sans">
      <Sidebar />
      
      <main className="flex-1 p-10 overflow-y-auto custom-scroll relative">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <LayoutDashboard size={14} className="text-emerald-500" />
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.3em]">Server: AWS-PARIS-01</span>
            </div>
            <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
              RH <span className="text-emerald-500">INTEL</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4 bg-white/[0.03] p-3 rounded-[2.5rem] border border-white/5">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input 
                className="bg-black/50 border border-white/5 rounded-2xl pl-14 pr-8 py-4 text-[11px] font-bold uppercase outline-none focus:border-emerald-500 w-80 transition-all"
                placeholder="RECHERCHER..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <KPICard title="Effectif" value={analytics.active} sub="Agents Actifs" icon={Users} color={THEME.blue} active={viewContext === 'headcount'} onClick={() => setViewContext('headcount')} />
          <KPICard title="Masse Salariale" value={`${(analytics.payroll / 1000).toFixed(1)}k€`} sub="Mensuel Est." icon={Wallet} color={THEME.emerald} active={viewContext === 'payroll'} onClick={() => setViewContext('payroll')} />
          <KPICard title="Perf. Globale" value="78.4" sub="Score Aura" icon={Award} color={THEME.amber} active={viewContext === 'performance'} onClick={() => setViewContext('performance')} />
          <KPICard title="Turnover" value={`${analytics.turnover}%`} sub="Taux Sortie" icon={Activity} color={THEME.rose} active={viewContext === 'attrition'} onClick={() => setViewContext('attrition')} />
        </div>

        {/* ANALYTICS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          <div className="lg:col-span-8 bg-white/[0.01] border border-white/5 rounded-[3.5rem] p-12">
            <h3 className="text-sm font-black uppercase italic tracking-widest flex items-center gap-3 mb-10">
              <TrendingUp size={20} className="text-emerald-500" /> Live Stream Performance
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={employees.slice(0, 15)}>
                  <defs>
                    <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={THEME.emerald} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={THEME.emerald} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <Tooltip contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid #222', borderRadius: '15px'}} />
                  <Area type="monotone" dataKey="aura" stroke={THEME.emerald} strokeWidth={4} fill="url(#glow)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white/[0.01] border border-white/5 rounded-[3.5rem] p-12 flex flex-col justify-between">
            <h3 className="text-sm font-black uppercase italic tracking-widest mb-10 text-zinc-500 text-center">Répartition</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analytics.chartData} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">
                    {analytics.chartData.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % 5]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 space-y-3">
              {analytics.chartData.map((d, i) => (
                <div key={d.name} className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-zinc-500 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: CHART_PALETTE[i % 5]}}></div> {d.name}
                  </span>
                  <span>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TABLEAU */}
        <section className="bg-white/[0.01] border border-white/5 rounded-[3.5rem] overflow-hidden mb-24 shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-black/40 text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] border-b border-white/5">
              <tr>
                <th className="p-10">Agent</th>
                <th className="p-10">Secteur</th>
                <th className="p-10">{viewContext === 'payroll' ? 'Salaire Est.' : 'Score Aura'}</th>
                <th className="p-10">Statut</th>
                <th className="p-10 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-[12px] font-bold uppercase">
              {filteredList.map((emp) => (
                <tr key={emp.id} onClick={() => openProfile(emp)} className="border-b border-white/[0.02] hover:bg-white/[0.03] transition-all cursor-pointer group">
                  <td className="p-10 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-emerald-500 font-black text-lg group-hover:border-emerald-500 transition-all">
                      {emp.full_name?.charAt(0)}
                    </div>
                    <span className="italic group-hover:text-emerald-500 transition-colors">{emp.full_name}</span>
                  </td>
                  <td className="p-10 text-zinc-500 tracking-widest">{emp.department}</td>
                  <td className="p-10 font-black italic">
                    {viewContext === 'payroll' 
                      ? `${( (parseFloat(emp.pco)||0) * 190).toLocaleString()} €`
                      : `${emp.aura || 0}%`
                    }
                  </td>
                  <td className="p-10">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest border 
                      ${emp.status === 'Parti' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                      {emp.status || 'ACTIF'}
                    </span>
                  </td>
                  <td className="p-10 text-right">
                    <div className="inline-flex p-3 bg-white/5 rounded-xl group-hover:text-emerald-500 transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* SLIDE PANEL */}
        <div className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-[#080808] border-l border-white/10 z-50 transform transition-transform duration-700 ease-in-out shadow-[-50px_0_150px_rgba(0,0,0,0.9)] 
          ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          
          {selectedEmp && (
            <div className="h-full flex flex-col p-12 overflow-y-auto custom-scroll relative">
              <button onClick={() => setIsPanelOpen(false)} className="absolute top-10 right-10 p-3 bg-white/5 hover:bg-rose-500/20 hover:text-rose-500 rounded-2xl transition-all">
                <X size={24} />
              </button>

              <div className="mt-12 flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-[2.5rem] bg-emerald-500 flex items-center justify-center text-black text-5xl font-black mb-6 shadow-2xl rotate-3">
                  {selectedEmp.full_name?.charAt(0)}
                </div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">{selectedEmp.full_name}</h2>
                <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  <Briefcase size={14} /> {selectedEmp.department} • AGENT SENIOR
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-12">
                <InfoBlock icon={Mail} label="Contact Intel" value="node.staff@intel.ai" />
                <InfoBlock icon={Calendar} label="Date d'Entrée" value="Janvier 2024" />
                <InfoBlock icon={ShieldCheck} label="Niveau Accès" value="Alpha-04" />
                <InfoBlock icon={Wallet} label="Coût Agent" value={`${((parseFloat(selectedEmp.pco)||0) * 190).toLocaleString()} €`} color="text-emerald-500" />
              </div>

              <div className="mt-12 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 shadow-inner">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                  <MessageSquare size={14} className="text-blue-500" /> Notes Managériales
                </h3>
                <textarea 
                  className="w-full h-32 bg-black/40 border border-white/5 rounded-2xl p-4 text-xs font-medium text-zinc-300 outline-none focus:border-blue-500 mb-4 transition-all"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Écrire une observation..."
                />
                <button 
                  onClick={syncNotes}
                  disabled={isSaving}
                  className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all
                    ${isSaving ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-emerald-500 text-black hover:bg-white active:scale-95'}`}
                >
                  {isSaving ? <Zap size={14} className="animate-spin" /> : <Save size={14} />}
                  {isSaving ? "Synchronisation..." : "Mettre à jour le dossier"}
                </button>
              </div>

              <div className="mt-auto pt-10 flex gap-4">
                 <button className="flex-1 py-4 bg-white/5 border border-white/10 text-[10px] font-black uppercase rounded-2xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2">
                   <FileText size={16} /> Rapport Complet
                 </button>
                 <button className="p-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl hover:bg-rose-500 hover:text-white transition-all">
                   <Trash2 size={22} />
                 </button>
              </div>
            </div>
          )}
        </div>

        {isPanelOpen && <div onClick={() => setIsPanelOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-opacity" />}
      </main>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #10b98133; border-radius: 20px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #10b981; }
      `}</style>
    </div>
  );
}
