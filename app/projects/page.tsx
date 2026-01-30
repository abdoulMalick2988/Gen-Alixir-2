'use client'

import { useState } from 'react'
import Section from '@/components/ui/Section'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

// Données de démonstration (seront remplacées en PARTIE 4)
const mockProjects = [
  { id: '1', nom: 'EcoPay', theme: 'Finance', statut: 'en_cours', buts: 3 },
  { id: '2', nom: 'AfriMarket', theme: 'E-commerce', statut: 'en_cours', buts: 2 },
  { id: '3', nom: 'CryptoHub', theme: 'Tech', statut: 'rejete', buts: 0 },
  { id: '4', nom: 'GreenTech', theme: 'Environnement', statut: 'en_cours', buts: 1 },
  { id: '5', nom: 'EduPlatform', theme: 'Éducation', statut: 'termine', buts: 5 },
  { id: '6', nom: 'HealthApp', theme: 'Santé', statut: 'en_cours', buts: 4 },
]

export default function ProjectsPage() {
  const [filter, setFilter] = useState<'tous' | 'en_cours' | 'rejete' | 'termine'>('tous')
  
  const filteredProjects = filter === 'tous' 
    ? mockProjects 
    : mockProjects.filter(p => p.statut === filter)
  
  return (
    <Section containerSize="lg" className="min-h-screen">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Tous les <span className="text-emerald-400">Projets</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Découvrez les projets en cours, suivez leur progression et rejoignez les équipes
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            variant={filter === 'tous' ? 'primary' : 'outline'}
            onClick={() => setFilter('tous')}
          >
            Tous
          </Button>
          <Button
            variant={filter === 'en_cours' ? 'primary' : 'outline'}
            onClick={() => setFilter('en_cours')}
          >
            En cours
          </Button>
          <Button
            variant={filter === 'rejete' ? 'primary' : 'outline'}
            onClick={() => setFilter('rejete')}
          >
            Rejetés
          </Button>
          <Button
            variant={filter === 'termine' ? 'primary' : 'outline'}
            onClick={() => setFilter('termine')}
          >
            Terminés
          </Button>
        </div>
        
        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} hover glow className="cursor-pointer">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-bold text-white">{project.nom}</h3>
                  {project.statut === 'en_cours' && (
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                
                <Badge variant="neutral">{project.theme}</Badge>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="text-gray-400 text-sm">
                    ⚽ {project.buts} {project.buts > 1 ? 'buts' : 'but'}
                  </div>
                  <Badge
                    variant={
                      project.statut === 'en_cours' 
                        ? 'success' 
                        : project.statut === 'rejete' 
                        ? 'error' 
                        : 'info'
                    }
                  >
                    {project.statut === 'en_cours' 
                      ? 'En cours' 
                      : project.statut === 'rejete' 
                      ? 'Rejeté' 
                      : 'Terminé'}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl">Aucun projet trouvé pour ce filtre</p>
          </div>
        )}
      </div>
    </Section>
  )
}
