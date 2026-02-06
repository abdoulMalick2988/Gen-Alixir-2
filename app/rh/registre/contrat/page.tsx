-- Table pour stocker les contrats
CREATE TABLE IF NOT EXISTS contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  verification_id TEXT UNIQUE NOT NULL,
  employee_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  document_mode TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_address TEXT,
  company_rccm TEXT,
  company_id TEXT,
  boss_name TEXT,
  boss_title TEXT,
  start_date DATE,
  end_date DATE,
  salary TEXT,
  country TEXT NOT NULL,
  contract_data JSONB NOT NULL,
  employer_signature TEXT,
  employee_signature TEXT,
  qr_code TEXT,
  is_signed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide par verification_id
CREATE INDEX IF NOT EXISTS idx_contracts_verification_id ON contracts(verification_id);

-- Index pour recherche par entreprise
CREATE INDEX IF NOT EXISTS idx_contracts_company ON contracts(company_name);

-- Activer RLS (Row Level Security)
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique (pour vérification QR)
CREATE POLICY "Lecture publique des contrats" ON contracts
  FOR SELECT USING (true);

-- Politique pour permettre l'insertion (vous pouvez restreindre plus tard)
CREATE POLICY "Insertion des contrats" ON contracts
  FOR INSERT WITH CHECK (true);

-- Politique pour permettre la suppression
CREATE POLICY "Suppression des contrats" ON contracts
  FOR DELETE USING (true);
