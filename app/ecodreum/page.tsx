// GEN ALIXIR - ECODREUM Page
// Présentation du réseau économique ECODREUM

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function EcodreumPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 mb-6">
            <span className="text-5xl">🌐</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            L'Univers ECODREUM
          </h1>
          <p className="text-lg text-gray-600">
            Un réseau économique africain décentralisé pour bâtir une économie numérique
            autonome et durable.
          </p>
        </div>

        {/* Vision ECODREUM */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Qu'est-ce qu'ECODREUM ?
          </h2>
          <div className="mx-auto max-w-4xl">
            <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 border-0">
              <CardContent className="pt-8 pb-8">
                <p className="text-lg text-gray-700 text-center leading-relaxed">
                  ECODREUM est un <strong>écosystème économique décentralisé</strong> conçu pour
                  l'Afrique. Il vise à créer une infrastructure complète permettant aux africains
                  de participer activement à l'économie numérique mondiale tout en développant
                  une autonomie économique locale.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Piliers ECODREUM */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Les Piliers d'ECODREUM
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card hover>
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <span className="text-3xl">💰</span>
                </div>
                <CardTitle>Infrastructure Économique</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Systèmes de paiement, échanges décentralisés et outils financiers adaptés
                  aux réalités africaines.
                </p>
              </CardContent>
            </Card>

            <Card hover>
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-secondary-100 flex items-center justify-center mb-4">
                  <span className="text-3xl">🎓</span>
                </div>
                <CardTitle>Formation & Talents</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Programmes d'incubation comme GEN ALIXIR pour développer les compétences
                  numériques africaines.
                </p>
              </CardContent>
            </Card>

            <Card hover>
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-accent-100 flex items-center justify-center mb-4">
                  <span className="text-3xl">🔗</span>
                </div>
                <CardTitle>Réseau Collaboratif</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Connexion entre entrepreneurs, développeurs, investisseurs et institutions
                  à travers le continent.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lien GEN ALIXIR - ECODREUM */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            GEN ALIXIR × ECODREUM
          </h2>
          <div className="mx-auto max-w-4xl">
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <CardTitle>Le Rôle de GEN ALIXIR</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    GEN ALIXIR est l'<strong>incubateur de talents</strong> au sein d'ECODREUM.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-primary-500 mr-2">✓</span>
                      Former les futurs acteurs de l'écosystème
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-500 mr-2">✓</span>
                      Développer des projets pour ECODREUM
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-500 mr-2">✓</span>
                      Créer un vivier de compétences africaines
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-lg bg-secondary-100 flex items-center justify-center">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <CardTitle>Les Synergies</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    L'intégration crée des <strong>opportunités concrètes</strong>.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-secondary-500 mr-2">✓</span>
                      Accès aux projets ECODREUM
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary-500 mr-2">✓</span>
                      Rémunération via l'écosystème
                    </li>
                    <li className="flex items-start">
                      <span className="text-secondary-500 mr-2">✓</span>
                      Évolution professionnelle garantie
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Vision à long terme */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Vision à Long Terme
          </h2>
          <div className="mx-auto max-w-4xl">
            <Card>
              <CardContent className="pt-8">
                <div className="space-y-8">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white flex items-center justify-center font-bold text-lg">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Autonomie Économique</h3>
                      <p className="text-gray-600">
                        Créer une économie numérique africaine qui ne dépend pas uniquement
                        des infrastructures externes.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white flex items-center justify-center font-bold text-lg">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Création de Valeur Locale</h3>
                      <p className="text-gray-600">
                        Permettre aux africains de créer et capturer de la valeur économique
                        à travers leurs talents et innovations.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white flex items-center justify-center font-bold text-lg">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Impact Continental</h3>
                      <p className="text-gray-600">
                        Construire une infrastructure qui bénéficie à tout le continent et
                        positionne l'Afrique comme leader de l'économie numérique.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Valeurs Communes */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Valeurs Communes
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: '🌍', title: 'Pan-Africanisme', desc: 'Une vision continentale' },
              { icon: '🔓', title: 'Décentralisation', desc: 'Pouvoir distribué' },
              { icon: '💡', title: 'Innovation', desc: 'Solutions créatives' },
              { icon: '🤝', title: 'Solidarité', desc: 'Réussite collective' },
            ].map((value) => (
              <Card key={value.title} hover>
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl mb-3">{value.icon}</div>
                  <h3 className="font-semibold mb-1">{value.title}</h3>
                  <p className="text-xs text-gray-600">{value.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-primary-600 to-secondary-600 border-0 text-white">
            <CardContent className="pt-8 pb-8">
              <h3 className="text-2xl font-bold mb-3">
                Faites partie du mouvement
              </h3>
              <p className="mb-6 opacity-90">
                Rejoignez GEN ALIXIR et contribuez à bâtir l'économie numérique africaine
                via ECODREUM.
              </p>
              <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                Adhérer à GEN ALIXIR
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
