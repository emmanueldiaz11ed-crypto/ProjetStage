# Checklist de déploiement prêt à suivre

Ce document est une version simple et pratique du guide de déploiement. Il vous permet de suivre les étapes dans l’ordre sans oublier les détails importants.

---

## 1. Avant de commencer

- [ ] Avoir un compte GitHub
- [ ] Avoir un compte Render
- [ ] Avoir un compte Vercel
- [ ] Avoir un dépôt GitHub du projet
- [ ] Avoir une base de données PostgreSQL si le backend Django en a besoin
- [ ] Vérifier que le projet fonctionne localement

---

## 2. Préparer le dépôt GitHub

- [ ] Pousser la dernière version du projet sur GitHub
- [ ] Vérifier que les dossiers suivants existent :
  - [ ] Backend_django
  - [ ] Backend_fastapi
  - [ ] frontend_next
- [ ] Vérifier que les fichiers de dépendances sont présents :
  - [ ] requirements.txt dans Backend_django
  - [ ] requirements.txt dans Backend_fastapi
  - [ ] package.json dans frontend_next

---

## 3. Déployer le backend Django sur Render

### 3.1. Créer le service

- [ ] Aller sur Render
- [ ] Cliquer sur New + puis Web Service
- [ ] Choisir le dépôt GitHub
- [ ] Sélectionner le dossier Backend_django
- [ ] Choisir Python comme runtime

### 3.2. Configuration du service

Remplir :
- [ ] Name : nom du service Django
- [ ] Region : choisir la région la plus proche
- [ ] Branch : main

Build Command :
```bash
pip install -r requirements.txt && python manage.py collectstatic --noinput
```

Start Command :
```bash
gunicorn Backend_django.wsgi:application --bind 0.0.0.0:$PORT
```

### 3.3. Variables d’environnement

Ajouter dans Render :
```env
SECRET_KEY=change-me
DEBUG=False
ALLOWED_HOSTS=your-service-name.onrender.com,localhost,127.0.0.1
DATABASE_URL=postgres://user:password@host:port/dbname
```

### 3.4. Base de données

- [ ] Créer une base PostgreSQL sur Render si nécessaire
- [ ] Récupérer l’URL de connexion
- [ ] Mettre cette URL dans DATABASE_URL

### 3.5. Migrations

Après le premier déploiement, exécuter dans la console Render :
```bash
python manage.py migrate
```

### 3.6. Superutilisateur

Si besoin :
```bash
python manage.py createsuperuser
```

### 3.7. Vérification

- [ ] Ouvrir l’URL Render
- [ ] Vérifier que l’API répond
- [ ] Vérifier que la base de données est bien connectée

---

## 4. Déployer le backend FastAPI sur Render

### 4.1. Créer le service

- [ ] Aller sur Render
- [ ] Cliquer sur New + puis Web Service
- [ ] Choisir le dépôt GitHub
- [ ] Sélectionner le dossier Backend_fastapi
- [ ] Choisir Python comme runtime

### 4.2. Configuration du service

Build Command :
```bash
pip install -r requirements.txt
```

Start Command :
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 4.3. Variables d’environnement

Ajouter :
```env
ENVIRONMENT=production
```

Si votre code en a besoin, ajouter aussi :
```env
PORT=10000
```

### 4.4. Vérification

- [ ] Ouvrir l’URL Render du service FastAPI
- [ ] Vérifier que la documentation Swagger s’affiche
- [ ] Vérifier qu’un endpoint de santé répond

---

## 5. Déployer le frontend Next.js sur Vercel

### 5.1. Créer le projet

- [ ] Aller sur Vercel
- [ ] Cliquer sur Add New Project
- [ ] Importer le dépôt GitHub
- [ ] Sélectionner le dossier frontend_next

### 5.2. Configuration du projet

- [ ] Laisser les paramètres par défaut si tout est détecté correctement
- [ ] Cliquer sur Deploy

### 5.3. Variables d’environnement

Dans Vercel, ajouter :
```env
NEXT_PUBLIC_API_URL=https://your-django-service.onrender.com/api
NEXT_PUBLIC_EPL_API_URL=https://your-fastapi-service.onrender.com
```

### 5.4. Vérification

- [ ] Ouvrir l’URL Vercel
- [ ] Vérifier que la page d’accueil s’affiche
- [ ] Tester les appels API depuis le frontend

---

## 6. Configurer les URLs correctement

- [ ] Vérifier que le frontend pointe vers le bon backend Django
- [ ] Vérifier que le frontend pointe vers le bon backend FastAPI
- [ ] Vérifier que les URL utilisent HTTPS

Exemple :
```env
NEXT_PUBLIC_API_URL=https://votre-backend-django.onrender.com/api
NEXT_PUBLIC_EPL_API_URL=https://votre-backend-fastapi.onrender.com
```

---

## 7. Corriger les problèmes CORS

- [ ] Ajouter l’URL Vercel dans les origines autorisées du backend Django
- [ ] Ajouter l’URL Vercel dans les origines autorisées du backend FastAPI

Exemple de logique à vérifier :
- [ ] Backend Django accepte l’origine du frontend
- [ ] Backend FastAPI accepte l’origine du frontend

---

## 8. Vérifications finales

### Backend Django
- [ ] le service Render est bien en ligne
- [ ] les migrations sont appliquées
- [ ] la base est connectée
- [ ] l’API répond correctement

### Backend FastAPI
- [ ] le service Render est bien en ligne
- [ ] Swagger est accessible
- [ ] l’upload fonctionne

### Frontend Next.js
- [ ] le site Vercel est accessible
- [ ] les pages se chargent
- [ ] les appels API fonctionnent

---

## 9. Erreurs fréquentes à vérifier

- [ ] erreur 404 sur les routes API
- [ ] erreur CORS
- [ ] variables d’environnement mal renseignées
- [ ] mauvaise URL de backend
- [ ] service Render non démarré
- [ ] build failed sur Vercel
- [ ] dépendances non installées

---

## 10. Résumé ultra simple

Si vous voulez aller vite, faites ceci :

1. Pusher le code sur GitHub
2. Créer le backend Django sur Render
3. Créer le backend FastAPI sur Render
4. Créer le frontend sur Vercel
5. Ajouter les variables d’environnement
6. Vérifier que tout fonctionne

---

## 11. Conseils importants

- [ ] Ne jamais mettre les mots de passe dans le code
- [ ] Toujours utiliser des variables d’environnement
- [ ] Vérifier les logs après chaque déploiement
- [ ] Tester chaque service séparément
- [ ] Garder le dépôt Git à jour
