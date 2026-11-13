# Olympic Games App - Architecture

## Arborescence

```text
src/app/
  ├── components/                      # Composants d'affichage et graphiques
  │   ├── button/button.component.*
  │   ├── country-chart/country-chart.component.*
  │   ├── error/error.component.*
  │   ├── header/header.component.*
  │   ├── kpi/kpi.component.*
  │   ├── kpi-list/kpi-list.component.*
  │   ├── medals-chart/medals-chart.component.*
  │   └── spinner/spinner.component.*
  ├── core/
  │   ├── models/                      # Types des données, indicateurs et états de page
  │   │   ├── Kpi.ts
  │   │   ├── olympic.model.ts
  │   │   ├── page-state.ts
  │   │   └── participation.model.ts
  │   ├── services/                    # Accès et partage des données : DataService
  │   │   └── data.service.ts
  │   └── utils/                       # Fonctions partagées
  │       └── http-error-message.ts
  ├── pages/                           # Pages accessibles par une URL
  │   ├── country/country.component.*
  │   ├── home/home.component.*
  │   └── not-found/not-found.component.*
  ├── app-routing.module.ts                 # Déclaration des routes
  ├── app.component.*
  └── app.module.ts
  ├── assets/
  │   ├── images/                # Images de l'application
  │   └── mock/olympic.json      # Jeu de données
  ├── environments/              # Configurations de développement et production
  ├── main.ts                    # Point d'entrée
  └── styles.scss                # Styles globaux

```

Pour chaque composant, `component.*` regroupe les fichiers `.ts`, `.html`, `.scss` et `.spec.ts`.

## Rôles et responsabilités

L’architecture sépare les écrans associés aux routes, les composants de présentation, l’accès aux données et les types de données.

### Dossiers

| Dossier                  | Rôle et responsabilités                                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/`               | Contenir le code Angular et la configuration de navigation.                                                                             |
| `src/app/core/`          | Regrouper les modèles, le service de données et les fonctions utilitaires partagées.                                                                  |
| `src/app/core/models/`   | Décrire les structures et les types des données.                                                                                        |
| `src/app/core/services/` | Centraliser le chargement, le partage et la recherche des données.                                                                      |
| `src/app/core/utils/` | Fournir des fonctions partagées. |
| `src/app/components/`    | Regrouper les éléments de présentation et les assemblages de composants.               |
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
| `header/header.component.ts`                 | Afficher l’en-tête commun                      | Afficher les titres, l’introduction sur l’accueil et la liste des KPI.      |
| `kpi/kpi.component.ts`                       | Afficher un indicateur                         | Afficher son libellé et sa valeur.                              |
| `kpi-list/kpi-list.component.ts`             | Afficher une liste d’indicateurs               | Recevoir et afficher une liste d’indicateurs                   |
| `button/button.component.ts`                 | Fournir un bouton de navigation   | Naviguer avec `RouterLink`                                      |
| `medals-chart/medals-chart.component.ts`     | Afficher le graphique global                   | Construire le camembert, afficher un tableau avec des liens vers les pays et émettre l’identifiant du pays cliqué |
| `country-chart/country-chart.component.ts`   | Afficher le graphique d’un pays                | Construire la courbe et le tableau des médailles par année. |
| `error/error.component.ts` | Afficher une erreur | Présenter le message reçu dans une alerte (`role="alert"`). |
| `spinner/spinner.component.ts` | Indiquer le chargement | Afficher une animation et le texte « Loading... » dans un statut (`role="status"`). |

## Service et accès aux données

### Responsabilité de DataService

`DataService` centralise l’accès aux données olympiques. Les pages utilisent ce service pour obtenir les données, puis calculent les indicateurs et préparent les graphiques.

Le service est déclaré avec `@Injectable({ providedIn: 'root' })`. Angular fournit une instance partagée à l’échelle de
l’application : il joue le rôle de **singleton**.

[diagramme du DataService](src/assets/images/DataService.png)

### Méthodes disponibles

| Méthode                                                        | Résultat                                                       |
| -------------------------------------------------------------- | -------------------------------------------------------------- |
| `getCountries(): Observable<Olympic[]>`                        | Fournit les pays triés par nom selon `LOCALE_ID`, avec les noms vides en fin de liste, et leurs participations.             |
| `getCountryById(id: number): Observable<Olympic \| undefined>` | Fournit le pays correspondant, ou `undefined` s’il est absent. |

`getCountryById()` réutilise les données renvoyées par `getCountries()`. `map` et `find` permettent de filtrer le pays recherché. Cette recherche ne crée pas de requête HTTP distincte : elle réutilise le chargement partagé et sa réponse mise en cache.

### Source et structure des données

Les données proviennent du fichier local JSON, chargé par une requête HTTP GET à l’adresse `./assets/mock/olympic.json`.

| Fichier                  | Rôle et responsabilités                                      |
| ------------------------ | ------------------------------------------------------------ |
| `Kpi.ts`                 | Définir le type `Kpi` utilisé pour les indicateurs affichés. |
| `olympic.model.ts`       | Définir le modèle de données des pays.                       |
| `participation.model.ts` | Définir le modèle de données des participations              |
| `page-state.ts`    | Définir les états utilisés par les pages                    |

Un pays possède plusieurs participations. Les modèles décrivent les types attendus ; ils ne valident pas le JSON à l’exécution.

## Utilisation par les pages

`HomeComponent` s’abonne à `getCountries()`. Il calcule les KPI ; `MedalsChartComponent` calcule les totaux de médailles par pays pour le graphique et le tableau.

`CountryComponent` observe les paramètres de la route.
- Il convertit la valeur reçue en identifiant numérique et appelle `getCountryById()`.
- `switchMap` permet de remplacer la recherche précédente lorsque le paramètre de la route change.

Les deux pages utilisent `takeUntilDestroyed` pour arrêter leur abonnement à leur destruction.

### Gestion des états et des erreurs

Les pages Home et Country utilisent `PageState` pour gérer quatre états : `loading`, `empty`, `error` et `success`.

- Le template utilise `@switch (state)` pour afficher le spinner, un message d’absence de données, une erreur ou les indicateurs et le graphique.
- Un pays introuvable ou un identifiant invalide redirige vers la page `not-found`.

- Les erreurs HTTP sont converties en messages par `getHttpErrorMessage()` puis affichées par `ErrorComponent`.

### Utilitaires partagés

`core/utils/http-error-message.ts` exporte `getHttpErrorMessage(error: HttpErrorResponse): string`. Cette fonction est utilisée par `HomeComponent` et `CountryComponent` pour éviter de dupliquer la traduction des statuts HTTP en messages anglais.

## Évolution vers une API

Les pages dépendent des méthodes de `DataService`, ce qui centralise le remplacement du fichier JSON par une API. Si la réponse conserve la structure `Olympic[]`, l’URL de chargement peut être adaptée dans le service sans changer les composants de présentation.