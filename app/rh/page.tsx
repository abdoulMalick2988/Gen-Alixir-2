"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area, FunnelChart, Funnel, LabelList
} from 'recharts';
import { 
  Users, UserCheck, UserMinus, TrendingUp, 
  Calendar, Download, AlertCircle, Loader2
} from 'lucide-react';

// --- CONFIGURATION DES COULEURS (Typage Strict) ---
const CHART_COLORS = [
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#fbbf24', // Amber
  '#f472b6', // Pink
  '#a855f7', // Purple
  '#f87171', // Red
];

// --- COMPOSANT KPI CARD ---
const KPICard = ({ title, value, change, icon: Icon, colorClass }: any) => (
  <div className="glass-card p-5 border border-white/5 flex flex-col gap-2 relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-1 h-full opacity-50 ${colorClass}`} />
    <div className="flex justify-between items-start">
      <div className="p-2 bg-white/5 rounded-lg">
        <Icon size={18} className="text-white/70" />
      </div>
      {change && (
        <span className={`text-[10px] font-black ${change > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
        </span>
      )}
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-black italic text-white tracking-tighter">{value}</p>
    </div>
  </div>
);

export default function RHAnalyticsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ dept: 'Tous', contract: 'Tous' });

  useEffect(() => {
    const fetchRHData = async () => {
      const { data: employees, error } = await supabase.from('staff').select('*');
      if (!error) setData(employees || []);
      setLoading(false);
    };
    fetchRHData();
  }, []);

  // --- LOGIQUE DÉCISIONNELLE ---
  const stats = useMemo(() => {
    const filtered = data.filter(emp => 
      (filters.dept === 'Tous' || emp.department === filters.dept) &&
      (filters.contract === 'Tous' || emp.contract_type === filters.contract)
    );

    const active = filtered.filter(e => e.status !== 'Parti').length;
    const departed = filtered.filter(e => e.status === 'Parti').length;
    const total = filtered.length;
    const attritionRate = total > 0 ? ((departed / total) * 100).toFixed(1) : "0";

    // Répartition Département (Donut)
    const deptMap = filtered.reduce((acc: any, curr) => {
      const d = curr.department || 'Inconnu';
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});
    const deptData = Object.keys(deptMap).map(name => ({ name, value: deptMap[name] }));

    // Stabilité (Barres)
    const stabilityData = [
      { range: '< 1 an', count: filtered.filter(e => (e.pco || 0) < 10).length },
      { range: '1-3 ans', count: filtered.filter(e => (e.pco || 0) >= 10 && (e.pco || 0) < 30).length },
      { range: '3+ ans', count: filtered.filter(e => (e.pco || 0) >= 30).length },
    ];

    // Managers Funnel
    const managerMap = filtered.reduce((acc: any, curr) => {
      if (curr.role?.includes('Manager') || curr.role?.includes('Lead')) {
          acc[curr.full_name] = (acc[curr.full_name] || 0) + 1;
      }
      return acc;
    }, {});
    const managerData = Object.keys(managerMap)
      .map(name => ({ value: managerMap[name], name }))
      .sort((a, b) => b.value - a.value);

    return { active, departed, total, attritionRate, deptData, stabilityData, managerData };
  }, [data, filters]);

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-emerald-500" size={40} />
      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Calcul des Analytics...</span>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto custom-scroll flex flex-col gap-6">
        
        {/* FILTRES & TITRE */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/5">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">RH <span className="text-emerald-500">Analytics</span></h1>
            <p className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.4em]">Dashboard de Pilotage Stratégique</p>
          </div>
          <div className="flex gap-3">
            <select 
              onChange={(e) => setFilters({...filters, dept: e.target.value})}
              className="bg-zinc-900 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase outline-none focus:border-emerald-500"
            >
              <option value="Tous">Tous les Secteurs</option>
              {Array.from(new Set(data.map(e => e.department))).filter(Boolean).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <button className="bg-emerald-500 text-black p-2.5 rounded-xl hover:bg-white transition-colors">
              <Download size={18} />
            </button>
          </div>
        </header>

        {/* 1. CARTES KPI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Effectif Total" value={stats.total} change={5} icon={Users} colorClass="bg-blue-500" />
          <KPICard title="Agents Actifs" value={stats.active} icon={UserCheck} colorClass="bg-emerald-500" />
          <KPICard title="Départs" value={stats.departed} icon={UserMinus} colorClass="bg-red-500" />
          <KPICard title="Taux d'Attrition" value={`${stats.attritionRate}%`} change={-2} icon={TrendingUp} colorClass="bg-amber-500" />
        </div>

        {/* 2. GRAPHIQUES ANALYTIQUES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* SECTION 1 : ÉVOLUTION EFFECTIFS */}
          <div className="lg:col-span-8 glass-card p-6 border border-white/5 min-h-[400px]">
            <h3 className="text-xs font-black uppercase mb-6 flex items-center gap-2 italic">
              <TrendingUp size={14} className="text-emerald-500"/> Croissance & Flux des Effectifs
            </h3>
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="id" hide />
                <YAxis tick={{fontSize: 10, fill: '#666'}} />
                <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #333'}} />
                <Area type="monotone" dataKey="pco" stroke="#10b981" fillOpacity={1} fill="url(#colorAcc)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* SECTION 4 : RÉPARTITION DÉPARTEMENT */}
          <div className="lg:col-span-4 glass-card p-6 border border-white/5">
            <h3 className="text-xs font-black uppercase mb-6 italic">Répartition par Secteur</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stats.deptData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {stats.deptData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{fontSize: '8px', paddingTop: '20px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* SECTION 7 : STABILITÉ DU PERSONNEL */}
          <div className="lg:col-span-6 glass-card p-6 border border-white/5">
            <h3 className="text-xs font-black uppercase mb-6 flex items-center gap-2 italic">
              <Calendar size={14} className="text-blue-500"/> Stabilité & Rétention
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.stabilityData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="range" type="category" tick={{fontSize: 10, fill: '#fff'}} width={70} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="count" position="right" style={{fill: '#fff', fontSize: '10px'}} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* SECTION 5 : CHARGE MANAGÉRIALE */}
          <div className="lg:col-span-6 glass-card p-6 border border-white/5">
            <h3 className="text-xs font-black uppercase mb-6 italic">Hiérarchie & Charge Managériale</h3>
            <ResponsiveContainer width="100%" height={250}>
              <FunnelChart>
                <Tooltip />
                <Funnel data={stats.managerData.slice(0,5)} dataKey="value" nameKey="name" fill="#fbbf24">
                  <LabelList position="right" fill="#fff" dataKey="name" style={{fontSize: '9px'}} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* SECTION DÉTAILS DIVERSITÉ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="glass-card p-6 border border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase italic mb-2">Structure de l'emploi</h3>
                  <p className="text-[9px] text-gray-500 uppercase">Ratio CDI / CDD / Freelance</p>
                </div>
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-xl font-black text-emerald-500">82%</p>
                    <p className="text-[7px] font-bold uppercase text-gray-500">Permanent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-black text-blue-500">18%</p>
                    <p className="text-[7px] font-bold uppercase text-gray-500">Contractuel</p>
                  </div>
                </div>
            </div>

            <div className="glass-card p-6 border border-white/5 bg-emerald-500/5">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-emerald-500" />
                  <div>
                    <h3 className="text-xs font-black uppercase italic text-emerald-500">Indicateur de Santé RH</h3>
                    <p className="text-[9px] text-white/70 mt-1 uppercase">Le climat social est stable. Risque d'attrition faible dans les secteurs clés.</p>
                  </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
