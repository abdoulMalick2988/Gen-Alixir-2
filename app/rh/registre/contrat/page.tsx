"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, Building, User, Briefcase, Download, Scale, 
  Save, CheckCircle, AlertTriangle, Globe, ShieldCheck,
  FileText, Eye, Calendar, MapPin, DollarSign, Clock,
  Award, Shield, AlertCircle, Upload, Image as ImageIcon,
  PenTool, Printer, Zap, Archive, Trash2, X, Sparkles,
  Hexagon, ChevronRight, Lock, Unlock
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

// --- STYLES CSS INLINE POUR ANIMATIONS ---
const styles = `
@keyframes hexFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

@keyframes particleFloat {
  0% { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
}

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px rgba(0, 229, 255, 0.3), 0 0 40px rgba(0, 229, 255, 0.2); }
  50% { box-shadow: 0 0 40px rgba(0, 229, 255, 0.5), 0 0 80px rgba(0, 229, 255, 0.3); }
}

.hex-float {
  animation: hexFloat 6s ease-in-out infinite;
}

.particle {
  animation: particleFloat 1s ease-out forwards;
}

.shimmer {
  background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.3), transparent);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}

.glass-card {
  background: rgba(0, 20, 40, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 229, 255, 0.2);
  transition: all 0.3s ease;
}

.glass-card:hover {
  background: rgba(0, 30, 60, 0.7);
  border-color: rgba(0, 229, 255, 0.5);
  transform: translateY(-4px);
  box-shadow: 0 20px 60px rgba(0, 229, 255, 0.2);
}

.golden-card {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 165, 0, 0.1));
  border: 2px solid rgba(255, 215, 0, 0.3);
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
  background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.2), transparent);
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

.section-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 229, 255, 0.15), transparent 50%);
  opacity: 0;
  transition: opacity 0.3s;
}

.section-card:hover::after {
  opacity: 1;
}

.input-glow:focus {
  box-shadow: 0 0 0 2px rgba(0, 229, 255, 0.3), 0 0 20px rgba(0, 229, 255, 0.2);
}
`;

export default function GenerateurContratFinal() {
  const router = useRouter();
  const contractRef = useRef<HTMLDivElement>(null);
  const signatureCanvasEmployer = useRef<HTMLCanvasElement>(null);
  const signatureCanvasEmployee = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  
  const [activeSection, setActiveSection] = useState<'company' | 'employee' | 'contract' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [currentSigner, setCurrentSigner] = useState<'employer' | 'employee' | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showArchives, setShowArchives] = useState(false);
  const [savedContracts, setSavedContracts] = useState<SavedContract[]>([]);
  const [notif, setNotif] = useState<{ m: string; t: 's' | 'e' | 'w' } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [touchPoints, setTouchPoints] = useState<{x: number, y: number}[]>([]);
  
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
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // --- CHARGEMENT DES CONTRATS ARCHIVÉS ---
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
      // Fallback to localStorage
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
      // Fallback to localStorage
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

  // --- ANIMATION PARTICULES ---
  const createParticles = (centerX: number, centerY: number) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 12; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: centerX,
        y: centerY,
        angle: (i * 30) * Math.PI / 180,
        speed: 100 + Math.random() * 100,
        size: 8 + Math.random() * 8
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1000);
  };

  const handleSectionClick = (section: 'company' | 'employee' | 'contract', event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    createParticles(centerX, centerY);
    setActiveSection(section);
  };

  // --- GESTION LOGO ---
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

  // --- GESTION SIGNATURE AMÉLIORÉE ---
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
    
    // Ajouter point de départ
    ctx.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    
    setTouchPoints([point]);
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

    // Ligne lisse
    ctx.lineTo(point.x, point.y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    // Ajouter point
    ctx.beginPath();
    ctx.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    
    setTouchPoints(prev => [...prev, point]);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setTouchPoints([]);
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

  // --- VALIDATION ---
  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!data.compName.trim()) errors.push("Raison sociale requise");
    if (!data.compRCCM.trim()) errors.push("Numéro RCCM requis");
    if (!data.compID.trim()) errors.push(`${config.idLabel} requis`);
    if (!data.bossName.trim()) errors.push("Nom du représentant requis");
    if (!data.compAddr.trim()) errors.push("Adresse entreprise requise");
    if (data.showCapital && !data.compCapital.trim()) errors.push("Capital social requis");

    if (!data.empName.trim()) errors.push("Nom du salarié requis");
    if (!data.empBirth.trim()) errors.push("Date de naissance requise");
    if (!data.empBirthPlace.trim()) errors.push("Lieu de naissance requis");
    if (!data.empID.trim()) errors.push("Numéro d'identification requis");
    if (!data.empAddr.trim()) errors.push("Adresse du salarié requise");
    if (!data.empPhone.trim()) errors.push("Téléphone requis");
    if (data.isForeigner && !data.empWorkPermit.trim()) errors.push("Permis de travail requis");

    if (!data.jobTitle.trim()) errors.push("Poste requis");
    if (!data.jobLocation.trim()) errors.push("Lieu de travail requis");
    if (!data.salary.trim() || parseFloat(data.salary) <= 0) errors.push("Salaire valide requis");
    if (!data.startDate) errors.push("Date de début requise");
    
    if (data.jobType === 'CDD') {
      if (!data.endDate) errors.push("Date de fin requise pour un CDD");
      if (!data.cddReason.trim()) errors.push("Motif du CDD requis");
    }
    
    if (data.hasNonCompete && !data.nonCompeteDuration.trim()) {
      errors.push("Durée de non-concurrence requise");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // --- EXPORT PDF ---
  const generatePDF = async () => {
    if (!validateForm()) {
      showNotif("Veuillez corriger les erreurs", "e");
      return;
    }

    setIsGenerating(true);
    try {
      setShowPreview(true);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!contractRef.current) {
        throw new Error("Référence du contrat non trouvée");
      }

      const canvas = await html2canvas(contractRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`CONTRAT_${data.empName.replace(/\s/g, '_')}_${Date.now()}.pdf`);
      
      await saveContractToArchive(data, !!(signatures.employer && signatures.employee));
      showNotif("PDF généré avec succès !", "s");
      
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      showNotif("Erreur lors de la génération du PDF", "e");
    } finally {
      setIsGenerating(false);
      setTimeout(() => setShowPreview(false), 1000);
    }
  };

  // --- NOTIFICATIONS ---
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
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f35 50%, #0a0e1a 100%)',
    }}>
      {/* Background Hexagons */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        {[...Array(20)].map((_, i) => (
          <Hexagon
            key={i}
            size={48}
            className="absolute text-cyan-400 hex-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Particles Animation */}
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
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
            ['--tx' as any]: `${Math.cos(particle.angle) * particle.speed}px`,
            ['--ty' as any]: `${Math.sin(particle.angle) * particle.speed}px`,
          }}
        />
      ))}

      <div className="max-w-7xl mx-auto p-4 md:p-8 relative z-10">
        
        {/* NOTIFICATIONS */}
        {notif && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-in slide-in-from-top duration-300 ${
            notif.t === 's' ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300' : 
            notif.t === 'w' ? 'bg-amber-500/20 border-amber-400/60 text-amber-300' :
            'bg-red-500/20 border-red-400/60 text-red-300'
          }`} style={{ animation: 'glow 2s infinite' }}>
            <div className="flex items-center gap-3">
              {notif.t === 's' && <CheckCircle size={18} />}
              {notif.t === 'w' && <AlertTriangle size={18} />}
              {notif.t === 'e' && <AlertCircle size={18} />}
              <span className="text-sm font-bold uppercase tracking-wide">{notif.m}</span>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div className="mb-12 relative">
          <div className="glass-card rounded-3xl p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => router.back()} 
                  className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl border border-cyan-400/30 hover:border-cyan-400/60 transition-all hover:scale-110 active:scale-95 group"
                  style={{ boxShadow: '0 0 30px rgba(0, 229, 255, 0.2)' }}
                >
                  <ArrowLeft size={24} className="text-cyan-400 group-hover:text-cyan-300" />
                </button>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles size={28} className="text-yellow-400 animate-pulse" />
                    <h1 className="text-4xl font-black uppercase tracking-tighter bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      CONTRACT ARCHITECT
                    </h1>
                  </div>
                  <p className="text-xs font-bold text-cyan-400/60 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Hexagon size={12} />
                    ECODREUM INTELLIGENCE • LEGAL ENGINE v4.5.0
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowArchives(true)}
                className="golden-card px-6 py-4 rounded-xl font-bold text-sm flex items-center gap-3 hover:scale-105 transition-all"
              >
                <Archive size={20} className="text-yellow-400" />
                <span className="text-yellow-100">Archives</span>
                <span className="px-3 py-1 bg-yellow-400/20 rounded-full text-xs text-yellow-300">
                  {savedContracts.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* MODE SÉLECTION */}
        <div className="mb-8">
          <div className="glass-card rounded-3xl p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div>
                <h3 className="text-lg font-black uppercase mb-2 text-cyan-400 flex items-center gap-2">
                  <Zap size={20} />
                  Mode de Document
                </h3>
                <p className="text-sm text-cyan-300/60">Sélectionnez le format de génération du contrat</p>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => updateData('documentMode', 'ELECTRONIC')}
                  className={`relative overflow-hidden px-8 py-5 rounded-2xl font-bold text-sm transition-all transform hover:scale-105 ${
                    data.documentMode === 'ELECTRONIC'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow-lg'
                      : 'glass-card text-cyan-300'
                  }`}
                  style={data.documentMode === 'ELECTRONIC' ? { boxShadow: '0 0 40px rgba(0, 229, 255, 0.5)' } : {}}
                >
                  <div className="flex items-center gap-3">
                    <Zap size={22} />
                    <div className="text-left">
                      <div className="uppercase tracking-wider">Électronique</div>
                      <div className="text-xs opacity-80">Signature numérique</div>
                    </div>
                    {data.documentMode === 'ELECTRONIC' && <CheckCircle size={18} />}
                  </div>
                </button>

                <button
                  onClick={() => updateData('documentMode', 'PRINT')}
                  className={`relative overflow-hidden px-8 py-5 rounded-2xl font-bold text-sm transition-all transform hover:scale-105 ${
                    data.documentMode === 'PRINT'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg'
                      : 'glass-card text-cyan-300'
                  }`}
                  style={data.documentMode === 'PRINT' ? { boxShadow: '0 0 40px rgba(255, 215, 0, 0.5)' } : {}}
                >
                  <div className="flex items-center gap-3">
                    <Printer size={22} />
                    <div className="text-left">
                      <div className="uppercase tracking-wider">À Imprimer</div>
                      <div className="text-xs opacity-80">Signature manuelle</div>
                    </div>
                    {data.documentMode === 'PRINT' && <CheckCircle size={18} />}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* JURIDICTION */}
        <div className="mb-8">
          <div className="glass-card rounded-3xl p-8">
            <label className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4 block flex items-center gap-2">
              <Globe size={18} />
              Juridiction Applicable
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['SENEGAL', 'BURUNDI'] as const).map((c) => (
                <button 
                  key={c} 
                  onClick={() => updateData('country', c)}
                  className={`relative overflow-hidden px-10 py-6 rounded-2xl text-lg font-black transition-all transform hover:scale-105 ${
                    data.country === c 
                      ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 text-black shadow-2xl' 
                      : 'glass-card text-cyan-300 hover:border-cyan-400/50'
                  }`}
                  style={data.country === c ? { boxShadow: '0 0 50px rgba(0, 229, 255, 0.4)' } : {}}
                >
                  {data.country === c && <div className="shimmer absolute inset-0" />}
                  <span className="relative z-10">{c}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PROGRESSION GLOBALE */}
        <div className="mb-8">
          <div className="glass-card rounded-3xl p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={16} />
                Progression Globale
              </span>
              <span className="text-2xl font-black text-cyan-300">{getProgress()}%</span>
            </div>
            <div className="h-4 bg-black/40 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 transition-all duration-500 relative"
                style={{ 
                  width: `${getProgress()}%`,
                  boxShadow: '0 0 20px rgba(0, 229, 255, 0.6)'
                }}
              >
                <div className="shimmer absolute inset-0" />
              </div>
            </div>
          </div>
        </div>

        {/* ERREURS DE VALIDATION */}
        {validationErrors.length > 0 && (
          <div className="mb-8">
            <div className="bg-red-500/10 border-2 border-red-400/40 rounded-3xl p-6 backdrop-blur-xl">
              <div className="flex items-center gap-3 text-red-400 mb-4">
                <AlertCircle size={24} />
                <h3 className="text-lg font-black uppercase">Champs Requis Manquants</h3>
              </div>
              <ul className="space-y-2">
                {validationErrors.map((error, i) => (
                  <li key={i} className="text-sm text-red-300/90 pl-6 flex items-center gap-2">
                    <Hexagon size={8} className="text-red-400" />
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {/* NAVIGATION SECTIONS - CARTES ANIMÉES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { id: 'company', label: 'Entreprise', icon: Building, color: 'from-emerald-500 to-teal-500', iconColor: 'text-emerald-400' },
            { id: 'employee', label: 'Salarié', icon: User, color: 'from-blue-500 to-cyan-500', iconColor: 'text-blue-400' },
            { id: 'contract', label: 'Contrat', icon: Briefcase, color: 'from-amber-500 to-yellow-500', iconColor: 'text-amber-400' }
          ].map(({ id, label, icon: Icon, color, iconColor }) => {
            const progress = getSectionProgress(id as any);
            const isActive = activeSection === id;
            const isComplete = progress === 100;
            
            return (
              <div
                key={id}
                onClick={(e) => handleSectionClick(id as any, e)}
                className={`section-card glass-card rounded-3xl p-8 cursor-pointer transition-all transform hover:scale-105 relative overflow-hidden group ${
                  isActive ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-transparent' : ''
                }`}
                style={{
                  boxShadow: isActive ? '0 0 60px rgba(0, 229, 255, 0.4)' : '0 10px 40px rgba(0, 0, 0, 0.3)'
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
                  e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
                }}
              >
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                {/* Status Icon */}
                <div className="absolute top-4 right-4">
                  {isComplete ? (
                    <div className="p-2 bg-emerald-500/20 rounded-full">
                      <CheckCircle size={20} className="text-emerald-400" />
                    </div>
                  ) : isActive ? (
                    <div className="p-2 bg-cyan-500/20 rounded-full animate-pulse">
                      <Unlock size={20} className="text-cyan-400" />
                    </div>
                  ) : (
                    <div className="p-2 bg-gray-500/20 rounded-full">
                      <Lock size={20} className="text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Icon */}
                <div className={`w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br ${color} p-0.5 group-hover:scale-110 transition-transform`}>
                  <div className="w-full h-full bg-gray-900 rounded-2xl flex items-center justify-center">
                    <Icon size={40} className={iconColor} />
                  </div>
                </div>

                {/* Label */}
                <h3 className="text-2xl font-black uppercase mb-4 text-white group-hover:text-cyan-300 transition-colors">
                  {label}
                </h3>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cyan-400/80 font-bold">Progression</span>
                    <span className="text-cyan-300 font-black">{progress}%</span>
                  </div>
                  <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${color} transition-all duration-500`}
                      style={{ 
                        width: `${progress}%`,
                        boxShadow: progress > 0 ? '0 0 10px rgba(0, 229, 255, 0.5)' : 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className={`absolute bottom-4 right-4 transform transition-all ${
                  isActive ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                }`}>
                  <ChevronRight size={24} className="text-cyan-400" />
                </div>
              </div>
            );
          })}
        </div>

        {/* FORMULAIRE ACTIF */}
        {activeSection && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom duration-500">
            {/* FORMULAIRE */}
            <div className="lg:col-span-8">
              
              {/* SECTION ENTREPRISE */}
              {activeSection === 'company' && (
                <div className="glass-card rounded-3xl p-10 space-y-8">
                  <div className="flex items-center gap-4 pb-6 border-b border-cyan-400/20">
                    <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl">
                      <Building size={32} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black uppercase text-emerald-400">Structure Employeuse</h2>
                      <p className="text-sm text-cyan-300/60">Informations légales de l'entreprise</p>
                    </div>
                  </div>

                  {/* LOGO ET DESCRIPTION */}
                  <div className="golden-card rounded-2xl p-8 space-y-6">
                    <h3 className="text-sm font-black uppercase text-yellow-400 flex items-center gap-2 mb-6">
                      <Sparkles size={16} />
                      Identité Visuelle (Optionnel)
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="text-xs font-bold text-yellow-300/80 uppercase mb-3 block flex items-center gap-2">
                          <ImageIcon size={14} />
                          Logo de l'entreprise
                        </label>
                        <div className="relative">
                          {data.compLogo ? (
                            <div className="relative group">
                              <div className="p-4 bg-white rounded-2xl shadow-xl">
                                <img src={data.compLogo} alt="Logo" className="w-40 h-40 object-contain" />
                              </div>
                              <button
                                onClick={() => updateData('compLogo', null)}
                                className="absolute -top-2 -right-2 p-3 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-yellow-400/30 rounded-2xl cursor-pointer hover:border-yellow-400/60 hover:bg-yellow-400/5 transition-all group">
                              <Upload size={32} className="text-yellow-400 mb-3 group-hover:scale-110 transition-transform" />
                              <span className="text-sm text-yellow-300 font-bold">Charger le logo</span>
                              <span className="text-xs text-yellow-400/60 mt-1">PNG, JPG (max 2MB)</span>
                              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="flex-1">
                        <InputField
                          label="Description entreprise"
                          value={data.compDescription}
                          onChange={(v) => updateData('compDescription', v)}
                          placeholder="Ex: Leader en solutions digitales innovantes..."
                          multiline
                          icon={<FileText size={14} />}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Raison Sociale"
                      value={data.compName}
                      onChange={(v) => updateData('compName', v)}
                      icon={<Building size={14} />}
                      required
                      placeholder="Nom légal de l'entreprise"
                    />
                    <InputField
                      label="Forme Juridique"
                      value={data.compType}
                      onChange={(v) => updateData('compType', v)}
                      placeholder="SARL, SA, SAS..."
                      icon={<ShieldCheck size={14} />}
                      required
                    />
                  </div>

                  <div className="glass-card rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={data.showCapital}
                        onChange={(e) => updateData('showCapital', e.target.checked)}
                        className="w-5 h-5 rounded border-cyan-400/40 bg-black/60 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 cursor-pointer"
                      />
                      <label className="text-sm font-bold text-cyan-300 uppercase cursor-pointer">
                        Mentionner le capital social
                      </label>
                    </div>
                    {data.showCapital && (
                      <InputField
                        label="Capital Social"
                        value={data.compCapital}
                        onChange={(v) => updateData('compCapital', v)}
                        placeholder={`Ex: 1 000 000 ${config.currency}`}
                        icon={<DollarSign size={14} />}
                        required
                      />
                    )}
                  </div>

                  <InputField
                    label="Siège Social"
                    value={data.compAddr}
                    onChange={(v) => updateData('compAddr', v)}
                    placeholder="Adresse complète du siège"
                    icon={<MapPin size={14} />}
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Numéro RCCM"
                      value={data.compRCCM}
                      onChange={(v) => updateData('compRCCM', v)}
                      placeholder="Ex: BJ/BGM/2024/A/123"
                      icon={<FileText size={14} />}
                      required
                    />
                    <InputField
                      label={config.idLabel}
                      value={data.compID}
                      onChange={(v) => updateData('compID', v)}
                      placeholder={`Numéro ${config.idLabel}`}
                      icon={<Shield size={14} />}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Représentant Légal"
                      value={data.bossName}
                      onChange={(v) => updateData('bossName', v)}
                      placeholder="Nom complet du représentant"
                      icon={<User size={14} />}
                      required
                    />
                    <InputField
                      label="Fonction"
                      value={data.bossTitle}
                      onChange={(v) => updateData('bossTitle', v)}
                      placeholder="Gérant, Directeur Général..."
                      icon={<Award size={14} />}
                      required
                    />
                  </div>
                </div>
              )}

              {/* SECTION SALARIÉ */}
              {activeSection === 'employee' && (
                <div className="glass-card rounded-3xl p-10 space-y-8">
                  <div className="flex items-center gap-4 pb-6 border-b border-cyan-400/20">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl">
                      <User size={32} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black uppercase text-blue-400">Informations Salarié</h2>
                      <p className="text-sm text-cyan-300/60">Données personnelles et identification</p>
                    </div>
                  </div>

                  <InputField
                    label="Nom Complet"
                    value={data.empName}
                    onChange={(v) => updateData('empName', v)}
                    placeholder="Prénom et nom du salarié"
                    icon={<User size={14} />}
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Date de Naissance"
                      type="date"
                      value={data.empBirth}
                      onChange={(v) => updateData('empBirth', v)}
                      icon={<Calendar size={14} />}
                      required
                    />
                    <InputField
                      label="Lieu de Naissance"
                      value={data.empBirthPlace}
                      onChange={(v) => updateData('empBirthPlace', v)}
                      placeholder="Ville, Pays"
                      icon={<MapPin size={14} />}
                      required
                    />
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField
                        label="Nationalité"
                        value={data.empNation}
                        onChange={(v) => updateData('empNation', v)}
                        placeholder="Ex: Burundaise, Sénégalaise"
                        icon={<Globe size={14} />}
                        required
                      />
                      <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={data.isForeigner}
                          onChange={(e) => updateData('isForeigner', e.target.checked)}
                          className="w-5 h-5 rounded border-cyan-400/40 bg-black/60 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <label className="text-sm font-bold text-cyan-300 uppercase cursor-pointer">
                          Travailleur étranger
                        </label>
                      </div>
                    </div>

                    {data.isForeigner && (
                      <div className="bg-blue-500/10 border-2 border-blue-400/30 rounded-2xl p-6">
                        <InputField
                          label="Numéro Permis de Travail"
                          value={data.empWorkPermit}
                          onChange={(v) => updateData('empWorkPermit', v)}
                          placeholder="N° du permis de travail"
                          icon={<Shield size={14} />}
                          required
                        />
                      </div>
                    )}
                  </div>

                  <InputField
                    label="Adresse de Résidence"
                    value={data.empAddr}
                    onChange={(v) => updateData('empAddr', v)}
                    placeholder="Adresse complète du salarié"
                    icon={<MapPin size={14} />}
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="N° Pièce d'Identité"
                      value={data.empID}
                      onChange={(v) => updateData('empID', v)}
                      placeholder="CNI, Passeport..."
                      icon={<FileText size={14} />}
                      required
                    />
                    <InputField
                      label="Téléphone"
                      type="tel"
                      value={data.empPhone}
                      onChange={(v) => updateData('empPhone', v)}
                      placeholder="+257 XX XXX XXX"
                      icon={<User size={14} />}
                      required
                    />
                  </div>
                </div>
              )}

              {/* SECTION CONTRAT */}
              {activeSection === 'contract' && (
                <div className="glass-card rounded-3xl p-10 space-y-8">
                  <div className="flex items-center gap-4 pb-6 border-b border-cyan-400/20">
                    <div className="p-4 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl">
                      <Briefcase size={32} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black uppercase text-amber-400">Conditions de Travail</h2>
                      <p className="text-sm text-cyan-300/60">Modalités contractuelles et rémunération</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-bold text-cyan-300 uppercase ml-1 tracking-wider flex items-center gap-2">
                        <Briefcase size={14} />
                        Type de Contrat *
                      </label>
                      <select
                        value={data.jobType}
                        onChange={(e) => updateData('jobType', e.target.value as 'CDI' | 'CDD')}
                        className="bg-black/60 border-2 border-cyan-400/30 rounded-xl p-4 text-base text-white outline-none focus:border-cyan-400 focus:bg-cyan-400/5 transition-all appearance-none cursor-pointer font-bold hover:border-cyan-400/60"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2300e5ff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                      >
                        <option value="CDI">CDI - Contrat à Durée Indéterminée</option>
                        <option value="CDD">CDD - Contrat à Durée Déterminée</option>
                      </select>
                    </div>

                    <InputField
                      label="Poste Occupé"
                      value={data.jobTitle}
                      onChange={(v) => updateData('jobTitle', v)}
                      placeholder="Ex: Développeur Senior"
                      icon={<Briefcase size={14} />}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Département"
                      value={data.jobDept}
                      onChange={(v) => updateData('jobDept', v)}
                      placeholder="Ex: Technique, RH, Finance..."
                      icon={<Building size={14} />}
                      required
                    />
                    <InputField
                      label="Lieu de Travail"
                      value={data.jobLocation}
                      onChange={(v) => updateData('jobLocation', v)}
                      placeholder="Adresse du lieu de travail"
                      icon={<MapPin size={14} />}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Date de Début"
                      type="date"
                      value={data.startDate}
                      onChange={(v) => updateData('startDate', v)}
                      icon={<Calendar size={14} />}
                      required
                    />
                    {data.jobType === 'CDD' && (
                      <InputField
                        label="Date de Fin (CDD)"
                        type="date"
                        value={data.endDate}
                        onChange={(v) => updateData('endDate', v)}
                        icon={<Calendar size={14} />}
                        required
                      />
                    )}
                  </div>

                  {data.jobType === 'CDD' && (
                    <div className="bg-amber-500/10 border-2 border-amber-400/30 rounded-2xl p-6">
                      <InputField
                        label="Motif du CDD"
                        value={data.cddReason}
                        onChange={(v) => updateData('cddReason', v)}
                        placeholder="Ex: Remplacement, Accroissement temporaire d'activité..."
                        icon={<FileText size={14} />}
                        required
                        multiline
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label={`Salaire Mensuel Brut (${config.currency})`}
                      type="number"
                      value={data.salary}
                      onChange={(v) => updateData('salary', v)}
                      placeholder="0"
                      icon={<DollarSign size={14} />}
                      required
                    />
                    <InputField
                      label="Primes et Avantages"
                      value={data.bonus}
                      onChange={(v) => updateData('bonus', v)}
                      placeholder="Optionnel - Ex: Prime de transport..."
                      icon={<Award size={14} />}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Heures Hebdomadaires"
                      type="number"
                      value={data.hours}
                      onChange={(v) => updateData('hours', v)}
                      placeholder="40"
                      icon={<Clock size={14} />}
                      required
                    />
                    <InputField
                      label="Période d'Essai (mois)"
                      type="number"
                      value={data.trial}
                      onChange={(v) => updateData('trial', v)}
                      placeholder="3"
                      icon={<Calendar size={14} />}
                      required
                    />
                  </div>

                  <div className="golden-card rounded-2xl p-8 space-y-6">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={data.hasNonCompete}
                        onChange={(e) => updateData('hasNonCompete', e.target.checked)}
                        className="w-5 h-5 rounded border-yellow-400/40 bg-black/60 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-0 cursor-pointer"
                      />
                      <label className="text-sm font-bold text-yellow-300 uppercase cursor-pointer flex items-center gap-2">
                        <Shield size={16} />
                        Inclure une clause de non-concurrence
                      </label>
                    </div>

                    {data.hasNonCompete && (
                      <InputField
                        label="Durée de Non-Concurrence"
                        value={data.nonCompeteDuration}
                        onChange={(v) => updateData('nonCompeteDuration', v)}
                        placeholder="Ex: 12 mois, 2 ans..."
                        icon={<Shield size={14} />}
                        required
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* PANNEAU ACTIONS */}
            <div className="lg:col-span-4">
              <div className="glass-card rounded-3xl p-8 sticky top-8 space-y-6" style={{ 
                background: 'linear-gradient(135deg, rgba(0, 20, 40, 0.8), rgba(0, 30, 60, 0.8))',
                boxShadow: '0 0 60px rgba(0, 229, 255, 0.2)'
              }}>
                <div className="flex items-center gap-3 pb-6 border-b border-cyan-400/20">
                  <CheckCircle size={28} className="text-cyan-400" />
                  <h3 className="text-2xl font-black uppercase text-cyan-300">Actions</h3>
                </div>

                {/* SIGNATURES ÉLECTRONIQUES */}
                {data.documentMode === 'ELECTRONIC' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-cyan-400 mb-4 flex items-center gap-2">
                      <PenTool size={14} />
                      Signatures Électroniques
                    </h4>
                    
                    <button
                      onClick={() => openSignatureModal('employer')}
                      className={`w-full py-5 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all transform hover:scale-105 ${
                        signatures.employer
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-lg'
                          : 'glass-card text-cyan-300 hover:border-emerald-400/50'
                      }`}
                      style={signatures.employer ? { boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)' } : {}}
                    >
                      <PenTool size={18} />
                      <span>{signatures.employer ? 'Signature Employeur ✓' : 'Signer (Employeur)'}</span>
                    </button>

                    <button
                      onClick={() => openSignatureModal('employee')}
                      className={`w-full py-5 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all transform hover:scale-105 ${
                        signatures.employee
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-black shadow-lg'
                          : 'glass-card text-cyan-300 hover:border-blue-400/50'
                      }`}
                      style={signatures.employee ? { boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)' } : {}}
                    >
                      <PenTool size={18} />
                      <span>{signatures.employee ? 'Signature Salarié ✓' : 'Signer (Salarié)'}</span>
                    </button>
                  </div>
                )}

                {/* BOUTONS EXPORT */}
                <div className="space-y-4 pt-6 border-t border-cyan-400/20">
                  <button
                    onClick={generatePDF}
                    disabled={isGenerating}
                    className="w-full py-6 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 hover:from-cyan-400 hover:via-blue-400 hover:to-cyan-400 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 text-black rounded-xl font-black uppercase text-sm flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95 relative overflow-hidden"
                    style={{ boxShadow: '0 0 40px rgba(0, 229, 255, 0.5)' }}
                  >
                    {!isGenerating && <div className="shimmer absolute inset-0" />}
                    {isGenerating ? (
                      <>
                        <div className="animate-spin">⏳</div>
                        <span>Génération...</span>
                      </>
                    ) : (
                      <>
                        <Download size={24} />
                        <span>Générer PDF</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="w-full py-5 glass-card hover:bg-blue-500/20 border-2 border-blue-400/30 hover:border-blue-400/60 text-blue-300 rounded-xl font-black uppercase text-sm flex items-center justify-center gap-3 transition-all transform hover:scale-105"
                  >
                    <Eye size={20} />
                    <span>{showPreview ? 'Masquer Aperçu' : 'Voir Aperçu'}</span>
                  </button>
                </div>

                {/* RÉCAPITULATIF */}
                <div className="pt-6 border-t border-cyan-400/20">
                  <div className="golden-card rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-2 text-yellow-400 mb-4">
                      <Scale size={18} />
                      <span className="text-xs font-black uppercase tracking-widest">
                        Récapitulatif
                      </span>
                    </div>

                    <div className="space-y-3">
                      <InfoRow label="Pays" value={config.name} />
                      <InfoRow label="Juridiction" value={config.court} />
                      <InfoRow label="Devise" value={config.currency} />
                      <InfoRow label="Type contrat" value={data.jobType} />
                      <InfoRow label="Mode" value={data.documentMode === 'ELECTRONIC' ? 'Électronique' : 'Imprimé'} />
                    </div>
                  </div>
                </div>

                {/* DISCLAIMER */}
                <div className="bg-amber-500/10 border-2 border-amber-400/30 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-300/90 leading-relaxed">
                      Ce document est généré automatiquement et ne se substitue pas à un conseil juridique personnalisé.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL SIGNATURE AMÉLIORÉ */}
        {showSignatureModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-card rounded-3xl p-10 max-w-4xl w-full" style={{ 
              boxShadow: '0 0 100px rgba(0, 229, 255, 0.3)',
              animation: 'glow 3s infinite'
            }}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-black uppercase text-cyan-300 flex items-center gap-3">
                  <PenTool size={32} className="text-cyan-400" />
                  Signature {currentSigner === 'employer' ? 'Employeur' : 'Salarié'}
                </h3>
                <button
                  onClick={() => {
                    setShowSignatureModal(false);
                    setCurrentSigner(null);
                  }}
                  className="p-3 bg-red-500/20 border border-red-400/40 text-red-400 rounded-xl hover:bg-red-500/30 transition-all"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="mb-6 text-sm text-cyan-300/70 flex items-center gap-2 bg-cyan-500/10 border border-cyan-400/20 rounded-xl p-4">
                <Sparkles size={16} className="text-cyan-400" />
                <span>Signez dans l'espace ci-dessous. La signature inclut des points de guidage pour un rendu optimal.</span>
              </div>

              <div 
                ref={canvasContainerRef}
                className="bg-white rounded-2xl p-6 mb-8 relative overflow-hidden"
                style={{ 
                  boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.1)',
                  touchAction: 'none'
                }}
              >
                <canvas
                  ref={currentSigner === 'employer' ? signatureCanvasEmployer : signatureCanvasEmployee}
                  width={800}
                  height={400}
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
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-400 text-sm font-bold pointer-events-none">
                  Signez ici
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={clearSignature}
                  className="flex-1 py-4 bg-red-500/20 border-2 border-red-400/40 text-red-300 rounded-xl font-bold hover:bg-red-500/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Trash2 size={20} />
                  Effacer
                </button>
                <button
                  onClick={saveSignature}
                  className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-black rounded-xl font-bold hover:from-emerald-400 hover:to-teal-400 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                  style={{ boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)' }}
                >
                  <Save size={20} />
                  Enregistrer Signature
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ARCHIVES */}
        {showArchives && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
              <div className="glass-card rounded-3xl p-10" style={{ boxShadow: '0 0 80px rgba(0, 229, 255, 0.3)' }}>
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-4xl font-black uppercase text-cyan-300 flex items-center gap-4">
                    <Archive size={40} className="text-yellow-400" />
                    Archives des Contrats
                  </h2>
                  <button
                    onClick={() => setShowArchives(false)}
                    className="px-8 py-4 glass-card text-white rounded-xl font-bold hover:bg-white/10 transition-all transform hover:scale-105 flex items-center gap-2"
                  >
                    <X size={20} />
                    Fermer
                  </button>
                </div>

                {savedContracts.length === 0 ? (
                  <div className="text-center py-32">
                    <Archive size={80} className="mx-auto text-cyan-400/30 mb-6" />
                    <p className="text-2xl text-cyan-300/60 font-bold">Aucun contrat archivé</p>
                    <p className="text-sm text-cyan-400/40 mt-2">Les contrats générés apparaîtront ici</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedContracts.map((contract) => (
                      <div key={contract.id} className="glass-card rounded-2xl p-6 space-y-4 hover:scale-105 transition-transform">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-black text-lg text-cyan-300 mb-1">{contract.employeeName}</h3>
                            <p className="text-sm text-cyan-400/70">{contract.jobTitle}</p>
                          </div>
                          <span className={`text-xs px-3 py-1.5 rounded-lg font-bold ${
                            contract.mode === 'ELECTRONIC' 
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40' 
                              : 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/40'
                          }`}>
                            {contract.mode === 'ELECTRONIC' ? 'E-Sign' : 'Print'}
                          </span>
                        </div>

                        <div className="text-xs text-cyan-300/60 space-y-2 pt-4 border-t border-cyan-400/20">
                          <div className="flex items-center justify-between">
                            <span>Type:</span>
                            <span className="font-bold text-cyan-300">{contract.contractType}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Date:</span>
                            <span className="font-bold text-cyan-300">
                              {new Date(contract.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          {contract.signed && (
                            <div className="flex items-center gap-2 text-emerald-400 font-bold pt-2">
                              <CheckCircle size={16} />
                              Signé électroniquement
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={() => loadContract(contract)}
                            className="flex-1 py-3 bg-blue-500/20 border-2 border-blue-400/40 text-blue-300 rounded-xl text-xs font-bold hover:bg-blue-500/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                          >
                            <Upload size={16} />
                            Charger
                          </button>
                          <button
                            onClick={() => deleteContract(contract.id)}
                            className="p-3 bg-red-500/20 border-2 border-red-400/40 text-red-300 rounded-xl hover:bg-red-500/30 transition-all transform hover:scale-105"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PRÉVISUALISATION CONTRAT */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-40 overflow-y-auto">
            <div className="min-h-screen flex items-center justify-center p-8">
              <div ref={contractRef} className="bg-white text-black w-[210mm] min-h-[297mm] p-16 shadow-2xl">
                <ContractPreview data={data} config={config} signatures={signatures} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- COMPOSANT PRÉVISUALISATION CONTRAT (Inchangé - même que l'original) ---
function ContractPreview({ data, config, signatures }: { data: FormData; config: CountryConfig; signatures: { employer: string; employee: string } }) {
  const capitalClause = data.showCapital && data.compCapital ? `, au capital social de ${data.compCapital} ${config.currency}` : '';
  const foreignerClause = data.isForeigner && data.empWorkPermit ? `, titulaire du permis de travail n°${data.empWorkPermit}` : '';
  const cddClause = data.jobType === 'CDD' && data.cddReason ? `\n\nLe présent contrat est conclu pour les besoins suivants : ${data.cddReason}.` : '';
  const bonusClause = data.bonus ? `\n\nEn sus de cette rémunération de base, le Salarié pourra percevoir les primes et avantages suivants : ${data.bonus}.` : '';
  const endDateClause = data.jobType === 'CDD' && data.endDate ? ` et prendra fin le ${new Date(data.endDate).toLocaleDateString('fr-FR')}` : '';

  return (
    <div className="space-y-6 font-serif" style={{ fontFamily: 'Georgia, serif', lineHeight: '1.8' }}>
      {/* EN-TÊTE */}
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

      {/* PARTIES */}
      <div className="space-y-6 text-sm">
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

        {/* ARTICLES */}
        <div className="space-y-6">
          <Article title="ARTICLE 1 : OBJET ET CADRE LÉGAL">
            Le présent contrat est conclu sous le régime du {config.code}.
            <br /><br />
            {config.articles.intro}
            <br />
            {config.articles.engagement}
            <br /><br />
            Le présent contrat définit les conditions d'engagement et d'emploi du Salarié au sein de la société {data.compName}.
          </Article>

          <Article title="ARTICLE 2 : NATURE ET FONCTIONS">
            Le Salarié est recruté en qualité de <strong>{data.jobTitle}</strong> au sein du département <strong>{data.jobDept}</strong>.
            <br /><br />
            Le Salarié exercera ses fonctions au sein de l'établissement situé à <strong>{data.jobLocation}</strong>.
            <br /><br />
            Le type de contrat conclu est un contrat à durée <strong>{data.jobType === 'CDI' ? 'indéterminée (CDI)' : 'déterminée (CDD)'}</strong>.{cddClause}
            <br /><br />
            <strong>Le Salarié s'engage à</strong> exercer ses fonctions avec diligence, compétence et loyauté, conformément aux directives de l'Employeur et aux usages de la profession.
          </Article>

          <Article title="ARTICLE 3 : RÉMUNÉRATION">
            En contrepartie de l'exécution de ses fonctions, le Salarié percevra une rémunération mensuelle brute de <strong>{data.salary} {config.currency}</strong>.
            <br /><br />
            Cette rémunération est versée mensuellement par virement bancaire, sous réserve des retenues légales et conventionnelles applicables.{bonusClause}
            <br /><br />
            {config.articles.workDuration} la durée hebdomadaire de travail est fixée à <strong>{data.hours} heures</strong>.
          </Article>

          <Article title="ARTICLE 4 : DURÉE DU CONTRAT ET PÉRIODE D'ESSAI">
            Le présent contrat de travail prend effet à compter du <strong>{new Date(data.startDate).toLocaleDateString('fr-FR')}</strong>{endDateClause}.
            <br /><br />
            Une période d'essai de <strong>{data.trial} mois</strong> est prévue. Durant cette période, chacune des parties peut mettre fin au contrat sans préavis ni indemnité, conformément aux dispositions légales en vigueur.
            <br /><br />
            À l'issue de la période d'essai, si aucune des parties n'a manifesté sa volonté de rompre le contrat, celui-ci se poursuivra dans les conditions définies aux présentes.
          </Article>

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

          {data.hasNonCompete && (
            <Article title="ARTICLE 6 : CLAUSE DE NON-CONCURRENCE">
              Le Salarié s'engage, pendant une durée de <strong>{data.nonCompeteDuration}</strong> suivant la cessation du présent contrat, quelle qu'en soit la cause, à ne pas exercer, directement ou indirectement, une activité concurrente à celle de l'Employeur.
              <br /><br />
              Cette obligation s'applique sur le territoire du {config.name} et concerne toute activité similaire ou connexe à celle exercée au sein de la société {data.compName}.
              <br /><br />
              En contrepartie de cette clause, le Salarié percevra une indemnité compensatrice dont les modalités seront définies conformément aux dispositions légales applicables.
            </Article>
          )}

          <Article title={`ARTICLE ${data.hasNonCompete ? '7' : '6'} : SUSPENSION ET RUPTURE DU CONTRAT`}>
            {config.articles.termination}
            <br /><br />
            La suspension du contrat de travail pourra intervenir dans les cas prévus par la loi (maladie, maternité, accident du travail, etc.).
            <br /><br />
            La rupture du contrat de travail, quelle qu'en soit la cause, devra respecter les dispositions légales en vigueur relatives au préavis, aux indemnités et aux formalités applicables.
            <br /><br />
            En cas de rupture du contrat, le Salarié restituera immédiatement à l'Employeur l'ensemble des documents, matériels et équipements mis à sa disposition.
          </Article>

          <Article title={`ARTICLE ${data.hasNonCompete ? '8' : '7'} : LITIGES`}>
            En cas de différend relatif à l'interprétation ou à l'exécution du présent contrat, les parties s'efforceront de trouver une solution amiable.
            <br /><br />
            À défaut d'accord amiable, tout litige relèvera de la compétence exclusive du <strong>{config.court}</strong>, conformément aux dispositions légales applicables en matière de contentieux du travail.
          </Article>
        </div>

        {/* SIGNATURES */}
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
              <p className="mb-2">Document généré via la plateforme <strong>ECODREUM Intelligence</strong></p>
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

// --- COMPOSANT ARTICLE ---
function Article({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="font-bold text-base mb-3 uppercase">{title}</h3>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

// --- COMPOSANT INPUT FIELD AMÉLIORÉ ---
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
    <div className="flex flex-col gap-3">
      <label className="text-xs font-bold text-cyan-300 uppercase ml-1 tracking-wider flex items-center gap-2">
        {icon && <span className="text-cyan-400">{icon}</span>}
        {label}
        {required && <span className="text-red-400 text-sm">*</span>}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={4}
          className="input-glow bg-black/60 border-2 border-cyan-400/30 rounded-xl p-4 text-base text-white placeholder-cyan-400/40 outline-none focus:border-cyan-400 focus:bg-cyan-400/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed resize-none font-medium"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="input-glow bg-black/60 border-2 border-cyan-400/30 rounded-xl p-4 text-base text-white placeholder-cyan-400/40 outline-none focus:border-cyan-400 focus:bg-cyan-400/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed font-medium"
        />
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-yellow-400/20 pb-3">
      <span className="text-xs text-yellow-300/70 font-bold uppercase">{label}</span>
      <span className="text-xs text-yellow-200 font-black text-right">{value}</span>
    </div>
  );
}
