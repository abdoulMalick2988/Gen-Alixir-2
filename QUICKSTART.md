# 🚀 GEN ALIXIR - Guide de Démarrage Rapide

## 📦 Installation

### 1. Prérequis
- Node.js 18+ installé
- PostgreSQL 14+ installé et en cours d'exécution
- npm ou yarn

### 2. Configuration

```bash
# Naviguer dans le dossier du projet
cd gen-alixir

# Installer les dépendances
npm install

# Créer le fichier .env à partir de l'exemple
cp .env.example .env
```

### 3. Configurer la base de données

Éditez le fichier `.env` et configurez votre connexion PostgreSQL :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/genalixir"
JWT_SECRET="changez-moi-avec-une-cle-securisee"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Créez la base de données PostgreSQL :**

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE genalixir;

# Quitter
\q
```

### 4. Initialiser la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma db push

# Peupler avec des données de test (optionnel)
npm run seed
```

### 5. Lancer l'application

```bash
# Mode développement
npm run dev
```

L'application sera accessible sur **http://localhost:3000**

---

## 🧪 Tester l'Application

### Comptes de test (après seed)

Après avoir exécuté `npm run seed`, vous aurez accès à ces comptes :

#### Membre Standard
- **Email:** test@genalixir.com
- **PIN:** 123456
- **PCO:** 45

#### Chef de Projet
- **Email:** chef@genalixir.com
- **PIN:** 654321
- **PCO:** 120

#### Membre Fondateur
- **Email:** fondateur@genalixir.com
- **PIN:** 111111
- **PCO:** 200

#### Modérateur
- **Email:** moderateur@genalixir.com
- **PIN:** 222222
- **PCO:** 95

---

## 🗺️ Navigation dans l'Application

### Pages Publiques (sans connexion)

1. **Landing Page** - `/`
   - Vision et mission de GEN ALIXIR
   - Appel à l'action

2. **Concept** - `/concept`
   - Types de membres
   - Rôles et progression

3. **Skills & Aura** - `/skills-aura`
   - Système de compétences
   - Système de traits de caractère

4. **ECODREUM** - `/ecodreum`
   - Présentation de l'écosystème
   - Lien avec GEN ALIXIR

### Authentification

5. **Inscription** - `/auth/register`
   - Créer un nouveau compte
   - Récupérer le PIN généré

6. **Connexion** - `/auth/login`
   - Se connecter avec email + PIN

### Espace Membre (authentification requise)

7. **Dashboard** - `/dashboard`
   - Carte membre
   - PCO et niveau
   - SKILLS et AURA
   - Informations personnelles

---

## 🛠️ Fonctionnalités Disponibles (Phase 1)

### ✅ Implémenté

- ✓ Système d'authentification par email + PIN
- ✓ Inscription de nouveaux membres
- ✓ Connexion sécurisée (JWT)
- ✓ Dashboard membre complet
- ✓ Gestion des SKILLS (max 3)
- ✓ Gestion des AURA (max 3)
- ✓ Affichage du niveau PCO
- ✓ Carte membre visuelle
- ✓ Pages publiques informatives
- ✓ Design responsive (mobile-first)
- ✓ Architecture extensible

### 🔮 Prévu pour Phase 2

- ⏳ Système de projets collaboratifs
- ⏳ Attribution dynamique de PCO
- ⏳ Gestion des tâches
- ⏳ Système de vérification AURA
- ⏳ Historique des contributions
- ⏳ Notifications
- ⏳ Messagerie interne

---

## 📂 Structure du Code

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── api/               # API Routes
│   │   ├── auth/         # Endpoints authentification
│   │   └── profile/      # Endpoints profil
│   ├── auth/             # Pages auth (login, register)
│   ├── dashboard/        # Espace membre
│   ├── concept/          # Page Concept
│   ├── skills-aura/      # Page Skills & Aura
│   ├── ecodreum/         # Page ECODREUM
│   ├── layout.tsx        # Layout principal
│   └── page.tsx          # Landing page
├── components/            # Composants React
│   ├── ui/               # Composants UI réutilisables
│   └── layout/           # Composants de layout
├── contexts/             # React Contexts (Auth)
├── lib/                  # Utilitaires
│   ├── prisma.ts         # Client Prisma
│   ├── auth.ts           # Fonctions auth
│   └── utils.ts          # Helpers
└── types/                # Types TypeScript
```

---

## 🔐 Sécurité

### Authentification

- **PAS de mot de passe classique** - Utilisation de PIN à 4-6 chiffres
- Hashing sécurisé avec bcrypt (10 rounds)
- Tokens JWT avec expiration (7 jours)
- Validation stricte des entrées (Zod)

### Bonnes Pratiques

- Variables d'environnement pour les secrets
- HTTPS obligatoire en production
- Validation côté client ET serveur
- Protection des routes privées

---

## 🐛 Dépannage

### La base de données ne se connecte pas

```bash
# Vérifier que PostgreSQL est en cours d'exécution
pg_isready

# Vérifier la connexion
psql -U postgres -d genalixir
```

### Erreur "Module not found"

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Prisma errors

```bash
# Régénérer le client Prisma
npx prisma generate

# Réinitialiser la base de données
npx prisma db push --force-reset
npm run seed
```

---

## 📞 Support & Contribution

Pour toute question ou problème :

1. Vérifier la documentation dans `/README.md`
2. Consulter les commentaires dans le code
3. Vérifier les logs de l'application

---

## 🎯 Prochaines Étapes

Après avoir testé la Phase 1, vous serez prêt pour :

1. **Phase 2** - Système de projets et PCO dynamique
2. **Phase 3** - Fonctionnalités avancées de collaboration

Le code est structuré pour faciliter ces extensions futures !

---

**Version:** 1.0.0 (Phase 1)  
**Statut:** ✅ MVP Fonctionnel  
**Dernière mise à jour:** Janvier 2026
