'use client'

import { useEffect, useState } from 'react'
import { getCurrentSession, getMemberProfile } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

type MemberProfile = Database['public']['Tables']['members_profiles']['Row']

export function useAuth() {
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSession()
  }, [])

  const loadSession = async () => {
    try {
      const session = await getCurrentSession()
      
      if (session && session.profile_id) {
        const memberProfile = await getMemberProfile(session.profile_id)
        setProfile(memberProfile)
      }
    } catch (error) {
      console.error('Erreur loadSession:', error)
    } finally {
      setLoading(false)
    }
  }

  return { profile, loading, isAuthenticated: !!profile }
}
