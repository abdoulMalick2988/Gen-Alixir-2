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
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [payConfirm, setPayConfirm] = useState<{ id: string; name: string; current: PaymentStatus } | null>(null);
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [newForm, setNewForm] = useState({
    name: "", dept: "", post: "", contract: "CDI", salary: "", prime: "",
    primeLabel: "", email: "", nationality: "Sénégal", genre: "", age: ""
  });
  const [savingNew, setSavingNew] = useState<boolean>(false);
  const itemsPerPage = 10;

  // Fermer le menu au clic extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
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
    if (s === "Actif") return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    if (s === "Congé") return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    if (s === "Sortie") return "bg-rose-500/20 text-rose-300 border-rose-500/30";
    return "bg-zinc-500/20 text-zinc-300 border-zinc-500/30";
  }

  function getInitialBg(n: string): string {
    return ["bg-emerald-700", "bg-teal-700", "bg-cyan-700", "bg-sky-700", "bg-violet-700", "bg-amber-700"][n.charCodeAt(0) % 6];
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
  const updateStatus = useCallback((id: string, ns: EmployeeStatus) => {
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
    setEmployees((p) => p.map((e) => (e.id === payConfirm.id ? { ...e, paymentStatus: ns } : e)));
    const rid = payConfirm.id.replace("WKD-", "");
    const { error: e1 } = await supabase.from("staff").update({ payment_status: ns }).eq("id_key", rid);
    if (e1) await supabase.from("staff").update({ payment_status: ns }).eq("id", rid);
    if (selectedEmployee?.id === payConfirm.id) setSelectedEmployee((p) => p ? { ...p, paymentStatus: ns } : null);
    setPayConfirm(null);
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

  const handleAddEmployee = useCallback(async () => {
    if (!newForm.name || !newForm.post || !newForm.dept) return;
    setSavingNew(true);
    try {
      const { data, error } = await supabase.from("staff").insert([{
        full_name: newForm.name, department: newForm.dept, role: newForm.post,
        contract_type: newForm.contract, salary: Number(newForm.salary) || 0,
        prime: Number(newForm.prime) || 0, prime_label: newForm.primeLabel,
        email: newForm.email, nationality: newForm.nationality, genre: newForm.genre,
        age: newForm.age ? Number(newForm.age) : null, status: "En ligne",
        payment_status: "En attente", photo_url: ""
      }]).select();
      if (error) throw error;
      if (data?.[0]) {
        const it = data[0] as Record<string, unknown>;
        setEmployees((p) => [{
          id: it.id_key ? "WKD-" + String(it.id_key) : String(it.id ?? ""),
          name: String(it.full_name ?? ""), dept: String(it.department ?? ""),
          post: String(it.role ?? ""), contract: String(it.contract_type ?? "CDI"),
          salary: Number(it.salary) || 0, prime: Number(it.prime) || 0,
          primeLabel: String(it.prime_label ?? ""), status: "Actif" as EmployeeStatus,
          email: String(it.email ?? ""), joinDate: new Date().toISOString().split("T")[0],
          nation: String(it.nationality ?? "Sénégal"), age: it.age ? Number(it.age) : null,
          genre: String(it.genre ?? ""), pco: "", paymentStatus: "En attente" as PaymentStatus,
          photoUrl: ""
        }, ...p]);
      }
      setShowNewModal(false);
      setNewForm({ name: "", dept: "", post: "", contract: "CDI", salary: "", prime: "", primeLabel: "", email: "", nationality: "Sénégal", genre: "", age: "" });
    } catch (err) {
      console.error(err);
      if (typeof window !== "undefined") window.alert("Erreur. Réessayez.");
    } finally {
      setSavingNew(false);
    }
  }, [newForm]);

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
    const d = size === "lg" ? "w-20 h-20 text-2xl rounded-2xl" : "w-9 h-9 text-sm rounded-lg";
    if (emp.photoUrl && emp.photoUrl.length > 5) {
      return <img src={emp.photoUrl} alt={emp.name} className={d + " object-cover flex-shrink-0 border border-white/10"} />;
    }
    return (
      <div className={d + " " + getInitialBg(emp.name) + " flex items-center justify-center font-bold text-white flex-shrink-0"}>
        {emp.name.charAt(0).toUpperCase()}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0a1f1a 0%, #051510 100%)" }}>
        {/* Fond flou */}
        <div className="absolute inset-0">
          <div className="absolute rounded-full" style={{ top: "10%", left: "5%", width: 700, height: 700, background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)", filter: "blur(100px)" }} />
          <div className="absolute rounded-full" style={{ bottom: "5%", right: "10%", width: 500, height: 500, background: "radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)", filter: "blur(80px)" }} />
        </div>
        <div className="flex flex-col items-center gap-5 relative z-10">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 border-2 rounded-full" style={{ borderColor: "rgba(212,175,55,0.3)" }} />
            <div className="absolute inset-0 border-2 border-transparent border-t-yellow-500 rounded-full animate-spin" />
          </div>
          <p className="text-xs font-medium tracking-widest text-yellow-500 uppercase">Chargement</p>
        </div>
      </div>
    );
  }

  /* ═══ PARTIE 2 — Coller après Partie 1 ═══ */

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0a1f1a 0%, #051510 100%)" }}>

      {/* ═══ FOND FLOU TECHNOLOGIQUE ═══ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Gradients flous principaux */}
        <div className="absolute rounded-full" style={{ top: "-10%", right: "-5%", width: 900, height: 900, background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.05) 40%, transparent 70%)", filter: "blur(100px)" }} />
        <div className="absolute rounded-full" style={{ bottom: "-15%", left: "-8%", width: 800, height: 800, background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 65%)", filter: "blur(90px)" }} />
        <div className="absolute rounded-full" style={{ top: "30%", right: "25%", width: 600, height: 600, background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 60%)", filter: "blur(85px)" }} />
        <div className="absolute rounded-full" style={{ bottom: "25%", left: "35%", width: 500, height: 500, background: "radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 60%)", filter: "blur(75px)" }} />
        
        {/* Grille subtile */}
        <div className="absolute inset-0" style={{ opacity: 0.025, backgroundImage: "linear-gradient(rgba(212,175,55,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.6) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        
        {/* Lignes décoratives */}
        <div className="absolute" style={{ top: "25%", left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.15) 30%, rgba(212,175,55,0.25) 50%, rgba(212,175,55,0.15) 70%, transparent)" }} />
        <div className="absolute" style={{ bottom: "22%", left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.1) 35%, rgba(16,185,129,0.2) 50%, rgba(16,185,129,0.1) 65%, transparent)" }} />
        
        {/* Points lumineux dorés */}
        <div className="absolute animate-pulse" style={{ top: "15%", left: "10%", width: 4, height: 4, borderRadius: "50%", background: "rgba(212,175,55,0.6)", boxShadow: "0 0 15px rgba(212,175,55,0.5)" }} />
        <div className="absolute animate-pulse" style={{ top: "65%", right: "15%", width: 3, height: 3, borderRadius: "50%", background: "rgba(212,175,55,0.5)", boxShadow: "0 0 12px rgba(212,175,55,0.4)", animationDelay: "0.5s" }} />
        <div className="absolute animate-pulse" style={{ bottom: "35%", left: "20%", width: 3, height: 3, borderRadius: "50%", background: "rgba(16,185,129,0.5)", boxShadow: "0 0 10px rgba(16,185,129,0.4)", animationDelay: "1s" }} />
      </div>

      {/* ═══ TABLETTE AVEC BORDURE DORÉE ═══ */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="golden-tablet w-full max-w-[1600px]">
          
          {/* ═══ CONTENU SCROLLABLE ═══ */}
          <div className="h-full overflow-y-auto custom-scroll">
            <div className="p-6 space-y-5">

              {/* ── HEADER ── */}
              <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.push("/rh")} type="button" className="glass-btn">
                    <ArrowLeft size={16} />
                  </button>
                  <button onClick={() => router.push("/")} type="button" className="glass-btn">
                    <Home size={16} />
                  </button>
                  <div className="ml-2">
                    <h1 className="text-xl font-bold text-white tracking-tight" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                      Registre du Personnel
                    </h1>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {stats.total} collaborateurs &bull; Temps réel
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowPayroll(!showPayroll)}
                    type="button"
                    className={showPayroll ? "glass-btn-active" : "glass-btn-alt"}
                  >
                    <Banknote size={15} />
                    <span>Livre de Paie</span>
                  </button>
                  <button onClick={() => setShowNewModal(true)} type="button" className="gold-btn">
                    <UserPlus size={15} />
                    <span>Nouveau</span>
                  </button>
                </div>
              </header>

              {/* ── KPI CARDS ── */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="kpi-glass">
                  <div className="kpi-icon-green">
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="kpi-label">Effectif Total</p>
                    <p className="kpi-value">{stats.total}</p>
                  </div>
                </div>

                <div className="kpi-glass">
                  <div className="kpi-icon-green">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p className="kpi-label">Actifs</p>
                    <p className="kpi-value text-emerald-400">{stats.actifs}</p>
                    <p className="text-[9px] text-emerald-500/60 mt-0.5">+{stats.actifs > 0 ? "12%" : "0%"}</p>
                  </div>
                </div>

                <div className="kpi-glass">
                  <div className="kpi-icon-amber">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <p className="kpi-label">En Congé</p>
                    <p className="kpi-value text-amber-400">{stats.conges}</p>
                    <p className="text-[9px] text-zinc-500 mt-0.5">Stable</p>
                  </div>
                </div>

                <div className="kpi-glass">
                  <div className="kpi-icon-green">
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <p className="kpi-label">Payés</p>
                    <p className="kpi-value text-emerald-400">
                      {stats.paidCount}
                      <span className="text-[9px] text-zinc-500 font-normal ml-1">/{stats.total}</span>
                    </p>
                    <p className="text-[9px] text-emerald-500/60 mt-0.5">{stats.total > 0 ? Math.round((stats.paidCount / stats.total) * 100) : 0}%</p>
                  </div>
                </div>

                <div className="kpi-glass-gold">
                  <div className="kpi-icon-gold">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <p className="kpi-label">Masse Totale</p>
                    <p className="kpi-value text-yellow-500">
                      {((stats.masseSalariale + stats.totalPrimes) / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-[9px] text-yellow-600/70 mt-0.5">+8% FCFA</p>
                  </div>
                </div>
              </div>

              {/* ── LIVRE DE PAIE ── */}
              {showPayroll && (
                <section className="payroll-glass animate-slideDown">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-2.5">
                      <Wallet size={17} className="text-emerald-400" />
                      <h2 className="text-base font-bold text-white">Livre de Paie par Département</h2>
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="sum-badge">
                        <p className="sum-label">Salaires</p>
                        <p className="sum-value text-white">
                          {stats.masseSalariale.toLocaleString()} <span className="text-emerald-400 text-[9px]">F</span>
                        </p>
                      </div>
                      <div className="sum-badge-gold">
                        <p className="sum-label text-yellow-500">Primes</p>
                        <p className="sum-value text-yellow-500">
                          {stats.totalPrimes.toLocaleString()} F
                        </p>
                      </div>
                      <div className="sum-badge">
                        <p className="sum-label text-emerald-400">Payé</p>
                        <p className="sum-value text-emerald-400">
                          {stats.totalPaid.toLocaleString()} F
                        </p>
                      </div>
                      <div className="sum-badge">
                        <p className="sum-label text-amber-400">En attente</p>
                        <p className="sum-value text-amber-400">
                          {stats.totalPending.toLocaleString()} F
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                    {stats.payrollByDept.map((dept: DeptPayroll, i: number) => (
                      <div key={dept.name + "-" + String(i)} className="dept-glass">
                        <div className="flex items-center justify-between mb-2">
                          <Building2 size={12} className="text-emerald-500/60" />
                          <span className="count-badge">{dept.count}</span>
                        </div>
                        <p className="dept-name">{dept.name}</p>
                        <p className="dept-amount">
                          {dept.total.toLocaleString()} <span className="text-emerald-400 text-[10px]">F</span>
                        </p>
                        {dept.totalPrimes > 0 && (
                          <p className="dept-prime">+ {dept.totalPrimes.toLocaleString()} F</p>
                        )}
                        <div className="progress-bar-bg">
                          <div
                            className="progress-bar-fill"
                            style={{ width: dept.count > 0 ? ((dept.paid / dept.count) * 100) + "%" : "0%" }}
                          />
                        </div>
                        <div className="dept-stats">
                          <span className="text-emerald-400">{dept.paid} payé{dept.paid > 1 ? "s" : ""}</span>
                          {dept.pending > 0 && <span className="text-amber-400">{dept.pending} att.</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── FILTRES ── */}
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, ID, poste ou email..."
                    className="glass-input pl-10 pr-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <select className="glass-input min-w-[180px]" value={activeDept} onChange={(e) => setActiveDept(e.target.value)}>
                  <option value="Tous">Tous les départements</option>
                  {stats.depts.map((d: string) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <select className="glass-input min-w-[150px]" value={activeStatus} onChange={(e) => setActiveStatus(e.target.value)}>
                  <option value="Tous">Tous les statuts</option>
                  <option value="Actif">Actif</option>
                  <option value="Congé">En Congé</option>
                  <option value="En pause">En Pause</option>
                </select>
                <button onClick={handleExport} type="button" className="glass-btn-alt min-w-[120px]">
                  {isExporting ? (
                    <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <Download size={14} />
                  )}
                  <span>Export CSV</span>
                </button>
              </div>

              {/* ── TABLEAU ── */}
              <section className="table-glass">
                <div className="overflow-x-auto custom-scroll">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/[0.08]">
                        <th className="table-header">Collaborateur</th>
                        <th className="table-header">Département</th>
                        <th className="table-header">Poste</th>
                        <th className="table-header">Contrat</th>
                        <th className="table-header">Salaire</th>
                        <th className="table-header">Prime</th>
                        <th className="table-header">Statut</th>
                        <th className="table-header">Paie</th>
                        <th className="table-header text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {paginatedData.map((emp: Employee) => (
                        <tr key={emp.id} className="table-row">
                          <td className="table-cell">
                            <div className="flex items-center gap-3">
                              <div
                                onClick={() => setSelectedEmployee(emp)}
                                className="cursor-pointer hover:ring-2 hover:ring-yellow-500/50 rounded-lg transition-all"
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
                                  className="employee-name"
                                >
                                  {emp.name}
                                </button>
                                <p className="employee-id">
                                  <Fingerprint size={8} />
                                  {emp.id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="table-cell">
                            <p className="text-[11px] text-zinc-300">{emp.dept}</p>
                          </td>
                          <td className="table-cell">
                            <p className="text-[11px] text-zinc-400">{emp.post}</p>
                          </td>
                          <td className="table-cell">
                            <span className="contract-badge">{emp.contract}</span>
                          </td>
                          <td className="table-cell">
                            <p className="salary-amount">
                              {emp.salary.toLocaleString()} <span className="text-[9px] text-emerald-400">F</span>
                            </p>
                          </td>
                          <td className="table-cell">
                            {emp.prime > 0 ? (
                              <div>
                                <p className="prime-amount">
                                  {emp.prime.toLocaleString()} <span className="text-[9px]">F</span>
                                </p>
                                {emp.primeLabel && <p className="prime-label">{emp.primeLabel}</p>}
                              </div>
                            ) : (
                              <span className="text-[11px] text-zinc-600">—</span>
                            )}
                          </td>
                          <td className="table-cell">
                            <span className={"status-badge " + getStatusColor(emp.status)}>
                              <span className={"status-dot " + (emp.status === "Actif" ? "animate-pulse" : "")} />
                              {emp.status}
                            </span>
                          </td>
                          <td className="table-cell">
                            <button
                              type="button"
                              onClick={() => togglePayment(emp.id, emp.name, emp.paymentStatus)}
                              title="Cliquer pour changer"
                              className={emp.paymentStatus === "Payé" ? "payment-badge-paid" : "payment-badge-pending"}
                            >
                              {emp.paymentStatus === "Payé" ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                              {emp.paymentStatus}
                            </button>
                          </td>
                          <td className="table-cell">
                            <div className="flex justify-end gap-1.5 relative" ref={activeMenu === emp.id ? menuRef : null}>
                              <button
                                onClick={() => setSelectedEmployee(emp)}
                                type="button"
                                className="action-btn"
                                title="Voir la fiche"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => setActiveMenu(activeMenu === emp.id ? null : emp.id)}
                                type="button"
                                className={activeMenu === emp.id ? "action-btn-active" : "action-btn"}
                              >
                                <MoreVertical size={14} />
                              </button>
                              {activeMenu === emp.id && (
                                <div className="dropdown-menu animate-scaleIn">
                                  <button onClick={() => updateStatus(emp.id, "Actif")} type="button" className="dropdown-item text-emerald-400">
                                    <span>Marquer Actif</span>
                                    <CheckCircle2 size={12} />
                                  </button>
                                  <button onClick={() => updateStatus(emp.id, "Congé")} type="button" className="dropdown-item text-amber-400">
                                    <span>En Congé</span>
                                    <Calendar size={12} />
                                  </button>
                                  <button onClick={() => updateStatus(emp.id, "En pause")} type="button" className="dropdown-item text-zinc-400">
                                    <span>En Pause</span>
                                    <Clock size={12} />
                                  </button>
                                  <div className="dropdown-divider" />
                                  <button onClick={() => terminateContract(emp.id)} type="button" className="dropdown-item text-rose-400">
                                    <span>Fin de Contrat</span>
                                    <AlertCircle size={12} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {paginatedData.length === 0 && (
                        <tr>
                          <td colSpan={9} className="px-5 py-16 text-center">
                            <Search size={28} className="mx-auto text-zinc-700 mb-3" />
                            <p className="text-sm text-zinc-500 font-medium">Aucun résultat trouvé</p>
                            <p className="text-xs text-zinc-600 mt-1">Essayez de modifier vos filtres</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="pagination-bar">
                  <p className="pagination-info">
                    <span className="text-white font-semibold">{filteredData.length}</span> résultat{filteredData.length > 1 ? "s" : ""}
                    {(search || activeDept !== "Tous" || activeStatus !== "Tous") && " (filtré)"}
                    <span className="text-zinc-600 ml-2">&bull; Page {currentPage}/{totalPages}</span>
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      type="button"
                      className="pagination-btn"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    {getPaginationItems().map((item, idx) =>
                      typeof item === "string" ? (
                        <span key={"d" + String(idx)} className="px-1.5 text-zinc-600 text-[10px]">&hellip;</span>
                      ) : (
                        <button
                          key={"p" + String(item)}
                          onClick={() => setCurrentPage(item)}
                          type="button"
                          className={currentPage === item ? "pagination-number-active" : "pagination-number"}
                        >
                          {item}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      type="button"
                      className="pagination-btn"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>

/* ═══ PARTIE 3 FINALE — Coller après Partie 2 ═══ */

      {/* ═══ MODAL CONFIRMATION PAIEMENT ═══ */}
      {payConfirm && (
        <div className="modal-overlay animate-fadeIn">
          <div className="modal-container animate-scaleIn">
            <div className="flex items-start gap-4 mb-5">
              <div className={payConfirm.current === "Payé" ? "modal-icon-amber" : "modal-icon-green"}>
                {payConfirm.current === "Payé" ? (
                  <Clock size={20} className="text-amber-400" />
                ) : (
                  <CheckCircle2 size={20} className="text-emerald-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="modal-title">Confirmer le changement</h3>
                <p className="modal-description">
                  {payConfirm.current === "Payé"
                    ? `Marquer le salaire de ${payConfirm.name} comme "En attente" ?`
                    : `Confirmer le paiement du salaire de ${payConfirm.name} ?`}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPayConfirm(null)} type="button" className="modal-btn-secondary">
                Annuler
              </button>
              <button
                onClick={confirmPayment}
                type="button"
                className={payConfirm.current === "Payé" ? "modal-btn-amber" : "modal-btn-green"}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL NOUVEAU COLLABORATEUR ═══ */}
      {showNewModal && (
        <div className="modal-overlay animate-fadeIn">
          <div className="modal-container-large animate-scaleIn">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="modal-icon-green">
                  <UserPlus size={20} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="modal-title">Nouveau Collaborateur</h3>
                  <p className="modal-subtitle">Ajouter un membre à l'équipe</p>
                </div>
              </div>
              <button onClick={() => setShowNewModal(false)} type="button" className="glass-btn">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="md:col-span-2">
                <label className="form-label">Nom complet *</label>
                <input
                  type="text"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  placeholder="Ex: Aminata Diallo"
                  className="glass-input"
                />
              </div>

              <div>
                <label className="form-label">Département *</label>
                <input
                  type="text"
                  value={newForm.dept}
                  onChange={(e) => setNewForm({ ...newForm, dept: e.target.value })}
                  placeholder="Ex: Marketing"
                  className="glass-input"
                />
              </div>

              <div>
                <label className="form-label">Poste *</label>
                <input
                  type="text"
                  value={newForm.post}
                  onChange={(e) => setNewForm({ ...newForm, post: e.target.value })}
                  placeholder="Ex: Designer UI/UX"
                  className="glass-input"
                />
              </div>

              <div>
                <label className="form-label">Type de contrat</label>
                <select
                  value={newForm.contract}
                  onChange={(e) => setNewForm({ ...newForm, contract: e.target.value })}
                  className="glass-input"
                >
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Stage">Stage</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>

              <div>
                <label className="form-label">Genre</label>
                <select
                  value={newForm.genre}
                  onChange={(e) => setNewForm({ ...newForm, genre: e.target.value })}
                  className="glass-input"
                >
                  <option value="">Sélectionner</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="form-label">Salaire mensuel (FCFA)</label>
                <input
                  type="number"
                  value={newForm.salary}
                  onChange={(e) => setNewForm({ ...newForm, salary: e.target.value })}
                  placeholder="0"
                  className="glass-input"
                />
              </div>

              <div>
                <label className="form-label">Prime (FCFA)</label>
                <input
                  type="number"
                  value={newForm.prime}
                  onChange={(e) => setNewForm({ ...newForm, prime: e.target.value })}
                  placeholder="0"
                  className="glass-input"
                />
              </div>

              <div>
                <label className="form-label">Libellé prime</label>
                <input
                  type="text"
                  value={newForm.primeLabel}
                  onChange={(e) => setNewForm({ ...newForm, primeLabel: e.target.value })}
                  placeholder="Ex: Performance"
                  className="glass-input"
                />
              </div>

              <div>
                <label className="form-label">Âge</label>
                <input
                  type="number"
                  value={newForm.age}
                  onChange={(e) => setNewForm({ ...newForm, age: e.target.value })}
                  placeholder="Ex: 28"
                  className="glass-input"
                />
              </div>

              <div className="md:col-span-2">
                <label className="form-label">Email professionnel</label>
                <input
                  type="email"
                  value={newForm.email}
                  onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                  placeholder="exemple@entreprise.com"
                  className="glass-input"
                />
              </div>

              <div>
                <label className="form-label">Nationalité</label>
                <input
                  type="text"
                  value={newForm.nationality}
                  onChange={(e) => setNewForm({ ...newForm, nationality: e.target.value })}
                  className="glass-input"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNewModal(false)}
                type="button"
                className="modal-btn-secondary"
                disabled={savingNew}
              >
                Annuler
              </button>
              <button
                onClick={handleAddEmployee}
                type="button"
                disabled={!newForm.name || !newForm.post || !newForm.dept || savingNew}
                className="modal-btn-gold"
              >
                {savingNew ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin rounded-full" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={15} />
                    <span>Ajouter au registre</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL FICHE EMPLOYÉ ═══ */}
      {selectedEmployee && (
        <div className="modal-overlay animate-fadeIn">
          <div className="modal-container-xl animate-scaleIn">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                <div className="relative">
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
                    className="photo-btn"
                    title="Changer la photo"
                  >
                    {uploadingPhoto ? (
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent animate-spin rounded-full" />
                    ) : (
                      <Camera size={13} />
                    )}
                  </button>
                </div>
                <div>
                  <h3 className="employee-profile-name">{selectedEmployee.name}</h3>
                  <p className="employee-profile-role">
                    {selectedEmployee.post} • {selectedEmployee.dept}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className={"status-badge " + getStatusColor(selectedEmployee.status)}>
                      <span className={"status-dot " + (selectedEmployee.status === "Actif" ? "animate-pulse" : "")} />
                      {selectedEmployee.status}
                    </span>
                    <span
                      className={
                        selectedEmployee.paymentStatus === "Payé"
                          ? "status-badge bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "status-badge bg-amber-500/20 text-amber-300 border-amber-500/30"
                      }
                    >
                      {selectedEmployee.paymentStatus === "Payé" ? (
                        <CheckCircle2 size={10} />
                      ) : (
                        <Clock size={10} />
                      )}
                      {selectedEmployee.paymentStatus}
                    </span>
                    <span className="contract-badge">{selectedEmployee.contract}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedEmployee(null)} type="button" className="glass-btn">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Identification */}
              <div className="info-glass">
                <div className="info-header">
                  <Fingerprint size={15} className="text-emerald-400" />
                  <h4 className="info-title">Identification</h4>
                </div>
                <div className="space-y-2.5">
                  <div className="info-row">
                    <span className="info-label">ID Personnel</span>
                    <span className="info-value">{selectedEmployee.id}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Date d'entrée</span>
                    <span className="info-value">{selectedEmployee.joinDate || "—"}</span>
                  </div>
                  {selectedEmployee.age && (
                    <div className="info-row">
                      <span className="info-label">Âge</span>
                      <span className="info-value">{selectedEmployee.age} ans</span>
                    </div>
                  )}
                  {selectedEmployee.genre && (
                    <div className="info-row">
                      <span className="info-label">Genre</span>
                      <span className="info-value">{selectedEmployee.genre}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact */}
              <div className="info-glass">
                <div className="info-header">
                  <Mail size={15} className="text-emerald-400" />
                  <h4 className="info-title">Contact</h4>
                </div>
                <div className="space-y-2.5">
                  <div className="info-row">
                    <span className="info-label">Email</span>
                    <span className="info-value text-right break-all">{selectedEmployee.email || "—"}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Nationalité</span>
                    <span className="info-value">{selectedEmployee.nation}</span>
                  </div>
                  {selectedEmployee.pco && (
                    <div className="info-row">
                      <span className="info-label">Personne à contacter</span>
                      <span className="info-value text-right">{selectedEmployee.pco}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rémunération */}
              <div className="info-glass">
                <div className="info-header">
                  <Wallet size={15} className="text-yellow-500" />
                  <h4 className="info-title">Rémunération</h4>
                </div>
                <div className="space-y-2.5">
                  <div className="info-row">
                    <span className="info-label">Salaire mensuel</span>
                    <span className="salary-amount">
                      {selectedEmployee.salary.toLocaleString()} <span className="text-[10px] text-emerald-400">FCFA</span>
                    </span>
                  </div>
                  {selectedEmployee.prime > 0 && (
                    <>
                      <div className="info-row">
                        <span className="info-label">Prime</span>
                        <span className="prime-amount">
                          {selectedEmployee.prime.toLocaleString()} <span className="text-[10px]">FCFA</span>
                        </span>
                      </div>
                      {selectedEmployee.primeLabel && (
                        <div className="info-row">
                          <span className="info-label">Type de prime</span>
                          <span className="info-value text-zinc-400">{selectedEmployee.primeLabel}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="pt-2.5 border-t border-white/[0.08]">
                    <div className="info-row">
                      <span className="info-label font-semibold text-zinc-300">Total mensuel</span>
                      <span className="text-base font-bold text-emerald-400 tabular-nums">
                        {(selectedEmployee.salary + selectedEmployee.prime).toLocaleString()}{" "}
                        <span className="text-[10px]">FCFA</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance */}
              <div className="info-glass">
                <div className="info-header">
                  <Award size={15} className="text-yellow-500" />
                  <h4 className="info-title">Performance & Poste</h4>
                </div>
                <div className="space-y-2.5">
                  <div className="info-row">
                    <span className="info-label">Département</span>
                    <span className="info-value">{selectedEmployee.dept}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Fonction</span>
                    <span className="info-value">{selectedEmployee.post}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Type de contrat</span>
                    <span className="info-value">{selectedEmployee.contract}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSelectedEmployee(null)} type="button" className="modal-btn-secondary">
                Fermer
              </button>
              <button
                onClick={() => togglePayment(selectedEmployee.id, selectedEmployee.name, selectedEmployee.paymentStatus)}
                type="button"
                className={selectedEmployee.paymentStatus === "Payé" ? "modal-btn-amber" : "modal-btn-green"}
              >
                {selectedEmployee.paymentStatus === "Payé" ? <Clock size={15} /> : <CheckCircle2 size={15} />}
                <span>
                  {selectedEmployee.paymentStatus === "Payé" ? "Marquer en attente" : "Confirmer paiement"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ STYLES GLOBAUX ═══ */}
      <style jsx>{`
        /* ════════════════════════════════════════════════════
           TABLETTE AVEC BORDURE DORÉE (Style ECODREUM)
        ════════════════════════════════════════════════════ */
        .golden-tablet {
          min-height: calc(100vh - 3rem);
          background: linear-gradient(135deg, rgba(15, 30, 25, 0.95) 0%, rgba(8, 20, 15, 0.98) 100%);
          border: 2px solid;
          border-image: linear-gradient(135deg, rgba(212, 175, 55, 0.6), rgba(212, 175, 55, 0.3), rgba(212, 175, 55, 0.6)) 1;
          border-radius: 2rem;
          box-shadow: 
            0 0 0 1px rgba(212, 175, 55, 0.2),
            0 0 30px rgba(212, 175, 55, 0.15),
            0 30px 80px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(25px);
          overflow: hidden;
        }

        /* ════════════════════════════════════════════════════
           SCROLLBAR CUSTOM
        ════════════════════════════════════════════════════ */
        .custom-scroll::-webkit-scrollbar {
          width: 7px;
          height: 7px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.3);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.5);
        }

        /* ════════════════════════════════════════════════════
           BOUTONS GLASS
        ════════════════════════════════════════════════════ */
        .glass-btn {
          padding: 0.625rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .glass-btn:hover {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.3);
          color: rgb(16, 185, 129);
          transform: translateY(-1px);
        }

        .glass-btn-alt {
          padding: 0.625rem 1.125rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.75rem;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .glass-btn-alt:hover {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.3);
          color: rgb(16, 185, 129);
          transform: translateY(-1px);
        }

        .glass-btn-active {
          padding: 0.625rem 1.125rem;
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid rgba(16, 185, 129, 0.4);
          border-radius: 0.875rem;
          color: rgb(16, 185, 129);
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
        }

        .gold-btn {
          padding: 0.625rem 1.125rem;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.95), rgba(212, 175, 55, 0.8));
          border: 1px solid rgba(212, 175, 55, 0.5);
          border-radius: 0.875rem;
          color: #000;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
          transition: all 0.3s ease;
        }
        .gold-btn:hover {
          background: linear-gradient(135deg, rgba(212, 175, 55, 1), rgba(212, 175, 55, 0.9));
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(212, 175, 55, 0.5);
        }

        /* ════════════════════════════════════════════════════
           INPUT GLASS
        ════════════════════════════════════════════════════ */
        .glass-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.875rem;
          color: #fff;
          font-size: 0.75rem;
          transition: all 0.3s ease;
        }
        .glass-input:focus {
          outline: none;
          background: rgba(0, 0, 0, 0.5);
          border-color: rgba(212, 175, 55, 0.5);
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
        }
        .glass-input::placeholder {
          color: rgba(255, 255, 255, 0.35);
        }

        /* ════════════════════════════════════════════════════
           KPI CARDS
        ════════════════════════════════════════════════════ */
        .kpi-glass {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2));
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1.125rem;
          padding: 1.125rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
        }
        .kpi-glass:hover {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3));
          border-color: rgba(16, 185, 129, 0.2);
          transform: translateY(-2px);
        }

        .kpi-glass-gold {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(212, 175, 55, 0.04));
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 1.125rem;
          padding: 1.125rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s ease;
        }
        .kpi-glass-gold:hover {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.12), rgba(212, 175, 55, 0.06));
          border-color: rgba(212, 175, 55, 0.3);
          transform: translateY(-2px);
        }

        .kpi-icon-green {
          width: 2.5rem;
          height: 2.5rem;
          background: rgba(16, 185, 129, 0.15);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .kpi-icon-amber {
          width: 2.5rem;
          height: 2.5rem;
          background: rgba(245, 158, 11, 0.15);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .kpi-icon-gold {
          width: 2.5rem;
          height: 2.5rem;
          background: rgba(212, 175, 55, 0.15);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .kpi-label {
          font-size: 0.625rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .kpi-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
        }

        /* ════════════════════════════════════════════════════
           PAYROLL SECTION
        ════════════════════════════════════════════════════ */
        .payroll-glass {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.25));
          border: 1px solid rgba(16, 185, 129, 0.15);
          border-radius: 1.25rem;
          padding: 1.5rem;
        }

        .sum-badge {
          padding: 0.625rem 1rem;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0.75rem;
        }

        .sum-badge-gold {
          padding: 0.625rem 1rem;
          background: rgba(212, 175, 55, 0.08);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 0.75rem;
        }

        .sum-label {
          font-size: 0.625rem;
          text-transform: uppercase;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 0.25rem;
        }

        .sum-value {
          font-size: 0.8125rem;
          font-weight: 700;
        }

        /* Dept cards */
        .dept-glass {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3));
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1rem;
          padding: 1rem;
          transition: all 0.3s ease;
        }
        .dept-glass:hover {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4));
          border-color: rgba(16, 185, 129, 0.2);
          transform: translateY(-2px);
        }

        .count-badge {
          font-size: 0.625rem;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.06);
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .dept-name {
          font-size: 0.625rem;
          font-weight: 600;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.05em;
          margin-bottom: 0.375rem;
        }

        .dept-amount {
          font-size: 0.9375rem;
          font-weight: 700;
          color: #fff;
        }

        .dept-prime {
          font-size: 0.6875rem;
          font-weight: 600;
          color: rgba(212, 175, 55, 1);
          margin-top: 0.25rem;
        }

        .progress-bar-bg {
          margin-top: 0.75rem;
          height: 0.3125rem;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 9999px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: rgba(16, 185, 129, 0.6);
          border-radius: 9999px;
          transition: width 0.5s ease;
        }

        .dept-stats {
          margin-top: 0.625rem;
          display: flex;
          justify-content: space-between;
          font-size: 0.625rem;
          font-weight: 600;
        }

        /* ════════════════════════════════════════════════════
           TABLE
        ════════════════════════════════════════════════════ */
        .table-glass {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.25));
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1.25rem;
          overflow: hidden;
        }

        .table-header {
          padding: 0.875rem 1rem;
          font-size: 0.625rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .table-row {
          transition: background-color 0.2s ease;
        }
        .table-row:hover {
          background: rgba(16, 185, 129, 0.05);
        }

        .table-cell {
          padding: 1rem;
        }

        .employee-name {
          font-size: 0.75rem;
          font-weight: 600;
          color: #fff;
          transition: color 0.2s ease;
        }
        .employee-name:hover {
          color: rgb(212, 175, 55);
        }

        .employee-id {
          font-size: 0.625rem;
          color: rgba(255, 255, 255, 0.4);
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin-top: 0.125rem;
        }

        .contract-badge {
          padding: 0.375rem 0.625rem;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0.5rem;
          font-size: 0.625rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.6);
          display: inline-block;
        }

        .salary-amount {
          font-size: 0.75rem;
          font-weight: 700;
          color: #fff;
        }

        .prime-amount {
          font-size: 0.6875rem;
          font-weight: 700;
          color: rgba(212, 175, 55, 1);
        }

        .prime-label {
          font-size: 0.5625rem;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 0.125rem;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          border-radius: 0.625rem;
          border: 1px solid;
          font-size: 0.625rem;
          font-weight: 600;
        }

        .status-dot {
          width: 0.4375rem;
          height: 0.4375rem;
          border-radius: 50%;
          background: currentColor;
        }

        .payment-badge-paid {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.4375rem 0.75rem;
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 0.625rem;
          color: rgb(16, 185, 129);
          font-size: 0.625rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .payment-badge-paid:hover {
          background: rgba(16, 185, 129, 0.25);
        }

        .payment-badge-pending {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.4375rem 0.75rem;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 0.625rem;
          color: rgb(245, 158, 11);
          font-size: 0.625rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .payment-badge-pending:hover {
          background: rgba(245, 158, 11, 0.25);
        }

        .action-btn {
          padding: 0.4375rem;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 0.5rem;
          color: rgba(255, 255, 255, 0.6);
          transition: all 0.2s ease;
        }
        .action-btn:hover {
          background: rgba(16, 185, 129, 0.15);
          color: rgb(16, 185, 129);
        }

        .action-btn-active {
          padding: 0.4375rem;
          background: rgba(212, 175, 55, 0.2);
          border-radius: 0.5rem;
          color: rgb(212, 175, 55);
        }

        .dropdown-menu {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 0.375rem;
          width: 11rem;
          background: linear-gradient(135deg, rgba(15, 25, 20, 0.98), rgba(10, 20, 15, 0.98));
          border: 1px solid rgba(212, 175, 55, 0.25);
          border-radius: 0.875rem;
          padding: 0.375rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(15px);
          z-index: 50;
        }

        .dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.625rem 0.875rem;
          border-radius: 0.5rem;
          font-size: 0.6875rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .dropdown-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
          margin: 0.375rem 0;
        }

        /* ════════════════════════════════════════════════════
           PAGINATION
        ════════════════════════════════════════════════════ */
        .pagination-bar {
          padding: 1rem 1.25rem;
          background: rgba(0, 0, 0, 0.25);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        @media (min-width: 640px) {
          .pagination-bar {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .pagination-info {
          font-size: 0.6875rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .pagination-btn {
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.625rem;
          color: rgba(255, 255, 255, 0.7);
          transition: all 0.2s ease;
        }
        .pagination-btn:hover:not(:disabled) {
          background: rgba(212, 175, 55, 0.15);
          border-color: rgba(212, 175, 55, 0.3);
          color: rgb(212, 175, 55);
        }
        .pagination-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .pagination-number {
          min-width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.625rem;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.6875rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        .pagination-number:hover {
          background: rgba(212, 175, 55, 0.15);
          border-color: rgba(212, 175, 55, 0.3);
          color: rgb(212, 175, 55);
        }

        .pagination-number-active {
          min-width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(212, 175, 55, 0.3);
          border: 1px solid rgba(212, 175, 55, 0.5);
          border-radius: 0.625rem;
          color: rgb(212, 175, 55);
          font-size: 0.6875rem;
          font-weight: 700;
        }

        /* ════════════════════════════════════════════════════
           MODALS
        ════════════════════════════════════════════════════ */
        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
        }

        .modal-container {
          width: 100%;
          max-width: 28rem;
          background: linear-gradient(135deg, rgba(15, 30, 25, 0.98), rgba(10, 20, 15, 0.98));
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 1.25rem;
          padding: 1.75rem;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);
        }

        .modal-container-large {
          width: 100%;
          max-width: 48rem;
          background: linear-gradient(135deg, rgba(15, 30, 25, 0.98), rgba(10, 20, 15, 0.98));
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 1.25rem;
          padding: 1.75rem;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-container-xl {
          width: 100%;
          max-width: 64rem;
          background: linear-gradient(135deg, rgba(15, 30, 25, 0.98), rgba(10, 20, 15, 0.98));
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 1.25rem;
          padding: 1.75rem;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-icon-green {
          width: 2.75rem;
          height: 2.75rem;
          background: rgba(16, 185, 129, 0.15);
          border-radius: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .modal-icon-amber {
          width: 2.75rem;
          height: 2.75rem;
          background: rgba(245, 158, 11, 0.15);
          border-radius: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .modal-title {
          font-size: 0.9375rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.375rem;
        }

        .modal-subtitle {
          font-size: 0.6875rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .modal-description {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.5;
        }

        .modal-btn-secondary {
          flex: 1;
          padding: 0.75rem 1.25rem;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.75rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        .modal-btn-secondary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
        }
        .modal-btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-btn-green {
          flex: 1;
          padding: 0.75rem 1.25rem;
          background: rgba(16, 185, 129, 0.9);
          border: 1px solid rgba(16, 185, 129, 1);
          border-radius: 0.875rem;
          color: #000;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }
        .modal-btn-green:hover {
          background: rgba(16, 185, 129, 1);
        }

        .modal-btn-amber {
          flex: 1;
          padding: 0.75rem 1.25rem;
          background: rgba(245, 158, 11, 0.9);
          border: 1px solid rgba(245, 158, 11, 1);
          border-radius: 0.875rem;
          color: #000;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }
        .modal-btn-amber:hover {
          background: rgba(245, 158, 11, 1);
        }

        .modal-btn-gold {
          flex: 1;
          padding: 0.75rem 1.25rem;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.95), rgba(212, 175, 55, 0.85));
          border: 1px solid rgba(212, 175, 55, 0.5);
          border-radius: 0.875rem;
          color: #000;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }
        .modal-btn-gold:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(212, 175, 55, 1), rgba(212, 175, 55, 0.95));
        }
        .modal-btn-gold:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .form-label {
          display: block;
          font-size: 0.625rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 0.5rem;
        }

        /* Profile */
        .employee-profile-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.375rem;
        }

        .employee-profile-role {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .photo-btn {
          position: absolute;
          bottom: -0.25rem;
          right: -0.25rem;
          width: 1.875rem;
          height: 1.875rem;
          background: rgba(212, 175, 55, 0.95);
          border-radius: 0.625rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
          transition: all 0.2s ease;
        }
        .photo-btn:hover:not(:disabled) {
          background: rgba(212, 175, 55, 1);
          transform: scale(1.05);
        }
        .photo-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .info-glass {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.3));
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1rem;
          padding: 1.125rem;
        }

        .info-header {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          margin-bottom: 1rem;
        }

        .info-title {
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgba(255, 255, 255, 0.6);
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .info-label {
          font-size: 0.6875rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .info-value {
          font-size: 0.75rem;
          font-weight: 600;
          color: #fff;
        }

        /* ════════════════════════════════════════════════════
           ANIMATIONS
        ════════════════════════════════════════════════════ */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.25s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

/* ═══ FIN PARTIE 3 — CODE COMPLET ═══ */
