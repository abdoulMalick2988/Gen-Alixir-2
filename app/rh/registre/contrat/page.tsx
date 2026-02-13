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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

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
  fileUrl?: string; fileType?: string;
}

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

function numberToFrenchWords(n: number): string {
  if (isNaN(n) || n < 0) return '';
  if (n === 0) return 'Zéro';
  const units = ['', 'Un', 'Deux', 'Trois', 'Quatre', 'Cinq', 'Six', 'Sept', 'Huit', 'Neuf',
    'Dix', 'Onze', 'Douze', 'Treize', 'Quatorze', 'Quinze', 'Seize', 'Dix-Sept', 'Dix-Huit', 'Dix-Neuf'];
  const tens = ['', '', 'Vingt', 'Trente', 'Quarante', 'Cinquante', 'Soixante', 'Soixante', 'Quatre-Vingt', 'Quatre-Vingt'];
  function convertBelow100(num: number): string {
    if (num < 20) return units[num];
    const t = Math.floor(num / 10);
    const u = num % 10;
    if (t === 7 || t === 9) {
      const base = t === 7 ? 'Soixante' : 'Quatre-Vingt';
      const remainder = 10 + u;
      if (remainder === 11 && t === 7) return base + ' et Onze';
      return base + '-' + units[remainder];
    }
    if (u === 0) { if (t === 8) return 'Quatre-Vingts'; return tens[t]; }
    if (u === 1 && t !== 8) return tens[t] + ' et Un';
    return tens[t] + '-' + units[u];
  }
  function convertBelow1000(num: number): string {
    if (num < 100) return convertBelow100(num);
    const h = Math.floor(num / 100);
    const remainder = num % 100;
    let result = h === 1 ? 'Cent' : units[h] + ' Cent';
    if (remainder === 0) { if (h > 1) result = units[h] + ' Cents'; return result; }
    return result + ' ' + convertBelow100(remainder);
  }
  const chunks: { value: number; name: string; plural: string }[] = [
    { value: 1000000000, name: 'Milliard', plural: 'Milliards' },
    { value: 1000000, name: 'Million', plural: 'Millions' },
    { value: 1000, name: 'Mille', plural: 'Mille' },
    { value: 1, name: '', plural: '' },
  ];
  let result = '';
  let remaining = Math.floor(n);
  for (const chunk of chunks) {
    if (remaining >= chunk.value) {
      const count = Math.floor(remaining / chunk.value);
      remaining = remaining % chunk.value;
      if (chunk.value === 1) { result += (result ? ' ' : '') + convertBelow1000(count); }
      else if (chunk.value === 1000) { result += (result ? ' ' : '') + (count === 1 ? 'Mille' : convertBelow1000(count) + ' Mille'); }
      else { const label = count > 1 ? chunk.plural : chunk.name; result += (result ? ' ' : '') + (count === 1 ? 'Un ' + label : convertBelow1000(count) + ' ' + label); }
    }
  }
  return result.trim() || 'Zéro';
}

function formatSalaryDisplay(amount: string, currency: string): { formatted: string; words: string } {
  const num = parseFloat((amount || '0').replace(/\s/g, '').replace(/,/g, '.'));
  if (isNaN(num) || num <= 0) return { formatted: '0', words: '' };
  return { formatted: new Intl.NumberFormat('fr-FR').format(num), words: numberToFrenchWords(num) + ' ' + currency };
}

const globalStyles = `
  @keyframes hexFloat { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-12px) rotate(180deg); } }
  @keyframes slideInDown { from { transform: translateY(-8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes expandDown { from { max-height: 0; opacity: 0; } to { max-height: 5000px; opacity: 1; } }
  .hex-float { animation: hexFloat 6s ease-in-out infinite; will-change: transform; }
  .notif-anim { animation: slideInDown 0.25s ease-out; }
  .fade-in { animation: fadeIn 0.2s ease-out; }
  .expand-down { animation: expandDown 0.4s ease-out forwards; overflow: visible; }
  .glass { background: rgba(0, 20, 40, 0.55); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1px solid rgba(0, 229, 255, 0.15); transition: border-color 0.25s, box-shadow 0.25s, transform 0.2s; }
  .glass:hover { border-color: rgba(0, 229, 255, 0.3); }
  .glass-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0, 229, 255, 0.12); }
  .gold-card { background: linear-gradient(135deg, rgba(255,215,0,0.07), rgba(255,165,0,0.07)); border: 1px solid rgba(255,215,0,0.2); }
  .input-field { background: rgba(0,0,0,0.55); border: 1px solid rgba(0,229,255,0.25); border-radius: 12px; padding: 12px; font-size: 14px; color: #fff; outline: none; transition: border-color 0.2s, box-shadow 0.2s; width: 100%; }
  .input-field:focus { border-color: rgba(0,229,255,0.6); box-shadow: 0 0 0 3px rgba(0,229,255,0.1); }
  .input-field::placeholder { color: rgba(0,229,255,0.35); }
  html, body { overflow-x: hidden; scroll-behavior: smooth; }
  .scrollable-container { overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; }
  .scrollable-container::-webkit-scrollbar { width: 8px; }
  .scrollable-container::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
  .scrollable-container::-webkit-scrollbar-thumb { background: rgba(0,229,255,0.3); border-radius: 10px; }
`;

const TechPattern = memo(() => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs><pattern id="tg" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/><circle cx="0" cy="0" r="1" fill="currentColor"/></pattern></defs>
    <rect width="100%" height="100%" fill="url(#tg)"/>
  </svg>
));
TechPattern.displayName = 'TechPattern';

const InputField = memo(({ label, value, onChange, type = "text", placeholder = "...", icon, required = false, disabled = false, multiline = false }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; icon?: React.ReactNode; required?: boolean; disabled?: boolean; multiline?: boolean; }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold text-cyan-300 uppercase flex items-center gap-1.5">
      {icon && <span className="text-cyan-400">{icon}</span>}{label}{required && <span className="text-red-400">*</span>}
    </label>
    {multiline ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} rows={3} className="input-field resize-none" />
      : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} className="input-field" />}
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

function buildPDF(data: FormData, config: CountryConfig, signatures: { employer: string; employee: string }): jsPDF {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const PW = 210, PH = 297, ML = 25, MR = 25, MT = 20, MB = 20;
  const CW = PW - ML - MR;
  let y = MT, page = 1;

  const addPageFooter = () => {
    pdf.setDrawColor(200, 200, 200); pdf.setLineWidth(0.3);
    pdf.line(ML, PH - 15, PW - MR, PH - 15);
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7); pdf.setTextColor(160, 160, 160);
    pdf.text(data.documentMode === 'ELECTRONIC' ? 'Document généré via ECODREUM Intelligence' : data.compName, ML, PH - 10);
    pdf.setFont('helvetica', 'bold'); pdf.setTextColor(0, 100, 160);
    pdf.text('Page ' + page, PW - MR, PH - 10, { align: 'right' });
  };
  const checkY = (need: number) => { if (y + need > PH - MB - 12) { addPageFooter(); pdf.addPage(); page++; y = MT; } };
  const lineH = (s: number) => s * 0.45 + 1;

  const writeText = (text: string, size: number, style: string, align: string, color: number[]) => {
    pdf.setFont('helvetica', style as any); pdf.setFontSize(size); pdf.setTextColor(color[0], color[1], color[2]);
    const w = CW - 4;
    const lines = pdf.splitTextToSize(text, w);
    const lh = lineH(size);
    checkY(lines.length * lh + 2);
    const xPos = align === 'center' ? PW / 2 : align === 'right' ? PW - MR - 2 : ML;
    for (let i = 0; i < lines.length; i++) {
      pdf.text(lines[i], xPos, y, { align: align as any, maxWidth: w });
      y += lh;
    }
  };

  const addSpacer = (mm: number) => { y += mm; };

  const addLine = (c: number[], w: number) => { checkY(3); pdf.setDrawColor(c[0], c[1], c[2]); pdf.setLineWidth(w); pdf.line(ML, y, PW - MR, y); y += 3; };

  const addArticle = (title: string, content: string) => {
    checkY(14);
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10);
    const tLines = pdf.splitTextToSize(title, CW - 10);
    const tH = tLines.length * lineH(10);
    checkY(tH + 6);
    pdf.setFillColor(0, 100, 170);
    pdf.rect(ML, y - 0.5, 2.5, tH + 1, 'F');
    pdf.setTextColor(0, 80, 140);
    for (let i = 0; i < tLines.length; i++) { pdf.text(tLines[i], ML + 7, y + lineH(10) * 0.75, { maxWidth: CW - 10 }); y += lineH(10); }
    y += 4;
    const paragraphs = content.split('\n').filter(l => l.trim());
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (trimmed.startsWith('—')) {
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(40, 40, 40);
        const pLines = pdf.splitTextToSize(trimmed, CW - 14);
        const pH = pLines.length * lineH(9);
        checkY(pH + 1);
        for (let i = 0; i < pLines.length; i++) { pdf.text(pLines[i], ML + 8, y, { maxWidth: CW - 14 }); y += lineH(9); }
      } else {
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(40, 40, 40);
        const pLines = pdf.splitTextToSize(trimmed, CW - 4);
        const pH = pLines.length * lineH(9);
        checkY(pH + 1);
        for (let i = 0; i < pLines.length; i++) { pdf.text(pLines[i], ML, y, { maxWidth: CW - 4 }); y += lineH(9); }
      }
      y += 1;
    }
    y += 3;
  };

  // EN-TETE
  pdf.setFillColor(0, 30, 60); pdf.rect(0, 0, PW, 28, 'F');
  pdf.setFillColor(0, 150, 200); pdf.rect(0, 28, PW, 1, 'F');
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(15); pdf.setTextColor(255, 255, 255);
  const mainTitle = data.jobType === 'STAGE' ? 'CONVENTION DE STAGE' : 'CONTRAT DE TRAVAIL';
  pdf.text(mainTitle, PW / 2, 12, { align: 'center' });
  pdf.setFontSize(9); pdf.setTextColor(180, 220, 255);
  pdf.text('Régime : ' + data.jobType + '  •  ' + config.name.toUpperCase() + '  •  ' + new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), PW / 2, 20, { align: 'center' });
  y = 35;

  if (data.compLogo) { try { pdf.addImage(data.compLogo, data.compLogo.startsWith('data:image/png') ? 'PNG' : 'JPEG', ML, y, 18, 18); } catch {} }
  const lo = data.compLogo ? 22 : 0;
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(12); pdf.setTextColor(0, 50, 100);
  pdf.text(data.compName.toUpperCase(), ML + lo, y + 6);
  if (data.compDescription) { pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(100, 100, 100); const dl = pdf.splitTextToSize(data.compDescription, CW - lo - 4); pdf.text(dl.slice(0, 2), ML + lo, y + 12); }
  y += 24;
  addLine([0, 130, 180], 0.6); addSpacer(2);

  // PARTIES
  writeText('ENTRE LES SOUSSIGNÉS :', 10, 'bold', 'left', [0, 50, 100]); addSpacer(3);
  const capCl = data.showCapital && data.compCapital ? ', au capital social de ' + new Intl.NumberFormat('fr-FR').format(parseFloat(data.compCapital) || 0) + ' ' + config.currency : '';
  const workerLabel = data.jobType === 'STAGE' ? 'Stagiaire' : 'Salarié';
  writeText('La société ' + data.compName + ', ' + data.compType + capCl + ', dont le siège social est situé à ' + data.compAddr + ', immatriculée au RCCM sous le numéro ' + data.compRCCM + ' et identifiée au ' + config.idLabel + ' sous le numéro ' + data.compID + ', représentée par M./Mme ' + data.bossName + ' en sa qualité de ' + data.bossTitle + '.', 9, 'normal', 'left', [30, 30, 30]);
  addSpacer(2); writeText('Ci-après dénommée « L\'EMPLOYEUR »', 9, 'italic', 'right', [100, 100, 100]);
  addSpacer(2); writeText('D\'UNE PART,', 10, 'bold', 'center', [0, 50, 100]);
  addSpacer(2); writeText('ET :', 10, 'bold', 'center', [0, 50, 100]); addSpacer(2);
  const fCl = data.isForeigner && data.empWorkPermit ? ', titulaire du permis de travail n°' + data.empWorkPermit : '';
  writeText('M./Mme ' + data.empName + ', né(e) le ' + (data.empBirth ? new Date(data.empBirth).toLocaleDateString('fr-FR') : '—') + ' à ' + data.empBirthPlace + ', de nationalité ' + data.empNation + fCl + ', titulaire de la pièce d\'identité n°' + data.empID + ', demeurant à ' + data.empAddr + ', joignable au ' + data.empPhone + '.', 9, 'normal', 'left', [30, 30, 30]);
  addSpacer(2);
  const salLbl = data.jobType === 'STAGE' ? 'LE STAGIAIRE' : 'LE SALARIÉ';
  writeText('Ci-après dénommé(e) « ' + salLbl + ' »', 9, 'italic', 'right', [100, 100, 100]);
  addSpacer(2); writeText('D\'AUTRE PART,', 10, 'bold', 'center', [0, 50, 100]);
  addSpacer(4); addLine([180, 180, 180], 0.3); addSpacer(2);
  writeText('IL A ÉTÉ ARRÊTÉ ET CONVENU CE QUI SUIT :', 10, 'bold', 'center', [0, 50, 100]);
  addSpacer(5);

  // ARTICLES
  addArticle('ARTICLE 1 : OBJET ET CADRE LÉGAL', 'Le présent contrat est conclu sous le régime du ' + config.code + '.\n' + config.articles.intro + '\n' + config.articles.engagement + '\nLe présent contrat définit les conditions d\'engagement et d\'emploi du ' + workerLabel + ' au sein de la société ' + data.compName + '.');

  let ctText = data.jobType === 'CDI' ? 'indéterminée (CDI)' : data.jobType === 'CDD' ? 'déterminée (CDD)' : 'CONVENTION DE STAGE';
  let specPart = '';
  if (data.jobType === 'CDI' && data.jobDescription) specPart = '\nTâches confiées : ' + data.jobDescription + '.';
  if (data.jobType === 'CDD' && data.cddReason) specPart = '\nMotif du CDD : ' + data.cddReason + '.';
  if (data.jobType === 'STAGE' && data.stageTasks) specPart = '\nMissions du stage : ' + data.stageTasks + '.';
  addArticle('ARTICLE 2 : NATURE ET FONCTIONS', 'Le ' + workerLabel + ' est recruté en qualité de ' + data.jobTitle + ' au sein du département ' + data.jobDept + '.\nLieu d\'exercice : ' + data.jobLocation + '.\nType de contrat : à durée ' + ctText + '.' + specPart + '\nLe ' + workerLabel + ' s\'engage à exercer ses fonctions avec diligence, compétence et loyauté, conformément aux directives de l\'Employeur et aux usages de la profession.');

  const salAmt = data.jobType === 'STAGE' ? data.stageAllowance : data.salary;
  const sd = formatSalaryDisplay(salAmt, config.currency);
  const bonus = data.bonus ? '\nAvantages complémentaires : ' + data.bonus + '.' : '';
  const remuBody = data.jobType === 'STAGE'
    ? 'Le Stagiaire percevra une gratification mensuelle de ' + sd.formatted + ' ' + config.currency + '.\n' + (sd.words ? 'Soit : ' + sd.words + '.' : '') + bonus + '\n' + config.articles.workDuration + ' la durée hebdomadaire de travail est fixée à ' + data.hours + ' heures.'
    : 'En contrepartie de l\'exécution de ses fonctions, le Salarié percevra une rémunération mensuelle brute de ' + sd.formatted + ' ' + config.currency + '.\n' + (sd.words ? 'Soit : ' + sd.words + '.' : '') + '\nCette rémunération est versée mensuellement par virement bancaire, sous réserve des retenues légales applicables.' + bonus + '\n' + config.articles.workDuration + ' la durée hebdomadaire de travail est fixée à ' + data.hours + ' heures.';
  addArticle('ARTICLE 3 : RÉMUNÉRATION', remuBody);

  const endDt = (data.jobType === 'CDD' || data.jobType === 'STAGE') && data.endDate ? ' et prendra fin le ' + new Date(data.endDate).toLocaleDateString('fr-FR') : '';
  const trialT = data.jobType !== 'STAGE' ? '\nUne période d\'essai de ' + data.trial + ' mois est prévue. Durant cette période, chacune des parties peut mettre fin au contrat sans préavis ni indemnité.\nÀ l\'issue de la période d\'essai, si aucune des parties n\'a manifesté sa volonté de rompre le contrat, celui-ci se poursuivra.' : '';
  addArticle('ARTICLE 4 : DURÉE DU CONTRAT' + (data.jobType !== 'STAGE' ? ' ET PÉRIODE D\'ESSAI' : ''), 'Le présent contrat prend effet à compter du ' + (data.startDate ? new Date(data.startDate).toLocaleDateString('fr-FR') : '—') + endDt + '.' + trialT);

  addArticle('ARTICLE 5 : OBLIGATIONS DES PARTIES', 'L\'Employeur s\'engage à :\n— Fournir au ' + workerLabel + ' un travail conforme à ses qualifications\n— Verser la rémunération convenue aux échéances prévues\n— Respecter l\'ensemble des dispositions légales applicables\n— Assurer la sécurité et la protection de la santé du ' + workerLabel + '\n\nLe ' + workerLabel + ' s\'engage à :\n— Exécuter personnellement les missions confiées\n— Respecter les directives de l\'Employeur et le règlement intérieur\n— Observer une obligation de loyauté et de confidentialité\n— Consacrer l\'intégralité de son activité professionnelle à l\'Employeur');

  let aN = 6;
  if (data.hasNonCompete && data.jobType !== 'STAGE') {
    addArticle('ARTICLE ' + aN + ' : CLAUSE DE NON-CONCURRENCE', 'Le Salarié s\'engage, pendant une durée de ' + data.nonCompeteDuration + ' suivant la cessation du présent contrat, à ne pas exercer une activité concurrente à celle de l\'Employeur.\nCette obligation s\'applique sur le territoire du ' + config.name + '.\nEn contrepartie, le Salarié percevra une indemnité compensatrice.');
    aN++;
  }
  const ruptBody = data.jobType === 'STAGE'
    ? 'Le présent stage prendra fin à la date prévue sans nécessité de préavis. En cas de manquement grave, l\'Employeur se réserve le droit de mettre fin au stage.'
    : config.articles.termination + '\nLa suspension du contrat pourra intervenir dans les cas prévus par la loi.\nLa rupture du contrat devra respecter les dispositions légales relatives au préavis et aux indemnités.\nEn cas de rupture, le Salarié restituera l\'ensemble des documents et équipements.';
  addArticle('ARTICLE ' + aN + ' : ' + (data.jobType === 'STAGE' ? 'FIN DU STAGE' : 'RUPTURE DU CONTRAT'), ruptBody);
  aN++;
  addArticle('ARTICLE ' + aN + ' : LITIGES', 'En cas de différend, les parties s\'efforceront de trouver une solution amiable.\nÀ défaut, tout litige relèvera de la compétence exclusive du ' + config.court + '.');

  // SIGNATURES
  checkY(65); addLine([180, 180, 180], 0.3); addSpacer(2);
  writeText('Fait à ' + data.compAddr.split(',')[0].trim() + ', le ' + new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), 9, 'normal', 'left', [30, 30, 30]);
  addSpacer(2);
  writeText('En deux exemplaires originaux, dont un remis au ' + workerLabel + '.', 9, 'normal', 'left', [30, 30, 30]);
  addSpacer(8);
  const bw = (CW / 2) - 6, bh = 30;
  checkY(bh + 18);
  pdf.setDrawColor(0, 100, 170); pdf.setLineWidth(0.4);
  pdf.roundedRect(ML, y, bw, bh, 2, 2);
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); pdf.setTextColor(0, 50, 100);
  pdf.text("L'EMPLOYEUR", ML + bw / 2, y + 5, { align: 'center' });
  if (signatures.employer && data.documentMode === 'ELECTRONIC') { try { pdf.addImage(signatures.employer, 'PNG', ML + 3, y + 7, bw - 6, 12); } catch {} }
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8); pdf.setTextColor(30, 30, 30);
  pdf.text(data.bossName || '_______________', ML + bw / 2, y + bh - 4, { align: 'center' });
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7); pdf.setTextColor(80, 80, 80);
  pdf.text(data.bossTitle, ML + bw / 2, y + bh - 1, { align: 'center' });
  const rx = ML + bw + 12;
  pdf.setDrawColor(0, 100, 170); pdf.setLineWidth(0.4);
  pdf.roundedRect(rx, y, bw, bh, 2, 2);
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); pdf.setTextColor(0, 50, 100);
  pdf.text(salLbl, rx + bw / 2, y + 5, { align: 'center' });
  if (signatures.employee && data.documentMode === 'ELECTRONIC') { try { pdf.addImage(signatures.employee, 'PNG', rx + 3, y + 7, bw - 6, 12); } catch {} }
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8); pdf.setTextColor(30, 30, 30);
  pdf.text(data.empName || '_______________', rx + bw / 2, y + bh - 4, { align: 'center' });
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7); pdf.setTextColor(80, 80, 80);
  pdf.text(data.jobTitle, rx + bw / 2, y + bh - 1, { align: 'center' });
  addPageFooter();
  return pdf;
}

function buildWordDocument(data: FormData, config: CountryConfig): string {
  const e = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const f = (d: string) => { try { return new Date(d).toLocaleDateString('fr-FR'); } catch { return d; } };
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const w = data.jobType === 'STAGE' ? 'Stagiaire' : 'Salari&eacute;';
  const wl = data.jobType === 'STAGE' ? 'STAGIAIRE' : 'SALARI&Eacute;';
  const title = data.jobType === 'STAGE' ? 'CONVENTION DE STAGE' : 'CONTRAT DE TRAVAIL';
  const capCl = data.showCapital && data.compCapital ? ', au capital social de ' + new Intl.NumberFormat('fr-FR').format(parseFloat(data.compCapital) || 0) + ' ' + config.currency : '';
  const fCl = data.isForeigner && data.empWorkPermit ? ', titulaire du permis de travail n&deg;' + e(data.empWorkPermit) : '';
  const endDt = (data.jobType === 'CDD' || data.jobType === 'STAGE') && data.endDate ? ' et prendra fin le ' + f(data.endDate) : '';
  const salAmt = data.jobType === 'STAGE' ? data.stageAllowance : data.salary;
  const sd = formatSalaryDisplay(salAmt, config.currency);
  const ctText = data.jobType === 'CDI' ? 'ind&eacute;termin&eacute;e (CDI)' : data.jobType === 'CDD' ? 'd&eacute;termin&eacute;e (CDD)' : 'CONVENTION DE STAGE';
  let specHtml = '';
  if (data.jobType === 'CDI' && data.jobDescription) specHtml = '<p class="b"><b>T&acirc;ches confi&eacute;es :</b> ' + e(data.jobDescription) + '.</p>';
  if (data.jobType === 'CDD' && data.cddReason) specHtml = '<p class="b"><b>Motif du CDD :</b> ' + e(data.cddReason) + '.</p>';
  if (data.jobType === 'STAGE' && data.stageTasks) specHtml = '<p class="b"><b>Missions du stage :</b> ' + e(data.stageTasks) + '.</p>';
  const bonusH = data.bonus ? '<p class="b"><b>Avantages :</b> ' + e(data.bonus) + '.</p>' : '';
  const remuH = data.jobType === 'STAGE'
    ? '<p class="b">Le Stagiaire percevra une gratification mensuelle de <b>' + e(sd.formatted) + ' ' + e(config.currency) + '</b>.</p>' + (sd.words ? '<p class="b"><i>Soit : ' + e(sd.words) + '.</i></p>' : '') + bonusH
    : '<p class="b">Le ' + w + ' percevra une r&eacute;mun&eacute;ration mensuelle brute de <b>' + e(sd.formatted) + ' ' + e(config.currency) + '</b>.</p>' + (sd.words ? '<p class="b"><i>Soit : ' + e(sd.words) + '.</i></p>' : '') + '<p class="b">Cette r&eacute;mun&eacute;ration est vers&eacute;e mensuellement par virement bancaire.</p>' + bonusH;
  const trialH = data.jobType !== 'STAGE' ? '<p class="b">Une p&eacute;riode d\'essai de <b>' + e(data.trial) + ' mois</b> est pr&eacute;vue.</p>' : '';
  let aN = 6, ncH = '';
  if (data.hasNonCompete && data.jobType !== 'STAGE') {
    ncH = '<h2 class="a">ARTICLE ' + aN + ' : CLAUSE DE NON-CONCURRENCE</h2><p class="b">Le ' + w + ' s\'engage, pendant <b>' + e(data.nonCompeteDuration) + '</b>, &agrave; ne pas exercer une activit&eacute; concurrente sur le territoire du ' + e(config.name) + '.</p>';
    aN++;
  }
  const ruptH = data.jobType === 'STAGE'
    ? '<p class="b">Le stage prendra fin &agrave; la date pr&eacute;vue.</p>'
    : '<p class="b">' + e(config.articles.termination) + '</p><p class="b">La rupture devra respecter les dispositions l&eacute;gales.</p>';

  return '<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><!--[if gte mso 9]><xml><w:WordDocument><w:View>Normal</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]--><style>@page S{size:595.3pt 841.9pt;margin:70pt 70pt 70pt 70pt;}div.S{page:S;}body{font-family:"Times New Roman",serif;font-size:11pt;color:#1e1e1e;line-height:1.6;}h1{font-family:Arial,sans-serif;font-size:16pt;font-weight:bold;text-align:center;color:#00264d;margin:0 0 4pt 0;}h2.r{font-family:Arial,sans-serif;font-size:10pt;text-align:center;color:#336699;margin:0 0 14pt 0;font-weight:normal;}h2.a{font-family:Arial,sans-serif;font-size:10.5pt;font-weight:bold;color:#005580;margin:16pt 0 6pt 0;border-left:3pt solid #0064aa;padding-left:6pt;}p.b{text-align:justify;margin:3pt 0;font-size:10.5pt;}p.c{text-align:center;font-weight:bold;color:#00264d;margin:6pt 0;}p.ri{text-align:right;font-style:italic;color:#555;margin:3pt 0;}hr.m{border:none;border-top:1.5pt solid #0064aa;margin:10pt 0;}hr.l{border:none;border-top:.5pt solid #ccc;margin:8pt 0;}table.s{width:100%;border-collapse:collapse;margin-top:24pt;}table.s td{width:50%;padding:8pt;vertical-align:top;text-align:center;}.sb{border-bottom:1pt solid #333;height:50pt;margin-bottom:4pt;}.sl{font-weight:bold;color:#00264d;font-family:Arial,sans-serif;font-size:10pt;margin-bottom:4pt;text-align:center;}.sn{text-align:center;font-weight:bold;font-size:10pt;margin-top:4pt;}.st{text-align:center;color:#555;font-size:9pt;}.ft{font-size:8pt;color:#999;text-align:center;margin-top:20pt;border-top:.5pt solid #ddd;padding-top:6pt;}</style></head><body><div class="S"><h1>' + e(title) + '</h1><h2 class="r">R&eacute;gime : ' + e(data.jobType) + ' &mdash; ' + e(config.name) + ' &mdash; ' + e(today) + '</h2><hr class="m"><p class="c">ENTRE LES SOUSSIGN&Eacute;S :</p><p class="b">La soci&eacute;t&eacute; <b>' + e(data.compName) + '</b>, ' + e(data.compType) + e(capCl) + ', si&egrave;ge &agrave; <b>' + e(data.compAddr) + '</b>, RCCM <b>' + e(data.compRCCM) + '</b>, ' + e(config.idLabel) + ' <b>' + e(data.compID) + '</b>, repr&eacute;sent&eacute;e par <b>' + e(data.bossName) + '</b>, <b>' + e(data.bossTitle) + '</b>.</p><p class="ri">Ci-apr&egrave;s &laquo; <b>L\'EMPLOYEUR</b> &raquo;</p><p class="c">D\'UNE PART,</p><p class="c">ET :</p><p class="b"><b>' + e(data.empName) + '</b>, n&eacute;(e) le <b>' + e(f(data.empBirth)) + '</b> &agrave; <b>' + e(data.empBirthPlace) + '</b>, nationalit&eacute; <b>' + e(data.empNation) + '</b>' + e(fCl) + ', pi&egrave;ce d\'identit&eacute; <b>' + e(data.empID) + '</b>, demeurant &agrave; <b>' + e(data.empAddr) + '</b>, t&eacute;l. <b>' + e(data.empPhone) + '</b>.</p><p class="ri">Ci-apr&egrave;s &laquo; <b>LE ' + wl + '</b> &raquo;</p><p class="c">D\'AUTRE PART,</p><hr class="l"><p class="c">IL A &Eacute;T&Eacute; CONVENU CE QUI SUIT :</p><hr class="l"><h2 class="a">ARTICLE 1 : OBJET ET CADRE L&Eacute;GAL</h2><p class="b">Contrat conclu sous le r&eacute;gime du ' + e(config.code) + '.</p><p class="b">' + e(config.articles.intro) + '</p><p class="b">' + e(config.articles.engagement) + '</p><h2 class="a">ARTICLE 2 : NATURE ET FONCTIONS</h2><p class="b">Le ' + w + ' est recrut&eacute; au poste de <b>' + e(data.jobTitle) + '</b>, d&eacute;partement <b>' + e(data.jobDept) + '</b>.</p><p class="b">Lieu : <b>' + e(data.jobLocation) + '</b>. Contrat &agrave; dur&eacute;e <b>' + ctText + '</b>.</p>' + specHtml + '<h2 class="a">ARTICLE 3 : R&Eacute;MUN&Eacute;RATION</h2>' + remuH + '<p class="b">Dur&eacute;e hebdomadaire : <b>' + e(data.hours) + ' heures</b>.</p><h2 class="a">ARTICLE 4 : DUR&Eacute;E' + (data.jobType !== 'STAGE' ? " ET P&Eacute;RIODE D\'ESSAI" : '') + '</h2><p class="b">Effet au <b>' + e(f(data.startDate)) + '</b>' + e(endDt) + '.</p>' + trialH + '<h2 class="a">ARTICLE 5 : OBLIGATIONS</h2><p class="b"><b>L\'Employeur :</b> fournir un travail conforme, verser la r&eacute;mun&eacute;ration, respecter la loi, assurer la s&eacute;curit&eacute;.</p><p class="b"><b>Le ' + w + ' :</b> ex&eacute;cuter ses missions, respecter le r&egrave;glement, loyaut&eacute; et confidentialit&eacute;.</p>' + ncH + '<h2 class="a">ARTICLE ' + aN + ' : ' + (data.jobType === 'STAGE' ? 'FIN DU STAGE' : 'RUPTURE') + '</h2>' + ruptH + '<h2 class="a">ARTICLE ' + (aN + 1) + ' : LITIGES</h2><p class="b">Solution amiable, sinon comp&eacute;tence du <b>' + e(config.court) + '</b>.</p><hr class="m"><p class="b">Fait &agrave; <b>' + e(data.compAddr.split(',')[0].trim()) + '</b>, le <b>' + e(today) + '</b>. En deux exemplaires.</p><table class="s"><tr><td><p class="sl">L\'EMPLOYEUR</p><div class="sb"></div><p class="sn">' + e(data.bossName) + '</p><p class="st">' + e(data.bossTitle) + '</p></td><td><p class="sl">LE ' + e(data.jobType === 'STAGE' ? 'STAGIAIRE' : 'SALARIÉ') + '</p><div class="sb"></div><p class="sn">' + e(data.empName) + '</p><p class="st">' + e(data.jobTitle) + '</p></td></tr></table><div class="ft"><p>Document ECODREUM Intelligence</p></div></div></body></html>';
}
export default function GenerateurContrat() {
  const router = useRouter();
  const signatureCanvasEmployer = useRef<HTMLCanvasElement>(null);
  const signatureCanvasEmployee = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeSection, setActiveSection] = useState<'company' | 'employee' | 'contract' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [currentSigner, setCurrentSigner] = useState<'employer' | 'employee' | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showArchives, setShowArchives] = useState(false);
  const [previewContract, setPreviewContract] = useState<SavedContract | null>(null);
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

  const salaryDisplay = useMemo(() => {
    const amount = data.jobType === 'STAGE' ? data.stageAllowance : data.salary;
    return formatSalaryDisplay(amount, config.currency);
  }, [data.salary, data.stageAllowance, data.jobType, config.currency]);

  const hexagons = useMemo(() => Array.from({ length: 10 }, (_, i) => ({
    id: i, left: `${(i * 11 + 5) % 100}%`, top: `${(i * 17 + 8) % 100}%`,
    delay: `${(i * 0.6) % 4}s`, duration: `${5 + (i % 3)}s`
  })), []);

  useEffect(() => {
    const el = document.createElement('style');
    el.id = 'contract-styles';
    el.textContent = globalStyles;
    if (!document.getElementById('contract-styles')) document.head.appendChild(el);
    return () => { const s = document.getElementById('contract-styles'); if (s) s.remove(); };
  }, []);

  useEffect(() => {
    document.body.style.overflow = (showSignatureModal || showArchives || previewContract) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showSignatureModal, showArchives, previewContract]);

  useEffect(() => { loadArchivedContracts(); }, []);

  const showNotif = useCallback((m: string, t: 's' | 'e' | 'w') => {
    setNotif({ m, t });
    setTimeout(() => setNotif(null), 4000);
  }, []);

  const updateData = useCallback((field: keyof FormData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    setValidationErrors([]);
  }, []);

  const loadArchivedContracts = async () => {
    try {
      const { data: rows, error } = await supabase.from('contracts').select('*').order('created_at', { ascending: false });
      if (!error && rows) {
        setSavedContracts(rows.map((c: any) => ({
          id: c.id, employeeName: c.employee_name, jobTitle: c.job_title,
          contractType: c.contract_type, mode: c.mode, createdAt: c.created_at,
          data: c.data, signed: c.signed, employerSignature: c.employer_signature,
          employeeSignature: c.employee_signature, fileUrl: c.file_url, fileType: c.file_type
        })));
        return;
      }
    } catch (err) { console.warn('Supabase load:', err); }
    try {
      const stored = localStorage.getItem('ecodreum_contracts');
      if (stored) setSavedContracts(JSON.parse(stored));
    } catch {}
  };

  const saveContractToArchive = async (contractData: FormData, signed: boolean, fileUrl: string, fileType: string) => {
    const contract: SavedContract = {
      id: Date.now().toString(), employeeName: contractData.empName, jobTitle: contractData.jobTitle,
      contractType: contractData.jobType, mode: contractData.documentMode,
      createdAt: new Date().toISOString(), data: contractData, signed,
      employerSignature: signatures.employer, employeeSignature: signatures.employee, fileUrl, fileType
    };
    try {
      await supabase.from('contracts').insert([{
        id: contract.id, employee_name: contract.employeeName, job_title: contract.jobTitle,
        contract_type: contract.contractType, mode: contract.mode, created_at: contract.createdAt,
        data: contract.data, signed: contract.signed, employer_signature: contract.employerSignature,
        employee_signature: contract.employeeSignature, file_url: contract.fileUrl, file_type: contract.fileType
      }]);
    } catch (err) { console.warn('Supabase save:', err); }
    const updated = [contract, ...savedContracts];
    setSavedContracts(updated);
    try { localStorage.setItem('ecodreum_contracts', JSON.stringify(updated)); } catch {}
  };

  const deleteContract = async (id: string) => {
    if (!confirm('Supprimer ce contrat ?')) return;
    try { await supabase.from('contracts').delete().eq('id', id); } catch {}
    const updated = savedContracts.filter(c => c.id !== id);
    setSavedContracts(updated);
    try { localStorage.setItem('ecodreum_contracts', JSON.stringify(updated)); } catch {}
    if (previewContract && previewContract.id === id) setPreviewContract(null);
    showNotif('Contrat supprimé', 's');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ok = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!ok.includes(file.type)) { showNotif('Seuls PDF et Word acceptés', 'w'); return; }
    setIsUploading(true);
    try {
      const fileName = Date.now() + '_' + file.name;
      const { error } = await supabase.storage.from('contract-files').upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('contract-files').getPublicUrl(fileName);
      const ft = file.type.includes('pdf') ? 'PDF' : 'WORD';
      await saveContractToArchive(data, false, urlData.publicUrl, ft);
      showNotif('Fichier archivé', 's');
    } catch (err) { console.warn('Upload:', err); showNotif('Erreur upload', 'e'); }
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const downloadArchivedFile = async (contract: SavedContract) => {
    if (!contract.fileUrl) {
      regenerateAndDownload(contract);
      return;
    }
    try {
      const resp = await fetch(contract.fileUrl);
      if (!resp.ok) throw new Error('fetch failed');
      const blob = await resp.blob();
      const ext = contract.fileType === 'PDF' ? '.pdf' : '.doc';
      const name = 'CONTRAT_' + (contract.employeeName || 'doc').replace(/\s+/g, '_') + ext;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      showNotif('Téléchargé', 's');
    } catch {
      regenerateAndDownload(contract);
    }
  };

  const regenerateAndDownload = (contract: SavedContract) => {
    if (!contract.data) { showNotif('Données manquantes', 'w'); return; }
    try {
      const cConfig = COUNTRIES[contract.data.country];
      const sigs = { employer: contract.employerSignature || '', employee: contract.employeeSignature || '' };
      if (contract.mode === 'ELECTRONIC' || contract.fileType === 'PDF') {
        const pdf = buildPDF(contract.data, cConfig, sigs);
        pdf.save('CONTRAT_' + (contract.employeeName || 'doc').replace(/\s+/g, '_') + '.pdf');
      } else {
        const html = buildWordDocument(contract.data, cConfig);
        const blob = new Blob(['\ufeff' + html], { type: 'application/msword;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'CONTRAT_' + (contract.employeeName || 'doc').replace(/\s+/g, '_') + '.doc';
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
      }
      showNotif('Document téléchargé', 's');
    } catch (err) { console.warn('Regen:', err); showNotif('Erreur génération', 'e'); }
  };

  const isSectionComplete = useCallback((section: 'company' | 'employee' | 'contract'): boolean => {
    if (section === 'company') return !!(data.compName.trim() && data.compType.trim() && data.compAddr.trim() && data.compRCCM.trim() && data.compID.trim() && data.bossName.trim() && data.bossTitle.trim() && (!data.showCapital || data.compCapital.trim()));
    if (section === 'employee') return !!(data.empName.trim() && data.empBirth.trim() && data.empBirthPlace.trim() && data.empNation.trim() && data.empAddr.trim() && data.empID.trim() && data.empPhone.trim() && (!data.isForeigner || data.empWorkPermit.trim()));
    if (section === 'contract') {
      const base = !!(data.jobTitle.trim() && data.jobDept.trim() && data.jobLocation.trim() && data.startDate && data.hours.trim());
      if (data.jobType === 'STAGE') return !!(base && data.endDate && data.stageTasks.trim() && data.stageAllowance.trim());
      const sal = !!(data.salary.trim() && parseFloat(data.salary) > 0);
      const nc = !data.hasNonCompete || !!data.nonCompeteDuration.trim();
      if (data.jobType === 'CDI') return !!(base && sal && data.trial.trim() && data.jobDescription.trim() && nc);
      if (data.jobType === 'CDD') return !!(base && sal && data.trial.trim() && data.endDate && data.cddReason.trim() && nc);
    }
    return false;
  }, [data]);

  const canAccessSection = useCallback((section: 'company' | 'employee' | 'contract'): boolean => {
    if (section === 'company') return true;
    if (section === 'employee') return isSectionComplete('company');
    return isSectionComplete('company') && isSectionComplete('employee');
  }, [isSectionComplete]);

  const validateForm = (): boolean => {
    const errs: string[] = [];
    if (!isSectionComplete('company')) errs.push('Section Entreprise incomplète');
    if (!isSectionComplete('employee')) errs.push('Section Salarié incomplète');
    if (!isSectionComplete('contract')) errs.push('Section Contrat incomplète');
    setValidationErrors(errs);
    return errs.length === 0;
  };

  const getProgress = useMemo((): number => {
    const f = ['compName','compType','compAddr','compRCCM','compID','bossName','bossTitle','empName','empBirth','empBirthPlace','empNation','empAddr','empID','empPhone','jobTitle','jobDept','jobLocation','startDate','hours','trial'];
    return Math.round((f.filter(k => { const v = data[k as keyof FormData]; return v && v !== '' && v !== '0'; }).length / f.length) * 100);
  }, [data]);

  const getSectionProgress = useCallback((section: 'company' | 'employee' | 'contract'): number => {
    const m: Record<string, string[]> = {
      company: ['compName','compType','compAddr','compRCCM','compID','bossName','bossTitle'],
      employee: ['empName','empBirth','empBirthPlace','empNation','empAddr','empID','empPhone'],
      contract: ['jobTitle','jobDept','jobLocation','salary','startDate','trial','hours']
    };
    const fl = m[section];
    return Math.round((fl.filter(f => { const v = data[f as keyof FormData]; return v && v !== '' && v !== '0'; }).length / fl.length) * 100);
  }, [data]);

  const handleSectionClick = (section: 'company' | 'employee' | 'contract') => {
    if (!canAccessSection(section)) {
      showNotif(section === 'employee' ? 'Remplissez d\'abord Entreprise' : !isSectionComplete('company') ? 'Remplissez d\'abord Entreprise' : 'Remplissez d\'abord Salarié', 'w');
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

  const generatePDF = async () => {
    if (!validateForm()) { showNotif('Champs obligatoires manquants', 'e'); return; }
    setIsGenerating(true);
    try {
      await new Promise(r => setTimeout(r, 50));
      const pdf = buildPDF(data, config, signatures);
      const fileName = 'CONTRAT_' + data.empName.replace(/\s+/g, '_') + '_' + Date.now() + '.pdf';
      let fileUrl = '';
      try {
        const blob = pdf.output('blob');
        const { error } = await supabase.storage.from('contract-files').upload(fileName, blob);
        if (!error) { const { data: u } = supabase.storage.from('contract-files').getPublicUrl(fileName); fileUrl = u.publicUrl; }
      } catch {}
      pdf.save(fileName);
      await saveContractToArchive(data, !!(signatures.employer && signatures.employee), fileUrl, 'PDF');
      showNotif('PDF généré !', 's');
    } catch (err) { console.warn(err); showNotif('Erreur PDF', 'e'); }
    finally { setIsGenerating(false); }
  };

  const generateWord = async () => {
    if (!validateForm()) { showNotif('Champs obligatoires manquants', 'e'); return; }
    try {
      const html = buildWordDocument(data, config);
      const blob = new Blob(['\ufeff' + html], { type: 'application/msword;charset=utf-8' });
      const fileName = 'CONTRAT_' + data.empName.replace(/\s+/g, '_') + '_' + Date.now() + '.doc';
      let fileUrl = '';
      try {
        const { error } = await supabase.storage.from('contract-files').upload(fileName, blob);
        if (!error) { const { data: u } = supabase.storage.from('contract-files').getPublicUrl(fileName); fileUrl = u.publicUrl; }
      } catch {}
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = fileName;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      await saveContractToArchive(data, false, fileUrl, 'WORD');
      showNotif('Word généré !', 's');
    } catch (err) { console.warn(err); showNotif('Erreur Word', 'e'); }
  };

  const getPoint = (canvas: HTMLCanvasElement, cx: number, cy: number) => {
    const r = canvas.getBoundingClientRect();
    return { x: (cx - r.left) * (canvas.width / r.width), y: (cy - r.top) * (canvas.height / r.height) };
  };
  const startDraw = (ev: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    ev.preventDefault(); setIsDrawing(true);
    const c = currentSigner === 'employer' ? signatureCanvasEmployer.current : signatureCanvasEmployee.current;
    if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return;
    const { clientX, clientY } = 'touches' in ev ? ev.touches[0] : ev;
    const p = getPoint(c, clientX, clientY); ctx.beginPath(); ctx.moveTo(p.x, p.y);
  };
  const draw = (ev: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    ev.preventDefault(); if (!isDrawing) return;
    const c = currentSigner === 'employer' ? signatureCanvasEmployer.current : signatureCanvasEmployee.current;
    if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return;
    const { clientX, clientY } = 'touches' in ev ? ev.touches[0] : ev;
    const p = getPoint(c, clientX, clientY);
    ctx.lineTo(p.x, p.y); ctx.strokeStyle = '#000'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.stroke(); ctx.beginPath(); ctx.moveTo(p.x, p.y);
  };
  const stopDraw = () => setIsDrawing(false);
  const clearSig = () => {
    const c = currentSigner === 'employer' ? signatureCanvasEmployer.current : signatureCanvasEmployee.current;
    if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
  };
  const saveSig = () => {
    const c = currentSigner === 'employer' ? signatureCanvasEmployer.current : signatureCanvasEmployee.current;
    if (!c) return;
    setSignatures(prev => ({ ...prev, [currentSigner!]: c.toDataURL('image/png') }));
    showNotif('Signature enregistrée', 's');
    setShowSignatureModal(false); setCurrentSigner(null);
  };
  const openSigModal = (signer: 'employer' | 'employee') => {
    if (data.documentMode === 'PRINT') { showNotif('Activez le mode électronique', 'w'); return; }
    setCurrentSigner(signer); setShowSignatureModal(true);
    setTimeout(() => {
      const c = signer === 'employer' ? signatureCanvasEmployer.current : signatureCanvasEmployee.current;
      if (c) { const ctx = c.getContext('2d'); if (ctx) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); } }
    }, 120);
  };

  // ========================= RENDU =========================
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#080d18 0%,#141929 50%,#080d18 100%)', overflowX: 'hidden' }}>
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 0.04 }}>
        {hexagons.map(h => <Hexagon key={h.id} size={28} className="absolute text-cyan-400 hex-float" style={{ left: h.left, top: h.top, animationDelay: h.delay, animationDuration: h.duration }} />)}
      </div>

      <div className="max-w-5xl mx-auto p-3 md:p-5 scrollable-container" style={{ position: 'relative', zIndex: 10, maxHeight: '100vh' }}>

        {notif && (
          <div className={`fixed top-4 left-1/2 z-[9999] notif-anim px-5 py-3 rounded-xl border backdrop-blur-xl shadow-xl flex items-center gap-2 ${notif.t === 's' ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300' : notif.t === 'w' ? 'bg-amber-500/20 border-amber-400/50 text-amber-300' : 'bg-red-500/20 border-red-400/50 text-red-300'}`} style={{ transform: 'translateX(-50%)' }}>
            {notif.t === 's' && <CheckCircle size={15} />}{notif.t === 'w' && <AlertTriangle size={15} />}{notif.t === 'e' && <AlertCircle size={15} />}
            <span className="text-xs font-bold uppercase">{notif.m}</span>
          </div>
        )}

        {/* HEADER */}
        <div className="glass rounded-2xl p-4 mb-5">
          <TechPattern />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-2.5 rounded-xl border border-cyan-400/30 hover:border-cyan-400/60 transition-colors" style={{ background: 'rgba(0,229,255,0.08)' }}><ArrowLeft size={18} className="text-cyan-400" /></button>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Sparkles size={18} className="text-yellow-400" />
                  <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight" style={{ background: 'linear-gradient(90deg,#00e5ff,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CONTRACT ARCHITECT</h1>
                </div>
                <p className="text-[10px] font-bold text-cyan-400/50 uppercase tracking-widest">ECODREUM Legal Engine</p>
              </div>
            </div>
            <button onClick={() => setShowArchives(true)} className="gold-card px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Archive size={14} className="text-yellow-400" /><span className="text-yellow-100">Archives</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black text-yellow-300" style={{ background: 'rgba(255,215,0,0.15)' }}>{savedContracts.length}</span>
            </button>
          </div>
        </div>

        {/* MODE + PAYS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="glass rounded-2xl p-4"><TechPattern /><div className="relative z-10">
            <label className="text-[11px] font-bold text-cyan-400 uppercase mb-3 flex items-center gap-1.5"><Zap size={12} /> Mode</label>
            <div className="flex gap-2">
              {(['ELECTRONIC', 'PRINT'] as const).map(m => (
                <button key={m} onClick={() => updateData('documentMode', m)}
                  className={`flex-1 py-3 rounded-xl font-bold text-[11px] flex flex-col items-center gap-1 transition-all ${data.documentMode === m ? 'text-black shadow-lg' : 'text-cyan-300'}`}
                  style={data.documentMode === m ? { background: m === 'ELECTRONIC' ? 'linear-gradient(135deg,#00e5ff,#3b82f6)' : 'linear-gradient(135deg,#f59e0b,#f97316)' } : { background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,229,255,0.2)' }}>
                  {m === 'ELECTRONIC' ? <Zap size={15} /> : <Printer size={15} />}{m === 'ELECTRONIC' ? 'Électronique' : 'Imprimer'}
                </button>
              ))}
            </div>
          </div></div>
          <div className="glass rounded-2xl p-4"><TechPattern /><div className="relative z-10">
            <label className="text-[11px] font-bold text-cyan-400 uppercase mb-3 flex items-center gap-1.5"><Globe size={12} /> Juridiction</label>
            <div className="flex gap-2">
              {(['SENEGAL', 'BURUNDI'] as const).map(c => (
                <button key={c} onClick={() => updateData('country', c)}
                  className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${data.country === c ? 'text-black shadow-lg' : 'text-cyan-300'}`}
                  style={data.country === c ? { background: 'linear-gradient(135deg,#00e5ff,#3b82f6)' } : { background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,229,255,0.2)' }}>
                  {c}
                </button>
              ))}
            </div>
          </div></div>
        </div>

        {/* PROGRESSION */}
        <div className="glass rounded-2xl p-4 mb-5"><TechPattern /><div className="relative z-10 flex items-center gap-4">
          <Sparkles size={14} className="text-cyan-400 shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between mb-1.5">
              <span className="text-[11px] font-bold text-cyan-400 uppercase">Progression</span>
              <span className="text-base font-black text-cyan-300">{getProgress}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${getProgress}%`, background: 'linear-gradient(90deg,#00e5ff,#3b82f6)', boxShadow: '0 0 10px rgba(0,229,255,0.4)' }} />
            </div>
          </div>
        </div></div>

        {/* ERREURS */}
        {validationErrors.length > 0 && (
          <div className="mb-5 rounded-2xl p-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)' }}>
            <div className="flex items-center gap-2 text-red-400 mb-2"><AlertCircle size={16} /><h3 className="text-sm font-black uppercase">Champs requis</h3></div>
            {validationErrors.map((er, i) => <p key={i} className="text-xs text-red-300 pl-4">• {er}</p>)}
          </div>
        )}

        {/* SECTIONS */}
        <div className="space-y-3 mb-5">
          {[
            { id: 'company', label: 'Entreprise', icon: Building, grad: 'linear-gradient(135deg,#10b981,#14b8a6)' },
            { id: 'employee', label: 'Salarié', icon: User, grad: 'linear-gradient(135deg,#3b82f6,#06b6d4)' },
            { id: 'contract', label: 'Contrat', icon: Briefcase, grad: 'linear-gradient(135deg,#f59e0b,#eab308)' }
          ].map(({ id, label, icon: Icon, grad }) => {
            const progress = getSectionProgress(id as any);
            const isActive = activeSection === id;
            const isComplete = isSectionComplete(id as any);
            const canAccess = canAccessSection(id as any);
            return (
              <div key={id}>
                <div onClick={() => handleSectionClick(id as any)}
                  className={`glass rounded-2xl p-4 relative overflow-hidden transition-all ${canAccess ? 'cursor-pointer glass-hover' : 'cursor-not-allowed opacity-50'} ${isActive ? 'ring-1 ring-cyan-400' : ''}`}
                  style={isActive ? { boxShadow: '0 0 20px rgba(0,229,255,0.15)' } : {}}>
                  <TechPattern />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: grad }}><Icon size={22} className="text-white" /></div>
                        <div><h3 className="text-base font-black uppercase text-white">{label}</h3><p className="text-[10px] text-cyan-300/60">{!canAccess ? 'Verrouillé' : isActive ? 'Fermer' : 'Ouvrir'}</p></div>
                      </div>
                      {isComplete ? <CheckCircle size={18} className="text-emerald-400" /> : canAccess ? (isActive ? <Unlock size={18} className="text-cyan-400" /> : <Lock size={18} className="text-gray-500" />) : <Lock size={18} className="text-red-400/60" />}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)' }}><div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: grad }} /></div>
                      <span className="text-[11px] font-bold text-cyan-300 w-10 text-right">{progress}%</span>
                    </div>
                  </div>
                </div>
                {isActive && canAccess && (
                  <div className="expand-down mt-3"><div className="glass rounded-2xl p-5"><TechPattern /><div className="relative z-10 space-y-4">
                    {id === 'company' && (<>
                      <div className="gold-card rounded-xl p-4 space-y-4">
                        <h4 className="text-[11px] font-black uppercase text-yellow-400 flex items-center gap-1.5"><Sparkles size={11} /> Identité Visuelle</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[11px] font-bold text-yellow-300/80 uppercase mb-2 block">Logo</label>
                            {data.compLogo ? (
                              <div className="relative group inline-block">
                                <div className="p-3 bg-white rounded-xl"><img src={data.compLogo} alt="Logo" className="w-20 h-20 object-contain" /></div>
                                <button onClick={() => updateData('compLogo', null)} className="absolute -top-1.5 -right-1.5 p-1.5 bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow"><X size={10} className="text-white" /></button>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-yellow-400/25 rounded-xl cursor-pointer hover:border-yellow-400/50 hover:bg-yellow-400/5">
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
                      <div className="glass rounded-xl p-3 space-y-2"><TechPattern />
                        <label className="flex items-center gap-2 cursor-pointer relative z-10">
                          <input type="checkbox" checked={data.showCapital} onChange={ev => updateData('showCapital', ev.target.checked)} className="w-4 h-4 accent-cyan-500" />
                          <span className="text-[11px] font-bold text-cyan-300 uppercase">Capital social</span>
                        </label>
                        {data.showCapital && <InputField label="Capital" value={data.compCapital} onChange={v => updateData('compCapital', v)} placeholder={`1 000 000 ${config.currency}`} icon={<DollarSign size={11} />} required />}
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
                    </>)}
                    {id === 'employee' && (<>
                      <InputField label="Nom Complet" value={data.empName} onChange={v => updateData('empName', v)} icon={<User size={11} />} required />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Date de Naissance" type="date" value={data.empBirth} onChange={v => updateData('empBirth', v)} icon={<Calendar size={11} />} required />
                        <InputField label="Lieu de Naissance" value={data.empBirthPlace} onChange={v => updateData('empBirthPlace', v)} icon={<MapPin size={11} />} required />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Nationalité" value={data.empNation} onChange={v => updateData('empNation', v)} icon={<Globe size={11} />} required />
                        <div className="glass rounded-xl p-3 flex items-center gap-2 relative"><TechPattern />
                          <label className="flex items-center gap-2 cursor-pointer relative z-10">
                            <input type="checkbox" checked={data.isForeigner} onChange={ev => updateData('isForeigner', ev.target.checked)} className="w-4 h-4 accent-cyan-500" />
                            <span className="text-[11px] font-bold text-cyan-300 uppercase">Travailleur étranger</span>
                          </label>
                        </div>
                      </div>
                      {data.isForeigner && <div className="rounded-xl p-3" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)' }}><InputField label="Permis de Travail" value={data.empWorkPermit} onChange={v => updateData('empWorkPermit', v)} icon={<Shield size={11} />} required /></div>}
                      <InputField label="Adresse" value={data.empAddr} onChange={v => updateData('empAddr', v)} icon={<MapPin size={11} />} required />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Pièce d'Identité" value={data.empID} onChange={v => updateData('empID', v)} icon={<FileText size={11} />} required />
                        <InputField label="Téléphone" type="tel" value={data.empPhone} onChange={v => updateData('empPhone', v)} icon={<User size={11} />} required />
                      </div>
                    </>)}
                    {id === 'contract' && (<>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-cyan-300 uppercase flex items-center gap-1.5"><Briefcase size={11} /> Type *</label>
                          <select value={data.jobType} onChange={ev => updateData('jobType', ev.target.value)} className="input-field">
                            <option value="CDI">CDI</option><option value="CDD">CDD</option><option value="STAGE">Stage</option>
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
                        {(data.jobType === 'CDD' || data.jobType === 'STAGE') && <InputField label="Date de Fin" type="date" value={data.endDate} onChange={v => updateData('endDate', v)} icon={<Calendar size={11} />} required />}
                      </div>
                      {data.jobType === 'CDI' && <div className="rounded-xl p-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}><InputField label="Tâches Confiées" value={data.jobDescription} onChange={v => updateData('jobDescription', v)} icon={<FileText size={11} />} required multiline /></div>}
                      {data.jobType === 'CDD' && <div className="rounded-xl p-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}><InputField label="Motif du CDD" value={data.cddReason} onChange={v => updateData('cddReason', v)} icon={<FileText size={11} />} required multiline /></div>}
                      {data.jobType === 'STAGE' && <div className="rounded-xl p-3" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)' }}><InputField label="Missions du Stage" value={data.stageTasks} onChange={v => updateData('stageTasks', v)} icon={<FileText size={11} />} required multiline /></div>}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.jobType === 'STAGE' ? (
                          <div className="flex flex-col gap-1.5">
                            <InputField label={`Indemnité (${config.currency})`} type="number" value={data.stageAllowance} onChange={v => updateData('stageAllowance', v)} icon={<DollarSign size={11} />} required />
                            {salaryDisplay.words && <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)' }}><p className="text-[10px] text-cyan-300/80 italic">{salaryDisplay.words}</p></div>}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            <InputField label={`Salaire Brut (${config.currency})`} type="number" value={data.salary} onChange={v => updateData('salary', v)} icon={<DollarSign size={11} />} required />
                            {salaryDisplay.words && <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)' }}><p className="text-[10px] text-cyan-300/80 italic">{salaryDisplay.words}</p></div>}
                          </div>
                        )}
                        <InputField label="Primes / Avantages" value={data.bonus} onChange={v => updateData('bonus', v)} icon={<Award size={11} />} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Heures / Semaine" type="number" value={data.hours} onChange={v => updateData('hours', v)} icon={<Clock size={11} />} required />
                        {data.jobType !== 'STAGE' && <InputField label="Essai (mois)" type="number" value={data.trial} onChange={v => updateData('trial', v)} icon={<Calendar size={11} />} required />}
                      </div>
                      {data.jobType !== 'STAGE' && (
                        <div className="gold-card rounded-xl p-3 space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={data.hasNonCompete} onChange={ev => updateData('hasNonCompete', ev.target.checked)} className="w-4 h-4 accent-yellow-500" />
                            <span className="text-[11px] font-bold text-yellow-300 uppercase flex items-center gap-1.5"><Shield size={11} /> Non-concurrence</span>
                          </label>
                          {data.hasNonCompete && <InputField label="Durée" value={data.nonCompeteDuration} onChange={v => updateData('nonCompeteDuration', v)} placeholder="Ex : 12 mois" icon={<Shield size={11} />} required />}
                        </div>
                      )}
                    </>)}
                  </div></div></div>
                )}
              </div>
            );
          })}
        </div>

        {/* ACTIONS */}
        <div className="glass rounded-2xl p-5 mb-8"><TechPattern /><div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'rgba(0,229,255,0.15)' }}><CheckCircle size={18} className="text-cyan-400" /><h3 className="text-base font-black uppercase text-cyan-300">Actions</h3></div>
          {data.documentMode === 'ELECTRONIC' && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-black uppercase text-cyan-400 flex items-center gap-1.5"><PenTool size={11} /> Signatures</h4>
              <div className="grid grid-cols-2 gap-2">
                {(['employer', 'employee'] as const).map(s => (
                  <button key={s} onClick={() => openSigModal(s)} className="py-3 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
                    style={signatures[s] ? { background: s === 'employer' ? 'linear-gradient(135deg,#10b981,#14b8a6)' : 'linear-gradient(135deg,#3b82f6,#06b6d4)', color: '#000' } : { background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(0,229,255,0.2)', color: '#67e8f9' }}>
                    <PenTool size={13} />{signatures[s] ? (s === 'employer' ? 'Employeur ✓' : 'Salarié ✓') : s === 'employer' ? 'Employeur' : 'Salarié'}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-2 pt-3 border-t" style={{ borderColor: 'rgba(0,229,255,0.15)' }}>
            {data.documentMode === 'ELECTRONIC' ? (
              <button onClick={generatePDF} disabled={isGenerating} className="w-full py-4 rounded-xl font-black uppercase text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:opacity-90 active:scale-[0.98]" style={{ background: 'linear-gradient(135deg,#00e5ff,#3b82f6)', color: '#000', boxShadow: '0 4px 20px rgba(0,229,255,0.3)' }}>
                {isGenerating ? <><div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" /><span>Génération...</span></> : <><Download size={17} /><span>Générer PDF</span></>}
              </button>
            ) : (
              <button onClick={generateWord} className="w-full py-4 rounded-xl font-black uppercase text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]" style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)', color: '#000', boxShadow: '0 4px 20px rgba(245,158,11,0.3)' }}>
                <Download size={17} /><span>Télécharger Word</span>
              </button>
            )}
          </div>
          <div className="pt-3 border-t space-y-2" style={{ borderColor: 'rgba(0,229,255,0.15)' }}>
            <div className="gold-card rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-yellow-400 mb-2"><Scale size={13} /><span className="text-[11px] font-black uppercase">Récapitulatif</span></div>
              <InfoRow label="Pays" value={config.name} /><InfoRow label="Devise" value={config.currency} /><InfoRow label="Type" value={data.jobType} /><InfoRow label="Mode" value={data.documentMode === 'ELECTRONIC' ? 'E-Sign' : 'Print'} />
              {salaryDisplay.words && <InfoRow label="Salaire" value={salaryDisplay.formatted + ' ' + config.currency} />}
            </div>
            <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)' }}>
              <AlertTriangle size={13} className="text-amber-400 mt-0.5 shrink-0" /><p className="text-[10px] text-amber-300/90">Ne remplace pas un conseil juridique</p>
            </div>
          </div>
        </div></div>

        {/* MODAL SIGNATURE */}
        {showSignatureModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}>
            <div className="glass rounded-2xl p-5 w-full max-w-2xl fade-in"><TechPattern /><div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-black uppercase text-cyan-300 flex items-center gap-2"><PenTool size={20} /> Signature {currentSigner === 'employer' ? 'Employeur' : 'Salarié'}</h3>
                <button onClick={() => { setShowSignatureModal(false); setCurrentSigner(null); }} className="p-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}><X size={18} /></button>
              </div>
              <div className="rounded-xl overflow-hidden shadow-2xl mb-4 bg-white" style={{ touchAction: 'none' }}>
                <canvas ref={currentSigner === 'employer' ? signatureCanvasEmployer : signatureCanvasEmployee}
                  width={660} height={280} onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                  onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
                  className="cursor-crosshair w-full" style={{ touchAction: 'none', display: 'block' }} />
              </div>
              <div className="flex gap-3">
                <button onClick={clearSig} className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5' }}><Trash2 size={15} /> Effacer</button>
                <button onClick={saveSig} className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90" style={{ background: 'linear-gradient(135deg,#10b981,#14b8a6)', color: '#000' }}><Save size={15} /> Enregistrer</button>
              </div>
            </div></div>
          </div>
        )}

        {/* MODAL ARCHIVES */}
        {showArchives && (
          <div className="fixed inset-0 z-[9999] scrollable-container p-4" style={{ background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(12px)' }}>
            <div className="max-w-5xl mx-auto my-6 fade-in"><div className="glass rounded-2xl p-5"><TechPattern /><div className="relative z-10">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-black uppercase text-cyan-300 flex items-center gap-3"><Archive size={24} className="text-yellow-400" /> Archives ({savedContracts.length})</h2>
                <button onClick={() => setShowArchives(false)} className="px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}><X size={16} /> Fermer</button>
              </div>
              <div className="mb-5 rounded-xl p-4" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)' }}>
                <h4 className="text-[11px] font-black uppercase text-purple-400 flex items-center gap-1.5 mb-3"><Upload size={11} /> Charger un contrat</h4>
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full py-3 rounded-xl font-bold text-[11px] flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc' }}>
                  {isUploading ? <><div className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full" /><span>Chargement...</span></> : <><Upload size={13} /><span>Depuis l&apos;appareil (PDF/Word)</span></>}
                </button>
              </div>
              {savedContracts.length === 0 ? (
                <div className="text-center py-16"><Archive size={48} className="mx-auto mb-4" style={{ color: 'rgba(0,229,255,0.2)' }} /><p className="text-cyan-300/50 font-bold">Aucun contrat</p></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {savedContracts.map(c => (
                    <div key={c.id} className="glass rounded-xl p-4 space-y-3 glass-hover"><TechPattern /><div className="relative z-10">
                      <div className="flex justify-between items-start mb-2">
                        <div><h3 className="font-black text-sm text-cyan-300">{c.employeeName || '—'}</h3><p className="text-[11px] text-cyan-400/60">{c.jobTitle}</p></div>
                        <span className="text-[10px] px-2 py-0.5 rounded-lg font-bold" style={c.mode === 'ELECTRONIC' ? { background: 'rgba(0,229,255,0.12)', color: '#67e8f9' } : { background: 'rgba(245,158,11,0.12)', color: '#fcd34d' }}>{c.fileType || (c.mode === 'ELECTRONIC' ? 'PDF' : 'WORD')}</span>
                      </div>
                      <div className="text-[11px] space-y-1 pt-2 border-t" style={{ borderColor: 'rgba(0,229,255,0.15)', color: 'rgba(103,232,249,0.65)' }}>
                        <div className="flex justify-between"><span>Type</span><span className="font-bold text-cyan-300">{c.contractType}</span></div>
                        <div className="flex justify-between"><span>Date</span><span className="font-bold text-cyan-300">{new Date(c.createdAt).toLocaleDateString('fr-FR')}</span></div>
                        {c.signed && <div className="flex items-center gap-1 text-emerald-400 font-bold pt-1"><CheckCircle size={11} /> Signé</div>}
                      </div>
                      <div className="flex gap-2 pt-3">
                        <button onClick={() => setPreviewContract(c)} className="flex-1 py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5" style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc' }}><Eye size={11} /> Détails</button>
                        <button onClick={() => downloadArchivedFile(c)} className="flex-1 py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5" style={{ background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.3)', color: '#67e8f9' }}><Download size={11} /> Télécharger</button>
                        <button onClick={() => deleteContract(c.id)} className="p-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}><Trash2 size={13} /></button>
                      </div>
                    </div></div>
                  ))}
                </div>
              )}
            </div></div></div>
          </div>
        )}

        {/* MODAL PREVIEW */}
        {previewContract && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(12px)' }}>
            <div className="glass rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col fade-in"><TechPattern />
              <div className="relative z-10 p-5 border-b" style={{ borderColor: 'rgba(0,229,255,0.15)' }}>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black uppercase text-cyan-300 flex items-center gap-2"><Eye size={20} className="text-purple-400" /> Détails</h2>
                  <button onClick={() => setPreviewContract(null)} className="p-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}><X size={18} /></button>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-cyan-300/70">
                  <span className="font-bold">{previewContract.employeeName}</span><span>•</span><span>{previewContract.jobTitle}</span><span>•</span><span>{new Date(previewContract.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
              <div className="relative z-10 flex-1 overflow-auto scrollable-container p-5 space-y-4">
                {previewContract.data && (
                  <div className="gold-card rounded-xl p-4 space-y-2">
                    <h3 className="font-bold text-sm text-yellow-400 mb-3">Informations</h3>
                    <InfoRow label="Employé" value={previewContract.data.empName || '—'} />
                    <InfoRow label="Poste" value={previewContract.data.jobTitle || '—'} />
                    <InfoRow label="Type" value={previewContract.data.jobType || '—'} />
                    <InfoRow label="Département" value={previewContract.data.jobDept || '—'} />
                    <InfoRow label="Lieu" value={previewContract.data.jobLocation || '—'} />
                    {previewContract.data.jobType !== 'STAGE' && <InfoRow label="Salaire" value={(new Intl.NumberFormat('fr-FR').format(parseFloat(previewContract.data.salary) || 0)) + ' ' + COUNTRIES[previewContract.data.country].currency} />}
                    {previewContract.data.jobType === 'STAGE' && previewContract.data.stageAllowance && <InfoRow label="Indemnité" value={(new Intl.NumberFormat('fr-FR').format(parseFloat(previewContract.data.stageAllowance) || 0)) + ' ' + COUNTRIES[previewContract.data.country].currency} />}
                    <InfoRow label="Début" value={previewContract.data.startDate ? new Date(previewContract.data.startDate).toLocaleDateString('fr-FR') : '—'} />
                    {previewContract.data.endDate && <InfoRow label="Fin" value={new Date(previewContract.data.endDate).toLocaleDateString('fr-FR')} />}
                    <InfoRow label="Entreprise" value={previewContract.data.compName || '—'} />
                    {previewContract.signed && <div className="flex items-center gap-1.5 text-emerald-400 font-bold pt-2 text-xs"><CheckCircle size={13} /> Signé</div>}
                  </div>
                )}
                <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.2)' }}>
                  <FileText size={40} className="mx-auto mb-3 text-cyan-400" />
                  <p className="text-cyan-300 font-bold mb-1 text-sm">Télécharger le document</p>
                  <p className="text-[10px] text-cyan-400/60 mb-4">Consultez avec votre lecteur local</p>
                  <button onClick={() => downloadArchivedFile(previewContract)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90" style={{ background: 'linear-gradient(135deg,#00e5ff,#3b82f6)', color: '#000' }}>
                    <Download size={16} /> Télécharger
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
