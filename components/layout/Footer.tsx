import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  const footerLinks = {
    'Plateforme': [
      { name: 'Accueil', href: '/' },
      { name: 'Projets', href: '/projects' },
      { name: 'Rejoindre', href: '/join' },
    ],
    'Écosystème': [
      { name: 'ECODREUM', href: '/ecosystem' },
      { name: 'À propos', href: '/about' },
    ],
    'Légal': [
      { name: 'Mentions légales', href: '#' },
      { name: 'Confidentialité', href: '#' },
    ],
  }
  
  return (
    <footer className="bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-emerald-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <span className="text-white font-bold text-xl">GEN ALIXIR</span>
            </div>
            <p className="text-gray-400 text-sm">
              La plateforme communautaire d'incubation de projets de l'écosystème ECODREUM.
            </p>
          </div>
          
          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-emerald-400 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-center text-gray-400 text-sm">
            © {currentYear} GEN ALIXIR - ECODREUM. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
