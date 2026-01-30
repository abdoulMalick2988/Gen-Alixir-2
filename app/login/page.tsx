'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Section from '@/components/ui/Section'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { signInWithEmailAndPin } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({ email: '', pin: '' })
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      if (!formData.email || !formData.pin) {
        throw new Error('Veuillez remplir tous les champs')
      }
      
      if (formData.pin.length !== 4) {
        throw new Error('Le Code PIN doit contenir 4 chiffres')
      }
      
      await signInWithEmailAndPin(formData.email, formData.pin)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Email ou Code PIN incorrect')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Section containerSize="sm" className="min-h-screen flex items-center">
      <div className="w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Connexion à <span className="text-emerald-400">GEN ALIXIR</span>
          </h1>
          <p className="text-gray-300">
            Connectez-vous avec votre email et votre Code PIN
          </p>
        </div>
        
        <Card glow className="max-w-md mx-auto">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}
          
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="votre@email.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-300 mb-2">
                Code PIN (4 chiffres)
              </label>
              <input
                type="password"
                id="pin"
                value={formData.pin}
                onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-2xl tracking-widest"
                placeholder="••••"
                maxLength={4}
                pattern="\d{4}"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Code reçu par email après validation de votre adhésion
              </p>
            </div>
            
            <Button 
              variant="primary" 
              fullWidth 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
          
          <div className="mt-6 space-y-3">
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Pas encore membre ?{' '}
                <Link href="/join" className="text-emerald-400 hover:text-emerald-300">
                  Faire une demande d'adhésion
                </Link>
              </p>
            </div>
            
            <div className="pt-3 border-t border-white/10 text-center">
              <p className="text-gray-500 text-xs">
                🔒 Code PIN perdu ou à modifier ?<br />
                Envoyez un email à : <strong className="text-emerald-400">support@genalixir.com</strong>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Section>
  )
}
