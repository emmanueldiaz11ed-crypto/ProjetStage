Description détaillée des pages de l’interface

L’interface est organisée en pages complémentaires, chacune alimentée par un sous-ensemble d’endpoints de l’API. Les filtres appliqués sont communs à presque toutes les vues et correspondent aux paramètres suivants : année, semestre, cohorte, sexe, UE, filière, département, type de formation et niveau.

### Vue globale (Dashboard)
- Endpoint principal : GET /api/dashboard/aggregates
- Filtres disponibles : année, semestre, cohorte, sexe, UE, filière, département, type de formation, niveau.
- Indicateurs affichés : moyenne générale, taux de réussite global, médiane, écart-type, variance, Q1, Q3, IQR, effectif total, nombre d’étudiants à risque.
- Graphiques présents : boxplot global, histogramme de distribution des notes, boxplot par sexe, taux de réussite global, courbe par cohorte (si une cohorte est sélectionnée), donut de réussite/échec, validation globale.
- Tableaux présents : Top 10 des UEs selon le meilleur taux de réussite, Bottom 10 des UEs selon le plus faible taux, tableau des étudiants à risque, tableau des UEs difficiles.
- Complément : les figures sont chargées via GET /api/figures avec le paramètre view correspondant (donut, histogram, boxplot, boxplot_by_sex, validation_global, courbe_cohortes).

### Vue Département
- Endpoint principal : GET /api/dashboard/aggregates avec filtre département actif, complété par GET /api/figures.
- Filtres disponibles : même jeu de filtres que la vue globale, avec un filtre supplémentaire sur le département sélectionné via l’onglet.
- Indicateurs affichés : moyenne, taux de réussite, médiane, écart-type, Q1/Q3, IQR, nombre d’UE enseignées, effectif.
- Graphiques présents : radar comparatif des filières, heatmap filières × semestres, courbe d’évolution par cohorte.
- Tableau/visualisation : classement des départements sous forme de barres de performance comparatives.

### Vue Filière
- Endpoints principaux : GET /api/meta/disponibilites pour lister les filières disponibles, puis GET /api/dashboard/aggregates avec filtre filière.
- Filtres disponibles : filtres globaux complétés par la filière sélectionnée dans la barre de navigation.
- Indicateurs affichés : département de rattachement, moyenne, taux de réussite, médiane, écart-type, Q1/Q3, IQR, effectif.
- Graphiques présents : évolution des moyennes par sexe, distribution des notes par sexe.
- Tableau présent : tableau paginé des UEs de la filière avec colonnes Code UE, semestre, crédits, moyenne, taux de réussite, effectif et statut.

### Vue UE
- Endpoints principaux : GET /api/meta/ues pour charger la liste des UEs, GET /api/ues/{code}/stats pour le détail d’une UE, et GET /api/dashboard/aggregates pour alimenter les tableaux de synthèse.
- Filtres disponibles : année, semestre, cohorte, sexe, filière, département, type de formation, niveau, avec la sélection d’une UE précise.
- Indicateurs affichés : moyenne, taux de réussite, médiane, écart-type, variance, Q1/Q3, IQR, min/max, effectif, crédits ECTS, semestre, nombre d’admis et d’ajournés.
- Graphiques présents : donut de réussite/échec, histogramme des notes, boxplot de la distribution.
- Tableaux présents : tableau Top 10 des UEs les plus performantes et Bottom 10 des UEs les plus faibles, accessibles depuis la vue UE.

### Vue Étudiant
- Endpoint principal : GET /api/etudiants/{id}/parcours.
- Filtres disponibles : filtres globaux appliqués à la recherche, permettant d’isoler un étudiant dans un sous-ensemble académique donné.
- Indicateurs affichés : moyenne globale, crédits validés / crédits totaux, taux de réussite, rang dans la cohorte.
- Graphiques présents : courbe d’évolution de l’étudiant comparée à sa cohorte.
- Tableaux présents : parcours semestriel détaillé par UE, ainsi que classement paginé des étudiants de la cohorte à risque.

### Vue Comparaison
- Endpoint principal : GET /api/compare.
- Filtres disponibles : filtres globaux, plus le type d’entité à comparer (filière, département ou UE) et la liste des entités sélectionnées.
- Indicateurs affichés : moyenne, taux de réussite, médiane, écart-type, variance, Q1/Q3, IQR, min, max, effectif, nombre d’UE.
- Graphiques présents : barres comparatives visuelles de plusieurs métriques.
- Tableau présent : tableau comparatif multicritères avec une colonne par entité sélectionnée.