# Playful Portfolio

Base de portfolio personnel inspirée des interfaces PlayStation et PSP : fond bleu nuit, panneaux translucides, typographie technologique et composition modulaire.

**Phase 1 — base du portfolio.** Les informations personnelles, les projets, les niveaux de compétences, les statistiques et l'expérience sont des données de démonstration. La PSP interactive et la photo de profil ne sont pas implémentées.

## Lancer le projet

Prérequis : **Node.js 22.12 ou supérieur**, npm.

```sh
npm install
npm run dev
```

Ouvrir l'adresse locale affichée par Vite, normalement **http://127.0.0.1:5173/**. Les modifications sont visibles immédiatement grâce au rechargement à chaud. Si le port est occupé, Vite indique le port suivant disponible. Le serveur reste local à l'ordinateur.

```sh
npm run build        # Vérification TypeScript et génération de dist/
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
├── assets/images/
│   ├── backgrounds/           # Fond fourni
│   ├── playstation/           # Memory Card, badge et logo fournis
│   └── projects/              # Quatre illustrations SVG de démonstration
├── components/
│   ├── layout/                # Header, Navigation, Footer
│   ├── ui/                    # Button, Panel, Tag, SectionTitle, IconButton
│   ├── hero/                  # Hero, HeroIntro, ProfileCard
│   ├── psp/                   # PspStage vide uniquement
│   ├── music/                 # Aperçu visuel du lecteur, sans lecture audio
│   ├── projects/              # FeaturedProjects, ProjectCard
│   ├── skills/                # SkillsPanel, SkillBar
│   ├── memory/                # MemoryCardPanel
│   ├── experience/            # ExperiencePanel
│   ├── editorial/             # EditorialPanel
│   └── contact/               # ContactPanel
├── data/                      # Contenus temporaires
├── hooks/                     # Horloge et détection d'entrée dans le viewport
├── styles/                    # Reset, variables, typographie et styles globaux
├── types/                     # Project, Skill, Experience
├── App.tsx                    # Composition de la page uniquement
├── App.module.css             # Grilles principales et réorganisation responsive
└── main.tsx
```

Les styles vivent auprès de leur composant. `Panel`, `Button`, `Tag`, `SectionTitle` et `IconButton` constituent le petit design system réutilisable. Les composants ne contiennent pas de copies des listes de données.

## Modifier le contenu

| Fichier                   | Contenu                                                       |
| ------------------------- | ------------------------------------------------------------- |
| `src/data/profile.ts`     | Nom, rôle, localisation, introduction et tags                 |
| `src/data/navigation.ts`  | Liens et libellés de navigation                               |
| `src/data/projects.ts`    | Projets, images, descriptions, tags, catégorie, URL et GitHub |
| `src/data/skills.ts`      | Compétences, icônes, valeurs et couleurs                      |
| `src/data/experience.ts`  | Périodes, postes et descriptions                              |
| `src/data/memory.ts`      | Nom de sauvegarde, date et compteurs                          |
| `src/data/socialLinks.ts` | Texte de contact, adresse email et réseaux sociaux            |

Les projets portent un label **Demo** via `isPlaceholder`. Retirer ce drapeau lors de l'ajout de vrais projets. Les liens `url` et `githubUrl` sont facultatifs : aucun lien de démonstration ne pointe vers une destination arbitraire.

Pour activer le contact, renseigner `contact.email` et les propriétés `url` des réseaux sociaux. En leur absence, les boutons sont désactivés et un message visible indique que les contacts sont des placeholders. Le bouton email ouvre le logiciel de messagerie ; aucun service d'envoi ni formulaire serveur n'est prévu dans cette phase.

## Custom assets

Les fichiers fournis ont été **copiés sans modification** dans le projet :

| Fichier utilisateur              | Destination                                              |
| -------------------------------- | -------------------------------------------------------- |
| `background port folio.png`      | `src/assets/images/backgrounds/portfolio-background.png` |
| `MemoryCard.png`                 | `src/assets/images/playstation/memory-card.png`          |
| `Badge vertical PlayStation.png` | `src/assets/images/playstation/playstation-badge.png`    |
| `Logo Playstation.png`           | `src/assets/images/playstation/playstation-logo.png`     |

La Memory Card est une image indépendante, jamais reconstruite en CSS. Le badge est superposé sur le bord gauche des couvertures ; le désactiver avec `showPlaystationBadge: false` dans les données ou avec la prop du composant `ProjectCard`.

**Avatar :** lors d'une phase ultérieure, créer `src/assets/images/profile/avatar.png`, puis intégrer explicitement l'image dans `ProfileCard`. Ce dossier n'est pas créé artificiellement tant qu'il est vide. **Déposer un fichier à cet emplacement ne l'affiche pas automatiquement : le cadre est volontairement vide dans cette première version.**

Les quatre couvertures de projets sont des illustrations SVG locales temporaires. Les remplacer en important les nouveaux visuels dans `src/data/projects.ts`. Il n'y a aucune image distante ni dépendance aux fichiers du dossier Téléchargements.

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
- Indicateurs natifs de progression avec libellés accessibles.
- Prise en compte de `prefers-reduced-motion` pour les transitions, les jauges et le défilement.

L'horloge affiche la date, l'année et l'heure en **anglais**, selon le fuseau horaire du navigateur. Elle se met à jour toutes les 15 secondes et ne demande aucune permission. L'icône de batterie est décorative.

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

Le build exécute TypeScript avant Vite. Vérifier également `npm run lint`, `npm run format:check`, les six ancres, la navigation mobile au clavier, l'absence de défilement horizontal aux principaux breakpoints, le cadre photo vide et l'absence de contenu dans `PspStage`.
