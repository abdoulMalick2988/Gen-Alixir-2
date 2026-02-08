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
  id: string; name: string; dept: string; post: string; contract: string;
  salary: number; prime: number; primeLabel: string; status: EmployeeStatus;
  email: string; joinDate: string; nation: string; age: number | null;
  genre: string; pco: string; paymentStatus: PaymentStatus; photoUrl: string;
}

interface DeptPayroll {
  name: string; total: number; totalPrimes: number; count: number;
  paid: number; pending: number; paidAmount: number; pendingAmount: number;
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
  const [newForm, setNewForm] = useState({ name: "", dept: "", post: "", contract: "CDI", salary: "", prime: "", primeLabel: "", email: "", nationality: "Sénégal", genre: "", age: "" });
  const [savingNew, setSavingNew] = useState<boolean>(false);
  const itemsPerPage = 10;

  useEffect(() => { function h(e: MouseEvent) { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setActiveMenu(null); } document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);

  useEffect(() => {
    async function fetchStaff() {
      try {
        const { data, error } = await supabase.from("staff").select("*");
        if (error) throw error;
        if (data && Array.isArray(data)) {
          setEmployees(data.map((item: Record<string, unknown>) => ({
            id: item.id_key ? "WKD-" + String(item.id_key) : String(item.id ?? ""),
            name: String(item.full_name ?? "Inconnu"), dept: String(item.department ?? "Non assigné"),
            post: String(item.role ?? "Collaborateur"), contract: String(item.contract_type ?? "CDI"),
            salary: Number(item.salary) || 0, prime: Number(item.prime) || 0,
            primeLabel: String(item.prime_label ?? ""),
            status: (function(r: string): EmployeeStatus { if (r === "En ligne" || r === "Actif") return "Actif"; if (r === "Congé") return "Congé"; if (r === "Sortie") return "Sortie"; return "En pause"; })(String(item.status ?? "")),
            email: String(item.email ?? ""),
            joinDate: item.created_at ? new Date(String(item.created_at)).toISOString().split("T")[0] : "",
            nation: String(item.nationality ?? "Sénégal"), age: item.age ? Number(item.age) : null,
            genre: String(item.genre ?? ""), pco: String(item.pco ?? ""),
            paymentStatus: (String(item.payment_status) === "Payé" ? "Payé" : "En attente") as PaymentStatus,
            photoUrl: String(item.photo_url ?? ""),
          })));
        }
      } catch (err) { console.error("Erreur:", err); } finally { setLoading(false); }
    }
    fetchStaff();
  }, []);

  function getStatusColor(s: string): string {
    if (s === "Actif") return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    if (s === "Congé") return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    if (s === "Sortie") return "bg-rose-500/20 text-rose-300 border-rose-500/30";
    return "bg-zinc-500/20 text-zinc-300 border-zinc-500/30";
  }

  function getInitialBg(n: string): string {
    return ["bg-emerald-700","bg-teal-700","bg-cyan-700","bg-sky-700","bg-violet-700","bg-amber-700"][n.charCodeAt(0) % 6];
  }

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
    } catch (err) { console.error(err); if (typeof window !== "undefined") window.alert("Erreur upload photo."); }
    finally { setUploadingPhoto(false); }
  }, [selectedEmployee]);

  const stats = useMemo(() => {
    const t = employees.length, a = employees.filter((e) => e.status === "Actif").length, c = employees.filter((e) => e.status === "Congé").length;
    const ms = employees.reduce((s, e) => s + e.salary, 0), tp = employees.reduce((s, e) => s + e.prime, 0);
    const pa = employees.filter((e) => e.paymentStatus === "Payé"), pe = employees.filter((e) => e.paymentStatus !== "Payé");
    const ds = Array.from(new Set(employees.map((e) => e.dept)));
    const pbd: DeptPayroll[] = ds.map((d) => { const de = employees.filter((e) => e.dept === d); const p = de.filter((e) => e.paymentStatus === "Payé"); const q = de.filter((e) => e.paymentStatus !== "Payé"); return { name: d, total: de.reduce((a, c) => a + c.salary, 0), totalPrimes: de.reduce((a, c) => a + c.prime, 0), count: de.length, paid: p.length, pending: q.length, paidAmount: p.reduce((a, c) => a + c.salary + c.prime, 0), pendingAmount: q.reduce((a, c) => a + c.salary + c.prime, 0) }; });
    return { total: t, actifs: a, conges: c, masseSalariale: ms, totalPrimes: tp, totalPaid: pa.reduce((s, e) => s + e.salary + e.prime, 0), totalPending: pe.reduce((s, e) => s + e.salary + e.prime, 0), paidCount: pa.length, pendingCount: pe.length, depts: ds, payrollByDept: pbd };
  }, [employees]);

  const filteredData = useMemo(() => employees.filter((e) => { const q = search.toLowerCase(); return (e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q) || e.post.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)) && (activeDept === "Tous" || e.dept === activeDept) && (activeStatus === "Tous" || e.status === activeStatus); }), [search, activeDept, activeStatus, employees]);
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  useEffect(() => { setCurrentPage(1); }, [search, activeDept, activeStatus]);

  const updateStatus = useCallback((id: string, ns: EmployeeStatus) => { setEmployees((p) => p.map((e) => (e.id === id ? { ...e, status: ns } : e))); setActiveMenu(null); }, []);
  const terminateContract = useCallback((id: string) => { if (typeof window !== "undefined" && window.confirm("Confirmer la fin de contrat ?")) { setEmployees((p) => p.filter((e) => e.id !== id)); setActiveMenu(null); } }, []);
  const togglePayment = useCallback((id: string, name: string, cur: PaymentStatus) => { setPayConfirm({ id, name, current: cur }); }, []);

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
    const h = ["ID","Nom","Dept","Poste","Contrat","Salaire","Prime","Statut","Paie","Email","Entrée"];
    const r = filteredData.map((e) => [e.id,e.name,e.dept,e.post,e.contract,String(e.salary),String(e.prime),e.status,e.paymentStatus,e.email,e.joinDate]);
    const b = new Blob([[h,...r].map((x) => x.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" });
    const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "registre_" + new Date().toISOString().split("T")[0] + ".csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u);
    setTimeout(() => setIsExporting(false), 1500);
  }, [filteredData]);

  const handleAddEmployee = useCallback(async () => {
    if (!newForm.name || !newForm.post || !newForm.dept) return; setSavingNew(true);
    try {
      const { data, error } = await supabase.from("staff").insert([{ full_name: newForm.name, department: newForm.dept, role: newForm.post, contract_type: newForm.contract, salary: Number(newForm.salary) || 0, prime: Number(newForm.prime) || 0, prime_label: newForm.primeLabel, email: newForm.email, nationality: newForm.nationality, genre: newForm.genre, age: newForm.age ? Number(newForm.age) : null, status: "En ligne", payment_status: "En attente", photo_url: "" }]).select();
      if (error) throw error;
      if (data?.[0]) { const it = data[0] as Record<string, unknown>; setEmployees((p) => [{ id: it.id_key ? "WKD-" + String(it.id_key) : String(it.id ?? ""), name: String(it.full_name ?? ""), dept: String(it.department ?? ""), post: String(it.role ?? ""), contract: String(it.contract_type ?? "CDI"), salary: Number(it.salary) || 0, prime: Number(it.prime) || 0, primeLabel: String(it.prime_label ?? ""), status: "Actif" as EmployeeStatus, email: String(it.email ?? ""), joinDate: new Date().toISOString().split("T")[0], nation: String(it.nationality ?? "Sénégal"), age: it.age ? Number(it.age) : null, genre: String(it.genre ?? ""), pco: "", paymentStatus: "En attente" as PaymentStatus, photoUrl: "" }, ...p]); }
      setShowNewModal(false); setNewForm({ name: "", dept: "", post: "", contract: "CDI", salary: "", prime: "", primeLabel: "", email: "", nationality: "Sénégal", genre: "", age: "" });
    } catch (err) { console.error(err); if (typeof window !== "undefined") window.alert("Erreur. Réessayez."); } finally { setSavingNew(false); }
  }, [newForm]);

  function getPaginationItems(): (number | string)[] { const it: (number | string)[] = []; for (let i = 1; i <= totalPages; i++) { if (totalPages <= 5 || i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) { if (it.length > 0) { const l = it[it.length - 1]; if (typeof l === "number" && i - l > 1) it.push("..."); } it.push(i); } } return it; }

  function renderAvatar(emp: Employee, size: "sm" | "lg"): React.ReactNode {
    const d = size === "lg" ? "w-20 h-20 text-2xl rounded-2xl" : "w-9 h-9 text-sm rounded-lg";
    if (emp.photoUrl && emp.photoUrl.length > 5) return <img src={emp.photoUrl} alt={emp.name} className={d + " object-cover flex-shrink-0 border border-white/10"} />;
    return <div className={d + " " + getInitialBg(emp.name) + " flex items-center justify-center font-bold text-white flex-shrink-0"}>{emp.name.charAt(0).toUpperCase()}</div>;
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "#020a04" }}>
      <div className="absolute inset-0"><div className="absolute rounded-full" style={{ top: "10%", left: "5%", width: 700, height: 700, background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)", filter: "blur(100px)" }} /><div className="absolute rounded-full" style={{ bottom: "5%", right: "10%", width: 500, height: 500, background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)", filter: "blur(80px)" }} /></div>
      <div className="flex flex-col items-center gap-5 relative z-10"><div className="relative w-14 h-14"><div className="absolute inset-0 border-2 rounded-full" style={{ borderColor: "rgba(16,185,129,0.2)" }} /><div className="absolute inset-0 border-2 border-transparent border-t-emerald-400 rounded-full animate-spin" /></div><p className="text-xs font-medium tracking-widest text-emerald-600 uppercase">Chargement</p></div>
    </div>
  );

  /* ═══ FIN PARTIE 1 ═══ */
/* ═══ PARTIE 2 — Coller après Partie 1 ═══ */

  return (
    <div className="h-screen text-white overflow-hidden relative" style={{ background: "#020a04" }}>

      {/* ═══ FOND TECH FLOU ═══ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full" style={{ top: "-15%", right: "-10%", width: 1000, height: 1000, background: "radial-gradient(circle, rgba(16,185,129,0.14) 0%, rgba(16,185,129,0.03) 50%, transparent 75%)", filter: "blur(80px)" }} />
        <div className="absolute rounded-full" style={{ bottom: "-20%", left: "-15%", width: 900, height: 900, background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 65%)", filter: "blur(90px)" }} />
        <div className="absolute rounded-full" style={{ top: "25%", right: "20%", width: 500, height: 500, background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 65%)", filter: "blur(80px)" }} />
        <div className="absolute rounded-full" style={{ bottom: "20%", left: "40%", width: 400, height: 400, background: "radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 65%)", filter: "blur(70px)" }} />
        <div className="absolute" style={{ top: "45%", left: "50%", transform: "translate(-50%,-50%)", width: 1400, height: 600, background: "radial-gradient(ellipse, rgba(16,185,129,0.04) 0%, transparent 55%)", filter: "blur(60px)" }} />
        {/* Grille */}
        <div className="absolute inset-0" style={{ opacity: 0.018, backgroundImage: "linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        {/* Lignes déco */}
        <div className="absolute" style={{ top: "20%", left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.08) 30%, rgba(212,175,55,0.12) 50%, rgba(212,175,55,0.08) 70%, transparent)" }} />
        <div className="absolute" style={{ bottom: "18%", left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.06) 35%, rgba(16,185,129,0.1) 50%, rgba(16,185,129,0.06) 65%, transparent)" }} />
        {/* Points lumineux */}
        <div className="absolute" style={{ top: "12%", left: "8%", width: 4, height: 4, borderRadius: "50%", background: "rgba(16,185,129,0.5)", boxShadow: "0 0 12px rgba(16,185,129,0.4)" }} />
        <div className="absolute" style={{ top: "70%", right: "12%", width: 3, height: 3, borderRadius: "50%", background: "rgba(212,175,55,0.5)", boxShadow: "0 0 10px rgba(212,175,55,0.3)" }} />
        <div className="absolute" style={{ bottom: "30%", left: "25%", width: 3, height: 3, borderRadius: "50%", background: "rgba(16,185,129,0.4)", boxShadow: "0 0 8px rgba(16,185,129,0.3)" }} />
      </div>

      {/* ═══ TABLETTE EN VERRE ═══ */}
      <div className="relative z-10 h-full flex items-stretch justify-center p-3">
        <div className="tablet-frame w-full max-w-[1520px] rounded-3xl overflow-hidden flex flex-col">

          {/* ═══ CONTENU SCROLLABLE ═══ */}
          <main className="flex-1 overflow-y-auto custom-scroll">
            <div className="px-5 py-4 flex flex-col gap-4">

              {/* ── HEADER ── */}
              <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.push("/rh")} type="button" className="tab-btn"><ArrowLeft size={16} /></button>
                  <button onClick={() => router.push("/")} type="button" className="tab-btn"><Home size={16} /></button>
                  <div className="ml-1">
                    <h1 className="text-[17px] font-bold text-white tracking-tight">Registre du Personnel</h1>
                    <p className="text-[10px] text-zinc-500">{stats.total} collaborateurs &bull; Temps réel</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <button onClick={() => setShowPayroll(!showPayroll)} type="button"
                    className={"flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-semibold transition-all " + (showPayroll ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "tab-btn-alt")}>
                    <Banknote size={14} /><span>Livre de Paie</span>
                  </button>
                  <button onClick={() => setShowNewModal(true)} type="button" className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-semibold transition-all gold-btn">
                    <UserPlus size={14} /><span>Nouveau</span>
                  </button>
                </div>
              </header>

              {/* ── KPIs ── */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5">
                <div className="kpi-card">
                  <div className="kpi-icon bg-emerald-500/15"><Users size={15} className="text-emerald-400" /></div>
                  <div><p className="kpi-label">Effectif</p><p className="kpi-value">{stats.total}</p></div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon bg-emerald-500/15"><CheckCircle2 size={15} className="text-emerald-400" /></div>
                  <div><p className="kpi-label">Actifs</p><p className="kpi-value text-emerald-400">{stats.actifs}</p></div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon bg-amber-500/15"><Calendar size={15} className="text-amber-400" /></div>
                  <div><p className="kpi-label">En Congé</p><p className="kpi-value text-amber-400">{stats.conges}</p></div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon bg-emerald-500/15"><CreditCard size={15} className="text-emerald-400" /></div>
                  <div><p className="kpi-label">Payés</p><p className="kpi-value text-emerald-400">{stats.paidCount}<span className="text-[8px] text-zinc-500 ml-1">/{stats.total}</span></p></div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: "rgba(212,175,55,0.12)" }}><TrendingUp size={15} style={{ color: "#d4af37" }} /></div>
                  <div><p className="kpi-label">Masse Totale</p><p className="kpi-value">{((stats.masseSalariale + stats.totalPrimes) / 1000000).toFixed(1)}M <span className="text-[8px] text-zinc-500">FCFA</span></p></div>
                </div>
              </div>

              {/* ── LIVRE DE PAIE ── */}
              {showPayroll && (
                <section className="payroll-section animate-fadeIn">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2"><Wallet size={16} className="text-emerald-400" /><h2 className="text-sm font-bold text-white">Livre de Paie</h2></div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="sum-chip"><p className="sum-label">Salaires</p><p className="sum-val text-white">{stats.masseSalariale.toLocaleString()} <span className="text-emerald-400 text-[9px]">F</span></p></div>
                      <div className="sum-chip"><p className="sum-label" style={{ color: "#d4af37" }}>Primes</p><p className="sum-val" style={{ color: "#d4af37" }}>{stats.totalPrimes.toLocaleString()} F</p></div>
                      <div className="sum-chip"><p className="sum-label text-emerald-400">Payé</p><p className="sum-val text-emerald-400">{stats.totalPaid.toLocaleString()} F</p></div>
                      <div className="sum-chip"><p className="sum-label text-amber-400">Attente</p><p className="sum-val text-amber-400">{stats.totalPending.toLocaleString()} F</p></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2">
                    {stats.payrollByDept.map((dept: DeptPayroll, i: number) => (
                      <div key={dept.name + "-" + String(i)} className="dept-card">
                        <div className="flex items-center justify-between mb-1.5">
                          <Building2 size={11} className="text-zinc-600" />
                          <span className="text-[7px] font-medium bg-white/5 px-1.5 py-0.5 rounded text-zinc-500">{dept.count}</span>
                        </div>
                        <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">{dept.name}</p>
                        <p className="text-sm font-bold text-white">{dept.total.toLocaleString()} <span className="text-emerald-400 text-[9px]">F</span></p>
                        {dept.totalPrimes > 0 && <p className="text-[10px] font-semibold mt-0.5" style={{ color: "#d4af37" }}>+ {dept.totalPrimes.toLocaleString()} F</p>}
                        <div className="mt-2 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500/50" style={{ width: dept.count > 0 ? ((dept.paid / dept.count) * 100) + "%" : "0%" }} />
                        </div>
                        <div className="mt-1 flex justify-between text-[7px]">
                          <span className="text-emerald-400">{dept.paid} payé{dept.paid > 1 ? "s" : ""}</span>
                          {dept.pending > 0 && <span className="text-amber-400">{dept.pending} att.</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── FILTRES ── */}
              <div className="flex flex-col lg:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                  <input type="text" placeholder="Rechercher par nom, ID, poste ou email..." className="w-full tab-input pl-9 pr-4" value={search} onChange={(e) => setSearch(e.target.value)} />
                  {search && <button onClick={() => setSearch("")} type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"><X size={12} /></button>}
                </div>
                <select className="tab-input min-w-[160px]" value={activeDept} onChange={(e) => setActiveDept(e.target.value)}>
                  <option value="Tous">Tous les départements</option>
                  {stats.depts.map((d: string) => <option key={d} value={d}>{d}</option>)}
                </select>
                <select className="tab-input min-w-[130px]" value={activeStatus} onChange={(e) => setActiveStatus(e.target.value)}>
                  <option value="Tous">Tous les statuts</option>
                  <option value="Actif">Actif</option><option value="Congé">En Congé</option><option value="En pause">En Pause</option>
                </select>
                <button onClick={handleExport} type="button" className="tab-btn-alt flex items-center justify-center gap-1.5 min-w-[110px]">
                  {isExporting ? <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" /> : <Download size={13} />}
                  <span>Export</span>
                </button>
              </div>

              {/* ── TABLEAU ── */}
              <section className="data-table-wrap">
                <div className="overflow-x-auto custom-scroll">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        {["Collaborateur","Département","Poste","Contrat","Salaire","Prime","Statut","Paie","Actions"].map((h) => (
                          <th key={h} className={"px-3 py-2.5 text-[8px] font-bold text-zinc-500 uppercase tracking-wider" + (h === "Actions" ? " text-right" : "")}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {paginatedData.map((emp: Employee) => (
                        <tr key={emp.id} className="group hover:bg-white/[0.03] transition-colors">
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2.5">
                              <div onClick={() => setSelectedEmployee(emp)} className="cursor-pointer hover:ring-2 hover:ring-emerald-500/40 rounded-lg transition-all" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") setSelectedEmployee(emp); }}>{renderAvatar(emp, "sm")}</div>
                              <div className="min-w-0">
                                <button onClick={() => setSelectedEmployee(emp)} type="button" className="text-[12px] font-semibold text-white truncate hover:text-emerald-400 transition-colors block text-left">{emp.name}</button>
                                <p className="text-[8px] text-zinc-600 flex items-center gap-1"><Fingerprint size={7} />{emp.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2"><p className="text-[11px] text-zinc-300">{emp.dept}</p></td>
                          <td className="px-3 py-2"><p className="text-[11px] text-zinc-400">{emp.post}</p></td>
                          <td className="px-3 py-2"><span className="px-1.5 py-0.5 bg-white/5 border border-white/[0.06] rounded text-[8px] font-medium text-zinc-400">{emp.contract}</span></td>
                          <td className="px-3 py-2"><p className="text-[12px] font-semibold text-white tabular-nums">{emp.salary.toLocaleString()} <span className="text-[8px] text-emerald-400">F</span></p></td>
                          <td className="px-3 py-2">
                            {emp.prime > 0 ? (
                              <div><p className="text-[11px] font-semibold tabular-nums" style={{ color: "#d4af37" }}>{emp.prime.toLocaleString()} <span className="text-[8px]">F</span></p>{emp.primeLabel && <p className="text-[7px] text-zinc-500">{emp.primeLabel}</p>}</div>
                            ) : <span className="text-[10px] text-zinc-600">—</span>}
                          </td>
                          <td className="px-3 py-2">
                            <span className={"inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[8px] font-semibold " + getStatusColor(emp.status)}>
                              <span className={"w-1.5 h-1.5 rounded-full bg-current" + (emp.status === "Actif" ? " animate-pulse" : "")} />{emp.status}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <button type="button" onClick={() => togglePayment(emp.id, emp.name, emp.paymentStatus)} title="Cliquer pour changer"
                              className={"pay-badge " + (emp.paymentStatus === "Payé" ? "pay-done" : "pay-wait")}>
                              {emp.paymentStatus === "Payé" ? <CheckCircle2 size={9} /> : <Clock size={9} />}{emp.paymentStatus}
                            </button>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex justify-end gap-1 relative" ref={activeMenu === emp.id ? menuRef : null}>
                              <button onClick={() => setSelectedEmployee(emp)} type="button" className="p-1 rounded-md bg-white/5 text-zinc-500 hover:text-emerald-400 transition-all" title="Fiche"><Eye size={13} /></button>
                              <button onClick={() => setActiveMenu(activeMenu === emp.id ? null : emp.id)} type="button" className={"p-1 rounded-md transition-all " + (activeMenu === emp.id ? "bg-emerald-500 text-black" : "bg-white/5 text-zinc-500 hover:text-white")}><MoreVertical size={13} /></button>
                              {activeMenu === emp.id && (
                                <div className="absolute right-0 top-full mt-1 w-40 rounded-xl shadow-2xl z-50 p-1 animate-fadeIn dropdown-glass">
                                  <button onClick={() => updateStatus(emp.id, "Actif")} type="button" className="dd-item text-emerald-400 hover:bg-emerald-500/10"><span>Actif</span><CheckCircle2 size={11} /></button>
                                  <button onClick={() => updateStatus(emp.id, "Congé")} type="button" className="dd-item text-amber-400 hover:bg-amber-500/10"><span>Congé</span><Calendar size={11} /></button>
                                  <button onClick={() => updateStatus(emp.id, "En pause")} type="button" className="dd-item text-zinc-400 hover:bg-zinc-500/10"><span>Pause</span><Clock size={11} /></button>
                                  <div className="h-px bg-white/[0.06] my-0.5" />
                                  <button onClick={() => terminateContract(emp.id)} type="button" className="dd-item text-rose-400 hover:bg-rose-500/10"><span>Fin Contrat</span><AlertCircle size={11} /></button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {paginatedData.length === 0 && (
                        <tr><td colSpan={9} className="px-4 py-12 text-center"><Search size={24} className="mx-auto text-zinc-700 mb-2" /><p className="text-sm text-zinc-500">Aucun résultat</p></td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2.5 border-t border-white/[0.04] flex flex-col sm:flex-row justify-between items-center gap-2" style={{ background: "rgba(0,0,0,0.15)" }}>
                  <p className="text-[10px] text-zinc-500"><span className="text-white font-semibold">{filteredData.length}</span> résultat{filteredData.length > 1 ? "s" : ""}{(search || activeDept !== "Tous" || activeStatus !== "Tous") ? " (filtré)" : ""} <span className="text-zinc-600 ml-1">&bull; {currentPage}/{totalPages}</span></p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} type="button" className="pg-btn"><ChevronLeft size={14} /></button>
                    {getPaginationItems().map((item, idx) => typeof item === "string" ? <span key={"d" + String(idx)} className="px-1 text-zinc-600 text-[9px]">&hellip;</span> : <button key={"p" + String(item)} onClick={() => setCurrentPage(item)} type="button" className={"pg-num " + (currentPage === item ? "pg-active" : "")}>{item}</button>)}
                    <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} type="button" className="pg-btn"><ChevronRight size={14} /></button>
                  </div>
                </div>
              </section>

            </div>
          </main>
        </div>
      </div>

  /* ═══ FIN PARTIE 2 ═══ */
