"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../components/WakandaGuard";

/** * ANALYTIQUE ENGINE - CONFIGURATION HAUTE DENSITÉ (DASHBOARD RH)
 * Intègre 6+ graphiques synchronisés et gestion de données massive
 */
import { 
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, 
  Tooltip, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, 
  Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart
} from 'recharts';

/** * ICONSET - PREMIUM UI WAKANDA
 */
import { 
  Users, Wallet, Activity, Database, Cpu, ShieldCheck, 
  FileText, Download, X, ChevronRight, Fingerprint, 
  CheckCircle2, Menu, Zap, TrendingUp, Briefcase, 
  Clock, Target, Scale, GraduationCap, Globe, Heart,
  Filter, Search, ArrowUpRight, UserCheck, AlertCircle
} from 'lucide-react';

// --- DESIGN SYSTEM : CONFIGURATION CHROMATIQUE ---
const THEME = {
  emerald: "#10b981",
  blue: "#3b82f6",
  violet: "#8b5cf6",
  amber: "#f59e0b",
  rose: "#f43f5e",
  cyan: "#06b6d4",
  zinc: "#27272a",
  bg: "#020202",
  border: "rgba(255, 255, 255, 0.05)"
};

const CHART_PALETTE = [THEME.emerald, THEME.blue, THEME.violet, THEME.amber, THEME.rose, THEME.cyan];

// --- TYPES & INTERFACES ROBUSTES ---
interface Employee {
  id: string;
  name: string;
  dept: string;
  gender: 'M' | 'F';
  contract: 'CDI' | 'CDD' | 'Freelance';
  age: number;
  diploma: 'Bac' | 'BTS' | 'Licence' | 'Master' | 'Doctorat';
  status: 'Célibataire' | 'Marié' | 'Divorcé';
  nation: string;
  seniority: number;
  aura: number;
  pco: number; // Point de coût
  missions: { title: string; status: string }[];
}

export default function RHIntelSuperRobust() {
  const user = useAuth();
  const router = useRouter();

  // --- ÉTATS DE L'INTERFACE ---
  const [view, setView] = useState<'stats' | 'list'>('stats');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("ALL");
  const [isExporting, setIsExporting] = useState(false);

  // --- DATASET COMPLET (SIMULATION 153 AGENTS VIA MOCK) ---
  const rawData: Employee[] = useMemo(() => [
    { id: '1', name: 'Malick Thiam', dept: 'TECH', gender: 'M', contract: 'CDI', age: 34, diploma: 'Master', status: 'Marié', nation: 'Sénégal', seniority: 5, aura: 95, pco: 85, missions: [{title: 'Cloud migration', status: 'Done'}] },
    { id: '2', name: 'Awa Diop', dept: 'MARKETING', gender: 'F', contract: 'CDI', age: 28, diploma: 'Licence', status: 'Célibataire', nation: 'Mali', seniority: 3, aura: 82, pco: 62, missions: [] },
    { id: '3', name: 'Jean-Luc Moukin', dept: 'TECH', gender: 'M', contract: 'CDD', age: 25, diploma: 'BTS', status: 'Célibataire', nation: 'France', seniority: 1, aura: 78, pco: 70, missions: [] },
    { id: '4', name: 'Fiona Uwimana', dept: 'LOGISTIQUE', gender: 'F', contract: 'CDI', age: 42, diploma: 'Master', status: 'Marié', nation: 'Rwanda', seniority: 8, aura: 88, pco: 90, missions: [] },
    { id: '5', name: 'Omar Sy', dept: 'SÉCURITÉ', gender: 'M', contract: 'CDI', age: 45, diploma: 'Bac', status: 'Marié', nation: 'Sénégal', seniority: 12, aura: 98, pco: 95, missions: [] },
    { id: '6', name: 'Sarah Kone', dept: 'RH', gender: 'F', contract: 'Freelance', age: 31, diploma: 'Licence', status: 'Divorcé', nation: 'Côte d\'Ivoire', seniority: 2, aura: 85, pco: 65, missions: [] },
    { id: '7', name: 'Eric Gila', dept: 'PRODUCTION', gender: 'M', contract: 'CDI', age: 29, diploma: 'BTS', status: 'Marié', nation: 'Congo', seniority: 4, aura: 79, pco: 72, missions: [] },
    { id: '8', name: 'David B.', dept: 'FINANCE', gender: 'M', contract: 'CDI', age: 38, diploma: 'Master', status: 'Marié', nation: 'Sénégal', seniority: 7, aura: 91, pco: 88, missions: [] },
  ], []);

  // --- MOTEUR DE CALCUL ANALYTIQUE (SIMULE LES CHIFFRES DU SCREENSHOT) ---
  const analytics = useMemo(() => {
    // Calculs de base
    const total = 153; // Chiffre fixe pour matcher l'image
    const male = 115;
    const female = 38;
    
    // Diplômes
    const diplomas = [
      { name: 'BEPC', val: 37 }, { name: 'BTS', val: 48 }, 
      { name: 'Licence', val: 44 }, { name: 'Master', val: 23 }, { name: 'Bac', val: 1 }
    ];

    // Nationalités
    const nations = [
      { name: 'Sénégal', v: 75 }, { name: 'France', v: 19 }, 
      { name: 'Mali', v: 14 }, { name: 'RDC', v: 9 }, { name: 'Autres', v: 36 }
    ];

    // Evolution Temporelle
    const evolution = [
      { year: '1984', v: 1 }, { year: '1990', v: 4 }, { year: '1995', v: 2 },
      { year: '2000', v: 5 }, { year: '2005', v: 10 }, { year: '2010', v: 36 }
    ];

    // Départements
    const depts = [
      { name: 'Production', val: 61 }, { name: 'Marketing', val: 5 },
      { name: 'Management', val: 4 }, { name: 'Informatique', val: 55 },
      { name: 'Financier', val: 8 }, { name: 'Logistique', val: 9 }
    ];

    // Statut Social
    const social = [
      { name: 'Célibataire', v: 53, p: 35 },
      { name: 'Marié', v: 99, p: 65 },
      { name: 'Divorcé', v: 1, p: 1 }
    ];

    return { total, male, female, diplomas, nations, evolution, depts, social };
  }, []);

  // --- LOGIQUE DE FILTRAGE ---
  const filteredList = useMemo(() => {
    return rawData.filter(e => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
      const matchDept = filterDept === "ALL" || e.dept === filterDept;
      return matchSearch && matchDept;
    });
  }, [rawData, search, filterDept]);

  // --- ACTIONS ---
  const handleExport = useCallback(() => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("Extraction du rapport RH-2026 terminée.");
    }, 1500);
  }, []);

  // --- COMPOSANTS INTERNES ---
  const StatBlock = ({ label, value, sub, color }: any) => (
    <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
      <p className="text-[7px] font-black text-zinc-500 uppercase mb-1">{label}</p>
      <p className={`text-xl font-black italic ${color}`}>{value}</p>
      {sub && <p className="text-[6px] text-zinc-600 font-bold">{sub}</p>}
    </div>
  );

  const ChartContainer = ({ title, children, span = "col-span-1" }: any) => (
    <div className={`${span} bg-white/[0.01] border border-white/5 rounded-xl p-4 flex flex-col hover:bg-white/[0.02] transition-colors`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 border-l-2 border-emerald-500 pl-2">{title}</h3>
        <ArrowUpRight size={12} className="text-zinc-700" />
      </div>
      <div className="flex-1 min-h-[160px]">{children}</div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020202] text-white overflow-hidden font-sans text-[10px]">
      <Sidebar />

      <main className="flex-1 p-4 overflow-y-auto custom-scroll flex flex-col gap-4">
        
        {/* SECTION 1 : HEADER & KPI (MATCHING IMAGE) */}
        <header className="grid grid-cols-12 gap-3">
          <div className="col-span-12 lg:col-span-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-4">
            <div className="bg-emerald-500 p-2 rounded-lg text-black"><Database size={20} /></div>
            <div>
              <h1 className="text-lg font-black italic uppercase leading-none">GESTION RH</h1>
              <p className="text-[7px] font-bold text-emerald-500/70 tracking-widest mt-1 uppercase">Analyse de l'effectif & Masse salariale</p>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-9 grid grid-cols-2 md:grid-cols-6 gap-2">
            <StatBlock label="Nbre d'employé" value={analytics.total} sub="Agents actifs" color="text-white" />
            <StatBlock label="Nbre d'homme" value={analytics.male} sub="75.1%" color="text-blue-400" />
            <StatBlock label="Nbre de femme" value={analytics.female} sub="24.9%" color="text-rose-400" />
            <StatBlock label="Âge Moyen" value="45,67 ans" sub="Senioritas" color="text-amber-500" />
            <StatBlock label="Ancienneté" value="16,93 ans" sub="Moyenne" color="text-violet-400" />
            <StatBlock label="Nationalités" value="10" sub="Global" color="text-cyan-400" />
          </div>
        </header>

        {/* SECTION 2 : DASHBOARD CORE */}
        <div className="flex gap-2 border-b border-white/5 pb-2">
          <button onClick={() => setView('stats')} className={`px-4 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${view === 'stats' ? 'bg-white text-black' : 'bg-white/5 text-zinc-500'}`}>Tableau de Bord</button>
          <button onClick={() => setView('list')} className={`px-4 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${view === 'list' ? 'bg-white text-black' : 'bg-white/5 text-zinc-500'}`}>Registre Employés</button>
          <div className="flex-1" />
          <button onClick={handleExport} disabled={isExporting} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-4 py-1.5 rounded-md text-[8px] font-black uppercase flex items-center gap-2 hover:bg-emerald-500 hover:text-black transition-all">
            {isExporting ? <Activity size={12} className="animate-spin" /> : <Download size={12} />} Rapport PDF
          </button>
        </div>

        {view === 'stats' ? (
          <div className="grid grid-cols-12 gap-3 animate-in fade-in duration-700">
            
            {/* LIGNE 1 : PYRAMIDE & EVOLUTION */}
            <ChartContainer title="Pyramide des Âges" span="col-span-12 lg:col-span-4">
              <div className="flex items-center justify-around h-full pt-4">
                <div className="text-center opacity-50"><Users size={48} /><p className="mt-2 font-bold uppercase">Senior</p></div>
                <div className="text-center"><Users size={64} className="text-emerald-500" /><p className="mt-2 font-bold uppercase">Core Group</p></div>
                <div className="text-center opacity-50"><Users size={32} /><p className="mt-2 font-bold uppercase">Junior</p></div>
              </div>
            </ChartContainer>

            <ChartContainer title="Evolution des Effectifs" span="col-span-12 lg:col-span-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.evolution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                  <XAxis dataKey="year" stroke="#52525b" fontSize={8} fontWeight="bold" />
                  <YAxis stroke="#52525b" fontSize={8} />
                  <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #27272a', fontSize: '10px'}} />
                  <Area type="monotone" dataKey="v" stroke={THEME.emerald} fill={THEME.emerald} fillOpacity={0.1} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* LIGNE 2 : DIPLOMES & NATIONALITES & CSP */}
            <ChartContainer title="Effectif par Diplôme" span="col-span-12 lg:col-span-4">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.diplomas} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#52525b" fontSize={8} tick={{fill: '#888'}} />
                    <YAxis stroke="#52525b" fontSize={8} />
                    <Tooltip />
                    <Bar dataKey="val" fill={THEME.blue} radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer title="Effectif par Nationalité" span="col-span-12 lg:col-span-4">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={analytics.nations} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#888" fontSize={7} />
                    <Tooltip />
                    <Bar dataKey="v" fill={THEME.violet} radius={[0, 4, 4, 0]} barSize={10} />
                  </BarChart>
               </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer title="Effectif par CSP" span="col-span-12 lg:col-span-4">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{n:'Cadre',v:29},{n:'Agent',v:49},{n:'Ouvrier',v:37}]} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="v">
                      <Cell fill={THEME.amber} />
                      <Cell fill={THEME.emerald} />
                      <Cell fill={THEME.cyan} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
            </ChartContainer>

            {/* LIGNE 3 : DEPARTEMENTS & STATUT SOCIAL */}
            <ChartContainer title="Effectif par Département" span="col-span-12 lg:col-span-6">
              <div className="space-y-3 pt-2">
                {analytics.depts.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-24 text-[8px] text-zinc-500 font-bold uppercase">{d.name}</span>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${(d.val/61)*100}%` }} />
                    </div>
                    <span className="text-[8px] font-black w-6">{d.val}</span>
                  </div>
                ))}
              </div>
            </ChartContainer>

            <ChartContainer title="Statut Social" span="col-span-12 lg:col-span-6">
               <div className="flex justify-around items-center h-full">
                  {analytics.social.map((s, i) => (
                    <div key={i} className="text-center group">
                      <div className="w-16 h-16 rounded-full border-4 border-white/5 flex flex-col items-center justify-center group-hover:border-emerald-500/30 transition-all">
                        <span className="text-xs font-black">{s.p}%</span>
                        <span className="text-[6px] text-zinc-500 uppercase">{s.v} pers.</span>
                      </div>
                      <p className="mt-2 text-[7px] font-black uppercase text-zinc-400">{s.name}</p>
                    </div>
                  ))}
               </div>
            </ChartContainer>

          </div>
        ) : (
          /* SECTION 3 : LISTE EMPLOYES (UI TABLEUR) */
          <div className="bg-white/[0.01] border border-white/5 rounded-xl overflow-hidden flex-1 flex flex-col">
            <div className="p-4 bg-white/5 flex justify-between items-center">
               <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                  <input 
                    type="text" 
                    placeholder="Filtrer par nom ou département..." 
                    className="w-full bg-black border border-white/10 rounded-lg py-2 pl-10 pr-4 text-[10px] outline-none focus:border-emerald-500 uppercase"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
               </div>
               <div className="flex gap-4">
                  <select 
                    className="bg-black border border-white/10 rounded-lg px-4 py-2 text-[10px] outline-none font-bold text-zinc-400 uppercase"
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                  >
                    <option value="ALL">Tous les départements</option>
                    <option value="TECH">Technologie</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="SÉCURITÉ">Sécurité</option>
                  </select>
               </div>
            </div>
            
            <div className="overflow-x-auto flex-1">
               <table className="w-full text-left">
                  <thead className="sticky top-0 bg-[#0a0a0a] border-b border-white/10 text-[8px] font-black uppercase text-zinc-500">
                     <tr>
                        <th className="p-4">Agent</th>
                        <th className="p-4">Département</th>
                        <th className="p-4">Contrat</th>
                        <th className="p-4">Diplôme</th>
                        <th className="p-4">Nationalité</th>
                        <th className="p-4 text-right">Aura Index</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {filteredList.map((emp) => (
                       <tr key={emp.id} className="hover:bg-white/[0.03] transition-colors cursor-pointer group" onClick={() => setSelectedEmp(emp)}>
                          <td className="p-4 flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-emerald-500 font-black italic">{emp.name.charAt(0)}</div>
                             <div>
                                <p className="font-black uppercase">{emp.name}</p>
                                <p className="text-[7px] text-zinc-600">{emp.age} ans • {emp.status}</p>
                             </div>
                          </td>
                          <td className="p-4 font-bold text-blue-400">{emp.dept}</td>
                          <td className="p-4"><span className="px-2 py-1 bg-white/5 rounded text-[7px] font-black">{emp.contract}</span></td>
                          <td className="p-4 text-zinc-400">{emp.diploma}</td>
                          <td className="p-4 flex items-center gap-2"><Globe size={10} className="text-zinc-600" /> {emp.nation}</td>
                          <td className="p-4 text-right">
                             <div className="inline-flex items-center gap-2">
                                <div className="w-20 h-1 bg-zinc-800 rounded-full hidden md:block"><div className="h-full bg-emerald-500" style={{width: `${emp.aura}%`}} /></div>
                                <span className="text-emerald-500 font-black italic">{emp.aura}%</span>
                             </div>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {/* SECTION 4 : FOOTER DE SÉCURITÉ */}
        <footer className="flex justify-between items-center py-2 px-4 bg-white/[0.02] rounded-lg opacity-40">
           <div className="flex items-center gap-4">
              <Fingerprint size={16} className="text-emerald-500" />
              <p className="text-[8px] font-black uppercase tracking-widest">Wakanda Intel-RH System Alpha • Session 2026-Q1</p>
           </div>
           <div className="flex gap-4">
              <p className="text-[8px] font-bold uppercase text-zinc-600">Serveur: Kinshasa-West-04</p>
              <p className="text-[8px] font-bold uppercase text-zinc-600">Status: Sécurisé</p>
           </div>
        </footer>

        {/* SECTION 5 : MODAL AGENT (ULTRA-COMPLETE) */}
        {selectedEmp && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in zoom-in duration-300">
             <div className="w-full max-w-4xl bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                <button onClick={() => setSelectedEmp(null)} className="absolute top-8 right-8 p-3 bg-white/5 rounded-full hover:bg-rose-500 transition-all z-10"><X size={20} /></button>
                
                <div className="grid grid-cols-12">
                   <div className="col-span-12 md:col-span-5 p-12 bg-black/40 border-r border-white/5">
                      <div className="w-32 h-32 rounded-[2rem] bg-emerald-500 flex items-center justify-center text-black text-5xl font-black italic mb-8 shadow-2xl mx-auto">{selectedEmp.name.charAt(0)}</div>
                      <h2 className="text-3xl font-black italic uppercase tracking-tighter text-center mb-1">{selectedEmp.name}</h2>
                      <p className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em] text-center mb-10">{selectedEmp.dept} Division</p>
                      
                      <div className="space-y-3">
                         <div className="flex justify-between p-4 bg-white/5 rounded-2xl">
                            <span className="text-zinc-500 font-bold uppercase">Nationalité</span>
                            <span className="font-black">{selectedEmp.nation}</span>
                         </div>
                         <div className="flex justify-between p-4 bg-white/5 rounded-2xl">
                            <span className="text-zinc-500 font-bold uppercase">Situation</span>
                            <span className="font-black">{selectedEmp.status}</span>
                         </div>
                         <div className="flex justify-between p-4 bg-white/5 rounded-2xl text-blue-400">
                            <span className="font-bold uppercase">Salaire Horaire</span>
                            <span className="font-black">{selectedEmp.pco} €/h</span>
                         </div>
                      </div>
                   </div>

                   <div className="col-span-12 md:col-span-7 p-12">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-8 flex items-center gap-3"><Clock size={16} /> Chronologie & Missions</h3>
                      <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scroll pr-4">
                         {selectedEmp.missions.length > 0 ? selectedEmp.missions.map((m, i) => (
                           <div key={i} className="flex items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-2xl">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><CheckCircle2 size={18} /></div>
                                 <p className="text-sm font-black uppercase tracking-tight">{m.title}</p>
                              </div>
                              <span className="text-[8px] font-black text-emerald-500 uppercase">{m.status}</span>
                           </div>
                         )) : (
                           <div className="p-12 text-center opacity-20"><AlertCircle size={48} className="mx-auto mb-4" /><p className="font-bold uppercase">Aucune mission enregistrée</p></div>
                         )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-12">
                         <button className="py-5 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-lg"><FileText size={16} /> Fiche Agent</button>
                         <button className="py-5 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"><UserCheck size={16} /> Modifier</button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

      </main>

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeIn 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
}
