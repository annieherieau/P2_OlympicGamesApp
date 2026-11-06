# Olympic Games App - Notes d'architecture

L'application se lance correctement et permet de consulter les statistiques olympiques selon deux niveaux :

- vue globale des pays
- vue détaillée d'un pays sélectionné

## Liste des problèmes identifiés

### Routing - routage pays (P1)

`src/app/app-routing.module.ts`
`src/app/pages/home/home.component.ts`
`src/app/pages/country/country.component.ts`

La route est `country/:countryName` au lieu de `country/:id` indiqué dans US-03 et les règles d'affichage. Le nom du pays doit servir à l'affichage front mais pas à la recherche, ni à la navigation.

TODO :

- modifier la route
- adapter lien géréré par HomeComponent
- modifier la recherche dans CountryComponent

### Routing - pays inexistant / ID invalide (P1)

`src/app/pages/country/country.component.ts`
La recherche d'un pays inexistant renvoie `undefined` et provoque une exception qui n'est pas gérée.

TODO :

- gestion de l'exception avec message d'erreur / redirection

### Accès aux données : Types (P1)

L'application utilise `any[]` aucun type n'est défini.

TODO :

- Ajouter les types TS (interfaces)
  - Olympic
  - Participation

### Accès aux données : Service (P1)

`src/app/pages/home/home.component.ts`
`src/app/pages/country/country.component.ts`
Chaque page charge directement le fichier JSON, avec l'URL en attribut et l'injection du client HTTP à l'instanciation.
Une page ne doit gérer que l'affichage des données et la navigation.
Les graphiques gère leur rendu.

TODO :

- Créer un service (singleton pattern) pour gérer l'accès aux données via le client HTTP et avec les modèles de données
  - obtenir la liste des pays
  - sélectionner un pays
  - les 2 pages utilisent la même instance du service
  - destruction des observables
  - anticiper la connexion future avec une API REST

### Composants (P1)
`src/app/pages/home/home.component.ts`
`src/app/pages/country/country.component.ts`
Le code HTML est dupliqué et les composants attendus ne sont pas implémentés.
TODO :

- créer les pages conteneurs
  - DashboardPage
  - CountryDetailPage
  - NotFoundPage
- créer des composants réutilisables
  - HeaderComponent : titre + liste des KPI
  - KpiComponent
  - ButtonComponent (penser à la personnalisation)


### States - Gestion des états (P2)

`src/app/pages/home/home.component.ts`
`src/app/pages/country/country.component.ts`
Les erreurs sont stockées dans `error`mais ne sont jamais affichées
L'absence de données `data = []` ne déclenche aucun message
Le chargement n'est pas affiché

TODO :

- Gérer 4 états (State pattern):
  - Loading : squelettes simples (boîtes grises) ou spinner
  - Empty : message « Aucune donnée »
  - Error : message clair + bouton retour (ErrorComponent)
  - Success : affichage du graphique
- prévoir la mise en cache des données (optimisation en plus)
  à gérer avec Angular


### Accès aux données : any[] (P2)

`src/app/pages/home/home.component.ts`
`src/app/pages/country/country.component.ts`
Les données sont chargées avec `any[]`

TODO :

- utiliser les types Olympic et Participation
- remplacer tous les `any[]`
- si le type est inconnu, mettre `unkwnow`

### Traitement des données (P2)
`src/app/pages/home/home.component.ts`
`src/app/pages/country/country.component.ts`
Il y a du code redondant dans le calcul des KPIs et les données transmise à Chart.js 

TODO :

- créer fonctions typées : calculs métier (Totaux KPI)
- créer un Adapter : transformations pour les graphiques (`labels`, `datasets`, années et valeurs numériques)

### Données : tri explicite (P2)

`src/app/pages/home/home.component.ts`
`src/app/pages/country/country.component.ts`

les données sont affichées dans l'ordre du JSON. Un tri explicite est demandé dans les spécifications.

TODO :

- Tri alphabétique / total
- gérer le nul et vide : à la fin

### Routing - Raffraichissement des details pays (P2)

Lorsqu'on navique avec le router entre deux pays (sans passage par l'accueil), les données affichées ne sont pas recalculées et ne correspondent plus au pays sélectionné.

L’abonnement aux paramètres de route et le chargement HTTP sont séparés. Si le paramètre change pendant que le composant est conservé, le pays affiché n’est pas recalculé.

TODO :

- améliorer avec l'Observer Angular
- relier les événements : paramètre de route → recherche du pays dans le service → mise à jour de l’affichage
- actualiser aussi le graphique lorsque le pays change : voir « Graphiques - Nettoyage ».

### Graphiques - Nettoyage à la sortie d'une page (P2)

`src/app/pages/home/home.component.ts`
`src/app/pages/country/country.component.ts`

Chaque page crée un graphique Chart.js, mais ne le détruit pas
lorsque le composant Angular est détruit.
Retirer le canvas de la page ne suffit pas à libérer les références
et les écouteurs conservés par Chart.js.

TODO :

- appeler destroy() sur le graphique dans ngOnDestroy(), s'il a été créé
- lorsque les données changent, mettre à jour le graphique existant
  ou le détruire avant de le recréer sur le même canvas
- vérifier que les allers-retours accueil/détail n'accumulent pas
  d'instances actives et ne provoquent pas d'erreur de canvas déjà utilisé

### Graphiques - Coordonner la vue et les données (P2)

`src/app/pages/home/home.component.ts`
`src/app/pages/country/country.component.ts`

Le graphique est créé à la réception des données HTTP, en cherchant
le canvas par son identifiant global.
Ce fonctionnement ne garantit pas que le canvas soit disponible :
la réponse peut arriver après avoir quitté la page ou, avec une source
synchrone, avant l'initialisation de la vue.

TODO :

- utiliser une référence locale au canvas avec @ViewChild
- créer le graphique seulement lorsque la vue et les données sont prêtes
- arrêter les abonnements liés au composant lors de sa destruction
- confier cette gestion aux composants graphiques prévus
  MedalsChartComponent et CountryChartComponent
- vérifier avec un réseau ralenti suivi d'une navigation immédiate,
  puis avec une source de données simulée synchrone

### Routing - Bouton "Retour" (P3)

`src/app/pages/country/country.component.ts`
`src/app/pages/not-found/not-found.component.ts`
Actuellement `routerLink=""`

TODO :

- mettre la racine `routerLink="/"` sur les 2 pages
- faire un bouton

### Application Responsive (P3)

`src/styles.scss`
`src/app/pages/home/home.component.ts`
`src/app/pages/country/country.component.ts`
L'application doit être adpaté à une utilisation sur PC, tablette et téléphone.

TODO :

- adapter le CSS aux différentes résolution
  - Desktop ≥ 1200px : 12 colonnes, contenus côte à côte
  - Tablette ~ 768–1199px : 8 colonnes, graphe pleine largeur
  - Mobile ≤ 767px : 4 colonnes, pile verticale
- utiliser bootstrap

### Accessibilité (P3)

`src/app/pages/home/home.component.ts`
`src/app/pages/country/country.component.ts`
Les spécifications prévoient l'Accessibilité de base.

TODO : A11y

- contrastes AA
- focus visibles
- ARIA simples : aria-label sur boutons/icônes
- descriptions textuelles pour les graphes
- (Accessibilité au clavier)

### Présentation de l'application (P3)
`src/app/pages/home/home.component.ts`
Aucune phrase n'explique les données affichées et les possibilitées de navigation. Les exisgeances demandent de présenter le contexte de l'application en page d'acceuil

TODO :
- ajouter une introduction et une indication de navigation en anglais

### Tests - Compilation et mise à jour (P3)

`src/app/app.component.spec.ts`
`src/app/pages/home/home.component.spec.ts`
`src/app/pages/country/country.component.spec.ts`

Les tests existants vérifient principalement la création des composants.
La compilation échoue : 
- utilisation de propriétés/élements inexistants
Un autre cherche un élément HTML absent du template actuel.
- les dépendances ne sont pas injectées : HTTP client et routage.

TODO :

- mettre à jour avec les élements existants
- configurer les dépendances
- configurer le routage
- simuler l'accès aux données dans les tests
- vérifier la compilation des tests, puis exécuter la suite
- ajouter également des tests sur :
  - les ID invalides et le retour à l'accueil
  - le calcul des KPI
  - les états chargement, vide, erreur et succès
  - le changement de pays dans la route
  - la destruction des graphiques

### Code obsolète (P3)
`src/app/pages/home/home.component.ts`
`src/app/pages/country/country.component.ts`
`src/styles.scss`

On retrouve du code dupliqué, obsolète ou incorrect.
les couleurs métier/visuelles et options de graphiques sont mélangées au traitement des données.
Les exigigences demandent la factorisation des constantes.

TODO : 
- factoriser avec le service et des méthodes communes
- retirer le code inutilisé et les logs de diagnostic non nécessaires
- regrouper les constantes réellement partagées
- encapsuler le style propres aux composants

## Documentation

### Arborescence finale

- src/app/
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
  - services/
    - data.service.ts
  - models/
    - olympic.model.ts
    - participation.model.ts

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

### Documentation

La documentation de l'application à completer et à mettre à jour

TODO :

- `README.md`
  - prérequis 
  - installation
  - commandes
  - structure
  - user stories
- `ARCHITECTURE.md`
  - structure : arborescence des dossiers
  - composants et leurs rôles
  - usage du service Angular et son rôle
  - Patterns et leurs rôles / améliorations apportées
  - comment cette architecture prépare à une future connexion back-end/API ?
