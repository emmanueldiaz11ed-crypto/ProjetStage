# Guide de déploiement sur Render et Vercel

Ce document explique comment déployer le projet EPL_PEDAGO sur deux plateformes différentes :
- Render pour le backend Django et le backend FastAPI,
- Vercel pour le frontend Next.js.

L’objectif est de permettre un déploiement simple, propre et maintenable, même pour une première mise en production.

---

## 1. Présentation générale

Le projet est composé de trois parties :
- un frontend Next.js,
- un backend Django,
- un backend FastAPI.

### Déploiement recommandé
- Frontend : Vercel
- Backend Django : Render
- Backend FastAPI : Render

Cette séparation permet de profiter des avantages de chaque plateforme :
- Vercel est très adapté au frontend Next.js,
- Render est pratique pour déployer des services Python avec simplicité.

---

## 2. Pré-requis

Avant de commencer, il faut avoir :
- un compte GitHub,
- un compte Render,
- un compte Vercel,
- le dépôt Git du projet hébergé sur GitHub,
- une base de données PostgreSQL si le backend Django en a besoin.

Il est fortement conseillé d’avoir déjà testé le projet localement avant le déploiement.

---

## 3. Déployer le backend Django sur Render

### 3.1. Préparer le dépôt

Assurez-vous que votre projet contient :
- le dossier Backend_django/
- le fichier requirements.txt à la racine du backend Django ou dans le bon dossier,
- un fichier de configuration adapté à l’environnement de production.

### 3.2. Créer un service Web sur Render

1. Se connecter à Render.
2. Cliquer sur New + puis Web Service.
3. Choisir le dépôt GitHub contenant le projet.
4. Sélectionner le dossier correspondant au backend Django.
5. Choisir le runtime Python.

### 3.3. Configuration du service

Dans la page de configuration du service, renseigner :
- Name : nom du service Django,
- Region : région la plus proche de vos utilisateurs,
- Branch : branche à déployer (généralement main),
- Build Command :

```bash
pip install -r requirements.txt
```

- Start Command :

```bash
gunicorn Backend_django.wsgi:application --bind 0.0.0.0:$PORT
```

Si votre projet Django est situé dans un sous-dossier spécifique, il faut adapter la commande en fonction de la structure exacte.

### 3.4. Variables d’environnement Django

Ajouter dans Render les variables d’environnement suivantes :

```env
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-app-name.onrender.com,localhost,127.0.0.1
DATABASE_URL=postgres://user:password@host:port/dbname
```

Si votre projet utilise un fichier settings.py classique, il faut vérifier que les variables sont bien lues depuis l’environnement.

### 3.5. Base de données PostgreSQL

Render propose des bases PostgreSQL. Il est conseillé de créer une base PostgreSQL sur Render et de récupérer son URL.

Ensuite, ajouter la variable :

```env
DATABASE_URL=postgres://... 
```

### 3.6. Migrations et collecte des fichiers statiques

Render ne fait pas automatiquement toutes les opérations de maintenance. Il faut donc ajouter une commande de build ou un script de préparation.

Exemple de Build Command adapté :

```bash
pip install -r requirements.txt && python manage.py collectstatic --noinput
```

Pour les migrations, il faut soit :
- les exécuter manuellement depuis la console Render,
- soit les intégrer dans un script de déploiement si nécessaire.

Commande à exécuter dans la console Render :

```bash
python manage.py migrate
```

### 3.7. Créer un superutilisateur

Si vous avez besoin d’un accès administrateur, exécuter :

```bash
python manage.py createsuperuser
```

### 3.8. Vérification finale

Une fois le service déployé, ouvrir l’URL Render fournie par la plateforme. Vérifier que :
- l’application se charge correctement,
- les API répondent,
- la base de données est bien connectée.

---

## 4. Déployer le backend FastAPI sur Render

### 4.1. Créer un second service Web

1. Dans Render, cliquer sur New + puis Web Service.
2. Sélectionner le dépôt GitHub.
3. Choisir le dossier du backend FastAPI.
4. Choisir le runtime Python.

### 4.2. Configuration du service

- Name : nom du service FastAPI,
- Region : même région que le backend Django si possible,
- Build Command :

```bash
pip install -r requirements.txt
```

- Start Command :

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 4.3. Variables d’environnement FastAPI

Ajouter les variables nécessaires, par exemple :

```env
ENVIRONMENT=production
PORT=10000
```

Si votre application attend d’autres variables, les ajouter ici.

### 4.4. Vérification finale

Après le déploiement, ouvrir l’URL Render du service FastAPI. Vérifier que :
- la documentation Swagger est accessible,
- l’endpoint de santé répond,
- l’upload fonctionne correctement.

Si vous utilisez l’URL de l’API dans le frontend, il faudra la mettre à jour dans les variables d’environnement du frontend.

---

## 5. Déployer le frontend Next.js sur Vercel

### 5.1. Préparer le frontend

Avant le déploiement, vérifier que le frontend est prêt pour la production.

Assurez-vous que :
- le projet contient le fichier package.json,
- les dépendances sont correctement listées,
- les variables d’environnement sont bien définies.

### 5.2. Connecter le dépôt GitHub à Vercel

1. Se connecter à Vercel.
2. Cliquer sur Add New Project.
3. Importer le dépôt GitHub.
4. Sélectionner le dossier frontend_next.

### 5.3. Configuration du projet

Vercel détecte automatiquement qu’il s’agit d’un projet Next.js. Il suffit généralement de valider les paramètres par défaut.

### 5.4. Variables d’environnement Vercel

Ajouter les variables suivantes dans Vercel :

```env
NEXT_PUBLIC_API_URL=https://your-django-service.onrender.com/api
NEXT_PUBLIC_EPL_API_URL=https://your-fastapi-service.onrender.com
```

Les noms exacts doivent correspondre à ceux utilisés dans le code du frontend.

### 5.5. Déployer

Cliquer sur Deploy. Vercel va alors :
- installer les dépendances,
- construire l’application Next.js,
- déployer l’application.

### 5.6. Vérification finale

Une fois le déploiement terminé :
- ouvrir l’URL Vercel,
- vérifier que la page d’accueil s’affiche,
- tester les appels API depuis le frontend.

---

## 6. Relier le frontend aux backends déployés

Après avoir déployé les services, il faut vérifier que le frontend appelle bien les bonnes URLs.

### Exemple de configuration

Dans le frontend, les variables doivent pointer vers :
- le backend Django pour les endpoints métier,
- le backend FastAPI pour les endpoints de données et d’analyse.

Exemple :

```env
NEXT_PUBLIC_API_URL=https://your-django-service.onrender.com/api
NEXT_PUBLIC_EPL_API_URL=https://your-fastapi-service.onrender.com
```

Si le frontend utilise une URL unique, il faut veiller à ce qu’elle corresponde au bon service.

---

## 7. Gestion des CORS

Une erreur fréquente en production est liée aux erreurs CORS.

Il faut donc configurer correctement les origines autorisées dans les backends.

### Django
Ajouter l’URL Vercel dans les domaines autorisés si nécessaire.

Exemple :

```python
ALLOWED_HOSTS = ["your-domain.com", "your-app.vercel.app"]
```

### FastAPI
Ajouter l’origine du frontend dans la configuration CORS.

Exemple :

```python
allow_origins=["https://your-app.vercel.app"]
```

---

## 8. Déployer avec HTTPS

Vercel fournit automatiquement HTTPS.

Render fournit aussi HTTPS pour les services Web.

Il est donc conseillé de toujours utiliser les URL HTTPS fournies par les plateformes plutôt que des URLs HTTP.

---

## 9. Vérifications essentielles avant de considérer le déploiement comme réussi

Voici la checklist minimale :

### Backend Django
- [ ] le service Render est en ligne,
- [ ] les migrations ont été appliquées,
- [ ] la base de données est connectée,
- [ ] l’API répond,
- [ ] l’interface d’administration fonctionne si nécessaire.

### Backend FastAPI
- [ ] le service Render est en ligne,
- [ ] la documentation Swagger est accessible,
- [ ] l’endpoint de santé répond,
- [ ] l’upload de fichier fonctionne,
- [ ] les erreurs CORS sont corrigées.

### Frontend Next.js
- [ ] le site Vercel est bien déployé,
- [ ] la page d’accueil s’affiche,
- [ ] les appels API fonctionnent,
- [ ] les images et assets sont bien chargés.

---

## 10. Dépannage courant

### Problème : le frontend ne charge pas les données
Vérifier :
- les variables d’environnement Vercel,
- l’URL du backend,
- la configuration CORS,
- la disponibilité du service Render.

### Problème : Django ne démarre pas
Vérifier :
- la commande de démarrage,
- les variables d’environnement,
- la base de données,
- les dépendances Python.

### Problème : FastAPI ne répond pas
Vérifier :
- la commande start command,
- les dépendances installées,
- la variable PORT,
- l’URL publique Render.

### Problème : erreur 404 ou 500 sur les routes API
Vérifier :
- les bons préfixes de routes,
- les chemins d’URL dans le frontend,
- la configuration du reverse proxy ou des services.

---

## 11. Conseils importants

- Toujours utiliser des variables d’environnement pour les secrets.
- Ne jamais stocker les mots de passe ou clés dans le code source.
- Déployer d’abord en mode test puis valider en production.
- Vérifier les logs Render et Vercel après chaque déploiement.
- Garder une copie du dépôt Git bien à jour.

---

## 12. Résumé rapide

Pour déployer ce projet sur Render et Vercel :
1. héberger le code sur GitHub,
2. créer un service Django sur Render,
3. créer un service FastAPI sur Render,
4. créer un projet Next.js sur Vercel,
5. configurer les variables d’environnement,
6. relier le frontend aux services déployés,
7. vérifier les API et la sécurité,
8. valider le fonctionnement complet.

---

## Conclusion

Le déploiement sur Render et Vercel est une solution moderne, simple et efficace pour mettre en production la plateforme EPL_PEDAGO. Avec une bonne configuration des variables d’environnement, des services et des URLs, l’application peut être rendue accessible à distance de manière stable et professionnelle.
