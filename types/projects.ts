// GEN ALIXIR - Phase 2 - Types pour les Projets
// Ajouter ce contenu À LA FIN du fichier src/types/index.ts existant

// =====================================================
// PHASE 2 - TYPES PROJETS
// =====================================================

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  owner_id: string;
  max_members: number;
  skills_required: string[];
  created_at: Date;
  updated_at: Date;
  completed_at?: Date | null;
}

export interface ProjectWithDetails extends Project {
  owner: {
    id: string;
    email: string;
    role: Role;
    profile: Profile;
  };
  members: ProjectMemberWithUser[];
  _count?: {
    members: number;
  };
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: string; // 'MEMBER' ou 'CO_LEAD'
  joined_at: Date;
}

export interface ProjectMemberWithUser extends ProjectMember {
  user: {
    id: string;
    email: string;
    role: Role;
    profile: Profile;
  };
}

export interface CreateProjectData {
  name: string;
  description: string;
  max_members: number;
  skills_required: string[];
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  max_members?: number;
  skills_required?: string[];
}

// Descriptions des statuts de projet
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, { title: string; description: string; color: string }> = {
  PLANNING: {
    title: 'En planification',
    description: 'Le projet est en cours de préparation',
    color: 'blue',
  },
  ACTIVE: {
    title: 'En cours',
    description: 'Le projet est actif et les membres travaillent dessus',
    color: 'green',
  },
  COMPLETED: {
    title: 'Terminé',
    description: 'Le projet a été complété avec succès',
    color: 'purple',
  },
  ARCHIVED: {
    title: 'Archivé',
    description: 'Le projet est archivé et inactif',
    color: 'gray',
  },
};

// Fonction helper pour vérifier si un utilisateur peut créer des projets
export function canCreateProject(role: Role): boolean {
  return role === 'PROJECT_LEAD' || role === 'FOUNDER' || role === 'MODERATOR';
}

// Fonction helper pour vérifier si un utilisateur est le owner d'un projet
export function isProjectOwner(project: Project, userId: string): boolean {
  return project.owner_id === userId;
}

// Fonction helper pour vérifier si un projet est complet
export function isProjectFull(project: ProjectWithDetails): boolean {
  const memberCount = project._count?.members || project.members?.length || 0;
  return memberCount >= project.max_members;
}

// Fonction helper pour vérifier si un utilisateur est membre d'un projet
export function isMemberOfProject(project: ProjectWithDetails, userId: string): boolean {
  return project.members.some(member => member.user_id === userId) || project.owner_id === userId;
}
