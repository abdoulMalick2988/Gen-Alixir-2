"use client";
import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Search,
  ArrowLeft,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Fingerprint,
  Wallet,
  Banknote,
  Download,
  Building2,
  Calendar,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Users,
  TrendingUp,
  Briefcase,
  X,
  Clock,
  Mail,
  MapPin,
  FileText,
  Eye,
  Camera,
  Home,
} from "lucide-react";

/* ────────────────────────────
   TYPES
   ──────────────────────────── */
type EmployeeStatus = "Actif" | "Congé" | "En pause" | "Sortie";
type PaymentStatus = "Payé" | "En attente";

interface Employee {
  id: string;
  name: string;
  dept: string;
  post: string;
  contract: string;
  salary: number;
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
  count: number;
  paid: number;
  pending: number;
}

/* ────────────────────────────
   COMPOSANT PRINCIPAL
   ──────────────────────────── */
export default function RegistrePersonnel() {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── États ── */
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
  const itemsPerPage = 10;

  /* ── Fermer menu clic extérieur ── */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Récupération Supabase ── */
  useEffect(() => {
    async function fetchStaff() {
      try {
        const { data, error } = await supabase.from("staff").select("*");
        if (error) throw error;
        if (data && Array.isArray(data)) {
          const formatted: Employee[] = data.map(
            (item: Record<string, unknown>) => ({
              id: item.id_key
                ? "WKD-" + String(item.id_key)
                : String(item.id ?? ""),
              name: String(item.full_name ?? "Inconnu"),
              dept: String(item.department ?? "Non assigné"),
              post: String(item.role ?? "Collaborateur"),
              contract: String(item.contract_type ?? "CDI"),
              salary: Number(item.salary) || 0,
              status: mapStatus(String(item.status ?? "")),
              email: String(item.email ?? ""),
              joinDate: item.created_at
                ? new Date(String(item.created_at)).toISOString().split("T")[0]
                : "",
              nation: String(item.nationality ?? "Sénégal"),
              age: item.age ? Number(item.age) : null,
              genre: String(item.genre ?? ""),
              pco: String(item.pco ?? ""),
              paymentStatus:
                String(item.payment_status) === "Payé" ? "Payé" : "En attente",
              photoUrl: String(item.photo_url ?? ""),
            })
          );
          setEmployees(formatted);
        }
      } catch (err) {
        console.error("Erreur chargement staff:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStaff();
  }, []);

  /* ── Helpers ── */
  function mapStatus(raw: string): EmployeeStatus {
    if (raw === "En ligne" || raw === "Actif") return "Actif";
    if (raw === "Congé") return "Congé";
    if (raw === "Sortie") return "Sortie";
    return "En pause";
  }

  function getStatusColor(s: string): string {
    switch (s) {
      case "Actif":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/25";
      case "Congé":
        return "bg-amber-500/15 text-amber-400 border-amber-500/25";
      case "En pause":
        return "bg-zinc-500/15 text-zinc-400 border-zinc-500/25";
      case "Sortie":
        return "bg-rose-500/15 text-rose-400 border-rose-500/25";
      default:
        return "bg-zinc-500/15 text-zinc-400 border-zinc-500/25";
    }
  }

  function getInitialBg(name: string): string {
    const colors = [
      "bg-emerald-600",
      "bg-teal-600",
      "bg-cyan-600",
      "bg-sky-600",
      "bg-violet-600",
      "bg-fuchsia-600",
      "bg-rose-600",
      "bg-amber-600",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  /* ── Upload photo ── */
  const handlePhotoUpload = useCallback(
    async (empId: string, file: File) => {
      setUploadingPhoto(true);
      try {
        const ext = file.name.split(".").pop() || "jpg";
        const fileName = empId.replace(/[^a-zA-Z0-9-]/g, "") + "-" + Date.now() + "." + ext;

        const { error: uploadError } = await supabase.storage
          .from("photos")
          .upload("staff/" + fileName, file, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("photos")
          .getPublicUrl("staff/" + fileName);
        const publicUrl = urlData.publicUrl;

        const rawId = empId.replace("WKD-", "");
        await supabase
          .from("staff")
          .update({ photo_url: publicUrl })
          .eq("id_key", rawId);

        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === empId ? { ...emp, photoUrl: publicUrl } : emp
          )
        );
        if (selectedEmployee && selectedEmployee.id === empId) {
          setSelectedEmployee((prev) =>
            prev ? { ...prev, photoUrl: publicUrl } : null
          );
        }
      } catch (err) {
        console.error("Erreur upload photo:", err);
      } finally {
        setUploadingPhoto(false);
      }
    },
    [selectedEmployee]
  );

  /* ── Statistiques ── */
  const stats = useMemo(() => {
    const total = employees.length;
    const actifs = employees.filter((e) => e.status === "Actif").length;
    const conges = employees.filter((e) => e.status === "Congé").length;
    const masseSalariale = employees.reduce((sum, e) => sum + e.salary, 0);
    const depts = Array.from(new Set(employees.map((e) => e.dept)));
    const payrollByDept: DeptPayroll[] = depts.map((d) => {
      const de = employees.filter((e) => e.dept === d);
      return {
        name: d,
        total: de.reduce((a, c) => a + c.salary, 0),
        count: de.length,
        paid: de.filter((e) => e.paymentStatus === "Payé").length,
        pending: de.filter((e) => e.paymentStatus !== "Payé").length,
      };
    });
    return { total, actifs, conges, masseSalariale, depts, payrollByDept };
  }, [employees]);

  /* ── Filtrage & Pagination ── */
  const filteredData = useMemo(() => {
    return employees.filter((emp) => {
      const q = search.toLowerCase();
      const matchSearch =
        emp.name.toLowerCase().includes(q) ||
        emp.id.toLowerCase().includes(q) ||
        emp.post.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q);
      const matchDept = activeDept === "Tous" || emp.dept === activeDept;
      const matchStatus = activeStatus === "Tous" || emp.status === activeStatus;
      return matchSearch && matchDept && matchStatus;
    });
  }, [search, activeDept, activeStatus, employees]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeDept, activeStatus]);

  /* ── Actions ── */
  const updateStatus = useCallback((id: string, newStatus: EmployeeStatus) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, status: newStatus } : emp))
    );
    setActiveMenu(null);
  }, []);

  const terminateContract = useCallback((id: string) => {
    if (
      typeof window !== "undefined" &&
      window.confirm("Confirmer la fin de contrat définitive ?")
    ) {
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
      setActiveMenu(null);
    }
  }, []);

  const handleExport = useCallback(() => {
    setIsExporting(true);
    const headers = [
      "ID",
      "Nom",
      "Département",
      "Poste",
      "Contrat",
      "Salaire",
      "Statut",
      "Email",
      "Date Entrée",
    ];
    const rows = filteredData.map((e) => [
      e.id,
      e.name,
      e.dept,
      e.post,
      e.contract,
      String(e.salary),
      e.status,
      e.email,
      e.joinDate,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      "registre_" + new Date().toISOString().split("T")[0] + ".csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setTimeout(() => setIsExporting(false), 1500);
  }, [filteredData]);

  /* ── Pagination intelligente ── */
  function getPaginationItems(): (number | string)[] {
    const items: (number | string)[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        totalPages <= 5 ||
        i === 1 ||
        i === totalPages ||
        Math.abs(i - currentPage) <= 1
      ) {
        if (items.length > 0) {
          const last = items[items.length - 1];
          if (typeof last === "number" && i - last > 1) {
            items.push("...");
          }
        }
        items.push(i);
      }
    }
    return items;
  }

  /* ── Rendu Avatar ── */
  function renderAvatar(emp: Employee, size: "sm" | "md" | "lg"): React.ReactNode {
    let dims = "w-9 h-9 text-sm rounded-lg";
    if (size === "lg") dims = "w-20 h-20 text-2xl rounded-2xl";
    if (size === "md") dims = "w-11 h-11 text-base rounded-xl";

    if (emp.photoUrl && emp.photoUrl.length > 5) {
      return (
        <img
          src={emp.photoUrl}
          alt={emp.name}
          className={dims + " object-cover flex-shrink-0 border border-white/10"}
        />
      );
    }
    return (
      <div
        className={
          dims +
          " " +
          getInitialBg(emp.name) +
          " flex items-center justify-center font-bold text-white flex-shrink-0"
        }
      >
        {emp.name.charAt(0).toUpperCase()}
      </div>
    );
  }

  /* ══════════════════════════════════
     ÉCRAN DE CHARGEMENT
     ══════════════════════════════════ */
  if (loading) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute rounded-full"
            style={{
              top: "25%",
              left: "25%",
              width: 500,
              height: 500,
              background: "rgba(16,185,129,0.08)",
              filter: "blur(150px)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              bottom: "25%",
              right: "25%",
              width: 400,
              height: 400,
              background: "rgba(16,185,129,0.06)",
              filter: "blur(130px)",
            }}
          />
        </div>
        <div className="flex flex-col items-center gap-5 relative z-10">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full" />
            <div className="absolute inset-0 border-2 border-transparent border-t-emerald-500 rounded-full animate-spin" />
          </div>
          <p className="text-xs font-medium tracking-widest text-zinc-500 uppercase">
            Chargement du registre
          </p>
        </div>
      </div>
    );
  }

{/* ════════════════════════════════════════
   ════════════════════════════════════════ */}

{/* ════════════════════════════════════════
   ════════════════════════════════════════ */}

  /* ══════════════════════════════════
     RENDU PRINCIPAL
     ══════════════════════════════════ */
  return (
    <div className="h-screen bg-[#050505] text-white overflow-hidden relative">

      {/* ═══ FOND ÉMERAUDE DÉCORATIF ═══ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            top: "-120px",
            right: "-120px",
            width: 700,
            height: 700,
            background: "rgba(16,185,129,0.06)",
            filter: "blur(180px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: "-150px",
            left: "-150px",
            width: 600,
            height: 600,
            background: "rgba(16,185,129,0.04)",
            filter: "blur(160px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(12deg)",
            width: 900,
            height: 400,
            background: "rgba(16,185,129,0.025)",
            filter: "blur(200px)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.015,
            backgroundImage:
              "linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* ═══ CONTENU ═══ */}
      <main className="relative z-10 h-full overflow-y-auto custom-scroll">
        <div className="max-w-[1440px] mx-auto px-5 py-4 flex flex-col gap-4">

          {/* ─── HEADER ─── */}
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/rh")}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-emerald-400 transition-colors"
                type="button"
              >
                <ArrowLeft size={17} />
              </button>
              <button
                onClick={() => router.push("/")}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-emerald-400 transition-colors"
                type="button"
              >
                <Home size={17} />
              </button>
              <div className="ml-1">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  Registre du Personnel
                </h1>
                <p className="text-xs text-zinc-500">
                  {stats.total} collaborateurs &bull; Temps réel
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowPayroll(!showPayroll)}
                type="button"
                className={
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all " +
                  (showPayroll
                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/25"
                    : "bg-white/[0.03] border border-white/[0.06] text-zinc-300 hover:text-emerald-400")
                }
              >
                <Banknote size={15} />
                <span>Livre de Paie</span>
              </button>
              <Link
                href="/rh/registre/contrat"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/25"
              >
                <UserPlus size={15} />
                <span>Nouveau</span>
              </Link>
            </div>
          </header>

          {/* ─── KPIs (icônes en dur, pas dynamiques) ─── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Total Employés */}
            <div className="bg-white/[0.025] border border-white/[0.06] rounded-xl p-3.5 flex items-center gap-3" style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Users size={16} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider">Total Employés</p>
                <p className="text-base font-bold text-white leading-tight">{stats.total}</p>
              </div>
            </div>
            {/* Actifs */}
            <div className="bg-white/[0.025] border border-white/[0.06] rounded-xl p-3.5 flex items-center gap-3" style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle2 size={16} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider">Actifs</p>
                <p className="text-base font-bold text-emerald-400 leading-tight">{stats.actifs}</p>
              </div>
            </div>
            {/* En Congé */}
            <div className="bg-white/[0.025] border border-white/[0.06] rounded-xl p-3.5 flex items-center gap-3" style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Calendar size={16} className="text-amber-400" />
              </div>
              <div>
                <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider">En Congé</p>
                <p className="text-base font-bold text-amber-400 leading-tight">{stats.conges}</p>
              </div>
            </div>
            {/* Masse Salariale */}
            <div className="bg-white/[0.025] border border-white/[0.06] rounded-xl p-3.5 flex items-center gap-3" style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp size={16} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-wider">Masse Salariale</p>
                <p className="text-base font-bold text-white leading-tight">
                  {(stats.masseSalariale / 1000000).toFixed(1)}M
                  <span className="text-[9px] text-zinc-500 ml-1">FCFA</span>
                </p>
              </div>
            </div>
          </div>

          {/* ─── LIVRE DE PAIE ─── */}
          {showPayroll && (
            <section
              className="rounded-2xl p-5 animate-fadeIn"
              style={{
                background: "rgba(16,185,129,0.025)",
                border: "1px solid rgba(16,185,129,0.12)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <Wallet size={18} className="text-emerald-400" />
                  <h2 className="text-sm font-bold text-white">
                    Masse Salariale Globale
                  </h2>
                </div>
                <div
                  className="rounded-lg px-4 py-2"
                  style={{
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider mr-2">
                    Total
                  </span>
                  <span className="text-base font-bold text-white">
                    {stats.masseSalariale.toLocaleString()}
                  </span>
                  <span className="text-emerald-400 text-[10px] ml-1">FCFA</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2.5">
                {stats.payrollByDept.map((dept: DeptPayroll, i: number) => (
                  <div
                    key={dept.name + "-" + String(i)}
                    className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 hover:border-emerald-500/20 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Building2 size={12} className="text-zinc-600" />
                      <span className="text-[8px] font-medium bg-white/5 px-1.5 py-0.5 rounded text-zinc-500">
                        {dept.count} pers.
                      </span>
                    </div>
                    <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
                      {dept.name}
                    </p>
                    <p className="text-sm font-bold text-white">
                      {dept.total.toLocaleString()}{" "}
                      <span className="text-emerald-400 text-[9px]">F</span>
                    </p>
                    <div className="mt-2 flex gap-1.5 flex-wrap">
                      <span className="text-[7px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                        {dept.paid} Payé
                      </span>
                      {dept.pending > 0 && (
                        <span className="text-[7px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">
                          {dept.pending} Attente
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ─── FILTRES ─── */}
          <div className="flex flex-col lg:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                size={15}
              />
              <input
                type="text"
                placeholder="Rechercher par nom, ID, poste ou email..."
                className="w-full bg-white/[0.025] border border-white/[0.06] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500/40 transition-colors"
                style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <select
              className="bg-white/[0.025] border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs font-medium text-zinc-300 outline-none min-w-[170px] appearance-none cursor-pointer"
              value={activeDept}
              onChange={(e) => setActiveDept(e.target.value)}
            >
              <option value="Tous">Tous les départements</option>
              {stats.depts.map((d: string) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              className="bg-white/[0.025] border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs font-medium text-zinc-300 outline-none min-w-[140px] appearance-none cursor-pointer"
              value={activeStatus}
              onChange={(e) => setActiveStatus(e.target.value)}
            >
              <option value="Tous">Tous les statuts</option>
              <option value="Actif">Actif</option>
              <option value="Congé">En Congé</option>
              <option value="En pause">En Pause</option>
            </select>
            <button
              onClick={handleExport}
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.025] border border-white/[0.06] rounded-xl text-xs font-medium text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/25 transition-colors min-w-[120px]"
            >
              {isExporting ? (
                <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" />
              ) : (
                <Download size={14} />
              )}
              <span>Export CSV</span>
            </button>
          </div>

          {/* ─── TABLEAU ─── */}
          <section
            className="rounded-2xl overflow-hidden flex flex-col flex-1"
            style={{
              background: "rgba(255,255,255,0.012)",
              border: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            <div className="overflow-x-auto custom-scroll">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-4 py-3 text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Collaborateur
                    </th>
                    <th className="px-4 py-3 text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Département
                    </th>
                    <th className="px-4 py-3 text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Poste
                    </th>
                    <th className="px-4 py-3 text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Contrat
                    </th>
                    <th className="px-4 py-3 text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Salaire
                    </th>
                    <th className="px-4 py-3 text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-[9px] font-semibold text-zinc-500 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {paginatedData.map((emp: Employee) => (
                    <tr
                      key={emp.id}
                      className="group hover:bg-white/[0.025] transition-colors"
                    >
                      {/* Collaborateur */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => setSelectedEmployee(emp)}
                            className="cursor-pointer hover:ring-2 hover:ring-emerald-500/40 rounded-lg transition-all"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") setSelectedEmployee(emp);
                            }}
                          >
                            {renderAvatar(emp, "sm")}
                          </div>
                          <div className="min-w-0">
                            <button
                              onClick={() => setSelectedEmployee(emp)}
                              type="button"
                              className="text-[13px] font-semibold text-white truncate hover:text-emerald-400 transition-colors block text-left"
                            >
                              {emp.name}
                            </button>
                            <p className="text-[9px] text-zinc-600 flex items-center gap-1 mt-0.5">
                              <Fingerprint size={8} />
                              {emp.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Département */}
                      <td className="px-4 py-2.5">
                        <p className="text-xs text-zinc-300">{emp.dept}</p>
                      </td>
                      {/* Poste */}
                      <td className="px-4 py-2.5">
                        <p className="text-xs text-zinc-400">{emp.post}</p>
                      </td>
                      {/* Contrat */}
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 bg-white/5 border border-white/[0.06] rounded text-[9px] font-medium text-zinc-400">
                          {emp.contract}
                        </span>
                      </td>
                      {/* Salaire */}
                      <td className="px-4 py-2.5">
                        <p className="text-[13px] font-semibold text-white tabular-nums">
                          {emp.salary.toLocaleString()}{" "}
                          <span className="text-[9px] text-emerald-400">F</span>
                        </p>
                      </td>
                      {/* Statut */}
                      <td className="px-4 py-2.5">
                        <span
                          className={
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-semibold " +
                            getStatusColor(emp.status)
                          }
                        >
                          <span
                            className={
                              "w-1.5 h-1.5 rounded-full bg-current" +
                              (emp.status === "Actif" ? " animate-pulse" : "")
                            }
                          />
                          {emp.status}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-2.5">
                        <div
                          className="flex justify-end gap-1.5 relative"
                          ref={activeMenu === emp.id ? menuRef : null}
                        >
                          <button
                            onClick={() => setSelectedEmployee(emp)}
                            type="button"
                            className="p-1.5 rounded-lg bg-white/5 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                            title="Voir la fiche"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() =>
                              setActiveMenu(
                                activeMenu === emp.id ? null : emp.id
                              )
                            }
                            type="button"
                            className={
                              "p-1.5 rounded-lg transition-all " +
                              (activeMenu === emp.id
                                ? "bg-emerald-500 text-black"
                                : "bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10")
                            }
                          >
                            <MoreVertical size={14} />
                          </button>

                          {/* Dropdown */}
                          {activeMenu === emp.id && (
                            <div
                              className="absolute right-0 top-full mt-1 w-44 rounded-xl shadow-2xl z-50 p-1 animate-fadeIn"
                              style={{
                                background: "rgba(12,12,12,0.95)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                backdropFilter: "blur(30px)",
                                WebkitBackdropFilter: "blur(30px)",
                              }}
                            >
                              <button
                                onClick={() => updateStatus(emp.id, "Actif")}
                                type="button"
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-emerald-500/10 rounded-lg text-[10px] font-medium text-emerald-400 transition-colors"
                              >
                                <span>Marquer Actif</span>
                                <CheckCircle2 size={12} />
                              </button>
                              <button
                                onClick={() => updateStatus(emp.id, "Congé")}
                                type="button"
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-amber-500/10 rounded-lg text-[10px] font-medium text-amber-400 transition-colors"
                              >
                                <span>En Congé</span>
                                <Calendar size={12} />
                              </button>
                              <button
                                onClick={() =>
                                  updateStatus(emp.id, "En pause")
                                }
                                type="button"
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-500/10 rounded-lg text-[10px] font-medium text-zinc-400 transition-colors"
                              >
                                <span>En Pause</span>
                                <Clock size={12} />
                              </button>
                              <div className="h-px bg-white/[0.06] my-1" />
                              <button
                                onClick={() => terminateContract(emp.id)}
                                type="button"
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-rose-500/10 rounded-lg text-[10px] font-medium text-rose-400 transition-colors"
                              >
                                <span>Fin de Contrat</span>
                                <AlertCircle size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Aucun résultat */}
                  {paginatedData.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-14 text-center">
                        <Search
                          size={28}
                          className="mx-auto text-zinc-700 mb-2"
                        />
                        <p className="text-sm text-zinc-500">
                          Aucun collaborateur trouvé
                        </p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">
                          Modifiez vos critères de recherche
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ─── PAGINATION ─── */}
            <div className="px-4 py-3 border-t border-white/[0.05] flex flex-col sm:flex-row justify-between items-center gap-2">
              <p className="text-[10px] text-zinc-500">
                <span className="text-white font-semibold">
                  {filteredData.length}
                </span>{" "}
                résultat{filteredData.length > 1 ? "s" : ""}
                {search || activeDept !== "Tous" || activeStatus !== "Tous"
                  ? " (filtré)"
                  : ""}
                <span className="text-zinc-600 ml-2">
                  &bull; Page {currentPage}/{totalPages}
                </span>
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  disabled={currentPage === 1}
                  type="button"
                  className="p-1.5 rounded-lg bg-white/5 border border-white/[0.05] text-zinc-500 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={15} />
                </button>
                {getPaginationItems().map((item, idx) =>
                  typeof item === "string" ? (
                    <span
                      key={"dot-" + String(idx)}
                      className="px-1 text-zinc-600 text-[10px]"
                    >
                      &hellip;
                    </span>
                  ) : (
                    <button
                      key={"page-" + String(item)}
                      onClick={() => setCurrentPage(item)}
                      type="button"
                      className={
                        "w-7 h-7 rounded-lg text-[10px] font-semibold transition-all " +
                        (currentPage === item
                          ? "bg-emerald-500 text-black"
                          : "bg-white/5 text-zinc-500 hover:text-white")
                      }
                    >
                      {item}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  type="button"
                  className="p-1.5 rounded-lg bg-white/5 border border-white/[0.05] text-zinc-500 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </section>

        </div>
      </main>

{/* ════════════════════════════════════════
   ════════════════════════════════════════ */}

{/* ════════════════════════════════════════
   ════════════════════════════════════════ */}

      {/* ═══════════════════════════════════════
          MODAL — FICHE COLLABORATEUR
          ═══════════════════════════════════════ */}
      {selectedEmployee !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) {
              setSelectedEmployee(null);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label={"Fiche de " + selectedEmployee.name}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-fadeIn"
            style={{
              background: "rgba(10,10,10,0.92)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
            }}
          >
            {/* Header modal */}
            <div
              className="relative p-5 pb-6"
              style={{
                background:
                  "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, transparent 60%)",
              }}
            >
              <button
                onClick={() => setSelectedEmployee(null)}
                type="button"
                className="absolute top-4 right-4 p-2 rounded-lg text-zinc-400 hover:text-white transition-all"
                style={{ background: "rgba(0,0,0,0.3)" }}
              >
                <X size={15} />
              </button>

              <div className="flex items-center gap-4">
                {/* Avatar + bouton upload photo */}
                <div className="relative group">
                  {renderAvatar(selectedEmployee, "lg")}
                  <button
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }}
                    type="button"
                    className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    aria-label="Changer la photo"
                  >
                    {uploadingPhoto ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera size={20} className="text-white" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0];
                      if (file && selectedEmployee) {
                        handlePhotoUpload(selectedEmployee.id, file);
                      }
                      e.target.value = "";
                    }}
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white">
                    {selectedEmployee.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 text-[8px] font-semibold rounded tracking-wider">
                      {selectedEmployee.id}
                    </span>
                    <span
                      className={
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[8px] font-semibold " +
                        getStatusColor(selectedEmployee.status)
                      }
                    >
                      <span
                        className={
                          "w-1 h-1 rounded-full bg-current" +
                          (selectedEmployee.status === "Actif"
                            ? " animate-pulse"
                            : "")
                        }
                      />
                      {selectedEmployee.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Corps modal — Informations */}
            <div className="p-5 space-y-3">
              {/* Poste + Département */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white/[0.025] border border-white/[0.05] rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Briefcase size={10} className="text-zinc-500" />
                    <p className="text-[8px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Poste
                    </p>
                  </div>
                  <p className="text-xs font-medium text-white truncate">
                    {selectedEmployee.post}
                  </p>
                </div>
                <div className="bg-white/[0.025] border border-white/[0.05] rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Building2 size={10} className="text-zinc-500" />
                    <p className="text-[8px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Département
                    </p>
                  </div>
                  <p className="text-xs font-medium text-white truncate">
                    {selectedEmployee.dept}
                  </p>
                </div>
              </div>

              {/* Contrat + Salaire */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white/[0.025] border border-white/[0.05] rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FileText size={10} className="text-zinc-500" />
                    <p className="text-[8px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Contrat
                    </p>
                  </div>
                  <p className="text-xs font-medium text-white">
                    {selectedEmployee.contract}
                  </p>
                </div>
                <div className="bg-white/[0.025] border border-white/[0.05] rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Banknote size={10} className="text-zinc-500" />
                    <p className="text-[8px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Salaire Net
                    </p>
                  </div>
                  <p className="text-xs font-bold text-white">
                    {selectedEmployee.salary.toLocaleString()}{" "}
                    <span className="text-emerald-400 text-[10px]">FCFA</span>
                  </p>
                </div>
              </div>

              {/* Email + Date d'entrée */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white/[0.025] border border-white/[0.05] rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Mail size={10} className="text-zinc-500" />
                    <p className="text-[8px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Email Pro
                    </p>
                  </div>
                  <p className="text-xs font-medium text-zinc-300 truncate">
                    {selectedEmployee.email || "Non renseigné"}
                  </p>
                </div>
                <div className="bg-white/[0.025] border border-white/[0.05] rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar size={10} className="text-zinc-500" />
                    <p className="text-[8px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Date d&apos;entrée
                    </p>
                  </div>
                  <p className="text-xs font-medium text-zinc-300">
                    {selectedEmployee.joinDate || "Non renseignée"}
                  </p>
                </div>
              </div>

              {/* Âge/Genre + Nationalité */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white/[0.025] border border-white/[0.05] rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Users size={10} className="text-zinc-500" />
                    <p className="text-[8px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Âge &amp; Genre
                    </p>
                  </div>
                  <p className="text-xs font-medium text-zinc-300">
                    {selectedEmployee.age !== null
                      ? selectedEmployee.age + " ans"
                      : "--"}{" "}
                    &bull;{" "}
                    {selectedEmployee.genre
                      ? selectedEmployee.genre
                      : "--"}
                  </p>
                </div>
                <div className="bg-white/[0.025] border border-white/[0.05] rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin size={10} className="text-zinc-500" />
                    <p className="text-[8px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Nationalité
                    </p>
                  </div>
                  <p className="text-xs font-medium text-zinc-300">
                    {selectedEmployee.nation}
                  </p>
                </div>
              </div>

              {/* PCO + Statut Paie */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white/[0.025] border border-white/[0.05] rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Fingerprint size={10} className="text-zinc-500" />
                    <p className="text-[8px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Référent (PCO)
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-emerald-400">
                    {selectedEmployee.pco || "Non assigné"}
                  </p>
                </div>
                <div className="bg-white/[0.025] border border-white/[0.05] rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Wallet size={10} className="text-zinc-500" />
                    <p className="text-[8px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Statut Paie
                    </p>
                  </div>
                  <p
                    className={
                      "text-xs font-semibold " +
                      (selectedEmployee.paymentStatus === "Payé"
                        ? "text-emerald-400"
                        : "text-amber-400")
                    }
                  >
                    {selectedEmployee.paymentStatus}
                  </p>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="pt-1 flex gap-2">
                <button
                  onClick={() => {
                    const next: EmployeeStatus =
                      selectedEmployee.status === "Actif" ? "Congé" : "Actif";
                    updateStatus(selectedEmployee.id, next);
                    setSelectedEmployee({
                      ...selectedEmployee,
                      status: next,
                    });
                  }}
                  type="button"
                  className="flex-1 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-[10px] font-semibold text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {selectedEmployee.status === "Actif" ? (
                    <>
                      <Calendar size={13} />
                      <span>Mettre en Congé</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={13} />
                      <span>Marquer Actif</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    terminateContract(selectedEmployee.id);
                    setSelectedEmployee(null);
                  }}
                  type="button"
                  className="px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-[10px] font-semibold text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/25 transition-all flex items-center gap-2"
                >
                  <AlertCircle size={13} />
                  <span>Fin de Contrat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          STYLES GLOBAUX
          ═══════════════════════════════════════ */}
      <style jsx global>{`
        /* Scrollbar */
        .custom-scroll::-webkit-scrollbar {
          width: 3px;
          height: 3px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.25);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.5);
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        /* Animation fadeIn */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }

        /* Animation pulse pour statut Actif */
        @keyframes subtlePulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
        .animate-pulse {
          animation: subtlePulse 2s ease-in-out infinite;
        }

        /* Select dropdown fond sombre */
        select option {
          background-color: #0a0a0a;
          color: #d4d4d8;
        }

        /* Pas de sélection texte sur boutons */
        button {
          user-select: none;
          -webkit-user-select: none;
        }

        /* Transitions tableau */
        tbody tr {
          transition: background-color 0.15s ease;
        }

        /* Focus accessibilité */
        button:focus-visible,
        input:focus-visible,
        select:focus-visible {
          outline: 2px solid rgba(16, 185, 129, 0.4);
          outline-offset: 2px;
        }
        button:focus:not(:focus-visible),
        input:focus:not(:focus-visible),
        select:focus:not(:focus-visible) {
          outline: none;
        }

        /* Responsive mobile */
        @media (max-width: 768px) {
          table th,
          table td {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
        }

        /* Apostrophe HTML entity fix */
        .apos::after {
          content: "'";
        }
      `}</style>
    </div>
  );
}
