#!/bin/bash

# Script de déploiement pour l'application de détection de tumeurs cérébrales

set -e

echo "🧠 Déploiement de l'application de détection de tumeurs cérébrales"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    log_error "Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Créer les dossiers nécessaires
log_info "Création des dossiers nécessaires..."
mkdir -p backend/uploads
mkdir -p backend/models
mkdir -p ssl

# Copier les fichiers de configuration si ils n'existent pas
if [ ! -f .env ]; then
    log_warn "Fichier .env non trouvé. Copie du fichier exemple..."
    cp .env.example .env
    log_warn "Veuillez éditer le fichier .env avec vos configurations"
fi

if [ ! -f backend/.env ]; then
    log_warn "Fichier backend/.env non trouvé. Copie du fichier exemple..."
    cp backend/.env.example backend/.env
    log_warn "Veuillez éditer le fichier backend/.env avec vos configurations"
fi

# Arrêter les conteneurs existants
log_info "Arrêt des conteneurs existants..."
docker-compose down

# Construire et démarrer les services
log_info "Construction et démarrage des services..."
docker-compose up --build -d

# Attendre que les services soient prêts
log_info "Attente du démarrage des services..."
sleep 10

# Vérifier la santé des services
log_info "Vérification de la santé des services..."

# Vérifier le backend
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    log_info "✅ Backend opérationnel"
else
    log_error "❌ Backend non accessible"
    docker-compose logs backend
    exit 1
fi

# Vérifier le frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log_info "✅ Frontend opérationnel"
else
    log_error "❌ Frontend non accessible"
    docker-compose logs frontend
    exit 1
fi

log_info "🎉 Déploiement terminé avec succès!"
echo ""
echo "📱 Application accessible sur:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:5000"
echo "   - Nginx (si activé): http://localhost:80"
echo ""
echo "📋 Commandes utiles:"
echo "   - Voir les logs: docker-compose logs -f"
echo "   - Arrêter: docker-compose down"
echo "   - Redémarrer: docker-compose restart"
echo ""
echo "📁 Dossiers importants:"
echo "   - Modèles: ./backend/models/"
echo "   - Images uploadées: ./backend/uploads/"