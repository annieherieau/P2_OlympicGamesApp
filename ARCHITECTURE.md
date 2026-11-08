# Olympic Games App - Architecture

## Arborescence

```text
src/app/
  ├── core/
  │   ├── models/
  │   │   ├── Kpi.ts
  │   │   ├── olympic.model.ts
  │   │   ├── page-state.ts
  │   │   └── participation.model.ts
  │   └── services/
  │       └── data.service.ts
  ├── components/
  │   ├── button/button.component.*
  │   ├── country-chart/country-chart.component.*
  │   ├── country-detail/country-detail.component.*
  │   ├── dashboard/dashboard.component.*
  │   ├── error/error.component.*
  │   ├── header/header.component.*
  │   ├── kpi/kpi.component.*
  │   ├── kpi-list/kpi-list.component.*
  │   ├── medals-chart/medals-chart.component.*
  │   └── spinner/spinner.component.*
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

| Dossier                  | Rôle et responsabilités                                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/`               | Contenir le code Angular et la configuration de navigation.                                                                             |
| `src/app/core/`          | Regrouper les modèles et le service de données utilisés par les pages.                                                                  |
| `src/app/core/models/`   | Décrire les structures et les types des données.                                                                                        |
| `src/app/core/services/` | Centraliser le chargement, le partage et la recherche des données.                                                                      |
| `src/app/components/`    | Regrouper les éléments de présentation et les assemblages de composants. Ils reçoivent leurs paramètres par des `@Input`.               |
| `src/app/pages/`         | Contenir les écrans associés aux routes. Les pages demandent les données, calculent les indicateurs, gèrent les états et la navigation. |

### Pages et navigation

Une page est un composant Angular qui représente un écran accessible par une URL.

| Dossier et fichier principal       | Route                                     | Responsabilités actuelles                                                                                            |
| ---------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `home/home.component.ts`           | `/`                                       | Charger les pays, calculer les KPI, gérer l’état et naviguer vers un pays                                            |
| `country/country.component.ts`     | `/country/:id`                            | Lire l’identifiant, charger le pays, calculer les KPI et gérer l’état. Renvoyer à not-found si le pays n'existe pas. |
| `not-found/not-found.component.ts` | `/not-found/:error` et toute URL inconnue | Afficher un message de page introuvable et un bouton de retour vers l’accueil.                                       |

### Composants de présentation

Les composants de `components/` sont autonomes (`standalone: true`). Ils ne chargent pas les données depuis `DataService`.

| Dossier et fichier principal                 | Rôle                                           | Responsabilités actuelles                                       |
| -------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------- |
| `header/header.component.ts`                 | Afficher l’en-tête commun                      | Afficher le titre de l’application et le titre de la page.      |
| `kpi/kpi.component.ts`                       | Afficher un indicateur                         | Afficher son libellé et sa valeur.                              |
| `kpi-list/kpi-list.component.ts`             | Afficher une liste d’indicateurs               | Recevoir et affichier une liste d'indicateurs                   |
| `button/button.component.ts`                 | Fournir un lien avec une apparence de bouton   | Naviguer avec `RouterLink`                                      |
| `medals-chart/medals-chart.component.ts`     | Afficher le graphique global                   | Construire le camembert et émettre l’identifiant du pays cliqué |
| `country-chart/country-chart.component.ts`   | Afficher le graphique d’un pays                | Construire la courbe                                            |
| `dashboard/dashboard.component.ts`           | Assembler la présentation de la vue d’ensemble | Transmettre les données au graphique et les KPI à leur liste    |
| `country-detail/country-detail.component.ts` | Assembler la présentation du détail d’un pays  | Transmettre les participations au graphique                     |

### Modèles

| Fichier                  | Rôle et responsabilités                                      |
| ------------------------ | ------------------------------------------------------------ |
| `Kpi.ts`                 | Définir le type `Kpi` utilisé pour les indicateurs affichés. |
| `olympic.model.ts`       | Définir le modèle de données des pays.                       |
| `participation.model.ts` | Définir le modèle de données des participations              |
| `page-state.model.ts`    | Définir les états utilisées par les pages                    |

Un pays possède plusieurs participations. Les modèles décrivent les types attendus ; ils ne valident pas le JSON à l’exécution.

## Parcours des données et navigation

1. Le routeur affiche `HomeComponent` pour `/`.
2. La page s’abonne à `DataService.getCountries()` ; le service charge et partage les données du fichier JSON.
3. La page calcule les indicateurs et gère les états.
4. `DashboardComponent` transmet les indicateurs à `KpiListComponent` et les données à `MedalsChartComponent`.
5. `MedalsChartComponent` crée le graphique et fait remonter l'identifiant du pays cliqué.
6. Le clic ouvre `/country/:id`, associé à `CountryComponent`.
7. Cette page récupère le pays avec `getCountryById()`, calculs les indicateurs et gère les états.
8. `CountryDetailComponent` transmet les indicateurs à `KpiListComponent` et les données à `CountryChartComponent`.
9. `CountryChartComponent` crée le graphique.
10. Le bouton « Go back » utilise `RouterLink` pour revenir à `/`.

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

### Méthodes disponibles

| Méthode                                                        | Résultat                                                       |
| -------------------------------------------------------------- | -------------------------------------------------------------- |
| `getCountries(): Observable<Olympic[]>`                        | Fournit la liste des pays et leurs participations.             |
| `getCountryById(id: number): Observable<Olympic \| undefined>` | Fournit le pays correspondant, ou `undefined` s’il est absent. |

`getCountryById()` réutilise les données renvoyées par `getCountries()`. `map` et `find` permettent de filtrer le pays recherché. Cette recherche ne crée pas de requête HTTP distincte : elle réutilise le chargement partagé et sa réponse mise en cache.

### Utilisation par les pages

`HomeComponent` s’abonne à `getCountries()`. Il effectue les calculs pour construire le graphique global.

`CountryComponent` observe les paramètres de la route.

- Il convertit la valeur reçue en identifiant numérique et appelle `getCountryById()`.
- `switchMap` permet de remplacer la recherche précédente lorsque le paramètre de la route change.

Les deux pages utilisent `takeUntilDestroyed` pour arrêter leur abonnement à leur destruction.

### Gestion des états et des erreurs

Les pages Home et Country utilisent `PageState` pour gérer quatre états : `loading`, `empty`, `error` et `success`.

- Le template utilise `@switch (state)` pour afficher le spinner, un message d’absence de données, une erreur ou les indicateurs et le graphique.
- Un pays introuvable ou un identifiant invalide redirige vers la page `not-found`.
