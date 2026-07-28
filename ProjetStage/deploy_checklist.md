# Checklist de déploiement prêt à copier-coller

Ce document regroupe les étapes exactes à suivre pour déployer le backend FastAPI et le frontend Next.js, avec les variables d’environnement et les commandes à utiliser.

---

## 1. Pré-requis

- [ ] Compte GitHub
- [ ] Compte Render
- [ ] Compte Vercel
- [ ] Dépôt GitHub du projet à jour
- [ ] Backend Django déjà déployé et accessible
- [ ] Dossier du projet prêt avec :
  - [ ] Backend_fastapi
  - [ ] frontend_next

---

## 2. Déployer le backend FastAPI sur Render

### 2.1. Créer le service Render

- [ ] Aller sur Render
- [ ] Cliquer sur New + puis Web Service
- [ ] Choisir le dépôt GitHub
- [ ] Sélectionner le dossier Backend_fastapi
- [ ] Choisir Python comme runtime

### 2.2. Configuration du service

- [ ] Name : nom du service FastAPI
- [ ] Region : choisir la région la plus proche
- [ ] Branch : main

Build Command :
```bash
pip install -r requirements.txt
```

Start Command :
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 2.3. Variables d’environnement à ajouter sur Render

```env
SECRET_KEY=remplace_par_une_valeur_longue_et_aleatoire
ADMIN_PASSWORD=change_me_admin_password
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALLOWED_ORIGINS=https://votre-app.vercel.app,http://localhost:3000,http://localhost:3001
FIGURES_DIR=./figures
PORT=8001
```

### 2.4. Vérification locale avant le push

Exécuter localement :
```bash
cd ProjetStage/Backend_fastapi
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

Tester ensuite :
```bash
curl http://localhost:8001/docs
curl http://localhost:8001/api/health
```

### 2.5. Vérification après déploiement

- [ ] Ouvrir l’URL Render du service FastAPI
- [ ] Vérifier que Swagger s’affiche sur /docs
- [ ] Vérifier que les routes API répondent
- [ ] Vérifier que l’upload fonctionne si vous l’utilisez

---

## 3. Déployer le frontend Next.js sur Vercel

### 3.1. Créer le projet Vercel

- [ ] Aller sur Vercel
- [ ] Cliquer sur Add New Project
- [ ] Importer le dépôt GitHub
- [ ] Sélectionner le dossier frontend_next
- [ ] Laisser les paramètres par défaut si tout est détecté
- [ ] Cliquer sur Deploy

### 3.2. Variables d’environnement à ajouter sur Vercel

```env
NEXT_PUBLIC_API_URL=https://votre-backend-django.onrender.com
NEXT_PUBLIC_EPL_API_URL=https://votre-backend-fastapi.onrender.com
```

### 3.3. Commandes locales à exécuter

```bash
cd ProjetStage/frontend_next
npm install
npm run dev
```

Pour vérifier la build locale :
```bash
npm run build
```

### 3.4. Vérification après déploiement

- [ ] Ouvrir l’URL Vercel
- [ ] Vérifier que la page d’accueil s’affiche
- [ ] Vérifier que les appels API fonctionnent
- [ ] Vérifier les images et les fichiers statiques

---

## 4. Configuration importante des URLs

### 4.1. Backend Django

Variable à utiliser côté frontend :
```env
NEXT_PUBLIC_API_URL=https://votre-backend-django.onrender.com
```

### 4.2. Backend FastAPI

Variable à utiliser côté frontend :
```env
NEXT_PUBLIC_EPL_API_URL=https://votre-backend-fastapi.onrender.com
```

Important :
- [ ] Le frontend doit utiliser l’URL racine du FastAPI
- [ ] Le code du frontend ajoute automatiquement /api
- [ ] Utiliser HTTPS en production

---

## 5. Corriger CORS et accès cross-origin

Sur le backend FastAPI, ajouter l’URL Vercel dans :
```env
ALLOWED_ORIGINS=https://votre-app.vercel.app,http://localhost:3000
```

Si vous avez un domaine personnalisé, ajoutez-le aussi :
```env
ALLOWED_ORIGINS=https://votre-app.vercel.app,https://www.votre-domaine.com,http://localhost:3000
```

---

## 6. Commandes de validation rapides

### Backend FastAPI
```bash
curl https://votre-backend-fastapi.onrender.com/docs
curl https://votre-backend-fastapi.onrender.com/api/health
```

### Frontend Next.js
```bash
curl https://votre-app.vercel.app
```

---

## 7. Erreurs fréquentes à vérifier

- [ ] 404 sur les routes API
- [ ] erreur CORS
- [ ] variables d’environnement mal renseignées
- [ ] mauvaise URL de backend
- [ ] service Render non démarré
- [ ] build failed sur Vercel
- [ ] dépendances non installées

---

## 8. Résumé ultra simple

1. Déployer le backend FastAPI sur Render
2. Ajouter les variables d’environnement FastAPI
3. Déployer le frontend Next.js sur Vercel
4. Ajouter les variables d’environnement frontend
5. Vérifier les URLs et CORS
6. Tester les pages et les API

---

## 9. Exemple prêt à copier-coller

### Render – Backend FastAPI
```env
SECRET_KEY=change_me_very_long_secret
ADMIN_PASSWORD=change_me_admin_password
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALLOWED_ORIGINS=https://mon-app.vercel.app,http://localhost:3000
FIGURES_DIR=./figures
PORT=8001
```

Build command :
```bash
pip install -r requirements.txt
```

Start command :
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Vercel – Frontend Next.js
```env
NEXT_PUBLIC_API_URL=https://mon-backend-django.onrender.com
NEXT_PUBLIC_EPL_API_URL=https://mon-backend-fastapi.onrender.com
```
