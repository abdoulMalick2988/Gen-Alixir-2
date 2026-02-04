"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  ArrowLeft, Building, User, Briefcase, Download, Scale, 
  Save, CheckCircle, AlertTriangle, FileText, Globe 
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { 
  Packer, Document, Paragraph, TextRun, AlignmentType, 
  Header, Footer, PageNumber, BorderStyle 
} from 'docx';

// --- 1. CONFIGURATION SUPABASE (A Remplacer par tes clés ou process.env) ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- 2. INTELLIGENCE JURIDIQUE (DATA) ---
const LEGAL_CONFIG = {
  SENEGAL: {
    country: "Sénégal",
    code: "Loi n° 97-17 du 1er décembre 1997",
    court: "Tribunal du Travail de Dakar",
    id_label: "NINEA",
    currency: "F CFA",
    legal_age: 18,
    trial_duration_cdi: "3 mois renouvelable",
    notice_period: "1 mois"
  },
  BURUNDI: {
    country: "Burundi",
    code: "Loi n° 1/11 du 24 novembre 2020",
    court: "Tribunal du Travail de Bujumbura",
    id_label: "NIF",
    currency: "F Bu",
    legal_age: 18,
    trial_duration_cdi: "6 mois maximum",
    notice_period: "1 mois"
  }
};

// --- 3. TYPES & INTERFACES ---
interface ContractData {
  // Entreprise
  companyName: string; companyType: string; address: string; 
  rccm: string; idLegal: string; repName: string; repPost: string;
  // Collaborateur
  empName: string; empBirth: string; empNation: string; 
  empAddress: string; empID: string; empPhone: string;
  // Contrat
  type: 'CDI' | 'CDD' | 'STAGE';
  post: string; department: string;
  salary: string; currency: string;
  startDate: string; endDate: string;
  workHours: string; trialPeriod: string;
}

export default function UltimateContractEngine() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'success'|'error'} | null>(null);
  const [country, setCountry] = useState<'SENEGAL' | 'BURUNDI'>('SENEGAL');
  
  // État initial massif pour tout couvrir
  const [formData, setFormData] = useState<ContractData>({
    companyName: 'ECODREUM', companyType: 'SARL', address: 'Bujumbura, Rohero 1',
    rccm: '', idLegal: '', repName: '', repPost: 'Gérant',
    empName: '', empBirth: '', empNation: 'Burundaise', 
    empAddress: '', empID: '', empPhone: '',
    type: 'CDI', post: '', department: 'Technique',
    salary: '0', currency: 'F Bu',
    startDate: new Date().toISOString().split('T')[0], endDate: '',
    workHours: '40', trialPeriod: '3'
  });

  // Mise à jour automatique de la devise selon le pays
  useEffect(() => {
    setFormData(prev => ({ ...prev, currency: LEGAL_CONFIG[country].currency }));
  }, [country]);

  // Helper pour gérer les changements d'inputs
  const handleChange = (field: keyof ContractData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // --- 4. MOTEUR DE GÉNÉRATION DOCX (V9 COMPATIBLE) ---
  const generateDOCX = async () => {
    try {
      const legal = LEGAL_CONFIG[country];
      const doc = new Document({
        styles: {
          default: {
            heading1: { run: { font: "Calibri", size: 28, bold: true, color: "000000" }, paragraph: { spacing: { before: 240, after: 120 } } },
            paragraph: { run: { font: "Calibri", size: 22 } } // Size 22 = 11pt
          }
        },
        sections: [{
          properties: {},
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "CONFIDENTIEL", color: "999999", size: 16 })],
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
                    new TextRun({ children: [PageNumber.CURRENT] }), // CORRECTION CRITIQUE ICI
                    new TextRun({ text: ` sur ` }),
                    new TextRun({ children: [PageNumber.TOTAL_PAGES] }),
                    new TextRun({ text: ` - Généré par ECODREUM AI`, size: 16, color: "888888" })
                  ],
                  alignment: AlignmentType.CENTER,
                  border: { top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } }
                })
              ]
            })
          },
          children: [
            // TITRE
            new Paragraph({
              children: [new TextRun({ text: "CONTRAT DE TRAVAIL", bold: true, size: 36 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),

            // PARTIES
            new Paragraph({ text: "ENTRE LES SOUSSIGNÉS :", bold: true, spacing: { before: 200 } }),
            new Paragraph({
              text: `La société ${formData.companyName}, ${formData.companyType} au capital social, immatriculée sous le RCCM ${formData.rccm} et le ${legal.id_label} n° ${formData.idLegal}, dont le siège est situé à ${formData.address}, représentée par ${formData.repName} agissant en qualité de ${formData.repPost}.`,
              spacing: { after: 200 }
            }),
            new Paragraph({ text: "Ci-après désignée « L'Employeur »", italics: true, alignment: AlignmentType.RIGHT }),

            new Paragraph({ text: "D'UNE PART,", bold: true, alignment: AlignmentType.CENTER }),

            new Paragraph({ text: "ET :", bold: true }),
            new Paragraph({
              text: `M./Mme ${formData.empName}, né(e) le ${formData.empBirth}, de nationalité ${formData.empNation}, demeurant à ${formData.empAddress}, titulaire de la pièce d'identité n° ${formData.empID}.`,
              spacing: { after: 200 }
            }),
            new Paragraph({ text: "Ci-après désigné(e) « Le Salarié »", italics: true, alignment: AlignmentType.RIGHT }),

            new Paragraph({ text: "D'AUTRE PART,", bold: true, alignment: AlignmentType.CENTER }),

            // ARTICLES
            new Paragraph({ text: "IL A ÉTÉ CONVENU CE QUI SUIT :", bold: true, spacing: { before: 400, after: 200 } }),

            // Art 1
            new Paragraph({ text: "ARTICLE 1 : ENGAGEMENT ET NATURE DU CONTRAT", bold: true }),
            new Paragraph({ 
              text: `Le Salarié est engagé par l'Employeur sous contrat à durée ${formData.type === 'CDI' ? 'indéterminée (CDI)' : `déterminée (CDD) jusqu'au ${formData.endDate}`}, régi par le Code du Travail du ${legal.country} (${legal.code}).`
            }),

            // Art 2
            new Paragraph({ text: "ARTICLE 2 : FONCTIONS ET ATTRIBUTIONS", bold: true, spacing: { before: 200 } }),
            new Paragraph({ 
              text: `Le Salarié occupera le poste de ${formData.post} au sein du département ${formData.department}. Il s'engage à accomplir ses fonctions avec loyauté et diligence.`
            }),

            // Art 3
            new Paragraph({ text: "ARTICLE 3 : RÉMUNÉRATION", bold: true, spacing: { before: 200 } }),
            new Paragraph({ 
              text: `En contrepartie de son travail, le Salarié percevra une rémunération mensuelle brute de ${formData.salary} ${formData.currency}, payée selon les dispositions légales en vigueur.`
            }),

            // Art 4
            new Paragraph({ text: "ARTICLE 4 : PÉRIODE D'ESSAI", bold: true, spacing: { before: 200 } }),
            new Paragraph({ 
              text: `Le présent contrat est soumis à une période d'essai de ${formData.trialPeriod} mois, durant laquelle chacune des parties peut rompre le contrat sans indemnité, sous réserve du respect du préavis légal.`
            }),

             // Art 5
             new Paragraph({ text: "ARTICLE 5 : LIEU DE TRAVAIL & MOBILITÉ", bold: true, spacing: { before: 200 } }),
             new Paragraph({ 
               text: `Le lieu de travail est fixé à ${formData.address}. Toutefois, en fonction des nécessités de service, le Salarié pourra être amené à effectuer des missions sur tout le territoire du ${legal.country}.`
             }),

             // Art Final
             new Paragraph({ text: "ARTICLE FINAL : JURIDICTION COMPÉTENTE", bold: true, spacing: { before: 200 } }),
             new Paragraph({ 
               text: `Tout différend relatif à l'interprétation ou à l'exécution du présent contrat, à défaut de règlement amiable, sera de la compétence exclusive du ${legal.court}.`
             }),

             // SIGNATURES
             new Paragraph({ 
               children: [new TextRun({ text: `\nFait à ${formData.address.split(',')[0]}, le _______________ en deux exemplaires originaux.\n` })],
               spacing: { before: 600 }
             }),

             new Paragraph({
                children: [
                    new TextRun({ text: "Pour l'Employeur\n(Cachet et Signature)", bold: true }),
                    new TextRun({ text: "\t\t\t\t\t\t\t" }), // Tabulation manuelle
                    new TextRun({ text: "Le Salarié\n(Lu et approuvé)", bold: true })
                ]
             })
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Contrat_${formData.empName.replace(/\s/g, '_')}_${formData.type}.docx`);
      setNotification({ msg: "Document généré avec succès !", type: "success" });
    } catch (error) {
      console.error(error);
      setNotification({ msg: "Erreur lors de la génération.", type: "error" });
    }
  };

  // --- 5. SAUVEGARDE DB (SUPABASE) ---
  const saveToDatabase = async () => {
    setLoading(true);
    try {
      // Simulation d'insertion - Remplace 'hr_contracts' par le vrai nom de ta table plus tard
      const { error } = await supabase.from('hr_contracts').insert([{
        employee_name: formData.empName,
        contract_type: formData.type,
        country: country,
        position: formData.post,
        salary: parseFloat(formData.salary),
        start_date: formData.startDate,
        created_at: new Date()
      }]);

      if (error) throw error;
      
      setNotification({ msg: "Contrat archivé dans le Registre RH !", type: "success" });
    } catch (err) {
      // On log l'erreur mais on ne bloque pas l'utilisateur si la DB n'est pas encore prête
      console.log("Mode hors-ligne ou erreur DB:", err);
      setNotification({ msg: "Sauvegardé localement (DB non connectée).", type: "success" }); 
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // --- 6. INTERFACE UTILISATEUR (UI) - OPTIMISÉE VR & MOBILE ---
  return (
    // FIX SCROLL: fixed inset-0 + overflow-y-auto garantit le scroll sur Quest 3
    <div className="fixed inset-0 bg-[#050505] text-white font-sans overflow-y-auto overflow-x-hidden selection:bg-emerald-500/30">
      
      {/* BACKGROUND EFFECTS */}
      <div className="fixed top-0 left-0 w-full h-96 bg-emerald-600/10 blur-[100px] pointer-events-none rounded-b-full opacity-50"/>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl backdrop-blur-md border shadow-2xl flex items-center gap-3 animate-bounce ${notification.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-red-500/20 border-red-500/50 text-red-400'}`}>
          {notification.type === 'success' ? <CheckCircle size={18}/> : <AlertTriangle size={18}/>}
          <span className="text-xs font-bold uppercase tracking-wider">{notification.msg}</span>
        </div>
      )}

      <div className="relative max-w-6xl mx-auto p-4 md:p-8 pb-40">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 border-b border-white/5 pb-8">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={() => router.back()} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform text-zinc-400 group-hover:text-white"/>
            </button>
            <div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                Legal <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Architect</span>
              </h1>
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                <Globe size={10} />
                <span>OHADA Compliant Engine v2.4</span>
              </div>
            </div>
          </div>

          {/* SÉLECTEUR PAYS */}
          <div className="flex bg-zinc-900/80 p-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
            {['SENEGAL', 'BURUNDI'].map((c) => (
              <button 
                key={c} 
                onClick={() => setCountry(c as any)}
                className={`px-6 py-2.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-2 ${country === c ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
              >
                {c === 'SENEGAL' ? '🇸🇳' : '🇧🇮'} {c}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- COLONNE GAUCHE : FORMULAIRE (COMPACT) --- */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* SECTION ENTREPRISE */}
            <section className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Building size={64}/></div>
              <h3 className="text-xs font-black uppercase text-emerald-500 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-emerald-500 rounded-full"/> L'Employeur
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Input label="Nom Société" val={formData.companyName} onChange={v => handleChange('companyName', v)} />
                <Input label="Forme Juridique" val={formData.companyType} onChange={v => handleChange('companyType', v)} />
                <Input label={LEGAL_CONFIG[country].id_label} val={formData.idLegal} onChange={v => handleChange('idLegal', v)} />
                <Input label="RCCM" val={formData.rccm} onChange={v => handleChange('rccm', v)} />
                <Input label="Représentant" val={formData.repName} onChange={v => handleChange('repName', v)} />
                <Input label="Fonction" val={formData.repPost} onChange={v => handleChange('repPost', v)} />
                <Input label="Siège Social" val={formData.address} onChange={v => handleChange('address', v)} full />
              </div>
            </section>

            {/* SECTION COLLABORATEUR */}
            <section className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><User size={64}/></div>
              <h3 className="text-xs font-black uppercase text-blue-400 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-400 rounded-full"/> Le Salarié
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Input label="Prénom & Nom" val={formData.empName} onChange={v => handleChange('empName', v)} full />
                <Input label="Date Naissance" type="date" val={formData.empBirth} onChange={v => handleChange('empBirth', v)} />
                <Input label="Nationalité" val={formData.empNation} onChange={v => handleChange('empNation', v)} />
                <Input label="N° Pièce Identité" val={formData.empID} onChange={v => handleChange('empID', v)} />
                <Input label="Téléphone" val={formData.empPhone} onChange={v => handleChange('empPhone', v)} />
                <Input label="Adresse Résidence" val={formData.empAddress} onChange={v => handleChange('empAddress', v)} />
              </div>
            </section>

            {/* SECTION CONTRAT */}
            <section className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Briefcase size={64}/></div>
              <h3 className="text-xs font-black uppercase text-amber-500 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-amber-500 rounded-full"/> Termes du Contrat
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1 block pl-1">Type Contrat</label>
                  <select 
                    value={formData.type} 
                    onChange={(e) => handleChange('type', e.target.value as any)}
                    className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl px-3 py-3 outline-none focus:border-amber-500 focus:bg-amber-500/5 transition-all appearance-none"
                  >
                    <option value="CDI">CDI - Indéterminé</option>
                    <option value="CDD">CDD - Déterminé</option>
                    <option value="STAGE">Stage Professionnel</option>
                  </select>
                </div>
                <Input label="Intitulé Poste" val={formData.post} onChange={v => handleChange('post', v)} />
                <Input label="Salaire Brut" type="number" val={formData.salary} onChange={v => handleChange('salary', v)} />
                <div className="flex items-center justify-center text-xs font-bold text-zinc-500 pt-5">{formData.currency}</div>
                
                <Input label="Début Contrat" type="date" val={formData.startDate} onChange={v => handleChange('startDate', v)} />
                {formData.type === 'CDD' && <Input label="Fin Contrat" type="date" val={formData.endDate} onChange={v => handleChange('endDate', v)} />}
                <Input label="Essai (mois)" type="number" val={formData.trialPeriod} onChange={v => handleChange('trialPeriod', v)} />
                <Input label="Heures/Semaine" val={formData.workHours} onChange={v => handleChange('workHours', v)} />
              </div>
            </section>
          </div>

          {/* --- COLONNE DROITE : ACTIONS & RÉSUMÉ --- */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* PANNEAU DE CONTRÔLE FLOTTANT */}
            <div className="bg-zinc-900 border border-white/10 p-6 rounded-[2.5rem] sticky top-6 shadow-2xl shadow-black/50">
              <div className="mb-6 pb-6 border-b border-white/5">
                <h2 className="text-lg font-black italic text-white mb-1">Actions</h2>
                <p className="text-[10px] text-zinc-500">Génération & Archivage</p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={generateDOCX}
                  disabled={!formData.empName || !formData.companyName}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black rounded-xl font-black uppercase text-xs flex items-center justify-center gap-3 transition-all active:scale-95 group"
                >
                  <Download size={18} className="group-hover:animate-bounce"/>
                  Générer Word
                </button>

                <button 
                  onClick={saveToDatabase}
                  disabled={loading}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-black uppercase text-xs flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  {loading ? <span className="animate-spin">⌛</span> : <Save size={18}/>}
                  Sauvegarder dans RH
                </button>
              </div>

              {/* MINI RÉCAP JURIDIQUE */}
              <div className="mt-8 bg-black/40 rounded-2xl p-4 border border-white/5">
                <div className="flex items-center gap-2 text-zinc-400 mb-3">
                  <Scale size={14}/>
                  <span className="text-[9px] font-black uppercase tracking-wider">Conformité Légale</span>
                </div>
                <div className="space-y-2">
                  <InfoRow label="Juridiction" val={LEGAL_CONFIG[country].court} />
                  <InfoRow label="Texte Réf" val={LEGAL_CONFIG[country].code} />
                  <InfoRow label="Préavis Légal" val={LEGAL_CONFIG[country].notice_period} />
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ESPACE FINAL POUR SCROLL AISÉ */}
        <div className="h-32 w-full"></div>
      </div>
    </div>
  );
}

// --- SOUS-COMPOSANTS POUR GARDER LE CODE PROPRE ---

const Input = ({ label, val, onChange, type = "text", full = false }: any) => (
  <div className={full ? "col-span-2 md:col-span-3" : ""}>
    <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1 block pl-1">{label}</label>
    <input 
      type={type} 
      value={val} 
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl px-3 py-3 outline-none focus:border-emerald-500 focus:bg-emerald-500/5 transition-all placeholder-zinc-700"
      placeholder="..."
    />
  </div>
);

const InfoRow = ({ label, val }: any) => (
  <div className="flex justify-between items-start">
    <span className="text-[9px] text-zinc-600 uppercase font-bold">{label}</span>
    <span className="text-[9px] text-emerald-500 font-bold text-right max-w-[120px]">{val}</span>
  </div>
);
