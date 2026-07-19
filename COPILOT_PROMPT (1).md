# 🎓 Prompt GitHub Copilot — Refonte Dashboard Analyse Académique

## Contexte du projet

Tu travailles sur un **dashboard web d'analyse de notes étudiantes** composé de :

- **`index.html`** — Interface HTML principale avec Tailwind CSS + thème dark/light
- **`app.js`** — Frontend JS vanilla gérant l'état, les filtres, les appels API, les graphiques, les tableaux et les modals
- **`api.py`** (FastAPI) — API REST Python exposant les endpoints `/dashboard/aggregates`, `/meta/disponibilites`, `/figures`, `/etudiants/:id/parcours`, etc.

**Données** : CSV avec colonnes `annee, semestre, anonymat, carte, ue, credit, nom_prenoms, sexe, filiere, cohorte, note`

- `annee` : année académique ex. `"2022-2023"`
- `cohorte` : année d'entrée dans l'école ex. `2022` (= promotion entrée en 2022-2023)
- `filiere` : `GC | GE | GM | IA | IS | LT`
- `note` : entre 0 et 20, seuil de réussite = 10

Analyses **déjà implémentées** : Vue globale, par année académique, par semestre, par cohorte, parcours individuel étudiant.

---

## 🎯 Objectif global

Refondre le dashboard pour le rendre **plus modulaire, plus riche analytiquement et plus intuitif**, selon les spécifications ci-dessous. Garder toute la logique existante (dark mode, KPIs, tableau UE, modal étudiant, recherche) et y greffer les nouvelles fonctionnalités.

---

## 📋 Spécifications détaillées

### 1. Chargement de données utilisateur (CSV upload)

**Comportement :**
- Au démarrage, charger les **données de démonstration** intégrées (le CSV généré dans `analyse.ipynb`) comme jeu de données par défaut.
- Afficher en haut de page un bouton **"📂 Charger mon CSV"** qui ouvre un `<input type="file" accept=".csv">`.
- Après upload, valider que le fichier contient bien toutes les colonnes requises : `annee, semestre, anonymat, ue, credit, nom_prenoms, sexe, filiere, cohorte, note`. Si une colonne manque, afficher un toast d'erreur avec la liste des colonnes manquantes.
- Si valide, remplacer les données actives par le CSV uploadé et recharger toute l'interface (métadonnées + filtres + dashboard).
- Côté API (Python/FastAPI) : ajouter un endpoint `POST /data/upload` qui accepte un fichier CSV multipart, le valide, le stocke en mémoire pour la session (remplace le DataFrame global) et retourne les métadonnées.

---

### 2. Nouvelles analyses à ajouter

Ajouter dans la sidebar et dans le système d'analyse les deux types suivants, **en plus** des analyses existantes (globale, par année, par semestre, par cohorte) :

#### 2a. Analyse Filière (département/filière)
- **Nom affiché** : "Analyse Filière"
- **Filtres disponibles** : Filière (obligatoire), Semestre (optionnel), Matière/UE (optionnel, multi-sélection)
- **Endpoint API** à créer : `GET /analyse/filiere?filiere=GC&semestre=1&ue=MTH101`
- Retourne les statistiques complètes (voir §3) pour la sélection.

#### 2b. Analyse Département (plusieurs filières)
- **Nom affiché** : "Analyse Département"
- **Filtres disponibles** : Filières (multi-sélection, ex. cocher GC + GE + GM), Semestre (optionnel)
- **Endpoint API** à créer : `GET /analyse/departement?filieres=GC,GE&semestre=2`
- Agrège les données des filières sélectionnées et retourne les statistiques complètes.

---

### 3. Tableau de statistiques complet

Chaque Content Area affiche un **tableau statistique structuré** en deux colonnes (Indicateur | Valeur).

**Statistiques à afficher (toutes les analyses) :**

| Indicateur | Clé API |
|---|---|
| Effectif total | `effectif` |
| Moyenne | `moyenne` |
| Médiane | `mediane` |
| Écart-type | `ecart_type` |
| Variance | `variance` |
| Minimum | `minimum` |
| Maximum | `maximum` |
| 1er Quartile (Q1) | `q1` |
| 3e Quartile (Q3) | `q3` |
| Intervalle interquartile (IQR) | `iqr` |
| Taux de réussite | `taux_reussite` |
| Nombre de reçus | `nombre_recus` |
| Nombre d'ajournés | `nombre_ajournes` |

**Côté API** : s'assurer que tous les endpoints `/dashboard/aggregates`, `/analyse/filiere`, `/analyse/departement` retournent ces champs. Utiliser `pandas.DataFrame.describe()` et `numpy.percentile()` pour Q1, Q3, IQR.

---

### 4. Bloc d'interprétation automatique

Sous le tableau de statistiques, afficher un bloc **"💬 Interprétation"** avec un fond coloré (vert si taux ≥ 70%, orange si 50–70%, rouge si < 50%).

**Règles de génération du texte (2 phrases max) :**
- Phrase 1 : résumer la performance globale (moyenne vs seuil, taux de réussite).
- Phrase 2 : signaler un point remarquable : fort écart-type (> 3.5 = hétérogénéité), très faible Q1 (< 7 = difficultés en bas du classement), ou résultat supérieur à la moyenne générale.

Exemple : *"La filière GC au semestre 2 affiche une moyenne de 11.3/20 avec un taux de réussite de 68%. L'écart-type élevé (4.1) indique une forte hétérogénéité des résultats."*

Générer ce texte côté frontend JS (pas besoin d'IA) à partir des statistiques retournées par l'API.

---

### 5. Sidebar rétractable avec navigation par analyse

**Structure de la sidebar :**
- La sidebar est **toujours visible** sur desktop, **rétractable** (toggle) sur mobile ET sur desktop via un bouton "◀ / ▶".
- Quand rétractée : largeur réduite à 48px, seules les icônes des analyses sont visibles (tooltips au hover).
- Quand déployée : largeur 256px, icône + nom de l'analyse.

**Liste des analyses dans la sidebar (avec icônes) :**
```
📊 Vue Globale
📅 Par Année
📆 Par Semestre
🎓 Par Cohorte
🏛️ Par Filière        ← NOUVEAU
🏢 Par Département    ← NOUVEAU
👤 Parcours Étudiant
```

- Cliquer sur une analyse **navigue directement** vers son Content Area (scroll + activation).
- L'analyse active est **mise en surbrillance** dans la sidebar.
- Ajouter un badge de compteur sur chaque analyse (ex. nombre de filières, nombre de cohortes) récupéré depuis `/meta/disponibilites`.

---

### 6. Structure du Content Area (pour chaque analyse)

Chaque analyse suit **strictement** cette structure verticale dans la page principale :

```
┌─────────────────────────────────────────────┐
│  [Titre de l'analyse]  (h2, bold)           │
├─────────────────────────────────────────────┤
│  [Zone Filtres]                             │
│  Listes déroulantes selon l'analyse         │
│  + bouton "Appliquer"                       │
├─────────────────────────────────────────────┤
│  [Tableau Statistiques Complet]             │
│  (voir §3)                                  │
├─────────────────────────────────────────────┤
│  [Bloc Interprétation]                      │
│  (voir §4)                                  │
├─────────────────────────────────────────────┤
│  [Graphiques]                               │
│  Grille responsive 2 colonnes               │
├─────────────────────────────────────────────┤
│  [Bouton "⚖️ Comparer"]                    │
└─────────────────────────────────────────────┘
```

Implémenter chaque analyse comme un **composant JS** avec sa propre fonction de rendu `renderAnalysis_<type>(filters)`.

---

### 7. Filtres en listes déroulantes par analyse

Chaque analyse a ses propres filtres dynamiques chargés depuis l'API. Voici la matrice complète :

| Analyse | Filtre 1 | Filtre 2 | Filtre 3 |
|---|---|---|---|
| Globale | — | — | — |
| Par Année | Année académique | — | — |
| Par Semestre | Semestre | — | — |
| Par Cohorte | Cohorte | Année (opt.) | Semestre (opt.) |
| **Par Filière** | **Filière** | **Semestre (opt.)** | **UE (opt., multi)** |
| **Par Département** | **Filières (multi)** | **Semestre (opt.)** | — |

**Comportement des listes déroulantes :**
- Populer dynamiquement depuis `/meta/disponibilites` au chargement.
- Les filtres optionnels affichent "Tous" par défaut.
- Pour les multi-sélections (UE, Filières département) : utiliser des checkboxes dans un dropdown custom, ou un `<select multiple>` stylisé.
- Enchaînement : si on change la Cohorte, recharger les Années disponibles ; si on change l'Année, recharger les Semestres.

---

### 8. Fonctionnalité "Comparer"

#### 8a. Déclenchement
Chaque Content Area a un bouton **"⚖️ Comparer"** en bas. Cliquer ouvre une **modale de comparaison**.

#### 8b. Modale de sélection
La modale affiche :
- Le titre "Comparer avec…"
- La liste des entités disponibles pour ce type d'analyse (ex. pour Filière : toutes les filières sauf celle déjà sélectionnée).
- Des **checkboxes** pour sélectionner 1 à N entités à comparer.
- Un bouton **"OK – Comparer"** et un bouton **"Annuler"**.

#### 8c. Tableau de comparaison
Après confirmation, remplacer (ou afficher sous) le Content Area un **tableau de comparaison** :

| Filière / Métrique | Moyenne | Médiane | Q1 | Q3 | Écart-type | Taux réussite | Effectif |
|---|---|---|---|---|---|---|---|
| GC (sélection) | 11.3 | 11.0 | 8.2 | 14.1 | 3.8 | 68% | 245 |
| GE | 12.1 | 12.3 | 9.5 | 15.0 | 3.2 | 74% | 198 |
| GM | 10.2 | 10.5 | 7.1 | 13.2 | 4.1 | 55% | 167 |

- La **ligne de la sélection courante** est mise en surbrillance (fond bleu clair).
- Ajouter une ligne de **différence** (Δ) entre la sélection et chaque comparant pour Moyenne et Taux réussite.
- Un bouton **"📥 Exporter CSV"** en bas du tableau de comparaison.
- L'API doit supporter un endpoint batch : `GET /analyse/filiere/batch?filieres=GC,GE,GM&semestre=2` retournant un tableau de statistiques par filière.

---

## 🗂️ Fichiers à modifier / créer

```
projet/
├── index.html          ← Modifier : restructurer en sections par analyse, sidebar toggle
├── app.js              ← Modifier : ajouter renderAnalysis_*, modale comparaison, upload CSV
├── styles.css          ← Modifier : sidebar rétractable, tableau stats, bloc interprétation
├── api.py              ← Modifier : nouveaux endpoints /analyse/filiere, /departement, /data/upload
└── data/
    └── donnees_demo.csv  ← Garder tel quel comme données de démo
```

---

## ✅ Contraintes techniques

- **Aucun émoji ni émoticône** dans le code généré : ni dans les labels HTML, ni dans les textes JS, ni dans les commentaires, ni dans les valeurs Python. Utiliser uniquement du texte brut.

- **Ne pas casser** l'existant : dark mode, KPIs, tableau UE paginé, modal parcours étudiant, toast notifications, recherche étudiant.
- Tailwind CSS uniquement pour le style (pas de framework JS additionnel).
- JS vanilla (pas de React/Vue) — organiser en modules de fonctions claires.
- Python FastAPI — utiliser `pandas` et `numpy` pour les calculs statistiques.
- L'API doit rester **stateless** par requête (les données sont en mémoire côté serveur, référencées par session ou globalement).
- Responsive : sidebar rétractée sur mobile par défaut, déployée sur desktop (`md:` breakpoint).
- Accessibilité : attributs `aria-label` sur tous les boutons icônes, `role="dialog"` sur les modales.

---

## 🚀 Plan d'implémentation suggéré (ordre)

1. **API** : Ajouter `q1`, `q3`, `iqr`, `minimum`, `maximum` à tous les endpoints existants.
2. **API** : Créer `POST /data/upload` avec validation des colonnes.
3. **API** : Créer `GET /analyse/filiere` et `GET /analyse/departement`.
4. **API** : Créer `GET /analyse/filiere/batch` et `GET /analyse/departement/batch` pour la comparaison.
5. **Frontend** : Refactoriser `app.js` — créer une fonction `renderAnalysisSection(type, containerId)` générique.
6. **Frontend** : Implémenter la sidebar rétractable avec toggle button.
7. **Frontend** : Implémenter le tableau stats complet + bloc interprétation dans chaque section.
8. **Frontend** : Ajouter les sections Filière et Département dans `index.html` + sidebar.
9. **Frontend** : Implémenter la modale de comparaison + tableau de résultats.
10. **Frontend** : Implémenter le bouton upload CSV + validation + rechargement.
