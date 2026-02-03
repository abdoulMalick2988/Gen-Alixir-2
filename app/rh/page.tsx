"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";

/**
 * RECHARTS ENGINE - Visualisation Data
 */
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';

/**
 * LUCIDE ICONSET - Bibliothèque d'icônes
 */
import { 
  Users, Wallet, Activity, Search, ChevronRight, X,
  ShieldCheck, Zap, TrendingUp, Target, Mail, Calendar,
  MessageSquare, Star, Save, Trash2, Filter, FileText,
  Briefcase, ArrowUpRight, Award, LayoutDashboard, 
  RefreshCcw, ArrowUpDown, ChevronUp, ChevronDown, 
  CheckCircle2, AlertCircle, HardDrive
} from 'lucide-react';

// --- CONFIGURATION DU THÈME ---
const THEME = {
  emerald: "#10b981",
  blue: "#3b82f6",
  rose: "#f43f5e",
  amber: "#fbbf24",
  violet: "#8b5cf6",
  zinc: "#71717a",
  bg: "#020202",
};

const CHART_PALETTE = [THEME.emerald, THEME.blue, THEME.violet, THEME.amber, THEME.rose];

// --- INTERFACES ---
interface Employee {
  id: string;
  full_name: string;
  department: string;
  pco: string | number;
  aura: number;
  status: string;
  notes: string;
  created_at: string;
}

/**
 * COMPOSANT : KPICard
 */
const KPICard = ({ title, value, sub, icon: Icon, color, active, onClick }: any) => (
  <button 
    onClick={onClick} 
    className={`group relative p-8 rounded-[2.5rem] border transition-all duration-500 text-left overflow-hidden w-full
      ${active ? 'bg-white/10 border-white/20 scale-[1.02] shadow-2xl' : 'bg-white/[0.02] border-white/5 hover:border-white/10 opacity-80'}`}
  >
    <div className={`p-4 rounded-2xl w-fit mb-6 transition-all duration-500 ${active ? 'bg-white text-black' : 'bg-white/5 text-zinc-500'}`}>
      <Icon size={24} />
    </div>
    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.25em] mb-1">{title}</p>
    <div className="flex items-baseline gap-2">
      <h2 className="text-4xl font-black italic tracking-tighter" style={{ color: active ? '#fff' : color }}>{value}</h2>
      <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{sub}</span>
    </div>
  </button>
);

export default function RHCommandMaster() {
  // --- ÉTATS ---
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewContext, setViewContext] = useState<'headcount' | 'payroll' | 'performance' | 'attrition'>('headcount');
  
  // Tri (Sorting)
  const [sortConfig, setSortConfig] = useState<{ key: keyof Employee | 'salary'; direction: 'asc' | 'desc' }>({ 
    key: 'full_name', 
    direction: 'asc' 
  });

  // Volet latéral
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // --- FETCH DATA ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('staff').select('*').order('full_name', { ascending: true });
      if (error) throw error;
      setEmployees(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- ENGINE: ANALYTICS ---
  const analytics = useMemo(() => {
    const total = employees.length;
    const payroll = employees.reduce((acc, curr) => acc + (parseFloat(curr.pco as string || "0") * 190), 0);
    const departed = employees.filter(e => e.status === 'Parti').length;
    const turnover = total > 0 ? ((departed / total) * 100).toFixed(1) : "0.0";

    const deptMap = employees.reduce((acc: any, curr) => {
      const d = curr.department || 'Général';
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.keys(deptMap).map(name => ({ name: name.toUpperCase(), value: deptMap[name] }));

    return { total, payroll, turnover, chartData };
  }, [employees]);

  // --- ENGINE: SORT & FILTER ---
  const sortedEmployees = useMemo(() => {
    let filtered = employees.filter(e => 
      (e.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.department || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let aVal: any = a[sortConfig.key as keyof Employee];
      let bVal: any = b[sortConfig.key as keyof Employee];

      // Cas spécial pour le calcul du salaire
      if (sortConfig.key === 'salary') {
        aVal = parseFloat(a.pco as string || "0") * 190;
        bVal = parseFloat(b.pco as string || "0") * 190;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [employees, searchQuery, sortConfig]);

  const requestSort = (key: keyof Employee | 'salary') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // --- ACTIONS ---
  const handleUpdateNotes = async () => {
    if (!selectedEmp) return;
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const { error } = await supabase
        .from('staff')
        .update({ notes: noteContent })
        .eq('id', selectedEmp.id);

      if (error) throw error;

      setEmployees(prev => prev.map(e => e.id === selectedEmp.id ? { ...e, notes: noteContent } : e));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error("Sync Error:", err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-4 font-sans">
      <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      <span className="text-[10px] font-black uppercase text-emerald-500 tracking-[1em]">Crypting Data...</span>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020202] text-white overflow-hidden font-sans selection:bg-emerald-500/30">
      <Sidebar />

      <main className="flex-1 p-10 overflow-y-auto custom-scroll">
        
        {/* HEADER */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <HardDrive size={14} className="text-emerald-500" />
              <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Database: Stable-Prod-01</span>
            </div>
            <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
              RH <span className="text-emerald-500">INTEL</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-white/[0.03] p-3 rounded-[2rem] border border-white/5 backdrop-blur-md">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input 
                className="bg-black/50 border border-white/5 rounded-xl pl-14 pr-8 py-4 text-[11px] font-bold uppercase outline-none focus:border-emerald-500 w-80 transition-all"
                placeholder="RECHERCHER UN AGENT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <KPICard title="Effectif" value={analytics.total} sub="Agents" icon={Users} color={THEME.blue} active={viewContext === 'headcount'} onClick={() => setViewContext('headcount')} />
          <KPICard title="Masse Salariale" value={`${(analytics.payroll / 1000).toFixed(1)}k€`} sub="Budget" icon={Wallet} color={THEME.emerald} active={viewContext === 'payroll'} onClick={() => setViewContext('payroll')} />
          <KPICard title="Performance" value="84.2" sub="Score" icon={Award} color={THEME.amber} active={viewContext === 'performance'} onClick={() => setViewContext('performance')} />
          <KPICard title="Taux Attrition" value={`${analytics.turnover}%`} sub="Risque" icon={Activity} color={THEME.rose} active={viewContext === 'attrition'} onClick={() => setViewContext('attrition')} />
        </div>

        {/* GRAPHS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          <div className="lg:col-span-8 bg-white/[0.01] border border-white/5 rounded-[3.5rem] p-12">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-sm font-black uppercase italic tracking-widest flex items-center gap-3">
                  <TrendingUp size={20} className="text-emerald-500" /> Flux Analytique
                </h3>
             </div>
             <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={employees.slice(0, 15)}>
                    <defs>
                      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={THEME.emerald} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={THEME.emerald} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <Tooltip contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid #222', borderRadius: '15px'}} />
                    <Area type="monotone" dataKey="aura" stroke={THEME.emerald} strokeWidth={4} fill="url(#g)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="lg:col-span-4 bg-white/[0.01] border border-white/5 rounded-[3.5rem] p-12">
            <h3 className="text-sm font-black uppercase italic tracking-widest mb-10 text-zinc-500">Secteurs</h3>
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

        {/* TABLEAU DE TRI (SORTING TABLE) */}
        <section className="bg-white/[0.01] border border-white/5 rounded-[3.5rem] overflow-hidden mb-24 shadow-2xl">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 italic">Registre Personnel</h3>
            <div className="flex gap-4">
               <button onClick={fetchData} className="p-3 bg-white/5 rounded-xl hover:bg-emerald-500 hover:text-black transition-all">
                  <RefreshCcw size={16} />
               </button>
            </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-black/40 text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] border-b border-white/5">
              <tr>
                <th className="p-10 cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('full_name')}>
                  <div className="flex items-center gap-2">Agent <ArrowUpDown size={12}/></div>
                </th>
                <th className="p-10 cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('department')}>
                  <div className="flex items-center gap-2">Secteur <ArrowUpDown size={12}/></div>
                </th>
                <th className="p-10 cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('salary')}>
                  <div className="flex items-center gap-2">Salaire Est. <ArrowUpDown size={12}/></div>
                </th>
                <th className="p-10">Statut</th>
                <th className="p-10 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-[12px] font-bold">
              {sortedEmployees.map((emp) => (
                <tr 
                  key={emp.id} 
                  onClick={() => { setSelectedEmp(emp); setNoteContent(emp.notes || ""); setIsPanelOpen(true); }}
                  className="border-b border-white/[0.02] hover:bg-white/[0.03] transition-all cursor-pointer group"
                >
                  <td className="p-10">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-emerald-500 font-black text-lg group-hover:border-emerald-500 transition-all shadow-lg">
                        {emp.full_name?.charAt(0)}
                      </div>
                      <span className="uppercase italic group-hover:text-emerald-500 transition-colors">{emp.full_name}</span>
                    </div>
                  </td>
                  <td className="p-10 text-zinc-500 uppercase tracking-widest">{emp.department}</td>
                  <td className="p-10">
                    <span className="text-emerald-500 font-black italic">
                      {( (parseFloat(emp.pco as string) || 0) * 190).toLocaleString()} €
                    </span>
                  </td>
                  <td className="p-10">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border 
                      ${emp.status === 'Parti' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                      {emp.status || 'ACTIF'}
                    </span>
                  </td>
                  <td className="p-10 text-right text-zinc-700 group-hover:text-emerald-500 transition-colors">
                    <ChevronRight size={20} className="inline" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* PANEL LATÉRAL */}
        <div className={`fixed top-0 right-0 h-full w-full sm:w-[550px] bg-[#080808] border-l border-white/10 z-[100] transform transition-transform duration-700 ease-in-out shadow-[-50px_0_150px_rgba(0,0,0,0.9)] 
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
                <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2">{selectedEmp.full_name}</h2>
                <div className="px-6 py-2 bg-white/5 rounded-full text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                   {selectedEmp.department} • AGENT ID-{selectedEmp.id.slice(0,4)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-12">
                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl">
                  <Mail size={16} className="text-zinc-600 mb-3" />
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Lien Direct</p>
                  <p className="text-xs font-bold uppercase mt-1">staff.node@intel.ai</p>
                </div>
                <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl">
                  <Wallet size={16} className="text-emerald-500 mb-3" />
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Coût Mensuel</p>
                  <p className="text-xs font-bold text-emerald-500 uppercase mt-1">
                    {((parseFloat(selectedEmp.pco as string) || 0) * 190).toLocaleString()} €
                  </p>
                </div>
              </div>

              {/* ZONE DE NOTES (FIXED SYNC) */}
              <div className="mt-12 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 shadow-inner">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <MessageSquare size={14} className="text-blue-500" /> Dossier Managérial
                  </h3>
                  {saveStatus === 'success' && <span className="text-[8px] font-black text-emerald-500 uppercase animate-pulse">Synchronisé</span>}
                </div>
                
                <textarea 
                  className="w-full h-40 bg-black/40 border border-white/5 rounded-2xl p-6 text-xs font-medium text-zinc-300 outline-none focus:border-blue-500/50 mb-6 transition-all"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Inscrivez les observations..."
                />

                <button 
                  onClick={handleUpdateNotes}
                  disabled={isSaving}
                  className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all
                    ${isSaving ? 'bg-zinc-800 text-zinc-500' : saveStatus === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-black hover:bg-white'}`}
                >
                  {isSaving ? <RefreshCcw size={14} className="animate-spin" /> : <Save size={14} />}
                  {isSaving ? "Mise à jour système..." : "Sauvegarder les modifications"}
                </button>
              </div>

              <div className="mt-auto pt-10 flex gap-4">
                 <button className="flex-1 py-5 bg-white/5 border border-white/10 text-[10px] font-black uppercase rounded-2xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2">
                   <FileText size={16} /> Rapport Audit
                 </button>
                 <button className="p-5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl hover:bg-rose-500 hover:text-white transition-all">
                   <Trash2 size={22} />
                 </button>
              </div>
            </div>
          )}
        </div>

        {isPanelOpen && <div onClick={() => setIsPanelOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-md z-[90]" />}

        <style jsx>{`
          .custom-scroll::-webkit-scrollbar { width: 4px; }
          .custom-scroll::-webkit-scrollbar-thumb { background: #10b98133; border-radius: 20px; }
          .custom-scroll::-webkit-scrollbar-thumb:hover { background: #10b981; }
        `}</style>

      </main>
    </div>
  );
}
