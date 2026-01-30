'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Section from '@/components/ui/Section'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useAuth } from '@/lib/hooks/useAuth'
import { signOut } from '@/lib/supabase/client'
import { AURA_TYPES } from '@/lib/constants'

export default function DashboardPage() {
  const router = useRouter()
  const { profile, loading, isAuthenticated } = useAuth()
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])
  
  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }
  
  if (loading) {
    return (
      <Section containerSize="lg" className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </Section>
    )
  }
  
  if (!profile) {
    return null
  }
  
  const auraInfo = AURA_TYPES.find(a => a.value === profile.aura_dominante)
  
  return (
    <Section containerSize="lg" className="min-h-screen py-20">
      {/* ... reste du code identique ... */}
    </Section>
  )
}
