#!/bin/bash

# 🌍 GEN ALIXIR - Script d'Installation Automatique
# Ce script configure automatiquement le projet GEN ALIXIR

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🌍 GEN ALIXIR - Installation Automatique"
echo "  Incubateur Numérique Africain - ECODREUM"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Vérifier Node.js
echo "📦 Vérification des prérequis..."
if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé. Veuillez installer Node.js 18+ d'abord."
    exit 1
fi
print_success "Node.js $(node --version) détecté"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé."
    exit 1
fi
print_success "npm $(npm --version) détecté"

echo ""
echo "📥 Installation des dépendances..."
npm install
if [ $? -eq 0 ]; then
    print_success "Dépendances installées"
else
    print_error "Erreur lors de l'installation des dépendances"
    exit 1
fi

echo ""
echo "⚙️  Configuration de l'environnement..."

# Créer .env si il n'existe pas
if [ ! -f .env ]; then
    cp .env.example .env
    print_success "Fichier .env créé à partir de .env.example"
    print_warning "IMPORTANT: Éditez le fichier .env avec vos propres valeurs!"
    echo ""
    print_info "Variables à configurer dans .env:"
    echo "  - DATABASE_URL (connexion PostgreSQL)"
    echo "  - JWT_SECRET (clé secrète sécurisée)"
else
    print_info "Le fichier .env existe déjà"
fi

echo ""
echo "🔍 Vérification de PostgreSQL..."
if command -v psql &> /dev/null; then
    print_success "PostgreSQL détecté"
    print_info "Pour créer la base de données, exécutez:"
    echo "  psql -U postgres -c 'CREATE DATABASE genalixir;'"
else
    print_warning "PostgreSQL non détecté. Assurez-vous qu'il est installé."
fi

echo ""
print_info "Prochaines étapes:"
echo ""
echo "1️⃣  Configurer la base de données:"
echo "   - Créer la base PostgreSQL: genalixir"
echo "   - Éditer .env avec vos informations de connexion"
echo ""
echo "2️⃣  Initialiser Prisma:"
echo "   npx prisma generate"
echo "   npx prisma db push"
echo ""
echo "3️⃣  Peupler avec des données de test (optionnel):"
echo "   npm run seed"
echo ""
echo "4️⃣  Lancer l'application:"
echo "   npm run dev"
echo ""
echo "5️⃣  Accéder à l'application:"
echo "   http://localhost:3000"
echo ""

print_success "Installation terminée!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Pour plus d'aide, consultez QUICKSTART.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
