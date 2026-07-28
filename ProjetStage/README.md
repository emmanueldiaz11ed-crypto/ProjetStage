# EPL_PEDAGO - Plateforme de Gestion Pédagogique


**Application web de gestion des inscriptions pédagogiques et des notes pour l'EPL**  


##  Description

EPL_PEDAGO est une plateforme sécurisée permettant :
- Aux **étudiants** de s'inscrire aux Unités d'Enseignement (UE)
- Aux **enseignants** de saisir les notes et gérer leur profil académique
- Au **secrétariat** de superviser les inscriptions
- À l'**administration** de gérer les données pédagogiques

**Contexte** : Projet réalisé dans le cadre de stage en Licence Professionnelle  Génie Logiciel à l'EPL(2024-2025)

Structure du projet

Le projet est divisé en deux dossiers principaux :

Backend_django/ : Contient l'API backend développée avec Django.

next_fronend/ : Contient le code du frontend développé avec Next.js.

##  Structure du projet

   ProjetStage/
├── Backend_django/                         # API Django (Python)
│ ├── Backend_django/                       # Configuration du projet
│ ├── apps/                                 # Applications 
| |     ├──inscription_pedagogique
| |     ├──page_professeur
| |     |__utilisateur 
| |
│ |__ manage.py
│
├── env                                 # environnement virtuel de django
├── frontend_next/                      # Application frontend Next.js
│ ├── components/
│ ├── public/
│ ├── src/
│       ├── styles/
 |      └── pages
│ └── package.json
└── README.md
└── requirements.txt

###  Structure des apps Django

| App | Rôle |
|-----|------|
| `utilisateurs` | Gestion des comptes utilisateurs et des connexions |
| `inscription_pedagogique` | Inscriptions, filières, parcours, années |
| `page_prof_et_notes` | UE, notes, articles, projets, évaluations |


##  Fonctionnalités principales

###  Espace Étudiant
- Inscription pédagogique en ligne aux UE
- Consultation de l'historique des inscriptions
- Visualisation des pages enseignants

###  Espace Enseignant
- Saisie des notes (devoirs, examens, projets)
- Gestion du profil académique (publications, recherches)
- Visualisation des listes d'étudiants par UE

###  Espace Secrétariat
- Modification/correction des inscriptions
- Gestion des périodes d'inscription
- Export des listes pour composition

###  Espace Administrateur
- Gestion des comptes et permissions
- Supervision des activités (logs)
- Tableaux de bord statistiques


## Technologies utilisées 

 **Frontend**  : Next.js        
 **Backend**   : Django, Django REST Framework         
 **Base de données**  :postgreSQL                       |
 **Sécurité**   :  HTTPS, Django Auth,Intranet 
 **Authentification** : système d’utilisateurs personnalisé (étudiant, prof, admin, secrétaire, etc.)
 **API** : CRUD complet avec DRF (Django REST Framework)
 **Architecture** : découpage modulaire en apps Django



## Installation rapide

### Prérequis
- Python 3.10+
- Node.js 18+
- PostgreSQL 17

### Backend (Django)
cd ../Django_Backend/projetEpl
pip install -r requirements.txt ou py -m pip install -r requirements.txt

python manage.py migrate
python manage.py runserver

### Frontend (Next.js)
cd ../next_frontend
npm install
npm run dev
L’interface sera accessible sur : [http://localhost:3000](http://localhost:3000)


##  À venir

- Authentification JWT sécurisée
- Interface admin moderne avec Next.js
- Export PDF des résultats
- Notifications et gestion des périodes

## Auteurs
    AGBEGNINOU Akossiwa Léna
    ZODJIHOUE Abla Thibaute
    *Étudiantes en Licence Professionnelle Génie Logiciel - EPL 2024/2025*

## Licence
Projet académique à usage pédagogique – non destiné à la production commerciale.



