'use client'

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// ========================================
// FONCTIONS D'AUTHENTIFICATION
// ========================================

export async function signUp(email: string, password: string, userData: {
  nom: string
  prenom: string
  pays: string
  pole_competence: string
  skills: string[]
  aura_dominante: string
}) {
  try {
    // 1. Créer l'utilisateur dans Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Erreur lors de la création du compte')

    // 2. Générer GEN ID et PIN
    const { data: genId } = await supabase.rpc('generate_gen_alixir_id')
    const { data: pinCode } = await supabase.rpc('generate_pin_code')

    // 3. Créer le profil membre
    const { data: profile, error: profileError } = await supabase
      .from('members_profiles')
      .insert({
        user_id: authData.user.id,
        gen_alixir_id: genId,
        pin_code: pinCode,
        email,
        nom: userData.nom,
        prenom: userData.prenom,
        pays: userData.pays,
        pole_competence: userData.pole_competence,
        skills: userData.skills,
        aura_dominante: userData.aura_dominante,
      })
      .select()
      .single()

    if (profileError) throw profileError

    return { user: authData.user, profile, genId, pinCode }
  } catch (error) {
    console.error('Erreur signUp:', error)
    throw error
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur signInWithEmail:', error)
    throw error
  }
}

export async function signInWithPin(genAlixirId: string, pinCode: string) {
  try {
    // 1. Trouver l'utilisateur avec GEN ID et PIN
    const { data: profile, error: profileError } = await supabase
      .from('members_profiles')
      .select('*, user_id')
      .eq('gen_alixir_id', genAlixirId)
      .eq('pin_code', pinCode)
      .single()

    if (profileError || !profile) {
      throw new Error('ID GEN ALIXIR ou Code PIN incorrect')
    }

    // 2. Récupérer l'email de l'utilisateur
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profile.user_id)
    
    if (userError || !userData) {
      throw new Error('Utilisateur introuvable')
    }

    // Note: La connexion par PIN nécessite une approche différente
    // Pour l'instant, on retourne le profil pour affichage
    return { profile }
  } catch (error) {
    console.error('Erreur signInWithPin:', error)
    throw error
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ========================================
// FONCTIONS PROFIL MEMBRE
// ========================================

export async function getMemberProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('members_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur getMemberProfile:', error)
    return null
  }
}

export async function updateMemberProfile(userId: string, updates: Partial<{
  nom: string
  prenom: string
  pays: string
  pole_competence: string
  skills: string[]
  aura_dominante: string
  photo_url: string
}>) {
  try {
    const { data, error } = await supabase
      .from('members_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erreur updateMemberProfile:', error)
    throw error
  }
}
