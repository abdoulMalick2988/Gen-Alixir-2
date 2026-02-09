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
          setEmployees(data.map((item: Record<string, unknown>) => ({
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

  // Fonctions utilitaires
  function getStatusColor(s: string): string {
    if (s === "Actif") return "status-active";
    if (s === "Congé") return "status-conge";
    if (s === "Sortie") return "status-sortie";
    return "status-pause";
  }

  function getInitialBg(n: string): string {
    const colors = ["from-cyan-600 to-cyan-700", "from-emerald-600 to-emerald-700", "from-teal-600 to-teal-700", "from-blue-600 to-blue-700", "from-violet-600 to-violet-700", "from-amber-600 to-amber-700"];
    return "bg-gradient-to-br " + colors[n.charCodeAt(0) % 6];
  }

  // Upload photo
  const handlePhotoUpload = useCallback(async (empId: string, file: File) => {
    setUploadingPhoto(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 4) || "jpg";
      const fp = "staff/photo_" + Date.now() + "." + ext;
      const { error: ue } = await supabase.storage.from("photos").upload(fp, file, { upsert: true, contentType: file.type || "image/jpeg" });
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

  // Statistiques
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
        total: de.reduce((a, c) => a + c.salary, 0),
        totalPrimes: de.reduce((a, c) => a + c.prime, 0),
        count: de.length,
        paid: p.length,
        pending: q.length,
        paidAmount: p.reduce((a, c) => a + c.salary + c.prime, 0),
        pendingAmount: q.reduce((a, c) => a + c.salary + c.prime, 0)
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

  // Filtrage et pagination
  const filteredData = useMemo(() => employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q) ||
      e.post.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q)
    ) && (activeDept === "Tous" || e.dept === activeDept) &&
      (activeStatus === "Tous" || e.status === activeStatus);
  }), [search, activeDept, activeStatus, employees]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [search, activeDept, activeStatus]);

  // Actions
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
      setEmployees((p) => p.filter((e) => e.id !== id));
      setActiveMenu(null);
    }
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
    const r = filteredData.map((e) => [e.id, e.name, e.dept, e.post, e.contract, String(e.salary), String(e.prime), e.status, e.paymentStatus, e.email, e.joinDate]);
    const b = new Blob([[h, ...r].map((x) => x.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" });
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

  function getPaginationItems(): (number | string)[] {
    const it: (number | string)[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (totalPages <= 5 || i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
        if (it.length > 0) {
          const l = it[it.length - 1];
          if (typeof l === "number" && i - l > 1) it.push("...");
        }
        it.push(i);
      }
    }
    return it;
  }

  function renderAvatar(emp: Employee, size: "sm" | "lg"): React.ReactNode {
    const d = size === "lg" ? "w-20 h-20 text-2xl rounded-2xl" : "w-10 h-10 text-sm rounded-xl";
    if (emp.photoUrl && emp.photoUrl.length > 5) {
      return <img src={emp.photoUrl} alt={emp.name} className={d + " object-cover flex-shrink-0 border-2 border-cyan-500/30 shadow-lg shadow-cyan-500/20"} />;
    }
    return (
      <div className={d + " " + getInitialBg(emp.name) + " flex items-center justify-center font-bold text-white flex-shrink-0 border-2 border-white/20 shadow-lg"}>
        {emp.name.charAt(0).toUpperCase()}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin" />
            <div className="absolute inset-2 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-cyan-400 tracking-widest uppercase mb-1">Initialisation</p>
            <p className="text-xs text-cyan-600">Chargement du registre...</p>
          </div>
        </div>
      </div>
    );
  }

/* ═══ PARTIE 2 — Interface principale avec tableau aligné ═══ */

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950">

      {/* ═══ FOND HOLOGRAPHIQUE ULTRA FUTURISTE ═══ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-900/15 via-transparent to-transparent" />
        
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 -right-20 w-[600px] h-[600px] bg-gradient-to-l from-emerald-500/15 to-teal-500/15 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse-slow" />
        
        <div className="absolute inset-0 opacity-[0.03]" style={{ 
          backgroundImage: "linear-gradient(rgba(6, 182, 212, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.5) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 70%)"
        }} />
        
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(6, 182, 212, 0.3) 2px, rgba(6, 182, 212, 0.3) 4px)"
        }} />
        
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-ping opacity-75" />
        <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-emerald-400 rounded-full animate-ping opacity-75" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-1/4 left-2/3 w-1 h-1 bg-violet-400 rounded-full animate-ping opacity-75" style={{ animationDelay: "2s" }} />
        
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent" />
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-emerald-500/15 to-transparent" />
      </div>

      {/* ═══ INTERFACE PRINCIPALE SCROLLABLE ═══ */}
      <div className="relative z-10 min-h-screen py-4 md:py-6 px-3 md:px-6">
        <div className="holo-container w-full max-w-[1700px] mx-auto">
          
          <div className="max-h-[calc(100vh-3rem)] overflow-y-auto custom-scroll">
            <div className="p-4 md:p-7 space-y-6 pb-20">

              {/* ── HEADER FUTURISTE ── */}
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.push("/rh")} type="button" className="cyber-btn">
                    <ArrowLeft size={16} />
                  </button>
                  <button onClick={() => router.push("/")} type="button" className="cyber-btn">
                    <Home size={16} />
                  </button>
                  <div className="ml-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield size={18} className="text-cyan-400" />
                      <h1 className="text-lg md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 tracking-tight">
                        REGISTRE DU PERSONNEL
                      </h1>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-cyan-500/60">
                      <span className="flex items-center gap-1.5">
                        <Activity size={12} className="animate-pulse" />
                        {stats.total} collaborateurs
                      </span>
                      <span className="w-1 h-1 rounded-full bg-cyan-500/40" />
                      <span className="flex items-center gap-1.5">
                        <Zap size={12} />
                        Système en ligne
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => setShowPayroll(!showPayroll)}
                    type="button"
                    className={showPayroll ? "cyber-btn-active" : "cyber-btn-alt"}
                  >
                    <Banknote size={15} />
                    <span>Livre de Paie</span>
                  </button>
                  <button 
                    onClick={() => router.push("/rh/registre/contrat")} 
                    type="button" 
                    className="neon-btn"
                  >
                    <UserPlus size={15} />
                    <span>Nouveau Collaborateur</span>
                  </button>
                </div>
              </header>

              {/* ── KPI HOLOGRAPHIQUES ── */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="holo-card group">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex items-center gap-3">
                    <div className="holo-icon bg-cyan-500/20 border-cyan-500/30">
                      <Users size={18} className="text-cyan-400" />
                    </div>
                    <div>
                      <p className="holo-label">Effectif Total</p>
                      <p className="holo-value">{stats.total}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-[9px] text-cyan-500/70">Actif</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="holo-card group">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex items-center gap-3">
                    <div className="holo-icon bg-emerald-500/20 border-emerald-500/30">
                      <CheckCircle2 size={18} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="holo-label">En Service</p>
                      <p className="holo-value text-emerald-400">{stats.actifs}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <TrendingUp size={10} className="text-emerald-500" />
                        <span className="text-[9px] text-emerald-500/70">+12%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="holo-card group">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex items-center gap-3">
                    <div className="holo-icon bg-amber-500/20 border-amber-500/30">
                      <Calendar size={18} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="holo-label">En Congé</p>
                      <p className="holo-value text-amber-400">{stats.conges}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={10} className="text-amber-500" />
                        <span className="text-[9px] text-amber-500/70">Stable</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="holo-card group">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex items-center gap-3">
                    <div className="holo-icon bg-violet-500/20 border-violet-500/30">
                      <CreditCard size={18} className="text-violet-400" />
                    </div>
                    <div>
                      <p className="holo-label">Paiements</p>
                      <p className="holo-value text-violet-400">
                        {stats.paidCount}<span className="text-[10px] text-violet-500/50 font-normal ml-1">/{stats.total}</span>
                      </p>
                      <div className="w-full h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all duration-1000"
                          style={{ width: stats.total > 0 ? `${(stats.paidCount / stats.total) * 100}%` : "0%" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="holo-card-premium group">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-emerald-500/10 to-violet-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex items-center gap-3">
                    <div className="holo-icon-premium">
                      <TrendingUp size={18} className="text-cyan-400" />
                    </div>
                    <div>
                      <p className="holo-label">Masse Salariale</p>
                      <p className="holo-value-premium">
                        {((stats.masseSalariale + stats.totalPrimes) / 1000000).toFixed(1)}M
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Zap size={10} className="text-emerald-400" />
                        <span className="text-[9px] text-emerald-400/70">+8% FCFA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── LIVRE DE PAIE AVEC FILTRES HOLOGRAPHIQUES ── */}
              {showPayroll && (
                <section className="payroll-holo animate-slideDown">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center">
                        <Wallet size={18} className="text-cyan-400" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white">Livre de Paie par Département</h2>
                        <p className="text-[10px] text-cyan-500/60">Répartition financière en temps réel</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="stat-chip">
                        <p className="stat-label">Salaires</p>
                        <p className="stat-value">{stats.masseSalariale.toLocaleString()} <span className="text-cyan-400 text-[9px]">F</span></p>
                      </div>
                      <div className="stat-chip-premium">
                        <p className="stat-label text-emerald-400">Primes</p>
                        <p className="stat-value text-emerald-400">{stats.totalPrimes.toLocaleString()} F</p>
                      </div>
                      <div className="stat-chip">
                        <p className="stat-label text-violet-400">Payé</p>
                        <p className="stat-value text-violet-400">{stats.totalPaid.toLocaleString()} F</p>
                      </div>
                      <div className="stat-chip">
                        <p className="stat-label text-amber-400">En attente</p>
                        <p className="stat-value text-amber-400">{stats.totalPending.toLocaleString()} F</p>
                      </div>
                    </div>
                  </div>

                  {/* Filtres livre de paie holographiques */}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <Filter size={14} className="text-cyan-500" />
                    <button
                      onClick={() => setPayrollFilter("Tous")}
                      className={payrollFilter === "Tous" ? "filter-btn-active" : "filter-btn"}
                    >
                      Tous
                    </button>
                    <button
                      onClick={() => setPayrollFilter("Payés")}
                      className={payrollFilter === "Payés" ? "filter-btn-active" : "filter-btn"}
                    >
                      Payés
                    </button>
                    <button
                      onClick={() => setPayrollFilter("En attente")}
                      className={payrollFilter === "En attente" ? "filter-btn-active" : "filter-btn"}
                    >
                      En attente
                    </button>
                    <button
                      onClick={() => setPayrollFilter("Avec primes")}
                      className={payrollFilter === "Avec primes" ? "filter-btn-active" : "filter-btn"}
                    >
                      Avec primes
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                    {filteredPayroll.map((dept: DeptPayroll, i: number) => (
                      <div key={dept.name + "-" + String(i)} className="dept-holo group">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative">
                          <div className="flex items-center justify-between mb-2.5">
                            <Building2 size={13} className="text-cyan-500/60" />
                            <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-md text-[9px] font-bold text-cyan-400">
                              {dept.count}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-wider mb-1">{dept.name}</p>
                          <p className="text-base font-black text-white mb-0.5">
                            {dept.total.toLocaleString()} <span className="text-[10px] text-cyan-400 font-semibold">F</span>
                          </p>
                          {dept.totalPrimes > 0 && (
                            <p className="text-[11px] font-bold text-emerald-400">
                              + {dept.totalPrimes.toLocaleString()} F
                            </p>
                          )}
                          <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-1000"
                              style={{ width: dept.count > 0 ? `${(dept.paid / dept.count) * 100}%` : "0%" }}
                            />
                          </div>
                          <div className="mt-2 flex justify-between items-center text-[9px] font-semibold">
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 size={9} />
                              {dept.paid} payé{dept.paid > 1 ? "s" : ""}
                            </span>
                            {dept.pending > 0 && (
                              <span className="text-amber-400 flex items-center gap-1">
                                <Clock size={9} />
                                {dept.pending}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── BARRE DE RECHERCHE ET FILTRES HOLOGRAPHIQUES ── */}
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-xl blur-sm" />
                  <div className="relative flex items-center">
                    <Search className="absolute left-3.5 text-cyan-500/60 pointer-events-none" size={16} />
                    <input
                      type="text"
                      placeholder="Chercher un collaborateur..."
                      className="cyber-input pl-11 pr-11"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        type="button"
                        className="absolute right-3.5 text-cyan-500/60 hover:text-cyan-400 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filtre département holographique */}
                <div className="relative min-w-[200px]" ref={showDeptFilter ? menuRef : null}>
                  <button
                    onClick={() => {
                      setShowDeptFilter(!showDeptFilter);
                      setShowStatusFilter(false);
                    }}
                    type="button"
                    className={showDeptFilter ? "cyber-select-active" : "cyber-select-button"}
                  >
                    <Building2 size={14} className="text-cyan-400" />
                    <span className="flex-1 text-left">{activeDept === "Tous" ? "Tous les départements" : activeDept}</span>
                    <ChevronRight size={14} className={`transition-transform ${showDeptFilter ? "rotate-90" : ""}`} />
                  </button>
                  {showDeptFilter && (
                    <div className="dropdown-holo-filter animate-scaleIn">
                      <button
                        onClick={() => {
                          setActiveDept("Tous");
                          setShowDeptFilter(false);
                        }}
                        type="button"
                        className={activeDept === "Tous" ? "dropdown-filter-item-active" : "dropdown-filter-item"}
                      >
                        <Building2 size={12} />
                        <span>Tous les départements</span>
                        {activeDept === "Tous" && <CheckCircle2 size={12} className="ml-auto text-cyan-400" />}
                      </button>
                      {stats.depts.map((d: string) => (
                        <button
                          key={d}
                          onClick={() => {
                            setActiveDept(d);
                            setShowDeptFilter(false);
                          }}
                          type="button"
                          className={activeDept === d ? "dropdown-filter-item-active" : "dropdown-filter-item"}
                        >
                          <Building2 size={12} />
                          <span>{d}</span>
                          {activeDept === d && <CheckCircle2 size={12} className="ml-auto text-cyan-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Filtre statut holographique */}
                <div className="relative min-w-[160px]" ref={showStatusFilter ? menuRef : null}>
                  <button
                    onClick={() => {
                      setShowStatusFilter(!showStatusFilter);
                      setShowDeptFilter(false);
                    }}
                    type="button"
                    className={showStatusFilter ? "cyber-select-active" : "cyber-select-button"}
                  >
                    <Activity size={14} className="text-cyan-400" />
                    <span className="flex-1 text-left">{activeStatus === "Tous" ? "Tous les statuts" : activeStatus}</span>
                    <ChevronRight size={14} className={`transition-transform ${showStatusFilter ? "rotate-90" : ""}`} />
                  </button>
                  {showStatusFilter && (
                    <div className="dropdown-holo-filter animate-scaleIn">
                      <button
                        onClick={() => {
                          setActiveStatus("Tous");
                          setShowStatusFilter(false);
                        }}
                        type="button"
                        className={activeStatus === "Tous" ? "dropdown-filter-item-active" : "dropdown-filter-item"}
                      >
                        <Activity size={12} />
                        <span>Tous les statuts</span>
                        {activeStatus === "Tous" && <CheckCircle2 size={12} className="ml-auto text-cyan-400" />}
                      </button>
                      {["Actif", "Congé", "En pause"].map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setActiveStatus(s);
                            setShowStatusFilter(false);
                          }}
                          type="button"
                          className={activeStatus === s ? "dropdown-filter-item-active" : "dropdown-filter-item"}
                        >
                          {s === "Actif" && <CheckCircle2 size={12} className="text-emerald-400" />}
                          {s === "Congé" && <Calendar size={12} className="text-amber-400" />}
                          {s === "En pause" && <Clock size={12} className="text-slate-400" />}
                          <span>{s}</span>
                          {activeStatus === s && <CheckCircle2 size={12} className="ml-auto text-cyan-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={handleExport} type="button" className="cyber-btn-alt min-w-[130px]">
                  {isExporting ? (
                    <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <Download size={15} />
                  )}
                  <span>Export CSV</span>
                </button>
              </div>

              {/* ── TABLEAU HOLOGRAPHIQUE AVEC COLONNES ALIGNÉES ── */}
              <section className="table-holo">
                <div className="overflow-x-auto custom-scroll">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-cyan-500/20">
                        <th className="table-header-holo" style={{ width: '260px', minWidth: '260px' }}>
                          <div className="flex items-center gap-2">
                            <Users size={12} className="text-cyan-400" />
                            <span>Collaborateur</span>
                          </div>
                        </th>
                        <th className="table-header-holo" style={{ width: '140px', minWidth: '140px' }}>
                          <div className="flex items-center gap-2">
                            <Building2 size={12} className="text-cyan-400" />
                            <span>Département</span>
                          </div>
                        </th>
                        <th className="table-header-holo" style={{ width: '160px', minWidth: '160px' }}>
                          <div className="flex items-center gap-2">
                            <Briefcase size={12} className="text-cyan-400" />
                            <span>Poste</span>
                          </div>
                        </th>
                        <th className="table-header-holo" style={{ width: '100px', minWidth: '100px' }}>
                          <div className="flex items-center gap-2">
                            <FileText size={12} className="text-cyan-400" />
                            <span>Contrat</span>
                          </div>
                        </th>
                        <th className="table-header-holo" style={{ width: '130px', minWidth: '130px' }}>
                          <div className="flex items-center gap-2">
                            <Wallet size={12} className="text-cyan-400" />
                            <span>Salaire</span>
                          </div>
                        </th>
                        <th className="table-header-holo" style={{ width: '120px', minWidth: '120px' }}>
                          <div className="flex items-center gap-2">
                            <Award size={12} className="text-cyan-400" />
                            <span>Prime</span>
                          </div>
                        </th>
                        <th className="table-header-holo" style={{ width: '120px', minWidth: '120px' }}>
                          <div className="flex items-center gap-2">
                            <Activity size={12} className="text-cyan-400" />
                            <span>Statut</span>
                          </div>
                        </th>
                        <th className="table-header-holo" style={{ width: '130px', minWidth: '130px' }}>
                          <div className="flex items-center gap-2">
                            <CreditCard size={12} className="text-cyan-400" />
                            <span>Paie</span>
                          </div>
                        </th>
                        <th className="table-header-holo text-right" style={{ width: '100px', minWidth: '100px' }}>
                          <div className="flex items-center gap-2 justify-end">
                            <span>Actions</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {paginatedData.map((emp: Employee) => (
                        <tr key={emp.id} className="table-row-holo group">
                          <td className="table-cell-holo" style={{ width: '260px', minWidth: '260px' }}>
                            <div className="flex items-center gap-3">
                              <div
                                onClick={() => setSelectedEmployee(emp)}
                                className="cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 rounded-xl flex-shrink-0"
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === "Enter") setSelectedEmployee(emp); }}
                              >
                                {renderAvatar(emp, "sm")}
                              </div>
                              <div className="min-w-0 flex-1">
                                <button
                                  onClick={() => setSelectedEmployee(emp)}
                                  type="button"
                                  className="employee-name-holo truncate block w-full text-left"
                                >
                                  {emp.name}
                                </button>
                                <p className="employee-id-holo">
                                  <Fingerprint size={9} />
                                  {emp.id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="table-cell-holo" style={{ width: '140px', minWidth: '140px' }}>
                            <p className="text-[11px] text-cyan-300/80 truncate">{emp.dept}</p>
                          </td>
                          <td className="table-cell-holo" style={{ width: '160px', minWidth: '160px' }}>
                            <p className="text-[11px] text-slate-400 truncate">{emp.post}</p>
                          </td>
                          <td className="table-cell-holo" style={{ width: '100px', minWidth: '100px' }}>
                            <span className="contract-badge-holo">{emp.contract}</span>
                          </td>
                          <td className="table-cell-holo" style={{ width: '130px', minWidth: '130px' }}>
                            <p className="salary-holo">
                              {emp.salary.toLocaleString()} <span className="text-[9px] text-cyan-400">F</span>
                            </p>
                          </td>
                          <td className="table-cell-holo" style={{ width: '120px', minWidth: '120px' }}>
                            {emp.prime > 0 ? (
                              <div>
                                <p className="prime-holo">
                                  {emp.prime.toLocaleString()} <span className="text-[9px]">F</span>
                                </p>
                                {emp.primeLabel && <p className="prime-label-holo truncate">{emp.primeLabel}</p>}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-700">—</span>
                            )}
                          </td>
                          <td className="table-cell-holo" style={{ width: '120px', minWidth: '120px' }}>
                            <span className={`status-badge-holo ${getStatusColor(emp.status)}`}>
                              <span className="status-dot-holo" />
                              {emp.status}
                            </span>
                          </td>
                          <td className="table-cell-holo" style={{ width: '130px', minWidth: '130px' }}>
                            <button
                              type="button"
                              onClick={() => togglePayment(emp.id, emp.name, emp.paymentStatus)}
                              className={emp.paymentStatus === "Payé" ? "payment-badge-paid-holo" : "payment-badge-pending-holo"}
                            >
                              {emp.paymentStatus === "Payé" ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                              {emp.paymentStatus}
                            </button>
                          </td>
                          <td className="table-cell-holo text-right" style={{ width: '100px', minWidth: '100px' }}>
                            <div className="flex justify-end gap-2 relative" ref={activeMenu === emp.id ? menuRef : null}>
                              <button
                                onClick={() => setSelectedEmployee(emp)}
                                type="button"
                                className="action-btn-holo"
                                title="Voir la fiche"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => setActiveMenu(activeMenu === emp.id ? null : emp.id)}
                                type="button"
                                className={activeMenu === emp.id ? "action-btn-holo-active" : "action-btn-holo"}
                              >
                                <MoreVertical size={15} />
                              </button>
                              {activeMenu === emp.id && (
                                <div className="dropdown-holo animate-scaleIn">
                                  <button onClick={() => updateStatus(emp.id, "Actif")} type="button" className="dropdown-item-holo text-emerald-400">
                                    <CheckCircle2 size={13} />
                                    <span>Marquer Actif</span>
                                  </button>
                                  <button onClick={() => updateStatus(emp.id, "Congé")} type="button" className="dropdown-item-holo text-amber-400">
                                    <Calendar size={13} />
                                    <span>En Congé</span>
                                  </button>
                                  <button onClick={() => updateStatus(emp.id, "En pause")} type="button" className="dropdown-item-holo text-slate-400">
                                    <Clock size={13} />
                                    <span>En Pause</span>
                                  </button>
                                  <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent my-1" />
                                  <button onClick={() => terminateContract(emp.id)} type="button" className="dropdown-item-holo text-rose-400">
                                    <AlertCircle size={13} />
                                    <span>Fin de Contrat</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {paginatedData.length === 0 && (
                        <tr>
                          <td colSpan={9} className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center gap-4">
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-slate-800/50 border border-cyan-500/30 flex items-center justify-center">
                                <Search size={28} className="text-cyan-500/50" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-400 mb-1">Aucun résultat trouvé</p>
                                <p className="text-xs text-slate-600">Essayez de modifier vos critères de recherche</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination futuriste */}
                <div className="pagination-holo">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Activity size={14} className="text-cyan-500 animate-pulse" />
                    <p className="pagination-info-holo">
                      <span className="text-cyan-400 font-bold">{filteredData.length}</span> enregistrement{filteredData.length > 1 ? "s" : ""}
                      {(search || activeDept !== "Tous" || activeStatus !== "Tous") && (
                        <span className="ml-2 px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-md text-cyan-400 text-[10px]">Filtré</span>
                      )}
                      <span className="text-slate-600 mx-2">•</span>
                      Page <span className="text-cyan-400 font-bold">{currentPage}</span>/<span className="text-slate-500">{totalPages}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      type="button"
                      className="pagination-btn-holo"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {getPaginationItems().map((item, idx) =>
                      typeof item === "string" ? (
                        <span key={"d" + String(idx)} className="px-2 text-slate-700 text-[10px]">⋯</span>
                      ) : (
                        <button
                          key={"p" + String(item)}
                          onClick={() => setCurrentPage(item)}
                          type="button"
                          className={currentPage === item ? "pagination-number-holo-active" : "pagination-number-holo"}
                        >
                          {item}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      type="button"
                      className="pagination-btn-holo"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>

      {/* ── TABLEAU HOLOGRAPHIQUE ── */}
              <section className="table-holo">
                <div className="overflow-x-auto custom-scroll">
                  <table className="w-full text-left table-fixed">
                    <thead>
                      <tr className="border-b border-cyan-500/20">
                        <th className="table-header-holo w-[18%]">👤 Collaborateur</th>
                        <th className="table-header-holo w-[12%]">🏢 Département</th>
                        <th className="table-header-holo w-[12%]">💼 Poste</th>
                        <th className="table-header-holo w-[8%]">📄 Contrat</th>
                        <th className="table-header-holo w-[10%]">💰 Salaire</th>
                        <th className="table-header-holo w-[10%]">🎁 Prime</th>
                        <th className="table-header-holo w-[10%]">📊 Statut</th>
                        <th className="table-header-holo w-[10%]">💳 Paie</th>
                        <th className="table-header-holo w-[10%] text-right">⚙️ Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {paginatedData.map((emp: Employee) => (
                        <tr key={emp.id} className="table-row-holo group">
                          <td className="table-cell-holo w-[18%]">
                            <div className="flex items-center gap-3">
                              <div
                                onClick={() => setSelectedEmployee(emp)}
                                className="cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 rounded-xl flex-shrink-0"
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === "Enter") setSelectedEmployee(emp); }}
                              >
                                {renderAvatar(emp, "sm")}
                              </div>
                              <div className="min-w-0">
                                <button
                                  onClick={() => setSelectedEmployee(emp)}
                                  type="button"
                                  className="employee-name-holo truncate block w-full text-left"
                                >
                                  {emp.name}
                                </button>
                                <p className="employee-id-holo">
                                  <Fingerprint size={9} />
                                  {emp.id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="table-cell-holo w-[12%]">
                            <p className="text-[11px] text-cyan-300/80 truncate">{emp.dept}</p>
                          </td>
                          <td className="table-cell-holo w-[12%]">
                            <p className="text-[11px] text-slate-400 truncate">{emp.post}</p>
                          </td>
                          <td className="table-cell-holo w-[8%]">
                            <span className="contract-badge-holo">{emp.contract}</span>
                          </td>
                          <td className="table-cell-holo w-[10%]">
                            <p className="salary-holo">
                              {emp.salary.toLocaleString()} <span className="text-[9px] text-cyan-400">F</span>
                            </p>
                          </td>
                          <td className="table-cell-holo w-[10%]">
                            {emp.prime > 0 ? (
                              <div>
                                <p className="prime-holo">
                                  {emp.prime.toLocaleString()} <span className="text-[9px]">F</span>
                                </p>
                                {emp.primeLabel && <p className="prime-label-holo truncate">{emp.primeLabel}</p>}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-700">—</span>
                            )}
                          </td>
                          <td className="table-cell-holo w-[10%]">
                            <span className={`status-badge-holo ${getStatusColor(emp.status)}`}>
                              <span className="status-dot-holo" />
                              {emp.status}
                            </span>
                          </td>
                          <td className="table-cell-holo w-[10%]">
                            <button
                              type="button"
                              onClick={() => togglePayment(emp.id, emp.name, emp.paymentStatus)}
                              className={emp.paymentStatus === "Payé" ? "payment-badge-paid-holo" : "payment-badge-pending-holo"}
                            >
                              {emp.paymentStatus === "Payé" ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                              {emp.paymentStatus}
                            </button>
                          </td>
                          <td className="table-cell-holo w-[10%]">
                            <div className="flex justify-end gap-2 relative" ref={activeMenu === emp.id ? menuRef : null}>
                              <button
                                onClick={() => setSelectedEmployee(emp)}
                                type="button"
                                className="action-btn-holo"
                                title="Voir la fiche"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => setActiveMenu(activeMenu === emp.id ? null : emp.id)}
                                type="button"
                                className={activeMenu === emp.id ? "action-btn-holo-active" : "action-btn-holo"}
                              >
                                <MoreVertical size={15} />
                              </button>
                              {activeMenu === emp.id && (
                                <div className="dropdown-holo animate-scaleIn">
                                  <button onClick={() => updateStatus(emp.id, "Actif")} type="button" className="dropdown-item-holo text-emerald-400">
                                    <CheckCircle2 size={13} />
                                    <span>Marquer Actif</span>
                                  </button>
                                  <button onClick={() => updateStatus(emp.id, "Congé")} type="button" className="dropdown-item-holo text-amber-400">
                                    <Calendar size={13} />
                                    <span>En Congé</span>
                                  </button>
                                  <button onClick={() => updateStatus(emp.id, "En pause")} type="button" className="dropdown-item-holo text-slate-400">
                                    <Clock size={13} />
                                    <span>En Pause</span>
                                  </button>
                                  <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent my-1" />
                                  <button onClick={() => terminateContract(emp.id)} type="button" className="dropdown-item-holo text-rose-400">
                                    <AlertCircle size={13} />
                                    <span>Fin de Contrat</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {paginatedData.length === 0 && (
                        <tr>
                          <td colSpan={9} className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center gap-4">
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-slate-800/50 border border-cyan-500/30 flex items-center justify-center">
                                <Search size={28} className="text-cyan-500/50" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-400 mb-1">Aucun résultat trouvé</p>
                                <p className="text-xs text-slate-600">Essayez de modifier vos critères de recherche</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination futuriste */}
                <div className="pagination-holo">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Activity size={14} className="text-cyan-500 animate-pulse" />
                    <p className="pagination-info-holo">
                      <span className="text-cyan-400 font-bold">{filteredData.length}</span> enregistrement{filteredData.length > 1 ? "s" : ""}
                      {(search || activeDept !== "Tous" || activeStatus !== "Tous") && (
                        <span className="ml-2 px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-md text-cyan-400 text-[10px]">Filtré</span>
                      )}
                      <span className="text-slate-600 mx-2">•</span>
                      Page <span className="text-cyan-400 font-bold">{currentPage}</span>/<span className="text-slate-500">{totalPages}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      type="button"
                      className="pagination-btn-holo"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {getPaginationItems().map((item, idx) =>
                      typeof item === "string" ? (
                        <span key={"d" + String(idx)} className="px-2 text-slate-700 text-[10px]">⋯</span>
                      ) : (
                        <button
                          key={"p" + String(item)}
                          onClick={() => setCurrentPage(item)}
                          type="button"
                          className={currentPage === item ? "pagination-number-holo-active" : "pagination-number-holo"}
                        >
                          {item}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      type="button"
                      className="pagination-btn-holo"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>

      {/* ═══ MODAL CONFIRMATION PAIEMENT HOLOGRAPHIQUE ═══ */}
      {payConfirm && (
        <div className="modal-overlay-holo animate-fadeIn" onClick={() => setPayConfirm(null)}>
          <div className="modal-container-holo animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 rounded-2xl blur-xl" />
            <div className="relative">
              <div className="flex items-start gap-4 mb-6">
                <div className={payConfirm.current === "Payé" ? "modal-icon-holo-amber" : "modal-icon-holo-green"}>
                  {payConfirm.current === "Payé" ? (
                    <Clock size={22} className="text-amber-400" />
                  ) : (
                    <CheckCircle2 size={22} className="text-emerald-400" />
                  )}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                </div>
                <div className="flex-1">
                  <h3 className="modal-title-holo mb-2">Confirmation requise</h3>
                  <p className="modal-description-holo">
                    {payConfirm.current === "Payé"
                      ? `Retirer le statut "Payé" pour ${payConfirm.name} ?`
                      : `Confirmer le paiement du salaire de ${payConfirm.name} ?`}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setPayConfirm(null)} type="button" className="modal-btn-secondary-holo">
                  <X size={15} />
                  <span>Annuler</span>
                </button>
                <button
                  onClick={confirmPayment}
                  type="button"
                  className={payConfirm.current === "Payé" ? "modal-btn-amber-holo" : "modal-btn-green-holo"}
                >
                  {payConfirm.current === "Payé" ? <Clock size={15} /> : <CheckCircle2 size={15} />}
                  <span>Confirmer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL FICHE EMPLOYÉ HOLOGRAPHIQUE ═══ */}
      {selectedEmployee && (
        <div className="modal-overlay-holo animate-fadeIn" onClick={() => setSelectedEmployee(null)}>
          <div className="modal-container-xl-holo animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-emerald-500/5 to-violet-500/10 rounded-3xl blur-2xl" />
            
            <div className="relative max-h-[85vh] overflow-y-auto custom-scroll">
              {/* Header */}
              <div className="flex items-start justify-between mb-6 pb-6 border-b border-cyan-500/20">
                <div className="flex items-start gap-5">
                  <div className="relative group">
                    {renderAvatar(selectedEmployee, "lg")}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handlePhotoUpload(selectedEmployee.id, e.target.files[0]);
                      }}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      type="button"
                      className="photo-btn-holo"
                      title="Changer la photo"
                    >
                      {uploadingPhoto ? (
                        <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent animate-spin rounded-full" />
                      ) : (
                        <Camera size={14} />
                      )}
                    </button>
                  </div>
                  <div>
                    <h3 className="employee-profile-name-holo mb-2">{selectedEmployee.name}</h3>
                    <p className="employee-profile-role-holo mb-3">
                      {selectedEmployee.post} • {selectedEmployee.dept}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className={`status-badge-holo ${getStatusColor(selectedEmployee.status)}`}>
                        <span className="status-dot-holo" />
                        {selectedEmployee.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePayment(selectedEmployee.id, selectedEmployee.name, selectedEmployee.paymentStatus)}
                        className={selectedEmployee.paymentStatus === "Payé" ? "payment-badge-paid-holo-clickable" : "payment-badge-pending-holo-clickable"}
                      >
                        {selectedEmployee.paymentStatus === "Payé" ? (
                          <CheckCircle2 size={11} />
                        ) : (
                          <Clock size={11} />
                        )}
                        {selectedEmployee.paymentStatus}
                      </button>
                      <span className="contract-badge-holo">
                        <Briefcase size={10} />
                        {selectedEmployee.contract}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedEmployee(null)} type="button" className="cyber-btn">
                  <X size={16} />
                </button>
              </div>

              {/* Info Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Identification */}
                <div className="info-card-holo">
                  <div className="info-header-holo mb-4">
                    <div className="info-icon-holo">
                      <Fingerprint size={16} className="text-cyan-400" />
                    </div>
                    <h4 className="info-title-holo">Identification</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="info-row-holo">
                      <span className="info-label-holo">ID Personnel</span>
                      <span className="info-value-holo">{selectedEmployee.id}</span>
                    </div>
                    <div className="info-row-holo">
                      <span className="info-label-holo">Date d'entrée</span>
                      <span className="info-value-holo">{selectedEmployee.joinDate || "—"}</span>
                    </div>
                    {selectedEmployee.age && (
                      <div className="info-row-holo">
                        <span className="info-label-holo">Âge</span>
                        <span className="info-value-holo">{selectedEmployee.age} ans</span>
                      </div>
                    )}
                    {selectedEmployee.genre && (
                      <div className="info-row-holo">
                        <span className="info-label-holo">Genre</span>
                        <span className="info-value-holo">{selectedEmployee.genre}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact */}
                <div className="info-card-holo">
                  <div className="info-header-holo mb-4">
                    <div className="info-icon-holo">
                      <Mail size={16} className="text-emerald-400" />
                    </div>
                    <h4 className="info-title-holo">Contact</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="info-row-holo">
                      <span className="info-label-holo">Email</span>
                      <span className="info-value-holo text-right break-all">{selectedEmployee.email || "—"}</span>
                    </div>
                    <div className="info-row-holo">
                      <span className="info-label-holo">Nationalité</span>
                      <span className="info-value-holo">{selectedEmployee.nation}</span>
                    </div>
                    {selectedEmployee.pco && (
                      <div className="info-row-holo">
                        <span className="info-label-holo">Contact d'urgence</span>
                        <span className="info-value-holo text-right">{selectedEmployee.pco}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rémunération */}
                <div className="info-card-holo-premium">
                  <div className="info-header-holo mb-4">
                    <div className="info-icon-holo-premium">
                      <Wallet size={16} className="text-emerald-400" />
                    </div>
                    <h4 className="info-title-holo">Rémunération</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="info-row-holo">
                      <span className="info-label-holo">Salaire mensuel</span>
                      <span className="salary-holo">
                        {selectedEmployee.salary.toLocaleString()} <span className="text-[10px] text-cyan-400">FCFA</span>
                      </span>
                    </div>
                    {selectedEmployee.prime > 0 && (
                      <>
                        <div className="info-row-holo">
                          <span className="info-label-holo">Prime</span>
                          <span className="prime-holo">
                            {selectedEmployee.prime.toLocaleString()} <span className="text-[10px]">FCFA</span>
                          </span>
                        </div>
                        {selectedEmployee.primeLabel && (
                          <div className="info-row-holo">
                            <span className="info-label-holo">Type de prime</span>
                            <span className="info-value-holo text-emerald-400">{selectedEmployee.primeLabel}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="pt-3 border-t border-cyan-500/20">
                      <div className="info-row-holo">
                        <span className="info-label-holo font-bold text-cyan-300">Total mensuel</span>
                        <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 tabular-nums">
                          {(selectedEmployee.salary + selectedEmployee.prime).toLocaleString()}{" "}
                          <span className="text-[11px]">FCFA</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance */}
                <div className="info-card-holo">
                  <div className="info-header-holo mb-4">
                    <div className="info-icon-holo">
                      <Award size={16} className="text-violet-400" />
                    </div>
                    <h4 className="info-title-holo">Poste & Performance</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="info-row-holo">
                      <span className="info-label-holo">Département</span>
                      <span className="info-value-holo">{selectedEmployee.dept}</span>
                    </div>
                    <div className="info-row-holo">
                      <span className="info-label-holo">Fonction</span>
                      <span className="info-value-holo">{selectedEmployee.post}</span>
                    </div>
                    <div className="info-row-holo">
                      <span className="info-label-holo">Type de contrat</span>
                      <span className="info-value-holo">{selectedEmployee.contract}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex gap-3 pt-4 border-t border-cyan-500/20">
                <button onClick={() => setSelectedEmployee(null)} type="button" className="modal-btn-secondary-holo flex-1">
                  <ArrowLeft size={15} />
                  <span>Retour</span>
                </button>
                <button
                  onClick={() => togglePayment(selectedEmployee.id, selectedEmployee.name, selectedEmployee.paymentStatus)}
                  type="button"
                  className={selectedEmployee.paymentStatus === "Payé" ? "modal-btn-amber-holo flex-1" : "modal-btn-green-holo flex-1"}
                >
                  {selectedEmployee.paymentStatus === "Payé" ? <Clock size={15} /> : <CheckCircle2 size={15} />}
                  <span>
                    {selectedEmployee.paymentStatus === "Payé" ? "Marquer en attente" : "Confirmer paiement"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ STYLES HOLOGRAPHIQUES ULTRA FUTURISTES ═══ */}
      <style jsx>{`
        /* ════════════════════════════════════════════════════
           ANIMATIONS CUSTOM
        ════════════════════════════════════════════════════ */
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(20px) translateX(-10px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        .animate-slideDown { animation: slideDown 0.4s ease-out; }

        /* ════════════════════════════════════════════════════
           SCROLLBAR HOLOGRAPHIQUE
        ════════════════════════════════════════════════════ */
        .custom-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(6, 182, 212, 0.5), rgba(16, 185, 129, 0.5));
          border-radius: 10px;
          border: 2px solid rgba(0, 0, 0, 0.3);
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(6, 182, 212, 0.8), rgba(16, 185, 129, 0.8));
        }

        /* ════════════════════════════════════════════════════
           CONTAINER HOLOGRAPHIQUE
        ════════════════════════════════════════════════════ */
        .holo-container {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%);
          border: 1px solid transparent;
          border-image: linear-gradient(135deg, rgba(6, 182, 212, 0.5), rgba(16, 185, 129, 0.3), rgba(139, 92, 246, 0.3)) 1;
          border-radius: 2rem;
          box-shadow: 
            0 0 0 1px rgba(6, 182, 212, 0.1),
            0 0 40px rgba(6, 182, 212, 0.2),
            0 40px 100px rgba(0, 0, 0, 0.7),
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            inset 0 0 100px rgba(6, 182, 212, 0.03);
          backdrop-filter: blur(30px);
          overflow: hidden;
          position: relative;
        }
        .holo-container::before {
          content: "";
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.3), transparent, rgba(16, 185, 129, 0.2));
          border-radius: 2rem;
          z-index: -1;
          opacity: 0.5;
          filter: blur(10px);
        }

        /* ════════════════════════════════════════════════════
           BOUTONS CYBER
        ════════════════════════════════════════════════════ */
        .cyber-btn {
          padding: 0.625rem;
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.75rem;
          color: rgba(6, 182, 212, 0.9);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .cyber-btn::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(6, 182, 212, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.5s, height 0.5s;
        }
        .cyber-btn:hover::before {
          width: 200%;
          height: 200%;
        }
        .cyber-btn:hover {
          background: rgba(6, 182, 212, 0.2);
          border-color: rgba(6, 182, 212, 0.6);
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
          transform: translateY(-2px);
        }

        .cyber-btn-alt {
          padding: 0.625rem 1.125rem;
          background: rgba(6, 182, 212, 0.08);
          border: 1px solid rgba(6, 182, 212, 0.25);
          border-radius: 0.75rem;
          color: rgba(6, 182, 212, 0.95);
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .cyber-btn-alt:hover {
          background: rgba(6, 182, 212, 0.15);
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.25);
          transform: translateY(-2px);
        }

        .cyber-btn-active {
          padding: 0.625rem 1.125rem;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(16, 185, 129, 0.2));
          border: 1px solid rgba(6, 182, 212, 0.5);
          border-radius: 0.75rem;
          color: rgb(6, 182, 212);
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 0 25px rgba(6, 182, 212, 0.3), inset 0 0 20px rgba(6, 182, 212, 0.1);
        }

        .neon-btn {
          padding: 0.625rem 1.25rem;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.9), rgba(16, 185, 129, 0.8));
          border: 1px solid rgba(6, 182, 212, 0.8);
          border-radius: 0.75rem;
          color: rgb(15, 23, 42);
          font-size: 0.75rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 
            0 0 30px rgba(6, 182, 212, 0.5),
            0 0 60px rgba(6, 182, 212, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .neon-btn:hover {
          background: linear-gradient(135deg, rgba(6, 182, 212, 1), rgba(16, 185, 129, 0.95));
          box-shadow: 
            0 0 40px rgba(6, 182, 212, 0.7),
            0 0 80px rgba(6, 182, 212, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
          transform: translateY(-3px);
        }

        /* ════════════════════════════════════════════════════
           INPUTS & SELECTS CYBER HOLOGRAPHIQUES
        ════════════════════════════════════════════════════ */
        .cyber-input {
          width: 100%;
          padding: 0.875rem 1rem;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.75rem;
          color: rgba(6, 182, 212, 0.95);
          font-size: 0.75rem;
          transition: all 0.3s ease;
        }
        .cyber-input:focus {
          outline: none;
          background: rgba(0, 0, 0, 0.5);
          border-color: rgba(6, 182, 212, 0.6);
          box-shadow: 
            0 0 0 3px rgba(6, 182, 212, 0.15),
            0 0 20px rgba(6, 182, 212, 0.2),
            inset 0 0 20px rgba(6, 182, 212, 0.05);
        }
        .cyber-input::placeholder {
          color: rgba(6, 182, 212, 0.4);
        }

        .cyber-select-button {
          width: 100%;
          padding: 0.875rem 1rem;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.4));
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.75rem;
          color: rgba(6, 182, 212, 0.95);
          font-size: 0.75rem;
          transition: all 0.3s ease;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }
        .cyber-select-button:hover {
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1), 0 0 20px rgba(6, 182, 212, 0.15);
          background-color: rgba(0, 0, 0, 0.6);
        }

        .cyber-select-active {
          width: 100%;
          padding: 0.875rem 1rem;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.15));
          border: 1px solid rgba(6, 182, 212, 0.5);
          border-radius: 0.75rem;
          color: rgb(6, 182, 212);
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.625rem;
          box-shadow: 0 0 25px rgba(6, 182, 212, 0.25);
        }

        .dropdown-holo-filter {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          right: 0;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.95));
          border: 1px solid rgba(6, 182, 212, 0.4);
          border-radius: 1rem;
          padding: 0.5rem;
          box-shadow: 
            0 0 40px rgba(6, 182, 212, 0.3),
            0 20px 60px rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(20px);
          z-index: 50;
          max-height: 20rem;
          overflow-y: auto;
        }

        .dropdown-filter-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 0.625rem;
          font-size: 0.6875rem;
          font-weight: 600;
          transition: all 0.2s ease;
          color: rgba(6, 182, 212, 0.8);
        }
        .dropdown-filter-item:hover {
          background: rgba(6, 182, 212, 0.1);
          color: rgba(6, 182, 212, 1);
        }

        .dropdown-filter-item-active {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 0.625rem;
          font-size: 0.6875rem;
          font-weight: 700;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.15));
          color: rgb(6, 182, 212);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
        }

        /* ════════════════════════════════════════════════════
           FILTRES LIVRE DE PAIE
        ════════════════════════════════════════════════════ */
        .filter-btn {
          padding: 0.5rem 1rem;
          background: rgba(6, 182, 212, 0.08);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.625rem;
          color: rgba(6, 182, 212, 0.8);
          font-size: 0.6875rem;
          font-weight: 600;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .filter-btn:hover {
          background: rgba(6, 182, 212, 0.15);
          border-color: rgba(6, 182, 212, 0.4);
          color: rgba(6, 182, 212, 1);
        }

        .filter-btn-active {
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(16, 185, 129, 0.2));
          border: 1px solid rgba(6, 182, 212, 0.5);
          border-radius: 0.625rem;
          color: rgb(6, 182, 212);
          font-size: 0.6875rem;
          font-weight: 700;
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.25);
        }

        /* ════════════════════════════════════════════════════
           KPI CARDS HOLOGRAPHIQUES
        ════════════════════════════════════════════════════ */
        .holo-card {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.6));
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 1.25rem;
          padding: 1.25rem;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }
        .holo-card::before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(6, 182, 212, 0.1) 50%,
            transparent 70%
          );
          transform: rotate(45deg);
          transition: all 0.6s ease;
        }
        .holo-card:hover::before {
          left: 100%;
        }
        .holo-card:hover {
          border-color: rgba(6, 182, 212, 0.4);
          box-shadow: 
            0 0 30px rgba(6, 182, 212, 0.2),
            inset 0 0 30px rgba(6, 182, 212, 0.05);
          transform: translateY(-4px);
        }

        .holo-card-premium {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(16, 185, 129, 0.1));
          border: 1px solid rgba(6, 182, 212, 0.4);
          border-radius: 1.25rem;
          padding: 1.25rem;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 30px rgba(6, 182, 212, 0.15);
        }
        .holo-card-premium:hover {
          border-color: rgba(6, 182, 212, 0.6);
          box-shadow: 
            0 0 40px rgba(6, 182, 212, 0.3),
            inset 0 0 30px rgba(6, 182, 212, 0.1);
          transform: translateY(-4px);
        }

        .holo-icon {
          width: 2.75rem;
          height: 2.75rem;
          border-radius: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid;
          position: relative;
          overflow: hidden;
        }
        .holo-icon::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
          border-radius: 0.875rem;
        }

        .holo-icon-premium {
          width: 2.75rem;
          height: 2.75rem;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(16, 185, 129, 0.25));
          border: 1px solid rgba(6, 182, 212, 0.5);
          border-radius: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
        }

        .holo-label {
          font-size: 0.625rem;
          color: rgba(6, 182, 212, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 700;
          margin-bottom: 0.375rem;
        }

        .holo-value {
          font-size: 1.375rem;
          font-weight: 900;
          color: #fff;
          text-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
        }

        .holo-value-premium {
          font-size: 1.5rem;
          font-weight: 900;
          background: linear-gradient(135deg, rgb(6, 182, 212), rgb(16, 185, 129));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 20px rgba(6, 182, 212, 0.5));
        }

        /* ════════════════════════════════════════════════════
           PAYROLL SECTION
        ════════════════════════════════════════════════════ */
        .payroll-holo {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.5));
          border: 1px solid rgba(6, 182, 212, 0.25);
          border-radius: 1.5rem;
          padding: 1.75rem;
          position: relative;
          overflow: hidden;
        }
        .payroll-holo::before {
          content: "";
          position: absolute;
          inset: -2px;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), transparent, rgba(16, 185, 129, 0.15));
          border-radius: 1.5rem;
          z-index: -1;
          opacity: 0.5;
          filter: blur(10px);
        }

        .stat-chip {
          padding: 0.75rem 1.125rem;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(6, 182, 212, 0.25);
          border-radius: 0.75rem;
        }
        .stat-chip-premium {
          padding: 0.75rem 1.125rem;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.1));
          border: 1px solid rgba(16, 185, 129, 0.4);
          border-radius: 0.75rem;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
        }

        .stat-label {
          font-size: 0.625rem;
          text-transform: uppercase;
          font-weight: 700;
          color: rgba(6, 182, 212, 0.7);
          margin-bottom: 0.25rem;
          letter-spacing: 0.05em;
        }
        .stat-value {
          font-size: 0.875rem;
          font-weight: 800;
          color: #fff;
        }

        .dept-holo {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.6));
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 1rem;
          padding: 1.125rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .dept-holo:hover {
          border-color: rgba(6, 182, 212, 0.4);
          box-shadow: 0 0 25px rgba(6, 182, 212, 0.2);
          transform: translateY(-3px);
        }

        /* ════════════════════════════════════════════════════
           TABLE HOLOGRAPHIQUE
        ════════════════════════════════════════════════════ */
        .table-holo {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.5));
          border: 1px solid rgba(6, 182, 212, 0.25);
          border-radius: 1.5rem;
          overflow: hidden;
          position: relative;
        }
        .table-holo::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top left, rgba(6, 182, 212, 0.05), transparent 50%);
          pointer-events: none;
        }

        .table-header-holo {
          padding: 1rem 1.25rem;
          font-size: 0.625rem;
          font-weight: 800;
          color: rgba(6, 182, 212, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(16, 185, 129, 0.05));
        }

        .table-row-holo {
          transition: all 0.2s ease;
          position: relative;
        }
        .table-row-holo::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 0;
          background: linear-gradient(90deg, rgba(6, 182, 212, 0.1), transparent);
          transition: width 0.3s ease;
        }
        .table-row-holo:hover::before {
          width: 100%;
        }
        .table-row-holo:hover {
          background: rgba(6, 182, 212, 0.05);
        }

        .table-cell-holo {
          padding: 1.125rem 1.25rem;
        }

        .employee-name-holo {
          font-size: 0.8125rem;
          font-weight: 700;
          color: rgba(6, 182, 212, 0.95);
          transition: all 0.2s ease;
          text-align: left;
        }
        .employee-name-holo:hover {
          color: rgb(6, 182, 212);
          text-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
        }

        .employee-id-holo {
          font-size: 0.625rem;
          color: rgba(6, 182, 212, 0.5);
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin-top: 0.25rem;
          font-family: 'Courier New', monospace;
        }

        .contract-badge-holo {
          padding: 0.4375rem 0.75rem;
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.25);
          border-radius: 0.5rem;
          font-size: 0.625rem;
          font-weight: 700;
          color: rgba(6, 182, 212, 0.9);
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          text-transform: uppercase;
        }

        .salary-holo {
          font-size: 0.8125rem;
          font-weight: 800;
          color: #fff;
          font-family: 'Courier New', monospace;
        }

        .prime-holo {
          font-size: 0.75rem;
          font-weight: 800;
          color: rgb(16, 185, 129);
          font-family: 'Courier New', monospace;
        }
        .prime-label-holo {
          font-size: 0.5625rem;
          color: rgba(16, 185, 129, 0.6);
          margin-top: 0.125rem;
        }

        .status-badge-holo {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4375rem 0.875rem;
          border-radius: 0.625rem;
          border: 1px solid;
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .status-dot-holo {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          background: currentColor;
        }
        .status-active {
          background: rgba(16, 185, 129, 0.15);
          color: rgb(16, 185, 129);
          border-color: rgba(16, 185, 129, 0.4);
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
        }
        .status-active .status-dot-holo {
          animation: pulse 2s ease-in-out infinite;
        }
        .status-conge {
          background: rgba(245, 158, 11, 0.15);
          color: rgb(245, 158, 11);
          border-color: rgba(245, 158, 11, 0.4);
        }
        .status-pause {
          background: rgba(148, 163, 184, 0.15);
          color: rgb(148, 163, 184);
          border-color: rgba(148, 163, 184, 0.4);
        }
        .status-sortie {
          background: rgba(239, 68, 68, 0.15);
          color: rgb(239, 68, 68);
          border-color: rgba(239, 68, 68, 0.4);
        }

        .payment-badge-paid-holo {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.875rem;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.15));
          border: 1px solid rgba(139, 92, 246, 0.4);
          border-radius: 0.625rem;
          color: rgb(139, 92, 246);
          font-size: 0.625rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
        }
        .payment-badge-paid-holo:hover {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.25));
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
          transform: scale(1.05);
        }

        .payment-badge-pending-holo {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.875rem;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.15));
          border: 1px solid rgba(245, 158, 11, 0.4);
          border-radius: 0.625rem;
          color: rgb(245, 158, 11);
          font-size: 0.625rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
        }
        .payment-badge-pending-holo:hover {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(245, 158, 11, 0.25));
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
          transform: scale(1.05);
        }

        .payment-badge-paid-holo-clickable {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.875rem;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.15));
          border: 1px solid rgba(139, 92, 246, 0.4);
          border-radius: 0.625rem;
          color: rgb(139, 92, 246);
          font-size: 0.625rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
        }
        .payment-badge-paid-holo-clickable:hover {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.35), rgba(139, 92, 246, 0.3));
          box-shadow: 0 0 25px rgba(139, 92, 246, 0.4);
          transform: scale(1.05);
        }

        .payment-badge-pending-holo-clickable {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.875rem;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.15));
          border: 1px solid rgba(245, 158, 11, 0.4);
          border-radius: 0.625rem;
          color: rgb(245, 158, 11);
          font-size: 0.625rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
        }
        .payment-badge-pending-holo-clickable:hover {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.35), rgba(245, 158, 11, 0.3));
          box-shadow: 0 0 25px rgba(245, 158, 11, 0.4);
          transform: scale(1.05);
        }

        .action-btn-holo {
          padding: 0.5rem;
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.25);
          border-radius: 0.625rem;
          color: rgba(6, 182, 212, 0.9);
          transition: all 0.2s ease;
        }
        .action-btn-holo:hover {
          background: rgba(6, 182, 212, 0.2);
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.3);
        }

        .action-btn-holo-active {
          padding: 0.5rem;
          background: rgba(6, 182, 212, 0.25);
          border: 1px solid rgba(6, 182, 212, 0.5);
          border-radius: 0.625rem;
          color: rgb(6, 182, 212);
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
        }

        .dropdown-holo {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 0.5rem;
          width: 12rem;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.95));
          border: 1px solid rgba(6, 182, 212, 0.4);
          border-radius: 1rem;
          padding: 0.5rem;
          box-shadow: 
            0 0 40px rgba(6, 182, 212, 0.3),
            0 20px 60px rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(20px);
          z-index: 50;
        }

        .dropdown-item-holo {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 0.625rem;
          font-size: 0.6875rem;
          font-weight: 700;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .dropdown-item-holo:hover {
          background: rgba(6, 182, 212, 0.1);
        }

        /* ════════════════════════════════════════════════════
           PAGINATION
        ════════════════════════════════════════════════════ */
        .pagination-holo {
          padding: 1.25rem 1.5rem;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.05), rgba(16, 185, 129, 0.03));
          border-top: 1px solid rgba(6, 182, 212, 0.2);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        @media (min-width: 640px) {
          .pagination-holo {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .pagination-info-holo {
          font-size: 0.6875rem;
          color: rgba(6, 182, 212, 0.8);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .pagination-btn-holo {
          padding: 0.625rem;
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.25);
          border-radius: 0.625rem;
          color: rgba(6, 182, 212, 0.9);
          transition: all 0.2s ease;
        }
        .pagination-btn-holo:hover:not(:disabled) {
          background: rgba(6, 182, 212, 0.2);
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.3);
        }
        .pagination-btn-holo:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .pagination-number-holo {
          min-width: 2.25rem;
          height: 2.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(6, 182, 212, 0.08);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 0.625rem;
          color: rgba(6, 182, 212, 0.9);
          font-size: 0.6875rem;
          font-weight: 700;
          transition: all 0.2s ease;
        }
        .pagination-number-holo:hover {
          background: rgba(6, 182, 212, 0.15);
          border-color: rgba(6, 182, 212, 0.4);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
        }

        .pagination-number-holo-active {
          min-width: 2.25rem;
          height: 2.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(16, 185, 129, 0.25));
          border: 1px solid rgba(6, 182, 212, 0.6);
          border-radius: 0.625rem;
          color: rgb(6, 182, 212);
          font-size: 0.6875rem;
          font-weight: 900;
          box-shadow: 0 0 25px rgba(6, 182, 212, 0.4);
        }

        /* ════════════════════════════════════════════════════
           MODALS HOLOGRAPHIQUES
        ════════════════════════════════════════════════════ */
        .modal-overlay-holo {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px);
        }

        .modal-container-holo {
          width: 100%;
          max-width: 32rem;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.95));
          border: 1px solid rgba(6, 182, 212, 0.4);
          border-radius: 1.5rem;
          padding: 2rem;
          box-shadow: 
            0 0 60px rgba(6, 182, 212, 0.3),
            0 30px 80px rgba(0, 0, 0, 0.8);
          position: relative;
        }

        .modal-container-xl-holo {
          width: 100%;
          max-width: 70rem;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.95));
          border: 1px solid rgba(6, 182, 212, 0.4);
          border-radius: 1.5rem;
          padding: 2rem;
          box-shadow: 
            0 0 60px rgba(6, 182, 212, 0.3),
            0 30px 80px rgba(0, 0, 0, 0.8);
          position: relative;
        }

        .modal-icon-holo-green {
          width: 3rem;
          height: 3rem;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(16, 185, 129, 0.15));
          border: 1px solid rgba(16, 185, 129, 0.5);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
          position: relative;
        }

        .modal-icon-holo-amber {
          width: 3rem;
          height: 3rem;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(245, 158, 11, 0.15));
          border: 1px solid rgba(245, 158, 11, 0.5);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 30px rgba(245, 158, 11, 0.3);
          position: relative;
        }

        .modal-title-holo {
          font-size: 1.125rem;
          font-weight: 800;
          color: #fff;
          text-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
        }

        .modal-description-holo {
          font-size: 0.8125rem;
          color: rgba(6, 182, 212, 0.8);
          line-height: 1.6;
        }

        .modal-btn-secondary-holo {
          flex: 1;
          padding: 0.875rem 1.25rem;
          background: rgba(6, 182, 212, 0.08);
          border: 1px solid rgba(6, 182, 212, 0.25);
          border-radius: 0.875rem;
          color: rgba(6, 182, 212, 0.95);
          font-size: 0.75rem;
          font-weight: 700;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          text-transform: uppercase;
        }
        .modal-btn-secondary-holo:hover {
          background: rgba(6, 182, 212, 0.15);
          border-color: rgba(6, 182, 212, 0.4);
        }

        .modal-btn-green-holo {
          flex: 1;
          padding: 0.875rem 1.25rem;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(16, 185, 129, 0.8));
          border: 1px solid rgba(16, 185, 129, 1);
          border-radius: 0.875rem;
          color: rgb(15, 23, 42);
          font-size: 0.75rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.5);
          text-transform: uppercase;
        }
        .modal-btn-green-holo:hover {
          background: linear-gradient(135deg, rgba(16, 185, 129, 1), rgba(16, 185, 129, 0.95));
          box-shadow: 0 0 40px rgba(16, 185, 129, 0.7);
          transform: translateY(-2px);
        }

        .modal-btn-amber-holo {
          flex: 1;
          padding: 0.875rem 1.25rem;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(245, 158, 11, 0.8));
          border: 1px solid rgba(245, 158, 11, 1);
          border-radius: 0.875rem;
          color: rgb(15, 23, 42);
          font-size: 0.75rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
          box-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
          text-transform: uppercase;
        }
        .modal-btn-amber-holo:hover {
          background: linear-gradient(135deg, rgba(245, 158, 11, 1), rgba(245, 158, 11, 0.95));
          box-shadow: 0 0 40px rgba(245, 158, 11, 0.7);
          transform: translateY(-2px);
        }

        .employee-profile-name-holo {
          font-size: 1.5rem;
          font-weight: 900;
          color: #fff;
          text-shadow: 0 0 30px rgba(6, 182, 212, 0.4);
        }

        .employee-profile-role-holo {
          font-size: 0.8125rem;
          color: rgba(6, 182, 212, 0.7);
          font-weight: 600;
        }

        .photo-btn-holo {
          position: absolute;
          bottom: -0.375rem;
          right: -0.375rem;
          width: 2.125rem;
          height: 2.125rem;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.95), rgba(16, 185, 129, 0.9));
          border: 2px solid rgba(15, 23, 42, 0.8);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgb(15, 23, 42);
          transition: all 0.3s ease;
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
          cursor: pointer;
        }
        .photo-btn-holo:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(6, 182, 212, 1), rgba(16, 185, 129, 1));
          box-shadow: 0 0 30px rgba(6, 182, 212, 0.7);
          transform: scale(1.1);
        }
        .photo-btn-holo:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .info-card-holo {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.4));
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 1.125rem;
          padding: 1.375rem;
          transition: all 0.3s ease;
        }
        .info-card-holo:hover {
          border-color: rgba(6, 182, 212, 0.4);
          box-shadow: 0 0 25px rgba(6, 182, 212, 0.15);
        }

        .info-card-holo-premium {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(16, 185, 129, 0.08));
          border: 1px solid rgba(6, 182, 212, 0.35);
          border-radius: 1.125rem;
          padding: 1.375rem;
          box-shadow: 0 0 25px rgba(6, 182, 212, 0.2);
          transition: all 0.3s ease;
        }
        .info-card-holo-premium:hover {
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 35px rgba(6, 182, 212, 0.3);
        }

        .info-header-holo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .info-icon-holo {
          width: 2.25rem;
          height: 2.25rem;
          background: rgba(6, 182, 212, 0.15);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .info-icon-holo-premium {
          width: 2.25rem;
          height: 2.25rem;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.2));
          border: 1px solid rgba(16, 185, 129, 0.4);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
        }

        .info-title-holo {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(6, 182, 212, 0.9);
        }

        .info-row-holo {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .info-label-holo {
          font-size: 0.6875rem;
          color: rgba(6, 182, 212, 0.6);
          font-weight: 600;
        }

        .info-value-holo {
          font-size: 0.8125rem;
          font-weight: 700;
          color: #fff;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .holo-container {
            border-radius: 1.5rem;
          }
          
          .table-header-holo,
          .table-cell-holo {
            padding: 0.75rem 0.875rem;
          }
        }
      `}</style>
    </div>
  );
}
