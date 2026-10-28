# Architecture et maintenance

## Organisation avant et après

Le projet reste une application React sur une seule page. Aucun routeur, backend ou système de pages supplémentaire n’a été ajouté.

| Avant                                                                | Après                                             |
| -------------------------------------------------------------------- | ------------------------------------------------- |
| `src/App.tsx`, `src/App.module.css`                                  | `src/app/`                                        |
| `src/components/layout/`                                             | `src/layouts/`                                    |
| `src/components/{hero,projects,skills,memory,experience,contact}/`   | `src/sections/`, avec moins de sous-dossiers      |
| `src/components/psp/`                                                | `src/sections/hero/PspStage.*`                    |
| `src/components/music/MusicPlayerPreview/`                           | `src/components/MusicPlayerPreview/`              |
| Introduction répartie entre `components`, `hooks`, `utils` et `data` | `src/features/intro/`                             |
| `src/utils/githubRepositories.ts`                                    | `src/services/githubRepositories.ts`              |
| `src/hooks/useGithubRepositoryCount.ts`                              | `src/sections/memory/useGithubRepositoryCount.ts` |
| Vignette musicale dans `images/projects/orbit.svg`                   | `images/music/player-cover.svg`                   |

Les anciennes couvertures `echoes.svg`, `pixel-garden.svg` et `skyline.svg`, sans références dans le projet, ont été retirées. Les autres images, les deux audios et le CV ont été conservés sans modification de leur contenu.

## Responsabilités

- **`app/`** assemble le layout et les sections, et définit les grilles de la page.
- **`layouts/`** contient la navbar, la navigation et le pied de page.
- **`sections/`** contient les composants spécifiques aux blocs du portfolio. Chaque section garde ses composants et styles voisins, sans ajouter un dossier par petit élément.
- **`components/ui/`** rassemble les éléments partagés. `Panel`, `Button`, `Tag`, `SectionTitle` et `IconButton` servent plusieurs sections. `ExpandablePanel` compose l’aperçu compact et `ExpandingDialog` ; chacun possède ses propres styles. `AccordionItem` fournit les menus déroulants.
- **`features/intro/`** contient toute la logique de démarrage et sa présentation. Les contrôleurs `IntroSequence` et `IntroAudio` restent indépendants de React pour être testés avec Node.js.
- **`hooks/`** regroupe les hooks partagés. Le hook du compteur de dépôts reste auprès de la Memory Card, son seul consommateur.
- **`services/`** isole les appels à l’API publique GitHub, leur validation et le cache local. Aucun secret n’est utilisé.
- **`data/`**, **`types/`** et **`assets/`** séparent respectivement les contenus, leurs modèles et les ressources importées.
- **`utils/`** conserve les fonctions de presse-papiers, de mise en évidence des ancres et de remise à zéro du défilement.
- **`styles/`** conserve le reset, les polices, les variables et les règles globales. Les styles spécifiques restent des CSS Modules.

## Conventions

- Composants et fichiers React en `PascalCase`, hooks en `useSomething`, fonctions et variables en `camelCase`.
- Fichier CSS associé nommé `Component.module.css`, placé près du composant.
- Imports locaux au même dossier en `./…` ; imports entre dossiers avec `@/…`.
- Alias `@/` configuré dans `vite.config.ts` et `tsconfig.app.json`, sans bibliothèque supplémentaire.
- Tests Node.js avec imports relatifs explicites en `.ts`, sans dépendre de la résolution des alias Vite. Les modules de logique testés n’importent pas de médias ni de CSS.
- Assets descriptifs ; les noms existants utiles et le nom de téléchargement du CV sont conservés.
- Configuration des outils à la racine. Les fichiers de cache TypeScript sont générés sous `node_modules/.cache/`.

## Introduction PSP

`main.tsx` installe le retour en haut de page, puis monte `IntroExperience` autour d’`App` avec React StrictMode.

```text
loading → booting → settling → ready
                                ↓ clic / clavier
                           confirming → revealing → complete
```

`introConfig.ts` importe les deux sons et définit les textes, durées, volume et modes de relecture. `useIntroExperience` coordonne les contrôleurs, l’état React et la visibilité de l’onglet. `IntroExperience`, `IntroScreens` et `IntroBackdrop` affichent la séquence et gèrent les interactions accessibles.

Les appels audio, leurs protections contre les doubles lectures, les réinitialisations et le préchargement sont conservés. La lecture automatique audible reste soumise à la politique du navigateur. Les refus sont gérés par le contrôleur existant et ne retardent pas le passage à Welcome.

## Panneaux agrandissables

About me, Skills et Experience partagent `ExpandingDialog` et `useExpandingDialog`. Ce hook gère les phases d’ouverture, les animations, le verrouillage du défilement, le clavier et le retour du focus. Skills et Experience utilisent aussi `ExpandablePanel` et `AccordionItem` ; les catégories restent désactivées tant que le panneau n’a pas fini de s’ouvrir.

Les identifiants des ancres, dialogues et régions restent stables pour préserver la navigation et l’accessibilité.

## Vérifications dans le navigateur

Après les commandes de vérification du README :

1. Recharger le site : démarrage automatique, premier son lorsque le navigateur l’autorise, puis Welcome sans interaction préalable.
2. Entrer en cliquant en dehors du bouton central, puis refaire l’essai au clavier : second son, transition et arrivée en haut du portfolio. Vérifier aussi la sourdine et le passage direct à Welcome via **Skip animation**.
3. Tester les liens About, Projects, Skills, Experience et Contact : ancres, défilement, état actif et glow temporaire. Le logo ramène à l’accueil.
4. Ouvrir About me depuis ses deux déclencheurs. Ouvrir Skills et Experience, déplier plusieurs catégories indépendamment, puis fermer par croix et Échap. Vérifier le focus et le défilement interne.
5. Vérifier le portrait, les couvertures et tranches PlayStation, le téléchargement du CV, les destinations des liens projets et sociaux, ainsi que le lien email et la confirmation de copie.
6. Vérifier ordinateur, tablette et mobile : grilles, menu responsive, absence de défilement horizontal et lisibilité des dialogues.
7. Vérifier la console, le chargement des images et des deux audios, ainsi que l’absence de ressources manquantes dans le build servi par `npm run preview`.

Les captures et rapports locaux de vérification vont dans `.verification/`, ignoré par Git. Ils ne sont pas nécessaires pour lancer ou construire le site.
