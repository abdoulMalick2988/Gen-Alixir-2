"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft, Home, FileText, User, Briefcase, DollarSign,
  Calendar, MapPin, Mail, Phone, Download, Check, X,
  Pen, Save, Send, Eye, EyeOff, Zap, Shield, Activity,
  Building2, CreditCard, Award, Flag, Users, Hash, Edit3,
  CheckCircle2, AlertCircle, ChevronRight, Sparkles, Clock
} from "lucide-react";
import jsPDF from "jspdf";

/* ═══════════════════════════════════════════════════════════════
   TYPES & INTERFACES
   ═══════════════════════════════════════════════════════════════ */

type ContractType = "CDI" | "CDD" | "Stage" | "Freelance" | "Consultation";
type Gender = "Homme" | "Femme" | "Autre";

interface ContractData {
  // Informations personnelles
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  gender: Gender;
  address: string;
  emergencyContact: string;
  
  // Informations professionnelles
  position: string;
  department: string;
  contractType: ContractType;
  startDate: string;
  endDate: string; // Pour CDD
  
  // Rémunération
  baseSalary: number;
  currency: string;
  paymentFrequency: string;
  primeType: string;
  primeAmount: number;
  
  // Avantages
  healthInsurance: boolean;
  transportAllowance: number;
  mealAllowance: number;
  housingAllowance: number;
  
  // Conditions de travail
  workSchedule: string;
  weeklyHours: number;
  paidLeaveDays: number;
  probationPeriod: number;
  noticePeriod: number;
  
  // Signature
  signature: string;
  signatureDate: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function ContractGenerator() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  /* ═══════════════════════════════════════════════════════════════
     ÉTAT DU FORMULAIRE AVEC VALEURS PAR DÉFAUT
     ═══════════════════════════════════════════════════════════════ */
  
  const [formData, setFormData] = useState<ContractData>({
    // Informations personnelles
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    nationality: "Sénégal",
    gender: "Homme",
    address: "",
    emergencyContact: "",
    
    // Informations professionnelles
    position: "",
    department: "Technique",
    contractType: "CDI",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    
    // Rémunération
    baseSalary: 0,
    currency: "FCFA",
    paymentFrequency: "Mensuel",
    primeType: "",
    primeAmount: 0,
    
    // Avantages
    healthInsurance: false,
    transportAllowance: 0,
    mealAllowance: 0,
    housingAllowance: 0,
    
    // Conditions de travail
    workSchedule: "Lundi - Vendredi, 8h - 17h",
    weeklyHours: 40,
    paidLeaveDays: 30,
    probationPeriod: 3,
    noticePeriod: 30,
    
    // Signature
    signature: "",
    signatureDate: ""
  });

  /* ═══════════════════════════════════════════════════════════════
     GESTION DU CANVAS DE SIGNATURE
     ═══════════════════════════════════════════════════════════════ */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Configuration du canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;
    
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setFormData(prev => ({ ...prev, signature: canvas.toDataURL() }));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setFormData(prev => ({ ...prev, signature: "" }));
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     VALIDATION DU FORMULAIRE
     ═══════════════════════════════════════════════════════════════ */

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Informations personnelles
    if (!formData.fullName.trim()) errors.fullName = "Le nom complet est requis";
    if (!formData.email.trim()) errors.email = "L'email est requis";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email invalide";
    }
    if (!formData.phone.trim()) errors.phone = "Le téléphone est requis";
    if (!formData.dateOfBirth) errors.dateOfBirth = "La date de naissance est requise";
    if (!formData.address.trim()) errors.address = "L'adresse est requise";

    // Informations professionnelles
    if (!formData.position.trim()) errors.position = "Le poste est requis";
    if (!formData.startDate) errors.startDate = "La date de début est requise";
    if (formData.contractType === "CDD" && !formData.endDate) {
      errors.endDate = "La date de fin est requise pour un CDD";
    }

    // Rémunération
    if (formData.baseSalary <= 0) errors.baseSalary = "Le salaire doit être supérieur à 0";

    // Signature
    if (!formData.signature) errors.signature = "La signature est requise";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ═══════════════════════════════════════════════════════════════
     GÉNÉRATION DU PDF
     ═══════════════════════════════════════════════════════════════ */

  const generatePDF = async () => {
    if (!validateForm()) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPosition = 20;

      // En-tête
      doc.setFontSize(20);
      doc.setTextColor(16, 185, 129);
      doc.text("CONTRAT DE TRAVAIL", pageWidth / 2, yPosition, { align: "center" });
      
      yPosition += 15;
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Type: ${formData.contractType}`, pageWidth / 2, yPosition, { align: "center" });
      
      yPosition += 20;

      // Informations personnelles
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("INFORMATIONS PERSONNELLES", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      const personalInfo = [
        `Nom complet: ${formData.fullName}`,
        `Date de naissance: ${formData.dateOfBirth}`,
        `Nationalité: ${formData.nationality}`,
        `Genre: ${formData.gender}`,
        `Email: ${formData.email}`,
        `Téléphone: ${formData.phone}`,
        `Adresse: ${formData.address}`,
        `Contact d'urgence: ${formData.emergencyContact || "Non spécifié"}`,
      ];

      personalInfo.forEach(line => {
        doc.text(line, 20, yPosition);
        yPosition += 7;
      });

      yPosition += 10;

      // Informations professionnelles
      doc.setFontSize(14);
      doc.text("INFORMATIONS PROFESSIONNELLES", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      const professionalInfo = [
        `Poste: ${formData.position}`,
        `Département: ${formData.department}`,
        `Type de contrat: ${formData.contractType}`,
        `Date de début: ${formData.startDate}`,
        formData.contractType === "CDD" ? `Date de fin: ${formData.endDate}` : "",
        `Période d'essai: ${formData.probationPeriod} mois`,
        `Préavis: ${formData.noticePeriod} jours`,
      ].filter(Boolean);

      professionalInfo.forEach(line => {
        doc.text(line, 20, yPosition);
        yPosition += 7;
      });

      yPosition += 10;

      // Rémunération
      doc.setFontSize(14);
      doc.text("RÉMUNÉRATION", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      const totalSalary = formData.baseSalary + formData.primeAmount;
      const remunerationInfo = [
        `Salaire de base: ${formData.baseSalary.toLocaleString()} ${formData.currency}`,
        formData.primeAmount > 0 ? `Prime (${formData.primeType}): ${formData.primeAmount.toLocaleString()} ${formData.currency}` : "",
        `Fréquence de paiement: ${formData.paymentFrequency}`,
        `Salaire total: ${totalSalary.toLocaleString()} ${formData.currency}`,
      ].filter(Boolean);

      remunerationInfo.forEach(line => {
        doc.text(line, 20, yPosition);
        yPosition += 7;
      });

      yPosition += 5;

      // Avantages
      const advantages = [];
      if (formData.healthInsurance) advantages.push("Assurance santé");
      if (formData.transportAllowance > 0) advantages.push(`Indemnité transport: ${formData.transportAllowance.toLocaleString()} ${formData.currency}`);
      if (formData.mealAllowance > 0) advantages.push(`Indemnité repas: ${formData.mealAllowance.toLocaleString()} ${formData.currency}`);
      if (formData.housingAllowance > 0) advantages.push(`Indemnité logement: ${formData.housingAllowance.toLocaleString()} ${formData.currency}`);

      if (advantages.length > 0) {
        doc.text("Avantages:", 20, yPosition);
        yPosition += 7;
        advantages.forEach(adv => {
          doc.text(`  - ${adv}`, 25, yPosition);
          yPosition += 7;
        });
      }

      yPosition += 10;

      // Conditions de travail
      doc.setFontSize(14);
      doc.text("CONDITIONS DE TRAVAIL", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      const workConditions = [
        `Horaires: ${formData.workSchedule}`,
        `Heures hebdomadaires: ${formData.weeklyHours}h`,
        `Congés payés: ${formData.paidLeaveDays} jours/an`,
      ];

      workConditions.forEach(line => {
        doc.text(line, 20, yPosition);
        yPosition += 7;
      });

      // Signature
      if (formData.signature) {
        yPosition += 15;
        doc.text("Signature de l'employé:", 20, yPosition);
        yPosition += 5;
        doc.addImage(formData.signature, "PNG", 20, yPosition, 50, 25);
        yPosition += 30;
        doc.text(`Date: ${formData.signatureDate || new Date().toLocaleDateString()}`, 20, yPosition);
      }

      // Télécharger le PDF
      doc.save(`Contrat_${formData.fullName.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
      
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      alert("Erreur lors de la génération du PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     SAUVEGARDE DANS LA BASE DE DONNÉES
     ═══════════════════════════════════════════════════════════════ */

  const saveToDatabase = async () => {
    if (!validateForm()) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSaving(true);

    try {
      const { data, error } = await supabase.from("staff").insert([
        {
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          date_of_birth: formData.dateOfBirth,
          nationality: formData.nationality,
          genre: formData.gender,
          address: formData.address,
          pco: formData.emergencyContact,
          role: formData.position,
          department: formData.department,
          contract_type: formData.contractType,
          start_date: formData.startDate,
          end_date: formData.endDate || null,
          salary: formData.baseSalary,
          prime: formData.primeAmount,
          prime_label: formData.primeType,
          status: "En ligne",
          payment_status: "En attente",
          health_insurance: formData.healthInsurance,
          transport_allowance: formData.transportAllowance,
          meal_allowance: formData.mealAllowance,
          housing_allowance: formData.housingAllowance,
          work_schedule: formData.workSchedule,
          weekly_hours: formData.weeklyHours,
          paid_leave_days: formData.paidLeaveDays,
          probation_period: formData.probationPeriod,
          notice_period: formData.noticePeriod,
          signature_data: formData.signature,
          signature_date: formData.signatureDate || new Date().toISOString(),
        }
      ]);

      if (error) throw error;

      alert("✅ Contrat sauvegardé avec succès !");
      
      // Générer le PDF après sauvegarde
      await generatePDF();
      
      // Rediriger vers le registre
      setTimeout(() => {
        router.push("/rh/registre");
      }, 2000);
      
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      alert("❌ Erreur lors de la sauvegarde du contrat");
    } finally {
      setIsSaving(false);
    }
  };

  // Calculer le salaire total
  const totalSalary = formData.baseSalary + formData.primeAmount + formData.transportAllowance + formData.mealAllowance + formData.housingAllowance;

  // Progression du formulaire
  const progress = (() => {
    let filledFields = 0;
    let totalFields = 0;

    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'endDate' && formData.contractType !== 'CDD') return;
      if (key === 'signature' || key === 'signatureDate') return;
      
      totalFields++;
      if (value !== "" && value !== 0 && value !== false) filledFields++;
    });

    return Math.round((filledFields / totalFields) * 100);
  })();

  /* ═══════════════════════════════════════════════════════════════
   PARTIE 2 - INTERFACE UTILISATEUR HOLOGRAPHIQUE
   ═══════════════════════════════════════════════════════════════ */

  return (
    <div className="min-h-screen relative bg-slate-950 overflow-hidden">
      
      {/* ═══ FOND HOLOGRAPHIQUE DEEP-SPACE (FIXE) ═══ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-900/15 via-transparent to-transparent" />
        
        <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/3 -right-20 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[130px] animate-float-delayed" />
        
        <div className="absolute inset-0 opacity-[0.05]" style={{ 
          backgroundImage: "linear-gradient(rgba(16, 185, 129, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(circle at center, black 30%, transparent 80%)"
        }} />

        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 1px, #fff 1px, #fff 2px)",
          backgroundSize: "100% 4px"
        }} />
      </div>

      {/* ═══ CONTENEUR PRINCIPAL SCROLLABLE ═══ */}
      <div className="relative z-10 min-h-screen py-6 px-4">
        <div className="max-w-[1800px] mx-auto">
          
          {/* ── HEADER AVEC NAVIGATION ── */}
          <header className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => router.push("/rh/registre")} 
                  className="group relative p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl hover:bg-emerald-500/20 transition-all"
                >
                  <ArrowLeft size={20} className="text-emerald-400 group-hover:-translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => router.push("/")} 
                  className="group relative p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl hover:bg-emerald-500/20 transition-all"
                >
                  <Home size={20} className="text-emerald-400" />
                </button>
                
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-emerald-500/20 rounded-lg animate-pulse">
                      <FileText size={24} className="text-emerald-400" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-400 to-emerald-200">
                      GÉNÉRATEUR DE CONTRAT
                    </h1>
                  </div>
                  <div className="flex items-center gap-3 px-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500/70 uppercase tracking-[0.2em]">
                      <Activity size={12} className="animate-pulse" /> Smart_Contract_AI
                    </span>
                    <span className="w-1 h-1 rounded-full bg-emerald-500/30" />
                    <span className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-[0.2em]">
                      Progress: {progress}%
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900/50 border border-emerald-500/30 rounded-2xl hover:border-emerald-400 transition-all"
              >
                {showPreview ? <EyeOff size={18} className="text-emerald-400" /> : <Eye size={18} className="text-emerald-400" />}
                <span className="text-emerald-400 font-bold text-sm">{showPreview ? "Masquer" : "Afficher"} Prévisualisation</span>
              </button>
            </div>

            {/* Barre de progression */}
            <div className="relative h-2 bg-slate-900/50 rounded-full overflow-hidden border border-emerald-500/20">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine" />
            </div>
          </header>

          {/* ── LAYOUT PRINCIPAL : FORMULAIRE + PRÉVISUALISATION ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* ═══ COLONNE FORMULAIRE (2/3) ═══ */}
            <div className={showPreview ? "lg:col-span-2" : "lg:col-span-3"}>
              <div className="space-y-6">

                {/* ━━━ SECTION 1: INFORMATIONS PERSONNELLES ━━━ */}
                <div className="contract-section-holo">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="section-icon-holo bg-cyan-500/20 border-cyan-500/40">
                      <User size={20} className="text-cyan-400" />
                    </div>
                    <h2 className="section-title-holo">Informations Personnelles</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="input-label-holo">
                        <Users size={14} />
                        Nom Complet *
                      </label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        className={`contract-input-holo ${validationErrors.fullName ? 'border-red-500' : ''}`}
                        placeholder="Ex: Jean Dupont"
                      />
                      {validationErrors.fullName && <p className="error-message-holo">{validationErrors.fullName}</p>}
                    </div>

                    <div>
                      <label className="input-label-holo">
                        <Mail size={14} />
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className={`contract-input-holo ${validationErrors.email ? 'border-red-500' : ''}`}
                        placeholder="email@exemple.com"
                      />
                      {validationErrors.email && <p className="error-message-holo">{validationErrors.email}</p>}
                    </div>

                    <div>
                      <label className="input-label-holo">
                        <Phone size={14} />
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className={`contract-input-holo ${validationErrors.phone ? 'border-red-500' : ''}`}
                        placeholder="+221 XX XXX XX XX"
                      />
                      {validationErrors.phone && <p className="error-message-holo">{validationErrors.phone}</p>}
                    </div>

                    <div>
                      <label className="input-label-holo">
                        <Calendar size={14} />
                        Date de Naissance *
                      </label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        className={`contract-input-holo ${validationErrors.dateOfBirth ? 'border-red-500' : ''}`}
                      />
                      {validationErrors.dateOfBirth && <p className="error-message-holo">{validationErrors.dateOfBirth}</p>}
                    </div>

                    <div>
                      <label className="input-label-holo">
                        <Flag size={14} />
                        Nationalité
                      </label>
                      <select
                        value={formData.nationality}
                        onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                        className="contract-input-holo"
                      >
                        <option value="Sénégal">Sénégal</option>
                        <option value="France">France</option>
                        <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                        <option value="Mali">Mali</option>
                        <option value="Burkina Faso">Burkina Faso</option>
                        <option value="Guinée">Guinée</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>

                    <div>
                      <label className="input-label-holo">
                        <User size={14} />
                        Genre
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as Gender }))}
                        className="contract-input-holo"
                      >
                        <option value="Homme">Homme</option>
                        <option value="Femme">Femme</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="input-label-holo">
                        <MapPin size={14} />
                        Adresse Complète *
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        className={`contract-input-holo ${validationErrors.address ? 'border-red-500' : ''}`}
                        placeholder="Ex: Dakar, Plateau"
                      />
                      {validationErrors.address && <p className="error-message-holo">{validationErrors.address}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="input-label-holo">
                        <Phone size={14} />
                        Contact d'Urgence
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                        className="contract-input-holo"
                        placeholder="Nom et numéro de téléphone"
                      />
                    </div>
                  </div>
                </div>

                {/* ━━━ SECTION 2: INFORMATIONS PROFESSIONNELLES ━━━ */}
                <div className="contract-section-holo">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="section-icon-holo bg-emerald-500/20 border-emerald-500/40">
                      <Briefcase size={20} className="text-emerald-400" />
                    </div>
                    <h2 className="section-title-holo">Informations Professionnelles</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label-holo">
                        <Award size={14} />
                        Poste *
                      </label>
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                        className={`contract-input-holo ${validationErrors.position ? 'border-red-500' : ''}`}
                        placeholder="Ex: Développeur Full Stack"
                      />
                      {validationErrors.position && <p className="error-message-holo">{validationErrors.position}</p>}
                    </div>

                    <div>
                      <label className="input-label-holo">
                        <Building2 size={14} />
                        Département
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                        className="contract-input-holo"
                      >
                        <option value="Technique">Technique</option>
                        <option value="Juridique">Juridique</option>
                        <option value="Finances">Finances</option>
                        <option value="Ressources Humaines">Ressources Humaines</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Management">Management</option>
                      </select>
                    </div>

                    <div>
                      <label className="input-label-holo">
                        <FileText size={14} />
                        Type de Contrat
                      </label>
                      <select
                        value={formData.contractType}
                        onChange={(e) => setFormData(prev => ({ ...prev, contractType: e.target.value as ContractType }))}
                        className="contract-input-holo"
                      >
                        <option value="CDI">CDI - Contrat à Durée Indéterminée</option>
                        <option value="CDD">CDD - Contrat à Durée Déterminée</option>
                        <option value="Stage">Stage</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Consultation">Consultation</option>
                      </select>
                    </div>

                    <div>
                      <label className="input-label-holo">
                        <Calendar size={14} />
                        Date de Début *
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className={`contract-input-holo ${validationErrors.startDate ? 'border-red-500' : ''}`}
                      />
                      {validationErrors.startDate && <p className="error-message-holo">{validationErrors.startDate}</p>}
                    </div>

                    {formData.contractType === "CDD" && (
                      <div>
                        <label className="input-label-holo">
                          <Calendar size={14} />
                          Date de Fin *
                        </label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                          className={`contract-input-holo ${validationErrors.endDate ? 'border-red-500' : ''}`}
                        />
                        {validationErrors.endDate && <p className="error-message-holo">{validationErrors.endDate}</p>}
                      </div>
                    )}

                    <div>
                      <label className="input-label-holo">
                        <Clock size={14} />
                        Période d'Essai (mois)
                      </label>
                      <input
                        type="number"
                        value={formData.probationPeriod}
                        onChange={(e) => setFormData(prev => ({ ...prev, probationPeriod: Number(e.target.value) }))}
                        className="contract-input-holo"
                        min="0"
                        max="6"
                      />
                    </div>

                    <div>
                      <label className="input-label-holo">
                        <AlertCircle size={14} />
                        Préavis (jours)
                      </label>
                      <input
                        type="number"
                        value={formData.noticePeriod}
                        onChange={(e) => setFormData(prev => ({ ...prev, noticePeriod: Number(e.target.value) }))}
                        className="contract-input-holo"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* ━━━ SECTION 3: RÉMUNÉRATION ━━━ */}
                <div className="contract-section-holo-premium">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="section-icon-holo-premium">
                      <DollarSign size={20} className="text-emerald-400" />
                    </div>
                    <h2 className="section-title-holo">Rémunération & Avantages</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label-holo">
                        <CreditCard size={14} />
                        Salaire de Base * (FCFA)
                      </label>
                      <input
                        type="number"
                        value={formData.baseSalary}
                        onChange={(e) => setFormData(prev => ({ ...prev, baseSalary: Number(e.target.value) }))}
                        className={`contract-input-holo ${validationErrors.baseSalary ? 'border-red-500' : ''}`}
                        placeholder="Ex: 500000"
                        min="0"
                      />
                      {validationErrors.baseSalary && <p className="error-message-holo">{validationErrors.baseSalary}</p>}
                    </div>

                    <div>
                      <label className="input-label-holo">
                        <Sparkles size={14} />
                        Type de Prime
                      </label>
                      <input
                        type="text"
                        value={formData.primeType}
                        onChange={(e) => setFormData(prev => ({ ...prev, primeType: e.target.value }))}
                        className="contract-input-holo"
                        placeholder="Ex: Performance, Ancienneté"
                      />
                    </div>

                    <div>
                      <label className="input-label-holo">
                        <Award size={14} />
                        Montant Prime (FCFA)
                      </label>
                      <input
                        type="number"
                        value={formData.primeAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, primeAmount: Number(e.target.value) }))}
                        className="contract-input-holo"
                        placeholder="Ex: 50000"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="input-label-holo">
                        <Calendar size={14} />
                        Fréquence de Paiement
                      </label>
                      <select
                        value={formData.paymentFrequency}
                        onChange={(e) => setFormData(prev => ({ ...prev, paymentFrequency: e.target.value }))}
                        className="contract-input-holo"
                      >
                        <option value="Mensuel">Mensuel</option>
                        <option value="Bimensuel">Bimensuel</option>
                        <option value="Hebdomadaire">Hebdomadaire</option>
                      </select>
                    </div>

                    {/* Avantages */}
                    <div className="md:col-span-2">
                      <label className="input-label-holo mb-3">
                        <Shield size={14} />
                        Avantages Sociaux
                      </label>
                      
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 bg-slate-900/30 border border-emerald-500/20 rounded-lg hover:border-emerald-500/40 transition-all cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.healthInsurance}
                            onChange={(e) => setFormData(prev => ({ ...prev, healthInsurance: e.target.checked }))}
                            className="w-5 h-5 rounded border-emerald-500/40 text-emerald-500 focus:ring-emerald-500/40"
                          />
                          <span className="text-sm text-emerald-300 font-semibold">Assurance Santé</span>
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-cyan-400 mb-1 block">Transport (FCFA)</label>
                            <input
                              type="number"
                              value={formData.transportAllowance}
                              onChange={(e) => setFormData(prev => ({ ...prev, transportAllowance: Number(e.target.value) }))}
                              className="contract-input-holo"
                              placeholder="0"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-cyan-400 mb-1 block">Repas (FCFA)</label>
                            <input
                              type="number"
                              value={formData.mealAllowance}
                              onChange={(e) => setFormData(prev => ({ ...prev, mealAllowance: Number(e.target.value) }))}
                              className="contract-input-holo"
                              placeholder="0"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-cyan-400 mb-1 block">Logement (FCFA)</label>
                            <input
                              type="number"
                              value={formData.housingAllowance}
                              onChange={(e) => setFormData(prev => ({ ...prev, housingAllowance: Number(e.target.value) }))}
                              className="contract-input-holo"
                              placeholder="0"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Salaire Total */}
                    <div className="md:col-span-2 p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-emerald-300">💰 SALAIRE TOTAL MENSUEL</span>
                        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                          {totalSalary.toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ━━━ SECTION 4: CONDITIONS DE TRAVAIL ━━━ */}
                <div className="contract-section-holo">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="section-icon-holo bg-violet-500/20 border-violet-500/40">
                      <Clock size={20} className="text-violet-400" />
                    </div>
                    <h2 className="section-title-holo">Conditions de Travail</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="input-label-holo">
                        <Calendar size={14} />
                        Horaires de Travail
                      </label>
                      <input
                        type="text"
                        value={formData.workSchedule}
                        onChange={(e) => setFormData(prev => ({ ...prev, workSchedule: e.target.value }))}
                        className="contract-input-holo"
                        placeholder="Ex: Lundi - Vendredi, 8h - 17h"
                      />
                    </div>

                    <div>
                      <label className="input-label-holo">
                        <Clock size={14} />
                        Heures Hebdomadaires
                      </label>
                      <input
                        type="number"
                        value={formData.weeklyHours}
                        onChange={(e) => setFormData(prev => ({ ...prev, weeklyHours: Number(e.target.value) }))}
                        className="contract-input-holo"
                        min="0"
                        max="60"
                      />
                    </div>

                    <div>
                      <label className="input-label-holo">
                        <Calendar size={14} />
                        Congés Payés (jours/an)
                      </label>
                      <input
                        type="number"
                        value={formData.paidLeaveDays}
                        onChange={(e) => setFormData(prev => ({ ...prev, paidLeaveDays: Number(e.target.value) }))}
                        className="contract-input-holo"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* ━━━ SECTION 5: SIGNATURE ÉLECTRONIQUE ━━━ */}
                <div className="contract-section-holo">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="section-icon-holo bg-amber-500/20 border-amber-500/40">
                      <Pen size={20} className="text-amber-400" />
                    </div>
                    <h2 className="section-title-holo">Signature Électronique *</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-[200px] bg-slate-900/50 border-2 border-dashed border-emerald-500/30 rounded-xl cursor-crosshair hover:border-emerald-500/50 transition-all"
                      />
                      {!formData.signature && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <p className="text-emerald-500/40 text-sm font-semibold">✍️ Signez ici avec votre souris ou doigt</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={clearSignature}
                        type="button"
                        className="flex-1 px-4 py-3 bg-slate-900/50 border border-red-500/30 rounded-xl text-red-400 font-bold text-sm hover:bg-red-500/10 hover:border-red-500/50 transition-all flex items-center justify-center gap-2"
                      >
                        <X size={16} />
                        Effacer
                      </button>
                      <div className="flex-1 px-4 py-3 bg-slate-900/50 border border-emerald-500/30 rounded-xl">
                        <input
                          type="date"
                          value={formData.signatureDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, signatureDate: e.target.value }))}
                          className="w-full bg-transparent text-emerald-300 text-sm font-semibold outline-none"
                          placeholder="Date de signature"
                        />
                      </div>
                    </div>
                    {validationErrors.signature && <p className="error-message-holo">{validationErrors.signature}</p>}
                  </div>
                </div>

                {/* ━━━ BOUTONS D'ACTION PRINCIPAUX ━━━ */}
                <div className="sticky bottom-6 z-20 flex gap-4 p-4 bg-slate-950/80 backdrop-blur-xl border border-emerald-500/30 rounded-2xl shadow-2xl">
                  <button
                    onClick={generatePDF}
                    disabled={isGenerating}
                    type="button"
                    className="flex-1 group relative px-6 py-4 bg-gradient-to-r from-cyan-500/90 to-emerald-500/90 rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] animate-shine" />
                    <div className="relative flex items-center justify-center gap-2 text-slate-950 font-black text-sm">
                      {isGenerating ? (
                        <>
                          <div className="w-5 h-5 border-3 border-slate-950 border-t-transparent animate-spin rounded-full" />
                          Génération...
                        </>
                      ) : (
                        <>
                          <Download size={18} />
                          TÉLÉCHARGER PDF
                        </>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={saveToDatabase}
                    disabled={isSaving}
                    type="button"
                    className="flex-1 group relative px-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] animate-shine" />
                    <div className="relative flex items-center justify-center gap-2 text-slate-950 font-black text-sm">
                      {isSaving ? (
                        <>
                          <div className="w-5 h-5 border-3 border-slate-950 border-t-transparent animate-spin rounded-full" />
                          Sauvegarde...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          SAUVEGARDER & GÉNÉRER
                        </>
                      )}
                    </div>
                  </button>
                </div>

              </div>
            </div>

/* ═══════════════════════════════════════════════════════════════
   PARTIE 3 FINALE - PRÉVISUALISATION + STYLES HOLOGRAPHIQUES
   ═══════════════════════════════════════════════════════════════ */

            {/* ═══ COLONNE PRÉVISUALISATION (1/3) ═══ */}
            {showPreview && (
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-4">
                  
                  {/* Carte Prévisualisation */}
                  <div className="preview-card-holo">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-emerald-500/20">
                      <div className="flex items-center gap-2">
                        <Eye size={18} className="text-emerald-400" />
                        <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider">Prévisualisation Live</h3>
                      </div>
                      <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-lg">
                        <span className="text-xs font-bold text-emerald-400">{progress}%</span>
                      </div>
                    </div>

                    <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto custom-scroll pr-2">
                      
                      {/* Identité */}
                      {formData.fullName && (
                        <div className="preview-section-holo">
                          <div className="flex items-center gap-2 mb-3">
                            <User size={14} className="text-cyan-400" />
                            <h4 className="preview-section-title-holo">Identité</h4>
                          </div>
                          <div className="space-y-2">
                            <div className="preview-item-holo">
                              <span className="preview-label-holo">Nom</span>
                              <span className="preview-value-holo">{formData.fullName}</span>
                            </div>
                            {formData.dateOfBirth && (
                              <div className="preview-item-holo">
                                <span className="preview-label-holo">Né(e) le</span>
                                <span className="preview-value-holo">{new Date(formData.dateOfBirth).toLocaleDateString()}</span>
                              </div>
                            )}
                            {formData.nationality && (
                              <div className="preview-item-holo">
                                <span className="preview-label-holo">Nationalité</span>
                                <span className="preview-value-holo">{formData.nationality}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Contact */}
                      {(formData.email || formData.phone) && (
                        <div className="preview-section-holo">
                          <div className="flex items-center gap-2 mb-3">
                            <Mail size={14} className="text-emerald-400" />
                            <h4 className="preview-section-title-holo">Contact</h4>
                          </div>
                          <div className="space-y-2">
                            {formData.email && (
                              <div className="preview-item-holo">
                                <span className="preview-label-holo">Email</span>
                                <span className="preview-value-holo text-xs break-all">{formData.email}</span>
                              </div>
                            )}
                            {formData.phone && (
                              <div className="preview-item-holo">
                                <span className="preview-label-holo">Tél</span>
                                <span className="preview-value-holo">{formData.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Poste */}
                      {formData.position && (
                        <div className="preview-section-holo">
                          <div className="flex items-center gap-2 mb-3">
                            <Briefcase size={14} className="text-violet-400" />
                            <h4 className="preview-section-title-holo">Poste</h4>
                          </div>
                          <div className="space-y-2">
                            <div className="preview-item-holo">
                              <span className="preview-label-holo">Fonction</span>
                              <span className="preview-value-holo">{formData.position}</span>
                            </div>
                            <div className="preview-item-holo">
                              <span className="preview-label-holo">Département</span>
                              <span className="preview-value-holo">{formData.department}</span>
                            </div>
                            <div className="preview-item-holo">
                              <span className="preview-label-holo">Contrat</span>
                              <span className="px-2 py-1 bg-violet-500/20 border border-violet-500/40 rounded text-xs font-bold text-violet-300">
                                {formData.contractType}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Dates */}
                      {formData.startDate && (
                        <div className="preview-section-holo">
                          <div className="flex items-center gap-2 mb-3">
                            <Calendar size={14} className="text-amber-400" />
                            <h4 className="preview-section-title-holo">Dates</h4>
                          </div>
                          <div className="space-y-2">
                            <div className="preview-item-holo">
                              <span className="preview-label-holo">Début</span>
                              <span className="preview-value-holo">{new Date(formData.startDate).toLocaleDateString()}</span>
                            </div>
                            {formData.contractType === "CDD" && formData.endDate && (
                              <div className="preview-item-holo">
                                <span className="preview-label-holo">Fin</span>
                                <span className="preview-value-holo">{new Date(formData.endDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {formData.probationPeriod > 0 && (
                              <div className="preview-item-holo">
                                <span className="preview-label-holo">Essai</span>
                                <span className="preview-value-holo">{formData.probationPeriod} mois</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Rémunération */}
                      {formData.baseSalary > 0 && (
                        <div className="preview-section-holo-premium">
                          <div className="flex items-center gap-2 mb-3">
                            <DollarSign size={14} className="text-emerald-400" />
                            <h4 className="preview-section-title-holo">Rémunération</h4>
                          </div>
                          <div className="space-y-2">
                            <div className="preview-item-holo">
                              <span className="preview-label-holo">Salaire Base</span>
                              <span className="preview-value-premium-holo">{formData.baseSalary.toLocaleString()} F</span>
                            </div>
                            {formData.primeAmount > 0 && (
                              <div className="preview-item-holo">
                                <span className="preview-label-holo">Prime</span>
                                <span className="preview-value-premium-holo">{formData.primeAmount.toLocaleString()} F</span>
                              </div>
                            )}
                            {(formData.transportAllowance > 0 || formData.mealAllowance > 0 || formData.housingAllowance > 0) && (
                              <div className="pt-2 border-t border-emerald-500/20">
                                <p className="text-xs text-emerald-400 mb-2 font-semibold">Indemnités:</p>
                                {formData.transportAllowance > 0 && (
                                  <div className="preview-item-holo text-xs">
                                    <span className="text-emerald-300">Transport</span>
                                    <span className="text-emerald-200">{formData.transportAllowance.toLocaleString()} F</span>
                                  </div>
                                )}
                                {formData.mealAllowance > 0 && (
                                  <div className="preview-item-holo text-xs">
                                    <span className="text-emerald-300">Repas</span>
                                    <span className="text-emerald-200">{formData.mealAllowance.toLocaleString()} F</span>
                                  </div>
                                )}
                                {formData.housingAllowance > 0 && (
                                  <div className="preview-item-holo text-xs">
                                    <span className="text-emerald-300">Logement</span>
                                    <span className="text-emerald-200">{formData.housingAllowance.toLocaleString()} F</span>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="mt-3 pt-3 border-t border-emerald-500/30">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-300 uppercase">Total</span>
                                <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                  {totalSalary.toLocaleString()} F
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Conditions */}
                      {formData.workSchedule && (
                        <div className="preview-section-holo">
                          <div className="flex items-center gap-2 mb-3">
                            <Clock size={14} className="text-cyan-400" />
                            <h4 className="preview-section-title-holo">Conditions</h4>
                          </div>
                          <div className="space-y-2">
                            <div className="preview-item-holo">
                              <span className="preview-label-holo">Horaires</span>
                              <span className="preview-value-holo text-xs">{formData.workSchedule}</span>
                            </div>
                            <div className="preview-item-holo">
                              <span className="preview-label-holo">Heures/sem</span>
                              <span className="preview-value-holo">{formData.weeklyHours}h</span>
                            </div>
                            <div className="preview-item-holo">
                              <span className="preview-label-holo">Congés</span>
                              <span className="preview-value-holo">{formData.paidLeaveDays} jours/an</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Signature */}
                      {formData.signature && (
                        <div className="preview-section-holo">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 size={14} className="text-emerald-400" />
                            <h4 className="preview-section-title-holo">Signature</h4>
                          </div>
                          <div className="p-3 bg-slate-900/50 border border-emerald-500/20 rounded-lg">
                            <img src={formData.signature} alt="Signature" className="w-full h-20 object-contain" />
                            {formData.signatureDate && (
                              <p className="text-xs text-emerald-400 text-center mt-2">
                                Signé le {new Date(formData.signatureDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Statut de validation */}
                      <div className="preview-section-holo">
                        <div className="flex items-center gap-2 mb-3">
                          <Shield size={14} className="text-violet-400" />
                          <h4 className="preview-section-title-holo">Statut</h4>
                        </div>
                        <div className="space-y-2">
                          {Object.keys(validationErrors).length === 0 ? (
                            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg">
                              <CheckCircle2 size={16} className="text-emerald-400" />
                              <span className="text-xs font-bold text-emerald-300">Prêt à générer</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/20 border border-amber-500/40 rounded-lg">
                              <AlertCircle size={16} className="text-amber-400" />
                              <span className="text-xs font-bold text-amber-300">{Object.keys(validationErrors).length} champ(s) requis</span>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="preview-card-holo">
                    <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-3">Actions Rapides</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          const element = document.querySelector('.contract-section-holo');
                          element?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full px-3 py-2 bg-slate-900/50 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-semibold hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all flex items-center justify-between"
                      >
                        <span>Revenir au début</span>
                        <ChevronRight size={14} />
                      </button>
                      <button
                        onClick={clearSignature}
                        className="w-full px-3 py-2 bg-slate-900/50 border border-red-500/30 rounded-lg text-red-300 text-xs font-semibold hover:bg-red-500/10 hover:border-red-500/50 transition-all flex items-center justify-between"
                      >
                        <span>Réinitialiser signature</span>
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          STYLES HOLOGRAPHIQUES ULTRA FUTURISTES - COMPLETS
          ═══════════════════════════════════════════════════════════════ */}
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
        @keyframes shine {
          0% { background-position: -250% 0; }
          100% { background-position: 250% 0; }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-shine { animation: shine 3s linear infinite; }

        /* ════════════════════════════════════════════════════
           SCROLLBAR HOLOGRAPHIQUE
        ════════════════════════════════════════════════════ */
        .custom-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(16, 185, 129, 0.6), rgba(6, 182, 212, 0.5));
          border-radius: 10px;
          border: 2px solid rgba(0, 0, 0, 0.3);
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(16, 185, 129, 0.9), rgba(6, 182, 212, 0.8));
        }

        /* ════════════════════════════════════════════════════
           SECTIONS DE FORMULAIRE
        ════════════════════════════════════════════════════ */
        .contract-section-holo {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.5));
          border: 1px solid rgba(6, 182, 212, 0.25);
          border-radius: 1.5rem;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .contract-section-holo:hover {
          border-color: rgba(6, 182, 212, 0.4);
          box-shadow: 0 0 30px rgba(6, 182, 212, 0.15);
        }

        .contract-section-holo-premium {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(16, 185, 129, 0.08));
          border: 1px solid rgba(6, 182, 212, 0.35);
          border-radius: 1.5rem;
          padding: 2rem;
          box-shadow: 0 0 30px rgba(6, 182, 212, 0.2);
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .contract-section-holo-premium:hover {
          border-color: rgba(6, 182, 212, 0.5);
          box-shadow: 0 0 40px rgba(6, 182, 212, 0.3);
        }

        .section-icon-holo {
          width: 3rem;
          height: 3rem;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid;
        }

        .section-icon-holo-premium {
          width: 3rem;
          height: 3rem;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.2));
          border: 1px solid rgba(16, 185, 129, 0.4);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
        }

        .section-title-holo {
          font-size: 1.125rem;
          font-weight: 800;
          color: #fff;
          text-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* ════════════════════════════════════════════════════
           INPUTS & LABELS
        ════════════════════════════════════════════════════ */
        .input-label-holo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: rgba(6, 182, 212, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0.5rem;
        }

        .contract-input-holo {
          width: 100%;
          padding: 0.875rem 1rem;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.4));
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 0.75rem;
          color: rgba(6, 182, 212, 0.95);
          font-size: 0.875rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .contract-input-holo:focus {
          outline: none;
          background: rgba(0, 0, 0, 0.6);
          border-color: rgba(6, 182, 212, 0.6);
          box-shadow: 
            0 0 0 3px rgba(6, 182, 212, 0.15),
            0 0 20px rgba(6, 182, 212, 0.2);
        }
        .contract-input-holo::placeholder {
          color: rgba(6, 182, 212, 0.4);
        }

        .error-message-holo {
          font-size: 0.75rem;
          color: rgb(239, 68, 68);
          margin-top: 0.5rem;
          font-weight: 600;
        }

        /* ════════════════════════════════════════════════════
           CARTE PRÉVISUALISATION
        ════════════════════════════════════════════════════ */
        .preview-card-holo {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.6));
          border: 1px solid rgba(6, 182, 212, 0.25);
          border-radius: 1.5rem;
          padding: 1.5rem;
          backdrop-filter: blur(20px);
        }

        .preview-section-holo {
          background: rgba(6, 182, 212, 0.05);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 1rem;
          padding: 1rem;
          transition: all 0.3s ease;
        }
        .preview-section-holo:hover {
          background: rgba(6, 182, 212, 0.08);
          border-color: rgba(6, 182, 212, 0.3);
        }

        .preview-section-holo-premium {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.08));
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 1rem;
          padding: 1rem;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.15);
        }

        .preview-section-title-holo {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgba(6, 182, 212, 0.9);
        }

        .preview-item-holo {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
        }

        .preview-label-holo {
          font-size: 0.6875rem;
          color: rgba(6, 182, 212, 0.6);
          font-weight: 600;
        }

        .preview-value-holo {
          font-size: 0.8125rem;
          font-weight: 700;
          color: #fff;
          text-align: right;
        }

        .preview-value-premium-holo {
          font-size: 0.875rem;
          font-weight: 800;
          background: linear-gradient(135deg, rgb(16, 185, 129), rgb(6, 182, 212));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  );
}
