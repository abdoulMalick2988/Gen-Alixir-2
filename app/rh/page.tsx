"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../components/WakandaGuard";

/** * ANALYTIQUE ENGINE - CONFIGURATION MULTI-CHARTS */
import { 
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, 
  Tooltip, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, 
  Line, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';

/** * ICONSET - PREMIUM UI */
import { 
  Users, Wallet, Activity, Database, Cpu, ShieldCheck, 
  FileText, Download, X, ChevronRight, Fingerprint, 
  History, CheckCircle2, Menu, Zap, TrendingUp, 
  Briefcase, VenusMars, Clock, Target
} from 'lucide-react';

// --- CONFIGURATION DU DESIGN SYSTEM ---
const THEME = {
  emerald: "#10b981",
  blue: "#3b82f6",
  violet: "#8b5cf6",
  amber: "#f59e0b",
  rose: "#f43f5e",
  slate: "#94a3b8",
  glass: "rgba(255, 255, 255, 0.03)",
  border: "rgba(255, 255, 255, 0.08)"
};

const CHART_COLORS = [THEME.emerald, THEME.blue, THEME.violet, THEME.amber, THEME.rose];

// --- TYPES & INTERFACES ---
interface Employee {
  id: string;
  full_name: string;
  department: string;
  gender: 'M' | 'F';
  contract: 'CDI' | 'CDD' | 'Freelance';
  seniority: number; // en années
  aura: number;
  pco: number;
  role: string;
  missions: { title: string; date: string }[];
}

export default function RHIntelHighDensity() {
  const user = useAuth();
  const router = useRouter();
  const [view, setView] = useState<'stats' | 'list'>('stats');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- JEU DE DONNÉES ROBUSTE (SIMULATION 2026) ---
  const employees: Employee[] = useMemo(() => [
    { id: '1', full_name: 'Malick Thiam', department: 'TECH', gender: 'M', contract: 'CDI', seniority: 5, aura: 95, pco: 85, role: 'Lead Dev', missions: [{title: 'Cloud Core', date: '2026'}] },
    { id: '2', full_name: 'Awa Diop', department: 'MARKETING', gender: 'F', contract: 'CDI', seniority: 3, aura: 82, pco: 62, role: 'Brand Mgr', missions: [{title: 'Global Launch', date: '2026'}] },
    { id: '3', full_name: 'Jean-Luc Moukin', department: 'TECH', gender: 'M', contract: 'CDD', seniority: 1, aura: 78, pco: 70, role: 'Fullstack', missions: [] },
    { id: '4', full_name: 'Fiona Uwimana', department: 'OPS', gender: 'F', contract: 'CDI', seniority: 4, aura: 88, pco: 90, role: 'COO', missions: [] },
    { id: '5', full_name: 'Omar Sy', department: 'SECURITY', gender: 'M', contract: 'CDI', seniority: 6, aura: 98, pco: 95, role: 'CSO', missions: [] },
    { id: '6', full_name: 'Sarah Kone', department: 'RH', gender: 'F', contract: 'Freelance', seniority: 2, aura: 85, pco: 65, role: 'Talent Scout', missions: [] },
    { id: '7', full_name: 'Eric Gila', department: 'TECH', gender: 'M', contract: 'CDI', seniority: 2, aura: 80, pco: 75, role: 'DevOps', missions: [] },
    { id: '8', full_name: 'David Bukuru', department: 'OPS', gender: 'M', contract: 'CDD', seniority: 1, aura: 72, pco: 55, role: 'Analyst', missions: [] },
  ], []);

  // --- MOTEUR DE CALCUL ANALYTIQUE ---
  const analytics = useMemo(() => {
    // 1. Répartition Genre
    const male = employees.filter(e => e.gender === 'M').length;
    const female = employees.filter(e => e.gender === 'F').length;
    
    // 2. Répartition Contrats
    const contracts = employees.reduce((acc: any, curr) => {
      acc[curr.contract] = (acc[curr.contract] || 0) + 1;
      return acc;
    }, {});

    // 3. Performance par Département (Radar Data)
    const depts = Array.from(new Set(employees.map(e => e.department)));
    const radarData = depts.map(d => ({
      subject: d,
      A: employees.filter(e => e.department === d).reduce((a, b) => a + b.aura, 0) / employees.filter(e => e.department === d).length,
      fullMark: 100
    }));

    // 4. Masse Salariale & Evolution
    const totalPCO = employees.reduce((acc, curr) => acc + (curr.pco * 160), 0);

    return {
      genderData: [{ name: 'Hommes', value: male }, { name: 'Femmes', value: female }],
      contractData: Object.keys(contracts).map(k => ({ name: k, value: contracts[k] })),
      radarData,
      performanceData: employees.map(e => ({ name: e.full_name.split(' ')[0], aura: e.aura, cost: e.pco })),
      seniorityData: employees.map(e => ({ name: e.full_name.split(' ')[0], ans: e.seniority })),
      totalPCO
    };
  }, [employees]);

  // --- UI COMPONENTS ---
  const Card = ({ children, title, icon: Icon, className = "" }: any) => (
    <div className={`bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-[2rem] p-5 flex flex-col ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon size={14} className="text-emerald-500" />}
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">{title}</h3>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020202] text-white overflow-hidden font-sans select-none">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="flex-1 p-4 lg:p-6 overflow-y-auto custom-scroll relative">
        
        {/* HEADER COMPACT */}
        <header className="flex justify-between items-end mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-emerald-500 rounded-full animate-pulse" />
              <h1 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter leading-none">
                RH <span className="text-emerald-500 text-shadow-glow">INTEL</span>
              </h1>
            </div>
            <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-[0.5em] mt-2 flex items-center gap-2">
               <ShieldCheck size={12} /> Data Intelligence Center • 2026
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setView(view === 'stats' ? 'list' : 'stats')} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all">
              {view === 'stats' ? 'Liste Agents' : 'Analytics'}
            </button>
            <button onClick={() => router.push('/rh/workspace')} className="px-6 py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
               <Zap size={14} /> Workspace
            </button>
          </div>
        </header>

        {view === 'stats' ? (
          <div className="grid grid-cols-12 gap-4 animate-in fade-in duration-500">
            
            {/* RANGÉE 1 : KPI FLASH */}
            <div className="col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Effectif", val: employees.length, icon: Users, color: THEME.blue },
                { label: "Masse Sal.", val: `${(analytics.totalPCO/1000).toFixed(1)}k€`, icon: Wallet, color: THEME.emerald },
                { label: "Aura Moy.", val: "86%", icon: Activity, color: THEME.violet },
                { label: "Unités", val: 5, icon: Database, color: THEME.amber },
              ].map((kpi, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/10 p-4 rounded-2xl flex items-center justify-between group hover:border-emerald-500/50 transition-all">
                  <div>
                    <p className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">{kpi.label}</p>
                    <p className="text-xl font-black italic">{kpi.val}</p>
                  </div>
                  <kpi.icon size={18} style={{ color: kpi.color }} />
                </div>
              ))}
            </div>

            {/* RANGÉE 2 : LES 5 GRAPHIQUES COMPACTS */}
            
            {/* 1. Performance Individuelle (Bar/Line) */}
            <Card title="Performance vs Coût" icon={Target} className="col-span-12 lg:col-span-7">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={analytics.performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="name" stroke="#444" fontSize={8} fontWeight="bold" />
                    <Tooltip contentStyle={{backgroundColor: '#000', border: 'none', borderRadius: '10px'}} />
                    <Area type="monotone" dataKey="aura" fill={THEME.emerald} fillOpacity={0.1} stroke={THEME.emerald} strokeWidth={2} />
                    <Bar dataKey="cost" barSize={8} fill={THEME.blue} radius={[4, 4, 0, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* 2. Répartition par Genre (Donut) */}
            <Card title="Parité Genre" icon={VenusMars} className="col-span-12 md:col-span-6 lg:col-span-2">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.genderData} innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value">
                      <Cell fill={THEME.blue} stroke="none" />
                      <Cell fill={THEME.rose} stroke="none" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 text-[8px] font-bold uppercase">
                   <span className="text-blue-400">H: {analytics.genderData[0].value}</span>
                   <span className="text-rose-400">F: {analytics.genderData[1].value}</span>
                </div>
              </div>
            </Card>

            {/* 3. Analyse des Pôles (Radar) */}
            <Card title="Santé des Pôles" icon={TrendingUp} className="col-span-12 md:col-span-6 lg:col-span-3">
               <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={analytics.radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={{fill: '#666', fontSize: 8}} />
                      <Radar name="Aura" dataKey="A" stroke={THEME.emerald} fill={THEME.emerald} fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
               </div>
            </Card>

            {/* 4. Type de Contrat (Pie) */}
            <Card title="Type de Contrat" icon={Briefcase} className="col-span-12 md:col-span-6">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.contractData} innerRadius={40} outerRadius={60} dataKey="value">
                      {analytics.contractData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />)}
                    </Pie>
                    <Tooltip />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '8px', textTransform: 'uppercase', fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* 5. Ancienneté (Line) */}
            <Card title="Ancienneté (Années)" icon={Clock} className="col-span-12 md:col-span-6">
               <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.seniorityData}>
                      <XAxis dataKey="name" stroke="#444" fontSize={8} />
                      <Tooltip />
                      <Area type="step" dataKey="ans" stroke={THEME.amber} fill={THEME.amber} fillOpacity={0.1} />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </Card>

          </div>
        ) : (
          /* LISTE AGENTS COMPACTE */
          <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
               <h2 className="text-2xl font-black italic uppercase tracking-tighter">Registre Alpha</h2>
               <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{employees.length} Agents Enregistrés</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4 gap-4">
               {employees.map((emp) => (
                 <div key={emp.id} onClick={() => setSelectedEmployee(emp)} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all cursor-pointer group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-emerald-500 font-black italic">{emp.full_name.charAt(0)}</div>
                      <div>
                         <h4 className="text-sm font-black uppercase tracking-tight">{emp.full_name}</h4>
                         <p className="text-[8px] font-bold text-zinc-500 uppercase">{emp.role}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-emerald-500 italic">{emp.aura}%</p>
                      <p className="text-[7px] font-bold text-zinc-600 uppercase">{emp.contract}</p>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* PIED DE PAGE SÉCURISÉ */}
        <div className="mt-8 p-6 bg-white/[0.01] border border-white/5 rounded-[2.5rem] flex items-center justify-between opacity-50 hover:opacity-100 transition-opacity">
           <div className="flex items-center gap-4">
              <Fingerprint className="text-emerald-500" size={24} />
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest leading-none">Accès Sécurisé</p>
                 <p className="text-[8px] font-bold text-zinc-600 uppercase mt-1">Tous les flux sont audités par Wakanda Shield.</p>
              </div>
           </div>
           <div className="text-[8px] font-black uppercase text-zinc-700">W-INTEL-RH-2026-X</div>
        </div>

        {/* MODAL FICHE AGENT */}
        {selectedEmployee && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl animate-in zoom-in duration-200">
            <div className="w-full max-w-4xl bg-[#080808] border border-white/10 rounded-[3rem] overflow-hidden relative shadow-[0_0_100px_rgba(16,185,129,0.1)]">
               <button onClick={() => setSelectedEmployee(null)} className="absolute top-8 right-8 p-3 bg-white/5 rounded-full hover:bg-rose-500 hover:text-white transition-all"><X size={20} /></button>
               <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
                  <div className="lg:col-span-5 p-10 border-r border-white/5 bg-zinc-900/30">
                    <div className="w-24 h-24 rounded-3xl bg-emerald-500 flex items-center justify-center text-black text-4xl font-black italic mb-6">{selectedEmployee.full_name.charAt(0)}</div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">{selectedEmployee.full_name}</h2>
                    <p className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em] mb-10">{selectedEmployee.role}</p>
                    <div className="space-y-4">
                       <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-[8px] font-black text-zinc-500 uppercase mb-2">Statut Contrat</p>
                          <span className="text-xl font-black italic text-blue-400">{selectedEmployee.contract}</span>
                       </div>
                       <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-[8px] font-black text-zinc-500 uppercase mb-2">Indice Performance</p>
                          <div className="flex items-center gap-4">
                             <span className="text-3xl font-black italic">{selectedEmployee.aura}</span>
                             <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${selectedEmployee.aura}%` }}></div>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                  <div className="lg:col-span-7 p-10 flex flex-col justify-between">
                     <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-6 italic">Parcours & Missions</h3>
                        <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scroll pr-4">
                           {selectedEmployee.missions.length > 0 ? selectedEmployee.missions.map((m, idx) => (
                             <div key={idx} className="flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-2xl group hover:border-emerald-500/50 transition-all">
                                <CheckCircle2 className="text-emerald-500" size={16} />
                                <div><p className="text-xs font-bold uppercase">{m.title}</p><p className="text-[8px] font-black text-zinc-500 uppercase">{m.date}</p></div>
                             </div>
                           )) : <p className="text-zinc-600 text-[10px] uppercase font-bold">Aucune mission archivée.</p>}
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4 mt-10">
                        <button className="py-4 bg-white text-black rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"><Download size={14} /> Fiche RH</button>
                        <button className="py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"><FileText size={14} /> Contrat</button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

      </main>

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #10b981; border-radius: 20px; }
        .text-shadow-glow { text-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
      `}</style>
    </div>
  );
}
