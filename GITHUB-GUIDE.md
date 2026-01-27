# 📋 GEN ALIXIR - Guide de Déploiement sur GitHub

## 🎯 FICHIERS À COPIER SUR GITHUB

### ✅ TOUS LES FICHIERS SUIVANTS doivent être copiés :

## 📁 STRUCTURE COMPLÈTE DU PROJET

```
gen-alixir/                          ← Dossier racine de votre repo GitHub
│
├── 📄 README.md                     ✅ COPIER
├── 📄 QUICKSTART.md                 ✅ COPIER
├── 📄 DELIVERY.md                   ✅ COPIER (optionnel)
├── 📄 package.json                  ✅ COPIER
├── 📄 package-lock.json             ✅ COPIER (sera généré après npm install)
├── 📄 tsconfig.json                 ✅ COPIER
├── 📄 next.config.js                ✅ COPIER
├── 📄 tailwind.config.js            ✅ COPIER
├── 📄 postcss.config.js             ✅ COPIER
├── 📄 .env.example                  ✅ COPIER
├── 📄 .gitignore                    ✅ COPIER
│
├── 📁 prisma/                       ✅ COPIER TOUT LE DOSSIER
│   ├── schema.prisma                ✅ COPIER
│   └── seed.js                      ✅ COPIER
│
├── 📁 public/                       ✅ COPIER (vide pour l'instant)
│   └── images/                      
│
└── 📁 src/                          ✅ COPIER TOUT LE DOSSIER
    ├── 📁 app/
    │   ├── globals.css              ✅ COPIER
    │   ├── layout.tsx               ✅ COPIER
    │   ├── page.tsx                 ✅ COPIER
    │   │
    │   ├── 📁 api/
    │   │   ├── 📁 auth/
    │   │   │   ├── 📁 register/
    │   │   │   │   └── route.ts     ✅ COPIER
    │   │   │   ├── 📁 login/
    │   │   │   │   └── route.ts     ✅ COPIER
    │   │   │   └── 📁 me/
    │   │   │       └── route.ts     ✅ COPIER
    │   │   └── 📁 profile/
    │   │       └── route.ts         ✅ COPIER
    │   │
    │   ├── 📁 auth/
    │   │   ├── 📁 login/
    │   │   │   └── page.tsx         ✅ COPIER
    │   │   └── 📁 register/
    │   │       └── page.tsx         ✅ COPIER
    │   │
    │   ├── 📁 dashboard/
    │   │   └── page.tsx             ✅ COPIER
    │   │
    │   ├── 📁 concept/
    │   │   └── page.tsx             ✅ COPIER
    │   │
    │   ├── 📁 skills-aura/
    │   │   └── page.tsx             ✅ COPIER
    │   │
    │   └── 📁 ecodreum/
    │       └── page.tsx             ✅ COPIER
    │
    ├── 📁 components/
    │   ├── ProtectedRoute.tsx       ✅ COPIER
    │   │
    │   ├── 📁 ui/
    │   │   ├── Button.tsx           ✅ COPIER
    │   │   ├── Input.tsx            ✅ COPIER
    │   │   ├── Card.tsx             ✅ COPIER
    │   │   └── Badge.tsx            ✅ COPIER
    │   │
    │   └── 📁 layout/
    │       ├── Header.tsx           ✅ COPIER
    │       └── Footer.tsx           ✅ COPIER
    │
    ├── 📁 contexts/
    │   └── AuthContext.tsx          ✅ COPIER
    │
    ├── 📁 lib/
    │   ├── prisma.ts                ✅ COPIER
    │   ├── auth.ts                  ✅ COPIER
    │   └── utils.ts                 ✅ COPIER
    │
    └── 📁 types/
        └── index.ts                 ✅ COPIER
```

---

## 🚫 FICHIERS À NE PAS COPIER SUR GITHUB

Ces fichiers sont dans `.gitignore` et ne doivent PAS être sur GitHub :

```
❌ node_modules/          # Dépendances (seront installées avec npm install)
❌ .next/                 # Build Next.js (généré automatiquement)
❌ .env                   # Variables d'environnement (SECRETS!)
❌ .env.local             # Variables locales
❌ package-lock.json      # (sera généré, mais vous POUVEZ le copier)
❌ *.log                  # Fichiers de log
```

---

## 📝 CHECKLIST DE DÉPLOIEMENT

### ✅ Étape 1 : Créer le Repository GitHub

```bash
# Sur GitHub.com :
# 1. Cliquer sur "New repository"
# 2. Nom : gen-alixir
# 3. Description : Incubateur Numérique Africain Décentralisé - ECODREUM
# 4. Public ou Private (au choix)
# 5. NE PAS initialiser avec README (on a déjà le nôtre)
# 6. Cliquer "Create repository"
```

### ✅ Étape 2 : Initialiser Git localement

```bash
# Dans le dossier gen-alixir/
cd gen-alixir

# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "🎉 Initial commit - GEN ALIXIR Phase 1 MVP"

# Renommer la branche en main
git branch -M main

# Ajouter le remote (remplacer USERNAME par votre nom GitHub)
git remote add origin https://github.com/USERNAME/gen-alixir.git

# Pousser vers GitHub
git push -u origin main
```

### ✅ Étape 3 : Vérifier sur GitHub

Allez sur `https://github.com/USERNAME/gen-alixir` et vérifiez que vous voyez :
- ✅ README.md affiché sur la page d'accueil
- ✅ Tous les dossiers (src/, prisma/, etc.)
- ✅ .gitignore présent
- ✅ .env.example présent
- ❌ PAS de .env (doit être ignoré)
- ❌ PAS de node_modules/

---

## 🔒 SÉCURITÉ - FICHIERS SENSIBLES

### ⚠️ IMPORTANT : Ne JAMAIS copier sur GitHub

**FICHIER `.env` - CONTIENT DES SECRETS !**

```env
# ❌ NE JAMAIS COPIER CE FICHIER SUR GITHUB
DATABASE_URL="postgresql://user:password@localhost:5432/genalixir"  # ← MOT DE PASSE!
JWT_SECRET="super-secret-key-123456789"                             # ← SECRET!
```

**SOLUTION :**
- ✅ Copier `.env.example` (sans valeurs sensibles)
- ❌ NE PAS copier `.env`
- 📝 Chaque développeur crée son propre `.env` localement

---

## 📦 FICHIERS MINIMUM REQUIS

Si vous devez minimiser, voici les fichiers **ABSOLUMENT NÉCESSAIRES** :

### Configuration Racine (7 fichiers)
```
✅ package.json           # Dépendances du projet
✅ tsconfig.json          # Config TypeScript
✅ next.config.js         # Config Next.js
✅ tailwind.config.js     # Config Tailwind
✅ postcss.config.js      # Config PostCSS
✅ .env.example           # Exemple de variables
✅ .gitignore             # Fichiers à ignorer
```

### Documentation (3 fichiers)
```
✅ README.md              # Documentation principale
✅ QUICKSTART.md          # Guide de démarrage
📄 DELIVERY.md            # (Optionnel) Récapitulatif
```

### Base de données (2 fichiers)
```
✅ prisma/schema.prisma   # Schéma DB
✅ prisma/seed.js         # Données de test
```

### Code source (TOUT le dossier src/)
```
✅ src/                   # TOUT LE CONTENU
```

---

## 🎯 COMMANDES RAPIDES

### Copier le projet complet sur GitHub en une fois

```bash
# 1. Naviguer dans le dossier
cd gen-alixir

# 2. Initialiser Git
git init
git add .
git commit -m "🎉 Initial commit - GEN ALIXIR Phase 1 MVP"

# 3. Connecter à GitHub (remplacer USERNAME)
git remote add origin https://github.com/USERNAME/gen-alixir.git
git branch -M main
git push -u origin main
```

### Mettre à jour après modifications

```bash
git add .
git commit -m "Description des changements"
git push
```

---

## 📊 VÉRIFICATION FINALE

Après avoir poussé sur GitHub, vérifiez que vous avez :

### ✅ Dans le repository GitHub :

**Dossiers principaux :**
- [ ] `src/` avec tous les sous-dossiers
- [ ] `prisma/` avec schema.prisma et seed.js
- [ ] `public/` (même vide)

**Fichiers de configuration :**
- [ ] `package.json`
- [ ] `tsconfig.json`
- [ ] `next.config.js`
- [ ] `tailwind.config.js`
- [ ] `postcss.config.js`
- [ ] `.gitignore`
- [ ] `.env.example`

**Documentation :**
- [ ] `README.md`
- [ ] `QUICKSTART.md`

**Fichiers absents (c'est normal) :**
- [ ] `.env` (doit être ignoré)
- [ ] `node_modules/` (doit être ignoré)
- [ ] `.next/` (doit être ignoré)

---

## 👥 POUR LES COLLABORATEURS

Quand quelqu'un clone votre repository :

```bash
# 1. Cloner
git clone https://github.com/USERNAME/gen-alixir.git
cd gen-alixir

# 2. Installer les dépendances
npm install

# 3. Créer son .env
cp .env.example .env
# Éditer .env avec ses propres valeurs

# 4. Initialiser la base de données
npx prisma generate
npx prisma db push
npm run seed

# 5. Lancer
npm run dev
```

---

## 📌 RÉSUMÉ ULTRA-RAPIDE

**À COPIER sur GitHub :**
✅ TOUT le dossier `gen-alixir/` SAUF :
- ❌ `node_modules/`
- ❌ `.next/`
- ❌ `.env`
- ❌ `*.log`

**Le `.gitignore` s'en charge automatiquement !**

**Commande unique :**
```bash
cd gen-alixir
git init && git add . && git commit -m "Initial commit" 
git remote add origin https://github.com/USERNAME/gen-alixir.git
git branch -M main && git push -u origin main
```

---

## 🆘 AIDE RAPIDE

### Problème : Git refuse de pusher

```bash
# Solution : Forcer le push (première fois uniquement)
git push -u origin main --force
```

### Problème : Fichier .env copié par erreur

```bash
# Supprimer du tracking Git
git rm --cached .env
git commit -m "Remove .env from tracking"
git push
```

### Problème : node_modules/ copié par erreur

```bash
# Supprimer du tracking Git
git rm -r --cached node_modules/
git commit -m "Remove node_modules from tracking"
git push
```

---

**✨ Votre projet GEN ALIXIR est maintenant prêt pour GitHub !**
