# EPL_PEDAGO - Système après intégration du backend FastAPI

## Description

EPL_PEDAGO est désormais une plateforme pédagogique multi-backends qui combine :
- un backend Django pour la gestion des utilisateurs, des inscriptions pédagogiques et des fonctionnalités métier de base,
- un backend FastAPI pour l’importation de données, le traitement analytique, les tableaux de bord et la génération de rapports,
- un frontend Next.js pour l’interface utilisateur moderne et interactive.

Cette intégration permet de conserver l’architecture initiale du projet tout en ajoutant une couche plus performante pour la manipulation et l’analyse des données pédagogiques.

---

## Objectif de l’intégration

L’objectif était de compléter le système existant en ajoutant un moteur d’analyse et de traitement des données plus adapté aux opérations suivantes :
- importation de fichiers CSV, Parquet et Excel,
- nettoyage et validation des données,
- génération de statistiques et tableaux de bord,
- consultation de rapports et visualisations,
- centralisation de certaines opérations API dans un backend moderne basé sur FastAPI.

---

## Architecture du système après intégration

Le projet est maintenant structuré autour de trois couches principales :

### 1. Frontend Next.js
Le frontend reste la couche d’interaction avec l’utilisateur.

Il permet :
- l’affichage des interfaces d’inscription,
- la consultation des données pédagogiques,
- l’importation des fichiers via une interface moderne,
- la communication avec les services backend via des appels API.

### 2. Backend Django
Le backend Django conserve ses responsabilités principales liées à la logique métier initiale du projet.

Il couvre :
- la gestion des utilisateurs,
- l’authentification et les permissions,
- les inscriptions pédagogiques,
- les fonctionnalités liées aux profils enseignants et étudiants,
- la gestion des données métier de base.

### 3. Backend FastAPI
Le backend FastAPI a été ajouté pour répondre aux besoins d’analyse et de traitement de données.

Il couvre :
- l’upload de fichiers de données,
- le traitement et la validation des fichiers importés,
- la préparation des données pour les tableaux de bord,
- la gestion des endpoints d’analyse,
- l’accès aux données de visualisation et aux rapports.

---

## Structure du projet après intégration

ProjetStage/
├── Backend_django/                  # Backend principal Django
│   ├── Backend_django/              # Configuration du projet Django
│   ├── apps/                        # Applications métiers
│   └── manage.py
│
├── Backend_fastapi/                 # Nouveau backend FastAPI
│   ├── app/                         # Code principal FastAPI
│   │   ├── api/                     # Routes et endpoints
│   │   ├── core/                    # Configuration et paramètres
│   │   ├── models/                  # Modèles / schémas de données
│   │   └── services/                # Logique de traitement
│   └── data/                        # Données et fichiers importés
│
├── frontend_next/                   # Frontend Next.js
│   ├── public/
│   ├── src/
│   └── package.json
│
├── README.md
├── README_integration.md
└── requirements.txt

---

## Rôles des composants

### Frontend Next.js
Le frontend est responsable de :
- l’affichage des pages utilisateur,
- la soumission des formulaires,
- l’envoi des fichiers d’importation,
- l’affichage des résultats d’analyse et des dashboards.

### Backend Django
Le backend Django sert principalement à :
- gérer la logique métier initiale du projet,
- administrer les données pédagogiques de base,
- fournir les services liés aux inscriptions et aux profils utilisateurs.

### Backend FastAPI
Le backend FastAPI sert à :
- traiter les données massives ou importées,
- fournir des endpoints spécifiques pour le dashboard,
- gérer les opérations d’upload et de validation.

---

## Fonctionnalités disponibles après intégration

### Fonctionnalités métier Django
- gestion des utilisateurs,
- inscriptions pédagogiques,
- gestion des profils étudiant/enseignant/secrétariat/administration,
- logique métier initiale du projet.

### Fonctionnalités analytiques FastAPI
- importation de données depuis des fichiers externes,
- nettoyage et validation des données,
- traitements automatisés après upload,
- endpoints de statistiques et dashboards,
- consultation des métadonnées et des rapports.

### Fonctionnalités frontend
- navigation dans l’interface principale,
- interaction avec les composants de données,
- chargement des résultats provenant des deux backends,
- interface d’importation des fichiers.

---

## Flux de fonctionnement principal

1. L’utilisateur se connecte via l’interface Next.js.
2. Le frontend appelle les services nécessaires selon la fonctionnalité demandée.
3. Le backend Django traite les opérations métier classiques.
4. Pour les données et analyses, le frontend peut appeler le backend FastAPI.
5. Les fichiers uploadés sont traités, validés et préparés pour l’exploitation dans les tableaux de bord.
6. Les résultats sont renvoyés à l’interface pour affichage.

---

## Technologies utilisées

### Frontend
- Next.js
- React
- Axios
- Tailwind / styles frontend

### Backend Django
- Python
- Django
- Django REST Framework

### Backend FastAPI
- Python
- FastAPI
- Pydantic
- Uvicorn

### Stockage et données
- fichiers CSV / Parquet / Excel pour l’importation,
- données structurées pour l’analyse et le dashboard.

---

## Installation et démarrage

### Prérequis
- Python 3.10+
- Node.js 18+
- pip / npm

### Backend Django
```bash
cd ProjetStage/Backend_django
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Backend FastAPI
```bash
cd ProjetStage/Backend_fastapi
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

### Frontend Next.js
```bash
cd ProjetStage/frontend_next
npm install
npm run dev
```

### Accès local
- Frontend : http://localhost:3000
- Backend Django : http://localhost:8000
- Backend FastAPI : http://localhost:8001

---

## Points importants de l’intégration

- Le projet initial a été conservé et complété.
- Django reste central pour la logique métier initiale.
- FastAPI apporte une couche moderne pour les traitements de données et les API analytiques.
- Le frontend peut interagir avec les deux backends selon les besoins fonctionnels.

---

## Guide de déploiement sur un serveur

Ce guide décrit la procédure complète pour déployer l’application EPL_PEDAGO sur un serveur distant pour la première fois. Il couvre les étapes de préparation, d’installation, de configuration, de lancement et de supervision des trois composants : le frontend Next.js, le backend Django et le backend FastAPI.

---

## 1. Préparer le serveur

Avant toute installation, il faut s’assurer que le serveur dispose des éléments nécessaires.

### 1.1. Prérequis système

Le serveur doit avoir au minimum :
- un système d’exploitation Linux Ubuntu ou Debian recommandé,
- un accès SSH avec un utilisateur non-root,
- Python 3.10 ou plus,
- Node.js 18 ou plus,
- npm,
- un gestionnaire de processus comme systemd,
- un serveur web ou un reverse proxy si vous souhaitez exposer l’application publiquement,
- un accès à une base de données si le backend Django doit fonctionner avec des données persistantes.

### 1.2. Mettre à jour le système

Exécuter les commandes suivantes :

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3. Installer les dépendances système de base

```bash
sudo apt install -y python3 python3-pip python3-venv nginx git curl build-essential
```

### 1.4. Installer Node.js

Si Node.js n’est pas déjà installé :

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

Vérifier les versions installées :

```bash
node -v
npm -v
python3 --version
```

---

## 2. Récupérer le projet sur le serveur

Se connecter au serveur puis cloner le dépôt :

```bash
cd /var/www
sudo git clone <url_du_dépôt> projetstage
cd projetstage
```

Si le dépôt est déjà présent, faire un pull :

```bash
cd /var/www/projetstage
git pull origin main
```

### 2.1. Vérifier la structure du projet

Assurez-vous que les dossiers suivants existent :
- Backend_django/
- Backend_fastapi/
- frontend_next/

---

## 3. Déployer le backend Django

### 3.1. Créer un environnement virtuel Python

```bash
cd /var/www/projetstage/Backend_django
python3 -m venv venv
source venv/bin/activate
```

### 3.2. Installer les dépendances Python

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3.3. Configurer les variables d’environnement

Créer un fichier .env avec les variables nécessaires, au minimum :

```bash
nano .env
```

Exemple de contenu :

```env
SECRET_KEY=une_cle_secrete_très_longue
DEBUG=False
ALLOWED_HOSTS=your-domain.com,localhost,127.0.0.1
DB_NAME=nom_de_la_base
DB_USER=utilisateur_db
DB_PASSWORD=mot_de_passe_db
DB_HOST=localhost
DB_PORT=5432
```

Si vous utilisez PostgreSQL, il faut aussi créer la base de données avant de continuer.

### 3.4. Configurer la base de données

Créer la base si nécessaire :

```bash
sudo -u postgres psql
CREATE DATABASE nom_de_la_base;
CREATE USER utilisateur_db WITH PASSWORD 'mot_de_passe_db';
ALTER ROLE utilisateur_db SET client_encoding TO 'utf8';
ALTER ROLE utilisateur_db SET default_transaction_isolation TO 'read committed';
ALTER ROLE utilisateur_db SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE nom_de_la_base TO utilisateur_db;
\q
```

### 3.5. Appliquer les migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 3.6. Créer un superutilisateur

```bash
python manage.py createsuperuser
```

### 3.7. Collecter les fichiers statiques

```bash
python manage.py collectstatic --noinput
```

### 3.8. Vérifier le démarrage Django

Lancer le serveur en mode test :

```bash
python manage.py runserver 0.0.0.0:8000
```

Si cela fonctionne, le backend Django est prêt à être servi via un processus de production.

---

## 4. Déployer le backend FastAPI

### 4.1. Créer un environnement virtuel Python

```bash
cd /var/www/projetstage/Backend_fastapi
python3 -m venv venv
source venv/bin/activate
```

### 4.2. Installer les dépendances Python

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4.3. Vérifier la configuration

Vérifier que les chemins de données, les dossiers d’upload et les variables d’environnement sont correctement définis dans le projet.

Il faut notamment s’assurer que les dossiers suivants sont accessibles en écriture :
- data/
- uploads/
- logs/ si présents

### 4.4. Lancer le service FastAPI

Pour un test rapide :

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

Si cela fonctionne, le backend FastAPI est prêt pour une exécution continue.

---

## 5. Déployer le frontend Next.js

### 5.1. Installer les dépendances

```bash
cd /var/www/projetstage/frontend_next
npm install
```

### 5.2. Configurer les variables d’environnement

Créer un fichier .env.local ou .env.production selon votre besoin :

```bash
nano .env.production
```

Exemple :

```env
NEXT_PUBLIC_API_URL=http://your-domain.com/api
NEXT_PUBLIC_EPL_API_URL=http://your-domain.com/api
```

Si le frontend doit appeler le backend Django et FastAPI via des routes distinctes, il faut vérifier que l’URL utilisée correspond bien à votre configuration de reverse proxy.

### 5.3. Construire l’application

```bash
npm run build
```

### 5.4. Démarrer le frontend

En production, il est recommandé d’utiliser un serveur Node stable plutôt que le mode développement.

Exemple :

```bash
npm run start -- --hostname 0.0.0.0 --port 3000
```

---

## 6. Configurer un reverse proxy avec Nginx

Pour exposer proprement l’application sur Internet ou sur un réseau interne, Nginx est fortement recommandé.

### 6.1. Créer la configuration du site

```bash
sudo nano /etc/nginx/sites-available/eplpeda
```

Exemple de configuration :

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /fastapi/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6.2. Activer la configuration

```bash
sudo ln -s /etc/nginx/sites-available/eplpeda /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. Faire tourner les services en permanence avec systemd

Il est essentiel d’éviter que les services s’arrêtent après une déconnexion SSH.

### 7.1. Créer un service pour Django

```bash
sudo nano /etc/systemd/system/epl-django.service
```

Exemple :

```ini
[Unit]
Description=EPL Django Backend
After=network.target

[Service]
User=your-user
Group=your-user
WorkingDirectory=/var/www/projetstage/Backend_django
Environment="PATH=/var/www/projetstage/Backend_django/venv/bin"
ExecStart=/var/www/projetstage/Backend_django/venv/bin/python manage.py runserver 0.0.0.0:8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Activer et démarrer :

```bash
sudo systemctl daemon-reload
sudo systemctl enable epl-django
sudo systemctl start epl-django
sudo systemctl status epl-django
```

### 7.2. Créer un service pour FastAPI

```bash
sudo nano /etc/systemd/system/epl-fastapi.service
```

Exemple :

```ini
[Unit]
Description=EPL FastAPI Backend
After=network.target

[Service]
User=your-user
Group=your-user
WorkingDirectory=/var/www/projetstage/Backend_fastapi
Environment="PATH=/var/www/projetstage/Backend_fastapi/venv/bin"
ExecStart=/var/www/projetstage/Backend_fastapi/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Activer et démarrer :

```bash
sudo systemctl daemon-reload
sudo systemctl enable epl-fastapi
sudo systemctl start epl-fastapi
sudo systemctl status epl-fastapi
```

### 7.3. Créer un service pour Next.js

```bash
sudo nano /etc/systemd/system/epl-next.service
```

Exemple :

```ini
[Unit]
Description=EPL Next.js Frontend
After=network.target

[Service]
User=your-user
Group=your-user
WorkingDirectory=/var/www/projetstage/frontend_next
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run start -- --hostname 0.0.0.0 --port 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Activer et démarrer :

```bash
sudo systemctl daemon-reload
sudo systemctl enable epl-next
sudo systemctl start epl-next
sudo systemctl status epl-next
```

---

## 8. Vérifier que le déploiement fonctionne

Après le démarrage des services, vérifier chaque composant.

### 8.1. Vérifier Django

```bash
curl http://127.0.0.1:8000
```

### 8.2. Vérifier FastAPI

```bash
curl http://127.0.0.1:8001/docs
```

### 8.3. Vérifier Next.js

```bash
curl http://127.0.0.1:3000
```

### 8.4. Vérifier via le domaine

Ouvrir votre navigateur sur :

```text
http://your-domain.com
```

---

## 9. Sécuriser le déploiement

Pour un déploiement sérieux, il faut au minimum :
- configurer HTTPS avec Let’s Encrypt,
- protéger les mots de passe et clés secrètes,
- ne jamais exposer les services en clair sans reverse proxy,
- utiliser des variables d’environnement pour les secrets,
- limiter les permissions des dossiers sensibles,
- activer les logs et la surveillance.

### 9.1. Installer Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 10. Gestion des logs et maintenance

Les logs doivent être surveillés régulièrement.

### 10.1. Voir les logs Django

```bash
sudo journalctl -u epl-django -f
```

### 10.2. Voir les logs FastAPI

```bash
sudo journalctl -u epl-fastapi -f
```

### 10.3. Voir les logs Next.js

```bash
sudo journalctl -u epl-next -f
```

### 10.4. Redémarrer un service

```bash
sudo systemctl restart epl-django
sudo systemctl restart epl-fastapi
sudo systemctl restart epl-next
```

---

## 11. Points à ne pas oublier

Voici les éléments souvent oubliés lors d’un premier déploiement :
- la base de données n’est pas encore créée,
- les variables d’environnement ne sont pas configurées,
- les dépendances Python ou Node ne sont pas installées,
- les ports ne sont pas ouverts ou mal routés,
- les fichiers statiques Django ne sont pas collectés,
- les services ne sont pas démarrés avec systemd,
- la configuration Nginx n’est pas activée,
- le domaine ne pointe pas vers le serveur,
- les secrets ne sont pas protégés,
- HTTPS n’est pas configuré.

---

## 12. Résumé rapide

Pour un déploiement réussi, il faut toujours :
1. préparer le serveur,
2. installer les dépendances,
3. configurer les variables d’environnement,
4. créer et préparer la base de données,
5. déployer Django, FastAPI et Next.js,
6. mettre en place Nginx,
7. utiliser systemd pour la stabilité,
8. sécuriser l’accès avec HTTPS,
9. vérifier chaque service avec des tests simples,
10. surveiller les logs.

---

## Conclusion

Le déploiement sur serveur de EPL_PEDAGO demande une installation structurée et méthodique. En respectant chaque étape, la plateforme peut être mise en production de manière stable, sécurisée et maintenable, tout en conservant l’architecture multi-backends intégrée après l’ajout du backend FastAPI.
