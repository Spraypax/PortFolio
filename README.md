# Mon portfolio — Cybersécurité

Je suis étudiant en cybersécurité et j’ai conçu ce portfolio pour présenter mon profil, mes compétences, mes projets et mon parcours. J’ai choisi une interface inspirée de PlayStation et de la PSP, avec un fond bleu nuit, des panneaux translucides et des détails d’interface de console.

Je développe ce site avec React et Vite sur une seule page. J’utilise des ancres pour la navigation, sans serveur applicatif ni routeur.

## Fonctionnalités

- Introduction animée : démarrage automatique, écran **Welcome**, puis entrée par clic sur toute la surface ou par clavier, avec deux sons locaux.
- Navbar transparente, retour à l’accueil par le logo, défilement fluide et mise en évidence temporaire du panneau ciblé.
- Présentation de mon profil dans **Player 01**, biographie **About me** agrandissable et téléchargement de mon CV en PDF.
- Quatre projets présentés : **Honeypot**, **Vulnerability Scanner**, **RAT** et **Port Folio**, avec couvertures locales, tranches PlayStation et liens vers leurs dépôts.
- Panneaux **Skills** et **Experience** agrandissables, avec accordéons indépendants utilisables uniquement après l’ouverture du panneau.
- **Memory Card** : date de sauvegarde, compteur de mes dépôts publics GitHub, années d’expérience, formation actuelle et indicateurs système.
- Contact par email avec copie de mon adresse et confirmation discrète ; liens vers mes profils GitHub, LinkedIn et Root-Me.
- Mise en page responsive, navigation mobile, focus visible, dialogues au clavier et prise en compte de la réduction des mouvements.

Pour le moment, je conserve le lecteur musical de la navbar comme aperçu visuel et les labels `Demo` des cartes projets via `isPlaceholder`. Je détaille plus bas l’intégration PSP interactive que je prévois d’ajouter.

## Stack technique

J’utilise les technologies suivantes :

- **React 19** et **TypeScript** en mode strict.
- **Vite** et son plugin React pour le développement et le build.
- **CSS Modules**, variables CSS et styles globaux ; animations CSS et Web Animations API.
- **Lucide React** et pictogrammes SVG pour les icônes.
- **Inter** et **Oxanium**, servies localement avec Fontsource.
- **ESLint**, **Prettier** et tests intégrés à **Node.js**.

Je déclare les dépendances dans `package.json` et je verrouille les versions installées avec `package-lock.json`.

## Installation

Pour lancer mon portfolio localement, j’utilise **Node.js 22.12 ou supérieur** et **npm** :

```sh
git clone https://github.com/Spraypax/PortFolio.git
cd PortFolio
npm ci
npm run dev
```

J’ouvre ensuite l’adresse affichée par Vite, normalement [http://127.0.0.1:5173/](http://127.0.0.1:5173/). Si le port est occupé, Vite en choisit un autre. Mon serveur de développement écoute uniquement sur la machine locale et recharge les modifications à chaud.

## Commandes

J’utilise ces commandes pour développer et vérifier mon projet :

| Commande               | Rôle                                                   |
| ---------------------- | ------------------------------------------------------ |
| `npm run dev`          | Démarrer le serveur de développement                   |
| `npm run typecheck`    | Vérifier les projets TypeScript sans générer de code   |
| `npm run build`        | Vérifier TypeScript puis générer le build dans `dist/` |
| `npm run preview`      | Servir localement le dernier build de production       |
| `npm test`             | Exécuter les tests de logique avec Node.js             |
| `npm run lint`         | Vérifier le code avec ESLint                           |
| `npm run format:check` | Vérifier le formatage                                  |
| `npm run format`       | Appliquer le formatage Prettier                        |

### Production

Je génère puis je vérifie la version de production avec :

```sh
npm run build
npm run preview
```

Je retrouve les fichiers statiques à héberger dans `dist/`. Avec `preview`, je vérifie le build localement. Je n’ai pas configuré de déploiement automatique dans ce dépôt.

## Structure du projet

J’organise mon code de la manière suivante :

```text
src/
├── app/                  # Composition de la page et grilles principales
├── assets/
│   ├── audio/            # Deux sons de l’introduction PSP
│   ├── documents/        # CV PDF
│   └── images/           # backgrounds, music, playstation, profile, projects
├── components/
│   ├── MusicPlayerPreview/
│   └── ui/               # Boutons, panneaux, tags, dialogues, accordéons, icônes
├── data/                 # Contenus du portfolio
├── features/
│   └── intro/            # Écrans, décor, configuration, hook, séquence et audio
├── hooks/                # Horloge, dialogues agrandissables, navigation
├── layouts/              # Header, Navigation et Footer
├── sections/
│   ├── contact/
│   ├── experience/
│   ├── hero/             # Présentation, profil, biographie et réserve PSP
│   ├── memory/           # Memory Card et hook du compteur GitHub
│   ├── projects/
│   └── skills/
├── services/             # Client GitHub public et cache du compteur
├── styles/               # Reset, tokens, polices et styles globaux
├── types/                # Modèles partagés des contenus
├── main.tsx              # Point d’entrée React
└── vite-env.d.ts
tests/                    # Tests de séquence, audio, mémoire et navigation
docs/architecture.md      # Responsabilités, conventions et vérifications manuelles
```

Je garde les styles auprès de leurs composants. J’utilise l’alias `@/` pour pointer vers `src/` dans Vite et TypeScript, et des imports relatifs entre fichiers voisins. Je conserve les configurations des outils à la racine, à leur emplacement habituel.

Je décris les responsabilités et les conventions de maintenance dans [l’architecture détaillée](docs/architecture.md).

## Modifier le contenu

Je centralise les contenus de mon portfolio dans ces fichiers :

| Fichier                             | Contenu                                               |
| ----------------------------------- | ----------------------------------------------------- |
| `src/data/profile.ts`               | Identité, portrait, CV, présentation et tags          |
| `src/data/about.ts`                 | Biographie détaillée                                  |
| `src/data/navigation.ts`            | Libellés et ancres de la navbar                       |
| `src/data/projects.ts`              | Projets, couvertures, tags et liens                   |
| `src/data/skills.ts`                | Catégories et compétences                             |
| `src/data/experience.ts`            | Chronologie compacte et parcours détaillés            |
| `src/data/memory.ts`                | Profil de sauvegarde, GitHub, expérience et formation |
| `src/data/socialLinks.ts`           | Email, texte de contact et réseaux sociaux            |
| `src/features/intro/introConfig.ts` | Textes, durées, sons, volume et mode de relecture     |

Dans la Memory Card, j’affiche le nombre de dépôts publics de mon compte GitHub. Je le récupère sans token via l’API publique et je le mets en cache pendant une heure, avec une valeur de secours en cas d’indisponibilité. Je fixe `Last Save` dans la configuration en développement et je le génère à la date du build dans le fuseau Europe/Paris en production. Je calcule mes années d’expérience à partir de la référence définie dans les données.

## Assets et introduction audio

Je regroupe mes ressources dans les dossiers suivants :

- `src/assets/images/backgrounds/` : fond du site.
- `src/assets/images/playstation/` : logo, tranche des couvertures et carte mémoire.
- `src/assets/images/profile/` et `projects/` : portrait et couvertures des quatre projets.
- `src/assets/images/music/player-cover.svg` : vignette du lecteur musical.
- `src/assets/audio/psp-boot.m4a` et `psp-enter.m4a` : sons de démarrage et d’entrée.
- `src/assets/documents/` : mon CV en PDF, téléchargé par le bouton **Download CV**.

J’importe les médias depuis le code pour que Vite les inclue dans le build, sans dépendre du dossier Téléchargements de ma machine. Je regroupe les pictogrammes de marques dans `src/components/ui/BrandIcons.tsx`.

J’ai configuré l’introduction pour qu’elle se rejoue à chaque chargement (`replay: 'always'`). Elle progresse automatiquement vers **Welcome**, puis attend une interaction pour entrer dans mon portfolio. Je précharge les deux fichiers audio : je tente la lecture du premier au démarrage et je lance le second directement lors de l’interaction d’entrée. Je gère les refus de lecture automatique sans bloquer l’accès au site, avec le contrôle de son existant pour récupérer la lecture lorsque c’est nécessaire. En développement, je consulte les messages `[intro:boot]` pour vérifier le résultat réel de la première lecture.

Je regroupe la gestion audio, les délais et les pauses au changement de visibilité dans `src/features/intro/`. Pour modifier les durées ou les sons, je passe par `introConfig.ts`, puis je vérifie les deux étapes après un rechargement complet.

## Évolution prévue : PSP interactive en 2.5D

Je prévois d’intégrer une PSP interactive au centre de mon portfolio, en assemblant des calques visuels et une véritable interface React.

J’ai réservé son emplacement dans `src/sections/hero/PspStage.tsx`, avec le marqueur :

```text
TODO: PSP 2.5D integration
```

Pour le moment, je conserve cet emplacement vide : un conteneur relatif au ratio 2,3:1 et un point de montage absolu. Je le masque sous 1024 px pour préserver la mise en page sur tablette et mobile. Je n’ai pas encore implémenté la coque, l’écran ou les commandes de la console.

Pour cette intégration, je prévois :

- des exports Blender superposés pour la coque (`PspShell`), les reflets et les boutons ;
- un véritable écran React (`PspScreen`) avec son menu (`PspMenu`) ;
- des commandes indépendantes (`PspControls`, `PspButton`) ;
- des interactions à la souris, au clavier et via la Gamepad API.

Je prévois cet assemblage en 2.5D, sans Three.js. Ces éléments décrivent la prochaine étape du projet ; je conserve actuellement la réserve responsive et l’introduction animée déjà fonctionnelle.

Dans la navbar, je garde aussi `MusicPlayerPreview` comme préparation visuelle du lecteur musical : cadre bleu, vignette, libellé **Now Playing**, pictogrammes de lecture et égaliseur statique. Je n’y ai pas encore ajouté de lecture audio ni de commandes actives. Je l’affiche dès 1024 px et je le masque sur tablette et mobile.

## Vérifications

Avant de valider mes modifications, je lance :

```sh
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

Je teste la séquence d’introduction, les erreurs et réinitialisations audio, les dates et statistiques de la Memory Card, le cache GitHub, la mise en évidence après navigation et le retour en haut au chargement. Node.js 22 peut afficher des avertissements expérimentaux pour le retrait des types TypeScript et les timers simulés.

Je complète ces tests avec les contrôles navigateur de [ma liste de vérification](docs/architecture.md#vérifications-dans-le-navigateur), notamment pour les deux sons, les dialogues, les liens et les principaux formats d’écran.

J’exclus de Git les dépendances, builds, caches TypeScript, journaux, fichiers d’environnement locaux et captures de vérification.

## Licence et crédits

Je n’ai pas encore ajouté de licence à ce dépôt.

J’utilise le pictogramme Root-Me de [Simple Icons](https://github.com/simple-icons/simple-icons/blob/develop/icons/rootme.svg), distribué sous [CC0](https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md). J’intègre les médias fournis pour ce portfolio ; les marques et ressources tierces restent soumises à leurs conditions respectives.
