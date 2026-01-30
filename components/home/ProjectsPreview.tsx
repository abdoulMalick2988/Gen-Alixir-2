import Link from 'next/link'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

// Données de démonstration (seront remplacées par les vrais projets en PARTIE 4)
const mockProjects = [
  {
    id: '1',
    nom: 'EcoPay',
    theme: 'Finance',
    statut: 'en_cours',
    equipe_principale: 4,
    equipe_adverse: 3,
  },
  {
    id: '2',
    nom: 'AfriMarket',
    theme: 'E-commerce',
    statut: 'en_cours',
    equipe_principale: 5,
    equipe_adverse: 5,
  },
  {
    id: '3',
    nom: 'CryptoHub',
    theme: 'Tech',
    statut: 'rejete',
    equipe_principale: 2,
    equipe_adverse: 0,
  },
  {
    id: '4',
    nom: 'GreenTech',
    theme: 'Environnement',
    statut: 'en_cours',
    equipe_principale: 3,
    equipe_adverse: 4,
  },
]

export default function ProjectsPreview() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">
          Projets en <span className="text-emerald-400">Direct</span>
        </h2>
        <Link href="/projects">
          <Button variant="outline" size="sm">
            Voir tous les projets
          </Button>
        </Link>
      </div>
      
      <div className="space-y-4">
        {mockProjects.map((project) => (
          <Card key={project.id} hover className="cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-xl font-bold text-white">{project.nom}</h3>
                  <Badge variant="neutral" size="sm">{project.theme}</Badge>
                </div>
                <div className="flex items-center gap-4 text-gray-400 text-sm">
                  <span>Équipe A: {project.equipe_principale}</span>
                  <span>vs</span>
                  <span>Équipe B: {project.equipe_adverse || 0}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {project.statut === 'en_cours' ? (
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                ) : (
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                )}
                <Badge
                  variant={project.statut === 'en_cours' ? 'success' : 'error'}
                  size="md"
                >
                  {project.statut === 'en_cours' ? 'En cours' : 'Rejeté'}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
