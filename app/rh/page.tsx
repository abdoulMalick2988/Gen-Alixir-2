"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, ComposedChart
} from 'recharts';
import { 
  Users, Wallet, Clock, Activity, Search, ChevronRight, X,
  ShieldCheck, Zap, TrendingUp, Target, UserPlus, Mail, Calendar,
  MessageSquare, Star, Save, Trash2, Filter, AlertCircle, FileText
} from 'lucide-react';

/**
 * ARCHITECTURE TECHNIQUE DU MODULE RH
 * ----------------------------------
 * 1. MOTEUR ANALYTIQUE : Calcule les KPIs en temps réel (Masse salariale, Attrition).
 * 2. SYSTÈME DE CONTEXTE : Permet de basculer la vue du dashboard (Financier vs Social).
 * 3. DRILL-DOWN PANEL : Volet latéral pour la gestion granulaire d'un agent.
 * 4. FEEDBACK LOOP : Système de notes de performance pour les managers.
 */

const THEME = {
  emerald: "#10b981",
  blue: "#3b82f6",
  rose: "#f43f5e",
  amber: "#fbbf24",
  zinc: "#71717a",
  bg: "#020202",
  card: "rgba(255, 255, 255, 0.02)"
};

const CHART_PALETTE = [THEME.emerald, THEME.blue, "#8b5cf6", THEME.amber, THEME.rose];

// --- COMPOSANTS ATOMIQUES ---

/**
 * KPI Card avec détection d'état actif pour le switch de contexte
 */
const KPICard = ({ title, value, sub, icon: Icon, color, active, onClick }: any) => (
  <button 
    onClick={onClick} 
    className={`group relative p-6 rounded-[2.5rem] border transition-all duration-500 text-left overflow-hidden
      ${active ? 'bg-white/10 border-white/20 scale-[1.02] shadow-2xl' : 'bg-white/[0.02] border-white/5 hover:border-white/10 opacity-70 hover:opacity-100'}`}
  >
    <div className={`p-3 rounded-2xl w-fit mb-4 transition-transform group-hover:scale-110 ${active ? 'bg-white text-black' : 'bg-white/5 text-zinc-500'}`}>
      <Icon size={20} />
    </div>
    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">{title}</p>
    <div className="flex items-baseline gap-2">
      <h2 className="text-3xl font-black italic tracking-tighter" style={{ color: active ? '#fff' : color }}>{value}</h2>
      <span className="text-[8px] font-bold text-zinc-600 uppercase">{sub}</span>
    </div>
    {active && <div className="absolute top-0 right-0 p-4"><Zap size={12} className="text-emerald-500 animate-pulse" /></div>}
  </button>
);

/**
 * Boite de détail pour le volet latéral
 */
const DetailItem = ({ icon: Icon, label, value }: any) => (
  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-white/10 transition-colors">
    <Icon size={14} className="text-zinc-600 mb-2 group-hover:text-emerald-500 transition-colors" />
    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{label}</p>
    <p className="text-[11px] font-bold text-white uppercase mt-0.5 tracking-tight">{value}</p>
  </div>
);

export default function RHCommandMaster() {
  // --- ÉTATS ---
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'headcount' | 'payroll' | 'performance' | 'attrition'>('headcount');
  const [search, setSearch] = useState('');
  
  // États du volet latéral
  const [selectedEmp, setSelectedEmp] = useState<any | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [empNote, setEmpNote] = useState('');

  // --- RÉCUPÉRATION DES DONNÉES ---
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('staff').select('*').order('full_name', { ascending: true });
      if (!error) setEmployees(data || []);
      setLoading(false);
    }
    load();
  }, []);

  // --- MOTEUR ANALYTIQUE ---
  const analytics = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(e => e.status !== 'Parti').length;
    const departed = employees.filter(e => e.status === 'Parti').length;
    
    // Calcul Masse Salariale Complexe (PCO * Multiplicateur + Bonus Performance)
    const payroll = employees.reduce((acc, curr) => {
      const base = (Number(curr.pco || 0) * 185);
      const perfBonus = (curr.aura || 0) * 5;
      return acc + base + perfBonus;
    }, 0);

    const turnover = total > 0 ? ((departed / total) * 100).toFixed(1) : "0";

    // Distribution par département pour le PieChart
    const depts = employees.reduce((acc: any, curr) => {
      const d = curr.department || 'Non Assigné';
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});
    const deptData = Object.keys(depts).map(name => ({ name, value: depts[name] }));

    return { total, active, departed, payroll, turnover, deptData };
  }, [employees]);

  // Filtrage du tableau
  const filteredData = employees.filter(e => 
    e.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.toLowerCase().includes(search.toLowerCase())
  );

  // --- HANDLERS ---
  const handleOpenProfile = (emp: any) => {
    setSelectedEmp(emp);
    setEmpNote(emp.notes || ''); // On charge les notes si elles existent
    setIsPanelOpen(true);
  };

  const handleSaveNote = async () => {
    if (!selectedEmp) return;
    const { error } = await supabase
      .from('staff')
      .update({ notes: empNote })
      .eq('id', selectedEmp.id);
    
    if (!error) {
      setEmployees(employees.map(e => e.id === selectedEmp.id ? {...e, notes: empNote} : e));
      alert("NOTES SYNCHRONISÉES");
    }
  };

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[1em]">RH Intel Engine</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020202] text-white overflow-hidden font-sans selection:bg-emerald-500/30">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto custom-scroll relative">
        
        {/* SECTION : EN-TÊTE STRATÉGIQUE */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Système de Pilotage Actif</span>
            </div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
              RH <span className="text-emerald-500">COMMAND</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4 bg-white/[0.03] p-2 rounded-[2rem] border border-white/5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
              <input 
                className="bg-black/50 border border-white/5 rounded-2xl pl-12 pr-6 py-3 text-[10px] font-bold uppercase outline-none focus:border-emerald-500 w-72 transition-all"
                placeholder="Filtrer l'identité ou le secteur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="p-3 hover:bg-white/10 rounded-2xl transition-colors text-zinc-400">
               <Filter size={18} />
            </button>
          </div>
        </div>

        {/* SECTION : GRILLE KPI DYNAMIQUES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <KPICard 
            title="Effectif Total" 
            value={analytics.total} 
            sub="Contrats Actifs" 
            icon={Users} 
            color={THEME.blue} 
            active={viewMode === 'headcount'} 
            onClick={() => setViewMode('headcount')} 
          />
          <KPICard 
            title="Masse Salariale" 
            value={`${(analytics.payroll / 1000).toFixed(1)}k€`} 
            sub="Budget Mensuel" 
            icon={Wallet} 
            color={THEME.emerald} 
            active={viewMode === 'payroll'} 
            onClick={() => setViewMode('payroll')} 
          />
          <KPICard 
            title="Indice Performance" 
            value="74.2" 
            sub="Score Global" 
            icon={Star} 
            color={THEME.amber} 
            active={viewMode === 'performance'} 
            onClick={() => setViewMode('performance')} 
          />
          <KPICard 
            title="Taux Turnover" 
            value={`${analytics.turnover}%`} 
            sub="Attrition" 
            icon={Activity} 
            color={THEME.rose} 
            active={viewMode === 'attrition'} 
            onClick={() => setViewMode('attrition')} 
          />
        </div>

        {/* SECTION : ANALYSE VISUELLE & GRAPHES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-8 bg-white/[0.01] border border-white/5 rounded-[3rem] p-10">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-xs font-black uppercase italic tracking-widest flex items-center gap-3">
                 <TrendingUp size={16} className="text-emerald-500" /> Projection de croissance Q1/Q2
               </h3>
               <div className="text-[10px] font-black text-zinc-600 uppercase">Données Simulées vs Réelles</div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={employees.slice(0, 10)}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={THEME.emerald} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={THEME.emerald} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="full_name" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '12px'}} />
                  <Area type="monotone" dataKey="aura" stroke={THEME.emerald} fillOpacity={1} fill="url(#colorVal)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white/[0.01] border border-white/5 rounded-[3rem] p-10 flex flex-col justify-between">
            <h3 className="text-xs font-black uppercase italic tracking-widest mb-6">Répartition Secteurs</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analytics.deptData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                    {analytics.deptData.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % 5]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-2">
              {analytics.deptData.slice(0, 4).map((d, i) => (
                <div key={d.name} className="flex justify-between text-[10px] font-black uppercase">
                  <span className="text-zinc-500 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: CHART_PALETTE[i % 5]}}></div> {d.name}
                  </span>
                  <span>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION : REGISTRE OPÉRATIONNEL (TABLEAU) */}
        <section className="bg-white/[0.01] border border-white/5 rounded-[3rem] overflow-hidden mb-20">
          <div className="p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
            <h2 className="text-xl font-black italic uppercase tracking-tighter">Registre Global de Pilotage</h2>
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-[9px] font-black uppercase">
              {filteredData.length} Agents Monitorés
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-black/40 text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em] border-b border-white/5">
                <tr>
                  <th className="p-8">Agent / Identité</th>
                  <th className="p-8">Secteur</th>
                  <th className="p-8">{viewMode === 'payroll' ? 'Masse Salariale' : 'Score Aura'}</th>
                  <th className="p-8">Statut</th>
                  <th className="p-8 text-right">Analyse</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-bold">
                {filteredData.map((emp) => (
                  <tr 
                    key={emp.id} 
                    onClick={() => handleOpenProfile(emp)}
                    className="border-b border-white/[0.02] hover:bg-white/[0.03] transition-all cursor-pointer group"
                  >
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-emerald-500 font-black text-lg group-hover:border-emerald-500 transition-colors shadow-lg">
                          {emp.full_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="uppercase tracking-tight italic text-white group-hover:text-emerald-500 transition-colors">{emp.full_name}</p>
                          <p className="text-[8px] text-zinc-600 font-black uppercase">Ref: {emp.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-8 text-zinc-500 uppercase tracking-widest">{emp.department}</td>
                    <td className="p-8">
                       {viewMode === 'payroll' ? (
                         <span className="text-emerald-500 font-black italic">{(emp.pco * 185).toLocaleString()} €</span>
                       ) : (
                         <div className="flex items-center gap-3">
                            <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500" style={{width: `${emp.aura}%`}}></div>
                            </div>
                            <span className="text-blue-500 italic">{emp.aura}%</span>
                         </div>
                       )}
                    </td>
                    <td className="p-8">
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest 
                        ${emp.status === 'Parti' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                         {emp.status || 'ACTIF'}
                       </span>
                    </td>
                    <td className="p-8 text-right">
                      <div className="inline-flex p-3 bg-white/5 rounded-xl text-zinc-600 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-all">
                        <ChevronRight size={18} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* --- VOLET LATÉRAL (PROFIL DÉTAILLÉ) --- */}
        <div className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-[#080808] border-l border-white/10 z-50 transform transition-transform duration-700 ease-in-out shadow-[-50px_0_150px_rgba(0,0,0,0.9)] 
          ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          
          {selectedEmp && (
            <div className="h-full flex flex-col p-10 overflow-y-auto custom-scroll relative">
              
              {/* Actions Header */}
              <div className="flex justify-between items-center mb-12">
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500 text-[8px] font-black uppercase italic tracking-widest flex items-center gap-2">
                  <ShieldCheck size={10} /> Dossier Sécurisé
                </div>
                <button onClick={() => setIsPanelOpen(false)} className="p-3 bg-white/5 hover:bg-rose-500/20 hover:text-rose-500 rounded-2xl transition-all">
                  <X size={20} />
                </button>
              </div>

              {/* Identité */}
              <div className="flex flex-col items-center text-center mb-12">
                <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-black text-5xl font-black mb-6 shadow-2xl rotate-3">
                  {selectedEmp.full_name?.charAt(0)}
                </div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">{selectedEmp.full_name}</h2>
                <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                  <Briefcase size={12} /> {selectedEmp.department} • {selectedEmp.role || 'Senior Agent'}
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                <DetailItem icon={Mail} label="Communication" value="contact@rh-intel.ai" />
                <DetailItem icon={Calendar} label="Date Embauche" value="12 Mars 2024" />
                <DetailItem icon={Target} label="Objectif Q1" value="Atteint (102%)" />
                <DetailItem icon={Wallet} label="Masse Salariale" value={`${(selectedEmp.pco * 185).toLocaleString()}€`} />
              </div>

              {/* Zone de Notes Persistantes */}
              <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 mb-10">
                <div className="flex items-center gap-3 mb-6 text-zinc-400">
                  <MessageSquare size={16} className="text-blue-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Observations Manageriales</h3>
                </div>
                <textarea 
                  className="w-full h-32 bg-black/40 border border-white/5 rounded-2xl p-4 text-xs font-medium text-zinc-300 outline-none focus:border-blue-500 transition-all resize-none mb-4"
                  placeholder="Inscrivez les feedbacks, promotions ou alertes ici..."
                  value={empNote}
                  onChange={(e) => setEmpNote(e.target.value)}
                />
                <button 
                  onClick={handleSaveNote}
                  className="w-full py-4 bg-white/5 border border-white/10 hover:bg-emerald-500 hover:text-black rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all group"
                >
                  <Save size={14} className="group-hover:animate-bounce" /> Synchroniser les notes
                </button>
              </div>

              {/* Radar de Performance Simulé */}
              <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 mb-10">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                   <Activity size={14} className="text-rose-500" /> Évolution Performance
                 </h3>
                 <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={[ {n:'S1',v:40}, {n:'S2',v:70}, {n:'S3',v:selectedEmp.aura} ]}>
                          <Line type="monotone" dataKey="v" stroke={THEME.emerald} strokeWidth={4} dot={{r:6, fill:THEME.emerald}} />
                       </LineChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* Actions de Fin de Fiche */}
              <div className="mt-auto flex gap-4">
                 <button className="flex-1 py-4 bg-white text-black text-[10px] font-black uppercase rounded-2xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-2">
                   <FileText size={14} /> Exporter Rapport
                 </button>
                 <button className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all">
                   <Trash2 size={20} />
                 </button>
              </div>

            </div>
          )}
        </div>

        {/* Overlay flou */}
        {isPanelOpen && (
          <div 
            onClick={() => setIsPanelOpen(false)} 
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-opacity animate-in fade-in duration-500" 
          />
        )}

      </main>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #10b98133; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #10b981; }
      `}</style>
    </div>
  );
}
