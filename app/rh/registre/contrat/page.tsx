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
  Header, Footer, PageNumber, NumberFormat 
} from 'docx';

// --- CONFIGURATION JURIDIQUE (VERROUILLÉE) ---
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
  
  const [formData, setFormData] = useState({
    companyName: '', companyType: 'SARL', address: '', 
    rccm: '', idLegal: '', repName: '', repPost: '',
    hasCapital: false, capitalAmount: '',
    empName: '', empBirth: '', empNation: 'Sénégalaise', 
    empAddress: '', empID: '', isForeigner: false, workPermit: '',
    type: 'CDI', post: '', salary: '', joinDate: '', 
    endDate: '', cddReason: '', workTime: '40', trialPeriod: '1',
    hasNonCompete: false, nonCompeteDuration: '12', 
    hasBonus: false, bonusDetail: ''
  });

  const activeLegal = LEGAL_CONFIG[country];

  // Helper interne pour les articles Word
  const createArticle = (title: string, content: string) => {
    return [
      new Paragraph({ children: [new TextRun({ text: title, bold: true })], spacing: { before: 200 } }),
      new Paragraph({ text: content, spacing: { after: 200 } })
    ];
  };

  // --- MOTEUR DE GÉNÉRATION WORD ---
  const generateDocument = async () => {
    const doc = new Document({
      sections: [{
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "CONFIDENTIEL - RH ECODREUM", color: "888888", size: 16, bold: true })],
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
                  new TextRun({ text: `Généré via ECODREUM - Page `, size: 16 }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16 }),
                ],
                alignment: AlignmentType.CENTER
              })
            ]
          })
        },
        children: [
          new Paragraph({
            children: [new TextRun({ text: "CONTRAT DE TRAVAIL", bold: true, size: 40, underline: {} })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          new Paragraph({
            children: [new TextRun({ text: `RÉGIME : DURÉE ${formData.type === 'CDI' ? 'INDÉTERMINÉE' : 'DÉTERMINÉE'}`, bold: true, size: 24 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 }
          }),
          new Paragraph({ children: [new TextRun({ text: "ENTRE LES SOUSSIGNÉS :", bold: true })] }),
          new Paragraph({
            text: `L'entreprise ${formData.companyName}, ${formData.companyType} ${formData.hasCapital ? `au capital de ${formData.capitalAmount} F` : ''}, sise à ${formData.address}, immatriculée au RCCM n° ${formData.rccm} et au ${activeLegal.idLabel} n° ${formData.idLegal}, représentée par M./Mme ${formData.repName} (${formData.repPost}).`,
            spacing: { after: 200 }
          }),
          new Paragraph({ children: [new TextRun({ text: "ET :", bold: true }), new TextRun({ text: ` M./Mme ${formData.empName}, né(e) le ${formData.empBirth}, de nationalité ${formData.empNation}, titulaire de la pièce n° ${formData.empID} ${formData.isForeigner ? `et du Permis de Travail n° ${formData.workPermit}` : ''}.` })] }),
          
          ...createArticle("ARTICLE 1 : CADRE LÉGAL", `Contrat conclu selon le ${activeLegal.codeLabel}, notamment les ${activeLegal.articles}.`),
          ...createArticle("ARTICLE 2 : FONCTIONS", `Le Salarié est engagé comme ${formData.post} à compter du ${formData.joinDate}.`),
          ...createArticle("ARTICLE 3 : RÉMUNÉRATION", `Salaire mensuel brut de ${formData.salary} F CFA.`),
          ...createArticle("ARTICLE FINAL : LITIGES", `Tout différend relèvera du ${activeLegal.jurisdiction}.`),

          new Paragraph({
            children: [new TextRun({ text: `\n\nFait à ______________, le ${new Date().toLocaleDateString()}`, italics: true })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 800 }
          })
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Contrat_${formData.empName.replace(/\s+/g, '_')}.docx`);
  };

  return (
    <div className="w-full min-h-screen bg-[#020202] text-white font-sans p-4 md:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <button onClick={() => router.back()} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-4xl font-black italic uppercase">Legal <span className="text-emerald-500">Architect</span></h1>
          <p className="text-[10px] font-black text-zinc-500 tracking-[0.4em] uppercase">Architecture de Contrat v2.0</p>
        </div>
        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
          <Scale className="text-emerald-500" size={24} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 pb-32">
        <div className="lg:col-span-7 space-y-6">
          
          {/* JURIDICTION */}
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem]">
            <label className="text-[10px] font-black uppercase text-emerald-500 mb-4 block">1. Pays d'application</label>
            <div className="grid grid-cols-2 gap-4">
              {['SENEGAL', 'BURUNDI'].map((p) => (
                <button key={p} onClick={() => setCountry(p as any)}
                  className={`py-4 rounded-2xl font-black text-xs transition-all border ${country === p ? 'bg-emerald-500 text-black' : 'bg-white/5 text-zinc-500'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* EMPLOYEUR */}
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] space-y-6">
            <h2 className="text-xl font-black italic uppercase flex items-center gap-3"><Building className="text-emerald-500"/> L'Entreprise</h2>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Nom" className="col-span-2 bg-black/40 border border-white/10 rounded-xl p-4 text-sm" onChange={e => setFormData({...formData, companyName: e.target.value})} />
              <input placeholder={activeLegal.idLabel} className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm" onChange={e => setFormData({...formData, idLegal: e.target.value})} />
              <input placeholder="RCCM" className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm" onChange={e => setFormData({...formData, rccm: e.target.value})} />
              <input placeholder="Siège Social" className="col-span-2 bg-black/40 border border-white/10 rounded-xl p-4 text-sm" onChange={e => setFormData({...formData, address: e.target.value})} />
              <input placeholder="Représentant" className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm" onChange={e => setFormData({...formData, repName: e.target.value})} />
              <input placeholder="Qualité" className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm" onChange={e => setFormData({...formData, repPost: e.target.value})} />
            </div>
          </div>

          {/* COLLABORATEUR */}
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] space-y-6">
            <h2 className="text-xl font-black italic uppercase flex items-center gap-3"><User className="text-emerald-500"/> Le Collaborateur</h2>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Prénom & Nom" className="col-span-2 bg-black/40 border border-white/10 rounded-xl p-4 text-sm" onChange={e => setFormData({...formData, empName: e.target.value})} />
              <input placeholder="Né le (date/lieu)" className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm" onChange={e => setFormData({...formData, empBirth: e.target.value})} />
              <input placeholder="Nationalité" className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm" onChange={e => setFormData({...formData, empNation: e.target.value})} />
              <input placeholder="N° ID" className="col-span-2 bg-black/40 border border-white/10 rounded-xl p-4 text-sm" onChange={e => setFormData({...formData, empID: e.target.value})} />
              <div className="col-span-2 flex items-center justify-between p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <span className="text-xs font-bold text-amber-500">Salarié étranger ?</span>
                <input type="checkbox" className="w-5 h-5 accent-amber-500" onChange={e => setFormData({...formData, isForeigner: e.target.checked})} />
              </div>
              {formData.isForeigner && (
                <input placeholder="N° Permis de Travail (OBLIGATOIRE)" className="col-span-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm text-amber-200" onChange={e => setFormData({...formData, workPermit: e.target.value})} />
              )}
            </div>
          </div>

          {/* CONTRAT */}
          <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] space-y-6">
            <h2 className="text-xl font-black italic uppercase flex items-center gap-3"><Briefcase className="text-emerald-500"/> Le Contrat</h2>
            <div className="grid grid-cols-2 gap-4">
              <select className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm" onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
              </select>
              <input placeholder="Poste" className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm" onChange={e => setFormData({...formData, post: e.target.value})} />
              <input placeholder="Salaire Brut" type="number" className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm" onChange={e => setFormData({...formData, salary: e.target.value})} />
              <input type="date" className="bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-zinc-500" onChange={e => setFormData({...formData, joinDate: e.target.value})} />
            </div>
          </div>
        </div>

        {/* EXPORT */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-emerald-500/[0.03] border border-emerald-500/20 p-8 rounded-[3rem] sticky top-8">
            <h3 className="text-2xl font-black italic uppercase mb-6">Contrôle Légal</h3>
            <div className="space-y-4 mb-10">
              <p className="text-[10px] text-zinc-400 font-bold uppercase">Juridiction : {activeLegal.jurisdiction}</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase">Code : {activeLegal.codeLabel}</p>
            </div>
            <button onClick={generateDocument} className="w-full bg-emerald-500 text-black py-6 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3">
              <Download size={20} /> Télécharger (.DOCX)
            </button>
          </div>
        </div>

        {/* ESPACE DE SCROLL */}
        <div className="h-40 col-span-12"></div>
      </div>
    </div>
  );
}
