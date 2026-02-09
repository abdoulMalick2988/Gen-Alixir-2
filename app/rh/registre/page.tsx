"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Search, ArrowLeft, UserPlus, ChevronLeft, ChevronRight,
  Fingerprint, Wallet, Banknote, Download, Building2,
  Calendar, MoreVertical, CheckCircle2, AlertCircle,
  Users, TrendingUp, Briefcase, X, Clock, Mail,
  MapPin, FileText, Eye, Camera, Home, Award, CreditCard,
  Zap, Activity, Shield, Filter
} from "lucide-react";

// --- TYPES ---
type EmployeeStatus = "Actif" | "Congé" | "En pause" | "Sortie";
type PaymentStatus = "Payé" | "En attente";

interface Employee {
  id: string;
  name: string;
  dept: string;
  post: string;
  contract: string;
  salary: number;
  prime: number;
  primeLabel: string;
  status: EmployeeStatus;
  email: string;
  joinDate: string;
  nation: string;
  age: number | null;
  genre: string;
  pco: string;
  paymentStatus: PaymentStatus;
  photoUrl: string;
}

interface DeptPayroll {
  name: string;
  total: number;
  totalPrimes: number;
  count: number;
  paid: number;
  pending: number;
  paidAmount: number;
  pendingAmount: number;
}

export default function RegistrePersonnel() {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STATES ---
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  
  const [activeDept, setActiveDept] = useState<string>("Tous");
  const [activeStatus, setActiveStatus] = useState<string>("Tous");
  
  const [showPayroll, setShowPayroll] = useState<boolean>(false);
  const [payrollFilter, setPayrollFilter] = useState<string>("Tous");
  
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  
  const [payConfirm, setPayConfirm] = useState<{ id: string; name: string; current: PaymentStatus } | null>(null);
  
  const [showDeptFilter, setShowDeptFilter] = useState<boolean>(false);
  const [showStatusFilter, setShowStatusFilter] = useState<boolean>(false);

  const itemsPerPage = 10;

  // --- EFFETS ---

  // Fermer les menus au clic extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        setShowDeptFilter(false);
        setShowStatusFilter(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Charger les données
  useEffect(() => {
    async function fetchStaff() {
      try {
        const { data, error } = await supabase.from("staff").select("*");
        if (error) throw error;

        if (data && Array.isArray(data)) {
          setEmployees(data.map((item: any) => ({
            id: item.id_key ? "WKD-" + String(item.id_key) : String(item.id ?? ""),
            name: String(item.full_name ?? "Inconnu"),
            dept: String(item.department ?? "Non assigné"),
            post: String(item.role ?? "Collaborateur"),
            contract: String(item.contract_type ?? "CDI"),
            salary: Number(item.salary) || 0,
            prime: Number(item.prime) || 0,
            primeLabel: String(item.prime_label ?? ""),
            status: (function(r: string): EmployeeStatus {
              if (r === "En ligne" || r === "Actif") return "Actif";
              if (r === "Congé") return "Congé";
              if (r === "Sortie") return "Sortie";
              return "En pause";
            })(String(item.status ?? "")),
            email: String(item.email ?? ""),
            joinDate: item.created_at ? new Date(String(item.created_at)).toISOString().split("T")[0] : "",
            nation: String(item.nationality ?? "Sénégal"),
            age: item.age ? Number(item.age) : null,
            genre: String(item.genre ?? ""),
            pco: String(item.pco ?? ""),
            paymentStatus: (String(item.payment_status) === "Payé" ? "Payé" : "En attente") as PaymentStatus,
            photoUrl: String(item.photo_url ?? ""),
          })));
        }
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStaff();
  }, []);

  // --- HELPERS ---

  function getStatusColor(s: string): string {
    if (s === "Actif") return "status-active";
    if (s === "Congé") return "status-conge";
    if (s === "Sortie") return "status-sortie";
    return "status-pause";
  }

  function getInitialBg(n: string): string {
    const colors = [
      "from-cyan-600 to-cyan-700", "from-emerald-600 to-emerald-700",
      "from-teal-600 to-teal-700", "from-blue-600 to-blue-700", 
      "from-violet-600 to-violet-700", "from-amber-600 to-amber-700"
    ];
    return "bg-gradient-to-br " + colors[(n.charCodeAt(0) || 0) % 6];
  }

  // Upload photo
  const handlePhotoUpload = useCallback(async (empId: string, file: File) => {
    setUploadingPhoto(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 4) || "jpg";
      const fp = "staff/photo_" + Date.now() + "." + ext;

      const { error: ue } = await supabase.storage.from("photos").upload(fp, file, { 
        upsert: true,
        contentType: file.type || "image/jpeg" 
      });
      if (ue) throw ue;

      const url = supabase.storage.from("photos").getPublicUrl(fp).data.publicUrl;
      const rid = empId.replace("WKD-", "");

      const { error: e1 } = await supabase.from("staff").update({ photo_url: url }).eq("id_key", rid);
      if (e1) await supabase.from("staff").update({ photo_url: url }).eq("id", rid);

      setEmployees((p) => p.map((e) => (e.id === empId ? { ...e, photoUrl: url } : e)));
      if (selectedEmployee?.id === empId) setSelectedEmployee((p) => p ? { ...p, photoUrl: url } : null);

    } catch (err) {
      console.error(err);
      if (typeof window !== "undefined") window.alert("Erreur upload photo.");
    } finally {
      setUploadingPhoto(false);
    }
  }, [selectedEmployee]);

// ... SUITE DANS LA PARTIE 2
// --- STATISTIQUES ---
  const stats = useMemo(() => {
    const t = employees.length;
    const a = employees.filter((e) => e.status === "Actif").length;
    const c = employees.filter((e) => e.status === "Congé").length;
    const ms = employees.reduce((s, e) => s + e.salary, 0);
    const tp = employees.reduce((s, e) => s + e.prime, 0);
    const pa = employees.filter((e) => e.paymentStatus === "Payé");
    const pe = employees.filter((e) => e.paymentStatus !== "Payé");

    const ds = Array.from(new Set(employees.map((e) => e.dept)));

    const pbd: DeptPayroll[] = ds.map((d) => {
      const de = employees.filter((e) => e.dept === d);
      const p = de.filter((e) => e.paymentStatus === "Payé");
      const q = de.filter((e) => e.paymentStatus !== "Payé");

      return {
        name: d,
        total: de.reduce((acc, curr) => acc + curr.salary, 0),
        totalPrimes: de.reduce((acc, curr) => acc + curr.prime, 0),
        count: de.length,
        paid: p.length,
        pending: q.length,
        paidAmount: p.reduce((acc, curr) => acc + curr.salary + curr.prime, 0),
        pendingAmount: q.reduce((acc, curr) => acc + curr.salary + curr.prime, 0),
      };
    });

    return {
      total: t, actifs: a, conges: c, masseSalariale: ms, totalPrimes: tp,
      totalPaid: pa.reduce((s, e) => s + e.salary + e.prime, 0),
      totalPending: pe.reduce((s, e) => s + e.salary + e.prime, 0),
      paidCount: pa.length, pendingCount: pe.length, depts: ds, payrollByDept: pbd
    };
  }, [employees]);

  // Filtrage livre de paie
  const filteredPayroll = useMemo(() => {
    if (payrollFilter === "Tous") return stats.payrollByDept;
    if (payrollFilter === "Payés") return stats.payrollByDept.filter(d => d.paid > 0);
    if (payrollFilter === "En attente") return stats.payrollByDept.filter(d => d.pending > 0);
    if (payrollFilter === "Avec primes") return stats.payrollByDept.filter(d => d.totalPrimes > 0);
    return stats.payrollByDept;
  }, [stats.payrollByDept, payrollFilter]);

  // Filtrage principal et pagination
  const filteredData = useMemo(() => employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      (e.name.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q) ||
      e.post.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q)) &&
      (activeDept === "Tous" || e.dept === activeDept) &&
      (activeStatus === "Tous" || e.status === activeStatus)
    );
  }), [search, activeDept, activeStatus, employees]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [search, activeDept, activeStatus]);

  // --- ACTIONS ---

  const updateStatus = useCallback(async (id: string, ns: EmployeeStatus) => {
    const rid = id.replace("WKD-", "");
    const statusDb = ns === "Actif" ? "En ligne" : ns;

    const { error: e1 } = await supabase.from("staff").update({ status: statusDb }).eq("id_key", rid);
    if (e1) await supabase.from("staff").update({ status: statusDb }).eq("id", rid);

    setEmployees((p) => p.map((e) => (e.id === id ? { ...e, status: ns } : e)));
    setActiveMenu(null);
  }, []);

  const terminateContract = useCallback((id: string) => {
    if (typeof window !== "undefined" && window.confirm("Confirmer la fin de contrat ?")) {
      // Logique de suppression ou d'archivage ici
      setEmployees((p) => p.filter((e) => e.id !== id));
    }
    setActiveMenu(null);
  }, []);

  const togglePayment = useCallback((id: string, name: string, cur: PaymentStatus) => {
    setPayConfirm({ id, name, current: cur });
  }, []);

  const confirmPayment = useCallback(async () => {
    if (!payConfirm) return;
    const ns: PaymentStatus = payConfirm.current === "Payé" ? "En attente" : "Payé";
    const rid = payConfirm.id.replace("WKD-", "");

    setEmployees((p) => p.map((e) => (e.id === payConfirm.id ? { ...e, paymentStatus: ns } : e)));
    if (selectedEmployee?.id === payConfirm.id) {
      setSelectedEmployee((p) => p ? { ...p, paymentStatus: ns } : null);
    }
    setPayConfirm(null);

    try {
      const { error: e1 } = await supabase.from("staff").update({ payment_status: ns }).eq("id_key", rid);
      if (e1) await supabase.from("staff").update({ payment_status: ns }).eq("id", rid);
    } catch (err) {
      console.error("Erreur mise à jour:", err);
    }
  }, [payConfirm, selectedEmployee]);

  const handleExport = useCallback(() => {
    setIsExporting(true);
    const h = ["ID", "Nom", "Dept", "Poste", "Contrat", "Salaire", "Prime", "Statut", "Paie", "Email", "Entrée"];
    const r = filteredData.map((e) => [
      e.id, e.name, e.dept, e.post, e.contract, String(e.salary),
      String(e.prime), e.status, e.paymentStatus, e.email, e.joinDate
    ]);

    const csvContent = [h, ...r].map((x) => x.join(",")).join("\n");
    const b = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const u = URL.createObjectURL(b);
    
    const a = document.createElement("a");
    a.href = u;
    a.download = "registre_" + new Date().toISOString().split("T")[0] + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(u);
    
    setTimeout(() => setIsExporting(false), 1500);
  }, [filteredData]);

  // --- RENDU AVATAR (CORRIGÉ) ---
  const renderAvatar = (emp: Employee, size: "sm" | "lg") => {
    const d = size === "lg" ? "w-20 h-20 text-2xl rounded-2xl" : "w-10 h-10 text-sm rounded-xl";
    
    if (emp.photoUrl && emp.photoUrl.length > 5) {
      return (
        <img 
          src={emp.photoUrl} 
          alt={emp.name} 
          className={d + " object-cover flex-shrink-0 border-2 border-cyan-500/30 shadow-lg shadow-cyan-500/20"} 
        />
      );
    }

    return (
      <div className={d + " " + getInitialBg(emp.name) + " flex items-center justify-center font-bold text-white flex-shrink-0 border-2 border-white/20 shadow-lg"}>
        {emp.name.charAt(0).toUpperCase()}
      </div>
    );
  };
  // --- RENDU : LOADING ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950" />
        </div>
        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-cyan-400 tracking-widest uppercase mb-1">Initialisation</p>
            <p className="text-xs text-cyan-600">Chargement du registre...</p>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDU : INTERFACE PRINCIPALE ---
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      
      {/* FOND HOLOGRAPHIQUE */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950" />
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-1/3 -right-20 w-[600px] h-[600px] bg-gradient-to-l from-emerald-500/15 to-teal-500/15 rounded-full blur-3xl opacity-20" />
        
        {/* GRILLE CYBERPUNK */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(6, 182, 212, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.5) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 70%)"
        }} />
      </div>

      <div className="relative z-10 min-h-screen py-4 md:py-6 px-3 md:px-6">
        <div className="holo-container w-full max-w-[1700px] mx-auto">
          <div className="p-4 md:p-7 space-y-6 pb-20">

            {/* HEADER */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button onClick={() => router.back()} className="cyber-btn"><ArrowLeft size={16} /></button>
                <div className="ml-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield size={18} className="text-cyan-400" />
                    <h1 className="text-lg md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 tracking-tight">
                      REGISTRE DU PERSONNEL
                    </h1>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-cyan-500/60">
                    <span className="flex items-center gap-1.5"><Activity size={12} className="animate-pulse" /> {stats.total} collaborateurs</span>
                    <span className="w-1 h-1 rounded-full bg-cyan-500/40" />
                    <span className="flex items-center gap-1.5"><Zap size={12} /> Système en ligne</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button onClick={() => setShowPayroll(!showPayroll)} className={showPayroll ? "cyber-btn-active" : "cyber-btn-alt"}>
                  <Banknote size={15} /> <span>Livre de Paie</span>
                </button>
                <button onClick={() => router.push("/rh/registre/contrat")} className="neon-btn">
                  <UserPlus size={15} /> <span>Nouveau Collaborateur</span>
                </button>
              </div>
            </header>

            {/* KPI CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="holo-card">
                <div className="flex items-center gap-3">
                  <div className="holo-icon bg-cyan-500/20"><Users size={18} className="text-cyan-400" /></div>
                  <div>
                    <p className="holo-label">Effectif Total</p>
                    <p className="holo-value">{stats.total}</p>
                  </div>
                </div>
              </div>
              <div className="holo-card">
                <div className="flex items-center gap-3">
                  <div className="holo-icon bg-emerald-500/20"><CheckCircle2 size={18} className="text-emerald-400" /></div>
                  <div>
                    <p className="holo-label">Actifs</p>
                    <p className="holo-value text-emerald-400">{stats.actifs}</p>
                  </div>
                </div>
              </div>
              <div className="holo-card">
                <div className="flex items-center gap-3">
                  <div className="holo-icon bg-violet-500/20"><Wallet size={18} className="text-violet-400" /></div>
                  <div>
                    <p className="holo-label">Masse Salariale</p>
                    <p className="holo-value">{stats.masseSalariale.toLocaleString()} F</p>
                  </div>
                </div>
              </div>
              <div className="holo-card">
                 <div className="flex items-center gap-3">
                  <div className="holo-icon bg-amber-500/20"><Calendar size={18} className="text-amber-400" /></div>
                  <div>
                    <p className="holo-label">Congés</p>
                    <p className="holo-value text-amber-400">{stats.conges}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* BARRE DE RECHERCHE ET FILTRES */}
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/50" size={16} />
                <input 
                  type="text" 
                  placeholder="Rechercher un matricule, nom, poste..." 
                  className="cyber-input pl-11"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              {/* Filtre Dept */}
              <div className="relative min-w-[200px]" ref={menuRef}>
                <button onClick={() => { setShowDeptFilter(!showDeptFilter); setShowStatusFilter(false); }} className={showDeptFilter ? "cyber-select-active" : "cyber-select-button"}>
                  <Building2 size={14} className="text-cyan-400" />
                  <span className="flex-1 text-left">{activeDept === "Tous" ? "Tous les départements" : activeDept}</span>
                  <ChevronRight size={14} className={`transition-transform ${showDeptFilter ? "rotate-90" : ""}`} />
                </button>
                {showDeptFilter && (
                  <div className="dropdown-holo-filter animate-scaleIn z-50">
                    <button onClick={() => { setActiveDept("Tous"); setShowDeptFilter(false); }} className="dropdown-filter-item-active mb-1">
                      Tous les départements
                    </button>
                    {stats.depts.map((d) => (
                      <button key={d} onClick={() => { setActiveDept(d); setShowDeptFilter(false); }} className="dropdown-filter-item w-full text-left px-3 py-2 rounded hover:bg-white/5">
                        {d}
                      </button>
                    ))}
                  </div>
                )}
              </div>

               {/* Export */}
               <button onClick={handleExport} className="cyber-btn-alt min-w-[130px]">
                 {isExporting ? <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent animate-spin rounded-full"/> : <Download size={15} />}
                 <span>Export CSV</span>
               </button>
            </div>

            {/* TABLEAU */}
            <section className="table-holo">
              <div className="overflow-x-auto custom-scroll">
                <table className="w-full text-left table-fixed min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-cyan-500/20">
                      <th className="table-header-holo w-[25%]">Collaborateur</th>
                      <th className="table-header-holo w-[15%]">Poste & Dept</th>
                      <th className="table-header-holo w-[10%]">Contrat</th>
                      <th className="table-header-holo w-[15%]">Salaire</th>
                      <th className="table-header-holo w-[10%]">Statut</th>
                      <th className="table-header-holo w-[15%]">Paie</th>
                      <th className="table-header-holo w-[10%] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((emp) => (
                      <tr key={emp.id} className="table-row-holo border-b border-cyan-500/5 hover:bg-cyan-500/5">
                        <td className="table-cell-holo">
                          <div className="flex items-center gap-3" onClick={() => setSelectedEmployee(emp)}>
                            {renderAvatar(emp, "sm")}
                            <div>
                              <p className="employee-name-holo cursor-pointer">{emp.name}</p>
                              <p className="employee-id-holo"><Fingerprint size={9}/> {emp.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell-holo">
                          <p className="text-xs text-white font-bold">{emp.post}</p>
                          <p className="text-[10px] text-cyan-500/60">{emp.dept}</p>
                        </td>
                        <td className="table-cell-holo">
                          <span className="contract-badge-holo">{emp.contract}</span>
                        </td>
                        <td className="table-cell-holo">
                           <p className="text-xs font-bold text-white">{emp.salary.toLocaleString()} F</p>
                           {emp.prime > 0 && <p className="text-[10px] text-emerald-400">+{emp.prime.toLocaleString()} Prime</p>}
                        </td>
                        <td className="table-cell-holo">
                          <span className={`status-badge-holo ${getStatusColor(emp.status)}`}>
                            <span className="status-dot-holo" /> {emp.status}
                          </span>
                        </td>
                        <td className="table-cell-holo">
                          <button onClick={() => togglePayment(emp.id, emp.name, emp.paymentStatus)} 
                            className={emp.paymentStatus === "Payé" ? "payment-badge-paid-holo" : "text-amber-500 text-xs font-bold border border-amber-500/30 px-2 py-1 rounded"}>
                             {emp.paymentStatus}
                          </button>
                        </td>
                        <td className="table-cell-holo text-right relative">
                          <button onClick={() => setActiveMenu(activeMenu === emp.id ? null : emp.id)} className="action-btn-holo">
                            <MoreVertical size={15} />
                          </button>
                          {activeMenu === emp.id && (
                            <div className="dropdown-holo animate-scaleIn z-50">
                              <button onClick={() => updateStatus(emp.id, "Actif")} className="dropdown-item-holo text-emerald-400"><CheckCircle2 size={13}/> Actif</button>
                              <button onClick={() => updateStatus(emp.id, "Congé")} className="dropdown-item-holo text-amber-400"><Calendar size={13}/> Congé</button>
                              <button onClick={() => terminateContract(emp.id)} className="dropdown-item-holo text-rose-400"><AlertCircle size={13}/> Fin contrat</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* PAGINATION */}
              <div className="pagination-holo">
                <p className="text-xs text-cyan-500/60">Page {currentPage} sur {totalPages}</p>
                <div className="flex gap-2">
                   <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="pagination-btn-holo"><ChevronLeft size={16}/></button>
                   <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="pagination-btn-holo"><ChevronRight size={16}/></button>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>

      {/* MODAL PAIEMENT */}
      {payConfirm && (
        <div className="modal-overlay-holo animate-fadeIn" onClick={() => setPayConfirm(null)}>
          <div className="modal-container-holo animate-scaleIn" onClick={e => e.stopPropagation()}>
             <h3 className="modal-title-holo mb-4">Confirmer le paiement ?</h3>
             <p className="text-cyan-200/80 mb-6">Modifier le statut de paiement pour <span className="text-white font-bold">{payConfirm.name}</span> ?</p>
             <div className="flex gap-3">
               <button onClick={() => setPayConfirm(null)} className="cyber-btn w-full">Annuler</button>
               <button onClick={confirmPayment} className="cyber-btn-active w-full justify-center">Confirmer</button>
             </div>
          </div>
        </div>
      )}

      {/* MODAL EMPLOYÉ */}
      {selectedEmployee && (
        <div className="modal-overlay-holo animate-fadeIn" onClick={() => setSelectedEmployee(null)}>
          <div className="modal-container-xl-holo animate-scaleIn bg-slate-900 border border-cyan-500/30 p-6 rounded-2xl max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex gap-6">
              {renderAvatar(selectedEmployee, "lg")}
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedEmployee.name}</h3>
                <p className="text-cyan-400">{selectedEmployee.post} • {selectedEmployee.dept}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`status-badge-holo ${getStatusColor(selectedEmployee.status)}`}>{selectedEmployee.status}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-8">
               <div className="info-card-holo p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20">
                 <h4 className="text-cyan-400 text-xs font-bold uppercase mb-3">Infos Contrat</h4>
                 <p className="text-sm text-gray-300">ID: <span className="text-white">{selectedEmployee.id}</span></p>
                 <p className="text-sm text-gray-300">Type: <span className="text-white">{selectedEmployee.contract}</span></p>
                 <p className="text-sm text-gray-300">Entrée: <span className="text-white">{selectedEmployee.joinDate}</span></p>
               </div>
               <div className="info-card-holo p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20">
                 <h4 className="text-cyan-400 text-xs font-bold uppercase mb-3">Finances</h4>
                 <p className="text-sm text-gray-300">Salaire: <span className="text-white font-bold">{selectedEmployee.salary.toLocaleString()} F</span></p>
                 <p className="text-sm text-gray-300">Prime: <span className="text-emerald-400">+{selectedEmployee.prime.toLocaleString()} F</span></p>
                 <p className="text-sm text-gray-300 mt-2">Email: {selectedEmployee.email}</p>
               </div>
            </div>

            <div className="mt-6 flex justify-end">
               <button onClick={() => setSelectedEmployee(null)} className="cyber-btn">Fermer</button>
            </div>
            
            {/* Upload Photo Button */}
            <label className="photo-btn-holo absolute bottom-6 left-6 cursor-pointer bg-cyan-500/20 p-2 rounded-lg hover:bg-cyan-500/40">
               <Camera size={16} className="text-cyan-400"/>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 accept="image/*"
                 onChange={(e) => {
                   if (e.target.files && e.target.files[0]) {
                     handlePhotoUpload(selectedEmployee.id, e.target.files[0]);
                   }
                 }}
               />
            </label>
          </div>
        </div>
      )}

      {/* STYLES CSS */}
      <style jsx>{`
        .holo-card {
           background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.6));
           border: 1px solid rgba(6, 182, 212, 0.2);
           border-radius: 1.25rem;
           padding: 1.25rem;
        }
        .holo-label { font-size: 0.625rem; color: rgba(6, 182, 212, 0.7); text-transform: uppercase; font-weight: 700; }
        .holo-value { font-size: 1.375rem; font-weight: 900; color: #fff; }
        .holo-icon { width: 2.75rem; height: 2.75rem; border-radius: 0.875rem; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.1); }
        
        .cyber-btn {
           padding: 0.625rem; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 0.75rem; color: rgba(6, 182, 212, 0.9); display: flex; align-items: center; justify-content: center;
        }
        .cyber-btn-alt {
           padding: 0.625rem 1rem; background: rgba(6, 182, 212, 0.05); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 0.75rem; color: rgba(6, 182, 212, 0.9); font-size: 0.75rem; font-weight: 600; display: flex; gap: 0.5rem; align-items: center;
        }
        .cyber-btn-active {
           padding: 0.625rem 1.125rem; background: linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(16, 185, 129, 0.2)); border: 1px solid rgba(6, 182, 212, 0.5); border-radius: 0.75rem; color: rgb(6, 182, 212); font-size: 0.75rem; font-weight: 700; display: flex; gap: 0.5rem; align-items: center;
        }
        .neon-btn {
           padding: 0.625rem 1.25rem; background: linear-gradient(135deg, rgba(6, 182, 212, 0.8), rgba(16, 185, 129, 0.8)); border: none; border-radius: 0.75rem; color: #0f172a; font-size: 0.75rem; font-weight: 800; display: flex; gap: 0.5rem; align-items: center; box-shadow: 0 0 20px rgba(6, 182, 212, 0.4);
        }
        
        .cyber-input {
           width: 100%; padding: 0.875rem 1rem; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 0.75rem; color: white; font-size: 0.75rem;
        }
        
        .cyber-select-button {
           width: 100%; padding: 0.875rem 1rem; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 0.75rem; color: rgba(6, 182, 212, 0.8); font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; gap: 0.625rem;
        }
        .cyber-select-active {
           width: 100%; padding: 0.875rem 1rem; background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.15)); border: 1px solid rgba(6, 182, 212, 0.5); border-radius: 0.75rem; color: rgb(6, 182, 212); font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 0.625rem;
        }
        
        .table-holo { background: linear-gradient(135deg, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.5)); border: 1px solid rgba(6, 182, 212, 0.25); border-radius: 1.5rem; overflow: hidden; }
        .table-header-holo { padding: 1rem 1.25rem; font-size: 0.625rem; font-weight: 800; color: rgba(6, 182, 212, 0.8); text-transform: uppercase; background: rgba(6, 182, 212, 0.08); }
        .table-cell-holo { padding: 1.125rem 1.25rem; }
        
        .employee-name-holo { font-size: 0.8125rem; font-weight: 700; color: rgba(6, 182, 212, 0.95); }
        .employee-id-holo { font-size: 0.625rem; color: rgba(6, 182, 212, 0.5); font-family: 'Courier New', monospace; }
        .contract-badge-holo { padding: 0.4375rem 0.75rem; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.25); border-radius: 0.5rem; font-size: 0.625rem; font-weight: 700; color: rgba(6, 182, 212, 0.9); }
        
        .status-badge-holo { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4375rem 0.875rem; border-radius: 0.625rem; border: 1px solid; font-size: 0.625rem; font-weight: 700; text-transform: uppercase; }
        .status-dot-holo { width: 0.5rem; height: 0.5rem; border-radius: 50%; background: currentColor; }
        .status-active { background: rgba(16, 185, 129, 0.15); color: rgb(16, 185, 129); border-color: rgba(16, 185, 129, 0.4); }
        .status-conge { background: rgba(245, 158, 11, 0.15); color: rgb(245, 158, 11); border-color: rgba(245, 158, 11, 0.4); }
        .status-pause { background: rgba(148, 163, 184, 0.15); color: rgb(148, 163, 184); border-color: rgba(148, 163, 184, 0.4); }
        .status-sortie { background: rgba(239, 68, 68, 0.15); color: rgb(239, 68, 68); border-color: rgba(239, 68, 68, 0.4); }
        
        .payment-badge-paid-holo { display: inline-flex; padding: 0.5rem 0.875rem; background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.15)); border: 1px solid rgba(139, 92, 246, 0.4); border-radius: 0.625rem; color: rgb(139, 92, 246); font-size: 0.625rem; font-weight: 700; text-transform: uppercase; }
        
        .dropdown-holo { position: absolute; right: 0; top: 100%; margin-top: 0.5rem; background: #0f172a; border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 0.75rem; padding: 0.5rem; display: flex; flex-direction: column; min-width: 140px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .dropdown-item-holo { display: flex; align-items: center; gap: 0.5rem; padding: 0.625rem; border-radius: 0.5rem; font-size: 0.75rem; font-weight: 600; text-align: left; width: 100%; }
        .dropdown-item-holo:hover { background: rgba(255,255,255,0.05); }

        .modal-overlay-holo { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); }
        .modal-container-holo { width: 100%; max-width: 32rem; background: #0f172a; border: 1px solid rgba(6, 182, 212, 0.4); border-radius: 1.5rem; padding: 2rem; }
        .modal-title-holo { font-size: 1.125rem; font-weight: 800; color: white; }

        .pagination-holo { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; border-top: 1px solid rgba(6, 182, 212, 0.2); }
        .pagination-btn-holo { width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center; border-radius: 0.5rem; background: rgba(6, 182, 212, 0.1); color: rgb(6, 182, 212); }
        .pagination-btn-holo:disabled { opacity: 0.5; }
        
        .dropdown-holo-filter { position: absolute; top: 100%; left: 0; right: 0; background: #0f172a; border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 0.75rem; padding: 0.5rem; margin-top: 0.5rem; display: flex; flex-direction: column; }
      `}</style>
    </div>
  );
}
