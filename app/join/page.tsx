'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Section from '@/components/ui/Section'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { POLES_COMPETENCE, SKILLS_OPTIONS, AURA_TYPES, PAYS_OPTIONS } from '@/lib/constants'
import { signUp } from '@/lib/supabase/client'

export default function JoinPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{ genId: string; pin: string } | null>(null)
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    pays: '',
    pole_competence: '',
    skills: [] as string[],
    aura_dominante: '',
  })
  
  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      // Validation
      if (!formData.nom || !formData.prenom || !formData.email || !formData.password) {
        throw new Error('Veuillez remplir tous les champs obligatoires')
      }
      
      if (!formData.pays || !formData.pole_competence || !formData.aura_dominante) {
        throw new Error('Veuillez remplir tous les champs obligatoires')
      }
      
      if (formData.skills.length === 0) {
        throw new Error('Veuillez sélectionner au moins une compétence')
      }
      
      if (formData.password.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères')
      }
      
      // Inscription
      const result = await signUp(formData.email, formData.password, {
        nom: formData.nom,
        prenom: formData.prenom,
        pays: formData.pays,
        pole_competence: formData.pole_competence,
        skills: formData.skills,
        aura_dominante: formData.aura_dominante,
      })
      
      // Afficher les identifiants
      setSuccess({
        genId: result.genId,
        pin: result.pinCode,
      })
      
      // Rediriger après 10 secondes
      setTimeout(() => {
        router.push('/dashboard')
      }, 10000)
      
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }
  
  // Affichage du succès
  if (success) {
    return (
      <Section containerSize="md" className="min-h-screen py-20 flex items-center">
        <Card glow className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Bienvenue dans <span className="text-emerald-400">GEN ALIXIR</span> !
          </h1>
          
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-6 my-8">
            <p className="text-gray-300 mb-4">Conservez précieusement ces identifiants :</p>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Votre ID GEN ALIXIR</div>
                <div className="text-3xl font-bold text-emerald-400">{success.genId}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Votre Code PIN</div>
                <div className="text-3xl font-bold text-emerald-400">{success.pin}</div>
              </div>
            </div>
          </div>
          
          <p className="text-gray-400 mb-6">
            Vous pouvez vous connecter avec votre email/mot de passe OU avec votre ID GEN ALIXIR + Code PIN
          </p>
          
          <p className="text-sm text-gray-500">
            Redirection automatique vers votre dashboard dans 10 secondes...
          </p>
        </Card>
      </Section>
    )
  }
  
  return (
    <Section containerSize="md" className="min-h-screen py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Rejoindre <span className="text-emerald-400">GEN ALIXIR</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Devenez membre de la communauté et commencez à créer des projets innovants
        </p>
      </div>
      
      <Card glow className="max-w-2xl mx-auto">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Nom & Prénom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-300 mb-2">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Dupont"
                required
              />
            </div>
            
            <div>
              <label htmlFor="prenom" className="block text-sm font-medium text-gray-300 mb-2">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="prenom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Jean"
                required
              />
            </div>
          </div>
          
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="jean.dupont@email.com"
              required
            />
          </div>
          
          {/* Mot de passe */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Mot de passe <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="••••••••"
              minLength={6}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
          </div>
          
          {/* Pays */}
          <div>
            <label htmlFor="pays" className="block text-sm font-medium text-gray-300 mb-2">
              Pays <span className="text-red-500">*</span>
            </label>
            <select
              id="pays"
              value={formData.pays}
              onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="" className="bg-gray-900">Sélectionner un pays</option>
              {PAYS_OPTIONS.map(pays => (
                <option key={pays} value={pays} className="bg-gray-900">{pays}</option>
              ))}
            </select>
          </div>
          
          {/* Pôle de compétence */}
          <div>
            <label htmlFor="pole" className="block text-sm font-medium text-gray-300 mb-2">
              Pôle de compétence <span className="text-red-500">*</span>
            </label>
            <select
              id="pole"
              value={formData.pole_competence}
              onChange={(e) => setFormData({ ...formData, pole_competence: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="" className="bg-gray-900">Sélectionner un pôle</option>
              {POLES_COMPETENCE.map(pole => (
                <option key={pole} value={pole} className="bg-gray-900">{pole}</option>
              ))}
            </select>
          </div>
          
          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Compétences <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {SKILLS_OPTIONS.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleSkillToggle(skill)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.skills.includes(skill)
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
          
          {/* Aura */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Aura dominante <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {AURA_TYPES.map(aura => (
                <button
                  key={aura.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, aura_dominante: aura.value })}
                  className={`p-4 rounded-lg border transition-all ${
                    formData.aura_dominante === aura.value
                      ? 'bg-emerald-500/20 border-emerald-500'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="text-3xl mb-2">{aura.emoji}</div>
                  <div className="text-white font-medium text-sm">{aura.label}</div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Submit */}
          <Button 
            variant="primary" 
            fullWidth 
            size="lg" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Création en cours...' : 'Rejoindre la communauté'}
          </Button>
        </form>
      </Card>
    </Section>
  )
}
