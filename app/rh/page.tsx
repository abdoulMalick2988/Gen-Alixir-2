"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area, FunnelChart, Funnel, LabelList,
  ComposedChart, Line
} from 'recharts';
import { 
  Users, UserCheck, UserMinus, TrendingUp, Calendar, 
  Download, Loader2, Edit3, Check, X, ShieldAlert,
  Briefcase, MapPin, Filter, MoreHorizontal, Info
} from 'lucide-react';

// --- CONFIGURATION DU THÈME ---
const COLORS = {
  emerald: '#10b981',
  blue: '#3b82f6',
  amber: '#fbbf24',
  rose: '#f43f5e',
  violet: '#8b5cf6',
  slate: '#94a3b8'
};

const CHART_PALETTE = [COLORS.emerald, COLORS.blue, COLORS.amber, COLORS.violet, COLORS.rose, COLORS.slate];

export default function RHAnalyticsComplete() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'analytics' | 'management'>('analytics');

  // Filtres globaux
  const [filters, setFilters] = useState({ dept: 'Tous', contract: 'Tous' });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const { data: employees, error } = await supabase.from('staff').select('*').order('hire_date', { ascending: true });
    if (!error) setData(employees || []);
    setLoading(false);
  }

  // --- LOGIQUE DE CALCUL ANALYTIQUE (SÉCURISÉE) ---
  const analytics = useMemo(() => {
    const filtered = data.filter(emp => 
      (filters.dept === 'Tous' || emp.department === filters.dept) &&
      (filters.contract === 'Tous' || emp.contract_type === filters.contract)
    );

    const total = filtered.length;
    const active = filtered.filter(e => e.status === 'Actif').length;
    const departed = filtered.filter(e => e.status === 'Parti').length;
    const attritionRate = total > 0 ? ((departed / total) * 100).toFixed(1) : "0";

    // 1. Répartition par Département (Donut)
    const deptMap = filtered.reduce((acc: any, curr) => {
      const d = curr.department || 'Non assigné';
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});
    const deptData = Object.keys(deptMap).map(name => ({ name, value: deptMap[name] }));

    // 2. Stabilité (Seniority)
    const stabilityData = [
      { range: '< 1 an', count: filtered.filter(e => {
        const years = e.hire_date ? (new Date().getFullYear() - new Date(e.hire_date).getFullYear()) : 0;
        return years < 1;
      }).length },
      { range: '1-3 ans', count: filtered.filter(e => {
        const years = e.hire_date ? (new Date().getFullYear() - new Date(e.hire_date).getFullYear()) : 0;
        return years >= 1 && years < 3;
      }).length },
      { range: '4+ ans', count: filtered.filter(e => {
        const years = e.hire_date ? (new Date().getFullYear() - new Date(e.hire_date).getFullYear()) : 0;
        return years >= 4;
      }).length }
    ];

    // 3. Diversité Genre
    const genderMap = filtered.reduce((acc: any, curr) => {
      const g = curr.gender || 'N/C';
      acc[g] = (acc[g] || 0) + 1;
      return acc;
    }, {});
    const genderData = Object.keys(genderMap).map(name => ({ name, value: genderMap[name] }));

    // 4. Funnel Managérial (Charge par manager)
    const managerMap = filtered.reduce((acc: any, curr) => {
      if (curr.manager_name) acc[curr.manager_name] = (acc[curr.manager_name] || 0) + 1;
      return acc;
    }, {});
    const managerData = Object.keys(managerMap)
      .map(name => ({ value: managerMap[name], name }))
      .sort((a, b) => b.value - a.value);

    return { total, active, departed, attritionRate, deptData, stabilityData, genderData, managerData, filtered };
  }, [data, filters]);

  // --- ACTIONS ---
  const handleUpdate = async () => {
    const { error } = await supabase.from('staff').update(editForm).eq('id', editingId);
    if (!error) {
      setEditingId(null);
      fetchData();
    }
  };

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500">Synchronisation des données RH...</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto custom-scroll flex flex-col gap-6">
        
        {/* HEADER TACTIQUE */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <ShieldAlert size={28} className="text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">RH <span className="text-emerald-500">Command</span></h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest italic">Intelligence Artificielle de Gestion • Live</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10">
            <button onClick={() => setActiveTab('analytics')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'analytics' ? 'bg-emerald-500 text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>Analytics</button>
            <button onClick={() => setActiveTab('management')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'management' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}>Management</button>
          </div>
        </header>

        {activeTab === 'analytics' ? (
          <>
            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Effectif Global" value={analytics.total} sub="Headcount" icon={Users} color="#3b82f6" />
              <StatCard title="Agents Actifs" value={analytics.active} sub="Operational" icon={UserCheck} color="#10b981" />
              <StatCard title="Sorties (Attrition)" value={analytics.departed} sub="Turnover" icon={UserMinus} color="#f43f5e" />
              <StatCard title="Taux d'Attrition" value={`${analytics.attritionRate}%`} sub="Annual Risk" icon={TrendingUp} color="#fbbf24" />
            </div>

            {/* GRAPHIQUES ANALYTICS SECTION 1 & 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* CROISSANCE NETTE */}
              <div className="lg:col-span-8 glass-card p-6 border border-white/5 min-h-[400px]">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xs font-black uppercase italic flex items-center gap-2"><TrendingUp size={16} className="text-emerald-500"/> Évolution des Effectifs (Flux Net)</h3>
                  <select className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase">
                    <option>Année 2026</option>
                  </select>
                </div>
                <ResponsiveContainer width="100%" height="90%">
                  <ComposedChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="hire_date" hide />
                    <YAxis tick={{fontSize: 10, fill: '#666'}} />
                    <Tooltip contentStyle={{backgroundColor: '#000', border: 'none', borderRadius: '12px', fontSize: '10px'}} />
                    <Area type="monotone" dataKey="pco" fill="#10b98110" stroke="#10b981" strokeWidth={3} />
                    <Line type="monotone" dataKey="aura" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* DÉPARTEMENTS */}
              <div className="lg:col-span-4 glass-card p-6 border border-white/5">
                <h3 className="text-xs font-black uppercase mb-8 italic">Structure Organisationnelle (%)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={analytics.deptData} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                      {analytics.deptData.map((_, i) => <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" wrapperStyle={{fontSize: '9px', textTransform: 'uppercase', fontWeight: 'bold'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* STABILITÉ & FUNNEL */}
              <div className="lg:col-span-6 glass-card p-6 border border-white/5">
                <h3 className="text-xs font-black uppercase mb-6 flex items-center gap-2 italic"><Calendar size={16} className="text-blue-500"/> Stabilité & Rétention du Personnel</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.stabilityData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="range" type="category" tick={{fontSize: 10, fill: '#fff'}} width={80} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                      <LabelList dataKey="count" position="right" style={{fill: '#fff', fontSize: '10px', fontWeight: 'bold'}} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="lg:col-span-6 glass-card p-6 border border-white/5">
                <h3 className="text-xs font-black uppercase mb-6 italic text-amber-500">Reporting RH par Manager (Top 5)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <FunnelChart>
                    <Tooltip />
                    <Funnel data={analytics.managerData.slice(0,5)} dataKey="value" nameKey="name" fill="#fbbf24" opacity={0.8}>
                      <LabelList position="right" fill="#fff" dataKey="name" style={{fontSize: '9px', fontWeight: 'bold'}} />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          /* ESPACE DE MANAGEMENT COMPLET */
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-card border border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h2 className="text-sm font-black uppercase tracking-widest italic">Base de Données des Effectifs</h2>
                <div className="flex gap-4">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input type="text" placeholder="Rechercher un agent..." className="bg-black border border-white/10 pl-10 pr-4 py-2 rounded-xl text-[10px] outline-none focus:border-emerald-500 w-64" />
                  </div>
                </div>
              </div>
              
              <table className="w-full text-left">
                <thead className="bg-black text-[9px] font-black uppercase text-gray-500 border-b border-white/5">
                  <tr>
                    <th className="p-5">Agent</th>
                    <th className="p-5">Département</th>
                    <th className="p-5">Type Contrat</th>
                    <th className="p-5">Statut</th>
                    <th className="p-5">Manager</th>
                    <th className="p-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-[11px]">
                  {analytics.filtered.map((emp) => (
                    <tr key={emp.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center font-black text-emerald-500">
                            {emp.full_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black uppercase italic text-white">{emp.full_name}</p>
                            <p className="text-[8px] text-gray-500 font-bold uppercase">{emp.role || 'Agent Terrain'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        {editingId === emp.id ? (
                          <input className="edit-input" value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} />
                        ) : (
                          <span className="text-gray-400 font-bold uppercase">{emp.department}</span>
                        )}
                      </td>
                      <td className="p-5">
                        {editingId === emp.id ? (
                          <select className="edit-input" value={editForm.contract_type} onChange={e => setEditForm({...editForm, contract_type: e.target.value})}>
                            <option value="CDI">CDI</option><option value="CDD">CDD</option><option value="Freelance">Freelance</option>
                          </select>
                        ) : (
                          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black">{emp.contract_type || 'CDI'}</span>
                        )}
                      </td>
                      <td className="p-5">
                        {editingId === emp.id ? (
                          <select className="edit-input" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                            <option value="Actif">Actif</option><option value="Parti">Parti</option><option value="Congé">Congé</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${emp.status === 'Parti' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                            <span className={`font-black uppercase text-[10px] ${emp.status === 'Parti' ? 'text-red-500' : 'text-emerald-500'}`}>{emp.status || 'Actif'}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-5 text-gray-500 font-bold">{emp.manager_name || 'N/A'}</td>
                      <td className="p-5 text-right">
                        {editingId === emp.id ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={handleUpdate} className="p-2 bg-emerald-500 text-black rounded-lg"><Check size={14} /></button>
                            <button onClick={() => setEditingId(null)} className="p-2 bg-red-500/20 text-red-500 rounded-lg"><X size={14} /></button>
                          </div>
                        ) : (
                          <button onClick={() => {setEditingId(emp.id); setEditForm(emp);}} className="p-2 hover:bg-white/10 text-gray-400 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                            <Edit3 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      <style jsx>{`
        .edit-input {
          background: black;
          border: 1px solid #10b981;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 10px;
          text-transform: uppercase;
          color: white;
          outline: none;
        }
      `}</style>
    </div>
  );
}

// --- SOUS-COMPOSANT KPI ---
function StatCard({ title, value, sub, icon: Icon, color }: any) {
  return (
    <div className="glass-card p-6 border border-white/5 relative overflow-hidden group hover:border-white/20 transition-all">
      <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform">
        <Icon size={100} color={color} />
      </div>
      <div className="flex flex-col gap-1 relative z-10">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{title}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black italic tracking-tighter" style={{color}}>{value}</p>
          <span className="text-[8px] font-bold text-gray-600 uppercase">{sub}</span>
        </div>
      </div>
    </div>
  );
}
