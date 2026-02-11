"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SignatureCanvas from "react-signature-canvas";
import {
  ArrowLeft, FileText, Sparkles, Download, Save,
  ChevronRight, ChevronLeft, User, Building2, Calendar,
  FileCheck, Globe, Pen, Printer, Zap, Shield, Award,
  Clock, MapPin, Mail, Phone, Hash, Briefcase, DollarSign,
  CheckCircle2, AlertCircle, Eye, EyeOff, Lock
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════════════════
  TYPE DEFINITIONS (POUR LA ROBUSTESSE TYPESCRIPT & VERCEL)
  ══════════════════════════════════════════════════════════════════════════
*/

type ContractMode = "electronic" | "print";
type ContractType = "CDI" | "CDD" | "Stage";
type Country = "Sénégal" | "Burundi" | "France" | "Autre";

interface StaffInfo {
  fullName: string;
  nationality: string;
  idNumber: string;
  birthDate: string;
  birthPlace: string;
  address: string;
  email: string;
  phone: string;
}

interface EmployerInfo {
  companyName: string;
  legalForm: string;
  capital: string;
  rccm: string;
  nif: string;
  address: string;
  representativeName: string;
  representativeTitle: string;
}

interface ContractDetails {
  type: ContractType;
  country: Country;
  startDate: string;
  endDate: string;
  duration: string;
  position: string;
  department: string;
  salary: string;
  prime: string;
  primeLabel: string;
  workLocation: string;
  workHours: string;
  tasks: string;
}

/* ══════════════════════════════════════════════════════════════════════════
  COMPOSANT PRINCIPAL
  ══════════════════════════════════════════════════════════════════════════
*/

export default function ContractGenerator() {
  const router = useRouter();
  
  // --- ÉTATS (STATE MANAGEMENT) ---
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false); // Pour l'effet Nanotech
  const [contractMode, setContractMode] = useState<ContractMode>("electronic");
  const [saving, setSaving] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  
  // Refs pour la signature
  const employeeSignRef = useRef<SignatureCanvas>(null);

  // --- DONNÉES DU FORMULAIRE ---
  
  const [staffInfo, setStaffInfo] = useState<StaffInfo>({
    fullName: "",
    nationality: "Sénégalaise",
    idNumber: "",
    birthDate: "",
    birthPlace: "",
    address: "",
    email: "",
    phone: ""
  });

  const [employerInfo, setEmployerInfo] = useState<EmployerInfo>({
    companyName: "ECODREUM SARL",
    legalForm: "Société à Responsabilité Limitée",
    capital: "10 000 000",
    rccm: "SN-DKR-2024-B-00000",
    nif: "000000000",
    address: "Bujumbura, Rohero 2, Burundi",
    representativeName: "Mark VIRAMBONA",
    representativeTitle: "Directeur Général"
  });

  const [contractDetails, setContractDetails] = useState<ContractDetails>({
    type: "Stage",
    country: "Burundi",
    startDate: "",
    endDate: "",
    duration: "",
    position: "",
    department: "",
    salary: "0",
    prime: "0",
    primeLabel: "",
    workLocation: "Bujumbura, Burundi",
    workHours: "40 heures par semaine",
    tasks: ""
  });

  // --- HELPER FUNCTIONS ---

  const updateStaffInfo = (field: keyof StaffInfo, value: string) => {
    setStaffInfo(prev => ({ ...prev, [field]: value }));
  };

  const updateEmployerInfo = (field: keyof EmployerInfo, value: string) => {
    setEmployerInfo(prev => ({ ...prev, [field]: value }));
  };

  const updateContractDetails = (field: keyof ContractDetails, value: string) => {
    setContractDetails(prev => ({ ...prev, [field]: value }));
  };

  // --- LOGIQUE DE NAVIGATION "NANOTECH" ---
  
  const handleNextStep = () => {
    if (currentStep >= 3) return;
    setIsTransitioning(true); // Déclenche l'obturation
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      setIsTransitioning(false); // Ouvre l'obturation
    }, 800); // Temps synchro avec l'animation CSS
  };

  const handlePrevStep = () => {
    if (currentStep <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(prev => prev - 1);
      setIsTransitioning(false);
    }, 800);
  };

  // --- LOGIQUE MÉTIER (TEXTES LÉGAUX) ---

  const getLegalReference = (): string => {
    if (contractDetails.country === "Sénégal") {
      return "Vu la Loi n° 97-17 du 1er décembre 1997 portant Code du Travail de la République du Sénégal";
    }
    return "Vu la Loi n° 1/11 du 24 novembre 2020 portant Code du Travail du Burundi";
  };

  // --- SAUVEGARDE SUPABASE ---

  const saveContract = useCallback(async () => {
    setSaving(true);
    try {
      const employeeSign = employeeSignRef.current?.toDataURL() || "";

      // 1. Sauvegarde du contrat (Archive)
      const contractData = {
        staff_full_name: staffInfo.fullName,
        staff_nationality: staffInfo.nationality,
        staff_id_number: staffInfo.idNumber,
        employer_company: employerInfo.companyName,
        contract_type: contractDetails.type,
        contract_country: contractDetails.country,
        contract_position: contractDetails.position,
        contract_salary: Number(contractDetails.salary) || 0,
        employee_signature: employeeSign,
        created_at: new Date().toISOString()
      };

      const { error: contractError } = await supabase.from("contracts").insert([contractData]);
      if (contractError) throw contractError;

      // 2. Mise à jour / Création de l'employé dans le registre actif
      const staffData = {
        name: staffInfo.fullName,
        email: staffInfo.email,
        phone: staffInfo.phone,
        nationality: staffInfo.nationality,
        dept: contractDetails.department || "Non assigné",
        post: contractDetails.position,
        contract_type: contractDetails.type,
        salary: Number(contractDetails.salary) || 0,
        status: "Actif",
        paymentStatus: "En attente",
        created_at: new Date().toISOString()
      };

      const { error: staffError } = await supabase.from("employees").insert([staffData]);
      if (staffError) throw staffError;

      // Feedback Utilisateur
      alert("✅ Contrat sécurisé et enregistré dans la base de données cryptée.");
      router.push("/rh/registre");

    } catch (err) {
      console.error("Erreur critique:", err);
      alert("❌ Erreur système lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }, [staffInfo, employerInfo, contractDetails, router]);

  // --- IMPRESSION PDF ---

  const handlePrint = () => {
    setGenerating(true);
    setTimeout(() => {
      window.print();
      setGenerating(false);
    }, 800);
  };

  const totalSteps = 3;
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen relative bg-slate-950 flex justify-center items-center py-6 px-4 overflow-hidden font-sans select-none">
      
      {/* ══════════════════════════════════════════════════════════════════════════
        ARRIÈRE-PLAN HOLOGRAPHIQUE & EFFETS
        ══════════════════════════════════════════════════════════════════════════
      */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Deep Space Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950" />
        
        {/* Orbes de lumière mouvante */}
        <div className="absolute top-1/4 -left-32 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse-slow" style={{animationDelay: '2s'}} />
        
        {/* Grille Tactique */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ 
          backgroundImage: "linear-gradient(rgba(16, 185, 129, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.4) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(circle at center, black 40%, transparent 80%)"
        }} />
        
        {/* Scanlines TV Effect */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 1px, #fff 1px, #fff 2px)",
          backgroundSize: "100% 4px"
        }} />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
        TRANSITION NANOTECH (L'ANIMATION SPÉCIALE)
        ══════════════════════════════════════════════════════════════════════════
      */}
      {isTransitioning && (
        <div className="fixed inset-0 z-[9999] flex flex-col pointer-events-none">
          {/* Volet Haut */}
          <div className="flex-1 bg-slate-950/95 backdrop-blur-xl border-b border-emerald-500/50 animate-shutterDown flex items-end justify-center pb-4 relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
             <div className="text-emerald-500 font-mono text-xs tracking-[0.5em] animate-pulse z-10">INITIALIZING SEQUENCE...</div>
          </div>
          
          {/* Laser Central */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_30px_#10b981] z-[100]" />
          
          {/* Volet Bas */}
          <div className="flex-1 bg-slate-950/95 backdrop-blur-xl border-t border-emerald-500/50 animate-shutterUp flex items-start justify-center pt-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
        CONTENEUR PRINCIPAL (LA TABLETTE DE VERRE)
        ══════════════════════════════════════════════════════════════════════════
      */}
      <div className="relative z-10 w-full max-w-[1600px] h-[92vh] flex flex-col bg-slate-900/60 backdrop-blur-2xl border border-emerald-500/30 rounded-[2.5rem] shadow-[0_0_60px_-15px_rgba(16,185,129,0.2)] overflow-hidden transition-all duration-500">
        
        {/* Reflets de lumière sur le cadre */}
        <div className="absolute inset-x-32 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
        <div className="absolute inset-y-32 left-0 w-[1px] bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent" />

        {/* ── HEADER ── */}
        <div className="relative p-6 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 to-slate-900/30 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-5">
            <button onClick={() => router.back()} className="group p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-all text-emerald-400">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-emerald-500/20 rounded md:rounded-lg animate-pulse">
                   <Shield size={18} className="text-emerald-400" />
                </div>
                <h1 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-400 to-emerald-600 tracking-tight">
                  GEN_ALIXIR <span className="text-emerald-500/40 font-thin mx-2">//</span> CONTRACT_ENGINE
                </h1>
              </div>
              <div className="flex items-center gap-3 mt-1 pl-1">
                 <span className="text-[10px] text-emerald-500/50 font-mono tracking-widest uppercase flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    System Online
                 </span>
                 <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                    v3.0.1 Stable
                 </span>
              </div>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="hidden md:flex bg-slate-950/60 p-1.5 rounded-xl border border-emerald-500/20 backdrop-blur-md">
            <button 
              onClick={() => setContractMode("electronic")}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all duration-300 ${contractMode === "electronic" ? "bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "text-emerald-500/40 hover:text-emerald-400"}`}
            >
              <Zap size={14} /> Électronique
            </button>
            <button 
              onClick={() => setContractMode("print")}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all duration-300 ${contractMode === "print" ? "bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)]" : "text-amber-500/40 hover:text-amber-400"}`}
            >
              <Printer size={14} /> Impression
            </button>
          </div>
        </div>

        {/* ── PROGRESS BAR ── */}
        <div className="relative h-1 bg-slate-900 w-full">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_10px_#10b981]"
            style={{ width: `${progressPercentage}%` }} 
          />
        </div>

        {/* ── CONTENU SCROLLABLE (MAIN) ── */}
        <div className="flex-1 overflow-y-auto custom-scroll p-4 md:p-8 lg:p-12 relative">
          
          {/* Conteneur Centré */}
          <div className="max-w-6xl mx-auto min-h-full">

            {/* ÉTAPE 1 : INFORMATIONS SALARIÉ */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-fadeIn">
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                    <User size={32} className="text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Profil Collaborateur</h2>
                    <p className="text-slate-400 mt-1 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Saisie des données d'identification
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Nom */}
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest ml-1 group-hover:text-emerald-400 transition-colors">Nom Complet</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50" />
                      <input 
                        type="text" 
                        value={staffInfo.fullName} 
                        onChange={(e) => updateStaffInfo("fullName", e.target.value)} 
                        className="cyber-input w-full pl-12" 
                        placeholder="Ex: Jean Dupont"
                      />
                    </div>
                  </div>

                  {/* Nationalité */}
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest ml-1 group-hover:text-emerald-400 transition-colors">Nationalité</label>
                    <div className="relative">
                      <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50" />
                      <select 
                        value={staffInfo.nationality} 
                        onChange={(e) => updateStaffInfo("nationality", e.target.value)} 
                        className="cyber-input w-full pl-12 appearance-none"
                      >
                        <option value="Sénégalaise">Sénégalaise</option>
                        <option value="Burundaise">Burundaise</option>
                        <option value="Française">Française</option>
                        <option value="Congolaise">Congolaise</option>
                        <option value="Autre">Autre (International)</option>
                      </select>
                      <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500/30 rotate-90" />
                    </div>
                  </div>

                  {/* ID */}
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest ml-1 group-hover:text-emerald-400 transition-colors">N° CNI / Passeport</label>
                    <div className="relative">
                      <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50" />
                      <input 
                        type="text" 
                        value={staffInfo.idNumber} 
                        onChange={(e) => updateStaffInfo("idNumber", e.target.value)} 
                        className="cyber-input w-full pl-12" 
                        placeholder="XXX-XXX-XXX"
                      />
                    </div>
                  </div>

                  {/* Date Naissance */}
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest ml-1 group-hover:text-emerald-400 transition-colors">Date de Naissance</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50" />
                      <input 
                        type="date" 
                        value={staffInfo.birthDate} 
                        onChange={(e) => updateStaffInfo("birthDate", e.target.value)} 
                        className="cyber-input w-full pl-12" 
                      />
                    </div>
                  </div>

                  {/* Lieu Naissance */}
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest ml-1 group-hover:text-emerald-400 transition-colors">Lieu de Naissance</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50" />
                      <input 
                        type="text" 
                        value={staffInfo.birthPlace} 
                        onChange={(e) => updateStaffInfo("birthPlace", e.target.value)} 
                        className="cyber-input w-full pl-12" 
                        placeholder="Ville, Pays"
                      />
                    </div>
                  </div>

                  {/* Téléphone */}
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest ml-1 group-hover:text-emerald-400 transition-colors">Téléphone</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50" />
                      <input 
                        type="tel" 
                        value={staffInfo.phone} 
                        onChange={(e) => updateStaffInfo("phone", e.target.value)} 
                        className="cyber-input w-full pl-12" 
                        placeholder="+257 ..."
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest ml-1 group-hover:text-emerald-400 transition-colors">Email Professionnel</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50" />
                      <input 
                        type="email" 
                        value={staffInfo.email} 
                        onChange={(e) => updateStaffInfo("email", e.target.value)} 
                        className="cyber-input w-full pl-12" 
                        placeholder="nom@entreprise.com"
                      />
                    </div>
                  </div>

                  {/* Adresse */}
                  <div className="md:col-span-2 space-y-2 group">
                    <label className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest ml-1 group-hover:text-emerald-400 transition-colors">Adresse de Résidence</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50" />
                      <input 
                        type="text" 
                        value={staffInfo.address} 
                        onChange={(e) => updateStaffInfo("address", e.target.value)} 
                        className="cyber-input w-full pl-12" 
                        placeholder="Quartier, Avenue, N°..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 2 : INFORMATIONS EMPLOYEUR */}
            {currentStep === 2 && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                    <Building2 size={32} className="text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Entité Juridique</h2>
                    <p className="text-slate-400 mt-1 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Paramètres de la société émettrice
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Société */}
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest ml-1">Raison Sociale</label>
                    <div className="relative">
                      <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/50" />
                      <input type="text" value={employerInfo.companyName} onChange={(e) => updateEmployerInfo("companyName", e.target.value)} className="cyber-input-amber w-full pl-12" />
                    </div>
                  </div>

                  {/* Forme Juridique */}
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest ml-1">Forme Juridique</label>
                    <input type="text" value={employerInfo.legalForm} onChange={(e) => updateEmployerInfo("legalForm", e.target.value)} className="cyber-input-amber w-full" />
                  </div>

                  {/* RCCM */}
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest ml-1">RCCM</label>
                    <input type="text" value={employerInfo.rccm} onChange={(e) => updateEmployerInfo("rccm", e.target.value)} className="cyber-input-amber w-full" />
                  </div>

                  {/* NIF */}
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest ml-1">NIF</label>
                    <input type="text" value={employerInfo.nif} onChange={(e) => updateEmployerInfo("nif", e.target.value)} className="cyber-input-amber w-full" />
                  </div>

                  {/* Représentant */}
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest ml-1">Représentant Légal</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/50" />
                      <input type="text" value={employerInfo.representativeName} onChange={(e) => updateEmployerInfo("representativeName", e.target.value)} className="cyber-input-amber w-full pl-12" />
                    </div>
                  </div>

                  {/* Titre */}
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest ml-1">Qualité / Titre</label>
                    <input type="text" value={employerInfo.representativeTitle} onChange={(e) => updateEmployerInfo("representativeTitle", e.target.value)} className="cyber-input-amber w-full" />
                  </div>

                  {/* Siège */}
                  <div className="md:col-span-2 space-y-2 group">
                    <label className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest ml-1">Siège Social</label>
                    <div className="relative">
                       <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/50" />
                       <input type="text" value={employerInfo.address} onChange={(e) => updateEmployerInfo("address", e.target.value)} className="cyber-input-amber w-full pl-12" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 : DÉTAILS DU CONTRAT & SIGNATURE */}
            {currentStep === 3 && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* 1. CONFIGURATION RAPIDE */}
                <div className="bg-slate-900/40 p-6 md:p-8 rounded-3xl border border-emerald-500/10 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
                      <FileCheck size={24} className="text-cyan-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Termes Contractuels</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-cyan-500/70 uppercase tracking-widest ml-1">Type de Contrat</label>
                      <select value={contractDetails.type} onChange={(e) => updateContractDetails("type", e.target.value as ContractType)} className="cyber-input w-full appearance-none">
                        <option value="CDI">CDI - Indéterminée</option>
                        <option value="CDD">CDD - Déterminée</option>
                        <option value="Stage">Convention de Stage</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-cyan-500/70 uppercase tracking-widest ml-1">Pays de Loi</label>
                       <select value={contractDetails.country} onChange={(e) => updateContractDetails("country", e.target.value as Country)} className="cyber-input w-full appearance-none">
                        <option value="Burundi">Burundi</option>
                        <option value="Sénégal">Sénégal</option>
                        <option value="France">France</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-cyan-500/70 uppercase tracking-widest ml-1">Date Début</label>
                      <input type="date" value={contractDetails.startDate} onChange={(e) => updateContractDetails("startDate", e.target.value)} className="cyber-input w-full" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-cyan-500/70 uppercase tracking-widest ml-1">Poste</label>
                      <input type="text" value={contractDetails.position} onChange={(e) => updateContractDetails("position", e.target.value)} className="cyber-input w-full" placeholder="Ex: Dev Fullstack" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-cyan-500/70 uppercase tracking-widest ml-1">Salaire (Net)</label>
                      <div className="relative">
                         <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/50" />
                         <input type="number" value={contractDetails.salary} onChange={(e) => updateContractDetails("salary", e.target.value)} className="cyber-input w-full pl-10" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-cyan-500/70 uppercase tracking-widest ml-1">Volume Horaire</label>
                      <input type="text" value={contractDetails.workHours} onChange={(e) => updateContractDetails("workHours", e.target.value)} className="cyber-input w-full" placeholder="40h / semaine" />
                    </div>

                    <div className="md:col-span-3 space-y-2">
                       <label className="text-[10px] font-bold text-cyan-500/70 uppercase tracking-widest ml-1">Missions & Tâches</label>
                       <textarea value={contractDetails.tasks} onChange={(e) => updateContractDetails("tasks", e.target.value)} className="cyber-input w-full h-20" placeholder="Lister les responsabilités..." />
                    </div>
                  </div>
                </div>

                {/* 2. ZONE DE VISUALISATION PAPIER (C'est ce qui s'imprime) */}
                <div className="bg-white text-slate-900 p-8 md:p-16 rounded-xl shadow-2xl relative overflow-hidden print-area transform transition-all hover:scale-[1.01]">
                  
                  {/* Filigrane Sécurité */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.04] flex items-center justify-center">
                    <Shield size={500} />
                  </div>

                  <div className="relative z-10 font-serif text-sm md:text-base leading-relaxed max-w-4xl mx-auto">
                    
                    {/* Header Document */}
                    <div className="text-center border-b-2 border-black pb-6 mb-8">
                      <h1 className="text-3xl font-black uppercase tracking-widest text-black">
                        {contractDetails.type === "Stage" ? "CONVENTION DE STAGE" : "CONTRAT DE TRAVAIL"}
                      </h1>
                      <div className="flex justify-between mt-4 text-xs font-sans text-slate-500">
                        <span>RÉF: {employerInfo.rccm}</span>
                        <span>DATE: {new Date().toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Corps du Contrat */}
                    <div className="space-y-6">
                      <p className="text-justify">
                        <strong>ENTRE LES SOUSSIGNÉS :</strong>
                      </p>
                      
                      <div className="pl-6 border-l-4 border-slate-800 py-1 bg-slate-50">
                        La société <strong>{employerInfo.companyName}</strong>, {employerInfo.legalForm} au capital de {employerInfo.capital}, 
                        immatriculée au RCCM sous le numéro {employerInfo.rccm}, dont le siège social est sis à {employerInfo.address}, 
                        représentée par <strong>{employerInfo.representativeName}</strong>, dûment habilité(e) à l'effet des présentes.
                        <br/><span className="text-xs italic text-slate-500 uppercase mt-1 block">Ci-après dénommée "L'EMPLOYEUR"</span>
                      </div>

                      <p className="text-center font-bold text-xs uppercase text-slate-400">- ET -</p>

                      <div className="pl-6 border-l-4 border-slate-300 py-1">
                        M./Mme <strong>{staffInfo.fullName}</strong>, né(e) le {staffInfo.birthDate} à {staffInfo.birthPlace}, 
                        de nationalité {staffInfo.nationality}, titulaire de la pièce d'identité n°{staffInfo.idNumber}, 
                        demeurant à {staffInfo.address}.
                        <br/><span className="text-xs italic text-slate-500 uppercase mt-1 block">Ci-après dénommé(e) "LE COLLABORATEUR"</span>
                      </div>

                      <p className="text-center italic font-bold my-6">IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT :</p>

                      {/* Articles dynamiques */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-bold uppercase border-b border-black inline-block mb-1">Article 1 : Engagement</h3>
                          <p className="text-justify">
                            L'Employeur engage le Collaborateur en qualité de <strong>{contractDetails.position}</strong>, sous contrat de type <strong>{contractDetails.type}</strong>. 
                            Cet engagement prend effet à compter du <strong>{new Date(contractDetails.startDate).toLocaleDateString()}</strong>
                            {contractDetails.duration && ` pour une durée de ${contractDetails.duration}`}.
                            Le lieu de travail est fixé à {contractDetails.workLocation}.
                          </p>
                        </div>

                        <div>
                          <h3 className="font-bold uppercase border-b border-black inline-block mb-1">Article 2 : Rémunération</h3>
                          <p className="text-justify">
                            En contrepartie de ses services, le Collaborateur percevra une rémunération mensuelle nette forfaitaire de <strong>{Number(contractDetails.salary).toLocaleString()}</strong>.
                            Cette rémunération sera versée selon les modalités en vigueur au sein de l'entreprise.
                          </p>
                        </div>

                        <div>
                          <h3 className="font-bold uppercase border-b border-black inline-block mb-1">Article 3 : Obligations Professionnelles</h3>
                          <p className="text-justify">
                            Le Collaborateur s'engage à consacrer l'intégralité de son activité professionnelle à l'entreprise. 
                            La durée du travail est fixée à <strong>{contractDetails.workHours}</strong>.
                            Le Collaborateur sera soumis au règlement intérieur et s'engage à respecter une obligation de discrétion absolue concernant les informations confidentielles de l'entreprise.
                          </p>
                        </div>

                        <div>
                          <h3 className="font-bold uppercase border-b border-black inline-block mb-1">Article 4 : Législation Applicable</h3>
                          <p className="text-justify text-sm text-slate-600">
                             {getLegalReference()}. Tout litige relatif à l'interprétation ou à l'exécution du présent contrat relèvera de la compétence exclusive des tribunaux du lieu du siège social de l'Employeur, après tentative de conciliation.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Zone de Signatures */}
                    <div className="mt-16 grid grid-cols-2 gap-12 break-inside-avoid">
                      
                      {/* Signature Employeur */}
                      <div className="relative h-40 border border-slate-300 p-4 rounded bg-slate-50/50">
                        <p className="font-bold uppercase text-xs mb-1">POUR L'EMPLOYEUR</p>
                        <p className="text-[10px] text-slate-500 mb-6 italic">(Lu et approuvé)</p>
                        <div className="absolute bottom-4 left-4 font-serif text-lg italic text-slate-800">
                          {employerInfo.representativeName}
                        </div>
                         {/* Tampon Digital (Décoratif) */}
                         <div className="absolute right-4 bottom-4 w-20 h-20 border-4 border-slate-200 rounded-full opacity-50 flex items-center justify-center rotate-[-15deg]">
                            <span className="text-[8px] font-black uppercase text-center text-slate-300">Signature<br/>Autorisée</span>
                         </div>
                      </div>

                      {/* Signature Employé (Interactive) */}
                      <div className="relative h-40 border-2 border-dashed border-emerald-500/30 bg-white rounded p-1 hover:border-emerald-500 transition-colors">
                         <div className="absolute top-4 left-4 z-10 pointer-events-none">
                            <p className="font-bold uppercase text-xs mb-1">LE COLLABORATEUR</p>
                            <p className="text-[10px] text-slate-500 italic">(Lu et approuvé)</p>
                         </div>
                         
                         <SignatureCanvas 
                            ref={employeeSignRef}
                            penColor="black"
                            canvasProps={{
                              className: "w-full h-full cursor-crosshair z-20 relative",
                            }}
                          />
                          
                          <button 
                            onClick={() => employeeSignRef.current?.clear()}
                            className="absolute bottom-2 right-2 z-30 text-[10px] bg-red-50 text-red-500 px-2 py-1 rounded hover:bg-red-100 transition-colors border border-red-100 print:hidden"
                          >
                            Effacer
                          </button>
                      </div>

                    </div>

                    <div className="text-center text-[10px] text-slate-400 mt-12 pt-4 border-t">
                      Fait en deux exemplaires originaux à {contractDetails.workLocation}, le {new Date().toLocaleDateString()}.
                      <br/>Document généré via GEN_ALIXIR ENGINE L1.
                    </div>

                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* ── FOOTER NAVIGATION ── */}
        <div className="p-6 border-t border-emerald-500/20 bg-slate-900/50 backdrop-blur-md flex justify-between items-center shrink-0">
          
          <button 
            onClick={handlePrevStep}
            disabled={currentStep === 1 || isTransitioning}
            className="px-6 py-3 rounded-xl border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold flex items-center gap-2 group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour
          </button>

          <div className="flex gap-4">
            {currentStep < 3 ? (
              <button 
                onClick={handleNextStep}
                disabled={isTransitioning}
                className="px-8 py-3 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Suivant <ChevronRight size={16} />
              </button>
            ) : (
              <>
                <button 
                  onClick={handlePrint}
                  className="px-6 py-3 rounded-xl bg-amber-500/10 border border-amber-500/50 text-amber-400 hover:bg-amber-500/20 font-bold flex items-center gap-2 transition-all"
                >
                  {generating ? <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent animate-spin rounded-full"/> : <Printer size={16} />}
                  <span className="hidden md:inline">Imprimer</span>
                </button>
                <button 
                  onClick={saveContract}
                  disabled={saving}
                  className="px-8 py-3 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent animate-spin rounded-full"/> : <Save size={16} />}
                  {saving ? "Sauvegarde..." : "Valider le Contrat"}
                </button>
              </>
            )}
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
        STYLES CSS GLOBAUX & ANIMATIONS GPU
        ══════════════════════════════════════════════════════════════════════════
      */}
      <style jsx global>{`
        /* --- SCROLLBAR --- */
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(16, 185, 129, 0.05);
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.6);
        }

        /* --- INPUTS FUTURISTES --- */
        .cyber-input {
          background: rgba(2, 6, 23, 0.6);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: white;
          padding: 12px 16px;
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
        }
        .cyber-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.15);
          background: rgba(2, 6, 23, 0.9);
          transform: translateY(-1px);
        }

        .cyber-input-amber {
          background: rgba(2, 6, 23, 0.6);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: white;
          padding: 12px 16px;
          border-radius: 12px;
          transition: all 0.3s ease;
          outline: none;
        }
        .cyber-input-amber:focus {
          border-color: #f59e0b;
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.15);
          background: rgba(2, 6, 23, 0.9);
        }

        /* --- ANIMATIONS --- */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes shutterDown {
          0% { transform: translateY(-100%); }
          40% { transform: translateY(0%); }
          60% { transform: translateY(0%); }
          100% { transform: translateY(-100%); }
        }
        .animate-shutterDown {
          animation: shutterDown 0.8s cubic-bezier(0.8, 0, 0.2, 1) forwards;
        }

        @keyframes shutterUp {
          0% { transform: translateY(100%); }
          40% { transform: translateY(0%); }
          60% { transform: translateY(0%); }
          100% { transform: translateY(100%); }
        }
        .animate-shutterUp {
          animation: shutterUp 0.8s cubic-bezier(0.8, 0, 0.2, 1) forwards;
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite ease-in-out;
        }

        /* --- MODE IMPRESSION --- */
        @media print {
          @page { margin: 0; size: auto; }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 2.5cm;
            box-shadow: none !important;
            border-radius: 0 !important;
            background: white !important;
            color: black !important;
            transform: none !important;
            overflow: visible !important;
          }
          /* Masquer les éléments non imprimables */
          button, .cyber-input, label, .fixed, .custom-scroll::-webkit-scrollbar, 
          .group-hover\:text-emerald-400, svg, .animate-fadeIn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
