// ============================================================
// PARTIE 1 sur 3 — app/rh/registre/page.tsx
// Coller ce code EN PREMIER dans votre fichier page.tsx
// Puis ajouter la Partie 2, puis la Partie 3 à la suite
// ============================================================

"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from "../../../components/Sidebar";
import { supabase } from '@/lib/supabase';
import {
  Search, ArrowLeft, ShieldCheck, UserPlus,
  ChevronLeft, ChevronRight, Fingerprint, Wallet,
  Banknote, Download, Building2, Calendar,
  MoreVertical, CheckCircle2, AlertCircle,
  Users, TrendingUp, Briefcase, X,
  Clock, Mail, MapPin, FileText, Eye
} from 'lucide-react';

// --- TYPES ---
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
  age?: number;
  genre?: 'M' | 'F';
  pco?: string;
  paymentStatus?: 'Payé' | 'En attente';
}

// --- COMPOSANT PRINCIPAL ---
export default function RegistrePersonnel() {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // --- ÉTATS ---
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeDept, setActiveDept] = useState("Tous");
  const [activeStatus, setActiveStatus] = useState("Tous");
  const [showPayroll, setShowPayroll] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const itemsPerPage = 10;

  // --- FERMER MENU AU CLIC EXTÉRIEUR ---
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // --- RÉCUPÉRATION SUPABASE ---
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const { data, error } = await supabase.from('staff').select('*');
        if (error) throw error;
        if (data) {
          const formatted: Employee[] = data.map((item: any) => ({
            id: item.id_key ? `WKD-${item.id_key}` : String(item.id),
            name: item.full_name || 'Inconnu',
            dept: item.department || 'Non assigné',
            post: item.role || 'Collaborateur',
            contract: item.contract_type || 'CDI',
            salary: Number(item.salary) || 0,
            status: (item.status === 'En ligne' ? 'Actif' :
                     item.status === 'Congé' ? 'Congé' :
                     item.status === 'Sortie' ? 'Sortie' : 'En pause') as Employee['status'],
            email: item.email || '',
            joinDate: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : '',
            nation: item.nationality || 'Sénégal',
            aura: 100,
            age: item.age,
            genre: item.genre as Employee['genre'],
            pco: item.pco,
            paymentStatus: item.payment_status === 'Payé' ? 'Payé' : 'En attente'
          }));
          setEmployees(formatted);
        }
      } catch (err) {
        console.error("Erreur de chargement:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  // --- STATISTIQUES ---
  const stats = useMemo(() => {
    const total = employees.length;
    const actifs = employees.filter(e => e.status === 'Actif').length;
    const conges = employees.filter(e => e.status === 'Congé').length;
    const masseSalariale = employees.reduce((sum, e) => sum + e.salary, 0);
    const depts = Array.from(new Set(employees.map(e => e.dept)));
    const payrollByDept = depts.map(d => {
      const deptEmployees = employees.filter(e => e.dept === d);
      return {
        name: d,
        total: deptEmployees.reduce((acc, curr) => acc + curr.salary, 0),
        count: deptEmployees.length,
        paid: deptEmployees.filter(e => e.paymentStatus === 'Payé').length,
        pending: deptEmployees.filter(e => e.paymentStatus !== 'Payé').length
      };
    });
    return { total, actifs, conges, masseSalariale, depts, payrollByDept };
  }, [employees]);

  // --- FILTRAGE ---
  const filteredData = useMemo(() => {
    return employees.filter(emp => {
      const q = search.toLowerCase();
      const matchSearch = emp.name.toLowerCase().includes(q) ||
                          emp.id.toLowerCase().includes(q) ||
                          emp.post.toLowerCase().includes(q) ||
                          emp.email.toLowerCase().includes(q);
      const matchDept = activeDept === "Tous" || emp.dept === activeDept;
      const matchStatus = activeStatus === "Tous" || emp.status === activeStatus;
      return matchSearch && matchDept && matchStatus;
    });
  }, [search, activeDept, activeStatus, employees]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1); }, [search, activeDept, activeStatus]);

  // --- ACTIONS ---
  const updateStatus = async (id: string, newStatus: Employee['status']) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, status: newStatus } : emp));
    setActiveMenu(null);
  };

  const terminateContract = (id: string) => {
    if (typeof window !== 'undefined' && window.confirm("Confirmer la fin de contrat définitive pour cet employé ?")) {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      setActiveMenu(null);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    // Génération CSV
    const headers = ['ID', 'Nom', 'Département', 'Poste', 'Contrat', 'Salaire', 'Statut', 'Email', 'Date Entrée'];
    const rows = filteredData.map(e => [e.id, e.name, e.dept, e.post, e.contract, e.salary, e.status, e.email, e.joinDate]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registre_personnel_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setIsExporting(false), 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Actif': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Congé': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'En pause': return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
      case 'Sortie': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const getInitialBg = (name: string) => {
    const colors = ['bg-emerald-600', 'bg-teal-600', 'bg-cyan-600', 'bg-sky-600', 'bg-violet-600', 'bg-fuchsia-600'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // --- CHARGEMENT ---
  if (loading) {
    return (
      <div className="h-screen bg-[#060606] flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full" />
            <div className="absolute inset-0 border-2 border-transparent border-t-emerald-500 rounded-full animate-spin" />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-zinc-500">Chargement du registre</p>
        </div>
      </div>
    );
  }

  // ============================
  // RENDU PRINCIPAL
  // ============================
  return (
    <div className="flex h-screen bg-[#060606] text-white overflow-hidden">
      {/* SIDEBAR — réduit automatiquement */}
      <div className="flex-shrink-0" style={{ width: '56px', maxWidth: '56px', minWidth: '56px', overflow: 'hidden' }}>
        <Sidebar />
      </div>

      <main className="flex-1 overflow-y-auto custom-scroll">
        <div className="max-w-[1600px] mx-auto px-6 py-5 flex flex-col gap-5">

          {/* ═══════ EN-TÊTE ═══════ */}
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/rh')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-zinc-400 hover:text-white">
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Registre du Personnel</h1>
                <p className="text-[11px] text-zinc-500 mt-0.5">{stats.total} collaborateurs • Mis à jour en temps réel</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPayroll(!showPayroll)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  showPayroll
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                    : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                <Banknote size={16} />
                Livre de Paie
              </button>
              <Link
                href="/rh/registre/contrat"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <UserPlus size={16} />
                Nouveau
              </Link>
            </div>
          </header>

          {/* ═══════ KPIs COMPACTS ═══════ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Employés', value: stats.total, icon: Users, color: 'text-white', accent: 'bg-emerald-500/10 text-emerald-500' },
              { label: 'Actifs', value: stats.actifs, icon: CheckCircle2, color: 'text-emerald-400', accent: 'bg-emerald-500/10 text-emerald-500' },
              { label: 'En Congé', value: stats.conges, icon: Calendar, color: 'text-amber-400', accent: 'bg-amber-500/10 text-amber-500' },
              { label: 'Masse Salariale', value: `${(stats.masseSalariale / 1000000).toFixed(1)}M`, icon: TrendingUp, color: 'text-white', accent: 'bg-emerald-500/10 text-emerald-500', suffix: 'FCFA' },
            ].map((kpi, i) => (
              <div key={i} className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-4 hover:border-white/10 transition-colors">
                <div className={`p-2.5 rounded-xl ${kpi.accent}`}>
                  <kpi.icon size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{kpi.label}</p>
                  <p className={`text-lg font-bold ${kpi.color} leading-tight`}>
                    {kpi.value}{kpi.suffix && <span className="text-[10px] text-zinc-500 ml-1">{kpi.suffix}</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ═══════ LIVRE DE PAIE (TOGGLE) ═══════ */}
          {showPayroll && (
            <section className="bg-white/[0.02] border border-emerald-500/15 rounded-2xl p-6 animate-fadeIn">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <Wallet size={20} className="text-emerald-500" />
                  <h2 className="text-base font-bold text-white">Masse Salariale Globale</h2>
                </div>
                <div className="bg-black/40 px-5 py-2.5 rounded-xl border border-white/[0.06]">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider mr-2">Total Mensuel</span>
                  <span className="text-lg font-bold text-white">{stats.masseSalariale.toLocaleString()}</span>
                  <span className="text-emerald-500 text-xs ml-1">FCFA</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                {stats.payrollByDept.map((dept, i) => (
                  <div key={i} className="bg-black/30 border border-white/[0.05] rounded-xl p-4 hover:border-emerald-500/20 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <Building2 size={14} className="text-zinc-600" />
                      <span className="text-[9px] font-medium bg-white/5 px-2 py-0.5 rounded text-zinc-500">{dept.count} pers.</span>
                    </div>
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">{dept.name}</p>
                    <p className="text-sm font-bold text-white">{dept.total.toLocaleString()} <span className="text-emerald-500 text-[10px]">F</span></p>
                    <div className="mt-3 flex gap-2">
                      <span className="text-[8px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">{dept.paid} Payé</span>
                      {dept.pending > 0 && (
                        <span className="text-[8px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium">{dept.pending} En attente</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ═══════ BARRE DE FILTRES ═══════ */}
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input
                type="text"
                placeholder="Rechercher par nom, ID, poste ou email..."
                className="w-full bg-white/[0.025] border border-white/[0.06] rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/50 transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filtre département */}
            <select
              className="bg-white/[0.025] border border-white/[0.06] rounded-xl px-4 py-3 text-xs font-medium text-zinc-300 outline-none min-w-[180px] appearance-none cursor-pointer"
              value={activeDept}
              onChange={(e) => setActiveDept(e.target.value)}
            >
              <option value="Tous">Tous les départements</option>
              {stats.depts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            {/* Filtre statut */}
            <select
              className="bg-white/[0.025] border border-white/[0.06] rounded-xl px-4 py-3 text-xs font-medium text-zinc-300 outline-none min-w-[150px] appearance-none cursor-pointer"
              value={activeStatus}
              onChange={(e) => setActiveStatus(e.target.value)}
            >
              <option value="Tous">Tous les statuts</option>
              <option value="Actif">Actif</option>
              <option value="Congé">En Congé</option>
              <option value="En pause">En Pause</option>
            </select>

            {/* Export */}
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-white/[0.025] border border-white/[0.06] rounded-xl text-xs font-medium text-zinc-300 hover:bg-white/[0.05] transition-colors min-w-[130px]"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" />
              ) : (
                <Download size={15} />
              )}
              Export CSV
            </button>
          </div>

          {/* ═══════ TABLEAU DU PERSONNEL ═══════ */}
          <section className="bg-white/[0.015] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col flex-1">
            <div className="overflow-x-auto custom-scroll">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-5 py-3.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Collaborateur</th>
                    <th className="px-5 py-3.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Département</th>
                    <th className="px-5 py-3.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Poste</th>
                    <th className="px-5 py-3.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Contrat</th>
                    <th className="px-5 py-3.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Salaire</th>
                    <th className="px-5 py-3.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Statut</th>
                    <th className="px-5 py-3.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {paginatedData.map((emp) => (
                    <tr key={emp.id} className="group hover:bg-white/[0.02] transition-colors">
                      {/* Collaborateur */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => setSelectedEmployee(emp)}
                            className={`w-9 h-9 rounded-lg ${getInitialBg(emp.name)} flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:ring-2 hover:ring-emerald-500/50 transition-all flex-shrink-0`}
                          >
                            {emp.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p
                              onClick={() => setSelectedEmployee(emp)}
                              className="text-sm font-semibold text-white truncate cursor-pointer hover:text-emerald-400 transition-colors"
                            >
                              {emp.name}
                            </p>
                            <p className="text-[10px] text-zinc-600 flex items-center gap-1">
                              <Fingerprint size={9} /> {emp.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Département */}
                      <td className="px-5 py-3">
                        <p className="text-xs font-medium text-zinc-300">{emp.dept}</p>
                      </td>
                      {/* Poste */}
                      <td className="px-5 py-3">
                        <p className="text-xs text-zinc-400">{emp.post}</p>
                      </td>
                      {/* Contrat */}
                      <td className="px-5 py-3">
                        <span className="px-2.5 py-1 bg-white/5 border border-white/[0.06] rounded-lg text-[10px] font-medium text-zinc-400">
                          {emp.contract}
                        </span>
                      </td>
                      {/* Salaire */}
                      <td className="px-5 py-3">
                        <p className="text-sm font-semibold text-white tabular-nums">
                          {emp.salary.toLocaleString()} <span className="text-[10px] text-emerald-500">F</span>
                        </p>
                      </td>
                      {/* Statut */}
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[10px] font-semibold ${getStatusColor(emp.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full bg-current ${emp.status === 'Actif' ? 'animate-pulse' : ''}`} />
                          {emp.status}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2 relative" ref={activeMenu === emp.id ? menuRef : null}>
                          <button
                            onClick={() => setSelectedEmployee(emp)}
                            className="p-2 rounded-lg bg-white/5 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                            title="Voir la fiche"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => setActiveMenu(activeMenu === emp.id ? null : emp.id)}
                            className={`p-2 rounded-lg transition-all ${
                              activeMenu === emp.id
                                ? 'bg-emerald-500 text-black'
                                : 'bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            <MoreVertical size={15} />
                          </button>

                          {/* Dropdown menu */}
                          {activeMenu === emp.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-[#0c0c0c] border border-white/10 rounded-xl shadow-2xl z-50 p-1.5 animate-fadeIn">
                              <button
                                onClick={() => updateStatus(emp.id, 'Actif')}
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-emerald-500/10 rounded-lg text-[11px] font-medium text-emerald-400 transition-colors"
                              >
                                Marquer Actif <CheckCircle2 size={13} />
                              </button>
                              <button
                                onClick={() => updateStatus(emp.id, 'Congé')}
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-amber-500/10 rounded-lg text-[11px] font-medium text-amber-400 transition-colors"
                              >
                                Mettre en Congé <Calendar size={13} />
                              </button>
                              <button
                                onClick={() => updateStatus(emp.id, 'En pause')}
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-500/10 rounded-lg text-[11px] font-medium text-zinc-400 transition-colors"
                              >
                                Mettre en Pause <Clock size={13} />
                              </button>
                              <div className="h-px bg-white/[0.06] my-1" />
                              <button
                                onClick={() => terminateContract(emp.id)}
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-rose-500/10 rounded-lg text-[11px] font-medium text-rose-400 transition-colors"
                              >
                                Fin de Contrat <AlertCircle size={13} />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Message si aucun résultat */}
                  {paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center">
                        <Search size={32} className="mx-auto text-zinc-700 mb-3" />
                        <p className="text-sm text-zinc-500">Aucun collaborateur trouvé</p>
                        <p className="text-[11px] text-zinc-600 mt-1">Essayez avec d'autres critères de recherche</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>



            {/* ═══════ PAGINATION ═══════ */}
            <div className="px-5 py-3.5 border-t border-white/[0.06] bg-black/20 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-4">
                <p className="text-[11px] text-zinc-500">
                  <span className="text-white font-semibold">{filteredData.length}</span> résultat{filteredData.length > 1 ? 's' : ''}
                  {search || activeDept !== 'Tous' || activeStatus !== 'Tous' ? ' (filtré)' : ''}
                </p>
                <div className="h-3 w-px bg-white/10" />
                <p className="text-[10px] text-zinc-600">
                  Page {currentPage} sur {totalPages}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white/5 border border-white/[0.06] text-zinc-500 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => {
                    if (totalPages <= 5) return true;
                    if (n === 1 || n === totalPages) return true;
                    return Math.abs(n - currentPage) <= 1;
                  })
                  .reduce<(number | string)[]>((acc, n, i, arr) => {
                    if (i > 0 && typeof arr[i - 1] === 'number' && (n as number) - (arr[i - 1] as number) > 1) {
                      acc.push('...');
                    }
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((item, i) =>
                    typeof item === 'string' ? (
                      <span key={`dot-${i}`} className="px-1.5 text-zinc-600 text-xs">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item)}
                        className={`w-8 h-8 rounded-lg text-[11px] font-semibold transition-all ${
                          currentPage === item
                            ? 'bg-emerald-500 text-black'
                            : 'bg-white/5 border border-white/[0.06] text-zinc-500 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white/5 border border-white/[0.06] text-zinc-500 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2 text-zinc-600">
                <ShieldCheck size={13} className="text-emerald-500/40" />
                <p className="text-[9px] font-medium tracking-wider uppercase">Données sécurisées</p>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* ═══════════════════════════════════════════════════════
          MODAL — FICHE COLLABORATEUR DÉTAILLÉE
          ═══════════════════════════════════════════════════════ */}
      {selectedEmployee && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedEmployee(null); }}
        >
          <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-fadeIn">
            
            {/* Header du modal */}
            <div className="relative bg-gradient-to-br from-emerald-900/20 via-emerald-950/10 to-transparent p-6 pb-8">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-black/30 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl ${getInitialBg(selectedEmployee.name)} flex items-center justify-center text-2xl font-bold text-white shadow-lg`}>
                  {selectedEmployee.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedEmployee.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-semibold rounded-md tracking-wider">
                      {selectedEmployee.id}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-semibold ${getStatusColor(selectedEmployee.status)}`}>
                      <span className={`w-1 h-1 rounded-full bg-current ${selectedEmployee.status === 'Actif' ? 'animate-pulse' : ''}`} />
                      {selectedEmployee.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Corps du modal — Informations */}
            <div className="p-6 space-y-5">

              {/* Ligne 1 : Poste + Département */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.025] border border-white/[0.06] rounded-xl p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Briefcase size={12} className="text-zinc-500" />
                    <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Poste</p>
                  </div>
                  <p className="text-sm font-semibold text-white">{selectedEmployee.post}</p>
                </div>
                <div className="bg-white/[0.025] border border-white/[0.06] rounded-xl p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Building2 size={12} className="text-zinc-500" />
                    <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Département</p>
                  </div>
                  <p className="text-sm font-semibold text-white">{selectedEmployee.dept}</p>
                </div>
              </div>

              {/* Ligne 2 : Contrat + Salaire */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.025] border border-white/[0.06] rounded-xl p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <FileText size={12} className="text-zinc-500" />
                    <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Contrat</p>
                  </div>
                  <p className="text-sm font-semibold text-white">{selectedEmployee.contract}</p>
                </div>
                <div className="bg-white/[0.025] border border-white/[0.06] rounded-xl p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Banknote size={12} className="text-zinc-500" />
                    <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Salaire Net</p>
                  </div>
                  <p className="text-sm font-bold text-white">
                    {selectedEmployee.salary.toLocaleString()} <span className="text-emerald-500 text-[10px]">FCFA</span>
                  </p>
                </div>
              </div>

              {/* Ligne 3 : Email + Date d'entrée */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.025] border border-white/[0.06] rounded-xl p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Mail size={12} className="text-zinc-500" />
                    <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Email Pro</p>
                  </div>
                  <p className="text-xs font-medium text-zinc-300 truncate">{selectedEmployee.email || 'Non renseigné'}</p>
                </div>
                <div className="bg-white/[0.025] border border-white/[0.06] rounded-xl p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Calendar size={12} className="text-zinc-500" />
                    <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Date d'entrée</p>
                  </div>
                  <p className="text-xs font-medium text-zinc-300">{selectedEmployee.joinDate || 'Non renseignée'}</p>
                </div>
              </div>

              {/* Ligne 4 : Âge/Genre + PCO (Référent) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.025] border border-white/[0.06] rounded-xl p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Users size={12} className="text-zinc-500" />
                    <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Âge & Genre</p>
                  </div>
                  <p className="text-xs font-medium text-zinc-300">
                    {selectedEmployee.age ? `${selectedEmployee.age} ans` : '--'} • {selectedEmployee.genre || '--'}
                  </p>
                </div>
                <div className="bg-white/[0.025] border border-white/[0.06] rounded-xl p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <ShieldCheck size={12} className="text-zinc-500" />
                    <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Référent (PCO)</p>
                  </div>
                  <p className="text-xs font-semibold text-emerald-400">{selectedEmployee.pco || 'Non assigné'}</p>
                </div>
              </div>

              {/* Ligne 5 : Nationalité + Statut Paie */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.025] border border-white/[0.06] rounded-xl p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <MapPin size={12} className="text-zinc-500" />
                    <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Nationalité</p>
                  </div>
                  <p className="text-xs font-medium text-zinc-300">{selectedEmployee.nation}</p>
                </div>
                <div className="bg-white/[0.025] border border-white/[0.06] rounded-xl p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Wallet size={12} className="text-zinc-500" />
                    <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Statut Paie</p>
                  </div>
                  <p className={`text-xs font-semibold ${selectedEmployee.paymentStatus === 'Payé' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {selectedEmployee.paymentStatus || 'En attente'}
                  </p>
                </div>
              </div>

              {/* Actions rapides du modal */}
              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => {
                    const next = selectedEmployee.status === 'Actif' ? 'Congé' : 'Actif';
                    updateStatus(selectedEmployee.id, next as Employee['status']);
                    setSelectedEmployee({ ...selectedEmployee, status: next as Employee['status'] });
                  }}
                  className="flex-1 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-[11px] font-semibold text-zinc-300 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {selectedEmployee.status === 'Actif' ? (
                    <><Calendar size={14} /> Mettre en Congé</>
                  ) : (
                    <><CheckCircle2 size={14} /> Marquer Actif</>
                  )}
                </button>
                <button
                  onClick={() => {
                    terminateContract(selectedEmployee.id);
                    setSelectedEmployee(null);
                  }}
                  className="px-5 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-[11px] font-semibold text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all flex items-center gap-2"
                >
                  <AlertCircle size={14} /> Fin de Contrat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* ═══════ STYLES GLOBAUX ═══════ */}
      <style jsx global>{`
        /* Scrollbar personnalisée */
        .custom-scroll::-webkit-scrollbar {
          width: 3px;
          height: 3px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.6);
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        /* Animation fadeIn */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }

        /* Animation pulse subtile pour statut Actif */
        @keyframes subtlePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .animate-pulse {
          animation: subtlePulse 2s ease-in-out infinite;
        }

        /* Fix select dropdown sur fond sombre */
        select option {
          background-color: #0a0a0a;
          color: #d4d4d8;
          padding: 8px;
        }

        /* Empêcher la sélection de texte sur les boutons */
        button {
          user-select: none;
          -webkit-user-select: none;
        }

        /* Transition douce pour les lignes du tableau */
        tbody tr {
          transition: background-color 0.15s ease;
        }

        /* Focus visible pour accessibilité */
        button:focus-visible,
        input:focus-visible,
        select:focus-visible {
          outline: 2px solid rgba(16, 185, 129, 0.5);
          outline-offset: 2px;
        }

        /* Masquer le outline par défaut */
        button:focus:not(:focus-visible),
        input:focus:not(:focus-visible),
        select:focus:not(:focus-visible) {
          outline: none;
        }

        /* Responsive : réduction padding sur mobile */
        @media (max-width: 768px) {
          table th,
          table td {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
        }

        /* ═══ SIDEBAR FORCÉE EN MODE RÉDUIT ═══ */
        /* Cibler tous les patterns possibles de sidebar */
        nav,
        aside,
        [data-sidebar],
        .sidebar,
        [class*="sidebar"],
        [class*="Sidebar"],
        div.flex.h-screen > div:first-child,
        div.flex > nav,
        div.flex > aside {
          width: 56px !important;
          max-width: 56px !important;
          min-width: 56px !important;
          overflow: hidden !important;
          flex-shrink: 0 !important;
          transition: none !important;
          position: relative !important;
          z-index: 10 !important;
        }

        /* Masquer TOUT le texte dans le sidebar */
        nav span, nav p, nav h1, nav h2, nav h3, nav label,
        aside span, aside p, aside h1, aside h2, aside h3, aside label,
        [data-sidebar] span, [data-sidebar] p, [data-sidebar] h1,
        .sidebar span, .sidebar p,
        [class*="sidebar"] span, [class*="sidebar"] p,
        [class*="Sidebar"] span, [class*="Sidebar"] p {
          display: none !important;
          opacity: 0 !important;
          width: 0 !important;
          overflow: hidden !important;
        }

        /* Masquer le logo/titre du sidebar */
        nav > div:first-child > h1,
        nav > div:first-child > p,
        nav > div:first-child > span,
        aside > div:first-child > h1,
        aside > div:first-child > p,
        aside > div:first-child > span {
          display: none !important;
        }

        /* Centrer les icônes dans les liens du sidebar */
        nav a, nav button,
        aside a, aside button,
        [data-sidebar] a, [data-sidebar] button,
        .sidebar a, .sidebar button {
          justify-content: center !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
          padding: 12px 0 !important;
          display: flex !important;
          align-items: center !important;
        }

        /* Masquer le bouton de déconnexion texte */
        nav a span, nav button span,
        aside a span, aside button span {
          display: none !important;
        }

        /* Sous-wrapper du sidebar */
        nav > div, aside > div,
        [data-sidebar] > div {
          width: 56px !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
          overflow: hidden !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
        }
      `}</style>
    </div>
  );
}
