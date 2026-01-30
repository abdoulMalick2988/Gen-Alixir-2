'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Section from '@/components/ui/Section'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useAuth } from '@/lib/hooks/useAuth'
import { signOut } from '@/lib/supabase/client'
import { AURA_TYPES } from '@/lib/constants'

export default function DashboardPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])
  
  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }
  
  if (loading) {
    return (
      <Section containerSize="lg" className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </Section>
    )
  }
  
  if (!profile) {
    return null
  }
  
  const auraInfo = AURA_TYPES.find(a => a.value === profile.aura_dominante)
  
  return (
    <Section containerSize="lg" className="min-h-screen py-20">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Bienvenue, <span className="text-emerald-400">{profile.prenom}</span> !
            </h1>
            <p className="text-gray-400">Votre espace membre GEN ALIXIR</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Déconnexion
          </Button>
        </div>
        
        {/* Carte Membre */}
        <Card glow className="bg-gradient-to-br from-gray-900 to-black border-emerald-500/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Photo & Info principale */}
            <div className="md:col-span-1 flex flex-col items-center text-center">
              <div className="w-32 h-32 bg-emerald-gradient rounded-full flex items-center justify-center text-white text-5xl font-bold mb-4">
                {profile.prenom[0]}{profile.nom[0]}
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {profile.prenom} {profile.nom}
              </h2>
              <p className="text-gray-400 mb-2">{profile.pays}</p>
              <Badge variant="success" size="lg">
                {profile.gen_alixir_id}
              </Badge>
            </div>
            
            {/* Détails */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Pôle de Compétence</div>
                <div className="text-xl text-white font-semibold">{profile.pole_competence}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-2">Compétences</div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map(skill => (
                    <Badge key={skill} variant="info">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Aura Dominante</div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{auraInfo?.emoji}</span>
                  <span className="text-xl text-white font-semibold">{auraInfo?.label}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div>
                  <div className="text-2xl font-bold text-emerald-400">{profile.pco_total}</div>
                  <div className="text-xs text-gray-400">PCO</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">{profile.projets_rejoints}</div>
                  <div className="text-xs text-gray-400">Projets rejoints</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">{profile.projets_crees}</div>
                  <div className="text-xs text-gray-400">Projets créés</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hover>
            <h3 className="text-lg font-semibold text-white mb-2">Points PCO</h3>
            <div className="text-4xl font-bold text-emerald-400 mb-2">{profile.pco_total}</div>
            <p className="text-gray-400 text-sm">Points de contribution cumulés</p>
          </Card>
          
          <Card hover>
            <h3 className="text-lg font-semibold text-white mb-2">Projets actifs</h3>
            <div className="text-4xl font-bold text-emerald-400 mb-2">{profile.projets_rejoints}</div>
            <p className="text-gray-400 text-sm">Projets auxquels vous participez</p>
          </Card>
          
          <Card hover>
            <h3 className="text-lg font-semibold text-white mb-2">Projets créés</h3>
            <div className="text-4xl font-bold text-emerald-400 mb-2">{profile.projets_crees}</div>
            <p className="text-gray-400 text-sm">Projets que vous avez initiés</p>
          </Card>
        </div>
        
        {/* Mes Projets - À implémenter en PARTIE 4 */}
        <Card>
          <h3 className="text-2xl font-bold text-white mb-4">Mes Projets</h3>
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">Aucun projet pour le moment</p>
            <Button variant="primary">
              Créer un nouveau projet
            </Button>
          </div>
        </Card>
      </div>
    </Section>
  )
}
