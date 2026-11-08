# Olympic Games

## Présentation du projet

### Contexte et objectif

Olympic Games est une application qui permet de consulter des statistiques olympiques selon deux niveaux : 
- une vue globale des médailles par pays
- une vue détaillée d’un pays sélectionné.

Il s’agit d’une application frontend Angular.
Aucun backend ni configuration de clé d'API n'est nécessaire : les données sont sont livrées avec l’application dans un fichier JSON.

### Fonctionnalités

Sur le tableau de bord de l'acceuil, l’utilisateur voit le nombre de pays, le nombre d’éditions représentées et un graphique circulaire (type camenbert) des médailles cumulées par pays. Accès au détail d'un pays en cliquant sur son secteur dans le graphique.

Cette seconde page présente le nombre de participations, les totaux de médailles et d’athlètes, ainsi qu’une courbe des médailles par année. Un lien permet de revenir à l’accueil.

Gestion des états de chargement, des données vides, des erreurs HTTP et des pages introuvables.

Application responsive avec accessibilité de base (TODO)

TODO : voir les spécifications + captures d'écran

## Technologies utilisées

| Technologie | Utilisation |
| --- | --- |
| Angular 18 | Composants, navigation et requêtes HTTP |
| TypeScript 5.4 | Typage et logique de l'application |
| RxJS 7.8 | Traitement et partage des flux de données |
| Chart.js 4 | Graphiques en secteurs et en courbe |
| SCSS | Styles de l'application |
| Jasmine et Karma | Infrastructure des tests unitaires |

Les plages de versions sont déclarées dans `package.json`. Les versions résolues sont enregistrées dans `package-lock.json` : notamment Angular 18.2.13 et Angular CLI 18.2.20.

### Prérequis

- **Node.js** : les dépendances Angular verrouillées déclarent la plage `^18.19.1 || ^20.11.1 || >=22.0.0`.
- **npm** : le CLI verrouillé déclare la plage `^6.11.0 || ^7.5.6 || >=8.0.0`. Utiliser de préférence la version fournie avec la version de Node.js choisie.

Vérifier les outils installés :

```bash
node --version
npm --version
```

Angular CLI est installé localement avec les dépendances : son installation globale n'est pas nécessaire..

### Installation et démarrage

1. Cloner le dépôt et ouvrir le dossier du projet :

   ```bash
   git clone https://github.com/annieherieau/P2_OlympicGamesApp.git
   cd P2_OlympicGamesApp
   ```

2. Installer les dépendances à partir du fichier de verrouillage :

   ```bash
   npm ci
   ```

3. Démarrer le serveur de développement :

   ```bash
   npm start
   ```

4. Ouvrir `http://localhost:4200` dans un navigateur.

Pour choisir un autre port (exple 4201) :
```bash
npm start -- --port 4201
```
Le serveur utilise la configuration de développement et recharge automatiquement l'application après une modification des sources. 

5. Arrêter le serveur : `Ctrl+C` dans le terminal.

### Scripts disponibles

Exécuter les commandes depuis la racine du projet.

Documentation : [Angular CLI](https://angular.dev/tools/cli).

## Structure du projet

### Architecture
TODO Voir: [ARCHITECTURE.md](ARCHITECTURE.md)

```text
src/
├── app/
│   ├── components/           # Composants d'affichage et graphiques
│   │   ├── button/
│   │   ├── country-chart/
│   │   ├── country-detail/
│   │   ├── dashboard/
│   │   ├── error/
│   │   ├── header/
│   │   ├── kpi/
│   │   ├── kpi-list/
│   │   ├── medals-chart/
│   │   └── spinner/
│   ├── core/
│   │   ├── models/            # Types des données, indicateurs et états de page
│   │   └── services/          # Accès et partage des données : DataService
│   ├── pages/
│   │   ├── home/              # Tableau de bord général
│   │   ├── country/           # Détail d'un pays
│   │   └── not-found/         # Page introuvable
│   ├── app-routing.module.ts  # Déclaration des routes
│   └── app.module.ts          # Module racine
├── assets/
│   ├── images/                # Images de l'application
│   └── mock/olympic.json      # Jeu de données
├── environments/              # Configurations de développement et production
├── main.ts                    # Point d'entrée
└── styles.scss                # Styles globaux
```

À la racine, `angular.json` configure la compilation, le serveur et les tests ; `package.json` déclare les dépendances et scripts ; `karma.conf.js` configure l'exécution des tests.

- Les pages pilotent le chargement, les indicateurs et la navigation. Les composants assurent l'affichage, tandis que `DataService` centralise l'accès aux données. Le module racine coexiste avec des composants standalone.

### Données et fonctionnement

#### Source et modèles

Le fichier `src/assets/mock/olympic.json` contient cinq pays pour 3 éditions de jeux olympiques.

| Modèle | Champs |
| --- | --- |
| `Olympic` | `id`, `country`, `participations` |
| `Participation` | `id`, `year`, `city`, `medalsCount`, `athleteCount` |

Un pays (Olympic) possède plusieurs participations

#### Chargement des données

`DataService` charge le fichier JSON avec `HttpClient` au premier abonnement. Le flux utilise `shareReplay` pour partager la requête et conserver la réponse après un chargement réussi.

La méthode `getCountries()` renvoie les pays triés par nom selon la locale de l'application. La méthode `getCountryById(id)` recherche un pays par son identifiant.

#### Navigation

| Route | Comportement |
| --- | --- |
| `/` | Affiche le tableau de bord. |
| `/country/:id` | Affiche le pays correspondant à l'identifiant. |
| `/not-found/:error` | Affiche une page introuvable avec un message d'erreur. |
| Toute autre route | Affiche la page introuvable. |

Un identifiant de pays invalide ou inexistant entraîne une redirection vers la page introuvable.

### Limites connues

- **Données statiques et partielles** : les résultats concernent uniquement les pays et éditions du fichier fourni. Ils ne constituent pas un historique exhaustif des Jeux olympiques.
- **Aucun backend** : il n'existe pas de mise à jour automatique des résultats ni de fonctionnalité de modification des données depuis l'interface.
- **Données supposées conformes aux modèles** : le typage TypeScript ne valide pas le contenu du JSON à l'exécution. Un fichier mal structuré peut provoquer des erreurs lors des calculs ou de l'affichage.
- **Interface en anglais** : pas d'un système de traduction.
- **Accessibilité des graphiques** : les graphiques utilisent des éléments `canvas` sans tableau de données alternatif ; l'accès au détail depuis le graphique repose sur un clic sur un secteur.
- **Tests non fonctionnels** : les fichiers de tests et leur configuration sont présents, mais la suite est signalée comme non fonctionnelle dans le plan du projet. Elle doit être remise en état avant de servir de validation automatique. Les tests n'ont pas été exécutés pour cette rédaction et aucune couverture n'est annoncée.

#### Compilation et déploiement

`npm run build` produit les fichiers statiques dans `dist/olympic-games-starter/`. Le contenu de ce dossier peut être publié sur un hébergement statique.
