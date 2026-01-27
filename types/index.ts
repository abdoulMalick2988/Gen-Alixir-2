// GEN ALIXIR - Types TypeScript (Phase 1)

// Rôles disponibles dans GEN ALIXIR
export type Role = 'MEMBER' | 'PROJECT_LEAD' | 'FOUNDER' | 'MODERATOR';

// Utilisateur authentifié
export interface User {
  id: string;
  email: string;
  role: Role;
  created_at: Date;
}

// Profil complet d'un membre
export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  country: string;
  pco: number;
  aura: string[];
  aura_verified: boolean;
  skills: string[];
  created_at: Date;
  updated_at: Date;
}

// Membre complet (User + Profile)
export interface Member {
  user: User;
  profile: Profile;
}

// Données pour l'inscription
export interface RegisterData {
  email: string;
  full_name: string;
  country: string;
}

// Données pour la connexion
export interface LoginData {
  email: string;
  pin: string;
}

// Réponse d'authentification
export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  profile?: Profile;
  message?: string;
  pin?: string; // Seulement lors de l'inscription (pour affichage)
}

// Contexte d'authentification
export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

// Options pour les SKILLS disponibles
export const AVAILABLE_SKILLS = [
  'Design',
  'Vidéo/Image',
  'Développement',
  'Marketing',
  'Rédaction',
  'Gestion de Projet',
  'Data Analysis',
  'UI/UX',
  'Community Management',
  'Finance',
] as const;

export type Skill = typeof AVAILABLE_SKILLS[number];

// Options pour les AURA disponibles
export const AVAILABLE_AURA = [
  'Dynamique',
  'Créatif',
  'Collaboratif',
  'Analytique',
  'Leader',
  'Empathique',
  'Innovant',
  'Rigoureux',
  'Persévérant',
  'Visionnaire',
] as const;

export type Aura = typeof AVAILABLE_AURA[number];

// Descriptions des rôles
export const ROLE_DESCRIPTIONS: Record<Role, { title: string; description: string }> = {
  MEMBER: {
    title: 'Membre',
    description: 'Participe aux projets et contribue au développement de la communauté.',
  },
  PROJECT_LEAD: {
    title: 'Chef de Projet',
    description: 'Dirige et coordonne des projets au sein de GEN ALIXIR.',
  },
  FOUNDER: {
    title: 'Membre Fondateur',
    description: 'Membre fondateur avec privilèges de vérification et de mentorat.',
  },
  MODERATOR: {
    title: 'Modérateur',
    description: 'Supervise la communauté et assure le respect des valeurs GEN ALIXIR.',
  },
};

// Niveaux PCO (pour future utilisation)
export const PCO_LEVELS = [
  { min: 0, max: 29, title: 'Débutant', color: 'gray' },
  { min: 30, max: 59, title: 'Contributeur', color: 'blue' },
  { min: 60, max: 89, title: 'Actif', color: 'green' },
  { min: 90, max: 149, title: 'Expert', color: 'orange' },
  { min: 150, max: Infinity, title: 'Maître', color: 'purple' },
] as const;

// Fonction pour obtenir le niveau PCO
export function getPcoLevel(pco: number) {
  return PCO_LEVELS.find(level => pco >= level.min && pco <= level.max) || PCO_LEVELS[0];
}
