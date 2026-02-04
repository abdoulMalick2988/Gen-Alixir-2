"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, Building, User, Briefcase, Download, Scale, 
  Save, CheckCircle, AlertTriangle, Globe, ShieldCheck,
  FileText, Eye, Calendar, MapPin, DollarSign, Clock,
  Award, Shield, AlertCircle, CheckSquare
} from 'lucide-react';
import { saveAs } from 'file-saver';

// --- INITIALISATION SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- TYPES ---
interface FormData {
  // Pays
  country: 'SENEGAL' | 'BURUNDI';
  
  // Entreprise
  compName: string;
  compType: string;
  compCapital: string;
  showCapital: boolean;
  compAddr: string;
  compRCCM: string;
  compID: string;
  bossName: string;
  bossTitle: string;
  
  // Salarié
  empName: string;
  empBirth: string;
  empBirthPlace: string;
  empNation: string;
  isForeigner: boolean;
  empWorkPermit: string;
  empAddr: string;
  empID: string;
  empPhone: string;
  
  // Contrat
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

// --- CONFIGURATION JURIDIQUE VERROUILLÉE ---
const COUNTRIES: Record<'SENEGAL' | 'BURUNDI', CountryConfig> = {
  SENEGAL: {
    name: "Sénégal",
    code: "Loi n° 97-17 du 1er décembre 1997 portant Code du Travail",
    court: "Tribunal du Travail de Dakar",
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
    court: "Tribunal du Travail de Bujumbura",
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

// --- TEMPLATES JURIDIQUES VERROUILLÉS ---
const CONTRACT_TEMPLATES = {
  getIntro: (data: FormData, config: CountryConfig) => {
    const capitalClause = data.showCapital && data.compCapital 
      ? `, au capital social de ${data.compCapital} ${config.currency}` 
      : '';
    
    return `ENTRE LES SOUSSIGNÉS :

La société ${data.compName}, ${data.compType}${capitalClause}, dont le siège social est situé à ${data.compAddr}, immatriculée au Registre de Commerce et du Crédit Mobilier (RCCM) sous le numéro ${data.compRCCM} et identifiée au ${config.idLabel} sous le numéro ${data.compID}, représentée par M./Mme ${data.bossName} en sa qualité de ${data.bossTitle}, dûment habilité(e) aux fins des présentes.

Ci-après dénommée « L'EMPLOYEUR »

D'UNE PART,

ET :

M./Mme ${data.empName}, né(e) le ${data.empBirth} à ${data.empBirthPlace}, de nationalité ${data.empNation}${data.isForeigner && data.empWorkPermit ? `, titulaire du permis de travail n°${data.empWorkPermit}` : ''}, titulaire de la pièce d'identité n°${data.empID}, demeurant à ${data.empAddr}, joignable au ${data.empPhone}.

Ci-après dénommé(e) « LE SALARIÉ »

D'AUTRE PART,

IL A ÉTÉ ARRÊTÉ ET CONVENU CE QUI SUIT :`;
  },

  getArticle1: (data: FormData, config: CountryConfig) => {
    return `ARTICLE 1 : OBJET ET CADRE LÉGAL

Le présent contrat est conclu sous le régime du ${config.code}.

${config.articles.intro}
${config.articles.engagement}

Le présent contrat définit les conditions d'engagement et d'emploi du Salarié au sein de la société ${data.compName}.`;
  },

  getArticle2: (data: FormData, config: CountryConfig) => {
    const cddClause = data.jobType === 'CDD' && data.cddReason 
      ? `\n\nLe présent contrat est conclu pour les besoins suivants : ${data.cddReason}.` 
      : '';

    return `ARTICLE 2 : NATURE ET FONCTIONS

Le Salarié est recruté en qualité de ${data.jobTitle} au sein du département ${data.jobDept}.

Le Salarié exercera ses fonctions au sein de l'établissement situé à ${data.jobLocation}.

Le type de contrat conclu est un contrat à durée ${data.jobType === 'CDI' ? 'indéterminée (CDI)' : 'déterminée (CDD)'}.${cddClause}

Le Salarié s'engage à exercer ses fonctions avec diligence, compétence et loyauté, conformément aux directives de l'Employeur et aux usages de la profession.`;
  },

  getArticle3: (data: FormData, config: CountryConfig) => {
    const bonusClause = data.bonus 
      ? `\n\nEn sus de cette rémunération de base, le Salarié pourra percevoir les primes et avantages suivants : ${data.bonus}.` 
      : '';

    return `ARTICLE 3 : RÉMUNÉRATION

En contrepartie de l'exécution de ses fonctions, le Salarié percevra une rémunération mensuelle brute de ${data.salary} ${config.currency}.

Cette rémunération est versée mensuellement par virement bancaire, sous réserve des retenues légales et conventionnelles applicables.${bonusClause}

${config.articles.workDuration} la durée hebdomadaire de travail est fixée à ${data.hours} heures.`;
  },

  getArticle4: (data: FormData, config: CountryConfig) => {
    const endDateClause = data.jobType === 'CDD' && data.endDate 
      ? ` et prendra fin le ${new Date(data.endDate).toLocaleDateString('fr-FR')}` 
      : '';

    return `ARTICLE 4 : DURÉE DU CONTRAT ET PÉRIODE D'ESSAI

Le présent contrat de travail prend effet à compter du ${new Date(data.startDate).toLocaleDateString('fr-FR')}${endDateClause}.

Une période d'essai de ${data.trial} mois est prévue. Durant cette période, chacune des parties peut mettre fin au contrat sans préavis ni indemnité, conformément aux dispositions légales en vigueur.

À l'issue de la période d'essai, si aucune des parties n'a manifesté sa volonté de rompre le contrat, celui-ci se poursuivra dans les conditions définies aux présentes.`;
  },

  getArticle5: (data: FormData, config: CountryConfig) => {
    const nonCompeteClause = data.hasNonCompete && data.nonCompeteDuration
      ? `

ARTICLE 6 : CLAUSE DE NON-CONCURRENCE

Le Salarié s'engage, pendant une durée de ${data.nonCompeteDuration} suivant la cessation du présent contrat, quelle qu'en soit la cause, à ne pas exercer, directement ou indirectement, une activité concurrente à celle de l'Employeur.

Cette obligation s'applique sur le territoire du ${config.name} et concerne toute activité similaire ou connexe à celle exercée au sein de la société ${data.compName}.

En contrepartie de cette clause, le Salarié percevra une indemnité compensatrice dont les modalités seront définies conformément aux dispositions légales applicables.`
      : '';

    return `ARTICLE 5 : OBLIGATIONS DES PARTIES

L'Employeur s'engage à :
- Fournir au Salarié un travail conforme à ses qualifications professionnelles
- Verser la rémunération convenue aux échéances prévues
- Respecter l'ensemble des dispositions légales et conventionnelles applicables
- Assurer la sécurité et la protection de la santé du Salarié

Le Salarié s'engage à :
- Exécuter personnellement les missions qui lui sont confiées
- Respecter les directives de l'Employeur et le règlement intérieur
- Observer une obligation de loyauté et de confidentialité
- Consacrer l'intégralité de son activité professionnelle à l'Employeur${nonCompeteClause}`;
  },

  getArticle6: (data: FormData, config: CountryConfig) => {
    return `ARTICLE ${data.hasNonCompete ? '7' : '6'} : SUSPENSION ET RUPTURE DU CONTRAT

${config.articles.termination}

La suspension du contrat de travail pourra intervenir dans les cas prévus par la loi (maladie, maternité, accident du travail, etc.).

La rupture du contrat de travail, quelle qu'en soit la cause, devra respecter les dispositions légales en vigueur relatives au préavis, aux indemnités et aux formalités applicables.

En cas de rupture du contrat, le Salarié restituera immédiatement à l'Employeur l'ensemble des documents, matériels et équipements mis à sa disposition.`;
  },

  getArticle7: (data: FormData, config: CountryConfig) => {
    return `ARTICLE ${data.hasNonCompete ? '8' : '7'} : LITIGES

En cas de différend relatif à l'interprétation ou à l'exécution du présent contrat, les parties s'efforceront de trouver une solution amiable.

À défaut d'accord amiable, tout litige relèvera de la compétence exclusive du ${config.court}, conformément aux dispositions légales applicables en matière de contentieux du travail.`;
  },

  getFooter: (data: FormData, config: CountryConfig) => {
    const city = data.compAddr.split(',')[0].trim();
    const date = new Date().toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });

    return `

Fait à ${city}, le ${date}

En deux exemplaires originaux, dont un remis au Salarié.


L'EMPLOYEUR                                    LE SALARIÉ
(Signature et cachet)                          (Lu et approuvé, signature)



M./Mme ${data.bossName}                                    M./Mme ${data.empName}
${data.bossTitle}                              ${data.jobTitle}


─────────────────────────────────────────────────────────────────────
Document généré via la plateforme ECODREUM Intelligence
Ce document ne se substitue pas à un conseil juridique personnalisé
─────────────────────────────────────────────────────────────────────`;
  }
};

export default function GenerateurContratFinal() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'company' | 'employee' | 'contract'>('company');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [notif, setNotif] = useState<{ m: string; t: 's' | 'e' | 'w' } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [data, setData] = useState<FormData>({
    country: 'BURUNDI',
    compName: 'ECODREUM',
    compType: 'SARL',
    compCapital: '',
    showCapital: false,
    compAddr: 'Bujumbura, Rohero 1',
    compRCCM: '',
    compID: '',
    bossName: '',
    bossTitle: 'Gérant',
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

  // --- VALIDATION ---
  const validateForm = (): boolean => {
    const errors: string[] = [];

    // Entreprise
    if (!data.compName.trim()) errors.push("Raison sociale requise");
    if (!data.compRCCM.trim()) errors.push("Numéro RCCM requis");
    if (!data.compID.trim()) errors.push(`${config.idLabel} requis`);
    if (!data.bossName.trim()) errors.push("Nom du représentant requis");
    if (!data.compAddr.trim()) errors.push("Adresse entreprise requise");

    // Capital social si coché
    if (data.showCapital && !data.compCapital.trim()) {
      errors.push("Capital social requis (ou décochez l'option)");
    }

    // Salarié
    if (!data.empName.trim()) errors.push("Nom du salarié requis");
    if (!data.empBirth.trim()) errors.push("Date de naissance requise");
    if (!data.empBirthPlace.trim()) errors.push("Lieu de naissance requis");
    if (!data.empID.trim()) errors.push("Numéro d'identification requis");
    if (!data.empAddr.trim()) errors.push("Adresse du salarié requise");
    if (!data.empPhone.trim()) errors.push("Téléphone requis");

    // Permis de travail si étranger
    if (data.isForeigner && !data.empWorkPermit.trim()) {
      errors.push("Numéro de permis de travail requis pour les étrangers");
    }

    // Contrat
    if (!data.jobTitle.trim()) errors.push("Poste requis");
    if (!data.jobLocation.trim()) errors.push("Lieu de travail requis");
    if (!data.salary.trim() || parseFloat(data.salary) <= 0) {
      errors.push("Salaire valide requis");
    }
    if (!data.startDate) errors.push("Date de début requise");

    // CDD spécifique
    if (data.jobType === 'CDD') {
      if (!data.endDate) errors.push("Date de fin requise pour un CDD");
      if (!data.cddReason.trim()) errors.push("Motif du CDD requis");
    }

    // Non-concurrence
    if (data.hasNonCompete && !data.nonCompeteDuration.trim()) {
      errors.push("Durée de non-concurrence requise");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // --- GÉNÉRATION DU CONTRAT (TEXTE COMPLET) ---
  const generateContractText = (): string => {
    const template = CONTRACT_TEMPLATES;
    
    let contract = `
╔════════════════════════════════════════════════════════════════════╗
║                      CONTRAT DE TRAVAIL                            ║
║                   RÉGIME : ${data.jobType}                                    ║
╚════════════════════════════════════════════════════════════════════╝


${template.getIntro(data, config)}


${template.getArticle1(data, config)}


${template.getArticle2(data, config)}


${template.getArticle3(data, config)}


${template.getArticle4(data, config)}


${template.getArticle5(data, config)}


${template.getArticle6(data, config)}


${template.getArticle7(data, config)}


${template.getFooter(data, config)}
`;

    return contract;
  };

  // --- EXPORT WORD (DOCX) ---
  const generateWord = async () => {
    if (!validateForm()) {
      showNotif("Veuillez corriger les erreurs", "e");
      return;
    }

    setIsGenerating(true);
    try {
      // Installation de docx si nécessaire
      await fetch('/api/install-docx', { method: 'POST' }).catch(() => {});

      const contractText = generateContractText();
      const blob = new Blob([contractText], { type: 'text/plain' });
      saveAs(blob, `CONTRAT_${data.empName.replace(/\s/g, '_')}_${Date.now()}.txt`);
      
      showNotif("Document généré avec succès !", "s");
      await saveToCloud();
    } catch (e) {
      console.error(e);
      showNotif("Erreur lors de la génération", "e");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- EXPORT PDF ---
  const generatePDF = async () => {
    if (!validateForm()) {
      showNotif("Veuillez corriger les erreurs", "e");
      return;
    }

    setIsGenerating(true);
    try {
      const contractText = generateContractText();
      
      // Pour l'instant, export en TXT (le PDF nécessite une config serveur)
      const blob = new Blob([contractText], { type: 'text/plain' });
      saveAs(blob, `CONTRAT_${data.empName.replace(/\s/g, '_')}_${Date.now()}.txt`);
      
      showNotif("Document généré ! (PDF en développement)", "w");
      await saveToCloud();
    } catch (e) {
      console.error(e);
      showNotif("Erreur lors de la génération", "e");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- SAUVEGARDE CLOUD ---
  const saveToCloud = async () => {
    try {
      const { error } = await supabase.from('hr_contracts').insert([{
        employee_name: data.empName,
        job_title: data.jobTitle,
        country: data.country,
        contract_type: data.jobType,
        salary: data.salary,
        start_date: data.startDate,
        company_name: data.compName,
        created_at: new Date().toISOString()
      }]);
      
      if (error) throw error;
    } catch (e) {
      console.log("Archivage cloud non disponible");
    }
  };

  // --- NOTIFICATIONS ---
  const showNotif = (m: string, t: 's' | 'e' | 'w') => {
    setNotif({ m, t });
    setTimeout(() => setNotif(null), 4000);
  };

  // --- GESTION DES CHAMPS ---
  const updateData = (field: keyof FormData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    setValidationErrors([]); // Réinitialiser les erreurs lors de la modification
  };

  // --- PROGRESSION DU FORMULAIRE ---
  const getProgress = (): number => {
    const totalFields = 25;
    let filledFields = 0;

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'showCapital' || key === 'isForeigner' || key === 'hasNonCompete') return;
      if (value && value !== '0' && value !== '') filledFields++;
    });

    return Math.round((filledFields / totalFields) * 100);
  };

  return (
    <div className="fixed inset-0 bg-[#050505] text-white overflow-y-auto selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* NOTIFICATIONS */}
        {notif && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-in slide-in-from-top duration-300 ${
            notif.t === 's' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 
            notif.t === 'w' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
            'bg-red-500/10 border-red-500/30 text-red-400'
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
              <h1 className="text-3xl font-black italic uppercase tracking-tighter">
                LEGAL <span className="text-emerald-500">ARCHITECT</span>
              </h1>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                Générateur de Contrats • ECODREUM v3.1.0
              </p>
            </div>
          </div>

          {/* SÉLECTION PAYS */}
          <div className="flex flex-col gap-2">
            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-2">
              <Globe size={12} className="inline mr-1" />
              Juridiction
            </label>
            <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-white/10">
              {(['SENEGAL', 'BURUNDI'] as const).map((c) => (
                <button 
                  key={c} 
                  onClick={() => updateData('country', c)}
                  className={`px-8 py-3 rounded-xl text-[10px] font-black transition-all ${
                    data.country === c 
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                      : 'text-zinc-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BARRE DE PROGRESSION */}
        <div className="mb-8 bg-zinc-900/30 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Progression du formulaire
            </span>
            <span className="text-sm font-black text-emerald-500">{getProgress()}%</span>
          </div>
          <div className="h-2 bg-black/40 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>

        {/* ERREURS DE VALIDATION */}
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
            { id: 'company', label: 'Entreprise', icon: Building },
            { id: 'employee', label: 'Salarié', icon: User },
            { id: 'contract', label: 'Contrat', icon: Briefcase }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase whitespace-nowrap transition-all ${
                activeSection === id
                  ? 'bg-emerald-500 text-black shadow-lg'
                  : 'bg-zinc-900/50 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
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
              <div className="bg-zinc-900/30 border border-white/10 p-8 rounded-[2.5rem] space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 text-emerald-500 mb-4">
                  <Building size={20} />
                  <h2 className="text-sm font-black uppercase tracking-wider">Structure Employeuse</h2>
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

                {/* Capital Social avec Checkbox */}
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
              <div className="bg-zinc-900/30 border border-white/10 p-8 rounded-[2.5rem] space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 text-blue-400 mb-4">
                  <User size={20} />
                  <h2 className="text-sm font-black uppercase tracking-wider">Informations Salarié</h2>
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

                {/* Nationalité + Checkbox Étranger */}
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

                  {/* Permis de travail (conditionnel) */}
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
              </div>
            )}

            {/* SECTION CONTRAT */}
            {activeSection === 'contract' && (
              <div className="bg-zinc-900/30 border border-white/10 p-8 rounded-[2.5rem] space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 text-amber-500 mb-4">
                  <Briefcase size={20} />
                  <h2 className="text-sm font-black uppercase tracking-wider">Conditions de Travail</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 tracking-wider">
                      Type de Contrat *
                    </label>
                    <select
                      value={data.jobType}
                      onChange={(e) => updateData('jobType', e.target.value as 'CDI' | 'CDD')}
                      className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-amber-500 focus:bg-amber-500/5 transition-all appearance-none cursor-pointer"
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

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                {/* Motif CDD */}
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

                {/* Rémunération */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                {/* Temps de travail */}
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

                {/* Clause de non-concurrence */}
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
              </div>
            )}
          </div>

          {/* PANNEAU DE DROITE - ACTIONS */}
          <div className="lg:col-span-4">
            <div className="bg-zinc-900 border border-white/10 p-8 rounded-[3rem] sticky top-8 space-y-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle size={20} className="text-emerald-500" />
                <h3 className="text-xl font-black italic uppercase">Validation</h3>
              </div>

              {/* Boutons d'export */}
              <div className="space-y-3">
                <button
                  onClick={generateWord}
                  disabled={isGenerating}
                  className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 transition-all active:scale-95 group shadow-lg shadow-emerald-500/20"
                >
                  {isGenerating ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <Download size={20} className="group-hover:animate-bounce" />
                  )}
                  Générer Word
                </button>

                <button
                  onClick={generatePDF}
                  disabled={isGenerating}
                  className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  {isGenerating ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <Download size={20} />
                  )}
                  Générer PDF
                </button>

                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full py-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 transition-all"
                >
                  <Eye size={18} />
                  {showPreview ? 'Masquer' : 'Aperçu'}
                </button>
              </div>

              {/* Récapitulatif légal */}
              <div className="mt-8 p-6 bg-black/40 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-zinc-500 mb-3">
                  <Scale size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Récapitulatif Légal
                  </span>
                </div>

                <div className="space-y-3">
                  <InfoRow label="Pays" value={config.name} />
                  <InfoRow label="Juridiction" value={config.court} />
                  <InfoRow label="Code du travail" value={config.code.substring(0, 30) + '...'} />
                  <InfoRow label="Devise" value={config.currency} />
                  <InfoRow label="Type contrat" value={data.jobType} />
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[9px] text-amber-400/80 leading-relaxed">
                    Ce document est généré automatiquement et ne se substitue pas à un conseil juridique personnalisé.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRÉVISUALISATION */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white text-black p-12 rounded-3xl shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black">APERÇU DU CONTRAT</h2>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 transition-all"
                  >
                    Fermer
                  </button>
                </div>
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
                  {generateContractText()}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- COMPOSANTS RÉUTILISABLES ---

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
}

function InputField({ 
  label, 
  value, 
  onChange, 
  type = "text", 
  placeholder = "...",
  icon,
  required = false,
  disabled = false
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1 tracking-wider">
        {icon && <span className="inline-block mr-1">{icon}</span>}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500 focus:bg-emerald-500/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-white/5 pb-2">
      <span className="text-[9px] text-zinc-600 font-bold uppercase">{label}</span>
      <span className="text-[9px] text-emerald-500 font-bold text-right">{value}</span>
    </div>
  );
}
