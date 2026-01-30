'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Section from '@/components/ui/Section'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { signInWithEmail, signInWithPin } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [loginMethod, setLoginMethod] = useState<'email' | 'pin'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [emailForm, setEmailForm] = useState({ email: '', password: '' })
  const [pinForm, setPinForm] = useState({ genId: '', pin: '' })
  
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await signInWithEmail(emailForm.email, emailForm.password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }
  
  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await signInWithPin(pinForm.genId, pinForm.pin)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'ID GEN ALIXIR ou Code PIN incorrect')
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
            Accédez à votre espace membre
          </p>
        </div>
        
        <Card glow className="max-w-md mx-auto">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}
          
          {/* Toggle Login Method */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={loginMethod === 'email' ? 'primary' : 'outline'}
              fullWidth
              onClick={() => setLoginMethod('email')}
            >
              Email
            </Button>
            <Button
              variant={loginMethod === 'pin' ? 'primary' : 'outline'}
              fullWidth
              onClick={() => setLoginMethod('pin')}
            >
              Code PIN
            </Button>
          </div>
          
          {/* Email Login Form */}
          {loginMethod === 'email' && (
            <form className="space-y-4" onSubmit={handleEmailLogin}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={emailForm.email}
                  onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="votre@email.com"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  value={emailForm.password}
                  onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="••••••••"
                  required
                />
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
          )}
          
          {/* PIN Login Form */}
          {loginMethod === 'pin' && (
            <form className="space-y-4" onSubmit={handlePinLogin}>
              <div>
                <label htmlFor="gen-id" className="block text-sm font-medium text-gray-300 mb-2">
                  ID GEN ALIXIR
                </label>
                <input
                  type="text"
                  id="gen-id"
                  value={pinForm.genId}
                  onChange={(e) => setPinForm({ ...pinForm, genId: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="GEN-XXXXX"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-gray-300 mb-2">
                  Code PIN
                </label>
                <input
                  type="password"
                  id="pin"
                  value={pinForm.pin}
                  onChange={(e) => setPinForm({ ...pinForm, pin: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="••••"
                  maxLength={4}
                  required
                />
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
          )}
          
          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Pas encore membre ?{' '}
              <Link href="/join" className="text-emerald-400 hover:text-emerald-300">
                Rejoindre la communauté
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </Section>
  )
}
