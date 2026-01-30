// Types globaux pour GEN ALIXIR

export type ProjectStatus = 'en_cours' | 'rejete' | 'termine'

export type PlayerPosition = 'gardien' | 'defenseur' | 'attaquant'

export type AuraType = 'leadership' | 'creativite' | 'technique' | 'strategie' | 'collaboration'

export interface Member {
  id: string
  gen_alixir_id: string
  email: string
  nom: string
  prenom: string
  pays: string
  photo_url?: string
  pole_competence: string
  skills: string[]
  aura_dominante: AuraType
  pco_total: number
  created_at: string
}

export interface Project {
  id: string
  nom: string
  theme: string
  description: string
  statut: ProjectStatus
  date_creation: string
  date_limite_rejoindre: string
  equipe_principale: TeamMember[]
  equipe_adverse?: TeamMember[]
  buts_marques: number
  phase_actuelle: number
  created_by: string
}

export interface TeamMember {
  member_id: string
  position: PlayerPosition
  nom_complet: string
  photo_url?: string
  skills: string[]
}

export interface Notification {
  id: string
  type: 'goal' | 'rejet' | 'nouveau_projet' | 'nouveau_membre'
  message: string
  project_id?: string
  member_id?: string
  created_at: string
}

export interface FormJoinCommunity {
  nom: string
  prenom: string
  email: string
  pays: string
  pole_competence: string
  skills: string[]
  aura_dominante: AuraType
}
