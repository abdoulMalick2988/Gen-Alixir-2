import Section from '@/components/ui/Section'
import Card from '@/components/ui/Card'

export default function AboutPage() {
  return (
    <Section containerSize="lg" className="min-h-screen">
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            À propos de <span className="text-emerald-400">GEN ALIXIR</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Une plateforme communautaire révolutionnaire d'incubation de projets reliés à ECODREUM
          </p>
        </div>
        
        {/* Vision */}
        <Card glow>
          <h2 className="text-3xl font-bold text-white mb-4">Notre Vision</h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            GEN ALIXIR transforme la création et la validation de projets en une expérience 
            visuelle et collaborative inspirée du football, le BRAINBALL. Chaque projet devient un match, 
            chaque étape une phase de jeu, chaque validation un but marqué.
          </p>
        </Card>
        
        {/* Comment ça marche */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white text-center">Comment ça marche ?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hover>
              <div className="text-4xl mb-4">⚽</div>
              <h3 className="text-xl font-bold text-white mb-2">1. Créez votre projet</h3>
              <p className="text-gray-400">
                Proposez votre idée à la communauté et constituez votre équipe de 5 membres
              </p>
            </Card>
            
            <Card hover>
              <div className="text-4xl mb-4">🏟️</div>
              <h3 className="text-xl font-bold text-white mb-2">2. Jouez le match</h3>
              <p className="text-gray-400">
                Franchissez les 5 phases de validation en formation 1-2-2 pour marquer des buts
              </p>
            </Card>
            
            <Card hover>
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-white mb-2">3. Gagnez et créez</h3>
              <p className="text-gray-400">
                Accumulez des PCO, validez votre projet et transformez votre idée en réalité
              </p>
            </Card>
          </div>
        </div>
        
        {/* Objectifs */}
        <Card glow>
          <h2 className="text-3xl font-bold text-white mb-6">Nos Objectifs</h2>
          <ul className="space-y-4 text-gray-300 text-lg">
            <li className="flex items-start">
              <span className="text-emerald-400 mr-3">✓</span>
              <span>Donner envie de rejoindre une communauté innovante et engagée</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-400 mr-3">✓</span>
              <span>Rendre la progression de projet addictive et visuellement compréhensible</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-400 mr-3">✓</span>
              <span>Favoriser la collaboration entre membres aux compétences complémentaires</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-400 mr-3">✓</span>
              <span>Créer une transparence communautaire totale sur tous les projets</span>
            </li>
          </ul>
        </Card>
      </div>
    </Section>
  )
}
