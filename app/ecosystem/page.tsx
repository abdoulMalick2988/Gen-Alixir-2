import Section from '@/components/ui/Section'
import Card from '@/components/ui/Card'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function EcosystemPage() {
  return (
    <Section containerSize="lg" className="min-h-screen">
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            L'Écosystème <span className="text-emerald-400">ECODREUM</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Une vision globale pour l'Afrique et la Diaspora
          </p>
        </div>
        
        {/* Qu'est-ce que ECODREUM */}
        <Card glow>
          <h2 className="text-3xl font-bold text-white mb-4">Qu'est-ce que ECODREUM ?</h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-6">
            ECODREUM est un écosystème digital complet conçu pour catalyser l'innovation et 
            l'entrepreneuriat en Afrique et dans la diaspora. Il combine technologie blockchain, 
            intelligence collective et gamification pour créer un environnement propice au 
            développement de projets innovants.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed">
            GEN ALIXIR est la porte d'entrée de cet écosystème, permettant à chacun de contribuer, 
            d'apprendre et de créer dans un cadre structuré et ludique.
          </p>
        </Card>
        
        {/* Composantes de l'écosystème */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white text-center">
            Les Composantes de l'Écosystème
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card hover>
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold text-white mb-2">GEN ALIXIR</h3>
              <p className="text-gray-400">
                Plateforme d'incubation gamifiée où les projets progressent comme des matchs de football
              </p>
            </Card>
            
            <Card hover>
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-2xl font-bold text-white mb-2">Points PCO & eCo</h3>
              <p className="text-gray-400">
                Système de récompense et de reconnaissance des contributions au sein de l'écosystème
              </p>
            </Card>
            
            <Card hover>
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-2xl font-bold text-white mb-2">Réseau Afrique-Diaspora</h3>
              <p className="text-gray-400">
                Connexion des talents africains du continent et de la diaspora pour des projets d'impact
              </p>
            </Card>
            
            <Card hover>
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-white mb-2">Accélération de Projets</h3>
              <p className="text-gray-400">
                Accompagnement structuré des projets validés vers leur mise en marché et leur croissance
              </p>
            </Card>
          </div>
        </div>
        
        {/* Vision Afrique */}
        <Card glow>
          <h2 className="text-3xl font-bold text-white mb-4">Notre Vision pour l'Afrique</h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-4">
            ECODREUM aspire à devenir le catalyseur de la transformation digitale africaine en :
          </p>
          <ul className="space-y-3 text-gray-300 text-lg">
            <li className="flex items-start">
              <span className="text-emerald-400 mr-3">→</span>
              <span>Démocratisant l'accès à l'innovation et à l'entrepreneuriat</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-400 mr-3">→</span>
              <span>Valorisant les compétences locales et diasporiques</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-400 mr-3">→</span>
              <span>Créant des opportunités économiques durables</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-400 mr-3">→</span>
              <span>Favorisant la collaboration pan-africaine</span>
            </li>
          </ul>
        </Card>
        
        {/* CTA */}
        <div className="text-center">
          <Link href="/join">
            <Button variant="primary" size="lg">
              Rejoindre l'Écosystème ECODREUM
            </Button>
          </Link>
        </div>
      </div>
    </Section>
  )
}
