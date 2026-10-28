# Playful Portfolio

Base de portfolio personnel inspirée des interfaces PlayStation et PSP : fond bleu nuit, panneaux translucides, typographie technologique et composition modulaire.

**Phase 1 — base du portfolio.** Les initiales, le rôle, la localisation, la biographie, l'introduction, les compétences, les étiquettes du profil, le parcours et le CV sont personnalisés. Les autres textes, les projets et les statistiques restent des données de démonstration. Le portrait fourni est intégré dans Player 01. La PSP interactive n'est pas implémentée.

## Lancer le projet

Prérequis : **Node.js 22.12 ou supérieur**, npm.

```sh
npm install
npm run dev
```

Ouvrir l'adresse locale affichée par Vite, normalement **http://127.0.0.1:5173/**. Les modifications sont visibles immédiatement grâce au rechargement à chaud. Si le port est occupé, Vite indique le port suivant disponible. Le serveur reste local à l'ordinateur.

```sh
npm run build        # Vérification TypeScript et génération de dist/
npm test             # Dates de sauvegarde, XP et compteur GitHub (avec réponses simulées)
npm run preview      # Aperçu du build de production
npm run lint         # ESLint
npm run format:check # Vérification du formatage
npm run format       # Formatage avec Prettier
```

`package-lock.json` fixe les versions installées. `npm ci` permet une réinstallation reproductible.

## Stack

- React et TypeScript en mode strict.
- Vite pour le développement et le build statique.
- CSS Modules par composant et variables CSS globales.
- Lucide React pour les icônes d'interface, SVG locaux pour les marques.
- Inter et Oxanium servies localement avec Fontsource, sans requête vers Google Fonts.
- ESLint et Prettier.

Pas de framework UI, de bibliothèque d'animation ou de moteur 3D.

## Architecture

```text
src/
├── assets/
│   ├── documents/             # PDF du CV à télécharger
│   └── images/
│       ├── backgrounds/       # Fond fourni
│       ├── playstation/       # Memory Card, badge et logo fournis
│       └── projects/          # Quatre illustrations SVG de démonstration
├── components/
│   ├── layout/                # Header, Navigation, Footer
│   ├── ui/                    # UI partagée, ExpandablePanel et AccordionItem
│   ├── hero/                  # Hero, HeroIntro, ProfileCard
│   ├── psp/                   # PspStage vide uniquement
│   ├── music/                 # Aperçu visuel du lecteur, sans lecture audio
│   ├── projects/              # FeaturedProjects, ProjectCard
│   ├── skills/                # SkillsPanel et accordéons SkillCategory
│   ├── memory/                # MemoryCardPanel
│   ├── experience/            # ExperiencePanel et frises ExperienceTimeline
│   └── contact/               # ContactPanel
├── data/                      # Profil et contenus de démonstration
├── hooks/                     # Horloge et panneau agrandissable
├── styles/                    # Reset, variables, typographie et styles globaux
├── types/                     # Project, SkillCategory, Experience, ExperienceCategory
├── App.tsx                    # Composition de la page uniquement
├── App.module.css             # Grilles principales et réorganisation responsive
└── main.tsx
```

Les styles vivent auprès de leur composant. `Panel`, `Button`, `Tag`, `SectionTitle` et `IconButton` constituent le petit design system réutilisable. `ExpandingDialog` et `useExpandingDialog` partagent le panneau modal, les styles, les animations et la gestion du focus entre About Me, Skills et Experience. `ExpandablePanel` et `AccordionItem` conservent les aperçus et accordéons de Skills et Experience. Les composants ne contiennent pas de copies des listes de données.

## Modifier le contenu

| Fichier                   | Contenu                                                       |
| ------------------------- | ------------------------------------------------------------- |
| `src/data/profile.ts`     | Nom, rôle, localisation, CV, introduction et tags             |
| `src/data/navigation.ts`  | Liens et libellés de navigation                               |
| `src/data/projects.ts`    | Projets, images, descriptions, tags, catégorie, URL et GitHub |
| `src/data/skills.ts`      | Titres, icônes et compétences des six catégories              |
| `src/data/experience.ts`  | Chronologie compacte, catégories et parcours détaillés        |
| `src/data/memory.ts`      | Fiche de sauvegarde, GitHub, expérience et quête actuelle     |
| `src/data/socialLinks.ts` | Texte de contact, adresse email et réseaux sociaux            |

Les projets portent un label **Demo** via `isPlaceholder`. Retirer ce drapeau lors de l'ajout de vrais projets. Les liens `url` et `githubUrl` sont facultatifs : aucun lien de démonstration ne pointe vers une destination arbitraire.

La **Memory Card** présente le profil sous forme de sauvegarde. En développement, `Last Save` utilise la date fixe `2026-10-26` de `src/data/memory.ts`. En production, Vite inscrit la date de génération du build (fuseau Europe/Paris) dans le bundle : elle change lors d'un nouveau build/déploiement, jamais à chaque visite. `Years of XP` utilise l'année du visiteur avec la référence 2026 = 2 ans. `Current Quest` reste modifiable dans les données.

`Projects Completed` lit le champ `public_repos` de l'[API publique GitHub](https://docs.github.com/en/rest/users/users#get-a-user) pour Spraypax, sans jeton ni authentification. Le résultat valide est conservé une heure en cache local ; une visite après expiration déclenche une nouvelle récupération. Le compteur affiche 13 par défaut, notamment hors ligne, si GitHub limite les requêtes, si la réponse est invalide ou si la récupération dépasse huit secondes. Le bloc reste utilisable quand le stockage local est désactivé.

Les liens GitHub, LinkedIn et Root-Me ouvrent les profils dans un nouvel onglet et restent alignés à droite du bouton « Send a message ». Ce bouton ouvre le logiciel de messagerie avec `contact.email` comme destinataire, copie également l'adresse et affiche une confirmation pendant trois secondes. Si la copie n'est pas disponible, le lien email reste utilisable sans message d'erreur. Aucun service d'envoi ni formulaire serveur n'est prévu dans cette phase.

Le pictogramme Root-Me provient de [Simple Icons](https://github.com/simple-icons/simple-icons/blob/develop/icons/rootme.svg), distribué sous [CC0](https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md), et reprend la couleur des autres icônes sociales.

## Custom assets

Les fichiers fournis ont été **copiés sans modification** dans le projet :

| Fichier utilisateur              | Destination                                              |
| -------------------------------- | -------------------------------------------------------- |
| `background port folio.png`      | `src/assets/images/backgrounds/portfolio-background.png` |
| `MemoryCard.png`                 | `src/assets/images/playstation/memory-card.png`          |
| `Badge vertical PlayStation.png` | `src/assets/images/playstation/playstation-badge.png`    |
| `Logo Playstation.png`           | `src/assets/images/playstation/playstation-logo.png`     |

La Memory Card est une image indépendante, jamais reconstruite en CSS. Le badge est superposé sur le bord gauche des couvertures ; le désactiver avec `showPlaystationBadge: false` dans les données ou avec la prop du composant `ProjectCard`.

**Avatar :** le portrait pixel-art fourni est copié sans modification dans `src/assets/images/profile/avatar.png`, puis importé par `src/data/profile.ts`. `ProfileCard` l'affiche centré avec `object-fit: cover` dans le cadre existant, dont les dimensions sont conservées. Le chemin et le texte alternatif sont centralisés dans `profile.avatar`.

Les quatre couvertures de projets sont des illustrations SVG locales temporaires. Les remplacer en important les nouveaux visuels dans `src/data/projects.ts`. Il n'y a aucune image distante ni dépendance aux fichiers du dossier Téléchargements.

**CV :** le document fourni est copié à l'identique dans `src/assets/documents/DUPONT_Lelian_CV_ATS.pdf`. Le bouton **Download CV** utilise un lien natif avec l'attribut `download` et conserve le nom `DUPONT_Lélian_CV_ATS.pdf` lors du téléchargement. Le PDF est importé par Vite et inclus dans le build. Pour le mettre à jour, remplacer ce fichier ; son URL et le nom proposé au téléchargement sont centralisés dans `src/data/profile.ts`.

Les PNG originaux représentent environ 5,3 Mo. Ils sont conservés intacts ; des exports WebP/AVIF adaptés aux dimensions d'affichage pourront réduire ce poids lors de la phase d'optimisation. Les images de contenu ont des dimensions explicites et les images des panneaux utilisent le chargement différé.

## Responsive et conventions

Les principaux seuils sont identiques dans les composants :

- **1440 px et plus** : composition desktop, trois panneaux dans la rangée centrale.
- **1024–1439 px** : hero en trois colonnes ; projets, compétences et Memory Card restent sur une seule ligne, avec des dimensions internes adaptées aux petits écrans PC.
- **768–1023 px** : hero en deux colonnes, navigation dépliable, projets sur toute la largeur puis compétences et Memory Card côte à côte.
- **Moins de 768 px** : ordre vertical, projets en deux colonnes, puis une colonne sous 360 px.

`App.module.css` et `Hero.module.css` pilotent les grilles. Les règles locales adaptent les composants aux mêmes seuils. Quelques ajustements de densité complètent ces seuils : le sous-titre du logo disparaît sous 1600 px, le lecteur est plus compact sous 1200 px, et les micro-libellés décoratifs disparaissent dans les en-têtes étroits via une container query.

Les tokens de couleurs, espacements, ombres, rayons, transitions, hauteur de navigation et z-index sont centralisés dans `src/styles/variables.css`. L'échelle de profondeur est limitée à fond, contenu, panneaux, navigation et overlays ; chaque futur assemblage PSP aura son propre contexte d'empilement.

Les ancres sont `#home`, `#about`, `#projects`, `#skills`, `#experience` et `#contact`. L'état actif suit l'ancre sélectionnée, y compris avec les boutons précédent/suivant du navigateur. Le header sticky reste dans le flux du document. Les marges d'ancrage compensent sa hauteur.

L'accessibilité comprend :

- HTML sémantique, hiérarchie de titres et régions nommées.
- Lien d'évitement vers le contenu et focus visible.
- Navigation mobile au clavier, fermeture avec Échap et retour du focus.
- Textes alternatifs pour les images utiles, images décoratives ignorées.
- Panneaux About Me, Skills et Experience modaux natifs, focus contenu dans le panneau, fermeture par Échap et retour du focus au déclencheur.
- Accordéons indépendants avec `aria-expanded`, désactivés jusqu'à la fin de l'agrandissement.
- Prise en compte de `prefers-reduced-motion` pour les animations, les transitions et le défilement.

L'horloge affiche la date, l'année et l'heure en **anglais**, selon le fuseau horaire du navigateur. Elle se met à jour toutes les 15 secondes et ne demande aucune permission. L'icône de batterie est décorative.

## Introduction au portfolio

`IntroExperience`, ajouté autour d'`App` dans `src/main.tsx`, affiche une séquence originale inspirée des interfaces de consoles portables. Le portfolio se charge derrière l'overlay et reste `inert`, masqué aux technologies d'assistance et sans défilement jusqu'à la fin de la transition. L'entrée commence toujours en haut, même si l'URL contient une ancre. `installStartAtTop`, installé avant React, désactive la restauration automatique du navigateur et replace instantanément la page à zéro au chargement, lors de `pageshow` (avec une seconde application au prochain rendu) et au retour dans un onglet visible. L'introduction confirme cette position pendant la validation et après la révélation. Le wrapper retrouve ensuite son rendu normal, sans transformation persistante ; la navigation vers les ancres, le header sticky et les dialogues existants gardent leur fonctionnement.

Tout se configure dans **`src/data/intro.ts`** :

- `durations` : préchargement de 160 ms, démarrage de 3 600 ms, passage au menu de 650 ms, validation de 580 ms et révélation de 1 950 ms. `reducedDurations` simplifie la séquence pour la réduction des mouvements.
- `audio.boot`, `audio.enter` et `audio.volume` : fichiers locaux dans `src/assets/audio/` et volume. Les deux fichiers fournis sont copiés sans modification, préchargés et inclus dans le build.
- `copy.enter` : libellé « Click to enter » sur le second écran. `copy.system` contient « System / 01 », affiché au-dessus de « Welcome ». Le premier écran démarre automatiquement, sans bouton « Click to start ». Les autres textes sont regroupés dans `copy` ; l'identité L.D et le rôle proviennent du profil existant. Le statut « SYSTEM READY » a été retiré du composant et de ses styles.
- `replay: 'always'` : rejouer à chaque chargement (valeur par défaut). Utiliser `'session'` pour une fois par session, ou `'disabled'` pour désactiver l'introduction. `sessionKey` permet de versionner la mémorisation. Recharger la page après un changement de configuration.

`IntroSequence` suit automatiquement le chemin `loading → booting → settling → ready`, puis `confirming → revealing → complete` après le clic d'entrée habituel. Le premier écran n'attend aucune interaction pour atteindre « Welcome ». Toute la surface du second écran déclenche l'entrée, y compris les textes et les décors : le gestionnaire de clic de l'overlay utilise la même validation protégée que le bouton central. L'indicateur de son de cet écran est purement informatif pour ne pas créer de zone exclue. « Skip animation » passe uniquement au menu d'entrée. Un seul délai est actif à la fois, indépendant des événements CSS : un échec d'animation ou de son ne bloque pas l'accès.

Le premier son est tenté automatiquement à chaque chargement complet ou actualisation, au début de l'animation de démarrage. Il repart de zéro. Sa promesse est gérée : un refus d'autoplay n'interrompt pas la progression vers le deuxième écran. Si le navigateur refuse cette lecture, le contrôle existant affiche « Enable sound » et permet une nouvelle tentative synchronisée, limitée à une fois et impossible pendant une lecture déjà commencée ou après le passage au menu. Le deuxième son reste appelé directement dans son clic d'entrée et une seule validation est acceptée. La lecture automatique audible dépend de l'autorisation du navigateur ; les [règles d'autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) sont respectées.

En développement, les messages `[intro:boot]` indiquent chaque tentative du premier son, sa position de départ et le résultat réel de la promesse `play()` : `playing`, `blocked`, `aborted` ou `failed`, avec le nom et le message exacts de l'exception. Ces diagnostics ne concernent pas le deuxième son et ne sont pas activés en production. Après un chargement complet, le compteur repart à 1 pour la tentative automatique ; une éventuelle récupération est la tentative 2. Aucun état audio n'est partagé entre les documents.

**Opera GX en développement :** si la tentative automatique est refusée avec `NotAllowedError`, ouvrir le badge à gauche de l'adresse du site, puis **Paramètres des sites → Son → Autoriser**, et actualiser la page. Sur `http://127.0.0.1:5173`, cette autorisation a permis la lecture du premier son sans clic après trois F5 successifs et une ouverture dans un nouvel onglet. Le réglage « Automatique (par défaut) » la refusait. Cette préférence appartient au profil Opera de l'utilisateur ; elle n'est pas distribuée par le portfolio et ne donne aucune autorisation aux autres visiteurs.

`IntroAudio` centralise les lectures, la sourdine, les erreurs et le nettoyage. Chaque nouvelle lecture du premier son repart de `currentTime = 0` ; si le média refuse encore ce repositionnement, `load()` réinitialise sa ressource. Un identifiant de tentative invalide les anciennes promesses après une pause ou un nettoyage : leur résolution tardive ne peut plus arrêter une nouvelle lecture sur le même élément, notamment avec StrictMode. Aucun état de lecture audio n'est conservé entre les chargements. La séquence et le son sont mis en pause lorsque l'onglet devient invisible, puis reprennent au retour. Les échéances, l'audio et les styles de scroll sont nettoyés au démontage, y compris avec StrictMode. La transition finale rend le focus au contenu principal et supprime l'overlay et ses éléments audio.

Les vagues sont des SVG originaux, accompagnés de huit points lumineux. Les animations CSS emploient principalement `transform` et `opacity`, avec un flou bref lors de la révélation. Aucun asset officiel ni nouvelle bibliothèque n'est ajouté. Les timings de la montée du monogramme et de la validation correspondent aux attaques des deux sons. Le mode réduit retire les vagues animées et conserve une transition simple. L'objectif est la fluidité ; les performances réelles dépendent du navigateur et du matériel.

Les tests `tests/intro.test.mjs` couvrent la progression, l'attente utilisateur, les actions répétées, les pauses, le nettoyage StrictMode, les modes de relecture, les réinitialisations audio successives, les promesses périmées et les erreurs audio. `tests/startAtTop.test.mjs` vérifie le retour instantané en haut, la restauration tardive, le retour dans un onglet et le nettoyage des listeners. Les contrôles navigateur complètent ces tests pour les actualisations successives, le responsive, les médias et le retour au portfolio après un défilement.

## Panneau About Me

Le bouton **About me** et toute la carte **Player 01** ouvrent une seule instance de `AboutDialog`, contrôlée depuis `Hero`. Les deux déclencheurs partagent `aria-controls` et l'état d'ouverture. L'animation part du déclencheur utilisé ; la croix et Échap referment le panneau vers ce même déclencheur et lui rendent le focus. Les tentatives d'ouverture pendant une ouverture, une fermeture ou lorsque le panneau est déjà ouvert sont ignorées.

Les dix paragraphes fournis sont centralisés, sans reformulation, dans `src/data/about.ts`. Le texte conserve une largeur de lecture limitée, des paragraphes espacés et un défilement interne accessible au clavier si nécessaire. L'en-tête et la croix restent visibles pendant la lecture. Le style, les animations de 440 ms et 300 ms, la réduction des mouvements et le responsive proviennent du même système que Skills et Experience. Le lien **About** de la navbar conserve son ancre et son glow temporaire sur Player 01.

## Panneau Skills

Le format compact affiche uniquement les six catégories et leurs chevrons, sans menus interactifs. Toute la carte est un bouton d'agrandissement accessible au clavier. Elle conserve sa place dans la grille pendant qu'un `<dialog>` modal s'agrandit depuis sa position vers le centre de l'écran.

`useExpandingDialog` gère les phases fermé, ouverture, ouvert et fermeture avec la Web Animations API. Les catégories ne deviennent utilisables qu'après la fin effective de l'animation. La croix et Échap ferment le panneau avec une animation inverse ; la page retrouve son défilement et le focus revient au bouton Skills. Les animations respectent la préférence de réduction des mouvements.

Chaque `SkillCategory` possède son propre état d'ouverture et affiche ses compétences sous forme de tags discrets. Les six icônes Lucide monochromes sont visibles uniquement dans le grand panneau ; le format compact conserve seulement les titres et les chevrons. Les titres, les icônes et les listes de compétences sont centralisés dans `src/data/skills.ts`. Plusieurs catégories peuvent être ouvertes simultanément et elles sont toutes refermées lors d'une nouvelle ouverture du panneau. Sur les petits écrans, le panneau occupe presque toute la fenêtre et les catégories défilent sous son en-tête.

## Panneau Experience

La chronologie compacte conserve sa présentation, ses dimensions et ses données actuelles. Toute la carte ouvre un grand panneau via le même composant `ExpandablePanel` que Skills : animation depuis la carte, croix de fermeture, Échap, verrouillage du défilement de fond et retour du focus.

Les catégories **Professional Experience** et **Academic Path**, définies dans `src/data/experience.ts`, sont visibles uniquement dans le grand panneau et deviennent interactives après la fin de l'agrandissement. Elles utilisent `AccordionItem`, comme Skills, avec des chevrons animés et des ouvertures indépendantes. Une mallette et une toque universitaire Lucide monochromes accompagnent leurs titres, uniquement dans cette version agrandie. Chaque réouverture du panneau remet les deux catégories à l'état fermé.

`ExperienceTimeline` affiche les trois expériences et les trois formations de la plus récente à la plus ancienne, avec une ligne verticale unique, un marqueur par étape et des textes placés à droite, y compris sur mobile. Les dates, le contexte, l'établissement, la localisation, la spécialisation et les missions sont fournis par les données, sans déduire les informations manquantes. Le poste chez MIF et le Master ESGI portent un badge **Ongoing** et un marqueur lumineux discret. Les étapes apparaissent progressivement à l'ouverture de leur catégorie ; la préférence de réduction des mouvements est respectée. La chronologie compacte reste indépendante des informations détaillées.

## Future intégration PSP 2.5D

`src/components/psp/PspStage.tsx` contient le marqueur :

```text
TODO: PSP 2.5D integration
```

Ce composant réserve uniquement un emplacement responsive de ratio 2,3:1, avec un conteneur relatif et un point de montage absolu. **Il ne contient aucune PSP artificielle, coque, commande, image de console ou écran.** La réserve vide est masquée sous 1024 px pour préserver l'ordre de lecture de la phase 1.

Plus tard, ce point de montage pourra accueillir les exports Blender superposés (`PspShell`, reflets, boutons), un véritable écran React (`PspScreen`, `PspMenu`) et les commandes (`PspControls`, `PspButton`). Les interactions souris, clavier et Gamepad API seront implémentées à cette étape seulement, sans Three.js.

La navbar est transparente, sans flou ni aplat de couleur, et laisse apparaître le fond global sous son trait de séparation. Sa grille place les liens près du logo, puis le lecteur musical avant l'horloge.

`MusicPlayerPreview` reprend le cadre bleu du template, le libellé **Now Playing**, une vignette temporaire issue du visuel Orbit, le titre, les pictogrammes de lecture et un égaliseur statique. Il reste purement visuel : aucun bouton actif, animation de lecture ou chargement audio. Son nom accessible précise que la lecture n'est pas encore disponible. Le lecteur est visible dès 1024 px ; sur les petits écrans PC, sa présentation se compacte, et il est masqué sur tablette et mobile.

## Vérification

Le build exécute TypeScript avant Vite. Vérifier également `npm run lint`, `npm run format:check`, les six ancres, la navigation mobile au clavier, l'absence de défilement horizontal aux principaux breakpoints, le portrait centré dans le cadre Player 01 et l'absence de contenu dans `PspStage`.

Pour Skills : vérifier l'absence des anciennes jauges, le mode compact non déroulable, le verrouillage pendant l'agrandissement, l'ouverture simultanée de plusieurs catégories, la fermeture par croix et Échap, le retour du focus et le défilement du panneau sur mobile.

Pour Experience : vérifier la conservation de la chronologie compacte, les deux menus uniquement dans le panneau agrandi, l'ordre des six étapes, les missions et les deux badges Ongoing, le masquage des frises repliées, le verrouillage pendant l'ouverture, les ouvertures indépendantes, la fermeture et le retour du focus. Vérifier le défilement vertical et l'absence de débordement des textes sur mobile. Contrôler également Skills après une modification des composants partagés.
