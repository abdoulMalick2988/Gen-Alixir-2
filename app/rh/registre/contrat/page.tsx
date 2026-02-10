"use client";

import React, { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // Assure-toi que ce chemin est correct
import SignatureCanvas from "react-signature-canvas";
import {
  ArrowLeft, FileText, Sparkles, Download, Save,
  ChevronRight, User, Building2, Calendar,
  FileCheck, Globe, Pen, Printer, Shield, Award,
  MapPin, Hash, Briefcase, Clock, AlertCircle
} from "lucide-react";

// --- TYPES (Pour éviter les erreurs Vercel) ---
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

export default function ContractGenerator() {
  const router = useRouter();
  
  // --- ÉTATS (STATE) ---
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [contractMode, setContractMode] = useState<ContractMode>("electronic");
  const [saving, setSaving] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);

  // Refs pour les signatures
  const employeeSignRef = useRef<SignatureCanvas>(null);
  
  // Données
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

  // --- HELPERS ---
  const updateStaffInfo = (field: keyof StaffInfo, value: string) => {
    setStaffInfo(prev => ({ ...prev, [field]: value }));
  };

  const updateEmployerInfo = (field: keyof EmployerInfo, value: string) => {
    setEmployerInfo(prev => ({ ...prev, [field]: value }));
  };

  const updateContractDetails = (field: keyof ContractDetails, value: string) => {
    setContractDetails(prev => ({ ...prev, [field]: value }));
  };

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

  // --- SAUVEGARDE SUPABASE ---
  const saveContract = useCallback(async () => {
    setSaving(true);
    try {
      // Récupération sécurisée de la signature
      const employeeSign = employeeSignRef.current 
        ? employeeSignRef.current.toDataURL() 
        : "";

      // 1. Sauvegarde dans la table 'contracts'
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

      // 2. Sauvegarde dans la table 'staff' (Registre)
      const staffData = {
        name: staffInfo.fullName, // Assure-toi que la colonne s'appelle 'name' ou 'full_name' dans ta DB
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

      alert("✨ Contrat sauvegardé et collaborateur ajouté au registre !");
      router.push("/rh/registre");

    } catch (err) {
      console.error("Erreur sauvegarde:", err);
      alert("❌ Erreur lors de la sauvegarde. Vérifiez la console.");
    } finally {
      setSaving(false);
    }
  }, [staffInfo, employerInfo, contractDetails, router]);

  // --- GÉNÉRATION PDF (Impression) ---
  const handlePrint = () => {
    setGenerating(true);
    setTimeout(() => {
      window.print();
      setGenerating(false);
    }, 500);
  };

  const totalSteps = 3;
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen relative bg-slate-950 flex justify-center items-center py-6 px-4 overflow-hidden font-sans">
      
      {/* ═══ FOND HOLOGRAPHIQUE DEEP SPACE ═══ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950" />
        <div className="absolute top-1/4 -left-32 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[150px]" />
        
        {/* Grille Cyberpunk */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ 
          backgroundImage: "linear-gradient(rgba(16, 185, 129, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.4) 1px, transparent 1px)",
          backgroundSize: "70px 70px"
        }} />
      </div>

      {/* ═══ CONTENEUR PRINCIPAL GLASS ═══ */}
      <div className="relative z-10 w-full max-w-[1600px] h-[90vh] flex flex-col bg-slate-900/60 backdrop-blur-2xl border border-emerald-500/30 rounded-[2.5rem] shadow-[0_0_60px_-15px_rgba(16,185,129,0.3)] overflow-hidden">
        
        {/* HEADER */}
        <div className="relative p-6 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 to-slate-900/40 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-all text-emerald-400">
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-emerald-400" />
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-200 to-emerald-400">
                  ENGINE L1 <span className="text-slate-500 mx-2">//</span> GÉNÉRATEUR
                </h1>
              </div>
              <p className="text-[10px] text-emerald-500/60 font-mono tracking-widest uppercase mt-1">
                Système de contractualisation intelligent v2.4
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-slate-950/50 p-1 rounded-xl border border-emerald-500/20">
            <button 
              onClick={() => setContractMode("electronic")}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${contractMode === "electronic" ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" : "text-emerald-500/50 hover:text-emerald-400"}`}
            >
              <Pen size={14} /> Électronique
            </button>
            <button 
              onClick={() => setContractMode("print")}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${contractMode === "print" ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "text-amber-500/50 hover:text-amber-400"}`}
            >
              <Printer size={14} /> Impression
            </button>
          </div>
        </div>

        {/* BARRE DE PROGRESSION */}
        <div className="px-6 py-4 bg-slate-900/30">
          <div className="flex justify-between text-xs font-bold text-emerald-500/70 mb-2 uppercase tracking-wider">
            <span>Progression de la procédure</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500 transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>

        {/* CONTENU SCROLLABLE */}
        <div className="flex-1 overflow-y-auto custom-scroll p-6 md:p-10">
          <div className="max-w-5xl mx-auto">
            
            {/* ÉTAPE 1 : STAGIAIRE */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-slideIn">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30">
                    <User size={32} className="text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Informations Collaborateur</h2>
                    <p className="text-slate-400">Identité et coordonnées du futur signataire</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-500/70 uppercase ml-1">Nom Complet</label>
                    <input type="text" value={staffInfo.fullName} onChange={(e) => updateStaffInfo("fullName", e.target.value)} className="cyber-input w-full" placeholder="Ex: Jean Dupont" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-500/70 uppercase ml-1">Nationalité</label>
                    <select value={staffInfo.nationality} onChange={(e) => updateStaffInfo("nationality", e.target.value)} className="cyber-input w-full">
                      <option value="Sénégalaise">Sénégalaise</option>
                      <option value="Burundaise">Burundaise</option>
                      <option value="Française">Française</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-500/70 uppercase ml-1">N° CNI / Passeport</label>
                    <input type="text" value={staffInfo.idNumber} onChange={(e) => updateStaffInfo("idNumber", e.target.value)} className="cyber-input w-full" placeholder="ID Unique" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-500/70 uppercase ml-1">Date de Naissance</label>
                    <input type="date" value={staffInfo.birthDate} onChange={(e) => updateStaffInfo("birthDate", e.target.value)} className="cyber-input w-full" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-500/70 uppercase ml-1">Lieu de Naissance</label>
                    <input type="text" value={staffInfo.birthPlace} onChange={(e) => updateStaffInfo("birthPlace", e.target.value)} className="cyber-input w-full" placeholder="Ville, Pays" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-500/70 uppercase ml-1">Téléphone</label>
                    <input type="tel" value={staffInfo.phone} onChange={(e) => updateStaffInfo("phone", e.target.value)} className="cyber-input w-full" placeholder="+257 ..." />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-emerald-500/70 uppercase ml-1">Adresse Complète</label>
                    <input type="text" value={staffInfo.address} onChange={(e) => updateStaffInfo("address", e.target.value)} className="cyber-input w-full" placeholder="Adresse de résidence" />
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 2 : EMPLOYEUR */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-slideIn">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30">
                    <Building2 size={32} className="text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Informations Employeur</h2>
                    <p className="text-slate-400">Entité juridique émettrice du contrat</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-amber-500/70 uppercase ml-1">Raison Sociale</label>
                    <input type="text" value={employerInfo.companyName} onChange={(e) => updateEmployerInfo("companyName", e.target.value)} className="cyber-input-amber w-full" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-amber-500/70 uppercase ml-1">Forme Juridique</label>
                    <input type="text" value={employerInfo.legalForm} onChange={(e) => updateEmployerInfo("legalForm", e.target.value)} className="cyber-input-amber w-full" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-amber-500/70 uppercase ml-1">RCCM</label>
                    <input type="text" value={employerInfo.rccm} onChange={(e) => updateEmployerInfo("rccm", e.target.value)} className="cyber-input-amber w-full" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-amber-500/70 uppercase ml-1">NIF</label>
                    <input type="text" value={employerInfo.nif} onChange={(e) => updateEmployerInfo("nif", e.target.value)} className="cyber-input-amber w-full" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-amber-500/70 uppercase ml-1">Siège Social</label>
                    <input type="text" value={employerInfo.address} onChange={(e) => updateEmployerInfo("address", e.target.value)} className="cyber-input-amber w-full" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-amber-500/70 uppercase ml-1">Représentant</label>
                    <input type="text" value={employerInfo.representativeName} onChange={(e) => updateEmployerInfo("representativeName", e.target.value)} className="cyber-input-amber w-full" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-amber-500/70 uppercase ml-1">Qualité / Titre</label>
                    <input type="text" value={employerInfo.representativeTitle} onChange={(e) => updateEmployerInfo("representativeTitle", e.target.value)} className="cyber-input-amber w-full" />
                  </div>
                </div>
              </div>
            )}
            {/* ÉTAPE 3 : DÉTAILS & VALIDATION */}
            {currentStep === 3 && (
              <div className="space-y-8 animate-slideIn">
                
                {/* Formulaire Détails */}
                <div className="bg-slate-800/40 p-6 rounded-2xl border border-emerald-500/20">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                      <FileText size={24} className="text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Termes du Contrat</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-emerald-500/70 uppercase ml-1">Type de Contrat</label>
                      <select value={contractDetails.type} onChange={(e) => updateContractDetails("type", e.target.value as ContractType)} className="cyber-input w-full">
                        <option value="CDI">CDI - Indéterminée</option>
                        <option value="CDD">CDD - Déterminée</option>
                        <option value="Stage">Stage Professionnel</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-emerald-500/70 uppercase ml-1">Pays de Législation</label>
                      <select value={contractDetails.country} onChange={(e) => updateContractDetails("country", e.target.value as Country)} className="cyber-input w-full">
                        <option value="Sénégal">Sénégal</option>
                        <option value="Burundi">Burundi</option>
                        <option value="France">France</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-emerald-500/70 uppercase ml-1">Date de Début</label>
                      <input type="date" value={contractDetails.startDate} onChange={(e) => updateContractDetails("startDate", e.target.value)} className="cyber-input w-full" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-emerald-500/70 uppercase ml-1">Durée / Fin (si CDD/Stage)</label>
                      <input type="text" value={contractDetails.duration} onChange={(e) => updateContractDetails("duration", e.target.value)} className="cyber-input w-full" placeholder="Ex: 6 mois" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-emerald-500/70 uppercase ml-1">Poste Occupé</label>
                      <input type="text" value={contractDetails.position} onChange={(e) => updateContractDetails("position", e.target.value)} className="cyber-input w-full" placeholder="Ex: Développeur Web" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-emerald-500/70 uppercase ml-1">Salaire Mensuel (FCFA/FBU)</label>
                      <input type="number" value={contractDetails.salary} onChange={(e) => updateContractDetails("salary", e.target.value)} className="cyber-input w-full" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-emerald-500/70 uppercase ml-1">Département</label>
                      <input type="text" value={contractDetails.department} onChange={(e) => updateContractDetails("department", e.target.value)} className="cyber-input w-full" placeholder="Ex: Technique" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-emerald-500/70 uppercase ml-1">Volume Horaire</label>
                      <input type="text" value={contractDetails.workHours} onChange={(e) => updateContractDetails("workHours", e.target.value)} className="cyber-input w-full" placeholder="Ex: 40h / semaine" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-bold text-emerald-500/70 uppercase ml-1">Missions Principales</label>
                      <textarea value={contractDetails.tasks} onChange={(e) => updateContractDetails("tasks", e.target.value)} className="cyber-input w-full h-24" placeholder="Décrire les responsabilités..." />
                    </div>
                  </div>
                </div>

                {/* ═══ APERÇU DU CONTRAT (PREVIEW PAPIER) ═══ */}
                <div className="bg-white text-slate-900 p-8 md:p-12 rounded-xl shadow-2xl relative overflow-hidden print-area">
                  
                  {/* Filigrane discret pour l'impression */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center">
                    <Shield size={400} />
                  </div>

                  <div className="relative z-10 space-y-6 text-sm md:text-base font-serif leading-relaxed">
                    
                    {/* TITRE CONTRAT */}
                    <div className="text-center border-b-2 border-slate-900 pb-4 mb-8">
                      <h1 className="text-2xl font-black uppercase tracking-widest">
                        {contractDetails.type === "Stage" ? "CONVENTION DE STAGE" : "CONTRAT DE TRAVAIL"}
                      </h1>
                      <p className="text-xs text-slate-500 mt-2 font-sans">Réf: {employerInfo.rccm} / {new Date().getFullYear()}</p>
                    </div>

                    {/* PARTIES */}
                    <div className="space-y-4">
                      <p className="text-justify">
                        <strong>ENTRE LES SOUSSIGNÉS :</strong>
                      </p>
                      <p className="text-justify pl-4 border-l-4 border-slate-900">
                        La société <strong>{employerInfo.companyName}</strong>, {employerInfo.legalForm}, 
                        au capital de {employerInfo.capital}, immatriculée au RCCM sous le numéro {employerInfo.rccm}, 
                        dont le siège social est situé à {employerInfo.address}, représentée par <strong>{employerInfo.representativeName}</strong> 
                        en sa qualité de {employerInfo.representativeTitle}.
                        <br/><span className="italic text-slate-500">Ci-après dénommée "L'Employeur"</span>
                      </p>
                      <p className="text-center font-bold text-xs uppercase my-2">- D'UNE PART -</p>
                      <p className="text-justify pl-4 border-l-4 border-slate-300">
                        M./Mme <strong>{staffInfo.fullName}</strong>, né(e) le {staffInfo.birthDate} à {staffInfo.birthPlace}, 
                        de nationalité {staffInfo.nationality}, titulaire de la pièce d'identité N° {staffInfo.idNumber}, 
                        demeurant à {staffInfo.address}.
                        <br/><span className="italic text-slate-500">Ci-après dénommé(e) "Le Collaborateur"</span>
                      </p>
                      <p className="text-center font-bold text-xs uppercase my-2">- D'AUTRE PART -</p>
                    </div>

                    {/* ARTICLES */}
                    <div className="space-y-4 mt-8">
                      <p className="text-xs text-slate-400 text-center mb-4">{getLegalReference()}</p>
                      
                      <h3 className="font-bold uppercase border-b border-slate-200 inline-block">Article 1 : Engagement</h3>
                      <p className="text-justify">
                        Le Collaborateur est engagé en qualité de <strong>{contractDetails.position}</strong>, sous contrat de type <strong>{contractDetails.type}</strong>. 
                        Le présent contrat prend effet à compter du <strong>{new Date(contractDetails.startDate).toLocaleDateString()}</strong> 
                        {contractDetails.duration && ` pour une durée de ${contractDetails.duration}`}.
                      </p>

                      <h3 className="font-bold uppercase border-b border-slate-200 inline-block mt-4">Article 2 : Rémunération</h3>
                      <p className="text-justify">
                        En contrepartie de ses services, le Collaborateur percevra une rémunération mensuelle nette de <strong>{Number(contractDetails.salary).toLocaleString()}</strong>.
                      </p>

                      <h3 className="font-bold uppercase border-b border-slate-200 inline-block mt-4">Article 3 : Obligations</h3>
                      <p className="text-justify">
                        Le Collaborateur s'engage à consacrer tout son temps professionnel à l'entreprise selon un volume horaire de {contractDetails.workHours}. 
                        Ses missions principales sont : {contractDetails.tasks || "Définies dans la fiche de poste annexe"}.
                      </p>
                    </div>

                    {/* SIGNATURES */}
                    <div className="mt-16 grid grid-cols-2 gap-8 break-inside-avoid">
                      <div className="border border-slate-200 p-4 rounded min-h-[150px] relative">
                        <p className="font-bold uppercase text-xs mb-4">Pour L'Employeur</p>
                        <p className="text-xs text-slate-500 mb-8">(Lu et approuvé)</p>
                        <div className="absolute bottom-4 left-4 font-script text-lg text-slate-800">
                          {employerInfo.representativeName}
                        </div>
                      </div>

                      <div className="border border-slate-200 p-4 rounded min-h-[150px] relative bg-slate-50">
                        <p className="font-bold uppercase text-xs mb-2">Le Collaborateur</p>
                        <p className="text-xs text-slate-500 mb-2">(Lu et approuvé)</p>
                        
                        {/* ZONE DE SIGNATURE ÉLECTRONIQUE */}
                        <div className="border-2 border-dashed border-emerald-500/30 rounded bg-white relative">
                          <SignatureCanvas 
                            ref={employeeSignRef}
                            penColor="black"
                            canvasProps={{
                              className: "w-full h-24 cursor-crosshair",
                            }}
                          />
                          <button 
                            onClick={() => employeeSignRef.current?.clear()}
                            className="absolute bottom-1 right-1 text-[10px] text-red-400 hover:text-red-600 bg-white/80 px-1 rounded border border-red-200"
                          >
                            Effacer
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-center text-[10px] text-slate-400 mt-8 border-t pt-2">
                      Fait à {contractDetails.workLocation}, le {new Date().toLocaleDateString()} en deux exemplaires originaux.
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* ═══ FOOTER NAVIGATION ═══ */}
        <div className="p-6 border-t border-emerald-500/20 bg-slate-900/50 backdrop-blur-md flex justify-between items-center">
          
          <button 
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="px-6 py-3 rounded-xl border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Retour
          </button>

          <div className="flex gap-4">
            {currentStep < 3 ? (
              <button 
                onClick={() => setCurrentStep(prev => Math.min(3, prev + 1))}
                className="px-8 py-3 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
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
                  Imprimer
                </button>
                <button 
                  onClick={saveContract}
                  disabled={saving}
                  className="px-8 py-3 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent animate-spin rounded-full"/> : <Save size={16} />}
                  {saving ? "Sauvegarde..." : "Valider le Contrat"}
                </button>
              </>
            )}
          </div>
        </div>

      </div>

      {/* ═══ STYLES CSS (INDISPENSABLE POUR LE LOOK) ═══ */}
      <style jsx global>{`
        /* Défilement fluide */
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(16, 185, 129, 0.05);
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.2);
          border-radius: 10px;
        }
        
        /* Inputs Futuristes */
        .cyber-input {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: white;
          padding: 12px 16px;
          border-radius: 12px;
          transition: all 0.3s ease;
          outline: none;
        }
        .cyber-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
          background: rgba(15, 23, 42, 0.8);
        }

        .cyber-input-amber {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: white;
          padding: 12px 16px;
          border-radius: 12px;
          transition: all 0.3s ease;
          outline: none;
        }
        .cyber-input-amber:focus {
          border-color: #f59e0b;
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.2);
        }

        /* Animations */
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.4s ease-out forwards;
        }
        
        /* MODE IMPRESSION */
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border-radius: 0 !important;
            background: white !important;
            color: black !important;
          }
          /* Cacher les éléments UI lors de l'impression */
          button, .cyber-input, label, .fixed, .custom-scroll::-webkit-scrollbar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
