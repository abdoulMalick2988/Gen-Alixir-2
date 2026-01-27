// GEN ALIXIR - Landing Page
// Page d'accueil principale

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
              Bâtissons ensemble l'avenir numérique
              <span className="block text-primary-600">de l'Afrique</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              GEN ALIXIR est un incubateur numérique africain décentralisé qui permet aux jeunes
              talents de rejoindre une communauté structurée, collaborer sur des projets innovants
              et évoluer grâce au système PCO.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="text-lg px-8">
                  Rejoindre GEN ALIXIR
                </Button>
              </Link>
              <Link href="/concept">
                <Button variant="outline" size="lg" className="text-lg px-8">
                  Découvrir le concept
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre Vision</h2>
            <p className="text-lg text-gray-600">
              Créer un écosystème où chaque talent africain peut s'épanouir, contribuer et
              bâtir l'économie numérique de demain.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card hover>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
                  <span className="text-2xl">🌍</span>
                </div>
                <CardTitle>Décentralisé</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Une plateforme ouverte permettant à tous les talents africains de participer,
                  peu importe leur localisation.
                </CardDescription>
              </CardContent>
            </Card>

            <Card hover>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-secondary-100 flex items-center justify-center mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <CardTitle>Collaboratif</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Travaillez sur des projets concrets avec d'autres membres passionnés et
                  développez vos compétences ensemble.
                </CardDescription>
              </CardContent>
            </Card>

            <Card hover>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent-100 flex items-center justify-center mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <CardTitle>Méritocratie</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Progressez grâce à vos contributions réelles via le système PCO
                  (Points de Contribution).
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Notre Mission</h2>
            
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Former les talents africains</h3>
                      <p className="text-gray-600">
                        Offrir un environnement d'apprentissage pratique où les compétences se
                        développent à travers des projets réels.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Créer des opportunités</h3>
                      <p className="text-gray-600">
                        Connecter les membres à des projets innovants et à l'écosystème ECODREUM
                        pour des opportunités concrètes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Bâtir une communauté solide</h3>
                      <p className="text-gray-600">
                        Réunir les talents autour de valeurs communes : méritocratie, collaboration,
                        discipline et vision long terme.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ECODREUM Connection */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Rattaché à l'écosystème ECODREUM
                </h2>
                <p className="text-gray-600 mb-6">
                  GEN ALIXIR fait partie intégrante d'ECODREUM, un réseau économique africain
                  décentralisé visant à créer une économie numérique autonome et durable.
                </p>
                <Link href="/ecodreum">
                  <Button variant="outline">
                    En savoir plus sur ECODREUM
                  </Button>
                </Link>
              </div>
              <div className="bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4">🌐</div>
                <h3 className="text-xl font-semibold mb-2">Écosystème ECODREUM</h3>
                <p className="text-gray-600 text-sm">
                  Infrastructure économique décentralisée pour l'Afrique
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à rejoindre la communauté ?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Devenez membre de GEN ALIXIR et commencez votre parcours dans l'économie numérique
            africaine.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
              Adhérer maintenant
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
