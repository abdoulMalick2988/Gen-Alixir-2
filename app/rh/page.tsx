"use client";

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../components/WakandaGuard";

/** * ARCHITECTURE MINE D'OR RH v6.0 - DASHBOARD ANALYTIQUE PUR
 * Focus : Lisibilité accrue, Légendes contextuelles, Navigation interactive.
 */
import { 
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, 
  Tooltip, Bar, XAxis, YAxis, CartesianGrid, Legend, 
  BarChart, LineChart, Line, ComposedChart 
} from 'recharts';

import { 
  Users, Database, TrendingUp, Briefcase, GraduationCap, 
  Globe, Heart, ArrowUpRight, Fingerprint, Activity, 
  UserCheck, Zap, ShieldCheck, Clock, List, Info
} from 'lucide-react';

// --- SYSTÈME DE DESIGN WAKANDA GOLD ---
const THEME = {
  emerald: "#10b981", blue: "#3b82f6", violet: "#8b5cf6",
  amber: "#f59e0b", rose: "#f43f5e", cyan: "#06b6d4",
  zinc: "#18181b", border: "rgba(255, 255, 255, 0.05)"
};

export default function RHDashboardRobust() {
  const user = useAuth();
  const router = useRouter();

  // --- MOTEUR DE CALCUL STATISTIQUE ---
  const stats = useMemo(() => ({
    total: 153, male: 115, female: 38,
    contrats: [
      { name: 'CDI', v: 139, color: THEME.emerald, desc: "Contrats à durée indéterminée (91%)" },
      { name: 'CDD', v: 12, color: THEME.amber, desc: "Contrats à durée déterminée (8%)" },
      { name: 'Stage', v: 2, color: THEME.violet, desc: "Stagiaires & Apprentis (1%)" }
    ],
    evolution: [
      { y: '1984', v: 1 }, { y: '1990', v: 5 }, { y: '1995', v: 12 },
      { y: '2005', v: 18 }, { y: '2015', v: 28 }, { y: '2026', v: 36 }
    ],
    nations: [
      { name: 'Sénégal', v: 75 }, { name: 'France', v: 19 }, { name: 'Mali', v: 14 },
      { name: 'RDC', v: 9 }, { name: 'Maroc', v: 6 }
    ],
    diplomas: [
      { name: 'BEPC', val: 37 }, { name: 'BTS', val: 48 }, 
      { name: 'Licence', val: 44 }, { name: 'Master', val: 23 }, { name: 'Bac', val: 1 }
    ],
    depts: [
      { n: 'Production', v: 61, full: 80 }, { n: 'Marketing', v: 55, full: 70 },
      { n: 'Finance', v: 18, full: 30 }, { n: 'IT', v: 12, full: 25 }
    ],
    social: [
      { name: 'Marié', v: 99, p: 65, color: THEME.emerald },
      { name: 'Célibataire', v: 53, p: 35, color: THEME.rose }
    ],
    csp: [
      { name: 'Cadre', v: 29 }, { name: 'Agent', v: 49 }, { name: 'Ouvrier', v: 37 }
    ]
  }), []);

  // --- COMPOSANTS UI HAUTE PRÉCISION ---
  
  // KPI Top Line - Taille augmentée (Ref demande)
  const HighVisibilityKPI = ({ label, value, sub, icon: Icon, color }: any) => (
    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] hover:bg-white/[0.04] transition-all group flex flex-col justify-between h-full">
      <div className="flex justify-between items-start">
        <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
          <Icon size={20} className={color} />
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">{label}</p>
          <p className={`text-4xl font-black italic tracking-tighter ${color} leading-none`}>{value}</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/5">
        <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{sub}</p>
      </div>
    </div>
  );

  // Data Module avec Légende intégrée
  const AnalyticsModule = ({ title, icon: Icon, children, path, legend, span = "col-span-12 lg:col-span-4" }: any) => (
    <div 
      onClick={() => router.push(path)}
      className={`${span} bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-8 hover:border-emerald-500/30 transition-all cursor-pointer group flex flex-col`}
    >
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500 group-hover:rotate-12 transition-transform">
            <Icon size={18} />
          </div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-300 italic">{title}</h3>
        </div>
        <ArrowUpRight size={16} className="text-zinc-700 group-hover:text-emerald-500 transition-colors" />
      </div>
      
      <div className="flex-1 min-h-[220px] w-full mb-6">
        {children}
      </div>

      <div className="mt-auto pt-6 border-t border-white/5 flex gap-3 items-start opacity-60 group-hover:opacity-100 transition-opacity">
        <Info size={14} className="text-emerald-500 shrink-0 mt-0.5" />
        <p className="text-[9px] font-medium text-zinc-400 leading-relaxed italic">
          {legend}
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#010101] text-white overflow-hidden font-sans">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto custom-scroll flex flex-col gap-8">
        
        {/* HEADER MINIMALISTE & BOUTON REGISTRE */}
        <header className="flex justify-between items-center bg-white/[0.02] p-8 rounded-[3rem] border border-white/5">
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none mb-2">
              MINE D'OR <span className="text-emerald-500">INTEL RH</span>
            </h1>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.5em] flex items-center gap-3">
              <Activity size={14} className="text-emerald-500" /> Protocole d'analyse de données massives • LIVE v6.2
            </p>
          </div>
          <button 
            onClick={() => router.push('/rh/registre')}
            className="px-10 py-5 bg-white text-black rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all flex items-center gap-4 shadow-xl shadow-emerald-500/10"
          >
            <List size={18} /> Registre Global Employés
          </button>
        </header>

        {/* TOP KPI LINE - TAILLE AUGMENTÉE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          <HighVisibilityKPI label="Effectif Total" value={stats.total} sub="Agents Actifs" icon={Users} color="text-white" />
          <HighVisibilityKPI label="Genre Masculin" value={stats.male} sub="75.1% Total" icon={UserCheck} color="text-blue-400" />
          <HighVisibilityKPI label="Genre Féminin" value={stats.female} sub="24.9% Total" icon={UserCheck} color="text-rose-400" />
          <HighVisibilityKPI label="Contrats CDI" value="139" sub="Stabilité 91%" icon={ShieldCheck} color="text-emerald-500" />
          <HighVisibilityKPI label="Contrats CDD" value="12" sub="Flexibilité 8%" icon={Clock} color="text-amber-500" />
          <HighVisibilityKPI label="Stage / Appr." value="2" sub="Immersion 1%" icon={Zap} color="text-violet-400" />
          <HighVisibilityKPI label="Pays Sources" value="10" sub="Diversité" icon={Globe} color="text-cyan-400" />
        </div>

        {/* ANALYTICS GRID CORE */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* 1. EVOLUTION (Span Large) */}
          <AnalyticsModule 
            title="Courbe d'Évolution des Effectifs" 
            icon={TrendingUp} 
            path="/rh/evolution"
            span="col-span-12 lg:col-span-8"
            legend="Analyse temporelle de la croissance du capital humain depuis 1984. Les pics correspondent aux phases d'industrialisation majeures."
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.evolution}>
                <defs>
                  <linearGradient id="gradEv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.emerald} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={THEME.emerald} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="y" stroke="#444" fontSize={10} fontWeight="bold" />
                <YAxis stroke="#444" fontSize={10} />
                <Tooltip contentStyle={{background: '#000', border: '1px solid #333', fontSize: '10px'}} />
                <Area type="monotone" dataKey="v" stroke={THEME.emerald} fill="url(#gradEv)" strokeWidth={4} dot={{ r: 4, fill: THEME.emerald }} />
              </AreaChart>
            </ResponsiveContainer>
          </AnalyticsModule>

          {/* 2. RÉPARTITION CONTRATS */}
          <AnalyticsModule 
            title="Typologie des Contrats" 
            icon={Database} 
            path="/rh/contrats"
            legend="Visualisation de la précarité vs stabilité. Une forte prédominance du CDI assure une rétention du savoir-faire technique."
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={stats.contrats} 
                  innerRadius={60} 
                  outerRadius={75} 
                  dataKey="v" 
                  paddingAngle={8}
                >
                  {stats.contrats.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip />
                <Legend 
                  verticalAlign="bottom" 
                  height={45} 
                  wrapperStyle={{ 
                    paddingTop: '25px', 
                    fontSize: '10px', 
                    textTransform: 'uppercase',
                    fontWeight: '900'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </AnalyticsModule>

          {/* 3. DIPLÔMES */}
          <AnalyticsModule 
            title="Index des Compétences" 
            icon={GraduationCap} 
            path="/rh/competences"
            legend="Répartition par niveau académique. Le volume élevé de BTS et Licences souligne un profil opérationnel et technique dominant."
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.diplomas}>
                <XAxis dataKey="name" stroke="#444" fontSize={9} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="val" fill={THEME.blue} radius={[6, 6, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </AnalyticsModule>

          {/* 4. DIVERSITÉ NATIONALE */}
          <AnalyticsModule 
            title="Origines Géographiques" 
            icon={Globe} 
            path="/rh/diversite"
            legend="Cartographie de la diversité culturelle. Favorise l'innovation par l'intégration de perspectives internationales."
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={stats.nations} margin={{left: 30}}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#888" fontSize={10} fontWeight="bold" />
                <Tooltip />
                <Bar dataKey="v" fill={THEME.violet} radius={[0, 6, 6, 0]} barSize={15} />
              </BarChart>
            </ResponsiveContainer>
          </AnalyticsModule>

          {/* 5. STRUCTURE CSP */}
          <AnalyticsModule 
            title="Répartition par CSP" 
            icon={Fingerprint} 
            path="/rh/structure"
            legend="Analyse de la pyramide hiérarchique. Équilibre entre cadres stratégiques et agents d'exécution."
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.csp} innerRadius={0} outerRadius={80} dataKey="v">
                  <Cell fill={THEME.emerald} />
                  <Cell fill={THEME.blue} />
                  <Cell fill={THEME.cyan} />
                </Pie>
                <Tooltip />
                <Legend iconType="diamond" wrapperStyle={{fontSize: '9px'}} />
              </PieChart>
            </ResponsiveContainer>
          </AnalyticsModule>

          {/* 6. DÉPARTEMENTS (Span Medium) */}
          <AnalyticsModule 
            title="Densité des Pôles" 
            icon={Briefcase} 
            path="/rh/departements"
            span="col-span-12 lg:col-span-6"
            legend="Répartition des forces vives par département. Le pôle Production reste le moteur principal de l'activité."
          >
            <div className="space-y-6 pt-4">
              {stats.depts.map((d, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{d.n}</span>
                    <span className="text-[12px] font-black text-white italic">{d.v} agents</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-1000" 
                      style={{ width: `${(d.v/d.full)*100}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </AnalyticsModule>

          {/* 7. CLIMAT SOCIAL */}
          <AnalyticsModule 
            title="Indicateurs de Statut Social" 
            icon={Heart} 
            path="/rh/social"
            span="col-span-12 lg:col-span-6"
            legend="Aperçu de la situation familiale globale. Ces données influencent les politiques de mutuelle et d'avantages sociaux."
          >
            <div className="flex justify-around items-center h-full">
              {stats.social.map((s, i) => (
                <div key={i} className="flex flex-col items-center group/item scale-90">
                  <div className="w-28 h-28 rounded-full border-[6px] border-white/5 flex flex-col items-center justify-center relative transition-transform group-hover/item:scale-105">
                    <span className="text-3xl font-black italic">{s.p}%</span>
                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter">{s.v} PERSONNES</span>
                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                      <circle 
                        cx="56" cy="56" r="52" 
                        fill="none" 
                        stroke={s.color} 
                        strokeWidth="6" 
                        strokeDasharray="326.7" 
                        strokeDashoffset={326.7 - (326.7 * s.p) / 100}
                        strokeLinecap="round"
                        className="opacity-60"
                      />
                    </svg>
                  </div>
                  <p className="mt-6 text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">{s.name}</p>
                </div>
              ))}
            </div>
          </AnalyticsModule>

        </div>

        {/* FOOTER ALPHA */}
        <footer className="mt-auto py-8 border-t border-white/5 flex justify-between items-center opacity-20 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-4">
            <Fingerprint size={20} className="text-emerald-500" />
            <p className="text-[8px] font-black uppercase tracking-[0.5em]">Wakanda Intelligence Systems • Data-Mining Protocol Alpha-7</p>
          </div>
          <div className="flex gap-8 text-[8px] font-bold uppercase tracking-widest text-emerald-500">
            <span>Enc: AES-256</span>
            <span>Status: Orbital Feed Active</span>
          </div>
        </footer>

      </main>

      {/* STYLES PERSONNALISÉS */}
      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #10b981; border-radius: 20px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .grid > div { animation: fadeIn 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
}
