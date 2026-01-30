'use client'

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// ========================================
// FONCTIONS D'ADHÉSION
// ========================================

export async function submitAdhesionRequest(data: {
  nom: string
  prenom: string
  email: string
  pays: string
  pole_competence: string
  skills: string[]
  aura_dominante: string
}) {
  try {
    const { data: adhesion, error } = await supabase
      .from('adhesion_requests')
      .insert({
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        pays: data.pays,
        pole_competence: data.pole_competence,
        skills: data.skills,
        aura_dominante: data.aura_dominante,
        statut: 'en_attente',
      })
      .select()
      .single()

    if (error) throw error
    return adhesion
  } catch (error: any) {
    // Vérifier si l'email existe déjà
    if (error.code === '23505') {
      throw new Error('Une demande avec cet email existe déjà')
    }
    console.error('Erreur submitAdhesionRequest:', error)
    throw error
  }
}

// ========================================
// FONCTIONS D'AUTHENTIFICATION
// ========================================

export async function signInWithEmailAndPin(email: string, pinCode: string) {
  try {
    // Vérifier que le membre existe et est validé
    const { data: profile, error: profileError } = await supabase
      .from('members_profiles')
      .select('*')
      .eq('email', email)
      .eq('pin_code', pinCode)
      .eq('statut', 'valide')
      .single()

    if (profileError || !profile) {
      throw new Error('Email ou Code PIN incorrect, ou compte non validé')
    }

    // Stocker les infos dans localStorage pour la session
    if (typeof window !== 'undefined') {
      localStorage.setItem('gen_alixir_session', JSON.stringify({
        profile_id: profile.id,
        email: profile.email,
        gen_alixir_id: profile.gen_alixir_id,
        logged_in_at: new Date().toISOString(),
      }))
    }

    return { profile }
  } catch (error) {
    console.error('Erreur signInWithEmailAndPin:', error)
    throw error
  }
}

export async function signOut() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('gen_alixir_session')
  }
}

export async function getCurrentSession() {
  if (typeof window !== 'undefined') {
    const sessionData = localStorage.getItem('gen_alixir_session')
    if (sessionData) {
      return JSON.parse(sessionData)
    }
  }
  return null
}

// ========================================
// FONCTIONS PROFIL MEMBRE
// ========================================

export async function getMemberProfile(profileId: string) {
  try {
    const { data, error } = await supabase
      .from('members_profiles')
      .select('*')
      .eq('id', profileId)
      .eq('statut', 'valide')
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur getMemberProfile:', error)
    return null
  }
}

export async function getMemberProfileByEmail(email: string) {
  try {
    const { data, error } = await supabase
      .from('members_profiles')
      .select('*')
      .eq('email', email)
      .eq('statut', 'valide')
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur getMemberProfileByEmail:', error)
    return null
  }
}

// ========================================
// FONCTIONS ADMIN (pour validation)
// ========================================

export async function getPendingAdhesions() {
  try {
    const { data, error } = await supabase
      .from('adhesion_requests')
      .select('*')
      .eq('statut', 'en_attente')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur getPendingAdhesions:', error)
    return []
  }
}
