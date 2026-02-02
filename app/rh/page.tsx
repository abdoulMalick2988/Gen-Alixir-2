"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area, FunnelChart, Funnel, LabelList
} from 'recharts';
import { 
  Users, UserCheck, UserMinus, TrendingUp, Filter, 
  MapPin, Briefcase, Calendar, ChevronDown, Download
} from 'lucide-react';

// --- COULEURS ET THÈME TACTIQUE ---
const COLORS = {
  growth: '#10b981', // Vert émeraude
  attrition: '#ef4444', // Rouge
  neutral: '#3b82f6', // Bleu
  gold: '#fbbf24', // Or
  purple: '#a855f7',
  zinc: ['#71717a', '#a1a1aa', '#d4d4d8', '#f4f4f5']
};

// --- COMPOSANT KPI CARD ---
const KPICard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="glass-card p-5 border border-white/5 flex flex-col gap-2 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-1 bg-${color}-500 h-full opacity-50`} />
    <div className="flex justify-between items-start">
      <div className="p-2 bg-white/5 rounded-lg">
        <Icon size={18} className={`text-${color}-500`} />
      </div>
      {change && (
        <span className={`text-[10px] font-black ${change > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {change > 0 ? '+' : ''}{change}%
        </span>
      )}
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-black italic text-white tracking-tighter">{value}</p>
    </div>
  </div>
);

export default function RHAnalytics() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtres globaux
  const [filters, setFilters] = useState({
    dept: 'Tous',
    contract: 'Tous',
    level: 'Tous'
  });

  useEffect(() => { fetchRHData(); }, []);

  async function fetchRHData() {
    const { data: employees, error } = await supabase.from('staff').select('*');
    if (!error) setData(employees || []);
    setLoading(false);
  }

  // --- LOGIQUE ANALYTIQUE (CALCULS) ---
  const stats = useMemo(() => {
    const filtered = data.filter(emp => {
      return (filters.dept === 'Tous' || emp.department === filters.dept) &&
             (filters.contract === 'Tous' || emp.contract_type === filters.contract) &&
             (filters.level === 'Tous' || emp.role === filters.level);
    });

    const active = filtered.filter(e => e.status === 'Actif').length;
    const departed = filtered.filter(e => e.status === 'Parti').length;
    const total = filtered.length;
    const attritionRate = total > 0 ? ((departed / total) * 100).toFixed(1) : 0;

    // Répartition par département (Donut)
    const deptMap = filtered.reduce((acc, curr) => {
      acc[curr.department] = (acc[curr.department] || 0) + 1;
      return acc;
    }, {});
    const deptData = Object.keys(deptMap).map(name => ({ name, value: deptMap[name] }));

    // Diversité Genre (Donut)
    const genderMap = filtered.reduce((acc, curr) => {
      acc[curr.gender || 'N/C'] = (acc[curr.gender || 'N/C'] || 0) + 1;
      return acc;
    }, {});
    const genderData = Object.keys(genderMap).map(name => ({ name, value: genderMap[name] }));

    // Stabilité (Barres horizontales)
    const stabilityData = [
      { range: '< 1 an', count: filtered.filter(e => (e.seniority || 0) < 1).length },
      { range: '1-3 ans', count: filtered.filter(e => (e.seniority || 0) >= 1 && (e.seniority || 0) < 3).length },
      { range: '3-5 ans', count: filtered.filter(e => (e.seniority || 0) >= 3 && (e.seniority || 0) < 5).length },
      { range: '5+ ans', count: filtered.filter(e => (e.seniority || 0) >= 5).length },
    ];

    // Reporting par Manager (Funnel)
    const managerMap = filtered.reduce((acc, curr) => {
        if(curr.manager_name) acc[curr.manager_name] = (acc[curr.manager_name] || 0) + 1;
        return acc;
    }, {});
    const managerData = Object.keys(managerMap)
        .map(name => ({ value: managerMap[name], name }))
        .sort((a, b) => b.value - a.value);

    return { active, departed, total, attritionRate, deptData, genderData, stabilityData, managerData };
  }, [data, filters]);

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-emerald-500 font-black animate-pulse">CHARGEMENT ANALYTICS...</div>;

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto custom-scroll flex flex-col gap-6">
        
        {/* HEADER & FILTRES GLOBAUX */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">RH <span className="text-emerald-500">Analytics</span></h1>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.4em]">Decision Support System v3.0</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select onChange={(e) => setFilters({...filters, dept: e.target.value})} className="bg-black border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase outline-none focus:border-emerald-500 transition-all">
              <option value="Tous">Tous les Départements</option>
              {Array.from(new Set(data.map(e => e.department))).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <button className="p-2.5 bg-emerald-500 text-black rounded-xl hover:scale-105 transition-transform"><Download size={18} /></button>
          </div>
        </header>

        {/* SECTION 1 : CARTES KPI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Effectif Global" value={stats.total} change={2.4} icon={Users} color="blue" />
          <KPICard title="Collaborateurs Actifs" value={stats.active} icon={UserCheck} color="emerald" />
          <KPICard title="Départs (Attrition)" value={stats.departed} icon={UserMinus} color="red" />
          <KPICard title="Taux d'Attrition" value={`${stats.attritionRate}%`} change={-1.2} icon={TrendingUp} color="gold" />
        </div>

        {/* SECTION 2 : GRAPHIQUES ANALYTIQUES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Évolution Headcount (Section 1 du prompt) */}
          <div className="lg:col-span-8 glass-card p-6 border border-white/5 min-h-[400px]">
            <h3 className="text-xs font-black uppercase mb-6 flex items-center gap-2 italic"><TrendingUp size={14} className="text-emerald-500"/> Croissance & Flux des Effectifs</h3>
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="created_at" tick={{fontSize: 8, fill: '#71717a'}} hide />
                <YAxis tick={{fontSize: 10, fill: '#71717a'}} />
                <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #333', fontSize: '10px'}} />
                <Area type="monotone" dataKey="aura" stroke="#10b981" fillOpacity={1} fill="url(#colorUv)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Répartition Département (Section 4 du prompt) */}
          <div className="lg:col-span-4 glass-card p-6 border border-white/5">
            <h3 className="text-xs font-black uppercase mb-6 italic">Structure Dépt. (%)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stats.deptData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {stats.deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{fontSize: '8px', textTransform: 'uppercase', fontWeight: 'bold'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stabilité & Rétention (Section 7 du prompt) */}
          <div className="lg:col-span-6 glass-card p-6 border border-white/5">
            <h3 className="text-xs font-black uppercase mb-6 flex items-center gap-2 italic"><Calendar size={14} className="text-blue-500"/> Stabilité du Personnel (Ancienneté)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.stabilityData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="range" type="category" tick={{fontSize: 10, fill: '#fff'}} width={70} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                    <LabelList dataKey="count" position="right" style={{fill: '#fff', fontSize: '10px', fontWeight: 'bold'}} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Reporting Manager Funnel (Section 5 du prompt) */}
          <div className="lg:col-span-6 glass-card p-6 border border-white/5">
            <h3 className="text-xs font-black uppercase mb-6 italic">Charge Managériale (Top Managers)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <FunnelChart>
                <Tooltip />
                <Funnel data={stats.managerData.slice(0,5)} dataKey="value" nameKey="name" fill="#fbbf24">
                  <LabelList position="right" fill="#fff" stroke="none" dataKey="name" style={{fontSize: '9px', fontWeight: 'bold'}} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* SECTION 3 : DIVERSITÉ & TYPE CONTRAT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="glass-card p-6 border border-white/5">
                <h3 className="text-xs font-black uppercase mb-6 italic">Diversité de Genre</h3>
                <div className="flex items-center justify-around">
                    <ResponsiveContainer width="50%" height={150}>
                        <PieChart>
                            <Pie data={stats.genderData} innerRadius={40} outerRadius={55} dataKey="value">
                                <Cell fill="#f472b6" /> {/* Femme */}
                                <Cell fill="#60a5fa" /> {/* Homme */}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                        {stats.genderData.map((g, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-pink-400' : 'bg-blue-400'}`} />
                                <span className="text-[10px] font-black uppercase">{g.name}: {g.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="glass-card p-6 border border-white/5">
                <h3 className="text-xs font-black uppercase mb-6 italic">Type d'Emploi (Stabilité)</h3>
                <div className="space-y-4">
                    {['CDI', 'CDD', 'Freelance'].map((type) => {
                        const count = data.filter(e => e.contract_type === type).length;
                        const perc = data.length > 0 ? (count / data.length) * 100 : 0;
                        return (
                            <div key={type} className="space-y-1">
                                <div className="flex justify-between text-[9px] font-black uppercase">
                                    <span>{type}</span>
                                    <span>{count} ({perc.toFixed(0)}%)</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{width: `${perc}%`}} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
