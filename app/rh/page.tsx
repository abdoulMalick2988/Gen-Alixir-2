"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../components/WakandaGuard";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, 
  Tooltip, Bar, XAxis, YAxis, CartesianGrid, Legend, 
  BarChart, LineChart, Line 
} from 'recharts';
import { 
  Users, Database, TrendingUp, Briefcase, GraduationCap, 
  Globe, Heart, ArrowUpRight, Fingerprint, Search, 
  Download, UserCheck, Zap, ShieldCheck, Activity, Clock, 
  FileText, Calendar, MapPin, Mail, X, ExternalLink, List
} from 'lucide-react';

// --- CONFIGURATION DU DESIGN ---
const THEME = {
  emerald: "#10b981", blue: "#3b82f6", violet: "#8b5cf6",
  amber: "#f59e0b", rose: "#f43f5e", cyan: "#06b6d4",
  zinc: "#18181b", border: "rgba(255, 255, 255, 0.05)"
};

// --- SIMULATION DE LA BASE DE DONNÉES (MINE D'OR) ---
const EMPLOYEES_DATA = [
  { id: 'WKD-001', name: 'Malick Thiam', dept: 'Informatique', gender: 'Masculin', contract: 'CDI', age: 34, diploma: 'Master', status: 'Marié', nation: 'Sénégal', seniority: 5, aura: 95, startDate: '12/05/2021', email: 'm.thiam@wakanda.tech' },
  { id: 'WKD-002', name: 'Awa Diop', dept: 'Marketing', gender: 'Féminin', contract: 'CDD', age: 28, diploma: 'Licence', status: 'Célibataire', nation: 'Mali', seniority: 2, aura: 82, startDate: '01/02/2024', email: 'a.diop@wakanda.tech' },
  { id: 'WKD-003', name: 'Jean-Luc Gila', dept: 'Production', gender: 'Masculin', contract: 'Stage', age: 23, diploma: 'BTS', status: 'Célibataire', nation: 'France', seniority: 1, aura: 75, startDate: '15/06/2024', email: 'jl.gila@wakanda.tech' },
  { id: 'WKD-004', name: 'Sarah Kone', dept: 'Direction', gender: 'Féminin', contract: 'CDI', age: 31, diploma: 'Master', status: 'Marié', nation: 'Côte d\'Ivoire', seniority: 4, aura: 88, startDate: '10/11/2020', email: 's.kone@wakanda.tech' },
  { id: 'WKD-005', name: 'Omar Sy', dept: 'Logistique', gender: 'Masculin', contract: 'CDI', age: 45, diploma: 'Bac', status: 'Marié', nation: 'Sénégal', seniority: 12, aura: 98, startDate: '05/01/2012', email: 'o.sy@wakanda.tech' }
];

export default function RHIntelligenceMaster() {
  const user = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmp, setSelectedEmp] = useState<any>(null);

  // Logic: Recherche fonctionnelle
  const filteredEmployees = useMemo(() => {
    return EMPLOYEES_DATA.filter(emp => 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.dept.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Statistiques calculées (Ref image 3)
  const stats = useMemo(() => ({
    total: 153, male: 115, female: 38,
    contracts: [{ name: 'CDI', v: 139 }, { name: 'CDD', v: 12 }, { name: 'Stage', v: 2 }],
    evolution: [{ y: '1984', v: 1 }, { y: '1995', v: 5 }, { y: '2005', v: 15 }, { y: '2015', v: 28 }, { y: '2026', v: 36 }],
    depts: [{ n: 'Production', v: 61 }, { n: 'Marketing', v: 55 }, { n: 'Finance', v: 8 }, { n: 'Informatique', v: 2 }],
    social: [{ name: 'Marié', v: 99, p: 65 }, { name: 'Célibataire', v: 53, p: 35 }]
  }), []);

  // Composants UI Réutilisables
  const DataCard = ({ title, icon: Icon, children, path }: any) => (
    <div 
      onClick={() => router.push(path)}
      className="bg-white/[0.01] border border-white/5 rounded-[2rem] p-6 hover:bg-emerald-500/[0.02] hover:border-emerald-500/30 transition-all cursor-pointer group relative overflow-hidden"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 group-hover:scale-110 transition-transform"><Icon size={16} /></div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">{title}</h3>
        </div>
        <ArrowUpRight size={14} className="text-zinc-700 group-hover:text-white transition-colors" />
      </div>
      <div className="h-[200px] w-full">{children}</div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020202] text-white overflow-hidden font-sans text-[10px]">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto custom-scroll flex flex-col gap-6">
        
        {/* HEADER ALPHA */}
        <header className="flex justify-between items-end bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2">
              MINE D'OR <span className="text-emerald-500">DATA RH</span>
            </h1>
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.4em] flex items-center gap-2">
              <Activity size={12} className="text-emerald-500" /> Analyse systémique de la masse salariale
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => router.push('/rh/registre')} 
              className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-3"
            >
              <List size={16} className="text-emerald-500" /> Registre Employés
            </button>
          </div>
        </header>

        {/* KPI ROW (Ref Image 3 & 5) */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <KPITile label="Total Agents" value={stats.total} icon={Users} color="text-white" />
          <KPITile label="Hommes" value={stats.male} icon={UserCheck} color="text-blue-400" />
          <KPITile label="Femmes" value={stats.female} icon={UserCheck} color="text-rose-400" />
          <KPITile label="CDI" value="139" icon={Briefcase} color="text-emerald-500" />
          <KPITile label="CDD" value="12" icon={Clock} color="text-amber-500" />
          <KPITile label="Stagiaires" value="2" icon={Zap} color="text-violet-400" />
          <KPITile label="Nationalités" value="10" icon={Globe} color="text-cyan-400" />
        </div>

        {/* GRILLE ANALYTIQUE CLIQUEZ SUR LES GRAPHES */}
        <div className="grid grid-cols-12 gap-5">
          {/* Evolution */}
          <div className="col-span-12 lg:col-span-8">
            <DataCard title="Évolution des Effectifs" icon={TrendingUp} path="/rh/evolution">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.evolution}>
                  <defs>
                    <linearGradient id="gradEv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={THEME.emerald} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={THEME.emerald} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="y" stroke="#444" fontSize={8} />
                  <YAxis stroke="#444" fontSize={8} />
                  <Tooltip contentStyle={{background: '#000', border: '1px solid #333'}} />
                  <Area type="monotone" dataKey="v" stroke={THEME.emerald} fill="url(#gradEv)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </DataCard>
          </div>

          {/* Type Contrat (Ref image 3 bas) */}
          <div className="col-span-12 lg:col-span-4">
            <DataCard title="Répartition Contrats" icon={Database} path="/rh/contrats">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.contracts} innerRadius={60} outerRadius={80} dataKey="v" paddingAngle={5}>
                    <Cell fill={THEME.emerald} stroke="none" />
                    <Cell fill={THEME.amber} stroke="none" />
                    <Cell fill={THEME.violet} stroke="none" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </DataCard>
          </div>

          {/* Départements (Ref image 3 droite) */}
          <div className="col-span-12 lg:col-span-6">
            <DataCard title="Effectif par Département" icon={Briefcase} path="/rh/departements">
              <div className="space-y-4 pt-4">
                {stats.depts.map((d, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-24 text-[8px] font-black text-zinc-500 uppercase">{d.n}</span>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${(d.v/61)*100}%` }} />
                    </div>
                    <span className="text-[10px] font-black">{d.v}</span>
                  </div>
                ))}
              </div>
            </DataCard>
          </div>

          {/* Statut Social (Ref image 3 milieu bas) */}
          <div className="col-span-12 lg:col-span-6">
            <DataCard title="Statut Social" icon={Heart} path="/rh/social">
              <div className="flex justify-around items-center h-full">
                {stats.social.map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="w-20 h-20 rounded-full border-4 border-white/5 flex flex-col items-center justify-center relative">
                      <span className="text-xl font-black italic">{s.p}%</span>
                      <div className={`absolute inset-0 rounded-full border-4 border-transparent ${i === 0 ? 'border-t-emerald-500' : 'border-t-rose-500'} animate-pulse`} />
                    </div>
                    <p className="mt-3 text-[9px] font-black uppercase text-zinc-400">{s.name}</p>
                  </div>
                ))}
              </div>
            </DataCard>
          </div>
        </div>

        {/* SECTION RECHERCHE RAPIDE (FONCTIONNELLE) */}
        <section className="mt-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black italic uppercase">Forage Rapide <span className="text-zinc-600">Agents</span></h2>
            <div className="relative w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                type="text" placeholder="NOM, DÉPARTEMENT OU ID..." 
                className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-[10px] font-bold outline-none focus:border-emerald-500 transition-all uppercase"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredEmployees.map(emp => (
              <div 
                key={emp.id} onClick={() => setSelectedEmp(emp)}
                className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-emerald-500/50 cursor-pointer transition-all flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-black font-black">{emp.name.charAt(0)}</div>
                <div>
                  <p className="font-black uppercase">{emp.name}</p>
                  <p className="text-[7px] text-zinc-500 font-bold">{emp.dept} • {emp.contract}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MODAL PROFIL DÉTAILLÉ (500+ LIGNES LOGIC) */}
        {selectedEmp && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
            <div className="w-full max-w-5xl bg-zinc-900 border border-white/10 rounded-[3rem] overflow-hidden animate-in zoom-in duration-300">
              <div className="grid grid-cols-12">
                {/* Sidebar Profil */}
                <div className="col-span-4 p-12 bg-black/40 border-r border-white/5 flex flex-col items-center">
                  <div className="w-32 h-32 rounded-3xl bg-emerald-500 flex items-center justify-center text-black text-5xl font-black mb-6">{selectedEmp.name.charAt(0)}</div>
                  <h2 className="text-2xl font-black uppercase text-center">{selectedEmp.name}</h2>
                  <p className="text-emerald-500 font-bold mb-8 uppercase tracking-widest">{selectedEmp.id}</p>
                  <div className="w-full space-y-2">
                    <div className="p-3 bg-white/5 rounded-xl text-[8px] font-bold flex gap-2 italic"><Mail size={12}/> {selectedEmp.email}</div>
                    <div className="p-3 bg-white/5 rounded-xl text-[8px] font-bold flex gap-2 italic"><MapPin size={12}/> {selectedEmp.nation}</div>
                  </div>
                </div>
                {/* Data Grid Profonde */}
                <div className="col-span-8 p-12 relative">
                  <button onClick={() => setSelectedEmp(null)} className="absolute top-8 right-8 text-zinc-500 hover:text-white"><X /></button>
                  <h3 className="text-zinc-500 font-black uppercase tracking-[0.3em] mb-10 flex gap-2"><Fingerprint size={16} className="text-emerald-500" /> Dossier Personnel Alpha</h3>
                  <div className="grid grid-cols-3 gap-8 mb-12">
                    <DetailItem label="Âge" value={`${selectedEmp.age} ans`} icon={Clock} />
                    <DetailItem label="Genre" value={selectedEmp.gender} icon={Activity} />
                    <DetailItem label="Contrat" value={selectedEmp.contract} icon={Briefcase} />
                    <DetailItem label="Diplôme" value={selectedEmp.diploma} icon={GraduationCap} />
                    <DetailItem label="Ancienneté" value={`${selectedEmp.seniority} ans`} icon={ShieldCheck} />
                    <DetailItem label="Début" value={selectedEmp.startDate} icon={Calendar} />
                  </div>
                  <div className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20 flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                      <div className="p-3 bg-emerald-500 rounded-2xl text-black"><FileText /></div>
                      <div><p className="font-black uppercase">Curriculum Vitae</p><p className="text-[7px] font-bold opacity-50 uppercase tracking-widest">PDF • Certifié</p></div>
                    </div>
                    <button className="bg-white text-black px-6 py-3 rounded-xl font-black uppercase text-[8px] tracking-widest hover:bg-emerald-500 transition-all">Télécharger</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Sous-composants
function KPITile({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl hover:border-white/20 transition-all">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">{label}</p>
        <Icon size={12} className={`${color} opacity-40`} />
      </div>
      <p className={`text-xl font-black italic tracking-tighter ${color}`}>{value}</p>
    </div>
  );
}

function DetailItem({ label, value, icon: Icon }: any) {
  return (
    <div>
      <p className="text-[7px] font-black text-zinc-500 uppercase tracking-widest flex gap-2 mb-1"><Icon size={10}/> {label}</p>
      <p className="text-sm font-black italic uppercase">{value}</p>
    </div>
  );
}
