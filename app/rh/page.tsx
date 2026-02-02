"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/Sidebar";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area, FunnelChart, Funnel, LabelList
} from 'recharts';
import { 
  Users, UserCheck, UserMinus, TrendingUp, Calendar, 
  Download, Loader2, Edit3, Trash2, Check, X, ShieldAlert
} from 'lucide-react';

const CHART_COLORS = ['#10b981', '#3b82f6', '#fbbf24', '#f472b6', '#a855f7', '#f87171'];

export default function RHAnalyticsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => { fetchRHData(); }, []);

  async function fetchRHData() {
    const { data: employees } = await supabase.from('staff').select('*').order('full_name');
    if (employees) setData(employees);
    setLoading(false);
  }

  // --- ACTIONS DE MANAGEMENT ---
  const startEdit = (emp: any) => {
    setEditingId(emp.id);
    setEditForm(emp);
  };

  const saveChanges = async () => {
    const { error } = await supabase.from('staff').update({
        status: editForm.status,
        contract_type: editForm.contract_type,
        department: editForm.department,
        aura: editForm.aura
    }).eq('id', editingId);

    if (!error) {
        setEditingId(null);
        fetchRHData();
    }
  };

  // --- LOGIQUE ANALYTIQUE (KPIs) ---
  const stats = useMemo(() => {
    const active = data.filter(e => e.status === 'Actif').length;
    const departed = data.filter(e => e.status === 'Parti').length;
    const total = data.length;
    
    const deptMap = data.reduce((acc: any, curr) => {
      acc[curr.department] = (acc[curr.department] || 0) + 1;
      return acc;
    }, {});
    const deptData = Object.keys(deptMap).map(name => ({ name, value: deptMap[name] }));

    return { active, departed, total, deptData };
  }, [data]);

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-emerald-500 font-black animate-pulse">CHARGEMENT ANALYTICS...</div>;

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto custom-scroll flex flex-col gap-8">
        
        {/* HEADER ANALYTICS */}
        <header className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/5">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">RH <span className="text-emerald-500">Analytics</span></h1>
            <p className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.4em]">Secteur de Management & Décision</p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 font-black text-[10px] uppercase italic flex items-center gap-2">
            <ShieldAlert size={16} /> Mode Administrateur Actif
          </div>
        </header>

        {/* 1. SECTION GRAPHIQUES (KPI & DONUT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 grid grid-cols-3 gap-4">
                <div className="glass-card p-4 border-l-4 border-blue-500">
                    <p className="text-[8px] font-black text-gray-500 uppercase">Headcount</p>
                    <p className="text-2xl font-black italic">{stats.total}</p>
                </div>
                <div className="glass-card p-4 border-l-4 border-emerald-500">
                    <p className="text-[8px] font-black text-gray-500 uppercase">Actifs</p>
                    <p className="text-2xl font-black italic text-emerald-500">{stats.active}</p>
                </div>
                <div className="glass-card p-4 border-l-4 border-red-500">
                    <p className="text-[8px] font-black text-gray-500 uppercase">Sorties</p>
                    <p className="text-2xl font-black italic text-red-500">{stats.departed}</p>
                </div>
                <div className="col-span-3 glass-card p-4 min-h-[250px] border border-white/5">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                            <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #333'}} />
                            <Area type="monotone" dataKey="pco" stroke="#10b981" fill="#10b9811a" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="lg:col-span-4 glass-card p-6 border border-white/5">
                <h3 className="text-[10px] font-black uppercase mb-4 italic text-gray-500">Structure des Secteurs</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie data={stats.deptData} innerRadius={50} outerRadius={70} dataKey="value">
                            {stats.deptData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % 6]} />)}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* 2. ESPACE MANAGEMENT (LE TABLEAU) */}
        <section className="flex flex-col gap-4">
            <div className="flex justify-between items-end">
                <h2 className="text-lg font-black uppercase italic tracking-tighter">Gestion des <span className="text-emerald-500">Effectifs</span></h2>
                <span className="text-[8px] font-bold text-gray-600 uppercase">Mise à jour temps réel des colonnes SQL</span>
            </div>

            <div className="glass-card border border-white/5 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 text-[9px] font-black uppercase text-gray-500 tracking-widest">
                        <tr>
                            <th className="p-4">Collaborateur</th>
                            <th className="p-4">Secteur</th>
                            <th className="p-4">Contrat</th>
                            <th className="p-4">Statut</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-[11px] font-bold">
                        {data.map((emp) => (
                            <tr key={emp.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-[10px] font-black uppercase border border-white/10">{emp.full_name?.charAt(0)}</div>
                                        <div>
                                            <p className="uppercase">{emp.full_name}</p>
                                            <p className="text-[8px] text-gray-500 uppercase">{emp.role}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    {editingId === emp.id ? (
                                        <input className="bg-black border border-emerald-500/50 p-1 text-[10px] rounded uppercase" value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} />
                                    ) : (
                                        <span className="px-2 py-1 bg-white/5 rounded text-[9px] text-gray-400 uppercase italic">{emp.department}</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    {editingId === emp.id ? (
                                        <select className="bg-black border border-emerald-500/50 p-1 text-[10px] rounded uppercase" value={editForm.contract_type} onChange={e => setEditForm({...editForm, contract_type: e.target.value})}>
                                            <option value="CDI">CDI</option><option value="CDD">CDD</option><option value="Freelance">Freelance</option>
                                        </select>
                                    ) : (
                                        <span className="uppercase">{emp.contract_type || 'CDI'}</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    {editingId === emp.id ? (
                                        <select className="bg-black border border-emerald-500/50 p-1 text-[10px] rounded uppercase font-black" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                                            <option value="Actif" className="text-emerald-500">Actif</option>
                                            <option value="Parti" className="text-red-500">Parti</option>
                                        </select>
                                    ) : (
                                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${emp.status === 'Parti' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                            {emp.status || 'Actif'}
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    {editingId === emp.id ? (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={saveChanges} className="p-2 bg-emerald-500 text-black rounded hover:bg-white"><Check size={14} /></button>
                                            <button onClick={() => setEditingId(null)} className="p-2 bg-red-500/20 text-red-500 rounded"><X size={14} /></button>
                                        </div>
                                    ) : (
                                        <button onClick={() => startEdit(emp)} className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded transition-all"><Edit3 size={14} /></button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>

      </main>
    </div>
  );
}
