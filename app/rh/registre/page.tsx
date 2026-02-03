"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from "../../../components/Sidebar";
import { 
  Search, Filter, DownloadCloud, ArrowLeft, 
  FileText, Mail, ShieldCheck, UserPlus, 
  ChevronLeft, ChevronRight, Fingerprint,
  Wallet, PieChart, Banknote, Eye, Download
} from 'lucide-react';

// --- BASE DE DONNÉES ÉTENDUE (SALAIRES INCLUS) ---
const EMPLOYEES_DATA = [
  { id: 'WKD-001', name: 'Malick Thiam', dept: 'Informatique', contract: 'CDI', nation: 'Sénégal', salary: 1200000, status: 'Actif', email: 'm.thiam@wakanda.tech' },
  { id: 'WKD-002', name: 'Awa Diop', dept: 'Marketing', contract: 'CDD', nation: 'Mali', salary: 850000, status: 'Actif', email: 'a.diop@wakanda.tech' },
  { id: 'WKD-003', name: 'Jean-Luc Gila', dept: 'Production', contract: 'Stage', nation: 'France', salary: 250000, status: 'En pause', email: 'jl.gila@wakanda.tech' },
  { id: 'WKD-004', name: 'Sarah Kone', dept: 'Direction', contract: 'CDI', nation: 'Côte d\'Ivoire', salary: 2500000, status: 'Actif', email: 's.kone@wakanda.tech' },
  { id: 'WKD-005', name: 'Omar Sy', dept: 'Logistique', contract: 'CDI', nation: 'Sénégal', salary: 950000, status: 'Actif', email: 'o.sy@wakanda.tech' },
  { id: 'WKD-006', name: 'Fatou Ndiaye', dept: 'Informatique', contract: 'CDI', nation: 'Sénégal', salary: 1100000, status: 'Actif', email: 'f.ndiaye@wakanda.tech' },
];

export default function RHRegistreComplet() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showPayroll, setShowPayroll] = useState(false);

  // --- LOGIQUE DE CALCUL DE MASSE SALARIALE ---
  const payrollStats = useMemo(() => {
    const depts = [...new Set(EMPLOYEES_DATA.map(e => e.dept))];
    const breakdown = depts.map(d => ({
      name: d,
      total: EMPLOYEES_DATA.filter(e => e.dept === d).reduce((acc, curr) => acc + curr.salary, 0),
      count: EMPLOYEES_DATA.filter(e => e.dept === d).length
    }));
    const grandTotal = breakdown.reduce((acc, curr) => acc + curr.total, 0);
    return { breakdown, grandTotal };
  }, []);

  const filteredData = useMemo(() => {
    return EMPLOYEES_DATA.filter(emp => 
      emp.name.toLowerCase().includes(search.toLowerCase()) || 
      emp.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="flex h-screen bg-[#010101] text-white overflow-hidden font-sans">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto custom-scroll flex flex-col gap-6">
        
        {/* HEADER & BOUTON LIVRE DE PAIE (HAUT GAUCHE) */}
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <button 
              onClick={() => setShowPayroll(!showPayroll)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all border ${
                showPayroll ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <Banknote size={16} /> {showPayroll ? "Fermer la Paie" : "Livre de Paie Global"}
            </button>
            <button 
              onClick={() => router.push('/rh')}
              className="flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all"
            >
              <ArrowLeft size={16} /> Dashboard
            </button>
          </div>

          <div className="text-right">
            <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-1">Registre <span className="text-emerald-500 text-sm">Alpha</span></h1>
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em]">Base de données certifiée</p>
          </div>
        </div>

        {/* VUE MASSE SALARIALE (CONDITIONNELLE) */}
        {showPayroll && (
          <section className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] p-8 animate-in slide-in-from-top duration-500">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-xl font-black italic uppercase text-emerald-500 mb-2">Analyse de la Masse Salariale</h2>
                <p className="text-[9px] font-bold text-zinc-400 uppercase">Répartition budgétaire par pôle opérationnel</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-zinc-500 uppercase mb-1">Masse Totale Mensuelle</p>
                <p className="text-4xl font-black text-white italic tabular-nums">
                  {payrollStats.grandTotal.toLocaleString()} <span className="text-emerald-500 text-sm">FCFA</span>
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {payrollStats.breakdown.map((dept, i) => (
                <div key={i} className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                  <p className="text-[8px] font-black text-zinc-500 uppercase mb-3 tracking-widest">{dept.name}</p>
                  <p className="text-xl font-black text-white italic mb-1">{dept.total.toLocaleString()} F</p>
                  <p className="text-[7px] font-bold text-emerald-500 uppercase">{dept.count} Associés</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* BARRE DE RECHERCHE */}
        <section className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="RECHERCHER DANS LA MINE D'OR (NOM, ID...)" 
              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-5 pl-16 pr-8 text-xs font-bold uppercase tracking-widest outline-none focus:border-emerald-500 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="px-8 bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:scale-105 transition-all">
            + Ajouter Associé
          </button>
        </section>

        {/* TABLEAU REGISTRE */}
        <section className="bg-white/[0.01] border border-white/5 rounded-[3rem] overflow-hidden flex flex-col flex-1">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-white/[0.02] text-[9px] font-black uppercase text-zinc-500 tracking-[0.3em]">
                  <th className="p-8">Membre & Identifiant</th>
                  <th className="p-8">Département</th>
                  <th className="p-8">Contrat</th>
                  <th className="p-8">Salaire Net</th>
                  <th className="p-8 text-right">Documents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredData.map((emp) => (
                  <tr key={emp.id} className="group hover:bg-emerald-500/[0.02] transition-all">
                    <td className="p-8 flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-emerald-500 font-black text-xl italic group-hover:bg-emerald-500 group-hover:text-black transition-all">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black uppercase text-sm tracking-tighter text-zinc-200">{emp.name}</p>
                        <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{emp.id} • {emp.email}</p>
                      </div>
                    </td>
                    <td className="p-8">
                      <p className="text-[10px] font-black uppercase text-zinc-400 italic">{emp.dept}</p>
                    </td>
                    <td className="p-8">
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg font-black text-[8px] text-zinc-500 uppercase">
                        {emp.contract}
                      </span>
                    </td>
                    <td className="p-8">
                      <p className="text-sm font-black text-white tabular-nums italic">
                        {emp.salary.toLocaleString()} <span className="text-[9px] text-emerald-500 not-italic ml-1">FCFA</span>
                      </p>
                    </td>
                    <td className="p-8">
                      <div className="flex justify-end gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all">
                          <DownloadCloud size={14} /> Contrat
                        </button>
                        <button className="p-2 bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-colors">
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FOOTER TABLEAU */}
          <div className="p-8 border-t border-white/5 bg-black/40 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.4em]">Section de sécurité Alpha-9</p>
              <div className="flex gap-2">
                {[1, 2, 3].map(n => (
                  <button key={n} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border ${n===1 ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-white/5 border-white/10 text-zinc-500'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[9px] font-black italic text-zinc-500 uppercase">
              Affichage de {filteredData.length} membres actifs
            </p>
          </div>
        </section>
      </main>

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
      `}</style>
    </div>
  );
}
