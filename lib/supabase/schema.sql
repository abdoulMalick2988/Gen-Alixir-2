-- ========================================
-- SCHÉMA BASE DE DONNÉES SUPABASE
-- GEN ALIXIR - PARTIE 1 (CONCEPTUEL)
-- ========================================
-- ⚠️ Ce fichier sera exécuté dans Supabase lors de la PARTIE 2
-- Il définit la structure complète de la base de données

-- ========================================
-- TABLE: members_profiles
-- Profils des membres de la communauté
-- ========================================
CREATE TABLE IF NOT EXISTS members_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gen_alixir_id VARCHAR(20) UNIQUE NOT NULL, -- Format: GEN-XXXXX
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations personnelles
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  pays VARCHAR(100) NOT NULL,
  photo_url TEXT,
  
  -- Compétences
  pole_competence VARCHAR(100) NOT NULL,
  skills TEXT[] DEFAULT '{}', -- Array de compétences
  aura_dominante VARCHAR(50) NOT NULL, -- leadership, creativite, technique, strategie, collaboration
  
  -- Statistiques
  pco_total INTEGER DEFAULT 0,
  projets_rejoints INTEGER DEFAULT 0,
  projets_crees INTEGER DEFAULT 0,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLE: projects
-- Projets de la communauté
-- ========================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Informations du projet
  nom VARCHAR(200) NOT NULL,
  theme VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  
  -- Statut et timing
  statut VARCHAR(50) DEFAULT 'en_cours', -- en_cours, rejete, termine
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_limite_rejoindre TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Progression
  buts_marques INTEGER DEFAULT 0,
  phase_actuelle INTEGER DEFAULT 1, -- 1 à 5 (gardien, def1, def2, att1, att2)
  
  -- Créateur
  created_by UUID REFERENCES members_profiles(id) ON DELETE CASCADE,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLE: team_members
-- Membres d'une équipe projet
-- ========================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members_profiles(id) ON DELETE CASCADE,
  
  -- Position dans l'équipe
  position VARCHAR(50) NOT NULL, -- gardien, defenseur, attaquant
  equipe VARCHAR(50) NOT NULL, -- principale, adverse
  
  -- Contribution
  pco_gagnes INTEGER DEFAULT 0,
  
  -- Métadonnées
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(project_id, member_id, equipe)
);

-- ========================================
-- TABLE: notifications
-- Notifications communautaires
-- ========================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Type et contenu
  type VARCHAR(50) NOT NULL, -- goal, rejet, nouveau_projet, nouveau_membre
  message TEXT NOT NULL,
  
  -- Références
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members_profiles(id) ON DELETE CASCADE,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- TABLE: project_phases
-- Validation des phases d'un projet
-- ========================================
CREATE TABLE IF NOT EXISTS project_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Phase
  phase_numero INTEGER NOT NULL, -- 1 à 5
  phase_nom VARCHAR(100) NOT NULL, -- Gardien, Défenseur 1, etc.
  
  -- Validation
  valide BOOLEAN DEFAULT FALSE,
  validee_par UUID REFERENCES members_profiles(id),
  date_validation TIMESTAMP WITH TIME ZONE,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(project_id, phase_numero)
);

-- ========================================
-- INDEXES pour optimisation
-- ========================================
CREATE INDEX idx_members_gen_id ON members_profiles(gen_alixir_id);
CREATE INDEX idx_projects_statut ON projects(statut);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_team_members_project ON team_members(project_id);
CREATE INDEX idx_team_members_member ON team_members(member_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ========================================
-- FONCTIONS & TRIGGERS
-- ========================================

-- Fonction pour générer un ID GEN ALIXIR unique
CREATE OR REPLACE FUNCTION generate_gen_alixir_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  id_exists BOOLEAN;
BEGIN
  LOOP
    new_id := 'GEN-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    SELECT EXISTS(SELECT 1 FROM members_profiles WHERE gen_alixir_id = new_id) INTO id_exists;
    EXIT WHEN NOT id_exists;
  END LOOP;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_members_profiles_updated_at
  BEFORE UPDATE ON members_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Row Level Security (RLS)
-- Sera activé dans la PARTIE 2
-- ========================================
-- ALTER TABLE members_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;
