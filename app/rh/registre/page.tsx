"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from "../../../components/Sidebar";
import { useEffect } from 'react'; // Ajoute useEffect ici
import { supabase } from '@/lib/supabase'; // Ajoute cette ligne

/** * ARCHITECTURE MINE D'OR - REGISTRE GLOBAL & MASSE SALARIALE v2.0
 * Focus : Robustesse TypeScript, Calculs Financiers, UX Dense
 */
import { 
  Search, Filter, DownloadCloud, ArrowLeft, 
  ShieldCheck, UserPlus, ChevronLeft, ChevronRight, 
  Fingerprint, Wallet, Banknote, Download, 
  Building2, Calendar, MoreVertical, CheckCircle2, 
  AlertCircle, HardDrive 
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
  // Nouveaux champs
  age?: number;
  genre?: 'M' | 'F';
  pco?: string; // Point de Contact Opérationnel
}

// --- DATA SOURCE ---
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
  
  const [employees, setEmployees] = useState<Employee[]>([]); // On initialise à vide
  const [loading, setLoading] = useState(true); // On active le chargement

  // --- RÉCUPÉRATION SUPABASE ---
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const { data, error } = await supabase
          .from('staff')
          .select('*');

        if (error) throw error;

        if (data) {
          const formattedData = data.map((item: any) => ({
            id: item.id_key ? `WKD-${item.id_key}` : item.id,
            name: item.full_name || 'Inconnu',
            dept: item.department || 'Non assigné',
            post: item.role || 'Collaborateur',
            contract: 'CDI', // Valeur par défaut
            salary: item.salary || 0,
            status: item.status === 'En ligne' ? 'Actif' : 'En pause',
            email: item.email || '',
            joinDate: new Date(item.created_at).toISOString().split('T')[0],
            nation: 'Sénégal',
            aura: 100,
            age: item.age,
            genre: item.genre,
            pco: item.pco
          }));
          setEmployees(formattedData);
        }
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);
  const [search, setSearch] = useState("");
  const [activeDept, setActiveDept] = useState("Tous");
  const [showPayroll, setShowPayroll] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCollab, setNewCollab] = useState({
    name: '', dept: 'Direction', post: '', contract: 'CDI', salary: 0, joinDate: new Date().toISOString().split('T')[0]
  });
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const itemsPerPage = 8;

  // --- CALCULS STATISTIQUES ---
  const payrollStats = useMemo(() => {
    const depts = Array.from(new Set(employees.map(e => e.dept)));
    const breakdown = depts.map(d => {
      const filtered = employees.filter(e => e.dept === d);
      return {
        name: d,
        total: filtered.reduce((acc, curr) => acc + curr.salary, 0),
        count: filtered.length
      };
    });
    const grandTotal = breakdown.reduce((acc, curr) => acc + curr.total, 0);
    return { breakdown, grandTotal, depts };
  }, [employees]);

  // --- FILTRAGE ---
  const filteredData = useMemo(() => {
    if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent animate-spin rounded-full"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500">Synchronisation Alpha-1...</p>
        </div>
      </div>
    );
  }
    return employees.filter(emp => {
      const matchSearch = emp.name.toLowerCase().includes(search.toLowerCase()) || 
                          emp.id.toLowerCase().includes(search.toLowerCase()) ||
                          emp.post.toLowerCase().includes(search.toLowerCase());
      const matchDept = activeDept === "Tous" || emp.dept === activeDept;
      return matchSearch && matchDept;
    });
  }, [search, activeDept, employees]);

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- ACTIONS ---
  const updateStatus = (id: string, newStatus: Employee['status']) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, status: newStatus } : emp));
    setActiveMenu(null);
  };

  const terminateContract = (id: string) => {
    if (typeof window !== 'undefined' && window.confirm("Confirmer la fin de contrat définitive ?")) {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      setActiveMenu(null);
    }
  };

  const handleAddCollab = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `WKD-${Math.floor(100 + Math.random() * 900)}`; // Génère un ID type WKD-452
    const collabToAdd: Employee = {
      ...newCollab,
      id,
      status: 'Actif',
      email: `${newCollab.name.toLowerCase().replace(' ', '.')}@wakanda.tech`,
      nation: 'Sénégal', // Par défaut
      aura: 100
    };
    setEmployees([collabToAdd, ...employees]);
    setIsModalOpen(false);
    setNewCollab({ name: '', dept: 'Direction', post: '', contract: 'CDI', salary: 0, joinDate: new Date().toISOString().split('T')[0] });
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 2000);
  };

  return (
    <div className="flex h-screen bg-[#010101] text-white overflow-hidden font-sans">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto flex flex-col gap-6 custom-scroll">
        
        {/* HEADER */}
        <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-6 rounded-[2.5rem]">
          <div className="flex gap-4">
            <button onClick={() => setShowPayroll(!showPayroll)} className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${showPayroll ? 'bg-emerald-500 text-black' : 'bg-white/5 border border-white/10 text-emerald-500 hover:bg-white/10'}`}>
              <Banknote size={18} /> {showPayroll ? "Masquer la Paie" : "Livre de Paie Global"}
            </button>
            <button onClick={() => router.push('/rh')} className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10">
              <ArrowLeft size={18} /> Retour
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

        {/* SECTION LIVRE DE PAIE */}
        {showPayroll && (
          <section className="bg-emerald-500/[0.03] border border-emerald-500/20 rounded-[3rem] p-10 animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-10">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Wallet className="text-emerald-500" size={24} />
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter">Masse Salariale <span className="text-emerald-500">Wakanda</span></h2>
                </div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest max-w-md">Analyse temps réel de l'investissement en capital humain.</p>
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
                <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl hover:border-emerald-500/30 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <Building2 size={16} className="text-zinc-600" />
                    <span className="text-[8px] font-black bg-white/5 px-2 py-1 rounded text-zinc-500 uppercase">{dept.count} Pers.</span>
                  </div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">{dept.name}</p>
                  <p className="text-xl font-black text-white italic">{dept.total.toLocaleString()} F</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FILTRES */}
        <section className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-5 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input 
              type="text" 
              placeholder="RECHERCHER..." 
              className="w-full bg-white/[0.02] border border-white/10 rounded-3xl py-6 pl-16 pr-8 text-xs font-bold uppercase outline-none focus:border-emerald-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-span-12 lg:col-span-3">
            <select 
              className="w-full h-full bg-white/[0.02] border border-white/10 rounded-3xl px-8 text-[10px] font-black uppercase outline-none"
              value={activeDept}
              onChange={(e) => setActiveDept(e.target.value)}
            >
              <option value="Tous">TOUS LES PÔLES</option>
              {payrollStats.depts.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="col-span-12 lg:col-span-4 flex gap-3">
            <button onClick={handleExport} className="flex-1 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center gap-4 hover:bg-white/10 font-black uppercase tracking-widest text-[10px]">
              {isExporting ? <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" /> : <Download size={18} />} Export CSV
            </button>
            <button 
  onClick={() => setIsModalOpen(true)}
  className="flex-1 bg-emerald-500 text-black rounded-3xl flex items-center justify-center gap-2 hover:scale-105 transition-all font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 px-4"
>
  <UserPlus size={18} className="shrink-0" /> 
  <span>Nouveau Collaborateur</span>
</button>
          </div>
        </section>

        {/* TABLEAU MAÎTRE */}
        <section className="bg-white/[0.01] border border-white/5 rounded-[3.5rem] overflow-hidden flex flex-col flex-1 shadow-2xl">
          <div className="overflow-x-auto custom-scroll">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.03] text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">
                  <th className="p-8">Associé & ID</th>
                  <th className="p-8">Pôle & Mission</th>
                  <th className="p-8">Contrat</th>
                  <th className="p-8">Salaire Net</th>
                  <th className="p-8">Statut</th>
                  <th className="p-8 text-right">Gestion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedData.map((emp) => (
                  <tr key={emp.id} className="group hover:bg-white/[0.02] transition-all">
                    <td className="p-8">
  <div className="flex items-center gap-5">
    {/* Avatar cliquable */}
    <div 
      onClick={() => setSelectedEmployee(emp)}
      className="w-14 h-14 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center font-black text-2xl text-zinc-500 hover:text-emerald-500 hover:border-emerald-500/50 transition-all cursor-pointer relative group/avatar"
    >
      {emp.name.charAt(0)}
      <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover/avatar:opacity-100 rounded-2xl transition-opacity" />
    </div>
    <div>
      {/* Nom cliquable */}
      <p 
        onClick={() => setSelectedEmployee(emp)}
        className="font-black uppercase text-sm text-white hover:text-emerald-500 cursor-pointer transition-colors"
      >
        {emp.name}
      </p>
      <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">
        <Fingerprint size={10} /> {emp.id}
      </p>
    </div>
  </div>
</td>
                    <td className="p-8">
                      <p className="text-[10px] font-black uppercase text-zinc-300 italic">{emp.dept}</p>
                      <p className="text-[9px] font-bold text-zinc-600 uppercase">{emp.post}</p>
                    </td>
                    <td className="p-8">
                      <span className="px-4 py-1.5 bg-zinc-900 border border-white/10 rounded-full font-black text-[9px] text-zinc-400 uppercase">
                        {emp.contract}
                      </span>
                    </td>
                    <td className="p-8">
                      <p className="text-base font-black text-white italic">
                        {emp.salary.toLocaleString()} <span className="text-[10px] text-emerald-500 ml-1">F</span>
                      </p>
                    </td>
                    <td className="p-8">
                      <button 
                        onClick={() => updateStatus(emp.id, emp.status === 'Actif' ? 'Congé' : 'Actif')}
                        className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${
                          emp.status === 'Actif' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full bg-current ${emp.status === 'Actif' ? 'animate-pulse' : ''}`} />
                        <span className="font-black uppercase text-[9px] tracking-widest">{emp.status}</span>
                      </button>
                    </td>
                    <td className="p-8 relative">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => setActiveMenu(activeMenu === emp.id ? null : emp.id)} className={`p-3 border rounded-2xl transition-all ${activeMenu === emp.id ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-white/5 border-white/10 text-zinc-500'}`}>
                          <MoreVertical size={18} />
                        </button>
                        {activeMenu === emp.id && (
                          <div className="absolute right-8 top-20 w-56 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2">
                            <button onClick={() => updateStatus(emp.id, 'Actif')} className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-xl text-[10px] font-bold uppercase text-emerald-500">
                              <span>Marquer Actif</span> <CheckCircle2 size={14} />
                            </button>
                            <button onClick={() => updateStatus(emp.id, 'Congé')} className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-xl text-[10px] font-bold uppercase text-amber-500">
                              <span>En Congé</span> <Calendar size={14} />
                            </button>
                            <div className="h-px bg-white/5 my-2" />
                            <button onClick={() => terminateContract(emp.id)} className="w-full flex items-center justify-between p-3 hover:bg-rose-500 hover:text-white rounded-xl text-[10px] font-bold uppercase text-rose-500 transition-colors">
                              <span>Licencier</span> <AlertCircle size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FOOTER ALPHA */}
          <div className="p-10 border-t border-white/5 bg-black/40 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 text-zinc-600">
                <HardDrive size={16} />
                <p className="text-[9px] font-black uppercase tracking-[0.4em]">Node: Wakanda-East-1</p>
              </div>
              <p className="text-[10px] font-black text-white italic">{paginatedData.length} sur {filteredData.length} membres</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-zinc-500 hover:bg-emerald-500 hover:text-black transition-all">
                <ChevronLeft size={20} />
              </button>
              <div className="flex gap-2 mx-4">
                {[1, 2, 3].map(n => (
                  <button key={n} onClick={() => setCurrentPage(n)} className={`w-10 h-10 rounded-2xl font-black text-[10px] border transition-all ${currentPage === n ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-white/5 border-white/10 text-zinc-500'}`}>
                    {n}
                  </button>
                ))}
              </div>
              <button onClick={() => setCurrentPage(prev => prev + 1)} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-zinc-500 hover:bg-emerald-500 hover:text-black transition-all">
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="flex items-center gap-4 text-emerald-500/40">
              <CheckCircle2 size={16} />
              <p className="text-[8px] font-black uppercase tracking-[0.5em]">Cryptage AES-256 Actif</p>
            </div>
          </div>
        </section>
      </main>

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        @keyframes subtle-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .animate-pulse { animation: subtle-pulse 2s infinite; }
      `}</style>
      {/* MODAL NOUVEAU COLLABORATEUR */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300">
              <h2 className="text-2xl font-black italic uppercase mb-8 text-emerald-500">Recruter un Collaborateur</h2>
              
              <form onSubmit={handleAddCollab} className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 mb-2 block">Nom Complet</label>
                  <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-emerald-500" 
                    onChange={e => setNewCollab({...newCollab, name: e.target.value})} />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 mb-2 block">Pôle / Département</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none appearance-none"
                    onChange={e => setNewCollab({...newCollab, dept: e.target.value})}>
                    {payrollStats.depts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 mb-2 block">Poste Occupé</label>
                  <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-emerald-500"
                    onChange={e => setNewCollab({...newCollab, post: e.target.value})} />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 mb-2 block">Salaire Mensuel (FCFA)</label>
                  <input required type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-emerald-500"
                    onChange={e => setNewCollab({...newCollab, salary: Number(e.target.value)})} />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 mb-2 block">Type de Contrat</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none appearance-none"
                    onChange={e => setNewCollab({...newCollab, contract: e.target.value})}>
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Stage">Stage</option>
                  </select>
                </div>

                <div className="col-span-2 flex gap-4 mt-6">
  <button type="submit" className="flex-[2] bg-emerald-500 text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10">
    Confirmer le recrutement
  </button>
  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white/5 border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all">
    Annuler
  </button>
</div>
              </form>
            </div>
          </div>
        )}
      {/* MODAL FICHE TECHNIQUE COLLABORATEUR */}
        {selectedEmployee && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[110] flex items-center justify-center p-4">
            <div className="bg-[#050505] border border-white/10 w-full max-w-xl rounded-[3.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
              
              {/* Header de la Fiche */}
              <div className="relative h-32 bg-gradient-to-r from-emerald-900/20 to-zinc-900 p-8 flex items-end">
                <button 
                  onClick={() => setSelectedEmployee(null)}
                  className="absolute top-6 right-6 p-3 bg-black/50 hover:bg-white/10 rounded-full text-white transition-all"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-6 translate-y-12">
                   <div className="w-24 h-24 rounded-[2rem] bg-zinc-800 border-4 border-[#050505] flex items-center justify-center text-4xl font-black text-emerald-500 shadow-2xl">
                    {selectedEmployee.name.charAt(0)}
                   </div>
                   <div>
                     <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">{selectedEmployee.name}</h2>
                     <span className="px-3 py-1 bg-emerald-500 text-black text-[8px] font-black uppercase rounded-full tracking-[0.2em]">
                       {selectedEmployee.id}
                     </span>
                   </div>
                </div>
              </div>

              {/* Corps de la Fiche */}
              <div className="p-10 pt-16 grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Poste Actuel</p>
                  <p className="text-sm font-bold text-white uppercase italic">{selectedEmployee.post}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">PCO (Référent)</p>
                  <p className="text-sm font-bold text-emerald-500 uppercase">{selectedEmployee.pco || "Non assigné"}</p>
                </div>
                
                <div className="h-px bg-white/5 col-span-2" />

                <div className="space-y-6">
                  <div>
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Date d'entrée</p>
                    <p className="text-xs font-bold text-zinc-300">{selectedEmployee.joinDate}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Âge & Genre</p>
                    <p className="text-xs font-bold text-zinc-300">{selectedEmployee.age || "--"} ans • {selectedEmployee.genre || "--"}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Email Pro</p>
                    <p className="text-xs font-bold text-zinc-300">{selectedEmployee.email}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Contrat</p>
                    <p className="text-xs font-black text-emerald-500 uppercase">{selectedEmployee.contract}</p>
                  </div>
                </div>

                <div className="col-span-2 pt-6">
                   <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all">
                     Télécharger le Dossier Complet
                   </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
