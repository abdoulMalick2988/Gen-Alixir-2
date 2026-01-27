// GEN ALIXIR - Concept Page
// Explication des types de membres et de leur rôle

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { ROLE_DESCRIPTIONS } from '@/types';

export default function ConceptPage() {
  const roles = [
    {
      type: 'MEMBER',
      icon: '👤',
      benefits: [
        'Accès aux projets collaboratifs',
        'Accumulation de PCO via contributions',
        'Participation aux événements communautaires',
        'Développement de compétences pratiques',
      ],
    },
    {
      type: 'PROJECT_LEAD',
      icon: '⚡',
      benefits: [
        'Tous les avantages du Membre',
        'Création et direction de projets',
        'Attribution de PCO aux contributeurs',
        'Gestion d\'équipes',
        'Mentorat des membres juniors',
      ],
    },
    {
      type: 'FOUNDER',
      icon: '⭐',
      benefits: [
        'Tous les avantages du Chef de Projet',
        'Vérification des AURA des membres',
        'Participation aux décisions stratégiques',
        'Mentorat de haut niveau',
        'Représentation de GEN ALIXIR',
      ],
    },
    {
      type: 'MODERATOR',
      icon: '🛡️',
      benefits: [
        'Supervision de la communauté',
        'Résolution de conflits',
        'Application des règles',
        'Support aux membres',
        'Maintien de l\'esprit GEN ALIXIR',
      ],
    },
  ];

  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Le Concept GEN ALIXIR
          </h1>
          <p className="text-lg text-gray-600">
            Une structure organisée en rôles permettant à chacun de contribuer selon ses
            compétences et d'évoluer grâce à ses actions concrètes.
          </p>
        </div>

        {/* Hiérarchie */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Types de membres
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {roles.map((role) => {
              const roleData = ROLE_DESCRIPTIONS[role.type as keyof typeof ROLE_DESCRIPTIONS];
              return (
                <Card key={role.type} hover>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-4xl">{role.icon}</div>
                      <div>
                        <CardTitle>{roleData.title}</CardTitle>
                        <Badge variant="info" className="mt-1">
                          {role.type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {roleData.description}
                    </CardDescription>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-gray-700">Privilèges :</h4>
                      <ul className="space-y-1">
                        {role.benefits.map((benefit, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start">
                            <span className="text-primary-500 mr-2">✓</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Progression */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Comment progresser ?
          </h2>
          <div className="mx-auto max-w-3xl">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Commencer en tant que Membre</h3>
                      <p className="text-sm text-gray-600">
                        Tous les nouveaux arrivants démarrent comme Membre standard. C'est
                        l'opportunité de découvrir la plateforme et de contribuer à des projets.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Accumuler des PCO</h3>
                      <p className="text-sm text-gray-600">
                        Participez activement aux projets, complétez des tâches, et contribuez à la
                        communauté pour gagner des Points de Contribution (PCO).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Démontrer vos compétences</h3>
                      <p className="text-sm text-gray-600">
                        Prouvez votre expertise et votre engagement. Les membres qui se distinguent
                        peuvent être promus Chef de Projet ou Modérateur.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Devenir un pilier de la communauté</h3>
                      <p className="text-sm text-gray-600">
                        Les membres les plus dévoués et influents peuvent être reconnus comme
                        Membres Fondateurs, participant aux décisions stratégiques de GEN ALIXIR.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Valeurs */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Nos valeurs fondamentales
          </h2>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { icon: '🎯', title: 'Méritocratie', desc: 'Récompense basée sur la contribution' },
              { icon: '🤝', title: 'Collaboration', desc: 'Réussite collective' },
              { icon: '⚡', title: 'Discipline', desc: 'Engagement et rigueur' },
              { icon: '🌍', title: 'Inclusion', desc: 'Ouvert à tous les talents' },
              { icon: '🚀', title: 'Vision', desc: 'Bâtir l\'avenir africain' },
            ].map((value) => (
              <Card key={value.title} hover className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl mb-2">{value.icon}</div>
                  <h3 className="font-semibold mb-1">{value.title}</h3>
                  <p className="text-xs text-gray-600">{value.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
