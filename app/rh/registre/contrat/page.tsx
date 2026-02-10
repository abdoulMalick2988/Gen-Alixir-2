"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft, FileText, Sparkles, Download, Send, Check,
  ChevronRight, ChevronLeft, User, Building2, Calendar,
  FileCheck, Globe, Pen, Printer, Zap, Shield, Award,
  Clock, MapPin, Mail, Phone, Hash, Briefcase, DollarSign,
  CheckCircle2, AlertCircle, Save, Eye, EyeOff
} from "lucide-react";
import SignatureCanvas from "react-signature-canvas";

type ContractMode = "electronic" | "print";
type ContractType = "CDI" | "CDD" | "Stage";
type Country = "Sénégal" | "Burundi";

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

export default function ContractGenerator() {
  const router = useRouter();
  const [contractMode, setContractMode] = useState<ContractMode>("electronic");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  const employeeSignRef = useRef<SignatureCanvas>(null);
  const employerSignRef = useRef<SignatureCanvas>(null);

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
    representativeTitle: "Développeur Sénior"
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

  // Fonctions de mise à jour
  const updateStaffInfo = (field: keyof StaffInfo, value: string) => {
    setStaffInfo(prev => ({ ...prev, [field]: value }));
  };

  const updateEmployerInfo = (field: keyof EmployerInfo, value: string) => {
    setEmployerInfo(prev => ({ ...prev, [field]: value }));
  };

  const updateContractDetails = (field: keyof ContractDetails, value: string) => {
    setContractDetails(prev => ({ ...prev, [field]: value }));
  };

  // Navigation entre étapes
  const goToNextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Texte légal selon le pays
  const getLegalReference = (): string => {
    if (contractDetails.country === "Sénégal") {
      return "Vu la Loi n° 97-17 du 1er décembre 1997 portant Code du Travail de la République du Sénégal";
    }
    return "Vu la Loi n° 1/11 du 24 novembre 2020 portant Code du Travail du Burundi";
  };

  const getArticlePrefix = (): string => {
    if (contractDetails.country === "Sénégal") {
      return "Conformément aux dispositions de la Loi n° 97-17 du 1er décembre 1997";
    }
    return "Conformément aux dispositions de la Loi n° 1/11 du 24 novembre 2020";
  };

  // Sauvegarde dans Supabase
  const saveContract = useCallback(async () => {
    setSaving(true);
    try {
      const employeeSign = employeeSignRef.current?.toDataURL() || "";
      const employerSign = employerSignRef.current?.toDataURL() || "";

      const contractData = {
        staff_full_name: staffInfo.fullName,
        staff_email: staffInfo.email,
        staff_phone: staffInfo.phone,
        staff_nationality: staffInfo.nationality,
        staff_id_number: staffInfo.idNumber,
        staff_birth_date: staffInfo.birthDate,
        staff_birth_place: staffInfo.birthPlace,
        staff_address: staffInfo.address,
        employer_company: employerInfo.companyName,
        employer_rccm: employerInfo.rccm,
        employer_nif: employerInfo.nif,
        employer_rep_name: employerInfo.representativeName,
        contract_type: contractDetails.type,
        contract_country: contractDetails.country,
        contract_start_date: contractDetails.startDate,
        contract_end_date: contractDetails.endDate,
        contract_position: contractDetails.position,
        contract_department: contractDetails.department,
        contract_salary: Number(contractDetails.salary),
        contract_prime: Number(contractDetails.prime),
        contract_tasks: contractDetails.tasks,
        employee_signature: employeeSign,
        employer_signature: employerSign,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase.from("contracts").insert([contractData]);
      
      if (error) throw error;

      // Ajouter aussi à la table staff si c'est un nouveau contrat
      const staffData = {
        full_name: staffInfo.fullName,
        email: staffInfo.email,
        phone: staffInfo.phone || "",
        nationality: staffInfo.nationality,
        department: contractDetails.department,
        role: contractDetails.position,
        contract_type: contractDetails.type,
        salary: Number(contractDetails.salary),
        prime: Number(contractDetails.prime),
        prime_label: contractDetails.primeLabel,
        status: "En ligne",
        payment_status: "En attente",
        created_at: new Date().toISOString()
      };

      await supabase.from("staff").insert([staffData]);

      if (typeof window !== "undefined") {
        window.alert("✅ Contrat sauvegardé avec succès !");
      }
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
      if (typeof window !== "undefined") {
        window.alert("❌ Erreur lors de la sauvegarde du contrat");
      }
    } finally {
      setSaving(false);
    }
  }, [staffInfo, employerInfo, contractDetails]);

  // Génération PDF (simulation)
  const generatePDF = useCallback(() => {
    setGenerating(true);
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.print();
      }
      setGenerating(false);
    }, 1000);
  }, []);

  const totalSteps = 3;
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen relative bg-slate-950 flex justify-center items-center py-6 px-4 overflow-hidden">
      
      {/* ═══ FOND HOLOGRAPHIQUE ÉMERAUDE & OR ═══ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-amber-900/15 via-transparent to-transparent" />
        
        <div className="absolute top-1/4 -left-32 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[140px] animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[150px] animate-float-delayed" />
        
        <div className="absolute inset-0 opacity-[0.04]" style={{ 
          backgroundImage: "linear-gradient(rgba(16, 185, 129, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.4) 1px, transparent 1px)",
          backgroundSize: "70px 70px",
          maskImage: "radial-gradient(circle at center, black 25%, transparent 75%)"
        }} />

        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(251, 191, 36, 0.2) 2px, rgba(251, 191, 36, 0.2) 3px)"
        }} />
      </div>

      {/* ═══ CONTENEUR PRINCIPAL GLASS MORPHISM ═══ */}
      <div className="relative z-10 w-full max-w-[1600px] flex flex-col bg-slate-900/40 backdrop-blur-3xl border border-emerald-500/30 rounded-[3rem] shadow-[0_0_60px_-15px_rgba(16,185,129,0.3)] overflow-hidden">
        
        {/* Reflets de lumière */}
        <div className="absolute inset-x-20 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent blur-sm" />
        <div className="absolute left-0 top-20 bottom-20 w-[1px] bg-gradient-to-b from-transparent via-amber-400/30 to-transparent" />

        {/* HEADER AVEC MODE SWITCHER */}
        <div className="relative p-6 md:p-8 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 to-slate-900/30">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Titre */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push("/rh/registre")} 
                className="group p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl hover:bg-emerald-500/20 transition-all"
              >
                <ArrowLeft size={20} className="text-emerald-400 group-hover:-translate-x-1 transition-transform" />
              </button>
              
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 bg-gradient-to-br from-emerald-500/30 to-amber-500/20 rounded-lg">
                    <FileCheck size={24} className="text-emerald-400" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-300">
                    GÉNÉRATEUR DE CONTRAT LÉGAL
                  </h1>
                </div>
                <div className="flex items-center gap-3 text-[10px] px-1">
                  <span className="flex items-center gap-1.5 text-emerald-500/70 font-bold uppercase tracking-wider">
                    <Shield size={11} className="animate-pulse" />
                    ECODREUM ENGINE L1
                  </span>
                  <span className="w-1 h-1 rounded-full bg-amber-500/40" />
                  <span className="text-amber-500/60 font-bold uppercase tracking-wider">
                    Conforme aux lois du travail
                  </span>
                </div>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-3">
              <div className="relative inline-flex p-1 bg-slate-900/60 border border-emerald-500/30 rounded-2xl">
                <button
                  onClick={() => setContractMode("electronic")}
                  className={`relative px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                    contractMode === "electronic"
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/50"
                      : "text-emerald-400/60 hover:text-emerald-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Pen size={16} />
                    <span>Électronique</span>
                  </div>
                </button>
                <button
                  onClick={() => setContractMode("print")}
                  className={`relative px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                    contractMode === "print"
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/50"
                      : "text-amber-400/60 hover:text-amber-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Printer size={16} />
                    <span>À Imprimer</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Étape {currentStep} sur {totalSteps}
              </span>
              <span className="text-xs font-bold text-amber-400">
                {Math.round(progressPercentage)}% complété
              </span>
            </div>
            <div className="h-2 bg-slate-900/60 rounded-full overflow-hidden border border-emerald-500/20">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-500 relative overflow-hidden"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-shimmer" />
              </div>
            </div>

            {/* Navigation étapes */}
            <div className="flex items-center justify-between mt-4 gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${currentStep === 1 ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-slate-800/40 border border-slate-700/40'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-400'}`}>
                  1
                </div>
                <span className={`text-xs font-bold ${currentStep === 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  Stagiaire/Employé
                </span>
              </div>

              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${currentStep === 2 ? 'bg-amber-500/20 border border-amber-500/40' : 'bg-slate-800/40 border border-slate-700/40'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === 2 ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-400'}`}>
                  2
                </div>
                <span className={`text-xs font-bold ${currentStep === 2 ? 'text-amber-400' : 'text-slate-500'}`}>
                  Employeur
                </span>
              </div>

              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${currentStep === 3 ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-slate-800/40 border border-slate-700/40'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === 3 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-400'}`}>
                  3
                </div>
                <span className={`text-xs font-bold ${currentStep === 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  Détails du Contrat
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* CONTENU PRINCIPAL SCROLLABLE */}
        <div className="flex-1 overflow-y-auto custom-scroll">
          <div className="p-6 md:p-10 max-w-6xl mx-auto">

            {/* ═══ ÉTAPE 1: INFORMATIONS STAGIAIRE/EMPLOYÉ ═══ */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-slideIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                    <User size={24} className="text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-emerald-400">Informations du Stagiaire/Employé</h2>
                    <p className="text-xs text-slate-400">Renseignez les informations personnelles</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="contract-input-group">
                    <label className="contract-label">
                      <User size={14} />
                      Nom Complet *
                    </label>
                    <input
                      type="text"
                      value={staffInfo.fullName}
                      onChange={(e) => updateStaffInfo("fullName", e.target.value)}
                      placeholder="Ex: Aminata FALL"
                      className="contract-input"
                      required
                    />
                  </div>

                  <div className="contract-input-group">
                    <label className="contract-label">
                      <Globe size={14} />
                      Nationalité *
                    </label>
                    <select
                      value={staffInfo.nationality}
                      onChange={(e) => updateStaffInfo("nationality", e.target.value)}
                      className="contract-input"
                    >
                      <option value="Sénégalaise">Sénégalaise</option>
                      <option value="Burundaise">Burundaise</option>
                      <option value="Française">Française</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

                  <div className="contract-input-group">
                    <label className="contract-label">
                      <Hash size={14} />
                      Numéro CNI/Passeport *
                    </label>
                    <input
                      type="text"
                      value={staffInfo.idNumber}
                      onChange={(e) => updateStaffInfo("idNumber", e.target.value)}
                      placeholder="Ex: 1234567890123"
                      className="contract-input"
                    />
                  </div>

                  <div className="contract-input-group">
                    <label className="contract-label">
                      <Calendar size={14} />
                      Date de Naissance *
                    </label>
                    <input
                      type="date"
                      value={staffInfo.birthDate}
                      onChange={(e) => updateStaffInfo("birthDate", e.target.value)}
                      className="contract-input"
                    />
                  </div>

                  <div className="contract-input-group">
                    <label className="contract-label">
                      <MapPin size={14} />
                      Lieu de Naissance
                    </label>
                    <input
                      type="text"
                      value={staffInfo.birthPlace}
                      onChange={(e) => updateStaffInfo("birthPlace", e.target.value)}
                      placeholder="Ex: Dakar, Sénégal"
                      className="contract-input"
                    />
                  </div>

                  <div className="contract-input-group">
                    <label className="contract-label">
                      <Mail size={14} />
                      Email *
                    </label>
                    <input
                      type="email"
                      value={staffInfo.email}
                      onChange={(e) => updateStaffInfo("email", e.target.value)}
                      placeholder="exemple@email.com"
                      className="contract-input"
                    />
                  </div>

                  <div className="contract-input-group">
                    <label className="contract-label">
                      <Phone size={14} />
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={staffInfo.phone}
                      onChange={(e) => updateStaffInfo("phone", e.target.value)}
                      placeholder="+257 79 123 456"
                      className="contract-input"
                    />
                  </div>

                  <div className="contract-input-group md:col-span-2">
                    <label className="contract-label">
                      <MapPin size={14} />
                      Adresse Complète *
                    </label>
                    <input
                      type="text"
                      value={staffInfo.address}
                      onChange={(e) => updateStaffInfo("address", e.target.value)}
                      placeholder="Ex: Avenue de la Justice, Quartier Rohero, Bujumbura"
                      className="contract-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ═══ ÉTAPE 2: INFORMATIONS EMPLOYEUR ═══ */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-slideIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30">
                    <Building2 size={24} className="text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-amber-400">Informations de l'Employeur</h2>
                    <p className="text-xs text-slate-400">Détails de l'entreprise</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="contract-input-group md:col-span-2">
                    <label className="contract-label">
                      <Building2 size={14} />
                      Raison Sociale *
                    </label>
                    <input
                      type="text"
                      value={employerInfo.companyName}
                      onChange={(e) => updateEmployerInfo("companyName", e.target.value)}
                      placeholder="Ex: ECODREUM SARL"
                      className="contract-input"
                    />
                  </div>

                  <div className="contract-input-group">
                    <label className="contract-label">
                      <FileText size={14} />
                      Forme Juridique
                    </label>
                    <input
                      type="text"
                      value={employerInfo.legalForm}
                      onChange={(e) => updateEmployerInfo("legalForm", e.target.value)}
                      placeholder="Ex: SARL, SA, SAS..."
                      className="contract-input"
                    />
                  </div>

                  <div className="contract-input-group">
                    <label className="contract-label">
                      <DollarSign size={14} />
                      Capital Social (FCFA)
                    </label>
                    <input
                      type="text"
                      value={employerInfo.capital}
                      onChange={(e) => updateEmployerInfo("capital", e.target.value)}
                      placeholder="Ex: 10 000 000"
                      className="contract-input"
                    />
                  </div>

                  <div className="contract-input-group">
                    <label className="contract-label">
                      <Hash size={14} />
                      N° RCCM
                    </label>
                    <input
                      type="text"
                      value={employerInfo.rccm}
                      onChange={(e) => updateEmployerInfo("rccm", e.target.value)}
                      placeholder="Ex: SN-DKR-2024-B-00000"
                      className="contract-input"
                    />
                  </div>

                  <div className="contract-input-group">
                    <label className="contract-label">
                      <Hash size={14} />
                      N° NIF
                    </label>
                    <input
                      type="text"
                      value={employerInfo.nif}
                      onChange={(e) => updateEmployerInfo("nif", e.target.value)}
                      placeholder="Ex: 000000000"
                      className="contract-input"
                    />
                  </div>

                  <div className="contract-input-group md:col-span-2">
                    <label className="contract-label">
                      <MapPin size={14} />
                      Siège Social *
                    </label>
                    <input
                      type="text"
                      value={employerInfo.address}
                      onChange={(e) => updateEmployerInfo("address", e.target.value)}
                      placeholder="Ex: Bujumbura, Rohero 2, Burundi"
                      className="contract-input"
                    />
                  </div>

                  <div className="contract-input-group">
                    <label className="contract-label">
                      <User size={14} />
                      Nom du Représentant Légal *
                    </label>
                    <input
                      type="text"
                      value={employerInfo.representativeName}
                      onChange={(e) => updateEmployerInfo("representativeName", e.target.value)}
                      placeholder="Ex: Mark VIRAMBONA"
                      className="contract-input"
                    />
                  </div>

                  <div className="contract-input-group">
                    <label className="contract-label">
                      <Award size={14} />
                      Qualité/Titre
                    </label>
                    <input
                      type="text"
                      value={employerInfo.representativeTitle}
                      onChange={(e) => updateEmployerInfo("representativeTitle", e.target.value)}
                      placeholder="Ex: Directeur Général"
                      className="contract-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ═══ ÉTAPE 3: DÉTAILS DU CONTRAT ═══ */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-slideIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                    <FileCheck size={24} className="text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-emerald-400">Détails du Contrat</h2>
                    <p className="text-xs text-slate-400">Conditions d'emploi et mission</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="contract-input-group">
                    <label className="contract-label">
                      <FileText size={14} />
                      Type de Contrat *
                    </label>
                    <select
                      value={contractDetails.type}
                      onChange={(e) => updateContractDetails("type", e.target.value as ContractType)}
                      className="contract-input"
                    >
                      <option value="Stage">Convention de Stage</option>
                      <option value="CDD">CDD - Contrat à Durée Déterminée</option>
                      <option value="CDI">CDI - Contrat à Durée Indéterminée</option>
                    </select>
                  </div>

                  <div className="contract-input-group">
                    <label className="contract-label">
                      <Globe size={14} />
                      Pays de Législation *
                    </label>
                    <select
                      value={contractDetails.country}
                      onChange={(e) => updateContractDetails("country", e.target.value as Country)}
                      className="contract-input"
                    >
                      <option value="Burundi">🇧🇮 Burundi</option>
                      <option value="Sénégal">🇸🇳 Sénégal</option>
                    </select>
                  </div>

                  <div className="contract-input-group">
                    <label className="contract-label">
                      <Calendar size={14} />
                      Date de Début *
                    </label>
                    <input
                      type="date"
                      value={contractDetails.startDate}
                      onChange={(e) => updateContractDetails("startDate", e.target.value)}
                      className="contract-input"
                    />
                  </div>

                  {contractDetails.type !== "CDI" && (
                    <div className="contract-input-group">
                      <label className="contract-label">
                        <Calendar size={14} />
                        Date de Fin
                      </label>
                      <input
                        type="date"
                        value={contractDetails.endDate}
                        onChange={(e) => updateContractDetails("endDate", e.target.value)}
                        className="contract-input"
                      />
                    </div>
                  )}

                  <div className="contract-input-group">
                    <label className="contract-label">
                      <Clock size={14} />
                      Durée {contractDetails.type === "Stage" ? "du Stage" : ""}
                    </label>
                    <input
                      type="text"
                      value={contractDetails.duration}
                      onChange={(e) => updateContractDetails("duration", e.target.value)}
                      placeholder="Ex: 3 mois, 6 mois, 1 an..."
                      className="contract-input"
                    />
                  </div>

                  <div className="contract-input-group">
                    <label className="contract-label">
                      <Briefcase size={14} />
                      Poste/Fonction *
                    </label>
                    <input
                      type="text"
                      value={contractDetails.position}
                      onChange={(e) => updateContractDetails("position", e.target.value)}
                      placeholder="Ex: Développeur Full-Stack"
                      className="contract-input"
                    />
                  </div>

                  <div className="contract-input-group">
                    <label className="contract-label">
                      <Building2 size={14} />
                      Département
                    </label>
                    <input
                      type="text"
                      value={contractDetails.department}
                      onChange={(e) => updateContractDetails("department", e.target.value)}
                      placeholder="Ex: Technique"
                      className="contract-input"
                    />
                  </div>

                  <div className="contract-input-group">
                    <label className="contract-label">
                      <DollarSign size={14} />
                      {contractDetails.type === "Stage" ? "Gratification Mensuelle" : "Salaire Mensuel"} (FCFA)
                    </label>
                    <input
                      type="number"
                      value={contractDetails.salary}
                      onChange={(e) => updateContractDetails("salary", e.target.value)}
                      placeholder="Ex: 200000"
                      className="contract-input"
                    />
                  </div>

                  <div className="contract-input-group">
                    <label className="contract-label">
                      <Sparkles size={14} />
                      Prime/Bonus (FCFA)
                    </label>
                    <input
                      type="number"
                      value={contractDetails.prime}
                      onChange={(e) => updateContractDetails("p

                                                             {/* FOOTER AVEC BOUTONS D'ACTION */}
        <div className="relative p-6 md:p-8 border-t border-emerald-500/20 bg-gradient-to-r from-slate-900/50 to-emerald-950/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Bouton Précédent */}
            <button
              onClick={goToPreviousStep}
              disabled={currentStep === 1}
              className="contract-nav-btn contract-nav-btn-secondary"
            >
              <ChevronLeft size={18} />
              <span>Précédent</span>
            </button>

            {/* Boutons centraux */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
              {currentStep === 3 && (
                <>
                  {contractMode === "print" && (
                    <button
                      onClick={generatePDF}
                      disabled={generating}
                      className="contract-action-btn contract-action-btn-amber"
                    >
                      {generating ? (
                        <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Download size={18} />
                      )}
                      <span>{generating ? "Génération..." : "Télécharger PDF"}</span>
                    </button>
                  )}

                  <button
                    onClick={saveContract}
                    disabled={saving}
                    className="contract-action-btn contract-action-btn-green"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    <span>{saving ? "Sauvegarde..." : "Sauvegarder"}</span>
                  </button>

                  {contractMode === "electronic" && (
                    <button
                      onClick={async () => {
                        await saveContract();
                        if (typeof window !== "undefined") {
                          setTimeout(() => {
                            window.alert("✅ Contrat envoyé avec succès !");
                          }, 500);
                        }
                      }}
                      disabled={saving}
                      className="contract-action-btn contract-action-btn-emerald"
                    >
                      <Send size={18} />
                      <span>Signer & Envoyer</span>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Bouton Suivant */}
            <button
              onClick={goToNextStep}
              disabled={currentStep === 3}
              className="contract-nav-btn contract-nav-btn-primary"
            >
              <span>Suivant</span>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Indicateurs de validation */}
          {currentStep < 3 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <AlertCircle size={14} className="text-amber-400" />
              <p className="text-xs text-amber-400/80">
                Remplissez tous les champs obligatoires (*) avant de continuer
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          STYLES HOLOGRAPHIQUES ÉMERAUDE & OR
          ═══════════════════════════════════════════════════════════════ */}
      <style jsx>{`
        /* ════════════════════════════════════════════════════
           ANIMATIONS PERSONNALISÉES
           ════════════════════════════════════════════════════ */
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-25px) translateX(15px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(25px) translateX(-15px); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes shine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 10s ease-in-out infinite; }
        .animate-slideIn { animation: slideIn 0.4s ease-out; }
        .animate-slideDown { animation: slideDown 0.4s ease-out; }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        .animate-shine {
          animation: shine 3s infinite;
        }

        /* ════════════════════════════════════════════════════
           SCROLLBAR HOLOGRAPHIQUE
           ════════════════════════════════════════════════════ */
        .custom-scroll::-webkit-scrollbar { width: 10px; height: 10px; }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(16, 185, 129, 0.6), rgba(251, 191, 36, 0.4));
          border-radius: 10px;
          border: 2px solid rgba(0, 0, 0, 0.3);
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(16, 185, 129, 0.8), rgba(251, 191, 36, 0.6));
        }

        /* ════════════════════════════════════════════════════
           GROUPES D'INPUT DE CONTRAT
           ════════════════════════════════════════════════════ */
        .contract-input-group {
          position: relative;
        }

        .contract-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: rgba(16, 185, 129, 0.9);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .contract-input {
          width: 100%;
          padding: 0.875rem 1rem;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3));
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 0.875rem;
          color: rgba(16, 185, 129, 0.95);
          font-size: 0.8125rem;
          transition: all 0.3s ease;
          font-weight: 500;
        }
        .contract-input:focus {
          outline: none;
          background: rgba(0, 0, 0, 0.6);
          border-color: rgba(16, 185, 129, 0.6);
          box-shadow: 
            0 0 0 3px rgba(16, 185, 129, 0.15),
            0 0 25px rgba(16, 185, 129, 0.2);
        }
        .contract-input::placeholder {
          color: rgba(16, 185, 129, 0.4);
        }

        /* ════════════════════════════════════════════════════
           BOUTONS DE NAVIGATION
           ════════════════════════════════════════════════════ */
        .contract-nav-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 700;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .contract-nav-btn-primary {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(16, 185, 129, 0.7));
          border: 1px solid rgba(16, 185, 129, 1);
          color: rgb(15, 23, 42);
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.4);
        }
        .contract-nav-btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(16, 185, 129, 1), rgba(16, 185, 129, 0.9));
          box-shadow: 0 0 40px rgba(16, 185, 129, 0.6);
          transform: translateY(-2px);
        }
        .contract-nav-btn-primary:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .contract-nav-btn-secondary {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: rgba(16, 185, 129, 0.9);
        }
        .contract-nav-btn-secondary:hover:not(:disabled) {
          background: rgba(16, 185, 129, 0.2);
          border-color: rgba(16, 185, 129, 0.5);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
        }
        .contract-nav-btn-secondary:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        /* ════════════════════════════════════════════════════
           BOUTONS D'ACTION
           ════════════════════════════════════════════════════ */
        .contract-action-btn {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 1rem 1.75rem;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 800;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          position: relative;
          overflow: hidden;
        }

        .contract-action-btn-green {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.9));
          border: 1px solid rgba(16, 185, 129, 1);
          color: rgb(15, 23, 42);
          box-shadow: 0 0 35px rgba(16, 185, 129, 0.5);
        }
        .contract-action-btn-green:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(16, 185, 129, 1), rgba(5, 150, 105, 1));
          box-shadow: 0 0 50px rgba(16, 185, 129, 0.7);
          transform: translateY(-3px) scale(1.02);
        }

        .contract-action-btn-emerald {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(16, 185, 129, 0.85));
          border: 1px solid rgba(16, 185, 129, 1);
          color: rgb(15, 23, 42);
          box-shadow: 0 0 35px rgba(16, 185, 129, 0.5);
        }
        .contract-action-btn-emerald:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(16, 185, 129, 1), rgba(16, 185, 129, 0.95));
          box-shadow: 0 0 50px rgba(16, 185, 129, 0.7);
          transform: translateY(-3px) scale(1.02);
        }

        .contract-action-btn-amber {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.95), rgba(245, 158, 11, 0.9));
          border: 1px solid rgba(251, 191, 36, 1);
          color: rgb(15, 23, 42);
          box-shadow: 0 0 35px rgba(251, 191, 36, 0.5);
        }
        .contract-action-btn-amber:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(251, 191, 36, 1), rgba(245, 158, 11, 1));
          box-shadow: 0 0 50px rgba(251, 191, 36, 0.7);
          transform: translateY(-3px) scale(1.02);
        }

        .contract-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ════════════════════════════════════════════════════
           APERÇU DU CONTRAT
           ════════════════════════════════════════════════════ */
        .contract-preview-container {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.6));
          border: 2px solid rgba(16, 185, 129, 0.4);
          border-radius: 1.5rem;
          overflow: hidden;
          box-shadow: 0 0 50px rgba(16, 185, 129, 0.3);
        }

        .contract-preview-header {
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(251, 191, 36, 0.1));
          border-bottom: 1px solid rgba(16, 185, 129, 0.3);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .contract-preview-body {
          padding: 2rem;
          max-height: 600px;
          overflow-y: auto;
        }

        .contract-article {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(16, 185, 129, 0.15);
        }

        .contract-article-title {
          font-size: 1rem;
          font-weight: 800;
          color: rgba(251, 191, 36, 0.95);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
        }

        .contract-article-number {
          font-size: 0.875rem;
          font-weight: 800;
          color: rgba(16, 185, 129, 0.95);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }

        .contract-article-text {
          font-size: 0.8125rem;
          line-height: 1.7;
          color: rgba(226, 232, 240, 0.9);
          text-align: justify;
        }

        /* ════════════════════════════════════════════════════
           ZONES DE SIGNATURE
           ════════════════════════════════════════════════════ */
        .signature-box {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(251, 191, 36, 0.05));
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 1rem;
          padding: 1.25rem;
        }

        .signature-canvas-container {
          background: rgba(255, 255, 255, 0.95);
          border: 2px dashed rgba(16, 185, 129, 0.4);
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .signature-canvas {
          width: 100%;
          height: 150px;
          cursor: crosshair;
        }

        .signature-box-print {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(251, 191, 36, 0.03));
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 1rem;
          padding: 1.25rem;
        }

        /* ════════════════════════════════════════════════════
           RESPONSIVE
           ════════════════════════════════════════════════════ */
        @media (max-width: 768px) {
          .contract-preview-body {
            padding: 1.25rem;
            max-height: 500px;
          }

          .contract-action-btn {
            padding: 0.875rem 1.25rem;
            font-size: 0.75rem;
          }

          .contract-nav-btn {
            padding: 0.75rem 1.25rem;
            font-size: 0.75rem;
          }

          .signature-canvas {
            height: 120px;
          }
        }

        /* ════════════════════════════════════════════════════
           IMPRESSION PDF
           ════════════════════════════════════════════════════ */
        @media print {
          .contract-preview-container {
            border: none;
            box-shadow: none;
            background: white;
          }

          .contract-preview-body {
            max-height: none;
            overflow: visible;
          }

          .contract-article-text {
            color: black;
          }

          .contract-article-title,
          .contract-article-number {
            color: #059669;
          }

          button {
            display: none;
          }
        }

        /* ════════════════════════════════════════════════════
           UTILITAIRES
           ════════════════════════════════════════════════════ */
        .text-gradient-emerald {
          background: linear-gradient(135deg, rgb(16, 185, 129), rgb(5, 150, 105));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .text-gradient-gold {
          background: linear-gradient(135deg, rgb(251, 191, 36), rgb(245, 158, 11));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  );
                      }
