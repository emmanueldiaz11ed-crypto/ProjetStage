# Scripts et Procédures Automatisés de Déploiement

Ce document contient des **scripts prêts à utiliser** pour automatiser les tâches de déploiement et de maintenance.

---

## 1. Script de Sauvegarde Automatisée

### Créer le Script

```bash
# Créer le fichier script
nano /home/utilisateur/scripts/backup_database.sh
```

### Contenu du Script

```bash
#!/bin/bash

# =============================================================================
# Script de Sauvegarde Automatisée de la Base de Données PostgreSQL
# =============================================================================
# Usage: ./backup_database.sh
# Sauvegarde la base de données et conserve les 7 dernières sauvegardes

# Configuration
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="projetstage_user"
DB_NAME="projetstage_db"
BACKUP_DIR="/root/backups"
RETENTION_DAYS=7

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERREUR]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[AVERTISSEMENT]${NC} $1"
}

# Créer le dossier de sauvegarde s'il n'existe pas
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    log_info "Dossier de sauvegarde créé : $BACKUP_DIR"
fi

# Générer le nom du fichier avec la date/heure
BACKUP_FILENAME="db_backup_$(date +%Y-%m-%d_%H-%M-%S).dump"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILENAME"

log_info "Démarrage de la sauvegarde..."
log_info "Base de données : $DB_NAME"
log_info "Destination : $BACKUP_PATH"

# Exécuter la sauvegarde
PGHOST="$DB_HOST" PGPORT="$DB_PORT" PGUSER="$DB_USER" pg_dump -Fc "$DB_NAME" > "$BACKUP_PATH"

# Vérifier si la sauvegarde a réussi
if [ -f "$BACKUP_PATH" ]; then
    FILESIZE=$(du -h "$BACKUP_PATH" | cut -f1)
    log_info "✓ Sauvegarde réussie ! Taille : $FILESIZE"
else
    log_error "✗ La sauvegarde a échoué !"
    exit 1
fi

# Supprimer les sauvegardes trop anciennes (plus de 7 jours)
log_info "Nettoyage des anciennes sauvegardes..."
find "$BACKUP_DIR" -name "db_backup_*.dump" -mtime +$RETENTION_DAYS -delete
log_info "Sauvegardes conservées : $(ls -1 $BACKUP_DIR/db_backup_*.dump | wc -l)"

# Afficher les 5 dernières sauvegardes
log_info "Dernières sauvegardes :"
ls -lh "$BACKUP_DIR"/db_backup_*.dump | tail -5 | awk '{print "  " $9 " (" $5 ")"}'

log_info "Sauvegarde complétée avec succès !"
```

### Rendre le Script Exécutable

```bash
chmod +x /home/utilisateur/scripts/backup_database.sh
```

### Utiliser le Script

```bash
# Exécution manuelle
./scripts/backup_database.sh

# Exécution automatique chaque jour à 2h du matin
sudo crontab -e
# Ajouter la ligne :
# 0 2 * * * /home/utilisateur/scripts/backup_database.sh >> /var/log/backup.log 2>&1
```

---

## 2. Script de Déploiement Complet

### Créer le Script

```bash
nano /home/utilisateur/scripts/deploy_complete.sh
```

### Contenu du Script

```bash
#!/bin/bash

# =============================================================================
# Script de Déploiement Complet
# =============================================================================
# Ce script :
# 1. Sauvegarde la base de données
# 2. Récupère le code mis à jour
# 3. Construit et démarre les nouveaux conteneurs
# 4. Applique les migrations
# 5. Recharge Nginx
# Usage: ./deploy_complete.sh

set -e  # Arrêter en cas d'erreur

# Configuration
PROJECT_DIR="/home/utilisateur/ProjetStage"
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="projetstage_user"
DB_NAME="projetstage_db"
BACKUP_DIR="/root/backups"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERREUR]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[AVERTISSEMENT]${NC} $1"; }
log_header() { echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n${BLUE}$1${NC}\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"; }

# Fonction pour afficher l'utilisation
usage() {
    echo "Usage: $0 [--no-backup] [--no-migrate]"
    echo "Options:"
    echo "  --no-backup    Passer l'étape de sauvegarde"
    echo "  --no-migrate   Passer l'étape des migrations"
    exit 1
}

# Variables de contrôle
SKIP_BACKUP=false
SKIP_MIGRATE=false

# Traiter les arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --no-backup) SKIP_BACKUP=true; shift ;;
        --no-migrate) SKIP_MIGRATE=true; shift ;;
        -h|--help) usage ;;
        *) log_error "Argument inconnu : $1"; usage ;;
    esac
done

log_header "DÉPLOIEMENT COMPLET DE PROJETSTAGE"

# Vérifier que l'on est dans le bon répertoire
if [ ! -f "$PROJECT_DIR/docker-compose.yml" ]; then
    log_error "docker-compose.yml non trouvé dans $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR"
log_info "Répertoire de travail : $(pwd)"

# ===== PHASE 1 : SAUVEGARDE =====
if [ "$SKIP_BACKUP" = false ]; then
    log_header "PHASE 1 : SAUVEGARDE DE LA BASE DE DONNÉES"
    
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/db_backup_$(date +%Y-%m-%d_%H-%M-%S).dump"
    
    log_info "Sauvegarde en cours..."
    log_warn "Veuillez entrer le mot de passe PostgreSQL :"
    PGHOST="$DB_HOST" PGPORT="$DB_PORT" PGUSER="$DB_USER" pg_dump -Fc "$DB_NAME" > "$BACKUP_FILE"
    
    if [ -f "$BACKUP_FILE" ]; then
        FILESIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        log_info "✓ Sauvegarde réussie ! Taille : $FILESIZE"
        log_info "Emplacement : $BACKUP_FILE"
    else
        log_error "✗ La sauvegarde a échoué !"
        exit 1
    fi
else
    log_warn "Sauvegarde ignorée (--no-backup)"
fi

# ===== PHASE 2 : MISE À JOUR DU CODE =====
log_header "PHASE 2 : MISE À JOUR DU CODE"

log_info "Récupération du code mis à jour..."
git pull origin main

if [ $? -eq 0 ]; then
    log_info "✓ Code mis à jour avec succès"
else
    log_error "✗ Erreur lors de la récupération du code"
    log_warn "Assurez-vous que vous êtes sur la branche 'main'"
    exit 1
fi

# ===== PHASE 3 : DÉPLOIEMENT =====
log_header "PHASE 3 : DÉPLOIEMENT DES CONTENEURS"

log_info "Construction et démarrage des conteneurs..."
docker compose up -d --build

# Attendre que les services démarrent
log_info "Attente du démarrage des services (30 secondes)..."
sleep 30

# Vérifier que les services tournent
if docker compose ps | grep -q "Up"; then
    log_info "✓ Services en cours d'exécution"
    docker compose ps
else
    log_error "✗ Les services n'ont pas démarré correctement"
    docker compose logs --tail=20
    exit 1
fi

# ===== PHASE 4 : SANTÉ DE DJANGO =====
log_header "PHASE 4 : VÉRIFICATION DE LA SANTÉ DE L'APPLICATION"

log_info "Vérification de Django..."
if docker compose exec -T django python manage.py check; then
    log_info "✓ Django fonctionne correctement"
else
    log_error "✗ Problème détecté dans Django"
    exit 1
fi

# ===== PHASE 5 : MIGRATIONS =====
if [ "$SKIP_MIGRATE" = false ]; then
    log_header "PHASE 5 : MIGRATIONS DE BASE DE DONNÉES"
    
    log_info "Affichage des migrations en attente..."
    docker compose exec -T django python manage.py showmigrations
    
    log_info "Plan de migration :"
    docker compose exec -T django python manage.py migrate --plan
    
    read -p "Voulez-vous appliquer les migrations ? (o/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Oo]$ ]]; then
        log_info "Application des migrations..."
        docker compose exec -T django python manage.py migrate
        log_info "✓ Migrations appliquées"
    else
        log_warn "Migrations non appliquées"
    fi
else
    log_warn "Migrations ignorées (--no-migrate)"
fi

# ===== PHASE 6 : NGINX =====
log_header "PHASE 6 : RECHARGE DE NGINX"

log_info "Vérification de la configuration Nginx..."
if sudo nginx -t; then
    log_info "✓ Configuration Nginx valide"
    
    log_info "Rechargement de Nginx..."
    sudo systemctl reload nginx
    log_info "✓ Nginx rechargé"
else
    log_error "✗ Erreur de configuration Nginx"
    exit 1
fi

# ===== PHASE 7 : VÉRIFICATIONS FINALES =====
log_header "PHASE 7 : VÉRIFICATIONS FINALES"

log_info "État des services :"
docker compose ps

log_info "Derniers logs (Django) :"
docker compose logs --tail=10 django

log_warn "Remarque : Attendez quelques secondes avant de tester l'URL"
log_info "Site accessible à : https://votre_domaine.com"

log_header "✓ DÉPLOIEMENT COMPLÉTÉ AVEC SUCCÈS !"
log_info "Timestamp : $(date)"
```

### Rendre le Script Exécutable

```bash
chmod +x /home/utilisateur/scripts/deploy_complete.sh
```

### Utiliser le Script

```bash
# Déploiement complet
./scripts/deploy_complete.sh

# Déploiement sans sauvegarde
./scripts/deploy_complete.sh --no-backup

# Déploiement sans migrations
./scripts/deploy_complete.sh --no-migrate
```

---

## 3. Script de Santé et Monitoring

### Créer le Script

```bash
nano /home/utilisateur/scripts/health_check.sh
```

### Contenu du Script

```bash
#!/bin/bash

# =============================================================================
# Script de Vérification de Santé du Système
# =============================================================================
# Vérifie l'état de tous les services et affiche un rapport

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

check_ok() { echo -e "${GREEN}✓${NC} $1"; }
check_fail() { echo -e "${RED}✗${NC} $1"; }
check_warn() { echo -e "${YELLOW}⚠${NC} $1"; }
section() { echo -e "\n${BLUE}$1${NC}"; }

section "╔════════════════════════════════════════════════════════════════╗"
section "║     Vérification de Santé - ProjetStage                       ║"
section "║     $(date '+%Y-%m-%d %H:%M:%S')                                  ║"
section "╚════════════════════════════════════════════════════════════════╝"

# ===== DOCKER =====
section "\n📦 État Docker"
if command -v docker &> /dev/null; then
    check_ok "Docker installé"
    docker compose ps
else
    check_fail "Docker non installé"
fi

# ===== SERVICES =====
section "\n🚀 État des Services"
docker compose ps | grep -q "django" && check_ok "Django en cours" || check_fail "Django arrêté"
docker compose ps | grep -q "fastapi" && check_ok "FastAPI en cours" || check_fail "FastAPI arrêté"
docker compose ps | grep -q "frontend" && check_ok "Frontend en cours" || check_fail "Frontend arrêté"

# ===== DJANGO =====
section "\n🔍 Santé Django"
if docker compose exec -T django python manage.py check &> /dev/null; then
    check_ok "Django fonctionnel"
else
    check_fail "Django a des problèmes"
    docker compose logs --tail=5 django
fi

# ===== BASE DE DONNÉES =====
section "\n🗄️ Base de Données"
MIGRATION_STATUS=$(docker compose exec -T django python manage.py showmigrations --plan 2>&1)
if echo "$MIGRATION_STATUS" | grep -q "No planned"; then
    check_ok "Migrations à jour"
else
    check_warn "Migrations en attente"
    echo "$MIGRATION_STATUS" | head -5
fi

# ===== NGINX =====
section "\n🌐 Nginx"
if systemctl is-active --quiet nginx; then
    check_ok "Nginx actif"
    sudo nginx -t &> /dev/null && check_ok "Configuration valide" || check_fail "Configuration invalide"
else
    check_fail "Nginx inactif"
fi

# ===== ESPACE DISQUE =====
section "\n💾 Espace Disque"
DISK=$(df -h / | awk 'NR==2 {print $5}')
DISK_NUM=$(echo $DISK | sed 's/%//')
if [ "$DISK_NUM" -lt 80 ]; then
    check_ok "Espace disque : $DISK utilisé"
else
    check_warn "Espace disque faible : $DISK utilisé"
fi

# ===== SAUVEGARDES =====
section "\n🔐 Sauvegardes"
BACKUP_COUNT=$(ls -1 /root/backups/db_backup_*.dump 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 0 ]; then
    check_ok "Sauvegardes trouvées : $BACKUP_COUNT"
    ls -1 /root/backups/db_backup_*.dump | tail -3 | while read file; do
        SIZE=$(du -h "$file" | cut -f1)
        echo "  └─ $(basename $file) ($SIZE)"
    done
else
    check_fail "Aucune sauvegarde trouvée"
fi

# ===== CERTIFICAT SSL =====
section "\n🔐 Certificat SSL"
CERT_PATH="/etc/letsencrypt/live"
if [ -d "$CERT_PATH" ]; then
    # Chercher le certificat le plus récent
    CERT=$(find "$CERT_PATH" -name "fullchain.pem" 2>/dev/null | head -1)
    if [ -n "$CERT" ]; then
        EXPIRY=$(openssl x509 -enddate -noout -in "$CERT" 2>/dev/null | cut -d= -f2)
        DAYS=$(( ($(date -d "$EXPIRY" +%s) - $(date +%s)) / 86400 ))
        if [ "$DAYS" -gt 30 ]; then
            check_ok "Certificat valide : expire dans $DAYS jours"
        else
            check_warn "Certificat expire bientôt : $DAYS jours"
        fi
    fi
else
    check_warn "Pas de certificat Let's Encrypt trouvé"
fi

section "\n$(date '+Rapport généré le %Y-%m-%d à %H:%M:%S')"
```

### Utiliser le Script

```bash
chmod +x /home/utilisateur/scripts/health_check.sh
./scripts/health_check.sh
```

---

## 4. Script de Restauration de Base de Données

### Créer le Script

```bash
nano /home/utilisateur/scripts/restore_database.sh
```

### Contenu du Script

```bash
#!/bin/bash

# =============================================================================
# Script de Restauration de Base de Données
# =============================================================================
# Usage: ./restore_database.sh [fichier_sauvegarde]

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERREUR]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[AVERTISSEMENT]${NC} $1"; }

DB_HOST="localhost"
DB_PORT="5432"
DB_USER="projetstage_user"
DB_NAME="projetstage_db"
BACKUP_DIR="/root/backups"

# Afficher les sauvegardes disponibles
log_info "Sauvegardes disponibles :"
ls -lh "$BACKUP_DIR"/db_backup_*.dump | nl

# Si un fichier est spécifié en argument, l'utiliser
if [ -n "$1" ]; then
    BACKUP_FILE="$1"
else
    # Sinon, demander à l'utilisateur
    read -p "Entrez le numéro ou le chemin de la sauvegarde à restaurer : " CHOICE
    
    if [[ $CHOICE =~ ^[0-9]+$ ]]; then
        BACKUP_FILE=$(ls -1 "$BACKUP_DIR"/db_backup_*.dump | sed -n "${CHOICE}p")
    else
        BACKUP_FILE="$CHOICE"
    fi
fi

# Vérifier que le fichier existe
if [ ! -f "$BACKUP_FILE" ]; then
    log_error "Fichier de sauvegarde non trouvé : $BACKUP_FILE"
    exit 1
fi

log_warn "⚠️  ATTENTION ⚠️"
log_warn "Vous êtes sur le point de restaurer une sauvegarde."
log_warn "Cela va ÉCRASER les données actuelles de la base de données !"
log_warn "Fichier : $(basename $BACKUP_FILE)"
log_warn "Taille : $(du -h $BACKUP_FILE | cut -f1)"

read -p "Êtes-vous sûr ? (tapez 'OUI' pour confirmer) : " CONFIRM
if [ "$CONFIRM" != "OUI" ]; then
    log_error "Restauration annulée"
    exit 1
fi

# Créer une sauvegarde de sécurité avant de restaurer
log_info "Création d'une sauvegarde de sécurité..."
SAFETY_BACKUP="$BACKUP_DIR/safety_backup_before_restore_$(date +%Y-%m-%d_%H-%M-%S).dump"
PGHOST="$DB_HOST" PGPORT="$DB_PORT" PGUSER="$DB_USER" pg_dump -Fc "$DB_NAME" > "$SAFETY_BACKUP"
log_info "✓ Sauvegarde de sécurité créée : $(basename $SAFETY_BACKUP)"

# Restaurer la base de données
log_info "Restauration en cours... (cela peut prendre quelques minutes)"
PGHOST="$DB_HOST" PGPORT="$DB_PORT" PGUSER="$DB_USER" pg_restore -d "$DB_NAME" -c "$BACKUP_FILE" 2>&1 | grep -v "already exists"

log_info "✓ Restauration complétée !"
log_info "Les données ont été restaurées depuis : $(basename $BACKUP_FILE)"
log_info "Sauvegarde de sécurité disponible à : $(basename $SAFETY_BACKUP)"

# Vérifier la santé de Django
log_info "Vérification de la santé de Django..."
docker compose exec -T django python manage.py check
```

### Utiliser le Script

```bash
chmod +x /home/utilisateur/scripts/restore_database.sh

# Exécution interactive
./scripts/restore_database.sh

# Ou avec un fichier spécifique
./scripts/restore_database.sh /root/backups/db_backup_2026-01-15_14-30-45.dump
```

---

## 5. Installation des Scripts

Créer le dossier des scripts s'il n'existe pas :

```bash
mkdir -p /home/utilisateur/scripts
cd /home/utilisateur/scripts
```

Copier et rendre tous les scripts exécutables :

```bash
chmod +x *.sh
```

Ajouter les scripts au PATH (optionnel) :

```bash
echo 'export PATH="/home/utilisateur/scripts:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

---

## 6. Tableau de Commandes Rapides

| Tâche | Commande |
|-------|----------|
| Déployer une nouvelle version | `./scripts/deploy_complete.sh` |
| Sauvegarder la BD | `./scripts/backup_database.sh` |
| Restaurer une BD | `./scripts/restore_database.sh` |
| Vérifier la santé | `./scripts/health_check.sh` |
| Voir les logs Django | `docker compose logs -f django` |
| Voir les logs Nginx | `sudo tail -f /var/log/nginx/error.log` |
| Arrêter les services | `docker compose down` |
| Redémarrer les services | `docker compose restart` |

---

## 7. Cron Jobs pour Automatisation

Ajouter des tâches programmées au démarrage du serveur :

```bash
# Éditer crontab
sudo crontab -e

# Ajouter ces lignes :

# Sauvegarde quotidienne à 2h du matin
0 2 * * * /home/utilisateur/scripts/backup_database.sh >> /var/log/backup.log 2>&1

# Vérification de santé toutes les heures
0 * * * * /home/utilisateur/scripts/health_check.sh >> /var/log/health_check.log 2>&1

# Nettoyage des vieux logs chaque semaine
0 3 * * 0 find /var/log -name "*.log" -mtime +30 -delete
```

---

**Dernier point** : Testez tous les scripts dans un environnement de test avant de les utiliser en production !
