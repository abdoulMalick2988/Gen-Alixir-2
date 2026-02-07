"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Search, ArrowLeft, UserPlus, ChevronLeft, ChevronRight,
  Fingerprint, Wallet, Banknote, Download, Building2,
  Calendar, MoreVertical, CheckCircle2, AlertCircle,
  Users, TrendingUp, Briefcase, X, Clock, Mail,
  MapPin, FileText, Eye, Camera, Upload, Home
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
  photoUrl?: string;
}

export default function RegistrePersonnel() {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const itemsPerPage = 10;

  // Fermer menu au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setActiveMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // --- SUPABASE FETCH ---
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
            paymentStatus: item.payment_status === 'Payé' ? 'Payé' : 'En attente',
            photoUrl: item.photo_url || ''
          }));
          setEmployees(formatted);
        }
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  // --- PHOTO UPLOAD ---
  const handlePhotoUpload = async (empId: string, file: File) => {
    setUploadingPhoto(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${empId}-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(`staff/${fileName}`, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(`staff/${fileName}`);

      const publicUrl = urlData.publicUrl;

      // Mise à jour dans la base
      const rawId = empId.replace('WKD-', '');
      await supabase.from('staff').update({ photo_url: publicUrl }).eq('id_key', rawId);

      // Mise à jour locale
      setEmployees(prev => prev.map(emp =>
        emp.id === empId ? { ...emp, photoUrl: publicUrl } : emp
      ));
      if (selectedEmployee?.id === empId) {
        setSelectedEmployee(prev => prev ? { ...prev, photoUrl: publicUrl } : null);
      }
    } catch (err) {
      console.error("Erreur upload photo:", err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // --- STATISTIQUES ---
  const stats = useMemo(() => {
    const total = employees.length;
    const actifs = employees.filter(e => e.status === 'Actif').length;
    const conges = employees.filter(e => e.status === 'Congé').length;
    const masseSalariale = employees.reduce((sum, e) => sum + e.salary, 0);
    const depts = Array.from(new Set(employees.map(e => e.dept)));
    const payrollByDept = depts.map(d => {
      const de = employees.filter(e => e.dept === d);
      return {
        name: d, total: de.reduce((a, c) => a + c.salary, 0), count: de.length,
        paid: de.filter(e => e.paymentStatus === 'Payé').length,
        pending: de.filter(e => e.paymentStatus !== 'Payé').length
      };
    });
    return { total, actifs, conges, masseSalariale, depts, payrollByDept };
  }, [employees]);

  // --- FILTRAGE ---
  const filteredData = useMemo(() => {
    return employees.filter(emp => {
      const q = search.toLowerCase();
      const matchSearch = emp.name.toLowerCase().includes(q) || emp.id.toLowerCase().includes(q) ||
                          emp.post.toLowerCase().includes(q) || emp.email.toLowerCase().includes(q);
      const matchDept = activeDept === "Tous" || emp.dept === activeDept;
      const matchStatus = activeStatus === "Tous" || emp.status === activeStatus;
      return matchSearch && matchDept && matchStatus;
    });
  }, [search, activeDept, activeStatus, employees]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  useEffect(() => { setCurrentPage(1); }, [search, activeDept, activeStatus]);

  // --- ACTIONS ---
  const updateStatus = async (id: string, newStatus: Employee['status']) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, status: newStatus } : emp));
    setActiveMenu(null);
  };

  const terminateContract = (id: string) => {
    if (typeof window !== 'undefined' && window.confirm("Confirmer la fin de contrat définitive ?")) {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      setActiveMenu(null);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    const headers = ['ID','Nom','Département','Poste','Contrat','Salaire','Statut','Email','Date Entrée'];
    const rows = filteredData.map(e => [e.id,e.name,e.dept,e.post,e.contract,e.salary,e.status,e.email,e.joinDate]);
    const csv = [headers,...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `registre_${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
    setTimeout(() => setIsExporting(false), 1500);
  };

  const getStatusColor = (s: string) => {
    switch(s) {
      case 'Actif': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25';
      case 'Congé': return 'bg-amber-500/15 text-amber-400 border-amber-500/25';
      case 'En pause': return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25';
      case 'Sortie': return 'bg-rose-500/15 text-rose-400 border-rose-500/25';
      default: return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25';
    }
  };

  const getInitialBg = (name: string) => {
    const c = ['bg-emerald-600','bg-teal-600','bg-cyan-600','bg-sky-600','bg-violet-600','bg-fuchsia-600','bg-rose-600','bg-amber-600'];
    return c[name.charCodeAt(0) % c.length];
  };

  // --- AVATAR COMPONENT ---
  const Avatar = ({ emp, size = 'sm' }: { emp: Employee; size?: 'sm' | 'md' | 'lg' }) => {
    const dims = size === 'lg' ? 'w-20 h-20 text-2xl rounded-2xl' : size === 'md' ? 'w-11 h-11 text-base rounded-xl' : 'w-9 h-9 text-sm rounded-lg';
    if (emp.photoUrl) {
      return (
        <img src={emp.photoUrl} alt={emp.name}
          className={`${dims} object-cover flex-shrink-0 border border-white/10`}
        />
      );
    }
    return (
      <div className={`${dims} ${getInitialBg(emp.name)} flex items-center justify-center font-bold text-white flex-shrink-0`}>
        {emp.name.charAt(0)}
      </div>
    );
  };

  // --- LOADING ---
  if (loading) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/8 rounded-full blur-[130px]" />
        </div>
        <div className="flex flex-col items-center gap-5 relative z-10">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full" />
            <div className="absolute inset-0 border-2 border-transparent border-t-emerald-500 rounded-full animate-spin" />
          </div>
          <p className="text-[11px] font-medium tracking-[0.3em] text-zinc-500 uppercase">Chargement du registre</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════
  // RENDU PRINCIPAL
  // ═══════════════════════════════
  return (
    <div className="h-screen bg-[#050505] text-white overflow-hidden relative">

      {/* ═══ FOND ÉMERAUDE DECORATIF ═══ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Gros blob émeraude en haut à droite */}
        <div className="absolute -top-32 -right-32 w-[700px] h-[700px] bg-emerald-600/[0.07] rounded-full blur-[180px]" />
        {/* Blob secondaire en bas à gauche */}
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-emerald-500/[0.05] rounded-full blur-[160px]" />
        {/* Accent central */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-emerald-600/[0.03] rounded-full blur-[200px] rotate-12" />
        {/* Petits points lumineux */}
        <div className="absolute top-20 left-[20%] w-2 h-2 bg-emerald-400/20 rounded-full blur-sm" />
        <div className="absolute top-[60%] right-[15%] w-3 h-3 bg-emerald-400/15 rounded-full blur-sm" />
        <div className="absolute bottom-32 left-[40%] w-1.5 h-1.5 bg-emerald-400/25 rounded-full blur-sm" />
        {/* Grille subtile */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)', backgroundSize: '80px 80px' }}
        />
      </div>

      {/* ═══ CONTENU PRINCIPAL ═══ */}
      <main className="relative z-10 h-full overflow-y-auto custom-scroll">
        <div className="max-w-[1440px] mx-auto px-5 py-4 flex flex-col gap-4">

          {/* ─── HEADER ─── */}
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/rh')} className="p-2.5 rounded-xl glass-card text-zinc-400 hover:text-emerald-400 transition-colors">
                <ArrowLeft size={17} />
              </button>
              <button onClick={() => router.push('/')} className="p-2.5 rounded-xl glass-card text-zinc-400 hover:text-emerald-400 transition-colors">
                <Home size={17} />
              </button>
              <div className="ml-1">
                <h1 className="text-lg font-bold text-white tracking-tight">Registre du Personnel</h1>
                <p className="text-[11px] text-zinc-500">{stats.total} collaborateurs • Temps réel</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button onClick={() => setShowPayroll(!showPayroll)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  showPayroll ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25' : 'glass-card text-zinc-300 hover:text-emerald-400'
                }`}>
                <Banknote size={15} /> Livre de Paie
              </button>
              <Link href="/rh/registre/contrat"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/25">
                <UserPlus size={15} /> Nouveau
              </Link>
            </div>
          </header>

          {/* ─── KPIs ─── */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total Employés', value: stats.total, icon: Users, iconColor: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Actifs', value: stats.actifs, icon: CheckCircle2, iconColor: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'En Congé', value: stats.conges, icon: Calendar, iconColor: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'Masse Salariale', value: `${(stats.masseSalariale / 1000000).toFixed(1)}M`, icon: TrendingUp, iconColor: 'text-emerald-400', bg: 'bg-emerald-500/10', suffix: 'FCFA' },
            ].map((kpi, i) => (
              <div key={i} className="glass-card rounded-xl p-3.5 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${kpi.bg}`}>
                  <kpi.icon size={16} className={kpi.iconColor} />
                </div>
                <div>
                  <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-base font-bold text-white leading-tight">
                    {kpi.value}{kpi.suffix && <span className="text-[9px] text-zinc-500 ml-1">{kpi.suffix}</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ─── LIVRE DE PAIE ─── */}
          {showPayroll && (
            <section className="glass-card-accent rounded-2xl p-5 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <Wallet size={18} className="text-emerald-400" />
                  <h2 className="text-sm font-bold text-white">Masse Salariale Globale</h2>
                </div>
                <div className="glass-card rounded-lg px-4 py-2">
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider mr-2">Total</span>
                  <span className="text-base font-bold text-white">{stats.masseSalariale.toLocaleString()}</span>
                  <span className="text-emerald-400 text-[10px] ml-1">FCFA</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2.5">
                {stats.payrollByDept.map((dept, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 hover:border-emerald-500/20 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <Building2 size={12} className="text-zinc-600" />
                      <span className="text-[8px] font-medium bg-white/5 px-1.5 py-0.5 rounded text-zinc-500">{dept.count}</span>
                    </div>
                    <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">{dept.name}</p>
                    <p className="text-sm font-bold text-white">{dept.total.toLocaleString()} <span className="text-emerald-400 text-[9px]">F</span></p>
                    <div className="mt-2 flex gap-1.5">
                      <span className="text-[7px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">{dept.paid} Payé</span>
                      {dept.pending > 0 && <span className="text-[7px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">{dept.pending} Attente</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ─── FILTRES ─── */}
          <div className="flex flex-col lg:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
              <input type="text" placeholder="Rechercher par nom, ID, poste ou email..."
                className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-sm"
                value={search} onChange={(e) => setSearch(e.target.value)} />
              {search && <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"><X size={13} /></button>}
            </div>
            <select className="glass-input rounded-xl px-4 py-2.5 text-xs font-medium min-w-[170px]"
              value={activeDept} onChange={(e) => setActiveDept(e.target.value)}>
              <option value="Tous">Tous les départements</option>
              {stats.depts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="glass-input rounded-xl px-4 py-2.5 text-xs font-medium min-w-[140px]"
              value={activeStatus} onChange={(e) => setActiveStatus(e.target.value)}>
              <option value="Tous">Tous les statuts</option>
              <option value="Actif">Actif</option>
              <option value="Congé">En Congé</option>
              <option value="En pause">En Pause</option>
            </select>
            <button onClick={handleExport}
              className="flex items-center justify-center gap-2 px-4 py-2.5 glass-card rounded-xl text-xs font-medium text-zinc-300 hover:text-emerald-400 transition-colors min-w-[120px]">
              {isExporting ? <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" /> : <Download size={14} />}
              Export CSV
            </button>
          </div>

          {/* ─── TABLEAU ─── */}
          <section className="glass-card rounded-2xl overflow-hidden flex flex-col flex-1">
            <div className="overflow-x-auto custom-scroll">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-4 py-3 text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Collaborateur</th>
                    <th className="px-4 py-3 text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Département</th>
                    <th className="px-4 py-3 text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Poste</th>
                    <th className="px-4 py-3 text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Contrat</th>
                    <th className="px-4 py-3 text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Salaire</th>
                    <th className="px-4 py-3 text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Statut</th>
                    <th className="px-4 py-3 text-[9px] font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {paginatedData.map((emp) => (
                    <tr key={emp.id} className="group hover:bg-white/[0.025] transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <div onClick={() => setSelectedEmployee(emp)} className="cursor-pointer hover:ring-2 hover:ring-emerald-500/40 rounded-lg transition-all">
                            <Avatar emp={emp} size="sm" />
                          </div>
                          <div className="min-w-0">
                            <p onClick={() => setSelectedEmployee(emp)}
                              className="text-[13px] font-semibold text-white truncate cursor-pointer hover:text-emerald-400 transition-colors">
                              {emp.name}
                            </p>
                            <p className="text-[9px] text-zinc-600 flex items-center gap-1 mt-0.5">
                              <Fingerprint size={8} /> {emp.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5"><p className="text-xs text-zinc-300">{emp.dept}</p></td>
                      <td className="px-4 py-2.5"><p className="text-xs text-zinc-400">{emp.post}</p></td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 bg-white/5 border border-white/[0.06] rounded text-[9px] font-medium text-zinc-400">{emp.contract}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <p className="text-[13px] font-semibold text-white tabular-nums">{emp.salary.toLocaleString()} <span className="text-[9px] text-emerald-400">F</span></p>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-semibold ${getStatusColor(emp.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full bg-current ${emp.status === 'Actif' ? 'animate-pulse' : ''}`} />
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-end gap-1.5 relative" ref={activeMenu === emp.id ? menuRef : null}>
                          <button onClick={() => setSelectedEmployee(emp)}
                            className="p-1.5 rounded-lg bg-white/5 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all" title="Fiche">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => setActiveMenu(activeMenu === emp.id ? null : emp.id)}
                            className={`p-1.5 rounded-lg transition-all ${activeMenu === emp.id ? 'bg-emerald-500 text-black' : 'bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10'}`}>
                            <MoreVertical size={14} />
                          </button>
                          {activeMenu === emp.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-[#0c0c0c]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 p-1 animate-fadeIn">
                              <button onClick={() => updateStatus(emp.id, 'Actif')}
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-emerald-500/10 rounded-lg text-[10px] font-medium text-emerald-400">
                                Marquer Actif <CheckCircle2 size={12} />
                              </button>
                              <button onClick={() => updateStatus(emp.id, 'Congé')}
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-amber-500/10 rounded-lg text-[10px] font-medium text-amber-400">
                                En Congé <Calendar size={12} />
                              </button>
                              <button onClick={() => updateStatus(emp.id, 'En pause')}
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-500/10 rounded-lg text-[10px] font-medium text-zinc-400">
                                En Pause <Clock size={12} />
                              </button>
                              <div className="h-px bg-white/[0.06] my-1" />
                              <button onClick={() => terminateContract(emp.id)}
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-rose-500/10 rounded-lg text-[10px] font-medium text-rose-400">
                                Fin de Contrat <AlertCircle size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedData.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-14 text-center">
                      <Search size={28} className="mx-auto text-zinc-700 mb-2" />
                      <p className="text-sm text-zinc-500">Aucun collaborateur trouvé</p>
                      <p className="text-[10px] text-zinc-600 mt-0.5">Modifiez vos critères de recherche</p>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ─── PAGINATION ─── */}
            <div className="px-4 py-3 border-t border-white/[0.05] flex flex-col sm:flex-row justify-between items-center gap-2">
              <p className="text-[10px] text-zinc-500">
                <span className="text-white font-semibold">{filteredData.length}</span> résultat{filteredData.length > 1 ? 's' : ''}
                {(search || activeDept !== 'Tous' || activeStatus !== 'Tous') ? ' (filtré)' : ''}
                <span className="text-zinc-600 ml-2">• Page {currentPage}/{totalPages}</span>
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/[0.05] text-zinc-500 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => totalPages <= 5 || n === 1 || n === totalPages || Math.abs(n - currentPage) <= 1)
                  .reduce<(number | string)[]>((acc, n, i, arr) => {
                    if (i > 0 && typeof arr[i-1] === 'number' && (n as number) - (arr[i-1] as number) > 1) acc.push('...');
                    acc.push(n); return acc;
                  }, [])
                  .map((item, i) => typeof item === 'string'
                    ? <span key={`d-${i}`} className="px-1 text-zinc-600 text-[10px]">…</span>
                    : <button key={item} onClick={() => setCurrentPage(item)}
                        className={`w-7 h-7 rounded-lg text-[10px] font-semibold transition-all ${currentPage === item ? 'bg-emerald-500 text-black' : 'bg-white/5 text-zinc-500 hover:text-white'}`}>
                        {item}
                      </button>
                  )}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/[0.05] text-zinc-500 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* ═══════════════════════════════════════
          MODAL — FICHE COLLABORATEUR
          ═══════════════════════════════════════ */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedEmployee(null); }}>
          <div className="glass-modal w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-fadeIn">

            {/* Header */}
            <div className="relative p-5 pb-6 bg-gradient-to-br from-emerald-900/15 via-transparent to-transparent">
              <button onClick={() => setSelectedEmployee(null)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-black/30 hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
                <X size={15} />
              </button>
              <div className="flex items-center gap-4">
                {/* Avatar + Upload photo */}
                <div className="relative group/photo">
                  <Avatar emp={selectedEmployee} size="lg" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  >
                    {uploadingPhoto
                      ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Camera size={20} className="text-white" />
                    }
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && selectedEmployee) handlePhotoUpload(selectedEmployee.id, file);
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedEmployee.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 text-[8px] font-semibold rounded tracking-wider">{selectedEmployee.id}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[8px] font-semibold ${getStatusColor(selectedEmployee.status)}`}>
                      <span className={`w-1 h-1 rounded-full bg-current ${selectedEmployee.status === 'Actif' ? 'animate-pulse' : ''}`} />
                      {selectedEmployee.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Infos */}
            <div className="p-5 space-y-3">
              {[
                [
                  { icon: Briefcase, label: 'Poste', value: selectedEmployee.post },
                  { icon: Building2, label: 'Département', value: selectedEmployee.dept }
                ],
                [
                  { icon: FileText, label: 'Contrat', value: selectedEmployee.contract },
                  { icon: Banknote, label: 'Salaire Net', value: `${selectedEmployee.salary.toLocaleString()} FCFA`, highlight: true }
                ],
                [
                  { icon: Mail, label: 'Email', value: selectedEmployee.email || 'Non renseigné' },
                  { icon: Calendar, label: "Date d'entrée", value: selectedEmployee.joinDate || 'Non renseignée' }
                ],
                [
                  { icon: Users, label: 'Âge & Genre', value: `${selectedEmployee.age || '--'} ans • ${selectedEmployee.genre || '--'}` },
                  { icon: MapPin, label: 'Nationalité', value: selectedEmployee.nation }
                ],
                [
                  { icon: Fingerprint, label: 'Référent (PCO)', value: selectedEmployee.pco || 'Non assigné', accent: true },
                  { icon: Wallet, label: 'Statut Paie', value: selectedEmployee.paymentStatus || 'En attente',
                    color: selectedEmployee.paymentStatus === 'Payé' ? 'text-emerald-400' : 'text-amber-400' }
                ]
              ].map((row, ri) => (
                <div key={ri} className="grid grid-cols-2 gap-2.5">
                  {row.map((field, fi) => (
                    <div key={fi} className="bg-white/[0.025] border border-white/[0.05] rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <field.icon size={10} className="text-zinc-500" />
                        <p className="text-[8px] font-semibold text-zinc-500 uppercase tracking-wider">{field.label}</p>
                      </div>
                      <p className={`text-xs font-medium truncate ${
                        field.color ? field.color : field.accent ? 'text-emerald-400' : field.highlight ? 'text-white font-bold' : 'text-zinc-300'
                      }`}>
                        {field.value}
                      </p>
                    </div>
                  ))}
                </div>
              ))}

              {/* Actions */}
              <div className="pt-1 flex gap-2">
                <button onClick={() => {
                    const next = selectedEmployee.status === 'Actif' ? 'Congé' : 'Actif';
                    updateStatus(selectedEmployee.id, next as Employee['status']);
                    setSelectedEmployee({ ...selectedEmployee, status: next as Employee['status'] });
                  }}
                  className="flex-1 py-2.5 glass-card rounded-xl text-[10px] font-semibold text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/25 transition-all flex items-center justify-center gap-2">
                  {selectedEmployee.status === 'Actif' ? <><Calendar size={13} /> Mettre en Congé</> : <><CheckCircle2 size={13} /> Marquer Actif</>}
                </button>
                <button onClick={() => { terminateContract(selectedEmployee.id); setSelectedEmployee(null); }}
                  className="px-4 py-2.5 glass-card rounded-xl text-[10px] font-semibold text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/25 transition-all flex items-center gap-2">
                  <AlertCircle size={13} /> Fin de Contrat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ STYLES ═══ */}
      <style jsx global>{`
        .glass-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .glass-card:hover {
          border-color: rgba(255,255,255,0.1);
        }
        .glass-card-accent {
          background: rgba(16,185,129,0.03);
          border: 1px solid rgba(16,185,129,0.12);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .glass-input {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: white;
          outline: none;
          transition: border-color 0.2s;
        }
        .glass-input::placeholder { color: rgba(161,161,170,0.5); }
        .glass-input:focus { border-color: rgba(16,185,129,0.4); }
        .glass-modal {
          background: rgba(10,10,10,0.92);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
        }

        .custom-scroll::-webkit-scrollbar { width: 3px; height: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.25); border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(16,185,129,0.5); }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }

        @keyframes subtlePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .animate-pulse { animation: subtlePulse 2s ease-in-out infinite; }

        select option {
          background-color: #0a0a0a;
          color: #d4d4d8;
        }
        button { user-select: none; -webkit-user-select: none; }
        tbody tr { transition: background-color 0.15s ease; }

        button:focus-visible, input:focus-visible, select:focus-visible {
          outline: 2px solid rgba(16,185,129,0.4);
          outline-offset: 2px;
        }
        button:focus:not(:focus-visible), input:focus:not(:focus-visible), select:focus:not(:focus-visible) {
          outline: none;
        }

        @media (max-width: 768px) {
          table th, table td { padding-left: 10px !important; padding-right: 10px !important; }
        }
      `}</style>
    </div>
  );
}
