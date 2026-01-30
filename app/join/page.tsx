'use client'

import { useState } from 'react'
import Section from '@/components/ui/Section'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { POLES_COMPETENCE, SKILLS_OPTIONS, AURA_TYPES, PAYS_OPTIONS } from '@/lib/constants'

export default function JoinPage() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
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
        <form className="space-y-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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
                  <div className="text-white font-medium">{aura.label}</div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Submit */}
          <Button variant="primary" fullWidth size="lg" type="submit">
            Rejoindre la communauté
          </Button>
        </form>
      </Card>
    </Section>
  )
}
