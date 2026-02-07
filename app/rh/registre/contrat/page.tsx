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
  RotateCcw, Cloud, ExternalLink, Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';
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

// --- CONFIGURATION JURIDIQUE ---
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
      disputes: "En cas de différend né de l'exécution ou de la rupture du présent contrat, les parties s'engagent à rechercher une solution amiable. À défaut d'accord amiable dans un délai de trente (30) jours, le litige sera soumis au Tribunal du Travail de Dakar, seul compétent pour connaître des litiges individuels du travail."
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
      disputes: "En cas de différend né de l'exécution ou de la rupture du présent contrat, les parties s'engagent à privilégier le règlement amiable par voie de négociation directe ou de médiation. À défaut de résolution amiable dans un délai de trente (30) jours, le litige sera porté devant le Tribunal du Travail de Bujumbura."
    }
  }
};

// --- FIN PARTIE 1 ---
// --- PARTIE 2 : COMPOSANT PRINCIPAL ET FONCTIONS ---

export default function GenerateurContratFinal() {
  const router = useRouter();
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

  // --- EFFETS ---
  useEffect(() => {
    loadContractsFromSupabase();
  }, []);

  useEffect(() => {
    filterContracts();
  }, [savedContracts, searchTerm, filterType]);

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
    } catch {
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    const stored = localStorage.getItem('ecodreum_contracts');
    if (stored) {
      setSavedContracts(JSON.parse(stored));
    }
  };

  const saveContractToSupabase = async (
    contractData: FormData, 
    verificationId: string,
    qrCode: string,
    signed: boolean = false
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('contracts')
        .insert([{
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
        }]);

      return !error;
    } catch {
      return false;
    }
  };

  const deleteContractFromSupabase = async (verificationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('verification_id', verificationId);
      return !error;
    } catch {
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

    const reader = new FileReader();
    if (file.type === 'application/json') {
      reader.onload = (event) => {
        try {
          const contract = JSON.parse(event.target?.result as string);
          const updated = [contract, ...savedContracts];
          setSavedContracts(updated);
          localStorage.setItem('ecodreum_contracts', JSON.stringify(updated));
          showNotif('Contrat importé', 's');
        } catch {
          showNotif("Erreur d'import", 'e');
        }
      };
      reader.readAsText(file);
    } else {
      reader.onload = (event) => {
        const contract: SavedContract = {
          id: generateSecureId(),
          employeeName: file.name.replace(/\.[^/.]+$/, ''),
          jobTitle: 'Document importé',
          contractType: 'CDI',
          mode: 'PRINT',
          createdAt: new Date().toISOString(),
          data: { ...data },
          importedFile: {
            name: file.name,
            type: file.type,
            data: event.target?.result as string
          },
          syncedToCloud: false
        };
        const updated = [contract, ...savedContracts];
        setSavedContracts(updated);
        localStorage.setItem('ecodreum_contracts', JSON.stringify(updated));
        showNotif('Fichier importé', 's');
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const downloadImportedFile = (contract: SavedContract) => {
    if (!contract.importedFile) return;
    const link = document.createElement('a');
    link.href = contract.importedFile.data;
    link.download = contract.importedFile.name;
    link.click();
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

  const generateQRCode = async (url: string): Promise<string> => {
    try {
      return await QRCodeLib.toDataURL(url, { width: 150, margin: 1 });
    } catch {
      return '';
    }
  };

  // --- SIGNATURE ---
  const getPointFromEvent = useCallback((e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;
    if (clientX === undefined) return null;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const startDrawing = useCallback((e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const point = getPointFromEvent(e);
    if (!point) return;
    setIsDrawing(true);
    setLastPoint(point);
  }, [getPointFromEvent]);

  const draw = useCallback((e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || !lastPoint) return;
    const point = getPointFromEvent(e);
    if (!point) return;
    const canvas = signatureCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    setLastPoint(point);
  }, [isDrawing, lastPoint, getPointFromEvent]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    setLastPoint(null);
  }, []);

  const clearSignature = useCallback(() => {
    const canvas = signatureCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const saveSignature = useCallback(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const signatureData = canvas.toDataURL('image/png');
    if (currentSigner === 'employer') {
      setSignatures(prev => ({ ...prev, employer: signatureData }));
    } else {
      setSignatures(prev => ({ ...prev, employee: signatureData }));
    }
    showNotif(`Signature ${currentSigner === 'employer' ? 'employeur' : 'salarié'} enregistrée`, 's');
    setShowSignatureModal(false);
    setCurrentSigner(null);
  }, [currentSigner]);

  const openSignatureModal = (signer: 'employer' | 'employee') => {
    if (data.documentMode === 'PRINT') {
      showNotif('Activez le mode électronique pour signer', 'w');
      return;
    }
    setCurrentSigner(signer);
    setShowSignatureModal(true);
  };

  // --- VALIDATION ---
  const validateForm = (): boolean => {
    const errors: string[] = [];
    if (!data.compName.trim()) errors.push("Raison sociale");
    if (!data.compRCCM.trim()) errors.push("RCCM");
    if (!data.compID.trim()) errors.push(config.idLabel);
    if (!data.bossName.trim()) errors.push("Représentant légal");
    if (!data.compAddr.trim()) errors.push("Adresse entreprise");
    if (!data.empName.trim()) errors.push("Nom du salarié");
    if (!data.empBirth.trim()) errors.push("Date de naissance");
    if (!data.empBirthPlace.trim()) errors.push("Lieu de naissance");
    if (!data.empID.trim()) errors.push("N° pièce d'identité");
    if (!data.empAddr.trim()) errors.push("Adresse salarié");
    if (!data.empPhone.trim()) errors.push("Téléphone");
    if (!data.jobTitle.trim()) errors.push("Poste");
    if (!data.jobDept.trim()) errors.push("Département");
    if (!data.jobLocation.trim()) errors.push("Lieu de travail");
    if (!data.jobTasks.trim()) errors.push("Tâches");
    if (!data.salary || parseFloat(data.salary) <= 0) errors.push("Salaire");
    if (!data.startDate) errors.push("Date de début");
    if (data.jobType === 'CDD' && !data.endDate) errors.push("Date de fin CDD");
    if (data.jobType === 'CDD' && !data.cddReason.trim()) errors.push("Motif CDD");
    if (data.jobType === 'STAGE' && !data.endDate) errors.push("Date de fin stage");
    if (data.jobType === 'STAGE' && !data.stageSchool.trim()) errors.push("Établissement");
    if (data.jobType === 'STAGE' && !data.stageLevel.trim()) errors.push("Niveau d'études");
    if (data.hasNonCompete && !data.nonCompeteDuration.trim()) errors.push("Durée non-concurrence");
    setValidationErrors(errors);
    return errors.length === 0;
  };

  // --- GÉNÉRATION PDF DIRECTE AVEC JSPDF ---
  const generatePDF = async () => {
    if (!validateForm()) {
      showNotif("Champs manquants", "e");
      return;
    }
    setIsGenerating(true);

    try {
      const verificationId = generateSecureId();
      setCurrentVerificationId(verificationId);
      const qrCode = await generateQRCode(`${APP_BASE_URL}/verify/${verificationId}`);
      setQrCodeData(qrCode);

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let y = margin;

      const addText = (text: string, size: number, bold: boolean = false, align: 'left' | 'center' | 'right' = 'left', maxWidth: number = contentWidth) => {
        pdf.setFontSize(size);
        pdf.setFont('helvetica', bold ? 'bold' : 'normal');
        const lines = pdf.splitTextToSize(text, maxWidth);
        const lineHeight = size * 0.4;
        
        for (const line of lines) {
          if (y + lineHeight > pageHeight - margin) {
            pdf.addPage();
            y = margin;
          }
          let x = margin;
          if (align === 'center') x = pageWidth / 2;
          if (align === 'right') x = pageWidth - margin;
          pdf.text(line, x, y, { align });
          y += lineHeight;
        }
        y += 2;
      };

      const addSpace = (space: number) => {
        y += space;
        if (y > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
      };

      // --- CONTENU DU PDF ---
      const contractTitle = data.jobType === 'STAGE' ? 'CONVENTION DE STAGE' : 'CONTRAT DE TRAVAIL';
      const contractRegime = data.jobType === 'CDI' ? 'CONTRAT À DURÉE INDÉTERMINÉE' : data.jobType === 'CDD' ? 'CONTRAT À DURÉE DÉTERMINÉE' : 'CONVENTION DE STAGE';
      const salarie = data.jobType === 'STAGE' ? 'LE/LA STAGIAIRE' : 'LE/LA SALARIÉ(E)';
      const employeur = data.jobType === 'STAGE' ? "L'ENTREPRISE D'ACCUEIL" : "L'EMPLOYEUR";
      const capitalClause = data.showCapital && data.compCapital ? `, au capital de ${data.compCapital} ${config.currency}` : '';
      const foreignerClause = data.isForeigner && data.empWorkPermit ? `, titulaire du permis de travail n°${data.empWorkPermit}` : '';
      const trialPeriod = data.jobType === 'STAGE' ? null : (data.jobType === 'CDD' ? '3' : data.trial);

      // Logo si présent
      if (data.compLogo) {
        try {
          pdf.addImage(data.compLogo, 'PNG', margin, y, 25, 25);
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          pdf.text(verificationId, pageWidth - margin, y + 5, { align: 'right' });
          pdf.text('ECODREUM INTELLIGENCE L1', pageWidth - margin, y + 9, { align: 'right' });
          y += 30;
        } catch {
          y += 5;
        }
      } else {
        pdf.setFontSize(8);
        pdf.text(verificationId, pageWidth - margin, y, { align: 'right' });
        pdf.text('ECODREUM INTELLIGENCE L1', pageWidth - margin, y + 4, { align: 'right' });
        y += 10;
      }

      addText(contractTitle, 18, true, 'center');
      addText(`RÉGIME : ${contractRegime}`, 12, true, 'center');
      addSpace(3);
      addText(config.lawReference, 9, false, 'center');
      addSpace(10);

      addText('ENTRE LES SOUSSIGNÉS :', 11, true);
      addSpace(3);

      addText(`La société ${data.compName}, ${data.compType}${capitalClause}, dont le siège social est situé à ${data.compAddr}, immatriculée au RCCM sous le numéro ${data.compRCCM} et identifiée au ${config.idLabel} sous le numéro ${data.compID}, représentée par M./Mme ${data.bossName}, en qualité de ${data.bossTitle}.`, 10);
      addSpace(2);
      addText(`Ci-après dénommée « ${employeur} »`, 9, false, 'right');
      addSpace(5);
      addText("D'UNE PART,", 10, true, 'center');
      addSpace(5);
      addText('ET :', 10, true, 'center');
      addSpace(5);

      let empText = `M./Mme ${data.empName}, né(e) le ${formatDateFR(data.empBirth)} à ${data.empBirthPlace}, de nationalité ${data.empNation}${foreignerClause}, titulaire de la pièce d'identité n°${data.empID}, demeurant à ${data.empAddr}, joignable au ${data.empPhone}`;
      if (data.empEmail) empText += ` et par email à ${data.empEmail}`;
      empText += '.';
      if (data.jobType === 'STAGE' && data.stageSchool) {
        empText += ` Actuellement inscrit(e) en ${data.stageLevel} à ${data.stageSchool}.`;
      }
      addText(empText, 10);
      addSpace(2);
      addText(`Ci-après dénommé(e) « ${salarie} »`, 9, false, 'right');
      addSpace(5);
      addText("D'AUTRE PART,", 10, true, 'center');
      addSpace(8);

      addText(config.articles.intro, 10, true);
      addSpace(3);
      addText('IL A ÉTÉ ARRÊTÉ ET CONVENU CE QUI SUIT :', 11, true);
      addSpace(8);

      // ARTICLE 1
      addText('ARTICLE 1 : OBJET ET ENGAGEMENT', 10, true);
      addSpace(2);
      if (data.jobType === 'STAGE') {
        addText(`La présente convention a pour objet de définir les conditions dans lesquelles ${data.empName} effectuera un stage au sein de ${data.compName}, dans le cadre de sa formation en ${data.stageLevel} à ${data.stageSchool}.`, 10);
      } else {
        addText(`${config.articles.engagement} Par le présent contrat, l'Employeur engage ${data.empName} qui accepte, en qualité de ${data.jobTitle}. Le présent contrat est conclu sous le régime du ${data.jobType === 'CDI' ? 'contrat à durée indéterminée' : 'contrat à durée déterminée'}${data.jobType === 'CDD' && data.cddReason ? ` pour le motif suivant : ${data.cddReason}` : ''}.`, 10);
      }
      addSpace(6);

      // ARTICLE 2
      addText('ARTICLE 2 : FONCTIONS ET TÂCHES', 10, true);
      addSpace(2);
      addText(`${data.jobType === 'STAGE' ? 'Le/La Stagiaire' : 'Le/La Salarié(e)'} exercera les fonctions de ${data.jobTitle} au sein du département ${data.jobDept}, dans les locaux situés à ${data.jobLocation}.`, 10);
      addSpace(3);
      addText('Tâches et missions confiées :', 10, true);
      addText(data.jobTasks, 10);
      addSpace(6);

      // ARTICLE 3
      addText('ARTICLE 3 : DURÉE ET PÉRIODE D\'ESSAI', 10, true);
      addSpace(2);
      let dureeText = `Le présent ${data.jobType === 'STAGE' ? 'stage' : 'contrat'} prend effet à compter du ${formatDateFR(data.startDate)}`;
      if ((data.jobType === 'CDD' || data.jobType === 'STAGE') && data.endDate) {
        dureeText += ` et prendra fin le ${formatDateFR(data.endDate)}`;
      }
      dureeText += '.';
      addText(dureeText, 10);
      if (trialPeriod) {
        addSpace(2);
        addText(`Une période d'essai de ${trialPeriod} mois est prévue, pendant laquelle chaque partie pourra rompre le contrat librement.`, 10);
      }
      addSpace(6);

      // ARTICLE 4
      addText(`ARTICLE 4 : ${data.jobType === 'STAGE' ? 'GRATIFICATION' : 'RÉMUNÉRATION'}`, 10, true);
      addSpace(2);
      addText(`${data.jobType === 'STAGE' ? 'Le/La Stagiaire' : 'Le/La Salarié(e)'} percevra une ${data.jobType === 'STAGE' ? 'gratification' : 'rémunération'} mensuelle ${data.jobType === 'STAGE' ? '' : 'brute '}de ${data.salary} ${config.currency} (${salaryToWords(data.salary, config.currency)}).`, 10);
      if (data.bonus) {
        addSpace(2);
        addText(`Avantages complémentaires : ${data.bonus}.`, 10);
      }
      addSpace(6);

      // ARTICLE 5
      addText('ARTICLE 5 : DURÉE DU TRAVAIL', 10, true);
      addSpace(2);
      addText(`La durée hebdomadaire de travail est fixée à ${data.hours} heures.`, 10);
      addSpace(6);

      // ARTICLE 6
      addText('ARTICLE 6 : OBLIGATIONS DES PARTIES', 10, true);
      addSpace(2);
      addText('6.1. Obligations de l\'Employeur :', 10, true);
      config.articles.employerObligations.forEach(ob => {
        addText(`• ${ob}`, 9);
      });
      addSpace(3);
      addText(`6.2. Obligations du/de la ${data.jobType === 'STAGE' ? 'Stagiaire' : 'Salarié(e)'} :`, 10, true);
      config.articles.employeeObligations.forEach(ob => {
        addText(`• ${ob}`, 9);
      });
      addSpace(6);

      // ARTICLE 7
      addText('ARTICLE 7 : CONFIDENTIALITÉ', 10, true);
      addSpace(2);
      addText(`${data.jobType === 'STAGE' ? 'Le/La Stagiaire' : 'Le/La Salarié(e)'} s'engage à observer la plus stricte discrétion sur toutes les informations confidentielles de l'entreprise, pendant et après le ${data.jobType === 'STAGE' ? 'stage' : 'contrat'}.`, 10);
      addSpace(6);

      // ARTICLE 8 (Non-concurrence si applicable)
      let articleNum = 8;
      if (data.hasNonCompete && data.jobType !== 'STAGE') {
        addText(`ARTICLE ${articleNum} : NON-CONCURRENCE`, 10, true);
        addSpace(2);
        addText(`Le/La Salarié(e) s'interdit d'exercer toute activité concurrente pendant une durée de ${data.nonCompeteDuration} après la fin du contrat.`, 10);
        addSpace(6);
        articleNum++;
      }

      // ARTICLE RÉSILIATION
      addText(`ARTICLE ${articleNum} : RÉSILIATION`, 10, true);
      addSpace(2);
      addText(config.articles.termination, 10);
      addSpace(6);
      articleNum++;

      // ARTICLE LITIGES
      addText(`ARTICLE ${articleNum} : LITIGES`, 10, true);
      addSpace(2);
      addText(config.articles.disputes, 10);
      addSpace(10);

      // SIGNATURES
      addText(`Fait à ${data.compAddr.split(',')[0]}, le ${formatDateFR(new Date().toISOString())}`, 10);
      addSpace(2);
      addText('En deux (2) exemplaires originaux.', 10);
      addSpace(10);

      const sigY = y;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(data.jobType === 'STAGE' ? "Pour l'Entreprise" : "Pour l'Employeur", margin + 30, sigY, { align: 'center' });
      pdf.text(data.jobType === 'STAGE' ? "Le/La Stagiaire" : "Le/La Salarié(e)", pageWidth - margin - 30, sigY, { align: 'center' });

      if (data.documentMode === 'ELECTRONIC' && signatures.employer) {
        try {
          pdf.addImage(signatures.employer, 'PNG', margin + 10, sigY + 5, 40, 20);
        } catch {}
      }
      if (data.documentMode === 'ELECTRONIC' && signatures.employee) {
        try {
          pdf.addImage(signatures.employee, 'PNG', pageWidth - margin - 50, sigY + 5, 40, 20);
        } catch {}
      }

      y = sigY + 30;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.bossName, margin + 30, y, { align: 'center' });
      pdf.text(data.empName, pageWidth - margin - 30, y, { align: 'center' });
      y += 4;
      pdf.setFontSize(8);
      pdf.text(data.bossTitle, margin + 30, y, { align: 'center' });
      pdf.text(data.jobTitle, pageWidth - margin - 30, y, { align: 'center' });

      // QR Code
      if (qrCode) {
        y += 15;
        if (y + 30 > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
        try {
          pdf.addImage(qrCode, 'PNG', pageWidth / 2 - 15, y, 30, 30);
          y += 32;
          pdf.setFontSize(7);
          pdf.text('Scanner pour vérifier l\'authenticité', pageWidth / 2, y, { align: 'center' });
          y += 3;
          pdf.text(verificationId, pageWidth / 2, y, { align: 'center' });
        } catch {}
      }

      // Pied de page
      y += 10;
      if (y + 15 > pageHeight - 10) {
        pdf.addPage();
        y = margin;
      }
      pdf.setFontSize(7);
      pdf.setTextColor(100);
      pdf.text('Document généré via ECODREUM INTELLIGENCE L1', pageWidth / 2, y, { align: 'center' });
      y += 3;
      pdf.text('Ce document ne se substitue pas à un conseil juridique personnalisé.', pageWidth / 2, y, { align: 'center' });
      pdf.setTextColor(0);

      // Sauvegarder
      pdf.save(`CONTRAT_${data.empName.replace(/\s/g, '_')}_${verificationId}.pdf`);

      // Enregistrer
      const savedToSupabase = await saveContractToSupabase(data, verificationId, qrCode, !!(signatures.employer && signatures.employee));
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

      showNotif("PDF généré avec succès !", "s");
    } catch (error) {
      console.error(error);
      showNotif("Erreur de génération", "e");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- RÉGÉNÉRER PDF DEPUIS ARCHIVES ---
  const regeneratePDF = async (contract: SavedContract) => {
    setData(contract.data);
    if (contract.employerSignature) setSignatures(prev => ({ ...prev, employer: contract.employerSignature || '' }));
    if (contract.employeeSignature) setSignatures(prev => ({ ...prev, employee: contract.employeeSignature || '' }));
    setShowArchives(false);
    setViewingContract(null);
    setTimeout(() => generatePDF(), 100);
  };

  // --- GÉNÉRATION WORD (Mode Print uniquement) ---
  const generateWord = async () => {
    if (data.documentMode === 'ELECTRONIC') {
      showNotif("Word disponible en mode À Imprimer uniquement", "w");
      return;
    }
    if (!validateForm()) {
      showNotif("Champs manquants", "e");
      return;
    }

    try {
      const verificationId = generateSecureId();
      const capitalClause = data.showCapital && data.compCapital ? `, au capital de ${data.compCapital} ${config.currency}` : '';
      const trialPeriod = data.jobType === 'STAGE' ? null : (data.jobType === 'CDD' ? '3' : data.trial);

      const doc = new Document({
        sections: [{
          properties: { page: { margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 } } },
          children: [
            new Paragraph({ children: [new TextRun({ text: data.jobType === 'STAGE' ? 'CONVENTION DE STAGE' : 'CONTRAT DE TRAVAIL', bold: true, size: 32 })], alignment: AlignmentType.CENTER, spacing: { after: 150 } }),
            new Paragraph({ children: [new TextRun({ text: `RÉGIME : ${data.jobType === 'CDI' ? 'CDI' : data.jobType === 'CDD' ? 'CDD' : 'STAGE'}`, bold: true, size: 22 })], alignment: AlignmentType.CENTER, spacing: { after: 100 } }),
            new Paragraph({ children: [new TextRun({ text: config.lawReference, italics: true, size: 18 })], alignment: AlignmentType.CENTER, spacing: { after: 100 } }),
            new Paragraph({ children: [new TextRun({ text: `ID : ${verificationId}`, size: 16, color: '888888' })], alignment: AlignmentType.CENTER, spacing: { after: 300 } }),
            
            new Paragraph({ children: [new TextRun({ text: 'ENTRE LES SOUSSIGNÉS :', bold: true, size: 22 })], spacing: { after: 150 } }),
            new Paragraph({ children: [new TextRun({ text: `La société ${data.compName}, ${data.compType}${capitalClause}, siège à ${data.compAddr}, RCCM ${data.compRCCM}, ${config.idLabel} ${data.compID}, représentée par ${data.bossName}, ${data.bossTitle}.`, size: 20 })], spacing: { after: 100 } }),
            new Paragraph({ children: [new TextRun({ text: `Ci-après « L'EMPLOYEUR »`, italics: true, size: 20 })], alignment: AlignmentType.RIGHT, spacing: { after: 150 } }),
            new Paragraph({ children: [new TextRun({ text: "D'UNE PART,", bold: true, size: 20 })], alignment: AlignmentType.CENTER, spacing: { after: 150 } }),
            new Paragraph({ children: [new TextRun({ text: 'ET :', bold: true, size: 20 })], alignment: AlignmentType.CENTER, spacing: { after: 150 } }),
            new Paragraph({ children: [new TextRun({ text: `${data.empName}, né(e) le ${formatDateFR(data.empBirth)} à ${data.empBirthPlace}, ${data.empNation}, ID ${data.empID}, demeurant ${data.empAddr}, tél ${data.empPhone}.`, size: 20 })], spacing: { after: 100 } }),
            new Paragraph({ children: [new TextRun({ text: `Ci-après « LE/LA SALARIÉ(E) »`, italics: true, size: 20 })], alignment: AlignmentType.RIGHT, spacing: { after: 150 } }),
            new Paragraph({ children: [new TextRun({ text: "D'AUTRE PART,", bold: true, size: 20 })], alignment: AlignmentType.CENTER, spacing: { after: 250 } }),
            
            new Paragraph({ children: [new TextRun({ text: 'IL A ÉTÉ CONVENU CE QUI SUIT :', bold: true, size: 22 })], spacing: { after: 200 } }),
            
            new Paragraph({ children: [new TextRun({ text: 'ARTICLE 1 : ENGAGEMENT', bold: true, size: 20 })], spacing: { after: 100 } }),
            new Paragraph({ children: [new TextRun({ text: `L'Employeur engage ${data.empName} en qualité de ${data.jobTitle}.`, size: 20 })], spacing: { after: 200 } }),
            
            new Paragraph({ children: [new TextRun({ text: 'ARTICLE 2 : FONCTIONS', bold: true, size: 20 })], spacing: { after: 100 } }),
            new Paragraph({ children: [new TextRun({ text: `Poste : ${data.jobTitle}, Département : ${data.jobDept}, Lieu : ${data.jobLocation}.`, size: 20 })], spacing: { after: 50 } }),
            new Paragraph({ children: [new TextRun({ text: `Missions : ${data.jobTasks}`, size: 20 })], spacing: { after: 200 } }),
            
            new Paragraph({ children: [new TextRun({ text: 'ARTICLE 3 : DURÉE', bold: true, size: 20 })], spacing: { after: 100 } }),
            new Paragraph({ children: [new TextRun({ text: `Début : ${formatDateFR(data.startDate)}${data.endDate ? `, Fin : ${formatDateFR(data.endDate)}` : ''}.${trialPeriod ? ` Essai : ${trialPeriod} mois.` : ''}`, size: 20 })], spacing: { after: 200 } }),
            
            new Paragraph({ children: [new TextRun({ text: 'ARTICLE 4 : RÉMUNÉRATION', bold: true, size: 20 })], spacing: { after: 100 } }),
            new Paragraph({ children: [new TextRun({ text: `${data.salary} ${config.currency}/mois (${salaryToWords(data.salary, config.currency)}).${data.bonus ? ` Avantages : ${data.bonus}.` : ''}`, size: 20 })], spacing: { after: 200 } }),
            
            new Paragraph({ children: [new TextRun({ text: 'ARTICLE 5 : HORAIRES', bold: true, size: 20 })], spacing: { after: 100 } }),
            new Paragraph({ children: [new TextRun({ text: `${data.hours} heures/semaine.`, size: 20 })], spacing: { after: 200 } }),
            
            new Paragraph({ children: [new TextRun({ text: `Fait à ${data.compAddr.split(',')[0]}, le ${formatDateFR(new Date().toISOString())}`, size: 20 })], spacing: { before: 300, after: 300 } }),
            
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "L'Employeur", bold: true })], alignment: AlignmentType.CENTER }), new Paragraph({ text: '' }), new Paragraph({ text: '' }), new Paragraph({ children: [new TextRun({ text: data.bossName })], alignment: AlignmentType.CENTER })], borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } } }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Le/La Salarié(e)", bold: true })], alignment: AlignmentType.CENTER }), new Paragraph({ text: '' }), new Paragraph({ text: '' }), new Paragraph({ children: [new TextRun({ text: data.empName })], alignment: AlignmentType.CENTER })], borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } } }),
                  ],
                }),
              ],
            }),
            
            new Paragraph({ children: [new TextRun({ text: 'ECODREUM INTELLIGENCE L1', size: 14, color: '888888' })], alignment: AlignmentType.CENTER, spacing: { before: 300 } }),
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `CONTRAT_${data.empName.replace(/\s/g, '_')}_${verificationId}.docx`);
      showNotif("Word généré !", "s");
    } catch (error) {
      console.error(error);
      showNotif("Erreur de génération", "e");
    }
  };

  const viewArchivedContract = (contract: SavedContract) => {
    setViewingContract(contract);
    setShowArchives(false);
  };

  const syncToGoogleDrive = () => showNotif("Google Drive : Bientôt disponible !", "w");
  const showNotif = (m: string, t: 's' | 'e' | 'w') => { setNotif({ m, t }); setTimeout(() => setNotif(null), 4000); };
  const updateData = (field: keyof FormData, value: string | boolean | null) => { setData(prev => ({ ...prev, [field]: value })); setValidationErrors([]); };
  
  const getProgress = (): number => {
    const required = ['compName', 'compRCCM', 'compID', 'bossName', 'compAddr', 'empName', 'empBirth', 'empBirthPlace', 'empID', 'empAddr', 'empPhone', 'jobTitle', 'jobDept', 'jobLocation', 'jobTasks', 'salary', 'startDate'];
    let filled = 0;
    required.forEach(f => { if (data[f as keyof FormData]) filled++; });
    return Math.round((filled / required.length) * 100);
  };

// --- FIN PARTIE 2 ---
// --- PARTIE 3 : RETURN JSX ---

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-white font-bold">Chargement...</p>
          <p className="text-zinc-500 text-xs mt-2">ECODREUM INTELLIGENCE L1</p>
        </div>
      </div>
    );
  }

  if (viewingContract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setViewingContract(null)} className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
              <ArrowLeft size={18} />
              Retour
            </button>
            <button onClick={() => regeneratePDF(viewingContract)} disabled={isGenerating} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black rounded-xl font-bold hover:bg-emerald-400 transition-all disabled:opacity-50">
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Télécharger PDF
            </button>
          </div>
          
          <div className="bg-white text-black p-6 sm:p-10 rounded-2xl shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black uppercase">{viewingContract.data.jobType === 'STAGE' ? 'CONVENTION DE STAGE' : 'CONTRAT DE TRAVAIL'}</h1>
              <p className="text-gray-600 mt-2">{viewingContract.data.jobType}</p>
              <p className="text-xs text-gray-400 mt-1">{viewingContract.verificationId}</p>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Employeur</p>
                  <p className="font-bold">{viewingContract.data.compName}</p>
                  <p className="text-gray-600">{viewingContract.data.bossName}, {viewingContract.data.bossTitle}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Salarié</p>
                  <p className="font-bold">{viewingContract.data.empName}</p>
                  <p className="text-gray-600">{viewingContract.data.jobTitle}</p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-bold mb-2">Détails du contrat</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="text-gray-500">Début :</span> {formatDateFR(viewingContract.data.startDate)}</p>
                  {viewingContract.data.endDate && <p><span className="text-gray-500">Fin :</span> {formatDateFR(viewingContract.data.endDate)}</p>}
                  <p><span className="text-gray-500">Salaire :</span> {viewingContract.data.salary} {COUNTRIES[viewingContract.data.country].currency}</p>
                  <p><span className="text-gray-500">Lieu :</span> {viewingContract.data.jobLocation}</p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-bold mb-2">Missions</p>
                <p className="text-gray-700 whitespace-pre-wrap">{viewingContract.data.jobTasks}</p>
              </div>
              
              {viewingContract.signed && (
                <div className="flex items-center gap-2 text-emerald-600 p-4 bg-emerald-50 rounded-xl">
                  <CheckCircle size={20} />
                  <span className="font-bold">Contrat signé électroniquement</span>
                </div>
              )}
            </div>
            
            {viewingContract.qrCode && (
              <div className="flex justify-center mt-8">
                <div className="text-center">
                  <img src={viewingContract.qrCode} alt="QR" className="w-24 h-24 mx-auto" />
                  <p className="text-xs text-gray-400 mt-2">Scanner pour vérifier</p>
                </div>
              </div>
            )}
            
            <p className="text-center text-xs text-gray-400 mt-8">ECODREUM INTELLIGENCE L1</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 pb-20">
        
        {notif && (
          <div className={`fixed top-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto z-50 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${notif.t === 's' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : notif.t === 'w' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-red-500/20 border-red-500/40 text-red-300'}`}>
            <div className="flex items-center gap-3">
              {notif.t === 's' && <CheckCircle size={18} />}
              {notif.t === 'w' && <AlertTriangle size={18} />}
              {notif.t === 'e' && <AlertCircle size={18} />}
              <span className="text-sm font-bold">{notif.m}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">LEGAL ARCHITECT</h1>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Générateur de Contrats • ECODREUM INTELLIGENCE L1</p>
            </div>
          </div>
          <button onClick={() => setShowArchives(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl font-bold text-xs hover:bg-blue-500/20 transition-all">
            <Archive size={16} />
            Archives ({savedContracts.length})
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-5">
            <h3 className="text-xs font-black uppercase mb-3 text-emerald-400">Mode de Document</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => updateData('documentMode', 'ELECTRONIC')} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition-all ${data.documentMode === 'ELECTRONIC' ? 'bg-emerald-500 text-black' : 'bg-zinc-800 border border-white/10 text-zinc-400'}`}>
                <Zap size={16} />
                Électronique
              </button>
              <button onClick={() => updateData('documentMode', 'PRINT')} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition-all ${data.documentMode === 'PRINT' ? 'bg-amber-500 text-black' : 'bg-zinc-800 border border-white/10 text-zinc-400'}`}>
                <Printer size={16} />
                À Imprimer
              </button>
            </div>
          </div>
          
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Globe size={14} />
              Juridiction
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['SENEGAL', 'BURUNDI'] as const).map((c) => (
                <button key={c} onClick={() => updateData('country', c)} className={`px-4 py-3 rounded-xl text-xs font-black transition-all ${data.country === c ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-black' : 'bg-zinc-800 border border-white/10 text-zinc-400'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6 bg-zinc-900/50 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 uppercase">Progression</span>
            <span className="text-sm font-black text-emerald-400">{getProgress()}%</span>
          </div>
          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500" style={{ width: `${getProgress()}%` }} />
          </div>
        </div>

        {validationErrors.length > 0 && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-red-400 mb-3">
              <AlertCircle size={18} />
              <h3 className="text-sm font-black uppercase">Champs manquants ({validationErrors.length})</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {validationErrors.map((e, i) => (
                <span key={i} className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-lg">{e}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[{ id: 'company', label: 'Entreprise', icon: Building }, { id: 'employee', label: 'Salarié', icon: User }, { id: 'contract', label: 'Contrat', icon: Briefcase }].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveSection(id as 'company' | 'employee' | 'contract')} className={`flex items-center gap-2 px-6 py-4 rounded-xl text-xs font-black uppercase whitespace-nowrap transition-all flex-1 justify-center ${activeSection === id ? (id === 'company' ? 'bg-emerald-500 text-black' : id === 'employee' ? 'bg-blue-500 text-black' : 'bg-amber-500 text-black') : 'bg-zinc-800 border border-white/10 text-zinc-400'}`}>
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            
            {activeSection === 'company' && (
              <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-3xl space-y-5">
                <div className="flex items-center gap-3 text-emerald-400 mb-4">
                  <Building size={20} />
                  <h2 className="text-lg font-black uppercase">Entreprise</h2>
                </div>

                <div className="flex gap-4 items-start">
                  <div>
                    {data.compLogo ? (
                      <div className="relative group">
                        <img src={data.compLogo} alt="Logo" className="w-20 h-20 object-contain bg-white rounded-xl p-2" />
                        <button onClick={() => updateData('compLogo', null)} className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-emerald-500/50 transition-all">
                        <ImageIcon size={20} className="text-zinc-500" />
                        <span className="text-[10px] text-zinc-500">Logo</span>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                  <div className="flex-1">
                    <InputField label="Description (optionnel)" value={data.compDescription} onChange={(v) => updateData('compDescription', v)} multiline placeholder="Activité de l'entreprise..." />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Raison Sociale" value={data.compName} onChange={(v) => updateData('compName', v)} required icon={<Building size={12} />} />
                  <InputField label="Forme Juridique" value={data.compType} onChange={(v) => updateData('compType', v)} placeholder="SARL, SA..." icon={<ShieldCheck size={12} />} />
                </div>

                <div className="flex items-start gap-3 p-4 bg-black/20 rounded-xl">
                  <input type="checkbox" checked={data.showCapital} onChange={(e) => updateData('showCapital', e.target.checked)} className="mt-1 w-4 h-4 rounded text-emerald-500" />
                  <div className="flex-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Afficher le capital social</label>
                    {data.showCapital && (
                      <div className="mt-2">
                        <InputField label="Capital" value={data.compCapital} onChange={(v) => updateData('compCapital', v)} placeholder={`Ex: 1000000 ${config.currency}`} icon={<DollarSign size={12} />} />
                      </div>
                    )}
                  </div>
                </div>

                <InputField label="Siège Social" value={data.compAddr} onChange={(v) => updateData('compAddr', v)} required icon={<MapPin size={12} />} placeholder="Adresse complète" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="N° RCCM" value={data.compRCCM} onChange={(v) => updateData('compRCCM', v)} required icon={<FileText size={12} />} />
                  <InputField label={config.idLabel} value={data.compID} onChange={(v) => updateData('compID', v)} required icon={<Shield size={12} />} />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Représentant Légal" value={data.bossName} onChange={(v) => updateData('bossName', v)} required icon={<User size={12} />} />
                  <InputField label="Fonction" value={data.bossTitle} onChange={(v) => updateData('bossTitle', v)} icon={<Award size={12} />} placeholder="Gérant, DG..." />
                </div>
              </div>
            )}

            {activeSection === 'employee' && (
              <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-3xl space-y-5">
                <div className="flex items-center gap-3 text-blue-400 mb-4">
                  <User size={20} />
                  <h2 className="text-lg font-black uppercase">Salarié</h2>
                </div>

                <InputField label="Nom Complet" value={data.empName} onChange={(v) => updateData('empName', v)} required icon={<User size={12} />} />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Date de Naissance" type="date" value={data.empBirth} onChange={(v) => updateData('empBirth', v)} required icon={<Calendar size={12} />} />
                  <InputField label="Lieu de Naissance" value={data.empBirthPlace} onChange={(v) => updateData('empBirthPlace', v)} required icon={<MapPin size={12} />} />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Nationalité" value={data.empNation} onChange={(v) => updateData('empNation', v)} icon={<Globe size={12} />} />
                  <div className="flex items-center gap-3 p-4 bg-black/20 rounded-xl">
                    <input type="checkbox" checked={data.isForeigner} onChange={(e) => updateData('isForeigner', e.target.checked)} className="w-4 h-4 rounded text-blue-500" />
                    <label className="text-xs font-bold text-zinc-400 uppercase">Travailleur étranger</label>
                  </div>
                </div>
                
                {data.isForeigner && (
                  <InputField label="N° Permis de Travail" value={data.empWorkPermit} onChange={(v) => updateData('empWorkPermit', v)} required icon={<Shield size={12} />} />
                )}

                <InputField label="Adresse" value={data.empAddr} onChange={(v) => updateData('empAddr', v)} required icon={<MapPin size={12} />} />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="N° Pièce d'Identité" value={data.empID} onChange={(v) => updateData('empID', v)} required icon={<FileText size={12} />} />
                  <InputField label="Téléphone" value={data.empPhone} onChange={(v) => updateData('empPhone', v)} required icon={<User size={12} />} />
                </div>
                
                <InputField label="Email (optionnel)" type="email" value={data.empEmail} onChange={(v) => updateData('empEmail', v)} icon={<FileText size={12} />} />
              </div>
            )}

            {activeSection === 'contract' && (
              <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-3xl space-y-5">
                <div className="flex items-center gap-3 text-amber-400 mb-4">
                  <Briefcase size={20} />
                  <h2 className="text-lg font-black uppercase">Contrat</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 mb-2 block">Type de Contrat *</label>
                    <select value={data.jobType} onChange={(e) => updateData('jobType', e.target.value as 'CDI' | 'CDD' | 'STAGE')} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-amber-500">
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="STAGE">STAGE</option>
                    </select>
                  </div>
                  <InputField label="Poste" value={data.jobTitle} onChange={(v) => updateData('jobTitle', v)} required icon={<Briefcase size={12} />} />
                </div>

                {data.jobType === 'STAGE' && (
                  <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl space-y-4">
                    <div className="flex items-center gap-2 text-purple-400">
                      <GraduationCap size={16} />
                      <span className="text-xs font-black uppercase">Informations Stage</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField label="Établissement" value={data.stageSchool} onChange={(v) => updateData('stageSchool', v)} required icon={<Building size={12} />} />
                      <InputField label="Niveau d'études" value={data.stageLevel} onChange={(v) => updateData('stageLevel', v)} required icon={<Award size={12} />} />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Département" value={data.jobDept} onChange={(v) => updateData('jobDept', v)} required icon={<Building size={12} />} />
                  <InputField label="Lieu de Travail" value={data.jobLocation} onChange={(v) => updateData('jobLocation', v)} required icon={<MapPin size={12} />} />
                </div>

                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-400 mb-3">
                    <ClipboardList size={16} />
                    <span className="text-xs font-black uppercase">Missions et Tâches</span>
                  </div>
                  <InputField label="Description des tâches" value={data.jobTasks} onChange={(v) => updateData('jobTasks', v)} required multiline placeholder="Décrivez les missions..." />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Date de Début" type="date" value={data.startDate} onChange={(v) => updateData('startDate', v)} required icon={<Calendar size={12} />} />
                  {(data.jobType === 'CDD' || data.jobType === 'STAGE') && (
                    <InputField label="Date de Fin" type="date" value={data.endDate} onChange={(v) => updateData('endDate', v)} required icon={<Calendar size={12} />} />
                  )}
                </div>

                {data.jobType === 'CDD' && (
                  <InputField label="Motif du CDD" value={data.cddReason} onChange={(v) => updateData('cddReason', v)} required icon={<FileText size={12} />} placeholder="Remplacement, surcroît..." />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label={`${data.jobType === 'STAGE' ? 'Gratification' : 'Salaire'} (${config.currency})`} type="number" value={data.salary} onChange={(v) => updateData('salary', v)} required icon={<DollarSign size={12} />} />
                  <InputField label="Primes/Avantages" value={data.bonus} onChange={(v) => updateData('bonus', v)} icon={<Award size={12} />} placeholder="Optionnel" />
                </div>

                {data.salary && parseFloat(data.salary) > 0 && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <p className="text-xs text-emerald-400"><span className="font-bold">En lettres :</span> {salaryToWords(data.salary, config.currency)}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Heures/Semaine" type="number" value={data.hours} onChange={(v) => updateData('hours', v)} icon={<Clock size={12} />} />
                  {data.jobType === 'CDI' && (
                    <InputField label="Période d'essai (mois)" type="number" value={data.trial} onChange={(v) => updateData('trial', v)} icon={<Calendar size={12} />} />
                  )}
                </div>

                {data.jobType !== 'STAGE' && (
                  <div className="p-4 bg-black/20 rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={data.hasNonCompete} onChange={(e) => updateData('hasNonCompete', e.target.checked)} className="w-4 h-4 rounded text-amber-500" />
                      <label className="text-xs font-bold text-zinc-400 uppercase">Clause de non-concurrence</label>
                    </div>
                    {data.hasNonCompete && (
                      <InputField label="Durée" value={data.nonCompeteDuration} onChange={(v) => updateData('nonCompeteDuration', v)} required placeholder="Ex: 12 mois" icon={<Shield size={12} />} />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/10 p-6 rounded-3xl lg:sticky lg:top-4 space-y-5">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle size={20} className="text-emerald-400" />
                <h3 className="text-xl font-black italic uppercase">Actions</h3>
              </div>

              {data.documentMode === 'ELECTRONIC' && (
                <div className="space-y-3 mb-5">
                  <h4 className="text-[10px] font-black uppercase text-zinc-400">Signatures Électroniques</h4>
                  <button onClick={() => openSignatureModal('employer')} className={`w-full py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-3 transition-all ${signatures.employer ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' : 'bg-zinc-800 border border-white/10 text-zinc-400 hover:border-emerald-500/50'}`}>
                    <PenTool size={16} />
                    {signatures.employer ? 'Employeur ✓' : 'Signer (Employeur)'}
                  </button>
                  <button onClick={() => openSignatureModal('employee')} className={`w-full py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-3 transition-all ${signatures.employee ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400' : 'bg-zinc-800 border border-white/10 text-zinc-400 hover:border-blue-500/50'}`}>
                    <PenTool size={16} />
                    {signatures.employee ? 'Salarié ✓' : 'Signer (Salarié)'}
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <button onClick={generatePDF} disabled={isGenerating} className="w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 text-black rounded-xl font-black uppercase text-xs flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-500/30">
                  {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                  {isGenerating ? 'Génération...' : 'Générer PDF'}
                </button>
                
                {data.documentMode === 'PRINT' && (
                  <button onClick={generateWord} className="w-full py-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-3 transition-all">
                    <FileDown size={18} />
                    Exporter Word
                  </button>
                )}
                
                <button onClick={() => setShowPreview(true)} className="w-full py-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-3 transition-all">
                  <Eye size={18} />
                  Aperçu Rapide
                </button>
              </div>

              <div className="p-5 bg-black/40 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Scale size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Récapitulatif</span>
                </div>
                <InfoRow label="Pays" value={config.name} />
                <InfoRow label="Devise" value={config.currency} />
                <InfoRow label="Type" value={data.jobType} />
                <InfoRow label="Mode" value={data.documentMode === 'ELECTRONIC' ? 'Électronique' : 'Imprimé'} />
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className="text-amber-400 mt-0.5" />
                  <p className="text-[9px] text-amber-400/80 leading-relaxed">Les contrats ECODREUM sont immuables. Pour modifier, supprimez et recréez.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showSignatureModal && (
          <div className="fixed inset-0 bg-black/95 z-50 flex flex-col" style={{ touchAction: 'none' }}>
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-900">
              <h3 className="text-lg font-black">Signature {currentSigner === 'employer' ? 'Employeur' : 'Salarié'}</h3>
              <button onClick={() => { setShowSignatureModal(false); setCurrentSigner(null); }} className="p-2 bg-white/10 rounded-lg hover:bg-white/20">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              <p className="text-sm text-zinc-400 mb-4 text-center">Dessinez votre signature</p>
              <div className="flex-1 bg-white rounded-2xl overflow-hidden relative" style={{ touchAction: 'none', minHeight: '200px', maxHeight: '300px' }}>
                <canvas ref={signatureCanvasRef} className="absolute inset-0 w-full h-full cursor-crosshair" style={{ touchAction: 'none' }} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} onTouchCancel={stopDrawing} />
              </div>
            </div>
            <div className="p-4 border-t border-white/10 bg-zinc-900">
              <div className="flex gap-3 max-w-md mx-auto">
                <button onClick={clearSignature} className="flex-1 py-4 bg-zinc-800 border border-white/10 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                  <RotateCcw size={18} />
                  Effacer
                </button>
                <button onClick={saveSignature} className="flex-1 py-4 bg-emerald-500 text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                  <CheckCircle size={18} />
                  Valider
                </button>
              </div>
            </div>
          </div>
        )}

        {showArchives && (
          <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto">
            <div className="min-h-screen p-4 sm:p-6">
              <div className="max-w-5xl mx-auto">
                <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-black uppercase">Archives</h2>
                      <p className="text-xs text-zinc-500 mt-1">ECODREUM INTELLIGENCE L1</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={syncToGoogleDrive} className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-bold">
                        <Cloud size={14} />
                        Google Drive
                        <ExternalLink size={10} />
                      </button>
                      <button onClick={() => setShowArchives(false)} className="px-4 py-2 bg-zinc-800 text-white rounded-xl text-xs font-bold">
                        Fermer
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-sm text-white outline-none" />
                    </div>
                    <div className="flex gap-2">
                      {(['ALL', 'CDI', 'CDD', 'STAGE'] as const).map((type) => (
                        <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-3 rounded-xl text-xs font-bold ${filterType === type ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                          {type === 'ALL' ? 'Tous' : type}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl text-xs font-bold cursor-pointer mb-6">
                    <Upload size={14} />
                    Importer
                    <input type="file" accept=".json,.pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
                  </label>

                  {filteredContracts.length === 0 ? (
                    <div className="text-center py-16">
                      <Archive size={48} className="mx-auto text-zinc-700 mb-4" />
                      <p className="text-zinc-500">Aucun contrat</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredContracts.map((contract) => (
                        <div key={contract.id} className="bg-zinc-800 border border-white/10 rounded-xl p-5 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-sm truncate">{contract.employeeName}</h3>
                              <p className="text-xs text-zinc-500">{contract.jobTitle}</p>
                            </div>
                            <div className="flex flex-col gap-1 items-end">
                              <span className={`text-[10px] px-2 py-1 rounded-lg font-bold ${contract.contractType === 'CDI' ? 'bg-emerald-500/20 text-emerald-400' : contract.contractType === 'CDD' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>{contract.contractType}</span>
                              {contract.syncedToCloud && <span className="text-[10px] px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center gap-1"><Cloud size={8} />Cloud</span>}
                            </div>
                          </div>
                          <div className="text-xs text-zinc-400">
                            <p>{new Date(contract.createdAt).toLocaleDateString('fr-FR')}</p>
                            {contract.signed && <p className="text-emerald-400">✓ Signé</p>}
                          </div>
                          <div className="flex gap-2 pt-2">
                            {contract.importedFile ? (
                              <button onClick={() => downloadImportedFile(contract)} className="flex-1 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                                <Download size={12} />
                                Télécharger
                              </button>
                            ) : (
                              <>
                                <button onClick={() => viewArchivedContract(contract)} className="flex-1 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                                  <Eye size={12} />
                                  Voir
                                </button>
                                <button onClick={() => regeneratePDF(contract)} className="flex-1 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                                  <Download size={12} />
                                  PDF
                                </button>
                              </>
                            )}
                            <button onClick={() => deleteContract(contract.id)} className="p-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg">
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

        {showPreview && (
          <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto">
            <div className="p-4">
              <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-black">Aperçu Rapide</h3>
                  <button onClick={() => setShowPreview(false)} className="p-2 bg-white/10 rounded-lg">
                    <X size={20} />
                  </button>
                </div>
                <div className="bg-white text-black p-6 rounded-2xl text-sm space-y-4">
                  <h2 className="text-xl font-black text-center uppercase">{data.jobType === 'STAGE' ? 'CONVENTION DE STAGE' : 'CONTRAT DE TRAVAIL'}</h2>
                  <p className="text-center text-gray-600">{data.jobType}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Employeur</p>
                      <p className="font-bold">{data.compName || '---'}</p>
                      <p className="text-xs text-gray-600">{data.bossName || '---'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Salarié</p>
                      <p className="font-bold">{data.empName || '---'}</p>
                      <p className="text-xs text-gray-600">{data.jobTitle || '---'}</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                    <p><span className="text-gray-500">Début :</span> {data.startDate ? formatDateFR(data.startDate) : '---'}</p>
                    {data.endDate && <p><span className="text-gray-500">Fin :</span> {formatDateFR(data.endDate)}</p>}
                    <p><span className="text-gray-500">Salaire :</span> {data.salary || '0'} {config.currency}</p>
                    <p><span className="text-gray-500">Lieu :</span> {data.jobLocation || '---'}</p>
                  </div>
                  
                  {data.jobTasks && (
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Missions</p>
                      <p className="text-xs">{data.jobTasks}</p>
                    </div>
                  )}
                  
                  <p className="text-center text-xs text-gray-400 pt-4">ECODREUM INTELLIGENCE L1</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- COMPOSANTS ---
function InputField({ label, value, onChange, type = "text", placeholder = "", icon, required = false, disabled = false, multiline = false }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; icon?: React.ReactNode; required?: boolean; disabled?: boolean; multiline?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 flex items-center gap-1">
        {icon}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} rows={3} className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500 disabled:opacity-40 resize-none" />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500 disabled:opacity-40" />
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-white/5 pb-2">
      <span className="text-[9px] text-zinc-600 font-bold uppercase">{label}</span>
      <span className="text-[9px] text-emerald-400 font-bold">{value}</span>
    </div>
  );
}
