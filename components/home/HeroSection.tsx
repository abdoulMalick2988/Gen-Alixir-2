import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function HeroSection() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-emerald-glow opacity-20"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Les idées jouent.
          <br />
          <span className="bg-emerald-gradient bg-clip-text text-transparent">
            Les projets marquent.
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
          Rejoignez la plateforme communautaire d'incubation de projets de l'écosystème ECODREUM. 
          Collaborez, innovez, et transformez vos idées en réalité.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/join">
            <Button variant="primary" size="lg">
              Rejoindre la communauté
            </Button>
          </Link>
          <Link href="/ecosystem">
            <Button variant="outline" size="lg">
              Découvrir l'écosystème
            </Button>
          </Link>
        </div>
        
        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="text-4xl font-bold text-emerald-400 mb-2">1,234</div>
            <div className="text-gray-400">Membres actifs</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-emerald-400 mb-2">87</div>
            <div className="text-gray-400">Projets en cours</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-emerald-400 mb-2">342</div>
            <div className="text-gray-400">Buts marqués</div>
          </div>
        </div>
      </div>
    </div>
  )
}
