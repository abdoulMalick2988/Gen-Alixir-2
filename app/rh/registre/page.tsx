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
  Zap, Activity, Shield, Filter, ChevronDown, Check
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
  const deptDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

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
  const [showDeptDropdown, setShowDeptDropdown] = useState<boolean>(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState<boolean>(false);
  const itemsPerPage = 10;

  // Fermer les menus au clic extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(e.target as Node)) {
        setShowDeptDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setShowStatusDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Charger les données depuis Supabase
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
        console.error("Erreur chargement:", err);
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
    const colors = [
      "from-cyan-600 to-cyan-700",
      "from-emerald-600 to-emerald-700",
      "from-teal-600 to-teal-700",
      "from-blue-600 to-blue-700",
      "from-violet-600 to-violet-700",
      "from-amber-600 to-amber-700"
    ];
    return "bg-gradient-to-br " + colors[n.charCodeAt(0) % 6];
  }

  // Upload photo avec mise à jour Supabase
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
      total: t,
      actifs: a,
      conges: c,
      masseSalariale: ms,
      totalPrimes: tp,
      totalPaid: pa.reduce((s, e) => s + e.salary + e.prime, 0),
      totalPending: pe.reduce((s, e) => s + e.salary + e.prime, 0),
      paidCount: pa.length,
      pendingCount: pe.length,
      depts: ds,
      payrollByDept: pbd
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

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeDept, activeStatus]);

  // Mise à jour statut avec Supabase
  const updateStatus = useCallback(async (id: string, ns: EmployeeStatus) => {
    const rid = id.replace("WKD-", "");
    const statusDb = ns === "Actif" ? "En ligne" : ns;
    try {
      const { error: e1 } = await supabase.from("staff").update({ status: statusDb }).eq("id_key", rid);
      if (e1) await supabase.from("staff").update({ status: statusDb }).eq("id", rid);
      setEmployees((p) => p.map((e) => (e.id === id ? { ...e, status: ns } : e)));
      if (selectedEmployee?.id === id) setSelectedEmployee((p) => p ? { ...p, status: ns } : null);
      setActiveMenu(null);
    } catch (err) {
      console.error("Erreur mise à jour statut:", err);
    }
  }, [selectedEmployee]);

  // Suppression employé avec Supabase
  const terminateContract = useCallback(async (id: string) => {
    if (typeof window !== "undefined" && window.confirm("Confirmer la fin de contrat ?")) {
      const rid = id.replace("WKD-", "");
      try {
        const { error: e1 } = await supabase.from("staff").delete().eq("id_key", rid);
        if (e1) await supabase.from("staff").delete().eq("id", rid);
        setEmployees((p) => p.filter((e) => e.id !== id));
        setActiveMenu(null);
      } catch (err) {
        console.error("Erreur suppression:", err);
      }
    }
  }, []);

  const togglePayment = useCallback((id: string, name: string, cur: PaymentStatus) => {
    setPayConfirm({ id, name, current: cur });
  }, []);

  // Confirmation paiement avec Supabase
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
      console.error("Erreur mise à jour paiement:", err);
    }
  }, [payConfirm, selectedEmployee]);

  const handleExport = useCallback(() => {
    setIsExporting(true);
    const h = ["ID", "Nom", "Dept", "Poste", "Contrat", "Salaire", "Prime", "Statut", "Paie", "Email", "Entrée"];
    const r = filteredData.map((e) => [
      e.id,
      e.name,
      e.dept,
      e.post,
      e.contract,
      String(e.salary),
      String(e.prime),
      e.status,
      e.paymentStatus,
      e.email,
      e.joinDate
    ]);
    const b = new Blob([[h, ...r].map((x) => x.join(",")).join("\n")], {
      type: "text/csv;charset=utf-8;"
    });
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
    const d = size === "lg" ? "w-20 h-20 text-xl rounded-2xl" : "w-12 h-12 text-sm rounded-xl";
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
      <div
        className={
          d +
          " " +
          getInitialBg(emp.name) +
          " flex items-center justify-center font-bold text-white flex-shrink-0 border-2 border-white/20 shadow-lg"
        }
      >
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
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>
        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin" />
            <div
              className="absolute inset-2 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-cyan-400 tracking-widest uppercase mb-1">Initialisation</p>
            <p className="text-xs text-cyan-600">Chargement du registre...</p>
          </div>
        </div>
      </div>
    );
  }

  /* ═══ PARTIE 2 — Coller après Partie 1 ═══ */

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
                    <span>Nouveau Contrat</span>
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

              {/* ── LIVRE DE PAIE AVEC FILTRES ── */}
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

                  {/* Filtres livre de paie */}
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

              {/* ── BARRE DE RECHERCHE + DROPDOWNS HOLOGRAPHIQUES ── */}
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

                {/* Dropdown Département Holographique */}
                <div className="relative min-w-[200px]" ref={deptDropdownRef}>
                  <button
                    onClick={() => setShowDeptDropdown(!showDeptDropdown)}
                    type="button"
                    className="custom-select-holo w-full"
                  >
                    <Building2 size={14} className="text-cyan-400" />
                    <span className="flex-1 text-left truncate">{activeDept}</span>
                    <ChevronDown size={16} className={`text-cyan-500 transition-transform ${showDeptDropdown ? "rotate-180" : ""}`} />
                  </button>
                  {showDeptDropdown && (
                    <div className="custom-dropdown-holo">
                      <button
                        onClick={() => {
                          setActiveDept("Tous");
                          setShowDeptDropdown(false);
                        }}
                        className={activeDept === "Tous" ? "dropdown-option-holo-active" : "dropdown-option-holo"}
                      >
                        <Building2 size={13} />
                        <span className="flex-1 text-left">Tous les départements</span>
                        {activeDept === "Tous" && <Check size={14} className="text-cyan-400" />}
                      </button>
                      {stats.depts.map((d: string) => (
                        <button
                          key={d}
                          onClick={() => {
                            setActiveDept(d);
                            setShowDeptDropdown(false);
                          }}
                          className={activeDept === d ? "dropdown-option-holo-active" : "dropdown-option-holo"}
                        >
                          <Building2 size={13} />
                          <span className="flex-1 text-left">{d}</span>
                          {activeDept === d && <Check size={14} className="text-cyan-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dropdown Statut Holographique */}
                <div className="relative min-w-[160px]" ref={statusDropdownRef}>
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    type="button"
                    className="custom-select-holo w-full"
                  >
                    <Activity size={14} className="text-cyan-400" />
                    <span className="flex-1 text-left truncate">{activeStatus}</span>
                    <ChevronDown size={16} className={`text-cyan-500 transition-transform ${showStatusDropdown ? "rotate-180" : ""}`} />
                  </button>
                  {showStatusDropdown && (
                    <div className="custom-dropdown-holo">
                      <button
                        onClick={() => {
                          setActiveStatus("Tous");
                          setShowStatusDropdown(false);
                        }}
                        className={activeStatus === "Tous" ? "dropdown-option-holo-active" : "dropdown-option-holo"}
                      >
                        <Activity size={13} />
                        <span className="flex-1 text-left">Tous les statuts</span>
                        {activeStatus === "Tous" && <Check size={14} className="text-cyan-400" />}
                      </button>
                      <button
                        onClick={() => {
                          setActiveStatus("Actif");
                          setShowStatusDropdown(false);
                        }}
                        className={activeStatus === "Actif" ? "dropdown-option-holo-active" : "dropdown-option-holo"}
                      >
                        <CheckCircle2 size={13} className="text-emerald-400" />
                        <span className="flex-1 text-left">Actif</span>
                        {activeStatus === "Actif" && <Check size={14} className="text-cyan-400" />}
                      </button>
                      <button
                        onClick={() => {
                          setActiveStatus("Congé");
                          setShowStatusDropdown(false);
                        }}
                        className={activeStatus === "Congé" ? "dropdown-option-holo-active" : "dropdown-option-holo"}
                      >
                        <Calendar size={13} className="text-amber-400" />
                        <span className="flex-1 text-left">En Congé</span>
                        {activeStatus === "Congé" && <Check size={14} className="text-cyan-400" />}
                      </button>
                      <button
                        onClick={() => {
                          setActiveStatus("En pause");
                          setShowStatusDropdown(false);
                        }}
                        className={activeStatus === "En pause" ? "dropdown-option-holo-active" : "dropdown-option-holo"}
                      >
                        <Clock size={13} className="text-slate-400" />
                        <span className="flex-1 text-left">En Pause</span>
                        {activeStatus === "En pause" && <Check size={14} className="text-cyan-400" />}
                      </button>
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

              {/* ── AFFICHAGE EN CARTES HOLOGRAPHIQUES ── */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-cyan-500 animate-pulse" />
                    <p className="text-xs text-cyan-400 font-semibold">
                      <span className="text-white font-bold">{filteredData.length}</span> résultat{filteredData.length > 1 ? "s" : ""}
                      {(search || activeDept !== "Tous" || activeStatus !== "Tous") && (
                        <span className="ml-2 px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-md text-cyan-400 text-[10px]">Filtré</span>
                      )}
                    </p>
                  </div>
                </div>

                {paginatedData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-slate-800/50 border border-cyan-500/30 flex items-center justify-center mb-4">
                      <Search size={28} className="text-cyan-500/50" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 mb-1">Aucun résultat trouvé</p>
                    <p className="text-xs text-slate-600">Essayez de modifier vos critères de recherche</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedData.map((emp: Employee) => (
                      <div key={emp.id} className="employee-card-holo group">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative p-4">
                          {/* Header carte */}
                          <div className="flex items-start gap-3 mb-4">
                            <div
                              onClick={() => setSelectedEmployee(emp)}
                              className="cursor-pointer hover:scale-105 transition-transform duration-300"
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => { if (e.key === "Enter") setSelectedEmployee(emp); }}
                            >
                              {renderAvatar(emp, "sm")}
                            </div>
                            <div className="flex-1 min-w-0">
                              <button
                                onClick={() => setSelectedEmployee(emp)}
                                type="button"
                                className="text-sm font-bold text-cyan-300 hover:text-cyan-400 transition-colors text-left w-full truncate mb-1"
                              >
                                {emp.name}
                              </button>
                              <p className="text-[10px] text-cyan-500/50 font-mono flex items-center gap-1">
                                <Fingerprint size={9} />
                                {emp.id}
                              </p>
                            </div>
                            <div className="relative" ref={activeMenu === emp.id ? menuRef : null}>
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
                          </div>

                          {/* Infos carte */}
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-cyan-500/60 flex items-center gap-1.5">
                                <Building2 size={10} />
                                {emp.dept}
                              </span>
                              <span className="contract-badge-holo text-[10px] px-2 py-1">
                                <Briefcase size={8} />
                                {emp.contract}
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-400 truncate">
                              {emp.post}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-cyan-500/10">
                              <div>
                                <p className="text-[10px] text-cyan-500/60 mb-0.5">Salaire</p>
                                <p className="text-sm font-black text-white">
                                  {emp.salary.toLocaleString()} <span className="text-[9px] text-cyan-400">F</span>
                                </p>
                              </div>
                              {emp.prime > 0 && (
                                <div className="text-right">
                                  <p className="text-[10px] text-emerald-500/60 mb-0.5">Prime</p>
                                  <p className="text-sm font-black text-emerald-400">
                                    {emp.prime.toLocaleString()} <span className="text-[9px]">F</span>
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                              <span className={`status-badge-holo text-[10px] px-2.5 py-1 ${getStatusColor(emp.status)}`}>
                                <span className="status-dot-holo" />
                                {emp.status}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePayment(emp.id, emp.name, emp.paymentStatus)}
                                className={emp.paymentStatus === "Payé" ? "payment-badge-paid-holo text-[10px] px-2.5 py-1" : "payment-badge-pending-holo text-[10px] px-2.5 py-1"}
                              >
                                {emp.paymentStatus === "Payé" ? <CheckCircle2 size={9} /> : <Clock size={9} />}
                                {emp.paymentStatus}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination-holo">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="pagination-info-holo">
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
                )}
              </section>

            </div>
          </div>
        </div>
      </div>

/* ═══ FIN PARTIE 2 ═══ */
