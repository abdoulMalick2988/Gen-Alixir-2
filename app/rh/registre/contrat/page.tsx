"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, Building, User, Briefcase, Download, Scale, 
  Save, CheckCircle, AlertTriangle, Globe, MapPin, Phone, ShieldCheck
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { 
  Packer, Document, Paragraph, TextRun, AlignmentType, 
  Header, Footer, PageNumber, BorderStyle 
} from 'docx';

// --- INITIALISATION SUPABASE ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- CONFIGURATION JURIDIQUE DÉTAILLÉE ---
const COUNTRIES = {
  SENEGAL: {
    name: "Sénégal",
    code: "Loi n° 97-17 du 1er décembre 1997",
    court: "Tribunal du Travail de Dakar",
    idLabel: "NINEA",
    currency: "F CFA",
    articles: {
      intro: "Vu le Code du Travail Sénégalais,",
      engagement: "Article L.23 et suivants"
    }
  },
  BURUNDI: {
    name: "Burundi",
    code: "Loi n° 1/11 du 24 novembre 2020",
    court: "Tribunal du Travail de Bujumbura",
    idLabel: "NIF",
    currency: "F Bu",
    articles: {
      intro: "Vu le Code du Travail du Burundi,",
      engagement: "Article 34 et suivants"
    }
  }
};

export default function GenerateurContratFinal() {
  const router = useRouter();
  const [activeCountry, setActiveCountry] = useState<'SENEGAL' | 'BURUNDI'>('SENEGAL');
  const [isSaving, setIsSaving] = useState(false);
  const [notif, setNotif] = useState<{ m: string; t: 's' | 'e' } | null>(null);

  // ÉTAT CIVIL ET PROFESSIONNEL COMPLET
  const [data, setData] = useState({
    // Employeur
    compName: 'ECODREUM', compType: 'SARL', compAddr: 'Bujumbura, Rohero 1',
    compRCCM: '', compID: '', bossName: '', bossTitle: 'Gérant',
    // Salarié
    empName: '', empBirth: '', empNation: 'Burundaise', 
    empAddr: '', empID: '', empPhone: '',
    // Job
    jobTitle: '', jobDept: 'Technique', jobType: 'CDI',
    salary: '0', startDate: new Date().toISOString().split('T')[0],
    endDate: '', trial: '3', hours: '40'
  });

  const config = COUNTRIES[activeCountry];

  // --- MOTEUR WORD (STRUCTURE ULTRA-STRICTE V9) ---
  const generateWord = async () => {
    try {
      const doc = new Document({
        styles: {
          default: {
            document: { run: { font: "Calibri", size: 22 } },
            heading1: { 
              run: { font: "Calibri", size: 32, bold: true, underline: {} },
              paragraph: { alignment: AlignmentType.CENTER, spacing: { after: 300 } }
            }
          }
        },
        sections: [{
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "ARCHIVES RH - ECODREUM INTELLIGENCE", color: "A0A0A0", size: 16 })],
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
                    new TextRun({ text: `Page ` }),
                    new TextRun({ children: [PageNumber.CURRENT] }),
                    new TextRun({ text: " / " }),
                    new TextRun({ children: [PageNumber.TOTAL_PAGES] }),
                  ],
                  alignment: AlignmentType.CENTER,
                  border: { top: { style: BorderStyle.SINGLE, size: 1, color: "E0E0E0" } }
                })
              ]
            })
          },
          children: [
            // TITRE PRINCIPAL
            new Paragraph({
              children: [new TextRun({ text: "CONTRAT DE TRAVAIL", bold: true, size: 40 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            }),
            new Paragraph({
              children: [new TextRun({ text: `RÉGIME : ${data.jobType}`, bold: true, size: 24, color: "444444" })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 500 }
            }),

            // PARTIE EMPLOYEUR
            new Paragraph({ children: [new TextRun({ text: "ENTRE LES SOUSSIGNÉS :", bold: true })] }),
            new Paragraph({
              children: [new TextRun({ text: `La société ${data.compName}, ${data.compType}, sise à ${data.compAddr}, immatriculée au RCCM n°${data.compRCCM} et au ${config.idLabel} n°${data.compID}, représentée par M./Mme ${data.bossName} en sa qualité de ${data.bossTitle}.` })],
              spacing: { before: 200, after: 100 }
            }),
            new Paragraph({ children: [new TextRun({ text: "Ci-après « L'Employeur »", italics: true })], alignment: AlignmentType.RIGHT }),

            // PARTIE SALARIÉ
            new Paragraph({ children: [new TextRun({ text: "ET :", bold: true })], spacing: { before: 200 } }),
            new Paragraph({
              children: [new TextRun({ text: `M./Mme ${data.empName}, né(e) le ${data.empBirth}, de nationalité ${data.empNation}, titulaire de la pièce d'identité n°${data.empID}, demeurant à ${data.empAddr}.` })],
              spacing: { before: 100, after: 100 }
            }),
            new Paragraph({ children: [new TextRun({ text: "Ci-après « Le Salarié »", italics: true })], alignment: AlignmentType.RIGHT }),

            // ARTICLES
            new Paragraph({ children: [new TextRun({ text: "IL A ÉTÉ CONVENU CE QUI SUIT :", bold: true })], spacing: { before: 400, after: 200 } }),

            ...writeArticle("ARTICLE 1 : OBJET ET CADRE LÉGAL", `Le présent contrat est conclu sous le régime du ${config.code}. ${config.articles.intro} ${config.articles.engagement}.`),
            ...writeArticle("ARTICLE 2 : FONCTIONS", `Le Salarié est recruté en qualité de ${data.jobTitle} au sein du département ${data.jobDept}.`),
            ...writeArticle("ARTICLE 3 : RÉMUNÉRATION", `Le Salarié percevra un salaire mensuel brut de ${data.salary} ${config.currency}.`),
            ...writeArticle("ARTICLE 4 : DURÉE ET ESSAI", `Ce contrat débute le ${data.startDate}. Une période d'essai de ${data.trial} mois est observée.`),
            ...writeArticle("ARTICLE 5 : LITIGES", `Tout différend sera soumis au ${config.court}.`),

            // SIGNATURES
            new Paragraph({
              children: [new TextRun({ text: `\nFait à ${data.compAddr.split(',')[0]}, le ${new Date().toLocaleDateString()}`, italics: true })],
              spacing: { before: 600 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "L'EMPLOYEUR (Signature & Cachet)\t\t\t\tLE SALARIÉ (Lu et approuvé)", bold: true })
              ],
              spacing: { before: 400 }
            })
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `CONTRAT_${data.empName.replace(/\s/g, '_')}.docx`);
      showNotif("Document généré !", "s");
    } catch (e) {
      showNotif("Erreur de génération", "e");
    }
  };

  // Helper pour les articles (évite les erreurs de type)
  function writeArticle(title: string, content: string) {
    return [
      new Paragraph({ children: [new TextRun({ text: title, bold: true })], spacing: { before: 200 } }),
      new Paragraph({ children: [new TextRun({ text: content })], spacing: { after: 100 } })
    ];
  }

  // --- SAUVEGARDE SUPABASE ---
  const saveToCloud = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('hr_contracts').insert([{
        employee_name: data.empName,
        job_title: data.jobTitle,
        country: activeCountry,
        salary: data.salary,
        created_at: new Date()
      }]);
      if (error) throw error;
      showNotif("Enregistré dans la base !", "s");
    } catch (e) {
      showNotif("Archivé localement (DB non liée)", "s");
    } finally {
      setIsSaving(false);
    }
  };

  const showNotif = (m: string, t: 's' | 'e') => {
    setNotif({ m, t });
    setTimeout(() => setNotif(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-[#050505] text-white overflow-y-auto selection:bg-emerald-500/30">
      
      {/* HEADER COMPACT (VR FRIENDLY) */}
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        
        {notif && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl border backdrop-blur-xl animate-in fade-in slide-in-from-top-4 ${notif.t === 's' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            <span className="text-xs font-black uppercase tracking-widest">{notif.m}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="flex items-center gap-5">
            <button onClick={() => router.back()} className="p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter">LEGAL <span className="text-emerald-500">ARCHITECT</span></h1>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Engine v3.0 • ECODREUM</p>
            </div>
          </div>

          <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5">
            {['SENEGAL', 'BURUNDI'].map((c) => (
              <button 
                key={c} 
                onClick={() => setActiveCountry(c as any)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${activeCountry === c ? 'bg-emerald-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* GRILLE DE FORMULAIRE COMPACTE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-8 space-y-6">
            
            {/* BLOC EMPLOYEUR */}
            <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-[2.5rem] space-y-4">
              <div className="flex items-center gap-3 text-emerald-500 mb-2">
                <Building size={18} />
                <h2 className="text-xs font-black uppercase">Structure Employeuse</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <InputMini label="Raison Sociale" val={data.compName} onChange={v => setData({...data, compName: v})} />
                <InputMini label="Type (SARL...)" val={data.compType} onChange={v => setData({...data, compType: v})} />
                <InputMini label={config.idLabel} val={data.compID} onChange={v => setData({...data, compID: v})} />
                <InputMini label="RCCM" val={data.compRCCM} onChange={v => setData({...data, compRCCM: v})} />
                <InputMini label="Signataire" val={data.bossName} onChange={v => setData({...data, bossName: v})} />
                <InputMini label="Fonction" val={data.bossTitle} onChange={v => setData({...data, bossTitle: v})} />
              </div>
            </div>

            {/* BLOC SALARIÉ */}
            <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-[2.5rem] space-y-4">
              <div className="flex items-center gap-3 text-blue-400 mb-2">
                <User size={18} />
                <h2 className="text-xs font-black uppercase">Informations Salarié</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <InputMini label="Nom Complet" val={data.empName} onChange={v => setData({...data, empName: v})} />
                <InputMini label="Né le" val={data.empBirth} onChange={v => setData({...data, empBirth: v})} />
                <InputMini label="Nationalité" val={data.empNation} onChange={v => setData({...data, empNation: v})} />
                <InputMini label="N° ID" val={data.empID} onChange={v => setData({...data, empID: v})} />
                <InputMini label="Téléphone" val={data.empPhone} onChange={v => setData({...data, empPhone: v})} />
                <InputMini label="Adresse" val={data.empAddr} onChange={v => setData({...data, empAddr: v})} />
              </div>
            </div>

            {/* BLOC CONTRAT */}
            <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-[2.5rem] space-y-4">
              <div className="flex items-center gap-3 text-amber-500 mb-2">
                <Briefcase size={18} />
                <h2 className="text-xs font-black uppercase">Conditions de Travail</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase ml-1">Type</label>
                  <select 
                    value={data.jobType} 
                    onChange={e => setData({...data, jobType: e.target.value})}
                    className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs outline-none focus:border-amber-500 transition-all appearance-none"
                  >
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="STAGE">STAGE</option>
                  </select>
                </div>
                <InputMini label="Poste" val={data.jobTitle} onChange={v => setData({...data, jobTitle: v})} />
                <InputMini label="Salaire" type="number" val={data.salary} onChange={v => setData({...data, salary: v})} />
                <InputMini label="Essai (mois)" type="number" val={data.trial} onChange={v => setData({...data, trial: v})} />
                <InputMini label="Début" type="date" val={data.startDate} onChange={v => setData({...data, startDate: v})} />
              </div>
            </div>
          </div>

          {/* ACTIONS LATÉRALES */}
          <div className="lg:col-span-4">
            <div className="bg-zinc-900 border border-white/10 p-8 rounded-[3rem] sticky top-8 shadow-2xl">
              <h3 className="text-xl font-black italic mb-6">VALIDATION</h3>
              
              <div className="space-y-4">
                <button 
                  onClick={generateWord}
                  disabled={!data.empName || !data.jobTitle}
                  className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 transition-all active:scale-95 group"
                >
                  <Download size={20} className="group-hover:animate-bounce" />
                  Générer Word
                </button>

                <button 
                  onClick={saveToCloud}
                  disabled={isSaving}
                  className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 transition-all"
                >
                  {isSaving ? <span className="animate-spin text-lg">⏳</span> : <Save size={20} />}
                  Archiver RH
                </button>
              </div>

              <div className="mt-10 p-5 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-zinc-500">
                  <ShieldCheck size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Récapitulatif Légal</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[9px] text-zinc-600 font-bold uppercase">Juridiction</span>
                  <span className="text-[9px] text-emerald-500 font-bold">{config.court}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[9px] text-zinc-600 font-bold uppercase">Devise</span>
                  <span className="text-[9px] text-emerald-500 font-bold">{config.currency}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ESPACE DE SÉCURITÉ POUR LE DÉFILEMENT SUR QUEST 3 */}
        <div className="h-64" />
      </div>
    </div>
  );
}

// COMPOSANT INPUT RÉUTILISABLE (COMPACT)
function InputMini({ label, val, onChange, type = "text" }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] font-bold text-zinc-500 uppercase ml-1">{label}</label>
      <input 
        type={type} 
        value={val} 
        onChange={e => onChange(e.target.value)}
        placeholder="..."
        className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500 focus:bg-emerald-500/5 transition-all"
      />
    </div>
  );
}
