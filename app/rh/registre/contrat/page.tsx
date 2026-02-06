"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, Building, User, Briefcase, Download, Scale, 
  CheckCircle, AlertTriangle, Globe, ShieldCheck,
  FileText, Eye, Calendar, MapPin, DollarSign, Clock,
  Award, Shield, AlertCircle, Upload, Image as ImageIcon,
  PenTool, Printer, Zap, Archive, Trash2, X,
  Search, FileDown, QrCode, GraduationCap, ClipboardList,
  RotateCcw
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCodeLib from 'qrcode';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

// --- INITIALISATION SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- CONVERSION NOMBRE EN LETTRES ---
function numberToFrench(num: number): string {
  const ones = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];

  if (num === 0) return 'zéro';
  if (num < 10) return ones[num];
  if (num >= 10 && num < 20) return teens[num - 10];
  if (num >= 20 && num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    if (num >= 70 && num < 80) return `soixante-${teens[one]}`;
    if (num >= 90) return `quatre-vingt-${teens[one]}`;
    return tens[ten] + (one > 0 ? `-${ones[one]}` : '');
  }
  if (num >= 100 && num < 1000) {
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    return `${hundred > 1 ? ones[hundred] + ' ' : ''}cent${hundred > 1 && rest === 0 ? 's' : ''}${rest > 0 ? ' ' + numberToFrench(rest) : ''}`;
  }
  if (num >= 1000 && num < 1000000) {
    const thousand = Math.floor(num / 1000);
    const rest = num % 1000;
    return `${thousand > 1 ? numberToFrench(thousand) + ' ' : ''}mille${rest > 0 ? ' ' + numberToFrench(rest) : ''}`;
  }
  if (num >= 1000000) {
    const million = Math.floor(num / 1000000);
    const rest = num % 1000000;
    return `${numberToFrench(million)} million${million > 1 ? 's' : ''}${rest > 0 ? ' ' + numberToFrench(rest) : ''}`;
  }
  return num.toString();
}

function salaryToWords(amount: string, currency: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return '';
  return `${numberToFrench(Math.floor(num))} ${currency}`;
}

// --- TYPES ---
interface ImportedFile {
  name: string;
  type: string;
  data: string;
}

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
  empEmail: string;
  jobTitle: string;
  jobDept: string;
  jobType: 'CDI' | 'CDD' | 'STAGE';
  jobLocation: string;
  jobTasks: string;
  salary: string;
  bonus: string;
  startDate: string;
  endDate: string;
  cddReason: string;
  stageSchool: string;
  stageLevel: string;
  trial: string;
  hours: string;
  hasNonCompete: boolean;
  nonCompeteDuration: string;
  documentMode: 'ELECTRONIC' | 'PRINT';
}

interface CountryConfig {
  name: string;
  code: string;
  lawReference: string;
  court: string;
  idLabel: string;
  currency: string;
  articles: {
    intro: string;
    engagement: string;
    workDuration: string;
    termination: string;
    employerObligations: string[];
    employeeObligations: string[];
    disputes: string;
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
  qrCode?: string;
  importedFile?: ImportedFile;
}

// --- CONFIGURATION JURIDIQUE COMPLÈTE ---
const COUNTRIES: Record<'SENEGAL' | 'BURUNDI', CountryConfig> = {
  SENEGAL: {
    name: "Sénégal",
    code: "Code du Travail Sénégalais",
    lawReference: "Loi n° 97-17 du 1er décembre 1997 portant Code du Travail du Sénégal",
    court: "Tribunal du Travail de Dakar",
    idLabel: "NINEA",
    currency: "FCFA",
    articles: {
      intro: "Vu la Loi n° 97-17 du 1er décembre 1997 portant Code du Travail du Sénégal,",
      engagement: "Conformément aux dispositions des articles L.23 à L.37 de la Loi n° 97-17 du 1er décembre 1997 portant Code du Travail du Sénégal, relatifs au contrat de travail,",
      workDuration: "En application des dispositions relatives à la durée du travail prévues par la Loi n° 97-17 du 1er décembre 1997 portant Code du Travail du Sénégal (articles L.135 et suivants),",
      termination: "Conformément aux dispositions de la Loi n° 97-17 du 1er décembre 1997 portant Code du Travail du Sénégal relatives à la rupture du contrat de travail (articles L.48 et suivants),",
      employerObligations: [
        "Fournir au Salarié le travail convenu ainsi que les moyens nécessaires à son exécution",
        "Verser la rémunération due aux échéances convenues",
        "Respecter la législation du travail et les conventions collectives applicables",
        "Assurer la sécurité et protéger la santé physique et mentale du Salarié",
        "Déclarer le Salarié aux organismes sociaux (CSS, IPRES) dans les délais légaux",
        "Délivrer au Salarié un bulletin de paie conforme à chaque échéance de paiement",
        "Respecter la dignité du Salarié et veiller à l'absence de toute discrimination"
      ],
      employeeObligations: [
        "Exécuter personnellement et consciencieusement le travail convenu",
        "Respecter les horaires de travail et les consignes de l'Employeur",
        "Observer une obligation de loyauté et de fidélité envers l'Employeur",
        "Garder le secret professionnel sur les informations confidentielles de l'entreprise",
        "Prendre soin du matériel et des équipements mis à sa disposition",
        "Se conformer au règlement intérieur de l'entreprise",
        "Informer l'Employeur de toute absence dans les plus brefs délais"
      ],
      disputes: "En cas de différend né de l'exécution ou de la rupture du présent contrat, les parties s'engagent à rechercher une solution amiable. À défaut d'accord amiable dans un délai de trente (30) jours, le litige sera soumis au Tribunal du Travail de Dakar, seul compétent pour connaître des litiges individuels du travail, conformément aux dispositions de la Loi n° 97-17 du 1er décembre 1997 portant Code du Travail du Sénégal."
    }
  },
  BURUNDI: {
    name: "Burundi",
    code: "Code du Travail du Burundi",
    lawReference: "Loi n° 1/11 du 24 novembre 2020 portant Code du Travail du Burundi",
    court: "Tribunal du Travail de Bujumbura",
    idLabel: "NIF",
    currency: "FBu",
    articles: {
      intro: "Vu la Loi n° 1/11 du 24 novembre 2020 portant Code du Travail du Burundi,",
      engagement: "Conformément aux dispositions de la Loi n° 1/11 du 24 novembre 2020 portant Code du Travail du Burundi, relatives au contrat de travail,",
      workDuration: "En application des dispositions relatives à la durée du travail prévues par la Loi n° 1/11 du 24 novembre 2020 portant Code du Travail du Burundi,",
      termination: "Conformément aux dispositions de la Loi n° 1/11 du 24 novembre 2020 portant Code du Travail du Burundi relatives à la résiliation et au préavis,",
      employerObligations: [
        "Fournir au Salarié le travail convenu ainsi que les moyens nécessaires à son exécution",
        "Verser la rémunération due aux échéances convenues conformément à la législation en vigueur",
        "Respecter la législation du travail et les conventions collectives applicables au Burundi",
        "Assurer la sécurité et protéger la santé physique et mentale du Salarié sur le lieu de travail",
        "Déclarer le Salarié à l'INSS (Institut National de Sécurité Sociale) dans les délais légaux",
        "Délivrer au Salarié un bulletin de paie détaillé à chaque échéance de paiement",
        "Respecter la dignité du Salarié et garantir un environnement de travail exempt de harcèlement"
      ],
      employeeObligations: [
        "Exécuter personnellement et avec diligence le travail convenu selon les directives de l'Employeur",
        "Respecter les horaires de travail établis et signaler toute absence ou retard",
        "Observer une obligation de loyauté, de fidélité et de bonne foi envers l'Employeur",
        "Garder le secret professionnel sur toutes les informations confidentielles de l'entreprise",
        "Prendre soin du matériel, des équipements et des locaux mis à sa disposition",
        "Se conformer au règlement intérieur et aux politiques de l'entreprise",
        "Ne pas exercer d'activité concurrente pendant la durée du contrat sans autorisation écrite"
      ],
      disputes: "En cas de différend né de l'exécution ou de la rupture du présent contrat, les parties s'engagent à privilégier le règlement amiable par voie de négociation directe ou de médiation. À défaut de résolution amiable dans un délai de trente (30) jours à compter de la notification écrite du différend, le litige sera porté devant le Tribunal du Travail de Bujumbura, juridiction compétente en matière de litiges individuels du travail, conformément aux dispositions de la Loi n° 1/11 du 24 novembre 2020 portant Code du Travail du Burundi."
    }
  }
};

// --- FIN PARTIE 1 ---
// --- PARTIE 2 : COMPOSANT PRINCIPAL ET FONCTIONS ---

export default function GenerateurContratFinal() {
  const router = useRouter();
  const contractRef = useRef<HTMLDivElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [activeSection, setActiveSection] = useState<'company' | 'employee' | 'contract'>('company');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [currentSigner, setCurrentSigner] = useState<'employer' | 'employee' | null>(null);
  const [showArchives, setShowArchives] = useState(false);
  const [savedContracts, setSavedContracts] = useState<SavedContract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<SavedContract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'CDI' | 'CDD' | 'STAGE'>('ALL');
  const [notif, setNotif] = useState<{ m: string; t: 's' | 'e' | 'w' } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [qrCodeData, setQrCodeData] = useState('');
  
  // États pour le système de signature amélioré
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  
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
    empEmail: '',
    jobTitle: '',
    jobDept: 'Technique',
    jobType: 'CDI',
    jobLocation: '',
    jobTasks: '',
    salary: '0',
    bonus: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    cddReason: '',
    stageSchool: '',
    stageLevel: '',
    trial: '3',
    hours: '40',
    hasNonCompete: false,
    nonCompeteDuration: ''
  });

  const config = COUNTRIES[data.country];

  useEffect(() => {
    loadArchivedContracts();
  }, []);

  useEffect(() => {
    filterContracts();
  }, [savedContracts, searchTerm, filterType]);

  // Initialiser le canvas quand la modal s'ouvre
  useEffect(() => {
    if (showSignatureModal && signatureCanvasRef.current) {
      const canvas = signatureCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Définir la taille réelle du canvas
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, rect.width, rect.height);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [showSignatureModal]);

  // Bloquer le scroll du body quand la modal signature est ouverte
  useEffect(() => {
    if (showSignatureModal) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [showSignatureModal]);

  const loadArchivedContracts = () => {
    const stored = localStorage.getItem('ecodreum_contracts');
    if (stored) {
      setSavedContracts(JSON.parse(stored));
    }
  };

  const filterContracts = () => {
    let filtered = [...savedContracts];
    if (filterType !== 'ALL') {
      filtered = filtered.filter(c => c.contractType === filterType);
    }
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredContracts(filtered);
  };

  const saveContractToArchive = async (contractData: FormData, signed: boolean = false) => {
    const qrCode = await generateQRCode(contractData);
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
      employeeSignature: signatures.employee,
      qrCode
    };
    const updated = [contract, ...savedContracts];
    setSavedContracts(updated);
    localStorage.setItem('ecodreum_contracts', JSON.stringify(updated));
  };

  const deleteContract = (id: string) => {
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
    if (contract.qrCode) {
      setQrCodeData(contract.qrCode);
    }
    setShowArchives(false);
    showNotif('Contrat chargé', 's');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    const fileName = file.name;

    if (fileType === 'application/json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const contract = JSON.parse(event.target?.result as string);
          const updated = [contract, ...savedContracts];
          setSavedContracts(updated);
          localStorage.setItem('ecodreum_contracts', JSON.stringify(updated));
          showNotif('Contrat JSON importé avec succès', 's');
        } catch (error) {
          showNotif("Erreur lors de l'import JSON", 'e');
        }
      };
      reader.readAsText(file);
    }
    else if (
      fileType === 'application/pdf' ||
      fileType === 'application/msword' ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.pdf') ||
      fileName.endsWith('.doc') ||
      fileName.endsWith('.docx')
    ) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target?.result as string;
        const cleanName = fileName.replace(/\.(pdf|doc|docx)$/i, '').replace(/_/g, ' ');
        
        const contract: SavedContract = {
          id: Date.now().toString(),
          employeeName: cleanName,
          jobTitle: 'Document importé',
          contractType: 'CDI',
          mode: 'PRINT',
          createdAt: new Date().toISOString(),
          data: {
            ...data,
            empName: cleanName,
            jobTitle: 'Document importé'
          },
          signed: false,
          importedFile: {
            name: fileName,
            type: fileType || 'application/octet-stream',
            data: base64Data
          }
        };
        
        const updated = [contract, ...savedContracts];
        setSavedContracts(updated);
        localStorage.setItem('ecodreum_contracts', JSON.stringify(updated));
        showNotif(`${fileName} importé avec succès`, 's');
      };
      reader.onerror = () => {
        showNotif("Erreur lors de la lecture du fichier", 'e');
      };
      reader.readAsDataURL(file);
    } else {
      showNotif('Format non supporté. Utilisez PDF, Word ou JSON.', 'e');
    }
    
    e.target.value = '';
  };

  const downloadImportedFile = (contract: SavedContract) => {
    if (!contract.importedFile) return;
    
    const link = document.createElement('a');
    link.href = contract.importedFile.data;
    link.download = contract.importedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotif(`Téléchargement de ${contract.importedFile.name}`, 's');
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

  const generateQRCode = async (contractData: FormData): Promise<string> => {
    const qrData = JSON.stringify({
      emp: contractData.empName,
      job: contractData.jobTitle,
      type: contractData.jobType,
      start: contractData.startDate,
      comp: contractData.compName,
      id: Date.now()
    });
    try {
      return await QRCodeLib.toDataURL(qrData, { width: 200 });
    } catch (error) {
      console.error('Erreur QR Code:', error);
      return '';
    }
  };

  // --- SYSTÈME DE SIGNATURE AMÉLIORÉ ET STABLE ---
  const getPointFromEvent = useCallback((e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }, []);

  const startDrawing = useCallback((e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const point = getPointFromEvent(e);
    if (!point) return;
    
    setIsDrawing(true);
    setLastPoint(point);
    
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }, [getPointFromEvent]);

  const draw = useCallback((e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isDrawing) return;
    
    const point = getPointFromEvent(e);
    if (!point || !lastPoint) return;
    
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    
    setLastPoint(point);
  }, [isDrawing, lastPoint, getPointFromEvent]);

  const stopDrawing = useCallback((e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDrawing(false);
    setLastPoint(null);
  }, []);

  const clearSignature = useCallback(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  const saveSignature = useCallback(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const signatureData = canvas.toDataURL('image/png');
    
    if (currentSigner === 'employer') {
      setSignatures(prev => ({ ...prev, employer: signatureData }));
      showNotif('Signature employeur enregistrée', 's');
    } else if (currentSigner === 'employee') {
      setSignatures(prev => ({ ...prev, employee: signatureData }));
      showNotif('Signature salarié enregistrée', 's');
    }
    
    setShowSignatureModal(false);
    setCurrentSigner(null);
    setIsDrawing(false);
    setLastPoint(null);
  }, [currentSigner]);

  const openSignatureModal = (signer: 'employer' | 'employee') => {
    if (data.documentMode === 'PRINT') {
      showNotif('Activez le mode électronique pour signer', 'w');
      return;
    }
    setCurrentSigner(signer);
    setShowSignatureModal(true);
    setIsDrawing(false);
    setLastPoint(null);
  };

  const closeSignatureModal = () => {
    setShowSignatureModal(false);
    setCurrentSigner(null);
    setIsDrawing(false);
    setLastPoint(null);
  };

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
    if (!data.jobTasks.trim()) errors.push("Tâches confiées requises");
    if (!data.salary.trim() || parseFloat(data.salary) <= 0) errors.push("Salaire valide requis");
    if (!data.startDate) errors.push("Date de début requise");
    if (data.jobType === 'CDD') {
      if (!data.endDate) errors.push("Date de fin requise pour un CDD");
      if (!data.cddReason.trim()) errors.push("Motif du CDD requis");
    }
    if (data.jobType === 'STAGE') {
      if (!data.stageSchool.trim()) errors.push("Établissement requis pour un stage");
      if (!data.stageLevel.trim()) errors.push("Niveau d'études requis pour un stage");
    }
    if (data.hasNonCompete && !data.nonCompeteDuration.trim()) {
      errors.push("Durée de non-concurrence requise");
    }
    setValidationErrors(errors);
    return errors.length === 0;
  };

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
      const qrCode = await generateQRCode(data);
      setQrCodeData(qrCode);
      await new Promise(resolve => setTimeout(resolve, 300));
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

  const generateWord = async () => {
    if (!validateForm()) {
      showNotif("Veuillez corriger les erreurs", "e");
      return;
    }
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun({ text: data.jobType === 'STAGE' ? 'CONVENTION DE STAGE' : 'CONTRAT DE TRAVAIL', bold: true, size: 32 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [new TextRun({ text: `RÉGIME : ${data.jobType}`, bold: true, size: 24 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),
            new Paragraph({
              children: [new TextRun({ text: config.lawReference, italics: true, size: 20 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "ENTRE LES SOUSSIGNÉS :", bold: true, size: 28 })],
              spacing: { before: 200, after: 200 }
            }),
            new Paragraph({
              children: [new TextRun({ text: `La société ${data.compName}, ${data.compType}${data.showCapital && data.compCapital ? `, au capital social de ${data.compCapital} ${config.currency}` : ''}, dont le siège social est situé à ${data.compAddr}, immatriculée au RCCM sous le numéro ${data.compRCCM} et identifiée au ${config.idLabel} sous le numéro ${data.compID}, représentée par M./Mme ${data.bossName} en sa qualité de ${data.bossTitle}.` })],
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [new TextRun({ text: `Ci-après dénommée "L'EMPLOYEUR"`, italics: true })],
              alignment: AlignmentType.RIGHT,
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "D'UNE PART,", bold: true })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "ET :", bold: true })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [new TextRun({ text: `M./Mme ${data.empName}, né(e) le ${new Date(data.empBirth).toLocaleDateString('fr-FR')} à ${data.empBirthPlace}, de nationalité ${data.empNation}${data.isForeigner && data.empWorkPermit ? `, titulaire du permis de travail n°${data.empWorkPermit}` : ''}, titulaire de la pièce d'identité n°${data.empID}, demeurant à ${data.empAddr}, joignable au ${data.empPhone}${data.empEmail ? ` et par email à ${data.empEmail}` : ''}.` })],
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [new TextRun({ text: `Ci-après dénommé(e) "LE SALARIÉ"`, italics: true })],
              alignment: AlignmentType.RIGHT,
              spacing: { after: 400 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "D'AUTRE PART,", bold: true })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "Document généré via ECODREUM Intelligence - Veuillez consulter le PDF pour le contrat complet.", italics: true })],
              spacing: { before: 400 }
            }),
          ]
        }]
      });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `CONTRAT_${data.empName.replace(/\s/g, '_')}_${Date.now()}.docx`);
      showNotif("Word généré avec succès !", "s");
    } catch (error) {
      console.error("Erreur génération Word:", error);
      showNotif("Erreur lors de la génération du Word", "e");
    }
  };

  const showNotif = (m: string, t: 's' | 'e' | 'w') => {
    setNotif({ m, t });
    setTimeout(() => setNotif(null), 5000);
  };

  const updateData = (field: keyof FormData, value: string | boolean | null) => {
    setData(prev => ({ ...prev, [field]: value }));
    setValidationErrors([]);
  };

  const getProgress = (): number => {
    const totalFields = data.jobType === 'STAGE' ? 28 : 26;
    let filledFields = 0;
    Object.entries(data).forEach(([key, value]) => {
      if (['showCapital', 'isForeigner', 'hasNonCompete', 'documentMode'].includes(key)) return;
      if (value && value !== '0' && value !== '') filledFields++;
    });
    return Math.round((filledFields / totalFields) * 100);
  };

// --- FIN PARTIE 2 ---
// --- PARTIE 3 : RETURN JSX ET COMPOSANTS ---

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8">
        
        {/* NOTIFICATION */}
        {notif && (
          <div className={`fixed top-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl border backdrop-blur-xl shadow-2xl ${
            notif.t === 's' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 
            notif.t === 'w' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' :
            'bg-red-500/20 border-red-500/40 text-red-300'
          }`}>
            <div className="flex items-center gap-2 sm:gap-3">
              {notif.t === 's' && <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px]" />}
              {notif.t === 'w' && <AlertTriangle size={16} className="sm:w-[18px] sm:h-[18px]" />}
              {notif.t === 'e' && <AlertCircle size={16} className="sm:w-[18px] sm:h-[18px]" />}
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wide">{notif.m}</span>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-5">
            <button onClick={() => router.back()} className="p-2 sm:p-3 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 hover:bg-white/10 transition-all active:scale-95">
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">LEGAL ARCHITECT</h1>
              <p className="text-[8px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Générateur de Contrats • ECODREUM v5.3.0</p>
            </div>
          </div>
          <button onClick={() => setShowArchives(true)} className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg sm:rounded-xl font-bold text-xs hover:bg-blue-500/20 transition-all w-full sm:w-auto justify-center">
            <Archive size={14} className="sm:w-4 sm:h-4" />
            Archives ({savedContracts.length})
          </button>
        </div>

        {/* MODE DE DOCUMENT */}
        <div className="mb-6 sm:mb-8 bg-zinc-900/50 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div>
              <h3 className="text-xs sm:text-sm font-black uppercase mb-1 sm:mb-2 text-emerald-400">Mode de Document</h3>
              <p className="text-[10px] sm:text-xs text-zinc-500">Choisissez le type de contrat</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button onClick={() => updateData('documentMode', 'ELECTRONIC')} className={`flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs transition-all ${data.documentMode === 'ELECTRONIC' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30' : 'bg-zinc-800 border border-white/10 text-zinc-400'}`}>
                <Zap size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span>Électronique</span>
              </button>
              <button onClick={() => updateData('documentMode', 'PRINT')} className={`flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs transition-all ${data.documentMode === 'PRINT' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30' : 'bg-zinc-800 border border-white/10 text-zinc-400'}`}>
                <Printer size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span>À Imprimer</span>
              </button>
            </div>
          </div>
        </div>

        {/* JURIDICTION */}
        <div className="mb-6 sm:mb-8 bg-zinc-900/50 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <label className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 sm:mb-3 flex items-center gap-2">
            <Globe size={12} />
            Juridiction Applicable
          </label>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {(['SENEGAL', 'BURUNDI'] as const).map((c) => (
              <button key={c} onClick={() => updateData('country', c)} className={`px-4 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black transition-all ${data.country === c ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-black shadow-lg shadow-emerald-500/30' : 'bg-zinc-800 border border-white/10 text-zinc-400'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* PROGRESSION */}
        <div className="mb-6 sm:mb-8 bg-zinc-900/50 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider">Progression</span>
            <span className="text-xs sm:text-sm font-black text-emerald-400">{getProgress()}%</span>
          </div>
          <div className="h-2 sm:h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 transition-all duration-500" style={{ width: `${getProgress()}%` }} />
          </div>
        </div>

        {/* ERREURS DE VALIDATION */}
        {validationErrors.length > 0 && (
          <div className="mb-6 sm:mb-8 bg-red-500/10 border border-red-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex items-center gap-2 text-red-400 mb-2 sm:mb-3">
              <AlertCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
              <h3 className="text-xs sm:text-sm font-black uppercase">Champs manquants</h3>
            </div>
            <ul className="space-y-1">
              {validationErrors.slice(0, 5).map((error, i) => (
                <li key={i} className="text-[10px] sm:text-xs text-red-400/80 pl-3 sm:pl-4">• {error}</li>
              ))}
              {validationErrors.length > 5 && (
                <li className="text-[10px] sm:text-xs text-red-400/80 pl-3 sm:pl-4">• Et {validationErrors.length - 5} autre(s)...</li>
              )}
            </ul>
          </div>
        )}

        {/* ONGLETS DE NAVIGATION */}
        <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
          {[
            { id: 'company', label: 'Entreprise', icon: Building },
            { id: 'employee', label: 'Salarié', icon: User },
            { id: 'contract', label: 'Contrat', icon: Briefcase }
          ].map(({ id, label, icon: Icon }) => (
            <button 
              key={id} 
              onClick={() => setActiveSection(id as 'company' | 'employee' | 'contract')} 
              className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-8 py-2.5 sm:py-4 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase whitespace-nowrap transition-all flex-1 sm:flex-none justify-center ${
                activeSection === id 
                  ? id === 'company' ? 'bg-emerald-500 text-black' : id === 'employee' ? 'bg-blue-500 text-black' : 'bg-amber-500 text-black'
                  : 'bg-zinc-800 border border-white/10 text-zinc-400'
              }`}
            >
              <Icon size={14} className="sm:w-4 sm:h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* CONTENU PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 pb-32 sm:pb-40">
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            
            {/* SECTION ENTREPRISE */}
            {activeSection === 'company' && (
              <div className="bg-zinc-900/50 border border-white/10 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 sm:gap-3 text-emerald-400 mb-4 sm:mb-6">
                  <Building size={18} className="sm:w-[22px] sm:h-[22px]" />
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-wider">Structure Employeuse</h2>
                </div>

                <div className="bg-black/30 border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4">
                  <h3 className="text-[10px] sm:text-xs font-black uppercase text-zinc-400 mb-3 sm:mb-4">Identité Visuelle (Optionnel)</h3>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <div>
                      <label className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase mb-2 flex items-center gap-1">
                        <ImageIcon size={10} className="sm:w-3 sm:h-3" />
                        Logo
                      </label>
                      <div className="relative">
                        {data.compLogo ? (
                          <div className="relative group">
                            <img src={data.compLogo} alt="Logo" className="w-20 h-20 sm:w-32 sm:h-32 object-contain bg-white rounded-lg sm:rounded-xl p-2" />
                            <button onClick={() => updateData('compLogo', null)} className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1.5 sm:p-2 bg-red-500 text-white rounded-md sm:rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                              <X size={12} className="sm:w-[14px] sm:h-[14px]" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-20 h-20 sm:w-32 sm:h-32 border-2 border-dashed border-white/20 rounded-lg sm:rounded-xl cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all">
                            <Upload size={20} className="sm:w-6 sm:h-6 text-zinc-500 mb-1 sm:mb-2" />
                            <span className="text-[10px] sm:text-xs text-zinc-500">Charger</span>
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <InputField label="Description entreprise" value={data.compDescription} onChange={(v) => updateData('compDescription', v)} placeholder="Ex: Leader en solutions digitales..." multiline />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <InputField label="Raison Sociale" value={data.compName} onChange={(v) => updateData('compName', v)} icon={<Building size={12} />} required />
                  <InputField label="Forme Juridique" value={data.compType} onChange={(v) => updateData('compType', v)} placeholder="SARL, SA, SAS..." icon={<ShieldCheck size={12} />} required />
                </div>

                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-black/20 rounded-lg sm:rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={data.showCapital} onChange={(e) => updateData('showCapital', e.target.checked)} className="w-4 h-4 rounded border-white/20 bg-black/40 text-emerald-500 focus:ring-emerald-500" />
                    <label className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase whitespace-nowrap">Capital</label>
                  </div>
                  <div className="flex-1 w-full">
                    <InputField label="Capital Social" value={data.compCapital} onChange={(v) => updateData('compCapital', v)} disabled={!data.showCapital} placeholder={`Ex: 1 000 000 ${config.currency}`} icon={<DollarSign size={12} />} />
                  </div>
                </div>

                <InputField label="Siège Social" value={data.compAddr} onChange={(v) => updateData('compAddr', v)} placeholder="Adresse complète" icon={<MapPin size={12} />} required />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <InputField label="Numéro RCCM" value={data.compRCCM} onChange={(v) => updateData('compRCCM', v)} placeholder="Ex: BJ/BGM/2024/A/123" icon={<FileText size={12} />} required />
                  <InputField label={config.idLabel} value={data.compID} onChange={(v) => updateData('compID', v)} placeholder={`Numéro ${config.idLabel}`} icon={<Shield size={12} />} required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <InputField label="Représentant Légal" value={data.bossName} onChange={(v) => updateData('bossName', v)} placeholder="Nom complet" icon={<User size={12} />} required />
                  <InputField label="Fonction" value={data.bossTitle} onChange={(v) => updateData('bossTitle', v)} placeholder="Gérant, DG..." icon={<Award size={12} />} required />
                </div>
              </div>
            )}

            {/* SECTION SALARIÉ */}
            {activeSection === 'employee' && (
              <div className="bg-zinc-900/50 border border-white/10 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 sm:gap-3 text-blue-400 mb-4 sm:mb-6">
                  <User size={18} className="sm:w-[22px] sm:h-[22px]" />
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-wider">Informations Salarié</h2>
                </div>

                <InputField label="Nom Complet" value={data.empName} onChange={(v) => updateData('empName', v)} placeholder="Prénom et nom" icon={<User size={12} />} required />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <InputField label="Date de Naissance" type="date" value={data.empBirth} onChange={(v) => updateData('empBirth', v)} icon={<Calendar size={12} />} required />
                  <InputField label="Lieu de Naissance" value={data.empBirthPlace} onChange={(v) => updateData('empBirthPlace', v)} placeholder="Ville, Pays" icon={<MapPin size={12} />} required />
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <InputField label="Nationalité" value={data.empNation} onChange={(v) => updateData('empNation', v)} placeholder="Ex: Burundaise" icon={<Globe size={12} />} required />
                    <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-black/20 rounded-lg sm:rounded-xl border border-white/5">
                      <input type="checkbox" checked={data.isForeigner} onChange={(e) => updateData('isForeigner', e.target.checked)} className="w-4 h-4 rounded border-white/20 bg-black/40 text-blue-500 focus:ring-blue-500" />
                      <label className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase">Travailleur étranger</label>
                    </div>
                  </div>
                  {data.isForeigner && (
                    <InputField label="Numéro Permis de Travail" value={data.empWorkPermit} onChange={(v) => updateData('empWorkPermit', v)} placeholder="N° du permis de travail" icon={<Shield size={12} />} required />
                  )}
                </div>

                <InputField label="Adresse de Résidence" value={data.empAddr} onChange={(v) => updateData('empAddr', v)} placeholder="Adresse complète" icon={<MapPin size={12} />} required />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <InputField label="N° Pièce d&#39;Identité" value={data.empID} onChange={(v) => updateData('empID', v)} placeholder="CNI, Passeport..." icon={<FileText size={12} />} required />
                  <InputField label="Téléphone" type="tel" value={data.empPhone} onChange={(v) => updateData('empPhone', v)} placeholder="+257 XX XXX XXX" icon={<User size={12} />} required />
                </div>

                <InputField label="Email (optionnel)" type="email" value={data.empEmail} onChange={(v) => updateData('empEmail', v)} placeholder="exemple@email.com" icon={<FileText size={12} />} />
              </div>
            )}

            {/* SECTION CONTRAT */}
            {activeSection === 'contract' && (
              <div className="bg-zinc-900/50 border border-white/10 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 sm:gap-3 text-amber-400 mb-4 sm:mb-6">
                  <Briefcase size={18} className="sm:w-[22px] sm:h-[22px]" />
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-wider">Conditions de Travail</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase ml-1 tracking-wider">Type de Contrat *</label>
                    <select value={data.jobType} onChange={(e) => updateData('jobType', e.target.value as 'CDI' | 'CDD' | 'STAGE')} className="bg-black/40 border border-white/10 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm text-white outline-none focus:border-amber-500 transition-all">
                      <option value="CDI">CDI - Durée Indéterminée</option>
                      <option value="CDD">CDD - Durée Déterminée</option>
                      <option value="STAGE">STAGE - Convention</option>
                    </select>
                  </div>
                  <InputField label="Poste Occupé" value={data.jobTitle} onChange={(v) => updateData('jobTitle', v)} placeholder="Ex: Développeur Senior" icon={<Briefcase size={12} />} required />
                </div>

                {data.jobType === 'STAGE' && (
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg sm:rounded-xl p-4 sm:p-6 space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-2 text-purple-400 mb-2 sm:mb-3">
                      <GraduationCap size={16} className="sm:w-[18px] sm:h-[18px]" />
                      <h3 className="text-xs sm:text-sm font-black uppercase">Informations Stage</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <InputField label="Établissement" value={data.stageSchool} onChange={(v) => updateData('stageSchool', v)} placeholder="Université/école" icon={<Building size={12} />} required />
                      <InputField label="Niveau d&#39;Études" value={data.stageLevel} onChange={(v) => updateData('stageLevel', v)} placeholder="Ex: Licence 3, Master 2..." icon={<Award size={12} />} required />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <InputField label="Département" value={data.jobDept} onChange={(v) => updateData('jobDept', v)} placeholder="Ex: Technique, RH..." icon={<Building size={12} />} required />
                  <InputField label="Lieu de Travail" value={data.jobLocation} onChange={(v) => updateData('jobLocation', v)} placeholder="Adresse du lieu de travail" icon={<MapPin size={12} />} required />
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <div className="flex items-center gap-2 text-amber-400 mb-2 sm:mb-3">
                    <ClipboardList size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <h3 className="text-xs sm:text-sm font-black uppercase">Description du Poste</h3>
                  </div>
                  <InputField 
                    label="Tâches Confiées" 
                    value={data.jobTasks} 
                    onChange={(v) => updateData('jobTasks', v)} 
                    placeholder="Décrivez les missions et responsabilités..."
                    icon={<ClipboardList size={12} />} 
                    required 
                    multiline 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <InputField label="Date de Début" type="date" value={data.startDate} onChange={(v) => updateData('startDate', v)} icon={<Calendar size={12} />} required />
                  {(data.jobType === 'CDD' || data.jobType === 'STAGE') && (
                    <InputField label={`Date de Fin`} type="date" value={data.endDate} onChange={(v) => updateData('endDate', v)} icon={<Calendar size={12} />} required />
                  )}
                </div>

                {data.jobType === 'CDD' && (
                  <div className="space-y-3 sm:space-y-4">
                    <InputField label="Motif du CDD" value={data.cddReason} onChange={(v) => updateData('cddReason', v)} placeholder="Ex: Remplacement, Accroissement temporaire..." icon={<FileText size={12} />} required />
                    <div className="p-3 sm:p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg sm:rounded-xl">
                      <p className="text-[10px] sm:text-xs text-blue-400">
                        <Clock size={12} className="inline mr-1 sm:mr-2" />
                        <strong>Période d&#39;essai CDD :</strong> 3 mois
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <InputField label={`${data.jobType === 'STAGE' ? 'Gratification' : 'Salaire'} (${config.currency})`} type="number" value={data.salary} onChange={(v) => updateData('salary', v)} placeholder="0" icon={<DollarSign size={12} />} required />
                  <InputField label="Primes et Avantages" value={data.bonus} onChange={(v) => updateData('bonus', v)} placeholder="Optionnel" icon={<Award size={12} />} />
                </div>

                {data.salary && parseFloat(data.salary) > 0 && (
                  <div className="p-3 sm:p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg sm:rounded-xl">
                    <div className="text-[10px] sm:text-xs font-bold text-emerald-400 mb-1">En lettres:</div>
                    <div className="text-xs sm:text-sm text-emerald-300 capitalize">{salaryToWords(data.salary, config.currency)}</div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <InputField label="Heures/Semaine" type="number" value={data.hours} onChange={(v) => updateData('hours', v)} placeholder="40" icon={<Clock size={12} />} required />
                  {data.jobType === 'CDI' && (
                    <InputField label="Période d&#39;Essai (mois)" type="number" value={data.trial} onChange={(v) => updateData('trial', v)} placeholder="3" icon={<Calendar size={12} />} required />
                  )}
                </div>

                {data.jobType !== 'STAGE' && (
                  <div className="space-y-3 sm:space-y-4 p-4 sm:p-6 bg-black/20 rounded-lg sm:rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <input type="checkbox" checked={data.hasNonCompete} onChange={(e) => updateData('hasNonCompete', e.target.checked)} className="w-4 h-4 rounded border-white/20 bg-black/40 text-amber-500 focus:ring-amber-500" />
                      <label className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase">Clause de non-concurrence</label>
                    </div>
                    {data.hasNonCompete && (
                      <InputField label="Durée" value={data.nonCompeteDuration} onChange={(v) => updateData('nonCompeteDuration', v)} placeholder="Ex: 12 mois, 2 ans..." icon={<Shield size={12} />} required />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SIDEBAR ACTIONS */}
          <div className="lg:col-span-4">
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/10 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl lg:sticky lg:top-8 space-y-4 sm:space-y-6 shadow-2xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <CheckCircle size={18} className="sm:w-[22px] sm:h-[22px] text-emerald-400" />
                <h3 className="text-lg sm:text-xl font-black italic uppercase">Actions</h3>
              </div>

              {data.documentMode === 'ELECTRONIC' && (
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <h4 className="text-[10px] sm:text-xs font-black uppercase text-zinc-400 mb-2 sm:mb-3">Signatures Électroniques</h4>
                  <button onClick={() => openSignatureModal('employer')} className={`w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs flex items-center justify-center gap-2 sm:gap-3 transition-all ${signatures.employer ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' : 'bg-zinc-800 border border-white/10 text-zinc-400 hover:border-emerald-500/50'}`}>
                    <PenTool size={14} className="sm:w-4 sm:h-4" />
                    {signatures.employer ? 'Employeur ✓' : 'Signer (Employeur)'}
                  </button>
                  <button onClick={() => openSignatureModal('employee')} className={`w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs flex items-center justify-center gap-2 sm:gap-3 transition-all ${signatures.employee ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400' : 'bg-zinc-800 border border-white/10 text-zinc-400 hover:border-blue-500/50'}`}>
                    <PenTool size={14} className="sm:w-4 sm:h-4" />
                    {signatures.employee ? 'Salarié ✓' : 'Signer (Salarié)'}
                  </button>
                </div>
              )}

              <div className="space-y-2 sm:space-y-3">
                <button onClick={generatePDF} disabled={isGenerating} className="w-full py-4 sm:py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-black rounded-lg sm:rounded-xl font-black uppercase text-[10px] sm:text-xs flex items-center justify-center gap-2 sm:gap-3 transition-all active:scale-95 shadow-lg shadow-emerald-500/30">
                  {isGenerating ? <span className="animate-spin">⏳</span> : <Download size={18} className="sm:w-5 sm:h-5" />}
                  Générer PDF
                </button>
                <button onClick={generateWord} className="w-full py-3 sm:py-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg sm:rounded-xl font-black uppercase text-[10px] sm:text-xs flex items-center justify-center gap-2 sm:gap-3 transition-all">
                  <FileDown size={16} className="sm:w-[18px] sm:h-[18px]" />
                  Exporter Word
                </button>
                <button onClick={() => setShowPreview(!showPreview)} className="w-full py-3 sm:py-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg sm:rounded-xl font-black uppercase text-[10px] sm:text-xs flex items-center justify-center gap-2 sm:gap-3 transition-all">
                  <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />
                  {showPreview ? 'Masquer' : 'Aperçu'}
                </button>
              </div>

              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-black/40 rounded-xl sm:rounded-2xl border border-white/5 space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 text-zinc-500 mb-2 sm:mb-3">
                  <Scale size={14} className="sm:w-4 sm:h-4" />
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Récapitulatif</span>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <InfoRow label="Pays" value={config.name} />
                  <InfoRow label="Juridiction" value={config.court} />
                  <InfoRow label="Devise" value={config.currency} />
                  <InfoRow label="Type" value={data.jobType} />
                  <InfoRow label="Essai" value={data.jobType === 'STAGE' ? 'N/A' : `${data.jobType === 'CDD' ? '3' : data.trial} mois`} />
                  <InfoRow label="Mode" value={data.documentMode === 'ELECTRONIC' ? 'Électronique' : 'Imprimé'} />
                </div>
              </div>

              {qrCodeData && (
                <div className="p-3 sm:p-4 bg-black/40 rounded-lg sm:rounded-xl border border-white/5 flex flex-col items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 text-zinc-400 text-[10px] sm:text-xs font-bold uppercase">
                    <QrCode size={12} className="sm:w-[14px] sm:h-[14px]" />
                    Vérification
                  </div>
                  <img src={qrCodeData} alt="QR Code" className="w-24 h-24 sm:w-32 sm:h-32 bg-white p-1.5 sm:p-2 rounded-lg" />
                </div>
              )}

              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg sm:rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={12} className="sm:w-[14px] sm:h-[14px] text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[8px] sm:text-[9px] text-amber-400/80 leading-relaxed">Ce document ne se substitue pas à un conseil juridique personnalisé.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL SIGNATURE - COMPLÈTEMENT REFAITE POUR MOBILE */}
        {showSignatureModal && (
          <div 
            className="fixed inset-0 bg-black/95 z-50 flex flex-col"
            style={{ touchAction: 'none' }}
          >
            {/* Header de la modal */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-zinc-900">
              <h3 className="text-lg sm:text-xl font-black text-white">
                Signature {currentSigner === 'employer' ? 'Employeur' : 'Salarié'}
              </h3>
              <button 
                onClick={closeSignatureModal} 
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
            
            {/* Zone de signature */}
            <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
              <p className="text-xs sm:text-sm text-zinc-400 mb-3 sm:mb-4 text-center">
                Dessinez votre signature dans la zone ci-dessous
              </p>
              
              <div 
                className="flex-1 bg-white rounded-xl sm:rounded-2xl overflow-hidden relative"
                style={{ touchAction: 'none', minHeight: '200px', maxHeight: '400px' }}
              >
                <canvas
                  ref={signatureCanvasRef}
                  className="absolute inset-0 w-full h-full cursor-crosshair"
                  style={{ touchAction: 'none' }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  onTouchCancel={stopDrawing}
                />
                
                {/* Indicateur visuel si vide */}
                {!isDrawing && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-gray-300 text-sm sm:text-base font-medium">Signez ici</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Boutons d'action */}
            <div className="p-4 sm:p-6 border-t border-white/10 bg-zinc-900">
              <div className="flex gap-3 max-w-lg mx-auto">
                <button 
                  onClick={clearSignature} 
                  className="flex-1 py-3 sm:py-4 bg-zinc-800 border border-white/10 text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={16} />
                  Effacer
                </button>
                <button 
                  onClick={saveSignature} 
                  className="flex-1 py-3 sm:py-4 bg-emerald-500 text-black rounded-xl font-bold text-xs sm:text-sm hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  Valider
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ARCHIVES */}
        {showArchives && (
          <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto p-4 sm:p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
              <div className="bg-zinc-900 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-black uppercase">Archives</h2>
                  <button onClick={() => setShowArchives(false)} className="px-4 sm:px-6 py-2 sm:py-3 bg-zinc-800 text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm hover:bg-zinc-700 transition-all">
                    Fermer
                  </button>
                </div>
                
                <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-zinc-800 border border-white/10 rounded-lg sm:rounded-xl text-xs sm:text-sm text-white outline-none focus:border-emerald-500 transition-all" />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {(['ALL', 'CDI', 'CDD', 'STAGE'] as const).map((type) => (
                      <button key={type} onClick={() => setFilterType(type)} className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all ${filterType === type ? 'bg-emerald-500 text-black' : 'bg-zinc-800 border border-white/10 text-zinc-400'}`}>
                        {type === 'ALL' ? 'TOUS' : type}
                      </button>
                    ))}
                    <label className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs cursor-pointer hover:bg-blue-500/20 transition-all">
                      <Upload size={14} />
                      Importer
                      <input 
                        type="file" 
                        accept=".json,.pdf,.doc,.docx" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
                
                <div className="mb-4 sm:mb-6 p-2.5 sm:p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg sm:rounded-xl">
                  <p className="text-[10px] sm:text-xs text-blue-400">
                    <FileText size={12} className="inline mr-1 sm:mr-2" />
                    Formats : PDF, Word, JSON
                  </p>
                </div>

                {filteredContracts.length === 0 ? (
                  <div className="text-center py-12 sm:py-20">
                    <Archive size={48} className="sm:w-16 sm:h-16 mx-auto text-zinc-700 mb-3 sm:mb-4" />
                    <p className="text-xs sm:text-sm text-zinc-500">{searchTerm || filterType !== 'ALL' ? 'Aucun résultat' : 'Aucun contrat archivé'}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {filteredContracts.map((contract) => (
                      <div key={contract.id} className="bg-zinc-800 border border-white/10 rounded-lg sm:rounded-xl p-4 sm:p-6 space-y-2 sm:space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-xs sm:text-sm truncate">{contract.employeeName}</h3>
                            <p className="text-[10px] sm:text-xs text-zinc-500 truncate">{contract.jobTitle}</p>
                          </div>
                          <div className="flex flex-col gap-1 items-end ml-2">
                            <span className={`text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg font-bold ${contract.contractType === 'CDI' ? 'bg-emerald-500/20 text-emerald-400' : contract.contractType === 'CDD' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>{contract.contractType}</span>
                            {contract.importedFile && (
                              <span className="text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg font-bold bg-cyan-500/20 text-cyan-400">
                                {contract.importedFile.name.endsWith('.pdf') ? 'PDF' : 'Word'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-[10px] sm:text-xs text-zinc-400">
                          {new Date(contract.createdAt).toLocaleDateString('fr-FR')}
                          {contract.signed && <span className="text-emerald-400 ml-2">✓ Signé</span>}
                        </div>
                        <div className="flex gap-2 pt-2 sm:pt-3">
                          {contract.importedFile ? (
                            <button 
                              onClick={() => downloadImportedFile(contract)} 
                              className="flex-1 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-1"
                            >
                              <Download size={12} />
                              Télécharger
                            </button>
                          ) : (
                            <button 
                              onClick={() => loadContract(contract)} 
                              className="flex-1 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold hover:bg-blue-500/30 transition-all"
                            >
                              Charger
                            </button>
                          )}
                          <button 
                            onClick={() => deleteContract(contract.id)} 
                            className="p-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-md sm:rounded-lg hover:bg-red-500/30 transition-all"
                          >
                            <Trash2 size={12} className="sm:w-[14px] sm:h-[14px]" />
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

        {/* APERÇU CONTRAT */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/95 z-40 overflow-y-auto">
            <button onClick={() => setShowPreview(false)} className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white rounded-xl font-bold text-xs transition-all">
              <ArrowLeft size={16} />
              Retour
            </button>
            <div className="min-h-screen flex items-center justify-center p-4 pt-20 pb-8">
              <div ref={contractRef} className="bg-white text-black w-full max-w-[210mm] min-h-[297mm] p-6 sm:p-10 md:p-16 shadow-2xl">
                <ContractPreview data={data} config={config} signatures={signatures} qrCode={qrCodeData} />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// --- COMPOSANTS AUXILIAIRES ---

interface ContractPreviewProps {
  data: FormData;
  config: CountryConfig;
  signatures: { employer: string; employee: string };
  qrCode: string;
}

function ContractPreview({ data, config, signatures, qrCode }: ContractPreviewProps) {
  const capitalClause = data.showCapital && data.compCapital ? `, au capital social de ${data.compCapital} ${config.currency}` : '';
  const foreignerClause = data.isForeigner && data.empWorkPermit ? `, titulaire du permis de travail n°${data.empWorkPermit}` : '';
  const endDateClause = (data.jobType === 'CDD' || data.jobType === 'STAGE') && data.endDate ? ` et prendra fin le ${new Date(data.endDate).toLocaleDateString('fr-FR')}` : '';
  const trialPeriod = data.jobType === 'STAGE' ? null : (data.jobType === 'CDD' ? '3' : data.trial);

  return (
    <div className="space-y-4 sm:space-y-6 font-serif text-sm sm:text-base" style={{ fontFamily: 'Georgia, serif', lineHeight: '1.7' }}>
      {data.compLogo && (
        <div className="flex items-start justify-between mb-8 sm:mb-12">
          <div className="w-16 h-16 sm:w-24 sm:h-24">
            <img src={data.compLogo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          {data.compDescription && (
            <div className="text-right">
              <div className="font-bold text-base sm:text-lg">{data.compName}</div>
              <div className="text-[10px] sm:text-xs text-gray-600 mt-1">{data.compDescription}</div>
            </div>
          )}
        </div>
      )}

      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-wider mb-2">{data.jobType === 'STAGE' ? 'CONVENTION DE STAGE' : 'CONTRAT DE TRAVAIL'}</h1>
        <p className="text-sm sm:text-lg font-bold text-gray-700">RÉGIME : {data.jobType === 'CDI' ? 'CONTRAT À DURÉE INDÉTERMINÉE' : data.jobType === 'CDD' ? 'CONTRAT À DURÉE DÉTERMINÉE' : 'CONVENTION DE STAGE'}</p>
        <p className="text-[10px] sm:text-sm text-gray-500 mt-2 italic">{config.lawReference}</p>
      </div>

      <div className="space-y-4 sm:space-y-6 text-xs sm:text-sm">
        <p className="font-bold text-base sm:text-lg mb-3 sm:mb-4">ENTRE LES SOUSSIGNÉS :</p>
        
        <p className="leading-relaxed">
          La société <strong>{data.compName}</strong>, {data.compType}{capitalClause}, dont le siège social est situé à <strong>{data.compAddr}</strong>, immatriculée au Registre de Commerce et du Crédit Mobilier (RCCM) sous le numéro <strong>{data.compRCCM}</strong> et identifiée au {config.idLabel} sous le numéro <strong>{data.compID}</strong>, représentée aux présentes par <strong>M./Mme {data.bossName}</strong>, agissant en sa qualité de <strong>{data.bossTitle}</strong>, dûment habilité(e).
        </p>
        <p className="italic text-right">Ci-après dénommée « <strong>{data.jobType === 'STAGE' ? "L'ENTREPRISE D'ACCUEIL" : "L'EMPLOYEUR"}</strong> »</p>
        
        <p className="text-center font-bold my-3 sm:my-4">D'UNE PART,</p>
        
        <p className="text-center font-bold">ET :</p>
        
        <p className="leading-relaxed">
          <strong>M./Mme {data.empName}</strong>, né(e) le <strong>{data.empBirth ? new Date(data.empBirth).toLocaleDateString('fr-FR') : '___'}</strong> à <strong>{data.empBirthPlace}</strong>, de nationalité <strong>{data.empNation}</strong>{foreignerClause}, titulaire de la pièce d'identité nationale n°<strong>{data.empID}</strong>, demeurant à <strong>{data.empAddr}</strong>, joignable au <strong>{data.empPhone}</strong>{data.empEmail && ` et par courrier électronique à l'adresse ${data.empEmail}`}.
          {data.jobType === 'STAGE' && data.stageSchool && (
            <> Actuellement inscrit(e) en <strong>{data.stageLevel}</strong> à <strong>{data.stageSchool}</strong>.</>
          )}
        </p>
        <p className="italic text-right">Ci-après dénommé(e) « <strong>{data.jobType === 'STAGE' ? 'LE/LA STAGIAIRE' : 'LE/LA SALARIÉ(E)'}</strong> »</p>
        
        <p className="text-center font-bold my-3 sm:my-4">D'AUTRE PART,</p>

        <div className="border-t-2 border-gray-300 pt-4 sm:pt-6">
          <p className="font-bold text-base sm:text-lg mb-3 sm:mb-4">{config.articles.intro}</p>
          <p className="font-bold text-base sm:text-lg mb-4 sm:mb-6">IL A ÉTÉ ARRÊTÉ ET CONVENU CE QUI SUIT :</p>
        </div>

        <Article title="ARTICLE 1 : OBJET ET ENGAGEMENT">
          <p>
            {data.jobType === 'STAGE' ? (
              <>La présente convention a pour objet de définir les conditions dans lesquelles <strong>{data.empName}</strong> effectuera un stage au sein de {data.compName}, dans le cadre de sa formation en <strong>{data.stageLevel}</strong> à <strong>{data.stageSchool}</strong>.</>
            ) : (
              <>{config.articles.engagement} Par le présent contrat, l'Employeur engage <strong>{data.empName}</strong> qui accepte, en qualité de <strong>{data.jobTitle}</strong>. Le présent contrat est conclu sous le régime du {data.jobType === 'CDI' ? 'contrat à durée indéterminée' : 'contrat à durée déterminée'}{data.jobType === 'CDD' && data.cddReason ? ` pour le motif suivant : ${data.cddReason}` : ''}.</>
            )}
          </p>
        </Article>

        <Article title="ARTICLE 2 : FONCTIONS ET TÂCHES">
          <p>
            {data.jobType === 'STAGE' ? 'Le/La Stagiaire' : 'Le/La Salarié(e)'} exercera les fonctions de <strong>{data.jobTitle}</strong> au sein du département <strong>{data.jobDept}</strong>, dans les locaux situés à <strong>{data.jobLocation}</strong>.
          </p>
          {data.jobTasks && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 border-l-4 border-gray-400">
              <p className="font-bold mb-2">Tâches et missions confiées :</p>
              <p className="whitespace-pre-wrap">{data.jobTasks}</p>
            </div>
          )}
        </Article>

        <Article title="ARTICLE 3 : DURÉE ET PÉRIODE D'ESSAI">
          <p>
            Le présent {data.jobType === 'STAGE' ? 'stage' : 'contrat'} prend effet à compter du <strong>{data.startDate ? new Date(data.startDate).toLocaleDateString('fr-FR') : '___'}</strong>{endDateClause}.
          </p>
          {trialPeriod && (
            <p className="mt-2 sm:mt-3">
              Une période d'essai de <strong>{trialPeriod} mois</strong> est prévue, pendant laquelle chaque partie pourra rompre le contrat librement.
            </p>
          )}
        </Article>

        <Article title={`ARTICLE 4 : ${data.jobType === 'STAGE' ? 'GRATIFICATION' : 'RÉMUNÉRATION'}`}>
          <p>
            {data.jobType === 'STAGE' ? 'Le/La Stagiaire' : 'Le/La Salarié(e)'} percevra une {data.jobType === 'STAGE' ? 'gratification' : 'rémunération'} mensuelle {data.jobType === 'STAGE' ? '' : 'brute '}de <strong>{data.salary} {config.currency}</strong> ({salaryToWords(data.salary, config.currency)}), versée par virement bancaire.
          </p>
          {data.bonus && (
            <p className="mt-2 sm:mt-3">Avantages complémentaires : {data.bonus}.</p>
          )}
        </Article>

        <Article title="ARTICLE 5 : DURÉE DU TRAVAIL">
          <p>
            La durée hebdomadaire de travail est fixée à <strong>{data.hours} heures</strong>.
          </p>
        </Article>

        <Article title="ARTICLE 6 : OBLIGATIONS DES PARTIES">
          <p className="font-bold mb-2 sm:mb-3">6.1. Obligations de l'Employeur :</p>
          <ul className="list-none space-y-1 sm:space-y-2 ml-3 sm:ml-4 mb-4 sm:mb-6">
            {config.articles.employerObligations.map((obligation, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span>{obligation}</span>
              </li>
            ))}
          </ul>
          
          <p className="font-bold mb-2 sm:mb-3">6.2. Obligations du/de la {data.jobType === 'STAGE' ? 'Stagiaire' : 'Salarié(e)'} :</p>
          <ul className="list-none space-y-1 sm:space-y-2 ml-3 sm:ml-4">
            {config.articles.employeeObligations.map((obligation, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span>{obligation}</span>
              </li>
            ))}
          </ul>
        </Article>

        <Article title="ARTICLE 7 : CONFIDENTIALITÉ">
          <p>
            {data.jobType === 'STAGE' ? 'Le/La Stagiaire' : 'Le/La Salarié(e)'} s'engage à observer la plus stricte discrétion sur toutes les informations confidentielles de l'entreprise, pendant et après le {data.jobType === 'STAGE' ? 'stage' : 'contrat'}.
          </p>
        </Article>

        {data.hasNonCompete && data.jobType !== 'STAGE' && (
          <Article title="ARTICLE 8 : NON-CONCURRENCE">
            <p>
              Le/La Salarié(e) s'interdit d'exercer toute activité concurrente pendant une durée de <strong>{data.nonCompeteDuration}</strong> après la fin du contrat.
            </p>
          </Article>
        )}

        <Article title={`ARTICLE ${data.hasNonCompete && data.jobType !== 'STAGE' ? '9' : '8'} : RÉSILIATION`}>
          <p>{config.articles.termination}</p>
        </Article>

        <Article title={`ARTICLE ${data.hasNonCompete && data.jobType !== 'STAGE' ? '10' : '9'} : LITIGES`}>
          <p>{config.articles.disputes}</p>
        </Article>

        <div className="mt-10 sm:mt-16 pt-6 sm:pt-8 border-t-2 border-gray-300 space-y-6 sm:space-y-8">
          <p className="text-xs sm:text-sm">
            <strong>Fait à</strong> {data.compAddr.split(',')[0].trim()}, <strong>le</strong> {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p className="text-xs sm:text-sm">En deux (2) exemplaires originaux.</p>
          
          <div className="grid grid-cols-2 gap-4 sm:gap-8 mt-8 sm:mt-12">
            <div className="text-center space-y-3 sm:space-y-4">
              <p className="font-bold text-[10px] sm:text-sm uppercase">{data.jobType === 'STAGE' ? "L'Entreprise" : "L'Employeur"}</p>
              {data.documentMode === 'ELECTRONIC' && signatures.employer ? (
                <div className="flex flex-col items-center">
                  <img src={signatures.employer} alt="Signature" className="h-12 sm:h-20 border-b-2 border-black" />
                  <p className="text-[8px] sm:text-[10px] text-gray-500 mt-1 sm:mt-2">Signature électronique</p>
                </div>
              ) : (
                <div className="h-16 sm:h-24 border-b-2 border-black flex items-end justify-center pb-1 sm:pb-2">
                  <p className="text-[8px] sm:text-xs text-gray-400">(Signature)</p>
                </div>
              )}
              <div className="text-[10px] sm:text-sm mt-2 sm:mt-4">
                <p className="font-bold">{data.bossName}</p>
                <p className="text-gray-600">{data.bossTitle}</p>
              </div>
            </div>
            
            <div className="text-center space-y-3 sm:space-y-4">
              <p className="font-bold text-[10px] sm:text-sm uppercase">{data.jobType === 'STAGE' ? 'Le/La Stagiaire' : 'Le/La Salarié(e)'}</p>
              {data.documentMode === 'ELECTRONIC' && signatures.employee ? (
                <div className="flex flex-col items-center">
                  <img src={signatures.employee} alt="Signature" className="h-12 sm:h-20 border-b-2 border-black" />
                  <p className="text-[8px] sm:text-[10px] text-gray-500 mt-1 sm:mt-2">Signature électronique</p>
                </div>
              ) : (
                <div className="h-16 sm:h-24 border-b-2 border-black flex items-end justify-center pb-1 sm:pb-2">
                  <p className="text-[8px] sm:text-xs text-gray-400">(Lu et approuvé)</p>
                </div>
              )}
              <div className="text-[10px] sm:text-sm mt-2 sm:mt-4">
                <p className="font-bold">{data.empName}</p>
                <p className="text-gray-600">{data.jobTitle}</p>
              </div>
            </div>
          </div>
          
          {qrCode && (
            <div className="flex justify-center mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
              <div className="text-center">
                <p className="text-[8px] sm:text-[10px] text-gray-500 mb-2">Vérification</p>
                <img src={qrCode} alt="QR" className="w-16 h-16 sm:w-24 sm:h-24 mx-auto" />
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-gray-200 text-center text-[8px] sm:text-[10px] text-gray-500">
          {data.documentMode === 'ELECTRONIC' ? (
            <>
              <p className="mb-1">Document généré via <strong>ECODREUM Intelligence</strong></p>
              <p>Conforme à la {config.lawReference}.</p>
            </>
          ) : (
            <p className="font-semibold">{data.compName} • {data.compAddr}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Article({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 sm:mb-8">
      <h3 className="font-bold text-xs sm:text-base mb-2 sm:mb-3 uppercase border-b border-gray-300 pb-1 sm:pb-2">{title}</h3>
      <div className="text-xs sm:text-sm leading-relaxed">{children}</div>
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
    <div className="flex flex-col gap-1.5 sm:gap-2">
      <label className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase ml-1 tracking-wider flex items-center gap-1">
        {icon}
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {multiline ? (
        <textarea 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder={placeholder} 
          disabled={disabled} 
          rows={4} 
          className="bg-black/40 border border-white/10 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm text-white outline-none focus:border-emerald-500 focus:bg-emerald-500/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed resize-none" 
        />
      ) : (
        <input 
          type={type} 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder={placeholder} 
          disabled={disabled} 
          className="bg-black/40 border border-white/10 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-xs sm:text-sm text-white outline-none focus:border-emerald-500 focus:bg-emerald-500/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed" 
        />
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-white/5 pb-1.5 sm:pb-2">
      <span className="text-[8px] sm:text-[9px] text-zinc-600 font-bold uppercase">{label}</span>
      <span className="text-[8px] sm:text-[9px] text-emerald-400 font-bold text-right">{value}</span>
    </div>
  );
}
