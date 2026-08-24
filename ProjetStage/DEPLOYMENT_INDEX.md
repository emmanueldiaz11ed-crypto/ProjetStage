# 📚 Guide de Déploiement ProjetStage - Index Complet

Bienvenue ! Ce répertoire contient une **documentation complète** pour déployer ProjetStage en production. Choisissez le guide qui correspond à votre situation.

---

## 🎯 Quick Start : Quel Guide Dois-je Lire ?

### Je suis un **Complet Débutant**
➡️ **Lisez** : [`DEPLOYMENT_STEP_BY_STEP.md`](DEPLOYMENT_STEP_BY_STEP.md)
- ✅ Explique chaque étape
- ✅ Pas de présupposés techniques
- ✅ Checklist détaillée
- ⏱️ Environ 3 heures

### Je Connais Déjà Docker/Linux
➡️ **Lisez** : [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md)
- ✅ Guide académique et professionnel
- ✅ Couvre tous les aspects (DB, Nginx, DNS, sécurité)
- ✅ Procédures détaillées avec explications
- ⏱️ Environ 2 heures

### Je Veux Juste les **Commandes**
➡️ **Lisez** : [`DEPLOYMENT_SCRIPTS.md`](DEPLOYMENT_SCRIPTS.md)
- ✅ Scripts Shell prêts à copier-coller
- ✅ Automatisation complète
- ✅ Sauvegardes, healthcheck, restauration
- ⏱️ Environ 1 heure (mise en place)

### Je Dois **Configurer Nginx**
➡️ **Allez à** : [`nginx/projetstage.conf`](nginx/projetstage.conf)
- ✅ Configuration annotée ligne par ligne
- ✅ Explique chaque section
- ✅ Prête à utiliser avec substitution de valeurs

---

## 📖 Description Complète des Documents

### 1. 📋 [DEPLOYMENT_STEP_BY_STEP.md](DEPLOYMENT_STEP_BY_STEP.md) - Guide Étape par Étape

**Pour qui ?** Débutants complets qui n'ont aucune expérience

**Contient** :
- ✅ Étape 0 : Préparation (ce qu'il faut avant de commencer)
- ✅ Étape 1 : Connexion SSH (comment se connecter au serveur)
- ✅ Étape 2 : Installation Docker (avec explications)
- ✅ Étape 3 : Cloner le projet
- ✅ Étape 4 : Créer la base de données PostgreSQL
- ✅ Étape 5 : Fichier .env (configuration)
- ✅ Étape 6 : Sauvegarde (TRÈS IMPORTANT)
- ✅ Étape 7 : Déployer avec Docker
- ✅ Étape 8 : Migrations de base de données
- ✅ Étape 9 : Installer et configurer Nginx
- ✅ Étape 10 : Certificat SSL avec Let's Encrypt
- ✅ Étape 11 : Configuration DNS du domaine
- ✅ Étape 12 : Tester le site
- ✅ Étape 13 : Checklist de sécurité

**Temps** : 2-3 heures pour la première fois

**Exemple d'utilisation** :
```
1. Lire l'étape 1
2. Faire exactement ce qui est décrit
3. Passer à l'étape 2
4. Lire le reste...
```

---

### 2. 🔬 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Guide Académique Complet

**Pour qui ?** Personnes ayant une expérience Linux/Docker

**Contient** :
- 📌 Table des matières
- 🎓 Concepts fondamentaux (architecture, rôles des services)
- 🛠️ Préparation de l'environnement (Docker, Nginx, PostgreSQL)
- 💾 **Sauvegarde complète de la base de données** (étape CRITIQUE)
- 🐳 Déploiement avec Docker Compose
- 🌐 Configuration Nginx détaillée (reverse proxy, SSL, routing)
- 📡 Configuration du domaine (DNS, Let's Encrypt)
- 🔄 Procédure complète de déploiement (7 phases)
- 🛡️ Récupération en cas de problème (troubleshooting)
- ✅ Checklist de sécurité
- ⚙️ Sauvegardes automatisées

**Points forts** :
- Explique le **"pourquoi"** pas juste le "comment"
- Professionnel et académique
- Sections dédiées à la sécurité
- Stratégies de rollback

**Temps** : 2-3 heures

---

### 3. 🤖 [DEPLOYMENT_SCRIPTS.md](DEPLOYMENT_SCRIPTS.md) - Scripts Automatisés

**Pour qui ?** Personnes cherchant à automatiser

**Contient** :
1. **backup_database.sh** - Sauvegarde automatisée avec rotation
2. **deploy_complete.sh** - Déploiement complet en une seule commande
3. **health_check.sh** - Monitoring et vérification de santé
4. **restore_database.sh** - Restauration interactive avec confirmation
5. **Cron jobs** - Configuration des sauvegardes programmées

**Utilisation** :
```bash
# Déployer entièrement
./scripts/deploy_complete.sh

# Sauvegarder la base de données
./scripts/backup_database.sh

# Vérifier la santé du système
./scripts/health_check.sh

# Restaurer une sauvegarde
./scripts/restore_database.sh
```

**Avantages** :
- Réduit les erreurs humaines
- Gain de temps
- Automatisation des tâches répétitives
- Logs détaillés

---

### 4. ⚙️ [nginx/projetstage.conf](nginx/projetstage.conf) - Configuration Nginx Annotée

**Pour qui ?** Personnes configurant Nginx

**Contient** :
- 📍 Configuration HTTP (redirection automatique vers HTTPS)
- 🔒 Configuration HTTPS avec SSL/TLS
- 📝 Headers de sécurité
- 🚀 Routage des services :
  - `/` → Frontend Next.js (port 3000)
  - `/api/` → Django (port 8000)
  - `/analyze/` → FastAPI (port 8001)
  - `/static/` → Fichiers statiques
  - `/media/` → Fichiers uploadés
  - `/health` → Healthcheck
- ⏱️ Timeouts configurés
- 💾 Cache configuré
- 📊 Logging

**Caractéristiques** :
- Commentaires détaillés (plus de commentaires que de code)
- Explique le rôle de chaque directive
- Prête à utiliser (simplement remplacer les placeholders)
- Prend en charge WebSockets

**Installation** :
```bash
# Copier le fichier
sudo cp nginx/projetstage.conf /etc/nginx/sites-available/

# Éditer avec vos valeurs
sudo nano /etc/nginx/sites-available/projetstage.conf

# Tester
sudo nginx -t

# Activer
sudo systemctl reload nginx
```

---

## 🔑 Informations Clés

### Variables à Préparer

Avant de commencer, préparez :

```env
# Base de données
DB_HOST=localhost                    # Adresse PostgreSQL
DB_PORT=5432                         # Port PostgreSQL
DB_USER=projetstage_user            # Utilisateur à créer
DB_PASSWORD=mot_de_passe_securise   # Mot de passe fort !
DB_NAME=projetstage_db              # Nom de la base

# Django
DEBUG=False                          # JAMAIS True en production !
SECRET_KEY=clé_très_longue_aléatoire

# Domaine
ALLOWED_HOSTS=mon-domaine.com,www.mon-domaine.com

# Frontend
NEXT_PUBLIC_API_URL=https://mon-domaine.com/api
```

### Ports Utilisés

| Service | Port | Accès |
|---------|------|-------|
| Frontend Next.js | 3000 | Local seulement |
| Django API | 8000 | Local seulement |
| FastAPI | 8001 | Local seulement |
| Nginx HTTP | 80 | Public (redirige vers 443) |
| Nginx HTTPS | 443 | Public |
| PostgreSQL | 5432 | Local seulement |

### Architecture

```
Internet (Utilisateurs)
    ↓
Firewall (ports 80, 443)
    ↓
Nginx (reverse proxy)
    ├─→ Frontend (3000)
    ├─→ Django API (8000)
    └─→ FastAPI (8001)
    
Base de données PostgreSQL (5432)
```

---

## ⚠️ Points CRITIQUES (À Ne PAS Oublier)

### 1. 🔒 Sauvegarde de la Base de Données

**AVANT CHAQUE DÉPLOIEMENT**, faites une sauvegarde :

```bash
PGHOST=localhost PGPORT=5432 PGUSER=projetstage_user pg_dump -Fc projetstage_db > /root/backups/db_backup_$(date +%Y-%m-%d_%H-%M-%S).dump
```

Si quelque chose se casse, vous pouvez restaurer à partir de cette sauvegarde.

### 2. 🔐 Sécurité

Avant la production, vérifiez **ABSOLUMENT** :

- [ ] `DEBUG=False` dans `.env`
- [ ] `SECRET_KEY` est une chaîne longue et aléatoire
- [ ] Le fichier `.env` n'est **PAS** commité dans Git
- [ ] Certificat SSL actif (HTTPS)
- [ ] PostgreSQL écoute sur `localhost` seulement, pas sur `0.0.0.0`

### 3. 🚨 Gestion d'Erreurs

Les trois réactions essentielles :

```bash
# 1. "Les services ne démarrent pas ?"
docker compose logs --tail=50

# 2. "Nginx retourne 502 ?"
sudo tail -20 /var/log/nginx/error.log
docker compose ps

# 3. "Besoin de revenir en arrière ?"
# Restaurer à partir d'une sauvegarde :
PGHOST=localhost PGPORT=5432 PGUSER=projetstage_user pg_restore -d projetstage_db /root/backups/db_backup_ancienne.dump
```

---

## 📋 Checklist de Déploiement Rapide

**Si vous avez déjà fait une fois** :

- [ ] SSH connecté au serveur
- [ ] Fichier `.env` complété
- [ ] Sauvegarde base de données faite
- [ ] `git pull` exécuté
- [ ] `docker compose up -d --build` lancé
- [ ] `docker compose exec django python manage.py migrate`
- [ ] `sudo nginx -t` valide
- [ ] `sudo systemctl reload nginx` exécuté
- [ ] Site testé sur HTTPS

---

## 🎓 Ordre de Lecture Recommandé

### Si c'est votre **première fois** :
1. Lisez [`DEPLOYMENT_STEP_BY_STEP.md`](DEPLOYMENT_STEP_BY_STEP.md) en entier
2. Suivez chaque étape (copier-coller les commandes)
3. Consultez [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md) pour plus de détails

### Si vous **réitérez** :
1. Consultez [`DEPLOYMENT_SCRIPTS.md`](DEPLOYMENT_SCRIPTS.md)
2. Utilisez `./scripts/deploy_complete.sh`
3. Vérifiez avec `./scripts/health_check.sh`

### Si vous **avez un problème** :
1. Consultez la section "Récupération en Cas de Problème" de [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md)
2. Regardez la checklist de troubleshooting dans [`DEPLOYMENT_STEP_BY_STEP.md`](DEPLOYMENT_STEP_BY_STEP.md#-en-cas-de-problème)
3. Consultez les logs : `docker compose logs` et `sudo tail -f /var/log/nginx/error.log`

---

## 🔗 Fichiers Supplémentaires

Dans ce répertoire, vous trouverez aussi :

| Fichier | Utilité |
|---------|---------|
| `docker-compose.yml` | Configuration des services Docker |
| `.env.example` | Exemple de configuration (copier vers `.env`) |
| `nginx/projetstage.conf` | Configuration Nginx prête à utiliser |
| `scripts/deploy.sh` | Script de déploiement fourni |
| `scripts/post_deploy_check.sh` | Vérifications post-déploiement |

---

## 🆘 Besoin d'Aide ?

### Erreurs Courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Connection refused` | Django/FastAPI pas démarré | `docker compose logs django` |
| `502 Bad Gateway` | Nginx ne peut pas accéder aux services | Vérifier `docker compose ps` et logs Nginx |
| `Invalid certificate` | Certificat SSL absent | `sudo certbot certonly --nginx -d votre-domaine.com` |
| `Module not found` | Dépendances manquantes | `docker compose up -d --build` |
| `ALLOWED_HOSTS` | Domaine non autorisé | Vérifier `.env` ALLOWED_HOSTS |

### Commandes de Dépannage Essentielles

```bash
# Voir l'état des services
docker compose ps

# Voir les logs (remplacer 'django' par 'fastapi', 'frontend')
docker compose logs -f django

# Redémarrer un service
docker compose restart django

# Vérifier Nginx
sudo nginx -t
sudo systemctl status nginx

# Voir les logs Nginx
sudo tail -f /var/log/nginx/error.log

# Vérifier la santé Django
docker compose exec -T django python manage.py check

# Tester la connectivité de base de données
PGHOST=localhost PGPORT=5432 PGUSER=projetstage_user psql -d projetstage_db -c "SELECT 1;"
```

---

## 🎯 Objectifs à Long Terme

Après le déploiement initial, pensez à :

1. **Sauvegardes Automatiques**
   - Configurer `cron` pour sauvegarder chaque jour
   - Stocker les sauvegardes sur un serveur externe (S3, etc.)

2. **Monitoring**
   - Mettre en place une surveillance (Uptime Robot, Datadog)
   - Alertes en cas de panne

3. **CI/CD**
   - Mettre en place GitHub Actions pour déploiement automatique
   - Tests automatisés avant déploiement

4. **Mise à Jour du Certificat SSL**
   - Le certificat Let's Encrypt expire après 90 jours
   - Certbot renouvelle automatiquement (vérifier que c'est activé)

5. **Logs Centralisés**
   - Collecter les logs de Docker, Nginx, Django
   - Facilite le debugging

---

## 📝 Version et Date

**Documentation mise à jour** : 2026-08-17
**Version** : 2.0 (Édition Complète Débutants)

---

## ✅ Prêt à Commencer ?

Choisissez votre document et commencez ! 🚀

**Recommandé pour la première fois** : 👉 [`DEPLOYMENT_STEP_BY_STEP.md`](DEPLOYMENT_STEP_BY_STEP.md)

Bonne chance ! 💪
