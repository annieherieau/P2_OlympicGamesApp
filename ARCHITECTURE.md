# Olympic Games App - ARCHITECTURE

## Arborscence

- src/app/
  - core/
    - services/
      - data.service.ts
    - models/
      - olympic.model.ts
      - participation.model.ts
  - components/
    - header/
      - header.component.*
    - kpi/
      - kpi.component.*
    - button/
      - button.component.*
    - medals-chart/
      - medals-chart.component.*
    - country-chart/
      - country-chart.component.*
  - pages/
    - country-detail/
      - country-detail.component.*
    - dashboard/
      - dashboard.component.*
    - not-found/
      - not-found.component.*


### Rôles et Responsabilités
L'architecture sépare l'affichage réutilisable (composants), les pages, l'accès aux données et la description des données.
- la page coordonne
- le composant présente
- le service fournit les données
- le modèle décrit leur structure

**`src/app/` : le code de l’application**
Ce dossier contient les éléments qui font fonctionner l’application Angular : composants, pages, services, modèles et configuration de navigation.

**`components/` : les éléments d’interface réutilisables**
Chaque composant représente une partie de l’écran. Il reçoit des données à afficher.

| Dossier | Rôle | Responsabilité |
|---|---|---|
| `header/` | Afficher l’en-tête commun | Présenter le titre et les KPI. |
| `kpi/` | Afficher un KPI (indicateur chiffré) | Présenter un libellé et une valeur (total)|
| `button/` | Fournir un bouton réutilisable | Uniformiser son apparence et signaler un clic. La page décide de l’action à effectuer. |
| `medals-chart/` | Afficher le graphique global des médailles | Représenter les données par pays et indiquer le pays sélectionné. |
| `country-chart/` | Afficher le graphique d’un pays | Représenter, pour le pays sélectionné, l’évolution de ses médailles selon les années. |

**Les fichiers `*.component.*` : les différentes parties d’un composant**
Le symbole `*` représente ici plusieurs extensions possibles :

| Fichier | Rôle |
|---|---|
| `header.component.ts` | Déclare le composant et contient sa logique : données reçues, événements émis, méthodes. |
| `header.component.html` | Décrit ce qui s’affiche : structure HTML, valeurs affichées et interactions. |
| `header.component.scss` ou `.css` | Définit l’apparence : couleurs, espacements, disposition, adaptation aux écrans. |
| `header.component.spec.ts` | Contient les tests automatisés du composant. |

Cette répartition s’applique aussi aux composants des pages.

**`pages/` : les écrans associés aux routes**

Une page est elle-même un composant Angular. On la range dans `pages/` pour indiquer qu’elle représente un écran complet, accessible par une URL.

Elle coordonne les données et assemble les composants nécessaires. Elle fait office de controller.

| Dossier | Rôle | Responsabilité |
|---|---|---|
| `dashboard/` | Présenter la vue d’ensemble | Demander les données au service, préparer les indicateurs et alimenter le graphique des médailles. Gérer la sélection d’un pays pour ouvrir son détail. |
| `country-detail/` | Présenter un pays | Lire son identifiant dans l’URL, obtenir ses données et préparer ses indicateurs et son graphique. Gérer le cas d’un pays inexistant. |
| `not-found/` | Présenter la page introuvable | Informer l’utilisateur lorsque l’URL ne correspond à aucune page et proposer un retour vers l’accueil. |

Une page peut aussi gérer les états **chargement**, **erreur** et **absence de données**, selon les besoins.

**`services/data.service.ts` : l’accès aux données**

Le service centralise la récupération et la mise à disposition des données.

Il peut :
- charger les données depuis un fichier JSON ou une API
- fournir la liste des pays
- rechercher les données d’un pays par son identifiant
- conserver les données déjà chargées si nécessaire

Cela évite que chaque page réécrive le chargement des mêmes données. Le service s’occupe des données alors que les composants s’occupent de leur présentation.

**`models/` : la structure des données**

Les modèles décrivent les propriétés attendues et leurs types. Ils sont définis avec des interfaces TypeScript.

| Fichier | Ce qu’il décrit |
|---|---|
| `olympic.model.ts` | Un pays et ses participations olympiques |
| `participation.model.ts` | La participation d’un pays à une édition |

La relation est : **un pays possède plusieurs participations**.

### Parcours des données et navigation
1. La route affiche `DashboardComponent`.
2. La page demande les données à `DataService`.
3. Les **modèles** décrivent la forme de ces données.
4. La **page** prépare les valeurs à présenter.
5. Les **composants** kpi et chart les affichent.
6. Un clic sur un pays déclenche la navigation vers `CountryDetailComponent` => étapes 2 à 5

## Service d'accès au données DataService

DataService est un Singleton pattern
centralise la récupération et la mise à disposition des données
déclaré avec @Injectable({ providedIn: 'root' }) => Angualar fournit une instance commune aux pages de l'application.

injection de dépendances : HttpClient
centralise l’URL ./assets/mock/olympic.json

| Élément | Rôle |
|---|---|
| `getCountries(): Observable<Olympic[]>` | Fournir tous les pays et leurs participations |
| `getCountryById(id: number): Observable<Olympic \| undefined>` | Fournir un pays, ou `undefined` si aucun ne correspond |

## Service et accès aux données

### Responsabilité de DataService

`DataService` centralise l’accès aux données olympiques. Les pages utilisent ce service pour obtenir les données, puis calculent les indicateurs et préparent les graphiques.

Le service est déclaré avec `@Injectable({ providedIn: 'root' })`.Angular fournit une instance partagée à l’échelle de
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

`getCountryById()` réutilise les données renvoyées par `getCountries()`. `map` et `find` permettent de filtrer le pays recherché. Il n'y a donc pas de requête HTTP.

### Utilisation par les pages

`HomeComponent` s’abonne à `getCountries()`. Il effectue les calculs pour construire le graphique global.

`CountryComponent` observe les paramètres de la route. 
- Il convertit la valeur reçue en identifiant numérique et appelle `getCountryById()`. 
- `switchMap` permet de remplacer la recherche précédente lorsque le paramètre change. 

Les deux pages utilisent `takeUntilDestroyed` pour arrêter leur abonnement à leur destruction.

### Erreurs et absence de résultat

Le service transmet les erreurs HTTP aux pages qui les récupèrent le message dans leur propriété `error`.
TODO : gestion/affichage des erreurs HTTP

Un pays absent renvoie `undefined` : ce cas est distinct d’une erreur HTTP.
TODO : gestion/affichage de l'erreur "pays inexistant"
