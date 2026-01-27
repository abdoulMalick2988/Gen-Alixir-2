// GEN ALIXIR - Skills & Aura Page
// Explication du système de compétences et de traits de caractère

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { AVAILABLE_SKILLS, AVAILABLE_AURA } from '@/types';

export default function SkillsAuraPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SKILLS & AURA
          </h1>
          <p className="text-lg text-gray-600">
            Votre profil GEN ALIXIR se construit autour de vos compétences techniques (SKILLS)
            et de vos traits de caractère (AURA).
          </p>
        </div>

        {/* SKILLS Section */}
        <div className="mb-20">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
              <span className="text-3xl">💡</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">SKILLS - Compétences</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Vos compétences techniques qui définissent ce que vous savez faire.
              Choisissez jusqu'à <strong>3 SKILLS</strong> pour vous spécialiser.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {AVAILABLE_SKILLS.map((skill) => (
              <Card key={skill} hover>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">⚡</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{skill}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Comment choisir vos SKILLS ?</h3>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• Sélectionnez les compétences que vous maîtrisez réellement</li>
                    <li>• Concentrez-vous sur 3 domaines maximum pour être crédible</li>
                    <li>• Vos SKILLS influencent les projets qui vous seront proposés</li>
                    <li>• Vous pourrez les mettre à jour au fil de votre évolution</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AURA Section */}
        <div className="mb-20">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary-100 mb-4">
              <span className="text-3xl">✨</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">AURA - Traits de caractère</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Votre personnalité et votre approche du travail. Choisissez jusqu'à{' '}
              <strong>3 AURA</strong> qui vous représentent le mieux.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {AVAILABLE_AURA.map((aura) => (
              <Card key={aura} hover>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">⭐</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{aura}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <h3 className="font-semibold text-purple-900 mb-2">
                    Comment choisir votre AURA ?
                  </h3>
                  <ul className="space-y-1 text-sm text-purple-800">
                    <li>• Soyez authentique dans vos choix</li>
                    <li>• Vos AURA doivent refléter votre vraie personnalité</li>
                    <li>• Les Chefs de Projet utilisent les AURA pour former des équipes équilibrées</li>
                    <li>• Une bonne diversité d'AURA enrichit les projets</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badge Vérifié */}
        <div>
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Badge AURA Vérifié</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Un système de validation qui renforce la crédibilité de votre profil.
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    Qu'est-ce que c'est ?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Le badge vérifié atteste que vos traits AURA ont été confirmés par d'autres
                    membres de confiance de la communauté.
                  </p>
                  <Badge variant="success" className="inline-flex items-center gap-1">
                    <span>✓</span>
                    AURA Vérifié
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">👥</span>
                    Qui peut vérifier ?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Votre AURA peut être vérifié par :
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-primary-500 mr-2">•</span>
                      <span>Un <strong>Membre Fondateur</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-500 mr-2">•</span>
                      <span>Un membre avec <strong>90 PCO ou plus</strong></span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">💪</span>
                    Pourquoi c'est important ?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Crédibilité</h4>
                      <p className="text-xs text-gray-600">
                        Augmente la confiance des autres membres envers vous
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Opportunités</h4>
                      <p className="text-xs text-gray-600">
                        Accès prioritaire à certains projets exigeants
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Reconnaissance</h4>
                      <p className="text-xs text-gray-600">
                        Preuve de votre engagement et authenticité
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border-0">
            <CardContent className="pt-6 pb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Prêt à définir votre profil ?
              </h3>
              <p className="text-gray-600 mb-4">
                Rejoignez GEN ALIXIR et créez un profil qui vous représente vraiment.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
