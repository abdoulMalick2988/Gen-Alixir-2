"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, Building, User, Briefcase, Download, Scale, 
  Save, CheckCircle, AlertTriangle, Globe, ShieldCheck,
  FileText, Eye, Calendar, MapPin, DollarSign, Clock,
  Award, Shield, AlertCircle, Upload, Image as ImageIcon,
  PenTool, Printer, Zap, Archive, Trash2, X, Mail,
  Filter, Search, FileDown, QrCode, GraduationCap, ClipboardList
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
  const signatureCanvasEmployer = useRef<HTMLCanvasElement>(null);
  const signatureCanvasEmployee = useRef<HTMLCanvasElement>(null);
  
  const [activeSection, setActiveSection] = useState<'company' | 'employee' | 'contract'>('company');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [currentSigner, setCurrentSigner] = useState<'employer' | 'employee' | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showArchives, setShowArchives] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [savedContracts, setSavedContracts] = useState<SavedContract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<SavedContract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'CDI' | 'CDD' | 'STAGE'>('ALL');
  const [notif, setNotif] = useState<{ m: string; t: 's' | 'e' | 'w' } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [qrCodeData, setQrCodeData] = useState('');
  
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

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = currentSigner === 'employer' ? signatureCanvasEmployer.current : signatureCanvasEmployee.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = currentSigner === 'employer' ? signatureCanvasEmployer.current : signatureCanvasEmployee.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
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

  // --- FONCTION ENVOI EMAIL CORRIGÉE - SANS EFFET DE CHARGEMENT ---
  const sendEmail = async () => {
    if (!emailRecipient.trim()) {
      showNotif("Veuillez saisir une adresse email", "e");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailRecipient)) {
      showNotif("Adresse email invalide", "e");
      return;
    }

    if (!validateForm()) {
      showNotif(`${validationErrors.length} champ(s) manquant(s)`, "e");
      return;
    }

    // Fermer immédiatement la modal
    const recipientEmail = emailRecipient;
    setShowEmailModal(false);
    setEmailRecipient('');

    try {
      // Générer l'aperçu en arrière-plan
      setShowPreview(true);
      await new Promise(resolve => setTimeout(resolve, 600));

      if (!contractRef.current) {
        throw new Error("Référence du contrat non trouvée");
      }

      const qrCode = await generateQRCode(data);
      setQrCodeData(qrCode);
      await new Promise(resolve => setTimeout(resolve, 400));

      const canvas = await html2canvas(contractRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1200,
        windowHeight: 1600
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgData = canvas.toDataURL('image/png');
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

      const pdfBase64 = pdf.output('datauristring');
      setShowPreview(false);

      // Envoyer l'email via l'API
      const response = await fetch('/api/send-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail,
          employeeName: data.empName,
          jobTitle: data.jobTitle,
          contractType: data.jobType,
          companyName: data.compName,
          pdfBase64: pdfBase64,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `Erreur serveur ${response.status}`);
      }

      showNotif(`Email envoyé avec succès à ${recipientEmail}`, "s");
      await saveContractToArchive(data, false);

    } catch (error: unknown) {
      console.error('Erreur envoi email:', error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'envoi";
      showNotif(errorMessage, "e");
      setShowPreview(false);
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
    <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white overflow-y-auto selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {notif && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${
            notif.t === 's' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 
            notif.t === 'w' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' :
            'bg-red-500/20 border-red-500/40 text-red-300'
          }`}>
            <div className="flex items-center gap-3">
              {notif.t === 's' && <CheckCircle size={18} />}
              {notif.t === 'w' && <AlertTriangle size={18} />}
              {notif.t === 'e' && <AlertCircle size={18} />}
              <span className="text-sm font-bold uppercase tracking-wide">{notif.m}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-5">
            <button onClick={() => router.back()} className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all hover:scale-105 active:scale-95">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">LEGAL ARCHITECT</h1>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Générateur de Contrats • ECODREUM v5.2.0</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowArchives(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl font-bold text-xs hover:bg-blue-500/20 transition-all">
              <Archive size={16} />
              Archives ({savedContracts.length})
            </button>
          </div>
        </div>

        <div className="mb-8 bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase mb-2 text-emerald-400">Mode de Document</h3>
              <p className="text-xs text-zinc-500">Choisissez le type de contrat à générer</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => updateData('documentMode', 'ELECTRONIC')} className={`flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-xs transition-all ${data.documentMode === 'ELECTRONIC' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30' : 'bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white'}`}>
                <Zap size={18} />
                <div className="text-left">
                  <div className="uppercase tracking-wider">Électronique</div>
                  <div className="text-[9px] opacity-70">Signature numérique</div>
                </div>
              </button>
              <button onClick={() => updateData('documentMode', 'PRINT')} className={`flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-xs transition-all ${data.documentMode === 'PRINT' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30' : 'bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white'}`}>
                <Printer size={18} />
                <div className="text-left">
                  <div className="uppercase tracking-wider">À Imprimer</div>
                  <div className="text-[9px] opacity-70">Signature manuelle</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8 bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 block">
            <Globe size={12} className="inline mr-2" />
            Juridiction Applicable
          </label>
          <div className="flex gap-3">
            {(['SENEGAL', 'BURUNDI'] as const).map((c) => (
              <button key={c} onClick={() => updateData('country', c)} className={`flex-1 px-8 py-4 rounded-xl text-sm font-black transition-all ${data.country === c ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-black shadow-lg shadow-emerald-500/30' : 'bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8 bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Progression du formulaire</span>
            <span className="text-sm font-black text-emerald-400">{getProgress()}%</span>
          </div>
          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 transition-all duration-500" style={{ width: `${getProgress()}%` }} />
          </div>
        </div>

        {validationErrors.length > 0 && (
          <div className="mb-8 bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-red-400 mb-3">
              <AlertCircle size={18} />
              <h3 className="text-sm font-black uppercase">Champs manquants</h3>
            </div>
            <ul className="space-y-1">
              {validationErrors.map((error, i) => (
                <li key={i} className="text-xs text-red-400/80 pl-4">• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'company', label: 'Entreprise', icon: Building, color: 'emerald' },
            { id: 'employee', label: 'Salarié', icon: User, color: 'blue' },
            { id: 'contract', label: 'Contrat', icon: Briefcase, color: 'amber' }
          ].map(({ id, label, icon: Icon, color }) => (
            <button key={id} onClick={() => setActiveSection(id as 'company' | 'employee' | 'contract')} className={`flex items-center gap-2 px-8 py-4 rounded-xl text-xs font-black uppercase whitespace-nowrap transition-all ${activeSection === id ? `bg-${color}-500 text-black shadow-lg shadow-${color}-500/30` : 'bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20'}`}>
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-40">
          <div className="lg:col-span-8 space-y-6">
            
            {activeSection === 'company' && (
              <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-3xl space-y-6">
                <div className="flex items-center gap-3 text-emerald-400 mb-6">
                  <Building size={22} />
                  <h2 className="text-lg font-black uppercase tracking-wider">Structure Employeuse</h2>
                </div>

                <div className="bg-black/30 border border-white/5 rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-black uppercase text-zinc-400 mb-4">Identité Visuelle (Optionnel)</h3>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block">
                        <ImageIcon size={12} className="inline mr-1" />
                        Logo de l&#39;entreprise
                      </label>
                      <div className="relative">
                        {data.compLogo ? (
                          <div className="relative group">
                            <img src={data.compLogo} alt="Logo" className="w-32 h-32 object-contain bg-white rounded-xl p-2" />
                            <button onClick={() => updateData('compLogo', null)} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all">
                            <Upload size={24} className="text-zinc-500 mb-2" />
                            <span className="text-xs text-zinc-500">Charger</span>
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Raison Sociale" value={data.compName} onChange={(v) => updateData('compName', v)} icon={<Building size={14} />} required />
                  <InputField label="Forme Juridique" value={data.compType} onChange={(v) => updateData('compType', v)} placeholder="SARL, SA, SAS..." icon={<ShieldCheck size={14} />} required />
                </div>

                <div className="flex items-start gap-4 p-4 bg-black/20 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mt-1">
                    <input type="checkbox" checked={data.showCapital} onChange={(e) => updateData('showCapital', e.target.checked)} className="w-4 h-4 rounded border-white/20 bg-black/40 text-emerald-500 focus:ring-emerald-500" />
                    <label className="text-xs font-bold text-zinc-400 uppercase whitespace-nowrap">Mentionner le capital</label>
                  </div>
                  <InputField label="Capital Social" value={data.compCapital} onChange={(v) => updateData('compCapital', v)} disabled={!data.showCapital} placeholder={`Ex: 1 000 000 ${config.currency}`} icon={<DollarSign size={14} />} />
                </div>

                <InputField label="Siège Social" value={data.compAddr} onChange={(v) => updateData('compAddr', v)} placeholder="Adresse complète" icon={<MapPin size={14} />} required />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Numéro RCCM" value={data.compRCCM} onChange={(v) => updateData('compRCCM', v)} placeholder="Ex: BJ/BGM/2024/A/123" icon={<FileText size={14} />} required />
                  <InputField label={config.idLabel} value={data.compID} onChange={(v) => updateData('compID', v)} placeholder={`Numéro ${config.idLabel}`} icon={<Shield size={14} />} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Représentant Légal" value={data.bossName} onChange={(v) => updateData('bossName', v)} placeholder="Nom complet" icon={<User size={14} />} required />
                  <InputField label="Fonction" value={data.bossTitle} onChange={(v) => updateData('bossTitle', v)} placeholder="Gérant, DG..." icon={<Award size={14} />} required />
                </div>
              </div>
            )}

            {activeSection === 'employee' && (
              <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-3xl space-y-6">
                <div className="flex items-center gap-3 text-blue-400 mb-6">
                  <User size={22} />
                  <h2 className="text-lg font-black uppercase tracking-wider">Informations Salarié</h2>
                </div>

                <InputField label="Nom Complet" value={data.empName} onChange={(v) => updateData('empName', v)} placeholder="Prénom et nom" icon={<User size={14} />} required />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Date de Naissance" type="date" value={data.empBirth} onChange={(v) => updateData('empBirth', v)} icon={<Calendar size={14} />} required />
                  <InputField label="Lieu de Naissance" value={data.empBirthPlace} onChange={(v) => updateData('empBirthPlace', v)} placeholder="Ville, Pays" icon={<MapPin size={14} />} required />
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Nationalité" value={data.empNation} onChange={(v) => updateData('empNation', v)} placeholder="Ex: Burundaise" icon={<Globe size={14} />} required />
                    <div className="flex items-center gap-3 p-4 bg-black/20 rounded-xl border border-white/5">
                      <input type="checkbox" checked={data.isForeigner} onChange={(e) => updateData('isForeigner', e.target.checked)} className="w-4 h-4 rounded border-white/20 bg-black/40 text-blue-500 focus:ring-blue-500" />
                      <label className="text-xs font-bold text-zinc-400 uppercase">Travailleur étranger</label>
                    </div>
                  </div>
                  {data.isForeigner && (
                    <InputField label="Numéro Permis de Travail" value={data.empWorkPermit} onChange={(v) => updateData('empWorkPermit', v)} placeholder="N° du permis de travail" icon={<Shield size={14} />} required />
                  )}
                </div>

                <InputField label="Adresse de Résidence" value={data.empAddr} onChange={(v) => updateData('empAddr', v)} placeholder="Adresse complète" icon={<MapPin size={14} />} required />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="N° Pièce d&#39;Identité" value={data.empID} onChange={(v) => updateData('empID', v)} placeholder="CNI, Passeport..." icon={<FileText size={14} />} required />
                  <InputField label="Téléphone" type="tel" value={data.empPhone} onChange={(v) => updateData('empPhone', v)} placeholder="+257 XX XXX XXX" icon={<User size={14} />} required />
                </div>

                <InputField label="Email" type="email" value={data.empEmail} onChange={(v) => updateData('empEmail', v)} placeholder="exemple@email.com" icon={<Mail size={14} />} />
              </div>
            )}

            {activeSection === 'contract' && (
              <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-3xl space-y-6">
                <div className="flex items-center gap-3 text-amber-400 mb-6">
                  <Briefcase size={22} />
                  <h2 className="text-lg font-black uppercase tracking-wider">Conditions de Travail</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 tracking-wider">Type de Contrat *</label>
                    <select value={data.jobType} onChange={(e) => updateData('jobType', e.target.value as 'CDI' | 'CDD' | 'STAGE')} className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-amber-500 focus:bg-amber-500/5 transition-all appearance-none cursor-pointer">
                      <option value="CDI">CDI - Contrat à Durée Indéterminée</option>
                      <option value="CDD">CDD - Contrat à Durée Déterminée</option>
                      <option value="STAGE">STAGE - Convention de Stage</option>
                    </select>
                  </div>
                  <InputField label="Poste Occupé" value={data.jobTitle} onChange={(v) => updateData('jobTitle', v)} placeholder="Ex: Développeur Senior" icon={<Briefcase size={14} />} required />
                </div>

                {data.jobType === 'STAGE' && (
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2 text-purple-400 mb-3">
                      <GraduationCap size={18} />
                      <h3 className="text-sm font-black uppercase">Informations Stage</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Établissement" value={data.stageSchool} onChange={(v) => updateData('stageSchool', v)} placeholder="Nom de l'université/école" icon={<Building size={14} />} required />
                      <InputField label="Niveau d&#39;Études" value={data.stageLevel} onChange={(v) => updateData('stageLevel', v)} placeholder="Ex: Licence 3, Master 2..." icon={<Award size={14} />} required />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Département" value={data.jobDept} onChange={(v) => updateData('jobDept', v)} placeholder="Ex: Technique, RH..." icon={<Building size={14} />} required />
                  <InputField label="Lieu de Travail" value={data.jobLocation} onChange={(v) => updateData('jobLocation', v)} placeholder="Adresse du lieu de travail" icon={<MapPin size={14} />} required />
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-2 text-amber-400 mb-3">
                    <ClipboardList size={18} />
                    <h3 className="text-sm font-black uppercase">Description du Poste</h3>
                  </div>
                  <InputField 
                    label="Tâches Confiées" 
                    value={data.jobTasks} 
                    onChange={(v) => updateData('jobTasks', v)} 
                    placeholder="Décrivez en détail les missions et responsabilités du poste..."
                    icon={<ClipboardList size={14} />} 
                    required 
                    multiline 
                  />
                  <p className="text-[10px] text-amber-400/60 mt-2">Soyez le plus précis possible. Ce champ apparaîtra dans le contrat.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Date de Début" type="date" value={data.startDate} onChange={(v) => updateData('startDate', v)} icon={<Calendar size={14} />} required />
                  {(data.jobType === 'CDD' || data.jobType === 'STAGE') && (
                    <InputField label={`Date de Fin (${data.jobType})`} type="date" value={data.endDate} onChange={(v) => updateData('endDate', v)} icon={<Calendar size={14} />} required />
                  )}
                </div>

                {data.jobType === 'CDD' && (
                  <div className="space-y-4">
                    <InputField label="Motif du CDD" value={data.cddReason} onChange={(v) => updateData('cddReason', v)} placeholder="Ex: Remplacement, Accroissement temporaire..." icon={<FileText size={14} />} required />
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                      <p className="text-xs text-blue-400">
                        <Clock size={12} className="inline mr-2" />
                        <strong>Période d&#39;essai CDD :</strong> 3 mois (conformément au Code du Travail)
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label={`${data.jobType === 'STAGE' ? 'Gratification' : 'Salaire'} Mensuel${data.jobType === 'STAGE' ? '' : ' Brut'} (${config.currency})`} type="number" value={data.salary} onChange={(v) => updateData('salary', v)} placeholder="0" icon={<DollarSign size={14} />} required />
                  <InputField label="Primes et Avantages" value={data.bonus} onChange={(v) => updateData('bonus', v)} placeholder="Optionnel - Ex: Prime de transport..." icon={<Award size={14} />} />
                </div>

                {data.salary && parseFloat(data.salary) > 0 && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <div className="text-xs font-bold text-emerald-400 mb-1">En lettres:</div>
                    <div className="text-sm text-emerald-300 capitalize">{salaryToWords(data.salary, config.currency)}</div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Heures Hebdomadaires" type="number" value={data.hours} onChange={(v) => updateData('hours', v)} placeholder="40" icon={<Clock size={14} />} required />
                  {data.jobType === 'CDI' && (
                    <InputField label="Période d&#39;Essai (mois)" type="number" value={data.trial} onChange={(v) => updateData('trial', v)} placeholder="3" icon={<Calendar size={14} />} required />
                  )}
                </div>

                {data.jobType !== 'STAGE' && (
                  <div className="space-y-4 p-6 bg-black/20 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={data.hasNonCompete} onChange={(e) => updateData('hasNonCompete', e.target.checked)} className="w-4 h-4 rounded border-white/20 bg-black/40 text-amber-500 focus:ring-amber-500" />
                      <label className="text-xs font-bold text-zinc-400 uppercase">Inclure une clause de non-concurrence</label>
                    </div>
                    {data.hasNonCompete && (
                      <InputField label="Durée de Non-Concurrence" value={data.nonCompeteDuration} onChange={(v) => updateData('nonCompeteDuration', v)} placeholder="Ex: 12 mois, 2 ans..." icon={<Shield size={14} />} required />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/10 p-8 rounded-3xl sticky top-8 space-y-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle size={22} className="text-emerald-400" />
                <h3 className="text-xl font-black italic uppercase">Actions</h3>
              </div>

              {data.documentMode === 'ELECTRONIC' && (
                <div className="space-y-3 mb-6">
                  <h4 className="text-xs font-black uppercase text-zinc-400 mb-3">Signatures Électroniques</h4>
                  <button onClick={() => openSignatureModal('employer')} className={`w-full py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-3 transition-all ${signatures.employer ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' : 'bg-zinc-800 border border-white/10 text-zinc-400 hover:border-emerald-500/50'}`}>
                    <PenTool size={16} />
                    {signatures.employer ? 'Signature Employeur ✓' : 'Signer (Employeur)'}
                  </button>
                  <button onClick={() => openSignatureModal('employee')} className={`w-full py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-3 transition-all ${signatures.employee ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400' : 'bg-zinc-800 border border-white/10 text-zinc-400 hover:border-blue-500/50'}`}>
                    <PenTool size={16} />
                    {signatures.employee ? 'Signature Salarié ✓' : 'Signer (Salarié)'}
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <button onClick={generatePDF} disabled={isGenerating} className="w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-black rounded-xl font-black uppercase text-xs flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-emerald-500/30">
                  {isGenerating ? <span className="animate-spin">⏳</span> : <Download size={20} />}
                  Générer PDF
                </button>
                <button onClick={generateWord} className="w-full py-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-3 transition-all">
                  <FileDown size={18} />
                  Exporter Word
                </button>
                <button onClick={() => setShowPreview(!showPreview)} className="w-full py-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-3 transition-all">
                  <Eye size={18} />
                  {showPreview ? 'Masquer' : 'Aperçu'}
                </button>
                <button onClick={() => { setEmailRecipient(data.empEmail || ''); setShowEmailModal(true); }} className="w-full py-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-3 transition-all">
                  <Mail size={18} />
                  Envoyer par Email
                </button>
              </div>

              <div className="mt-8 p-6 bg-black/40 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-zinc-500 mb-3">
                  <Scale size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Récapitulatif</span>
                </div>
                <div className="space-y-3">
                  <InfoRow label="Pays" value={config.name} />
                  <InfoRow label="Juridiction" value={config.court} />
                  <InfoRow label="Devise" value={config.currency} />
                  <InfoRow label="Type contrat" value={data.jobType} />
                  <InfoRow label="Période d'essai" value={data.jobType === 'STAGE' ? 'N/A' : `${data.jobType === 'CDD' ? '3' : data.trial} mois`} />
                  <InfoRow label="Mode" value={data.documentMode === 'ELECTRONIC' ? 'Électronique' : 'Imprimé'} />
                </div>
              </div>

              {qrCodeData && (
                <div className="p-4 bg-black/40 rounded-xl border border-white/5 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase">
                    <QrCode size={14} />
                    Code de Vérification
                  </div>
                  <img src={qrCodeData} alt="QR Code" className="w-32 h-32 bg-white p-2 rounded-lg" />
                </div>
              )}

              <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[9px] text-amber-400/80 leading-relaxed">Ce document est généré automatiquement et ne se substitue pas à un conseil juridique personnalisé.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL SIGNATURE */}
        {showSignatureModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-2xl w-full">
              <h3 className="text-2xl font-black mb-6">Signature {currentSigner === 'employer' ? 'Employeur' : 'Salarié'}</h3>
              <div className="bg-white rounded-xl p-4 mb-6">
                <canvas ref={currentSigner === 'employer' ? signatureCanvasEmployer : signatureCanvasEmployee} width={600} height={300} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} className="border-2 border-dashed border-zinc-300 rounded-lg cursor-crosshair w-full" />
              </div>
              <div className="flex gap-3">
                <button onClick={clearSignature} className="flex-1 py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-bold hover:bg-red-500/30 transition-all">Effacer</button>
                <button onClick={() => { setShowSignatureModal(false); setCurrentSigner(null); }} className="flex-1 py-3 bg-zinc-800 border border-white/10 text-white rounded-xl font-bold hover:bg-zinc-700 transition-all">Annuler</button>
                <button onClick={saveSignature} className="flex-1 py-3 bg-emerald-500 text-black rounded-xl font-bold hover:bg-emerald-400 transition-all">Enregistrer</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL EMAIL - SIMPLIFIÉE */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                <Mail size={24} className="text-amber-400" />
                Envoi par Email
              </h3>
              <InputField 
                label="Email destinataire" 
                type="email" 
                value={emailRecipient} 
                onChange={setEmailRecipient} 
                placeholder="exemple@email.com" 
                icon={<Mail size={14} />} 
              />
              <p className="text-[10px] text-zinc-500 mt-2 mb-4">Le contrat PDF sera généré et envoyé en pièce jointe.</p>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => { setShowEmailModal(false); setEmailRecipient(''); }} 
                  className="flex-1 py-3 bg-zinc-800 border border-white/10 text-white rounded-xl font-bold hover:bg-zinc-700 transition-all"
                >
                  Annuler
                </button>
                <button 
                  onClick={sendEmail} 
                  disabled={!emailRecipient.trim()}
                  className="flex-1 py-3 bg-amber-500 text-black rounded-xl font-bold hover:bg-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Mail size={16} />
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ARCHIVES */}
        {showArchives && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto p-8">
            <div className="max-w-6xl mx-auto">
              <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black uppercase">Archives Locales</h2>
                  <button onClick={() => setShowArchives(false)} className="px-6 py-3 bg-zinc-800 text-white rounded-xl font-bold hover:bg-zinc-700 transition-all">Fermer</button>
                </div>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input type="text" placeholder="Rechercher par nom ou poste..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-emerald-500 transition-all" />
                  </div>
                  <div className="flex gap-2">
                    {(['ALL', 'CDI', 'CDD', 'STAGE'] as const).map((type) => (
                      <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-3 rounded-xl text-xs font-bold transition-all ${filterType === type ? 'bg-emerald-500 text-black' : 'bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white'}`}>
                        {type === 'ALL' ? 'TOUS' : type}
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 px-4 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl font-bold text-xs cursor-pointer hover:bg-blue-500/20 transition-all">
                    <Upload size={16} />
                    Importer
                    <input 
                      type="file" 
                      accept=".json,.pdf,.doc,.docx,application/json,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>
                
                <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-xs text-blue-400">
                    <FileText size={12} className="inline mr-2" />
                    Formats acceptés : PDF, Word (.doc, .docx), JSON
                  </p>
                </div>

                {filteredContracts.length === 0 ? (
                  <div className="text-center py-20">
                    <Archive size={64} className="mx-auto text-zinc-700 mb-4" />
                    <p className="text-zinc-500">{searchTerm || filterType !== 'ALL' ? 'Aucun résultat' : 'Aucun contrat archivé'}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredContracts.map((contract) => (
                      <div key={contract.id} className="bg-zinc-800 border border-white/10 rounded-xl p-6 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-sm">{contract.employeeName}</h3>
                            <p className="text-xs text-zinc-500">{contract.jobTitle}</p>
                          </div>
                          <div className="flex flex-col gap-1 items-end">
                            <span className={`text-[10px] px-2 py-1 rounded-lg font-bold ${contract.contractType === 'CDI' ? 'bg-emerald-500/20 text-emerald-400' : contract.contractType === 'CDD' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>{contract.contractType}</span>
                            <span className={`text-[10px] px-2 py-1 rounded-lg font-bold ${contract.mode === 'ELECTRONIC' ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-700 text-zinc-400'}`}>{contract.mode === 'ELECTRONIC' ? 'E-Sign' : 'Print'}</span>
                            {contract.importedFile && (
                              <span className="text-[10px] px-2 py-1 rounded-lg font-bold bg-cyan-500/20 text-cyan-400">
                                {contract.importedFile.name.endsWith('.pdf') ? 'PDF' : 'Word'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-zinc-400 space-y-1">
                          <div>Date: {new Date(contract.createdAt).toLocaleDateString('fr-FR')}</div>
                          {contract.signed && <div className="text-emerald-400 font-bold">✓ Signé</div>}
                          {contract.importedFile && (
                            <div className="text-cyan-400">📎 {contract.importedFile.name}</div>
                          )}
                        </div>
                        <div className="flex gap-2 pt-3">
                          {contract.importedFile ? (
                            <button 
                              onClick={() => downloadImportedFile(contract)} 
                              className="flex-1 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-2"
                            >
                              <Download size={14} />
                              Télécharger
                            </button>
                          ) : (
                            <button 
                              onClick={() => loadContract(contract)} 
                              className="flex-1 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500/30 transition-all"
                            >
                              Charger
                            </button>
                          )}
                          <button 
                            onClick={() => deleteContract(contract.id)} 
                            className="p-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                          >
                            <Trash2 size={14} />
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
          <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-40 overflow-y-auto">
            <button onClick={() => setShowPreview(false)} className="fixed top-8 left-8 z-50 flex items-center gap-3 px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white rounded-2xl font-bold transition-all hover:scale-105 active:scale-95">
              <ArrowLeft size={20} />
              Retour
            </button>
            <div className="min-h-screen flex items-center justify-center p-8 pt-24">
              <div ref={contractRef} className="bg-white text-black w-[210mm] min-h-[297mm] p-16 shadow-2xl">
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
    <div className="space-y-6 font-serif" style={{ fontFamily: 'Georgia, serif', lineHeight: '1.8' }}>
      {data.compLogo && (
        <div className="flex items-start justify-between mb-12">
          <div className="w-24 h-24">
            <img src={data.compLogo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          {data.compDescription && (
            <div className="text-right">
              <div className="font-bold text-lg">{data.compName}</div>
              <div className="text-xs text-gray-600 mt-1">{data.compDescription}</div>
            </div>
          )}
        </div>
      )}

      <div className="text-center mb-12">
        <h1 className="text-3xl font-black uppercase tracking-wider mb-2">{data.jobType === 'STAGE' ? 'CONVENTION DE STAGE' : 'CONTRAT DE TRAVAIL'}</h1>
        <p className="text-lg font-bold text-gray-700">RÉGIME : {data.jobType === 'CDI' ? 'CONTRAT À DURÉE INDÉTERMINÉE' : data.jobType === 'CDD' ? 'CONTRAT À DURÉE DÉTERMINÉE' : 'CONVENTION DE STAGE'}</p>
        <p className="text-sm text-gray-500 mt-2 italic">{config.lawReference}</p>
      </div>

      <div className="space-y-6 text-sm">
        <p className="font-bold text-lg mb-4">ENTRE LES SOUSSIGNÉS :</p>
        
        <p className="leading-relaxed">
          La société <strong>{data.compName}</strong>, {data.compType}{capitalClause}, dont le siège social est situé à <strong>{data.compAddr}</strong>, immatriculée au Registre de Commerce et du Crédit Mobilier (RCCM) sous le numéro <strong>{data.compRCCM}</strong> et identifiée au {config.idLabel} sous le numéro <strong>{data.compID}</strong>, représentée aux présentes par <strong>M./Mme {data.bossName}</strong>, agissant en sa qualité de <strong>{data.bossTitle}</strong>, dûment habilité(e) à l&#39;effet des présentes.
        </p>
        <p className="italic text-right">Ci-après dénommée « <strong>{data.jobType === 'STAGE' ? "L'ENTREPRISE D'ACCUEIL" : "L'EMPLOYEUR"}</strong> »</p>
        
        <p className="text-center font-bold my-4">D&#39;UNE PART,</p>
        
        <p className="text-center font-bold">ET :</p>
        
        <p className="leading-relaxed">
          <strong>M./Mme {data.empName}</strong>, né(e) le <strong>{data.empBirth ? new Date(data.empBirth).toLocaleDateString('fr-FR') : '___'}</strong> à <strong>{data.empBirthPlace}</strong>, de nationalité <strong>{data.empNation}</strong>{foreignerClause}, titulaire de la pièce d&#39;identité nationale n°<strong>{data.empID}</strong>, demeurant à <strong>{data.empAddr}</strong>, joignable au <strong>{data.empPhone}</strong>{data.empEmail && ` et par courrier électronique à l'adresse ${data.empEmail}`}.
          {data.jobType === 'STAGE' && data.stageSchool && (
            <> Actuellement inscrit(e) en <strong>{data.stageLevel}</strong> au sein de l&#39;établissement <strong>{data.stageSchool}</strong>.</>
          )}
        </p>
        <p className="italic text-right">Ci-après dénommé(e) « <strong>{data.jobType === 'STAGE' ? 'LE/LA STAGIAIRE' : 'LE/LA SALARIÉ(E)'}</strong> »</p>
        
        <p className="text-center font-bold my-4">D&#39;AUTRE PART,</p>

        <p className="text-center text-xs text-gray-500 mb-6">{data.jobType === 'STAGE' ? "L'Entreprise d'Accueil et le/la Stagiaire" : "L'Employeur et le/la Salarié(e)"} étant ci-après désignés ensemble « les Parties » et individuellement « une Partie ».</p>

        <div className="border-t-2 border-gray-300 pt-6">
          <p className="font-bold text-lg mb-4">{config.articles.intro}</p>
          <p className="font-bold text-lg mb-6">IL A ÉTÉ ARRÊTÉ ET CONVENU CE QUI SUIT :</p>
        </div>

        <Article title="ARTICLE 1 : OBJET ET ENGAGEMENT">
          <p>
            {data.jobType === 'STAGE' ? (
              <>La présente convention a pour objet de définir les conditions dans lesquelles <strong>{data.empName}</strong> effectuera un stage au sein de {data.compName}, dans le cadre de sa formation en <strong>{data.stageLevel}</strong> à <strong>{data.stageSchool}</strong>. Ce stage s&#39;inscrit dans le cursus pédagogique du/de la Stagiaire et n&#39;a pas pour objet de pourvoir un poste de travail permanent.</>
            ) : (
              <>{config.articles.engagement} Par le présent contrat, l&#39;Employeur engage <strong>{data.empName}</strong> qui accepte, en qualité de <strong>{data.jobTitle}</strong>. Le présent contrat est conclu sous le régime du {data.jobType === 'CDI' ? 'contrat à durée indéterminée' : 'contrat à durée déterminée'}{data.jobType === 'CDD' && data.cddReason ? ` pour le motif suivant : ${data.cddReason}` : ''}.</>
            )}
          </p>
        </Article>

        <Article title="ARTICLE 2 : FONCTIONS ET TÂCHES">
          <p>
            {data.jobType === 'STAGE' ? 'Le/La Stagiaire' : 'Le/La Salarié(e)'} est {data.jobType === 'STAGE' ? 'accueilli(e)' : 'engagé(e)'} pour exercer les fonctions de <strong>{data.jobTitle}</strong> au sein du département <strong>{data.jobDept}</strong>.
          </p>
          <p className="mt-3">
            <strong>Lieu d&#39;exécution :</strong> {data.jobType === 'STAGE' ? 'Le/La Stagiaire' : 'Le/La Salarié(e)'} exercera ses fonctions principalement au sein des locaux situés à <strong>{data.jobLocation}</strong>. Toutefois, {data.jobType === 'STAGE' ? 'il/elle' : 'le/la Salarié(e)'} pourra être amené(e) à effectuer des déplacements professionnels selon les nécessités du service.
          </p>
          {data.jobTasks && (
            <div className="mt-4 p-4 bg-gray-50 border-l-4 border-gray-400">
              <p className="font-bold mb-2">Tâches et missions confiées :</p>
              <p className="whitespace-pre-wrap">{data.jobTasks}</p>
            </div>
          )}
          <p className="mt-3 text-sm text-gray-600">
            Cette liste de tâches n&#39;est pas exhaustive et pourra être modifiée en fonction des besoins de l&#39;entreprise, dans le respect des qualifications du/de la {data.jobType === 'STAGE' ? 'Stagiaire' : 'Salarié(e)'}.
          </p>
        </Article>

        <Article title="ARTICLE 3 : DURÉE DU CONTRAT ET PÉRIODE D'ESSAI">
          <p>
            <strong>3.1. Prise d&#39;effet :</strong> Le présent {data.jobType === 'STAGE' ? 'stage' : 'contrat'} prend effet à compter du <strong>{data.startDate ? new Date(data.startDate).toLocaleDateString('fr-FR') : '___'}</strong>{endDateClause}.
          </p>
          
          {data.jobType === 'CDI' && (
            <p className="mt-3">
              <strong>3.2. Durée :</strong> Le présent contrat est conclu pour une durée indéterminée.
            </p>
          )}
          
          {data.jobType === 'CDD' && (
            <p className="mt-3">
              <strong>3.2. Durée :</strong> Le présent contrat est conclu pour une durée déterminée de {data.startDate && data.endDate ? Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)) : '___'} mois, du {data.startDate ? new Date(data.startDate).toLocaleDateString('fr-FR') : '___'} au {data.endDate ? new Date(data.endDate).toLocaleDateString('fr-FR') : '___'}.
            </p>
          )}
          
          {data.jobType === 'STAGE' && (
            <p className="mt-3">
              <strong>3.2. Durée du stage :</strong> Le stage a une durée de {data.startDate && data.endDate ? Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)) : '___'} mois.
            </p>
          )}
          
          {trialPeriod && (
            <p className="mt-3">
              <strong>3.3. Période d&#39;essai :</strong> Le présent contrat est soumis à une période d&#39;essai de <strong>{trialPeriod} mois</strong>, pendant laquelle chacune des Parties pourra rompre librement le contrat sans indemnité, sous réserve du respect d&#39;un délai de préavis conformément aux dispositions légales en vigueur. Cette période d&#39;essai court à compter de la date d&#39;entrée en fonction effective du/de la Salarié(e).
            </p>
          )}
        </Article>

        <Article title={`ARTICLE 4 : ${data.jobType === 'STAGE' ? 'GRATIFICATION' : 'RÉMUNÉRATION'}`}>
          <p>
            <strong>4.1. {data.jobType === 'STAGE' ? 'Gratification mensuelle' : 'Salaire de base'} :</strong> En contrepartie de {data.jobType === 'STAGE' ? 'son stage' : 'son travail'}, {data.jobType === 'STAGE' ? 'le/la Stagiaire' : 'le/la Salarié(e)'} percevra une {data.jobType === 'STAGE' ? 'gratification' : 'rémunération'} mensuelle {data.jobType === 'STAGE' ? '' : 'brute '}de <strong>{data.salary} {config.currency}</strong> ({salaryToWords(data.salary, config.currency)}).
          </p>
          
          <p className="mt-3">
            <strong>4.2. Modalités de paiement :</strong> Cette {data.jobType === 'STAGE' ? 'gratification' : 'rémunération'} sera versée mensuellement, au plus tard le 5 du mois suivant, par virement bancaire sur le compte désigné par {data.jobType === 'STAGE' ? 'le/la Stagiaire' : 'le/la Salarié(e)'}{data.jobType !== 'STAGE' && ', après déduction des cotisations sociales et fiscales prévues par la législation en vigueur'}.
          </p>
          
          {data.bonus && (
            <p className="mt-3">
              <strong>4.3. Avantages complémentaires :</strong> En sus de {data.jobType === 'STAGE' ? 'la gratification' : 'la rémunération'} de base, {data.jobType === 'STAGE' ? 'le/la Stagiaire' : 'le/la Salarié(e)'} bénéficiera des avantages suivants : {data.bonus}.
            </p>
          )}
        </Article>

        <Article title="ARTICLE 5 : DURÉE ET HORAIRES DE TRAVAIL">
          <p>
            {config.articles.workDuration} La durée hebdomadaire de travail est fixée à <strong>{data.hours} heures</strong>, réparties selon les horaires en vigueur au sein de l&#39;entreprise.
          </p>
          <p className="mt-3">
            {data.jobType === 'STAGE' ? 'Le/La Stagiaire' : 'Le/La Salarié(e)'} s&#39;engage à respecter les horaires de travail qui lui seront communiqués et à se conformer aux règles de pointage en vigueur dans l&#39;entreprise.
          </p>
        </Article>

        <Article title="ARTICLE 6 : OBLIGATIONS DES PARTIES">
          <p className="font-bold mb-3">6.1. Obligations de l&#39;Employeur :</p>
          <p className="mb-2">{data.jobType === 'STAGE' ? "L'Entreprise d'Accueil" : "L'Employeur"} s&#39;engage à :</p>
          <ul className="list-none space-y-2 ml-4">
            {config.articles.employerObligations.map((obligation, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span>{obligation}</span>
              </li>
            ))}
          </ul>
          
          <p className="font-bold mb-3 mt-6">6.2. Obligations du/de la {data.jobType === 'STAGE' ? 'Stagiaire' : 'Salarié(e)'} :</p>
          <p className="mb-2">{data.jobType === 'STAGE' ? 'Le/La Stagiaire' : 'Le/La Salarié(e)'} s&#39;engage à :</p>
          <ul className="list-none space-y-2 ml-4">
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
            {data.jobType === 'STAGE' ? 'Le/La Stagiaire' : 'Le/La Salarié(e)'} s&#39;engage à observer la plus stricte discrétion sur l&#39;ensemble des informations, documents, méthodes, procédés, savoir-faire et données dont il/elle pourrait avoir connaissance dans le cadre de ses fonctions. Cette obligation de confidentialité s&#39;applique pendant toute la durée du {data.jobType === 'STAGE' ? 'stage' : 'contrat'} et se prolongera après sa cessation, quelle qu&#39;en soit la cause.
          </p>
        </Article>

        {data.hasNonCompete && data.jobType !== 'STAGE' && (
          <Article title="ARTICLE 8 : CLAUSE DE NON-CONCURRENCE">
            <p>
              À l&#39;issue du présent contrat, quelle que soit la cause de sa rupture, le/la Salarié(e) s&#39;interdit d&#39;exercer, directement ou indirectement, toute activité concurrente à celle de l&#39;Employeur, pendant une durée de <strong>{data.nonCompeteDuration}</strong>, sur le territoire du {config.name}.
            </p>
            <p className="mt-3">
              En contrepartie de cette obligation, l&#39;Employeur versera au/à la Salarié(e) une indemnité compensatrice dont les modalités seront définies conformément à la législation en vigueur.
            </p>
          </Article>
        )}

        <Article title={`ARTICLE ${data.hasNonCompete && data.jobType !== 'STAGE' ? '9' : '8'} : RÉSILIATION DU ${data.jobType === 'STAGE' ? 'STAGE' : 'CONTRAT'}`}>
          <p>
            {config.articles.termination}
          </p>
          {data.jobType === 'CDI' && (
            <p className="mt-3">
              Le présent contrat pourra être résilié par l&#39;une ou l&#39;autre des Parties, sous réserve du respect des dispositions légales relatives au préavis et aux indemnités de rupture.
            </p>
          )}
          {data.jobType === 'CDD' && (
            <p className="mt-3">
              Le présent contrat prendra fin de plein droit à son terme. Toute rupture anticipée ne pourra intervenir que dans les cas prévus par la loi (faute grave, force majeure, accord des parties, embauche en CDI).
            </p>
          )}
          {data.jobType === 'STAGE' && (
            <p className="mt-3">
              La présente convention pourra être résiliée de manière anticipée par l&#39;une des parties, sous réserve d&#39;un préavis raisonnable et d&#39;une notification écrite précisant les motifs de la rupture.
            </p>
          )}
        </Article>

        <Article title={`ARTICLE ${data.hasNonCompete && data.jobType !== 'STAGE' ? '10' : '9'} : DIFFÉRENDS ET LITIGES`}>
          <p>{config.articles.disputes}</p>
        </Article>

        <Article title={`ARTICLE ${data.hasNonCompete && data.jobType !== 'STAGE' ? '11' : '10'} : DISPOSITIONS FINALES`}>
          <p>
            Le présent {data.jobType === 'STAGE' ? 'convention' : 'contrat'} est établi en deux (2) exemplaires originaux, un pour chaque Partie. Chaque Partie reconnaît avoir reçu un exemplaire du présent {data.jobType === 'STAGE' ? 'convention' : 'contrat'}.
          </p>
          <p className="mt-3">
            Les Parties déclarent avoir pris connaissance de l&#39;ensemble des clauses du présent {data.jobType === 'STAGE' ? 'convention' : 'contrat'} et les accepter sans réserve.
          </p>
        </Article>

        <div className="mt-16 pt-8 border-t-2 border-gray-300 space-y-8">
          <p className="text-sm">
            <strong>Fait à</strong> {data.compAddr.split(',')[0].trim()}, <strong>le</strong> {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p className="text-sm">En deux (2) exemplaires originaux.</p>
          
          <div className="grid grid-cols-2 gap-8 mt-12">
            <div className="text-center space-y-4">
              <p className="font-bold text-sm uppercase">{data.jobType === 'STAGE' ? "Pour l'Entreprise d'Accueil" : "Pour l'Employeur"}</p>
              <p className="text-xs text-gray-500">(Signature précédée de la mention « Lu et approuvé »)</p>
              {data.documentMode === 'ELECTRONIC' && signatures.employer ? (
                <div className="flex flex-col items-center">
                  <img src={signatures.employer} alt="Signature Employeur" className="h-20 border-b-2 border-black" />
                  <p className="text-[10px] text-gray-500 mt-2">Signature électronique</p>
                </div>
              ) : (
                <div className="h-24 border-b-2 border-black flex items-end justify-center pb-2">
                  <p className="text-xs text-gray-400">(Signature et cachet)</p>
                </div>
              )}
              <div className="text-sm mt-4">
                <p className="font-bold">{data.bossName}</p>
                <p className="text-gray-600">{data.bossTitle}</p>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <p className="font-bold text-sm uppercase">{data.jobType === 'STAGE' ? 'Le/La Stagiaire' : 'Le/La Salarié(e)'}</p>
              <p className="text-xs text-gray-500">(Signature précédée de la mention « Lu et approuvé »)</p>
              {data.documentMode === 'ELECTRONIC' && signatures.employee ? (
                <div className="flex flex-col items-center">
                  <img src={signatures.employee} alt="Signature Salarié" className="h-20 border-b-2 border-black" />
                  <p className="text-[10px] text-gray-500 mt-2">Signature électronique</p>
                </div>
              ) : (
                <div className="h-24 border-b-2 border-black flex items-end justify-center pb-2">
                  <p className="text-xs text-gray-400">(Lu et approuvé)</p>
                </div>
              )}
              <div className="text-sm mt-4">
                <p className="font-bold">{data.empName}</p>
                <p className="text-gray-600">{data.jobTitle}</p>
              </div>
            </div>
          </div>
          
          {qrCode && (
            <div className="flex justify-center mt-12 pt-8 border-t border-gray-200">
              <div className="text-center">
                <p className="text-[10px] text-gray-500 mb-2">Code de vérification du document</p>
                <img src={qrCode} alt="QR Code" className="w-24 h-24 mx-auto" />
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-[10px] text-gray-500">
          {data.documentMode === 'ELECTRONIC' ? (
            <>
              <p className="mb-1">Document généré électroniquement via la plateforme <strong>ECODREUM Intelligence</strong></p>
              <p>Ce document a valeur de contrat de travail conformément à la {config.lawReference}.</p>
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
    <div className="mb-8">
      <h3 className="font-bold text-base mb-3 uppercase border-b border-gray-300 pb-2">{title}</h3>
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
      <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 tracking-wider">
        {icon && <span className="inline-block mr-1">{icon}</span>}
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {multiline ? (
        <textarea 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder={placeholder} 
          disabled={disabled} 
          rows={5} 
          className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500 focus:bg-emerald-500/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed resize-none" 
        />
      ) : (
        <input 
          type={type} 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder={placeholder} 
          disabled={disabled} 
          className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500 focus:bg-emerald-500/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed" 
        />
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-white/5 pb-2">
      <span className="text-[9px] text-zinc-600 font-bold uppercase">{label}</span>
      <span className="text-[9px] text-emerald-400 font-bold text-right">{value}</span>
    </div>
  );
}
