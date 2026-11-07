# Olympic Games App - Architecture

## Arborescence

```text
src/app/
  ├── core/
  │   ├── models/
  │   │   ├── Kpi.ts
  │   │   ├── olympic.model.ts
  │   │   └── participation.model.ts
  │   └── services/
  │       └── data.service.ts
  ├── components/
  │   ├── button/button.component.*
  │   ├── country-chart/country-chart.component.*
  │   ├── country-detail/country-detail.component.*
  │   ├── dashboard/dashboard.component.*
  │   ├── header/header.component.*
  │   ├── kpi/kpi.component.*
  │   ├── kpi-list/kpi-list.component.*
  │   └── medals-chart/medals-chart.component.*
  ├── pages/
  │   ├── country/country.component.*
  │   ├── home/home.component.*
  │   └── not-found/not-found.component.*
  ├── app-routing.module.ts
  ├── app.module.ts
  └── app.component.*

```

Pour chaque composant, `component.*` regroupe les fichiers `.ts`, `.html`, `.scss` et `.spec.ts`.

## Rôles et responsabilités

L’architecture sépare les écrans associés aux routes, les composants de présentation, l’accès aux données et les types de données.

### Dossiers

| Dossier | Rôle et responsabilités |
|---|---|
| `src/app/` | Contenir le code Angular et la configuration de navigation. |
| `src/app/core/` | Regrouper les modèles et le service de données utilisés par les pages. |
| `src/app/core/models/` | Décrire les structures et les types des données. |
| `src/app/core/services/` | Centraliser le chargement, le partage et la recherche des données. |
| `src/app/components/` | Regrouper les éléments de présentation et les assemblages de composants. Ils reçoivent leurs paramètres par des `@Input`. |
| `src/app/pages/` | Contenir les écrans associés aux routes. Les pages demandent les données, calculent les indicateurs, gèrent les graphiques Chart.js et la navigation. |

### Composants de présentation

Les composants de `components/` sont autonomes (`standalone: true`). Ils ne chargent pas les données depuis `DataService`.

| Dossier et fichier principal | Rôle | Responsabilités actuelles |
|---|---|---|
| `header/header.component.ts` | Afficher l’en-tête commun | Afficher le titre de l’application et le titre de la page reçu par `titlePage`. |
| `kpi/kpi.component.ts` | Afficher un indicateur | Recevoir un objet `Kpi` et afficher son libellé et sa valeur. |
| `kpi-list/kpi-list.component.ts` | Afficher une liste d’indicateurs | Recevoir `kpiList` et créer un `app-kpi` pour chaque élément. |
| `button/button.component.ts` | Fournir un lien avec une apparence de bouton | Recevoir `label` et `link` obligatoires ; naviguer avec `RouterLink`. Appliquer les `classes` facultatives, fournies comme chaîne ou tableau de chaînes. |
| `medals-chart/medals-chart.component.ts` | Fournir le support du graphique global | Recevoir `chartId` et afficher le `<canvas>` correspondant. La page `home` crée et détruit le graphique Chart.js. |
| `country-chart/country-chart.component.ts` | Fournir le support du graphique d’un pays | Recevoir `chartId` et afficher le `<canvas>` avec son conteneur. Ce composant n’est pas encore utilisé par la page `country`. |
| `dashboard/dashboard.component.ts` | Assembler la présentation de la vue d’ensemble | Recevoir `kpiList` et `chartId`, puis les transmettre à `app-kpi-list` et `app-medals-chart`. Il est utilisé par la page `home`. |
| `country-detail/country-detail.component.ts` | Assembler la présentation du détail d’un pays | Recevoir `kpiList` et `chartId`, puis les transmettre à `app-kpi-list` et `app-country-chart`. Il n’est pas encore utilisé par la page `country`. |

### Fichiers d’un composant

Cette répartition s’applique aux composants de présentation, aux pages et au composant racine.

| Fichier | Rôle et responsabilités |
|---|---|
| `nom.component.ts` | Déclarer le sélecteur, les imports, le template et les styles ; définir les entrées, les propriétés, les méthodes et les éventuels hooks du cycle de vie. |
| `nom.component.html` | Décrire la structure affichée, les liaisons de données, les interactions et les composants enfants. |
| `nom.component.scss` | Définir les styles propres au composant : disposition, couleurs, espacements et adaptation aux écrans. |
| `nom.component.spec.ts` | Contenir les tests automatisés du composant. Les tests existants vérifient principalement sa création. |

### Pages et navigation

Une page est un composant Angular qui représente un écran accessible par une URL.

| Dossier et fichier principal | Route | Responsabilités actuelles |
|---|---|---|
| `home/home.component.ts` | `/` | Charger les pays, calculer le nombre de pays, le nombre d’éditions et les médailles par pays. Alimenter `app-dashboard`, créer le graphique circulaire et naviguer vers le pays sélectionné. Détruire le graphique à la sortie de la page. |
| `country/country.component.ts` | `/country/:id` | Observer et valider l’identifiant, rechercher le pays, calculer ses participations, médailles et athlètes. Créer le graphique par année et le détruire à la sortie. Rediriger vers `/not-found` si le pays est absent ou l’identifiant invalide. |
| `not-found/not-found.component.ts` | `/not-found` et toute URL inconnue | Afficher un message de page introuvable et un bouton de retour vers l’accueil. |

La page `country` affiche encore directement ses indicateurs et son `<canvas>` dans son template. Elle utilise `app-header` et `app-button`, mais pas encore `app-country-detail`. Sa méthode `buildKpiList()` est encore vide.


### Modèles

| Fichier | Rôle et responsabilités |
|---|---|
| `core/models/Kpi.ts` | Définir le type `Kpi` utilisé pour les indicateurs affichés. |
| `core/models/olympic.model.ts` | Définir l’interface `Olympic` : identifiant, nom du pays et liste de participations. |
| `core/models/participation.model.ts` | Définir l’interface `Participation` : identifiant, année, ville, nombre de médailles et nombre d’athlètes. |

Un pays possède plusieurs participations. Les modèles décrivent les types attendus ; ils ne valident pas le JSON à l’exécution.


## Parcours des données et navigation

1. Le routeur affiche `HomeComponent` pour `/`.
2. La page s’abonne à `DataService.getCountries()` ; le service charge et partage les données du fichier JSON.
3. La page calcule les indicateurs et les totaux de médailles.
4. `DashboardComponent` transmet les indicateurs à `KpiListComponent` et l’identifiant du canvas à `MedalsChartComponent`.
5. `HomeComponent` crée le graphique Chart.js sur ce canvas et gère le clic sur un pays.
6. Le clic ouvre `/country/:id`, associé à `CountryComponent`.
7. Cette page récupère le pays avec `getCountryById()`, prépare ses indicateurs et crée son graphique sur le canvas de son propre template.
8. Le bouton « Go back » utilise `RouterLink` pour revenir à `/`.

## Service et accès aux données

### Responsabilité de DataService

`DataService` centralise l’accès aux données olympiques. Les pages utilisent ce service pour obtenir les données, puis calculent les indicateurs et préparent les graphiques.

Le service est déclaré avec `@Injectable({ providedIn: 'root' })`. Angular fournit une instance partagée à l’échelle de
l’application : il joue le rôle de **singleton**.

### Source et structure des données

Les données proviennent du fichier local JSON, chargé par une requête HTTP GET à l’adresse `./assets/mock/olympic.json`.

`HttpClient` est injecté dans le constructeur du service.

Les interfaces TypeScript décrivent la structure de données attendue :
- `Olympic` : identifiant du pays, nom et liste de participations.
- `Participation` : identifiant de la participation, année, ville,
  nombre de médailles et nombre d’athlètes.

### Chargement, partage et mise en cache des données

Le constructeur prépare les données `countries$` de type
`Observable<Olympic[]>`. La requête démarre au premier abonnement,
et non à la création du service.

L’opérateur `shareReplay({ bufferSize: 1, refCount: true })` permet :
- de partager une même requête entre les abonnés ;
- de conserver la dernière réponse après un chargement réussi ;
- de transmettre cette réponse aux abonnés suivants sans recharger
  le fichier.

Si tous les abonnés se désabonnent avant la fin du chargement,
`refCount: true` permet d’interrompre la requête en cours.
Un nouvel abonnement peut alors déclencher un nouveau chargement.

Ce cache est conservé en mémoire et disparaît au rechargement
de l’application.

### Méthodes disponibles

| Méthode | Résultat |
|---|---|
| `getCountries(): Observable<Olympic[]>` | Fournit la liste des pays et leurs participations. |
| `getCountryById(id: number): Observable<Olympic \| undefined>` | Fournit le pays correspondant, ou `undefined` s’il est absent. |

`getCountryById()` réutilise les données renvoyées par `getCountries()`. `map` et `find` permettent de filtrer le pays recherché. Cette recherche ne crée pas de requête HTTP distincte : elle réutilise le chargement partagé et sa réponse mise en cache.

### Utilisation par les pages

`HomeComponent` s’abonne à `getCountries()`. Il effectue les calculs pour construire le graphique global.

`CountryComponent` observe les paramètres de la route. 
- Il convertit la valeur reçue en identifiant numérique et appelle `getCountryById()`. 
- `switchMap` permet de remplacer la recherche précédente lorsque le paramètre change. 

Les deux pages utilisent `takeUntilDestroyed` pour arrêter leur abonnement à leur destruction.

### Erreurs et absence de résultat

Le service transmet les erreurs HTTP aux pages, qui conservent le message dans leur propriété `error`. Leur affichage reste à implémenter.

Un pays absent renvoie `undefined` : ce cas est distinct d’une erreur HTTP. La page `country` redirige alors vers `/not-found`, comme pour un identifiant invalide.
