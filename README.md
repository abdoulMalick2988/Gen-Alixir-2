# 🌍 GEN ALIXIR - Phase 1 MVP

## Incubateur Numérique Africain Décentralisé

GEN ALIXIR est une plateforme qui permet aux jeunes talents africains de rejoindre une communauté structurée, collaborer sur des projets et évoluer via le système PCO (Points de Contribution).

---

## 📦 Stack Technique

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **État**: React Context API
- **UI Components**: Composants custom

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Base de données**: PostgreSQL
- **ORM**: Prisma
- **Authentification**: JWT + PIN (4-6 chiffres)

### Sécurité
- Hashing PIN avec bcrypt
- JWT pour les sessions
- Validation des entrées
- HTTPS obligatoire en production

---

## 📁 Structure du Projet

```
gen-alixir/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Landing page
│   │   ├── concept/           # Page Concept GEN ALIXIR
│   │   ├── skills-aura/       # Page SKILLS & AURA
│   │   ├── ecodreum/          # Page Univers ECODREUM
│   │   ├── auth/              # Pages authentification
│   │   ├── dashboard/         # Espace membre
│   │   └── api/               # API Routes
│   ├── components/            # Composants réutilisables
│   ├── contexts/              # React Contexts
│   ├── lib/                   # Utilitaires
│   └── types/                 # TypeScript types
├── prisma/
│   └── schema.prisma          # Schéma de base de données
├── public/                    # Assets statiques
└── package.json
```

---

## 🗄️ Modèle de Données

### Table `users`
- `id`: UUID (PK)
- `email`: String (unique)
- `pin_hash`: String
- `role`: Enum (MEMBER, PROJECT_LEAD, FOUNDER, MODERATOR)
- `created_at`: DateTime
- `updated_at`: DateTime

### Table `profiles`
- `id`: UUID (PK)
- `user_id`: UUID (FK → users)
- `full_name`: String
- `country`: String
- `pco`: Integer (défaut: 0)
- `aura`: JSON Array (max 3)
- `aura_verified`: Boolean
- `skills`: JSON Array (max 3)
- `created_at`: DateTime
- `updated_at`: DateTime

---

## 🔐 Système d'Authentification

### Principe
**PAS de mot de passe classique** - Utilisation d'un PIN à 4-6 chiffres

### Flow d'inscription
1. Utilisateur fournit: email, nom complet, pays
2. Génération automatique d'un PIN aléatoire (6 chiffres)
3. Envoi du PIN par email
4. Stockage sécurisé (bcrypt hash)

### Flow de connexion
1. Saisie de l'email
2. Saisie du PIN
3. Vérification
4. Génération JWT
5. Redirection vers dashboard

### Régénération PIN
- Demande via email
- Nouveau PIN généré et envoyé
- Ancien PIN invalidé

---

## 🎨 Pages Publiques

### 1. Landing Page (`/`)
- Vision de GEN ALIXIR
- Mission
- Valeur unique
- Lien avec ECODREUM
- CTA "Adhérer / Se connecter"

### 2. Concept (`/concept`)
- Types de membres et leurs rôles
- Hiérarchie et progression

### 3. SKILLS & AURA (`/skills-aura`)
- Explication du système de compétences
- Explication du système AURA
- Badge vérifié

### 4. Univers ECODREUM (`/ecodreum`)
- Présentation du réseau économique
- Lien stratégique avec GEN ALIXIR

---

## 🏠 Dashboard Membre

### Fonctionnalités Phase 1
- Affichage profil
- Carte membre (visuel)
- PCO actuel (statique)
- SKILLS (3 max)
- AURA (3 max avec badge vérifié)
- Informations personnelles

### Préparation Phase 2
- Structure pour projets
- Historique PCO
- Système de notifications

---

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Installation

```bash
# Cloner le projet
cd gen-alixir

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env

# Éditer .env avec vos configurations
# DATABASE_URL="postgresql://user:password@localhost:5432/genalixir"
# JWT_SECRET="votre-secret-jwt-super-securise"
# NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Initialiser la base de données
npx prisma generate
npx prisma db push

# (Optionnel) Peupler avec des données de test
npm run seed

# Lancer en développement
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

---

## 🧪 Tester un Compte Membre

### Option 1: Via l'interface
1. Aller sur `/auth/register`
2. Remplir le formulaire
3. Récupérer le PIN (affiché ou envoyé par email)
4. Se connecter sur `/auth/login`

### Option 2: Compte de test (après seed)
```
Email: test@genalixir.com
PIN: 123456
```

---

## 📝 API Endpoints (Phase 1)

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/regenerate-pin` - Régénérer PIN
- `POST /api/auth/logout` - Déconnexion

### Profil
- `GET /api/profile` - Obtenir profil
- `PUT /api/profile` - Mettre à jour profil
- `PUT /api/profile/skills` - Mettre à jour skills
- `PUT /api/profile/aura` - Mettre à jour aura

---

## 🔮 Préparation Phase 2

### Fonctionnalités prévues
- Système de projets complet
- Logique PCO dynamique
- Collaboration entre membres
- Système de tâches
- Historique des contributions

### Structure préparée
- Relations DB pour projets
- Hooks React pour gestion d'état
- Architecture modulaire extensible

---

## 🌍 Philosophie GEN ALIXIR

- **Méritocratie**: Reconnaissance basée sur la contribution
- **Collaboration**: Travail d'équipe et partage
- **Discipline**: Engagement et rigueur
- **Inclusion**: Ouverture à tous les talents africains
- **Vision long terme**: Bâtir l'avenir numérique africain

---

## 📞 Support

Pour toute question ou problème:
- Documentation complète dans `/docs`
- Commentaires dans le code
- Architecture extensible pour évolution

---

**Version**: 1.0.0 (Phase 1)
**Date**: Janvier 2026
**Statut**: MVP Fonctionnel
