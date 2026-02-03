"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../components/WakandaGuard";

/** * ANALYTIQUE ENGINE PRO - ARCHITECTURE MINE D'OR
 * Ce module centralise les 7 piliers de la data RH cliquables.
 */
import { 
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, 
  Tooltip, Bar, XAxis, YAxis, CartesianGrid, Legend, 
  BarChart, LineChart, Line, ComposedChart
} from 'recharts';

import { 
  Users, Database, TrendingUp, Briefcase, GraduationCap, 
  Globe, Heart, ArrowUpRight, Fingerprint, Search, 
  Filter, Download, ChevronRight, LayoutDashboard, 
  UserCheck, Zap, ShieldCheck, Activity, Clock
} from 'lucide-react';

// --- SYSTÈME DE DESIGN WAKANDA GOLD ---
const THEME = {
  emerald: "#10b981",
  blue: "#3b82f6",
  violet: "#8b5cf6",
  amber: "#f59e0b",
  rose: "#f43f5e",
  cyan: "#06b6d4",
  zinc: "#18181b",
  border: "rgba(255, 255, 255, 0.05)"
};

// --- LOGIQUE DE DONNÉES MASSIVES (MOCK DATA 153 AGENTS) ---
const GENERATE_MOCK_DATA = () => {
  const depts = ['Production', 'Marketing', 'Logistique', 'Informatique', 'Finance', 'Management'];
  const nations = ['Sénégal', 'France', 'Mali', 'RDC', 'Maroc', 'Côte d\'Ivoire'];
  const diplomas = ['BEPC', 'BTS', 'Licence', 'Master', 'Doctorat'];
  
  return Array.from({ length: 20 }, (_, i) => ({
    id: `EMP-${100 + i}`,
    name: ['Abdoulaye', 'Fatou', 'Moussa', 'Sarah', 'Jean'][i % 5] + ' ' + ['Diop', 'Sow', 'Kone', 'Traore'][i % 4],
    dept: depts[i % depts.length],
    gender: i % 3 === 0 ? 'F' : 'M',
    age: 22 + (i * 2),
    seniority: Math.floor(i / 2),
    diploma: diplomas[i % diplomas.length],
    nation: nations[i % nations.length],
    status: i % 2 === 0 ? 'Marié' : 'Célibataire',
    aura: 70 + (i % 30),
    pco: 50 + (i * 5)
  }));
};

export default function RHDataMiningDeep() {
  const user = useAuth();
  const router = useRouter();
  const [view, setView] = useState<'dashboard' | 'explorer'>('dashboard');
  const [searchTerm, setSearchTerm] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // --- ANALYTICS CALCULATED (Basé sur le screenshot fourni) ---
  const employees = useMemo(() => GENERATE_MOCK_DATA(), []);
  
  const stats = useMemo(() => ({
    total: 153,
    male: 115,
    female: 38,
    ageMoyen: 45.67,
    anciennete: 16.93,
    nationsCount: 10,
    diplomas: [
      { name: 'BEPC', val: 37 }, { name: 'BTS', val: 48 }, 
      { name: 'Licence', val: 44 }, { name: 'Master', val: 23 }, { name: 'Bac', val: 1 }
    ],
    evolution: [
      { y: '1984', v: 1 }, { y: '1990', v: 5 }, { y: '1995', v: 2 },
      { y: '2000', v: 8 }, { y: '2005', v: 15 }, { y: '2010', v: 36 }
    ],
    nations: [
      { name: 'Sénégal', v: 75 }, { name: 'France', v: 19 }, { name: 'Mali', v: 14 },
      { name: 'RDC', v: 9 }, { name: 'Maroc', v: 6 }
    ],
    csp: [
      { name: 'Cadre', v: 29 }, { name: 'Agent', v: 49 }, { name: 'Ouvrier', v: 37 }
    ],
    social: [
      { name: 'Célibataire', v: 53, p: 35 }, { name: 'Marié', v: 99, p: 65 }
    ]
  }), []);

  // --- ACTIONS ---
  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 2000);
  };

  // --- COMPOSANTS DE L'INTERFACE ---
  const KPITile = ({ label, value, sub, icon: Icon, color }: any) => (
    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl hover:border-white/20 transition-all group">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{label}</p>
        <Icon size={14} className={`${color} opacity-40 group-hover:opacity-100 transition-opacity`} />
      </div>
      <p className={`text-2xl font-black italic tracking-tighter ${color}`}>{value}</p>
      <p className="text-[7px] text-zinc-600 font-bold uppercase mt-1">{sub}</p>
    </div>
  );

  const DataPortal = ({ title, icon: Icon, children, path, span = "col-span-12 lg:col-span-4" }: any) => (
    <div 
      onClick={() => router.push(path)}
      className={`${span} bg-white/[0.01] border border-white/5 rounded-3xl p-5 hover:bg-white/[0.03] hover:border-emerald-500/40 transition-all cursor-pointer group relative overflow-hidden`}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 group-hover:scale-110 transition-transform">
            <Icon size={16} />
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">{title}</h3>
        </div>
        <ArrowUpRight size={14} className="text-zinc-700 group-hover:text-white transition-colors" />
      </div>
      <div className="h-[180px] w-full">
        {children}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020202] text-white overflow-hidden font-sans text-[10px]">
      <Sidebar />

      <main className="flex-1 p-6 overflow-y-auto custom-scroll flex flex-col gap-6">
        
        {/* HEADER SECTION - IDENTITÉ VISUELLE GESTION RH */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/[0.02] p-6 rounded-[2.5rem] border border-white/5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
              <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
                GESTION DES <span className="text-emerald-500">RESSOURCES HUMAINES</span>
              </h1>
            </div>
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.4em] flex items-center gap-2">
              <Activity size={12} className="text-emerald-500" /> Analyse de l'effectif et masse salariale • Temps Réel
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={() => setView(view === 'dashboard' ? 'explorer' : 'dashboard')} className="flex-1 md:flex-none px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-2">
              {view === 'dashboard' ? <Search size={14} /> : <LayoutDashboard size={14} />} {view === 'dashboard' ? 'Explorer' : 'Tableau de bord'}
            </button>
            <button onClick={handleExport} className="flex-1 md:flex-none px-6 py-3 bg-white text-black rounded-xl font-black uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center gap-2">
              {isExporting ? <Zap size={14} className="animate-spin" /> : <Download size={14} />} Rapport Alpha
            </button>
          </div>
        </header>

        {view === 'dashboard' ? (
          <>
            {/* KPI ROW - REPRODUCTION FIDÈLE DU SCREENSHOT */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              <KPITile label="Nbre d'employé" value={stats.total} sub="Total Agents" icon={Users} color="text-white" />
              <KPITile label="Nbre d'homme" value={stats.male} sub="75.1% du total" icon={UserCheck} color="text-blue-400" />
              <KPITile label="Nbre de femme" value={stats.female} sub="24.9% du total" icon={UserCheck} color="text-rose-400" />
              <KPITile label="Nbre de marié" value="99" sub="65% de parité" icon={Heart} color="text-emerald-500" />
              <KPITile label="Âge Moyen" value={`${stats.ageMoyen} ans`} sub="Senioritas" icon={Clock} color="text-amber-500" />
              <KPITile label="Ancienneté" value={`${stats.anciennete} ans`} sub="Loyauté" icon={ShieldCheck} color="text-violet-400" />
              <KPITile label="Nationalités" value={stats.nationsCount} sub="Diversité" icon={Globe} color="text-cyan-400" />
            </div>

            {/* LES 7 PORTAILS DATA (CLIQUABLES) */}
            <div className="grid grid-cols-12 gap-5">
              
              {/* 1. PYRAMIDE DES AGES */}
              <DataPortal title="Pyramide des Âges" icon={Users} path="/rh/demographie">
                <div className="flex items-center justify-center h-full gap-8 opacity-40 group-hover:opacity-100 transition-all">
                  <Users size={48} className="text-zinc-800" />
                  <Users size={80} className="text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
                  <Users size={32} className="text-zinc-800" />
                </div>
              </DataPortal>

              {/* 2. EVOLUTION DES EFFECTIFS */}
              <DataPortal title="Evolution des Effectifs" icon={TrendingUp} path="/rh/evolution" span="col-span-12 lg:col-span-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.evolution}>
                    <defs>
                      <linearGradient id="colorEv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={THEME.emerald} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={THEME.emerald} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="year" stroke="#444" fontSize={8} fontWeight="bold" />
                    <YAxis stroke="#444" fontSize={8} />
                    <Tooltip contentStyle={{background: '#000', border: '1px solid #333'}} />
                    <Area type="monotone" dataKey="v" stroke={THEME.emerald} fillOpacity={1} fill="url(#colorEv)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </DataPortal>

              {/* 3. DIPLOMES */}
              <DataPortal title="Effectif par Diplôme" icon={GraduationCap} path="/rh/competences">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.diplomas}>
                    <XAxis dataKey="name" stroke="#444" fontSize={8} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Bar dataKey="val" fill={THEME.blue} radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </DataPortal>

              {/* 4. NATIONALITÉS */}
              <DataPortal title="Effectif par Nationalité" icon={Globe} path="/rh/diversite">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={stats.nations} margin={{left: 20}}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#888" fontSize={8} />
                    <Tooltip />
                    <Bar dataKey="v" fill={THEME.violet} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </DataPortal>

              {/* 5. CSP */}
              <DataPortal title="Effectif par CSP" icon={Database} path="/rh/structure">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.csp} innerRadius={50} outerRadius={70} dataKey="v" paddingAngle={8}>
                      {stats.csp.map((_, i) => <Cell key={i} fill={Object.values(THEME)[i % 6]} stroke="none" />)}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" wrapperStyle={{fontSize: '8px', textTransform: 'uppercase'}} />
                  </PieChart>
                </ResponsiveContainer>
              </DataPortal>

              {/* 6. DÉPARTEMENTS */}
              <DataPortal title="Effectif par Département" icon={Briefcase} path="/rh/departements" span="col-span-12 lg:col-span-6">
                 <div className="space-y-4 pt-4">
                    {['Production', 'Informatique', 'Logistique', 'Marketing'].map((d, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="w-24 text-[8px] font-black text-zinc-500 uppercase italic">{d}</span>
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${80 - (i*15)}%` }} />
                        </div>
                        <span className="text-[10px] font-black">{61 - (i*10)}</span>
                      </div>
                    ))}
                 </div>
              </DataPortal>

              {/* 7. STATUT SOCIAL */}
              <DataPortal title="Effectif par Statut Social" icon={Heart} path="/rh/social" span="col-span-12 lg:col-span-6">
                 <div className="flex justify-around items-center h-full">
                    {stats.social.map((s, i) => (
                      <div key={i} className="text-center group-hover:scale-110 transition-transform">
                        <div className="w-20 h-20 rounded-full border-4 border-white/5 flex flex-col items-center justify-center relative">
                          <span className="text-xl font-black italic">{s.p}%</span>
                          <span className="text-[7px] text-zinc-500 font-bold uppercase">{s.v} pers.</span>
                          <div className={`absolute inset-0 rounded-full border-4 border-transparent ${i === 1 ? 'border-t-emerald-500' : 'border-t-rose-500'} animate-pulse`} />
                        </div>
                        <p className="mt-3 text-[9px] font-black uppercase tracking-widest text-zinc-400">{s.name}</p>
                      </div>
                    ))}
                 </div>
              </DataPortal>

            </div>
          </>
        ) : (
          /* MINE D'OR : EXPLORATEUR DE DONNÉES (MODE TABLEUR) */
          <div className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] flex-1 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-700">
            <div className="p-8 bg-white/5 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <Fingerprint size={24} className="text-emerald-500" />
                <h2 className="text-2xl font-black italic uppercase">Explorateur <span className="text-zinc-500">Deep Data</span></h2>
              </div>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                  type="text" 
                  placeholder="RECHERCHER UN AGENT, UN PÔLE OU UN PAYS..." 
                  className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-[10px] font-bold outline-none focus:border-emerald-500 transition-all uppercase tracking-widest"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-x-auto custom-scroll">
              <table className="w-full text-left">
                <thead className="bg-[#080808] text-[8px] font-black uppercase text-zinc-500 tracking-[0.2em] sticky top-0 z-10">
                  <tr>
                    <th className="p-6">Agent</th>
                    <th className="p-6">Département</th>
                    <th className="p-6">Diplôme</th>
                    <th className="p-6">Nation</th>
                    <th className="p-6">Statut</th>
                    <th className="p-6 text-right">Index Aura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-emerald-500/[0.03] transition-colors cursor-pointer group">
                      <td className="p-6 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-emerald-500 font-black italic group-hover:bg-emerald-500 group-hover:text-black transition-all">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black uppercase text-sm tracking-tight">{emp.name}</p>
                          <p className="text-[7px] text-zinc-600 font-bold uppercase">{emp.id} • {emp.age} ans</p>
                        </div>
                      </td>
                      <td className="p-6 font-bold text-blue-400 italic">{emp.dept}</td>
                      <td className="p-6 text-zinc-400 font-bold uppercase">{emp.diploma}</td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <Globe size={10} className="text-zinc-600" />
                          <span className="font-bold uppercase">{emp.nation}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[7px] font-black uppercase ${emp.status === 'Marié' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/5 text-zinc-500'}`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="p-6 text-right font-black italic text-emerald-500 text-lg">{emp.aura}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <footer className="py-4 border-t border-white/5 flex justify-between items-center opacity-30">
          <p className="text-[7px] font-black uppercase tracking-[0.5em]">Wakanda Intelligence Systems • Data-Mining Protocol Alpha-7</p>
          <div className="flex gap-4">
            <span className="text-[7px] font-bold">ENC: AES-256</span>
            <span className="text-[7px] font-bold italic text-emerald-500">LIVE FEED ACTIVE</span>
          </div>
        </footer>

      </main>

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 3px; height: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: slideIn 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
}
