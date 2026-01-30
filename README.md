# 🎮 GEN ALIXIR - Plateforme d'Incubation de Projets

Plateforme communautaire et ludique d'incubation de projets intégrée à l'univers ECODREUM.

## 🚀 Stack Technique

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase
- **Deployment**: Vercel
- **Version Control**: GitHub

## 📦 Installation

### Prérequis

- Node.js 18+ installé
- npm ou yarn
- Git

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone <votre-repo-url>
cd gen-alixir
```

2. **Installer les dépendances**
```bash
npm install
# ou
yarn install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env.local
```

4. **Lancer le serveur de développement**
```bash
npm run dev
# ou
yarn dev
```

5. **Ouvrir dans le navigateur**
```
http://localhost:3000
```

## 📁 Structure du Projet
```
gen-alixir/
├── app/                    # Pages Next.js (App Router)
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Page d'accueil
│   ├── about/             # Page À propos
│   ├── ecosystem/         # Page Écosystème
│   ├── login/             # Page Connexion
│   ├── join/              # Page Inscription
│   └── projects/          # Page Projets
├── components/            # Composants React
│   ├── ui/               # Composants UI réutilisables
│   ├── layout/           # Composants de layout
│   └── home/             # Composants spécifiques à l'accueil
├── lib/                  # Utilitaires et configuration
│   ├── supabase/        # Client et schéma Supabase
│   └── constants/       # Constantes globales
├── types/               # Types TypeScript
└── public/              # Fichiers statiques
```

## 🎨 Thème Visuel

- **Fond**: Noir & Blanc
- **Accent**: Vert émeraude (gradient)
- **Style**: Futuriste, épuré, premium
- **Effets**: Glassmorphism, glows, animations subtiles

## 📋 Fonctionnalités - PARTIE 1

✅ Architecture complète du projet
✅ Configuration Next.js + Tailwind
✅ Système de design (Button, Card, Badge, Section)
✅ Layout (Navbar, Footer)
✅ Pages statiques de base:
  - Accueil (Hero, Ticker, Preview projets)
  - Projets (Liste avec filtres)
  - À propos
  - Écosystème
  - Connexion (UI seulement)
  - Inscription (Formulaire UI)
✅ Schéma de base de données (SQL commenté)
✅ Types TypeScript globaux
✅ Constantes de l'application

## 🔜 Prochaines Étapes (PARTIE 2+)

- [ ] PARTIE 2: Authentification Supabase complète
- [ ] PARTIE 3: Espace membre et profils
- [ ] PARTIE 4: Système de projets/matchs
- [ ] PARTIE 5: Notifications en temps réel

## 🛠️ Configuration Supabase (À faire en PARTIE 2)

Le fichier `/lib/supabase/schema.sql` contient le schéma complet de la base de données.
Il sera exécuté lors de la configuration de Supabase dans la PARTIE 2.

## 📝 Notes de Développement

- Les données affichées sont actuellement des mocks
- L'authentification n'est pas encore fonctionnelle
- Les formulaires n'ont pas de logique backend
- La logique métier des projets/matchs sera implémentée en PARTIE 4

## 🤝 Contribution

Ce projet fait partie de l'écosystème ECODREUM.
Pour contribuer, veuillez rejoindre la communauté GEN ALIXIR.

## 📄 License

© 2024 GEN ALIXIR - ECODREUM. Tous droits réservés.
