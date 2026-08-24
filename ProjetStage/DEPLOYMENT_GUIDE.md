# Guide Complet de Déploiement de ProjetStage en Production

## Table des Matières
1. [Concepts Fondamentaux](#concepts-fondamentaux)
2. [Préparation de l'Environnement](#préparation-de-lenvironnement)
3. [Sauvegarde de la Base de Données](#sauvegarde-de-la-base-de-données)
4. [Déploiement avec Docker Compose](#déploiement-avec-docker-compose)
5. [Configuration Nginx](#configuration-nginx)
6. [Configuration du Domaine](#configuration-du-domaine)
7. [Procédure Complète de Déploiement](#procédure-complète-de-déploiement)
8. [Récupération en Cas de Problème](#récupération-en-cas-de-problème)

---

## Concepts Fondamentaux

### Qu'est-ce que le Déploiement en Production ?

Le **déploiement en production** signifie mettre en ligne votre application pour que les utilisateurs puissent y accéder via internet. Contrairement au développement local (sur votre ordinateur), la production doit être :
- **Stable** : disponible 24/7 sans interruption
- **Sécurisée** : protéger les données sensibles
- **Performante** : servir rapidement les utilisateurs

### Architecture de ProjetStage

Votre application utilise trois services principaux :
- **Django** (port 8000) : API backend pour la gestion des données
- **FastAPI** (port 8001) : Microservice de traitement de données
- **Frontend Next.js** (port 3000) : Interface utilisateur

Ces services tournent dans des **conteneurs Docker** (des "boîtes isolées" contenant chaque service).

### Rôle de Nginx

**Nginx** est un serveur web qui agit comme **reverse proxy**. Imaginez-le comme une réceptionniste :
- Les utilisateurs accèdent à votre domaine (ex: `monsite.com`)
- Nginx reçoit les demandes et les redirige vers le service approprié
- Nginx gère aussi le certificat SSL (HTTPS)

### Rôle de PostgreSQL

**PostgreSQL** est la base de données qui stocke toutes vos données. Elle tourne généralement sur le serveur (VM) hôte, pas dans un conteneur Docker.

---

## Préparation de l'Environnement

### Étape 1 : Connexion à Votre Serveur VM

D'abord, connectez-vous à votre serveur via SSH (terminal sécurisé) :

```bash
ssh utilisateur@votre_adresse_ip
```

**Explication** :
- `utilisateur` : le nom d'utilisateur du serveur
- `votre_adresse_ip` : l'adresse IP de votre serveur (ex: 192.168.1.100)

### Étape 2 : Vérifier l'Installation de Docker et Docker Compose

Une fois connecté au serveur, vérifiez que Docker et Docker Compose sont installés :

```bash
# Vérifier Docker
docker --version

# Vérifier Docker Compose
docker compose version
```

**Si Docker n'est pas installé**, installez-le :

```bash
# Pour Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose -y

# Démarrer le service Docker
sudo systemctl start docker
sudo systemctl enable docker

# (Optionnel) Autoriser votre utilisateur à utiliser Docker sans sudo
sudo usermod -aG docker $USER
# Puis reconnectez-vous
```

**Explication** :
- `docker.io` : le paquet Docker
- `systemctl start` : démarre le service immédiatement
- `systemctl enable` : configure Docker pour démarrer automatiquement à chaque redémarrage du serveur

### Étape 3 : Cloner le Projet

Placez-vous dans un répertoire approprié et clonez votre projet :

```bash
cd /home/utilisateur
git clone https://github.com/votre_utilisateur/ProjetStage.git
cd ProjetStage
```

**Explication** :
- `/home/utilisateur` : répertoire personnel du serveur
- `git clone` : télécharge tout le code de votre projet

### Étape 4 : Installer Nginx sur la VM

Si Nginx n'est pas encore installé sur votre serveur hôte :

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Sauvegarde de la Base de Données

⚠️ **AVANT DE DÉPLOYER TOUTE NOUVELLE VERSION**, vous DEVEZ sauvegarder votre base de données. C'est une étape **CRITIQUE** de sécurité.

### Concept : Pourquoi Sauvegarder ?

Une migration de base de données peut échouer ou créer des données invalides. La sauvegarde vous permet de **revenir à l'état précédent** en cas de problème.

### Procédure Complète de Sauvegarde

#### Étape 1 : Récupérer les Variables de Connexion

Avant de sauvegarder, vous avez besoin des identifiants PostgreSQL :

```bash
# Afficher le fichier .env pour récupérer les infos
cat .env
```

Notez ces variables :
- `DB_HOST` : adresse du serveur PostgreSQL (généralement `localhost` ou `127.0.0.1`)
- `DB_PORT` : port PostgreSQL (généralement `5432`)
- `DB_USER` : utilisateur PostgreSQL (ex: `projetstage_user`)
- `DB_PASSWORD` : mot de passe (gardé secret !)
- `DB_NAME` : nom de la base de données (ex: `projetstage_db`)

#### Étape 2 : Créer un Dossier pour les Sauvegardes

```bash
mkdir -p /root/backups
cd /root/backups
```

**Explication** : créer un dossier `/root/backups` où vous stockerez toutes vos sauvegardes.

#### Étape 3 : Sauvegarder la Base de Données

```bash
# Syntaxe générale
PGHOST=DB_HOST PGPORT=DB_PORT PGUSER=DB_USER pg_dump -Fc DB_NAME > db_backup_$(date +%Y-%m-%d_%H-%M-%S).dump

# Exemple concret
PGHOST=localhost PGPORT=5432 PGUSER=projetstage_user pg_dump -Fc projetstage_db > db_backup_$(date +%Y-%m-%d_%H-%M-%S).dump
```

**Explication détaillée** :
- `PGHOST=localhost` : la machine hôte où PostgreSQL s'exécute
- `PGPORT=5432` : le port standard de PostgreSQL
- `PGUSER=projetstage_user` : l'utilisateur PostgreSQL
- `pg_dump` : commande pour exporter la base de données
- `-Fc` : format personnalisé (compressé, plus compact)
- `DB_NAME` : le nom de la base à sauvegarder
- `$(date +%Y-%m-%d_%H-%M-%S)` : ajoute la date/heure au nom du fichier (ex: `db_backup_2026-01-15_14-30-45.dump`)

**Vous serez invité à entrer le mot de passe PostgreSQL** (`DB_PASSWORD`). Entrez-le sans erreur.

#### Étape 4 : Vérifier la Sauvegarde

```bash
# Afficher les fichiers de sauvegarde
ls -lh /root/backups/

# Exemple de sortie :
# -rw-r--r-- 1 root root 15M Jan 15 14:30 db_backup_2026-01-15_14-30-45.dump
```

**Explication** :
- `-lh` : affiche les fichiers en format lisible avec tailles en Mo/Go
- La taille du fichier indique si la sauvegarde est complète

#### (Optionnel) Étape 5 : Sauvegarder les Fichiers de Médias

Si vous avez des fichiers téléchargés (photos, documents), sauvegardez-les aussi :

```bash
# Créer une archive des fichiers de médias
tar -czf /root/backups/media_backup_$(date +%Y-%m-%d_%H-%M-%S).tar.gz ./data/django/media/
```

**Explication** :
- `tar -czf` : crée une archive compressée
- `./data/django/media/` : dossier contenant les fichiers uploadés

---

## Déploiement avec Docker Compose

### Étape 1 : Préparer le Fichier .env

Le fichier `.env` contient toutes les configurations secrètes de votre application. Vous devez le créer à partir du modèle :

```bash
# Se placer à la racine du projet
cd /path/to/ProjetStage

# Copier le fichier exemple
cp .env.example .env

# Éditer le fichier
nano .env
# ou
vi .env
```

**Contenu important du fichier .env** :

```env
# Base de données PostgreSQL
DB_HOST=host.docker.internal
DB_PORT=5432
DB_USER=projetstage_user
DB_PASSWORD=votre_mot_de_passe_securise
DB_NAME=projetstage_db

# Django
SECRET_KEY=clé_secrète_très_longue_et_aléatoire
DEBUG=False
ALLOWED_HOSTS=votre_domaine.com,www.votre_domaine.com

# Frontend Next.js
NEXT_PUBLIC_API_URL=https://votre_domaine.com/api

# Autres configurations
ENVIRONMENT=production
```

**Points clés à comprendre** :
- `DB_HOST=host.docker.internal` : permet aux conteneurs Docker d'accéder à PostgreSQL sur la machine hôte
- `DEBUG=False` : désactive le mode débogage (OBLIGATOIRE en production !)
- `SECRET_KEY` : clé secrète pour chiffrer les sessions ; générez-en une longue et aléatoire
- `ALLOWED_HOSTS` : les domaines autorisés à accéder à Django

### Étape 2 : Construire et Démarrer les Conteneurs

```bash
# Se placer à la racine du projet
cd /path/to/ProjetStage

# Construire les images Docker et démarrer les conteneurs
docker compose up -d --build
```

**Explication** :
- `up` : démarre les services définis dans `docker-compose.yml`
- `-d` : mode "détaché" (les services tournent en arrière-plan)
- `--build` : reconstruit les images avant de les démarrer (à faire à chaque déploiement)

### Étape 3 : Vérifier que les Services Tournent

```bash
# Afficher les conteneurs en cours d'exécution
docker compose ps

# Exemple de sortie :
# NAME                COMMAND             STATUS
# projetstage-django   python manage.py... Up 2 minutes
# projetstage-fastapi  uvicorn main:app... Up 2 minutes
# projetstage-frontend next start        Up 2 minutes
```

### Étape 4 : Vérifier la Santé de l'Application Django

```bash
# Vérifier que Django est prêt
docker compose exec django python manage.py check
```

**Réponse attendue** : `System check identified no issues (0 silenced).`

### Étape 5 : Exécuter les Migrations de Base de Données

Les **migrations** mettent à jour la structure de la base de données en fonction de votre code :

```bash
# Voir les migrations en attente
docker compose exec django python manage.py showmigrations

# Afficher le plan des migrations (sans les appliquer)
docker compose exec django python manage.py migrate --plan

# Appliquer les migrations
docker compose exec django python manage.py migrate
```

**Explication** :
- Les migrations modifient les tables, colonnes, etc. de la base de données
- Toujours vérifier avec `--plan` avant d'appliquer pour éviter les surprises

### Étape 6 : Exécuter les Contrôles Post-Déploiement

```bash
# Exécuter le script de vérification
./scripts/post_deploy_check.sh
```

---

## Configuration Nginx

### Concept : Qu'est-ce que Nginx Fait ?

Nginx est un **reverse proxy** qui :
1. **Reçoit** les demandes des utilisateurs sur le port 80 (HTTP) ou 443 (HTTPS)
2. **Redirige** ces demandes vers le bon service (Django, FastAPI, ou Frontend)
3. **Gère** les certificats SSL (HTTPS/TLS)
4. **Cache** les réponses pour améliorer les performances

### Architecture Nginx pour ProjetStage

```
Utilisateur sur Internet (votre_domaine.com)
         ↓
   Firewall (port 80, 443)
         ↓
   Nginx sur la VM (reverse proxy)
         ↓
    ┌────┴────┬──────────┐
    ↓         ↓          ↓
 Django    FastAPI   Frontend
 (8000)    (8001)    (3000)
```

### Étape 1 : Créer le Fichier de Configuration Nginx

Créez un fichier de configuration pour votre domaine :

```bash
# Créer le fichier de configuration
sudo nano /etc/nginx/sites-available/projetstage.conf
```

**Contenu du fichier de configuration** :

```nginx
# Configuration HTTP (redirection vers HTTPS)
server {
    listen 80;
    listen [::]:80;
    server_name votre_domaine.com www.votre_domaine.com;
    
    # Rediriger tout le trafic HTTP vers HTTPS
    return 301 https://$server_name$request_uri;
}

# Configuration HTTPS (serveur principal)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name votre_domaine.com www.votre_domaine.com;
    
    # Configuration SSL (certificat)
    ssl_certificate /etc/letsencrypt/live/votre_domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre_domaine.com/privkey.pem;
    
    # Paramètres SSL sécurisés
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Limite de taille de fichier uploadé
    client_max_body_size 100M;
    
    # Racine des fichiers statiques
    root /home/utilisateur/ProjetStage/data;
    
    # Frontend Next.js (à la racine /)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # API Django (/api/*)
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeout pour les longues requêtes
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # API FastAPI (/analyze/*)
    location /analyze/ {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeout pour les analyses longues
        proxy_connect_timeout 120s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
    
    # Fichiers statiques de Django
    location /static/ {
        alias /home/utilisateur/ProjetStage/data/django/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Fichiers uploadés par les utilisateurs
    location /media/ {
        alias /home/utilisateur/ProjetStage/data/django/media/;
        expires 7d;
        add_header Cache-Control "public";
    }
    
    # Healthcheck
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

**Explication détaillée des sections** :

| Section | Rôle |
|---------|------|
| `listen 80` | Écoute les requêtes HTTP non sécurisées |
| `return 301 https://` | Redirige automatiquement HTTP vers HTTPS |
| `ssl_certificate` | Chemin vers le certificat SSL (Let's Encrypt) |
| `ssl_protocols TLSv1.2 TLSv1.3` | Versions TLS sécurisées |
| `location /` | Routes les demandes à la racine vers le Frontend |
| `location /api/` | Routes les demandes `/api/*` vers Django |
| `location /analyze/` | Routes les demandes `/analyze/*` vers FastAPI |
| `proxy_pass http://localhost:8000` | Redirige vers le conteneur Django |
| `proxy_set_header Host $host` | Transmet le nom d'hôte original au service |

### Étape 2 : Activer le Fichier de Configuration

```bash
# Créer un lien symbolique vers la configuration active
sudo ln -s /etc/nginx/sites-available/projetstage.conf /etc/nginx/sites-enabled/projetstage.conf

# (Optionnel) Désactiver la configuration par défaut si désiré
sudo rm /etc/nginx/sites-enabled/default
```

### Étape 3 : Tester la Syntaxe de la Configuration

```bash
# Vérifier qu'il n'y a pas d'erreur de syntaxe
sudo nginx -t
```

**Réponse attendue** :
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Étape 4 : Recharger Nginx

```bash
# Recharger Nginx pour appliquer la nouvelle configuration
sudo systemctl reload nginx

# Vérifier que Nginx est en cours d'exécution
sudo systemctl status nginx
```

**Explication** :
- `reload` : applique la nouvelle configuration sans interrompre les connexions existantes
- `restart` : arrête et redémarre Nginx (peut causer une brève interruption)

---

## Configuration du Domaine

### Concept : Qu'est-ce qu'un Domaine ?

Un **domaine** est le nom de votre site internet (ex: `mon-site.com`). Les utilisateurs y accèdent au lieu de taper une adresse IP.

### Étape 1 : Acheter un Domaine

Si vous n'avez pas encore de domaine, achetez-en un auprès d'un registrar (Namecheap, OVH, GoDaddy, etc.).

### Étape 2 : Configurer les Enregistrements DNS

Les **enregistrements DNS** dirigent votre domaine vers votre serveur. Connectez-vous à votre registrar et configurez :

#### Type A (Domaine Principal)

| Type | Hostname | Value |
|------|----------|-------|
| A | `@` ou `votre_domaine.com` | `123.45.67.89` (IP de votre serveur VM) |

**Explication** :
- `@` : représente le domaine lui-même
- `123.45.67.89` : remplacez par l'adresse IP publique de votre serveur

#### Type A (Sous-domaine www)

| Type | Hostname | Value |
|------|----------|-------|
| A | `www` | `123.45.67.89` |

**Après configuration, attendez 24-48 heures** pour que les changements DNS se propagent sur Internet.

### Étape 3 : Vérifier la Résolution DNS

```bash
# Vérifier que le domaine pointe bien vers votre serveur
nslookup votre_domaine.com
dig votre_domaine.com

# Exemple de réponse :
# votre_domaine.com.  300  IN  A  123.45.67.89
```

**Explication** :
- `nslookup` et `dig` : outils pour tester les enregistrements DNS
- La réponse doit montrer l'adresse IP de votre serveur

### Étape 4 : Obtenir un Certificat SSL avec Let's Encrypt

Un **certificat SSL** permet le HTTPS (sécurisé). Let's Encrypt offre des certificats gratuits.

#### Installer Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### Générer le Certificat

```bash
# Créer un certificat pour votre domaine
sudo certbot certonly --nginx -d votre_domaine.com -d www.votre_domaine.com
```

**Processus** :
1. Entrez votre adresse email
2. Acceptez les conditions d'utilisation
3. Certbot valide que vous possédiez le domaine
4. Le certificat est généré et stocké dans `/etc/letsencrypt/live/votre_domaine.com/`

#### Configurer le Renouvellement Automatique

```bash
# Configurer Certbot pour renouveler le certificat automatiquement
sudo certbot renew --dry-run

# Si tout va bien, le renouvellement automatique est configuré
```

---

## Procédure Complète de Déploiement

Voici la procédure complète à suivre pour déployer une nouvelle version de votre application.

### Phase 1 : Préparation (15 minutes)

```bash
# 1. Se connecter au serveur
ssh utilisateur@votre_adresse_ip

# 2. Aller à la racine du projet
cd /home/utilisateur/ProjetStage

# 3. Récupérer les variables d'environnement
cat .env
```

### Phase 2 : Sauvegarde (5-10 minutes)

```bash
# 4. Créer le dossier de sauvegarde s'il n'existe pas
mkdir -p /root/backups

# 5. SAUVEGARDER LA BASE DE DONNÉES (ÉTAPE CRITIQUE!)
PGHOST=localhost PGPORT=5432 PGUSER=projetstage_user pg_dump -Fc projetstage_db > /root/backups/db_backup_$(date +%Y-%m-%d_%H-%M-%S).dump

# (Entrez le mot de passe PostgreSQL quand demandé)

# 6. Vérifier que la sauvegarde a réussi
ls -lh /root/backups/ | tail -1
```

### Phase 3 : Mise à Jour du Code (5 minutes)

```bash
# 7. Récupérer le code mis à jour
git pull origin main

# 8. Si vous avez des changements locaux, créer une branche backup
# git stash
```

### Phase 4 : Déploiement (10-15 minutes)

```bash
# 9. Arrêter les anciens conteneurs (optionnel, --build va les remplacer)
# docker compose down

# 10. Construire et démarrer les nouveaux conteneurs
docker compose up -d --build

# 11. Attendre que les services démarrent (30 secondes)
sleep 30

# 12. Vérifier que les services tournent
docker compose ps

# 13. Vérifier la santé de Django
docker compose exec django python manage.py check
```

### Phase 5 : Migrations Base de Données (5-10 minutes)

```bash
# 14. Afficher les migrations en attente
docker compose exec django python manage.py showmigrations

# 15. Voir le plan des migrations (SANS les appliquer)
docker compose exec django python manage.py migrate --plan

# 16. APPLIQUER LES MIGRATIONS
docker compose exec django python manage.py migrate

# 17. Vérifier qu'il n'y a plus de migrations en attente
docker compose exec django python manage.py showmigrations
```

### Phase 6 : Recharger Nginx (2 minutes)

```bash
# 18. Tester la configuration Nginx
sudo nginx -t

# 19. Recharger Nginx pour appliquer les changements
sudo systemctl reload nginx

# 20. Vérifier le statut de Nginx
sudo systemctl status nginx
```

### Phase 7 : Vérification (5 minutes)

```bash
# 21. Vérifier les logs pour les erreurs
docker compose logs --tail=50

# 22. Tester manuellement en accédant au site
curl https://votre_domaine.com

# 23. Exécuter les contrôles post-déploiement
./scripts/post_deploy_check.sh
```

### Résumé des Commandes

```bash
# Sauvegarde
PGHOST=localhost PGPORT=5432 PGUSER=projetstage_user pg_dump -Fc projetstage_db > /root/backups/db_backup_$(date +%Y-%m-%d_%H-%M-%S).dump

# Déploiement
cd /home/utilisateur/ProjetStage
git pull origin main
docker compose up -d --build
docker compose exec django python manage.py migrate

# Vérification Nginx
sudo nginx -t
sudo systemctl reload nginx

# Tests
docker compose logs --tail=50
curl https://votre_domaine.com
```

---

## Récupération en Cas de Problème

### Problème 1 : Les Services Ne Démarrent Pas

```bash
# Afficher les logs détaillés
docker compose logs django
docker compose logs fastapi
docker compose logs frontend

# Redémarrer les services
docker compose restart

# Si rien ne fonctionne, tout arrêter et redémarrer
docker compose down
docker compose up -d --build
```

### Problème 2 : Les Migrations Échouent

```bash
# Voir quelles migrations sont appliquées
docker compose exec django python manage.py showmigrations

# Revenir à une migration précédente (ATTENTION : cela supprime les données !)
docker compose exec django python manage.py migrate app_name 0001

# Réessayer
docker compose exec django python manage.py migrate
```

### Problème 3 : Nginx Retourne une Erreur 502 Bad Gateway

Cela signifie que Nginx ne peut pas accéder aux services backend. Vérifiez :

```bash
# Vérifier que les services tournent
docker compose ps

# Tester la connexion à Django
curl http://localhost:8000

# Vérifier les logs Nginx
sudo tail -20 /var/log/nginx/error.log
```

### Problème 4 : Restaurer la Base de Données à partir d'une Sauvegarde

```bash
# Lister les sauvegardes disponibles
ls -lh /root/backups/

# Restaurer une sauvegarde
PGHOST=localhost PGPORT=5432 PGUSER=projetstage_user pg_restore -d projetstage_db /root/backups/db_backup_2026-01-15_14-30-45.dump

# (Vous serez invité à entrer le mot de passe PostgreSQL)

# Vérifier que la restauration a réussi
docker compose exec django python manage.py check
```

**⚠️ Attention** : restaurer une sauvegarde écrasera les données existantes ! Assurez-vous de faire une nouvelle sauvegarde avant.

### Problème 5 : Rollback vers la Version Antérieure

Si la nouvelle version ne fonctionne pas :

```bash
# 1. Arrêter les services actuels
docker compose down

# 2. Revenir au commit précédent
git checkout HEAD~1

# 3. Redémarrer les anciens conteneurs
docker compose up -d

# 4. Restaurer la base de données si nécessaire
PGHOST=localhost PGPORT=5432 PGUSER=projetstage_user pg_restore -d projetstage_db /root/backups/db_backup_ancienne_date.dump

# 5. Recharger Nginx
sudo systemctl reload nginx

# 6. Une fois stabilisé, investiguer le problème avec la nouvelle version
```

---

## Checklist de Sécurité

Avant de mettre en production, vérifiez :

- [ ] `DEBUG=False` dans `.env`
- [ ] `SECRET_KEY` est une chaîne longue et aléatoire
- [ ] Le certificat SSL est actif (HTTPS)
- [ ] Les fichiers `.env` et sauvegardes sont protégés : `chmod 600 .env`
- [ ] PostgreSQL écoute uniquement sur localhost, pas sur `0.0.0.0`
- [ ] Firewall configuré pour bloquer les ports inutilisés
- [ ] Sauvegardes régulières configurées (cron job)

### Configurer les Sauvegardes Automatiques

```bash
# Éditer le crontab
sudo crontab -e

# Ajouter cette ligne pour sauvegarder chaque jour à 2h du matin
0 2 * * * PGHOST=localhost PGPORT=5432 PGUSER=projetstage_user pg_dump -Fc projetstage_db > /root/backups/db_backup_$(date +\%Y-\%m-\%d).dump
```

---

## Support et Dépannage

**Erreur commune** : `Connection refused on port 8000`
- Cause : Django n'est pas démarré ou a crashé
- Solution : `docker compose logs django`

**Erreur commune** : `504 Gateway Timeout`
- Cause : Le service met trop longtemps à répondre
- Solution : augmentez les `proxy_read_timeout` dans la config Nginx

**Questions** : Consultez la documentation Docker Compose ou les logs des services.

---

**Dernière mise à jour** : 2026-08-17
**Version du guide** : 2.0 (version complète pour débutants)
