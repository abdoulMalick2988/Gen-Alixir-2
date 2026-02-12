"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, Building, User, Briefcase, Download, Scale, 
  Save, CheckCircle, AlertTriangle, Globe, ShieldCheck,
  FileText, Eye, Calendar, MapPin, DollarSign, Clock,
  Award, Shield, AlertCircle, Upload, X, Sparkles,
  Hexagon, Lock, Unlock, PenTool, Printer, Zap, Archive, Trash2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- INITIALISATION SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- TYPES ---
interface FormData {
  country: 'SENEGAL' | 'BURUNDI';
  compName: string;
  compType: string;
  compCapital: string;
  showCapital: boolean;
  compAddr: string;
  compRCCM: string;
  compID: string;
  bossName: string;
  bossTitle: string;
  compLogo: string | null;
  compDescription: string;
  
  empName: string;
  empBirth: string;
  empBirthPlace: string;
  empNation: string;
  isForeigner: boolean;
  empWorkPermit: string;
  empAddr: string;
  empID: string;
  empPhone: string;
  
  jobTitle: string;
  jobDept: string;
  jobType: 'CDI' | 'CDD';
  jobLocation: string;
  salary: string;
  bonus: string;
  startDate: string;
  endDate: string;
  cddReason: string;
  trial: string;
  hours: string;
  hasNonCompete: boolean;
  nonCompeteDuration: string;
  
  documentMode: 'ELECTRONIC' | 'PRINT';
}

interface CountryConfig {
  name: string;
  code: string;
  court: string;
  idLabel: string;
  currency: string;
  articles: {
    intro: string;
    engagement: string;
    workDuration: string;
    termination: string;
  };
}

interface SavedContract {
  id: string;
  employeeName: string;
  jobTitle: string;
  contractType: string;
  mode: string;
  createdAt: string;
  data: FormData;
  signed?: boolean;
  employerSignature?: string;
  employeeSignature?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  size: number;
}

// --- CONFIGURATION JURIDIQUE ---
const COUNTRIES: Record<'SENEGAL' | 'BURUNDI', CountryConfig> = {
  SENEGAL: {
    name: "Sénégal",
    code: "Loi n° 97-17 du 1er décembre 1997 portant Code du Travail",
    court: "Tribunal de Dakar",
    idLabel: "NINEA",
    currency: "FCFA",
    articles: {
      intro: "Vu le Code du Travail Sénégalais,",
      engagement: "Conformément aux dispositions des articles L.23 à L.37 du Code du Travail relatifs au contrat de travail,",
      workDuration: "En application des dispositions relatives à la durée du travail prévues par le Code du Travail sénégalais,",
      termination: "Conformément aux dispositions du Code du Travail sénégalais relatives à la rupture du contrat de travail,"
    }
  },
  BURUNDI: {
    name: "Burundi",
    code: "Loi n° 1/11 du 24 novembre 2020 portant Code du Travail du Burundi",
    court: "Tribunal de Bujumbura",
    idLabel: "NIF",
    currency: "FBu",
    articles: {
      intro: "Vu le Code du Travail du Burundi,",
      engagement: "Conformément aux dispositions du Code du Travail burundais en vigueur relatives au contrat de travail,",
      workDuration: "En application des dispositions relatives à la durée du travail prévues par le Code du Travail burundais,",
      termination: "Conformément aux dispositions du Code du Travail burundais relatives à la résiliation et au préavis,"
    }
  }
};

// --- MOTIFS SVG ---
const TechPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="tech-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        <circle cx="0" cy="0" r="1" fill="currentColor"/>
        <circle cx="40" cy="0" r="1" fill="currentColor"/>
        <circle cx="0" cy="40" r="1" fill="currentColor"/>
      </pattern>
      <pattern id="circuit" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <path d="M 0 20 L 20 20 L 20 0 M 20 40 L 20 60 L 0 60 M 40 0 L 40 20 L 60 20 M 60 40 L 40 40 L 40 60" 
              fill="none" stroke="currentColor" strokeWidth="1"/>
        <circle cx="20" cy="20" r="2" fill="currentColor"/>
        <circle cx="40" cy="40" r="2" fill="currentColor"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#tech-grid)"/>
    <rect width="100%" height="100%" fill="url(#circuit)"/>
  </svg>
);

const LuxuryPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="luxury-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.1"/>
        <stop offset="50%" stopColor="currentColor" stopOpacity="0.05"/>
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.1"/>
      </linearGradient>
      <pattern id="diamonds" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 60 30 L 30 60 L 0 30 Z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        <circle cx="30" cy="30" r="3" fill="url(#luxury-grad)"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#diamonds)"/>
  </svg>
);

// --- STYLES CSS ---
const styles = `
@keyframes hexFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(180deg); }
}

@keyframes particleFloat {
  0% { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
}

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideDown {
  from { max-height: 0; opacity: 0; }
  to { max-height: 2000px; opacity: 1; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.hex-float {
  animation: hexFloat 5s ease-in-out infinite;
}

.particle {
  animation: particleFloat 1s ease-out forwards;
}

.glass-card {
  background: rgba(0, 20, 40, 0.5);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(0, 229, 255, 0.15);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.glass-card:hover {
  background: rgba(0, 30, 60, 0.6);
  border-color: rgba(0, 229, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 229, 255, 0.15);
}

.glass-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(0, 229, 255, 0.03) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.5s;
}

.glass-card:hover::before {
  opacity: 1;
}

.golden-card {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.08), rgba(255, 165, 0, 0.08));
  border: 1px solid rgba(255, 215, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.golden-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.15), transparent);
  transition: left 0.5s;
}

.golden-card:hover::before {
  left: 100%;
}

.section-card {
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.section-card.locked {
  cursor: not-allowed;
  opacity: 0.6;
}

.section-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 229, 255, 0.1), transparent 50%);
  opacity: 0;
  transition: opacity 0.3s;
}

.section-card:hover::after {
  opacity: 1;
}

.input-glow:focus {
  box-shadow: 0 0 0 2px rgba(0, 229, 255, 0.2);
}

.slide-in {
  animation: slideInRight 0.3s ease-out;
}

.slide-down {
  animation: slideDown 0.4s ease-out forwards;
  overflow: hidden;
}

.loading-spinner {
  animation: pulse 1.5s ease-in-out infinite;
}

html, body {
  overflow-x: hidden;
  scroll-behavior: smooth;
}

.scroll-container {
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

@media print {
  .page-break-avoid {
    page-break-inside: avoid;
    break-inside: avoid;
  }
}
`;

export default function GenerateurContratFinal() {
  const router = useRouter();
  const contractRef = useRef<HTMLDivElement>(null);
  const signatureCanvasEmployer = useRef<HTMLCanvasElement>(null);
  const signatureCanvasEmployee = useRef<HTMLCanvasElement>(null);
  
  const [activeSection, setActiveSection] = useState<'company' | 'employee' | 'contract' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLayouting, setIsLayouting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [currentSigner, setCurrentSigner] = useState<'employer' | 'employee' | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showArchives, setShowArchives] = useState(false);
  const [savedContracts, setSavedContracts] = useState<SavedContract[]>([]);
  const [notif, setNotif] = useState<{ m: string; t: 's' | 'e' | 'w' } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const [signatures, setSignatures] = useState({
    employer: '',
    employee: ''
  });

  const [data, setData] = useState<FormData>({
    country: 'BURUNDI',
    documentMode: 'ELECTRONIC',
    compName: 'ECODREUM',
    compType: 'SARL',
    compCapital: '',
    showCapital: false,
    compAddr: 'Bujumbura, Rohero 1',
    compRCCM: '',
    compID: '',
    bossName: '',
    bossTitle: 'Gérant',
    compLogo: null,
    compDescription: '',
    
    empName: '',
    empBirth: '',
    empBirthPlace: '',
    empNation: 'Burundaise',
    isForeigner: false,
    empWorkPermit: '',
    empAddr: '',
    empID: '',
    empPhone: '',
    
    jobTitle: '',
    jobDept: 'Technique',
    jobType: 'CDI',
    jobLocation: '',
    salary: '0',
    bonus: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    cddReason: '',
    trial: '3',
    hours: '40',
    hasNonCompete: false,
    nonCompeteDuration: ''
  });

  const config = COUNTRIES[data.country];

  // Inject styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    if (showSignatureModal || showArchives || showPreview) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showSignatureModal, showArchives, showPreview]);

  useEffect(() => {
    loadArchivedContracts();
  }, []);

  const loadArchivedContracts = async () => {
    try {
      const { data: contracts, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (contracts) {
        const formatted: SavedContract[] = contracts.map(c => ({
          id: c.id,
          employeeName: c.employee_name,
          jobTitle: c.job_title,
          contractType: c.contract_type,
          mode: c.mode,
          createdAt: c.created_at,
          data: c.data,
          signed: c.signed,
          employerSignature: c.employer_signature,
          employeeSignature: c.employee_signature
        }));
        setSavedContracts(formatted);
      }
    } catch (error) {
      console.error('Erreur chargement contrats:', error);
      const stored = localStorage.getItem('ecodreum_contracts');
      if (stored) {
        setSavedContracts(JSON.parse(stored));
      }
    }
  };

  const saveContractToArchive = async (contractData: FormData, signed: boolean = false) => {
    const contract: SavedContract = {
      id: Date.now().toString(),
      employeeName: contractData.empName,
      jobTitle: contractData.jobTitle,
      contractType: contractData.jobType,
      mode: contractData.documentMode,
      createdAt: new Date().toISOString(),
      data: contractData,
      signed,
      employerSignature: signatures.employer,
      employeeSignature: signatures.employee
    };

    try {
      const { error } = await supabase
        .from('contracts')
        .insert([{
          id: contract.id,
          employee_name: contract.employeeName,
          job_title: contract.jobTitle,
          contract_type: contract.contractType,
          mode: contract.mode,
          created_at: contract.createdAt,
          data: contract.data,
          signed: contract.signed,
          employer_signature: contract.employerSignature,
          employee_signature: contract.employeeSignature
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur sauvegarde Supabase:', error);
      const updated = [contract, ...savedContracts];
      localStorage.setItem('ecodreum_contracts', JSON.stringify(updated));
    }

    const updated = [contract, ...savedContracts];
    setSavedContracts(updated);
  };

  const deleteContract = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur suppression Supabase:', error);
    }

    const updated = savedContracts.filter(c => c.id !== id);
    setSavedContracts(updated);
    localStorage.setItem('ecodreum_contracts', JSON.stringify(updated));
    showNotif('Contrat supprimé', 's');
  };

  const loadContract = (contract: SavedContract) => {
    setData(contract.data);
    if (contract.employerSignature) {
      setSignatures({
        employer: contract.employerSignature,
        employee: contract.employeeSignature || ''
      });
    }
    setShowArchives(false);
    showNotif('Contrat chargé', 's');
  };

  const createParticles = (centerX: number, centerY: number) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: centerX,
        y: centerY,
        angle: (i * 45) * Math.PI / 180,
        speed: 80 + Math.random() * 60,
        size: 6 + Math.random() * 6
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1000);
  };

  // VALIDATION DES SECTIONS
  const isSectionComplete = (section: 'company' | 'employee' | 'contract'): boolean => {
    if (section === 'company') {
      return !!(
        data.compName.trim() &&
        data.compType.trim() &&
        data.compAddr.trim() &&
        data.compRCCM.trim() &&
        data.compID.trim() &&
        data.bossName.trim() &&
        data.bossTitle.trim() &&
        (!data.showCapital || data.compCapital.trim())
      );
    }
    
    if (section === 'employee') {
      return !!(
        data.empName.trim() &&
        data.empBirth.trim() &&
        data.empBirthPlace.trim() &&
        data.empNation.trim() &&
        data.empAddr.trim() &&
        data.empID.trim() &&
        data.empPhone.trim() &&
        (!data.isForeigner || data.empWorkPermit.trim())
      );
    }
    
    if (section === 'contract') {
      return !!(
        data.jobTitle.trim() &&
        data.jobDept.trim() &&
        data.jobLocation.trim() &&
        data.salary.trim() &&
        parseFloat(data.salary) > 0 &&
        data.startDate &&
        data.trial.trim() &&
        data.hours.trim() &&
        (data.jobType !== 'CDD' || (data.endDate && data.cddReason.trim())) &&
        (!data.hasNonCompete || data.nonCompeteDuration.trim())
      );
    }
    
    return false;
  };

  const canAccessSection = (section: 'company' | 'employee' | 'contract'): boolean => {
    if (section === 'company') return true;
    if (section === 'employee') return isSectionComplete('company');
    if (section === 'contract') return isSectionComplete('company') && isSectionComplete('employee');
    return false;
  };

  const handleSectionClick = (section: 'company' | 'employee' | 'contract', event: React.MouseEvent<HTMLDivElement>) => {
    if (!canAccessSection(section)) {
      let message = '';
      if (section === 'employee' && !isSectionComplete('company')) {
        message = 'Veuillez d\'abord remplir tous les champs obligatoires de la section Entreprise';
      } else if (section === 'contract' && !isSectionComplete('company')) {
        message = 'Veuillez d\'abord remplir tous les champs obligatoires de la section Entreprise';
      } else if (section === 'contract' && !isSectionComplete('employee')) {
        message = 'Veuillez d\'abord remplir tous les champs obligatoires de la section Salarié';
      }
      showNotif(message, 'w');
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    createParticles(centerX, centerY);
    
    // Toggle section (fermer si déjà ouverte)
    setActiveSection(activeSection === section ? null : section);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateData('compLogo', event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCanvasPoint = (canvas: HTMLCanvasElement, clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = currentSigner === 'employer' ? signatureCanvasEmployer.current : signatureCanvasEmployee.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const point = getCanvasPoint(canvas, clientX, clientY);
    
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const canvas = currentSigner === 'employer' ? signatureCanvasEmployer.current : signatureCanvasEmployee.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const point = getCanvasPoint(canvas, clientX, clientY);

    ctx.lineTo(point.x, point.y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = currentSigner === 'employer' ? signatureCanvasEmployer.current : signatureCanvasEmployee.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = currentSigner === 'employer' ? signatureCanvasEmployer.current : signatureCanvasEmployee.current;
    if (!canvas) return;

    const signatureData = canvas.toDataURL();
    
    if (currentSigner === 'employer') {
      setSignatures(prev => ({ ...prev, employer: signatureData }));
      showNotif('Signature employeur enregistrée', 's');
    } else {
      setSignatures(prev => ({ ...prev, employee: signatureData }));
      showNotif('Signature salarié enregistrée', 's');
    }
    
    setShowSignatureModal(false);
    setCurrentSigner(null);
  };

  const openSignatureModal = (signer: 'employer' | 'employee') => {
    if (data.documentMode === 'PRINT') {
      showNotif('Activez le mode électronique pour signer', 'w');
      return;
    }
    setCurrentSigner(signer);
    setShowSignatureModal(true);
    
    setTimeout(() => {
      const canvas = signer === 'employer' ? signatureCanvasEmployer.current : signatureCanvasEmployee.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    }, 100);
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!isSectionComplete('company')) {
      errors.push("Section Entreprise incomplète");
    }
    if (!isSectionComplete('employee')) {
      errors.push("Section Salarié incomplète");
    }
    if (!isSectionComplete('contract')) {
      errors.push("Section Contrat incomplète");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // GÉNÉRATION PDF AMÉLIORÉE
  const generatePDF = async () => {
    if (!validateForm()) {
      showNotif("Veuillez remplir tous les champs obligatoires", "e");
      return;
    }

    setIsLayouting(true);
    setShowPreview(true);

    try {
      // Attendre que l'aperçu soit rendu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!contractRef.current) {
        throw new Error("Référence du contrat non trouvée");
      }

      // Phase de mise en page
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsLayouting(false);
      setIsGenerating(true);

      // Génération PDF optimisée
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - (2 * margin);
      const maxContentHeight = pageHeight - (2 * margin);

      // Capturer le contenu complet
      const canvas = await html2canvas(contractRef.current, {
        scale: 2.5, // Meilleure qualité
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowHeight: contractRef.current.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[data-contract-ref]') as HTMLElement;
          if (clonedElement) {
            clonedElement.style.display = 'block';
            clonedElement.style.position = 'relative';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Première page
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
      heightLeft -= maxContentHeight;

      // Pages suivantes si nécessaire
      while (heightLeft > 0) {
        position = -(imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position + margin, imgWidth, imgHeight);
        heightLeft -= maxContentHeight;
      }

      pdf.save(`CONTRAT_${data.empName.replace(/\s/g, '_')}_${Date.now()}.pdf`);
      
      await saveContractToArchive(data, !!(signatures.employer && signatures.employee));
      showNotif("PDF généré avec succès !", "s");
      
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      showNotif("Erreur lors de la génération du PDF", "e");
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        setShowPreview(false);
        setIsLayouting(false);
      }, 1500);
    }
  };

  const showNotif = (m: string, t: 's' | 'e' | 'w') => {
    setNotif({ m, t });
    setTimeout(() => setNotif(null), 4000);
  };

  const updateData = (field: keyof FormData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    setValidationErrors([]);
  };

  const getProgress = (): number => {
    const totalFields = 25;
    let filledFields = 0;
    Object.entries(data).forEach(([key, value]) => {
      if (['showCapital', 'isForeigner', 'hasNonCompete', 'documentMode'].includes(key)) return;
      if (value && value !== '0' && value !== '') filledFields++;
    });
    return Math.round((filledFields / totalFields) * 100);
  };

  const getSectionProgress = (section: 'company' | 'employee' | 'contract'): number => {
    const fields = {
      company: ['compName', 'compType', 'compAddr', 'compRCCM', 'compID', 'bossName', 'bossTitle'],
      employee: ['empName', 'empBirth', 'empBirthPlace', 'empNation', 'empAddr', 'empID', 'empPhone'],
      contract: ['jobTitle', 'jobDept', 'jobLocation', 'salary', 'startDate', 'trial', 'hours']
    };
    
    const sectionFields = fields[section];
    const filled = sectionFields.filter(field => {
      const value = data[field as keyof FormData];
      return value && value !== '' && value !== '0';
    }).length;
    
    return Math.round((filled / sectionFields.length) * 100);
  };

  return (
    <div className="min-h-screen scroll-container" style={{
      background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f35 50%, #0a0e1a 100%)',
      position: 'relative',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      {/* Background Hexagons */}
      <div className="fixed inset-0 pointer-events-none opacity-5" style={{ zIndex: 0 }}>
        {[...Array(12)].map((_, i) => (
          <Hexagon
            key={i}
            size={32}
            className="absolute text-cyan-400 hex-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="particle fixed pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            borderRadius: '50%',
            boxShadow: '0 0 15px rgba(255, 215, 0, 0.6)',
            zIndex: 9999,
            ['--tx' as any]: `${Math.cos(particle.angle) * particle.speed}px`,
            ['--ty' as any]: `${Math.sin(particle.angle) * particle.speed}px`,
          }}
        />
      ))}

      <div className="max-w-6xl mx-auto p-3 md:p-6 relative" style={{ zIndex: 10 }}>
        
        {/* NOTIFICATIONS */}
        {notif && (
          <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-xl border backdrop-blur-xl shadow-xl slide-in ${
            notif.t === 's' ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300' : 
            notif.t === 'w' ? 'bg-amber-500/20 border-amber-400/50 text-amber-300' :
            'bg-red-500/20 border-red-400/50 text-red-300'
          }`}>
            <div className="flex items-center gap-2">
              {notif.t === 's' && <CheckCircle size={16} />}
              {notif.t === 'w' && <AlertTriangle size={16} />}
              {notif.t === 'e' && <AlertCircle size={16} />}
              <span className="text-xs font-bold uppercase">{notif.m}</span>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div className="mb-6">
          <div className="glass-card rounded-2xl p-4">
            <TechPattern />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => router.back()} 
                  className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-400/30 hover:border-cyan-400/50 transition-all hover:scale-105"
                >
                  <ArrowLeft size={20} className="text-cyan-400" />
                </button>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={20} className="text-yellow-400" />
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      CONTRACT ARCHITECT
                    </h1>
                  </div>
                  <p className="text-[10px] font-bold text-cyan-400/50 uppercase tracking-wider">
                    ECODREUM Legal Engine
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowArchives(true)}
                className="golden-card px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:scale-105 transition-all relative z-10"
              >
                <Archive size={16} className="text-yellow-400" />
                <span className="text-yellow-100">Archives</span>
                <span className="px-2 py-0.5 bg-yellow-400/20 rounded-full text-[10px] text-yellow-300">
                  {savedContracts.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* MODE + JURIDICTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="glass-card rounded-2xl p-4">
            <TechPattern />
            <div className="relative z-10">
              <label className="text-xs font-bold text-cyan-400 uppercase mb-3 block flex items-center gap-2">
                <Zap size={14} />
                Mode de Document
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => updateData('documentMode', 'ELECTRONIC')}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold text-xs transition-all ${
                    data.documentMode === 'ELECTRONIC'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-lg shadow-cyan-500/50'
                      : 'glass-card text-cyan-300'
                  }`}
                >
                  <Zap size={16} className="mx-auto mb-1" />
                  <div>Électronique</div>
                </button>

                <button
                  onClick={() => updateData('documentMode', 'PRINT')}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold text-xs transition-all ${
                    data.documentMode === 'PRINT'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg shadow-yellow-500/50'
                      : 'glass-card text-cyan-300'
                  }`}
                >
                  <Printer size={16} className="mx-auto mb-1" />
                  <div>Imprimer</div>
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <LuxuryPattern />
            <div className="relative z-10">
              <label className="text-xs font-bold text-cyan-400 uppercase mb-3 block flex items-center gap-2">
                <Globe size={14} />
                Juridiction
              </label>
              <div className="flex gap-3">
                {(['SENEGAL', 'BURUNDI'] as const).map((c) => (
                  <button 
                    key={c} 
                    onClick={() => updateData('country', c)}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-black transition-all ${
                      data.country === c 
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-lg shadow-cyan-500/50' 
                        : 'glass-card text-cyan-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PROGRESSION */}
        <div className="mb-6">
          <div className="glass-card rounded-2xl p-4">
            <TechPattern />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-400 uppercase flex items-center gap-2">
                  <Sparkles size={12} />
                  Progression
                </span>
                <span className="text-lg font-black text-cyan-300">{getProgress()}%</span>
              </div>
              <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 shadow-lg shadow-cyan-500/50"
                  style={{ width: `${getProgress()}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ERREURS */}
        {validationErrors.length > 0 && (
          <div className="mb-6">
            <div className="bg-red-500/10 border border-red-400/40 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-red-400 mb-3">
                <AlertCircle size={18} />
                <h3 className="text-sm font-black uppercase">Erreurs</h3>
              </div>
              <ul className="space-y-1">
                {validationErrors.map((error, i) => (
                  <li key={i} className="text-xs text-red-300/90 pl-4 flex items-center gap-2">
                    <Hexagon size={6} className="text-red-400" />
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* SECTIONS AVEC FORMULAIRES DÉROULANTS */}
        <div className="space-y-4 mb-6">
          {[
            { id: 'company', label: 'Entreprise', icon: Building, color: 'from-emerald-500 to-teal-500' },
            { id: 'employee', label: 'Salarié', icon: User, color: 'from-blue-500 to-cyan-500' },
            { id: 'contract', label: 'Contrat', icon: Briefcase, color: 'from-amber-500 to-yellow-500' }
          ].map(({ id, label, icon: Icon, color }) => {
            const progress = getSectionProgress(id as any);
            const isActive = activeSection === id;
            const isComplete = isSectionComplete(id as any);
            const canAccess = canAccessSection(id as any);
            
            return (
              <div key={id} className="space-y-0">
                {/* CARTE SECTION */}
                <div
                  onClick={(e) => handleSectionClick(id as any, e)}
                  className={`section-card glass-card rounded-2xl p-4 cursor-pointer transition-all ${
                    !canAccess ? 'locked opacity-50' : 'hover:scale-[1.02]'
                  } ${isActive ? 'ring-2 ring-cyan-400 shadow-xl shadow-cyan-500/30' : ''}`}
                >
                  <TechPattern />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                          <Icon size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black uppercase text-white">{label}</h3>
                          <p className="text-xs text-cyan-300/60">
                            {!canAccess ? 'Verrouillé' : isActive ? 'Ouvert' : 'Cliquez pour ouvrir'}
                          </p>
                        </div>
                      </div>
                      
                      {isComplete ? (
                        <CheckCircle size={20} className="text-emerald-400" />
                      ) : canAccess ? (
                        isActive ? <Unlock size={20} className="text-cyan-400" /> : <Lock size={20} className="text-gray-500" />
                      ) : (
                        <Lock size={20} className="text-red-400" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-cyan-400/80">Complété</span>
                        <span className="text-cyan-300 font-bold">{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${color} transition-all duration-500 shadow-lg`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* FORMULAIRE DÉROULANT */}
                {isActive && canAccess && (
                  <div className="slide-down">
                    {id === 'company' && (
                      <div className="glass-card rounded-2xl p-5 mt-4 space-y-5">
                        <LuxuryPattern />
                        <div className="relative z-10 space-y-5">
                          {/* Logo & Description */}
                          <div className="golden-card rounded-xl p-4 space-y-4">
                            <LuxuryPattern />
                            <div className="relative z-10 space-y-4">
                              <h3 className="text-xs font-black uppercase text-yellow-400 flex items-center gap-2">
                                <Sparkles size={12} />
                                Identité Visuelle (Optionnel)
                              </h3>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-xs font-bold text-yellow-300/80 uppercase mb-2 block">
                                    Logo
                                  </label>
                                  {data.compLogo ? (
                                    <div className="relative group">
                                      <div className="p-3 bg-white rounded-xl shadow-xl">
                                        <img src={data.compLogo} alt="Logo" className="w-24 h-24 object-contain mx-auto" />
                                      </div>
                                      <button
                                        onClick={() => updateData('compLogo', null)}
                                        className="absolute -top-1 -right-1 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>
                                  ) : (
                                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-yellow-400/30 rounded-xl cursor-pointer hover:border-yellow-400/50 transition-all hover:bg-yellow-400/5">
                                      <Upload size={20} className="text-yellow-400 mb-2" />
                                      <span className="text-xs text-yellow-300">Charger</span>
                                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                    </label>
                                  )}
                                </div>

                                <InputField
                                  label="Description"
                                  value={data.compDescription}
                                  onChange={(v) => updateData('compDescription', v)}
                                  placeholder="Ex: Leader en solutions digitales..."
                                  multiline
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Raison Sociale" value={data.compName} onChange={(v) => updateData('compName', v)} icon={<Building size={12} />} required />
                            <InputField label="Forme Juridique" value={data.compType} onChange={(v) => updateData('compType', v)} placeholder="SARL, SA..." icon={<ShieldCheck size={12} />} required />
                          </div>

                          <div className="glass-card rounded-xl p-4 space-y-3">
                            <TechPattern />
                            <div className="relative z-10 space-y-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={data.showCapital}
                                  onChange={(e) => updateData('showCapital', e.target.checked)}
                                  className="w-4 h-4 rounded border-cyan-400/40 bg-black/60 text-cyan-500"
                                />
                                <label className="text-xs font-bold text-cyan-300 uppercase">
                                  Mentionner le capital social
                                </label>
                              </div>
                              {data.showCapital && (
                                <InputField label="Capital Social" value={data.compCapital} onChange={(v) => updateData('compCapital', v)} placeholder={`1 000 000 ${config.currency}`} icon={<DollarSign size={12} />} required />
                              )}
                            </div>
                          </div>

                          <InputField label="Siège Social" value={data.compAddr} onChange={(v) => updateData('compAddr', v)} icon={<MapPin size={12} />} required />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="RCCM" value={data.compRCCM} onChange={(v) => updateData('compRCCM', v)} placeholder="BJ/BGM/2024/A/123" icon={<FileText size={12} />} required />
                            <InputField label={config.idLabel} value={data.compID} onChange={(v) => updateData('compID', v)} icon={<Shield size={12} />} required />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Représentant Légal" value={data.bossName} onChange={(v) => updateData('bossName', v)} icon={<User size={12} />} required />
                            <InputField label="Fonction" value={data.bossTitle} onChange={(v) => updateData('bossTitle', v)} placeholder="Gérant..." icon={<Award size={12} />} required />
                          </div>
                        </div>
                      </div>
                    )}

                    {id === 'employee' && (
                      <div className="glass-card rounded-2xl p-5 mt-4 space-y-5">
                        <TechPattern />
                        <div className="relative z-10 space-y-5">
                          <InputField label="Nom Complet" value={data.empName} onChange={(v) => updateData('empName', v)} icon={<User size={12} />} required />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Date de Naissance" type="date" value={data.empBirth} onChange={(v) => updateData('empBirth', v)} icon={<Calendar size={12} />} required />
                            <InputField label="Lieu de Naissance" value={data.empBirthPlace} onChange={(v) => updateData('empBirthPlace', v)} icon={<MapPin size={12} />} required />
                          </div>

                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <InputField label="Nationalité" value={data.empNation} onChange={(v) => updateData('empNation', v)} icon={<Globe size={12} />} required />
                              <div className="glass-card rounded-xl p-4 flex items-center gap-3">
                                <TechPattern />
                                <div className="relative z-10 flex items-center gap-3">
                                  <input type="checkbox" checked={data.isForeigner} onChange={(e) => updateData('isForeigner', e.target.checked)} className="w-4 h-4 rounded" />
                                  <label className="text-xs font-bold text-cyan-300 uppercase">Travailleur étranger</label>
                                </div>
                              </div>
                            </div>

                            {data.isForeigner && (
                              <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4">
                                <InputField label="Permis de Travail" value={data.empWorkPermit} onChange={(v) => updateData('empWorkPermit', v)} icon={<Shield size={12} />} required />
                              </div>
                            )}
                          </div>

                          <InputField label="Adresse" value={data.empAddr} onChange={(v) => updateData('empAddr', v)} icon={<MapPin size={12} />} required />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Pièce d'Identité" value={data.empID} onChange={(v) => updateData('empID', v)} icon={<FileText size={12} />} required />
                            <InputField label="Téléphone" type="tel" value={data.empPhone} onChange={(v) => updateData('empPhone', v)} icon={<User size={12} />} required />
                          </div>
                        </div>
                      </div>
                    )}

                    {id === 'contract' && (
                      <div className="glass-card rounded-2xl p-5 mt-4 space-y-5">
                        <LuxuryPattern />
                        <div className="relative z-10 space-y-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-bold text-cyan-300 uppercase flex items-center gap-2">
                                <Briefcase size={12} />
                                Type de Contrat *
                              </label>
                              <select
                                value={data.jobType}
                                onChange={(e) => updateData('jobType', e.target.value as 'CDI' | 'CDD')}
                                className="bg-black/60 border border-cyan-400/30 rounded-xl p-3 text-sm text-white outline-none focus:border-cyan-400 transition-all"
                              >
                                <option value="CDI">CDI</option>
                                <option value="CDD">CDD</option>
                              </select>
                            </div>

                            <InputField label="Poste" value={data.jobTitle} onChange={(v) => updateData('jobTitle', v)} icon={<Briefcase size={12} />} required />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Département" value={data.jobDept} onChange={(v) => updateData('jobDept', v)} icon={<Building size={12} />} required />
                            <InputField label="Lieu de Travail" value={data.jobLocation} onChange={(v) => updateData('jobLocation', v)} icon={<MapPin size={12} />} required />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Date de Début" type="date" value={data.startDate} onChange={(v) => updateData('startDate', v)} icon={<Calendar size={12} />} required />
                            {data.jobType === 'CDD' && (
                              <InputField label="Date de Fin" type="date" value={data.endDate} onChange={(v) => updateData('endDate', v)} icon={<Calendar size={12} />} required />
                            )}
                          </div>

                          {data.jobType === 'CDD' && (
                            <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-4">
                              <InputField label="Motif du CDD" value={data.cddReason} onChange={(v) => updateData('cddReason', v)} icon={<FileText size={12} />} required multiline />
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label={`Salaire (${config.currency})`} type="number" value={data.salary} onChange={(v) => updateData('salary', v)} icon={<DollarSign size={12} />} required />
                            <InputField label="Primes" value={data.bonus} onChange={(v) => updateData('bonus', v)} icon={<Award size={12} />} />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Heures/Semaine" type="number" value={data.hours} onChange={(v) => updateData('hours', v)} icon={<Clock size={12} />} required />
                            <InputField label="Essai (mois)" type="number" value={data.trial} onChange={(v) => updateData('trial', v)} icon={<Calendar size={12} />} required />
                          </div>

                          <div className="golden-card rounded-xl p-4 space-y-3">
                            <LuxuryPattern />
                            <div className="relative z-10 space-y-3">
                              <div className="flex items-center gap-3">
                                <input type="checkbox" checked={data.hasNonCompete} onChange={(e) => updateData('hasNonCompete', e.target.checked)} className="w-4 h-4 rounded" />
                                <label className="text-xs font-bold text-yellow-300 uppercase flex items-center gap-2">
                                  <Shield size={12} />
                                  Clause de non-concurrence
                                </label>
                              </div>

                              {data.hasNonCompete && (
                                <InputField label="Durée" value={data.nonCompeteDuration} onChange={(v) => updateData('nonCompeteDuration', v)} icon={<Shield size={12} />} required />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* PANNEAU ACTIONS */}
        <div className="glass-card rounded-2xl p-5 sticky top-4 space-y-4 mb-8">
          <TechPattern />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 pb-4 border-b border-cyan-400/20">
              <CheckCircle size={20} className="text-cyan-400" />
              <h3 className="text-lg font-black uppercase text-cyan-300">Actions</h3>
            </div>

            {/* SIGNATURES */}
            {data.documentMode === 'ELECTRONIC' && (
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-cyan-400 flex items-center gap-2">
                  <PenTool size={12} />
                  Signatures
                </h4>
                
                <button
                  onClick={() => openSignatureModal('employer')}
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    signatures.employer
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-lg shadow-emerald-500/50'
                      : 'glass-card text-cyan-300 hover:bg-cyan-500/10'
                  }`}
                >
                  <PenTool size={14} />
                  <span>{signatures.employer ? 'Employeur ✓' : 'Employeur'}</span>
                </button>

                <button
                  onClick={() => openSignatureModal('employee')}
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    signatures.employee
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-black shadow-lg shadow-blue-500/50'
                      : 'glass-card text-cyan-300 hover:bg-cyan-500/10'
                  }`}
                >
                  <PenTool size={14} />
                  <span>{signatures.employee ? 'Salarié ✓' : 'Salarié'}</span>
                </button>
              </div>
            )}

            {/* EXPORT */}
            <div className="space-y-3 pt-4 border-t border-cyan-400/20">
              <button
                onClick={generatePDF}
                disabled={isGenerating || isLayouting}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-gray-800 disabled:to-gray-800 text-black rounded-xl font-black uppercase text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 hover:scale-105 disabled:hover:scale-100"
              >
                {isLayouting ? (
                  <>
                    <div className="loading-spinner">📐</div>
                    <span>Mise en Page...</span>
                  </>
                ) : isGenerating ? (
                  <>
                    <div className="animate-spin">⏳</div>
                    <span>Génération PDF...</span>
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    <span>Générer PDF</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowPreview(!showPreview)}
                className="w-full py-3 glass-card border border-blue-400/30 text-blue-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all hover:bg-blue-500/10"
              >
                <Eye size={16} />
                <span>{showPreview ? 'Masquer' : 'Aperçu'}</span>
              </button>
            </div>

            {/* RÉCAP */}
            <div className="pt-4 border-t border-cyan-400/20">
              <div className="golden-card rounded-xl p-4 space-y-3">
                <LuxuryPattern />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2 text-yellow-400 mb-3">
                    <Scale size={14} />
                    <span className="text-xs font-black uppercase">Récapitulatif</span>
                  </div>

                  <div className="space-y-2">
                    <InfoRow label="Pays" value={config.name} />
                    <InfoRow label="Devise" value={config.currency} />
                    <InfoRow label="Type" value={data.jobType} />
                    <InfoRow label="Mode" value={data.documentMode === 'ELECTRONIC' ? 'E-Sign' : 'Print'} />
                  </div>
                </div>
              </div>
            </div>

            {/* DISCLAIMER */}
            <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-amber-300/90 leading-relaxed">
                  Document automatique - Ne remplace pas un conseil juridique
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL SIGNATURE */}
        {showSignatureModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            <div className="glass-card rounded-2xl p-6 max-w-3xl w-full my-8">
              <TechPattern />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black uppercase text-cyan-300 flex items-center gap-2">
                    <PenTool size={24} />
                    Signature {currentSigner === 'employer' ? 'Employeur' : 'Salarié'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowSignatureModal(false);
                      setCurrentSigner(null);
                    }}
                    className="p-2 bg-red-500/20 border border-red-400/40 text-red-400 rounded-xl hover:bg-red-500/30 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="mb-4 text-xs text-cyan-300/70 flex items-center gap-2 bg-cyan-500/10 border border-cyan-400/20 rounded-xl p-3">
                  <Sparkles size={14} />
                  <span>Signez dans l'espace ci-dessous</span>
                </div>

                <div className="bg-white rounded-xl p-4 mb-6 relative shadow-xl" style={{ touchAction: 'none' }}>
                  <canvas
                    ref={currentSigner === 'employer' ? signatureCanvasEmployer : signatureCanvasEmployee}
                    width={700}
                    height={300}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="border-2 border-dashed border-gray-300 rounded-xl cursor-crosshair w-full"
                    style={{ touchAction: 'none' }}
                  />
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-gray-400 text-xs font-bold pointer-events-none">
                    Signez ici
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={clearSignature}
                    className="flex-1 py-3 bg-red-500/20 border border-red-400/40 text-red-300 rounded-xl font-bold hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Effacer
                  </button>
                  <button
                    onClick={saveSignature}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-black rounded-xl font-bold hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/50"
                  >
                    <Save size={16} />
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ARCHIVES */}
        {showArchives && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] overflow-y-auto p-4">
            <div className="max-w-6xl mx-auto my-8">
              <div className="glass-card rounded-2xl p-6">
                <TechPattern />
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black uppercase text-cyan-300 flex items-center gap-3">
                      <Archive size={28} className="text-yellow-400" />
                      Archives
                    </h2>
                    <button
                      onClick={() => setShowArchives(false)}
                      className="px-6 py-2 glass-card text-white rounded-xl font-bold hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                      <X size={16} />
                      Fermer
                    </button>
                  </div>

                  {savedContracts.length === 0 ? (
                    <div className="text-center py-20">
                      <Archive size={60} className="mx-auto text-cyan-400/30 mb-4" />
                      <p className="text-lg text-cyan-300/60 font-bold">Aucun contrat</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {savedContracts.map((contract) => (
                        <div key={contract.id} className="glass-card rounded-xl p-4 space-y-3 hover:scale-105 transition-transform">
                          <LuxuryPattern />
                          <div className="relative z-10">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-black text-sm text-cyan-300 mb-1">{contract.employeeName}</h3>
                                <p className="text-xs text-cyan-400/70">{contract.jobTitle}</p>
                              </div>
                              <span className={`text-[10px] px-2 py-1 rounded-lg font-bold ${
                                contract.mode === 'ELECTRONIC' 
                                  ? 'bg-cyan-500/20 text-cyan-300' 
                                  : 'bg-yellow-500/20 text-yellow-300'
                              }`}>
                                {contract.mode === 'ELECTRONIC' ? 'E-Sign' : 'Print'}
                              </span>
                            </div>

                            <div className="text-xs text-cyan-300/60 space-y-1.5 pt-3 border-t border-cyan-400/20">
                              <div className="flex justify-between">
                                <span>Type:</span>
                                <span className="font-bold text-cyan-300">{contract.contractType}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Date:</span>
                                <span className="font-bold text-cyan-300">
                                  {new Date(contract.createdAt).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                              {contract.signed && (
                                <div className="flex items-center gap-1.5 text-emerald-400 font-bold pt-1.5">
                                  <CheckCircle size={12} />
                                  Signé
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 pt-3">
                              <button
                                onClick={() => loadContract(contract)}
                                className="flex-1 py-2 bg-blue-500/20 border border-blue-400/40 text-blue-300 rounded-lg text-xs font-bold hover:bg-blue-500/30 transition-all flex items-center justify-center gap-1.5"
                              >
                                <Upload size={12} />
                                Charger
                              </button>
                              <button
                                onClick={() => deleteContract(contract.id)}
                                className="p-2 bg-red-500/20 border border-red-400/40 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRÉVISUALISATION */}
{showPreview && (
  <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[9998] overflow-y-auto">
    {/* Bouton Retour */}
    <div className="sticky top-0 z-50 flex justify-center pt-4 pb-2">
      <button
        onClick={() => setShowPreview(false)}
        className="glass-card px-6 py-3 rounded-xl font-bold text-white flex items-center gap-2 hover:bg-white/10 transition-all shadow-xl border border-cyan-400/30"
      >
        <ArrowLeft size={20} className="text-cyan-400" />
        <span className="text-cyan-300">Retour</span>
      </button>
    </div>
    
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 pt-0">
      <div 
        ref={contractRef} 
        data-contract-ref="true"
        className="bg-white text-black w-[210mm] min-h-[297mm] p-16 shadow-2xl"
      >
        <ContractPreview data={data} config={config} signatures={signatures} />
      </div>
    </div>
  </div>
)}
}

// --- COMPOSANTS ---
function ContractPreview({ data, config, signatures }: { data: FormData; config: CountryConfig; signatures: { employer: string; employee: string } }) {
  const capitalClause = data.showCapital && data.compCapital ? `, au capital social de ${data.compCapital} ${config.currency}` : '';
  const foreignerClause = data.isForeigner && data.empWorkPermit ? `, titulaire du permis de travail n°${data.empWorkPermit}` : '';
  const cddClause = data.jobType === 'CDD' && data.cddReason ? `\n\nLe présent contrat est conclu pour les besoins suivants : ${data.cddReason}.` : '';
  const bonusClause = data.bonus ? `\n\nEn sus de cette rémunération de base, le Salarié pourra percevoir les primes et avantages suivants : ${data.bonus}.` : '';
  const endDateClause = data.jobType === 'CDD' && data.endDate ? ` et prendra fin le ${new Date(data.endDate).toLocaleDateString('fr-FR')}` : '';

  return (
    <div className="space-y-6 font-serif" style={{ fontFamily: 'Georgia, serif', lineHeight: '1.8' }}>
      {/* EN-TÊTE */}
      <div className="page-break-avoid">
        <div className="flex items-start justify-between mb-12">
          {data.compLogo && (
            <div className="w-24 h-24">
              <img src={data.compLogo} alt="Logo" className="w-full h-full object-contain" />
            </div>
          )}
          <div className={`${data.compLogo ? 'text-right' : 'w-full text-center'}`}>
            {data.compLogo && data.compDescription && (
              <>
                <div className="font-bold text-lg">{data.compName}</div>
                <div className="text-xs text-gray-600 mt-1">{data.compDescription}</div>
              </>
            )}
          </div>
        </div>

        {/* TITRE */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-black uppercase tracking-wider mb-2">CONTRAT DE TRAVAIL</h1>
          <p className="text-lg font-bold text-gray-700">RÉGIME : {data.jobType}</p>
        </div>
      </div>

      {/* PARTIES */}
      <div className="page-break-avoid space-y-6 text-sm">
        <p className="font-bold text-lg mb-4">ENTRE LES SOUSSIGNÉS :</p>
        
        <p className="leading-relaxed">
          La société <strong>{data.compName}</strong>, {data.compType}{capitalClause}, dont le siège social est situé à <strong>{data.compAddr}</strong>, 
          immatriculée au Registre de Commerce et du Crédit Mobilier (RCCM) sous le numéro <strong>{data.compRCCM}</strong> et identifiée au {config.idLabel} sous le numéro <strong>{data.compID}</strong>, 
          représentée par M./Mme <strong>{data.bossName}</strong> en sa qualité de <strong>{data.bossTitle}</strong>, dûment habilité(e) aux fins des présentes.
        </p>
        
        <p className="italic text-right">Ci-après dénommée « <strong>L'EMPLOYEUR</strong> »</p>
        
        <p className="text-center font-bold">D'UNE PART,</p>
        
        <p className="text-center font-bold">ET :</p>
        
        <p className="leading-relaxed">
          M./Mme <strong>{data.empName}</strong>, né(e) le <strong>{new Date(data.empBirth).toLocaleDateString('fr-FR')}</strong> à <strong>{data.empBirthPlace}</strong>, 
          de nationalité <strong>{data.empNation}</strong>{foreignerClause}, titulaire de la pièce d'identité n°<strong>{data.empID}</strong>, 
          demeurant à <strong>{data.empAddr}</strong>, joignable au <strong>{data.empPhone}</strong>.
        </p>
        
        <p className="italic text-right">Ci-après dénommé(e) « <strong>LE SALARIÉ</strong> »</p>
        
        <p className="text-center font-bold">D'AUTRE PART,</p>
        
        <p className="font-bold text-lg mt-8 mb-4">IL A ÉTÉ ARRÊTÉ ET CONVENU CE QUI SUIT :</p>
      </div>

      {/* ARTICLES */}
      <div className="page-break-avoid">
        <Article title="ARTICLE 1 : OBJET ET CADRE LÉGAL">
          Le présent contrat est conclu sous le régime du {config.code}.
          <br /><br />
          {config.articles.intro}
          <br />
          {config.articles.engagement}
          <br /><br />
          Le présent contrat définit les conditions d'engagement et d'emploi du Salarié au sein de la société {data.compName}.
        </Article>
      </div>

      <div className="page-break-avoid">
        <Article title="ARTICLE 2 : NATURE ET FONCTIONS">
          Le Salarié est recruté en qualité de <strong>{data.jobTitle}</strong> au sein du département <strong>{data.jobDept}</strong>.
          <br /><br />
          Le Salarié exercera ses fonctions au sein de l'établissement situé à <strong>{data.jobLocation}</strong>.
          <br /><br />
          Le type de contrat conclu est un contrat à durée <strong>{data.jobType === 'CDI' ? 'indéterminée (CDI)' : 'déterminée (CDD)'}</strong>.{cddClause}
          <br /><br />
          <strong>Le Salarié s'engage à</strong> exercer ses fonctions avec diligence, compétence et loyauté, conformément aux directives de l'Employeur et aux usages de la profession.
        </Article>
      </div>

      <div className="page-break-avoid">
        <Article title="ARTICLE 3 : RÉMUNÉRATION">
          En contrepartie de l'exécution de ses fonctions, le Salarié percevra une rémunération mensuelle brute de <strong>{data.salary} {config.currency}</strong>.
          <br /><br />
          Cette rémunération est versée mensuellement par virement bancaire, sous réserve des retenues légales et conventionnelles applicables.{bonusClause}
          <br /><br />
          {config.articles.workDuration} la durée hebdomadaire de travail est fixée à <strong>{data.hours} heures</strong>.
        </Article>
      </div>

      <div className="page-break-avoid">
        <Article title="ARTICLE 4 : DURÉE DU CONTRAT ET PÉRIODE D'ESSAI">
          Le présent contrat de travail prend effet à compter du <strong>{new Date(data.startDate).toLocaleDateString('fr-FR')}</strong>{endDateClause}.
          <br /><br />
          Une période d'essai de <strong>{data.trial} mois</strong> est prévue. Durant cette période, chacune des parties peut mettre fin au contrat sans préavis ni indemnité, conformément aux dispositions légales en vigueur.
          <br /><br />
          À l'issue de la période d'essai, si aucune des parties n'a manifesté sa volonté de rompre le contrat, celui-ci se poursuivra dans les conditions définies aux présentes.
        </Article>
      </div>

      <div className="page-break-avoid">
        <Article title="ARTICLE 5 : OBLIGATIONS DES PARTIES">
          <strong>L'Employeur s'engage à :</strong>
          <br />
          - Fournir au Salarié un travail conforme à ses qualifications professionnelles
          <br />
          - Verser la rémunération convenue aux échéances prévues
          <br />
          - Respecter l'ensemble des dispositions légales et conventionnelles applicables
          <br />
          - Assurer la sécurité et la protection de la santé du Salarié
          <br /><br />
          <strong>Le Salarié s'engage à :</strong>
          <br />
          - Exécuter personnellement les missions qui lui sont confiées
          <br />
          - Respecter les directives de l'Employeur et le règlement intérieur
          <br />
          - Observer une obligation de loyauté et de confidentialité
          <br />
          - Consacrer l'intégralité de son activité professionnelle à l'Employeur
        </Article>
      </div>

      {data.hasNonCompete && (
        <div className="page-break-avoid">
          <Article title="ARTICLE 6 : CLAUSE DE NON-CONCURRENCE">
            Le Salarié s'engage, pendant une durée de <strong>{data.nonCompeteDuration}</strong> suivant la cessation du présent contrat, quelle qu'en soit la cause, à ne pas exercer, directement ou indirectement, une activité concurrente à celle de l'Employeur.
            <br /><br />
            Cette obligation s'applique sur le territoire du {config.name} et concerne toute activité similaire ou connexe à celle exercée au sein de la société {data.compName}.
            <br /><br />
            En contrepartie de cette clause, le Salarié percevra une indemnité compensatrice dont les modalités seront définies conformément aux dispositions légales applicables.
          </Article>
        </div>
      )}

      <div className="page-break-avoid">
        <Article title={`ARTICLE ${data.hasNonCompete ? '7' : '6'} : SUSPENSION ET RUPTURE DU CONTRAT`}>
          {config.articles.termination}
          <br /><br />
          La suspension du contrat de travail pourra intervenir dans les cas prévus par la loi (maladie, maternité, accident du travail, etc.).
          <br /><br />
          La rupture du contrat de travail, quelle qu'en soit la cause, devra respecter les dispositions légales en vigueur relatives au préavis, aux indemnités et aux formalités applicables.
          <br /><br />
          En cas de rupture du contrat, le Salarié restituera immédiatement à l'Employeur l'ensemble des documents, matériels et équipements mis à sa disposition.
        </Article>
      </div>

      <div className="page-break-avoid">
        <Article title={`ARTICLE ${data.hasNonCompete ? '8' : '7'} : LITIGES`}>
          En cas de différend relatif à l'interprétation ou à l'exécution du présent contrat, les parties s'efforceront de trouver une solution amiable.
          <br /><br />
          À défaut d'accord amiable, tout litige relèvera de la compétence exclusive du <strong>{config.court}</strong>, conformément aux dispositions légales applicables en matière de contentieux du travail.
        </Article>
      </div>

      {/* SIGNATURES */}
      <div className="page-break-avoid">
        <div className="mt-16 pt-8 space-y-8">
          <p className="text-sm">
            Fait à <strong>{data.compAddr.split(',')[0].trim()}</strong>, le <strong>{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
          </p>
          
          <p className="text-sm">En deux exemplaires originaux, dont un remis au Salarié.</p>

          <div className="grid grid-cols-2 gap-8 mt-12">
            <div className="text-center space-y-4">
              <p className="font-bold">L'EMPLOYEUR</p>
              {data.documentMode === 'ELECTRONIC' && signatures.employer ? (
                <div className="flex flex-col items-center">
                  <img src={signatures.employer} alt="Signature Employeur" className="h-24 border-b-2 border-black" />
                  <p className="text-xs text-gray-600 mt-2">Signature électronique</p>
                </div>
              ) : (
                <div className="h-24 border-b-2 border-black flex items-end justify-center pb-2">
                  <p className="text-xs text-gray-500">(Signature et cachet)</p>
                </div>
              )}
              <div className="text-sm">
                <p className="font-bold">{data.bossName}</p>
                <p className="text-gray-600">{data.bossTitle}</p>
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="font-bold">LE SALARIÉ</p>
              {data.documentMode === 'ELECTRONIC' && signatures.employee ? (
                <div className="flex flex-col items-center">
                  <img src={signatures.employee} alt="Signature Salarié" className="h-24 border-b-2 border-black" />
                  <p className="text-xs text-gray-600 mt-2">Signature électronique</p>
                </div>
              ) : (
                <div className="h-24 border-b-2 border-black flex items-end justify-center pb-2">
                  <p className="text-xs text-gray-500">(Lu et approuvé, signature)</p>
                </div>
              )}
              <div className="text-sm">
                <p className="font-bold">{data.empName}</p>
                <p className="text-gray-600">{data.jobTitle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-16 pt-8 border-t-2 border-gray-300 text-center text-xs text-gray-600">
          {data.documentMode === 'ELECTRONIC' ? (
            <>
              <p className="mb-2">Document généré via <strong>ECODREUM Intelligence</strong></p>
              <p>Ce document ne se substitue pas à un conseil juridique personnalisé</p>
            </>
          ) : (
            <p className="font-semibold">{data.compName}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Article({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="font-bold text-base mb-3 uppercase">{title}</h3>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
}

function InputField({ label, value, onChange, type = "text", placeholder = "...", icon, required = false, disabled = false, multiline = false }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-cyan-300 uppercase flex items-center gap-1.5">
        {icon && <span className="text-cyan-400">{icon}</span>}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className="input-glow bg-black/60 border border-cyan-400/30 rounded-xl p-3 text-sm text-white placeholder-cyan-400/40 outline-none focus:border-cyan-400 transition-all resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="input-glow bg-black/60 border border-cyan-400/30 rounded-xl p-3 text-sm text-white placeholder-cyan-400/40 outline-none focus:border-cyan-400 transition-all"
        />
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-yellow-400/20 pb-2">
      <span className="text-xs text-yellow-300/70 font-bold uppercase">{label}</span>
      <span className="text-xs text-yellow-200 font-black text-right">{value}</span>
    </div>
  );
}
