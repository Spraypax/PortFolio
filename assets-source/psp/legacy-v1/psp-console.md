# PSP interactive — maintenance

## Périmètre et sources

La PSP remplace l’emplacement vide de `src/sections/hero/PspStage`. Les autres sections, la grille de `Hero`, la navbar, le fond du site, le lecteur musical et les sons d’introduction n’ont pas été modifiés. Sur tablette/mobile, le composant PSP occupe une ligne de la grille existante ; son écran peut être ouvert dans une vue agrandie.

Source utilisée : **« PSP red » de aXel**, distribuée sous **Creative Commons Attribution 3.0**, provenant de [Blend Swap](http://www.blendswap.com/blends/view/25546). La licence fournie accompagne le modèle dans `assets-source/psp/BLENDSWAP_LICENSE.txt`. Une attribution est également accessible avec le bouton **Select** dans la console.

Le fichier fourni, créé pour Blender 2.61, est conservé **octet pour octet** dans `assets-source/psp/PSP-original.blend`. Son SHA-256, identique à celui du fichier dans Downloads, est :

```text
B61BD11C5000B7DFCB9ECC386BB0FC5D81E61D2A0DFF299CF28243B682CE5378
```

`PSP-portfolio.blend` est la copie de travail modifiée. `reference.png` conserve la capture donnée par l’utilisateur. `original-inventory.json` décrit les objets, matériaux, UV, textures, modificateurs et dimensions avant adaptation.

L’inventaire original compte 29 objets, dont 25 meshes (y compris le studio et un mesh vide), 3 caméras et 1 lumière. Dix images sont intégrées au fichier. La coque, le joystick et les boutons système sont déjà séparés ; les quatre boutons d’action et les quatre directions sont chacun réunis en un mesh contenant des pièces déconnectées. La coque et la plupart des commandes utilisent un modificateur Subdivision Surface.

## Travail Blender réalisé

La géométrie de la PSP fournie est réellement réutilisée. Le studio initial, ses plans lumineux, son sol, ses anciennes caméras et le mesh vide ont été retirés de la copie. La coque, les supports circulaires, les épaules, les pièces inférieures, le joystick et les boutons sont conservés et adaptés.

- Conversion des matériaux rouges en matériaux Principled PBR graphite/noir, avec rugosité différenciée, vernis modéré et micro-relief procédural.
- Réutilisation des UV et des textures originales pour les symboles des boutons ; conversion de leur fond rouge en noir et de leurs inscriptions en bleu argenté dans les matériaux.
- Élargissement de la dalle centrale et adaptation des ailes latérales et des marges pour rapprocher les proportions de la référence.
- Deux bordures chromées physiques ajoutées sous forme de courbes 3D, suivant le contour évalué de la coque, ainsi qu’une lèvre autour de l’écran.
- Séparation des pièces déconnectées du D-pad et des boutons d’action. Home, Select, Start et les deux boutons de volume sont rendus séparément.
- Ajout de reliefs fins sur le joystick et de détails de haut-parleur. Les petites inscriptions qui disparaissaient sur la coque subdivisée ont été rétablies : marque PS issue de la texture fournie, SONY en texte éditable, PSP en courbes, indications système et libellés inférieurs.
- Remplacement du contenu original de l’écran par une ouverture transparente et une vitre indépendante. Le fond affiché par React est une illustration dédiée, générée avec ImageGen : ville nocturne bleue, galaxie, lune et silhouette assise. Ce fond ne remplace pas celui du portfolio.

Les objets sont classés dans `PSP_ROOT` : `BODY`, `SCREEN`, `DPAD`, `ACTION_BUTTONS`, `SYSTEM_BUTTONS`, `ANALOG`, `REFLECTIONS`, `SHADOWS`, `STUDIO`. Les objets interactifs, y compris leurs libellés, portent une propriété `psp_control`.

Le résultat est une adaptation du modèle fourni à la référence, pas une copie pixel pour pixel de la photographie. La topologie de la coque, certains petits détails et l’illustration d’écran restent propres à cette réalisation.

## Caméra, éclairage et calage

Caméra perspective fixe, verrouillée en position, rotation et échelle :

| Paramètre               | Valeur                            |
| ----------------------- | --------------------------------- |
| Résolution              | 1620 × 698, transparent RGBA      |
| Focale / capteur        | 99,15277 mm / 36 mm               |
| Position XYZ            | 3,049518 ; −11,258713 ; −2,479765 |
| Rotation XYZ en radians | 1,866937 ; −0,138146 ; 0,264990   |
| Décalage optique XY     | −0,007640 ; −0,028690             |
| Moteur / échantillons   | Cycles / 48, débruitage activé    |
| Gestion des couleurs    | AgX                               |

La position de la caméra découle d’un ajustement sur les quatre coins de l’écran de référence. Le repère du modèle original place la façade vers −Y et la verticale sur Z ; les coordonnées de caméra reflètent ce repère.

Éclairage par quatre surfaces : softbox froide (440 W, 5 × 2), bord bleu (340 W, 3 × 1), bord violet (230 W, 3 × 1) et remplissage frontal (25 W, 4 × 3). Les positions, couleurs et cibles exactes sont conservées dans `scripts/psp/build_scene.py` et dans le `.blend`. Le monde contribue avec une intensité de 0,35. Le fond est transparent.

Coins de l’écran dans la capture de 810 × 349, puis projection de la dalle finale ramenée à cette même résolution :

| Coin           | Référence X / Y | Projection X / Y |
| -------------- | --------------- | ---------------- |
| A, haut gauche | 199 / 30        | 198,22 / 29,14   |
| B, haut droite | 671 / 46        | 672,35 / 46,94   |
| C, bas droite  | 647 / 287       | 645,78 / 285,78  |
| D, bas gauche  | 158 / 251       | 158,65 / 252,14  |

Les valeurs exactes pour l’assemblage sont exportées automatiquement dans `src/assets/images/psp/layout.json`. Quatre repères `ScreenCornerA…D`, rattachés à `ScreenOpening`, sont enregistrés dans la scène. Le composant HTML de 480 × 272 est projeté sur ces quatre points par une homographie CSS `matrix3d`, calculée par `screenProjection.ts`. Il ne s’agit pas d’une rotation CSS réglée à l’œil.

Le redimensionnement applique une seule échelle au canevas complet. La coque, les zones de clic et le contenu d’écran conservent ainsi le même repère. Aucun suivi de souris, flottement, zoom de console ou moteur 3D ne s’exécute dans le navigateur.

## Calques exportés

Dans `src/assets/images/psp/` :

| Fichier                  | Contenu                                                                    |
| ------------------------ | -------------------------------------------------------------------------- |
| `psp-body.webp`          | Coque, détails et supports, sans commandes interactives ni contenu d’écran |
| `psp-shadow.webp`        | Ombre issue du shadow catcher Cycles                                       |
| `psp-reflections.webp`   | Bordures chromées réfléchissantes, même caméra                             |
| `psp-screen-glass.webp`  | Surface transparente et reflets discrets de la vitre                       |
| `screen-wallpaper.webp`  | Illustration de fond de l’écran React, 1440 × 810                          |
| `buttons/*-idle.webp`    | Treize commandes au repos                                                  |
| `buttons/*-pressed.webp` | Les mêmes commandes réellement enfoncées de 0,016 unité suivant Y          |
| `layout.json`            | Résolution, quatre coins, rectangles des sprites et caméra                 |

Les 26 sprites sont recadrés après rendu avec **le même rectangle pour les deux états**, sans déplacement des pixels. Le script de recadrage refuse tout rectangle qui couperait des pixels visibles. Les deux états ont la même caméra, les mêmes matériaux et les mêmes lumières ; seul l’enfoncement de la pièce et de son libellé change.

Les quatre grands calques et les 26 sprites pèsent environ **519 Kio** ; avec le fond d’écran dédié, environ **628 Kio**. Les fichiers Blender et les scripts ne sont pas envoyés au navigateur.

## Architecture React et commandes

`PSPConsole` assemble l’ombre, l’écran, la coque, les boutons, la vitre et les reflets. Les calques décoratifs n’interceptent aucun clic. Les deux images de chaque bouton sont chargées dès le montage ; un fondu de 60 ms à l’appui et 95 ms au relâchement accompagne le changement d’état. La préférence de réduction des animations supprime ce fondu.

`usePSPControls` constitue le point d’entrée commun souris/tactile/clavier. Il gère les appuis, relâchements, annulations de pointeur, pertes de focus et sons optionnels. `pspNavigation.ts` contient le réducteur pur : page actuelle, sélection, page d’origine, détail, historique, panneaux d’aide/options/crédits, luminosité et sons.

| Commande        | Action                                                  |
| --------------- | ------------------------------------------------------- |
| D-pad / flèches | Sélection précédente/suivante, avec boucle              |
| Croix / Entrée  | Ouvrir ou confirmer ; ouvrir un lien depuis son détail  |
| Cercle / Échap  | Fermer le panneau, revenir du détail ou revenir au menu |
| Triangle / S    | Options : sons et luminosité                            |
| Carré / A       | Aide                                                    |
| Start / Home    | Menu principal, sélection conservée                     |
| Select          | Crédits et attribution du modèle                        |
| Volume − / +    | Niveau des seuls effets PSP, de 0 à 3                   |

Les raccourcis sont gérés par propagation dans la console, jamais par un écouteur clavier global. Les champs de saisie et les raccourcis avec Ctrl/Alt/Meta restent libres. Les boutons natifs et liens restent utilisables avec Tab et Entrée. Une flèche utilisée sur un menu recentre le focus sur son écran pour que la confirmation ouvre la sélection courante.

Les rubriques réutilisent les données réelles du portfolio :

- **About** : profil et paragraphes de `src/data/about.ts` ; navigation entre paragraphes.
- **Projects** : projets de `src/data/projects.ts` ; vignettes, détails, tags et liens existants.
- **Skills** : catégories de `src/data/skills.ts` ; liste puis compétences de chaque catégorie.
- **Contact** : adresse et liens de `src/data/socialLinks.ts` ; détail avant ouverture explicite.

About est sélectionné au démarrage. La navigation ne modifie pas l’URL et ne fait pas défiler la page principale. Seuls les liens confirmés ouvrent explicitement une destination externe ou le client de messagerie.

L’état est volontairement limité à la session React : l’actualisation revient au menu initial. Le mode agrandi partage **le même contrôleur** et conserve la sélection et la page. L’écran miniature est alors inerte pour l’accessibilité. Le dialogue natif gère le focus modal ; sa fermeture rend le focus au bouton d’ouverture. Échap revient d’abord dans la navigation, puis ferme la vue agrandie à l’accueil.

Les sons sont des notes synthétisées localement, désactivées par défaut. Ils sont déclenchés uniquement après interaction, respectent le mute mémorisé du lecteur musical et ne modifient ni son volume de 5 %, ni sa position, ni ses événements. Une seule note de navigation est active à la fois. Un refus de Web Audio laisse la navigation silencieuse et fonctionnelle.

## Reproduire ou modifier les rendus

Outils utilisés : **Blender 5.2.3 LTS**, Python avec **Pillow** pour le recadrage. Aucune dépendance npm n’a été ajoutée. Blender utilise OptiX si un GPU compatible est disponible, sinon le CPU ; `-- --cpu` force ce dernier. Les caches de rendu sont placés dans `.verification/optix`.

Depuis la racine du repository, sous PowerShell, reconstruire la copie de travail à partir de l’original et réexporter :

```powershell
& E:\Blender\blender.exe --background --factory-startup --disable-autoexec --python scripts/psp/build_scene.py
python scripts/psp/pack_layers.py
npx prettier --write src/assets/images/psp/layout.json
```

Cette commande **reconstruit `PSP-portfolio.blend`**. Les adaptations reproductibles de géométrie, matériaux, caméra et lumières sont dans `build_scene.py`. Pour un aperçu rapide sans remplacer le master, ajouter `-- --preview` ; le résultat est écrit dans `.verification/psp-adapted-preview.webp`. Un aperçu met aussi à jour les coordonnées : exporter tous les calques avant de livrer un changement de caméra ou de géométrie.

Pour conserver des modifications faites manuellement dans `PSP-portfolio.blend`, enregistrer ce fichier dans Blender puis utiliser le réexport du master :

```powershell
& E:\Blender\blender.exe --background --factory-startup --disable-autoexec --python scripts/psp/export_saved.py
python scripts/psp/pack_layers.py
npx prettier --write src/assets/images/psp/layout.json
```

Ce second chemin **ne reconstruit pas le modèle**. Il recharge les objets portant `psp_control`, la caméra sauvegardée et les quatre repères de dalle, puis recalcule les coordonnées. Conserver les propriétés des pièces interactives, les noms `ScreenGlass`, `Shadow catcher`, `ScreenCornerA…D` et le préfixe `ChromeEdges`. Si l’ouverture est retouchée en mode édition, repositionner ses quatre repères. Un déplacement de l’objet `ScreenOpening` entraîne ses repères enfants.

Le déplacement d’appui repose sur l’axe Y du modèle ; ne pas changer le repère des commandes sans adapter ce déplacement dans `render_layers.py`. Le script restaure les positions et la visibilité après les exports et n’enregistre pas un master avec des boutons enfoncés. `export_saved.py -- --check` recharge et contrôle les sources, puis recalcule le JSON sans lancer de rendu.

Pour modifier le contenu ou ajouter une rubrique, intervenir dans `PSPScreen.tsx`, les données correspondantes et le réducteur ; ne pas déplacer la dalle à la main dans le CSS. Toute nouvelle commande doit suivre le même chemin `press/release/trigger` afin de conserver la synchronisation visuelle.

## Vérifications réalisées

- Empreinte de l’original conservée, ouverture de la copie modifiée et contrôle de ses treize commandes/repères dans Blender.
- Présence, transparence, dimensions et recadrage des 30 exports ; deux états distincts par commande.
- 15 tests dédiés au réducteur PSP et à la projection ; 70 tests du repository au total.
- Compilation TypeScript, build Vite et ESLint.
- Chrome : souris, clavier, commandes physiques, détails de projets/skills, retour, aide/options/crédits, vue agrandie et restitution du focus.
- Événements tactiles émulés, relâchement à la perte de focus, respect des touches hors de la PSP, sons après activation seulement et coupure par le mute musical ; préférence de réduction des animations.
- Largeurs 1920, 1600, 1440, 1024, 768, 390 et 320 px ; absence de débordement horizontal, lisibilité de la vue agrandie mobile.
- Même élément musical, lecture continue et volume de 5 % pendant les interactions PSP ; aucun redémarrage audio ni erreur JavaScript observé.

Les dimensions ont été vérifiées par émulation de viewport dans Chrome, pas sur tous les appareils physiques. La Gamepad API n’est pas implémentée ; le contrôleur central permet de la raccorder ultérieurement.
