// ==========================================
// PARTIE 1/3 - IMPORTS, TYPES ET ÉTAT INITIAL
// ==========================================
// Copiez cette partie en premier

'use client'

import React, { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  FileText, 
  Building2, 
  User, 
  Calendar, 
  DollarSign, 
  Upload, 
  Download, 
  Check,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Hash,
  Clock,
  Edit3,
  Save,
  Printer,
  FileSignature,
  Globe,
  X,
  Image as ImageIcon,
  RotateCcw
} from 'lucide-react'
import SignatureCanvas from 'react-signature-canvas'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

// Types
type Juridiction = 'senegal' | 'burundi'
type TypeGeneration = 'electronique' | 'imprimer'
type TypeContrat = 'cdd' | 'cdi' | 'stage'

interface FormData {
  // Configuration
  juridiction: Juridiction
  typeGeneration: TypeGeneration
  typeContrat: TypeContrat
  
  // Entreprise
  entrepriseLogo: string
  entrepriseNom: string
  entrepriseDescription: string
  entrepriseFormeJuridique: string
  entrepriseCapital: string
  entrepriseAdresse: string
  entrepriseRCCM: string
  entrepriseNIF: string
  entrepriseRepresentantNom: string
  entrepriseRepresentantQualite: string
  
  // Employé
  employePrenom: string
  employeNom: string
  employeDateNaissance: string
  employeLieuNaissance: string
  employeNationalite: string
  employePermis: string
  employePieceIdentite: string
  employeAdresse: string
  employeTelephone: string
  employeEmail: string
  employeExperience: string
  employeFonction: string
  employeDepartement: string
  
  // Contrat
  contratDateDebut: string
  contratDateFin: string
  contratSalaire: string
  contratDevise: string
  contratAvantages: string
  contratPrimes: string
  contratDureeHebdo: string
  contratTaches: string
  contratLieuTravail: string
  
  // Signatures
  signatureEmployeur: string
  signatureEmploye: string
}

// Constantes juridiques
const JURIDICTIONS = {
  senegal: {
    name: 'Sénégal',
    flag: '🇸🇳',
    loi: 'Loi n°97-17 du 1er décembre 1997 portant Code du Travail',
    tribunal: 'Tribunal du Travail de Dakar',
    devise: 'FCFA',
  },
  burundi: {
    name: 'Burundi',
    flag: '🇧🇮',
    loi: 'Loi n° 1/11 du 24 novembre 2020 portant Code du Travail du Burundi',
    tribunal: 'Tribunal du Travail de Bujumbura',
    devise: 'FBu',
  }
}

const TYPES_CONTRAT = {
  stage: 'Convention de Stage',
  cdi: 'Contrat à Durée Indéterminée (CDI)',
  cdd: 'Contrat à Durée Déterminée (CDD)',
}

export default function GenerateurContrat() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  
  const sigEmployeurRef = useRef<SignatureCanvas>(null)
  const sigEmployeRef = useRef<SignatureCanvas>(null)
  const contratRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState<FormData>({
    juridiction: 'burundi',
    typeGeneration: 'electronique',
    typeContrat: 'stage',
    entrepriseLogo: '',
    entrepriseNom: '',
    entrepriseDescription: '',
    entrepriseFormeJuridique: 'SARL',
    entrepriseCapital: '',
    entrepriseAdresse: '',
    entrepriseRCCM: '',
    entrepriseNIF: '',
    entrepriseRepresentantNom: '',
    entrepriseRepresentantQualite: 'Gérant',
    employePrenom: '',
    employeNom: '',
    employeDateNaissance: '',
    employeLieuNaissance: '',
    employeNationalite: '',
    employePermis: '',
    employePieceIdentite: '',
    employeAdresse: '',
    employeTelephone: '',
    employeEmail: '',
    employeExperience: '',
    employeFonction: '',
    employeDepartement: '',
    contratDateDebut: '',
    contratDateFin: '',
    contratSalaire: '',
    contratDevise: 'FBu',
    contratAvantages: '',
    contratPrimes: '',
    contratDureeHebdo: '40',
    contratTaches: '',
    contratLieuTravail: '',
    signatureEmployeur: '',
    signatureEmploye: '',
  })

  // Mise à jour du formulaire
  const updateForm = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Upload logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `logos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('contract-files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('contract-files')
        .getPublicUrl(filePath)

      updateForm('entrepriseLogo', publicUrl)
    } catch (error) {
      console.error('Erreur upload:', error)
      alert('Erreur lors de l\'upload du logo')
    } finally {
      setLoading(false)
    }
  }

  // Formater la date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  // Formater la date en toutes lettres
  const formatDateLong = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  // FIN DE LA PARTIE 1
  // ==========================================
// PARTIE 2/3 - COMPOSANTS ET LOGIQUE
// ==========================================
// Copiez cette partie après la PARTIE 1

  // Validation des étapes
  const validateStep = (stepNumber: number): boolean => {
    if (stepNumber === 1) {
      return !!(formData.entrepriseNom && formData.entrepriseFormeJuridique && 
                formData.entrepriseCapital && formData.entrepriseAdresse && 
                formData.entrepriseRCCM && formData.entrepriseNIF &&
                formData.entrepriseRepresentantNom)
    }
    if (stepNumber === 2) {
      return !!(formData.employePrenom && formData.employeNom && 
                formData.employeDateNaissance && formData.employeLieuNaissance &&
                formData.employeNationalite && formData.employePieceIdentite &&
                formData.employeAdresse && formData.employeTelephone &&
                formData.employeEmail && formData.employeFonction && 
                formData.employeDepartement && formData.employeExperience)
    }
    if (stepNumber === 3) {
      const baseValid = !!(formData.contratDateDebut && formData.contratSalaire && 
                           formData.contratDureeHebdo && formData.contratTaches &&
                           formData.contratLieuTravail)
      if (formData.typeContrat !== 'cdi') {
        return baseValid && !!formData.contratDateFin
      }
      return baseValid
    }
    return true
  }

  // Navigation
  const nextStep = () => {
    if (validateStep(step)) {
      if (step < 4) setStep(step + 1)
    } else {
      alert('Veuillez remplir tous les champs obligatoires')
    }
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  // Sauvegarder les signatures
  const saveSignatureEmployeur = () => {
    if (sigEmployeurRef.current && !sigEmployeurRef.current.isEmpty()) {
      const sig = sigEmployeurRef.current.toDataURL('image/png')
      updateForm('signatureEmployeur', sig)
    }
  }

  const saveSignatureEmploye = () => {
    if (sigEmployeRef.current && !sigEmployeRef.current.isEmpty()) {
      const sig = sigEmployeRef.current.toDataURL('image/png')
      updateForm('signatureEmploye', sig)
    }
  }

  // Effacer signature
  const clearSignature = (type: 'employeur' | 'employe') => {
    if (type === 'employeur' && sigEmployeurRef.current) {
      sigEmployeurRef.current.clear()
      updateForm('signatureEmployeur', '')
    } else if (type === 'employe' && sigEmployeRef.current) {
      sigEmployeRef.current.clear()
      updateForm('signatureEmploye', '')
    }
  }

  // Générer le PDF
  const generatePDF = async () => {
    if (!contratRef.current) return

    setLoading(true)
    try {
      const canvas = await html2canvas(contratRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 0

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      
      const fileName = `Contrat_${formData.employeNom}_${formData.employePrenom}_${new Date().getTime()}.pdf`
      pdf.save(fileName)
      
      alert('PDF généré avec succès !')
    } catch (error) {
      console.error('Erreur génération PDF:', error)
      alert('Erreur lors de la génération du PDF')
    } finally {
      setLoading(false)
    }
  }

  // Sauvegarder dans Supabase
  const saveToSupabase = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('contracts')
        .insert([
          {
            juridiction: formData.juridiction,
            type_generation: formData.typeGeneration,
            type_contrat: formData.typeContrat,
            entreprise_logo_url: formData.entrepriseLogo,
            entreprise_nom: formData.entrepriseNom,
            entreprise_description: formData.entrepriseDescription,
            entreprise_forme_juridique: formData.entrepriseFormeJuridique,
            entreprise_capital: formData.entrepriseCapital,
            entreprise_adresse: formData.entrepriseAdresse,
            entreprise_rccm: formData.entrepriseRCCM,
            entreprise_nif: formData.entrepriseNIF,
            entreprise_representant_nom: formData.entrepriseRepresentantNom,
            entreprise_representant_qualite: formData.entrepriseRepresentantQualite,
            employe_prenom: formData.employePrenom,
            employe_nom: formData.employeNom,
            employe_date_naissance: formData.employeDateNaissance,
            employe_lieu_naissance: formData.employeLieuNaissance,
            employe_nationalite: formData.employeNationalite,
            employe_permis_travail: formData.employePermis,
            employe_piece_identite: formData.employePieceIdentite,
            employe_adresse: formData.employeAdresse,
            employe_telephone: formData.employeTelephone,
            employe_email: formData.employeEmail,
            employe_experience: formData.employeExperience,
            employe_fonction: formData.employeFonction,
            employe_departement: formData.employeDepartement,
            contrat_date_debut: formData.contratDateDebut,
            contrat_date_fin: formData.contratDateFin,
            contrat_salaire: parseFloat(formData.contratSalaire),
            contrat_devise: formData.contratDevise,
            contrat_avantages: formData.contratAvantages,
            contrat_primes: formData.contratPrimes,
            contrat_duree_hebdo: parseInt(formData.contratDureeHebdo),
            contrat_taches: formData.contratTaches,
            contrat_lieu_travail: formData.contratLieuTravail,
            signature_employeur: formData.signatureEmployeur,
            signature_employe: formData.signatureEmploye,
            date_signature: new Date().toISOString(),
          },
        ])
        .select()

      if (error) throw error
      alert('Contrat sauvegardé avec succès !')
      return data
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  // Composant Input
  const Input = ({ label, value, onChange, type = 'text', required = false, placeholder = '', rows = 1 }: any) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {rows > 1 ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required={required}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required={required}
        />
      )}
    </div>
  )

  // Composant Select
  const Select = ({ label, value, onChange, options, required = false }: any) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required={required}
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )

  // FIN DE LA PARTIE 2
  // ==========================================
// PARTIE 3/3 - INTERFACE UTILISATEUR
// ==========================================
// Copiez cette partie après la PARTIE 2

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileSignature className="w-8 h-8 text-blue-600" />
                Générateur de Contrat Professionnel
              </h1>
              <p className="text-gray-600 mt-1">Créez des contrats conformes aux législations locales</p>
            </div>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              {previewMode ? <Edit3 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              {previewMode ? 'Modifier' : 'Aperçu'}
            </button>
          </div>

          {/* Configuration principale */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Juridiction"
              value={formData.juridiction}
              onChange={(val: string) => {
                updateForm('juridiction', val)
                updateForm('contratDevise', JURIDICTIONS[val as Juridiction].devise)
              }}
              options={[
                { value: 'burundi', label: `🇧🇮 ${JURIDICTIONS.burundi.name}` },
                { value: 'senegal', label: `🇸🇳 ${JURIDICTIONS.senegal.name}` },
              ]}
              required
            />

            <Select
              label="Type de contrat"
              value={formData.typeContrat}
              onChange={(val: string) => updateForm('typeContrat', val)}
              options={[
                { value: 'stage', label: TYPES_CONTRAT.stage },
                { value: 'cdi', label: TYPES_CONTRAT.cdi },
                { value: 'cdd', label: TYPES_CONTRAT.cdd },
              ]}
              required
            />

            <Select
              label="Méthode de génération"
              value={formData.typeGeneration}
              onChange={(val: string) => updateForm('typeGeneration', val)}
              options={[
                { value: 'electronique', label: '📱 Signature électronique' },
                { value: 'imprimer', label: '🖨️ À imprimer' },
              ]}
              required
            />
          </div>
        </div>

        {!previewMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-4 sticky top-8">
                <nav className="space-y-2">
                  {[
                    { num: 1, icon: Building2, label: 'Entreprise' },
                    { num: 2, icon: User, label: 'Employé' },
                    { num: 3, icon: Briefcase, label: 'Contrat' },
                    { num: 4, icon: FileSignature, label: 'Finaliser' },
                  ].map((item) => (
                    <button
                      key={item.num}
                      onClick={() => setStep(item.num)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        step === item.num
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <div className="text-left">
                        <div className="text-xs opacity-75">Étape {item.num}</div>
                        <div className="font-medium">{item.label}</div>
                      </div>
                      {validateStep(item.num) && step !== item.num && (
                        <Check className="w-4 h-4 ml-auto text-green-500" />
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Formulaire */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                {/* Étape 1: Entreprise */}
                {step === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <Building2 className="w-7 h-7 text-blue-600" />
                      Informations de l'entreprise
                    </h2>

                    {/* Logo upload */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo de l'entreprise
                      </label>
                      {formData.entrepriseLogo ? (
                        <div className="relative inline-block">
                          <img
                            src={formData.entrepriseLogo}
                            alt="Logo"
                            className="h-24 w-auto object-contain border-2 border-gray-200 rounded-lg p-2"
                          />
                          <button
                            onClick={() => updateForm('entrepriseLogo', '')}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">Cliquez pour uploader</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleLogoUpload}
                          />
                        </label>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Nom de l'entreprise"
                        value={formData.entrepriseNom}
                        onChange={(val: string) => updateForm('entrepriseNom', val)}
                        placeholder="ECODREUM"
                        required
                      />

                      <Select
                        label="Forme juridique"
                        value={formData.entrepriseFormeJuridique}
                        onChange={(val: string) => updateForm('entrepriseFormeJuridique', val)}
                        options={[
                          { value: 'SARL', label: 'SARL' },
                          { value: 'SA', label: 'SA' },
                          { value: 'SAS', label: 'SAS' },
                          { value: 'SNC', label: 'SNC' },
                          { value: 'EI', label: 'Entreprise Individuelle' },
                        ]}
                        required
                      />

                      <Input
                        label="Capital social"
                        value={formData.entrepriseCapital}
                        onChange={(val: string) => updateForm('entrepriseCapital', val)}
                        placeholder="1 000 000 FBu"
                        required
                      />

                      <Input
                        label="RCCM"
                        value={formData.entrepriseRCCM}
                        onChange={(val: string) => updateForm('entrepriseRCCM', val)}
                        placeholder="BJ/BJM/9284/24"
                        required
                      />

                      <Input
                        label="NIF"
                        value={formData.entrepriseNIF}
                        onChange={(val: string) => updateForm('entrepriseNIF', val)}
                        placeholder="00045282"
                        required
                      />

                      <Input
                        label="Nom du représentant"
                        value={formData.entrepriseRepresentantNom}
                        onChange={(val: string) => updateForm('entrepriseRepresentantNom', val)}
                        placeholder="Malick THIAM"
                        required
                      />

                      <Input
                        label="Qualité du représentant"
                        value={formData.entrepriseRepresentantQualite}
                        onChange={(val: string) => updateForm('entrepriseRepresentantQualite', val)}
                        placeholder="Gérant"
                        required
                      />
                    </div>

                    <Input
                      label="Adresse complète"
                      value={formData.entrepriseAdresse}
                      onChange={(val: string) => updateForm('entrepriseAdresse', val)}
                      placeholder="Bujumbura, Rohero 1"
                      required
                    />

                    <Input
                      label="Description de l'entreprise"
                      value={formData.entrepriseDescription}
                      onChange={(val: string) => updateForm('entrepriseDescription', val)}
                      placeholder="Leader en solutions digitales innovantes..."
                      rows={3}
                    />
                  </div>
                )}

                {/* Étape 2: Employé */}
                {step === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <User className="w-7 h-7 text-blue-600" />
                      Informations de l'employé(e)
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Prénom"
                        value={formData.employePrenom}
                        onChange={(val: string) => updateForm('employePrenom', val)}
                        placeholder="Aminata"
                        required
                      />

                      <Input
                        label="Nom"
                        value={formData.employeNom}
                        onChange={(val: string) => updateForm('employeNom', val)}
                        placeholder="FALL"
                        required
                      />

                      <Input
                        label="Date de naissance"
                        type="date"
                        value={formData.employeDateNaissance}
                        onChange={(val: string) => updateForm('employeDateNaissance', val)}
                        required
                      />

                      <Input
                        label="Lieu de naissance"
                        value={formData.employeLieuNaissance}
                        onChange={(val: string) => updateForm('employeLieuNaissance', val)}
                        placeholder="Dakar"
                        required
                      />

                      <Input
                        label="Nationalité"
                        value={formData.employeNationalite}
                        onChange={(val: string) => updateForm('employeNationalite', val)}
                        placeholder="Sénégalaise"
                        required
                      />

                      <Input
                        label="Permis de travail (si applicable)"
                        value={formData.employePermis}
                        onChange={(val: string) => updateForm('employePermis', val)}
                        placeholder="Br2873943"
                      />

                      <Input
                        label="Pièce d'identité"
                        value={formData.employePieceIdentite}
                        onChange={(val: string) => updateForm('employePieceIdentite', val)}
                        placeholder="A0123828923"
                        required
                      />

                      <Input
                        label="Téléphone"
                        value={formData.employeTelephone}
                        onChange={(val: string) => updateForm('employeTelephone', val)}
                        placeholder="+25763146258"
                        required
                      />

                      <Input
                        label="Email"
                        type="email"
                        value={formData.employeEmail}
                        onChange={(val: string) => updateForm('employeEmail', val)}
                        placeholder="abdoulmalick2977@gmail.com"
                        required
                      />

                      <Input
                        label="Fonction"
                        value={formData.employeFonction}
                        onChange={(val: string) => updateForm('employeFonction', val)}
                        placeholder="Développeur Senior"
                        required
                      />

                      <Input
                        label="Département"
                        value={formData.employeDepartement}
                        onChange={(val: string) => updateForm('employeDepartement', val)}
                        placeholder="Technique"
                        required
                      />

                      <Input
                        label="Expérience"
                        value={formData.employeExperience}
                        onChange={(val: string) => updateForm('employeExperience', val)}
                        placeholder="5 ans à Experience"
                        required
                      />
                    </div>

                    <Input
                      label="Adresse complète"
                      value={formData.employeAdresse}
                      onChange={(val: string) => updateForm('employeAdresse', val)}
                      placeholder="Ngagara avenue 10e, 23"
                      required
                    />
                  </div>
                )}

                {/* Étape 3: Contrat */}
                {step === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <Briefcase className="w-7 h-7 text-blue-600" />
                      Détails du contrat
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Date de début"
                        type="date"
                        value={formData.contratDateDebut}
                        onChange={(val: string) => updateForm('contratDateDebut', val)}
                        required
                      />

                      {formData.typeContrat !== 'cdi' && (
                        <Input
                          label="Date de fin"
                          type="date"
                          value={formData.contratDateFin}
                          onChange={(val: string) => updateForm('contratDateFin', val)}
                          required
                        />
                      )}

                      <Input
                        label={`Salaire mensuel (${formData.contratDevise})`}
                        type="number"
                        value={formData.contratSalaire}
                        onChange={(val: string) => updateForm('contratSalaire', val)}
                        placeholder="100000"
                        required
                      />

                      <Input
                        label="Durée hebdomadaire (heures)"
                        type="number"
                        value={formData.contratDureeHebdo}
                        onChange={(val: string) => updateForm('contratDureeHebdo', val)}
                        placeholder="40"
                        required
                      />

                      <Input
                        label="Lieu de travail"
                        value={formData.contratLieuTravail}
                        onChange={(val: string) => updateForm('contratLieuTravail', val)}
                        placeholder="Bujumbura Rohero 2"
                        required
                      />

                      <Input
                        label="Avantages"
                        value={formData.contratAvantages}
                        onChange={(val: string) => updateForm('contratAvantages', val)}
                        placeholder="Transport"
                      />

                      <Input
                        label="Primes (si applicable)"
                        value={formData.contratPrimes}
                        onChange={(val: string) => updateForm('contratPrimes', val)}
                        placeholder="Prime de performance trimestrielle"
                        rows={2}
                      />
                    </div>

                    <Input
                      label="Tâches et missions"
                      value={formData.contratTaches}
                      onChange={(val: string) => updateForm('contratTaches', val)}
                      placeholder="Recueillir des données sur le terrain..."
                      rows={4}
                      required
                    />
                  </div>
                )}

                {/* Étape 4: Signatures */}
                {step === 4 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <FileSignature className="w-7 h-7 text-blue-600" />
                      Finalisation et signatures
                    </h2>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-blue-900">Contrat prêt à être finalisé</h3>
                          <p className="text-sm text-blue-700 mt-1">
                            {formData.typeGeneration === 'electronique' 
                              ? 'Signez électroniquement ci-dessous puis téléchargez le PDF'
                              : 'Téléchargez le PDF pour impression et signature manuelle'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {formData.typeGeneration === 'electronique' && (
                      <div className="space-y-6">
                        {/* Signature Employeur */}
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-gray-700">
                              Signature de l'Employeur
                            </label>
                            {formData.signatureEmployeur && (
                              <button
                                onClick={() => clearSignature('employeur')}
                                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Effacer
                              </button>
                            )}
                          </div>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white overflow-hidden">
                            <SignatureCanvas
                              ref={sigEmployeurRef}
                              canvasProps={{
                                className: 'w-full h-40 touch-none cursor-crosshair',
                                style: { touchAction: 'none' }
                              }}
                              backgroundColor="rgba(255, 255, 255, 1)"
                              penColor="rgb(0, 0, 0)"
                              dotSize={1}
                              minWidth={0.5}
                              maxWidth={2.5}
                              throttle={16}
                              velocityFilterWeight={0.7}
                              onEnd={saveSignatureEmployeur}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">✓ Signez avec votre doigt ou stylet</p>
                        </div>

                        {/* Signature Employé */}
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-gray-700">
                              Signature de l'Employé(e)
                            </label>
                            {formData.signatureEmploye && (
                              <button
                                onClick={() => clearSignature('employe')}
                                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Effacer
                              </button>
                            )}
                          </div>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white overflow-hidden">
                            <SignatureCanvas
                              ref={sigEmployeRef}
                              canvasProps={{
                                className: 'w-full h-40 touch-none cursor-crosshair',
                                style: { touchAction: 'none' }
                              }}
                              backgroundColor="rgba(255, 255, 255, 1)"
                              penColor="rgb(0, 0, 0)"
                              dotSize={1}
                              minWidth={0.5}
                              maxWidth={2.5}
                              throttle={16}
                              velocityFilterWeight={0.7}
                              onEnd={saveSignatureEmploye}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">✓ Signez avec votre doigt ou stylet</p>
                        </div>
                      </div>
                    )}

                    {/* Actions finales */}
                    <div className="mt-8 flex gap-4">
                      <button
                        onClick={generatePDF}
                        disabled={loading || (formData.typeGeneration === 'electronique' && 
                                 (!formData.signatureEmployeur || !formData.signatureEmploye))}
                        className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Génération en cours...
                          </>
                        ) : (
                          <>
                            <Download className="w-5 h-5" />
                            Télécharger PDF
                          </>
                        )}
                      </button>

                      <button
                        onClick={saveToSupabase}
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
                      >
                        <Save className="w-5 h-5" />
                        Sauvegarder
                      </button>
                    </div>
                  </div>
                )}

                {/* Navigation entre étapes */}
                {step < 4 && (
                  <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={prevStep}
                      disabled={step === 1}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Précédent
                    </button>

                    <button
                      onClick={nextStep}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      Suivant
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Aperçu du contrat
          <div ref={contratRef} className="bg-white rounded-2xl shadow-2xl p-12 max-w-4xl mx-auto">
            {/* En-tête avec logo */}
            <div className="flex items-start justify-between mb-8">
              {formData.entrepriseLogo && (
                <img src={formData.entrepriseLogo} alt="Logo" className="h-16 w-auto object-contain" />
              )}
              <div className="text-right text-xs text-gray-600">
                <div>ECO-MLB701IN-1US880VA-C742</div>
                <div>ECODREUM Engine V1</div>
              </div>
            </div>

            {/* Titre */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">
                {formData.typeContrat === 'stage' && 'CONVENTION DE STAGE'}
                {formData.typeContrat === 'cdi' && 'CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE'}
                {formData.typeContrat === 'cdd' && 'CONTRAT DE TRAVAIL À DURÉE DÉTERMINÉE'}
              </h1>
              <p className="text-sm text-gray-600">
                RÉGIME : {formData.typeContrat === 'stage' ? 'CONVENTION DE STAGE' : 
                          formData.typeContrat === 'cdi' ? 'CONTRAT À DURÉE INDÉTERMINÉE' : 
                          'CONTRAT À DURÉE DÉTERMINÉE'}
              </p>
              <p className="text-xs text-gray-500 mt-2 italic">
                {JURIDICTIONS[formData.juridiction].loi}
              </p>
            </div>

            {/* Parties */}
            <div className="mb-6">
              <h2 className="font-bold text-sm mb-3">ENTRE LES SOUSSIGNÉS :</h2>
              
              <p className="text-sm mb-4">
                La société <strong>{formData.entrepriseNom}</strong>, {formData.entrepriseFormeJuridique}, 
                au capital social de <strong>{formData.entrepriseCapital}</strong>, dont le siège social 
                est situé à <strong>{formData.entrepriseAdresse}</strong>, immatriculée au Registre de Commerce 
                et du Crédit Mobilier (RCCM) sous le numéro <strong>{formData.entrepriseRCCM}</strong> et 
                identifiée au NIF sous le numéro <strong>{formData.entrepriseNIF}</strong>, représentée 
                aux présentes par <strong>M./Mme {formData.entrepriseRepresentantNom}</strong>, agissant 
                en sa qualité de <strong>{formData.entrepriseRepresentantQualite}</strong>, dûment habilité(e).
              </p>

              <p className="text-center text-sm italic mb-4">
                Ci-après dénommée « {formData.typeContrat === 'stage' ? 'L\'ENTREPRISE D\'ACCUEIL' : 'L\'EMPLOYEUR'} »
              </p>

              <p className="text-center font-bold text-sm mb-4">D'UNE PART,</p>
              <p className="text-center font-bold text-sm mb-4">ET :</p>

              <p className="text-sm mb-4">
                <strong>M./Mme {formData.employePrenom} {formData.employeNom}</strong>, né(e) 
                le <strong>{formatDateLong(formData.employeDateNaissance)}</strong> à <strong>{formData.employeLieuNaissance}</strong>, 
                de nationalité <strong>{formData.employeNationalite}</strong>
                {formData.employePermis && `, titulaire du permis de travail n°${formData.employePermis}`}, 
                titulaire de la pièce d'identité nationale n°<strong>{formData.employePieceIdentite}</strong>, 
                demeurant à <strong>{formData.employeAdresse}</strong>, joignable au <strong>{formData.employeTelephone}</strong> et 
                par courrier électronique à l'adresse <strong>{formData.employeEmail}</strong>. Actuellement 
                inscrit(e) en <strong>{formData.employeExperience}</strong>.
              </p>

              <p className="text-center text-sm italic mb-4">
                Ci-après dénommé(e) « {formData.typeContrat === 'stage' ? 'LE/LA STAGIAIRE' : 'LE/LA SALARIÉ(E)'} »
              </p>

              <p className="text-center font-bold text-sm mb-6">D'AUTRE PART,</p>
            </div>

            {/* Vu la loi */}
            <p className="text-sm text-center mb-6">
              Vu la <strong>{JURIDICTIONS[formData.juridiction].loi}</strong>
            </p>

            <h2 className="font-bold text-sm mb-3 text-center">IL A ÉTÉ ARRÊTÉ ET CONVENU CE QUI SUIT :</h2>

            {/* Articles */}
            <div className="space-y-6 text-sm">
              {/* Article 1 */}
              <div>
                <h3 className="font-bold mb-2">ARTICLE 1 : OBJET ET ENGAGEMENT</h3>
                <p>
                  La présente convention a pour objet de définir les conditions dans lesquelles <strong>
                  {formData.employePrenom} {formData.employeNom}</strong> effectuera {formData.typeContrat === 'stage' ? 'un stage' : 'son travail'} au 
                  sein de {formData.entrepriseNom}, dans le cadre de sa formation en <strong>{formData.employeExperience}</strong>.
                </p>
              </div>

              {/* Article 2 */}
              <div>
                <h3 className="font-bold mb-2">ARTICLE 2 : FONCTIONS ET TÂCHES</h3>
                <p className="mb-2">
                  Le/La {formData.typeContrat === 'stage' ? 'Stagiaire' : 'Salarié(e)'} exercera les fonctions 
                  de <strong>{formData.employeFonction}</strong> au sein du département <strong>{formData.employeDepartement}</strong>, 
                  dans les locaux situés à <strong>{formData.contratLieuTravail}</strong>.
                </p>
                <p className="font-semibold mt-3 mb-1">Tâches et missions confiées :</p>
                <p className="whitespace-pre-line">{formData.contratTaches}</p>
              </div>

              {/* Article 3 */}
              <div>
                <h3 className="font-bold mb-2">ARTICLE 3 : DURÉE ET PÉRIODE D'ESSAI</h3>
                <p>
                  Le présent {formData.typeContrat === 'stage' ? 'stage' : 'contrat'} prend effet à compter 
                  du <strong>{formatDateLong(formData.contratDateDebut)}</strong> et prendra fin 
                  le <strong>{formData.contratDateFin ? formatDateLong(formData.contratDateFin) : 'sans limitation de durée (CDI)'}</strong>.
                </p>
              </div>

              {/* Article 4 */}
              <div>
                <h3 className="font-bold mb-2">ARTICLE 4 : GRATIFICATION</h3>
                <p>
                  Le/La {formData.typeContrat === 'stage' ? 'Stagiaire' : 'Salarié(e)'} percevra une 
                  gratification mensuelle de <strong>{formData.contratSalaire} {formData.contratDevise}</strong> ({formData.contratSalaire} {formData.contratDevise}).
                </p>
                {formData.contratAvantages && (
                  <p className="mt-2">Avantages : <strong>{formData.contratAvantages}</strong>.</p>
                )}
                {formData.contratPrimes && (
                  <p className="mt-2">Primes : {formData.contratPrimes}</p>
                )}
              </div>

              {/* Article 5 */}
              <div>
                <h3 className="font-bold mb-2">ARTICLE 5 : DURÉE DU TRAVAIL</h3>
                <p>
                  La durée hebdomadaire de travail est fixée à <strong>{formData.contratDureeHebdo} heures</strong>.
                </p>
              </div>

              {/* Article 6 */}
              <div>
                <h3 className="font-bold mb-2">ARTICLE 6 : OBLIGATIONS DES PARTIES</h3>
                
                <p className="font-semibold mt-3 mb-2">6.1. Obligations de l'Employeur :</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Fournir au Salarié le travail convenu ainsi que les moyens nécessaires à son exécution</li>
                  <li>Verser la rémunération due aux échéances convenues conformément à la législation en vigueur</li>
                  <li>Respecter la législation du travail et les conventions collectives applicables au Burundi</li>
                  <li>Assurer la sécurité et protéger la santé physique et mentale du Salarié sur le lieu de travail</li>
                  <li>Déclarer le Salarié à l'INSS (Institut National de Sécurité Sociale) dans les délais légaux</li>
                  <li>Délivrer au Salarié un bulletin de paie détaillé à chaque échéance de paiement</li>
                  <li>Respecter la dignité du Salarié et garantir un environnement de travail exempt de harcèlement</li>
                </ul>

                <p className="font-semibold mt-4 mb-2">6.2. Obligations du/de la {formData.typeContrat === 'stage' ? 'Stagiaire' : 'Salarié(e)'} :</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Exécuter personnellement et avec diligence le travail convenu selon les directives de l'Employeur</li>
                  <li>Respecter les horaires de travail établis et signaler toute absence ou retard</li>
                  <li>Observer une obligation de loyauté, de fidélité et de bonne foi envers l'Employeur</li>
                  <li>Garder le secret professionnel sur toutes les informations confidentielles de l'entreprise</li>
                  <li>Prendre soin du matériel, des équipements et des locaux mis à sa disposition</li>
                  <li>Se conformer au règlement intérieur et aux politiques de l'entreprise</li>
                  <li>Ne pas exercer d'activité concurrente pendant la durée du contrat sans autorisation écrite</li>
                </ul>
              </div>

              {/* Article 7 */}
              <div>
                <h3 className="font-bold mb-2">ARTICLE 7 : CONFIDENTIALITÉ</h3>
                <p>
                  Le/La {formData.typeContrat === 'stage' ? 'Stagiaire' : 'Salarié(e)'} s'engage à observer la plus 
                  stricte discrétion sur toutes les informations confidentielles de l'entreprise.
                </p>
              </div>

              {/* Article 8 */}
              <div>
                <h3 className="font-bold mb-2">ARTICLE 8 : RÉSILIATION</h3>
                <p>
                  Conformément aux dispositions de la {JURIDICTIONS[formData.juridiction].loi} relatives 
                  à la résiliation et au préavis.
                </p>
              </div>

              {/* Article 9 */}
              <div>
                <h3 className="font-bold mb-2">ARTICLE 9 : LITIGES</h3>
                <p>
                  En cas de différend né de l'exécution ou de la rupture du présent contrat, les parties 
                  s'engagent à privilégier le règlement amiable par voie de négociation directe ou de 
                  médiation. À défaut de résolution amiable dans un délai de trente (30) jours à compter 
                  de la notification écrite du différend, le litige sera porté devant 
                  le <strong>{JURIDICTIONS[formData.juridiction].tribunal}</strong>, juridiction compétente 
                  en matière de litiges individuels du travail, conformément aux dispositions de 
                  la {JURIDICTIONS[formData.juridiction].loi}.
                </p>
              </div>
            </div>

            {/* Signatures */}
            <div className="mt-12 grid grid-cols-2 gap-8">
              <div className="text-center">
                <p className="font-bold mb-4">L'ENTREPRISE</p>
                {formData.signatureEmployeur && formData.typeGeneration === 'electronique' && (
                  <img src={formData.signatureEmployeur} alt="Signature employeur" className="h-24 mx-auto mb-2" />
                )}
                <div className="border-t border-gray-400 pt-2">
                  <p className="text-xs text-gray-600">Signature électronique</p>
                  <p className="font-semibold mt-2">{formData.entrepriseRepresentantNom}</p>
                  <p className="text-sm text-gray-600">{formData.entrepriseRepresentantQualite}</p>
                </div>
              </div>

              <div className="text-center">
                <p className="font-bold mb-4">LE/LA {formData.typeContrat === 'stage' ? 'STAGIAIRE' : 'SALARIÉ(E)'}</p>
                {formData.signatureEmploye && formData.typeGeneration === 'electronique' && (
                  <img src={formData.signatureEmploye} alt="Signature employé" className="h-24 mx-auto mb-2" />
                )}
                <div className="border-t border-gray-400 pt-2">
                  <p className="text-xs text-gray-600">Signature électronique</p>
                  <p className="font-semibold mt-2">{formData.employePrenom} {formData.employeNom}</p>
                  <p className="text-sm text-gray-600">{formData.employeFonction}</p>
                </div>
              </div>
            </div>

            {/* Pied de page */}
            <div className="mt-12 text-center text-xs text-gray-500 border-t border-gray-200 pt-6">
              <p>Fait à {JURIDICTIONS[formData.juridiction].name === 'Burundi' ? 'Bujumbura' : 'Dakar'}, le {formatDateLong(new Date().toISOString())}</p>
              <p className="mt-2">Document généré via ECODREUM Engine V1 - Contrat immuable</p>
              <p>Conforme à la {JURIDICTIONS[formData.juridiction].loi}.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// FIN DE LA PARTIE 3
// Votre fichier est maintenant complet !
