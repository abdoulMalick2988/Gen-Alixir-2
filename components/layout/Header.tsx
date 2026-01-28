'use client';

// GEN ALIXIR - Header Component
// Navigation principale du site

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '../ui/Button';
import { cn } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();

  const navItems = [
    { href: '/concept', label: 'Concept' },
    { href: '/skills-aura', label: 'Skills & Aura' },
    { href: '/ecodreum', label: 'ECODREUM' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500">
              <span className="text-xl font-bold text-white">GA</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              GEN ALIXIR
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary-600',
                  pathname === item.href
                    ? 'text-primary-600'
                    : 'text-gray-600'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <a 
  href="/dashboard/projects" 
  className="bg-cyan-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-cyan-500 transition-all inline-block"
>
  🚀 Gérer les Projets
</a>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm">
                    Adhérer
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
