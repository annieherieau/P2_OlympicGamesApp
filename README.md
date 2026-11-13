# Olympic Games

## Présentation du projet

### Contexte et objectif

Olympic Games est une application qui permet de consulter des statistiques olympiques selon deux niveaux : 
- une vue globale des médailles par pays
- une vue détaillée d’un pays sélectionné.

Il s’agit d’une application frontend Angular.
Aucun backend ni configuration de clé d'API n'est nécessaire : les données sont livrées avec l’application dans un fichier JSON.

### Fonctionnalités

Sur le tableau de bord de l’accueil, l’utilisateur voit le nombre de pays, le nombre d’éditions représentées et un graphique circulaire (type camembert) des médailles cumulées par pays. Accès au détail d’un pays en cliquant sur son secteur dans le graphique ou sur son lien dans le tableau de données.

Cette seconde page présente le nombre de participations, les totaux de médailles et d’athlètes, ainsi qu’une courbe des médailles par année. Un lien permet de revenir à l’accueil.

Gestion des états de chargement, des données vides, des erreurs HTTP et des pages introuvables.

Application responsive avec tableaux de données alternatifs aux graphiques, liens de navigation accessibles au clavier et annonces des états de chargement et d’erreur. La conformité WCAG AA complète reste à vérifier.

- [Spécifications](Spécifications+-+Télésport.pdf)
- [Captures d'écran](src/assets/images/captures)

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

Angular CLI est installé localement avec les dépendances : son installation globale n'est pas nécessaire.

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

6. Lancer les tests unitaires avec le rapport de couverture (Chrome doit être installé) :

   ```bash
   npm test -- --watch=false --browsers=ChromeHeadless --code-coverage
   # lecture du fichier généré
   open coverage/olympic-games-starter/index.html
   ```

### Tests

Les tests unitaires utilisent Jasmine et Karma et couvrent les pages, les composants de présentation et `DataService` (requêtes HTTP simulées, tri, cache et recherche).

### Scripts disponibles

Exécuter les commandes depuis la racine du projet.

| Commande | Utilisation |
| --- | --- |
| `npm start` | Démarrer le serveur de développement. |
| `npm run build` | Compiler pour la production. |
| `npm run watch` | Recompiler en continu en configuration de développement. |
| `npm test` | Lancer les tests en mode surveillance. |
| `npm run ng -- <commande>` | Exécuter le CLI Angular local. |

Documentation : [Angular CLI](https://angular.dev/tools/cli).

## Structure du projet

### Architecture

Les pages pilotent le chargement, les indicateurs et la navigation. 
Les composants assurent l'affichage.
`DataService` centralise l'accès aux données. 

Voir : [ARCHITECTURE.md](ARCHITECTURE.md) 

### Accès aux données

Le fichier `src/assets/mock/olympic.json` contient cinq pays pour 3 éditions de jeux olympiques.

`DataService` charge le fichier JSON avec `HttpClient` au premier abonnement. Le flux utilise `shareReplay` pour partager la requête et conserver la réponse après un chargement réussi.

### Limites connues

- **Données statiques et partielles** : les résultats concernent uniquement les pays et éditions du fichier fourni. Ils ne constituent pas un historique exhaustif des Jeux olympiques.
- **Aucun backend** : il n'existe pas de mise à jour automatique des résultats ni de fonctionnalité de modification des données depuis l'interface.
- **Données supposées conformes aux modèles** : le typage TypeScript ne valide pas le contenu du JSON à l'exécution. Un fichier mal structuré peut provoquer des erreurs lors des calculs ou de l'affichage.
- **Interface en anglais** : pas d'un système de traduction.
- **Accessibilité des graphiques** : les graphiques utilisent des éléments `canvas` avec un tableau de données alternatif.

#### Compilation et déploiement

`npm run build` produit les fichiers statiques dans `dist/olympic-games-starter/`. Le contenu de ce dossier peut être publié sur un hébergement statique. Configurer cet hébergement pour servir `index.html` lorsqu’une route Angular (par exemple `/country/1`) est ouverte directement ou rechargée.
