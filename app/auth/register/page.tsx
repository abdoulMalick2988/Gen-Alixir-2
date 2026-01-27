'use client';

// GEN ALIXIR - Register Page
// Page d'inscription des nouveaux membres

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    country: '',
  });
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }

      setPin(data.pin);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">✓</span>
              </div>
              <CardTitle>Inscription réussie !</CardTitle>
              <CardDescription>
                Votre compte a été créé avec succès.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800 mb-2 font-semibold">
                  ⚠️ Notez bien votre PIN :
                </p>
                <div className="bg-white rounded p-3 text-center">
                  <span className="text-3xl font-bold text-gray-900 tracking-wider">
                    {pin}
                  </span>
                </div>
                <p className="text-xs text-yellow-700 mt-2">
                  Conservez ce PIN précieusement. Vous en aurez besoin pour vous connecter.
                </p>
              </div>

              <Button
                fullWidth
                onClick={() => router.push('/auth/login')}
              >
                Se connecter maintenant
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Rejoindre GEN ALIXIR</CardTitle>
            <CardDescription>
              Créez votre compte pour commencer votre parcours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <Input
                label="Email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="votre@email.com"
              />

              <Input
                label="Nom complet"
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Jean Dupont"
              />

              <Input
                label="Pays"
                type="text"
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Burundi"
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-semibold mb-1">ℹ️ À propos du PIN</p>
                <p className="text-xs">
                  Un code PIN à 6 chiffres sera généré automatiquement lors de votre inscription.
                  Vous devrez le conserver pour vous connecter.
                </p>
              </div>

              <Button
                type="submit"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Inscription...' : 'Créer mon compte'}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Vous avez déjà un compte ?{' '}
                <Link href="/auth/login" className="text-primary-600 font-medium hover:underline">
                  Se connecter
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
