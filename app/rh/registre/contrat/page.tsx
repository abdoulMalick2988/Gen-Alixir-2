"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from "@/components/Sidebar";
import { 
  FileText, Download, ArrowLeft, 
  Building, User, Briefcase, Globe, Scale, ShieldAlert 
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { Packer, Document, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';

// --- CONFIGURATION JURIDIQUE VERROUILLÉE ---
const LEGAL_TEMPLATES = {
  Burundi: {
    tribunal: "Tribunal du Travail de Bujumbura",
    idLabel: "NIF",
    codeLabel: "Code du Travail du Burundi",
    ref: "Loi n°1/11 du 24 novembre 2020",
    jurisdiction: "Tout litige né de l’exécution du présent contrat relèvera de la compétence exclusive du Tribunal de Bujumbura."
  },
  Sénégal: {
    tribunal: "Tribunal du Travail de Dakar",
    idLabel: "NINEA",
    codeLabel: "Code du Travail Sénégalais",
    ref: "Loi n° 97-17 du 1er décembre 1997",
    jurisdiction: "Tout litige relatif à la validité ou l'exécution du présent contrat sera soumis à la juridiction du Tribunal du Travail de Dakar."
  }
};

export default function ContractArchitectPage() {
  const router = useRouter();
  const [country, setCountry] = useState<'Burundi' | 'Sénégal'>('Sénégal');
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    companyName: '', companyType: 'SARL', hasCapital: false, capitalAmount: '',
    address: '', rccm: '', idLegal: '', repName: '', repFunction: '',
    empName: '', empBirth: '', empNation: '', empAddress: '', empID: '',
    type: 'CDI', post: '', startDate: '', endDate: '', 
    workPlace: '', hours: '40', salary: '', trialPeriod: '3',
    hasNonCompete: false, nonCompeteDuration: '12'
  });

  const activeLegal = LEGAL_TEMPLATES[country];

  // --- GÉNÉRATION WORD (DOCX) ---
  const exportToWord = async () => {
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ 
            children: [new TextRun({ text: "CONTRAT DE TRAVAIL", bold: true, size: 32 })],
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1 
          }),
          new Paragraph({ 
            children: [new TextRun({ text: `Régime : ${formData.type}`, italics: true })],
            alignment: AlignmentType.CENTER 
          }),
          
          new Paragraph({ 
            children: [new TextRun({ text: "\nENTRE LES SOUSSIGNÉS :", bold: true })],
            spacing: { before: 400 } 
          }),
          new Paragraph({
            text: `L'entreprise ${formData.companyName}, ${formData.companyType} au capital de ${formData.hasCapital ? formData.capitalAmount : 'X'} F, sise à ${formData.address}, immatriculée au RCCM sous le n° ${formData.rccm} et au ${activeLegal.idLabel} n° ${formData.idLegal}, représentée par ${formData.repName}.`
          }),
          
          new Paragraph({ 
            children: [new TextRun({ text: "\nET :", bold: true })],
            spacing: { before: 200 } 
          }),
          new Paragraph({
            text: `M./Mme ${formData.empName}, né(e) le ${formData.empBirth}, de nationalité ${formData.empNation}, titulaire de la pièce n° ${formData.empID}.`
          }),

          new Paragraph({ 
            children: [new TextRun({ text: "\nARTICLE 1 : CADRE LÉGAL", bold: true })],
            spacing: { before: 400 } 
          }),
          new Paragraph({ text: `Le présent contrat est régi par le ${activeLegal.codeLabel} (${activeLegal.ref}).` }),

          new Paragraph({ 
            children: [new TextRun({ text: "\nARTICLE 2 : POSTE ET RÉMUNÉRATION", bold: true })] 
          }),
          new Paragraph({ text: `Le salarié est recruté en tant que ${formData.post} pour un salaire brut de ${formData.salary} F par mois.` }),

          ...(formData.hasNonCompete ? [
            new Paragraph({ 
              children: [new TextRun({ text: "\nARTICLE 3 : NON-CONCURRENCE", bold: true })] 
            }),
            new Paragraph({ text: `Le salarié s'engage, en cas de rupture, à ne pas exercer d'activité concurrente pendant une durée de ${formData.nonCompeteDuration} mois dans la zone géographique d'activité de l'entreprise.` })
          ] : []),

          new Paragraph({ 
            children: [new TextRun({ text: "\nARTICLE FINAL : LITIGES", bold: true })],
            spacing: { before: 400 } 
          }),
          new Paragraph({ text: activeLegal.jurisdiction }),

          new Paragraph({ 
            text: "\n\nFait à ______________, le ______________", 
            alignment: AlignmentType.RIGHT 
          }),
          new Paragraph({ 
            text: "\n\nSignature Employeur (précédée de 'Lu et approuvé')          Signature Salarié", 
            spacing: { before: 400 } 
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Contrat_${formData.empName}.docx`);
  };

  return (
    <div className="flex h-screen bg-[#010101] text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto custom-scroll">
        
        {/* HEADER MODERNE */}
        <div className="flex justify-between items-center mb-10 bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-black italic tracking-tighter text-emerald-500 uppercase">Générateur Légal</h1>
            <p className="text-[10px] font-bold text-zinc-500 tracking-[0.4em]">ARCHITECTE RH / {country.toUpperCase()}</p>
          </div>
          <button onClick={() => router.back()} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/10 group">
             <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>

        {step === 1 ? (
          <div className="max-w-5xl mx-auto grid grid-cols-12 gap-8 pb-20">
            
            {/* PANNEAU GAUCHE : CONFIGURATION */}
            <div className="col-span-8 space-y-6">
              {/* SÉLECTION PAYS */}
              <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] flex gap-4">
                {['Sénégal', 'Burundi'].map((p) => (
                  <button key={p} onClick={() => setCountry(p as any)} 
                    className={`flex-1 p-4 rounded-xl border transition-all font-black text-xs ${country === p ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-white/5 border-white/10 text-zinc-500'}`}>
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* FORMULAIRE SECTIONS */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] space-y-4">
                  <h3 className="text-[10px] font-black text-emerald-500 flex items-center gap-2 uppercase tracking-widest mb-4"><Building size={14}/> Entreprise</h3>
                  <input placeholder="Nom de l'entreprise" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs outline-none focus:border-emerald-500" onChange={e => setFormData({...formData, companyName: e.target.value})} />
                  <input placeholder={activeLegal.idLabel} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs outline-none" onChange={e => setFormData({...formData, idLegal: e.target.value})} />
                </div>
                
                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] space-y-4">
                  <h3 className="text-[10px] font-black text-emerald-500 flex items-center gap-2 uppercase tracking-widest mb-4"><User size={14}/> Salarié</h3>
                  <input placeholder="Nom complet" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs outline-none focus:border-emerald-500" onChange={e => setFormData({...formData, empName: e.target.value})} />
                  <input placeholder="N° Pièce d'identité" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs outline-none" onChange={e => setFormData({...formData, empID: e.target.value})} />
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] space-y-6">
                <h3 className="text-[10px] font-black text-emerald-500 flex items-center gap-2 uppercase tracking-widest"><Briefcase size={14}/> Détails Contrat</h3>
                <div className="grid grid-cols-3 gap-4">
                   <select className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs outline-none" onChange={e => setFormData({...formData, type: e.target.value})}>
                     <option value="CDI">CDI</option>
                     <option value="CDD">CDD</option>
                   </select>
                   <input placeholder="Poste" className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs outline-none" onChange={e => setFormData({...formData, post: e.target.value})} />
                   <input placeholder="Salaire Brut" className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs outline-none" onChange={e => setFormData({...formData, salary: e.target.value})} />
                </div>
              </div>
            </div>

            {/* PANNEAU DROIT : OPTIONS AVANCÉES */}
            <div className="col-span-4 space-y-6">
               <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] space-y-6">
                 <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Options Juridiques</h3>
                 
                 <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer">
                    <span className="text-[10px] font-bold">Non-concurrence</span>
                    <input type="checkbox" checked={formData.hasNonCompete} onChange={e => setFormData({...formData, hasNonCompete: e.target.checked})} className="accent-emerald-500" />
                 </label>

                 {formData.hasNonCompete && (
                   <div className="animate-in slide-in-from-top-2 duration-300">
                     <p className="text-[9px] text-zinc-500 mb-2 uppercase font-bold">Durée (mois)</p>
                     <input type="number" value={formData.nonCompeteDuration} className="w-full bg-white/5 border border-emerald-500/30 rounded-xl p-4 text-xs outline-none" onChange={e => setFormData({...formData, nonCompeteDuration: e.target.value})} />
                   </div>
                 )}

                 <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                   <p className="text-[9px] text-emerald-500 leading-relaxed italic">
                     <ShieldAlert size={12} className="inline mr-2" />
                     Les clauses sont verrouillées selon le Code du Travail {country}.
                   </p>
                 </div>
               </div>

               <button onClick={() => setStep(2)} className="w-full py-6 bg-emerald-500 text-black rounded-3xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl shadow-emerald-500/20">
                 Générer l'aperçu
               </button>
            </div>
          </div>
        ) : (
          /* ÉTAPE 2 : APERÇU ET EXPORT */
          <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in duration-500">
             <div className="bg-white text-black p-20 shadow-2xl font-serif text-[12px] leading-loose min-h-[1000px] rounded-sm">
                <h1 className="text-center font-bold text-2xl border-b-2 border-black pb-4 mb-10">CONTRAT DE TRAVAIL</h1>
                <p><strong>Employeur :</strong> {formData.companyName}, {formData.companyType}, RCCM {formData.rccm}, {activeLegal.idLabel} {formData.idLegal}.</p>
                <p><strong>Salarié :</strong> {formData.empName}, titulaire de la pièce n° {formData.empID}.</p>
                
                <h4 className="font-bold mt-8">ARTICLE 1 : CADRE JURIDIQUE</h4>
                <p>Le présent contrat est conclu en respect des dispositions du <strong>{activeLegal.codeLabel}</strong>.</p>
                
                <h4 className="font-bold mt-4">ARTICLE 2 : FONCTIONS</h4>
                <p>Le salarié exercera les fonctions de {formData.post}.</p>

                {formData.hasNonCompete && (
                  <>
                    <h4 className="font-bold mt-4">ARTICLE 3 : CLAUSE DE NON-CONCURRENCE</h4>
                    <p>En raison de la nature des fonctions exercées, le salarié s'interdit d'exercer une activité concurrente pour une durée de {formData.nonCompeteDuration} mois.</p>
                  </>
                )}

                <h4 className="font-bold mt-4">ARTICLE FINAL : COMPÉTENCE</h4>
                <p>{activeLegal.jurisdiction}</p>

                <p className="mt-20 text-center text-[9px] text-gray-400 italic">Document généré via ECODREUM RH Engine v2.0</p>
             </div>

             <div className="flex gap-4 pb-10">
               <button onClick={() => setStep(1)} className="flex-1 py-5 bg-white/5 border border-white/10 rounded-2xl font-bold uppercase text-[10px]">Modifier</button>
               <button onClick={exportToWord} className="flex-1 py-5 bg-blue-600 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3"><Download size={16}/> Word (.docx)</button>
               <button className="flex-1 py-5 bg-emerald-500 text-black rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3"><FileText size={16}/> PDF</button>
             </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #10b981; }
      `}</style>
    </div>
  );
}
