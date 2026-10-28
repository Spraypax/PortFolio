# L.D — Portfolio cybersécurité

Portfolio personnel de Lélian Dupont, étudiant en cybersécurité. Le site présente son profil, ses compétences, ses projets et son parcours dans une interface inspirée de PlayStation et de la PSP : fond bleu nuit, panneaux translucides et détails d’interface de console.

Le projet est une application React sur une seule page, construite avec Vite. La navigation repose sur des ancres ; aucun serveur applicatif ni routeur n’est nécessaire.

## Fonctionnalités

- Introduction animée : démarrage automatique, écran **Welcome**, puis entrée par clic sur toute la surface ou par clavier, avec deux sons locaux.
- Navbar transparente, retour à l’accueil par le logo, défilement fluide et mise en évidence temporaire du panneau ciblé.
- Présentation **Player 01**, biographie **About me** agrandissable et téléchargement du CV en PDF.
- Quatre projets : **Honeypot**, **Vulnerability Scanner**, **RAT** et **Port Folio**, avec couvertures locales, tranches PlayStation et liens vers leurs dépôts.
- Panneaux **Skills** et **Experience** agrandissables, avec accordéons indépendants utilisables uniquement après l’ouverture du panneau.
- **Memory Card** : date de sauvegarde, compteur de dépôts publics GitHub, années d’expérience, formation actuelle et indicateurs système.
- Contact par email avec copie de l’adresse et confirmation discrète ; liens GitHub, LinkedIn et Root-Me.
- Mise en page responsive, navigation mobile, focus visible, dialogues au clavier et prise en compte de la réduction des mouvements.

Le lecteur musical de la navbar reste un aperçu visuel. `PspStage` réserve un emplacement vide pour une future intégration PSP ; aucune console interactive n’y est encore implémentée. Les labels `Demo` existants des cartes projets sont conservés via `isPlaceholder`.

## Stack technique

- **React 19** et **TypeScript** en mode strict.
- **Vite** et son plugin React pour le développement et le build.
- **CSS Modules**, variables CSS et styles globaux ; animations CSS et Web Animations API.
- **Lucide React** et pictogrammes SVG pour les icônes.
- **Inter** et **Oxanium**, servies localement avec Fontsource.
- **ESLint**, **Prettier** et tests intégrés à **Node.js**.

Les dépendances et leurs versions sont déclarées dans `package.json` et verrouillées dans `package-lock.json`.

## Installation

Prérequis : **Node.js 22.12 ou supérieur** et **npm**.

```sh
git clone https://github.com/Spraypax/PortFolio.git
cd PortFolio
npm ci
npm run dev
```

Ouvrir l’adresse affichée par Vite, normalement [http://127.0.0.1:5173/](http://127.0.0.1:5173/). Si le port est occupé, Vite en choisit un autre. Le serveur de développement écoute uniquement sur la machine locale et recharge les modifications à chaud.

## Commandes

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

```sh
npm run build
npm run preview
```

`dist/` contient les fichiers statiques à héberger. La commande `preview` permet de les vérifier localement ; elle ne publie pas le site. Aucun déploiement automatique n’est configuré dans ce dépôt.

## Structure du projet

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

Les composants et leurs styles sont voisins. L’alias `@/` pointe vers `src/` dans Vite et TypeScript ; les imports entre fichiers voisins restent relatifs. Les configurations des outils restent à la racine, à leur emplacement habituel.

Voir [l’architecture détaillée](docs/architecture.md) pour les responsabilités et les conventions de maintenance.

## Modifier le contenu

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

La Memory Card utilise le nombre de dépôts publics du compte configuré, obtenu sans token auprès de l’API GitHub et mis en cache pendant une heure. En cas d’indisponibilité, elle conserve sa valeur de secours. `Last Save` est fixé par la configuration en développement et généré à la date du build dans le fuseau Europe/Paris en production. Les années d’expérience évoluent à partir de la référence définie dans les données.

## Assets et introduction audio

- `src/assets/images/backgrounds/` : fond du site.
- `src/assets/images/playstation/` : logo, tranche des couvertures et carte mémoire.
- `src/assets/images/profile/` et `projects/` : portrait et couvertures des quatre projets.
- `src/assets/images/music/player-cover.svg` : vignette du lecteur musical.
- `src/assets/audio/psp-boot.m4a` et `psp-enter.m4a` : sons de démarrage et d’entrée.
- `src/assets/documents/DUPONT_Lelian_CV_ATS.pdf` : CV téléchargé par le bouton **Download CV**.

Les médias sont importés depuis le code et inclus par Vite dans le build. Aucune ressource ne dépend du dossier Téléchargements de la machine de développement. Les pictogrammes de marques sont regroupés dans `src/components/ui/BrandIcons.tsx`.

L’introduction est configurée pour se rejouer à chaque chargement (`replay: 'always'`). Elle progresse automatiquement vers **Welcome**, puis attend une entrée. Les deux fichiers audio sont préchargés ; le premier est tenté au démarrage et le second est lancé directement lors de l’interaction d’entrée. Un refus de lecture automatique par le navigateur ne bloque jamais l’accès au portfolio. Le contrôle de son existant permet une récupération lorsqu’elle est nécessaire. En développement, les messages `[intro:boot]` indiquent le résultat réel de la première lecture.

Le comportement audio, les délais et les pauses au changement de visibilité sont gérés ensemble dans `src/features/intro/`. Pour modifier les durées ou les sons, utiliser `introConfig.ts` et vérifier les deux étapes après un rechargement complet.

## Vérifications

```sh
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

Les tests couvrent la séquence d’introduction, les erreurs et réinitialisations audio, les dates et statistiques de la Memory Card, le cache GitHub, la mise en évidence après navigation et le retour en haut au chargement. Node.js 22 peut afficher des avertissements expérimentaux pour le retrait des types TypeScript et les timers simulés.

Les contrôles navigateur complémentaires sont décrits dans [la liste de vérification](docs/architecture.md#vérifications-dans-le-navigateur), notamment les deux sons, les dialogues, les liens et les principaux formats d’écran.

Les dépendances, builds, caches TypeScript, journaux, fichiers d’environnement locaux et captures de vérification sont ignorés par Git.

## Licence et crédits

Aucun fichier de licence du projet n’est actuellement présent dans le dépôt.

Le pictogramme Root-Me provient de [Simple Icons](https://github.com/simple-icons/simple-icons/blob/develop/icons/rootme.svg), distribué sous [CC0](https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md). Les médias du portfolio sont les fichiers fournis pour ce projet ; les marques et ressources tierces restent soumises à leurs conditions respectives.
