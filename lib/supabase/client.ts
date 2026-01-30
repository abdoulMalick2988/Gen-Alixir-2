// Client Supabase (sera configuré dans la PARTIE 2)
// Pour l'instant, ce fichier est un placeholder

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Fonctions d'aide qui seront implémentées dans les parties suivantes
export const getProjects = async () => {
  // À implémenter PARTIE 4
  return []
}

export const getNotifications = async () => {
  // À implémenter PARTIE 5
  return []
}

export const getMemberProfile = async (userId: string) => {
  // À implémenter PARTIE 3
  return null
}
