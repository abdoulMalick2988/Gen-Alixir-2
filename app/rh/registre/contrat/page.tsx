"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Building, User, Briefcase, Globe, Scale, 
  ShieldAlert, Download, FileText, CheckCircle, AlertTriangle, 
  Clock, Landmark, Fingerprint, Coins
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { 
  Packer, Document, Paragraph, TextRun, AlignmentType, 
  HeadingLevel, Header, Footer, PageNumber, NumberFormat 
} from 'docx';

// --- CONFIGURATION JURIDIQUE ALPHA-1 (VERROUILLÉE) ---
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
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState<'SENEGAL' | 'BURUNDI'>('SENEGAL');
  
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

  // --- MOTEUR DE GÉNÉRATION DOCX ---
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
              new Paragraph({
                children: [
                  new TextRun({ text: `Document généré via ECODREUM Intelligence Engine v2.0 - Page `, size: 16 }),
                  new PageNumber({ format: NumberFormat.DECIMAL }),
                ],
                alignment: AlignmentType.CENTER
              }),
              new Paragraph({
                children: [new TextRun({ text: "Ce document est une base juridique et ne remplace pas l'avis d'un avocat.", size: 14, italic: true })],
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
          
          ...createArticle("ARTICLE 4 : FONCTIONS", `Le Salarié est engagé en qualité de ${formData.post}. Il exercera ses fonctions à ${formData.address} ou tout autre lieu nécessaire à l'activité.`),

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
              new TextRun({ text: "\nL'Employeur (Signature & Cachet)                     Le Salarié (Signature précédée de 'Lu et approuvé')" })
            ],
            spacing: { before: 400 }
          })
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Contrat_${formData.empName.replace(' ', '_')}.docx`);
  };

  function createArticle(title: string, content: string) {
    return [
      new Paragraph({ children: [new TextRun({ text: title, bold: true })], spacing: { before: 200 } }),
      new Paragraph({ text: content, spacing: { after: 200 } })
    ];
  }

  // --- RENDU UI ---
  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans p-4 md:p-8">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <button onClick={() => router.back()} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group">
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="text-center">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase">Legal <span className="text-emerald-500">Engine</span></h1>
          <p className="text-[10px] font-black text-zinc-500 tracking-[0.4em] uppercase">Générateur de Contrats Alpha-2</p>
        </div>
        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
          <Scale className="text-emerald-500" size={24} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FORMULAIRE (GAUCHE) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* SÉLECTEUR DE PAYS */}
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem]">
            <label className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-4 block">1. Juridiction de Référence</label>
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

          {/* ÉTAPE 1 : ENTREPRISE */}
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <Building className="text-emerald-500" />
              <h2 className="text-xl font-black italic uppercase">L'Employeur</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <input placeholder="Nom de l'entreprise" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-emerald-500" 
                  onChange={e => setFormData({...formData, companyName: e.target.value})} />
              </div>
              <input placeholder={`Numéro ${activeLegal.idLabel}`} className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none" 
                onChange={e => setFormData({...formData, idLegal: e.target.value})} />
              <input placeholder="RCCM" className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none" 
                onChange={e => setFormData({...formData, rccm: e.target.value})} />
              <div className="col-span-2 flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <input type="checkbox" className="w-5 h-5 accent-emerald-500" onChange={e => setFormData({...formData, hasCapital: e.target.checked})} />
                <span className="text-xs font-bold uppercase text-zinc-400">Mentionner le Capital Social</span>
                {formData.hasCapital && <input placeholder="Montant (ex: 1 000 000)" className="flex-1 bg-black/20 border-b border-white/20 outline-none text-xs" onChange={e => setFormData({...formData, capitalAmount: e.target.value})} />}
              </div>
              <input placeholder="Nom du Représentant" className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none" 
                onChange={e => setFormData({...formData, repName: e.target.value})} />
              <input placeholder="Fonction (ex: Gérant)" className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none" 
                onChange={e => setFormData({...formData, repPost: e.target.value})} />
            </div>
          </div>

          {/* ÉTAPE 2 : SALARIÉ */}
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <User className="text-emerald-500" />
              <h2 className="text-xl font-black italic uppercase">Le Salarié</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Nom Complet" className="col-span-2 bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none" 
                onChange={e => setFormData({...formData, empName: e.target.value})} />
              <input placeholder="Nationalité" className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none" 
                onChange={e => setFormData({...formData, empNation: e.target.value})} />
              <input placeholder="N° Pièce d'identité" className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none" 
                onChange={e => setFormData({...formData, empID: e.target.value})} />
              
              <div className="col-span-2 flex items-center justify-between p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <Globe size={18} className="text-amber-500" />
                  <span className="text-xs font-bold uppercase text-amber-500">Salarié étranger ?</span>
                </div>
                <input type="checkbox" className="w-5 h-5 accent-amber-500" onChange={e => setFormData({...formData, isForeigner: e.target.checked})} />
              </div>

              {formData.isForeigner && (
                <div className="col-span-2 animate-in slide-in-from-top-2 duration-300">
                  <input placeholder="Numéro du Permis de Travail (Obligatoire)" className="w-full bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm outline-none text-amber-200 placeholder:text-amber-500/50" 
                    onChange={e => setFormData({...formData, workPermit: e.target.value})} />
                </div>
              )}
            </div>
          </div>

          {/* ÉTAPE 3 : CONTRAT */}
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <Briefcase className="text-emerald-500" />
              <h2 className="text-xl font-black italic uppercase">Conditions de Travail</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none" onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="CDI">CDI (Indéterminé)</option>
                <option value="CDD">CDD (Déterminé)</option>
              </select>
              <input placeholder="Poste occupé" className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none" 
                onChange={e => setFormData({...formData, post: e.target.value})} />
              
              {formData.type === 'CDD' && (
                <input placeholder="Motif du CDD (ex: Remplacement)" className="col-span-2 bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 text-sm outline-none" 
                  onChange={e => setFormData({...formData, cddReason: e.target.value})} />
              )}

              <input placeholder="Salaire Brut (FCFA)" type="number" className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none" 
                onChange={e => setFormData({...formData, salary: e.target.value})} />
              <input placeholder="Essai (mois)" type="number" className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm outline-none" 
                onChange={e => setFormData({...formData, trialPeriod: e.target.value})} />
            </div>
          </div>
        </div>

        {/* APERÇU & EXPORT (DROITE) */}
        <div className="lg:col-span-5 sticky top-8 h-fit space-y-6">
          <div className="bg-emerald-500/[0.03] border border-emerald-500/20 p-8 rounded-[3rem] relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-black italic uppercase mb-6">Validation Juridique</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                  <p className="text-[11px] text-zinc-300 font-bold uppercase leading-relaxed">Conformité {activeLegal.codeLabel} vérifiée.</p>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                  <p className="text-[11px] text-zinc-300 font-bold uppercase leading-relaxed">Juridiction : {activeLegal.jurisdiction}.</p>
                </div>
                {formData.isForeigner && !formData.workPermit && (
                  <div className="flex items-start gap-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl animate-pulse">
                    <ShieldAlert className="text-rose-500 shrink-0" size={20} />
                    <p className="text-[9px] text-rose-500 font-black uppercase">Attention : Permis de travail manquant pour salarié étranger.</p>
                  </div>
                )}
              </div>

              <div className="mt-10 space-y-3">
                <button 
                  onClick={generateDocument}
                  className="w-full bg-emerald-500 text-black py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20"
                >
                  <Download size={20} /> Générer le contrat (.DOCX)
                </button>
                <button className="w-full bg-white/5 border border-white/10 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                  <FileText size={20} /> Aperçu PDF (Coming Soon)
                </button>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -mr-32 -mt-32" />
          </div>

          <div className="p-8 bg-zinc-900/50 border border-white/5 rounded-[2.5rem]">
            <div className="flex items-center gap-3 text-zinc-500 mb-4">
              <AlertTriangle size={16} />
              <p className="text-[8px] font-black uppercase tracking-widest">Avertissement</p>
            </div>
            <p className="text-[9px] text-zinc-500 leading-relaxed font-medium uppercase">
              Ce module génère des documents basés sur des templates standards africains. ECODREUM ne peut être tenu responsable d'une mauvaise utilisation des clauses. Faites relire vos contrats par un juriste local.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
