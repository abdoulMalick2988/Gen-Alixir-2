"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
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

// --- SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- TYPES ---
interface FormData {
  country: 'SENEGAL' | 'BURUNDI';
  compName: string; compType: string; compCapital: string; showCapital: boolean;
  compAddr: string; compRCCM: string; compID: string; bossName: string; bossTitle: string;
  compLogo: string | null; compDescription: string;
  empName: string; empBirth: string; empBirthPlace: string; empNation: string;
  isForeigner: boolean; empWorkPermit: string; empAddr: string; empID: string; empPhone: string;
  jobTitle: string; jobDept: string; jobType: 'CDI' | 'CDD' | 'STAGE'; jobLocation: string;
  salary: string; bonus: string; stageAllowance: string; startDate: string; endDate: string;
  cddReason: string; jobDescription: string; stageTasks: string; trial: string; hours: string;
  hasNonCompete: boolean; nonCompeteDuration: string; documentMode: 'ELECTRONIC' | 'PRINT';
}

interface CountryConfig {
  name: string; code: string; court: string; idLabel: string; currency: string;
  articles: { intro: string; engagement: string; workDuration: string; termination: string; };
}

interface SavedContract {
  id: string; employeeName: string; jobTitle: string; contractType: string; mode: string;
  createdAt: string; data: FormData; signed?: boolean;
  employerSignature?: string; employeeSignature?: string;
}

// --- PAYS ---
const COUNTRIES: Record<'SENEGAL' | 'BURUNDI', CountryConfig> = {
  SENEGAL: {
    name: "Sénégal", code: "Loi n° 97-17 du 1er décembre 1997 portant Code du Travail",
    court: "Tribunal de Dakar", idLabel: "NINEA", currency: "FCFA",
    articles: {
      intro: "Vu le Code du Travail Sénégalais,",
      engagement: "Conformément aux dispositions des articles L.23 à L.37 du Code du Travail relatifs au contrat de travail,",
      workDuration: "En application des dispositions relatives à la durée du travail prévues par le Code du Travail sénégalais,",
      termination: "Conformément aux dispositions du Code du Travail sénégalais relatives à la rupture du contrat de travail,"
    }
  },
  BURUNDI: {
    name: "Burundi", code: "Loi n° 1/11 du 24 novembre 2020 portant Code du Travail du Burundi",
    court: "Tribunal de Bujumbura", idLabel: "NIF", currency: "FBu",
    articles: {
      intro: "Vu le Code du Travail du Burundi,",
      engagement: "Conformément aux dispositions du Code du Travail burundais en vigueur relatives au contrat de travail,",
      workDuration: "En application des dispositions relatives à la durée du travail prévues par le Code du Travail burundais,",
      termination: "Conformément aux dispositions du Code du Travail burundais relatives à la résiliation et au préavis,"
    }
  }
};

// --- STYLES ---
const globalStyles = `
  @keyframes hexFloat {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-12px) rotate(180deg); }
  }
  @keyframes slideInDown {
    from { transform: translateY(-8px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes expandDown {
    from { max-height: 0; opacity: 0; }
    to { max-height: 3000px; opacity: 1; }
  }
  .hex-float { animation: hexFloat 6s ease-in-out infinite; will-change: transform; }
  .notif-anim { animation: slideInDown 0.25s ease-out; }
  .fade-in { animation: fadeIn 0.2s ease-out; }
  .expand-down { animation: expandDown 0.35s ease-out forwards; overflow: hidden; }
  .glass {
    background: rgba(0, 20, 40, 0.55);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(0, 229, 255, 0.15);
    transition: border-color 0.25s, box-shadow 0.25s, transform 0.2s;
  }
  .glass:hover { border-color: rgba(0, 229, 255, 0.3); }
  .glass-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(0, 229, 255, 0.12);
  }
  .gold-card {
    background: linear-gradient(135deg, rgba(255,215,0,0.07), rgba(255,165,0,0.07));
    border: 1px solid rgba(255,215,0,0.2);
  }
  .input-field {
    background: rgba(0,0,0,0.55);
    border: 1px solid rgba(0,229,255,0.25);
    border-radius: 12px;
    padding: 12px;
    font-size: 14px;
    color: #fff;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    width: 100%;
  }
  .input-field:focus {
    border-color: rgba(0,229,255,0.6);
    box-shadow: 0 0 0 3px rgba(0,229,255,0.1);
  }
  .input-field::placeholder { color: rgba(0,229,255,0.35); }
  html, body { overflow-x: hidden; scroll-behavior: smooth; }
`;

// --- MOTIF SVG LÉGER ---
const TechPattern = memo(() => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="tg" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        <circle cx="0" cy="0" r="1" fill="currentColor"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#tg)"/>
  </svg>
));
TechPattern.displayName = 'TechPattern';

// --- CHAMP INPUT ---
interface InputFieldProps {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; icon?: React.ReactNode;
  required?: boolean; disabled?: boolean; multiline?: boolean;
}
const InputField = memo(({ label, value, onChange, type = "text", placeholder = "...", icon, required = false, disabled = false, multiline = false }: InputFieldProps) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold text-cyan-300 uppercase flex items-center gap-1.5">
      {icon && <span className="text-cyan-400">{icon}</span>}
      {label}{required && <span className="text-red-400">*</span>}
    </label>
    {multiline ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        disabled={disabled} rows={3} className="input-field resize-none" />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        disabled={disabled} className="input-field" />
    )}
  </div>
));
InputField.displayName = 'InputField';

const InfoRow = memo(({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center border-b border-yellow-400/20 pb-1.5">
    <span className="text-[11px] text-yellow-300/70 font-bold uppercase">{label}</span>
    <span className="text-[11px] text-yellow-200 font-black">{value}</span>
  </div>
));
InfoRow.displayName = 'InfoRow';

// --- GENERATEUR PDF DIRECT (jsPDF texte — pas de html2canvas) ---
function buildPDF(data: FormData, config: CountryConfig, signatures: { employer: string; employee: string }): jsPDF {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const PW = 210, PH = 297, ML = 25, MR = 25, MT = 25, MB = 25;
  const CW = PW - ML - MR;
  let y = MT;
  let page = 1;

  const checkY = (need: number) => {
    if (y + need > PH - MB) {
      pdf.addPage();
      page++;
      y = MT;
      // Numéro de page
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Page ${page}`, PW / 2, PH - 10, { align: 'center' });
    }
  };

  const nl = (size: number, mult = 1.4) => size * 0.3528 * mult + 1;

  const addText = (
    text: string, size: number = 11, style: 'normal' | 'bold' | 'italic' = 'normal',
    align: 'left' | 'center' | 'right' = 'left', color: [number, number, number] = [30, 30, 30]
  ) => {
    pdf.setFont('helvetica', style);
    pdf.setFontSize(size);
    pdf.setTextColor(...color);
    const lines = pdf.splitTextToSize(text, CW);
    const lineH = nl(size);
    checkY(lines.length * lineH + 2);
    const x = align === 'center' ? PW / 2 : align === 'right' ? PW - MR : ML;
    pdf.text(lines, x, y, { align });
    y += lines.length * lineH;
    return lines.length;
  };

  const addSpacer = (mm: number = 4) => { y += mm; };

  const addLine = (color: [number, number, number] = [0, 180, 220]) => {
    checkY(3);
    pdf.setDrawColor(...color);
    pdf.setLineWidth(0.4);
    pdf.line(ML, y, PW - MR, y);
    y += 4;
  };

  const addArticle = (title: string, body: string) => {
    checkY(20);
    pdf.setFillColor(0, 180, 220);
    pdf.rect(ML, y - 1, 2.5, nl(11) + 1, 'F');
    addText(title, 11, 'bold', 'left', [0, 130, 180]);
    addSpacer(2);
    addText(body, 10, 'normal', 'left', [30, 30, 30]);
    addSpacer(5);
  };

  // ─── EN-TÊTE ─────────────────────────────────────────────
  // Bandeau titre
  pdf.setFillColor(0, 20, 50);
  pdf.rect(0, 0, PW, 22, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(0, 229, 255);
  const mainTitle = data.jobType === 'STAGE' ? 'CONVENTION DE STAGE' : 'CONTRAT DE TRAVAIL';
  pdf.text(mainTitle, PW / 2, 10, { align: 'center' });
  pdf.setFontSize(9);
  pdf.setTextColor(150, 200, 255);
  pdf.text(`RÉGIME : ${data.jobType}  •  ${config.name.toUpperCase()}  •  ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`, PW / 2, 17, { align: 'center' });
  y = 30;

  // Logo si présent
  if (data.compLogo) {
    try {
      const ext = data.compLogo.startsWith('data:image/png') ? 'PNG' : 'JPEG';
      pdf.addImage(data.compLogo, ext, ML, y, 22, 22);
    } catch { /* logo skip si erreur */ }
  }

  // Nom et description société
  const logoOffset = data.compLogo ? 26 : 0;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(0, 50, 100);
  pdf.text(data.compName, ML + logoOffset, y + 7);
  if (data.compDescription) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    const descLines = pdf.splitTextToSize(data.compDescription, CW - logoOffset);
    pdf.text(descLines.slice(0, 2), ML + logoOffset, y + 13);
  }
  y += 28;

  addLine([0, 180, 220]);

  // ─── PARTIES ─────────────────────────────────────────────
  addText('ENTRE LES SOUSSIGNÉS :', 11, 'bold', 'left', [0, 50, 100]);
  addSpacer(3);

  const capitalClause = data.showCapital && data.compCapital ? `, au capital social de ${data.compCapital} ${config.currency}` : '';
  const foreignerClause = data.isForeigner && data.empWorkPermit ? `, titulaire du permis de travail n°${data.empWorkPermit}` : '';

  addText(
    `La société ${data.compName}, ${data.compType}${capitalClause}, dont le siège social est situé à ${data.compAddr}, immatriculée au RCCM sous le numéro ${data.compRCCM} et identifiée au ${config.idLabel} sous le numéro ${data.compID}, représentée par M./Mme ${data.bossName} en sa qualité de ${data.bossTitle}.`,
    10, 'normal', 'left'
  );
  addSpacer(2);
  addText(`Ci-après dénommée « L'EMPLOYEUR »`, 10, 'italic', 'right', [80, 80, 80]);
  addSpacer(2);
  addText('D\'UNE PART,', 10, 'bold', 'center', [0, 50, 100]);
  addSpacer(2);
  addText('ET :', 10, 'bold', 'center', [0, 50, 100]);
  addSpacer(2);

  addText(
    `M./Mme ${data.empName}, né(e) le ${data.empBirth ? new Date(data.empBirth).toLocaleDateString('fr-FR') : '—'} à ${data.empBirthPlace}, de nationalité ${data.empNation}${foreignerClause}, titulaire de la pièce d'identité n°${data.empID}, demeurant à ${data.empAddr}, joignable au ${data.empPhone}.`,
    10, 'normal', 'left'
  );
  addSpacer(2);
  const salLabel = data.jobType === 'STAGE' ? 'LE STAGIAIRE' : 'LE SALARIÉ';
  addText(`Ci-après dénommé(e) « ${salLabel} »`, 10, 'italic', 'right', [80, 80, 80]);
  addSpacer(2);
  addText('D\'AUTRE PART,', 10, 'bold', 'center', [0, 50, 100]);
  addSpacer(4);
  addLine([200, 200, 200]);
  addText('IL A ÉTÉ ARRÊTÉ ET CONVENU CE QUI SUIT :', 11, 'bold', 'center', [0, 50, 100]);
  addSpacer(6);

  // ─── ARTICLES ─────────────────────────────────────────────
  addArticle(
    'ARTICLE 1 : OBJET ET CADRE LÉGAL',
    `Le présent contrat est conclu sous le régime du ${config.code}.\n\n${config.articles.intro}\n${config.articles.engagement}\n\nLe présent contrat définit les conditions d'engagement et d'emploi du ${data.jobType === 'STAGE' ? 'Stagiaire' : 'Salarié'} au sein de la société ${data.compName}.`
  );

  let contractTypeText = data.jobType === 'CDI' ? 'indéterminée (CDI)' : data.jobType === 'CDD' ? 'déterminée (CDD)' : 'CONVENTION DE STAGE';
  let specificPart = '';
  if (data.jobType === 'CDI' && data.jobDescription) specificPart = `\n\nTâches confiées : ${data.jobDescription}.`;
  if (data.jobType === 'CDD' && data.cddReason) specificPart = `\n\nMotif du CDD : ${data.cddReason}.`;
  if (data.jobType === 'STAGE' && data.stageTasks) specificPart = `\n\nMissions du stage : ${data.stageTasks}.`;

  addArticle(
    'ARTICLE 2 : NATURE ET FONCTIONS',
    `Le ${data.jobType === 'STAGE' ? 'Stagiaire' : 'Salarié'} est recruté en qualité de ${data.jobTitle} au sein du département ${data.jobDept}.\n\nLieu d'exercice : ${data.jobLocation}.\n\nType de contrat : à durée ${contractTypeText}.${specificPart}\n\nLe ${data.jobType === 'STAGE' ? 'Stagiaire' : 'Salarié'} s'engage à exercer ses fonctions avec diligence, compétence et loyauté, conformément aux directives de l'Employeur et aux usages de la profession.`
  );

  const bonusText = data.bonus ? `\n\nAvantages complémentaires : ${data.bonus}.` : '';
  const remuBody = data.jobType === 'STAGE'
    ? `Le Stagiaire percevra une gratification mensuelle de ${data.stageAllowance} ${config.currency}.${bonusText}\n\n${config.articles.workDuration} la durée hebdomadaire de travail est fixée à ${data.hours} heures.`
    : `En contrepartie de l'exécution de ses fonctions, le Salarié percevra une rémunération mensuelle brute de ${data.salary} ${config.currency}.\n\nCette rémunération est versée mensuellement par virement bancaire, sous réserve des retenues légales applicables.${bonusText}\n\n${config.articles.workDuration} la durée hebdomadaire de travail est fixée à ${data.hours} heures.`;

  addArticle('ARTICLE 3 : RÉMUNÉRATION', remuBody);

  const endDateText = (data.jobType === 'CDD' || data.jobType === 'STAGE') && data.endDate
    ? ` et prendra fin le ${new Date(data.endDate).toLocaleDateString('fr-FR')}` : '';
  const trialText = data.jobType !== 'STAGE'
    ? `\n\nUne période d'essai de ${data.trial} mois est prévue. Durant cette période, chacune des parties peut mettre fin au contrat sans préavis ni indemnité, conformément aux dispositions légales en vigueur.\n\nÀ l'issue de la période d'essai, si aucune des parties n'a manifesté sa volonté de rompre le contrat, celui-ci se poursuivra dans les conditions définies aux présentes.` : '';

  addArticle(
    `ARTICLE 4 : DURÉE DU CONTRAT${data.jobType !== 'STAGE' ? ' ET PÉRIODE D\'ESSAI' : ''}`,
    `Le présent contrat prend effet à compter du ${data.startDate ? new Date(data.startDate).toLocaleDateString('fr-FR') : '—'}${endDateText}.${trialText}`
  );

  addArticle(
    'ARTICLE 5 : OBLIGATIONS DES PARTIES',
    `L'Employeur s'engage à :\n— Fournir au ${data.jobType === 'STAGE' ? 'Stagiaire' : 'Salarié'} un travail conforme à ses qualifications\n— Verser la rémunération convenue aux échéances prévues\n— Respecter l'ensemble des dispositions légales et conventionnelles applicables\n— Assurer la sécurité et la protection de la santé du ${data.jobType === 'STAGE' ? 'Stagiaire' : 'Salarié'}\n\nLe ${data.jobType === 'STAGE' ? 'Stagiaire' : 'Salarié'} s'engage à :\n— Exécuter personnellement les missions confiées\n— Respecter les directives de l'Employeur et le règlement intérieur\n— Observer une obligation de loyauté et de confidentialité\n— Consacrer l'intégralité de son activité professionnelle à l'Employeur`
  );

  let artNum = 6;
  if (data.hasNonCompete && data.jobType !== 'STAGE') {
    addArticle(
      `ARTICLE ${artNum} : CLAUSE DE NON-CONCURRENCE`,
      `Le Salarié s'engage, pendant une durée de ${data.nonCompeteDuration} suivant la cessation du présent contrat, quelle qu'en soit la cause, à ne pas exercer, directement ou indirectement, une activité concurrente à celle de l'Employeur.\n\nCette obligation s'applique sur le territoire du ${config.name} et concerne toute activité similaire ou connexe à celle exercée au sein de la société ${data.compName}.\n\nEn contrepartie, le Salarié percevra une indemnité compensatrice dont les modalités seront définies conformément aux dispositions légales applicables.`
    );
    artNum++;
  }

  const ruptureBody = data.jobType === 'STAGE'
    ? `Le présent stage prendra fin à la date prévue sans nécessité de préavis. En cas de manquement grave aux obligations du Stagiaire, l'Employeur se réserve le droit de mettre fin au stage de manière anticipée.`
    : `${config.articles.termination}\n\nLa suspension du contrat de travail pourra intervenir dans les cas prévus par la loi (maladie, maternité, accident du travail, etc.).\n\nLa rupture du contrat devra respecter les dispositions légales relatives au préavis, aux indemnités et aux formalités applicables.\n\nEn cas de rupture, le Salarié restituera à l'Employeur l'ensemble des documents, matériels et équipements mis à sa disposition.`;

  addArticle(`ARTICLE ${artNum} : ${data.jobType === 'STAGE' ? 'FIN DU STAGE' : 'RUPTURE DU CONTRAT'}`, ruptureBody);
  artNum++;

  addArticle(
    `ARTICLE ${artNum} : LITIGES`,
    `En cas de différend relatif à l'interprétation ou à l'exécution du présent contrat, les parties s'efforceront de trouver une solution amiable.\n\nÀ défaut d'accord amiable, tout litige relèvera de la compétence exclusive du ${config.court}, conformément aux dispositions légales applicables en matière de contentieux du travail.`
  );

  // ─── SIGNATURES ──────────────────────────────────────────
  checkY(80);
  addLine([200, 200, 200]);
  addText(`Fait à ${data.compAddr.split(',')[0].trim()}, le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`, 10, 'normal');
  addSpacer(3);
  addText(`En deux exemplaires originaux, dont un remis au ${data.jobType === 'STAGE' ? 'Stagiaire' : 'Salarié'}.`, 10, 'normal');
  addSpacer(8);

  // Bloc signatures côte à côte
  const sigBoxW = (CW / 2) - 6;
  const sigBoxH = 35;
  checkY(sigBoxH + 25);

  // Boîte gauche
  pdf.setDrawColor(0, 180, 220);
  pdf.setLineWidth(0.4);
  pdf.rect(ML, y, sigBoxW, sigBoxH);
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10); pdf.setTextColor(0, 50, 100);
  pdf.text("L'EMPLOYEUR", ML + sigBoxW / 2, y + 5, { align: 'center' });

  if (signatures.employer && data.documentMode === 'ELECTRONIC') {
    try {
      pdf.addImage(signatures.employer, 'PNG', ML + 5, y + 7, sigBoxW - 10, 18);
    } catch { /* skip */ }
    pdf.setFont('helvetica', 'italic'); pdf.setFontSize(7); pdf.setTextColor(100, 100, 100);
    pdf.text('Signature électronique', ML + sigBoxW / 2, y + 29, { align: 'center' });
  }
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); pdf.setTextColor(30, 30, 30);
  pdf.text(data.bossName || '_______________', ML + sigBoxW / 2, y + sigBoxH - 6, { align: 'center' });
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(80, 80, 80);
  pdf.text(data.bossTitle, ML + sigBoxW / 2, y + sigBoxH - 2, { align: 'center' });

  // Boîte droite
  const rx = ML + sigBoxW + 12;
  pdf.setDrawColor(0, 180, 220); pdf.setLineWidth(0.4);
  pdf.rect(rx, y, sigBoxW, sigBoxH);
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10); pdf.setTextColor(0, 50, 100);
  pdf.text(data.jobType === 'STAGE' ? 'LE STAGIAIRE' : 'LE SALARIÉ', rx + sigBoxW / 2, y + 5, { align: 'center' });

  if (signatures.employee && data.documentMode === 'ELECTRONIC') {
    try {
      pdf.addImage(signatures.employee, 'PNG', rx + 5, y + 7, sigBoxW - 10, 18);
    } catch { /* skip */ }
    pdf.setFont('helvetica', 'italic'); pdf.setFontSize(7); pdf.setTextColor(100, 100, 100);
    pdf.text('Signature électronique', rx + sigBoxW / 2, y + 29, { align: 'center' });
  }
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); pdf.setTextColor(30, 30, 30);
  pdf.text(data.empName || '_______________', rx + sigBoxW / 2, y + sigBoxH - 6, { align: 'center' });
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(80, 80, 80);
  pdf.text(data.jobTitle, rx + sigBoxW / 2, y + sigBoxH - 2, { align: 'center' });

  y += sigBoxH + 12;

  // ─── PIED DE PAGE ─────────────────────────────────────────
  pdf.setDrawColor(220, 220, 220); pdf.setLineWidth(0.3);
  pdf.line(ML, PH - 18, PW - MR, PH - 18);
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7); pdf.setTextColor(160, 160, 160);
  const footer = data.documentMode === 'ELECTRONIC'
    ? 'Document généré via ECODREUM Intelligence — Ne se substitue pas à un conseil juridique personnalisé'
    : data.compName;
  pdf.text(footer, PW / 2, PH - 12, { align: 'center' });
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(7); pdf.setTextColor(0, 180, 220);
  pdf.text('Page 1', PW / 2, PH - 7, { align: 'center' });

  return pdf;
}

// --- GENERATEUR WORD (MSO HTML — compatibilité native Word) ---
function buildWordDocument(data: FormData, config: CountryConfig): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const fmt = (d: string) => { try { return new Date(d).toLocaleDateString('fr-FR'); } catch { return d; } };
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  const capitalClause = data.showCapital && data.compCapital ? `, au capital social de ${data.compCapital} ${config.currency}` : '';
  const foreignerClause = data.isForeigner && data.empWorkPermit ? `, titulaire du permis de travail n°${data.empWorkPermit}` : '';
  const endDateText = (data.jobType === 'CDD' || data.jobType === 'STAGE') && data.endDate ? ` et prendra fin le ${fmt(data.endDate)}` : '';
  const salLabel = data.jobType === 'STAGE' ? 'STAGIAIRE' : 'SALARIÉ';
  const mainTitle = data.jobType === 'STAGE' ? 'CONVENTION DE STAGE' : 'CONTRAT DE TRAVAIL';

  let specificClause = '';
  if (data.jobType === 'CDI' && data.jobDescription) specificClause = `<p class="body">Tâches confiées : ${esc(data.jobDescription)}.</p>`;
  if (data.jobType === 'CDD' && data.cddReason) specificClause = `<p class="body">Motif du CDD : ${esc(data.cddReason)}.</p>`;
  if (data.jobType === 'STAGE' && data.stageTasks) specificClause = `<p class="body">Missions du stage : ${esc(data.stageTasks)}.</p>`;

  const contractTypeText = data.jobType === 'CDI' ? 'indéterminée (CDI)' : data.jobType === 'CDD' ? 'déterminée (CDD)' : 'CONVENTION DE STAGE';
  const bonusHtml = data.bonus ? `<p class="body">Avantages complémentaires : ${esc(data.bonus)}.</p>` : '';
  const remuHtml = data.jobType === 'STAGE'
    ? `<p class="body">Le Stagiaire percevra une gratification mensuelle de <b>${esc(data.stageAllowance)} ${config.currency}</b>.${bonusHtml}</p>`
    : `<p class="body">En contrepartie de l'exécution de ses fonctions, le Salarié percevra une rémunération mensuelle brute de <b>${esc(data.salary)} ${config.currency}</b>.</p><p class="body">Cette rémunération est versée mensuellement par virement bancaire, sous réserve des retenues légales applicables.</p>${bonusHtml}`;

  const trialHtml = data.jobType !== 'STAGE'
    ? `<p class="body">Une période d'essai de <b>${esc(data.trial)} mois</b> est prévue. Durant cette période, chacune des parties peut mettre fin au contrat sans préavis ni indemnité, conformément aux dispositions légales en vigueur.</p>` : '';

  let artNum = 6;
  let nonCompeteHtml = '';
  if (data.hasNonCompete && data.jobType !== 'STAGE') {
    nonCompeteHtml = `
      <h2 class="article">ARTICLE ${artNum} : CLAUSE DE NON-CONCURRENCE</h2>
      <p class="body">Le Salarié s'engage, pendant une durée de <b>${esc(data.nonCompeteDuration)}</b> suivant la cessation du présent contrat, à ne pas exercer une activité concurrente à celle de l'Employeur sur le territoire du ${esc(config.name)}.</p>
      <p class="body">En contrepartie, le Salarié percevra une indemnité compensatrice dont les modalités seront définies conformément aux dispositions légales applicables.</p>`;
    artNum++;
  }

  const ruptureHtml = data.jobType === 'STAGE'
    ? `<p class="body">Le présent stage prendra fin à la date prévue sans nécessité de préavis. En cas de manquement grave, l'Employeur se réserve le droit de mettre fin au stage de manière anticipée.</p>`
    : `<p class="body">${esc(config.articles.termination)}</p><p class="body">La suspension du contrat de travail pourra intervenir dans les cas prévus par la loi (maladie, maternité, accident du travail, etc.).</p><p class="body">La rupture du contrat devra respecter les dispositions légales relatives au préavis, aux indemnités et aux formalités applicables.</p>`;

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:w="urn:schemas-microsoft-com:office:word"
  xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8"/>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
  <!--[if gte mso 9]>
  <xml><w:WordDocument><w:View>Normal</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml>
  <![endif]-->
  <style>
    @page WordSection1 {
      size: 21cm 29.7cm;
      margin: 2.5cm 2.5cm 2.5cm 2.5cm;
      mso-page-orientation: portrait;
    }
    div.WordSection1 { page: WordSection1; }
    body { font-family: "Times New Roman", serif; font-size: 11pt; color: #1e1e1e; line-height: 1.6; }
    h1 { font-family: Arial, sans-serif; font-size: 18pt; font-weight: bold; text-align: center; color: #00264d; margin-top: 0; margin-bottom: 4pt; }
    h2.regime { font-family: Arial, sans-serif; font-size: 12pt; text-align: center; color: #336699; margin: 0 0 16pt 0; }
    h2.article { font-family: Arial, sans-serif; font-size: 11pt; font-weight: bold; color: #005580; margin-top: 14pt; margin-bottom: 4pt; border-left: 3pt solid #00b4e0; padding-left: 6pt; }
    p.body { text-align: justify; margin: 4pt 0; }
    p.center { text-align: center; font-weight: bold; color: #00264d; }
    p.right-italic { text-align: right; font-style: italic; color: #555; }
    hr.main { border: none; border-top: 1.5pt solid #00b4e0; margin: 10pt 0; }
    hr.light { border: none; border-top: 0.5pt solid #ccc; margin: 8pt 0; }
    .bold { font-weight: bold; }
    table.sig { width: 100%; border-collapse: collapse; margin-top: 20pt; }
    table.sig td { width: 50%; padding: 8pt; vertical-align: top; }
    .sig-box { border-bottom: 1pt solid #000; height: 55pt; }
    .sig-label { font-weight: bold; text-align: center; color: #00264d; font-family: Arial, sans-serif; }
    .sig-name { text-align: center; margin-top: 4pt; font-weight: bold; }
    .sig-title { text-align: center; color: #555; font-size: 9pt; }
    .footer { font-size: 8pt; color: #999; text-align: center; margin-top: 20pt; border-top: 0.5pt solid #ddd; padding-top: 6pt; }
    .parties { margin: 8pt 0; }
  </style>
</head>
<body>
<div class="WordSection1">

<h1>${esc(mainTitle)}</h1>
<h2 class="regime">RÉGIME : ${data.jobType} — ${esc(config.name)} — ${today}</h2>

<hr class="main"/>

<p class="center">ENTRE LES SOUSSIGNÉS :</p>

<div class="parties">
<p class="body">La société <span class="bold">${esc(data.compName)}</span>, ${esc(data.compType)}${esc(capitalClause)}, dont le siège social est situé à <span class="bold">${esc(data.compAddr)}</span>, immatriculée au RCCM sous le numéro <span class="bold">${esc(data.compRCCM)}</span> et identifiée au ${esc(config.idLabel)} sous le numéro <span class="bold">${esc(data.compID)}</span>, représentée par M./Mme <span class="bold">${esc(data.bossName)}</span> en sa qualité de <span class="bold">${esc(data.bossTitle)}</span>, dûment habilité(e) aux fins des présentes.</p>
<p class="right-italic">Ci-après dénommée « <b>L'EMPLOYEUR</b> »</p>
</div>

<p class="center">D'UNE PART,</p>
<p class="center">ET :</p>

<div class="parties">
<p class="body">M./Mme <span class="bold">${esc(data.empName)}</span>, né(e) le <span class="bold">${fmt(data.empBirth)}</span> à <span class="bold">${esc(data.empBirthPlace)}</span>, de nationalité <span class="bold">${esc(data.empNation)}</span>${esc(foreignerClause)}, titulaire de la pièce d'identité n°<span class="bold">${esc(data.empID)}</span>, demeurant à <span class="bold">${esc(data.empAddr)}</span>, joignable au <span class="bold">${esc(data.empPhone)}</span>.</p>
<p class="right-italic">Ci-après dénommé(e) « <b>LE ${esc(salLabel)}</b> »</p>
</div>

<p class="center">D'AUTRE PART,</p>

<hr class="light"/>
<p class="center">IL A ÉTÉ ARRÊTÉ ET CONVENU CE QUI SUIT :</p>
<hr class="light"/>

<h2 class="article">ARTICLE 1 : OBJET ET CADRE LÉGAL</h2>
<p class="body">Le présent contrat est conclu sous le régime du ${esc(config.code)}.</p>
<p class="body">${esc(config.articles.intro)}</p>
<p class="body">${esc(config.articles.engagement)}</p>
<p class="body">Le présent contrat définit les conditions d'engagement et d'emploi du ${data.jobType === 'STAGE' ? 'Stagiaire' : 'Salarié'} au sein de la société ${esc(data.compName)}.</p>

<h2 class="article">ARTICLE 2 : NATURE ET FONCTIONS</h2>
<p class="body">Le ${data.jobType === 'STAGE' ? 'Stagiaire' : 'Salarié'} est recruté en qualité de <b>${esc(data.jobTitle)}</b> au sein du département <b>${esc(data.jobDept)}</b>.</p>
<p class="body">Lieu d'exercice des fonctions : <b>${esc(data.jobLocation)}</b>.</p>
<p class="body">Type de contrat : à durée <b>${esc(contractTypeText)}</b>.</p>
${specificClause}
<p class="body">Le ${data.jobType === 'STAGE' ? 'Stagiaire' : 'Salarié'} s'engage à exercer ses fonctions avec diligence, compétence et loyauté.</p>

<h2 class="article">ARTICLE 3 : RÉMUNÉRATION</h2>
${remuHtml}
<p class="body">${esc(config.articles.workDuration)} la durée hebdomadaire de travail est fixée à <b>${esc(data.hours)} heures</b>.</p>

<h2 class="article">ARTICLE 4 : DURÉE DU CONTRAT${data.jobType !== 'STAGE' ? ' ET PÉRIODE D\'ESSAI' : ''}</h2>
<p class="body">Le présent contrat prend effet à compter du <b>${fmt(data.startDate)}</b>${esc(endDateText)}.</p>
${trialHtml}

<h2 class="article">ARTICLE 5 : OBLIGATIONS DES PARTIES</h2>
<p class="body"><b>L'Employeur s'engage à :</b><br/>
— Fournir au ${data.jobType === 'STAGE' ? 'Stagiaire' : 'Salarié'} un travail conforme à ses qualifications<br/>
— Verser la rémunération convenue aux échéances prévues<br/>
— Respecter l'ensemble des dispositions légales et conventionnelles applicables<br/>
— Assurer la sécurité et la protection de la santé du ${data.jobType === 'STAGE' ? 'Stagiaire' : 'Salarié'}</p>
<p class="body"><b>Le ${data.jobType === 'STAGE' ? 'Stagiaire' : 'Salarié'} s'engage à :</b><br/>
— Exécuter personnellement les missions qui lui sont confiées<br/>
— Respecter les directives de l'Employeur et le règlement intérieur<br/>
— Observer une obligation de loyauté et de confidentialité<br/>
— Consacrer l'intégralité de son activité professionnelle à l'Employeur</p>

${nonCompeteHtml}

<h2 class="article">ARTICLE ${artNum} : ${data.jobType === 'STAGE' ? 'FIN DU STAGE' : 'RUPTURE DU CONTRAT'}</h2>
${ruptureHtml}

<h2 class="article">ARTICLE ${artNum + 1} : LITIGES</h2>
<p class="body">En cas de différend relatif à l'interprétation ou à l'exécution du présent contrat, les parties s'efforceront de trouver une solution amiable. À défaut, tout litige relèvera de la compétence exclusive du <b>${esc(config.court)}</b>.</p>

<hr class="main"/>
<p class="body">Fait à <b>${esc(data.compAddr.split(',')[0].trim())}</b>, le <b>${today}</b></p>
<p class="body">En deux exemplaires originaux, dont un remis au ${data.jobType === 'STAGE' ? 'Stagiaire' : 'Salarié'}.</p>

<table class="sig">
  <tr>
    <td>
      <p class="sig-label">L'EMPLOYEUR</p>
      <div class="sig-box"></div>
      <p class="sig-name">${esc(data.bossName)}</p>
      <p class="sig-title">${esc(data.bossTitle)}</p>
    </td>
    <td>
      <p class="sig-label">LE ${esc(salLabel)}</p>
      <div class="sig-box"></div>
      <p class="sig-name">${esc(data.empName)}</p>
      <p class="sig-title">${esc(data.jobTitle)}</p>
    </td>
  </tr>
</table>

<div class="footer">
  <p>${data.documentMode === 'ELECTRONIC' ? 'Document généré via ECODREUM Intelligence — Ne se substitue pas à un conseil juridique personnalisé' : esc(data.compName)}</p>
</div>

</div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════
export default function GenerateurContrat() {
  const router = useRouter();
  const signatureCanvasEmployer = useRef<HTMLCanvasElement>(null);
  const signatureCanvasEmployee = useRef<HTMLCanvasElement>(null);

  const [activeSection, setActiveSection] = useState<'company' | 'employee' | 'contract' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [currentSigner, setCurrentSigner] = useState<'employer' | 'employee' | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showArchives, setShowArchives] = useState(false);
  const [savedContracts, setSavedContracts] = useState<SavedContract[]>([]);
  const [notif, setNotif] = useState<{ m: string; t: 's' | 'e' | 'w' } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [signatures, setSignatures] = useState({ employer: '', employee: '' });

  const [data, setData] = useState<FormData>({
    country: 'BURUNDI', documentMode: 'ELECTRONIC',
    compName: 'ECODREUM', compType: 'SARL', compCapital: '', showCapital: false,
    compAddr: 'Bujumbura, Rohero 1', compRCCM: '', compID: '',
    bossName: '', bossTitle: 'Gérant', compLogo: null, compDescription: '',
    empName: '', empBirth: '', empBirthPlace: '', empNation: 'Burundaise',
    isForeigner: false, empWorkPermit: '', empAddr: '', empID: '', empPhone: '',
    jobTitle: '', jobDept: 'Technique', jobType: 'CDI', jobLocation: '',
    salary: '0', bonus: '', stageAllowance: '', startDate: new Date().toISOString().split('T')[0],
    endDate: '', cddReason: '', jobDescription: '', stageTasks: '',
    trial: '3', hours: '40', hasNonCompete: false, nonCompeteDuration: ''
  });

  const config = COUNTRIES[data.country];

  // Hexagones mémorisés (pas de Math.random() sur chaque render)
  const hexagons = useMemo(() => Array.from({ length: 10 }, (_, i) => ({
    id: i,
    left: `${(i * 11 + 5) % 100}%`,
    top: `${(i * 17 + 8) % 100}%`,
    delay: `${(i * 0.6) % 4}s`,
    duration: `${5 + (i % 3)}s`
  })), []);

  // Injection styles une seule fois
  useEffect(() => {
    const el = document.createElement('style');
    el.id = 'contract-styles';
    el.textContent = globalStyles;
    if (!document.getElementById('contract-styles')) document.head.appendChild(el);
    return () => { const s = document.getElementById('contract-styles'); if (s) s.remove(); };
  }, []);

  // Bloquer scroll body sur modales
  useEffect(() => {
    document.body.style.overflow = (showSignatureModal || showArchives) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showSignatureModal, showArchives]);

  useEffect(() => { loadArchivedContracts(); }, []);

  const loadArchivedContracts = async () => {
    try {
      const { data: rows, error } = await supabase.from('contracts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (rows) {
        setSavedContracts(rows.map(c => ({
          id: c.id, employeeName: c.employee_name, jobTitle: c.job_title,
          contractType: c.contract_type, mode: c.mode, createdAt: c.created_at,
          data: c.data, signed: c.signed,
          employerSignature: c.employer_signature, employeeSignature: c.employee_signature
        })));
        return;
      }
    } catch { /* fallback */ }
    const stored = localStorage.getItem('ecodreum_contracts');
    if (stored) try { setSavedContracts(JSON.parse(stored)); } catch { /* ignore */ }
  };

  const saveContractToArchive = async (contractData: FormData, signed = false) => {
    const contract: SavedContract = {
      id: Date.now().toString(),
      employeeName: contractData.empName, jobTitle: contractData.jobTitle,
      contractType: contractData.jobType, mode: contractData.documentMode,
      createdAt: new Date().toISOString(), data: contractData, signed,
      employerSignature: signatures.employer, employeeSignature: signatures.employee
    };
    try {
      await supabase.from('contracts').insert([{
        id: contract.id, employee_name: contract.employeeName, job_title: contract.jobTitle,
        contract_type: contract.contractType, mode: contract.mode, created_at: contract.createdAt,
        data: contract.data, signed: contract.signed,
        employer_signature: contract.employerSignature, employee_signature: contract.employeeSignature
      }]);
    } catch { /* ignore supabase errors — fallback below */ }
    const updated = [contract, ...savedContracts];
    setSavedContracts(updated);
    localStorage.setItem('ecodreum_contracts', JSON.stringify(updated));
  };

  const deleteContract = async (id: string) => {
    try { await supabase.from('contracts').delete().eq('id', id); } catch { /* ignore */ }
    const updated = savedContracts.filter(c => c.id !== id);
    setSavedContracts(updated);
    localStorage.setItem('ecodreum_contracts', JSON.stringify(updated));
    showNotif('Contrat supprimé', 's');
  };

  const loadContract = (contract: SavedContract) => {
    setData(contract.data);
    if (contract.employerSignature) {
      setSignatures({ employer: contract.employerSignature, employee: contract.employeeSignature || '' });
    }
    setShowArchives(false);
    showNotif('Contrat chargé', 's');
  };

  // --- VALIDATION ---
  const isSectionComplete = useCallback((section: 'company' | 'employee' | 'contract'): boolean => {
    if (section === 'company') {
      const base = !!(data.compName.trim() && data.compType.trim() && data.compAddr.trim() &&
        data.compRCCM.trim() && data.compID.trim() && data.bossName.trim() && data.bossTitle.trim());
      return base && (!data.showCapital || !!data.compCapital.trim());
    }
    if (section === 'employee') {
      const base = !!(data.empName.trim() && data.empBirth.trim() && data.empBirthPlace.trim() &&
        data.empNation.trim() && data.empAddr.trim() && data.empID.trim() && data.empPhone.trim());
      return base && (!data.isForeigner || !!data.empWorkPermit.trim());
    }
    if (section === 'contract') {
      const base = !!(data.jobTitle.trim() && data.jobDept.trim() && data.jobLocation.trim() && data.startDate && data.hours.trim());
      if (data.jobType === 'STAGE') return !!(base && data.endDate && data.stageTasks.trim() && data.stageAllowance.trim());
      const salOk = !!(data.salary.trim() && parseFloat(data.salary) > 0);
      const nonComp = !data.hasNonCompete || !!data.nonCompeteDuration.trim();
      if (data.jobType === 'CDI') return !!(base && salOk && data.trial.trim() && data.jobDescription.trim() && nonComp);
      if (data.jobType === 'CDD') return !!(base && salOk && data.trial.trim() && data.endDate && data.cddReason.trim() && nonComp);
    }
    return false;
  }, [data]);

  const canAccessSection = useCallback((section: 'company' | 'employee' | 'contract'): boolean => {
    if (section === 'company') return true;
    if (section === 'employee') return isSectionComplete('company');
    if (section === 'contract') return isSectionComplete('company') && isSectionComplete('employee');
    return false;
  }, [isSectionComplete]);

  const validateForm = (): boolean => {
    const errors: string[] = [];
    if (!isSectionComplete('company')) errors.push('Section Entreprise incomplète');
    if (!isSectionComplete('employee')) errors.push('Section Salarié incomplète');
    if (!isSectionComplete('contract')) errors.push('Section Contrat incomplète');
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const getProgress = useMemo((): number => {
    const fields = ['compName','compType','compAddr','compRCCM','compID','bossName','bossTitle',
      'empName','empBirth','empBirthPlace','empNation','empAddr','empID','empPhone',
      'jobTitle','jobDept','jobLocation','startDate','hours','trial'];
    const filled = fields.filter(k => { const v = data[k as keyof FormData]; return v && v !== '' && v !== '0'; }).length;
    return Math.round((filled / fields.length) * 100);
  }, [data]);

  const getSectionProgress = useCallback((section: 'company' | 'employee' | 'contract'): number => {
    const map = {
      company: ['compName','compType','compAddr','compRCCM','compID','bossName','bossTitle'],
      employee: ['empName','empBirth','empBirthPlace','empNation','empAddr','empID','empPhone'],
      contract: ['jobTitle','jobDept','jobLocation','salary','startDate','trial','hours']
    };
    const flds = map[section];
    const filled = flds.filter(f => { const v = data[f as keyof FormData]; return v && v !== '' && v !== '0'; }).length;
    return Math.round((filled / flds.length) * 100);
  }, [data]);

  // --- HANDLERS ---
  const handleSectionClick = (section: 'company' | 'employee' | 'contract') => {
    if (!canAccessSection(section)) {
      if (section === 'employee') showNotif('Remplissez d\'abord la section Entreprise', 'w');
      else if (section === 'contract') showNotif(!isSectionComplete('company') ? 'Remplissez d\'abord la section Entreprise' : 'Remplissez d\'abord la section Salarié', 'w');
      return;
    }
    setActiveSection(s => s === section ? null : section);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => updateData('compLogo', ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const updateData = useCallback((field: keyof FormData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    setValidationErrors([]);
  }, []);

  const showNotif = (m: string, t: 's' | 'e' | 'w') => {
    setNotif({ m, t });
    setTimeout(() => setNotif(null), 4000);
  };

  // --- PDF ---
  const generatePDF = async () => {
    if (!validateForm()) { showNotif('Veuillez remplir tous les champs obligatoires', 'e'); return; }
    setIsGenerating(true);
    try {
      await new Promise(r => setTimeout(r, 50)); // let UI update
      const pdf = buildPDF(data, config, signatures);
      pdf.save(`CONTRAT_${data.empName.replace(/\s+/g, '_') || 'NOUVEAU'}_${Date.now()}.pdf`);
      await saveContractToArchive(data, !!(signatures.employer && signatures.employee));
      showNotif('PDF généré avec succès !', 's');
    } catch (err) {
      console.error(err);
      showNotif('Erreur lors de la génération du PDF', 'e');
    } finally {
      setIsGenerating(false);
    }
  };

  // --- WORD ---
  const generateWord = async () => {
    if (!validateForm()) { showNotif('Veuillez remplir tous les champs obligatoires', 'e'); return; }
    try {
      const html = buildWordDocument(data, config);
      const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CONTRAT_${data.empName.replace(/\s+/g, '_') || 'NOUVEAU'}_${Date.now()}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      await saveContractToArchive(data, false);
      showNotif('Document Word généré avec succès !', 's');
    } catch (err) {
      console.error(err);
      showNotif('Erreur lors de la génération du document Word', 'e');
    }
  };

  // --- SIGNATURE ---
  const getPoint = (canvas: HTMLCanvasElement, clientX: number, clientY: number) => {
    const r = canvas.getBoundingClientRect();
    return { x: (clientX - r.left) * (canvas.width / r.width), y: (clientY - r.top) * (canvas.height / r.height) };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = currentSigner === 'employer' ? signatureCanvasEmployer.current : signatureCanvasEmployee.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { clientX, clientY } = 'touches' in e ? e.touches[0] : e;
    const { x, y } = getPoint(canvas, clientX, clientY);
    ctx.beginPath(); ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = currentSigner === 'employer' ? signatureCanvasEmployer.current : signatureCanvasEmployee.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { clientX, clientY } = 'touches' in e ? e.touches[0] : e;
    const { x, y } = getPoint(canvas, clientX, clientY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y);
  };

  const stopDraw = () => setIsDrawing(false);

  const clearSig = () => {
    const canvas = currentSigner === 'employer' ? signatureCanvasEmployer.current : signatureCanvasEmployee.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveSig = () => {
    const canvas = currentSigner === 'employer' ? signatureCanvasEmployer.current : signatureCanvasEmployee.current;
    if (!canvas) return;
    const sig = canvas.toDataURL('image/png');
    setSignatures(prev => currentSigner === 'employer' ? { ...prev, employer: sig } : { ...prev, employee: sig });
    showNotif(`Signature ${currentSigner === 'employer' ? 'employeur' : 'salarié'} enregistrée`, 's');
    setShowSignatureModal(false); setCurrentSigner(null);
  };

  const openSigModal = (signer: 'employer' | 'employee') => {
    if (data.documentMode === 'PRINT') { showNotif('Activez le mode électronique pour signer', 'w'); return; }
    setCurrentSigner(signer);
    setShowSignatureModal(true);
    setTimeout(() => {
      const canvas = signer === 'employer' ? signatureCanvasEmployer.current : signatureCanvasEmployee.current;
      if (canvas) { const ctx = canvas.getContext('2d'); ctx?.fillRect(0, 0, canvas.width, canvas.height); if (ctx) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); } }
    }, 120);
  };

  // ─── RENDU ───────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#080d18 0%,#141929 50%,#080d18 100%)', overflowX: 'hidden' }}>

      {/* Hexagones de fond */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 0.04 }}>
        {hexagons.map(h => (
          <Hexagon key={h.id} size={28} className="absolute text-cyan-400 hex-float"
            style={{ left: h.left, top: h.top, animationDelay: h.delay, animationDuration: h.duration }} />
        ))}
      </div>

      <div className="max-w-5xl mx-auto p-3 md:p-5" style={{ position: 'relative', zIndex: 10 }}>

        {/* NOTIFICATION */}
        {notif && (
          <div className={`fixed top-4 left-1/2 z-[9999] notif-anim px-5 py-3 rounded-xl border backdrop-blur-xl shadow-xl flex items-center gap-2 ${notif.t === 's' ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300' : notif.t === 'w' ? 'bg-amber-500/20 border-amber-400/50 text-amber-300' : 'bg-red-500/20 border-red-400/50 text-red-300'}`}
            style={{ transform: 'translateX(-50%)' }}>
            {notif.t === 's' && <CheckCircle size={15} />}
            {notif.t === 'w' && <AlertTriangle size={15} />}
            {notif.t === 'e' && <AlertCircle size={15} />}
            <span className="text-xs font-bold uppercase">{notif.m}</span>
          </div>
        )}

        {/* HEADER */}
        <div className="glass rounded-2xl p-4 mb-5">
          <TechPattern />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-2.5 rounded-xl border border-cyan-400/30 hover:border-cyan-400/60 transition-colors" style={{ background: 'rgba(0,229,255,0.08)' }}>
                <ArrowLeft size={18} className="text-cyan-400" />
              </button>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Sparkles size={18} className="text-yellow-400" />
                  <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight" style={{ background: 'linear-gradient(90deg,#00e5ff,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CONTRACT ARCHITECT</h1>
                </div>
                <p className="text-[10px] font-bold text-cyan-400/50 uppercase tracking-widest">ECODREUM Legal Engine</p>
              </div>
            </div>
            <button onClick={() => setShowArchives(true)} className="gold-card px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Archive size={14} className="text-yellow-400" />
              <span className="text-yellow-100">Archives</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black text-yellow-300" style={{ background: 'rgba(255,215,0,0.15)' }}>{savedContracts.length}</span>
            </button>
          </div>
        </div>

        {/* MODE + JURIDICTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="glass rounded-2xl p-4">
            <TechPattern />
            <div className="relative z-10">
              <label className="text-[11px] font-bold text-cyan-400 uppercase mb-3 flex items-center gap-1.5">
                <Zap size={12} /> Mode de Document
              </label>
              <div className="flex gap-2">
                {(['ELECTRONIC', 'PRINT'] as const).map(m => (
                  <button key={m} onClick={() => updateData('documentMode', m)}
                    className={`flex-1 py-3 rounded-xl font-bold text-[11px] flex flex-col items-center gap-1 transition-all ${data.documentMode === m ? m === 'ELECTRONIC' ? 'text-black shadow-lg' : 'text-black shadow-lg' : 'text-cyan-300'}`}
                    style={data.documentMode === m ? { background: m === 'ELECTRONIC' ? 'linear-gradient(135deg,#00e5ff,#3b82f6)' : 'linear-gradient(135deg,#f59e0b,#f97316)' } : { background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,229,255,0.2)' }}>
                    {m === 'ELECTRONIC' ? <Zap size={15} /> : <Printer size={15} />}
                    {m === 'ELECTRONIC' ? 'Électronique' : 'Imprimer'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-4">
            <TechPattern />
            <div className="relative z-10">
              <label className="text-[11px] font-bold text-cyan-400 uppercase mb-3 flex items-center gap-1.5">
                <Globe size={12} /> Juridiction
              </label>
              <div className="flex gap-2">
                {(['SENEGAL', 'BURUNDI'] as const).map(c => (
                  <button key={c} onClick={() => updateData('country', c)}
                    className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${data.country === c ? 'text-black shadow-lg' : 'text-cyan-300'}`}
                    style={data.country === c ? { background: 'linear-gradient(135deg,#00e5ff,#3b82f6)' } : { background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,229,255,0.2)' }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PROGRESSION GLOBALE */}
        <div className="glass rounded-2xl p-4 mb-5">
          <TechPattern />
          <div className="relative z-10 flex items-center gap-4">
            <Sparkles size={14} className="text-cyan-400 shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between mb-1.5">
                <span className="text-[11px] font-bold text-cyan-400 uppercase">Progression Globale</span>
                <span className="text-base font-black text-cyan-300">{getProgress}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${getProgress}%`, background: 'linear-gradient(90deg,#00e5ff,#3b82f6)', boxShadow: '0 0 10px rgba(0,229,255,0.4)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ERREURS */}
        {validationErrors.length > 0 && (
          <div className="mb-5 rounded-2xl p-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)' }}>
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertCircle size={16} /><h3 className="text-sm font-black uppercase">Champs requis</h3>
            </div>
            {validationErrors.map((e, i) => <p key={i} className="text-xs text-red-300 pl-4">• {e}</p>)}
          </div>
        )}

        {/* ── SECTIONS ── */}
        <div className="space-y-3 mb-5">
          {[
            { id: 'company', label: 'Entreprise', icon: Building, color: 'from-emerald-500 to-teal-500', grad: 'linear-gradient(135deg,#10b981,#14b8a6)' },
            { id: 'employee', label: 'Salarié', icon: User, color: 'from-blue-500 to-cyan-500', grad: 'linear-gradient(135deg,#3b82f6,#06b6d4)' },
            { id: 'contract', label: 'Contrat', icon: Briefcase, color: 'from-amber-500 to-yellow-500', grad: 'linear-gradient(135deg,#f59e0b,#eab308)' }
          ].map(({ id, label, icon: Icon, grad }) => {
            const progress = getSectionProgress(id as any);
            const isActive = activeSection === id;
            const isComplete = isSectionComplete(id as any);
            const canAccess = canAccessSection(id as any);

            return (
              <div key={id}>
                {/* EN-TÊTE SECTION */}
                <div onClick={() => handleSectionClick(id as any)}
                  className={`glass rounded-2xl p-4 relative overflow-hidden transition-all ${canAccess ? 'cursor-pointer glass-hover' : 'cursor-not-allowed opacity-50'} ${isActive ? 'ring-1 ring-cyan-400' : ''}`}
                  style={isActive ? { boxShadow: '0 0 20px rgba(0,229,255,0.15)' } : {}}>
                  <TechPattern />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: grad }}>
                          <Icon size={22} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-base font-black uppercase text-white">{label}</h3>
                          <p className="text-[10px] text-cyan-300/60">{!canAccess ? 'Verrouillé' : isActive ? 'Ouvert — cliquez pour fermer' : 'Cliquez pour ouvrir'}</p>
                        </div>
                      </div>
                      {isComplete ? <CheckCircle size={18} className="text-emerald-400" /> : canAccess ? (isActive ? <Unlock size={18} className="text-cyan-400" /> : <Lock size={18} className="text-gray-500" />) : <Lock size={18} className="text-red-400/60" />}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)' }}>
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: grad }} />
                      </div>
                      <span className="text-[11px] font-bold text-cyan-300 w-10 text-right">{progress}%</span>
                    </div>
                  </div>
                </div>

                {/* FORMULAIRE DÉROULANT */}
                {isActive && canAccess && (
                  <div className="expand-down mt-3">
                    <div className="glass rounded-2xl p-5">
                      <TechPattern />
                      <div className="relative z-10 space-y-4">

                        {id === 'company' && (
                          <>
                            {/* Logo & description */}
                            <div className="gold-card rounded-xl p-4 space-y-4">
                              <h4 className="text-[11px] font-black uppercase text-yellow-400 flex items-center gap-1.5"><Sparkles size={11} /> Identité Visuelle (Optionnel)</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-[11px] font-bold text-yellow-300/80 uppercase mb-2 block">Logo</label>
                                  {data.compLogo ? (
                                    <div className="relative group inline-block">
                                      <div className="p-3 bg-white rounded-xl"><img src={data.compLogo} alt="Logo" className="w-20 h-20 object-contain" /></div>
                                      <button onClick={() => updateData('compLogo', null)} className="absolute -top-1.5 -right-1.5 p-1.5 bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow"><X size={10} className="text-white" /></button>
                                    </div>
                                  ) : (
                                    <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-yellow-400/25 rounded-xl cursor-pointer hover:border-yellow-400/50 transition-colors hover:bg-yellow-400/5">
                                      <Upload size={18} className="text-yellow-400 mb-1" /><span className="text-[11px] text-yellow-300">Charger</span>
                                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                    </label>
                                  )}
                                </div>
                                <InputField label="Description" value={data.compDescription} onChange={v => updateData('compDescription', v)} placeholder="Ex: Leader en solutions digitales..." multiline />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <InputField label="Raison Sociale" value={data.compName} onChange={v => updateData('compName', v)} icon={<Building size={11} />} required />
                              <InputField label="Forme Juridique" value={data.compType} onChange={v => updateData('compType', v)} placeholder="SARL, SA..." icon={<ShieldCheck size={11} />} required />
                            </div>
                            <div className="glass rounded-xl p-3 space-y-2">
                              <TechPattern />
                              <label className="flex items-center gap-2 cursor-pointer relative z-10">
                                <input type="checkbox" checked={data.showCapital} onChange={e => updateData('showCapital', e.target.checked)} className="w-4 h-4 accent-cyan-500" />
                                <span className="text-[11px] font-bold text-cyan-300 uppercase">Mentionner le capital social</span>
                              </label>
                              {data.showCapital && <InputField label="Capital Social" value={data.compCapital} onChange={v => updateData('compCapital', v)} placeholder={`1 000 000 ${config.currency}`} icon={<DollarSign size={11} />} required />}
                            </div>
                            <InputField label="Siège Social" value={data.compAddr} onChange={v => updateData('compAddr', v)} icon={<MapPin size={11} />} required />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <InputField label="RCCM" value={data.compRCCM} onChange={v => updateData('compRCCM', v)} placeholder="BJ/BGM/2024/A/123" icon={<FileText size={11} />} required />
                              <InputField label={config.idLabel} value={data.compID} onChange={v => updateData('compID', v)} icon={<Shield size={11} />} required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <InputField label="Représentant Légal" value={data.bossName} onChange={v => updateData('bossName', v)} icon={<User size={11} />} required />
                              <InputField label="Fonction" value={data.bossTitle} onChange={v => updateData('bossTitle', v)} placeholder="Gérant..." icon={<Award size={11} />} required />
                            </div>
                          </>
                        )}

                        {id === 'employee' && (
                          <>
                            <InputField label="Nom Complet" value={data.empName} onChange={v => updateData('empName', v)} icon={<User size={11} />} required />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <InputField label="Date de Naissance" type="date" value={data.empBirth} onChange={v => updateData('empBirth', v)} icon={<Calendar size={11} />} required />
                              <InputField label="Lieu de Naissance" value={data.empBirthPlace} onChange={v => updateData('empBirthPlace', v)} icon={<MapPin size={11} />} required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <InputField label="Nationalité" value={data.empNation} onChange={v => updateData('empNation', v)} icon={<Globe size={11} />} required />
                              <div className="glass rounded-xl p-3 flex items-center gap-2 relative">
                                <TechPattern />
                                <label className="flex items-center gap-2 cursor-pointer relative z-10">
                                  <input type="checkbox" checked={data.isForeigner} onChange={e => updateData('isForeigner', e.target.checked)} className="w-4 h-4 accent-cyan-500" />
                                  <span className="text-[11px] font-bold text-cyan-300 uppercase">Travailleur étranger</span>
                                </label>
                              </div>
                            </div>
                            {data.isForeigner && (
                              <div className="rounded-xl p-3" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)' }}>
                                <InputField label="Permis de Travail" value={data.empWorkPermit} onChange={v => updateData('empWorkPermit', v)} icon={<Shield size={11} />} required />
                              </div>
                            )}
                            <InputField label="Adresse" value={data.empAddr} onChange={v => updateData('empAddr', v)} icon={<MapPin size={11} />} required />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <InputField label="Pièce d'Identité" value={data.empID} onChange={v => updateData('empID', v)} icon={<FileText size={11} />} required />
                              <InputField label="Téléphone" type="tel" value={data.empPhone} onChange={v => updateData('empPhone', v)} icon={<User size={11} />} required />
                            </div>
                          </>
                        )}

                        {id === 'contract' && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-cyan-300 uppercase flex items-center gap-1.5"><Briefcase size={11} /> Type de Contrat *</label>
                                <select value={data.jobType} onChange={e => updateData('jobType', e.target.value as any)} className="input-field">
                                  <option value="CDI">CDI</option>
                                  <option value="CDD">CDD</option>
                                  <option value="STAGE">Stage</option>
                                </select>
                              </div>
                              <InputField label="Poste" value={data.jobTitle} onChange={v => updateData('jobTitle', v)} icon={<Briefcase size={11} />} required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <InputField label="Département" value={data.jobDept} onChange={v => updateData('jobDept', v)} icon={<Building size={11} />} required />
                              <InputField label="Lieu de Travail" value={data.jobLocation} onChange={v => updateData('jobLocation', v)} icon={<MapPin size={11} />} required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <InputField label="Date de Début" type="date" value={data.startDate} onChange={v => updateData('startDate', v)} icon={<Calendar size={11} />} required />
                              {(data.jobType === 'CDD' || data.jobType === 'STAGE') && (
                                <InputField label="Date de Fin" type="date" value={data.endDate} onChange={v => updateData('endDate', v)} icon={<Calendar size={11} />} required />
                              )}
                            </div>
                            {data.jobType === 'CDI' && (
                              <div className="rounded-xl p-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
                                <InputField label="Tâches Confiées" value={data.jobDescription} onChange={v => updateData('jobDescription', v)} icon={<FileText size={11} />} required multiline />
                              </div>
                            )}
                            {data.jobType === 'CDD' && (
                              <div className="rounded-xl p-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
                                <InputField label="Motif du CDD" value={data.cddReason} onChange={v => updateData('cddReason', v)} icon={<FileText size={11} />} required multiline />
                              </div>
                            )}
                            {data.jobType === 'STAGE' && (
                              <div className="rounded-xl p-3" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)' }}>
                                <InputField label="Missions du Stage" value={data.stageTasks} onChange={v => updateData('stageTasks', v)} icon={<FileText size={11} />} required multiline />
                              </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {data.jobType === 'STAGE' ? (
                                <InputField label={`Indemnité de Stage (${config.currency})`} type="number" value={data.stageAllowance} onChange={v => updateData('stageAllowance', v)} icon={<DollarSign size={11} />} required />
                              ) : (
                                <InputField label={`Salaire Brut (${config.currency})`} type="number" value={data.salary} onChange={v => updateData('salary', v)} icon={<DollarSign size={11} />} required />
                              )}
                              <InputField label="Primes / Avantages" value={data.bonus} onChange={v => updateData('bonus', v)} icon={<Award size={11} />} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <InputField label="Heures / Semaine" type="number" value={data.hours} onChange={v => updateData('hours', v)} icon={<Clock size={11} />} required />
                              {data.jobType !== 'STAGE' && (
                                <InputField label="Période d'Essai (mois)" type="number" value={data.trial} onChange={v => updateData('trial', v)} icon={<Calendar size={11} />} required />
                              )}
                            </div>
                            {data.jobType !== 'STAGE' && (
                              <div className="gold-card rounded-xl p-3 space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" checked={data.hasNonCompete} onChange={e => updateData('hasNonCompete', e.target.checked)} className="w-4 h-4 accent-yellow-500" />
                                  <span className="text-[11px] font-bold text-yellow-300 uppercase flex items-center gap-1.5"><Shield size={11} /> Clause de non-concurrence</span>
                                </label>
                                {data.hasNonCompete && (
                                  <InputField label="Durée" value={data.nonCompeteDuration} onChange={v => updateData('nonCompeteDuration', v)} placeholder="Ex : 12 mois" icon={<Shield size={11} />} required />
                                )}
                              </div>
                            )}
                          </>
                        )}

                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── PANNEAU ACTIONS ── */}
        <div className="glass rounded-2xl p-5 mb-8">
          <TechPattern />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'rgba(0,229,255,0.15)' }}>
              <CheckCircle size={18} className="text-cyan-400" />
              <h3 className="text-base font-black uppercase text-cyan-300">Actions</h3>
            </div>

            {/* Signatures */}
            {data.documentMode === 'ELECTRONIC' && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-black uppercase text-cyan-400 flex items-center gap-1.5"><PenTool size={11} /> Signatures Électroniques</h4>
                <div className="grid grid-cols-2 gap-2">
                  {(['employer', 'employee'] as const).map(s => (
                    <button key={s} onClick={() => openSigModal(s)}
                      className="py-3 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
                      style={signatures[s] ? { background: s === 'employer' ? 'linear-gradient(135deg,#10b981,#14b8a6)' : 'linear-gradient(135deg,#3b82f6,#06b6d4)', color: '#000' } : { background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(0,229,255,0.2)', color: '#67e8f9' }}>
                      <PenTool size={13} />
                      {signatures[s] ? `${s === 'employer' ? 'Employeur' : 'Salarié'} ✓` : s === 'employer' ? 'Employeur' : 'Salarié'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Export */}
            <div className="space-y-2 pt-3 border-t" style={{ borderColor: 'rgba(0,229,255,0.15)' }}>
              {data.documentMode === 'ELECTRONIC' ? (
                <button onClick={generatePDF} disabled={isGenerating}
                  className="w-full py-4 rounded-xl font-black uppercase text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:opacity-90 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg,#00e5ff,#3b82f6)', color: '#000', boxShadow: '0 4px 20px rgba(0,229,255,0.3)' }}>
                  {isGenerating ? <><div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" /><span>Génération...</span></> : <><Download size={17} /><span>Générer PDF</span></>}
                </button>
              ) : (
                <button onClick={generateWord}
                  className="w-full py-4 rounded-xl font-black uppercase text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)', color: '#000', boxShadow: '0 4px 20px rgba(245,158,11,0.3)' }}>
                  <Download size={17} /><span>Télécharger Word</span>
                </button>
              )}
            </div>

            {/* Récap */}
            <div className="pt-3 border-t space-y-2" style={{ borderColor: 'rgba(0,229,255,0.15)' }}>
              <div className="gold-card rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-yellow-400 mb-2">
                  <Scale size={13} /><span className="text-[11px] font-black uppercase">Récapitulatif</span>
                </div>
                <InfoRow label="Pays" value={config.name} />
                <InfoRow label="Devise" value={config.currency} />
                <InfoRow label="Type" value={data.jobType} />
                <InfoRow label="Mode" value={data.documentMode === 'ELECTRONIC' ? 'E-Sign' : 'Print'} />
              </div>
              <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)' }}>
                <AlertTriangle size={13} className="text-amber-400 mt-0.5 shrink-0" />
                <p className="text-[10px] text-amber-300/90 leading-relaxed">Document automatique — Ne remplace pas un conseil juridique</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── MODAL SIGNATURE ── */}
        {showSignatureModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}>
            <div className="glass rounded-2xl p-5 w-full max-w-2xl fade-in">
              <TechPattern />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-black uppercase text-cyan-300 flex items-center gap-2">
                    <PenTool size={20} /> Signature {currentSigner === 'employer' ? 'Employeur' : 'Salarié'}
                  </h3>
                  <button onClick={() => { setShowSignatureModal(false); setCurrentSigner(null); }}
                    className="p-2 rounded-xl transition-colors" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}>
                    <X size={18} />
                  </button>
                </div>
                <p className="text-[11px] text-cyan-300/70 mb-3 flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ background: 'rgba(0,229,255,0.07)', border: '1px solid rgba(0,229,255,0.15)' }}>
                  <Sparkles size={12} /> Signez dans l'espace blanc ci-dessous avec votre souris ou votre doigt
                </p>
                <div className="rounded-xl overflow-hidden shadow-2xl mb-4 bg-white" style={{ touchAction: 'none' }}>
                  <canvas ref={currentSigner === 'employer' ? signatureCanvasEmployer : signatureCanvasEmployee}
                    width={660} height={280}
                    onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                    onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
                    className="cursor-crosshair w-full" style={{ touchAction: 'none', display: 'block' }} />
                </div>
                <div className="flex gap-3">
                  <button onClick={clearSig} className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5' }}>
                    <Trash2 size={15} /> Effacer
                  </button>
                  <button onClick={saveSig} className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90" style={{ background: 'linear-gradient(135deg,#10b981,#14b8a6)', color: '#000' }}>
                    <Save size={15} /> Enregistrer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL ARCHIVES ── */}
        {showArchives && (
          <div className="fixed inset-0 z-[9999] overflow-y-auto p-4" style={{ background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(12px)' }}>
            <div className="max-w-5xl mx-auto my-6 fade-in">
              <div className="glass rounded-2xl p-5">
                <TechPattern />
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-2xl font-black uppercase text-cyan-300 flex items-center gap-3">
                      <Archive size={24} className="text-yellow-400" /> Archives ({savedContracts.length})
                    </h2>
                    <button onClick={() => setShowArchives(false)} className="px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                      <X size={16} /> Fermer
                    </button>
                  </div>
                  {savedContracts.length === 0 ? (
                    <div className="text-center py-16">
                      <Archive size={48} className="mx-auto mb-4" style={{ color: 'rgba(0,229,255,0.2)' }} />
                      <p className="text-cyan-300/50 font-bold">Aucun contrat archivé</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {savedContracts.map(c => (
                        <div key={c.id} className="glass rounded-xl p-4 space-y-3 glass-hover">
                          <TechPattern />
                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-black text-sm text-cyan-300">{c.employeeName || '—'}</h3>
                                <p className="text-[11px] text-cyan-400/60">{c.jobTitle}</p>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-lg font-bold" style={c.mode === 'ELECTRONIC' ? { background: 'rgba(0,229,255,0.12)', color: '#67e8f9' } : { background: 'rgba(245,158,11,0.12)', color: '#fcd34d' }}>
                                {c.mode === 'ELECTRONIC' ? 'E-Sign' : 'Print'}
                              </span>
                            </div>
                            <div className="text-[11px] space-y-1 pt-2 border-t" style={{ borderColor: 'rgba(0,229,255,0.15)', color: 'rgba(103,232,249,0.65)' }}>
                              <div className="flex justify-between"><span>Type</span><span className="font-bold text-cyan-300">{c.contractType}</span></div>
                              <div className="flex justify-between"><span>Date</span><span className="font-bold text-cyan-300">{new Date(c.createdAt).toLocaleDateString('fr-FR')}</span></div>
                              {c.signed && <div className="flex items-center gap-1 text-emerald-400 font-bold pt-1"><CheckCircle size={11} /> Signé</div>}
                            </div>
                            <div className="flex gap-2 pt-3">
                              <button onClick={() => loadContract(c)} className="flex-1 py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd' }}>
                                <Upload size={11} /> Charger
                              </button>
                              <button onClick={() => deleteContract(c.id)} className="p-2 rounded-lg transition-colors" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                                <Trash2 size={13} />
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

      </div>
    </div>
  );
}
