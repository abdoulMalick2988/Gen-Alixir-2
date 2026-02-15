// ============================================================================
// ECODREUM ENGINE L1 — Contract Architect
// app/rh/registre/contrat/page.tsx
// PARTIE 1/4 : Imports, Interfaces, Configuration, État
// ============================================================================

'use client';

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  Building,
  User,
  Briefcase,
  ArrowLeft,
  Download,
  Eye,
  EyeOff,
  PenTool,
  Save,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Archive,
  Upload,
  Printer,
  Zap,
  Globe,
  MapPin,
  Shield,
  ShieldCheck,
  FileText,
  DollarSign,
  Award,
  Clock,
  Calendar,
  Lock,
  Unlock,
  Share2,
  FileDown,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Scale,
  Hexagon,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  TableLayoutType,
  convertMillimetersToTwip,
} from 'docx';
import { saveAs } from 'file-saver';

// ─────────────────────────────────────────────
// Supabase Client
// ─────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
);

// ─────────────────────────────────────────────
// Interfaces TypeScript (strict, no `any`)
// ─────────────────────────────────────────────

interface FormData {
  country: 'SENEGAL' | 'BURUNDI';
  documentMode: 'ELECTRONIC' | 'PRINT';
  compName: string;
  compType: string;
  compAddr: string;
  compRCCM: string;
  compID: string;
  compCapital: string;
  compLogo: string | null;
  compDescription: string;
  showCapital: boolean;
  bossName: string;
  bossTitle: string;
  empName: string;
  empBirth: string;
  empBirthPlace: string;
  empNation: string;
  empAddr: string;
  empID: string;
  empPhone: string;
  empWorkPermit: string;
  isForeigner: boolean;
  jobTitle: string;
  jobType: 'CDI' | 'CDD';
  jobDept: string;
  jobLocation: string;
  salary: string;
  bonus: string;
  hours: string;
  trial: string;
  startDate: string;
  endDate: string;
  cddReason: string;
  hasNonCompete: boolean;
  nonCompeteDuration: string;
}

interface SavedContract {
  id: string;
  employeeName: string;
  jobTitle: string;
  contractType: 'CDI' | 'CDD';
  mode: 'ELECTRONIC' | 'PRINT';
  createdAt: string;
  data: FormData;
  signed: boolean;
  employerSignature: string;
  employeeSignature: string;
}

interface SignatureState {
  employer: string;
  employee: string;
}

interface NotifState {
  message: string;
  type: 'success' | 'error' | 'warning';
}

type StepId = 'company' | 'employee' | 'contract';

interface CountryConfig {
  name: string;
  currency: string;
  idLabel: string;
  code: string;
  court: string;
  articles: {
    intro: string;
    engagement: string;
    workDuration: string;
    termination: string;
  };
}

// ─────────────────────────────────────────────
// Configuration Juridique par Pays
// ─────────────────────────────────────────────

const COUNTRY_CONFIGS: Record<'SENEGAL' | 'BURUNDI', CountryConfig> = {
  SENEGAL: {
    name: 'Sénégal',
    currency: 'FCFA',
    idLabel: 'NINEA',
    code: 'Code du Travail sénégalais (Loi n°97-17 du 1er décembre 1997)',
    court: 'Tribunal du Travail de Dakar',
    articles: {
      intro:
        'Conformément aux dispositions du Code du Travail du Sénégal et de la Convention Collective Nationale Interprofessionnelle (CCNI),',
      engagement:
        'L\'Employeur engage le Salarié dans les conditions définies ci-après, en conformité avec la législation sociale en vigueur au Sénégal.',
      workDuration:
        'Conformément aux dispositions du Code du Travail sénégalais fixant la durée légale du travail à 40 heures par semaine,',
      termination:
        'La rupture du contrat de travail est régie par les articles L.47 à L.66 du Code du Travail sénégalais. Tout licenciement devra être motivé par une cause réelle et sérieuse et respecter la procédure légale applicable.',
    },
  },
  BURUNDI: {
    name: 'Burundi',
    currency: 'BIF',
    idLabel: 'NIF',
    code: 'Code du Travail du Burundi (Loi n°1/037 du 7 juillet 1993, révisée)',
    court: 'Tribunal du Travail de Bujumbura',
    articles: {
      intro:
        'Conformément aux dispositions du Code du Travail du Burundi et des textes réglementaires y afférents,',
      engagement:
        'L\'Employeur engage le Salarié dans les conditions définies ci-après, en conformité avec la législation sociale en vigueur au Burundi.',
      workDuration:
        'Conformément aux dispositions du Code du Travail burundais fixant la durée légale du travail à 40 heures par semaine,',
      termination:
        'La rupture du contrat de travail est régie par les dispositions du Code du Travail du Burundi. Tout licenciement devra respecter les conditions de fond et de forme prévues par la législation en vigueur.',
    },
  },
};

// ─────────────────────────────────────────────
// Données initiales du formulaire
// ─────────────────────────────────────────────

const INITIAL_FORM_DATA: FormData = {
  country: 'BURUNDI',
  documentMode: 'ELECTRONIC',
  compName: '',
  compType: '',
  compAddr: '',
  compRCCM: '',
  compID: '',
  compCapital: '',
  compLogo: null,
  compDescription: '',
  showCapital: false,
  bossName: '',
  bossTitle: '',
  empName: '',
  empBirth: '',
  empBirthPlace: '',
  empNation: '',
  empAddr: '',
  empID: '',
  empPhone: '',
  empWorkPermit: '',
  isForeigner: false,
  jobTitle: '',
  jobType: 'CDI',
  jobDept: '',
  jobLocation: '',
  salary: '',
  bonus: '',
  hours: '',
  trial: '',
  startDate: '',
  endDate: '',
  cddReason: '',
  hasNonCompete: false,
  nonCompeteDuration: '',
};

// ─────────────────────────────────────────────
// Séquence d'étapes
// ─────────────────────────────────────────────

const STEPS: { id: StepId; label: string; icon: React.ElementType; gradient: string }[] = [
  { id: 'company', label: 'Entreprise', icon: Building, gradient: 'from-emerald-500 to-teal-600' },
  { id: 'employee', label: 'Collaborateur', icon: User, gradient: 'from-emerald-400 to-cyan-500' },
  { id: 'contract', label: 'Contrat', icon: Briefcase, gradient: 'from-amber-500 to-emerald-500' },
];

// ─────────────────────────────────────────────
// Animations CSS (injected inline)
// ─────────────────────────────────────────────

const GLOBAL_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Rajdhani:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --emerald-glow: #10b981;
  --emerald-deep: #059669;
  --emerald-light: #34d399;
  --bg-primary: #020a0f;
  --bg-card: rgba(6, 30, 25, 0.55);
  --bg-card-hover: rgba(16, 185, 129, 0.07);
  --border-dim: rgba(16, 185, 129, 0.12);
  --border-active: rgba(16, 185, 129, 0.4);
  --text-primary: #e2e8f0;
  --text-secondary: rgba(167, 243, 208, 0.7);
}

/* Scrollbar custom */
.eco-scroll::-webkit-scrollbar { width: 4px; }
.eco-scroll::-webkit-scrollbar-track { background: transparent; }
.eco-scroll::-webkit-scrollbar-thumb { background: var(--emerald-deep); border-radius: 4px; }

/* Nanotech Shutter Transition */
@keyframes shutterClose {
  0% { clip-path: inset(0 0 100% 0); opacity: 0; }
  40% { clip-path: inset(0 0 50% 0); opacity: 0.5; }
  100% { clip-path: inset(0 0 0% 0); opacity: 1; }
}
@keyframes shutterOpen {
  0% { clip-path: inset(0 0 0% 0); opacity: 1; }
  100% { clip-path: inset(100% 0 0 0); opacity: 0; }
}

.shutter-enter {
  animation: shutterClose 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

/* Glass card base */
.eco-glass {
  background: var(--bg-card);
  border: 1px solid var(--border-dim);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.eco-glass:hover {
  border-color: var(--border-active);
  background: var(--bg-card-hover);
}

/* Mini-Card Interactive */
.mini-card {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform: translateZ(0);
}
.mini-card:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.15);
}
.mini-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--ripple-x, 50%) var(--ripple-y, 50%), 
    rgba(16, 185, 129, 0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.5s;
  pointer-events: none;
}
.mini-card.ripple-active::after {
  opacity: 1;
}
.mini-card-selected {
  border-color: var(--emerald-glow) !important;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.2), inset 0 0 20px rgba(16, 185, 129, 0.05);
}

/* Holographic grid background */
.holo-grid {
  background-image:
    linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* Hexagonal mesh overlay — pure CSS, zero JS cost */
.hex-mesh { position: relative; }
.hex-mesh::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100' fill='none' stroke='%2310b981' stroke-width='0.5'/%3E%3Cpath d='M28 0L28 34L0 50L0 84L28 100L56 84L56 50L28 34' fill='none' stroke='%2310b981' stroke-width='0.5'/%3E%3C/svg%3E");
  background-size: 56px 100px;
}

/* Pulse glow on emerald elements */
@keyframes emeraldPulse {
  0%, 100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.2); }
  50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
}
.emerald-pulse { animation: emeraldPulse 3s ease-in-out infinite; }

/* Input focus glow */
.eco-input {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--border-dim);
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 14px;
  color: var(--text-primary);
  outline: none;
  transition: all 0.3s ease;
  font-family: 'Outfit', sans-serif;
}
.eco-input::placeholder { color: rgba(167, 243, 208, 0.3); }
.eco-input:focus {
  border-color: var(--emerald-glow);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1), 0 0 20px rgba(16, 185, 129, 0.05);
}

/* Step indicator line */
.step-connector {
  height: 2px;
  background: linear-gradient(90deg, var(--border-dim), var(--emerald-glow), var(--border-dim));
  flex: 1;
  opacity: 0.3;
  transition: opacity 0.5s;
}
.step-connector-active { opacity: 1; }

/* Notification slide */
@keyframes notifSlide {
  0% { transform: translate(-50%, -100%); opacity: 0; }
  100% { transform: translate(-50%, 0); opacity: 1; }
}
.notif-enter { animation: notifSlide 0.4s ease forwards; }

/* Floating particles */
@keyframes floatParticle {
  0% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
  50% { opacity: 1; }
  100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
}

/* Action panel shimmer */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.shimmer-btn {
  background: linear-gradient(90deg, 
    rgba(16, 185, 129, 0.8) 0%, 
    rgba(52, 211, 153, 1) 50%, 
    rgba(16, 185, 129, 0.8) 100%);
  background-size: 200% auto;
}
.shimmer-btn:hover {
  animation: shimmer 2s linear infinite;
}

/* High-tech action button — consistent green glow */
.eco-action-btn {
  position: relative;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: var(--text-primary);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
}
.eco-action-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  padding: 1px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.05), rgba(16, 185, 129, 0.3));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.eco-action-btn:hover {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.1), 0 0 40px rgba(16, 185, 129, 0.05);
}
.eco-action-btn:hover::before { opacity: 1; }
.eco-action-btn:active { transform: scale(0.98); }
.eco-action-btn:disabled { opacity: 0.4; pointer-events: none; }
.eco-action-btn .eco-action-icon {
  transition: all 0.3s ease;
  filter: drop-shadow(0 0 0px transparent);
}
.eco-action-btn:hover .eco-action-icon {
  filter: drop-shadow(0 0 4px rgba(16, 185, 129, 0.5));
}

/* Signature canvas area */
.sig-canvas-wrapper {
  touch-action: none;
  -ms-touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}
`;

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function ContractArchitectPage() {
  const router = useRouter();

  // ── State ──────────────────────────────────
  const [data, setData] = useState<FormData>(INITIAL_FORM_DATA);
  const [currentStep, setCurrentStep] = useState<StepId>('company');
  const [savedContracts, setSavedContracts] = useState<SavedContract[]>([]);
  const [signatures, setSignatures] = useState<SignatureState>({ employer: '', employee: '' });
  const [notif, setNotif] = useState<NotifState | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // UI states
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showArchives, setShowArchives] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [currentSigner, setCurrentSigner] = useState<'employer' | 'employee' | null>(null);
  const [showPostSaveActions, setShowPostSaveActions] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Refs
  const contractRef = useRef<HTMLDivElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Derived config
  const config = useMemo(() => COUNTRY_CONFIGS[data.country], [data.country]);

  // ── Inject styles ──────────────────────────
  useEffect(() => {
    const styleId = 'ecodreum-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = GLOBAL_STYLES;
      document.head.appendChild(style);
    }
    return () => {
      const existing = document.getElementById(styleId);
      if (existing) existing.remove();
    };
  }, []);

  // ── Load saved contracts from Supabase/localStorage ──
  useEffect(() => {
    const loadContracts = async () => {
      try {
        const { data: contracts, error } = await supabase
          .from('contracts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (contracts && contracts.length > 0) {
          const mapped: SavedContract[] = contracts.map((c: Record<string, unknown>) => ({
            id: String(c.id),
            employeeName: String(c.employee_name ?? ''),
            jobTitle: String(c.job_title ?? ''),
            contractType: (c.contract_type as 'CDI' | 'CDD') ?? 'CDI',
            mode: (c.mode as 'ELECTRONIC' | 'PRINT') ?? 'ELECTRONIC',
            createdAt: String(c.created_at ?? ''),
            data: c.data as FormData,
            signed: Boolean(c.signed),
            employerSignature: String(c.employer_signature ?? ''),
            employeeSignature: String(c.employee_signature ?? ''),
          }));
          setSavedContracts(mapped);
          return;
        }
      } catch {
        // Fallback: localStorage
      }

      try {
        const stored = localStorage.getItem('ecodreum_contracts');
        if (stored) {
          setSavedContracts(JSON.parse(stored) as SavedContract[]);
        }
      } catch {
        // Silently fail
      }
    };
    loadContracts();
  }, []);

  // ── Helpers ─────────────────────────────────

  const showNotif = useCallback((message: string, type: NotifState['type']) => {
    setNotif({ message, type });
    setTimeout(() => setNotif(null), 4000);
  }, []);

  const updateData = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
      setValidationErrors([]);
      setIsSaved(false);
      setShowPostSaveActions(false);
    },
    []
  );

  // ── Step navigation with shutter effect ────
  const navigateStep = useCallback(
    (targetStep: StepId) => {
      if (targetStep === currentStep) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(targetStep);
        setIsTransitioning(false);
      }, 300);
    },
    [currentStep]
  );

  const goNextStep = useCallback(() => {
    const idx = STEPS.findIndex((s) => s.id === currentStep);
    if (idx < STEPS.length - 1) navigateStep(STEPS[idx + 1].id);
  }, [currentStep, navigateStep]);

  const goPrevStep = useCallback(() => {
    const idx = STEPS.findIndex((s) => s.id === currentStep);
    if (idx > 0) navigateStep(STEPS[idx - 1].id);
  }, [currentStep, navigateStep]);

  // ── Progress calculation ────────────────────
  const getSectionProgress = useCallback(
    (section: StepId): number => {
      const fieldMap: Record<StepId, (keyof FormData)[]> = {
        company: ['compName', 'compType', 'compAddr', 'compRCCM', 'compID', 'bossName', 'bossTitle'],
        employee: ['empName', 'empBirth', 'empBirthPlace', 'empNation', 'empAddr', 'empID', 'empPhone'],
        contract: ['jobTitle', 'jobDept', 'jobLocation', 'salary', 'startDate', 'trial', 'hours'],
      };
      const fields = fieldMap[section];
      const filled = fields.filter((f) => {
        const v = data[f];
        return v !== null && v !== undefined && v !== '' && v !== '0';
      }).length;
      return Math.round((filled / fields.length) * 100);
    },
    [data]
  );

  const totalProgress = useMemo(() => {
    const sums = STEPS.map((s) => getSectionProgress(s.id));
    return Math.round(sums.reduce((a, b) => a + b, 0) / STEPS.length);
  }, [getSectionProgress]);

  // ── Mini-Card Ripple Handler ────────────────
  const handleMiniCardClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, callback: () => void) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--ripple-x', `${x}%`);
      card.style.setProperty('--ripple-y', `${y}%`);
      card.classList.add('ripple-active');
      setTimeout(() => card.classList.remove('ripple-active'), 600);
      callback();
    },
    []
  );

  // ── Logo Upload ─────────────────────────────
  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        updateData('compLogo', (event.target?.result as string) ?? null);
      };
      reader.readAsDataURL(file);
    },
    [updateData]
  );

// ─── FIN PARTIE 1 ───────────────────────────
// Collez la Partie 2 immédiatement après cette ligne
// ─────────────────────────────────────────────
// ============================================================================
// ECODREUM ENGINE L1 — Contract Architect
// app/rh/registre/contrat/page.tsx
// PARTIE 2/4 : Signature, Validation, Sauvegarde, PDF/Word, Partage, Archives
// ============================================================================
// ⚠️ Collez ce code IMMÉDIATEMENT après la fin de la Partie 1

  // ═══════════════════════════════════════════
  // SIGNATURE CANVAS — Stable mobile, touch-safe
  // ═══════════════════════════════════════════

  const initCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
  }, []);

  // Coordonnées précises (desktop + mobile)
  const getCanvasCoords = useCallback(
    (canvas: HTMLCanvasElement, e: React.MouseEvent | React.TouchEvent | TouchEvent | MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      let clientX: number;
      let clientY: number;

      if ('touches' in e) {
        const touch = (e as TouchEvent).touches[0] ?? (e as TouchEvent).changedTouches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const handleSigStart = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const canvas = signatureCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      isDrawingRef.current = true;
      const pt = getCanvasCoords(canvas, e);
      lastPointRef.current = pt;

      // Dessiner un point initial pour les taps courts
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();
    },
    [getCanvasCoords]
  );

  const handleSigMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDrawingRef.current) return;
      const canvas = signatureCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const pt = getCanvasCoords(canvas, e);
      const last = lastPointRef.current;

      if (last) {
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(pt.x, pt.y);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }

      lastPointRef.current = pt;
    },
    [getCanvasCoords]
  );

  const handleSigEnd = useCallback(() => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  }, []);

  const clearSignature = useCallback(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const saveSignature = useCallback(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas || !currentSigner) return;

    const sigData = canvas.toDataURL('image/png');
    setSignatures((prev) => ({ ...prev, [currentSigner]: sigData }));
    showNotif(
      currentSigner === 'employer'
        ? 'Signature employeur enregistrée'
        : 'Signature salarié enregistrée',
      'success'
    );
    setShowSignatureModal(false);
    setCurrentSigner(null);
    setIsSaved(false);
    setShowPostSaveActions(false);
  }, [currentSigner, showNotif]);

  const openSignatureModal = useCallback(
    (signer: 'employer' | 'employee') => {
      if (data.documentMode === 'PRINT') {
        showNotif('Activez le mode électronique pour signer', 'warning');
        return;
      }
      setCurrentSigner(signer);
      setShowSignatureModal(true);
    },
    [data.documentMode, showNotif]
  );

  // Init canvas quand le modal s'ouvre
  useEffect(() => {
    if (showSignatureModal && signatureCanvasRef.current) {
      const timer = setTimeout(() => initCanvas(signatureCanvasRef.current), 100);
      return () => clearTimeout(timer);
    }
  }, [showSignatureModal, initCanvas]);

  // ═══════════════════════════════════════════
  // VALIDATION DU FORMULAIRE
  // ═══════════════════════════════════════════

  const validateForm = useCallback((): boolean => {
    const errors: string[] = [];

    // Entreprise
    if (!data.compName.trim()) errors.push('Raison sociale requise');
    if (!data.compRCCM.trim()) errors.push('Numéro RCCM requis');
    if (!data.compID.trim()) errors.push(`${config.idLabel} requis`);
    if (!data.bossName.trim()) errors.push('Nom du représentant requis');
    if (!data.compAddr.trim()) errors.push('Adresse entreprise requise');
    if (data.showCapital && !data.compCapital.trim()) errors.push('Capital social requis');

    // Salarié
    if (!data.empName.trim()) errors.push('Nom du salarié requis');
    if (!data.empBirth.trim()) errors.push('Date de naissance requise');
    if (!data.empBirthPlace.trim()) errors.push('Lieu de naissance requis');
    if (!data.empID.trim()) errors.push("Numéro d'identification requis");
    if (!data.empAddr.trim()) errors.push('Adresse du salarié requise');
    if (!data.empPhone.trim()) errors.push('Téléphone requis');
    if (data.isForeigner && !data.empWorkPermit.trim()) errors.push('Permis de travail requis');

    // Contrat
    if (!data.jobTitle.trim()) errors.push('Poste requis');
    if (!data.jobLocation.trim()) errors.push('Lieu de travail requis');
    if (!data.salary.trim() || parseFloat(data.salary) <= 0) errors.push('Salaire valide requis');
    if (!data.startDate) errors.push('Date de début requise');
    if (data.jobType === 'CDD') {
      if (!data.endDate) errors.push('Date de fin requise pour un CDD');
      if (!data.cddReason.trim()) errors.push('Motif du CDD requis');
    }
    if (data.hasNonCompete && !data.nonCompeteDuration.trim()) {
      errors.push('Durée de non-concurrence requise');
    }

    // Signatures obligatoires
    if (!signatures.employer) errors.push('Signature employeur requise');
    if (!signatures.employee) errors.push('Signature salarié requise');

    setValidationErrors(errors);
    return errors.length === 0;
  }, [data, config, signatures]);

  // ═══════════════════════════════════════════
  // SAUVEGARDE SUPABASE + LOCAL
  // ═══════════════════════════════════════════

  const saveContract = useCallback(async () => {
    if (!validateForm()) {
      showNotif('Veuillez corriger les erreurs', 'error');
      // Naviguer vers la première section en erreur
      if (!data.compName.trim() || !data.compRCCM.trim() || !data.compID.trim() || !data.bossName.trim()) {
        navigateStep('company');
      } else if (!data.empName.trim() || !data.empBirth.trim() || !data.empID.trim()) {
        navigateStep('employee');
      } else {
        navigateStep('contract');
      }
      return;
    }

    setIsGenerating(true);
    try {
      const contract: SavedContract = {
        id: Date.now().toString(),
        employeeName: data.empName,
        jobTitle: data.jobTitle,
        contractType: data.jobType,
        mode: data.documentMode,
        createdAt: new Date().toISOString(),
        data,
        signed: !!(signatures.employer && signatures.employee),
        employerSignature: signatures.employer,
        employeeSignature: signatures.employee,
      };

      // Tentative Supabase
      try {
        const { error } = await supabase.from('contracts').insert([
          {
            id: contract.id,
            employee_name: contract.employeeName,
            job_title: contract.jobTitle,
            contract_type: contract.contractType,
            mode: contract.mode,
            created_at: contract.createdAt,
            data: contract.data,
            signed: contract.signed,
            employer_signature: contract.employerSignature,
            employee_signature: contract.employeeSignature,
          },
        ]);
        if (error) throw error;
      } catch {
        // Fallback localStorage
        console.warn('Supabase indisponible, sauvegarde locale');
      }

      const updated = [contract, ...savedContracts];
      setSavedContracts(updated);
      localStorage.setItem('ecodreum_contracts', JSON.stringify(updated));

      setIsSaved(true);
      setShowPostSaveActions(true);
      showNotif('Contrat enregistré et validé avec succès !', 'success');
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      showNotif('Erreur lors de la sauvegarde', 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [validateForm, data, signatures, savedContracts, showNotif, navigateStep]);

  // ═══════════════════════════════════════════
  // GÉNÉRATION PDF — Noir & Blanc professionnel
  // ═══════════════════════════════════════════

  const generateContractHTML = useCallback((): string => {
    const capitalClause =
      data.showCapital && data.compCapital
        ? `, au capital social de ${data.compCapital} ${config.currency}`
        : '';
    const foreignerClause =
      data.isForeigner && data.empWorkPermit
        ? `, titulaire du permis de travail n°${data.empWorkPermit}`
        : '';
    const cddClause =
      data.jobType === 'CDD' && data.cddReason
        ? `<br/><br/>Le présent contrat est conclu pour les besoins suivants : ${data.cddReason}.`
        : '';
    const bonusClause = data.bonus
      ? `<br/><br/>En sus de cette rémunération de base, le Salarié pourra percevoir les primes et avantages suivants : ${data.bonus}.`
      : '';
    const endDateClause =
      data.jobType === 'CDD' && data.endDate
        ? ` et prendra fin le ${new Date(data.endDate).toLocaleDateString('fr-FR')}`
        : '';

    const formatDate = (d: string) => {
      try {
        return new Date(d).toLocaleDateString('fr-FR');
      } catch {
        return d;
      }
    };

    const todayFull = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const sigEmployerHTML = signatures.employer
      ? `<img src="${signatures.employer}" style="height:80px;margin:8px auto;display:block;" /><p style="font-size:10px;color:#666;text-align:center;">Signature électronique</p>`
      : `<div style="height:80px;border-bottom:2px solid #000;display:flex;align-items:flex-end;justify-content:center;padding-bottom:8px;"><span style="font-size:10px;color:#999;">(Signature et cachet)</span></div>`;

    const sigEmployeeHTML = signatures.employee
      ? `<img src="${signatures.employee}" style="height:80px;margin:8px auto;display:block;" /><p style="font-size:10px;color:#666;text-align:center;">Signature électronique</p>`
      : `<div style="height:80px;border-bottom:2px solid #000;display:flex;align-items:flex-end;justify-content:center;padding-bottom:8px;"><span style="font-size:10px;color:#999;">(Lu et approuvé, signature)</span></div>`;

    const nonCompeteArticle = data.hasNonCompete
      ? `
      <div style="margin-bottom:20px;">
        <h3 style="font-weight:bold;font-size:13px;margin-bottom:10px;text-transform:uppercase;">ARTICLE 6 : CLAUSE DE NON-CONCURRENCE</h3>
        <p style="font-size:12px;line-height:1.8;">
          Le Salarié s'engage, pendant une durée de <strong>${data.nonCompeteDuration}</strong> suivant la cessation du présent contrat,
          quelle qu'en soit la cause, à ne pas exercer, directement ou indirectement, une activité concurrente à celle de l'Employeur.
          <br/><br/>
          Cette obligation s'applique sur le territoire du ${config.name} et concerne toute activité similaire ou connexe
          à celle exercée au sein de la société ${data.compName}.
          <br/><br/>
          En contrepartie de cette clause, le Salarié percevra une indemnité compensatrice dont les modalités seront
          définies conformément aux dispositions légales applicables.
        </p>
      </div>`
      : '';

    const suspArticleNum = data.hasNonCompete ? '7' : '6';
    const litigeArticleNum = data.hasNonCompete ? '8' : '7';

    const logoHTML = data.compLogo
      ? `<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;">
           <img src="${data.compLogo}" style="width:90px;height:90px;object-fit:contain;" />
           <div style="text-align:right;">
             <div style="font-weight:bold;font-size:16px;">${data.compName}</div>
             ${data.compDescription ? `<div style="font-size:10px;color:#666;margin-top:4px;">${data.compDescription}</div>` : ''}
           </div>
         </div>`
      : '';

    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  @page { size: A4; margin: 20mm 18mm; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #000; background: #fff; line-height: 1.8; font-size: 12px; margin: 0; padding: 40px; }
  strong { font-weight: 700; }
  h1 { font-size: 22px; text-align: center; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 6px; }
  h3 { font-size: 13px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; }
  .article { margin-bottom: 20px; }
  .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
  .sig-box { text-align: center; }
  .footer { margin-top: 50px; padding-top: 16px; border-top: 2px solid #ccc; text-align: center; font-size: 10px; color: #666; }
</style>
</head><body>

${logoHTML}

<h1>CONTRAT DE TRAVAIL</h1>
<p style="text-align:center;font-size:14px;font-weight:bold;color:#333;margin-bottom:30px;">RÉGIME : ${data.jobType}</p>

<p style="font-weight:bold;font-size:14px;margin-bottom:16px;">ENTRE LES SOUSSIGNÉS :</p>

<p>La société <strong>${data.compName}</strong>, ${data.compType}${capitalClause}, dont le siège social est situé à <strong>${data.compAddr}</strong>,
immatriculée au Registre de Commerce et du Crédit Mobilier (RCCM) sous le numéro <strong>${data.compRCCM}</strong>
et identifiée au ${config.idLabel} sous le numéro <strong>${data.compID}</strong>,
représentée par M./Mme <strong>${data.bossName}</strong> en sa qualité de <strong>${data.bossTitle}</strong>,
dûment habilité(e) aux fins des présentes.</p>

<p style="text-align:right;font-style:italic;">Ci-après dénommée « <strong>L'EMPLOYEUR</strong> »</p>
<p style="text-align:center;font-weight:bold;">D'UNE PART,</p>
<p style="text-align:center;font-weight:bold;">ET :</p>

<p>M./Mme <strong>${data.empName}</strong>, né(e) le <strong>${formatDate(data.empBirth)}</strong> à <strong>${data.empBirthPlace}</strong>,
de nationalité <strong>${data.empNation}</strong>${foreignerClause}, titulaire de la pièce d'identité n°<strong>${data.empID}</strong>,
demeurant à <strong>${data.empAddr}</strong>, joignable au <strong>${data.empPhone}</strong>.</p>

<p style="text-align:right;font-style:italic;">Ci-après dénommé(e) « <strong>LE SALARIÉ</strong> »</p>
<p style="text-align:center;font-weight:bold;">D'AUTRE PART,</p>

<p style="font-weight:bold;font-size:14px;margin-top:30px;margin-bottom:16px;">IL A ÉTÉ ARRÊTÉ ET CONVENU CE QUI SUIT :</p>

<div class="article">
  <h3>ARTICLE 1 : OBJET ET CADRE LÉGAL</h3>
  <p>Le présent contrat est conclu sous le régime du ${config.code}.<br/><br/>
  ${config.articles.intro}<br/>${config.articles.engagement}<br/><br/>
  Le présent contrat définit les conditions d'engagement et d'emploi du Salarié au sein de la société ${data.compName}.</p>
</div>

<div class="article">
  <h3>ARTICLE 2 : NATURE ET FONCTIONS</h3>
  <p>Le Salarié est recruté en qualité de <strong>${data.jobTitle}</strong> au sein du département <strong>${data.jobDept}</strong>.
  <br/><br/>Le Salarié exercera ses fonctions au sein de l'établissement situé à <strong>${data.jobLocation}</strong>.
  <br/><br/>Le type de contrat conclu est un contrat à durée <strong>${data.jobType === 'CDI' ? 'indéterminée (CDI)' : 'déterminée (CDD)'}</strong>.${cddClause}
  <br/><br/><strong>Le Salarié s'engage à</strong> exercer ses fonctions avec diligence, compétence et loyauté,
  conformément aux directives de l'Employeur et aux usages de la profession.</p>
</div>

<div class="article">
  <h3>ARTICLE 3 : RÉMUNÉRATION</h3>
  <p>En contrepartie de l'exécution de ses fonctions, le Salarié percevra une rémunération mensuelle brute de
  <strong>${data.salary} ${config.currency}</strong>.
  <br/><br/>Cette rémunération est versée mensuellement par virement bancaire, sous réserve des retenues légales et conventionnelles applicables.${bonusClause}
  <br/><br/>${config.articles.workDuration} la durée hebdomadaire de travail est fixée à <strong>${data.hours} heures</strong>.</p>
</div>

<div class="article">
  <h3>ARTICLE 4 : DURÉE DU CONTRAT ET PÉRIODE D'ESSAI</h3>
  <p>Le présent contrat de travail prend effet à compter du <strong>${formatDate(data.startDate)}</strong>${endDateClause}.
  <br/><br/>Une période d'essai de <strong>${data.trial} mois</strong> est prévue. Durant cette période, chacune des parties
  peut mettre fin au contrat sans préavis ni indemnité, conformément aux dispositions légales en vigueur.
  <br/><br/>À l'issue de la période d'essai, si aucune des parties n'a manifesté sa volonté de rompre le contrat,
  celui-ci se poursuivra dans les conditions définies aux présentes.</p>
</div>

<div class="article">
  <h3>ARTICLE 5 : OBLIGATIONS DES PARTIES</h3>
  <p><strong>L'Employeur s'engage à :</strong><br/>
  — Fournir au Salarié un travail conforme à ses qualifications professionnelles<br/>
  — Verser la rémunération convenue aux échéances prévues<br/>
  — Respecter l'ensemble des dispositions légales et conventionnelles applicables<br/>
  — Assurer la sécurité et la protection de la santé du Salarié<br/><br/>
  <strong>Le Salarié s'engage à :</strong><br/>
  — Exécuter personnellement les missions qui lui sont confiées<br/>
  — Respecter les directives de l'Employeur et le règlement intérieur<br/>
  — Observer une obligation de loyauté et de confidentialité<br/>
  — Consacrer l'intégralité de son activité professionnelle à l'Employeur</p>
</div>

${nonCompeteArticle}

<div class="article">
  <h3>ARTICLE ${suspArticleNum} : SUSPENSION ET RUPTURE DU CONTRAT</h3>
  <p>${config.articles.termination}<br/><br/>
  La suspension du contrat de travail pourra intervenir dans les cas prévus par la loi (maladie, maternité, accident du travail, etc.).
  <br/><br/>La rupture du contrat de travail, quelle qu'en soit la cause, devra respecter les dispositions légales en vigueur
  relatives au préavis, aux indemnités et aux formalités applicables.
  <br/><br/>En cas de rupture du contrat, le Salarié restituera immédiatement à l'Employeur l'ensemble des documents,
  matériels et équipements mis à sa disposition.</p>
</div>

<div class="article">
  <h3>ARTICLE ${litigeArticleNum} : LITIGES</h3>
  <p>En cas de différend relatif à l'interprétation ou à l'exécution du présent contrat,
  les parties s'efforceront de trouver une solution amiable.
  <br/><br/>À défaut d'accord amiable, tout litige relèvera de la compétence exclusive du
  <strong>${config.court}</strong>, conformément aux dispositions légales applicables en matière de contentieux du travail.</p>
</div>

<div style="margin-top:40px;">
  <p>Fait à <strong>${data.compAddr.split(',')[0].trim()}</strong>, le <strong>${todayFull}</strong></p>
  <p>En deux exemplaires originaux, dont un remis au Salarié.</p>
</div>

<div class="sig-grid">
  <div class="sig-box">
    <p style="font-weight:bold;">L'EMPLOYEUR</p>
    ${sigEmployerHTML}
    <p style="font-weight:bold;margin-top:8px;">${data.bossName}</p>
    <p style="color:#666;">${data.bossTitle}</p>
  </div>
  <div class="sig-box">
    <p style="font-weight:bold;">LE SALARIÉ</p>
    ${sigEmployeeHTML}
    <p style="font-weight:bold;margin-top:8px;">${data.empName}</p>
    <p style="color:#666;">${data.jobTitle}</p>
  </div>
</div>

<div class="footer">
  ${data.documentMode === 'ELECTRONIC'
    ? `<p>Document généré via <strong>ECODREUM Intelligence</strong></p>
       <p>Ce document ne se substitue pas à un conseil juridique personnalisé</p>`
    : `<p style="font-weight:600;">${data.compName}</p>`}
</div>

</body></html>`;
  }, [data, config, signatures]);

  // ── Génération PDF via html rendu en iframe + impression ──
  const generatePDF = useCallback(async () => {
    setIsGenerating(true);
    try {
      const html = generateContractHTML();
      const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
      const url = URL.createObjectURL(blob);

      // Créer un iframe invisible pour impression
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-10000px';
      iframe.style.left = '-10000px';
      iframe.style.width = '210mm';
      iframe.style.height = '297mm';
      document.body.appendChild(iframe);

      iframe.src = url;
      await new Promise<void>((resolve) => {
        iframe.onload = () => resolve();
      });

      // Alternative: télécharger directement comme HTML imprimable
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `CONTRAT_${data.empName.replace(/\s+/g, '_')}_${Date.now()}.html`;
      downloadLink.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 2000);

      showNotif('Document PDF prêt — ouvrez et imprimez en PDF', 'success');
    } catch (err) {
      console.error('Erreur PDF:', err);
      showNotif('Erreur génération PDF', 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [generateContractHTML, data.empName, showNotif]);

  // ═══════════════════════════════════════════
  // UTILITAIRE : Conversion base64 → Uint8Array
  // ═══════════════════════════════════════════

  const base64ToUint8Array = useCallback((dataUrl: string): Uint8Array => {
    const base64 = dataUrl.split(',')[1];
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }, []);

  // ═══════════════════════════════════════════
  // GÉNÉRATION WORD (.docx) — via librairie docx
  // ═══════════════════════════════════════════

  const generateWord = useCallback(async () => {
    setIsGenerating(true);
    try {
      // Prepare clauses (same logic as generateContractHTML)
      const capitalClause =
        data.showCapital && data.compCapital
          ? `, au capital social de ${data.compCapital} ${config.currency}`
          : '';
      const foreignerClause =
        data.isForeigner && data.empWorkPermit
          ? `, titulaire du permis de travail n\u00B0${data.empWorkPermit}`
          : '';
      const cddClause =
        data.jobType === 'CDD' && data.cddReason
          ? `Le pr\u00E9sent contrat est conclu pour les besoins suivants : ${data.cddReason}.`
          : '';
      const bonusClause = data.bonus
        ? `En sus de cette r\u00E9mun\u00E9ration de base, le Salari\u00E9 pourra percevoir les primes et avantages suivants : ${data.bonus}.`
        : '';
      const endDateClause =
        data.jobType === 'CDD' && data.endDate
          ? ` et prendra fin le ${new Date(data.endDate).toLocaleDateString('fr-FR')}`
          : '';

      const formatDate = (d: string) => {
        try { return new Date(d).toLocaleDateString('fr-FR'); } catch { return d; }
      };
      const todayFull = new Date().toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric',
      });

      const suspArticleNum = data.hasNonCompete ? '7' : '6';
      const litigeArticleNum = data.hasNonCompete ? '8' : '7';

      // Text run helpers
      const normalRun = (text: string): TextRun => new TextRun({ text, font: 'Georgia', size: 24 });
      const boldRun = (text: string): TextRun => new TextRun({ text, font: 'Georgia', size: 24, bold: true });
      const italicRun = (text: string): TextRun => new TextRun({ text, font: 'Georgia', size: 24, italics: true });
      const boldItalicRun = (text: string): TextRun => new TextRun({ text, font: 'Georgia', size: 24, bold: true, italics: true });

      // Paragraph helpers
      const articleHeading = (title: string): Paragraph =>
        new Paragraph({
          spacing: { before: 300, after: 120 },
          children: [new TextRun({ text: title, font: 'Georgia', size: 26, bold: true, allCaps: true })],
        });

      const articleBody = (runs: TextRun[]): Paragraph =>
        new Paragraph({ spacing: { after: 120 }, children: runs });

      // Build all paragraphs
      const children: (Paragraph | Table)[] = [];

      // Logo (if base64 data URL)
      if (data.compLogo) {
        try {
          const logoBytes = base64ToUint8Array(data.compLogo);
          children.push(
            new Paragraph({
              children: [
                new ImageRun({ data: logoBytes, transformation: { width: 90, height: 90 } }),
              ],
            })
          );
          children.push(
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                boldRun(data.compName),
                ...(data.compDescription
                  ? [new TextRun({ text: `\n${data.compDescription}`, font: 'Georgia', size: 20, color: '666666' })]
                  : []),
              ],
            })
          );
        } catch { /* skip logo on error */ }
      }

      // Title
      children.push(new Paragraph({ spacing: { before: 400 } }));
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({ text: 'CONTRAT DE TRAVAIL', font: 'Georgia', size: 44, bold: true, allCaps: true, characterSpacing: 60 }),
          ],
        })
      );
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [new TextRun({ text: `R\u00C9GIME : ${data.jobType}`, font: 'Georgia', size: 28, bold: true, color: '333333' })],
        })
      );

      // ENTRE LES SOUSSIGNÉS
      children.push(
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: 'ENTRE LES SOUSSIGN\u00C9S :', font: 'Georgia', size: 28, bold: true })] })
      );

      // Company info
      children.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [
            normalRun('La soci\u00E9t\u00E9 '), boldRun(data.compName),
            normalRun(`, ${data.compType}${capitalClause}, dont le si\u00E8ge social est situ\u00E9 \u00E0 `),
            boldRun(data.compAddr),
            normalRun(', immatricul\u00E9e au Registre de Commerce et du Cr\u00E9dit Mobilier (RCCM) sous le num\u00E9ro '),
            boldRun(data.compRCCM),
            normalRun(` et identifi\u00E9e au ${config.idLabel} sous le num\u00E9ro `),
            boldRun(data.compID),
            normalRun(', repr\u00E9sent\u00E9e par M./Mme '),
            boldRun(data.bossName),
            normalRun(' en sa qualit\u00E9 de '),
            boldRun(data.bossTitle),
            normalRun(', d\u00FBment habilit\u00E9(e) aux fins des pr\u00E9sentes.'),
          ],
        })
      );

      children.push(new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [italicRun('Ci-apr\u00E8s d\u00E9nomm\u00E9e \u00AB '), boldItalicRun("L'EMPLOYEUR"), italicRun(' \u00BB')],
      }));
      children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [boldRun("D'UNE PART,")] }));
      children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [boldRun('ET :')] }));

      // Employee info
      children.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [
            normalRun('M./Mme '), boldRun(data.empName),
            normalRun(', n\u00E9(e) le '), boldRun(formatDate(data.empBirth)),
            normalRun(' \u00E0 '), boldRun(data.empBirthPlace),
            normalRun(', de nationalit\u00E9 '), boldRun(data.empNation),
            normalRun(foreignerClause),
            normalRun(", titulaire de la pi\u00E8ce d'identit\u00E9 n\u00B0"),
            boldRun(data.empID),
            normalRun(', demeurant \u00E0 '), boldRun(data.empAddr),
            normalRun(', joignable au '), boldRun(data.empPhone),
            normalRun('.'),
          ],
        })
      );

      children.push(new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [italicRun('Ci-apr\u00E8s d\u00E9nomm\u00E9(e) \u00AB '), boldItalicRun('LE SALARI\u00C9'), italicRun(' \u00BB')],
      }));
      children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [boldRun("D'AUTRE PART,")] }));
      children.push(new Paragraph({ spacing: { before: 300, after: 200 }, children: [new TextRun({ text: 'IL A \u00C9T\u00C9 ARR\u00CAT\u00C9 ET CONVENU CE QUI SUIT :', font: 'Georgia', size: 28, bold: true })] }));

      // Article 1
      children.push(articleHeading('ARTICLE 1 : OBJET ET CADRE L\u00C9GAL'));
      children.push(articleBody([normalRun(`Le pr\u00E9sent contrat est conclu sous le r\u00E9gime du ${config.code}.`)]));
      children.push(articleBody([normalRun(config.articles.intro), normalRun(' '), normalRun(config.articles.engagement)]));
      children.push(articleBody([normalRun(`Le pr\u00E9sent contrat d\u00E9finit les conditions d'engagement et d'emploi du Salari\u00E9 au sein de la soci\u00E9t\u00E9 ${data.compName}.`)]));

      // Article 2
      children.push(articleHeading('ARTICLE 2 : NATURE ET FONCTIONS'));
      children.push(articleBody([
        normalRun('Le Salari\u00E9 est recrut\u00E9 en qualit\u00E9 de '), boldRun(data.jobTitle),
        normalRun(' au sein du d\u00E9partement '), boldRun(data.jobDept), normalRun('.'),
      ]));
      children.push(articleBody([
        normalRun("Le Salari\u00E9 exercera ses fonctions au sein de l'\u00E9tablissement situ\u00E9 \u00E0 "),
        boldRun(data.jobLocation), normalRun('.'),
      ]));
      children.push(articleBody([
        normalRun('Le type de contrat conclu est un contrat \u00E0 dur\u00E9e '),
        boldRun(data.jobType === 'CDI' ? 'ind\u00E9termin\u00E9e (CDI)' : 'd\u00E9termin\u00E9e (CDD)'),
        normalRun('.'),
      ]));
      if (cddClause) { children.push(articleBody([normalRun(cddClause)])); }
      children.push(articleBody([
        boldRun("Le Salari\u00E9 s'engage \u00E0"),
        normalRun(" exercer ses fonctions avec diligence, comp\u00E9tence et loyaut\u00E9, conform\u00E9ment aux directives de l'Employeur et aux usages de la profession."),
      ]));

      // Article 3
      children.push(articleHeading('ARTICLE 3 : R\u00C9MUN\u00C9RATION'));
      children.push(articleBody([
        normalRun("En contrepartie de l'ex\u00E9cution de ses fonctions, le Salari\u00E9 percevra une r\u00E9mun\u00E9ration mensuelle brute de "),
        boldRun(`${data.salary} ${config.currency}`), normalRun('.'),
      ]));
      children.push(articleBody([normalRun('Cette r\u00E9mun\u00E9ration est vers\u00E9e mensuellement par virement bancaire, sous r\u00E9serve des retenues l\u00E9gales et conventionnelles applicables.')]));
      if (bonusClause) { children.push(articleBody([normalRun(bonusClause)])); }
      children.push(articleBody([
        normalRun(`${config.articles.workDuration} la dur\u00E9e hebdomadaire de travail est fix\u00E9e \u00E0 `),
        boldRun(`${data.hours} heures`), normalRun('.'),
      ]));

      // Article 4
      children.push(articleHeading("ARTICLE 4 : DUR\u00C9E DU CONTRAT ET P\u00C9RIODE D'ESSAI"));
      children.push(articleBody([
        normalRun('Le pr\u00E9sent contrat de travail prend effet \u00E0 compter du '),
        boldRun(formatDate(data.startDate)), normalRun(endDateClause + '.'),
      ]));
      children.push(articleBody([
        normalRun("Une p\u00E9riode d'essai de "), boldRun(`${data.trial} mois`),
        normalRun(" est pr\u00E9vue. Durant cette p\u00E9riode, chacune des parties peut mettre fin au contrat sans pr\u00E9avis ni indemnit\u00E9, conform\u00E9ment aux dispositions l\u00E9gales en vigueur."),
      ]));
      children.push(articleBody([
        normalRun("\u00C0 l'issue de la p\u00E9riode d'essai, si aucune des parties n'a manifest\u00E9 sa volont\u00E9 de rompre le contrat, celui-ci se poursuivra dans les conditions d\u00E9finies aux pr\u00E9sentes."),
      ]));

      // Article 5
      children.push(articleHeading('ARTICLE 5 : OBLIGATIONS DES PARTIES'));
      children.push(articleBody([boldRun("L'Employeur s'engage \u00E0 :")]));
      children.push(articleBody([normalRun('\u2014 Fournir au Salari\u00E9 un travail conforme \u00E0 ses qualifications professionnelles')]));
      children.push(articleBody([normalRun('\u2014 Verser la r\u00E9mun\u00E9ration convenue aux \u00E9ch\u00E9ances pr\u00E9vues')]));
      children.push(articleBody([normalRun("\u2014 Respecter l'ensemble des dispositions l\u00E9gales et conventionnelles applicables")]));
      children.push(articleBody([normalRun('\u2014 Assurer la s\u00E9curit\u00E9 et la protection de la sant\u00E9 du Salari\u00E9')]));
      children.push(new Paragraph({ spacing: { before: 120 } }));
      children.push(articleBody([boldRun("Le Salari\u00E9 s'engage \u00E0 :")]));
      children.push(articleBody([normalRun('\u2014 Ex\u00E9cuter personnellement les missions qui lui sont confi\u00E9es')]));
      children.push(articleBody([normalRun("\u2014 Respecter les directives de l'Employeur et le r\u00E8glement int\u00E9rieur")]));
      children.push(articleBody([normalRun('\u2014 Observer une obligation de loyaut\u00E9 et de confidentialit\u00E9')]));
      children.push(articleBody([normalRun("\u2014 Consacrer l'int\u00E9gralit\u00E9 de son activit\u00E9 professionnelle \u00E0 l'Employeur")]));

      // Article 6 (Non-compete, conditional)
      if (data.hasNonCompete) {
        children.push(articleHeading('ARTICLE 6 : CLAUSE DE NON-CONCURRENCE'));
        children.push(articleBody([
          normalRun("Le Salari\u00E9 s'engage, pendant une dur\u00E9e de "), boldRun(data.nonCompeteDuration),
          normalRun(" suivant la cessation du pr\u00E9sent contrat, quelle qu'en soit la cause, \u00E0 ne pas exercer, directement ou indirectement, une activit\u00E9 concurrente \u00E0 celle de l'Employeur."),
        ]));
        children.push(articleBody([
          normalRun(`Cette obligation s'applique sur le territoire du ${config.name} et concerne toute activit\u00E9 similaire ou connexe \u00E0 celle exerc\u00E9e au sein de la soci\u00E9t\u00E9 ${data.compName}.`),
        ]));
        children.push(articleBody([
          normalRun("En contrepartie de cette clause, le Salari\u00E9 percevra une indemnit\u00E9 compensatrice dont les modalit\u00E9s seront d\u00E9finies conform\u00E9ment aux dispositions l\u00E9gales applicables."),
        ]));
      }

      // Suspension & Rupture
      children.push(articleHeading(`ARTICLE ${suspArticleNum} : SUSPENSION ET RUPTURE DU CONTRAT`));
      children.push(articleBody([normalRun(config.articles.termination)]));
      children.push(articleBody([normalRun('La suspension du contrat de travail pourra intervenir dans les cas pr\u00E9vus par la loi (maladie, maternit\u00E9, accident du travail, etc.).')]));
      children.push(articleBody([normalRun("La rupture du contrat de travail, quelle qu'en soit la cause, devra respecter les dispositions l\u00E9gales en vigueur relatives au pr\u00E9avis, aux indemnit\u00E9s et aux formalit\u00E9s applicables.")]));
      children.push(articleBody([normalRun("En cas de rupture du contrat, le Salari\u00E9 restituera imm\u00E9diatement \u00E0 l'Employeur l'ensemble des documents, mat\u00E9riels et \u00E9quipements mis \u00E0 sa disposition.")]));

      // Litiges
      children.push(articleHeading(`ARTICLE ${litigeArticleNum} : LITIGES`));
      children.push(articleBody([normalRun("En cas de diff\u00E9rend relatif \u00E0 l'interpr\u00E9tation ou \u00E0 l'ex\u00E9cution du pr\u00E9sent contrat, les parties s'efforceront de trouver une solution amiable.")]));
      children.push(articleBody([
        normalRun("\u00C0 d\u00E9faut d'accord amiable, tout litige rel\u00E8vera de la comp\u00E9tence exclusive du "),
        boldRun(config.court),
        normalRun(", conform\u00E9ment aux dispositions l\u00E9gales applicables en mati\u00E8re de contentieux du travail."),
      ]));

      // Fait à...
      children.push(new Paragraph({ spacing: { before: 400 } }));
      children.push(articleBody([
        normalRun('Fait \u00E0 '), boldRun(data.compAddr.split(',')[0].trim()),
        normalRun(', le '), boldRun(todayFull),
      ]));
      children.push(articleBody([normalRun('En deux exemplaires originaux, dont un remis au Salari\u00E9.')]));

      // Signature table (borderless 2-column)
      const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
      const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

      const buildSigCell = (title: string, sigUrl: string, name: string, role: string, placeholder: string): TableCell => {
        const cellChildren: Paragraph[] = [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [boldRun(title)] }),
        ];
        if (sigUrl) {
          try {
            const sigBytes = base64ToUint8Array(sigUrl);
            cellChildren.push(
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 100, after: 100 },
                children: [new ImageRun({ data: sigBytes, transformation: { width: 200, height: 80 } })],
              })
            );
            cellChildren.push(
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Signature \u00E9lectronique', font: 'Georgia', size: 20, color: '666666' })] })
            );
          } catch {
            cellChildren.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 }, children: [new TextRun({ text: placeholder, font: 'Georgia', size: 20, color: '999999' })] }));
          }
        } else {
          cellChildren.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 }, children: [new TextRun({ text: placeholder, font: 'Georgia', size: 20, color: '999999' })] }));
        }
        cellChildren.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [boldRun(name)] }));
        cellChildren.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: role, font: 'Georgia', size: 24, color: '666666' })] }));
        return new TableCell({ borders: noBorders, width: { size: 50, type: WidthType.PERCENTAGE }, children: cellChildren });
      };

      const sigTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        rows: [
          new TableRow({
            children: [
              buildSigCell("L'EMPLOYEUR", signatures.employer, data.bossName, data.bossTitle, '(Signature et cachet)'),
              buildSigCell('LE SALARI\u00C9', signatures.employee, data.empName, data.jobTitle, '(Lu et approuv\u00E9, signature)'),
            ],
          }),
        ],
      });

      children.push(new Paragraph({ spacing: { before: 400 } }));
      children.push(sigTable);

      // Footer
      const footerParagraphs: Paragraph[] = [];
      if (data.documentMode === 'ELECTRONIC') {
        footerParagraphs.push(new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { before: 400 },
          border: { top: { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC', space: 8 } },
          children: [new TextRun({ text: 'Document g\u00E9n\u00E9r\u00E9 via ECODREUM Intelligence', font: 'Georgia', size: 20, color: '666666', bold: true })],
        }));
        footerParagraphs.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'Ce document ne se substitue pas \u00E0 un conseil juridique personnalis\u00E9', font: 'Georgia', size: 20, color: '666666' })],
        }));
      } else {
        footerParagraphs.push(new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { before: 400 },
          border: { top: { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC', space: 8 } },
          children: [new TextRun({ text: data.compName, font: 'Georgia', size: 20, bold: true, color: '666666' })],
        }));
      }
      children.push(...footerParagraphs);

      // Create document
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              size: { width: convertMillimetersToTwip(210), height: convertMillimetersToTwip(297) },
              margin: {
                top: convertMillimetersToTwip(20), bottom: convertMillimetersToTwip(20),
                left: convertMillimetersToTwip(18), right: convertMillimetersToTwip(18),
              },
            },
          },
          children,
        }],
      });

      // Generate and download
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `CONTRAT_${data.empName.replace(/\s+/g, '_')}_${Date.now()}.docx`);
      showNotif('Document Word (.docx) t\u00E9l\u00E9charg\u00E9', 'success');
    } catch (err) {
      console.error('Erreur Word:', err);
      showNotif('Erreur g\u00E9n\u00E9ration Word', 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [data, config, signatures, base64ToUint8Array, showNotif]);

  // ═══════════════════════════════════════════
  // WEB SHARE API — Partage natif du PDF
  // ═══════════════════════════════════════════

  const shareContract = useCallback(async () => {
    try {
      const html = generateContractHTML();
      const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
      const file = new File(
        [blob],
        `CONTRAT_${data.empName.replace(/\s+/g, '_')}.html`,
        { type: 'text/html' }
      );

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `Contrat - ${data.empName}`,
          text: `Contrat de travail (${data.jobType}) - ${data.empName}`,
          files: [file],
        });
        showNotif('Partage effectué', 'success');
      } else if (navigator.share) {
        // Partage sans fichier (fallback)
        await navigator.share({
          title: `Contrat - ${data.empName}`,
          text: `Contrat de travail (${data.jobType}) pour ${data.empName} chez ${data.compName}`,
        });
        showNotif('Partage effectué', 'success');
      } else {
        // Copier dans le presse-papier comme dernier recours
        await navigator.clipboard.writeText(
          `Contrat de travail (${data.jobType}) pour ${data.empName} chez ${data.compName}`
        );
        showNotif('Lien copié dans le presse-papier', 'success');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Erreur partage:', err);
        showNotif('Erreur de partage', 'error');
      }
    }
  }, [generateContractHTML, data, showNotif]);

  // ═══════════════════════════════════════════
  // ARCHIVES — Charger / Supprimer
  // ═══════════════════════════════════════════

  const deleteContract = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase.from('contracts').delete().eq('id', id);
        if (error) throw error;
      } catch {
        console.warn('Suppression Supabase échouée, nettoyage local');
      }
      const updated = savedContracts.filter((c) => c.id !== id);
      setSavedContracts(updated);
      localStorage.setItem('ecodreum_contracts', JSON.stringify(updated));
      showNotif('Contrat supprimé', 'success');
    },
    [savedContracts, showNotif]
  );

  const loadContract = useCallback(
    (contract: SavedContract) => {
      setData(contract.data);
      if (contract.employerSignature) {
        setSignatures({
          employer: contract.employerSignature,
          employee: contract.employeeSignature || '',
        });
      }
      setShowArchives(false);
      setIsSaved(false);
      setShowPostSaveActions(false);
      showNotif('Contrat chargé', 'success');
    },
    [showNotif]
  );
// Fonction pour réinitialiser le formulaire (Nouveau Contrat)
  const handleNewContract = () => {
    // Au lieu du message moche, on ouvre la modale personnalisée
    setShowResetConfirm(true);
  };

  // Cette fonction sera appelée quand on cliquera sur "Confirmer" dans la modale
  const confirmReset = () => {
    setData(INITIAL_FORM_DATA);
    setSignatures({ employer: '', employee: '' });
    setCurrentStep('company');
    setShowPreview(false);
    setIsSaved(false);
    setShowResetConfirm(false); // On ferme la modale
  };
            
// ─── FIN PARTIE 2 ───────────────────────────
// Collez la Partie 3 immédiatement après cette ligne
// ─────────────────────────────────────────────
// ============================================================================
// ECODREUM ENGINE L1 — Contract Architect
// app/rh/registre/contrat/page.tsx
// PARTIE 3/4 : Rendu JSX — Layout, Header, Stepper, Formulaires, Actions, Modals
// ============================================================================
// ⚠️ Collez ce code IMMÉDIATEMENT après la fin de la Partie 2

  // ═══════════════════════════════════════════
// RENDU PRINCIPAL (return)
// ═══════════════════════════════════════════

  return (
    <div
      className="h-screen w-full overflow-y-auto overflow-x-hidden eco-scroll holo-grid hex-mesh"
      style={{
        background: 'var(--bg-primary)',
        fontFamily: "'Outfit', 'Space Grotesk', sans-serif",
      }}
    >

      {/* ── NOTIFICATIONS ── */}
      {notif && (
        <div
          className="fixed top-5 left-1/2 z-[9999] notif-enter"
          style={{ transform: 'translateX(-50%)' }}
        >
          <div
            className="flex items-center gap-3 px-6 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl"
            style={{
              background:
                notif.type === 'success'
                  ? 'rgba(16, 185, 129, 0.15)'
                  : notif.type === 'warning'
                  ? 'rgba(245, 158, 11, 0.15)'
                  : 'rgba(239, 68, 68, 0.15)',
              borderColor:
                notif.type === 'success'
                  ? 'rgba(16, 185, 129, 0.4)'
                  : notif.type === 'warning'
                  ? 'rgba(245, 158, 11, 0.4)'
                  : 'rgba(239, 68, 68, 0.4)',
              color:
                notif.type === 'success'
                  ? '#6ee7b7'
                  : notif.type === 'warning'
                  ? '#fcd34d'
                  : '#fca5a5',
            }}
          >
            {notif.type === 'success' && <CheckCircle size={16} />}
            {notif.type === 'warning' && <AlertTriangle size={16} />}
            {notif.type === 'error' && <AlertCircle size={16} />}
            <span className="text-xs font-bold uppercase tracking-wider">{notif.message}</span>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* MAIN CONTENT                           */}
      {/* ═══════════════════════════════════════ */}
      <div className="relative max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-8">

        {/* ── HEADER ── */}
        <header className="mb-8">
          <div className="eco-glass rounded-2xl p-5 relative overflow-hidden">
            {/* Decorative corner accent */}
            <div
              className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at top right, rgba(16,185,129,0.08), transparent 70%)',
              }}
            />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="p-3 rounded-xl border transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    borderColor: 'rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <ArrowLeft size={18} style={{ color: 'var(--emerald-glow)' }} />
                </button>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Hexagon size={18} style={{ color: 'var(--emerald-glow)' }} />
                    <h1
                      className="text-xl sm:text-2xl font-black uppercase tracking-tight"
                      style={{
                        background: 'linear-gradient(135deg, var(--emerald-light), var(--emerald-glow))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      CONTRACT ARCHITECT
                    </h1>
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                    ECODREUM Engine L1
                  </p>
                </div>
              </div>

              {/* Bouton Nouveau (Haut de page) */}
<button 
  onClick={handleNewContract}
  className="ml-4 flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 px-3 py-1.5 rounded-full transition-all group active:scale-95"
>
  <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
  <span className="text-[10px] font-black tracking-widest">NOUVEAU</span>
</button>

              <button
                onClick={() => setShowArchives(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'rgba(16, 185, 129, 0.06)',
                  borderColor: 'rgba(16, 185, 129, 0.25)',
                  color: 'var(--emerald-light)',
                }}
              >
                <Archive size={15} />
                <span>Archives</span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-black"
                  style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald-glow)' }}
                >
                  {savedContracts.length}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* ── MODE + JURIDICTION (Mini-Cards) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Mode de Document */}
          <div className="eco-glass rounded-2xl p-5">
            <label className="text-[10px] font-bold uppercase tracking-widest mb-3 block" style={{ color: 'var(--emerald-glow)' }}>
              Mode de Document
            </label>
            <div className="flex gap-3">
              {[
                { mode: 'ELECTRONIC' as const, label: 'Électronique', icon: Zap },
                { mode: 'PRINT' as const, label: 'Imprimer', icon: Printer },
              ].map(({ mode, label, icon: Icon }) => (
                <div
                  key={mode}
                  onClick={(e) => handleMiniCardClick(e, () => updateData('documentMode', mode))}
                  className={`mini-card flex-1 p-4 rounded-xl border text-center cursor-pointer ${
                    data.documentMode === mode ? 'mini-card-selected' : ''
                  }`}
                  style={{
                    background:
                      data.documentMode === mode
                        ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))'
                        : 'rgba(0,0,0,0.25)',
                    borderColor:
                      data.documentMode === mode ? 'var(--emerald-glow)' : 'var(--border-dim)',
                  }}
                >
                  <Icon
                    size={20}
                    className="mx-auto mb-2"
                    style={{
                      color: data.documentMode === mode ? 'var(--emerald-glow)' : 'var(--text-secondary)',
                    }}
                  />
                  <p
                    className="text-xs font-bold"
                    style={{
                      color: data.documentMode === mode ? 'var(--emerald-light)' : 'var(--text-secondary)',
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Juridiction */}
          <div className="eco-glass rounded-2xl p-5">
            <label className="text-[10px] font-bold uppercase tracking-widest mb-3 block" style={{ color: 'var(--emerald-glow)' }}>
              Juridiction
            </label>
            <div className="flex gap-3">
              {(['SENEGAL', 'BURUNDI'] as const).map((country) => (
                <div
                  key={country}
                  onClick={(e) => handleMiniCardClick(e, () => updateData('country', country))}
                  className={`mini-card flex-1 p-4 rounded-xl border text-center cursor-pointer ${
                    data.country === country ? 'mini-card-selected' : ''
                  }`}
                  style={{
                    background:
                      data.country === country
                        ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))'
                        : 'rgba(0,0,0,0.25)',
                    borderColor: data.country === country ? 'var(--emerald-glow)' : 'var(--border-dim)',
                  }}
                >
                  <Globe
                    size={20}
                    className="mx-auto mb-2"
                    style={{ color: data.country === country ? 'var(--emerald-glow)' : 'var(--text-secondary)' }}
                  />
                  <p
                    className="text-sm font-black"
                    style={{ color: data.country === country ? 'var(--emerald-light)' : 'var(--text-secondary)' }}
                  >
                    {country}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── STEPPER — 3 étapes ── */}
        <div className="mb-8">
          <div className="eco-glass rounded-2xl p-5">
            {/* Steps Row */}
            <div className="flex items-center justify-between gap-2 mb-4">
              {STEPS.map((step, idx) => {
                const progress = getSectionProgress(step.id);
                const isActive = currentStep === step.id;
                const isComplete = progress === 100;
                const StepIcon = step.icon;

                return (
                  <React.Fragment key={step.id}>
                    <button
                      onClick={() => navigateStep(step.id)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover:scale-105 active:scale-95"
                      style={{
                        background: isActive
                          ? 'rgba(16, 185, 129, 0.12)'
                          : 'transparent',
                        border: isActive
                          ? '1px solid rgba(16, 185, 129, 0.3)'
                          : '1px solid transparent',
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          background: isComplete
                            ? 'linear-gradient(135deg, var(--emerald-glow), var(--emerald-deep))'
                            : isActive
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(255,255,255,0.04)',
                          boxShadow: isActive ? '0 0 20px rgba(16,185,129,0.15)' : 'none',
                        }}
                      >
                        {isComplete ? (
                          <CheckCircle size={18} style={{ color: '#fff' }} />
                        ) : (
                          <StepIcon
                            size={18}
                            style={{ color: isActive ? 'var(--emerald-glow)' : 'rgba(255,255,255,0.3)' }}
                          />
                        )}
                      </div>
                      <div className="hidden sm:block text-left">
                        <p
                          className="text-xs font-bold uppercase"
                          style={{ color: isActive ? 'var(--emerald-light)' : 'var(--text-secondary)' }}
                        >
                          {step.label}
                        </p>
                        <p className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          {progress}%
                        </p>
                      </div>
                    </button>

                    {idx < STEPS.length - 1 && (
                      <div className={`step-connector ${isComplete ? 'step-connector-active' : ''}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Global progress bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${totalProgress}%`,
                    background: 'linear-gradient(90deg, var(--emerald-deep), var(--emerald-glow), var(--emerald-light))',
                    boxShadow: '0 0 12px rgba(16,185,129,0.4)',
                  }}
                />
              </div>
              <span className="text-sm font-black" style={{ color: 'var(--emerald-glow)' }}>
                {totalProgress}%
              </span>
            </div>
          </div>
        </div>

        {/* ── VALIDATION ERRORS ── */}
        {validationErrors.length > 0 && (
          <div className="mb-6 rounded-2xl p-5 border" style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.25)' }}>
            <div className="flex items-center gap-2 mb-3" style={{ color: '#f87171' }}>
              <AlertCircle size={16} />
              <h3 className="text-xs font-black uppercase">Champs requis</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {validationErrors.map((err, i) => (
                <p key={i} className="text-xs flex items-center gap-2" style={{ color: '#fca5a5' }}>
                  <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#f87171' }} />
                  {err}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* FORM + ACTIONS LAYOUT                  */}
        {/* ═══════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-24">
          {/* ── LEFT: FORM SECTION ── */}
          <div className="lg:col-span-8">
            <div
              className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
            >
              {/* ═══════════════════════════════════ */}
              {/* SECTION ENTREPRISE                 */}
              {/* ═══════════════════════════════════ */}
              {currentStep === 'company' && (
                <div className="eco-glass rounded-2xl p-6 shutter-enter">
                  {/* Section Header */}
                  <div className="flex items-center gap-3 pb-5 mb-6" style={{ borderBottom: '1px solid var(--border-dim)' }}>
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
                      }}
                    >
                      <Building size={20} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black uppercase" style={{ color: 'var(--emerald-light)' }}>
                        Entreprise
                      </h2>
                      <p className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        Informations légales de la société
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {/* Logo & Description */}
                    <div
                      className="rounded-xl p-5 border"
                      style={{ background: 'rgba(16,185,129,0.03)', borderColor: 'rgba(16,185,129,0.12)' }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--emerald-glow)' }}>
                        Identité Visuelle (Optionnel)
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold uppercase mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                            Logo
                          </label>
                          {data.compLogo ? (
                            <div className="relative group">
                              <div className="p-3 bg-white rounded-xl">
                                <img src={data.compLogo} alt="Logo" className="w-20 h-20 object-contain mx-auto" />
                              </div>
                              <button
                                onClick={() => updateData('compLogo', null)}
                                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <label
                              className="flex flex-col items-center justify-center h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-opacity-60"
                              style={{ borderColor: 'rgba(16,185,129,0.2)' }}
                            >
                              <Upload size={18} style={{ color: 'var(--emerald-glow)' }} className="mb-2" />
                              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                Charger
                              </span>
                              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                            </label>
                          )}
                        </div>
                        <EcoInput
                          label="Description"
                          value={data.compDescription}
                          onChange={(v) => updateData('compDescription', v)}
                          placeholder="Ex: Leader en solutions digitales..."
                          multiline
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <EcoInput label="Raison Sociale" value={data.compName} onChange={(v) => updateData('compName', v)} icon={<Building size={12} />} required />
                      <EcoInput label="Forme Juridique" value={data.compType} onChange={(v) => updateData('compType', v)} placeholder="SARL, SA..." icon={<ShieldCheck size={12} />} required />
                    </div>

                    {/* Capital social toggle */}
                    <div className="eco-glass rounded-xl p-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.showCapital}
                          onChange={(e) => updateData('showCapital', e.target.checked)}
                          className="w-4 h-4 rounded accent-emerald-500"
                        />
                        <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>
                          Mentionner le capital social
                        </span>
                      </label>
                      {data.showCapital && (
                        <div className="mt-3">
                          <EcoInput
                            label="Capital Social"
                            value={data.compCapital}
                            onChange={(v) => updateData('compCapital', v)}
                            placeholder={`1 000 000 ${config.currency}`}
                            icon={<DollarSign size={12} />}
                            required
                          />
                        </div>
                      )}
                    </div>

                    <EcoInput label="Siège Social" value={data.compAddr} onChange={(v) => updateData('compAddr', v)} icon={<MapPin size={12} />} required />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <EcoInput label="RCCM" value={data.compRCCM} onChange={(v) => updateData('compRCCM', v)} placeholder="BJ/BGM/2024/A/123" icon={<FileText size={12} />} required />
                      <EcoInput label={config.idLabel} value={data.compID} onChange={(v) => updateData('compID', v)} icon={<Shield size={12} />} required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <EcoInput label="Représentant Légal" value={data.bossName} onChange={(v) => updateData('bossName', v)} icon={<User size={12} />} required />
                      <EcoInput label="Fonction" value={data.bossTitle} onChange={(v) => updateData('bossTitle', v)} placeholder="Gérant..." icon={<Award size={12} />} required />
                    </div>
                  </div>

                  {/* Step Nav */}
                  <div className="flex justify-end mt-6 pt-5" style={{ borderTop: '1px solid var(--border-dim)' }}>
                    <button
                      onClick={goNextStep}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-black transition-all hover:scale-105 active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, var(--emerald-glow), var(--emerald-deep))',
                        boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
                      }}
                    >
                      <span>Collaborateur</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════ */}
              {/* SECTION COLLABORATEUR               */}
              {/* ═══════════════════════════════════ */}
              {currentStep === 'employee' && (
                <div className="eco-glass rounded-2xl p-6 shutter-enter">
                  <div className="flex items-center gap-3 pb-5 mb-6" style={{ borderBottom: '1px solid var(--border-dim)' }}>
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #34d399, #06b6d4)',
                        boxShadow: '0 4px 20px rgba(52,211,153,0.3)',
                      }}
                    >
                      <User size={20} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black uppercase" style={{ color: '#6ee7b7' }}>
                        Collaborateur
                      </h2>
                      <p className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        Données personnelles du salarié
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <EcoInput label="Nom Complet" value={data.empName} onChange={(v) => updateData('empName', v)} icon={<User size={12} />} required />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <EcoInput label="Date de Naissance" type="date" value={data.empBirth} onChange={(v) => updateData('empBirth', v)} icon={<Calendar size={12} />} required />
                      <EcoInput label="Lieu de Naissance" value={data.empBirthPlace} onChange={(v) => updateData('empBirthPlace', v)} icon={<MapPin size={12} />} required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <EcoInput label="Nationalité" value={data.empNation} onChange={(v) => updateData('empNation', v)} icon={<Globe size={12} />} required />
                      <div className="eco-glass rounded-xl p-4 flex items-center">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={data.isForeigner}
                            onChange={(e) => updateData('isForeigner', e.target.checked)}
                            className="w-4 h-4 rounded accent-emerald-500"
                          />
                          <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>
                            Travailleur étranger
                          </span>
                        </label>
                      </div>
                    </div>

                    {data.isForeigner && (
                      <div className="rounded-xl p-4 border" style={{ background: 'rgba(6,182,212,0.05)', borderColor: 'rgba(6,182,212,0.2)' }}>
                        <EcoInput label="Permis de Travail" value={data.empWorkPermit} onChange={(v) => updateData('empWorkPermit', v)} icon={<Shield size={12} />} required />
                      </div>
                    )}

                    <EcoInput label="Adresse" value={data.empAddr} onChange={(v) => updateData('empAddr', v)} icon={<MapPin size={12} />} required />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <EcoInput label="Pièce d'Identité" value={data.empID} onChange={(v) => updateData('empID', v)} icon={<FileText size={12} />} required />
                      <EcoInput label="Téléphone" type="tel" value={data.empPhone} onChange={(v) => updateData('empPhone', v)} icon={<User size={12} />} required />
                    </div>
                  </div>

                  <div className="flex justify-between mt-6 pt-5" style={{ borderTop: '1px solid var(--border-dim)' }}>
                    <button
                      onClick={goPrevStep}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs border transition-all hover:scale-105 active:scale-95"
                      style={{ borderColor: 'var(--border-dim)', color: 'var(--text-secondary)' }}
                    >
                      <ChevronLeft size={16} />
                      <span>Entreprise</span>
                    </button>
                    <button
                      onClick={goNextStep}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-black transition-all hover:scale-105 active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, var(--emerald-glow), var(--emerald-deep))',
                        boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
                      }}
                    >
                      <span>Contrat</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════ */}
              {/* SECTION CONTRAT                     */}
              {/* ═══════════════════════════════════ */}
              {currentStep === 'contract' && (
                <div className="eco-glass rounded-2xl p-6 shutter-enter">
                  <div className="flex items-center gap-3 pb-5 mb-6" style={{ borderBottom: '1px solid var(--border-dim)' }}>
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b, #10b981)',
                        boxShadow: '0 4px 20px rgba(245,158,11,0.2)',
                      }}
                    >
                      <Briefcase size={20} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black uppercase" style={{ color: '#fbbf24' }}>
                        Contrat
                      </h2>
                      <p className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        Conditions de travail
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {/* Type Contrat — Mini-Cards */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest mb-3 block" style={{ color: 'var(--emerald-glow)' }}>
                        Type de Contrat *
                      </label>
                      <div className="flex gap-3">
                        {(['CDI', 'CDD'] as const).map((jt) => (
                          <div
                            key={jt}
                            onClick={(e) => handleMiniCardClick(e, () => updateData('jobType', jt))}
                            className={`mini-card flex-1 p-4 rounded-xl border text-center cursor-pointer ${
                              data.jobType === jt ? 'mini-card-selected' : ''
                            }`}
                            style={{
                              background:
                                data.jobType === jt
                                  ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))'
                                  : 'rgba(0,0,0,0.25)',
                              borderColor: data.jobType === jt ? 'var(--emerald-glow)' : 'var(--border-dim)',
                            }}
                          >
                            <p
                              className="text-lg font-black"
                              style={{ color: data.jobType === jt ? 'var(--emerald-light)' : 'var(--text-secondary)' }}
                            >
                              {jt}
                            </p>
                            <p className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                              {jt === 'CDI' ? 'Durée indéterminée' : 'Durée déterminée'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <EcoInput label="Poste" value={data.jobTitle} onChange={(v) => updateData('jobTitle', v)} icon={<Briefcase size={12} />} required />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <EcoInput label="Département" value={data.jobDept} onChange={(v) => updateData('jobDept', v)} icon={<Building size={12} />} required />
                      <EcoInput label="Lieu de Travail" value={data.jobLocation} onChange={(v) => updateData('jobLocation', v)} icon={<MapPin size={12} />} required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <EcoInput label="Date de Début" type="date" value={data.startDate} onChange={(v) => updateData('startDate', v)} icon={<Calendar size={12} />} required />
                      {data.jobType === 'CDD' && (
                        <EcoInput label="Date de Fin" type="date" value={data.endDate} onChange={(v) => updateData('endDate', v)} icon={<Calendar size={12} />} required />
                      )}
                    </div>

                    {data.jobType === 'CDD' && (
                      <div className="rounded-xl p-4 border" style={{ background: 'rgba(245,158,11,0.04)', borderColor: 'rgba(245,158,11,0.15)' }}>
                        <EcoInput label="Motif du CDD" value={data.cddReason} onChange={(v) => updateData('cddReason', v)} icon={<FileText size={12} />} required multiline />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <EcoInput label={`Salaire (${config.currency})`} type="number" value={data.salary} onChange={(v) => updateData('salary', v)} icon={<DollarSign size={12} />} required />
                      <EcoInput label="Primes" value={data.bonus} onChange={(v) => updateData('bonus', v)} icon={<Award size={12} />} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <EcoInput label="Heures/Semaine" type="number" value={data.hours} onChange={(v) => updateData('hours', v)} icon={<Clock size={12} />} required />
                      <EcoInput label="Essai (mois)" type="number" value={data.trial} onChange={(v) => updateData('trial', v)} icon={<Calendar size={12} />} required />
                    </div>

                    {/* Non-concurrence */}
                    <div
                      className="rounded-xl p-5 border"
                      style={{ background: 'rgba(16,185,129,0.03)', borderColor: 'rgba(16,185,129,0.12)' }}
                    >
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.hasNonCompete}
                          onChange={(e) => updateData('hasNonCompete', e.target.checked)}
                          className="w-4 h-4 rounded accent-emerald-500"
                        />
                        <span className="text-xs font-bold uppercase" style={{ color: 'var(--emerald-light)' }}>
                          Clause de non-concurrence
                        </span>
                      </label>
                      {data.hasNonCompete && (
                        <div className="mt-3">
                          <EcoInput label="Durée" value={data.nonCompeteDuration} onChange={(v) => updateData('nonCompeteDuration', v)} icon={<Shield size={12} />} required />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between mt-6 pt-5" style={{ borderTop: '1px solid var(--border-dim)' }}>
                    <button
                      onClick={goPrevStep}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs border transition-all hover:scale-105 active:scale-95"
                      style={{ borderColor: 'var(--border-dim)', color: 'var(--text-secondary)' }}
                    >
                      <ChevronLeft size={16} />
                      <span>Collaborateur</span>
                    </button>
                    {/* Bouton Nouveau Contrat (Remplace Aperçu) */}
    <button
      onClick={handleNewContract}
      className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all border border-emerald-500/30 group"
    >
      <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
      <span className="font-bold tracking-wide uppercase">Nouveau</span>
    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════ */}
          {/* RIGHT: ACTIONS PANEL                    */}
          {/* ═══════════════════════════════════════ */}
          <div className="lg:col-span-4">
            <div className="eco-glass rounded-2xl p-5 lg:sticky lg:top-6 space-y-5">
              {/* Signatures */}
              {data.documentMode === 'ELECTRONIC' && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--emerald-glow)' }}>
                    <PenTool size={12} />
                    Signatures
                  </p>
                  <div className="space-y-2.5">
                    {(['employer', 'employee'] as const).map((signer) => {
                      const hasSig = !!signatures[signer];
                      return (
                        <button
                          key={signer}
                          onClick={() => openSignatureModal(signer)}
                          className="w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-between transition-all hover:scale-[1.02] active:scale-[0.98]"
                          style={{
                            background: hasSig
                              ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))'
                              : 'rgba(0,0,0,0.3)',
                            border: `1px solid ${hasSig ? 'var(--emerald-glow)' : 'var(--border-dim)'}`,
                            color: hasSig ? 'var(--emerald-light)' : 'var(--text-secondary)',
                          }}
                        >
                          <span className="flex items-center gap-2">
                            <PenTool size={14} />
                            {signer === 'employer' ? 'Employeur' : 'Salarié'}
                          </span>
                          {hasSig ? <CheckCircle size={14} /> : <ChevronRight size={14} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── SAVE BUTTON ── */}
              <div style={{ borderTop: '1px solid var(--border-dim)', paddingTop: '16px' }}>
                <button
                  onClick={saveContract}
                  disabled={isGenerating}
                  className="shimmer-btn w-full py-4 rounded-xl font-black uppercase text-sm flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                  style={{
                    color: '#000',
                    boxShadow: '0 4px 24px rgba(16,185,129,0.35)',
                  }}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      <span>Traitement...</span>
                    </>
                  ) : isSaved ? (
                    <>
                      <CheckCircle size={18} />
                      <span>Validé</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Enregistrer &amp; Valider</span>
                    </>
                  )}
                </button>
              </div>

              {/* ── POST-SAVE ACTIONS ── */}
              {showPostSaveActions && (
                <div className="space-y-2.5 shutter-enter">
                  <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: 'var(--emerald-glow)' }}>
                    <Hexagon size={10} />
                    Actions Finales
                  </p>

                  {/* PDF Download */}
                  <button
                    onClick={generatePDF}
                    disabled={isGenerating}
                    className="eco-action-btn w-full py-3 px-4 font-bold text-xs flex items-center gap-3"
                  >
                    <FileDown size={16} className="eco-action-icon" style={{ color: '#f87171' }} />
                    <span>Télécharger PDF</span>
                  </button>

                  {/* WORD Download */}
                  <button
                    onClick={generateWord}
                    disabled={isGenerating}
                    className="eco-action-btn w-full py-3 px-4 font-bold text-xs flex items-center gap-3"
                  >
                    <FileText size={16} className="eco-action-icon" style={{ color: '#60a5fa' }} />
                    <span>Télécharger Word (.docx)</span>
                  </button>

                  {/* Share */}
                  <button
                    onClick={shareContract}
                    className="eco-action-btn w-full py-3 px-4 font-bold text-xs flex items-center gap-3"
                    style={{ borderColor: 'rgba(16,185,129,0.25)' }}
                  >
                    <Share2 size={16} className="eco-action-icon" style={{ color: 'var(--emerald-light)' }} />
                    <span>Partager</span>
                  </button>
                </div>
              )}

              {/* Aperçu toggle */}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="eco-action-btn w-full py-3 px-4 font-bold text-xs flex items-center justify-center gap-2"
              >
                {showPreview ? <EyeOff size={14} className="eco-action-icon" /> : <Eye size={14} className="eco-action-icon" />}
                <span>{showPreview ? 'Fermer Aperçu' : 'Aperçu du Contrat'}</span>
              </button>

              {/* Récapitulatif */}
              <div
                className="rounded-xl p-4 border"
                style={{ background: 'rgba(16,185,129,0.03)', borderColor: 'rgba(16,185,129,0.12)' }}
              >
                <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--emerald-glow)' }}>
                  <Scale size={13} />
                  <span className="text-[10px] font-black uppercase">Récapitulatif</span>
                </div>
                <div className="space-y-2">
                  <SummaryRow label="Pays" value={config.name} />
                  <SummaryRow label="Devise" value={config.currency} />
                  <SummaryRow label="Type" value={data.jobType} />
                  <SummaryRow label="Mode" value={data.documentMode === 'ELECTRONIC' ? 'E-Sign' : 'Print'} />
                  {data.empName && <SummaryRow label="Salarié" value={data.empName} />}
                  {data.salary && <SummaryRow label="Salaire" value={`${data.salary} ${config.currency}`} />}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 rounded-xl p-3" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
                <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(251,191,36,0.8)' }}>
                  Document automatique — Ne remplace pas un conseil juridique
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* MODAL SIGNATURE                         */}
      {/* ═══════════════════════════════════════ */}
      {showSignatureModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
        >
          <div className="eco-glass rounded-2xl p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-black uppercase flex items-center gap-2" style={{ color: 'var(--emerald-light)' }}>
                <PenTool size={22} />
                Signature {currentSigner === 'employer' ? 'Employeur' : 'Salarié'}
              </h3>
              <button
                onClick={() => { setShowSignatureModal(false); setCurrentSigner(null); }}
                className="p-2 rounded-xl border transition-all hover:scale-105"
                style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#f87171', background: 'rgba(239,68,68,0.08)' }}
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs mb-4 px-3 py-2 rounded-xl" style={{ color: 'var(--text-secondary)', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' }}>
              Signez dans l'espace ci-dessous. Le canvas est verrouillé contre le défilement.
            </p>

            {/* ── Signature Canvas ── */}
            <div className="sig-canvas-wrapper bg-white rounded-xl p-3 mb-5 relative" style={{ touchAction: 'none' }}>
              <canvas
                ref={signatureCanvasRef}
                width={700}
                height={280}
                onMouseDown={handleSigStart}
                onMouseMove={handleSigMove}
                onMouseUp={handleSigEnd}
                onMouseLeave={handleSigEnd}
                onTouchStart={handleSigStart}
                onTouchMove={handleSigMove}
                onTouchEnd={handleSigEnd}
                className="w-full rounded-lg cursor-crosshair"
                style={{
                  touchAction: 'none',
                  border: '2px dashed #d1d5db',
                }}
              />
              <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-gray-400 text-[10px] font-bold pointer-events-none">
                Signez ici
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={clearSignature}
                className="flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all hover:scale-[1.02]"
                style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#fca5a5', background: 'rgba(239,68,68,0.06)' }}
              >
                <Trash2 size={14} />
                Effacer
              </button>
              <button
                onClick={saveSignature}
                className="flex-1 py-3 rounded-xl font-bold text-xs text-black flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, var(--emerald-glow), var(--emerald-deep))',
                  boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
                }}
              >
                <Save size={14} />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* MODAL ARCHIVES                          */}
      {/* ═══════════════════════════════════════ */}
      {showArchives && (
        <div
          className="fixed inset-0 z-[9999] overflow-y-auto p-4 eco-scroll"
          style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(12px)' }}
        >
          <div className="max-w-5xl mx-auto my-8">
            <div className="eco-glass rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black uppercase flex items-center gap-3" style={{ color: 'var(--emerald-light)' }}>
                  <Archive size={24} />
                  Archives
                </h2>
                <button
                  onClick={() => setShowArchives(false)}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs border transition-all hover:scale-105"
                  style={{ borderColor: 'var(--border-dim)', color: 'var(--text-secondary)' }}
                >
                  <X size={14} />
                  Fermer
                </button>
              </div>

              {savedContracts.length === 0 ? (
                <div className="text-center py-20">
                  <Archive size={50} className="mx-auto mb-4" style={{ color: 'rgba(16,185,129,0.2)' }} />
                  <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
                    Aucun contrat enregistré
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedContracts.filter((c) => c.signed).map((contract) => (
                    <div
                      key={contract.id}
                      className="eco-glass rounded-xl p-4 transition-all hover:scale-[1.03]"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-black text-sm" style={{ color: 'var(--emerald-light)' }}>
                            {contract.employeeName}
                          </h3>
                          <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                            {contract.jobTitle}
                          </p>
                        </div>
                        <span
                          className="text-[10px] px-2 py-1 rounded-lg font-bold"
                          style={{
                            background:
                              contract.mode === 'ELECTRONIC'
                                ? 'rgba(16,185,129,0.12)'
                                : 'rgba(245,158,11,0.12)',
                            color:
                              contract.mode === 'ELECTRONIC' ? 'var(--emerald-light)' : '#fbbf24',
                          }}
                        >
                          {contract.mode === 'ELECTRONIC' ? 'E-Sign' : 'Print'}
                        </span>
                      </div>

                      <div className="text-xs space-y-1.5 pt-3 mb-3" style={{ borderTop: '1px solid var(--border-dim)', color: 'var(--text-secondary)' }}>
                        <div className="flex justify-between">
                          <span>Type</span>
                          <span className="font-bold" style={{ color: 'var(--emerald-light)' }}>{contract.contractType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Date</span>
                          <span className="font-bold" style={{ color: 'var(--emerald-light)' }}>
                            {new Date(contract.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        {contract.signed && (
                          <div className="flex items-center gap-1.5 font-bold pt-1" style={{ color: 'var(--emerald-glow)' }}>
                            <CheckCircle size={12} />
                            Signé
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => loadContract(contract)}
                          className="flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all hover:scale-[1.02]"
                          style={{ borderColor: 'rgba(16,185,129,0.2)', color: 'var(--emerald-light)', background: 'rgba(16,185,129,0.06)' }}
                        >
                          <Upload size={12} />
                          Charger
                        </button>
                        <button
                          onClick={() => deleteContract(contract.id)}
                          className="p-2 rounded-lg border transition-all hover:scale-[1.02]"
                          style={{ borderColor: 'rgba(239,68,68,0.2)', color: '#fca5a5', background: 'rgba(239,68,68,0.06)' }}
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
      )}

      {/* ═══════════════════════════════════════ */}
      {/* MODAL PREVIEW                           */}
      {/* ═══════════════════════════════════════ */}
      {showPreview && (
        <div
          className="fixed inset-0 z-[9998] overflow-y-auto eco-scroll"
          style={{ background: 'rgba(0,0,0,0.95)' }}
        >
          {/* Close bar */}
          <div className="sticky top-0 z-10 flex justify-end p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <button
              onClick={() => setShowPreview(false)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-xs border transition-all hover:scale-105"
              style={{ borderColor: 'var(--border-dim)', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.5)' }}
            >
              <X size={14} />
              Fermer l'aperçu
            </button>
          </div>

          <div className="flex justify-center px-4 pb-12">
            <div
              ref={contractRef}
              className="bg-white text-black shadow-2xl"
              style={{
                width: '210mm',
                minHeight: '297mm',
                padding: '16mm',
                fontFamily: "Georgia, 'Times New Roman', serif",
                lineHeight: 1.8,
                fontSize: '12px',
              }}
              dangerouslySetInnerHTML={{
                __html: generateContractHTML()
                  .replace(/<!DOCTYPE html>[\s\S]*?<body[^>]*>/, '')
                  .replace(/<\/body>[\s\S]*<\/html>/, ''),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FIN PARTIE 3 ───────────────────────────
// Collez la Partie 4 immédiatement après cette ligne
// ─────────────────────────────────────────────
// ============================================================================
// ECODREUM ENGINE L1 — Contract Architect
// app/rh/registre/contrat/page.tsx
// PARTIE 4/4 : Composants Réutilisables — EcoInput, SummaryRow
// ============================================================================
// ⚠️ Collez ce code IMMÉDIATEMENT après la fin de la Partie 3
// (après l'accolade fermante de la fonction ContractArchitectPage)

// ═══════════════════════════════════════════════
// COMPOSANT : EcoInput — Champ de saisie Luxe Tech
// ═══════════════════════════════════════════════

interface EcoInputProps {
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

function EcoInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '...',
  icon,
  required = false,
  disabled = false,
  multiline = false,
}: EcoInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
        style={{ color: 'var(--text-secondary)' }}
      >
        {icon && (
          <span style={{ color: 'var(--emerald-glow)' }}>{icon}</span>
        )}
        {label}
        {required && (
          <span style={{ color: '#f87171' }}>*</span>
        )}
      </label>

      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className="eco-input resize-none"
          style={{
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
          }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="eco-input"
          style={{
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// COMPOSANT : SummaryRow — Ligne de récapitulatif
// ═══════════════════════════════════════════════

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div
      className="flex justify-between items-center pb-2"
      style={{ borderBottom: '1px solid rgba(16, 185, 129, 0.08)' }}
    >
      <span
        className="text-[10px] font-bold uppercase"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </span>
      <span
        className="text-[11px] font-black text-right max-w-[60%] truncate"
        style={{ color: 'var(--emerald-light)' }}
      >
        {value}
      </span>
    </div>
  );
}

// ============================================================================
// FIN DU FICHIER — app/rh/registre/contrat/page.tsx
// ============================================================================
