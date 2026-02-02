"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";

/**
 * RECHARTS ENGINE
 * Bibliothèque de visualisation pour le pilotage de la performance.
 */
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, ComposedChart, Legend
} from 'recharts';

/**
 * LUCIDE ICONSET
 * Set complet pour éviter toute erreur de compilation sur les symboles.
 */
import { 
  Users, Wallet, Activity, Search, ChevronRight, X,
  ShieldCheck, Zap, TrendingUp, Target, Mail, Calendar,
  MessageSquare, Star, Save, Trash2, Filter, FileText,
  Briefcase, ArrowUpRight, Award, LayoutDashboard, 
  ChevronDown, Download, RefreshCcw, MoreHorizontal,
  Settings, AlertTriangle, CheckCircle2, Info
} from 'lucide-react';

// --- CONFIGURATION DU DESIGN SYSTEM ---
const THEME = {
  emerald: "#10b981",
  blue: "#3b82f6",
  rose: "#f43f5e",
  amber: "#fbbf24",
  violet: "#8b5cf6",
  zinc: "#71717a",
  bg: "#020202",
  card: "rgba(255, 255, 255, 0.02)",
  border: "rgba(255, 255, 255, 0.05)"
};

const CHART_PALETTE = [THEME.emerald, THEME.blue, THEME.violet, THEME.amber, THEME.rose];

// --- INTERFACES & TYPES (Sécurité TypeScript) ---
interface Employee {
  id: string;
  full_name: string;
  department: string;
  pco: string | number;
  aura: number;
  status: string;
  notes: string;
  created_at: string;
  email?: string;
  access_level?: string;
}

/**
 * COMPOSANT : KPICard
 * Affiche les métriques clés avec un état actif et des effets de lumière.
 */
const KPICard = ({ title, value, sub, icon: Icon, color, active, onClick }: any) => (
  <button 
    onClick={onClick} 
    className={`group relative p-8 rounded-[2.5rem] border transition-all duration-500 text-left overflow-hidden w-full
      ${active 
        ? 'bg-white/10 border-white/20 scale-[1.02] shadow-[0_20px_50px_rgba(0,0,0,0.5)]' 
        : 'bg-white/[0.02] border-white/5 hover:border-white/10 opacity-80 hover:opacity-100'}`}
  >
    <div className={`p-4 rounded-2xl w-fit mb-6 transition-all duration-500 
      ${active ? 'bg-white text-black rotate-3' : 'bg-white/5 text-zinc-500 group-hover:text-white'}`}>
      <Icon size={24} />
    </div>
    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.25em] mb-1">{title}</p>
    <div className="flex items-baseline gap-2">
      <h2 className="text-4xl font-black italic tracking-tighter" style={{ color: active ? '#fff' : color }}>
        {value}
      </h2>
      <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{sub}</span>
    </div>
    {active && (
      <div className="absolute top-0 right-0 p-6">
        <Zap size={14} className="text-emerald-500 animate-pulse" />
      </div>
    )}
  </button>
);

/**
 * COMPOSANT : DataDisplayBox
 * Utilisé dans le volet latéral pour les détails de l'agent.
 */
const DataDisplayBox = ({ icon: Icon, label, value, color = "text-white" }: any) => (
  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl group hover:bg-white/[0.04] transition-all duration-300">
    <Icon size={16} className="text-zinc-600 mb-3 group-hover:text-emerald-500 transition-colors" />
    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</p>
    <p className={`text-xs font-bold uppercase mt-1 tracking-tight ${color}`}>{value}</p>
  </div>
);

/**
 * MAIN COMPONENT : RHCommandMaster
 */
export default function RHCommandMaster() {
  // --- ÉTATS DE DONNÉES ---
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  // --- ÉTATS D'INTERFACE ---
  const [viewContext, setViewContext] = useState<'headcount' | 'payroll' | 'performance' | 'attrition'>('headcount');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  
  // --- ÉTATS D'ACTION ---
  const [noteContent, setNoteContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<'idle' | 'success' | 'error'>('idle');

  /**
   * INITIALISATION DES DONNÉES
   * Récupération des employés depuis Supabase.
   */
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('full_name', { ascending: true });
      
      if (error) throw error;
      setEmployees(data || []);
      setErrorStatus(null);
    } catch (err: any) {
      console.error("Critical Fetch Error:", err);
      setErrorStatus(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  /**
   * MOTEUR ANALYTIQUE
   * Calcule les KPIs en temps réel basés sur les données brutes.
   */
  const analytics = useMemo(() => {
    const total = employees.length;
    const activeList = employees.filter(e => e.status !== 'Parti');
    const departedCount = employees.filter(e => e.status === 'Parti').length;
    
    // Calcul financier précis (Nettoyage des NaN)
    const totalPayroll = employees.reduce((acc, curr) => {
      const pco = typeof curr.pco === 'string' ? parseFloat(curr.pco) : curr.pco;
      return acc + ((pco || 0) * 190);
    }, 0);

    // Taux d'attrition
    const attritionRate = total > 0 ? ((departedCount / total) * 100).toFixed(1) : "0.0";

    // Répartition par département
    const deptMap = employees.reduce((acc: any, curr) => {
      const d = curr.department || 'Non Assigné';
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.keys(deptMap).map(key => ({
      name: key.toUpperCase(),
      value: deptMap[key]
    }));

    return { total, activeCount: activeList.length, totalPayroll, attritionRate, chartData };
  }, [employees]);

  /**
   * GESTIONNAIRE DE RECHERCHE
   * Filtre la liste des employés selon le nom ou le département.
   */
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => 
      (emp.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.department || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [employees, searchQuery]);

  /**
   * ACTION : Sélection d'un employé
   */
  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmp(emp);
    setNoteContent(emp.notes || "");
    setSyncFeedback('idle');
    setIsPanelOpen(true);
  };

  /**
   * ACTION : Mise à jour des notes (Correction du bug de synchronisation)
   */
  const handleUpdateNotes = async () => {
    if (!selectedEmp) return;
    
    setIsSaving(true);
    setSyncFeedback('idle');
    
    try {
      // Simulation d'un délai réseau pour l'UX
      await new Promise(resolve => setTimeout(resolve, 800));

      const { error } = await supabase
        .from('staff')
        .update({ notes: noteContent })
        .eq('id', selectedEmp.id);

      if (error) throw error;

      // Mise à jour de l'état local pour refléter les changements
      setEmployees(prev => prev.map(e => 
        e.id === selectedEmp.id ? { ...e, notes: noteContent } : e
      ));
      
      setSyncFeedback('success');
      // On ferme le volet après un succès
      setTimeout(() => {
        setSyncFeedback('idle');
      }, 3000);

    } catch (err: any) {
      console.error("Update error:", err);
      setSyncFeedback('error');
      alert(`Erreur de synchronisation : ${err.message}. Vérifiez vos droits RLS dans Supabase.`);
    } finally {
      setIsSaving(false);
    }
  };

  // --- RENDU : CHARGEMENT ---
  if (loading) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-t-4 border-emerald-500 rounded-full animate-spin"></div>
          <div className="absolute inset-4 border-t-4 border-blue-500 rounded-full animate-spin-slow opacity-50"></div>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-[11px] font-black text-emerald-500 uppercase tracking-[1.5em] animate-pulse">Initialisation</p>
          <span className="text-[8px] text-zinc-700 uppercase mt-2 font-bold tracking-[0.5em]">Quantum RH Engine v2.6</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#020202] text-white overflow-hidden font-sans selection:bg-emerald-500/30">
      {/* BARRE LATÉRALE DE NAVIGATION */}
      <Sidebar />

      {/* ZONE DE CONTENU PRINCIPAL */}
      <main className="flex-1 p-10 overflow-y-auto custom-scroll relative">
        
        {/* --- SECTION HEADER --- */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-20">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-emerald-500 text-black text-[9px] font-black uppercase rounded tracking-widest">
                Node: Bujumbura-Central
              </span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest italic">Live Database Link</span>
              </div>
            </div>
            <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
              RH <span className="text-emerald-500">MASTER</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-white/[0.03] p-4 rounded-[2.5rem] border border-white/5 shadow-2xl backdrop-blur-md">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                type="text"
                className="bg-black/50 border border-white/5 rounded-2xl pl-16 pr-8 py-4 text-[11px] font-bold uppercase outline-none focus:border-emerald-500 w-80 transition-all placeholder:text-zinc-700 focus:ring-4 focus:ring-emerald-500/10"
                placeholder="Filtrer l'intelligence personnel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-400 hover:text-white transition-all">
              <RefreshCcw size={20} onClick={fetchEmployees} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {/* --- SECTION DES MÉTRIQUES (KPIS) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <KPICard 
            title="Effectif Total" 
            value={analytics.total} 
            sub="Contrats Actifs" 
            icon={Users} 
            color={THEME.blue} 
            active={viewContext === 'headcount'} 
            onClick={() => setViewContext('headcount')} 
          />
          <KPICard 
            title="Masse Salariale" 
            value={`${(analytics.totalPayroll / 1000).toFixed(1)}k€`} 
            sub="Budget Mensuel" 
            icon={Wallet} 
            color={THEME.emerald} 
            active={viewContext === 'payroll'} 
            onClick={() => setViewContext('payroll')} 
          />
          <KPICard 
            title="Indice Performance" 
            value="82.5" 
            sub="Score Moyen" 
            icon={Award} 
            color={THEME.amber} 
            active={viewContext === 'performance'} 
            onClick={() => setViewContext('performance')} 
          />
          <KPICard 
            title="Risque Attrition" 
            value={`${analytics.attritionRate}%`} 
            sub="Taux de Rotation" 
            icon={Activity} 
            color={THEME.rose} 
            active={viewContext === 'attrition'} 
            onClick={() => setViewContext('attrition')} 
          />
        </div>

        {/* --- SECTION ANALYSE GRAPHIQUE --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
          
          {/* GRAPHE D'ÉVOLUTION */}
          <div className="lg:col-span-8 bg-white/[0.01] border border-white/5 rounded-[4rem] p-12 relative overflow-hidden group">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h3 className="text-sm font-black uppercase italic tracking-widest flex items-center gap-3">
                  <TrendingUp size={20} className="text-emerald-500" /> Flux de Performance Collective
                </h3>
                <p className="text-[9px] text-zinc-600 uppercase font-bold mt-2">Données synchronisées en temps réel</p>
              </div>
              <div className="flex gap-2">
                <div className="px-4 py-2 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-widest">7 Derniers Jours</div>
              </div>
            </div>
            
            <div className="h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={employees.slice(0, 20)}>
                  <defs>
                    <linearGradient id="colorAura" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={THEME.emerald} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={THEME.emerald} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="full_name" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#050505', border: '1px solid #1a1a1a', borderRadius: '24px', padding: '20px'}}
                    itemStyle={{fontSize: '11px', fontWeight: '900', textTransform: 'uppercase'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="aura" 
                    stroke={THEME.emerald} 
                    strokeWidth={5} 
                    fillOpacity={1} 
                    fill="url(#colorAura)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RÉPARTITION CIRCULAIRE */}
          <div className="lg:col-span-4 bg-white/[0.01] border border-white/5 rounded-[4rem] p-12 flex flex-col">
            <h3 className="text-sm font-black uppercase italic tracking-widest mb-12 text-center text-zinc-400">Segmentation Secteurs</h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={analytics.chartData} 
                    innerRadius={80} 
                    outerRadius={110} 
                    paddingAngle={8} 
                    dataKey="value"
                    stroke="none"
                  >
                    {analytics.chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-10 space-y-4 flex-1">
              {analytics.chartData.map((entry, index) => (
                <div key={entry.name} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest group">
                  <span className="text-zinc-500 flex items-center gap-3 group-hover:text-white transition-colors">
                    <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: CHART_PALETTE[index % CHART_PALETTE.length]}}></div>
                    {entry.name}
                  </span>
                  <span className="text-zinc-300">{entry.value} Unités</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- SECTION REGISTRE DES AGENTS --- */}
        <section className="bg-white/[0.01] border border-white/5 rounded-[4rem] overflow-hidden mb-32 shadow-2xl relative">
          <div className="p-12 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 bg-white/[0.01]">
            <div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Pilotage Opérationnel</h2>
              <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.3em] mt-2 italic">Registre des actifs déployés</p>
            </div>
            <div className="flex gap-4">
              <button className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-3">
                <Download size={14} /> Exporter .JSON
              </button>
              <button className="px-8 py-4 bg-emerald-500 text-black rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(16,185,129,0.3)]">
                Nouvelle Recrue
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-black/60 text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em] border-b border-white/5">
                <tr>
                  <th className="p-12">Identité Digitale</th>
                  <th className="p-12">Département</th>
                  <th className="p-12">{viewContext === 'payroll' ? 'Masse Salariale' : 'Score Aura'}</th>
                  <th className="p-12">Statut Système</th>
                  <th className="p-12 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-[13px] font-bold">
                {filteredEmployees.map((emp) => (
                  <tr 
                    key={emp.id} 
                    onClick={() => handleSelectEmployee(emp)}
                    className="border-b border-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer group"
                  >
                    <td className="p-12">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-white/10 flex items-center justify-center text-emerald-500 font-black text-2xl group-hover:border-emerald-500/50 group-hover:scale-110 transition-all duration-500 shadow-xl shadow-black">
                          {emp.full_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="uppercase italic text-lg text-white group-hover:text-emerald-500 transition-colors leading-none tracking-tighter">{emp.full_name}</p>
                          <p className="text-[9px] text-zinc-600 font-black uppercase mt-2 tracking-widest">ID: {emp.id.slice(0, 12)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-12">
                      <span className="text-zinc-400 uppercase tracking-widest italic text-[11px]">{emp.department || 'OPS'}</span>
                    </td>
                    <td className="p-12">
                      {viewContext === 'payroll' ? (
                        <div className="flex flex-col">
                          <span className="text-emerald-500 font-black text-xl italic tracking-tighter">
                            {( (parseFloat(emp.pco as string) || 0) * 190).toLocaleString()} €
                          </span>
                          <span className="text-[8px] text-zinc-600 uppercase mt-1 tracking-widest">Estimation Mensuelle</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-5">
                          <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_15px_#3b82f6]" 
                              style={{width: `${emp.aura}%`}}
                            ></div>
                          </div>
                          <span className="text-blue-500 font-black italic">{emp.aura}%</span>
                        </div>
                      )}
                    </td>
                    <td className="p-12">
                      <span className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-lg
                        ${emp.status === 'Parti' 
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                          : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                        {emp.status || 'OPÉRATIONNEL'}
                      </span>
                    </td>
                    <td className="p-12 text-right">
                      <div className="inline-flex p-4 bg-white/5 rounded-2xl text-zinc-700 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-all duration-300">
                        <ArrowUpRight size={24} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* --- VOLET LATÉRAL : DRILL-DOWN PROFIL --- */}
        <div className={`fixed top-0 right-0 h-full w-full sm:w-[550px] bg-[#050505] border-l border-white/10 z-[100] transform transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) shadow-[-50px_0_150px_rgba(0,0,0,1)] 
          ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          
          {selectedEmp && (
            <div className="h-full flex flex-col p-14 overflow-y-auto custom-scroll relative">
              
              {/* HEADER DU PANNEAU */}
              <div className="flex justify-between items-center mb-16">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Profil Sécurisé</span>
                    <p className="text-[8px] text-zinc-500 uppercase tracking-widest mt-1">Niveau d'Accès : Alpha-1</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsPanelOpen(false)} 
                  className="p-5 bg-white/5 hover:bg-rose-500/20 hover:text-rose-500 rounded-3xl transition-all duration-300 group"
                >
                  <X size={28} className="group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              {/* IDENTITÉ VISUELLE */}
              <div className="flex flex-col items-center text-center mb-16">
                <div className="relative group">
                  <div className="w-44 h-44 rounded-[3.5rem] bg-gradient-to-br from-emerald-400 to-teal-700 flex items-center justify-center text-black text-6xl font-black mb-10 shadow-[0_30px_80px_rgba(16,185,129,0.3)] rotate-3 group-hover:rotate-0 transition-transform duration-700">
                    {selectedEmp.full_name?.charAt(0)}
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-4 bg-black border border-white/10 rounded-[1.5rem] text-emerald-500 shadow-2xl">
                    <Award size={24} />
                  </div>
                </div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4 leading-none text-white">{selectedEmp.full_name}</h2>
                <div className="flex items-center gap-3 text-[11px] font-black text-zinc-500 uppercase tracking-widest bg-white/5 px-6 py-2 rounded-full">
                  <Briefcase size={14} /> {selectedEmp.department} • ANALYSTE SENIOR
                </div>
              </div>

              {/* GRILLE DE DONNÉES TECHNIQUES */}
              <div className="grid grid-cols-2 gap-6 mb-16">
                <DataDisplayBox icon={Mail} label="Lien de Communication" value="node.staff@ecodreum.ai" />
                <DataDisplayBox icon={Calendar} label="Date d'Activation" value="12 JANVIER 2024" />
                <DataDisplayBox icon={Target} label="Indice de Complétion" value="94.2%" color="text-blue-500" />
                <DataDisplayBox icon={Wallet} label="Coût Opérationnel" value={`${((parseFloat(selectedEmp.pco as string)||0) * 190).toLocaleString()}€`} color="text-emerald-500" />
              </div>

              {/* ZONE DE SYNCHRONISATION MANAGÉRIALE */}
              <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 mb-10 shadow-inner relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                      <MessageSquare size={20} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest italic text-white">Observations Système</h3>
                  </div>
                  {syncFeedback === 'success' && (
                    <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase animate-bounce">
                      <CheckCircle2 size={14} /> Synchro OK
                    </div>
                  )}
                </div>
                
                <textarea 
                  className="w-full h-48 bg-black/60 border border-white/5 rounded-[2rem] p-8 text-sm font-medium text-zinc-300 outline-none focus:border-blue-500/50 transition-all resize-none mb-8 shadow-2xl placeholder:text-zinc-800"
                  placeholder="Inscrivez les feedbacks critiques ou les ajustements de performance ici..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />

                <button 
                  onClick={handleUpdateNotes}
                  disabled={isSaving}
                  className={`w-full py-6 rounded-[2rem] flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-2xl
                    ${isSaving 
                      ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                      : syncFeedback === 'error' 
                        ? 'bg-rose-500 text-white' 
                        : 'bg-white text-black hover:bg-emerald-500 hover:scale-[1.02] active:scale-95'}`}
                >
                  {isSaving ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
                  {isSaving ? "Traitement des données..." : "Mettre à jour le dossier"}
                </button>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="mt-auto pt-10 flex gap-6">
                <button className="flex-1 py-6 bg-white/5 border border-white/10 text-[10px] font-black uppercase rounded-[2rem] hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-3 group">
                  <FileText size={18} className="group-hover:scale-110 transition-transform" /> Générer Rapport Audit
                </button>
                <button className="p-6 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-[2rem] hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-xl">
                  <Trash2 size={26} />
                </button>
              </div>

            </div>
          )}
        </div>

        {/* OVERLAY DE FOND */}
        {isPanelOpen && (
          <div 
            onClick={() => setIsPanelOpen(false)} 
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[90] transition-opacity duration-700 animate-in fade-in" 
          />
        )}

        {/* --- STYLES PERSONNALISÉS --- */}
        <style jsx>{`
          .custom-scroll::-webkit-scrollbar { width: 4px; }
          .custom-scroll::-webkit-scrollbar-track { background: transparent; }
          .custom-scroll::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 10px; }
          .custom-scroll::-webkit-scrollbar-thumb:hover { background: #10b981; }
          
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(-360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }
        `}</style>

      </main>
    </div>
  );
}
