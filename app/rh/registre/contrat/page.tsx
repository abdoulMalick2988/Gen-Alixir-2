"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Building, User, Briefcase, Globe, Scale, 
  ShieldAlert, Download, FileText, CheckCircle, AlertTriangle,
  Fingerprint, Coins, Calendar, MapPin
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { 
  Packer, Document, Paragraph, TextRun, AlignmentType, 
  HeadingLevel, Header, Footer, PageNumber, NumberFormat 
} from 'docx';

// --- CONFIGURATION JURIDIQUE ALPHA-1 (VERROUILLÉE) ---
// Ces données sont injectées dynamiquement selon le pays choisi
const LEGAL_CONFIG = {
  SENEGAL: {
    label: "Sénégal",
    codeLabel: "Code du Travail Sénégalais",
    ref: "Loi n° 97-17 du 1er décembre 1997",
    jurisdiction: "Tribunal du Travail de Dakar",
    idLabel: "NINEA",
    articles: "Articles L.23 à L.37 et L.44",
  },
  BURUNDI: {
    label: "Burundi",
    codeLabel: "Code du Travail du Burundi",
    ref: "Loi n° 1/11 du 24 novembre 2020",
    jurisdiction: "Tribunal du Travail de Bujumbura",
    idLabel: "NIF",
    articles: "Articles 34 à 60 et 85",
  }
};

export default function GenerateurContratLegalPro() {
  const router = useRouter();
  const [country, setCountry] = useState<'SENEGAL' | 'BURUNDI'>('SENEGAL');
  
  // State unique pour tout le formulaire
  const [formData, setFormData] = useState({
    // Entreprise
    companyName: '', companyType: 'SARL', address: '', 
    rccm: '', idLegal: '', repName: '', repPost: '',
    hasCapital: false, capitalAmount: '',
    // Salarié
    empName: '', empBirth: '', empNation: 'Sénégalaise', 
    empAddress: '', empID: '', isForeigner: false, workPermit: '',
    // Contrat
    type: 'CDI', post: '', salary: '', joinDate: '', 
    endDate: '', cddReason: '', workTime: '40', trialPeriod: '1',
    hasNonCompete: false, nonCompeteDuration: '12', 
    hasBonus: false, bonusDetail: ''
  });

  const activeLegal = LEGAL_CONFIG[country];

  // --- MOTEUR DE GÉNÉRATION WORD (.DOCX) ---
  const generateDocument = async () => {
    const doc = new Document({
      sections: [{
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "CONFIDENTIEL - RESSOURCES HUMAINES", color: "888888", size: 16, bold: true })
                ],
                alignment: AlignmentType.RIGHT
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              // --- Remplace le paragraphe de la ligne 77 à 84 par celui-ci ---
new Paragraph({
  children: [
    new TextRun({ text: `Document généré via ECODREUM Intelligence Engine - Page `, size: 16 }),
    new TextRun({
      children: [PageNumber.CURRENT], // Correction ici : On utilise la propriété statique
      size: 16
    }),
  ],
  alignment: AlignmentType.CENTER
}),
              new Paragraph({
                children: [new TextRun({ text: "Ce document est une base juridique et ne remplace pas l'avis d'un avocat.", size: 14, italics: true })],
                alignment: AlignmentType.CENTER
              })
            ]
          })
        },
        children: [
          // TITRE
          new Paragraph({
            children: [new TextRun({ text: "CONTRAT DE TRAVAIL", bold: true, size: 40, underline: {} })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          new Paragraph({
            children: [new TextRun({ text: `RÉGIME : CONTRAT À DURÉE ${formData.type === 'CDI' ? 'INDÉTERMINÉE' : 'DÉTERMINÉE'}`, bold: true, size: 24 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 }
          }),

          // PARTIES
          new Paragraph({ children: [new TextRun({ text: "ENTRE LES SOUSSIGNÉS :", bold: true })] }),
          new Paragraph({
            text: `L'entreprise ${formData.companyName}, ${formData.companyType} ${formData.hasCapital ? `au capital de ${formData.capitalAmount} F` : ''}, sise à ${formData.address}, immatriculée au RCCM sous le n° ${formData.rccm} et au ${activeLegal.idLabel} n° ${formData.idLegal}, représentée par M./Mme ${formData.repName} en sa qualité de ${formData.repPost}.`,
            spacing: { after: 200 }
          }),
          new Paragraph({ children: [new TextRun({ text: "Ci-après désignée « L'Employeur »", italics: true })], spacing: { after: 300 } }),

          new Paragraph({ children: [new TextRun({ text: "ET :", bold: true })] }),
          new Paragraph({
            text: `M./Mme ${formData.empName}, né(e) le ${formData.empBirth}, de nationalité ${formData.empNation}, demeurant à ${formData.empAddress}, titulaire de la pièce d'identité n° ${formData.empID} ${formData.isForeigner ? `et du Permis de Travail n° ${formData.workPermit}` : ''}.`,
            spacing: { after: 200 }
          }),
          new Paragraph({ children: [new TextRun({ text: "Ci-après désigné(e) « Le Salarié »", italics: true })], spacing: { after: 600 } }),

          // ARTICLES
          ...createArticle("ARTICLE 1 : CADRE LÉGAL", `Le présent contrat est conclu en conformité avec les dispositions du ${activeLegal.codeLabel} (${activeLegal.ref}), notamment les ${activeLegal.articles}.`),
          
          ...createArticle("ARTICLE 2 : NATURE ET DURÉE", `Le présent contrat est un ${formData.type}. Il prendra effet le ${formData.joinDate}. ${formData.type === 'CDD' ? `Il prendra fin le ${formData.endDate} pour le motif suivant : ${formData.cddReason}.` : ''}`),
          
          ...createArticle("ARTICLE 3 : PÉRIODE D'ESSAI", `Le contrat ne deviendra définitif qu'à l'issue d'une période d'essai de ${formData.trialPeriod} mois, durant laquelle chaque partie pourra rompre sans préavis ni indemnité.`),
          
          ...createArticle("ARTICLE 4 : FONCTIONS", `Le Salarié est engagé en qualité de ${formData.post}. Il exercera ses fonctions à ${formData.address} ou tout autre lieu nécessaire à l'activité de l'entreprise.`),

          ...createArticle("ARTICLE 5 : RÉMUNÉRATION", `En contrepartie, le Salarié percevra un salaire mensuel brut de ${formData.salary} F CFA. ${formData.hasBonus ? `S'y ajoute la prime suivante : ${formData.bonusDetail}.` : ''}`),

          ...(formData.hasNonCompete ? createArticle("ARTICLE 6 : NON-CONCURRENCE", `Compte tenu de ses fonctions, le Salarié s'interdit d'exercer une activité concurrente pendant ${formData.nonCompeteDuration} mois après la rupture, dans un rayon lié aux activités de l'Employeur.`) : []),

          ...createArticle("ARTICLE FINAL : LITIGES", `Tout différend relatif à la validité ou l'exécution du présent contrat, faute d'accord amiable, sera porté devant le ${activeLegal.jurisdiction}.`),

          // SIGNATURES
          new Paragraph({
            children: [new TextRun({ text: `\n\nFait à ______________, le ${new Date().toLocaleDateString()}`, italics: true })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 800 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "L'Employeur (Signature & Cachet)                     Le Salarié (Signature précédée de 'Lu et approuvé')" })
            ],
            spacing: { before: 400 }
          })
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Contrat_${formData.empName.replace(/\s+/g, '_')}.docx`);
  };

  // Helper pour créer des blocs d'articles Word
  function createArticle(title: string, content: string) {
    return [
      new Paragraph({ children: [new TextRun({ text: title, bold: true })], spacing: { before: 200 } }),
      new Paragraph({ text: content, spacing: { after: 200 } })
    ];
  }

  return (
   <div className="w-full min-h-screen bg-[#020202] text-white font-sans p-4 md:p-8 overflow-y-auto overflow-x-hidden">
      {/* HEADER DE LA PAGE */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <button onClick={() => router.back()} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Legal <span className="text-emerald-500">Architect</span></h1>
          <p className="text-[10px] font-black text-zinc-500 tracking-[0.4em] uppercase">Générateur de Contrat Professionnel</p>
        </div>
        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
          <Scale className="text-emerald-500" size={24} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
        
        {/* COLONNE GAUCHE : FORMULAIRE */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* SÉLECTEUR DE JURIDICTION */}
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem]">
            <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-4 block">1. Choisir la Juridiction</label>
            <div className="grid grid-cols-2 gap-4">
              {['SENEGAL', 'BURUNDI'].map((p) => (
                <button 
                  key={p}
                  onClick={() => setCountry(p as any)}
                  className={`py-4 rounded-2xl font-black uppercase text-xs transition-all border ${country === p ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION : EMPLOYEUR */}
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <Building className="text-emerald-500" />
              <h2 className="text-xl font-black italic uppercase">L'Entreprise</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Nom de la société" className="col-span-2 bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-emerald-500" 
                onChange={e => setFormData({...formData, companyName: e.target.value})} />
              <input placeholder={`Numéro ${activeLegal.idLabel}`} className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none" 
                onChange={e => setFormData({...formData, idLegal: e.target.value})} />
              <input placeholder="RCCM" className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none" 
                onChange={e => setFormData({...formData, rccm: e.target.value})} />
              
              <div className="col-span-2 flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <input type="checkbox" className="w-5 h-5 accent-emerald-500" onChange={e => setFormData({...formData, hasCapital: e.target.checked})} />
                <span className="text-xs font-bold uppercase text-zinc-400">Préciser le capital social</span>
                {formData.hasCapital && <input placeholder="Montant (ex: 1.000.000)" className="flex-1 bg-black/20 border-b border-white/20 outline-none text-xs" onChange={e => setFormData({...formData, capitalAmount: e.target.value})} />}
              </div>
            </div>
          </div>

          {/* SECTION : SALARIÉ + GESTION ÉTRANGER */}
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <User className="text-emerald-500" />
              <h2 className="text-xl font-black italic uppercase">Le Collaborateur</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Prénoms & Nom" className="col-span-2 bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-emerald-500" 
                onChange={e => setFormData({...formData, empName: e.target.value})} />
              <input placeholder="Date & Lieu de naissance" className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none" 
                onChange={e => setFormData({...formData, empBirth: e.target.value})} />
              <input placeholder="Nationalité" className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none" 
                onChange={e => setFormData({...formData, empNation: e.target.value})} />
              <input placeholder="N° Pièce d'identité" className="col-span-2 bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none" 
                onChange={e => setFormData({...formData, empID: e.target.value})} />
              
              {/* Toggle Étranger */}
              <div className="col-span-2 flex items-center justify-between p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-amber-500" />
                  <span className="text-xs font-bold uppercase text-amber-500">Salarié de nationalité étrangère ?</span>
                </div>
                <input type="checkbox" className="w-5 h-5 accent-amber-500" onChange={e => setFormData({...formData, isForeigner: e.target.checked})} />
              </div>

              {formData.isForeigner && (
                <div className="col-span-2 animate-in fade-in slide-in-from-top-2">
                  <input placeholder="Numéro du Permis de Travail (OBLIGATOIRE)" className="w-full bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm outline-none text-amber-200" 
                    onChange={e => setFormData({...formData, workPermit: e.target.value})} />
                </div>
              )}
            </div>
          </div>

          {/* SECTION : CONTRAT */}
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <Briefcase className="text-emerald-500" />
              <h2 className="text-xl font-black italic uppercase">Détails du Poste</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none" onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="CDI">Contrat à Durée Indéterminée (CDI)</option>
                <option value="CDD">Contrat à Durée Déterminée (CDD)</option>
              </select>
              <input placeholder="Poste exact" className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none" 
                onChange={e => setFormData({...formData, post: e.target.value})} />
              
              {formData.type === 'CDD' && (
                <input placeholder="Motif de recours au CDD (ex: Surcroît d'activité)" className="col-span-2 bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 text-sm outline-none" 
                  onChange={e => setFormData({...formData, cddReason: e.target.value})} />
              )}

              <input placeholder="Salaire Brut Mensuel (F CFA)" type="number" className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none" 
                onChange={e => setFormData({...formData, salary: e.target.value})} />
              <input placeholder="Date de prise d'effet" type="date" className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none text-zinc-500" 
                onChange={e => setFormData({...formData, joinDate: e.target.value})} />
            </div>
          </div>
        </div>

        {/* COLONNE DROITE : VALIDATION ET EXPORT */}
        <div className="lg:col-span-5 sticky top-8 h-fit space-y-6">
          <div className="bg-emerald-500/[0.03] border border-emerald-500/20 p-8 rounded-[3rem] relative overflow-hidden">
            <h3 className="text-2xl font-black italic uppercase mb-6 relative z-10">Moteur de Contrôle</h3>
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-4">
                <CheckCircle className="text-emerald-500" size={20} />
                <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">Base légale : {activeLegal.codeLabel}</p>
              </div>
              <div className="flex items-center gap-4">
                <CheckCircle className="text-emerald-500" size={20} />
                <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">Juridiction : {activeLegal.jurisdiction}</p>
              </div>
              
              {formData.isForeigner && !formData.workPermit && (
                <div className="flex items-center gap-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                  <ShieldAlert className="text-rose-500" size={20} />
                  <p className="text-[9px] text-rose-500 font-black uppercase tracking-widest">Alerte : Permis de travail obligatoire</p>
                </div>
              )}
            </div>

            <div className="mt-10 space-y-4 relative z-10">
              <button 
                onClick={generateDocument}
                disabled={!formData.companyName || !formData.empName}
                className="w-full bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-black py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20"
              >
                <Download size={20} /> Télécharger (.DOCX)
              </button>
              <button className="w-full bg-white/5 border border-white/10 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-zinc-400">
                <FileText size={20} /> Aperçu PDF (Coming Soon)
              </button>
            </div>

            {/* Décoration d'arrière plan */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -mr-32 -mt-32" />
          </div>

          <div className="p-8 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] opacity-60">
            <div className="flex items-center gap-3 text-zinc-500 mb-4">
              <AlertTriangle size={16} />
              <p className="text-[8px] font-black uppercase tracking-widest">Responsabilité</p>
            </div>
            <div className="p-8 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] opacity-60">
            <div className="flex items-center gap-3 text-zinc-500 mb-4">
              <AlertTriangle size={16} />
              <p className="text-[8px] font-black uppercase tracking-widest">Responsabilité</p>
            </div>
            <p className="text-[9px] text-zinc-500 leading-relaxed font-medium uppercase">
              Les modèles de contrats fournis sont conformes aux législations OHADA et locales. Toutefois, la responsabilité d'ECODREUM ne saurait être engagée en cas de litige suite à une modification manuelle des clauses générées.
            </p>
          </div>
        </div> {/* Fin de la colonne droite */}

        {/* ESPACE DE SÉCURITÉ POUR LE SCROLL */}
        <div className="h-40 w-full col-span-12"></div>
      </div> {/* Fin du grid (lg:grid-cols-12) */}
    </div> // Fin du container principal (min-h-screen)
  );
}
