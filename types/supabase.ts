export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      members_profiles: {
        Row: {
          id: string
          gen_alixir_id: string
          user_id: string
          nom: string
          prenom: string
          email: string
          pays: string
          photo_url: string | null
          pin_code: string | null
          pole_competence: string
          skills: string[]
          aura_dominante: string
          pco_total: number
          projets_rejoints: number
          projets_crees: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          gen_alixir_id: string
          user_id: string
          nom: string
          prenom: string
          email: string
          pays: string
          photo_url?: string | null
          pin_code?: string | null
          pole_competence: string
          skills?: string[]
          aura_dominante: string
          pco_total?: number
          projets_rejoints?: number
          projets_crees?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          gen_alixir_id?: string
          user_id?: string
          nom?: string
          prenom?: string
          email?: string
          pays?: string
          photo_url?: string | null
          pin_code?: string | null
          pole_competence?: string
          skills?: string[]
          aura_dominante?: string
          pco_total?: number
          projets_rejoints?: number
          projets_crees?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      generate_gen_alixir_id: {
        Args: Record<string, never>
        Returns: string
      }
      generate_pin_code: {
        Args: Record<string, never>
        Returns: string
      }
    }
  }
}
