// GEN ALIXIR - Footer Component
// Pied de page du site

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* À propos */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">GEN ALIXIR</h3>
            <p className="text-sm text-gray-600">
              Incubateur numérique africain décentralisé rattaché à l'écosystème ECODREUM.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/concept" className="hover:text-primary-600 transition-colors">
                  Concept
                </Link>
              </li>
              <li>
                <Link href="/skills-aura" className="hover:text-primary-600 transition-colors">
                  Skills & Aura
                </Link>
              </li>
              <li>
                <Link href="/ecodreum" className="hover:text-primary-600 transition-colors">
                  ECODREUM
                </Link>
              </li>
            </ul>
          </div>

          {/* Communauté */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Communauté</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/auth/register" className="hover:text-primary-600 transition-colors">
                  Adhérer
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-primary-600 transition-colors">
                  Se connecter
                </Link>
              </li>
            </ul>
          </div>

          {/* Valeurs */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Nos Valeurs</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>✦ Méritocratie</li>
              <li>✦ Collaboration</li>
              <li>✦ Discipline</li>
              <li>✦ Inclusion</li>
              <li>✦ Vision africaine</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            © {currentYear} GEN ALIXIR - ECODREUM. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
