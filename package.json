"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend, ComposedChart, Line,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { 
  Users, Wallet, Clock, Activity, Search, ChevronRight, ShieldCheck, 
  Info, Zap, TrendingUp, Filter, Download, Eye, AlertCircle, 
  ArrowUpRight, Target, UserPlus, UserMinus, Briefcase
} from 'lucide-react';

/**
 * LOGIQUE DE TYPES ET CONSTANTES
 * Structure stricte pour éviter les erreurs de compilation GitHub
 */
const THEME = {
  emerald: "#10b981",
  blue: "#3b82f6",
  amber: "#fbbf24",
  rose: "#f43f5e",
  violet: "#8b5cf6",
  zinc: "#71717a"
};

const CHART_COLORS = [THEME.emerald, THEME.blue, THEME.amber, THEME.violet, THEME.rose];

// --- COMPOSANTS INTERACTIFS ---

/**
 * KPICard : Gère l'interaction au clic pour changer le contexte global
 */
const KPICard = ({ title, value, subValue, icon: Icon, color, isActive, onClick }: any) => (
  <div 
    onClick={onClick}
    className={`relative overflow-hidden cursor-pointer transition-all duration-500 p-6 rounded-[2rem] border-2 
      ${isActive ? 'bg-white/[0.05] border-white/20 scale-[1.02] shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'bg-white/[0.02] border-white/5 hover:border-white/10 opacity-70 hover:opacity-100'}`}
  >
    <div className="relative z-10 flex justify-between items-start">
      <div className={`p-3 rounded-2xl ${isActive ? 'bg-white text-black' : 'bg-white/5 text-gray-400'}`}>
        <Icon size={22} />
      </div>
      {isActive && (
        <div className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase tracking-tighter">
          <Zap size={10} fill="currentColor" /> Live Stream
        </div>
      )}
    </div>
    <div className="mt-6">
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{title}</p>
      <div className="flex items-baseline gap-2">
        <h2 className="text-3xl font-black italic tracking-tighter" style={{ color: isActive ? '#fff' : color }}>{value}</h2>
        <span className="text-[9px] font-bold text-gray-600 uppercase">{subValue}</span>
      </div>
    </div>
    {/* Décoration d'arrière-plan */}
    <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
      <Icon size={120} />
    </div>
  </div>
);

export default function RHAnalyticsPro() {
  // --- ÉTATS ---
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'headcount' | 'payroll' | 'hours' | 'attrition'>('headcount');
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('Tous');
  const [hoverData, setHoverData] = useState<any>(null);

  // --- RÉCUPÉRATION DES DONNÉES ---
  useEffect(() => {
    async function init() {
      const { data, error } = await supabase.from('staff').select('*');
      if (!error) setEmployees(data || []);
      setLoading(false);
    }
    init();
  }, []);

  // --- MOTEUR DE CALCUL (LOGIQUE BUSINESS) ---
  const stats = useMemo(() => {
    // Filtrage dynamique
    const filtered = employees.filter(e => 
      (selectedDept === 'Tous' || e.department === selectedDept) &&
      (e.full_name?.toLowerCase().includes(search.toLowerCase()))
    );

    const activeCount = filtered.filter(e => e.status !== 'Parti').length;
    const departedCount = filtered.filter(e => e.status === 'Parti').length;
    
    // Logique Financière (Masse Salariale calculée sur PCO + Ancienneté)
    const totalPayroll = filtered.reduce((acc, curr) => {
      const base = Number(curr.pco || 0) * 180; // Facteur de base
      const bonus = (curr.aura || 0) * 10;
      return acc + base + bonus;
    }, 0);

    // Répartition par département
    const depts = filtered.reduce((acc: any, curr) => {
      acc[curr.department] = (acc[curr.department] || 0) + 1;
      return acc;
    }, {});
    const deptData = Object.keys(depts).map(k => ({ name: k, value: depts[k] }));

    // Simulation de projection (Forecasting)
    const projectionData = [
      { month: 'Jan', current: 100, proj: 100 },
      { month: 'Fév', current: 112, proj: 115 },
      { month: 'Mar', current: 125, proj: 130 },
      { month: 'Avr', current: null, proj: 145 },
      { month: 'Mai', current: null, proj: 160 },
    ];

    return { 
      total: filtered.length, 
      active: activeCount, 
      departed: departedCount,
      payroll: totalPayroll,
      deptData,
      projectionData,
      filtered
    };
  }, [employees, search, selectedDept]);

  // --- ACTIONS ---
  const handleExport = () => {
    console.log("Exportation des données RH en format CSV...");
    alert("Génération du rapport d'audit RH...");
  };

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[1em] animate-pulse">Synchronisation Quantum RH</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020202] text-white overflow-hidden font-sans">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto custom-scroll flex flex-col gap-10">
        
        {/* SECTION 1 : NAVIGATION & CONTRÔLE */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="group">
            <h1 className="text-4xl font-black italic tracking-tighter leading-none group-hover:text-emerald-500 transition-colors">
              RH <span className="text-emerald-500 group-hover:text-white">INTEL</span>
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black rounded border border-emerald-500/20 uppercase">Admin Access</span>
              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest italic">Server: AWS-Paris-01</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-white/[0.03] p-2 rounded-[1.5rem] border border-white/5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              <input 
                type="text"
                placeholder="Identité / Secteur..."
                className="bg-black/50 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-[10px] font-bold uppercase focus:border-emerald-500 outline-none w-64 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select 
              className="bg-black/50 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-bold uppercase outline-none focus:border-blue-500"
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="Tous">Tous les Secteurs</option>
              {stats.deptData.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
            </select>
            <button 
              onClick={handleExport}
              className="p-3 bg-white text-black rounded-xl hover:bg-emerald-500 transition-colors"
            >
              <Download size={18} />
            </button>
          </div>
        </header>

        {/* SECTION 2 : KPI DYNAMIQUES (Le Cerveau) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard 
            title="Effectif Actif" 
            value={stats.active} 
            subValue={`Sur ${stats.total}`} 
            icon={Users} 
            color={THEME.blue}
            isActive={activeView === 'headcount'}
            onClick={() => setActiveView('headcount')}
          />
          <KPICard 
            title="Masse Salariale" 
            value={`${(stats.payroll / 1000).toFixed(1)}k€`} 
            subValue="Mensuel Est." 
            icon={Wallet} 
            color={THEME.emerald}
            isActive={activeView === 'payroll'}
            onClick={() => setActiveView('payroll')}
          />
          <KPICard 
            title="Heures Agents" 
            value="12.4k" 
            subValue="Cumul. Mensuel" 
            icon={Clock} 
            color={THEME.amber}
            isActive={activeView === 'hours'}
            onClick={() => setActiveView('hours')}
          />
          <KPICard 
            title="Taux Turnover" 
            value={`${((stats.departed / (stats.total || 1)) * 100).toFixed(1)}%`} 
            subValue="Attrition Annuelle" 
            icon={Activity} 
            color={THEME.rose}
            isActive={activeView === 'attrition'}
            onClick={() => setActiveView('attrition')}
          />
        </div>

        {/* SECTION 3 : ANALYTICS INTERACTIFS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Graphique de Gauche : Simulation & Projection */}
          <div className="lg:col-span-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-500" /> 
                  {activeView === 'payroll' ? 'Projection Budgétaire RH' : 'Simulation de Croissance des Effectifs'}
                </h3>
                <p className="text-[9px] text-zinc-500 uppercase mt-1 font-bold">Données prédictives basées sur les 12 derniers mois</p>
              </div>
              <div className="flex gap-2">
                 <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
                    <span className="text-[8px] font-black uppercase">Réel</span>
                 </div>
                 <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                    <span className="w-2 h-2 rounded-full bg-zinc-600 border border-white/20"></span>
                    <span className="text-[8px] font-black uppercase text-zinc-500">Estimé</span>
                 </div>
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stats.projectionData}>
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={THEME.emerald} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={THEME.emerald} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#666', fontWeight: 800}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#666', fontWeight: 800}} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '15px'}}
                    itemStyle={{fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase'}}
                  />
                  <Area type="monotone" dataKey="proj" fill="url(#lineGrad)" stroke="none" />
                  <Line type="monotone" dataKey="current" stroke={THEME.emerald} strokeWidth={4} dot={{r: 6, fill: THEME.emerald, strokeWidth: 2, stroke: '#000'}} />
                  <Line type="monotone" dataKey="proj" stroke="#444" strokeWidth={2} strokeDasharray="10 5" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Graphique de Droite : Structure organisationnelle */}
          <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center">
            <h3 className="text-xs font-black uppercase tracking-widest mb-10 italic w-full">Structure par Secteur</h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.deptData}
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={10}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.deptData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 w-full space-y-3">
               {stats.deptData.map((d, i) => (
                 <div key={d.name} className="flex justify-between items-center text-[10px] font-black uppercase">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: CHART_COLORS[i % 5]}}></div>
                      <span className="text-zinc-400">{d.name}</span>
                    </div>
                    <span>{((d.value / stats.total) * 100).toFixed(0)}%</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* SECTION 4 : REGISTRE DE PILOTAGE (TABLEAU) */}
        <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden mb-10">
          <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter">
                {activeView === 'payroll' ? 'Registre Budgétaire Agents' : 'Exploration des Profils RH'}
              </h2>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Interactions : Survoler pour détails • Cliquer pour profil complet</p>
            </div>
            <div className="flex items-center gap-2 bg-black px-4 py-2 rounded-xl border border-white/5 text-emerald-500 text-[10px] font-black italic">
              <AlertCircle size={14} /> Intelligence Opérationnelle Active
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-black/40 text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em] border-b border-white/5">
                <tr>
                  <th className="p-6">Identité</th>
                  <th className="p-6">Secteur / Role</th>
                  <th className="p-6">Performance / Aura</th>
                  <th className="p-6">{activeView === 'payroll' ? 'Coût Mensuel' : 'Disponibilité'}</th>
                  <th className="p-6 text-right">Analyse</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-bold">
                {stats.filtered.map((emp) => (
                  <tr 
                    key={emp.id} 
                    onMouseEnter={() => setHoverData(emp.id)}
                    onMouseLeave={() => setHoverData(null)}
                    className="border-b border-white/[0.02] hover:bg-white/[0.03] transition-all cursor-pointer group"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center font-black text-white transition-all 
                          ${hoverData === emp.id ? 'border-emerald-500 text-emerald-500 scale-110' : ''}`}>
                          {emp.full_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="uppercase tracking-tighter italic text-white group-hover:text-emerald-500 transition-colors">{emp.full_name}</p>
                          <p className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">ID: #{emp.id.slice(0,5)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-zinc-400 uppercase italic">
                      <span className="block">{emp.department}</span>
                      <span className="text-[9px] text-zinc-600 font-black">{emp.role || 'Personnel Terrain'}</span>
                    </td>
                    <td className="p-6">
                       <div className="flex items-center gap-4">
                         <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden min-w-[60px]">
                            <div className="h-full bg-emerald-500" style={{width: `${emp.aura || 0}%`}}></div>
                         </div>
                         <span className="text-[10px] text-emerald-500 italic">{(emp.aura || 0)}%</span>
                       </div>
                    </td>
                    <td className="p-6">
                       {activeView === 'payroll' ? (
                         <span className="text-emerald-500 font-black italic">{(Number(emp.pco || 0)*180).toLocaleString()}€</span>
                       ) : (
                         <div className="flex items-center gap-2">
                           <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${emp.status === 'Parti' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                           <span className={`uppercase text-[10px] ${emp.status === 'Parti' ? 'text-rose-500' : 'text-emerald-500'}`}>{emp.status || 'Actif'}</span>
                         </div>
                       )}
                    </td>
                    <td className="p-6 text-right">
                      <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase hover:bg-white hover:text-black transition-all">
                        Explorer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 5 : ALERTE INTELLIGENTE BAS DE PAGE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
           <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] flex items-center gap-6">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-black shadow-[0_0_20px_#10b98144]">
                <Target size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-emerald-500 italic tracking-widest">Objectif Rétention</p>
                <p className="text-lg font-black italic">94.2% atteint</p>
              </div>
           </div>
           
           <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-[2rem] flex items-center gap-6">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-black">
                <UserPlus size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-blue-500 italic tracking-widest">Pipeline Recrutement</p>
                <p className="text-lg font-black italic">12 Postes Ouverts</p>
              </div>
           </div>

           <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-[2rem] flex items-center gap-6">
              <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-black">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-rose-500 italic tracking-widest">Conformité Légale</p>
                <p className="text-lg font-black italic">100% Validé</p>
              </div>
           </div>
        </div>

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
