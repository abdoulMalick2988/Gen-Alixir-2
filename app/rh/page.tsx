"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, ComposedChart
} from 'recharts';

/**
 * IMPORTATION DES ICÔNES LUCIDE
 * Note : Briefcase est inclus ici pour corriger l'erreur de compilation Vercel.
 */
import { 
  Users, Wallet, Clock, Activity, Search, ChevronRight, X,
  ShieldCheck, Zap, TrendingUp, Target, UserPlus, Mail, Calendar,
  MessageSquare, Star, Save, Trash2, Filter, AlertCircle, FileText,
  Briefcase, ArrowUpRight, Award, BriefcaseIcon
} from 'lucide-react';

/**
 * CONFIGURATION DU DESIGN SYSTEM
 * Couleurs haute fidélité pour un rendu "Command Center".
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

// --- COMPOSANTS INTERNES RÉUTILISABLES ---

/**
 * Carte KPI avec détection d'état et feedback visuel au clic.
 */
const KPICard = ({ title, value, sub, icon: Icon, color, active, onClick }: any) => (
  <button 
    onClick={onClick} 
    className={`group relative p-8 rounded-[2.5rem] border transition-all duration-500 text-left overflow-hidden w-full
      ${active ? 'bg-white/10 border-white/20 scale-[1.02] shadow-[0_20px_50px_rgba(0,0,0,0.4)]' : 'bg-white/[0.02] border-white/5 hover:border-white/10 opacity-80 hover:opacity-100'}`}
  >
    <div className={`p-4 rounded-2xl w-fit mb-6 transition-all duration-500 ${active ? 'bg-white text-black rotate-3' : 'bg-white/5 text-zinc-500 group-hover:bg-white/10'}`}>
      <Icon size={24} />
    </div>
    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.25em] mb-1">{title}</p>
    <div className="flex items-baseline gap-2">
      <h2 className="text-4xl font-black italic tracking-tighter" style={{ color: active ? '#fff' : color }}>{value}</h2>
      <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{sub}</span>
    </div>
    {active && (
      <div className="absolute top-0 right-0 p-6">
        <Zap size={14} className="text-emerald-500 animate-pulse" />
      </div>
    )}
    <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
      <Icon size={100} />
    </div>
  </button>
);

/**
 * Bloc d'information structuré pour le volet latéral.
 */
const DataBox = ({ icon: Icon, label, value, color = "text-white" }: any) => (
  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl group hover:bg-white/[0.04] transition-all">
    <Icon size={16} className="text-zinc-600 mb-3 group-hover:text-emerald-500 transition-colors" />
    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</p>
    <p className={`text-xs font-bold uppercase mt-1 tracking-tight ${color}`}>{value}</p>
  </div>
);

export default function RHCommandMaster() {
  // --- ÉTATS GLOBAUX ---
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewContext, setViewContext] = useState<'headcount' | 'payroll' | 'performance' | 'attrition'>('headcount');
  const [searchQuery, setSearchQuery] = useState('');
  
  // --- ÉTATS DU VOLET LATÉRAL ---
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [managerNote, setManagerNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // --- CHARGEMENT DES DONNÉES SUPABASE ---
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase
          .from('staff')
          .select('*')
          .order('full_name', { ascending: true });
        
        if (error) throw error;
        setEmployees(data || []);
      } catch (err) {
        console.error("Critical Database Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // --- MOTEUR ANALYTIQUE (LOGIQUE BUSINESS) ---
  const analytics = useMemo(() => {
    const total = employees.length;
    const activeList = employees.filter(e => e.status !== 'Parti');
    const departedList = employees.filter(e => e.status === 'Parti');
    
    // Calcul de la masse salariale (PCO converti en valeur monétaire + Bonus Aura)
    const totalPayroll = employees.reduce((acc, curr) => {
      const basePay = (Number(curr.pco || 0) * 192); // Taux horaire simulé
      const performanceBonus = (curr.aura || 0) * 4.5;
      return acc + basePay + performanceBonus;
    }, 0);

    const attritionRate = total > 0 ? ((departedList.length / total) * 100).toFixed(1) : "0";

    // Répartition par secteurs pour les graphiques
    const sectorCounts = employees.reduce((acc: any, curr) => {
      const dept = curr.department || 'Opérations';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
    
    const chartData = Object.keys(sectorCounts).map(name => ({
      name: name.toUpperCase(),
      value: sectorCounts[name]
    }));

    return { total, activeCount: activeList.length, totalPayroll, attritionRate, chartData };
  }, [employees]);

  // Filtrage intelligent
  const filteredEmployees = employees.filter(emp => 
    (emp.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.department || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- ACTIONS ---
  const handleSelectEmployee = (emp: any) => {
    setSelectedEmp(emp);
    setManagerNote(emp.notes || "");
    setIsPanelOpen(true);
  };

  const saveEmployeeNote = async () => {
    if (!selectedEmp) return;
    setIsSaving(true);
    const { error } = await supabase
      .from('staff')
      .update({ notes: managerNote })
      .eq('id', selectedEmp.id);
    
    if (!error) {
      setEmployees(employees.map(e => e.id === selectedEmp.id ? { ...e, notes: managerNote } : e));
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-6">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[1.5em] animate-pulse">Initialisation RH Intel</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020202] text-white overflow-hidden font-sans selection:bg-emerald-500/30">
      <Sidebar />
      
      <main className="flex-1 p-10 overflow-y-auto custom-scroll relative">
        
        {/* --- HEADER STRATÉGIQUE --- */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-emerald-500 text-black text-[9px] font-black uppercase rounded tracking-widest">Live System</div>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.3em]">Bujumbura Node // 2026</span>
            </div>
            <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none">
              RH <span className="text-emerald-500">COMMAND</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4 bg-white/[0.03] p-3 rounded-[2.5rem] border border-white/5 shadow-2xl">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input 
                className="bg-black/50 border border-white/5 rounded-2xl pl-14 pr-8 py-4 text-[11px] font-bold uppercase outline-none focus:border-emerald-500 w-80 transition-all placeholder:text-zinc-700"
                placeholder="RECHERCHER AGENT OU SECTEUR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="p-4 hover:bg-white/5 rounded-2xl text-zinc-500 transition-all hover:text-white">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* --- GRILLE DES KPIs --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <KPICard title="Effectif Global" value={analytics.total} sub="Contrats" icon={Users} color={THEME.blue} active={viewContext === 'headcount'} onClick={() => setViewContext('headcount')} />
          <KPICard title="Masse Salariale" value={`${(analytics.totalPayroll / 1000).toFixed(1)}k€`} sub="Budget Est." icon={Wallet} color={THEME.emerald} active={viewContext === 'payroll'} onClick={() => setViewContext('payroll')} />
          <KPICard title="Score Aura" value="78.4" sub="Performance" icon={Award} color={THEME.amber} active={viewContext === 'performance'} onClick={() => setViewContext('performance')} />
          <KPICard title="Taux Attrition" value={`${analytics.turnover}%`} sub="Risque" icon={Activity} color={THEME.rose} active={viewContext === 'attrition'} onClick={() => setViewContext('attrition')} />
        </div>

        {/* --- ANALYSE GRAPHIQUE --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          <div className="lg:col-span-8 bg-white/[0.01] border border-white/5 rounded-[3.5rem] p-12 relative overflow-hidden">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h3 className="text-sm font-black uppercase italic tracking-widest flex items-center gap-3">
                  <TrendingUp size={20} className="text-emerald-500" /> Courbe de Croissance RH
                </h3>
                <p className="text-[9px] text-zinc-600 uppercase font-bold mt-2">Projection basée sur l'évolution du score Aura</p>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={employees.slice(0, 12)}>
                  <defs>
                    <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={THEME.emerald} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={THEME.emerald} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="full_name" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#050505', border: '1px solid #1a1a1a', borderRadius: '20px', padding: '15px'}}
                    itemStyle={{fontSize: '11px', fontWeight: '900', textTransform: 'uppercase'}}
                  />
                  <Area type="monotone" dataKey="aura" stroke={THEME.emerald} strokeWidth={5} fill="url(#areaColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white/[0.01] border border-white/5 rounded-[3.5rem] p-12">
            <h3 className="text-sm font-black uppercase italic tracking-widest mb-10">Répartition Secteurs</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analytics.chartData} innerRadius={75} outerRadius={100} paddingAngle={10} dataKey="value">
                    {analytics.chartData.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % 5]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-10 space-y-4">
              {analytics.chartData.map((d, i) => (
                <div key={d.name} className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-zinc-500 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: CHART_PALETTE[i % 5]}}></div> {d.name}
                  </span>
                  <span>{d.value} AGENTS</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- REGISTRE DES AGENTS --- */}
        <section className="bg-white/[0.01] border border-white/5 rounded-[3.5rem] overflow-hidden mb-24 shadow-2xl">
          <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter italic">Base de Pilotage Agents</h2>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Export CSV</button>
              <button className="px-6 py-3 bg-emerald-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105">Nouvel Agent</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-black/60 text-[10px] text-zinc-600 font-black uppercase tracking-[0.25em] border-b border-white/5">
                <tr>
                  <th className="p-10">Identité & Role</th>
                  <th className="p-10">Secteur</th>
                  <th className="p-10">{viewContext === 'payroll' ? 'Masse Salariale' : 'Score Aura'}</th>
                  <th className="p-10">Statut</th>
                  <th className="p-10 text-right">Analyse</th>
                </tr>
              </thead>
              <tbody className="text-[12px] font-bold">
                {filteredEmployees.map((emp) => (
                  <tr 
                    key={emp.id} 
                    onClick={() => handleSelectEmployee(emp)}
                    className="border-b border-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer group"
                  >
                    <td className="p-10">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-emerald-500 font-black text-xl group-hover:border-emerald-500 transition-all shadow-xl group-hover:scale-110">
                          {emp.full_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="uppercase tracking-tight italic text-lg text-white group-hover:text-emerald-500 transition-colors leading-none">{emp.full_name}</p>
                          <p className="text-[9px] text-zinc-600 font-black uppercase mt-1 tracking-widest">UID: {emp.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-10 text-zinc-400 uppercase tracking-widest italic">{emp.department}</td>
                    <td className="p-10">
                      {viewContext === 'payroll' ? (
                        <div className="flex flex-col">
                          <span className="text-emerald-500 font-black text-lg italic">{(emp.pco * 192).toLocaleString()} €</span>
                          <span className="text-[8px] text-zinc-600 uppercase">Projection Mensuelle</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" style={{width: `${emp.aura}%`}}></div>
                          </div>
                          <span className="text-blue-500 font-black italic">{emp.aura}%</span>
                        </div>
                      )}
                    </td>
                    <td className="p-10">
                      <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border 
                        ${emp.status === 'Parti' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                        {emp.status || 'OPÉRATIONNEL'}
                      </span>
                    </td>
                    <td className="p-10 text-right">
                      <div className="inline-flex p-4 bg-white/5 rounded-2xl text-zinc-700 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-all">
                        <ArrowUpRight size={22} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* --- VOLET LATÉRAL : PROFIL DRILL-DOWN --- */}
        <div className={`fixed top-0 right-0 h-full w-full sm:w-[550px] bg-[#080808] border-l border-white/10 z-50 transform transition-transform duration-700 ease-in-out shadow-[-50px_0_150px_rgba(0,0,0,0.9)] 
          ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          
          {selectedEmp && (
            <div className="h-full flex flex-col p-12 overflow-y-auto custom-scroll relative">
              
              {/* Header du volet */}
              <div className="flex justify-between items-center mb-16">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-emerald-500" size={18} />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Profil Haute Sécurité</span>
                </div>
                <button onClick={() => setIsPanelOpen(false)} className="p-4 bg-white/5 hover:bg-rose-500/20 hover:text-rose-500 rounded-2xl transition-all">
                  <X size={24} />
                </button>
              </div>

              {/* Identité visuelle */}
              <div className="flex flex-col items-center text-center mb-16">
                <div className="relative">
                  <div className="w-40 h-40 rounded-[3rem] bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-black text-6xl font-black mb-8 shadow-[0_20px_60px_rgba(16,185,129,0.3)] rotate-3">
                    {selectedEmp.full_name?.charAt(0)}
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-3 bg-black border border-white/10 rounded-2xl text-emerald-500">
                    <Award size={20} />
                  </div>
                </div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-3 leading-none">{selectedEmp.full_name}</h2>
                <div className="flex items-center gap-3 text-[11px] font-black text-zinc-500 uppercase tracking-widest">
                  <Briefcase size={14} /> {selectedEmp.department} • AGENT SENIOR
                </div>
              </div>

              {/* Grid des données détaillées */}
              <div className="grid grid-cols-2 gap-5 mb-12">
                <DataBox icon={Mail} label="Email Professionnel" value="staff.node@intel.ai" />
                <DataBox icon={Calendar} label="Date d'Activation" value="15 Janvier 2024" />
                <DataBox icon={Target} label="Objectif Trimestriel" value="94% Complété" color="text-blue-500" />
                <DataBox icon={Wallet} label="Masse Mensuelle" value={`${(selectedEmp.pco * 192).toLocaleString()} €`} color="text-emerald-500" />
              </div>

              {/* Zone Manageriale (Persistante) */}
              <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 mb-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                    <MessageSquare size={18} />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest italic">Observations de Pilotage</h3>
                </div>
                <textarea 
                  className="w-full h-40 bg-black/60 border border-white/5 rounded-3xl p-6 text-sm font-medium text-zinc-300 outline-none focus:border-blue-500 transition-all resize-none mb-6 shadow-inner"
                  placeholder="Inscrivez les feedbacks de performance ou les alertes comportementales ici..."
                  value={managerNote}
                  onChange={(e) => setManagerNote(e.target.value)}
                />
                <button 
                  onClick={saveEmployeeNote}
                  disabled={isSaving}
                  className={`w-full py-5 rounded-3xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest transition-all
                    ${isSaving ? 'bg-zinc-800 text-zinc-500' : 'bg-white text-black hover:bg-emerald-500 hover:scale-[1.02]'}`}
                >
                  {isSaving ? <Zap className="animate-spin" size={16} /> : <Save size={16} />}
                  {isSaving ? "Synchronisation..." : "Enregistrer les notes"}
                </button>
              </div>

              {/* Footer du Profil */}
              <div className="mt-auto pt-10 flex gap-5">
                <button className="flex-1 py-5 bg-white/5 border border-white/10 text-[10px] font-black uppercase rounded-3xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3">
                  <FileText size={16} /> Rapport d'Audit
                </button>
                <button className="p-5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-3xl hover:bg-rose-500 hover:text-white transition-all">
                  <Trash2 size={24} />
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Overlay flou d'arrière-plan */}
        {isPanelOpen && (
          <div 
            onClick={() => setIsPanelOpen(false)} 
            className="fixed inset-0 bg-black/70 backdrop-blur-xl z-40 transition-opacity animate-in fade-in duration-700" 
          />
        )}

      </main>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #10b98133; border-radius: 20px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #10b981; }
      `}</style>
    </div>
  );
}
