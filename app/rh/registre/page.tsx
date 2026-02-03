"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from "../../../components/Sidebar";

/** * ARCHITECTURE MINE D'OR - REGISTRE GLOBAL & MASSE SALARIALE v2.0
 * Focus : Robustesse TypeScript, Calculs Financiers, UX Dense
 */
import { 
  Search, Filter, DownloadCloud, ArrowLeft, 
  FileText, Mail, ShieldCheck, UserPlus, 
  ChevronLeft, ChevronRight, Fingerprint,
  Wallet, Banknote, Eye, Download, Info,
  TrendingUp, Building2, Users2, Calendar,
  MoreVertical, CheckCircle2, AlertCircle, HardDrive
} from 'lucide-react';

// --- TYPES & INTERFACES ---
interface Employee {
  id: string;
  name: string;
  dept: string;
  post: string;
  contract: string;
  salary: number;
  status: 'Actif' | 'Congé' | 'En pause' | 'Sortie';
  email: string;
  joinDate: string;
  nation: string;
  aura: number;
}

// --- DATA SOURCE (Simulant une base de données de 153 membres) ---
const EMPLOYEES_MASTER: Employee[] = [
  { id: 'WKD-001', name: 'Malick Thiam', dept: 'IT & Système', post: 'Lead Developer', contract: 'CDI', salary: 1850000, status: 'Actif', email: 'm.thiam@wakanda.tech', joinDate: '2021-05-12', nation: 'Sénégal', aura: 98 },
  { id: 'WKD-002', name: 'Awa Diop', dept: 'Marketing', post: 'Brand Manager', contract: 'CDD', salary: 950000, status: 'Actif', email: 'a.diop@wakanda.tech', joinDate: '2024-02-01', nation: 'Mali', aura: 85 },
  { id: 'WKD-003', name: 'Jean-Luc Gila', dept: 'Production', post: 'Technicien Sup.', contract: 'Stage', salary: 350000, status: 'En pause', email: 'jl.gila@wakanda.tech', joinDate: '2024-06-15', nation: 'France', aura: 72 },
  { id: 'WKD-004', name: 'Sarah Kone', dept: 'Direction', post: 'Directrice RH', contract: 'CDI', salary: 3200000, status: 'Actif', email: 's.kone@wakanda.tech', joinDate: '2020-11-10', nation: 'Côte d\'Ivoire', aura: 94 },
  { id: 'WKD-005', name: 'Omar Sy', dept: 'Logistique', post: 'Chef de quai', contract: 'CDI', salary: 1100000, status: 'Actif', email: 'o.sy@wakanda.tech', joinDate: '2012-01-05', nation: 'Sénégal', aura: 99 },
  { id: 'WKD-006', name: 'Fatou Ndiaye', dept: 'IT & Système', post: 'DevOps Engineer', contract: 'CDI', salary: 1450000, status: 'Actif', email: 'f.ndiaye@wakanda.tech', joinDate: '2022-03-20', nation: 'Sénégal', aura: 91 },
  { id: 'WKD-007', name: 'Moussa Fofana', dept: 'Finance', post: 'Contrôleur de Gestion', contract: 'CDI', salary: 1600000, status: 'Actif', email: 'm.fofana@wakanda.tech', joinDate: '2019-08-15', nation: 'Guinée', aura: 88 },
  { id: 'WKD-008', name: 'Isabelle Traoré', dept: 'Marketing', post: 'Social Media Expert', contract: 'CDD', salary: 750000, status: 'Congé', email: 'i.traore@wakanda.tech', joinDate: '2023-12-01', nation: 'Burkina Faso', aura: 82 },
  { id: 'WKD-009', name: 'Bakary Sow', dept: 'Production', post: 'Opérateur Machine', contract: 'CDI', salary: 850000, status: 'Actif', email: 'b.sow@wakanda.tech', joinDate: '2018-05-10', nation: 'Sénégal', aura: 95 },
  { id: 'WKD-010', name: 'Elena Rossi', dept: 'Direction', post: 'Consultante Stratégie', contract: 'CDI', salary: 2800000, status: 'Actif', email: 'e.rossi@wakanda.tech', joinDate: '2021-01-10', nation: 'Italie', aura: 89 }
];

export default function RHRegistreGlobalUltraRobust() {
  const router = useRouter();
  
  // --- ÉTATS DE GESTION ---
  const [search, setSearch] = useState("");
  const [activeDept, setActiveDept] = useState("Tous");
  const [showPayroll, setShowPayroll] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  // --- ÉTATS DE GESTION ---
  const [employees, setEmployees] = useState<Employee[]>(EMPLOYEES_MASTER); // On passe la data en state
  const [activeMenu, setActiveMenu] = useState<string | null>(null); // Pour le menu des 3 petits points

  // --- CALCULS DE LA MASSE SALARIALE (LOGIQUE MÉTIER) ---
  const payrollStats = useMemo(() => {
    // Array.from pour compatibilité Vercel ES6
    const depts = Array.from(new Set(EMPLOYEES_MASTER.map(e => e.dept)));
    
    const breakdown = depts.map(d => {
      const filtered = EMPLOYEES_MASTER.filter(e => e.dept === d);
      return {
        name: d,
        total: filtered.reduce((acc, curr) => acc + curr.salary, 0),
        count: filtered.length,
        avg: filtered.reduce((acc, curr) => acc + curr.salary, 0) / filtered.length
      };
    });

    const grandTotal = breakdown.reduce((acc, curr) => acc + curr.total, 0);
    return { breakdown, grandTotal, depts };
  }, []);

  // --- SYSTÈME DE FILTRAGE DYNAMIQUE ---
  const filteredData = useMemo(() => {
    return employees.filter(emp => { ...
      const matchSearch = emp.name.toLowerCase().includes(search.toLowerCase()) || 
                          emp.id.toLowerCase().includes(search.toLowerCase()) ||
                          emp.post.toLowerCase().includes(search.toLowerCase());
      const matchDept = activeDept === "Tous" || emp.dept === activeDept;
      return matchSearch && matchDept;
    });
  }, [search, activeDept]);

  // Pagination
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Simulation d'export
  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 2000);
  };
  // Fonction pour changer le statut (Actif / Congé / Absent)
  const updateStatus = (id: string, newStatus: Employee['status']) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { ...emp, status: newStatus } : emp
    ));
    setActiveMenu(null); // Ferme le menu après action
  };

  // Fonction pour supprimer (Fin de contrat)
  const terminateContract = (id: string) => {
    if(confirm("Confirmer la fin de contrat définitive pour cet associé ?")) {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      setActiveMenu(null);
    }
  };

  return (
    <div className="flex h-screen bg-[#010101] text-white overflow-hidden font-sans">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto custom-scroll flex flex-col gap-6">
        
        {/* HEADER : NAVIGATION & ACTIONS PRIMAIRES */}
        <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-6 rounded-[2.5rem]">
          <div className="flex gap-4">
            <button 
              onClick={() => setShowPayroll(!showPayroll)}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                showPayroll ? 'bg-emerald-500 text-black' : 'bg-white/5 border border-white/10 hover:bg-white/10 text-emerald-500'
              }`}
            >
              <Banknote size={18} /> {showPayroll ? "Masquer la Paie" : "Livre de Paie Global"}
            </button>
            <button 
              onClick={() => router.push('/rh')}
              className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all"
            >
              <ArrowLeft size={18} /> Retour Dashboard
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right border-r border-white/10 pr-6">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Status Global</p>
              <p className="text-xl font-black italic text-white leading-none">REGISTRE ALPHA-1</p>
            </div>
            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <ShieldCheck size={24} className="text-emerald-500" />
            </div>
          </div>
        </div>

        {/* SECTION ANALYTIQUE : LIVRE DE PAIE (DÉTAILLÉ) */}
        {showPayroll && (
          <section className="bg-emerald-500/[0.03] border border-emerald-500/20 rounded-[3rem] p-10 animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-10">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Wallet className="text-emerald-500" size={24} />
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter">Masse Salariale <span className="text-emerald-500">Wakanda</span></h2>
                </div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest max-w-md leading-relaxed">
                  Analyse temps réel de l'investissement en capital humain. Données consolidées par département incluant primes et avantages.
                </p>
              </div>
              <div className="bg-black/50 p-8 rounded-[2rem] border border-white/5 min-w-[320px]">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Total Mensuel Brut</p>
                <p className="text-5xl font-black text-white italic tabular-nums tracking-tighter">
                  {payrollStats.grandTotal.toLocaleString()} <span className="text-emerald-500 text-lg">FCFA</span>
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
              {payrollStats.breakdown.map((dept, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl hover:border-emerald-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <Building2 size={16} className="text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                    <span className="text-[8px] font-black bg-white/5 px-2 py-1 rounded text-zinc-500">{dept.count} PERS.</span>
                  </div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">{dept.name}</p>
                  <p className="text-xl font-black text-white italic mb-1">{dept.total.toLocaleString()} F</p>
                  <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${(dept.total / payrollStats.grandTotal) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* BARRE D'OUTILS DE RECHERCHE & FILTRES */}
        <section className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-5 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="RECHERCHER UN NOM, UN POSTE OU UN IDENTIFIANT..." 
              className="w-full bg-white/[0.02] border border-white/10 rounded-3xl py-6 pl-16 pr-8 text-xs font-bold uppercase tracking-widest outline-none focus:border-emerald-500 focus:bg-white/[0.04] transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="col-span-12 lg:col-span-3">
            <div className="relative h-full">
              <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <select 
                className="w-full h-full bg-white/[0.02] border border-white/10 rounded-3xl py-4 pl-16 pr-8 text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer focus:border-emerald-500 transition-all"
                value={activeDept}
                onChange={(e) => setActiveDept(e.target.value)}
              >
                <option value="Tous">TOUS LES PÔLES</option>
                {payrollStats.depts.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
              </select>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 flex gap-3">
            <button 
              onClick={handleExport}
              className="flex-1 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center gap-4 hover:bg-white/10 transition-all font-black uppercase tracking-widest text-[10px]"
            >
              {isExporting ? <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" /> : <Download size={18} />}
              Export CSV
            </button>
            <button className="flex-1 bg-emerald-500 text-black rounded-3xl flex items-center justify-center gap-4 hover:scale-105 transition-all font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20">
              <UserPlus size={20} /> Nouvel Associé
            </button>
          </div>
        </section>

        {/* LE REGISTRE MAÎTRE (TABLEAU) */}
        <section className="bg-white/[0.01] border border-white/5 rounded-[3.5rem] overflow-hidden flex flex-col flex-1 shadow-2xl">
          <div className="overflow-x-auto custom-scroll">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-white/[0.03] text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">
                  <th className="p-8 border-b border-white/5">Associé & ID</th>
                  <th className="p-8 border-b border-white/5">Pôle & Mission</th>
                  <th className="p-8 border-b border-white/5">Contrat</th>
                  <th className="p-8 border-b border-white/5">Salaire Net</th>
                  <th className="p-8 border-b border-white/5">Statut</th>
                  <th className="p-8 border-b border-white/5 text-right">Actions de Gestion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedData.map((emp) => (
                  <tr key={emp.id} className="group hover:bg-white/[0.02] transition-all">
                    {/* Colonne Identité */}
                    <td className="p-8">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center relative overflow-hidden group-hover:border-emerald-500/50 transition-all">
                          <span className="text-2xl font-black italic text-zinc-500 group-hover:text-emerald-500 transition-colors">{emp.name.charAt(0)}</span>
                          <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div>
                          <p className="font-black uppercase text-sm tracking-tighter text-white mb-1 group-hover:text-emerald-500 transition-colors">{emp.name}</p>
                          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                            <Fingerprint size={10} className="text-zinc-700" /> {emp.id} <span className="text-zinc-800">•</span> {emp.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Colonne Pôle */}
                    <td className="p-8">
                      <div>
                        <p className="text-[10px] font-black uppercase text-zinc-300 tracking-wider mb-1 italic">{emp.dept}</p>
                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{emp.post}</p>
                      </div>
                    </td>

                    {/* Colonne Contrat */}
                    <td className="p-8">
                      <div className="flex flex-col gap-2">
                        <span className="w-fit px-4 py-1.5 bg-zinc-900 border border-white/10 rounded-full font-black text-[9px] text-zinc-400 uppercase tracking-widest">
                          {emp.contract}
                        </span>
                        <div className="flex items-center gap-2 text-[8px] font-bold text-zinc-600 uppercase">
                          <Calendar size={10} /> {emp.joinDate}
                        </div>
                      </div>
                    </td>

                    {/* Colonne Salaire (Ref demande) */}
                    <td className="p-8">
                      <div className="flex flex-col">
                        <p className="text-base font-black text-white tabular-nums italic group-hover:scale-105 transition-transform origin-left">
                          {emp.salary.toLocaleString()} <span className="text-[10px] text-emerald-500 not-italic ml-1">F</span>
                        </p>
                        <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter">Versé mensuellement</p>
                      </div>
                    </td>

                    {/* Colonne Statut : Devient cliquable pour changer rapidement */}
                    <td className="p-8">
                      <button 
                        onClick={() => updateStatus(emp.id, emp.status === 'Actif' ? 'Congé' : 'Actif')}
                        className={`flex items-center gap-3 px-4 py-2 rounded-xl border w-fit transition-all hover:scale-105 ${
                        emp.status === 'Actif' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 
                        emp.status === 'Congé' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                        'bg-rose-500/10 border-rose-500/20 text-rose-500'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full bg-current ${emp.status === 'Actif' ? 'animate-pulse' : ''}`} />
                        <span className="font-black uppercase text-[9px] tracking-[0.2em]">{emp.status}</span>
                      </button>
                    </td>

                    {/* Colonne Actions : Menu Contextuel */}
                    <td className="p-8 relative">
                      <div className="flex justify-end gap-3">
                        <button className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all">
                          <DownloadCloud size={16} /> Contrat.pdf
                        </button>
                        
                        <div className="relative">
                          <button 
                            onClick={() => setActiveMenu(activeMenu === emp.id ? null : emp.id)}
                            className={`p-3 border rounded-2xl transition-all ${activeMenu === emp.id ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white'}`}
                          >
                            <MoreVertical size={18} />
                          </button>

                          {/* MENU CONTEXTUEL (Apparaît au clic) */}
                          {activeMenu === emp.id && (
                            <div className="absolute right-0 mt-2 w-56 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden p-2 animate-in fade-in slide-in-from-top-2">
                              <button onClick={() => updateStatus(emp.id, 'Actif')} className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                                <span>Marquer Actif</span>
                                <CheckCircle2 size={14} />
                              </button>
                              
                              <button onClick={() => updateStatus(emp.id, 'Congé')} className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-amber-500">
                                <div className="flex flex-col items-start">
                                  <span>En Congé</span>
                                  <span className="text-[7px] text-zinc-500 italic lowercase">Raisons & délais</span>
                                </div>
                                <Calendar size={14} />
                              </button>

                              <div className="h-[1px] bg-white/5 my-2" />

                              <button onClick={() => terminateContract(emp.id)} className="w-full flex items-center justify-between p-3 hover:bg-rose-500 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest text-rose-500 transition-colors">
                                <span>Fin de contrat</span>
                                <AlertCircle size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

          {/* FOOTER ALPHA : PAGINATION & INFOS SYSTÈME */}
          <div className="p-10 border-t border-white/5 bg-black/40 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 text-zinc-600">
                <HardDrive size={16} />
                <p className="text-[9px] font-black uppercase tracking-[0.4em]">Node: Wakanda-East-1</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-zinc-500 uppercase">Affichage:</span>
                <span className="text-[10px] font-black text-white italic">{paginatedData.length} sur {filteredData.length} membres</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-3 bg-white/5 border border-white/10 rounded-2xl text-zinc-500 hover:bg-emerald-500 hover:text-black transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex gap-2 mx-4">
                {[1, 2, 3].map(n => (
                  <button 
                    key={n}
                    onClick={() => setCurrentPage(n)}
                    className={`w-10 h-10 rounded-2xl font-black text-[10px] border transition-all ${
                      currentPage === n ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-white/5 border-white/10 text-zinc-500'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-3 bg-white/5 border border-white/10 rounded-2xl text-zinc-500 hover:bg-emerald-500 hover:text-black transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="flex items-center gap-4 text-emerald-500/40">
              <CheckCircle2 size={16} />
              <p className="text-[8px] font-black uppercase tracking-[0.5em]">Toutes les données sont encryptées AES-256</p>
            </div>
          </div>
        </section>
      </main>

      {/* STYLES PERSONNALISÉS */}
      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        @keyframes subtle-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .animate-pulse { animation: subtle-pulse 2s infinite; }
      `}</style>
    </div>
  );
}
