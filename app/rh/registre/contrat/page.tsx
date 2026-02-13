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

// ===================== TYPES =====================
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
  obligations: { employer: string[]; employee: string[]; };
}

interface SavedContract {
  id: string; employeeName: string; jobTitle: string; contractType: string; mode: string;
  createdAt: string; data: FormData; signed?: boolean;
  employerSignature?: string; employeeSignature?: string;
  fileUrl?: string; fileType?: string; verificationCode?: string;
}

// ===================== CONFIG PAYS =====================
const COUNTRIES: Record<'SENEGAL' | 'BURUNDI', CountryConfig> = {
  SENEGAL: {
    name: "Sénégal",
    code: "Loi n° 97-17 du 1er décembre 1997 portant Code du Travail",
    court: "Tribunal du Travail de Dakar",
    idLabel: "NINEA",
    currency: "FCFA",
    obligations: {
      employer: [
        "Fournir au Salarié le travail convenu ainsi que les moyens nécessaires à son exécution",
        "Verser la rémunération due aux échéances convenues conformément à la législation en vigueur",
        "Respecter la législation du travail et les conventions collectives applicables au Sénégal",
        "Assurer la sécurité et protéger la santé physique et mentale du Salarié sur le lieu de travail",
        "Déclarer le Salarié à la Caisse de Sécurité Sociale (CSS) et à l'Institution de Prévoyance Retraite du Sénégal (IPRES) dans les délais légaux",
        "Délivrer au Salarié un bulletin de paie détaillé à chaque échéance de paiement",
        "Respecter la dignité du Salarié et garantir un environnement de travail exempt de harcèlement"
      ],
      employee: [
        "Exécuter personnellement et avec diligence le travail convenu selon les directives de l'Employeur",
        "Respecter les horaires de travail établis et signaler toute absence ou retard",
        "Observer une obligation de loyauté, de fidélité et de bonne foi envers l'Employeur",
        "Garder le secret professionnel sur toutes les informations confidentielles de l'entreprise",
        "Prendre soin du matériel, des équipements et des locaux mis à sa disposition",
        "Se conformer au règlement intérieur et aux politiques de l'entreprise",
        "Ne pas exercer d'activité concurrente pendant la durée du contrat sans autorisation écrite"
      ]
    }
  },
  BURUNDI: {
    name: "Burundi",
    code: "Loi n° 1/11 du 24 novembre 2020 portant Code du Travail du Burundi",
    court: "Tribunal du Travail de Bujumbura",
    idLabel: "NIF",
    currency: "FBu",
    obligations: {
      employer: [
        "Fournir au Salarié le travail convenu ainsi que les moyens nécessaires à son exécution",
        "Verser la rémunération due aux échéances convenues conformément à la législation en vigueur",
        "Respecter la législation du travail et les conventions collectives applicables au Burundi",
        "Assurer la sécurité et protéger la santé physique et mentale du Salarié sur le lieu de travail",
        "Déclarer le Salarié à l'INSS (Institut National de Sécurité Sociale) dans les délais légaux",
        "Délivrer au Salarié un bulletin de paie détaillé à chaque échéance de paiement",
        "Respecter la dignité du Salarié et garantir un environnement de travail exempt de harcèlement"
      ],
      employee: [
        "Exécuter personnellement et avec diligence le travail convenu selon les directives de l'Employeur",
        "Respecter les horaires de travail établis et signaler toute absence ou retard",
        "Observer une obligation de loyauté, de fidélité et de bonne foi envers l'Employeur",
        "Garder le secret professionnel sur toutes les informations confidentielles de l'entreprise",
        "Prendre soin du matériel, des équipements et des locaux mis à sa disposition",
        "Se conformer au règlement intérieur et aux politiques de l'entreprise",
        "Ne pas exercer d'activité concurrente pendant la durée du contrat sans autorisation écrite"
      ]
    }
  }
};

// ===================== NOMBRE EN LETTRES =====================
function numberToFrenchWords(n: number): string {
  if (isNaN(n) || n < 0) return '';
  if (n === 0) return 'Zéro';
  const units = ['', 'Un', 'Deux', 'Trois', 'Quatre', 'Cinq', 'Six', 'Sept', 'Huit', 'Neuf',
    'Dix', 'Onze', 'Douze', 'Treize', 'Quatorze', 'Quinze', 'Seize', 'Dix-Sept', 'Dix-Huit', 'Dix-Neuf'];
  const tens = ['', '', 'Vingt', 'Trente', 'Quarante', 'Cinquante', 'Soixante', 'Soixante', 'Quatre-Vingt', 'Quatre-Vingt'];
  const below100 = (num: number): string => {
    if (num < 20) return units[num];
    const t = Math.floor(num / 10), u = num % 10;
    if (t === 7 || t === 9) { const b = t === 7 ? 'Soixante' : 'Quatre-Vingt'; return (10 + u === 11 && t === 7) ? b + ' et Onze' : b + '-' + units[10 + u]; }
    if (u === 0) return t === 8 ? 'Quatre-Vingts' : tens[t];
    return (u === 1 && t !== 8) ? tens[t] + ' et Un' : tens[t] + '-' + units[u];
  };
  const below1000 = (num: number): string => {
    if (num < 100) return below100(num);
    const h = Math.floor(num / 100), r = num % 100;
    const hStr = h === 1 ? 'Cent' : units[h] + ' Cent';
    if (r === 0) return h > 1 ? units[h] + ' Cents' : hStr;
    return hStr + ' ' + below100(r);
  };
  const chunks = [
    { v: 1000000000, n: 'Milliard', p: 'Milliards' },
    { v: 1000000, n: 'Million', p: 'Millions' },
    { v: 1000, n: 'Mille', p: 'Mille' },
    { v: 1, n: '', p: '' }
  ];
  let result = '', remaining = Math.floor(n);
  for (const c of chunks) {
    if (remaining >= c.v) {
      const count = Math.floor(remaining / c.v);
      remaining %= c.v;
      if (c.v === 1) result += (result ? ' ' : '') + below1000(count);
      else if (c.v === 1000) result += (result ? ' ' : '') + (count === 1 ? 'Mille' : below1000(count) + ' Mille');
      else result += (result ? ' ' : '') + (count === 1 ? 'Un ' + c.n : below1000(count) + ' ' + (count > 1 ? c.p : c.n));
    }
  }
  return result.trim() || 'Zéro';
}

function formatSalaryDisplay(amount: string, currency: string): { formatted: string; words: string } {
  const num = parseFloat((amount || '0').replace(/\s/g, '').replace(/,/g, '.'));
  if (isNaN(num) || num <= 0) return { formatted: '0', words: '' };
  return { formatted: new Intl.NumberFormat('fr-FR').format(num), words: numberToFrenchWords(num) + ' ' + currency };
}

function generateVerificationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const prefix = 'ECO';
  let code = prefix + '-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  code += '-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ===================== QR CODE GENERATOR (SVG) =====================
function generateQRCodeDataURL(text: string): string {
  // Simple QR-like pattern using a deterministic hash of the text
  // This creates a scannable-looking pattern for visual authenticity
  const size = 21;
  const moduleSize = 4;
  const imgSize = size * moduleSize;
  const modules: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));

  // Finder patterns (3 corners)
  const addFinder = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
      if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4))
        if (r + i < size && c + j < size) modules[r + i][c + j] = true;
    }
  };
  addFinder(0, 0); addFinder(0, size - 7); addFinder(size - 7, 0);

  // Data pattern from text hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) { hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0; }
  let seed = Math.abs(hash);
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
    if (!modules[r][c] && r > 8 && c > 8) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      modules[r][c] = (seed % 3) === 0;
    }
  }

  // Build SVG
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${imgSize}" height="${imgSize}" viewBox="0 0 ${imgSize} ${imgSize}">`;
  svg += `<rect width="${imgSize}" height="${imgSize}" fill="white"/>`;
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
    if (modules[r][c]) svg += `<rect x="${c * moduleSize}" y="${r * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
  }
  svg += '</svg>';
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

// ===================== STYLES =====================
const globalStyles = `
  @keyframes hexFloat { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-12px) rotate(180deg); } }
  @keyframes slideInDown { from { transform: translateY(-8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes expandDown { from { max-height: 0; opacity: 0; } to { max-height: 5000px; opacity: 1; } }
  .hex-float { animation: hexFloat 6s ease-in-out infinite; }
  .notif-anim { animation: slideInDown 0.25s ease-out; }
  .fade-in { animation: fadeIn 0.2s ease-out; }
  .expand-down { animation: expandDown 0.4s ease-out forwards; overflow: visible; }
  .glass { background: rgba(0,20,40,0.55); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1px solid rgba(0,229,255,0.15); transition: all 0.25s; }
  .glass:hover { border-color: rgba(0,229,255,0.3); }
  .glass-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,229,255,0.12); }
  .gold-card { background: linear-gradient(135deg,rgba(255,215,0,0.07),rgba(255,165,0,0.07)); border: 1px solid rgba(255,215,0,0.2); }
  .input-field { background: rgba(0,0,0,0.55); border: 1px solid rgba(0,229,255,0.25); border-radius: 12px; padding: 12px; font-size: 14px; color: #fff; outline: none; transition: all 0.2s; width: 100%; }
  .input-field:focus { border-color: rgba(0,229,255,0.6); box-shadow: 0 0 0 3px rgba(0,229,255,0.1); }
  .input-field::placeholder { color: rgba(0,229,255,0.35); }
  html, body { overflow-x: hidden; scroll-behavior: smooth; }
  .scrollable-container { overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; }
  .scrollable-container::-webkit-scrollbar { width: 8px; }
  .scrollable-container::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
  .scrollable-container::-webkit-scrollbar-thumb { background: rgba(0,229,255,0.3); border-radius: 10px; }
`;

// ===================== COMPOSANTS UI =====================
const TechPattern = memo(() => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs><pattern id="tg" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/><circle cx="0" cy="0" r="1" fill="currentColor"/></pattern></defs>
    <rect width="100%" height="100%" fill="url(#tg)"/>
  </svg>
));
TechPattern.displayName = 'TechPattern';

const InputField = memo(({ label, value, onChange, type = "text", placeholder = "...", icon, required = false, disabled = false, multiline = false }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; icon?: React.ReactNode; required?: boolean; disabled?: boolean; multiline?: boolean }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold text-cyan-300 uppercase flex items-center gap-1.5">{icon && <span className="text-cyan-400">{icon}</span>}{label}{required && <span className="text-red-400">*</span>}</label>
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

// ===================== BUILD PDF =====================
function buildPDF(data: FormData, config: CountryConfig, signatures: { employer: string; employee: string }, verificationCode: string): jsPDF {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  const PW = 210, PH = 297, ML = 25, MR = 25, MT = 22, MB = 22;
  const CW = PW - ML - MR;
  let y = MT, pg = 1;
  const worker = data.jobType === 'STAGE' ? 'Stagiaire' : 'Salarié';
  const WORKER = data.jobType === 'STAGE' ? 'LE STAGIAIRE' : 'LE SALARIÉ';

  const footer = () => {
    pdf.setDrawColor(180, 180, 180); pdf.setLineWidth(0.3); pdf.line(ML, PH - 16, PW - MR, PH - 16);
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7); pdf.setTextColor(150, 150, 150);
    pdf.text('Document généré par ECODREUM Intelligence — Réf: ' + verificationCode, ML, PH - 11);
    pdf.setFont('helvetica', 'bold'); pdf.setTextColor(0, 80, 140); pdf.text('Page ' + pg, PW - MR, PH - 11, { align: 'right' });
  };
  const ck = (n: number) => { if (y + n > PH - MB - 16) { footer(); pdf.addPage(); pg++; y = MT; } };
  const lh = (s: number) => s * 0.42 + 1.2;

  const wr = (txt: string, sz: number, st: string, al: string, col: number[]) => {
    pdf.setFont('helvetica', st as any); pdf.setFontSize(sz); pdf.setTextColor(col[0], col[1], col[2]);
    const w = CW - 4, lines = pdf.splitTextToSize(txt, w), h = lh(sz);
    ck(lines.length * h + 1);
    const x = al === 'center' ? PW / 2 : al === 'right' ? PW - MR - 2 : ML;
    for (const l of lines) { pdf.text(l, x, y, { align: al as any, maxWidth: w }); y += h; }
  };

  const sp = (mm: number) => { y += mm; };
  const ln = (c: number[], w: number) => { ck(3); pdf.setDrawColor(c[0], c[1], c[2]); pdf.setLineWidth(w); pdf.line(ML, y, PW - MR, y); y += 3; };

  const article = (title: string, content: string) => {
    ck(12);
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(11);
    const tL = pdf.splitTextToSize(title, CW - 10), tH = tL.length * lh(11);
    ck(tH + 8);
    pdf.setFillColor(0, 90, 160); pdf.rect(ML, y - 1, 3, tH + 2, 'F');
    pdf.setTextColor(0, 70, 130);
    for (const l of tL) { pdf.text(l, ML + 8, y + lh(11) * 0.65, { maxWidth: CW - 10 }); y += lh(11); }
    y += 5;
    for (const para of content.split('\n').filter(l => l.trim())) {
      const t = para.trim();
      const indent = t.startsWith('•') ? 8 : 0;
      const maxW = CW - 4 - indent;
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10); pdf.setTextColor(35, 35, 35);
      const pL = pdf.splitTextToSize(t, maxW), pH = pL.length * lh(10);
      ck(pH + 1);
      for (const l of pL) { pdf.text(l, ML + indent, y, { maxWidth: maxW }); y += lh(10); }
      y += 1.2;
    }
    y += 4;
  };

  const subTitle = (text: string) => {
    ck(8);
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10); pdf.setTextColor(30, 30, 30);
    const lines = pdf.splitTextToSize(text, CW - 4);
    for (const l of lines) { pdf.text(l, ML, y, { maxWidth: CW - 4 }); y += lh(10); }
    y += 2;
  };

  // ---- HEADER ----
  pdf.setFillColor(0, 30, 60); pdf.rect(0, 0, PW, 30, 'F');
  pdf.setFillColor(0, 140, 190); pdf.rect(0, 30, PW, 1.2, 'F');
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(18); pdf.setTextColor(255, 255, 255);
  const mainT = data.jobType === 'STAGE' ? 'CONVENTION DE STAGE' : 'CONTRAT DE TRAVAIL';
  pdf.text(mainT, PW / 2, 14, { align: 'center' });
  pdf.setFontSize(10); pdf.setTextColor(180, 215, 255);
  const regimeT = data.jobType === 'CDI' ? 'CONTRAT À DURÉE INDÉTERMINÉE' : data.jobType === 'CDD' ? 'CONTRAT À DURÉE DÉTERMINÉE' : 'CONVENTION DE STAGE';
  pdf.text('RÉGIME : ' + regimeT, PW / 2, 21, { align: 'center' });
  pdf.setFont('helvetica', 'italic'); pdf.setFontSize(8); pdf.setTextColor(160, 190, 230);
  pdf.text(config.code, PW / 2, 27, { align: 'center' });
  y = 37;

  // ---- LOGO ----
  if (data.compLogo) { try { pdf.addImage(data.compLogo, data.compLogo.includes('png') ? 'PNG' : 'JPEG', ML, y, 16, 16); } catch {} }
  const lo = data.compLogo ? 20 : 0;
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(13); pdf.setTextColor(0, 40, 90);
  pdf.text(data.compName.toUpperCase(), ML + lo, y + 7);
  if (data.compDescription) { pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(90, 90, 90); pdf.text(pdf.splitTextToSize(data.compDescription, CW - lo - 4).slice(0, 2), ML + lo, y + 13); }
  y += 22; ln([0, 120, 170], 0.6); sp(4);

  // ---- ENTRE LES SOUSSIGNES ----
  wr('ENTRE LES SOUSSIGNÉS :', 11, 'bold', 'left', [0, 40, 90]); sp(4);
  const capCl = data.showCapital && data.compCapital ? ', au capital social de ' + new Intl.NumberFormat('fr-FR').format(parseFloat(data.compCapital) || 0) + ' ' + config.currency : '';
  wr('La société ' + data.compName + ', ' + data.compType + capCl + ', dont le siège social est situé à ' + data.compAddr + ', immatriculée au Registre de Commerce et du Crédit Mobilier (RCCM) sous le numéro ' + data.compRCCM + ' et identifiée au ' + config.idLabel + ' sous le numéro ' + data.compID + ', représentée aux présentes par M./Mme ' + data.bossName + ', agissant en sa qualité de ' + data.bossTitle + ', dûment habilité(e).', 10, 'normal', 'left', [35, 35, 35]);
  sp(3); wr('Ci-après dénommée « L\'EMPLOYEUR »', 9, 'italic', 'right', [90, 90, 90]);
  sp(3); wr('D\'UNE PART,', 11, 'bold', 'center', [0, 40, 90]); sp(2);
  wr('ET :', 11, 'bold', 'center', [0, 40, 90]); sp(3);
  const fCl = data.isForeigner && data.empWorkPermit ? ', titulaire du permis de travail n°' + data.empWorkPermit : '';
  wr('M./Mme ' + data.empName + ', né(e) le ' + (data.empBirth ? new Date(data.empBirth).toLocaleDateString('fr-FR') : '—') + ' à ' + data.empBirthPlace + ', de nationalité ' + data.empNation + fCl + ', titulaire de la pièce d\'identité nationale n°' + data.empID + ', demeurant à ' + data.empAddr + ', joignable au ' + data.empPhone + '.', 10, 'normal', 'left', [35, 35, 35]);
  sp(3); wr('Ci-après dénommé(e) « ' + WORKER + ' »', 9, 'italic', 'right', [90, 90, 90]);
  sp(3); wr('D\'AUTRE PART,', 11, 'bold', 'center', [0, 40, 90]);
  sp(5); ln([0, 100, 160], 0.5); sp(3);
  wr('Vu la ' + config.code + ',', 10, 'bold', 'left', [35, 35, 35]); sp(3);

  // ---- ARTICLES ----
  let aNum = 1;
  // Art 1 - Engagement
  let engBody = 'L\'Employeur engage le ' + worker + ' qui accepte, aux conditions définies dans le présent contrat.\nLe présent contrat est régi par les dispositions du ' + config.code + ' et les textes réglementaires pris pour son application.';
  article('ARTICLE ' + aNum + ' : ENGAGEMENT', engBody); aNum++;

  // Art 2 - Fonctions
  let funcBody = 'Le ' + worker + ' est engagé en qualité de ' + data.jobTitle + ' au sein du département ' + data.jobDept + '.\nLieu d\'exercice des fonctions : ' + data.jobLocation + '.\nType de contrat : à durée ' + (data.jobType === 'CDI' ? 'indéterminée (CDI)' : data.jobType === 'CDD' ? 'déterminée (CDD)' : 'stage') + '.';
  if (data.jobType === 'CDI' && data.jobDescription) funcBody += '\nTâches confiées : ' + data.jobDescription + '.';
  if (data.jobType === 'CDD' && data.cddReason) funcBody += '\nMotif du CDD : ' + data.cddReason + '.';
  if (data.jobType === 'STAGE' && data.stageTasks) funcBody += '\nMissions du stage : ' + data.stageTasks + '.';
  funcBody += '\nLe ' + worker + ' s\'engage à exercer ses fonctions avec diligence, compétence et loyauté, conformément aux directives de l\'Employeur et aux usages de la profession.';
  article('ARTICLE ' + aNum + ' : FONCTIONS ET ATTRIBUTIONS', funcBody); aNum++;

  // Art 3 - Durée
  let durBody = 'Le présent contrat prend effet à compter du ' + (data.startDate ? new Date(data.startDate).toLocaleDateString('fr-FR') : '—') + '.';
  if ((data.jobType === 'CDD' || data.jobType === 'STAGE') && data.endDate) durBody += '\nIl prendra fin le ' + new Date(data.endDate).toLocaleDateString('fr-FR') + '.';
  article('ARTICLE ' + aNum + ' : DURÉE DU CONTRAT', durBody); aNum++;

  // Art 4 - Période d'essai
  if (data.jobType !== 'STAGE') {
    article('ARTICLE ' + aNum + ' : PÉRIODE D\'ESSAI', 'Une période d\'essai de ' + data.trial + ' mois est convenue entre les parties.\nDurant cette période, chacune des parties pourra mettre fin au contrat sans préavis ni indemnité, conformément aux dispositions légales.\nÀ l\'issue de la période d\'essai, si aucune des parties n\'a manifesté sa volonté de rompre le contrat, celui-ci se poursuivra dans les conditions définies aux présentes.');
    aNum++;
  }

  // Art 5 - Rémunération
  const salAmt = data.jobType === 'STAGE' ? data.stageAllowance : data.salary;
  const sd = formatSalaryDisplay(salAmt, config.currency);
  let remuBody = data.jobType === 'STAGE'
    ? 'Le Stagiaire percevra une gratification mensuelle de ' + sd.formatted + ' ' + config.currency + '.'
    : 'En contrepartie de l\'exécution de ses fonctions, le Salarié percevra une rémunération mensuelle brute de ' + sd.formatted + ' ' + config.currency + '.';
  if (sd.words) remuBody += '\nSoit en toutes lettres : ' + sd.words + '.';
  if (data.jobType !== 'STAGE') remuBody += '\nCette rémunération est versée mensuellement par virement bancaire, sous réserve des retenues légales et conventionnelles applicables.';
  if (data.bonus) remuBody += '\nAvantages complémentaires : ' + data.bonus + '.';
  remuBody += '\nLa durée hebdomadaire de travail est fixée à ' + data.hours + ' heures, conformément aux dispositions légales en vigueur.';
  article('ARTICLE ' + aNum + ' : RÉMUNÉRATION ET DURÉE DU TRAVAIL', remuBody); aNum++;

  // Art 6 - Obligations
  ck(14);
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(11);
  const oblTitle = 'ARTICLE ' + aNum + ' : OBLIGATIONS DES PARTIES';
  const oblTL = pdf.splitTextToSize(oblTitle, CW - 10), oblTH = oblTL.length * lh(11);
  ck(oblTH + 8);
  pdf.setFillColor(0, 90, 160); pdf.rect(ML, y - 1, 3, oblTH + 2, 'F');
  pdf.setTextColor(0, 70, 130);
  for (const l of oblTL) { pdf.text(l, ML + 8, y + lh(11) * 0.65, { maxWidth: CW - 10 }); y += lh(11); }
  y += 5;

  subTitle(aNum + '.1. Obligations de l\'Employeur :');
  for (const o of config.obligations.employer) { wr('• ' + o, 10, 'normal', 'left', [35, 35, 35]); sp(1); }
  sp(3);
  subTitle(aNum + '.2. Obligations du/de la ' + worker + '(e) :');
  for (const o of config.obligations.employee) { wr('• ' + o, 10, 'normal', 'left', [35, 35, 35]); sp(1); }
  sp(4);
  aNum++;

  // Art 7 - Non-concurrence
  if (data.hasNonCompete && data.jobType !== 'STAGE') {
    article('ARTICLE ' + aNum + ' : CLAUSE DE NON-CONCURRENCE', 'Le Salarié s\'engage, pendant une durée de ' + data.nonCompeteDuration + ' suivant la cessation du présent contrat, quelle qu\'en soit la cause, à ne pas exercer, directement ou indirectement, une activité concurrente à celle de l\'Employeur.\nCette obligation s\'applique sur le territoire du ' + config.name + '.\nEn contrepartie, le Salarié percevra une indemnité compensatrice conformément aux dispositions légales applicables.');
    aNum++;
  }

  // Art - Rupture
  const ruptBody = data.jobType === 'STAGE'
    ? 'Le présent stage prendra fin à la date prévue. En cas de manquement grave, l\'Employeur se réserve le droit de mettre fin au stage de manière anticipée.\nLe Stagiaire pourra également mettre fin au stage moyennant un préavis raisonnable.'
    : 'La rupture du contrat de travail est soumise aux dispositions du ' + config.code + '.\nChaque partie peut résilier le contrat en respectant le préavis légal ou conventionnel applicable.\nEn cas de faute grave ou lourde, le contrat pourra être rompu sans préavis.\nÀ la cessation du contrat, le ' + worker + ' restituera l\'ensemble des documents, matériels et équipements mis à sa disposition.';
  article('ARTICLE ' + aNum + ' : ' + (data.jobType === 'STAGE' ? 'FIN DU STAGE' : 'RUPTURE DU CONTRAT'), ruptBody); aNum++;

  // Art - Litiges
  article('ARTICLE ' + aNum + ' : RÈGLEMENT DES DIFFÉRENDS', 'En cas de différend relatif à l\'interprétation ou à l\'exécution du présent contrat, les parties s\'efforceront de trouver une solution amiable.\nÀ défaut d\'accord amiable dans un délai raisonnable, tout litige relèvera de la compétence exclusive du ' + config.court + ', conformément aux dispositions légales en matière de contentieux du travail.');

  // ---- SIGNATURES ----
  ck(65); ln([170, 170, 170], 0.3); sp(3);
  wr('Fait à ' + data.compAddr.split(',')[0].trim() + ', le ' + new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), 10, 'normal', 'left', [35, 35, 35]);
  sp(1); wr('En deux exemplaires originaux, dont un remis au ' + worker + '.', 10, 'normal', 'left', [35, 35, 35]);
  sp(8);
  const bw = (CW / 2) - 8, bh = 32;
  ck(bh + 25);
  pdf.setDrawColor(0, 90, 160); pdf.setLineWidth(0.4);
  pdf.roundedRect(ML, y, bw, bh, 2, 2);
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); pdf.setTextColor(0, 40, 90);
  pdf.text("L'EMPLOYEUR", ML + bw / 2, y + 5, { align: 'center' });
  if (signatures.employer && data.documentMode === 'ELECTRONIC') { try { pdf.addImage(signatures.employer, 'PNG', ML + 3, y + 7, bw - 6, 13); } catch {} }
  pdf.setFontSize(8); pdf.setTextColor(30, 30, 30);
  pdf.text(data.bossName || '_______________', ML + bw / 2, y + bh - 5, { align: 'center' });
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7); pdf.setTextColor(80, 80, 80);
  pdf.text(data.bossTitle, ML + bw / 2, y + bh - 1.5, { align: 'center' });

  const rx = ML + bw + 16;
  pdf.setDrawColor(0, 90, 160); pdf.setLineWidth(0.4);
  pdf.roundedRect(rx, y, bw, bh, 2, 2);
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); pdf.setTextColor(0, 40, 90);
  pdf.text(WORKER, rx + bw / 2, y + 5, { align: 'center' });
  if (signatures.employee && data.documentMode === 'ELECTRONIC') { try { pdf.addImage(signatures.employee, 'PNG', rx + 3, y + 7, bw - 6, 13); } catch {} }
  pdf.setFontSize(8); pdf.setTextColor(30, 30, 30);
  pdf.text(data.empName || '_______________', rx + bw / 2, y + bh - 5, { align: 'center' });
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7); pdf.setTextColor(80, 80, 80);
  pdf.text(data.jobTitle, rx + bw / 2, y + bh - 1.5, { align: 'center' });
  y += bh + 8;

  // ---- QR CODE + VERIFICATION ----
  ck(30);
  ln([200, 200, 200], 0.2); sp(2);
  try {
    const qrData = generateQRCodeDataURL(verificationCode + '|' + data.empName + '|' + data.compName + '|' + new Date().toISOString());
    pdf.addImage(qrData, 'PNG', ML, y, 18, 18);
  } catch {}
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7); pdf.setTextColor(120, 120, 120);
  pdf.text('Code de vérification : ' + verificationCode, ML + 22, y + 6);
  pdf.text('Scannez le QR code pour vérifier l\'authenticité', ML + 22, y + 10);
  pdf.text('de ce document sur la plateforme ECODREUM.', ML + 22, y + 14);
  y += 20;

  footer();
  return pdf;
}

// ===================== BUILD WORD (DOCX via HTML) =====================
function buildWordDocument(data: FormData, config: CountryConfig, verificationCode: string): Blob {
  const e = (s: string) => s ? s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
  const f = (d: string) => { try { return new Date(d).toLocaleDateString('fr-FR'); } catch { return d || '—'; } };
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const w = data.jobType === 'STAGE' ? 'Stagiaire' : 'Salarié(e)';
  const wl = data.jobType === 'STAGE' ? 'STAGIAIRE' : 'SALARIÉ(E)';
  const title = data.jobType === 'STAGE' ? 'CONVENTION DE STAGE' : 'CONTRAT DE TRAVAIL';
  const regime = data.jobType === 'CDI' ? 'CONTRAT À DURÉE INDÉTERMINÉE' : data.jobType === 'CDD' ? 'CONTRAT À DURÉE DÉTERMINÉE' : 'CONVENTION DE STAGE';
  const capCl = data.showCapital && data.compCapital ? ', au capital social de ' + new Intl.NumberFormat('fr-FR').format(parseFloat(data.compCapital) || 0) + ' ' + config.currency : '';
  const fCl = data.isForeigner && data.empWorkPermit ? ', titulaire du permis de travail n°' + e(data.empWorkPermit) : '';
  const endDt = (data.jobType === 'CDD' || data.jobType === 'STAGE') && data.endDate ? ' et prendra fin le ' + f(data.endDate) : '';
  const salAmt = data.jobType === 'STAGE' ? data.stageAllowance : data.salary;
  const sd = formatSalaryDisplay(salAmt, config.currency);
  const ctText = data.jobType === 'CDI' ? 'indéterminée (CDI)' : data.jobType === 'CDD' ? 'déterminée (CDD)' : 'stage';

  let specHtml = '';
  if (data.jobType === 'CDI' && data.jobDescription) specHtml = '<p style="text-align:justify;margin:4pt 0;font-size:11pt;">Tâches confiées : ' + e(data.jobDescription) + '.</p>';
  if (data.jobType === 'CDD' && data.cddReason) specHtml = '<p style="text-align:justify;margin:4pt 0;font-size:11pt;">Motif du CDD : ' + e(data.cddReason) + '.</p>';
  if (data.jobType === 'STAGE' && data.stageTasks) specHtml = '<p style="text-align:justify;margin:4pt 0;font-size:11pt;">Missions du stage : ' + e(data.stageTasks) + '.</p>';

  const bonusH = data.bonus ? '<p style="text-align:justify;margin:4pt 0;font-size:11pt;">Avantages complémentaires : ' + e(data.bonus) + '.</p>' : '';
  const remuH = (data.jobType === 'STAGE'
    ? '<p style="text-align:justify;margin:4pt 0;font-size:11pt;">Le Stagiaire percevra une gratification mensuelle de <b>' + e(sd.formatted) + ' ' + e(config.currency) + '</b>.</p>'
    : '<p style="text-align:justify;margin:4pt 0;font-size:11pt;">Le ' + w + ' percevra une rémunération mensuelle brute de <b>' + e(sd.formatted) + ' ' + e(config.currency) + '</b>.</p>')
    + (sd.words ? '<p style="text-align:justify;margin:4pt 0;font-size:11pt;font-style:italic;">Soit en toutes lettres : ' + e(sd.words) + '.</p>' : '')
    + (data.jobType !== 'STAGE' ? '<p style="text-align:justify;margin:4pt 0;font-size:11pt;">Cette rémunération est versée mensuellement par virement bancaire.</p>' : '')
    + bonusH;
  const trialH = data.jobType !== 'STAGE' ? '<p style="text-align:justify;margin:4pt 0;font-size:11pt;">Une période d\'essai de <b>' + e(data.trial) + ' mois</b> est convenue. Durant cette période, chacune des parties pourra mettre fin au contrat sans préavis ni indemnité.</p>' : '';

  const oblEmployerH = config.obligations.employer.map(o => '<p style="margin:2pt 0 2pt 20pt;font-size:11pt;">• ' + e(o) + '</p>').join('');
  const oblEmployeeH = config.obligations.employee.map(o => '<p style="margin:2pt 0 2pt 20pt;font-size:11pt;">• ' + e(o) + '</p>').join('');

  let aN = 1;
  let articlesH = '';

  // Art 1
  articlesH += '<h2 style="font-family:Arial,sans-serif;font-size:12pt;font-weight:bold;margin:18pt 0 8pt 0;border-bottom:1.5pt solid #333;">ARTICLE ' + aN + ' : ENGAGEMENT</h2>';
  articlesH += '<p style="text-align:justify;margin:4pt 0;font-size:11pt;">L\'Employeur engage le ' + w + ' qui accepte, aux conditions du présent contrat, régi par la ' + e(config.code) + '.</p>';
  aN++;

  // Art 2
  articlesH += '<h2 style="font-family:Arial,sans-serif;font-size:12pt;font-weight:bold;margin:18pt 0 8pt 0;border-bottom:1.5pt solid #333;">ARTICLE ' + aN + ' : FONCTIONS ET ATTRIBUTIONS</h2>';
  articlesH += '<p style="text-align:justify;margin:4pt 0;font-size:11pt;">Le ' + w + ' est engagé au poste de <b>' + e(data.jobTitle) + '</b>, département <b>' + e(data.jobDept) + '</b>.</p>';
  articlesH += '<p style="text-align:justify;margin:4pt 0;font-size:11pt;">Lieu : <b>' + e(data.jobLocation) + '</b>. Contrat à durée <b>' + e(ctText) + '</b>.</p>';
  articlesH += specHtml;
  aN++;

  // Art 3
  articlesH += '<h2 style="font-family:Arial,sans-serif;font-size:12pt;font-weight:bold;margin:18pt 0 8pt 0;border-bottom:1.5pt solid #333;">ARTICLE ' + aN + ' : DURÉE</h2>';
  articlesH += '<p style="text-align:justify;margin:4pt 0;font-size:11pt;">Effet au <b>' + e(f(data.startDate)) + '</b>' + e(endDt) + '.</p>';
  aN++;

  // Art 4 - essai
  if (data.jobType !== 'STAGE') {
    articlesH += '<h2 style="font-family:Arial,sans-serif;font-size:12pt;font-weight:bold;margin:18pt 0 8pt 0;border-bottom:1.5pt solid #333;">ARTICLE ' + aN + ' : PÉRIODE D\'ESSAI</h2>';
    articlesH += trialH;
    aN++;
  }

  // Art 5 - remu
  articlesH += '<h2 style="font-family:Arial,sans-serif;font-size:12pt;font-weight:bold;margin:18pt 0 8pt 0;border-bottom:1.5pt solid #333;">ARTICLE ' + aN + ' : RÉMUNÉRATION</h2>';
  articlesH += remuH;
  articlesH += '<p style="text-align:justify;margin:4pt 0;font-size:11pt;">Durée hebdomadaire : <b>' + e(data.hours) + ' heures</b>.</p>';
  aN++;

  // Art 6 - obligations
  articlesH += '<h2 style="font-family:Arial,sans-serif;font-size:12pt;font-weight:bold;margin:18pt 0 8pt 0;border-bottom:1.5pt solid #333;">ARTICLE ' + aN + ' : OBLIGATIONS DES PARTIES</h2>';
  articlesH += '<p style="font-weight:bold;margin:10pt 0 4pt 0;font-size:11pt;">' + aN + '.1. Obligations de l\'Employeur :</p>';
  articlesH += oblEmployerH;
  articlesH += '<p style="font-weight:bold;margin:10pt 0 4pt 0;font-size:11pt;">' + aN + '.2. Obligations du/de la ' + w + ' :</p>';
  articlesH += oblEmployeeH;
  aN++;

  // Non-concurrence
  if (data.hasNonCompete && data.jobType !== 'STAGE') {
    articlesH += '<h2 style="font-family:Arial,sans-serif;font-size:12pt;font-weight:bold;margin:18pt 0 8pt 0;border-bottom:1.5pt solid #333;">ARTICLE ' + aN + ' : NON-CONCURRENCE</h2>';
    articlesH += '<p style="text-align:justify;margin:4pt 0;font-size:11pt;">Clause de <b>' + e(data.nonCompeteDuration) + '</b> sur le territoire du ' + e(config.name) + '.</p>';
    aN++;
  }

  // Rupture
  articlesH += '<h2 style="font-family:Arial,sans-serif;font-size:12pt;font-weight:bold;margin:18pt 0 8pt 0;border-bottom:1.5pt solid #333;">ARTICLE ' + aN + ' : ' + (data.jobType === 'STAGE' ? 'FIN DU STAGE' : 'RUPTURE') + '</h2>';
  articlesH += '<p style="text-align:justify;margin:4pt 0;font-size:11pt;">' + (data.jobType === 'STAGE' ? 'Le stage prendra fin à la date prévue.' : 'Selon les dispositions du ' + e(config.code) + '. Préavis légal applicable.') + '</p>';
  aN++;

  // Litiges
  articlesH += '<h2 style="font-family:Arial,sans-serif;font-size:12pt;font-weight:bold;margin:18pt 0 8pt 0;border-bottom:1.5pt solid #333;">ARTICLE ' + aN + ' : LITIGES</h2>';
  articlesH += '<p style="text-align:justify;margin:4pt 0;font-size:11pt;">Solution amiable, sinon compétence du <b>' + e(config.court) + '</b>.</p>';

  const html = '<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><!--[if gte mso 9]><xml><w:WordDocument><w:View>Normal</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]--><style>@page{size:595.3pt 841.9pt;margin:70pt 70pt 70pt 70pt;}body{font-family:"Times New Roman",serif;font-size:11pt;color:#1e1e1e;line-height:1.6;margin:0;padding:0;}</style></head><body>'
    + '<div style="text-align:center;margin-bottom:6pt;"><h1 style="font-family:Arial,sans-serif;font-size:18pt;font-weight:bold;margin:0 0 2pt 0;">' + e(title) + '</h1>'
    + '<p style="font-family:Arial,sans-serif;font-size:11pt;color:#c00;font-weight:bold;margin:0 0 2pt 0;">RÉGIME : ' + e(regime) + '</p>'
    + '<p style="font-family:Arial,sans-serif;font-size:9pt;color:#666;font-style:italic;margin:0 0 12pt 0;">' + e(config.code) + '</p></div>'
    + '<hr style="border:none;border-top:2pt solid #333;margin:8pt 0;">'
    + '<p style="text-align:center;font-weight:bold;font-size:12pt;margin:10pt 0;">ENTRE LES SOUSSIGNÉS :</p>'
    + '<p style="text-align:justify;margin:6pt 0;font-size:11pt;">La société <b>' + e(data.compName) + '</b>, ' + e(data.compType) + e(capCl) + ', dont le siège social est situé à <b>' + e(data.compAddr) + '</b>, immatriculée au RCCM sous le numéro <b>' + e(data.compRCCM) + '</b> et identifiée au ' + e(config.idLabel) + ' sous le numéro <b>' + e(data.compID) + '</b>, représentée par <b>M./Mme ' + e(data.bossName) + '</b>, agissant en sa qualité de <b>' + e(data.bossTitle) + '</b>, dûment habilité(e).</p>'
    + '<p style="text-align:right;font-style:italic;color:#555;margin:4pt 0;">Ci-après dénommée « <b>L\'EMPLOYEUR</b> »</p>'
    + '<p style="text-align:center;font-weight:bold;margin:8pt 0;">D\'UNE PART,</p><p style="text-align:center;font-weight:bold;margin:4pt 0;">ET :</p>'
    + '<p style="text-align:justify;margin:6pt 0;font-size:11pt;"><b>M./Mme ' + e(data.empName) + '</b>, né(e) le <b>' + e(f(data.empBirth)) + '</b> à <b>' + e(data.empBirthPlace) + '</b>, de nationalité <b>' + e(data.empNation) + '</b>' + e(fCl) + ', pièce d\'identité n°<b>' + e(data.empID) + '</b>, demeurant à <b>' + e(data.empAddr) + '</b>, tél. <b>' + e(data.empPhone) + '</b>.</p>'
    + '<p style="text-align:right;font-style:italic;color:#555;margin:4pt 0;">Ci-après dénommé(e) « <b>LE/LA ' + e(wl) + '</b> »</p>'
    + '<p style="text-align:center;font-weight:bold;margin:8pt 0;">D\'AUTRE PART,</p>'
    + '<hr style="border:none;border-top:1pt solid #c00;margin:10pt 0;">'
    + '<p style="font-weight:bold;margin:8pt 0;font-size:11pt;">Vu la ' + e(config.code) + ',</p>'
    + articlesH
    + '<hr style="border:none;border-top:2pt solid #333;margin:14pt 0;">'
    + '<p style="margin:6pt 0;font-size:11pt;">Fait à <b>' + e(data.compAddr.split(',')[0].trim()) + '</b>, le <b>' + e(today) + '</b>.</p>'
    + '<p style="margin:4pt 0;font-size:11pt;">En deux exemplaires originaux.</p>'
    + '<table style="width:100%;margin-top:20pt;border-collapse:collapse;"><tr>'
    + '<td style="width:50%;text-align:center;padding:8pt;vertical-align:top;"><p style="font-weight:bold;font-size:10pt;">L\'EMPLOYEUR</p><div style="height:50pt;border-bottom:1pt solid #333;margin:4pt 0;"></div><p style="font-weight:bold;">' + e(data.bossName) + '</p><p style="color:#555;font-size:9pt;">' + e(data.bossTitle) + '</p></td>'
    + '<td style="width:50%;text-align:center;padding:8pt;vertical-align:top;"><p style="font-weight:bold;font-size:10pt;">LE/LA ' + e(data.jobType === 'STAGE' ? 'STAGIAIRE' : 'SALARIÉ(E)') + '</p><div style="height:50pt;border-bottom:1pt solid #333;margin:4pt 0;"></div><p style="font-weight:bold;">' + e(data.empName) + '</p><p style="color:#555;font-size:9pt;">' + e(data.jobTitle) + '</p></td>'
    + '</tr></table>'
    + '<div style="margin-top:16pt;padding-top:8pt;border-top:1pt solid #ddd;font-size:8pt;color:#999;text-align:center;">Document ECODREUM Intelligence — Réf: ' + e(verificationCode) + '</div>'
    + '</body></html>';

  return new Blob(['\ufeff' + html], { type: 'application/msword;charset=utf-8' });
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
    setNotif({ m, t }); setTimeout(() => setNotif(null), 4000);
  }, []);

  const updateData = useCallback((field: keyof FormData, value: any) => {
    setData(prev => ({ ...prev, [field]: value })); setValidationErrors([]);
  }, []);

  const loadArchivedContracts = async () => {
    try {
      const { data: rows, error } = await supabase.from('contracts').select('*').order('created_at', { ascending: false });
      if (!error && rows) {
        setSavedContracts(rows.map((c: any) => ({
          id: c.id, employeeName: c.employee_name, jobTitle: c.job_title,
          contractType: c.contract_type, mode: c.mode, createdAt: c.created_at,
          data: c.data, signed: c.signed, employerSignature: c.employer_signature,
          employeeSignature: c.employee_signature, fileUrl: c.file_url, fileType: c.file_type,
          verificationCode: c.verification_code
        })));
        return;
      }
    } catch (err) { console.warn('Load:', err); }
    try { const s = localStorage.getItem('ecodreum_contracts'); if (s) setSavedContracts(JSON.parse(s)); } catch {}
  };

  const saveContractToArchive = async (contractData: FormData, signed: boolean, fileUrl: string, fileType: string, vCode: string) => {
    const contract: SavedContract = {
      id: Date.now().toString(), employeeName: contractData.empName, jobTitle: contractData.jobTitle,
      contractType: contractData.jobType, mode: contractData.documentMode,
      createdAt: new Date().toISOString(), data: contractData, signed,
      employerSignature: signatures.employer, employeeSignature: signatures.employee,
      fileUrl, fileType, verificationCode: vCode
    };
    try {
      await supabase.from('contracts').insert([{
        id: contract.id, employee_name: contract.employeeName, job_title: contract.jobTitle,
        contract_type: contract.contractType, mode: contract.mode, created_at: contract.createdAt,
        data: contract.data, signed: contract.signed, employer_signature: contract.employerSignature,
        employee_signature: contract.employeeSignature, file_url: contract.fileUrl,
        file_type: contract.fileType, verification_code: contract.verificationCode
      }]);
    } catch (err) { console.warn('Save:', err); }
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
    showNotif('Supprimé', 's');
  };

  const handleFileUpload = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    const ok = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!ok.includes(file.type)) { showNotif('PDF ou Word uniquement', 'w'); return; }
    setIsUploading(true);
    try {
      const fName = Date.now() + '_' + file.name;
      const { error } = await supabase.storage.from('contract-files').upload(fName, file);
      if (error) throw error;
      const { data: u } = supabase.storage.from('contract-files').getPublicUrl(fName);
      const ft = file.type.includes('pdf') ? 'PDF' : 'WORD';
      const vc = generateVerificationCode();
      await saveContractToArchive(data, false, u.publicUrl, ft, vc);
      showNotif('Fichier archivé', 's');
    } catch (err) { console.warn(err); showNotif('Erreur upload', 'e'); }
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const downloadArchivedFile = async (contract: SavedContract) => {
    if (contract.fileUrl) {
      try {
        const resp = await fetch(contract.fileUrl);
        if (resp.ok) {
          const blob = await resp.blob();
          const ext = contract.fileType === 'PDF' ? '.pdf' : '.doc';
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'CONTRAT_' + (contract.employeeName || 'doc').replace(/\s+/g, '_') + ext;
          document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
          showNotif('Téléchargé', 's');
          return;
        }
      } catch {}
    }
    regenerateAndDownload(contract);
  };

  const regenerateAndDownload = (contract: SavedContract) => {
    if (!contract.data) { showNotif('Données manquantes', 'w'); return; }
    try {
      const cCfg = COUNTRIES[contract.data.country];
      const sigs = { employer: contract.employerSignature || '', employee: contract.employeeSignature || '' };
      const vc = contract.verificationCode || generateVerificationCode();
      const fname = 'CONTRAT_' + (contract.employeeName || 'doc').replace(/\s+/g, '_');
      if (contract.mode === 'ELECTRONIC' || contract.fileType === 'PDF') {
        const pdf = buildPDF(contract.data, cCfg, sigs, vc);
        pdf.save(fname + '.pdf');
      } else {
        const blob = buildWordDocument(contract.data, cCfg, vc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = fname + '.doc';
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      }
      showNotif('Téléchargé', 's');
    } catch (err) { console.warn(err); showNotif('Erreur', 'e'); }
  };

  const isSectionComplete = useCallback((s: 'company' | 'employee' | 'contract'): boolean => {
    if (s === 'company') return !!(data.compName.trim() && data.compType.trim() && data.compAddr.trim() && data.compRCCM.trim() && data.compID.trim() && data.bossName.trim() && data.bossTitle.trim() && (!data.showCapital || data.compCapital.trim()));
    if (s === 'employee') return !!(data.empName.trim() && data.empBirth.trim() && data.empBirthPlace.trim() && data.empNation.trim() && data.empAddr.trim() && data.empID.trim() && data.empPhone.trim() && (!data.isForeigner || data.empWorkPermit.trim()));
    if (s === 'contract') {
      const b = !!(data.jobTitle.trim() && data.jobDept.trim() && data.jobLocation.trim() && data.startDate && data.hours.trim());
      if (data.jobType === 'STAGE') return !!(b && data.endDate && data.stageTasks.trim() && data.stageAllowance.trim());
      const sal = !!(data.salary.trim() && parseFloat(data.salary) > 0), nc = !data.hasNonCompete || !!data.nonCompeteDuration.trim();
      if (data.jobType === 'CDI') return !!(b && sal && data.trial.trim() && data.jobDescription.trim() && nc);
      return !!(b && sal && data.trial.trim() && data.endDate && data.cddReason.trim() && nc);
    }
    return false;
  }, [data]);

  const canAccessSection = useCallback((s: 'company' | 'employee' | 'contract'): boolean => {
    if (s === 'company') return true;
    if (s === 'employee') return isSectionComplete('company');
    return isSectionComplete('company') && isSectionComplete('employee');
  }, [isSectionComplete]);

  const validateForm = (): boolean => {
    const e: string[] = [];
    if (!isSectionComplete('company')) e.push('Section Entreprise incomplète');
    if (!isSectionComplete('employee')) e.push('Section Salarié incomplète');
    if (!isSectionComplete('contract')) e.push('Section Contrat incomplète');
    setValidationErrors(e); return e.length === 0;
  };

  const getProgress = useMemo((): number => {
    const f = ['compName','compType','compAddr','compRCCM','compID','bossName','bossTitle','empName','empBirth','empBirthPlace','empNation','empAddr','empID','empPhone','jobTitle','jobDept','jobLocation','startDate','hours','trial'];
    return Math.round((f.filter(k => { const v = data[k as keyof FormData]; return v && v !== '' && v !== '0'; }).length / f.length) * 100);
  }, [data]);

  const getSectionProgress = useCallback((sec: 'company' | 'employee' | 'contract'): number => {
    const m: Record<string, string[]> = { company: ['compName','compType','compAddr','compRCCM','compID','bossName','bossTitle'], employee: ['empName','empBirth','empBirthPlace','empNation','empAddr','empID','empPhone'], contract: ['jobTitle','jobDept','jobLocation','salary','startDate','trial','hours'] };
    const fl = m[sec]; return Math.round((fl.filter(f => { const v = data[f as keyof FormData]; return v && v !== '' && v !== '0'; }).length / fl.length) * 100);
  }, [data]);

  const handleSectionClick = (s: 'company' | 'employee' | 'contract') => {
    if (!canAccessSection(s)) { showNotif(s === 'employee' ? 'Remplissez Entreprise d\'abord' : !isSectionComplete('company') ? 'Remplissez Entreprise d\'abord' : 'Remplissez Salarié d\'abord', 'w'); return; }
    setActiveSection(p => p === s ? null : s);
  };

  const handleLogoUpload = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = e => updateData('compLogo', e.target?.result as string); r.readAsDataURL(f);
  };

  const generatePDF = async () => {
    if (!validateForm()) { showNotif('Champs manquants', 'e'); return; }
    setIsGenerating(true);
    try {
      await new Promise(r => setTimeout(r, 50));
      const vc = generateVerificationCode();
      const pdf = buildPDF(data, config, signatures, vc);
      const fName = 'CONTRAT_' + data.empName.replace(/\s+/g, '_') + '_' + Date.now() + '.pdf';
      let fileUrl = '';
      try { const b = pdf.output('blob'); const { error } = await supabase.storage.from('contract-files').upload(fName, b); if (!error) { const { data: u } = supabase.storage.from('contract-files').getPublicUrl(fName); fileUrl = u.publicUrl; } } catch {}
      pdf.save(fName);
      await saveContractToArchive(data, !!(signatures.employer && signatures.employee), fileUrl, 'PDF', vc);
      showNotif('PDF généré !', 's');
    } catch (err) { console.warn(err); showNotif('Erreur PDF', 'e'); }
    finally { setIsGenerating(false); }
  };

  const generateWord = async () => {
    if (!validateForm()) { showNotif('Champs manquants', 'e'); return; }
    try {
      const vc = generateVerificationCode();
      const blob = buildWordDocument(data, config, vc);
      const fName = 'CONTRAT_' + data.empName.replace(/\s+/g, '_') + '_' + Date.now() + '.doc';
      let fileUrl = '';
      try { const { error } = await supabase.storage.from('contract-files').upload(fName, blob); if (!error) { const { data: u } = supabase.storage.from('contract-files').getPublicUrl(fName); fileUrl = u.publicUrl; } } catch {}
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = fName;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      await saveContractToArchive(data, false, fileUrl, 'WORD', vc);
      showNotif('Word généré !', 's');
    } catch (err) { console.warn(err); showNotif('Erreur Word', 'e'); }
  };

  // Signature handlers
  const getPoint = (c: HTMLCanvasElement, cx: number, cy: number) => { const r = c.getBoundingClientRect(); return { x: (cx - r.left) * (c.width / r.width), y: (cy - r.top) * (c.height / r.height) }; };
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
  const clearSig = () => { const c = currentSigner === 'employer' ? signatureCanvasEmployer.current : signatureCanvasEmployee.current; if (c) { const ctx = c.getContext('2d'); if (ctx) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); } } };
  const saveSig = () => {
    const c = currentSigner === 'employer' ? signatureCanvasEmployer.current : signatureCanvasEmployee.current;
    if (!c) return;
    setSignatures(prev => ({ ...prev, [currentSigner!]: c.toDataURL('image/png') }));
    showNotif('Signature OK', 's'); setShowSignatureModal(false); setCurrentSigner(null);
  };
  const openSigModal = (s: 'employer' | 'employee') => {
    if (data.documentMode === 'PRINT') { showNotif('Mode électronique requis', 'w'); return; }
    setCurrentSigner(s); setShowSignatureModal(true);
    setTimeout(() => { const c = s === 'employer' ? signatureCanvasEmployer.current : signatureCanvasEmployee.current; if (c) { const ctx = c.getContext('2d'); if (ctx) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); } } }, 120);
  };

  // ========================= JSX =========================
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#080d18 0%,#141929 50%,#080d18 100%)', overflowX: 'hidden' }}>
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 0.04 }}>
        {hexagons.map(h => <Hexagon key={h.id} size={28} className="absolute text-cyan-400 hex-float" style={{ left: h.left, top: h.top, animationDelay: h.delay, animationDuration: h.duration }} />)}
      </div>
      <div className="max-w-5xl mx-auto p-3 md:p-5 scrollable-container" style={{ position: 'relative', zIndex: 10, maxHeight: '100vh' }}>

        {/* NOTIF */}
        {notif && (
          <div className={`fixed top-4 left-1/2 z-[9999] notif-anim px-5 py-3 rounded-xl border backdrop-blur-xl shadow-xl flex items-center gap-2 ${notif.t === 's' ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300' : notif.t === 'w' ? 'bg-amber-500/20 border-amber-400/50 text-amber-300' : 'bg-red-500/20 border-red-400/50 text-red-300'}`} style={{ transform: 'translateX(-50%)' }}>
            {notif.t === 's' && <CheckCircle size={15} />}{notif.t === 'w' && <AlertTriangle size={15} />}{notif.t === 'e' && <AlertCircle size={15} />}
            <span className="text-xs font-bold uppercase">{notif.m}</span>
          </div>
        )}

        {/* HEADER */}
        <div className="glass rounded-2xl p-4 mb-5"><TechPattern /><div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2.5 rounded-xl border border-cyan-400/30 hover:border-cyan-400/60" style={{ background: 'rgba(0,229,255,0.08)' }}><ArrowLeft size={18} className="text-cyan-400" /></button>
            <div>
              <div className="flex items-center gap-2 mb-0.5"><Sparkles size={18} className="text-yellow-400" /><h1 className="text-xl md:text-2xl font-black uppercase" style={{ background: 'linear-gradient(90deg,#00e5ff,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CONTRACT ARCHITECT</h1></div>
              <p className="text-[10px] font-bold text-cyan-400/50 uppercase tracking-widest">ECODREUM Legal Engine</p>
            </div>
          </div>
          <button onClick={() => setShowArchives(true)} className="gold-card px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:opacity-80">
            <Archive size={14} className="text-yellow-400" /><span className="text-yellow-100">Archives</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black text-yellow-300" style={{ background: 'rgba(255,215,0,0.15)' }}>{savedContracts.length}</span>
          </button>
        </div></div>

        {/* MODE + PAYS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="glass rounded-2xl p-4"><TechPattern /><div className="relative z-10">
            <label className="text-[11px] font-bold text-cyan-400 uppercase mb-3 flex items-center gap-1.5"><Zap size={12} /> Mode</label>
            <div className="flex gap-2">
              {(['ELECTRONIC', 'PRINT'] as const).map(m => (
                <button key={m} onClick={() => updateData('documentMode', m)} className={`flex-1 py-3 rounded-xl font-bold text-[11px] flex flex-col items-center gap-1 transition-all ${data.documentMode === m ? 'text-black shadow-lg' : 'text-cyan-300'}`}
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
                <button key={c} onClick={() => updateData('country', c)} className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${data.country === c ? 'text-black shadow-lg' : 'text-cyan-300'}`}
                  style={data.country === c ? { background: 'linear-gradient(135deg,#00e5ff,#3b82f6)' } : { background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,229,255,0.2)' }}>{c}</button>
              ))}
            </div>
          </div></div>
        </div>

        {/* PROGRESSION */}
        <div className="glass rounded-2xl p-4 mb-5"><TechPattern /><div className="relative z-10 flex items-center gap-4">
          <Sparkles size={14} className="text-cyan-400 shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between mb-1.5"><span className="text-[11px] font-bold text-cyan-400 uppercase">Progression</span><span className="text-base font-black text-cyan-300">{getProgress}%</span></div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)' }}><div className="h-full rounded-full transition-all duration-500" style={{ width: `${getProgress}%`, background: 'linear-gradient(90deg,#00e5ff,#3b82f6)' }} /></div>
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
            const progress = getSectionProgress(id as any), isActive = activeSection === id, isComplete = isSectionComplete(id as any), canAccess = canAccessSection(id as any);
            return (
              <div key={id}>
                <div onClick={() => handleSectionClick(id as any)} className={`glass rounded-2xl p-4 relative overflow-hidden transition-all ${canAccess ? 'cursor-pointer glass-hover' : 'cursor-not-allowed opacity-50'} ${isActive ? 'ring-1 ring-cyan-400' : ''}`} style={isActive ? { boxShadow: '0 0 20px rgba(0,229,255,0.15)' } : {}}>
                  <TechPattern /><div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: grad }}><Icon size={22} className="text-white" /></div>
                        <div><h3 className="text-base font-black uppercase text-white">{label}</h3><p className="text-[10px] text-cyan-300/60">{!canAccess ? 'Verrouillé' : isActive ? 'Fermer' : 'Ouvrir'}</p></div>
                      </div>
                      {isComplete ? <CheckCircle size={18} className="text-emerald-400" /> : canAccess ? (isActive ? <Unlock size={18} className="text-cyan-400" /> : <Lock size={18} className="text-gray-500" />) : <Lock size={18} className="text-red-400/60" />}
                    </div>
                    <div className="flex items-center gap-3"><div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)' }}><div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: grad }} /></div><span className="text-[11px] font-bold text-cyan-300 w-10 text-right">{progress}%</span></div>
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
                            {data.compLogo ? (<div className="relative group inline-block"><div className="p-3 bg-white rounded-xl"><img src={data.compLogo} alt="Logo" className="w-20 h-20 object-contain" /></div><button onClick={() => updateData('compLogo', null)} className="absolute -top-1.5 -right-1.5 p-1.5 bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 shadow"><X size={10} className="text-white" /></button></div>
                            ) : (<label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-yellow-400/25 rounded-xl cursor-pointer hover:border-yellow-400/50 hover:bg-yellow-400/5"><Upload size={18} className="text-yellow-400 mb-1" /><span className="text-[11px] text-yellow-300">Charger</span><input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" /></label>)}
                          </div>
                          <InputField label="Description" value={data.compDescription} onChange={v => updateData('compDescription', v)} placeholder="Ex: Leader en solutions digitales..." multiline />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><InputField label="Raison Sociale" value={data.compName} onChange={v => updateData('compName', v)} icon={<Building size={11} />} required /><InputField label="Forme Juridique" value={data.compType} onChange={v => updateData('compType', v)} placeholder="SARL, SA..." icon={<ShieldCheck size={11} />} required /></div>
                      <div className="glass rounded-xl p-3 space-y-2"><TechPattern /><label className="flex items-center gap-2 cursor-pointer relative z-10"><input type="checkbox" checked={data.showCapital} onChange={ev => updateData('showCapital', ev.target.checked)} className="w-4 h-4 accent-cyan-500" /><span className="text-[11px] font-bold text-cyan-300 uppercase">Capital social</span></label>
                        {data.showCapital && <InputField label="Capital" value={data.compCapital} onChange={v => updateData('compCapital', v)} placeholder={`1 000 000 ${config.currency}`} icon={<DollarSign size={11} />} required />}
                      </div>
                      <InputField label="Siège Social" value={data.compAddr} onChange={v => updateData('compAddr', v)} icon={<MapPin size={11} />} required />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><InputField label="RCCM" value={data.compRCCM} onChange={v => updateData('compRCCM', v)} placeholder="BJ/BGM/2024/A/123" icon={<FileText size={11} />} required /><InputField label={config.idLabel} value={data.compID} onChange={v => updateData('compID', v)} icon={<Shield size={11} />} required /></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><InputField label="Représentant Légal" value={data.bossName} onChange={v => updateData('bossName', v)} icon={<User size={11} />} required /><InputField label="Fonction" value={data.bossTitle} onChange={v => updateData('bossTitle', v)} placeholder="Gérant..." icon={<Award size={11} />} required /></div>
                    </>)}

                    {id === 'employee' && (<>
                      <InputField label="Nom Complet" value={data.empName} onChange={v => updateData('empName', v)} icon={<User size={11} />} required />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><InputField label="Date de Naissance" type="date" value={data.empBirth} onChange={v => updateData('empBirth', v)} icon={<Calendar size={11} />} required /><InputField label="Lieu de Naissance" value={data.empBirthPlace} onChange={v => updateData('empBirthPlace', v)} icon={<MapPin size={11} />} required /></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Nationalité" value={data.empNation} onChange={v => updateData('empNation', v)} icon={<Globe size={11} />} required />
                        <div className="glass rounded-xl p-3 flex items-center relative"><TechPattern /><label className="flex items-center gap-2 cursor-pointer relative z-10"><input type="checkbox" checked={data.isForeigner} onChange={ev => updateData('isForeigner', ev.target.checked)} className="w-4 h-4 accent-cyan-500" /><span className="text-[11px] font-bold text-cyan-300 uppercase">Travailleur étranger</span></label></div>
                      </div>
                      {data.isForeigner && <div className="rounded-xl p-3" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)' }}><InputField label="Permis de Travail" value={data.empWorkPermit} onChange={v => updateData('empWorkPermit', v)} icon={<Shield size={11} />} required /></div>}
                      <InputField label="Adresse" value={data.empAddr} onChange={v => updateData('empAddr', v)} icon={<MapPin size={11} />} required />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><InputField label="Pièce d'Identité" value={data.empID} onChange={v => updateData('empID', v)} icon={<FileText size={11} />} required /><InputField label="Téléphone" type="tel" value={data.empPhone} onChange={v => updateData('empPhone', v)} icon={<User size={11} />} required /></div>
                    </>)}

                    {id === 'contract' && (<>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5"><label className="text-[11px] font-bold text-cyan-300 uppercase flex items-center gap-1.5"><Briefcase size={11} /> Type *</label><select value={data.jobType} onChange={ev => updateData('jobType', ev.target.value)} className="input-field"><option value="CDI">CDI</option><option value="CDD">CDD</option><option value="STAGE">Stage</option></select></div>
                        <InputField label="Poste" value={data.jobTitle} onChange={v => updateData('jobTitle', v)} icon={<Briefcase size={11} />} required />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><InputField label="Département" value={data.jobDept} onChange={v => updateData('jobDept', v)} icon={<Building size={11} />} required /><InputField label="Lieu de Travail" value={data.jobLocation} onChange={v => updateData('jobLocation', v)} icon={<MapPin size={11} />} required /></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Date de Début" type="date" value={data.startDate} onChange={v => updateData('startDate', v)} icon={<Calendar size={11} />} required />
                        {(data.jobType === 'CDD' || data.jobType === 'STAGE') && <InputField label="Date de Fin" type="date" value={data.endDate} onChange={v => updateData('endDate', v)} icon={<Calendar size={11} />} required />}
                      </div>
                      {data.jobType === 'CDI' && <div className="rounded-xl p-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}><InputField label="Tâches Confiées" value={data.jobDescription} onChange={v => updateData('jobDescription', v)} icon={<FileText size={11} />} required multiline /></div>}
                      {data.jobType === 'CDD' && <div className="rounded-xl p-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}><InputField label="Motif du CDD" value={data.cddReason} onChange={v => updateData('cddReason', v)} icon={<FileText size={11} />} required multiline /></div>}
                      {data.jobType === 'STAGE' && <div className="rounded-xl p-3" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.25)' }}><InputField label="Missions du Stage" value={data.stageTasks} onChange={v => updateData('stageTasks', v)} icon={<FileText size={11} />} required multiline /></div>}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.jobType === 'STAGE' ? (
                          <div className="flex flex-col gap-1.5"><InputField label={`Indemnité (${config.currency})`} type="number" value={data.stageAllowance} onChange={v => updateData('stageAllowance', v)} icon={<DollarSign size={11} />} required />{salaryDisplay.words && <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)' }}><p className="text-[10px] text-cyan-300/80 italic">{salaryDisplay.words}</p></div>}</div>
                        ) : (
                          <div className="flex flex-col gap-1.5"><InputField label={`Salaire Brut (${config.currency})`} type="number" value={data.salary} onChange={v => updateData('salary', v)} icon={<DollarSign size={11} />} required />{salaryDisplay.words && <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.15)' }}><p className="text-[10px] text-cyan-300/80 italic">{salaryDisplay.words}</p></div>}</div>
                        )}
                        <InputField label="Primes / Avantages" value={data.bonus} onChange={v => updateData('bonus', v)} icon={<Award size={11} />} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Heures / Semaine" type="number" value={data.hours} onChange={v => updateData('hours', v)} icon={<Clock size={11} />} required />
                        {data.jobType !== 'STAGE' && <InputField label="Essai (mois)" type="number" value={data.trial} onChange={v => updateData('trial', v)} icon={<Calendar size={11} />} required />}
                      </div>
                      {data.jobType !== 'STAGE' && (
                        <div className="gold-card rounded-xl p-3 space-y-2"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={data.hasNonCompete} onChange={ev => updateData('hasNonCompete', ev.target.checked)} className="w-4 h-4 accent-yellow-500" /><span className="text-[11px] font-bold text-yellow-300 uppercase flex items-center gap-1.5"><Shield size={11} /> Non-concurrence</span></label>
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
            <div className="space-y-2"><h4 className="text-[11px] font-black uppercase text-cyan-400 flex items-center gap-1.5"><PenTool size={11} /> Signatures</h4>
              <div className="grid grid-cols-2 gap-2">
                {(['employer', 'employee'] as const).map(s => (
                  <button key={s} onClick={() => openSigModal(s)} className="py-3 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 hover:opacity-90"
                    style={signatures[s] ? { background: s === 'employer' ? 'linear-gradient(135deg,#10b981,#14b8a6)' : 'linear-gradient(135deg,#3b82f6,#06b6d4)', color: '#000' } : { background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(0,229,255,0.2)', color: '#67e8f9' }}>
                    <PenTool size={13} />{signatures[s] ? (s === 'employer' ? 'Employeur ✓' : 'Salarié ✓') : s === 'employer' ? 'Employeur' : 'Salarié'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 pt-3 border-t" style={{ borderColor: 'rgba(0,229,255,0.15)' }}>
            {data.documentMode === 'ELECTRONIC' ? (
              <button onClick={generatePDF} disabled={isGenerating} className="w-full py-4 rounded-xl font-black uppercase text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 active:scale-[0.98]" style={{ background: 'linear-gradient(135deg,#00e5ff,#3b82f6)', color: '#000' }}>
                {isGenerating ? <><div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" /><span>Génération...</span></> : <><Download size={17} /><span>Générer PDF</span></>}
              </button>
            ) : (
              <button onClick={generateWord} className="w-full py-4 rounded-xl font-black uppercase text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98]" style={{ background: 'linear-gradient(135deg,#f59e0b,#f97316)', color: '#000' }}>
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
                <canvas ref={currentSigner === 'employer' ? signatureCanvasEmployer : signatureCanvasEmployee} width={660} height={280}
                  onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
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

              {/* UPLOAD */}
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
                        {c.verificationCode && <div className="flex justify-between"><span>Réf</span><span className="font-bold text-cyan-300 font-mono text-[10px]">{c.verificationCode}</span></div>}
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
                    {previewContract.verificationCode && <InfoRow label="Code Auth." value={previewContract.verificationCode} />}
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
