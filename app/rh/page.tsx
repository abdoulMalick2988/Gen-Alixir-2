"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../components/WakandaGuard";

/** * ANALYTIQUE ENGINE PRO - VERSION 500+ LIGNES
 * Focus: Mine d'or de données, Filtrage dynamique & Profils profonds
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
  UserCheck, Zap, ShieldCheck, Activity, Clock, 
  FileText, Calendar, MapPin, User, Mail, Phone, ExternalLink
} from 'lucide-react';

// --- DESIGN SYSTEM ---
const THEME = {
  emerald: "#10b981", blue: "#3b82f6", violet: "#8b5cf6",
  amber: "#f59e0b", rose: "#f43f5e", cyan: "#06b6d4",
  zinc: "#18181b", border: "rgba(255, 255, 255, 0.05)"
};

// --- MOTEUR DE GÉNÉRATION DE DONNÉES (MINE D'OR) ---
const EMPLOYEES_MOCK = [
  { id: 'WKD-001', name: 'Malick Thiam', dept: 'Informatique', gender: 'Masculin', contract: 'CDI', age: 34, diploma: 'Master', status: 'Marié', nation: 'Sénégal', seniority: 5, aura: 95, startDate: '12/05/2021', email: 'm.thiam@wakanda.tech' },
  { id: 'WKD-002', name: 'Awa Diop', dept: 'Marketing', gender: 'Féminin', contract: 'CDD', age: 28, diploma: 'Licence', status: 'Célibataire', nation: 'Mali', seniority: 2, aura: 82, startDate: '01/02/2024', email: 'a.diop@wakanda.tech' },
  { id: 'WKD-003', name: 'Jean-Luc Gila', dept: 'Informatique', gender: 'Masculin', contract: 'Stage', age: 23, diploma: 'BTS', status: 'Célibataire', nation: 'France', seniority: 1, aura: 75, startDate: '15/06/2024', email: 'jl.gila@wakanda.tech' },
  { id: 'WKD-004', name: 'Sarah Kone', dept: 'RH', gender: 'Féminin', contract: 'CDI', age: 31, diploma: 'Master', status: 'Marié', nation: 'Côte d\'Ivoire', seniority: 4, aura: 88, startDate: '10/11/2020', email: 's.kone@wakanda.tech' },
  { id: 'WKD-005', name: 'Omar Sy', dept: 'Production', gender: 'Masculin', contract: 'CDI', age: 45, diploma: 'Bac', status: 'Marié', nation: 'Sénégal', seniority: 12, aura: 98, startDate: '05/01/2012', email: 'o.sy@wakanda.tech' },
  { id: 'WKD-006', name: 'Fiona Uwimana', dept: 'Logistique', gender: 'Féminin', contract: 'CDD', age: 29, diploma: 'Master', status: 'Célibataire', nation: 'Rwanda', seniority: 3, aura: 80, startDate: '22/03/2022', email: 'f.uwi@wakanda.tech' },
  { id: 'WKD-007', name: 'David B.', dept: 'Finance', gender: 'Masculin', contract: 'CDI', age: 38, diploma: 'Doctorat', status: 'Marié', nation: 'France', seniority: 7, aura: 91, startDate: '14/09/2017', email: 'd.b@wakanda.tech' },
];

export default function RHDeepDataSystem() {
  const user = useAuth();
  const router = useRouter();
  
  // États de l'application
  const [view, setView] = useState<'dashboard' | 'list'>('dashboard');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  // --- LOGIQUE DE FILTRAGE FONCTIONNELLE ---
  const filteredEmployees = useMemo(() => {
    return EMPLOYEES_MOCK.filter(emp => 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.dept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // --- STATISTIQUES (MATCHING SCREENSHOT) ---
  const stats = useMemo(() => ({
    total: 153, male: 115, female: 38,
    contracts: [
      { name: 'CDI', v: 139, p: 91 },
      { name: 'CDD', v: 12, p: 8 },
      { name: 'Stage', v: 2, p: 1 }
    ],
    nations: [
      { name: 'Sénégal', v: 75 }, { name: 'France', v: 19 }, { name: 'Mali', v: 14 },
      { name: 'RDC', v: 9 }, { name: 'Maroc', v: 6 }
    ],
    diplomas: [
      { name: 'BEPC', val: 37 }, { name: 'BTS', val: 48 }, 
      { name: 'Licence', val: 44 }, { name: 'Master', val: 23 }, { name: 'Bac', val: 1 }
    ],
    evolution: [
      { y: '1984', v: 1 }, { y: '1995', v: 5 }, { y: '2005', v: 15 }, { y: '2015', v: 28 }, { y: '2026', v: 36 }
    ]
  }), []);

  // --- RENDER HELPERS ---
  const KPITile = ({ label, value, sub, icon: Icon, color }: any) => (
    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl hover:border-emerald-500/20 transition-all group">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{label}</p>
        <Icon size={14} className={`${color} opacity-40 group-hover:opacity-100 transition-opacity`} />
      </div>
      <p className={`text-2xl font-black italic tracking-tighter ${color}`}>{value}</p>
      <p className="text-[7px] text-zinc-600 font-bold uppercase mt-1">{sub}</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020202] text-white overflow-hidden font-sans text-[10px]">
      <Sidebar />

      <main className="flex-1 p-6 overflow-y-auto custom-scroll flex flex-col gap-6">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/[0.02] p-6 rounded-[2.5rem] border border-white/5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 bg-emerald-500 rounded-full" />
              <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
                MINE D'OR <span className="text-emerald-500">DATA RH</span>
              </h1>
            </div>
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.4em] flex items-center gap-2">
              <Activity size={12} className="text-emerald-500" /> Analyse de l'effectif et masse salariale • LIVE 2026
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setView(view === 'dashboard' ? 'list' : 'dashboard')} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all">
              {view === 'dashboard' ? 'Registre Employés' : 'Tableau de Bord'}
            </button>
            <button className="px-6 py-3 bg-white text-black rounded-xl font-black uppercase tracking-widest hover:bg-emerald-500 transition-all">
              Rapport Alpha
            </button>
          </div>
        </header>

        {view === 'dashboard' ? (
          <>
            {/* KPI ROW - AGE REMPLACÉ PAR TYPE DE CONTRAT */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              <KPITile label="Nbre d'employé" value={stats.total} sub="Total Agents" icon={Users} color="text-white" />
              <KPITile label="Nbre d'homme" value={stats.male} sub="75.1% Total" icon={UserCheck} color="text-blue-400" />
              <KPITile label="Nbre de femme" value={stats.female} sub="24.9% Total" icon={UserCheck} color="text-rose-400" />
              <KPITile label="Contrats CDI" value={stats.contracts[0].v} sub="91% de l'effectif" icon={Briefcase} color="text-emerald-500" />
              <KPITile label="Contrats CDD" value={stats.contracts[1].v} sub="8% de l'effectif" icon={Clock} color="text-amber-500" />
              <KPITile label="Stagiaires" value={stats.contracts[2].v} sub="1% de l'effectif" icon={Zap} color="text-violet-400" />
              <KPITile label="Nationalités" value="10" sub="Diversité Globale" icon={Globe} color="text-cyan-400" />
            </div>

            {/* CHARTS GRID */}
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 lg:col-span-8 bg-white/[0.01] border border-white/5 rounded-3xl p-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                  <TrendingUp size={14} className="text-emerald-500" /> Evolution des Effectifs (1984 - 2026)
                </h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.evolution}>
                      <defs>
                        <linearGradient id="colorEv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={THEME.emerald} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={THEME.emerald} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="y" stroke="#444" fontSize={8} />
                      <YAxis stroke="#444" fontSize={8} />
                      <Tooltip contentStyle={{background: '#000', border: '1px solid #333'}} />
                      <Area type="monotone" dataKey="v" stroke={THEME.emerald} fill="url(#colorEv)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-4 bg-white/[0.01] border border-white/5 rounded-3xl p-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Database size={14} className="text-blue-500" /> Répartition par Contrat
                </h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.contracts} innerRadius={60} outerRadius={80} dataKey="v" paddingAngle={5}>
                        <Cell fill={THEME.emerald} />
                        <Cell fill={THEME.amber} />
                        <Cell fill={THEME.violet} />
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* DIPLOMES & NATIONALITÉS */}
              <div className="col-span-12 lg:col-span-6 bg-white/[0.01] border border-white/5 rounded-3xl p-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest mb-6">Effectif par Diplôme</h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.diplomas}>
                      <XAxis dataKey="name" stroke="#444" fontSize={8} />
                      <Bar dataKey="val" fill={THEME.blue} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-6 bg-white/[0.01] border border-white/5 rounded-3xl p-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest mb-6">Top Nationalités</h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={stats.nations}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" stroke="#888" fontSize={8} />
                      <Bar dataKey="v" fill={THEME.violet} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* REGISTRE AVEC BARRE DE RECHERCHE FONCTIONNELLE */
          <div className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] flex-1 flex flex-col overflow-hidden">
            <div className="p-8 bg-white/5 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Fingerprint size={24} className="text-emerald-500" />
                <h2 className="text-2xl font-black italic uppercase">Explorateur <span className="text-zinc-500">Agents</span></h2>
              </div>
              <div className="relative w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                  type="text" 
                  placeholder="RECHERCHER PAR NOM OU DÉPARTEMENT..." 
                  className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-[10px] font-bold outline-none focus:border-emerald-500 transition-all uppercase"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scroll">
              <table className="w-full text-left">
                <thead className="bg-black text-[8px] font-black uppercase text-zinc-500 sticky top-0 z-10">
                  <tr>
                    <th className="p-6">Agent</th>
                    <th className="p-6">Département</th>
                    <th className="p-6">Contrat</th>
                    <th className="p-6">Nationalité</th>
                    <th className="p-6 text-right">Aura Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} onClick={() => setSelectedEmp(emp)} className="hover:bg-emerald-500/[0.03] transition-colors cursor-pointer group">
                      <td className="p-6 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-emerald-500 font-black italic group-hover:bg-emerald-500 group-hover:text-black">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black uppercase text-sm">{emp.name}</p>
                          <p className="text-[7px] text-zinc-600 font-bold uppercase">{emp.id}</p>
                        </div>
                      </td>
                      <td className="p-6 font-bold text-blue-400">{emp.dept}</td>
                      <td className="p-6 font-bold uppercase text-zinc-400">{emp.contract}</td>
                      <td className="p-6 font-bold uppercase">{emp.nation}</td>
                      <td className="p-6 text-right font-black italic text-emerald-500 text-lg">{emp.aura}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredEmployees.length === 0 && (
                <div className="p-20 text-center text-zinc-600 uppercase font-black tracking-widest">Aucun agent trouvé</div>
              )}
            </div>
          </div>
        )}

        {/* MODAL : FENÊTRE CONTEXTUELLE PROFONDE */}
        {selectedEmp && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
             <div className="w-full max-w-5xl bg-zinc-900 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl relative animate-in zoom-in duration-300">
                <button onClick={() => setSelectedEmp(null)} className="absolute top-8 right-8 p-3 bg-white/5 rounded-full hover:bg-rose-500 transition-all z-10"><X size={20} /></button>
                
                <div className="grid grid-cols-12">
                   {/* Sidebar Profil */}
                   <div className="col-span-12 md:col-span-4 p-12 bg-black/40 border-r border-white/5 flex flex-col items-center">
                      <div className="w-40 h-40 rounded-[2.5rem] bg-emerald-500 flex items-center justify-center text-black text-6xl font-black italic mb-8 shadow-2xl">{selectedEmp.name.charAt(0)}</div>
                      <h2 className="text-3xl font-black italic uppercase tracking-tighter text-center mb-1">{selectedEmp.name}</h2>
                      <p className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em] mb-10">{selectedEmp.id}</p>
                      
                      <div className="w-full space-y-3">
                         <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <Mail size={16} className="text-zinc-500" />
                            <span className="text-[9px] font-bold truncate">{selectedEmp.email}</span>
                         </div>
                         <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <MapPin size={16} className="text-zinc-500" />
                            <span className="text-[9px] font-bold uppercase">{selectedEmp.nation}</span>
                         </div>
                      </div>
                   </div>

                   {/* Main Data Mining */}
                   <div className="col-span-12 md:col-span-8 p-12">
                      <div className="flex justify-between items-center mb-8">
                         <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-3">
                           <Database size={18} className="text-emerald-500" /> Dossier Personnel Alpha
                         </h3>
                         <div className="px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                            <span className="text-emerald-500 font-black text-[8px] uppercase tracking-widest italic">Aura: {selectedEmp.aura}%</span>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                         <DataPoint label="Âge" value={`${selectedEmp.age} ans`} icon={User} />
                         <DataPoint label="Genre" value={selectedEmp.gender} icon={Activity} />
                         <DataPoint label="Contrat" value={selectedEmp.contract} icon={Briefcase} />
                         <DataPoint label="Diplôme" value={selectedEmp.diploma} icon={GraduationCap} />
                         <DataPoint label="Ancienneté" value={`${selectedEmp.seniority} ans`} icon={ShieldCheck} />
                         <DataPoint label="Date de début" value={selectedEmp.startDate} icon={Calendar} />
                      </div>

                      <div className="bg-white/5 p-8 rounded-3xl border border-white/10 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="p-4 bg-rose-500/20 rounded-2xl text-rose-500"><FileText size={30} /></div>
                            <div>
                               <p className="font-black uppercase text-sm">Curriculum Vitae</p>
                               <p className="text-[8px] text-zinc-500 font-bold uppercase">Format: PDF • Dernière MAJ: 2026</p>
                            </div>
                         </div>
                         <button className="px-8 py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all flex items-center gap-3">
                            <Download size={16} /> Télécharger
                         </button>
                      </div>

                      <div className="mt-8 flex gap-4">
                         <button className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-[8px] tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                           <ExternalLink size={14} /> Voir Dossier Complet
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        <footer className="py-4 border-t border-white/5 flex justify-between items-center opacity-30">
          <p className="text-[7px] font-black uppercase tracking-[0.5em]">Wakanda Intel RH • Secure Mining Protocol v5.0</p>
          <p className="text-[7px] font-bold uppercase">Accès: Administrateur Alpha</p>
        </footer>
      </main>

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 3px; height: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
      `}</style>
    </div>
  );
}

// Composant Interne pour le Modal
function DataPoint({ label, value, icon: Icon }: any) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-zinc-500 uppercase font-black text-[7px] tracking-widest">
        <Icon size={12} /> {label}
      </div>
      <div className="text-sm font-black italic text-white uppercase">{value}</div>
    </div>
  );
}

function X({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
}
