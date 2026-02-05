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
  Filter, Search, FileDown, QrCode, GraduationCap
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCodeLib from 'qrcode';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';
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
  qrCode?: string;
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

export default function GenerateurContratFinal() {
  const router = useRouter();
  const contractRef = useRef<HTMLDivElement>(null);
  const signatureCanvasEmployer = useRef<HTMLCanvasElement>(null);
  const signatureCanvasEmployee = useRef<HTMLCanvasElement>(null);
  
  const [activeSection, setActiveSection] = useState<'company' | 'employee' | 'contract'>('company');
  const [isSaving, setIsSaving] = useState(false);
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

  // --- CHARGEMENT INITIAL ---
  useEffect(() => {
    loadArchivedContracts();
  }, []);

  useEffect(() => {
    filterContracts();
  }, [savedContracts, searchTerm, filterType]);

  // --- GESTION ARCHIVES ---
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
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const contract = JSON.parse(event.target?.result as string);
          const updated = [contract, ...savedContracts];
          setSavedContracts(updated);
          localStorage.setItem('ecodreum_contracts', JSON.stringify(updated));
          showNotif('Contrat importé avec succès', 's');
        } catch (error) {
          showNotif('Erreur lors de l\'import', 'e');
        }
      };
      reader.readAsText(file);
    }
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

  // --- GESTION QR CODE ---
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

  // --- GESTION SIGNATURE ---
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

// --- EXPORT WORD ---
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
              children: [
                new TextRun({
                  text: data.jobType === 'STAGE' ? 'CONVENTION DE STAGE' : 'CONTRAT DE TRAVAIL',
                  bold: true,
                  size: 32,
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `RÉGIME : ${data.jobType}`,
                  bold: true,
                  size: 24,
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "ENTRE LES SOUSSIGNÉS :",
                  bold: true,
                  size: 28,
                })
              ],
              spacing: { before: 200, after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `La société ${data.compName}, ${data.compType}${data.showCapital && data.compCapital ? `, au capital social de ${data.compCapital} ${config.currency}` : ''}, dont le siège social est situé à ${data.compAddr}, immatriculée au RCCM sous le numéro ${data.compRCCM} et identifiée au ${config.idLabel} sous le numéro ${data.compID}, représentée par M./Mme ${data.bossName} en sa qualité de ${data.bossTitle}.`
                })
              ],
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Ci-après dénommée « ${data.jobType === 'STAGE' ? "L'ENTREPRISE D'ACCUEIL" : "L'EMPLOYEUR"} »`,
                  italics: true,
                })
              ],
              alignment: AlignmentType.RIGHT,
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "D'UNE PART,",
                  bold: true,
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "ET :",
                  bold: true,
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `M./Mme ${data.empName}, né(e) le ${new Date(data.empBirth).toLocaleDateString('fr-FR')} à ${data.empBirthPlace}, de nationalité ${data.empNation}${data.isForeigner && data.empWorkPermit ? `, titulaire du permis de travail n°${data.empWorkPermit}` : ''}, titulaire de la pièce d'identité n°${data.empID}, demeurant à ${data.empAddr}, joignable au ${data.empPhone}${data.empEmail ? ` et par email à ${data.empEmail}` : ''}.${data.jobType === 'STAGE' && data.stageSchool ? ` Actuellement inscrit(e) en ${data.stageLevel} à ${data.stageSchool}.` : ''}`
                })
              ],
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Ci-après dénommé(e) « ${data.jobType === 'STAGE' ? 'LE STAGIAIRE' : 'LE SALARIÉ'} »`,
                  italics: true,
                })
              ],
              alignment: AlignmentType.RIGHT,
              spacing: { after: 400 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "D'AUTRE PART,",
                  bold: true,
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "IL A ÉTÉ ARRÊTÉ ET CONVENU CE QUI SUIT :",
                  bold: true,
                  size: 28,
                })
              ],
              spacing: { before: 200, after: 200 }
            }),

            // ARTICLE 1
            new Paragraph({
              children: [
                new TextRun({
                  text: "ARTICLE 1 : OBJET ET CADRE LÉGAL",
                  bold: true,
                  size: 24,
                })
              ],
              spacing: { before: 200, after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: data.jobType === 'STAGE' 
                    ? `La présente convention de stage est conclue dans le cadre de la formation de ${data.empName} et s'inscrit dans le parcours pédagogique de l'établissement ${data.stageSchool || '[établissement]'}. Elle est régie par les dispositions légales et réglementaires en vigueur au ${config.name} relatives aux stages en entreprise.`
                    : `Le présent contrat est conclu sous le régime du ${config.code}. ${config.articles.intro} ${config.articles.engagement} Le présent contrat définit les conditions d'engagement et d'emploi du Salarié au sein de la société ${data.compName}.`
                })
              ],
              spacing: { after: 200 }
            }),

            // ARTICLE 2
            new Paragraph({
              children: [
                new TextRun({
                  text: "ARTICLE 2 : NATURE ET FONCTIONS",
                  bold: true,
                  size: 24,
                })
              ],
              spacing: { before: 200, after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${data.jobType === 'STAGE' ? 'Le Stagiaire' : 'Le Salarié'} est ${data.jobType === 'STAGE' ? 'accueilli' : 'recruté'} en qualité de ${data.jobTitle} au sein du département ${data.jobDept}. ${data.jobType === 'STAGE' ? 'Le Stagiaire' : 'Le Salarié'} exercera ses fonctions au sein de l'établissement situé à ${data.jobLocation}. Le type de ${data.jobType === 'STAGE' ? 'stage' : 'contrat'} conclu est ${
                    data.jobType === 'CDI' ? 'un contrat à durée indéterminée (CDI)' :
                    data.jobType === 'CDD' ? 'un contrat à durée déterminée (CDD)' :
                    'une convention de stage'
                  }.${data.jobType === 'CDD' && data.cddReason ? ` Le présent contrat est conclu pour les besoins suivants : ${data.cddReason}.` : ''}`
                })
              ],
              spacing: { after: 200 }
            }),

            // ARTICLE 3
            new Paragraph({
              children: [
                new TextRun({
                  text: `ARTICLE 3 : ${data.jobType === 'STAGE' ? 'GRATIFICATION' : 'RÉMUNÉRATION'}`,
                  bold: true,
                  size: 24,
                })
              ],
              spacing: { before: 200, after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `En contrepartie de l'exécution de ses fonctions, ${data.jobType === 'STAGE' ? 'le Stagiaire' : 'le Salarié'} percevra une ${data.jobType === 'STAGE' ? 'gratification' : 'rémunération'} mensuelle ${data.jobType === 'STAGE' ? '' : 'brute '}de ${data.salary} ${config.currency} (${salaryToWords(data.salary, config.currency)}). Cette ${data.jobType === 'STAGE' ? 'gratification est' : 'rémunération est'} versée mensuellement par virement bancaire${data.jobType === 'STAGE' ? '' : ', sous réserve des retenues légales et conventionnelles applicables'}.${data.bonus ? ` En sus de cette rémunération de base, ${data.jobType === 'STAGE' ? 'le stagiaire' : 'le Salarié'} pourra percevoir les primes et avantages suivants : ${data.bonus}.` : ''} ${config.articles.workDuration} la durée hebdomadaire de travail est fixée à ${data.hours} heures.`
                })
              ],
              spacing: { after: 200 }
            }),

            // ARTICLE 4
            new Paragraph({
              children: [
                new TextRun({
                  text: "ARTICLE 4 : DURÉE ET PÉRIODE D'ESSAI",
                  bold: true,
                  size: 24,
                })
              ],
              spacing: { before: 200, after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${data.jobType === 'STAGE' ? 'La présente convention de stage' : 'Le présent contrat de travail'} prend effet à compter du ${new Date(data.startDate).toLocaleDateString('fr-FR')}${(data.jobType === 'CDD' || data.jobType === 'STAGE') && data.endDate ? ` et prendra fin le ${new Date(data.endDate).toLocaleDateString('fr-FR')}` : ''}.${data.jobType !== 'STAGE' ? ` Une période d'essai de ${data.trial} mois est prévue. Durant cette période, chacune des parties peut mettre fin au contrat sans préavis ni indemnité, conformément aux dispositions légales en vigueur. À l'issue de la période d'essai, si aucune des parties n'a manifesté sa volonté de rompre le contrat, celui-ci se poursuivra dans les conditions définies aux présentes.` : ''}`
                })
              ],
              spacing: { after: 200 }
            }),

            // CLAUSE NON-CONCURRENCE (si applicable)
            ...(data.hasNonCompete && data.jobType !== 'STAGE' ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "ARTICLE 5 : CLAUSE DE NON-CONCURRENCE",
                    bold: true,
                    size: 24,
                  })
                ],
                spacing: { before: 200, after: 100 }
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Le Salarié s'engage, pendant une durée de ${data.nonCompeteDuration} suivant la cessation du présent contrat, quelle qu'en soit la cause, à ne pas exercer, directement ou indirectement, une activité concurrente à celle de l'Employeur. Cette obligation s'applique sur le territoire du ${config.name} et concerne toute activité similaire ou connexe à celle exercée au sein de la société ${data.compName}. En contrepartie de cette clause, le Salarié percevra une indemnité compensatrice dont les modalités seront définies conformément aux dispositions légales applicables.`
                  })
                ],
                spacing: { after: 200 }
              })
            ] : []),

            // SIGNATURES
            new Paragraph({
              children: [
                new TextRun({
                  text: "SIGNATURES",
                  bold: true,
                  size: 28,
                })
              ],
              spacing: { before: 400, after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Fait à ${data.compAddr.split(',')[0].trim()}, le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
                })
              ],
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `En deux exemplaires originaux, dont un remis ${data.jobType === 'STAGE' ? 'au Stagiaire' : 'au Salarié'}.`
                })
              ],
              spacing: { after: 400 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${data.jobType === 'STAGE' ? "L'ENTREPRISE D'ACCUEIL" : "L'EMPLOYEUR"}`,
                  bold: true,
                })
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `${data.bossName} - ${data.bossTitle}`,
              spacing: { after: 200 }
            }),
            new Paragraph({
              text: "(Signature et cachet)",
              spacing: { after: 400 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${data.jobType === 'STAGE' ? 'LE STAGIAIRE' : 'LE SALARIÉ'}`,
                  bold: true,
                })
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `${data.empName} - ${data.jobTitle}`,
              spacing: { after: 200 }
            }),
            new Paragraph({
              text: "(Lu et approuvé, signature)",
              spacing: { after: 400 }
            }),

            // FOOTER
            new Paragraph({
              children: [
                new TextRun({
                  text: data.documentMode === 'ELECTRONIC' 
                    ? "Document généré via la plateforme ECODREUM Intelligence. Ce document ne se substitue pas à un conseil juridique personnalisé."
                    : data.compName,
                  size: 18,
                })
              ],
              alignment: AlignmentType.CENTER,
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

  // --- ENVOI EMAIL ---
  const sendEmail = async () => {
    if (!emailRecipient || !validateForm()) {
      showNotif("Email invalide ou formulaire incomplet", "e");
      return;
    }

    try {
      showNotif("Envoi en cours...", "w");
      // Ici vous pouvez intégrer votre API d'envoi d'email
      // Par exemple avec SendGrid, Resend, ou votre propre backend
      
      setTimeout(() => {
        showNotif(`Contrat envoyé à ${emailRecipient}`, "s");
        setShowEmailModal(false);
        setEmailRecipient('');
      }, 2000);
      
    } catch (error) {
      showNotif("Erreur lors de l'envoi", "e");
    }
  };

  // --- UTILITAIRES ---
  const showNotif = (m: string, t: 's' | 'e' | 'w') => {
    setNotif({ m, t });
    setTimeout(() => setNotif(null), 4000);
  };

  const updateData = (field: keyof FormData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    setValidationErrors([]);
  };

  const getProgress = (): number => {
    const totalFields = data.jobType === 'STAGE' ? 27 : 25;
    let filledFields = 0;
    Object.entries(data).forEach(([key, value]) => {
      if (['showCapital', 'isForeigner', 'hasNonCompete', 'documentMode'].includes(key)) return;
      if (value && value !== '0' && value !== '') filledFields++;
    });
    return Math.round((filledFields / totalFields) * 100);
  };

return (
    <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white overflow-y-auto selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* NOTIFICATIONS */}
        {notif && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-in slide-in-from-top duration-300 ${
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

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => router.back()} 
              className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                LEGAL ARCHITECT
              </h1>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                Générateur de Contrats • ECODREUM v5.0.0
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowArchives(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl font-bold text-xs hover:bg-blue-500/20 transition-all"
            >
              <Archive size={16} />
              Archives ({savedContracts.length})
            </button>
          </div>
        </div>

        {/* MODE SÉLECTION */}
        <div className="mb-8 bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase mb-2 text-emerald-400">Mode de Document</h3>
              <p className="text-xs text-zinc-500">Choisissez le type de contrat à générer</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => updateData('documentMode', 'ELECTRONIC')}
                className={`flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-xs transition-all ${
                  data.documentMode === 'ELECTRONIC'
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                    : 'bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                <Zap size={18} />
                <div className="text-left">
                  <div className="uppercase tracking-wider">Électronique</div>
                  <div className="text-[9px] opacity-70">Signature numérique</div>
                </div>
              </button>

              <button
                onClick={() => updateData('documentMode', 'PRINT')}
                className={`flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-xs transition-all ${
                  data.documentMode === 'PRINT'
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                    : 'bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                <Printer size={18} />
                <div className="text-left">
                  <div className="uppercase tracking-wider">À Imprimer</div>
                  <div className="text-[9px] opacity-70">Signature manuelle</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* JURIDICTION */}
        <div className="mb-8 bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 block">
            <Globe size={12} className="inline mr-2" />
            Juridiction Applicable
          </label>
          <div className="flex gap-3">
            {(['SENEGAL', 'BURUNDI'] as const).map((c) => (
              <button 
                key={c} 
                onClick={() => updateData('country', c)}
                className={`flex-1 px-8 py-4 rounded-xl text-sm font-black transition-all ${
                  data.country === c 
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-black shadow-lg shadow-emerald-500/30' 
                    : 'bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* PROGRESSION */}
        <div className="mb-8 bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Progression du formulaire
            </span>
            <span className="text-sm font-black text-emerald-400">{getProgress()}%</span>
          </div>
          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 transition-all duration-500 animate-pulse"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>

        {/* ERREURS */}
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

        {/* NAVIGATION SECTIONS */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'company', label: 'Entreprise', icon: Building, color: 'emerald' },
            { id: 'employee', label: 'Salarié', icon: User, color: 'blue' },
            { id: 'contract', label: 'Contrat', icon: Briefcase, color: 'amber' }
          ].map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id as any)}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl text-xs font-black uppercase whitespace-nowrap transition-all ${
                activeSection === id
                  ? `bg-${color}-500 text-black shadow-lg shadow-${color}-500/30`
                  : 'bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-40">
          {/* FORMULAIRE */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* SECTION ENTREPRISE */}
            {activeSection === 'company' && (
              <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-3xl space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 text-emerald-400 mb-6">
                  <Building size={22} />
                  <h2 className="text-lg font-black uppercase tracking-wider">Structure Employeuse</h2>
                </div>

                {/* LOGO ET DESCRIPTION */}
                <div className="bg-black/30 border border-white/5 rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-black uppercase text-zinc-400 mb-4">Identité Visuelle (Optionnel)</h3>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block">
                        <ImageIcon size={12} className="inline mr-1" />
                        Logo de l'entreprise
                      </label>
                      <div className="relative">
                        {data.compLogo ? (
                          <div className="relative group">
                            <img src={data.compLogo} alt="Logo" className="w-32 h-32 object-contain bg-white rounded-xl p-2" />
                            <button
                              onClick={() => updateData('compLogo', null)}
                              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
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
                      <InputField
                        label="Description entreprise"
                        value={data.compDescription}
                        onChange={(v) => updateData('compDescription', v)}
                        placeholder="Ex: Leader en solutions digitales..."
                        multiline
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Raison Sociale"
                    value={data.compName}
                    onChange={(v) => updateData('compName', v)}
                    icon={<Building size={14} />}
                    required
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

                <div className="flex items-start gap-4 p-4 bg-black/20 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      checked={data.showCapital}
                      onChange={(e) => updateData('showCapital', e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-black/40 text-emerald-500 focus:ring-emerald-500"
                    />
                    <label className="text-xs font-bold text-zinc-400 uppercase whitespace-nowrap">
                      Mentionner le capital
                    </label>
                  </div>
                  <InputField
                    label="Capital Social"
                    value={data.compCapital}
                    onChange={(v) => updateData('compCapital', v)}
                    disabled={!data.showCapital}
                    placeholder={`Ex: 1 000 000 ${config.currency}`}
                    icon={<DollarSign size={14} />}
                  />
                </div>

                <InputField
                  label="Siège Social"
                  value={data.compAddr}
                  onChange={(v) => updateData('compAddr', v)}
                  placeholder="Adresse complète"
                  icon={<MapPin size={14} />}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Représentant Légal"
                    value={data.bossName}
                    onChange={(v) => updateData('bossName', v)}
                    placeholder="Nom complet"
                    icon={<User size={14} />}
                    required
                  />
                  <InputField
                    label="Fonction"
                    value={data.bossTitle}
                    onChange={(v) => updateData('bossTitle', v)}
                    placeholder="Gérant, DG..."
                    icon={<Award size={14} />}
                    required
                  />
                </div>
              </div>
            )}

            {/* SECTION SALARIÉ */}
            {activeSection === 'employee' && (
              <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-3xl space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 text-blue-400 mb-6">
                  <User size={22} />
                  <h2 className="text-lg font-black uppercase tracking-wider">Informations Salarié</h2>
                </div>

                <InputField
                  label="Nom Complet"
                  value={data.empName}
                  onChange={(v) => updateData('empName', v)}
                  placeholder="Prénom et nom"
                  icon={<User size={14} />}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Nationalité"
                      value={data.empNation}
                      onChange={(v) => updateData('empNation', v)}
                      placeholder="Ex: Burundaise"
                      icon={<Globe size={14} />}
                      required
                    />
                    <div className="flex items-center gap-3 p-4 bg-black/20 rounded-xl border border-white/5">
                      <input
                        type="checkbox"
                        checked={data.isForeigner}
                        onChange={(e) => updateData('isForeigner', e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-black/40 text-blue-500 focus:ring-blue-500"
                      />
                      <label className="text-xs font-bold text-zinc-400 uppercase">
                        Travailleur étranger
                      </label>
                    </div>
                  </div>

                  {data.isForeigner && (
                    <InputField
                      label="Numéro Permis de Travail"
                      value={data.empWorkPermit}
                      onChange={(v) => updateData('empWorkPermit', v)}
                      placeholder="N° du permis de travail"
                      icon={<Shield size={14} />}
                      required
                    />
                  )}
                </div>

                <InputField
                  label="Adresse de Résidence"
                  value={data.empAddr}
                  onChange={(v) => updateData('empAddr', v)}
                  placeholder="Adresse complète"
                  icon={<MapPin size={14} />}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <InputField
                  label="Email"
                  type="email"
                  value={data.empEmail}
                  onChange={(v) => updateData('empEmail', v)}
                  placeholder="exemple@email.com"
                  icon={<Mail size={14} />}
                />
              </div>
            )}

            {/* SECTION CONTRAT */}
            {activeSection === 'contract' && (
              <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-3xl space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 text-amber-400 mb-6">
                  <Briefcase size={22} />
                  <h2 className="text-lg font-black uppercase tracking-wider">Conditions de Travail</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 tracking-wider">
                      Type de Contrat *
                    </label>
                    <select
                      value={data.jobType}
                      onChange={(e) => updateData('jobType', e.target.value as 'CDI' | 'CDD' | 'STAGE')}
                      className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-amber-500 focus:bg-amber-500/5 transition-all appearance-none cursor-pointer"
                    >
                      <option value="CDI">CDI - Contrat à Durée Indéterminée</option>
                      <option value="CDD">CDD - Contrat à Durée Déterminée</option>
                      <option value="STAGE">STAGE - Convention de Stage</option>
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

                {data.jobType === 'STAGE' && (
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2 text-purple-400 mb-3">
                      <GraduationCap size={18} />
                      <h3 className="text-sm font-black uppercase">Informations Stage</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        label="Établissement"
                        value={data.stageSchool}
                        onChange={(v) => updateData('stageSchool', v)}
                        placeholder="Nom de l'université/école"
                        icon={<Building size={14} />}
                        required
                      />
                      <InputField
                        label="Niveau d'Études"
                        value={data.stageLevel}
                        onChange={(v) => updateData('stageLevel', v)}
                        placeholder="Ex: Licence 3, Master 2..."
                        icon={<Award size={14} />}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Département"
                    value={data.jobDept}
                    onChange={(v) => updateData('jobDept', v)}
                    placeholder="Ex: Technique, RH..."
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Date de Début"
                    type="date"
                    value={data.startDate}
                    onChange={(v) => updateData('startDate', v)}
                    icon={<Calendar size={14} />}
                    required
                  />
                  {(data.jobType === 'CDD' || data.jobType === 'STAGE') && (
                    <InputField
                      label={`Date de Fin (${data.jobType})`}
                      type="date"
                      value={data.endDate}
                      onChange={(v) => updateData('endDate', v)}
                      icon={<Calendar size={14} />}
                      required
                    />
                  )}
                </div>

                {data.jobType === 'CDD' && (
                  <InputField
                    label="Motif du CDD"
                    value={data.cddReason}
                    onChange={(v) => updateData('cddReason', v)}
                    placeholder="Ex: Remplacement, Accroissement temporaire d'activité..."
                    icon={<FileText size={14} />}
                    required
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label={`${data.jobType === 'STAGE' ? 'Gratification' : 'Salaire'} Mensuel${data.jobType === 'STAGE' ? '' : ' Brut'} (${config.currency})`}
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

                {data.salary && parseFloat(data.salary) > 0 && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <div className="text-xs font-bold text-emerald-400 mb-1">En lettres:</div>
                    <div className="text-sm text-emerald-300 capitalize">{salaryToWords(data.salary, config.currency)}</div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Heures Hebdomadaires"
                    type="number"
                    value={data.hours}
                    onChange={(v) => updateData('hours', v)}
                    placeholder="40"
                    icon={<Clock size={14} />}
                    required
                  />
                  {data.jobType !== 'STAGE' && (
                    <InputField
                      label="Période d'Essai (mois)"
                      type="number"
                      value={data.trial}
                      onChange={(v) => updateData('trial', v)}
                      placeholder="3"
                      icon={<Calendar size={14} />}
                      required
                    />
                  )}
                </div>

                {data.jobType !== 'STAGE' && (
                  <div className="space-y-4 p-6 bg-black/20 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={data.hasNonCompete}
                        onChange={(e) => updateData('hasNonCompete', e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-black/40 text-amber-500 focus:ring-amber-500"
                      />
                      <label className="text-xs font-bold text-zinc-400 uppercase">
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
                )}
              </div>
            )}
          </div>

          {/* PANNEAU ACTIONS */}
          <div className="lg:col-span-4">
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/10 p-8 rounded-3xl sticky top-8 space-y-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle size={22} className="text-emerald-400" />
                <h3 className="text-xl font-black italic uppercase">Actions</h3>
              </div>

              {/* SIGNATURES ÉLECTRONIQUES */}
              {data.documentMode === 'ELECTRONIC' && (
                <div className="space-y-3 mb-6">
                  <h4 className="text-xs font-black uppercase text-zinc-400 mb-3">Signatures Électroniques</h4>
                  
                  <button
                    onClick={() => openSignatureModal('employer')}
                    className={`w-full py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-3 transition-all ${
                      signatures.employer
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                        : 'bg-zinc-800 border border-white/10 text-zinc-400 hover:border-emerald-500/50'
                    }`}
                  >
                    <PenTool size={16} />
                    {signatures.employer ? 'Signature Employeur ✓' : 'Signer (Employeur)'}
                  </button>

                  <button
                    onClick={() => openSignatureModal('employee')}
                    className={`w-full py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-3 transition-all ${
                      signatures.employee
                        ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400'
                        : 'bg-zinc-800 border border-white/10 text-zinc-400 hover:border-blue-500/50'
                    }`}
                  >
                    <PenTool size={16} />
                    {signatures.employee ? 'Signature Salarié ✓' : 'Signer (Salarié)'}
                  </button>
                </div>
              )}

              {/* BOUTONS EXPORT */}
              <div className="space-y-3">
                <button
                  onClick={generatePDF}
                  disabled={isGenerating}
                  className="w-full py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-black rounded-xl font-black uppercase text-xs flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-emerald-500/30"
                >
                  {isGenerating ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <Download size={20} />
                  )}
                  Générer PDF
                </button>

                <button
                  onClick={generateWord}
                  className="w-full py-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-3 transition-all"
                >
                  <FileDown size={18} />
                  Exporter Word
                </button>

                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full py-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-3 transition-all"
                >
                  <Eye size={18} />
                  {showPreview ? 'Masquer' : 'Aperçu'}
                </button>

                {data.empEmail && (
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="w-full py-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-3 transition-all"
                  >
                    <Mail size={18} />
                    Envoyer par Email
                  </button>
                )}
              </div>

              {/* RÉCAPITULATIF */}
              <div className="mt-8 p-6 bg-black/40 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-zinc-500 mb-3">
                  <Scale size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
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

              {/* QR CODE */}
              {qrCodeData && (
                <div className="p-4 bg-black/40 rounded-xl border border-white/5 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase">
                    <QrCode size={14} />
                    Code de Vérification
                  </div>
                  <img src={qrCodeData} alt="QR Code" className="w-32 h-32 bg-white p-2 rounded-lg" />
                </div>
              )}

              {/* DISCLAIMER */}
              <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[9px] text-amber-400/80 leading-relaxed">
                    Ce document est généré automatiquement et ne se substitue pas à un conseil juridique personnalisé.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL SIGNATURE */}
        {showSignatureModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-2xl w-full">
              <h3 className="text-2xl font-black mb-6">
                Signature {currentSigner === 'employer' ? 'Employeur' : 'Salarié'}
              </h3>
              
              <div className="bg-white rounded-xl p-4 mb-6">
                <canvas
                  ref={currentSigner === 'employer' ? signatureCanvasEmployer : signatureCanvasEmployee}
                  width={600}
                  height={300}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="border-2 border-dashed border-zinc-300 rounded-lg cursor-crosshair w-full"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={clearSignature}
                  className="flex-1 py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-bold hover:bg-red-500/30 transition-all"
                >
                  Effacer
                </button>
                <button
                  onClick={() => {
                    setShowSignatureModal(false);
                    setCurrentSigner(null);
                  }}
                  className="flex-1 py-3 bg-zinc-800 border border-white/10 text-white rounded-xl font-bold hover:bg-zinc-700 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={saveSignature}
                  className="flex-1 py-3 bg-emerald-500 text-black rounded-xl font-bold hover:bg-emerald-400 transition-all"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL EMAIL */}
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
                placeholder={data.empEmail || "exemple@email.com"}
                icon={<Mail size={14} />}
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 py-3 bg-zinc-800 border border-white/10 text-white rounded-xl font-bold hover:bg-zinc-700 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={sendEmail}
                  className="flex-1 py-3 bg-amber-500 text-black rounded-xl font-bold hover:bg-amber-400 transition-all"
                >
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
                  <button
                    onClick={() => setShowArchives(false)}
                    className="px-6 py-3 bg-zinc-800 text-white rounded-xl font-bold hover:bg-zinc-700 transition-all"
                  >
                    Fermer
                  </button>
                </div>

                {/* RECHERCHE ET FILTRES */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Rechercher par nom ou poste..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-zinc-800 border border-white/10 rounded-xl text-sm text-white outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    {(['ALL', 'CDI', 'CDD', 'STAGE'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                          filterType === type
                            ? 'bg-emerald-500 text-black'
                            : 'bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {type === 'ALL' ? 'TOUS' : type}
                      </button>
                    ))}
                  </div>

                  <label className="flex items-center gap-2 px-4 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl font-bold text-xs cursor-pointer hover:bg-blue-500/20 transition-all">
                    <Upload size={16} />
                    Importer
                    <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                {filteredContracts.length === 0 ? (
                  <div className="text-center py-20">
                    <Archive size={64} className="mx-auto text-zinc-700 mb-4" />
                    <p className="text-zinc-500">
                      {searchTerm || filterType !== 'ALL' ? 'Aucun résultat' : 'Aucun contrat archivé'}
                    </p>
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
                            <span className={`text-[10px] px-2 py-1 rounded-lg font-bold ${
                              contract.contractType === 'CDI' ? 'bg-emerald-500/20 text-emerald-400' :
                              contract.contractType === 'CDD' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-purple-500/20 text-purple-400'
                            }`}>
                              {contract.contractType}
                            </span>
                            <span className={`text-[10px] px-2 py-1 rounded-lg font-bold ${
                              contract.mode === 'ELECTRONIC' ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-700 text-zinc-400'
                            }`}>
                              {contract.mode === 'ELECTRONIC' ? 'E-Sign' : 'Print'}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-zinc-400 space-y-1">
                          <div>Date: {new Date(contract.createdAt).toLocaleDateString('fr-FR')}</div>
                          {contract.signed && <div className="text-emerald-400 font-bold">✓ Signé</div>}
                        </div>

                        <div className="flex gap-2 pt-3">
                          <button
                            onClick={() => loadContract(contract)}
                            className="flex-1 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500/30 transition-all"
                          >
                            Charger
                          </button>
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

        {/* PRÉVISUALISATION CONTRAT */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-40 overflow-y-auto">
            <div className="min-h-screen flex items-center justify-center p-8">
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

// --- COMPOSANT PRÉVISUALISATION CONTRAT ---
function ContractPreview({ data, config, signatures, qrCode }: { 
  data: FormData; 
  config: CountryConfig; 
  signatures: { employer: string; employee: string };
  qrCode: string;
}) {
  const capitalClause = data.showCapital && data.compCapital ? `, au capital social de ${data.compCapital} ${config.currency}` : '';
  const foreignerClause = data.isForeigner && data.empWorkPermit ? `, titulaire du permis de travail n°${data.empWorkPermit}` : '';
  const cddClause = data.jobType === 'CDD' && data.cddReason ? `\n\nLe présent contrat est conclu pour les besoins suivants : ${data.cddReason}.` : '';
  const bonusClause = data.bonus ? `\n\nEn sus de cette rémunération de base, ${data.jobType === 'STAGE' ? 'le stagiaire' : 'le Salarié'} pourra percevoir les primes et avantages suivants : ${data.bonus}.` : '';
  const endDateClause = (data.jobType === 'CDD' || data.jobType === 'STAGE') && data.endDate ? ` et prendra fin le ${new Date(data.endDate).toLocaleDateString('fr-FR')}` : '';
  const salaryInWords = salaryToWords(data.salary, config.currency);

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
        <h1 className="text-3xl font-black uppercase tracking-wider mb-2">
          {data.jobType === 'STAGE' ? 'CONVENTION DE STAGE' : 'CONTRAT DE TRAVAIL'}
        </h1>
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
        
        <p className="italic text-right">Ci-après dénommée « <strong>{data.jobType === 'STAGE' ? "L'ENTREPRISE D'ACCUEIL" : "L'EMPLOYEUR"}</strong> »</p>
        
        <p className="text-center font-bold">D'UNE PART,</p>
        
        <p className="text-center font-bold">ET :</p>
        
        <p className="leading-relaxed">
          M./Mme <strong>{data.empName}</strong>, né(e) le <strong>{new Date(data.empBirth).toLocaleDateString('fr-FR')}</strong> à <strong>{data.empBirthPlace}</strong>, 
          de nationalité <strong>{data.empNation}</strong>{foreignerClause}, titulaire de la pièce d'identité n°<strong>{data.empID}</strong>, 
          demeurant à <strong>{data.empAddr}</strong>, joignable au <strong>{data.empPhone}</strong>
          {data.empEmail && ` et par email à ${data.empEmail}`}.
          {data.jobType === 'STAGE' && data.stageSchool && (
            <><br /><br />Actuellement inscrit(e) en <strong>{data.stageLevel}</strong> à <strong>{data.stageSchool}</strong>.</>
          )}
        </p>
        
        <p className="italic text-right">Ci-après dénommé(e) « <strong>{data.jobType === 'STAGE' ? 'LE STAGIAIRE' : 'LE SALARIÉ'}</strong> »</p>
        
        <p className="text-center font-bold">D'AUTRE PART,</p>
        
        <p className="font-bold text-lg mt-8 mb-4">IL A ÉTÉ ARRÊTÉ ET CONVENU CE QUI SUIT :</p>

        {/* ARTICLES */}
        <div className="space-y-6">
          <Article title="ARTICLE 1 : OBJET ET CADRE LÉGAL">
            {data.jobType === 'STAGE' ? (
              <>
                La présente convention de stage est conclue dans le cadre de la formation de {data.empName} et s'inscrit dans le parcours pédagogique de l'établissement {data.stageSchool}.
                <br /><br />
                Elle est régie par les dispositions légales et réglementaires en vigueur au {config.name} relatives aux stages en entreprise.
              </>
            ) : (
              <>
                Le présent contrat est conclu sous le régime du {config.code}.
                <br /><br />
                {config.articles.intro}
                <br />
                {config.articles.engagement}
                <br /><br />
                Le présent contrat définit les conditions d'engagement et d'emploi du Salarié au sein de la société {data.compName}.
              </>
            )}
          </Article>

          <Article title="ARTICLE 2 : NATURE ET FONCTIONS">
            {data.jobType === 'STAGE' ? 'Le Stagiaire' : 'Le Salarié'} est {data.jobType === 'STAGE' ? 'accueilli' : 'recruté'} en qualité de <strong>{data.jobTitle}</strong> au sein du département <strong>{data.jobDept}</strong>.
            <br /><br />
            {data.jobType === 'STAGE' ? 'Le Stagiaire' : 'Le Salarié'} exercera ses fonctions au sein de l'établissement situé à <strong>{data.jobLocation}</strong>.
            <br /><br />
            Le type de {data.jobType === 'STAGE' ? 'stage' : 'contrat'} conclu est {
              data.jobType === 'CDI' ? 'un contrat à durée indéterminée (CDI)' :
              data.jobType === 'CDD' ? 'un contrat à durée déterminée (CDD)' :
              'une convention de stage'
            }.{cddClause}
            <br /><br />
            <strong>{data.jobType === 'STAGE' ? 'Le Stagiaire' : 'Le Salarié'} s'engage à</strong> exercer ses fonctions avec diligence, compétence et loyauté, conformément aux directives de {data.jobType === 'STAGE' ? "l'Entreprise d'Accueil" : "l'Employeur"} et aux usages de la profession.
          </Article>

          <Article title={`ARTICLE 3 : ${data.jobType === 'STAGE' ? 'GRATIFICATION' : 'RÉMUNÉRATION'}`}>
            En contrepartie de l'exécution de ses fonctions, {data.jobType === 'STAGE' ? 'le Stagiaire' : 'le Salarié'} percevra une {data.jobType === 'STAGE' ? 'gratification' : 'rémunération'} mensuelle {data.jobType === 'STAGE' ? '' : 'brute '}de <strong>{data.salary} {config.currency}</strong> ({salaryInWords}).
            <br /><br />
            Cette {data.jobType === 'STAGE' ? 'gratification est' : 'rémunération est'} versée mensuellement par virement bancaire{data.jobType === 'STAGE' ? '' : ', sous réserve des retenues légales et conventionnelles applicables'}.{bonusClause}
            <br /><br />
            {config.articles.workDuration} la durée hebdomadaire de travail est fixée à <strong>{data.hours} heures</strong>.
          </Article>

          <Article title="ARTICLE 4 : DURÉE ET PÉRIODE D'ESSAI">
            {data.jobType === 'STAGE' ? 'La présente convention de stage' : 'Le présent contrat de travail'} prend effet à compter du <strong>{new Date(data.startDate).toLocaleDateString('fr-FR')}</strong>{endDateClause}.
            <br /><br />
            {data.jobType !== 'STAGE' && (
              <>
                Une période d'essai de <strong>{data.trial} mois</strong> est prévue. Durant cette période, chacune des parties peut mettre fin au contrat sans préavis ni indemnité, conformément aux dispositions légales en vigueur.
                <br /><br />
                À l'issue de la période d'essai, si aucune des parties n'a manifesté sa volonté de rompre le contrat, celui-ci se poursuivra dans les conditions définies aux présentes.
              </>
            )}
          </Article>

          {data.hasNonCompete && data.jobType !== 'STAGE' && (
            <Article title="ARTICLE 5 : CLAUSE DE NON-CONCURRENCE">
              Le Salarié s'engage, pendant une durée de <strong>{data.nonCompeteDuration}</strong> suivant la cessation du présent contrat, quelle qu'en soit la cause, à ne pas exercer, directement ou indirectement, une activité concurrente à celle de l'Employeur.
              <br /><br />
              Cette obligation s'applique sur le territoire du {config.name} et concerne toute activité similaire ou connexe à celle exercée au sein de la société {data.compName}.
              <br /><br />
              En contrepartie de cette clause, le Salarié percevra une indemnité compensatrice dont les modalités seront définies conformément aux dispositions légales applicables.
            </Article>
          )}
        </div>

        {/* SIGNATURES */}
        <div className="mt-16 pt-8 space-y-8">
          <p className="text-sm">
            Fait à <strong>{data.compAddr.split(',')[0].trim()}</strong>, le <strong>{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
          </p>
          
          <p className="text-sm">En deux exemplaires originaux, dont un remis {data.jobType === 'STAGE' ? 'au Stagiaire' : 'au Salarié'}.</p>

          <div className="grid grid-cols-2 gap-8 mt-12">
            <div className="text-center space-y-4">
              <p className="font-bold">{data.jobType === 'STAGE' ? "L'ENTREPRISE D'ACCUEIL" : "L'EMPLOYEUR"}</p>
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
              <p className="font-bold">{data.jobType === 'STAGE' ? 'LE STAGIAIRE' : 'LE SALARIÉ'}</p>
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

          {/* QR CODE */}
          {qrCode && (
            <div className="flex justify-center mt-12">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-2">Code de vérification du document</p>
                <img src={qrCode} alt="QR Code" className="w-32 h-32 mx-auto" />
              </div>
            </div>
          )}
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

// --- COMPOSANTS UTILITAIRES ---
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
          rows={3}
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
