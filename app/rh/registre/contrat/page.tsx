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
  RotateCcw, Cloud, ExternalLink, Loader2, EyeOff
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCodeLib from 'qrcode';
import { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

// --- INITIALISATION SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- URL DE BASE POUR VÉRIFICATION QR CODE ---
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ecodreum.vercel.app';

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

// --- GÉNÉRER UN ID UNIQUE SÉCURISÉ ---
function generateSecureId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  const randomPart2 = Math.random().toString(36).substring(2, 6);
  return `ECO-${timestamp}-${randomPart}-${randomPart2}`.toUpperCase();
}

// --- FORMATER UNE DATE ---
function formatDateFR(dateString: string): string {
  if (!dateString) return '_______________';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
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
  supabase_id?: string;
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
  verificationId?: string;
  importedFile?: ImportedFile;
  syncedToCloud?: boolean;
}

// --- TYPE POUR LA TABLE SUPABASE ---
interface SupabaseContract {
  id: string;
  verification_id: string;
  employee_name: string;
  job_title: string;
  contract_type: string;
  document_mode: string;
  company_name: string;
  company_address: string;
  company_rccm: string;
  company_id: string;
  boss_name: string;
  boss_title: string;
  start_date: string;
  end_date: string | null;
  salary: string;
  country: string;
  contract_data: FormData;
  employer_signature: string | null;
  employee_signature: string | null;
  qr_code: string | null;
  is_signed: boolean;
  created_at: string;
  updated_at: string;
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
  const [currentVerificationId, setCurrentVerificationId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewingContract, setViewingContract] = useState<SavedContract | null>(null);
  
  // États pour le système de signature
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  
  const [signatures, setSignatures] = useState({
    employer: '',
    employee: ''
  });

  const [data, setData] = useState<FormData>({
    country: 'BURUNDI',
    documentMode: 'ELECTRONIC',
    compName: '',
    compType: 'SARL',
    compCapital: '',
    showCapital: false,
    compAddr: '',
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
    jobDept: '',
    jobType: 'CDI',
    jobLocation: '',
    jobTasks: '',
    salary: '',
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

  // --- CHARGEMENT INITIAL ---
  useEffect(() => {
    loadContractsFromSupabase();
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

  // Bloquer le scroll uniquement quand la modal signature est ouverte
  useEffect(() => {
    if (showSignatureModal) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, [showSignatureModal]);

  // --- FONCTIONS SUPABASE ---
  const loadContractsFromSupabase = async () => {
    setIsLoading(true);
    try {
      const { data: contracts, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement Supabase:', error);
        loadFromLocalStorage();
        return;
      }

      if (contracts && contracts.length > 0) {
        const formattedContracts: SavedContract[] = contracts.map((c: SupabaseContract) => ({
          id: c.verification_id,
          supabase_id: c.id,
          employeeName: c.employee_name,
          jobTitle: c.job_title,
          contractType: c.contract_type,
          mode: c.document_mode,
          createdAt: c.created_at,
          data: c.contract_data,
          signed: c.is_signed,
          employerSignature: c.employer_signature || undefined,
          employeeSignature: c.employee_signature || undefined,
          qrCode: c.qr_code || undefined,
          verificationId: c.verification_id,
          syncedToCloud: true
        }));
        setSavedContracts(formattedContracts);
        localStorage.setItem('ecodreum_contracts', JSON.stringify(formattedContracts));
      } else {
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Erreur:', error);
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    const stored = localStorage.getItem('ecodreum_contracts');
    if (stored) {
      const contracts = JSON.parse(stored);
      setSavedContracts(contracts);
    }
  };

  const saveContractToSupabase = async (
    contractData: FormData, 
    verificationId: string,
    qrCode: string,
    signed: boolean = false
  ): Promise<boolean> => {
    try {
      const contractRecord = {
        verification_id: verificationId,
        employee_name: contractData.empName,
        job_title: contractData.jobTitle,
        contract_type: contractData.jobType,
        document_mode: contractData.documentMode,
        company_name: contractData.compName,
        company_address: contractData.compAddr,
        company_rccm: contractData.compRCCM,
        company_id: contractData.compID,
        boss_name: contractData.bossName,
        boss_title: contractData.bossTitle,
        start_date: contractData.startDate || null,
        end_date: contractData.endDate || null,
        salary: contractData.salary,
        country: contractData.country,
        contract_data: contractData,
        employer_signature: signatures.employer || null,
        employee_signature: signatures.employee || null,
        qr_code: qrCode,
        is_signed: signed
      };

      const { error } = await supabase
        .from('contracts')
        .insert([contractRecord])
        .select()
        .single();

      if (error) {
        console.error('Erreur sauvegarde Supabase:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur:', error);
      return false;
    }
  };

  const deleteContractFromSupabase = async (verificationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('verification_id', verificationId);

      if (error) {
        console.error('Erreur suppression Supabase:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Erreur:', error);
      return false;
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

  const deleteContract = async (id: string) => {
    await deleteContractFromSupabase(id);
    const updated = savedContracts.filter(c => c.id !== id && c.verificationId !== id);
    setSavedContracts(updated);
    localStorage.setItem('ecodreum_contracts', JSON.stringify(updated));
    showNotif('Contrat supprimé', 's');
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
          showNotif('Contrat JSON importé', 's');
        } catch {
          showNotif("Erreur lors de l'import", 'e');
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
          id: generateSecureId(),
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
          },
          syncedToCloud: false
        };
        
        const updated = [contract, ...savedContracts];
        setSavedContracts(updated);
        localStorage.setItem('ecodreum_contracts', JSON.stringify(updated));
        showNotif(`${fileName} importé`, 's');
      };
      reader.onerror = () => {
        showNotif("Erreur de lecture", 'e');
      };
      reader.readAsDataURL(file);
    } else {
      showNotif('Format non supporté', 'e');
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
    showNotif(`Téléchargement...`, 's');
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

  const generateQRCode = async (verificationUrl: string): Promise<string> => {
    try {
      return await QRCodeLib.toDataURL(verificationUrl, { 
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
    } catch (error) {
      console.error('Erreur QR Code:', error);
      return '';
    }
  };

  // --- SYSTÈME DE SIGNATURE ---
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

  // --- VISUALISER UN CONTRAT ARCHIVÉ ---
  const viewArchivedContract = (contract: SavedContract) => {
    if (contract.qrCode) {
      setQrCodeData(contract.qrCode);
    }
    if (contract.verificationId) {
      setCurrentVerificationId(contract.verificationId);
    }
    if (contract.employerSignature || contract.employeeSignature) {
      setSignatures({
        employer: contract.employerSignature || '',
        employee: contract.employeeSignature || ''
      });
    }
    setViewingContract(contract);
    setShowArchives(false);
  };

  // --- REGÉNÉRER LE PDF D'UN CONTRAT ARCHIVÉ ---
  const regeneratePDF = async (contract: SavedContract) => {
    setIsGenerating(true);
    
    try {
      // Configurer les données pour l'affichage
      if (contract.qrCode) {
        setQrCodeData(contract.qrCode);
      }
      if (contract.verificationId) {
        setCurrentVerificationId(contract.verificationId);
      }
      if (contract.employerSignature || contract.employeeSignature) {
        setSignatures({
          employer: contract.employerSignature || '',
          employee: contract.employeeSignature || ''
        });
      }
      
      setViewingContract(contract);
      
      // Attendre que le composant soit rendu
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!contractRef.current) {
        throw new Error("Référence du contrat non trouvée");
      }

      const canvas = await html2canvas(contractRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 794,
        windowHeight: 1123
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
      
      const fileName = `CONTRAT_${contract.employeeName.replace(/\s/g, '_')}_${contract.verificationId || contract.id}.pdf`;
      pdf.save(fileName);
      
      showNotif("PDF téléchargé !", "s");
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      showNotif("Erreur lors de la génération", "e");
    } finally {
      setIsGenerating(false);
    }
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
    if (!data.jobDept.trim()) errors.push("Département requis");
    if (!data.jobLocation.trim()) errors.push("Lieu de travail requis");
    if (!data.jobTasks.trim()) errors.push("Tâches confiées requises");
    if (!data.salary.trim() || parseFloat(data.salary) <= 0) errors.push("Salaire valide requis");
    if (!data.startDate) errors.push("Date de début requise");
    if (data.jobType === 'CDD') {
      if (!data.endDate) errors.push("Date de fin requise pour un CDD");
      if (!data.cddReason.trim()) errors.push("Motif du CDD requis");
    }
    if (data.jobType === 'STAGE') {
      if (!data.endDate) errors.push("Date de fin requise pour un stage");
      if (!data.stageSchool.trim()) errors.push("Établissement requis");
      if (!data.stageLevel.trim()) errors.push("Niveau d'études requis");
    }
    if (data.hasNonCompete && !data.nonCompeteDuration.trim()) {
      errors.push("Durée de non-concurrence requise");
    }
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // --- GÉNÉRATION PDF ---
  const generatePDF = async () => {
    if (!validateForm()) {
      showNotif("Veuillez corriger les erreurs", "e");
      return;
    }
    setIsGenerating(true);
    
    try {
      // Générer l'ID de vérification et le QR Code
      const verificationId = generateSecureId();
      setCurrentVerificationId(verificationId);
      const verificationUrl = `${APP_BASE_URL}/verify/${verificationId}`;
      const qrCode = await generateQRCode(verificationUrl);
      setQrCodeData(qrCode);

      // Afficher l'aperçu
      setShowPreview(true);
      
      // Attendre que le composant soit rendu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!contractRef.current) {
        throw new Error("Référence du contrat non trouvée");
      }

      const canvas = await html2canvas(contractRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 794,
        windowHeight: 1123
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
      
      pdf.save(`CONTRAT_${data.empName.replace(/\s/g, '_')}_${verificationId}.pdf`);
      
      // Sauvegarder dans Supabase
      const savedToSupabase = await saveContractToSupabase(data, verificationId, qrCode, !!(signatures.employer && signatures.employee));
      
      // Sauvegarder localement
      const contract: SavedContract = {
        id: verificationId,
        employeeName: data.empName,
        jobTitle: data.jobTitle,
        contractType: data.jobType,
        mode: data.documentMode,
        createdAt: new Date().toISOString(),
        data: data,
        signed: !!(signatures.employer && signatures.employee),
        employerSignature: signatures.employer,
        employeeSignature: signatures.employee,
        qrCode,
        verificationId,
        syncedToCloud: savedToSupabase
      };
      
      const updated = [contract, ...savedContracts];
      setSavedContracts(updated);
      localStorage.setItem('ecodreum_contracts', JSON.stringify(updated));

      showNotif(savedToSupabase ? "PDF généré et synchronisé !" : "PDF généré !", "s");
      
      // Fermer l'aperçu après un délai
      setTimeout(() => setShowPreview(false), 1500);
      
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      showNotif("Erreur lors de la génération", "e");
      setShowPreview(false);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- GÉNÉRATION WORD COMPLÈTE ---
  const generateWord = async () => {
    if (!validateForm()) {
      showNotif("Veuillez corriger les erreurs", "e");
      return;
    }
    
    try {
      const verificationId = generateSecureId();
      const capitalClause = data.showCapital && data.compCapital ? `, au capital social de ${data.compCapital} ${config.currency}` : '';
      const foreignerClause = data.isForeigner && data.empWorkPermit ? `, titulaire du permis de travail n°${data.empWorkPermit}` : '';
      const trialPeriod = data.jobType === 'STAGE' ? null : (data.jobType === 'CDD' ? '3' : data.trial);
      
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1134,
                right: 1134,
                bottom: 1134,
                left: 1134,
              },
            },
          },
          children: [
            // TITRE
            new Paragraph({
              children: [new TextRun({ text: data.jobType === 'STAGE' ? 'CONVENTION DE STAGE' : 'CONTRAT DE TRAVAIL', bold: true, size: 36 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [new TextRun({ text: `RÉGIME : ${data.jobType === 'CDI' ? 'CONTRAT À DURÉE INDÉTERMINÉE' : data.jobType === 'CDD' ? 'CONTRAT À DURÉE DÉTERMINÉE' : 'CONVENTION DE STAGE'}`, bold: true, size: 24 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ text: config.lawReference, italics: true, size: 20 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ text: `ID de vérification : ${verificationId}`, size: 16, color: '666666' })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),

            // ENTRE LES SOUSSIGNÉS
            new Paragraph({
              children: [new TextRun({ text: "ENTRE LES SOUSSIGNÉS :", bold: true, size: 24 })],
              spacing: { before: 300, after: 200 }
            }),

            // EMPLOYEUR
            new Paragraph({
              children: [
                new TextRun({ text: `La société `, size: 22 }),
                new TextRun({ text: data.compName, bold: true, size: 22 }),
                new TextRun({ text: `, ${data.compType}${capitalClause}, dont le siège social est situé à `, size: 22 }),
                new TextRun({ text: data.compAddr, bold: true, size: 22 }),
                new TextRun({ text: `, immatriculée au Registre de Commerce et du Crédit Mobilier (RCCM) sous le numéro `, size: 22 }),
                new TextRun({ text: data.compRCCM, bold: true, size: 22 }),
                new TextRun({ text: ` et identifiée au ${config.idLabel} sous le numéro `, size: 22 }),
                new TextRun({ text: data.compID, bold: true, size: 22 }),
                new TextRun({ text: `, représentée aux présentes par `, size: 22 }),
                new TextRun({ text: `M./Mme ${data.bossName}`, bold: true, size: 22 }),
                new TextRun({ text: `, agissant en sa qualité de `, size: 22 }),
                new TextRun({ text: data.bossTitle, bold: true, size: 22 }),
                new TextRun({ text: `, dûment habilité(e) à l'effet des présentes.`, size: 22 }),
              ],
              spacing: { after: 150 }
            }),
            new Paragraph({
              children: [new TextRun({ text: `Ci-après dénommée « ${data.jobType === 'STAGE' ? "L'ENTREPRISE D'ACCUEIL" : "L'EMPLOYEUR"} »`, italics: true, size: 22 })],
              alignment: AlignmentType.RIGHT,
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "D'UNE PART,", bold: true, size: 22 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "ET :", bold: true, size: 22 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),

            // SALARIÉ
            new Paragraph({
              children: [
                new TextRun({ text: `M./Mme `, size: 22 }),
                new TextRun({ text: data.empName, bold: true, size: 22 }),
                new TextRun({ text: `, né(e) le `, size: 22 }),
                new TextRun({ text: formatDateFR(data.empBirth), bold: true, size: 22 }),
                new TextRun({ text: ` à `, size: 22 }),
                new TextRun({ text: data.empBirthPlace, bold: true, size: 22 }),
                new TextRun({ text: `, de nationalité `, size: 22 }),
                new TextRun({ text: data.empNation, bold: true, size: 22 }),
                new TextRun({ text: foreignerClause, size: 22 }),
                new TextRun({ text: `, titulaire de la pièce d'identité nationale n°`, size: 22 }),
                new TextRun({ text: data.empID, bold: true, size: 22 }),
                new TextRun({ text: `, demeurant à `, size: 22 }),
                new TextRun({ text: data.empAddr, bold: true, size: 22 }),
                new TextRun({ text: `, joignable au `, size: 22 }),
                new TextRun({ text: data.empPhone, bold: true, size: 22 }),
                new TextRun({ text: data.empEmail ? ` et par courrier électronique à l'adresse ${data.empEmail}` : '', size: 22 }),
                new TextRun({ text: `.`, size: 22 }),
              ],
              spacing: { after: 100 }
            }),

            // Info stage si applicable
            ...(data.jobType === 'STAGE' && data.stageSchool ? [
              new Paragraph({
                children: [
                  new TextRun({ text: `Actuellement inscrit(e) en `, size: 22 }),
                  new TextRun({ text: data.stageLevel, bold: true, size: 22 }),
                  new TextRun({ text: ` à `, size: 22 }),
                  new TextRun({ text: data.stageSchool, bold: true, size: 22 }),
                  new TextRun({ text: `.`, size: 22 }),
                ],
                spacing: { after: 150 }
              })
            ] : []),

            new Paragraph({
              children: [new TextRun({ text: `Ci-après dénommé(e) « ${data.jobType === 'STAGE' ? 'LE/LA STAGIAIRE' : 'LE/LA SALARIÉ(E)'} »`, italics: true, size: 22 })],
              alignment: AlignmentType.RIGHT,
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "D'AUTRE PART,", bold: true, size: 22 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 }
            }),

            // INTRO LOI
            new Paragraph({
              children: [new TextRun({ text: config.articles.intro, bold: true, size: 22 })],
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "IL A ÉTÉ ARRÊTÉ ET CONVENU CE QUI SUIT :", bold: true, size: 24 })],
              spacing: { after: 300 }
            }),

            // ARTICLE 1
            new Paragraph({
              children: [new TextRun({ text: "ARTICLE 1 : OBJET ET ENGAGEMENT", bold: true, size: 24, underline: {} })],
              spacing: { before: 300, after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: data.jobType === 'STAGE' 
                  ? `La présente convention a pour objet de définir les conditions dans lesquelles ${data.empName} effectuera un stage au sein de ${data.compName}, dans le cadre de sa formation en ${data.stageLevel} à ${data.stageSchool}.`
                  : `${config.articles.engagement} Par le présent contrat, l'Employeur engage ${data.empName} qui accepte, en qualité de ${data.jobTitle}. Le présent contrat est conclu sous le régime du ${data.jobType === 'CDI' ? 'contrat à durée indéterminée' : 'contrat à durée déterminée'}${data.jobType === 'CDD' && data.cddReason ? ` pour le motif suivant : ${data.cddReason}` : ''}.`, 
                  size: 22 
                })
              ],
              spacing: { after: 200 }
            }),

            // ARTICLE 2
            new Paragraph({
              children: [new TextRun({ text: "ARTICLE 2 : FONCTIONS ET TÂCHES", bold: true, size: 24, underline: {} })],
              spacing: { before: 300, after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `${data.jobType === 'STAGE' ? 'Le/La Stagiaire' : 'Le/La Salarié(e)'} exercera les fonctions de `, size: 22 }),
                new TextRun({ text: data.jobTitle, bold: true, size: 22 }),
                new TextRun({ text: ` au sein du département `, size: 22 }),
                new TextRun({ text: data.jobDept, bold: true, size: 22 }),
                new TextRun({ text: `, dans les locaux situés à `, size: 22 }),
                new TextRun({ text: data.jobLocation, bold: true, size: 22 }),
                new TextRun({ text: `.`, size: 22 }),
              ],
              spacing: { after: 150 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "Tâches et missions confiées :", bold: true, size: 22 })],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ text: data.jobTasks, size: 22 })],
              spacing: { after: 200 }
            }),

            // ARTICLE 3
            new Paragraph({
              children: [new TextRun({ text: "ARTICLE 3 : DURÉE ET PÉRIODE D'ESSAI", bold: true, size: 24, underline: {} })],
              spacing: { before: 300, after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Le présent ${data.jobType === 'STAGE' ? 'stage' : 'contrat'} prend effet à compter du `, size: 22 }),
                new TextRun({ text: formatDateFR(data.startDate), bold: true, size: 22 }),
                new TextRun({ text: (data.jobType === 'CDD' || data.jobType === 'STAGE') && data.endDate ? ` et prendra fin le ${formatDateFR(data.endDate)}` : '', size: 22 }),
                new TextRun({ text: `.`, size: 22 }),
              ],
              spacing: { after: 150 }
            }),
            ...(trialPeriod ? [
              new Paragraph({
                children: [
                  new TextRun({ text: `Une période d'essai de `, size: 22 }),
                  new TextRun({ text: `${trialPeriod} mois`, bold: true, size: 22 }),
                  new TextRun({ text: ` est prévue, pendant laquelle chaque partie pourra rompre le contrat librement.`, size: 22 }),
                ],
                spacing: { after: 200 }
              })
            ] : []),

            // ARTICLE 4
            new Paragraph({
              children: [new TextRun({ text: `ARTICLE 4 : ${data.jobType === 'STAGE' ? 'GRATIFICATION' : 'RÉMUNÉRATION'}`, bold: true, size: 24, underline: {} })],
              spacing: { before: 300, after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `${data.jobType === 'STAGE' ? 'Le/La Stagiaire' : 'Le/La Salarié(e)'} percevra une ${data.jobType === 'STAGE' ? 'gratification' : 'rémunération'} mensuelle ${data.jobType === 'STAGE' ? '' : 'brute '}de `, size: 22 }),
                new TextRun({ text: `${data.salary} ${config.currency}`, bold: true, size: 22 }),
                new TextRun({ text: ` (${salaryToWords(data.salary, config.currency)}).`, size: 22 }),
              ],
              spacing: { after: 150 }
            }),
            ...(data.bonus ? [
              new Paragraph({
                children: [new TextRun({ text: `Avantages complémentaires : ${data.bonus}.`, size: 22 })],
                spacing: { after: 200 }
              })
            ] : []),

            // ARTICLE 5
            new Paragraph({
              children: [new TextRun({ text: "ARTICLE 5 : DURÉE DU TRAVAIL", bold: true, size: 24, underline: {} })],
              spacing: { before: 300, after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `La durée hebdomadaire de travail est fixée à `, size: 22 }),
                new TextRun({ text: `${data.hours} heures`, bold: true, size: 22 }),
                new TextRun({ text: `.`, size: 22 }),
              ],
              spacing: { after: 200 }
            }),

            // ARTICLE 6
            new Paragraph({
              children: [new TextRun({ text: "ARTICLE 6 : OBLIGATIONS DES PARTIES", bold: true, size: 24, underline: {} })],
              spacing: { before: 300, after: 200 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "6.1. Obligations de l'Employeur :", bold: true, size: 22 })],
              spacing: { after: 100 }
            }),
            ...config.articles.employerObligations.map(obligation => 
              new Paragraph({
                children: [new TextRun({ text: `• ${obligation}`, size: 22 })],
                spacing: { after: 50 }
              })
            ),
            new Paragraph({
              children: [new TextRun({ text: `6.2. Obligations du/de la ${data.jobType === 'STAGE' ? 'Stagiaire' : 'Salarié(e)'} :`, bold: true, size: 22 })],
              spacing: { before: 150, after: 100 }
            }),
            ...config.articles.employeeObligations.map(obligation => 
              new Paragraph({
                children: [new TextRun({ text: `• ${obligation}`, size: 22 })],
                spacing: { after: 50 }
              })
            ),

            // ARTICLE 7
            new Paragraph({
              children: [new TextRun({ text: "ARTICLE 7 : CONFIDENTIALITÉ", bold: true, size: 24, underline: {} })],
              spacing: { before: 300, after: 200 }
            }),
            new Paragraph({
              children: [new TextRun({ text: `${data.jobType === 'STAGE' ? 'Le/La Stagiaire' : 'Le/La Salarié(e)'} s'engage à observer la plus stricte discrétion sur toutes les informations confidentielles de l'entreprise, pendant et après le ${data.jobType === 'STAGE' ? 'stage' : 'contrat'}.`, size: 22 })],
              spacing: { after: 200 }
            }),

            // ARTICLE 8 (Non-concurrence si applicable)
            ...(data.hasNonCompete && data.jobType !== 'STAGE' ? [
              new Paragraph({
                children: [new TextRun({ text: "ARTICLE 8 : NON-CONCURRENCE", bold: true, size: 24, underline: {} })],
                spacing: { before: 300, after: 200 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Le/La Salarié(e) s'interdit d'exercer toute activité concurrente pendant une durée de `, size: 22 }),
                  new TextRun({ text: data.nonCompeteDuration, bold: true, size: 22 }),
                  new TextRun({ text: ` après la fin du contrat.`, size: 22 }),
                ],
                spacing: { after: 200 }
              })
            ] : []),

            // ARTICLE RÉSILIATION
            new Paragraph({
              children: [new TextRun({ text: `ARTICLE ${data.hasNonCompete && data.jobType !== 'STAGE' ? '9' : '8'} : RÉSILIATION`, bold: true, size: 24, underline: {} })],
              spacing: { before: 300, after: 200 }
            }),
            new Paragraph({
              children: [new TextRun({ text: config.articles.termination, size: 22 })],
              spacing: { after: 200 }
            }),

            // ARTICLE LITIGES
            new Paragraph({
              children: [new TextRun({ text: `ARTICLE ${data.hasNonCompete && data.jobType !== 'STAGE' ? '10' : '9'} : LITIGES`, bold: true, size: 24, underline: {} })],
              spacing: { before: 300, after: 200 }
            }),
            new Paragraph({
              children: [new TextRun({ text: config.articles.disputes, size: 22 })],
              spacing: { after: 300 }
            }),

            // SIGNATURES
            new Paragraph({
              children: [
                new TextRun({ text: `Fait à `, size: 22 }),
                new TextRun({ text: data.compAddr.split(',')[0].trim(), bold: true, size: 22 }),
                new TextRun({ text: `, le `, size: 22 }),
                new TextRun({ text: formatDateFR(new Date().toISOString()), bold: true, size: 22 }),
              ],
              spacing: { before: 400, after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ text: "En deux (2) exemplaires originaux.", size: 22 })],
              spacing: { after: 400 }
            }),

            // Tableau des signatures
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: data.jobType === 'STAGE' ? "Pour l'Entreprise d'Accueil" : "Pour l'Employeur", bold: true, size: 22 })],
                          alignment: AlignmentType.CENTER
                        }),
                        new Paragraph({ children: [new TextRun({ text: "", size: 22 })] }),
                        new Paragraph({ children: [new TextRun({ text: "", size: 22 })] }),
                        new Paragraph({ children: [new TextRun({ text: "", size: 22 })] }),
                        new Paragraph({
                          children: [new TextRun({ text: "(Signature et cachet)", size: 18, italics: true })],
                          alignment: AlignmentType.CENTER
                        }),
                        new Paragraph({ children: [new TextRun({ text: "", size: 22 })] }),
                        new Paragraph({
                          children: [new TextRun({ text: data.bossName, bold: true, size: 22 })],
                          alignment: AlignmentType.CENTER
                        }),
                        new Paragraph({
                          children: [new TextRun({ text: data.bossTitle, size: 20 })],
                          alignment: AlignmentType.CENTER
                        }),
                      ],
                      borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                      },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: data.jobType === 'STAGE' ? "Le/La Stagiaire" : "Le/La Salarié(e)", bold: true, size: 22 })],
                          alignment: AlignmentType.CENTER
                        }),
                        new Paragraph({ children: [new TextRun({ text: "", size: 22 })] }),
                        new Paragraph({ children: [new TextRun({ text: "", size: 22 })] }),
                        new Paragraph({ children: [new TextRun({ text: "", size: 22 })] }),
                        new Paragraph({
                          children: [new TextRun({ text: "(Lu et approuvé)", size: 18, italics: true })],
                          alignment: AlignmentType.CENTER
                        }),
                        new Paragraph({ children: [new TextRun({ text: "", size: 22 })] }),
                        new Paragraph({
                          children: [new TextRun({ text: data.empName, bold: true, size: 22 })],
                          alignment: AlignmentType.CENTER
                        }),
                        new Paragraph({
                          children: [new TextRun({ text: data.jobTitle, size: 20 })],
                          alignment: AlignmentType.CENTER
                        }),
                      ],
                      borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                      },
                    }),
                  ],
                }),
              ],
            }),

            // PIED DE PAGE
            new Paragraph({
              children: [new TextRun({ text: "", size: 22 })],
              spacing: { before: 400 }
            }),
            new Paragraph({
              children: [new TextRun({ text: `ID de vérification : ${verificationId}`, size: 16, color: '888888' })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [new TextRun({ text: `Document généré via ECODREUM INTELLIGENCE L1`, size: 16, italics: true, color: '888888' })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 50 }
            }),
            new Paragraph({
              children: [new TextRun({ text: `Ce document ne se substitue pas à un conseil juridique personnalisé.`, size: 14, color: '999999' })],
              alignment: AlignmentType.CENTER
            }),
          ]
        }]
      });
      
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `CONTRAT_${data.empName.replace(/\s/g, '_')}_${verificationId}.docx`);
      showNotif("Word généré avec succès !", "s");
    } catch (error) {
      console.error("Erreur génération Word:", error);
      showNotif("Erreur lors de la génération", "e");
    }
  };

  const syncToGoogleDrive = () => {
    showNotif("Google Drive : Bientôt disponible !", "w");
  };

  const showNotif = (m: string, t: 's' | 'e' | 'w') => {
    setNotif({ m, t });
    setTimeout(() => setNotif(null), 4000);
  };

  const updateData = (field: keyof FormData, value: string | boolean | null) => {
    setData(prev => ({ ...prev, [field]: value }));
    setValidationErrors([]);
  };

  const getProgress = (): number => {
    const requiredFields = [
      'compName', 'compRCCM', 'compID', 'bossName', 'compAddr',
      'empName', 'empBirth', 'empBirthPlace', 'empID', 'empAddr', 'empPhone',
      'jobTitle', 'jobDept', 'jobLocation', 'jobTasks', 'salary', 'startDate'
    ];
    
    if (data.jobType === 'CDD') {
      requiredFields.push('endDate', 'cddReason');
    }
    if (data.jobType === 'STAGE') {
      requiredFields.push('endDate', 'stageSchool', 'stageLevel');
    }
    
    let filled = 0;
    requiredFields.forEach(field => {
      const value = data[field as keyof FormData];
      if (value && value !== '' && value !== '0') filled++;
    });
    
    return Math.round((filled / requiredFields.length) * 100);
  };

// --- FIN PARTIE 2 ---
// --- PARTIE 3 : RETURN JSX ET COMPOSANTS ---

  // Afficher un loader pendant le chargement initial
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-white font-bold">Chargement des contrats...</p>
          <p className="text-zinc-500 text-xs mt-2">ECODREUM INTELLIGENCE L1</p>
        </div>
      </div>
    );
  }

  // Afficher la visualisation d'un contrat archivé
  if (viewingContract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-zinc-900/95 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center gap-3">
            <button onClick={() => setViewingContract(null)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h3 className="font-bold text-sm sm:text-base">{viewingContract.employeeName}</h3>
              <p className="text-[10px] text-zinc-500">{viewingContract.jobTitle} • {viewingContract.contractType}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => regeneratePDF(viewingContract)}
              disabled={isGenerating}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-500 text-black rounded-lg font-bold text-xs hover:bg-emerald-400 transition-all disabled:opacity-50"
            >
              {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              <span className="hidden sm:inline">Télécharger PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>
        
        <div className="p-4 sm:p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div ref={contractRef} className="bg-white text-black p-6 sm:p-10 md:p-16 shadow-2xl rounded-lg">
              <ContractPreview 
                data={viewingContract.data} 
                config={COUNTRIES[viewingContract.data.country]} 
                signatures={{
                  employer: viewingContract.employerSignature || '',
                  employee: viewingContract.employeeSignature || ''
                }} 
                qrCode={viewingContract.qrCode || ''} 
                verificationId={viewingContract.verificationId || viewingContract.id}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 pb-20">
        
        {/* NOTIFICATION */}
        {notif && (
          <div className={`fixed top-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl border backdrop-blur-xl shadow-2xl ${
            notif.t === 's' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 
            notif.t === 'w' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' :
            'bg-red-500/20 border-red-500/40 text-red-300'
          }`}>
            <div className="flex items-center gap-2 sm:gap-3">
              {notif.t === 's' && <CheckCircle size={16} />}
              {notif.t === 'w' && <AlertTriangle size={16} />}
              {notif.t === 'e' && <AlertCircle size={16} />}
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wide">{notif.m}</span>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-5">
            <button onClick={() => router.back()} className="p-2 sm:p-3 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 hover:bg-white/10 transition-all active:scale-95">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">LEGAL ARCHITECT</h1>
              <p className="text-[8px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Générateur de Contrats • ECODREUM INTELLIGENCE L1</p>
            </div>
          </div>
          <button onClick={() => setShowArchives(true)} className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg sm:rounded-xl font-bold text-xs hover:bg-blue-500/20 transition-all w-full sm:w-auto justify-center">
            <Archive size={14} />
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
                <Zap size={16} />
                <span>Électronique</span>
              </button>
              <button onClick={() => updateData('documentMode', 'PRINT')} className={`flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs transition-all ${data.documentMode === 'PRINT' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30' : 'bg-zinc-800 border border-white/10 text-zinc-400'}`}>
                <Printer size={16} />
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
              <AlertCircle size={16} />
              <h3 className="text-xs sm:text-sm font-black uppercase">Champs manquants ({validationErrors.length})</h3>
            </div>
            <ul className="space-y-1 max-h-32 overflow-y-auto">
              {validationErrors.map((error, i) => (
                <li key={i} className="text-[10px] sm:text-xs text-red-400/80 pl-3 sm:pl-4">• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ONGLETS DE NAVIGATION */}
        <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2">
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
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* CONTENU PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            
            {/* SECTION ENTREPRISE */}
            {activeSection === 'company' && (
              <div className="bg-zinc-900/50 border border-white/10 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 sm:gap-3 text-emerald-400 mb-4 sm:mb-6">
                  <Building size={18} />
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-wider">Structure Employeuse</h2>
                </div>

                <div className="bg-black/30 border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4">
                  <h3 className="text-[10px] sm:text-xs font-black uppercase text-zinc-400 mb-3 sm:mb-4">Identité Visuelle (Optionnel)</h3>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <div>
                      <label className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase mb-2 flex items-center gap-1">
                        <ImageIcon size={10} />
                        Logo
                      </label>
                      <div className="relative">
                        {data.compLogo ? (
                          <div className="relative group">
                            <img src={data.compLogo} alt="Logo" className="w-20 h-20 sm:w-28 sm:h-28 object-contain bg-white rounded-lg sm:rounded-xl p-2" />
                            <button onClick={() => updateData('compLogo', null)} className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-20 h-20 sm:w-28 sm:h-28 border-2 border-dashed border-white/20 rounded-lg sm:rounded-xl cursor-pointer hover:border-emerald-500/50 transition-all">
                            <Upload size={20} className="text-zinc-500 mb-1" />
                            <span className="text-[10px] text-zinc-500">Charger</span>
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
                  <User size={18} />
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
                    <InputField label="Numéro Permis de Travail" value={data.empWorkPermit} onChange={(v) => updateData('empWorkPermit', v)} placeholder="N° du permis" icon={<Shield size={12} />} required />
                  )}
                </div>

                <InputField label="Adresse de Résidence" value={data.empAddr} onChange={(v) => updateData('empAddr', v)} placeholder="Adresse complète" icon={<MapPin size={12} />} required />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <InputField label="N° Pièce d'Identité" value={data.empID} onChange={(v) => updateData('empID', v)} placeholder="CNI, Passeport..." icon={<FileText size={12} />} required />
                  <InputField label="Téléphone" type="tel" value={data.empPhone} onChange={(v) => updateData('empPhone', v)} placeholder="+257 XX XXX XXX" icon={<User size={12} />} required />
                </div>

                <InputField label="Email (optionnel)" type="email" value={data.empEmail} onChange={(v) => updateData('empEmail', v)} placeholder="exemple@email.com" icon={<FileText size={12} />} />
              </div>
            )}

            {/* SECTION CONTRAT */}
            {activeSection === 'contract' && (
              <div className="bg-zinc-900/50 border border-white/10 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl space-y-4 sm:space-y-6">
                <div className="flex items-center gap-2 sm:gap-3 text-amber-400 mb-4 sm:mb-6">
                  <Briefcase size={18} />
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
                      <GraduationCap size={16} />
                      <h3 className="text-xs sm:text-sm font-black uppercase">Informations Stage</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <InputField label="Établissement" value={data.stageSchool} onChange={(v) => updateData('stageSchool', v)} placeholder="Université/école" icon={<Building size={12} />} required />
                      <InputField label="Niveau d'Études" value={data.stageLevel} onChange={(v) => updateData('stageLevel', v)} placeholder="Ex: Licence 3..." icon={<Award size={12} />} required />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <InputField label="Département" value={data.jobDept} onChange={(v) => updateData('jobDept', v)} placeholder="Ex: Technique, RH..." icon={<Building size={12} />} required />
                  <InputField label="Lieu de Travail" value={data.jobLocation} onChange={(v) => updateData('jobLocation', v)} placeholder="Adresse du lieu de travail" icon={<MapPin size={12} />} required />
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <div className="flex items-center gap-2 text-amber-400 mb-2 sm:mb-3">
                    <ClipboardList size={16} />
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
                    <InputField label="Date de Fin" type="date" value={data.endDate} onChange={(v) => updateData('endDate', v)} icon={<Calendar size={12} />} required />
                  )}
                </div>

                {data.jobType === 'CDD' && (
                  <div className="space-y-3 sm:space-y-4">
                    <InputField label="Motif du CDD" value={data.cddReason} onChange={(v) => updateData('cddReason', v)} placeholder="Ex: Remplacement..." icon={<FileText size={12} />} required />
                    <div className="p-3 sm:p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg sm:rounded-xl">
                      <p className="text-[10px] sm:text-xs text-blue-400">
                        <Clock size={12} className="inline mr-1" />
                        <strong>Période d'essai CDD :</strong> 3 mois
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
                    <InputField label="Période d'Essai (mois)" type="number" value={data.trial} onChange={(v) => updateData('trial', v)} placeholder="3" icon={<Calendar size={12} />} required />
                  )}
                </div>

                {data.jobType !== 'STAGE' && (
                  <div className="space-y-3 sm:space-y-4 p-4 sm:p-6 bg-black/20 rounded-lg sm:rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <input type="checkbox" checked={data.hasNonCompete} onChange={(e) => updateData('hasNonCompete', e.target.checked)} className="w-4 h-4 rounded border-white/20 bg-black/40 text-amber-500 focus:ring-amber-500" />
                      <label className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase">Clause de non-concurrence</label>
                    </div>
                    {data.hasNonCompete && (
                      <InputField label="Durée" value={data.nonCompeteDuration} onChange={(v) => updateData('nonCompeteDuration', v)} placeholder="Ex: 12 mois..." icon={<Shield size={12} />} required />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SIDEBAR ACTIONS */}
          <div className="lg:col-span-4">
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/10 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl lg:sticky lg:top-4 space-y-4 sm:space-y-6 shadow-2xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <CheckCircle size={18} className="text-emerald-400" />
                <h3 className="text-lg sm:text-xl font-black italic uppercase">Actions</h3>
              </div>

              {data.documentMode === 'ELECTRONIC' && (
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <h4 className="text-[10px] sm:text-xs font-black uppercase text-zinc-400 mb-2 sm:mb-3">Signatures Électroniques</h4>
                  <button onClick={() => openSignatureModal('employer')} className={`w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs flex items-center justify-center gap-2 sm:gap-3 transition-all ${signatures.employer ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' : 'bg-zinc-800 border border-white/10 text-zinc-400 hover:border-emerald-500/50'}`}>
                    <PenTool size={14} />
                    {signatures.employer ? 'Employeur ✓' : 'Signer (Employeur)'}
                  </button>
                  <button onClick={() => openSignatureModal('employee')} className={`w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs flex items-center justify-center gap-2 sm:gap-3 transition-all ${signatures.employee ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400' : 'bg-zinc-800 border border-white/10 text-zinc-400 hover:border-blue-500/50'}`}>
                    <PenTool size={14} />
                    {signatures.employee ? 'Salarié ✓' : 'Signer (Salarié)'}
                  </button>
                </div>
              )}

              <div className="space-y-2 sm:space-y-3">
                <button onClick={generatePDF} disabled={isGenerating} className="w-full py-4 sm:py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-black rounded-lg sm:rounded-xl font-black uppercase text-[10px] sm:text-xs flex items-center justify-center gap-2 sm:gap-3 transition-all active:scale-95 shadow-lg shadow-emerald-500/30">
                  {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                  {isGenerating ? 'Génération...' : 'Générer PDF'}
                </button>
                {data.documentMode === 'PRINT' && (
  <button onClick={generateWord} className="w-full py-3 sm:py-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg sm:rounded-xl font-black uppercase text-[10px] sm:text-xs flex items-center justify-center gap-2 sm:gap-3 transition-all">
    <FileDown size={16} />
    Exporter Word
  </button>
)}
                <button onClick={() => setShowPreview(true)} className="w-full py-3 sm:py-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg sm:rounded-xl font-black uppercase text-[10px] sm:text-xs flex items-center justify-center gap-2 sm:gap-3 transition-all">
                  <Eye size={16} />
                  Aperçu du Contrat
                </button>
              </div>

              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-black/40 rounded-xl sm:rounded-2xl border border-white/5 space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 text-zinc-500 mb-2 sm:mb-3">
                  <Scale size={14} />
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

              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg sm:rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[8px] sm:text-[9px] text-amber-400/80 leading-relaxed">Les contrats ECODREUM sont immuables. Pour modifier, supprimez et recréez.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL SIGNATURE */}
        {showSignatureModal && (
          <div 
            className="fixed inset-0 bg-black/95 z-50 flex flex-col"
            style={{ touchAction: 'none' }}
          >
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
            
            <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
              <p className="text-xs sm:text-sm text-zinc-400 mb-3 sm:mb-4 text-center">
                Dessinez votre signature ci-dessous
              </p>
              
              <div 
                className="flex-1 bg-white rounded-xl sm:rounded-2xl overflow-hidden relative"
                style={{ touchAction: 'none', minHeight: '200px', maxHeight: '350px' }}
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
              </div>
            </div>
            
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
          <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto">
            <div className="min-h-screen p-4 sm:p-6 md:p-8">
              <div className="max-w-6xl mx-auto">
                <div className="bg-zinc-900 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black uppercase">Archives</h2>
                      <p className="text-[10px] sm:text-xs text-zinc-500 mt-1">Contrats sauvegardés • ECODREUM INTELLIGENCE L1</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button onClick={syncToGoogleDrive} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 sm:py-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs hover:bg-blue-500/20 transition-all">
                        <Cloud size={14} />
                        Google Drive
                        <ExternalLink size={10} />
                      </button>
                      <button onClick={() => setShowArchives(false)} className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-zinc-800 text-white rounded-lg sm:rounded-xl font-bold text-xs hover:bg-zinc-700 transition-all">
                        Fermer
                      </button>
                    </div>
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
                      <label className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs cursor-pointer hover:bg-purple-500/20 transition-all">
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

                  {filteredContracts.length === 0 ? (
                    <div className="text-center py-12 sm:py-20">
                      <Archive size={48} className="mx-auto text-zinc-700 mb-3 sm:mb-4" />
                      <p className="text-xs sm:text-sm text-zinc-500">{searchTerm || filterType !== 'ALL' ? 'Aucun résultat' : 'Aucun contrat archivé'}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {filteredContracts.map((contract) => (
                        <div key={contract.id} className="bg-zinc-800 border border-white/10 rounded-lg sm:rounded-xl p-4 sm:p-5 space-y-2 sm:space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-xs sm:text-sm truncate">{contract.employeeName}</h3>
                              <p className="text-[10px] sm:text-xs text-zinc-500 truncate">{contract.jobTitle}</p>
                            </div>
                            <div className="flex flex-col gap-1 items-end ml-2">
                              <span className={`text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg font-bold ${contract.contractType === 'CDI' ? 'bg-emerald-500/20 text-emerald-400' : contract.contractType === 'CDD' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>{contract.contractType}</span>
                              {contract.syncedToCloud && (
                                <span className="text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg font-bold bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                                  <Cloud size={8} />
                                  Cloud
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-[10px] sm:text-xs text-zinc-400 space-y-1">
                            <div>{new Date(contract.createdAt).toLocaleDateString('fr-FR')}</div>
                            {contract.signed && <div className="text-emerald-400">✓ Signé</div>}
                            {contract.verificationId && (
                              <div className="text-[9px] text-zinc-500 font-mono truncate">ID: {contract.verificationId}</div>
                            )}
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
                              <>
                                <button 
                                  onClick={() => viewArchivedContract(contract)} 
                                  className="flex-1 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold hover:bg-purple-500/30 transition-all flex items-center justify-center gap-1"
                                >
                                  <Eye size={12} />
                                  Voir
                                </button>
                                <button 
                                  onClick={() => regeneratePDF(contract)} 
                                  disabled={isGenerating}
                                  className="flex-1 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                                >
                                  <Download size={12} />
                                  PDF
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => deleteContract(contract.verificationId || contract.id)} 
                              className="p-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-md sm:rounded-lg hover:bg-red-500/30 transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
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

        {/* MODAL APERÇU */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-zinc-900/95 backdrop-blur-xl border-b border-white/10">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowPreview(false)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                  <X size={18} />
                </button>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Aperçu du Contrat</h3>
                  <p className="text-[10px] text-zinc-500">Vérifiez avant de générer</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPreview(false)} 
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg font-bold text-xs hover:bg-zinc-700 transition-all"
              >
                <EyeOff size={14} />
                Fermer
              </button>
            </div>
            
            <div className="p-4 sm:p-6 md:p-8">
              <div className="max-w-4xl mx-auto">
                <div ref={contractRef} className="bg-white text-black p-6 sm:p-10 md:p-16 shadow-2xl rounded-lg">
                  <ContractPreview 
                    data={data} 
                    config={config} 
                    signatures={signatures} 
                    qrCode={qrCodeData} 
                    verificationId={currentVerificationId}
                  />
                </div>
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
  verificationId: string;
}

function ContractPreview({ data, config, signatures, qrCode, verificationId }: ContractPreviewProps) {
  const capitalClause = data.showCapital && data.compCapital ? `, au capital social de ${data.compCapital} ${config.currency}` : '';
  const foreignerClause = data.isForeigner && data.empWorkPermit ? `, titulaire du permis de travail n°${data.empWorkPermit}` : '';
  const endDateClause = (data.jobType === 'CDD' || data.jobType === 'STAGE') && data.endDate ? ` et prendra fin le ${formatDateFR(data.endDate)}` : '';
  const trialPeriod = data.jobType === 'STAGE' ? null : (data.jobType === 'CDD' ? '3' : data.trial);

  return (
    <div className="space-y-4 sm:space-y-6 font-serif text-sm sm:text-base" style={{ fontFamily: 'Georgia, serif', lineHeight: '1.7' }}>
      {/* EN-TÊTE */}
      <div className="flex items-start justify-between mb-6 sm:mb-10">
        {data.compLogo ? (
          <div className="w-16 h-16 sm:w-20 sm:h-20">
            <img src={data.compLogo} alt="Logo" className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="w-16 h-16 sm:w-20 sm:h-20" />
        )}
        <div className="text-right text-[8px] sm:text-[10px] text-gray-500">
          <p className="font-mono">{verificationId || 'APERÇU'}</p>
          <p>ECODREUM INTELLIGENCE L1</p>
        </div>
      </div>

      <div className="text-center mb-6 sm:mb-10">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-wider mb-2">{data.jobType === 'STAGE' ? 'CONVENTION DE STAGE' : 'CONTRAT DE TRAVAIL'}</h1>
        <p className="text-sm sm:text-lg font-bold text-gray-700">RÉGIME : {data.jobType === 'CDI' ? 'CONTRAT À DURÉE INDÉTERMINÉE' : data.jobType === 'CDD' ? 'CONTRAT À DURÉE DÉTERMINÉE' : 'CONVENTION DE STAGE'}</p>
        <p className="text-[10px] sm:text-xs text-gray-500 mt-2 italic">{config.lawReference}</p>
      </div>

      <div className="space-y-4 sm:space-y-5 text-xs sm:text-sm">
        <p className="font-bold text-sm sm:text-base mb-3">ENTRE LES SOUSSIGNÉS :</p>
        
        <p className="leading-relaxed text-justify">
          La société <strong>{data.compName || '_______________'}</strong>, {data.compType || '___'}{capitalClause}, dont le siège social est situé à <strong>{data.compAddr || '_______________'}</strong>, immatriculée au Registre de Commerce et du Crédit Mobilier (RCCM) sous le numéro <strong>{data.compRCCM || '_______________'}</strong> et identifiée au {config.idLabel} sous le numéro <strong>{data.compID || '_______________'}</strong>, représentée aux présentes par <strong>M./Mme {data.bossName || '_______________'}</strong>, agissant en sa qualité de <strong>{data.bossTitle || '_______________'}</strong>, dûment habilité(e).
        </p>
        <p className="italic text-right text-xs">Ci-après dénommée « <strong>{data.jobType === 'STAGE' ? "L'ENTREPRISE D'ACCUEIL" : "L'EMPLOYEUR"}</strong> »</p>
        
        <p className="text-center font-bold my-3">D'UNE PART,</p>
        <p className="text-center font-bold">ET :</p>
        
        <p className="leading-relaxed text-justify">
          <strong>M./Mme {data.empName || '_______________'}</strong>, né(e) le <strong>{data.empBirth ? formatDateFR(data.empBirth) : '_______________'}</strong> à <strong>{data.empBirthPlace || '_______________'}</strong>, de nationalité <strong>{data.empNation || '_______________'}</strong>{foreignerClause}, titulaire de la pièce d'identité nationale n°<strong>{data.empID || '_______________'}</strong>, demeurant à <strong>{data.empAddr || '_______________'}</strong>, joignable au <strong>{data.empPhone || '_______________'}</strong>{data.empEmail && ` et par courrier électronique à l'adresse ${data.empEmail}`}.
          {data.jobType === 'STAGE' && data.stageSchool && (
            <> Actuellement inscrit(e) en <strong>{data.stageLevel}</strong> à <strong>{data.stageSchool}</strong>.</>
          )}
        </p>
        <p className="italic text-right text-xs">Ci-après dénommé(e) « <strong>{data.jobType === 'STAGE' ? 'LE/LA STAGIAIRE' : 'LE/LA SALARIÉ(E)'}</strong> »</p>
        
        <p className="text-center font-bold my-3">D'AUTRE PART,</p>

        <div className="mt-6 pt-4">
  <p className="font-bold text-sm mb-3">{config.articles.intro}</p>
  <p className="font-bold text-sm sm:text-base mb-4">IL A ÉTÉ ARRÊTÉ ET CONVENU CE QUI SUIT :</p>
</div>

        <Article title="ARTICLE 1 : OBJET ET ENGAGEMENT">
          <p className="text-justify">
            {data.jobType === 'STAGE' ? (
              <>La présente convention a pour objet de définir les conditions dans lesquelles <strong>{data.empName || '___'}</strong> effectuera un stage au sein de {data.compName || '___'}, dans le cadre de sa formation en <strong>{data.stageLevel || '___'}</strong> à <strong>{data.stageSchool || '___'}</strong>.</>
            ) : (
              <>{config.articles.engagement} Par le présent contrat, l'Employeur engage <strong>{data.empName || '___'}</strong> qui accepte, en qualité de <strong>{data.jobTitle || '___'}</strong>. Le présent contrat est conclu sous le régime du {data.jobType === 'CDI' ? 'contrat à durée indéterminée' : 'contrat à durée déterminée'}{data.jobType === 'CDD' && data.cddReason ? ` pour le motif suivant : ${data.cddReason}` : ''}.</>
            )}
          </p>
        </Article>

        <Article title="ARTICLE 2 : FONCTIONS ET TÂCHES">
          <p className="text-justify">
            {data.jobType === 'STAGE' ? 'Le/La Stagiaire' : 'Le/La Salarié(e)'} exercera les fonctions de <strong>{data.jobTitle || '___'}</strong> au sein du département <strong>{data.jobDept || '___'}</strong>, dans les locaux situés à <strong>{data.jobLocation || '___'}</strong>.
          </p>
          {data.jobTasks && (
            <div className="mt-3 p-3 bg-gray-50 border-l-4 border-gray-400">
              <p className="font-bold mb-1 text-xs">Tâches et missions confiées :</p>
              <p className="whitespace-pre-wrap text-xs">{data.jobTasks}</p>
            </div>
          )}
        </Article>

        <Article title="ARTICLE 3 : DURÉE ET PÉRIODE D'ESSAI">
          <p className="text-justify">
            Le présent {data.jobType === 'STAGE' ? 'stage' : 'contrat'} prend effet à compter du <strong>{data.startDate ? formatDateFR(data.startDate) : '___'}</strong>{endDateClause}.
          </p>
          {trialPeriod && (
            <p className="mt-2 text-justify">
              Une période d'essai de <strong>{trialPeriod} mois</strong> est prévue, pendant laquelle chaque partie pourra rompre le contrat librement.
            </p>
          )}
        </Article>

        <Article title={`ARTICLE 4 : ${data.jobType === 'STAGE' ? 'GRATIFICATION' : 'RÉMUNÉRATION'}`}>
          <p className="text-justify">
            {data.jobType === 'STAGE' ? 'Le/La Stagiaire' : 'Le/La Salarié(e)'} percevra une {data.jobType === 'STAGE' ? 'gratification' : 'rémunération'} mensuelle {data.jobType === 'STAGE' ? '' : 'brute '}de <strong>{data.salary || '0'} {config.currency}</strong> ({salaryToWords(data.salary || '0', config.currency)}).
          </p>
          {data.bonus && <p className="mt-2">Avantages complémentaires : {data.bonus}.</p>}
        </Article>

        <Article title="ARTICLE 5 : DURÉE DU TRAVAIL">
          <p>La durée hebdomadaire de travail est fixée à <strong>{data.hours || '40'} heures</strong>.</p>
        </Article>

        <Article title="ARTICLE 6 : OBLIGATIONS DES PARTIES">
          <p className="font-bold mb-2 text-xs">6.1. Obligations de l'Employeur :</p>
          <ul className="list-none space-y-1 ml-3 mb-3 text-xs">
            {config.articles.employerObligations.map((o, i) => (
              <li key={i}>• {o}</li>
            ))}
          </ul>
          <p className="font-bold mb-2 text-xs">6.2. Obligations du/de la {data.jobType === 'STAGE' ? 'Stagiaire' : 'Salarié(e)'} :</p>
          <ul className="list-none space-y-1 ml-3 text-xs">
            {config.articles.employeeObligations.map((o, i) => (
              <li key={i}>• {o}</li>
            ))}
          </ul>
        </Article>

        <Article title="ARTICLE 7 : CONFIDENTIALITÉ">
          <p className="text-justify">{data.jobType === 'STAGE' ? 'Le/La Stagiaire' : 'Le/La Salarié(e)'} s'engage à observer la plus stricte discrétion sur toutes les informations confidentielles de l'entreprise, pendant et après le {data.jobType === 'STAGE' ? 'stage' : 'contrat'}.</p>
        </Article>

        {data.hasNonCompete && data.jobType !== 'STAGE' && (
          <Article title="ARTICLE 8 : NON-CONCURRENCE">
            <p className="text-justify">Le/La Salarié(e) s'interdit d'exercer toute activité concurrente pendant une durée de <strong>{data.nonCompeteDuration}</strong> après la fin du contrat.</p>
          </Article>
        )}

        <Article title={`ARTICLE ${data.hasNonCompete && data.jobType !== 'STAGE' ? '9' : '8'} : RÉSILIATION`}>
          <p className="text-justify">{config.articles.termination}</p>
        </Article>

        <Article title={`ARTICLE ${data.hasNonCompete && data.jobType !== 'STAGE' ? '10' : '9'} : LITIGES`}>
          <p className="text-justify">{config.articles.disputes}</p>
        </Article>

        {/* SIGNATURES */}
        <div className="mt-10 pt-6 space-y-4">
          <p className="text-xs">
            <strong>Fait à</strong> {(data.compAddr || 'Bujumbura').split(',')[0].trim()}, <strong>le</strong> {formatDateFR(new Date().toISOString())}
          </p>
          <p className="text-xs">En deux (2) exemplaires originaux.</p>
          
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="text-center space-y-2">
              <p className="font-bold text-xs uppercase">{data.jobType === 'STAGE' ? "Pour l'Entreprise" : "Pour l'Employeur"}</p>
              {data.documentMode === 'ELECTRONIC' && signatures.employer ? (
                <div className="flex flex-col items-center">
                  <img src={signatures.employer} alt="Signature" className="h-16 border-b-2 border-black" />
                  <p className="text-[8px] text-gray-500 mt-1">Signature électronique</p>
                </div>
              ) : (
                <div className="h-16 border-b-2 border-black flex items-end justify-center pb-1">
                  <p className="text-[8px] text-gray-400">(Signature et cachet)</p>
                </div>
              )}
              <div className="text-xs mt-2">
                <p className="font-bold">{data.bossName || '_______________'}</p>
                <p className="text-gray-600">{data.bossTitle || '_______________'}</p>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <p className="font-bold text-xs uppercase">{data.jobType === 'STAGE' ? 'Le/La Stagiaire' : 'Le/La Salarié(e)'}</p>
              {data.documentMode === 'ELECTRONIC' && signatures.employee ? (
                <div className="flex flex-col items-center">
                  <img src={signatures.employee} alt="Signature" className="h-16 border-b-2 border-black" />
                  <p className="text-[8px] text-gray-500 mt-1">Signature électronique</p>
                </div>
              ) : (
                <div className="h-16 border-b-2 border-black flex items-end justify-center pb-1">
                  <p className="text-[8px] text-gray-400">(Lu et approuvé)</p>
                </div>
              )}
              <div className="text-xs mt-2">
                <p className="font-bold">{data.empName || '_______________'}</p>
                <p className="text-gray-600">{data.jobTitle || '_______________'}</p>
              </div>
            </div>
          </div>
          
          {/* QR CODE */}
          {qrCode && (
            <div className="flex justify-center mt-8 pt-4">
              <div className="text-center">
                <img src={qrCode} alt="QR" className="w-20 h-20 mx-auto mb-1" />
                <p className="text-[8px] text-gray-500">Scanner pour vérifier</p>
                <p className="text-[7px] text-gray-400 font-mono mt-1">{verificationId}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* PIED DE PAGE */}
        <div className="mt-8 pt-4 text-center text-[8px] text-gray-500">
          <p className="mb-1">Document généré via <strong>ECODREUM INTELLIGENCE L1</strong></p>
          <p>Ce document ne se substitue pas à un conseil juridique personnalisé.</p>
          <p className="mt-1">Conforme à la {config.lawReference}.</p>
        </div>
      </div>
    </div>
  );
}

function Article({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 page-break-inside-avoid">
      <h3 className="font-bold text-xs sm:text-sm mb-3 uppercase tracking-wide text-gray-800 underline">{title}</h3>
      <div className="text-xs sm:text-sm leading-relaxed text-justify">{children}</div>
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
