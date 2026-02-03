"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../components/WakandaGuard";

/** * RECHARTS ENGINE 
 * Pour les graphiques de performance et de masse salariale
 */
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';

/** * ICONSET 
 */
import { 
  Users, Wallet, Activity, Search, ChevronRight, X,
  ShieldCheck, Zap, TrendingUp, Target, Mail, Calendar,
  MessageSquare, Save, Trash2, FileText, Briefcase, 
  ArrowUpRight, Award, RefreshCcw, LogOut, Globe
} from 'lucide-react';

// --- CONFIGURATION DU DESIGN SYSTEM ---
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

// --- COMPOSANTS DE SUPPORT ---
const KPICard = ({ title, value, sub, icon: Icon, color, active, onClick }: any) => (
  <button 
    onClick={onClick} 
    className={`group relative p-8 rounded-[2.5rem] border transition-all duration-500 text-left overflow-hidden w-full
      ${active ? 'bg-white/10 border-white/20 scale-[1.02] shadow-2xl' : 'bg-white/[0.02] border-white/5 opacity-80'}`}
  >
    <div className={`p-4 rounded-2xl w-fit mb-6 ${active ? 'bg-white text-black' : 'bg-white/5 text-zinc-500'}`}>
      <Icon size={24} />
    </div>
    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.25em] mb-1">{title}</p>
    <div className="flex items-baseline gap-2">
      <h2 className="text-4xl font-black italic tracking-tighter" style={{ color: active ? '#fff' : color }}>{value}</h2>
      <span className="text-[9px] font-bold text-zinc-600 uppercase">{sub}</span>
    </div>
  </button>
);

const DataBlock = ({ icon: Icon, label, value, color = "text-white" }: any) => (
  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] transition-all">
    <Icon size={16} className="text-zinc-600 mb-3" />
    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</p>
    <p className={`text-xs font-bold uppercase mt-1 ${color}`}>{value}</p>
  </div>
);

// --- COMPOSANT PRINCIPAL ---
export default function RHCommandMaster() {
  const user = useAuth(); // Récupération de la session (ADMIN ou PARTENAIRE)
  
  // États de données
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewContext, setViewContext] = useState<'headcount' | 'payroll' | 'performance'>('headcount');
  const [search, setSearch] = useState('');
  
  // États de l'interface latérale
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  /**
   * CHARGEMENT SÉCURISÉ DES DONNÉES
   */
  const fetchIntel = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase.from('staff').select('*');
      
      // FILTRE LOGIQUE : L'Admin voit tout, le Partenaire voit ses agents
      if (user.role !== 'ADMIN') {
        query = query.eq('partner_id', user.id);
      }

      const { data, error } = await query.order('full_name', { ascending: true });
      if (error) throw error;
      setEmployees(data || []);
    } catch (err) {
      console.error("Data Breach/Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchIntel();
  }, [fetchIntel]);

  /**
   * MOTEUR ANALYTIQUE (Calculs Robustes)
   */
  const analytics = useMemo(() => {
    const total = employees.length;
    
    // Calcul de la masse salariale avec protection contre le bug "NaN"
    const payroll = employees.reduce((acc, curr) => {
      const pcoValue = parseFloat(curr.pco) || 0; // Correction manuelle ici : || 0 évite le NaN
      return acc + (pcoValue * 190);
    }, 0);

    // Répartition par secteurs pour le graphique Pie
    const depts = employees.reduce((acc: any, curr) => {
      const d = curr.department || 'Général';
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.keys(depts).map(name => ({
      name: name.toUpperCase(),
      value: depts[name]
    }));

    return { total, payroll, chartData };
  }, [employees]);

  /**
   * MISE À JOUR DU DOSSIER AGENT
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

      setEmployees(prev => prev.map(e => e.id === selectedEmp.id ? { ...e, notes: noteContent } : e));
      alert("SYNCHRONISATION RÉUSSIE : DOSSIER MIS À JOUR");
    } catch (err: any) {
      alert("ERREUR RÉSEAU : " + err.message + " (Vérifiez les droits RLS)");
    } finally {
      setIsSaving(false);
    }
  };

  // --- RENDU : CHARGEMENT ---
  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-t-4 border-emerald-500 rounded-full animate-spin mb-6"></div>
      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[1em] animate-pulse">Chargement Intel...</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020202] text-white overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 p-10 overflow-y-auto custom-scroll relative">
        
        {/* --- SECTION HEADER --- */}
        <div className="flex justify-between items-end mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-emerald-500 text-black text-[9px] font-black uppercase rounded">Session: {user?.username}</span>
              <span className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest"><Globe size={10} className="inline mr-1"/> Burundi Node</span>
            </div>
            <h1 className="text-7xl font-black italic uppercase tracking-tighter">RH <span className="text-emerald-500">INTEL</span></h1>
          </div>
          <div className="flex gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                className="bg-white/[0.03] border border-white/5 rounded-2xl pl-16 pr-8 py-5 text-[11px] font-bold uppercase outline-none focus:border-emerald-500 w-80 transition-all shadow-2xl" 
                placeholder="RECHERCHER UN AGENT..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
            <button onClick={() => window.location.reload()} className="p-5 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-zinc-500"><RefreshCcw size={20}/></button>
          </div>
        </div>

        {/* --- KPI GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <KPICard title="Effectif" value={analytics.total} sub="Agents Actifs" icon={Users} color={THEME.blue} active={viewContext === 'headcount'} onClick={() => setViewContext('headcount')} />
          <KPICard title="Budget" value={`${(analytics.payroll / 1000).toFixed(1)}k€`} sub="Mensuel" icon={Wallet} color={THEME.emerald} active={viewContext === 'payroll'} onClick={() => setViewContext('payroll')} />
          <KPICard title="Performance" value="84%" sub="Score Global" icon={Award} color={THEME.amber} active={viewContext === 'performance'} onClick={() => setViewContext('performance')} />
          <KPICard title="Stabilité" value="96.2%" sub="Rétention" icon={Activity} color={THEME.rose} />
        </div>

        {/* --- GRAPHIQUES --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          <div className="lg:col-span-8 bg-white/[0.01] border border-white/5 rounded-[3.5rem] p-12">
            <h3 className="text-sm font-black uppercase italic tracking-widest mb-10 flex items-center gap-3">
              <TrendingUp size={18} className="text-emerald-500" /> Flux de Performance
            </h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={employees.slice(0, 15)}>
                  <defs>
                    <linearGradient id="colorAura" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={THEME.emerald} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={THEME.emerald} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="full_name" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #333', borderRadius: '15px'}} />
                  <Area type="monotone" dataKey="aura" stroke={THEME.emerald} strokeWidth={4} fill="url(#colorAura)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white/[0.01] border border-white/5 rounded-[3.5rem] p-12">
             <h3 className="text-sm font-black uppercase italic tracking-widest mb-10 text-center text-zinc-500">Secteurs</h3>
             <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analytics.chartData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {analytics.chartData.map((_, index) => <Cell key={index} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* --- TABLEAU DES AGENTS --- */}
        <div className="bg-white/[0.01] border border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl">
          <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Registre Opérationnel</h2>
            <button className="px-6 py-3 bg-white text-black text-[9px] font-black uppercase rounded-xl hover:bg-emerald-500 transition-colors">Exporter Rapport</button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-black/40 text-[10px] text-zinc-600 font-black uppercase tracking-widest border-b border-white/5">
              <tr>
                <th className="p-10">Identité Agent</th>
                <th className="p-10">Département</th>
                <th className="p-10">Score Aura</th>
                <th className="p-10 text-right">Détails</th>
              </tr>
            </thead>
            <tbody className="text-[13px] font-bold">
              {employees.filter(e => (e.full_name || "").toLowerCase().includes(search.toLowerCase())).map((emp) => (
                <tr 
                  key={emp.id} 
                  onClick={() => { setSelectedEmp(emp); setNoteContent(emp.notes || ""); setIsPanelOpen(true); }} 
                  className="border-b border-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer group"
                >
                  <td className="p-10 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-emerald-500 font-black text-xl group-hover:scale-110 transition-transform">
                      {emp.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="uppercase italic text-lg tracking-tighter">{emp.full_name}</p>
                      <p className="text-[9px] text-zinc-600 font-black uppercase">Statut : Opérationnel</p>
                    </div>
                  </td>
                  <td className="p-10 text-zinc-500 uppercase tracking-widest italic">{emp.department}</td>
                  <td className="p-10">
                    <div className="flex items-center gap-4">
                       <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{width: `${emp.aura}%`}}></div>
                       </div>
                       <span className="text-emerald-500 italic">{emp.aura}%</span>
                    </div>
                  </td>
                  <td className="p-10 text-right"><ChevronRight size={20} className="inline group-hover:text-emerald-500 group-hover:translate-x-2 transition-all" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- PANEL LATÉRAL (DÉTAILS AGENT) --- */}
        <div className={`fixed top-0 right-0 h-full w-[550px] bg-[#050505] border-l border-white/10 z-[100] transform transition-transform duration-700 ease-in-out shadow-[-50px_0_150px_rgba(0,0,0,1)] ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {selectedEmp && (
            <div className="h-full flex flex-col p-14 overflow-y-auto">
              <button onClick={() => setIsPanelOpen(false)} className="self-end p-4 bg-white/5 hover:bg-rose-500/20 hover:text-rose-500 rounded-2xl transition-all mb-10"><X size={24} /></button>
              
              <div className="flex flex-col items-center mb-16 text-center">
                <div className="w-32 h-32 rounded-[2.5rem] bg-emerald-500 flex items-center justify-center text-black text-5xl font-black mb-8 shadow-2xl rotate-3">{selectedEmp.full_name?.charAt(0)}</div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-3">{selectedEmp.full_name}</h2>
                <div className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                  <Briefcase size={12} /> {selectedEmp.department}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-12">
                <DataBlock icon={Mail} label="Contact" value="node.staff@ecodreum.ai" />
                <DataBlock icon={Calendar} label="Déploiement" value="JAN 2024" />
                <DataBlock icon={ShieldCheck} label="Sécurité" value="NIVEAU 04" />
                <DataBlock icon={Wallet} label="Salaire Partner" value={`${((parseFloat(selectedEmp.pco)||0) * 190).toLocaleString()} €`} color="text-emerald-500" />
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 mb-10 shadow-inner">
                <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-6 flex items-center gap-3"><MessageSquare size={16} /> Observations Partner</h3>
                <textarea 
                  className="w-full h-40 bg-black/40 border border-white/5 rounded-2xl p-6 text-sm text-zinc-300 outline-none focus:border-blue-500 mb-6 transition-all" 
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />
                <button 
                  onClick={syncNotes}
                  disabled={isSaving}
                  className="w-full py-6 bg-emerald-500 text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-3"
                >
                  {isSaving ? <RefreshCcw size={18} className="animate-spin" /> : <Save size={18} />}
                  {isSaving ? "SYNCHRONISATION..." : "METTRE À JOUR LE DOSSIER"}
                </button>
              </div>

              <div className="mt-auto pt-10 flex gap-6">
                <button className="flex-1 py-6 bg-white/5 border border-white/10 text-[10px] font-black uppercase rounded-2xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"><FileText size={18} /> Rapport Audit</button>
                <button className="p-6 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={24} /></button>
              </div>
            </div>
          )}
        </div>

        {isPanelOpen && <div onClick={() => setIsPanelOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[90]" />}

      </main>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
}
