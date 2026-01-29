// GEN ALIXIR - Landing Page Simplifiée
// Fichier: src/app/page.tsx
// ❗ REMPLACER complètement l'ancien fichier

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function HomePage() {
  const router = useRouter();

  const handleQuickAccess = () => {
    // Auto-login comme fondateur
    const testToken = 'test-founder-token-' + Date.now();
    localStorage.setItem('test_token', testToken);
    localStorage.setItem('test_user', JSON.stringify({
      id: 'founder-test-id',
      email: 'fondateur@genalixir.com',
      role: 'FOUNDER',
      profile: {
        full_name: 'Fondateur Test',
        country: 'Burundi',
        pco: 200,
        skills: ['Développement', 'Gestion', 'Leadership'],
        aura: ['Visionnaire', 'Innovant', 'Leader'],
        aura_verified: true,
      }
    }));
    router.push('/dashboard');
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-block rounded-full bg-primary-100 px-4 py-2 text-sm font-medium text-primary-700">
              🚀 Mode Test - Phase 2
            </div>
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
              <Button size="lg" className="text-lg px-8" onClick={handleQuickAccess}>
                🎯 Accéder au Dashboard (Test)
              </Button>
              <Link href="/concept">
                <Button variant="outline" size="lg" className="text-lg px-8">
                  Découvrir le concept
                </Button>
              </Link>
            </div>

            {/* Info Mode Test */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl mx-auto">
              <p className="text-sm text-blue-800">
                <strong>Mode Test Activé :</strong> Cliquez sur "Accéder au Dashboard" pour tester
                toutes les fonctionnalités en tant que Fondateur. Aucune inscription nécessaire !
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nouvelles Fonctionnalités Phase 2 */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ✨ Nouveautés Phase 2
            </h2>
            <p className="text-lg text-gray-600">
              Découvrez les nouvelles fonctionnalités collaboratives
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card hover>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
                  <span className="text-2xl">📁</span>
                </div>
                <CardTitle>Projets Collaboratifs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Créez et gérez des projets, recrutez des membres et collaborez efficacement.
                </p>
              </CardContent>
            </Card>

            <Card hover>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-secondary-100 flex items-center justify-center mb-4">
                  <span className="text-2xl">✅</span>
                </div>
                <CardTitle>Système de Tâches</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Assignez des tâches, suivez leur progression et validez les contributions.
                </p>
              </CardContent>
            </Card>

            <Card hover>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent-100 flex items-center justify-center mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <CardTitle>PCO Dynamique</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Gagnez des points PCO en accomplissant des tâches et progressez dans la communauté.
                </p>
              </CardContent>
            </Card>
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
                <p className="text-sm text-gray-600">
                  Une plateforme ouverte permettant à tous les talents africains de participer,
                  peu importe leur localisation.
                </p>
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
                <p className="text-sm text-gray-600">
                  Travaillez sur des projets concrets avec d'autres membres passionnés et
                  développez vos compétences ensemble.
                </p>
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
                <p className="text-sm text-gray-600">
                  Progressez grâce à vos contributions réelles via le système PCO
                  (Points de Contribution).
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à tester la plateforme ?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Accédez instantanément au dashboard et explorez toutes les fonctionnalités.
          </p>
          <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100" onClick={handleQuickAccess}>
            🚀 Accéder maintenant
          </Button>
        </div>
      </section>
    </div>
  );
}
